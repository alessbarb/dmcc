import type { es } from "./dictionaries/es.js";

export type SupportedLocale = "en" | "es";

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends Record<string, any> ? DeepStringRecord<T[K]> : string;
};

export type TranslationDictionary = DeepStringRecord<typeof es>;

export type TranslationKey = {
  [K in keyof typeof es & string]: (typeof es)[K] extends Record<string, any>
    ? {
        [P in keyof (typeof es)[K] & string]: (typeof es)[K][P] extends Record<string, any>
          ? `${K}.${P}.${keyof (typeof es)[K][P] & string}`
          : `${K}.${P}`;
      }[keyof (typeof es)[K] & string]
    : K;
}[keyof typeof es & string];
