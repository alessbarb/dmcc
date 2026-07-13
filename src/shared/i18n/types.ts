import type { InstitutionalDictionaryContent } from "./institutional/types.js";
import type { en } from "./dictionaries/en.js";
export type { SupportedLocale } from "./localeTypes.js";

export type TranslationDictionary = DeepStringRecord<Omit<typeof en, "institutional">> & {
  readonly institutional: InstitutionalDictionaryContent;
};

export type TranslationKey = DotPath<typeof en>;

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? DeepStringRecord<T[K]> : string;
};

type DotPath<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown> ? `${K}.${DotPath<T[K]>}` : K;
}[keyof T & string];
