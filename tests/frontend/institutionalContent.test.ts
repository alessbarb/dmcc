import { describe, expect, it } from "vitest";
import {
  getInstitutionalPage,
  institutionalContact,
  institutionalPages,
  type InstitutionalPageKey,
} from "../../src/frontend/institutional/institutionalContent.js";
import { t } from "../../src/shared/i18n/translate.js";

describe("institutionalContent", () => {
  it("defines one page for every public institutional route", () => {
    const expectedKeys: InstitutionalPageKey[] = ["about", "contact", "privacy", "terms"];

    expect(institutionalPages.map((page) => page.key)).toEqual(expectedKeys);
    expect(institutionalPages.map((page) => page.path)).toEqual(expectedKeys.map((key) => `/${key}`));
  });

  it("keeps the public contact targets centralized", () => {
    expect(institutionalContact).toEqual({
      email: "dmcampaigncompanion@gmail.com",
      github: "https://github.com/alessbarb/DMCC",
    });
  });

  it("resolves known page content by key", () => {
    expect(getInstitutionalPage("privacy").path).toBe("/privacy");
    expect(getInstitutionalPage("terms").navLabel).toBe("Terms");
  });

  it("renders English legal pages with the US-formatted last-updated date", () => {
    const privacy = getInstitutionalPage("privacy", "en");
    const terms = getInstitutionalPage("terms", "en");

    expect(t("legal.lastUpdated", { date: privacy.lastUpdated }, "en")).toBe("Last updated: July 10, 2026");
    expect(t("legal.lastUpdated", { date: terms.lastUpdated }, "en")).toBe("Last updated: July 10, 2026");
  });

  it("keeps Spanish legal pages on the localized date", () => {
    expect(getInstitutionalPage("privacy", "es").lastUpdated).toBe("10 de julio de 2026");
    expect(getInstitutionalPage("terms", "es").lastUpdated).toBe("10 de julio de 2026");
  });
});
