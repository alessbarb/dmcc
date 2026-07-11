import { FALLBACK_LOCALE, getDictionary } from "../locales.js";
import type { SupportedLocale } from "../locales.js";
import type { InstitutionalDictionaryContent, InstitutionalLocaleContent, InstitutionalPageContent, InstitutionalPageKey } from "./types.js";

export type { InstitutionalDictionaryContent, InstitutionalLocaleContent, InstitutionalPageBody, InstitutionalPageContent, InstitutionalPageKey, InstitutionalSection } from "./types.js";

const pageOrder: readonly InstitutionalPageKey[] = ["about", "contact", "privacy", "terms"];

const navLabels = {
  about: "About",
  contact: "Contact",
  privacy: "Privacy",
  terms: "Terms",
} as const satisfies Record<InstitutionalPageKey, string>;

function hasCompleteInstitutionalPages(content: InstitutionalDictionaryContent | undefined): content is InstitutionalDictionaryContent & { readonly pages: InstitutionalLocaleContent } {
  return pageOrder.every((key) => content?.pages?.[key]);
}

function resolveInstitutionalContent(locale: SupportedLocale): {
  readonly pages: InstitutionalLocaleContent;
  readonly translationNotice?: string;
} {
  const dictionaryContent = getDictionary(locale).institutional;
  if (hasCompleteInstitutionalPages(dictionaryContent)) {
    return {
      pages: dictionaryContent.pages,
      translationNotice: dictionaryContent.translationNotice || undefined,
    };
  }

  const fallbackContent = getDictionary(FALLBACK_LOCALE).institutional;
  if (!hasCompleteInstitutionalPages(fallbackContent)) {
    throw new Error("Fallback institutional content is incomplete.");
  }

  return {
    pages: fallbackContent.pages,
    translationNotice: dictionaryContent?.translationNotice || undefined,
  };
}

export function getInstitutionalPages(locale: SupportedLocale): readonly InstitutionalPageContent[] {
  const { pages, translationNotice } = resolveInstitutionalContent(locale);

  return pageOrder.map((key) => ({
    key,
    path: `/${key}`,
    navLabel: navLabels[key],
    navLabelKey: `footer.${key}`,
    translationNotice,
    ...pages[key],
  }));
}

export function getInstitutionalPage(key: InstitutionalPageKey, locale: SupportedLocale = FALLBACK_LOCALE): InstitutionalPageContent {
  return getInstitutionalPages(locale).find((page) => page.key === key) ?? getInstitutionalPages(locale)[0];
}
