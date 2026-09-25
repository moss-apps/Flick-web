import type { AppRoute } from "./routes";
import { routeMeta } from "./routes";
import { FAQ_ITEMS } from "./components/faq-page";
import {
  CONTACT_EMAIL,
  PLAY_STORE_URL,
  REPO_OWNER,
  REPO_URL,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_ORIGIN,
} from "./site";

const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const SOFTWARE_ID = `${SITE_ORIGIN}/#software`;

const WEBSITE = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  description: routeMeta("home").description,
  inLanguage: "en",
  publisher: { "@id": ORGANIZATION_ID },
};

const ORGANIZATION = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_AUTHOR,
  url: `https://github.com/${REPO_OWNER}`,
  email: CONTACT_EMAIL,
  logo: `${SITE_ORIGIN}/icons/icon-512.png`,
};

const SOFTWARE = {
  "@type": "SoftwareApplication",
  "@id": SOFTWARE_ID,
  name: SITE_NAME,
  alternateName: "Flick Player",
  applicationCategory: "MusicApplication",
  operatingSystem: "Android",
  description: routeMeta("home").description,
  url: `${SITE_ORIGIN}/`,
  downloadUrl: `${REPO_URL}/releases`,
  image: `${SITE_ORIGIN}/og.png`,
  installUrl: PLAY_STORE_URL,
  author: { "@id": ORGANIZATION_ID },
  license: `${REPO_URL}/blob/main/LICENSE`,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

function webPage(route: AppRoute) {
  const meta = routeMeta(route);
  const url = meta.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${meta.path}`;
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: meta.title,
    description: meta.description,
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
  };
}

function faqPage(route: AppRoute) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_ORIGIN}${routeMeta(route).path}#faq`,
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function buildStructuredData(route: AppRoute): string | null {
  if (route === "not-found") return null;

  const graph: Record<string, unknown>[] = [WEBSITE, webPage(route)];
  if (route === "home") {
    graph.push(ORGANIZATION, SOFTWARE);
  }
  if (route === "faq") {
    graph.push(faqPage(route));
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}
