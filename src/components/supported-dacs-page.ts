import { ContentPage, TableWrap } from "./content-page";
import { ISSUES_URL, REPO_URL } from "../site";

const BLOB = `${REPO_URL}/blob/main`;

function usbDacTable(): string {
  return `
    <table>
      <thead>
        <tr>
          <th>Device</th>
          <th>Max rate</th>
          <th>Max bits</th>
          <th>Volume</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>MOONDROP Dawn Pro</td>
          <td>384 kHz</td>
          <td>32-bit</td>
          <td>Hardware</td>
          <td>Dual CS43131, 4.4&nbsp;mm balanced, daily driver; native DSD via quirk table (big-endian USB packing)</td>
        </tr>
        <tr>
          <td>FiiO K5 Pro</td>
          <td>384 kHz</td>
          <td>32-bit</td>
          <td>Hardware</td>
          <td>Excellent compatibility</td>
        </tr>
        <tr>
          <td>Topping D10s</td>
          <td>384 kHz</td>
          <td>32-bit</td>
          <td>Software</td>
          <td>All features work</td>
        </tr>
        <tr>
          <td>Schiit Modi 3+</td>
          <td>192 kHz</td>
          <td>24-bit</td>
          <td>Software</td>
          <td>Stable operation</td>
        </tr>
        <tr>
          <td>iFi Zen DAC</td>
          <td>384 kHz</td>
          <td>32-bit</td>
          <td>Software</td>
          <td>DSD support</td>
        </tr>
      </tbody>
    </table>`;
}

function dapTable(): string {
  return `
    <table>
      <thead>
        <tr>
          <th>Device family</th>
          <th>Max rate</th>
          <th>Balanced</th>
          <th>Detection</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>FiiO M11 / M15 / M17</td><td>384 kHz</td><td>Yes (4.4&nbsp;mm)</td><td>Automatic</td><td>Mango mode supported</td></tr>
        <tr><td>iBasso DX160–DX340</td><td>384 kHz</td><td>Yes (4.4&nbsp;mm)</td><td>Automatic</td><td>Mango mode supported</td></tr>
        <tr><td>HiBy R3 / R5 / R6 / R8</td><td>384 kHz</td><td>Select models</td><td>Automatic</td><td>—</td></tr>
        <tr><td>Shanling M300</td><td>384 kHz</td><td>No</td><td>Automatic</td><td>—</td></tr>
        <tr><td>Astell&amp;Kern SP / SA / SE</td><td>384 kHz</td><td>Yes (2.5/4.4&nbsp;mm)</td><td>Automatic</td><td>—</td></tr>
        <tr><td>Cayin N3 / N5 / N6 / N7</td><td>384 kHz</td><td>Yes (4.4&nbsp;mm)</td><td>Automatic</td><td>—</td></tr>
        <tr><td>Sony NW-A / NW-WM / NW-ZX</td><td>384 kHz</td><td>Select models</td><td>Model-dependent</td><td>Sony phones excluded</td></tr>
        <tr><td>TempoTec V6 / S3</td><td>384 kHz</td><td>No</td><td>Automatic</td><td>—</td></tr>
        <tr><td>Luxury &amp; Precision P6</td><td>384 kHz</td><td>No</td><td>Automatic</td><td>—</td></tr>
      </tbody>
    </table>`;
}

export function SupportedDacsPage(): string {
  return ContentPage({
    eyebrow: "Hardware",
    title: "Supported DACs & DAPs",
    intro:
      "Flick targets USB Audio Class 2.0 for external DACs and qualifies internal high-resolution paths on popular digital audio players.",
    updated: "September 25, 2026",
    width: "wide",
    children: `
      <p>
        <strong>This list is a snapshot and will be updated soon.</strong> It reflects hardware the
        project has tested directly — many more UAC&nbsp;2.0-compliant DACs should work without
        being listed here. If your device works (or doesn't), a report on the
        <a href="${ISSUES_URL}" target="_blank" rel="noopener">issue tracker</a> helps expand this
        page.
      </p>

      <h2>How detection works</h2>
      <ul>
        <li>
          <strong>USB DACs</strong> are matched at runtime by enumerating USB devices and requiring
          the UAC&nbsp;2.0 protocol (subclass <code>0x02</code>, protocol <code>0x20</code>) with an
          audio streaming interface and isochronous endpoints.
        </li>
        <li>
          <strong>DAPs</strong> are detected through a signature registry of vendor and model
          keywords. When a high-resolution internal path is confirmed, bit-perfect (DAP internal)
          mode is offered.
        </li>
      </ul>

      <h2>Tested USB DACs (bit-perfect via UAC 2.0)</h2>
      ${TableWrap(usbDacTable())}

      <h2>Tested DAPs (bit-perfect internal path)</h2>
      ${TableWrap(dapTable())}

      <h2>DAP detection registry</h2>
      <p>
        Bit-perfect internal playback is offered for these DAP families and model prefixes:
      </p>
      <ul>
        <li><strong>FiiO</strong> — M11, M15, M17, M21, M23, M27, JM21, M0–M8</li>
        <li><strong>iBasso</strong> — DX160–DX340</li>
        <li><strong>HiBy</strong> — R3, R4, R5, R6, R8</li>
        <li><strong>Shanling</strong> — M300</li>
        <li><strong>Astell&amp;Kern</strong> — SA, SP, SE, A&amp;</li>
        <li><strong>Cayin</strong> — N3, N5, N6, N7</li>
        <li><strong>Sony</strong> — NW-A, NW-WM, NW-ZX (model-dependent; Sony phones excluded)</li>
        <li><strong>TempoTec</strong> — V6, S3, Mobi, Sonata, iDSD</li>
        <li><strong>Luxury &amp; Precision</strong> — P6</li>
      </ul>

      <h2>Volume control</h2>
      <p>
        When a DAC exposes UAC&nbsp;2.0 Feature Unit volume controls, Flick can adjust volume in
        hardware. When it doesn't — like the MOONDROP Dawn Pro — Flick falls back to software volume
        rather than pretending hardware control exists. Details are in the
        <a href="${BLOB}/docs/uac2/internals.md" target="_blank" rel="noopener">UAC 2.0 internals</a>
        and <a href="${BLOB}/docs/hardware_volume_control.md" target="_blank" rel="noopener">hardware volume control</a> notes.
      </p>
    `,
  });
}
