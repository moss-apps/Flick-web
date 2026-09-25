import { ContentPage } from "./content-page";
import { CONTACT_EMAIL, ISSUES_URL, REPO_URL } from "../site";

const BLOB = `${REPO_URL}/blob/main`;

export function AboutPage(): string {
  return ContentPage({
    eyebrow: "About",
    title: "An audiophile player that doesn't fight your DAC",
    intro:
      "Flick is an open-source Android music player built by Moss. Its whole reason to exist is getting audio out of the phone or DAP without Android's mixer stepping on it.",
    children: `
      <p>
        Most Android players hand your music to the platform audio stack, where it is resampled,
        gain-staged, and mixed with everything else. Flick exists to avoid that. A custom Rust audio
        engine talks directly to USB Audio Class 2.0 DACs, and on supported DAPs it uses the
        device's internal high-resolution path — so what leaves the file is what reaches the
        hardware.
      </p>

      <h2>What's in it</h2>
      <p>
        The <a href="/downloads">Downloads</a> page covers releases, and the home page goes deep on
        features. The short version: bit-perfect PCM, native DSD, a 31-band parametric equalizer,
        MediaStore-backed library scanning, Flick Replay listening recaps, and home-screen widgets —
        all with no ads, no tracking, and no premium tier.
      </p>

      <h2>How it's built</h2>
      <ul>
        <li><strong>Flutter + Riverpod</strong> for the interface.</li>
        <li><strong>Rust</strong> for the audio engine, library scanning, and metadata, bridged with <code>flutter_rust_bridge</code>.</li>
        <li><strong>Custom UAC 2.0 implementation</strong> over isochronous USB transfers for external DACs.</li>
        <li><strong>Oboe/AAudio exclusive mode</strong> with device qualification for DAPs that expose a high-resolution internal path.</li>
      </ul>
      <p>The engineering notes are public and worth reading if you care about the details:</p>
      <ul>
        <li><a href="${BLOB}/docs/DSD_ARCHITECTURE.md" target="_blank" rel="noopener">DSD architecture</a></li>
        <li><a href="${BLOB}/docs/LIBRARY_SCAN_ARCHITECTURE.md" target="_blank" rel="noopener">Library scan architecture</a></li>
        <li><a href="${BLOB}/docs/uac2/overview.md" target="_blank" rel="noopener">UAC 2.0 overview</a> and <a href="${BLOB}/docs/uac2/internals.md" target="_blank" rel="noopener">internals</a></li>
        <li><a href="${BLOB}/docs/hardware_volume_control.md" target="_blank" rel="noopener">Hardware volume control</a></li>
        <li><a href="${BLOB}/docs/scanning_benchmark05092026.md" target="_blank" rel="noopener">Library scan benchmark</a></li>
      </ul>

      <h2>Project status</h2>
      <p>
        Flick is under active development and currently ships beta releases. APIs, settings, and
        device support change between versions — the <a href="/release-notes">release notes</a>
        document every shift. If you find a bug, the fastest route to a fix is the
        <a href="${ISSUES_URL}" target="_blank" rel="noopener">issue tracker</a>.
      </p>

      <h2>Who makes it</h2>
      <p>
        Flick is developed by <strong>Moss</strong> as part of a small ecosystem of local-first
        audio apps. The source lives at
        <a href="${REPO_URL}" target="_blank" rel="noopener">${REPO_URL.replace("https://", "")}</a>
        under the MIT License.
      </p>

      <h2>Contact</h2>
      <ul>
        <li><strong>Email</strong>: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></li>
        <li><strong>Issues</strong>: <a href="${ISSUES_URL}" target="_blank" rel="noopener">${ISSUES_URL.replace("https://", "")}</a></li>
      </ul>
    `,
  });
}
