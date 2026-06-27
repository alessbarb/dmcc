import { es } from "./dictionaries/es.js";
import { en } from "./dictionaries/en.js";
import type { SupportedLocale, TranslationKey, TranslationDictionary } from "./types.js";
import type { InterpolationParams } from "./interpolation.js";
import { interpolate } from "./interpolation.js";

const dictionaries: Record<SupportedLocale, TranslationDictionary> = { es, en };

function getRawString(dict: any, path: string): string | undefined {
  const parts = path.split(".");
  let curr = dict;
  for (const p of parts) {
    if (curr && typeof curr === "object" && p in curr) {
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

export function createTranslator(locale: SupportedLocale = "es"): Translator {
  return {
    locale,
    t(key: TranslationKey | string, params?: InterpolationParams): string {
      const targetDict = dictionaries[locale] ?? dictionaries.es;
      let raw = getRawString(targetDict, key);
      if (raw === undefined && locale !== "es") {
        raw = getRawString(dictionaries.es, key);
      }
      if (raw === undefined) {
        return key;
      }
      return interpolate(raw, params);
    },
  };
}

export function t(key: TranslationKey | string, params?: InterpolationParams, locale: SupportedLocale = "es"): string {
  return createTranslator(locale).t(key, params);
}
