import type { en } from "./dictionaries/en.js";

export type SupportedLocale = "en" | "es";

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends Record<string, any> ? DeepStringRecord<T[K]> : string;
};

export type TranslationDictionary = DeepStringRecord<typeof en>;

export type TranslationKey = {
  [K in keyof typeof en & string]: (typeof en)[K] extends Record<string, any>
    ? {
        [P in keyof (typeof en)[K] & string]: (typeof en)[K][P] extends Record<string, any>
          ? `${K}.${P}.${keyof (typeof en)[K][P] & string}`
          : `${K}.${P}`;
      }[keyof (typeof en)[K] & string]
    : K;
}[keyof typeof en & string];
