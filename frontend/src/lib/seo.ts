// Search, social and AI-answer metadata for every page. One source feeds three places:
// the build (vite.config.ts writes a pre-rendered <head> into each route's HTML plus the
// sitemap), the browser (SiteShell swaps the tags on client-side navigation) and the FAQ
// section on the home page. Keep this file free of browser APIs and "@/..." imports.
import { EMAIL, PHONE_HREF } from "./siteLinks.ts";

export const SITE_URL = "https://www.switchyardfx.com.au";
export const SITE_NAME = "SwitchYard FX";
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const LOGO = `${SITE_URL}/icon-512.png`;
const TELEPHONE = PHONE_HREF.replace("tel:", "");
// Sydney CBD; the business publishes its city, not a street address.
const GEO = { latitude: -33.8688, longitude: 151.2093 };

type RouteMeta = { title: string; description: string; label: string; index?: boolean; priority?: number };

export const ROUTES: Record<string, RouteMeta> = {
  "/": { label: "Home", priority: 1, title: "SwitchYard FX | Corporate FX Risk Management & Hedging, Sydney", description: "SwitchYard FX helps Australian mid-market CFOs and treasury teams manage currency risk with forward contracts, options, cross-border payments and FX hedging advice." },
  "/services": { label: "Services", priority: 0.9, title: "Corporate FX Solutions: Forwards, Options & Payments | SwitchYard FX", description: "Forward contracts, options and zero-cost structures, same-day or T+1 international payments, FX risk strategy advisory and on-demand treasury support for Australian businesses." },
  "/about": { label: "About", priority: 0.8, title: "About SwitchYard FX | FX Advisory Partner for Mid-Market CFOs", description: "SwitchYard simplifies FX risk management for mid-market CFOs, operating as a Programme Manager under Ebury Partners Australia (AFSL 520548)." },
  "/contact": { label: "Contact", priority: 0.8, title: "Contact SwitchYard FX | Book a Free FX Strategy Call, Sydney", description: "Book a free 15-minute FX strategy consultation with SwitchYard FX in Sydney. Call 02 7226 3680, email admin@switchyardfx.com.au or message us on WhatsApp." },
  "/insights": { label: "Market Insights", priority: 0.6, title: "FX Market Insights for Australian Treasury Teams | SwitchYard FX", description: "Curated FX market insights, AUD trends and analysis for Australian CFOs, treasury and finance leaders." },
  "/privacy": { label: "Privacy Policy", priority: 0.2, title: "Privacy Policy | SwitchYard FX", description: "How SwitchYard FX collects, uses and protects your personal information." },
  "/terms": { label: "Terms of Service", priority: 0.2, title: "Terms of Service | SwitchYard FX", description: "The terms that apply to your use of the SwitchYard FX website." },
  "/compliance": { label: "Compliance", priority: 0.3, title: "Regulatory & Compliance Information | SwitchYard FX", description: "SwitchYard FX regulatory information: ASIC Authorised Representative 001318359 of Ebury Partners Australia (AFSL 520548), complaints and AFCA details." },
  "/login": { label: "Client Portal", index: false, title: "Client Portal | SwitchYard FX", description: "The SwitchYard FX client portal is coming soon. Existing clients can contact their team directly." },
};

const NOT_FOUND: RouteMeta = { label: "Page not found", index: false, title: "Page Not Found | SwitchYard FX", description: "Return to SwitchYard FX corporate FX risk management." };

export function routeMeta(path: string): RouteMeta {
  return ROUTES[path] ?? (path.startsWith("/insights/") ? ROUTES["/insights"] : NOT_FOUND);
}

// Plain answers drawn from the site's own copy. Shown on the home page and published as
// FAQPage data so search engines and AI assistants can quote them directly.
export const FAQS: [string, string][] = [
  ["What does SwitchYard FX do?", "SwitchYard FX simplifies foreign exchange (FX) risk management for mid-market CFOs and treasury teams. We provide forward contracts, options and zero-cost structures, cross-border payments, FX risk strategy advisory and on-demand treasury support."],
  ["Is SwitchYard FX regulated in Australia?", "Yes. Switchyard Capital Pty Ltd is an Authorised Representative (ASIC AR No. 001318359) of Ebury Partners Australia Pty Limited (ACN 632 570 702), which holds Australian Financial Services Licence 520548 and is registered with AUSTRAC."],
  ["What is an FX forward contract?", "A forward contract locks in an exchange rate today for a payment or receipt on a future date. It removes FX uncertainty on forecast exposures, has no upfront premium and can be tailored to your maturity dates and amounts."],
  ["How do FX options and zero-cost collars differ from forwards?", "Options and zero-cost collars protect you against adverse currency moves while keeping some of the benefit when the market moves in your favour. Premium structures and strike prices are flexible, which suits strategic deals, tenders and M&A."],
  ["How quickly are international payments settled?", "Payments settle same-day or T+1 with competitive FX pricing, transparent fees and multi-currency capability, delivered through our partnership with Ebury."],
  ["Who is SwitchYard FX for?", "Australian mid-market businesses with cross-border cash flows: importers paying overseas suppliers, exporters hedging forecast revenue, and companies managing M&A costs or dividend repatriation."],
  ["How do I get started with SwitchYard FX?", "Book a free 15-minute FX strategy consultation. We assess your exposure, design and execute a hedging strategy, track positions and report monthly. You can also call 02 7226 3680 or email admin@switchyardfx.com.au."],
];

