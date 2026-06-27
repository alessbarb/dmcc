import { de } from "./dictionaries/de.js";
import { en } from "./dictionaries/en.js";
import { es } from "./dictionaries/es.js";
import { fr } from "./dictionaries/fr.js";
import { it } from "./dictionaries/it.js";
import { pt } from "./dictionaries/pt.js";
import type { TranslationDictionary } from "./types.js";

export const FALLBACK_LOCALE = "en" as const;

export interface LocaleDefinition {
  code: string;
  label: string;
  nativeLabel: string;
  dictionary: TranslationDictionary;
}

export const LOCALES = {
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    dictionary: en,
  },
  es: {
    code: "es",
    label: "Spanish",
    nativeLabel: "Español",
    dictionary: es,
  },
  fr: {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    dictionary: fr,
  },
  de: {
    code: "de",
    label: "German",
    nativeLabel: "Deutsch",
    dictionary: de,
  },
  it: {
    code: "it",
    label: "Italian",
    nativeLabel: "Italiano",
    dictionary: it,
  },
  pt: {
    code: "pt",
    label: "Portuguese",
    nativeLabel: "Português",
    dictionary: pt,
  },
} satisfies Record<string, LocaleDefinition>;

export type SupportedLocale = keyof typeof LOCALES;

export type LocaleOption = Omit<LocaleDefinition, "dictionary"> & {
  code: SupportedLocale;
};

export const SUPPORTED_LOCALES = Object.values(LOCALES).map(({ code, label, nativeLabel }) => ({
  code,
  label,
  nativeLabel,
})) as LocaleOption[];

export const SUPPORTED_LOCALE_CODES = Object.keys(LOCALES) as SupportedLocale[];

export const dictionaries = Object.fromEntries(
  Object.entries(LOCALES).map(([code, definition]) => [code, definition.dictionary]),
) as Record<SupportedLocale, TranslationDictionary>;

export function isSupportedLocale(locale: unknown): locale is SupportedLocale {
  return typeof locale === "string" && Object.hasOwn(LOCALES, locale);
}

export function getDictionary(locale: SupportedLocale): TranslationDictionary {
  return LOCALES[locale]?.dictionary ?? LOCALES[FALLBACK_LOCALE].dictionary;
}
