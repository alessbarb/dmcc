import type { TranslationKey } from "./types.js";
import type { SupportedLocale } from "./locales.js";
import { FALLBACK_LOCALE, dictionaries, isSupportedLocale } from "./locales.js";
import { p1Dictionaries } from "./p1Dictionaries.js";
import type { InterpolationParams } from "./interpolation.js";
import { interpolate } from "./interpolation.js";

function getRawString(dict: any, path: string): string | undefined {
  const parts = path.split(".");
  let curr = dict;
  for (const part of parts) {
    if (curr && typeof curr === "object" && part in curr) {
      curr = curr[part];
    } else {
      return undefined;
    }
  }
  return typeof curr === "string" ? curr : undefined;
}

function getLocaleString(locale: SupportedLocale, key: string): string | undefined {
  return getRawString(dictionaries[locale], key) ?? getRawString(p1Dictionaries[locale], key);
}

export interface Translator {
  locale: SupportedLocale;
  t(key: TranslationKey | string, params?: InterpolationParams): string;
}

export function resolveLocale(input?: unknown): SupportedLocale {
  if (typeof input !== "string" || !input) return FALLBACK_LOCALE;

  const normalized = input.trim().toLowerCase().replace(/_/g, "-");
  if (isSupportedLocale(normalized)) return normalized;

  const [language] = normalized.split("-");
  if (isSupportedLocale(language)) return language;

  return FALLBACK_LOCALE;
}

export function detectBrowserLocale(savedLocale?: string | null): SupportedLocale {
  if (savedLocale) {
    const resolved = resolveLocale(savedLocale);
    if (isSupportedLocale(resolved)) return resolved;
  }

  if (typeof navigator !== "undefined") {
    if (Array.isArray(navigator.languages)) {
      for (const language of navigator.languages) {
        const normalized = language.trim().toLowerCase().replace(/_/g, "-");
        if (isSupportedLocale(normalized)) return normalized;
        const [base] = normalized.split("-");
        if (isSupportedLocale(base)) return base as SupportedLocale;
      }
    }
    if (navigator.language) {
      const normalized = navigator.language.trim().toLowerCase().replace(/_/g, "-");
      if (isSupportedLocale(normalized)) return normalized;
      const [base] = normalized.split("-");
      if (isSupportedLocale(base)) return base as SupportedLocale;
    }
  }

  return FALLBACK_LOCALE;
}

export function createTranslator(inputLocale?: unknown): Translator {
  const locale = resolveLocale(inputLocale);
  return {
    locale,
    t(key: TranslationKey | string, params?: InterpolationParams): string {
      let raw = getLocaleString(locale, key);
      if (raw === undefined && locale !== FALLBACK_LOCALE) {
        raw = getLocaleString(FALLBACK_LOCALE, key);
      }
      if (raw === undefined) return key;
      return interpolate(raw, params);
    },
  };
}

export function t(
  key: TranslationKey | string,
  params?: InterpolationParams,
  locale: SupportedLocale = FALLBACK_LOCALE,
): string {
  return createTranslator(locale).t(key, params);
}
