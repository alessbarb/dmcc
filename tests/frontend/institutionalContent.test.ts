import { describe, expect, it } from "vitest";
import {
  getInstitutionalPage,
  getInstitutionalPages,
  institutionalContact,
  type InstitutionalPageKey,
} from "../../src/shared/i18n/institutional/index.js";
import { SUPPORTED_LOCALE_CODES } from "../../src/shared/i18n/locales.js";
import { t } from "../../src/shared/i18n/translate.js";

describe("institutionalContent", () => {
  it("defines one page for every public institutional route", () => {
    const expectedKeys: InstitutionalPageKey[] = ["about", "contact", "privacy", "terms"];

    const institutionalPages = getInstitutionalPages("en");

    expect(institutionalPages.map((page) => page.key)).toEqual(expectedKeys);
    expect(institutionalPages.map((page) => page.path)).toEqual(expectedKeys.map((key) => `/${key}`));
  });

  it("keeps the public contact targets centralized", () => {
    expect(institutionalContact).toEqual({
      email: "dmcampaigncompanion@gmail.com",
      github: "https://github.com/alessbarb/DMCC",
    });
  });


  it("does not expose known corrupted text fragments in institutional content", () => {
    const corruptedFragments = ["regunetwork", "networkguage", "Wweb sharing"];
    const visibleContent = ["en", "es", "fr", "de", "it", "pt"].flatMap((locale) =>
      getInstitutionalPages(locale).flatMap((page) => [
        page.navLabel,
        page.eyebrow,
        page.title,
        page.summary,
        page.lastUpdated ?? "",
        page.translationNotice ?? "",
        ...page.sections.flatMap((section) => [section.title, ...section.paragraphs]),
      ]),
    );

    for (const fragment of corruptedFragments) {
      expect(visibleContent.join("\n")).not.toContain(fragment);
    }
  });

  it("resolves known page content by key", () => {
    expect(getInstitutionalPage("privacy").path).toBe("/privacy");
    expect(getInstitutionalPage("terms").navLabel).toBe("Terms");
  });

  it("renders English legal pages with the US-formatted last-updated date", () => {
    const privacyLastUpdated = getInstitutionalPage("privacy", "en").lastUpdated;
    const termsLastUpdated = getInstitutionalPage("terms", "en").lastUpdated;

    expect(privacyLastUpdated).toBeDefined();
    expect(termsLastUpdated).toBeDefined();
    expect(t("legal.lastUpdated", { date: privacyLastUpdated ?? "" }, "en")).toBe("Last updated: July 10, 2026");
    expect(t("legal.lastUpdated", { date: termsLastUpdated ?? "" }, "en")).toBe("Last updated: July 10, 2026");
  });

  it("uses explicit English-content notices for supported fallback locales", () => {
    const fallbackLocales = ["fr", "de", "it", "pt"];

    for (const locale of SUPPORTED_LOCALE_CODES) {
      const page = getInstitutionalPage("about", locale);

      if (fallbackLocales.includes(locale)) {
        expect(page.translationNotice).toBeDefined();
        expect(page.title).toBe(getInstitutionalPage("about", "en").title);
      } else {
        expect(page.translationNotice).toBeUndefined();
      }
    }
  });

  it("keeps privacy policies aligned across locales", () => {
    expect(getInstitutionalPage("privacy", "en").sections.map((section) => section.title)).toEqual([
      "Project controller",
      "Data we may process",
      "How we use data",
      "Legal basis",
      "Data retention",
      "Cookies and local storage",
      "Third-party services",
      "Your rights",
      "Security",
      "Changes to this policy",
    ]);
    expect(getInstitutionalPage("privacy", "es").sections.map((section) => section.title)).toEqual([
      "Responsable del proyecto",
      "Datos que podemos tratar",
      "Para qué usamos los datos",
      "Base legal",
      "Conservación de los datos",
      "Cookies y almacenamiento local",
      "Servicios de terceros",
      "Tus derechos",
      "Seguridad",
      "Cambios en esta política",
    ]);
  });

  it("keeps Spanish legal pages on the localized date", () => {
    expect(getInstitutionalPage("privacy", "es").lastUpdated).toBe("10 de julio de 2026");
    expect(getInstitutionalPage("terms", "es").lastUpdated).toBe("10 de julio de 2026");
  });
});
