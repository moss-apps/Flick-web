#!/usr/bin/env node
/**
 * Regenerates src/generated/licenses.json from the Flick app's dependency
 * lockfiles (snapshotted in data/licenses/) plus this website's own deps.
 *
 * Usage:
 *   node scripts/sync-licenses.mjs                 # refresh src/generated/licenses.json
 *   node scripts/sync-licenses.mjs --check         # exit 1 if the file is out of date
 *   node scripts/sync-licenses.mjs --app-dir=../flick_player
 *
 * The app directory is only needed to refresh the lockfile snapshots and read
 * the vendored native license texts. Normal website builds never run this.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseToml } from "smol-toml";
import { parse as parseYaml } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const appDirArg = args.find((a) => a.startsWith("--app-dir="));
const APP_DIR = path.resolve(
  ROOT,
  appDirArg ? appDirArg.split("=")[1] : "../flick_player",
);

const SNAPSHOT_DIR = path.join(ROOT, "data", "licenses");
const OUT_FILE = path.join(ROOT, "src", "generated", "licenses.json");

const USER_AGENT = "Flick-Web-License-Sync (https://flick-player.site)";
const PUB_CONCURRENCY = 6;
const CRATES_CONCURRENCY = 4;

const NATIVE_LIBRARIES = [
  {
    name: "Opus",
    license: "BSD-3-Clause",
    url: "https://opus-codec.org/",
    file: "rust/vendor/opus-sys/opus/COPYING",
  },
  {
    name: "WavPack",
    license: "BSD-3-Clause",
    url: "https://www.wavpack.com/",
    file: "rust/vendor/wavpack-sys/COPYING",
  },
  {
    name: "SoundTouch",
    license: "LGPL-2.1",
    url: "https://www.surina.net/soundtouch/",
    file: "rust/vendor/soundtouch-sys/soundtouch/COPYING.TXT",
  },
  {
    name: "cpal (vendored)",
    license: "Apache-2.0",
    url: "https://github.com/RustAudio/cpal",
    file: "rust/vendor/cpal/LICENSE",
  },
  {
    name: "Cargokit",
    license: "MIT OR Apache-2.0",
    url: "https://github.com/irondash/cargokit",
    file: "rust_builder/cargokit/LICENSE",
  },
];

function log(message) {
  console.log(`[licenses] ${message}`);
}

async function mapLimit(items, limit, task) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await task(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function classifyLicense(text) {
  const normalized = text.toLowerCase();
  const found = [];
  if (normalized.includes("apache license") && normalized.includes("version 2.0")) {
    found.push("Apache-2.0");
  }
  if (normalized.includes("gnu lesser general public license")) {
    found.push(normalized.includes("version 3") ? "LGPL-3.0" : "LGPL-2.1");
  } else if (normalized.includes("gnu general public license")) {
    found.push(normalized.includes("version 3") ? "GPL-3.0" : "GPL-2.0");
  }
  if (normalized.includes("mozilla public license")) {
    found.push(normalized.includes("2.0") ? "MPL-2.0" : "MPL");
  }
  if (normalized.includes("permission is hereby granted, free of charge")) {
    found.push("MIT");
  }
  if (normalized.includes("redistribution and use in source and binary forms")) {
    found.push(normalized.includes("neither the name") ? "BSD-3-Clause" : "BSD-2-Clause");
  }
  if (
    normalized.includes("permission to use, copy, modify, and/or distribute") &&
    normalized.includes("with or without fee")
  ) {
    found.push("ISC");
  }
  if (normalized.includes("the unlicense")) {
    found.push("Unlicense");
  }
  if (found.length === 0) return "See package source";
  if (found.includes("MIT") && found.includes("Apache-2.0") && found.length === 2) {
    return "MIT OR Apache-2.0";
  }
  return found.join(" AND ");
}

function readTarEntries(archivePath) {
  const out = execFileSync("tar", ["-tzf", archivePath], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return out.split("\n").filter(Boolean);
}

function readTarEntry(archivePath, entry) {
  return execFileSync("tar", ["-xOzf", archivePath, entry], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

function findLicenseEntry(entries) {
  const candidates = entries
    .map((entry) => {
      const clean = entry.replace(/^\.\//, "");
      const depth = clean.split("/").length;
      const base = path.basename(clean).toLowerCase();
      return { entry, clean, depth, base };
    })
    .filter(
      (candidate) =>
        candidate.depth <= 2 &&
        (candidate.base.startsWith("license") ||
          candidate.base.startsWith("licence") ||
          candidate.base.startsWith("copying")),
    )
    .sort((a, b) => a.depth - b.depth || a.clean.length - b.clean.length);
  return candidates.length > 0 ? candidates[0].entry : null;
}

async function fetchDartPackage(name, version) {
  const url = `https://pub.dev/api/archives/${name}-${version}.tar.gz`;
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) throw new Error(`pub.dev archive ${response.status} for ${name}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const tmpFile = path.join(ROOT, "node_modules", ".cache-licenses", `${name}.tgz`);
  await mkdir(path.dirname(tmpFile), { recursive: true });
  await writeFile(tmpFile, buffer);
  try {
    const entries = readTarEntries(tmpFile);
    const licenseEntry = findLicenseEntry(entries);
    if (!licenseEntry) return "See package source";
    return classifyLicense(readTarEntry(tmpFile, licenseEntry));
  } finally {
    const { rm } = await import("node:fs/promises");
    await rm(tmpFile, { force: true });
  }
}

async function fetchCrateLicense(name, version) {
  const response = await fetch(
    `https://crates.io/api/v1/crates/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
    { headers: { "user-agent": USER_AGENT } },
  );
  if (!response.ok) throw new Error(`crates.io ${response.status} for ${name}`);
  const data = await response.json();
  return data?.version?.license ?? "See crate source";
}

async function snapshotAppLockfiles() {
  if (!existsSync(APP_DIR)) {
    log(`app directory not found at ${APP_DIR}; using existing snapshots`);
    return;
  }
  const pubspec = path.join(APP_DIR, "pubspec.lock");
  const cargo = path.join(APP_DIR, "rust", "Cargo.lock");
  if (existsSync(pubspec))
    await copyFile(pubspec, path.join(SNAPSHOT_DIR, "pubspec.lock"));
  if (existsSync(cargo)) await copyFile(cargo, path.join(SNAPSHOT_DIR, "Cargo.lock"));
  log(`refreshed lockfile snapshots from ${APP_DIR}`);
}

async function collectDart() {
  const lock = parseYaml(await readFile(path.join(SNAPSHOT_DIR, "pubspec.lock"), "utf8"));
  const packages = Object.entries(lock.packages ?? {})
    .map(([name, info]) => ({
      name,
      version: String(info.version ?? ""),
      dependency: info.dependency ?? "",
      source: info.source ?? "",
      description: info.description ?? {},
    }))
    .filter(
      (pkg) =>
        pkg.source === "hosted" &&
        pkg.dependency !== "direct dev" &&
        pkg.description?.url === "https://pub.dev",
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  log(`resolving licenses for ${packages.length} Dart packages…`);
  const results = await mapLimit(packages, PUB_CONCURRENCY, async (pkg) => {
    let license = "See package source";
    try {
      license = await fetchDartPackage(pkg.name, pkg.version);
    } catch (error) {
      log(`warn: ${pkg.name}: ${error.message}`);
    }
    return {
      name: pkg.name,
      version: pkg.version,
      license,
      url: `https://pub.dev/packages/${pkg.name}`,
    };
  });
  return results;
}

async function collectRust() {
  const lock = parseToml(await readFile(path.join(SNAPSHOT_DIR, "Cargo.lock"), "utf8"));
  const packages = (lock.package ?? [])
    .filter((pkg) => typeof pkg.source === "string" && pkg.source.startsWith("registry+"))
    .map((pkg) => ({ name: pkg.name, version: pkg.version }))
    .sort((a, b) => a.name.localeCompare(b.name));

  log(`resolving licenses for ${packages.length} Rust crates…`);
  const results = await mapLimit(packages, CRATES_CONCURRENCY, async (pkg) => {
    let license = "See crate source";
    try {
      license = await fetchCrateLicense(pkg.name, pkg.version);
    } catch (error) {
      log(`warn: ${pkg.name}: ${error.message}`);
    }
    return {
      name: pkg.name,
      version: pkg.version,
      license,
      url: `https://crates.io/crates/${pkg.name}/${pkg.version}`,
    };
  });
  return results;
}

async function collectNative() {
  const entries = [];
  for (const library of NATIVE_LIBRARIES) {
    const filePath = path.join(APP_DIR, library.file);
    let text = null;
    if (existsSync(filePath)) {
      text = (await readFile(filePath, "utf8")).trim();
    } else {
      log(`warn: missing vendored license file ${library.file}`);
    }
    entries.push({
      name: library.name,
      license: library.license,
      url: library.url,
      text,
    });
  }
  return entries;
}

async function collectApp() {
  const pubspecPath = path.join(APP_DIR, "pubspec.yaml");
  const licensePath = path.join(APP_DIR, "LICENSE");
  let version = "unknown";
  if (existsSync(pubspecPath)) {
    const match = (await readFile(pubspecPath, "utf8")).match(/^version:\s*(\S+)/m);
    if (match) version = match[1];
  }
  let text = null;
  if (existsSync(licensePath)) {
    text = (await readFile(licensePath, "utf8")).trim();
  }
  return {
    name: "Flick Player",
    version,
    license: "MIT",
    url: "https://github.com/moss-apps/Flick",
    text,
  };
}

async function collectWeb() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  const names = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ].sort();
  const entries = [];
  for (const name of names) {
    const pkgJsonPath = path.join(ROOT, "node_modules", name, "package.json");
    let version = "";
    let license = "See package source";
    if (existsSync(pkgJsonPath)) {
      const dep = JSON.parse(await readFile(pkgJsonPath, "utf8"));
      version = dep.version ?? "";
      license = dep.license ?? license;
    }
    entries.push({
      name,
      version,
      license,
      url: `https://www.npmjs.com/package/${name}`,
    });
  }
  return entries;
}

async function main() {
  await mkdir(path.join(ROOT, "node_modules", ".cache-licenses"), { recursive: true });
  await snapshotAppLockfiles();

  const [app, native, dart, rust, web] = await Promise.all([
    collectApp(),
    collectNative(),
    collectDart(),
    collectRust(),
    collectWeb(),
  ]);

  const document = {
    generatedAt: new Date().toISOString(),
    app,
    native,
    dart,
    rust,
    web,
  };

  if (CHECK) {
    if (!existsSync(OUT_FILE)) {
      log("no generated licenses file; run without --check to create it");
      process.exit(1);
    }
    const current = JSON.parse(await readFile(OUT_FILE, "utf8"));
    const a = JSON.stringify({ ...current, generatedAt: null }, null, 2);
    const b = JSON.stringify({ ...document, generatedAt: null }, null, 2);
    if (a !== b) {
      log("generated licenses are out of date; run `npm run licenses:sync`");
      process.exit(1);
    }
    log("generated licenses are up to date");
    return;
  }

  await writeFile(OUT_FILE, JSON.stringify(document, null, 2) + "\n");
  log(
    `wrote ${path.relative(ROOT, OUT_FILE)} (${dart.length} Dart, ${rust.length} Rust, ${web.length} web, ${native.length} native)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
