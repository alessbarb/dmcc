import type { TranslationKey } from "./types.js";
import type { SupportedLocale } from "./localeTypes.js";
import { FALLBACK_LOCALE, dictionaries, isSupportedLocale } from "./locales.js";
import type { InterpolationParams } from "./interpolation.js";
import { interpolate } from "./interpolation.js";

function hasOwnKey(obj: object, key: string): obj is Record<string, unknown> {
  return key in obj;
}

function getRawString(dict: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let curr: unknown = dict;
  for (const p of parts) {
    if (curr && typeof curr === "object" && hasOwnKey(curr, p)) {
      curr = curr[p];
    } else {
      return undefined;
    }
  }
  return typeof curr === "string" ? curr : undefined;
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
      const targetDict = dictionaries[locale] ?? dictionaries[FALLBACK_LOCALE];
      let raw = getRawString(targetDict, key);
      if (raw === undefined && locale !== FALLBACK_LOCALE) {
        raw = getRawString(dictionaries[FALLBACK_LOCALE], key);
      }
      if (raw === undefined) {
        return key;
      }
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
