import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { Specs } from "./components/specs";
import { Contributors } from "./components/contributors";
import { Footer } from "./components/footer";
import { DownloadsPage } from "./components/downloads-page";
import { ReleaseNotesPage } from "./components/release-notes-page";
import { PrivacyPage } from "./components/privacy-page";
import { TermsPage } from "./components/terms-page";
import { LicensesPage } from "./components/licenses-page";
import { CommunityPage } from "./components/community-page";
import { AboutPage } from "./components/about-page";
import { FaqPage } from "./components/faq-page";
import { SupportedDacsPage } from "./components/supported-dacs-page";
import { NotFoundPage } from "./components/not-found-page";
import type { AppRoute } from "./routes";

export { routeFromPath, routeMeta } from "./routes";
export { SITE_ORIGIN } from "./site";
export type { AppRoute } from "./routes";

function pageMarkup(route: AppRoute): string {
  switch (route) {
    case "downloads":
      return DownloadsPage();
    case "release-notes":
      return ReleaseNotesPage();
    case "privacy":
      return PrivacyPage();
    case "terms":
      return TermsPage();
    case "licenses":
      return LicensesPage();
    case "community":
      return CommunityPage();
    case "about":
      return AboutPage();
    case "faq":
      return FaqPage();
    case "supported-dacs":
      return SupportedDacsPage();
    case "not-found":
      return NotFoundPage();
    default:
      return `${Hero()}${Features()}${Specs()}${Contributors()}`;
  }
}

export function renderPage(route: AppRoute): string {
  return `<a href="#main-content" class="skip-link">Skip to content</a>${Navbar(route)}<main id="main-content">${pageMarkup(route)}</main>${Footer(route)}`;
}
