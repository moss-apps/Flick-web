import licenses from "../generated/licenses.json";
import { ContentPage, TableWrap } from "./content-page";
import { REPO_URL } from "../site";

interface PackageEntry {
  name: string;
  version: string;
  license: string;
  url: string;
}

interface NativeEntry {
  name: string;
  license: string;
  url: string;
  text: string;
}

interface AppEntry extends PackageEntry {
  text: string;
}

const data = licenses as {
  generatedAt: string;
  app: AppEntry;
  native: NativeEntry[];
  dart: PackageEntry[];
  rust: PackageEntry[];
  web: PackageEntry[];
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function packageTable(entries: PackageEntry[]): string {
  const rows = entries
    .map(
      (entry) => `
        <tr>
          <td>${esc(entry.name)}</td>
          <td>${esc(entry.version)}</td>
          <td>${esc(entry.license)}</td>
          <td><a href="${entry.url}" target="_blank" rel="noopener">source</a></td>
        </tr>`,
    )
    .join("");

  return TableWrap(`
    <table>
      <thead>
        <tr><th>Package</th><th>Version</th><th>License</th><th>Source</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`);
}

function nativeSection(entries: NativeEntry[]): string {
  return entries
    .map(
      (entry) => `
      <h3>${esc(entry.name)} — ${esc(entry.license)}</h3>
      <p><a href="${entry.url}" target="_blank" rel="noopener">Project source</a></p>
      <pre class="license-text"><code>${esc(entry.text)}</code></pre>`,
    )
    .join("");
}

export function LicensesPage(): string {
  const generated = new Date(data.generatedAt).toISOString().slice(0, 10);

  return ContentPage({
    eyebrow: "Legal",
    title: "Open Source Licenses",
    intro:
      "Flick Player is built on open source software. This page lists the licenses of the application, the native libraries bundled with it, and every dependency of the Android app and this website.",
    updated: generated,
    width: "wide",
    children: `
      <h2>Flick Player</h2>
      <p>
        ${esc(data.app.name)} ${esc(data.app.version)} is released under the
        ${esc(data.app.license)} License. The full source is available at
        <a href="${REPO_URL}" target="_blank" rel="noopener">${esc(REPO_URL)}</a>.
      </p>
      <pre class="license-text"><code>${esc(data.app.text)}</code></pre>

      <h2>Bundled Native Libraries</h2>
      <p>
        These native libraries are compiled into Flick and are covered by their own
        licenses, reproduced in full below.
      </p>
      ${nativeSection(data.native)}

      <h2>Website Dependencies</h2>
      <p>
        This website is built with the following packages (including build tooling).
      </p>
      ${packageTable(data.web)}

      <h2>Flutter &amp; Dart Packages</h2>
      <p>
        ${data.dart.length} packages resolved in Flick's <code>pubspec.lock</code>,
        including transitive and build-time dependencies. License identifiers are derived
        from each package's bundled license file; follow the source link for the exact
        text and copyright notice.
      </p>
      ${packageTable(data.dart)}

      <h2>Rust Crates</h2>
      <p>
        ${data.rust.length} crates resolved in Flick's <code>Cargo.lock</code>, including
        transitive and build-time dependencies. License identifiers come from crates.io;
        follow the source link for the exact text and copyright notice.
      </p>
      ${packageTable(data.rust)}

      <h2>Updates</h2>
      <p>
        This list is generated from the app's lockfiles and the most recent upstream
        metadata. It is refreshed as dependencies change. You can also view the full
        license texts for every Flutter package inside the app under
        <strong>Settings → About → Licenses</strong>.
      </p>
    `,
  });
}
