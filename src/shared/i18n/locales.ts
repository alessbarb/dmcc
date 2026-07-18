import { de } from "./dictionaries/de.js";
import { en } from "./dictionaries/en.js";
import { es } from "./dictionaries/es.js";
import { fr } from "./dictionaries/fr.js";
import { it } from "./dictionaries/it.js";
import { pt } from "./dictionaries/pt.js";
import { withCampaignMessagingTranslations } from "./campaignMessaging.js";
import type { TranslationDictionary } from "./types.js";
import type { SupportedLocale } from "./localeTypes.js";

export const FALLBACK_LOCALE = "en" as const;

export interface LocaleDefinition {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  dictionary: TranslationDictionary;
}

export const LOCALES = {
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    dictionary: withCampaignMessagingTranslations(en, "en"),
  },
  es: {
    code: "es",
    label: "Spanish",
    nativeLabel: "Español",
    dictionary: withCampaignMessagingTranslations(es, "es"),
  },
  fr: {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    dictionary: withCampaignMessagingTranslations(fr, "fr"),
  },
  de: {
    code: "de",
    label: "German",
    nativeLabel: "Deutsch",
    dictionary: withCampaignMessagingTranslations(de, "de"),
  },
  it: {
    code: "it",
    label: "Italian",
    nativeLabel: "Italiano",
    dictionary: withCampaignMessagingTranslations(it, "it"),
  },
  pt: {
    code: "pt",
    label: "Portuguese",
    nativeLabel: "Português",
    dictionary: withCampaignMessagingTranslations(pt, "pt"),
  },
} satisfies Record<SupportedLocale, LocaleDefinition>;

export type LocaleOption = Omit<LocaleDefinition, "dictionary"> & {
  code: SupportedLocale;
};

export const SUPPORTED_LOCALES = Object.values(LOCALES).map(({ code, label, nativeLabel }) => ({
  code,
  label,
  nativeLabel,
})) as LocaleOption[];

// Object.keys/fromEntries always return string[]/Record<string, ...>; every key here
// comes directly from LOCALES, whose keys are exactly SupportedLocale (enforced by the
// `satisfies Record<SupportedLocale, LocaleDefinition>` above), so the casts just restore that.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
export const SUPPORTED_LOCALE_CODES = Object.keys(LOCALES) as SupportedLocale[];

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
export const dictionaries = Object.fromEntries(
  Object.entries(LOCALES).map(([code, definition]) => [code, definition.dictionary]),
) as Record<SupportedLocale, TranslationDictionary>;

export function isSupportedLocale(locale: unknown): locale is SupportedLocale {
  return typeof locale === "string" && Object.hasOwn(LOCALES, locale);
}

export function getDictionary(locale: SupportedLocale): TranslationDictionary {
  return LOCALES[locale]?.dictionary ?? LOCALES[FALLBACK_LOCALE].dictionary;
}
