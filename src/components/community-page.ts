import { ContentPage } from "./content-page";
import { CONTACT_EMAIL, ISSUES_URL, PULLS_URL, REPO_URL } from "../site";

export function CommunityPage(): string {
  return ContentPage({
    eyebrow: "Open Source",
    title: "Community & Contributing",
    intro:
      "Flick is built in the open. Bug fixes, hardware compatibility reports, DSP work, and documentation all count as contributions.",
    children: `
      <p>
        The canonical repository is
        <a href="${REPO_URL}" target="_blank" rel="noopener">${REPO_URL.replace("https://", "")}</a>.
        The short version of the rules below: pull <code>main</code> first, open an issue before a
        pull request, keep the audio path honest, and one change per PR.
      </p>

      <h2>Ways to contribute</h2>
      <ul>
        <li><strong>Report bugs</strong> on the <a href="${ISSUES_URL}" target="_blank" rel="noopener">issue tracker</a>.</li>
        <li><strong>Request features</strong> — check the open issues first, then describe your idea.</li>
        <li><strong>Test hardware</strong> — try Flick with your USB DAC or DAP and report what works (and what doesn't).</li>
        <li><strong>Code</strong> — DSP, playback, UI, and platform work through <a href="${PULLS_URL}" target="_blank" rel="noopener">pull requests</a>.</li>
        <li><strong>Docs</strong> — corrections, build notes, and hardware guides are welcome.</li>
      </ul>

      <h2>Before you write code</h2>
      <ol>
        <li><strong>Always <code>git pull</code> on <code>main</code> before starting</strong> — this catches merge conflicts early instead of at PR time.</li>
        <li>Check open issues and PRs first. If your change isn't listed, open an issue describing it so the approach can be discussed before you sink time into it. This is especially important for anything that touches the audio path or DAC output formats — those are opinionated by design.</li>
      </ol>

      <h2>What the project cares about</h2>
      <ul>
        <li><strong>Bit-perfect and native format output are the goal.</strong> Routing everything through a single container format for convenience is a no. If a fix makes output sound the same but is simpler, that's fine; if it silently resamples or truncates, it isn't.</li>
        <li><strong>Android-only, minSdk 26.</strong> Don't add desktop or iOS paths.</li>
        <li><strong>No new dependencies without a reason.</strong> Symphonia, rusb, cpal/Oboe, lofty, Riverpod, just_audio, and Isar are already in. If the standard library or an existing dependency can do it, use that.</li>
        <li><strong>No ads, no tracking, no premium tier.</strong> Don't add anything that phones home or gates features.</li>
        <li><strong>MIT.</strong> Your contribution lands under the same license.</li>
      </ul>

      <h2>Code and build</h2>
      <ul>
        <li>The frontend is Flutter (Riverpod). The backend is Rust, bridged via <code>flutter_rust_bridge</code>.</li>
        <li>Match the style of the files you're touching. Don't reformat unrelated code in the same diff.</li>
        <li>
          Build before opening a PR:
          <pre><code>flutter pub get
cd rust &amp;&amp; cargo fetch &amp;&amp; cd ..
flutter run</code></pre>
          Or use <code>flutter build apk --release</code> to confirm a release build still passes.
        </li>
        <li>If you touch the Rust audio engine, test on real hardware if you can. A USB DAC behaves differently from the emulator's virtual device.</li>
      </ul>

      <h2>Pull requests</h2>
      <ul>
        <li>One change per PR. Mixed refactors and features get bounced.</li>
        <li>Write the PR description like a changelog entry: what changed, why, and how you tested it. Screenshots for UI changes.</li>
        <li>Keep diffs small. If a change needs 1000 lines, split it.</li>
      </ul>

      <h2>Hardware notes</h2>
      <p>
        If you're working on DAC output, note that some DACs only do <code>S24_3LE</code>, not
        <code>S24_LE</code>, and cpal maps <code>i24</code> to <code>S24_LE</code>. That's a known
        constraint — handle it deliberately, don't paper over it with a 32-bit container unless the
        project's audio path already decided to.
      </p>

      <h2>Branch policy</h2>
      <p>
        Work off <code>main</code>. Fork, push to your fork, open a PR against <code>main</code>.
        Rebase before you open if <code>main</code> has moved.
      </p>

      <h2>Contributors</h2>
      <p>
        Thanks to everyone who has contributed code, hardware testing, and docs — including
        <strong>@Harleythetech</strong> and <strong>@MagosVox</strong>. Per-release credits are
        listed on the <a href="/release-notes">release notes</a> page.
      </p>

      <h2>Get in touch</h2>
      <ul>
        <li><a href="${ISSUES_URL}" target="_blank" rel="noopener">Issue tracker</a></li>
        <li><a href="${PULLS_URL}" target="_blank" rel="noopener">Pull requests</a></li>
        <li>Email: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></li>
      </ul>
    `,
  });
}
