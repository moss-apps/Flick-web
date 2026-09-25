import { ContentPage } from "./content-page";
import { CONTACT_EMAIL, REPO_URL } from "../site";

export function TermsPage(): string {
  return ContentPage({
    eyebrow: "Legal",
    title: "Terms of Use",
    intro:
      "Short version: Flick is free, open-source software provided as-is, and this website is a static information page. Here are the details.",
    updated: "September 25, 2026",
    children: `
      <h2>1. Agreement</h2>
      <p>
        These Terms of Use ("Terms") apply to <strong>flick-player.site</strong> (the "Website")
        and to the <strong>Flick Player</strong> application (the "App"), both provided by
        <strong>Moss</strong> ("we", "us", or "our"). By using the Website or the App, you agree to
        these Terms. If you do not agree, do not use them.
      </p>

      <h2>2. The Software and This Website</h2>
      <p>
        Flick Player is free and open-source software released under the
        <strong>MIT License</strong>. The full license text is available on the
        <a href="/licenses">Licenses</a> page and in the
        <a href="${REPO_URL}" target="_blank" rel="noopener">source repository</a>.
      </p>
      <ul>
        <li>You may use, copy, modify, and redistribute the App under the terms of the MIT License.</li>
        <li>The Website displays public information about the App and links to official downloads.</li>
        <li>We do not charge for the App, and there is no premium tier, advertising, or tracking.</li>
      </ul>

      <h2>3. Trademarks and Branding</h2>
      <p>
        "Flick", the Flick name and logo, and "Moss" are project and brand identifiers. The MIT
        License covers the source code; it does not grant permission to use these names or logos in
        a way that suggests endorsement of modified builds or derivative products. Forks are
        welcome, but please do not present them as official Flick releases.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>When using the Website, you agree not to:</p>
      <ul>
        <li>attack, overload, or attempt to bypass rate limits or security protections on the Website or its API proxy;</li>
        <li>use automated scraping that exceeds reasonable personal use, or resell Website content as your own;</li>
        <li>misrepresent modified App builds as official releases.</li>
      </ul>

      <h2>5. Third-Party Services and Links</h2>
      <p>
        The Website and the App link to or interact with third-party services, including GitHub,
        Google Play, Last.fm, MusicBrainz, Cover Art Archive, iTunes, and Deezer. Those services
        have their own terms and privacy policies. We are not responsible for third-party content,
        availability, or practices.
      </p>
      <p>
        Google Play distribution is additionally governed by Google's terms. If you install the App
        through the Play Store, Google's terms apply alongside these Terms.
      </p>

      <h2>6. Disclaimer of Warranty</h2>
      <p>
        The App and the Website are provided <strong>"as is"</strong>, without warranty of any
        kind, express or implied, including but not limited to the warranties of merchantability,
        fitness for a particular purpose, and non-infringement. Audio hardware and Android devices
        vary; we do not guarantee that any specific DAC, DAP, file format, or device will work.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, in no event shall the authors or copyright holders
        be liable for any claim, damages, or other liability, whether in an action of contract,
        tort, or otherwise, arising from, out of, or in connection with the App, the Website, or
        their use. This includes, without limitation, damage to hearing equipment or speakers from
        incorrect audio settings.
      </p>

      <h2>8. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Changes will be reflected in the "Last
        updated" date at the top of this page. Continued use of the Website or the App after
        changes take effect constitutes acceptance of the revised Terms.
      </p>

      <h2>9. Contact</h2>
      <p>Questions about these Terms can be sent to:</p>
      <ul>
        <li><strong>Email</strong>: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></li>
        <li><strong>GitHub</strong>: <a href="${REPO_URL}/issues" target="_blank" rel="noopener">${REPO_URL.replace("https://", "")}/issues</a></li>
      </ul>
    `,
  });
}
