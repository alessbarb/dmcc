import type { SupportedLocale } from "@shared/i18n/index.js";
import { institutionalContentEN } from "./content/en.js";
import { institutionalContentES } from "./content/es.js";
import type { InstitutionalPageContent, InstitutionalPageKey } from "./institutionalTypes.js";

export type { InstitutionalPageContent, InstitutionalPageKey, InstitutionalSection } from "./institutionalTypes.js";

const fallbackContentLocaleCodes = ["fr", "de", "it", "pt"] as const satisfies readonly SupportedLocale[];
type FallbackContentLocale = (typeof fallbackContentLocaleCodes)[number];

const translationNotices = {
  fr: "Cette page est disponible en anglais pendant que nous terminons sa traduction.",
  de: "Diese Seite ist auf Englisch verfügbar, während wir die Übersetzung fertigstellen.",
  it: "Questa pagina è disponibile in inglese mentre completiamo la traduzione.",
  pt: "Esta página está disponível em inglês enquanto concluímos a tradução.",
} satisfies Record<FallbackContentLocale, string>;

const fallbackContentLocales = new Set<SupportedLocale>(fallbackContentLocaleCodes);

const contentByLocale = {
  en: institutionalContentEN,
  es: institutionalContentES,
} as const;

const pageOrder: readonly InstitutionalPageKey[] = ["about", "contact", "privacy", "terms"];

const navLabels = {
  about: "About",
  contact: "Contact",
  privacy: "Privacy",
  terms: "Terms",
} as const satisfies Record<InstitutionalPageKey, string>;

// Long institutional content is complete in English and Spanish; FR/DE/IT/PT use English content with a localized notice until translations are ready.
function contentLocale(locale: SupportedLocale): keyof typeof contentByLocale {
  return locale === "es" ? "es" : "en";
}

function isFallbackContentLocale(locale: SupportedLocale): locale is FallbackContentLocale {
  return fallbackContentLocales.has(locale);
}

function translationNotice(locale: SupportedLocale): string | undefined {
  return isFallbackContentLocale(locale) ? translationNotices[locale] : undefined;
}

export function getInstitutionalPages(locale: SupportedLocale): readonly InstitutionalPageContent[] {
  const language = contentLocale(locale);
  const pages = contentByLocale[language];
  const notice = translationNotice(locale);

  return pageOrder.map((key) => ({
    key,
    path: `/${key}`,
    navLabel: navLabels[key],
    navLabelKey: `footer.${key}`,
    translationNotice: notice,
    ...pages[key],
  }));
}

export function getInstitutionalPage(key: InstitutionalPageKey, locale: SupportedLocale = "en"): InstitutionalPageContent {
  return getInstitutionalPages(locale).find((page) => page.key === key) ?? getInstitutionalPages(locale)[0];
}
