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

export function setDocumentLanguage(language: LanguageCode) {
  window.localStorage.setItem(LANGUAGE_KEY, language);
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.cookie = `googtrans=/en/${language}; path=/`;
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