const SERVICES: [string, string, string][] = [
  ["forward-contracts", "Forward Contracts", "Lock in FX rates today for future settlements, with no upfront premium."],
  ["options", "Options & Zero Cost Structures", "Protect against downside currency moves while preserving upside."],
  ["payments", "Payments & Settlements", "Cross-border payments with competitive rates and same-day or T+1 settlement."],
  ["risk-advisory", "Risk Strategy Advisory", "Hedging policies, scenario analysis and board reporting frameworks."],
  ["treasury-support", "Treasury Support", "On-demand advisory for complex transactions."],
];

const organization = {
  "@type": ["FinancialService", "Organization"],
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: ["SwitchYard", "SwitchYard FX Advisory", "Switchyard Capital"],
  legalName: "Switchyard Capital Pty Ltd",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: LOGO, width: 512, height: 512 },
  image: OG_IMAGE,
  description: ROUTES["/"].description,
  slogan: "Manage FX risk with confidence.",
  telephone: TELEPHONE,
  email: EMAIL,
  address: { "@type": "PostalAddress", addressLocality: "Sydney", addressRegion: "NSW", addressCountry: "AU" },
  geo: { "@type": "GeoCoordinates", ...GEO },
  areaServed: { "@type": "Country", name: "Australia" },
  currenciesAccepted: "AUD",
  knowsAbout: ["Foreign exchange risk management", "Currency hedging", "FX forward contracts", "FX options", "Zero-cost collars", "International payments", "Treasury management", "Hedging policy"],
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: TELEPHONE, email: EMAIL, areaServed: "AU", availableLanguage: "English" },
  hasCredential: { "@type": "EducationalOccupationalCredential", credentialCategory: "ASIC Authorised Representative", identifier: "001318359", recognizedBy: { "@type": "GovernmentOrganization", name: "Australian Securities and Investments Commission" } },
  hasOfferCatalog: { "@type": "OfferCatalog", name: "Corporate FX solutions", itemListElement: SERVICES.map(([id, name, description]) => ({ "@type": "Offer", itemOffered: { "@type": "Service", "@id": `${SITE_URL}/services#${id}`, name, description, url: `${SITE_URL}/services#${id}`, provider: { "@id": `${SITE_URL}/#organization` }, areaServed: "AU" } })) },
};

function structuredData(path: string, meta: RouteMeta) {
  const url = SITE_URL + (path === "/" ? "/" : path);
  const graph: object[] = [
    organization,
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: "en-AU", publisher: { "@id": `${SITE_URL}/#organization` } },
    { "@type": path === "/about" ? "AboutPage" : path === "/contact" ? "ContactPage" : "WebPage", "@id": `${url}#webpage`, url, name: meta.title, description: meta.description, inLanguage: "en-AU", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, primaryImageOfPage: OG_IMAGE,
      breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }, ...(path === "/" ? [] : [{ "@type": "ListItem", position: 2, name: meta.label, item: url }])] } },
  ];
  if (path === "/") graph.push({ "@type": "FAQPage", "@id": `${SITE_URL}/#faq`, mainEntity: FAQS.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) });
  return { "@context": "https://schema.org", "@graph": graph };
}

const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The per-page <head> tags. Every tag carries data-seo so the browser can swap the set on navigation.
export function renderHead(path: string): string {
  const meta = routeMeta(path);
  const url = SITE_URL + (path === "/" ? "/" : path);
  const indexable = meta.index !== false && path in ROUTES;
  const tags = [
    `<title data-seo>${esc(meta.title)}</title>`,
    `<meta data-seo name="description" content="${esc(meta.description)}" />`,
    `<meta data-seo name="robots" content="${indexable ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" : "noindex, follow"}" />`,
    `<link data-seo rel="canonical" href="${url}" />`,
    `<link data-seo rel="alternate" hreflang="en-AU" href="${url}" />`,
    `<link data-seo rel="alternate" hreflang="x-default" href="${url}" />`,
    `<meta data-seo property="og:type" content="website" />`,
    `<meta data-seo property="og:site_name" content="${SITE_NAME}" />`,
    `<meta data-seo property="og:locale" content="en_AU" />`,
    `<meta data-seo property="og:url" content="${url}" />`,
    `<meta data-seo property="og:title" content="${esc(meta.title)}" />`,
    `<meta data-seo property="og:description" content="${esc(meta.description)}" />`,
    `<meta data-seo property="og:image" content="${OG_IMAGE}" />`,
    `<meta data-seo property="og:image:width" content="1200" />`,
    `<meta data-seo property="og:image:height" content="630" />`,
    `<meta data-seo property="og:image:alt" content="SwitchYard FX — Manage FX risk with confidence" />`,
    `<meta data-seo name="twitter:card" content="summary_large_image" />`,
    `<meta data-seo name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta data-seo name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta data-seo name="twitter:image" content="${OG_IMAGE}" />`,
    `<script data-seo type="application/ld+json">${JSON.stringify(structuredData(path, meta)).replace(/</g, "\\u003c")}</script>`,
  ];
  return tags.join("\n    ");
}

export function renderSitemap(lastmod: string): string {
  const urls = Object.entries(ROUTES).filter(([, meta]) => meta.index !== false)
    .map(([path, meta]) => `  <url><loc>${SITE_URL}${path === "/" ? "/" : path}</loc><lastmod>${lastmod}</lastmod><priority>${meta.priority ?? 0.5}</priority></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}
