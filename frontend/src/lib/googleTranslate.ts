declare global {
  interface Window {
    google?: { translate?: { TranslateElement?: new (options: unknown, element: string) => unknown } };
    googleTranslateElementInit?: () => void;
  }
}

const LANGUAGE_KEY = "switchyard-language";
let scriptRequested = false;

export const LANGUAGES = [
  ["en", "English"],
  ["zh-CN", "中文"],
  ["zh-TW", "繁體中文"],
  ["ja", "日本語"],
  ["ko", "한국어"],
  ["vi", "Tiếng Việt"],
  ["hi", "हिन्दी"],
  ["id", "Bahasa Indonesia"],
  ["ar", "العربية"],
  ["es", "Español"],
  ["fr", "Français"],
  ["de", "Deutsch"],
] as const;

export type LanguageCode = (typeof LANGUAGES)[number][0];

export function getStoredLanguage(): LanguageCode {
  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  return LANGUAGES.some(([code]) => code === stored) ? (stored as LanguageCode) : "en";
}

// Google Translate keeps its choice in a "googtrans" cookie that may be scoped to the host, to
// ".host" or to a parent domain (e.g. ".switchyardfx.com.au" when browsing www.), so every
// variant has to be written or cleared together.
function translateCookieDomains() {
  const labels = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i += 1) {
    const domain = labels.slice(i).join(".");
    domains.push(`; domain=${domain}`, `; domain=.${domain}`);
  }
  return domains;
}

function hasTranslateCookie() {
  return document.cookie.split("; ").some((part) => part.startsWith("googtrans=") && part !== "googtrans=/en/en");
}

export function setDocumentLanguage(language: LanguageCode) {
  window.localStorage.setItem(LANGUAGE_KEY, language);
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  if (language === "en") {
    // Selecting English in Google's widget doesn't undo a translation, so clear the cookie
    // everywhere and reload once to bring back the original page.
    const wasTranslated = hasTranslateCookie();
    for (const domain of translateCookieDomains()) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
    // Reload only if the cookie is really gone, so a cookie we can't clear never loops.
    if (wasTranslated && !hasTranslateCookie()) window.location.reload();
    return;
  }
  for (const domain of translateCookieDomains()) {
    document.cookie = `googtrans=/en/${language}; path=/${domain}`;
  }
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select && select.value !== language) {
    select.value = language;
    select.dispatchEvent(new Event("change"));
  }
}

export function installGoogleTranslate() {
  const language = getStoredLanguage();
  setDocumentLanguage(language);
  window.googleTranslateElementInit = () => {
    try {
      const TranslateElement = window.google?.translate?.TranslateElement;
      if (TranslateElement && !document.querySelector(".goog-te-gadget")) {
        new TranslateElement(
          { pageLanguage: "en", includedLanguages: LANGUAGES.map(([code]) => code).join(","), autoDisplay: false },
          "google_translate_element",
        );
      }
      window.setTimeout(() => setDocumentLanguage(getStoredLanguage()), 100);
    } catch {
      // Translation is an enhancement; the original English page remains usable.
    }
  };
  if (!scriptRequested && !document.querySelector("script[data-switchyard-translate]")) {
    scriptRequested = true;
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.dataset.switchyardTranslate = "true";
    script.onerror = () => { scriptRequested = false; };
    document.head.appendChild(script);
  }
}