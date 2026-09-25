import { ContentPage } from "./content-page";
import { CONTACT_EMAIL, ISSUES_URL } from "../site";

export function PrivacyPage(): string {
  return ContentPage({
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "Flick Player and this website are built to be local-first. This policy explains exactly what is and is not handled when you use them.",
    updated: "September 25, 2026",
    children: `
      <p>
        <strong>Flick Player</strong> ("the App") and <strong>flick-player.site</strong> ("the
        Website") are developed by <strong>Moss</strong> ("we", "us", or "our"). This Privacy
        Policy explains how the App and the Website handle data and user privacy.
      </p>
      <p>By using the App or the Website, you agree to the terms described in this Privacy Policy.</p>

      <h2>1. Data Collection</h2>
      <p><strong>Flick Player does not collect, store, or transmit any personal data.</strong></p>
      <p>The App is designed with privacy as a core principle. Specifically:</p>
      <ul>
        <li><strong>No personal information</strong> is collected (no name, email, phone number, location, device identifiers, etc.)</li>
        <li><strong>No usage analytics</strong> are gathered</li>
        <li><strong>No crash reports</strong> are sent to external servers</li>
        <li><strong>No advertising identifiers</strong> are accessed or transmitted</li>
        <li><strong>No data is shared</strong> with third parties because no data is collected</li>
      </ul>

      <h2>2. The Website</h2>
      <p>
        flick-player.site is a static website. It has no accounts, no forms, no cookies, and no
        analytics. Specifically:
      </p>
      <ul>
        <li>
          <strong>No tracking or analytics.</strong> We do not run analytics, session recording,
          fingerprinting, or advertising scripts of any kind.
        </li>
        <li>
          <strong>Local storage.</strong> Public GitHub data (releases, contributors, commit info)
          is cached in your browser's <code>localStorage</code> under <code>flick-api-*</code> keys
          for 10 minutes to reduce API traffic. These entries contain only public repository data
          and can be cleared at any time by clearing site data for this domain.
        </li>
        <li>
          <strong>API proxy.</strong> Requests to the GitHub API are routed through a serverless
          function so the site can use a server-side token for higher rate limits. The proxy does
          not log or store request contents, and rate-limits requests per IP address to prevent
          abuse.
        </li>
        <li>
          <strong>Hosting.</strong> The Website is served by Vercel, which processes standard
          request metadata (such as IP address and user agent) to deliver the site and protect it
          from abuse, as described in Vercel's own privacy policy.
        </li>
        <li>
          <strong>Self-hosted fonts.</strong> All fonts are served from this domain. No requests
          are made to Google Fonts or other third-party font services.
        </li>
        <li>
          <strong>Downloads.</strong> Download links point directly at GitHub Releases. Google Play
          links point at the Play Store; those services apply their own privacy policies.
        </li>
      </ul>

      <h2>3. Local Data</h2>
      <p>All data generated or used by the App is stored <strong>locally on your device</strong> only:</p>
      <ul>
        <li><strong>Music library metadata</strong> (ID3 tags, Vorbis comments) extracted from your local music files</li>
        <li><strong>Play history</strong> (recently played tracks, play counts)</li>
        <li><strong>User-created playlists</strong></li>
        <li><strong>Equalizer presets and settings</strong></li>
        <li><strong>App preferences</strong> (theme, playback settings)</li>
        <li><strong>Last.fm scrobbling credentials</strong> (stored securely on-device via Flutter Secure Storage)</li>
      </ul>
      <p>This data never leaves your device unless you explicitly use an integration described below.</p>

      <h2>4. Camera and Photos</h2>
      <p>
        The App requests access to your <strong>camera</strong> and <strong>photo library</strong>
        solely for the <strong>Flick Replay</strong> feature, which generates listening recap
        posters.
      </p>
      <ul>
        <li><strong>Camera access</strong> is used only when you choose to take a photo to use as a custom poster background</li>
        <li><strong>Photo library access</strong> is used only when you choose to select an existing photo as a poster background or when saving generated recap images to your gallery</li>
        <li><strong>No photos or camera images</strong> are uploaded, transmitted, or stored outside your device</li>
        <li>Photos are used <strong>only at your explicit request</strong> and remain entirely local</li>
      </ul>
      <p>
        You can deny camera/photo permissions at any time through your device settings. The core
        functionality of the App (music playback, library management, equalizer) will continue to
        work without these permissions.
      </p>

      <h2>5. Storage Permissions</h2>
      <p>The App requires access to your device's <strong>storage</strong> to:</p>
      <ul>
        <li>Scan and read music files from your local storage</li>
        <li>Read audio metadata (tags, album art, lyrics)</li>
        <li>Import/export equalizer presets</li>
        <li>Save recap images to your gallery</li>
      </ul>
      <p>No files are uploaded or transmitted externally. All processing happens on-device.</p>

      <h2>6. USB Device Access</h2>
      <p>
        The App accesses <strong>USB Audio Class 2.0 (UAC 2.0)</strong> devices (external
        DACs/AMPs) for bit-perfect audio playback.
      </p>
      <ul>
        <li>USB device enumeration is performed locally</li>
        <li>No USB device information is transmitted externally</li>
        <li>The App only communicates with the USB audio device for audio streaming purposes</li>
      </ul>

      <h2>7. Third-Party Integrations</h2>

      <h3>7.1 Last.fm Scrobbling</h3>
      <p>If you choose to connect your Last.fm account:</p>
      <ul>
        <li>Your Last.fm <strong>username and password</strong> are stored securely on-device</li>
        <li>Play data (artist, track, album, timestamp) is sent <strong>only to Last.fm</strong> for scrobbling purposes</li>
        <li>We do not receive, store, or process this data</li>
      </ul>

      <h3>7.2 Album Art Import</h3>
      <p>When you use the album art import feature:</p>
      <ul>
        <li>The App queries public APIs (<strong>MusicBrainz/Cover Art Archive, iTunes, Deezer</strong>) to find matching album art</li>
        <li>Search queries are based on local music metadata (artist, album name)</li>
        <li>Downloaded images are cached locally on your device</li>
        <li>No personal data is sent to these services</li>
      </ul>

      <h3>7.3 Moss Ecosystem (Latch Integration)</h3>
      <p>Flick Player is part of the <strong>Moss ecosystem</strong>. It can receive playback handoffs from <strong>Latch</strong> (another Moss app):</p>
      <ul>
        <li>Playback intents contain only song file paths/metadata needed for playback</li>
        <li>No personal data is exchanged between apps</li>
        <li>The integration is entirely local on your device</li>
      </ul>

      <h3>7.4 In-App Updates</h3>
      <ul>
        <li><strong>Play Store updates</strong>: The App uses the Google Play In-App Update API, which is governed by Google's privacy policies</li>
        <li><strong>Patch notes</strong>: Release notes are fetched from the <strong>GitHub Releases API</strong> — no personal data is sent</li>
      </ul>

      <h2>8. Internet Access</h2>
      <p>The App requires internet access for:</p>
      <ul>
        <li>Fetching album art from online sources (MusicBrainz, iTunes, Deezer)</li>
        <li>Last.fm scrobbling (if enabled by you)</li>
        <li>Checking for app updates and fetching patch notes from GitHub</li>
      </ul>
      <p>
        No personal data is transmitted during these operations beyond what is necessary for the
        specific feature (e.g., album/artist name for art lookup, scrobble data for Last.fm).
      </p>

      <h2>9. Children's Privacy</h2>
      <p>
        The App does not knowingly collect any information from anyone. The App is designed to not
        collect data from any user, regardless of age.
      </p>

      <h2>10. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be reflected in the
        "Last updated" date at the top of this document. We encourage you to review this Privacy
        Policy periodically.
      </p>

      <h2>11. Contact</h2>
      <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
      <ul>
        <li><strong>Email</strong>: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></li>
        <li><strong>GitHub</strong>: <a href="${ISSUES_URL}" target="_blank" rel="noopener">${ISSUES_URL.replace("https://", "")}</a></li>
      </ul>

      <hr />
      <p>
        <em>Flick Player is open-source software licensed under the MIT License. You can review the
        source code to verify the claims made in this Privacy Policy.</em>
      </p>
    `,
  });
}
