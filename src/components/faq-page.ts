import { ContentPage } from "./content-page";
import { CONTACT_EMAIL, ISSUES_URL, PLAY_STORE_URL, REPO_URL } from "../site";

const BLOB = `${REPO_URL}/blob/main`;

interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Is Flick free?",
    answer:
      "Yes. Flick is free and open-source under the MIT License. There are no ads, no tracking, no subscriptions, and no premium tier. You can build it from source if you prefer.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "Android only, with a minimum of Android 8.0 (API level 26). There are no desktop or iOS builds — that is a deliberate scope decision, not a missing feature.",
  },
  {
    question: 'What does "bit-perfect" actually mean?',
    answer:
      "It means the audio data reaching your DAC is the same data that is in the file: no resampling, no gain changes, no mixing. Android normally routes audio through a system mixer, which can alter the signal. Flick's Rust engine sends PCM or DSD directly over USB (UAC 2.0) or through a qualified DAP's high-resolution path to avoid that.",
  },
  {
    question: "Which DACs and DAPs work with Flick?",
    answer:
      "Any USB Audio Class 2.0 device should work, and a number of DAPs are detected automatically for internal bit-perfect playback. The tested devices are listed on the Supported DACs page — the list is being expanded, and hardware reports are welcome.",
  },
  {
    question: "Does it play DSD?",
    answer:
      "Yes. Flick handles DSF, DFF, and WavPack DSD files with three output modes: native DSD over USB, DoP (DSD over PCM), and PCM decimation for hardware that supports neither. Per-device quirks such as byte ordering are handled in a quirk table.",
  },
  {
    question: "Play Store or APK — what's the difference?",
    answer:
      "The app is the same. The Play Store build updates automatically through Google Play; the GitHub APK is for manual installation and gets releases first. Both are free.",
  },
  {
    question: "Does Flick collect any data?",
    answer:
      "No. Flick collects no personal data, sends no analytics or crash reports, and uses no advertising identifiers. Last.fm scrobbling is optional and sends play data only to Last.fm. The privacy policy has the full details.",
  },
  {
    question: "Can I scrobble to Last.fm?",
    answer:
      "Yes, as an optional integration. Your Last.fm credentials are stored on-device, and play data goes only to Last.fm.",
  },
  {
    question: "Can I build Flick myself?",
    answer:
      "Yes. You'll need a Flutter toolchain and a Rust toolchain, then follow the build steps in the contributing guide: fetch dependencies, run the app, or build a release APK.",
  },
  {
    question: "Where do I report a bug or request a feature?",
    answer: `Use the GitHub issue tracker at ${ISSUES_URL}. Please check existing issues first, and for anything touching the audio path describe your hardware and the formats involved.`,
  },
];

export function FaqPage(): string {
  const items = FAQ_ITEMS.map(
    (item) => `
      <details class="faq-item">
        <summary>${item.question}</summary>
        <p>${item.answer}</p>
      </details>`,
  ).join("\n");

  return ContentPage({
    eyebrow: "Support",
    title: "Frequently Asked Questions",
    intro:
      "The questions that come up most often, answered plainly. If yours isn't here, the issue tracker and email below are open.",
    children: `
      ${items}

      <h2>Still stuck?</h2>
      <ul>
        <li><a href="${ISSUES_URL}" target="_blank" rel="noopener">Open an issue on GitHub</a></li>
        <li>Email: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></li>
        <li><a href="${PLAY_STORE_URL}" target="_blank" rel="noopener">Flick on Google Play</a></li>
        <li><a href="${BLOB}/CONTRIBUTING.md" target="_blank" rel="noopener">Contributing guide</a></li>
      </ul>
    `,
  });
}
