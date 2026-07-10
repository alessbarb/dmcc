import { describe, expect, it } from "vitest";
import {
  getInstitutionalPage,
  institutionalContact,
  institutionalPages,
  type InstitutionalPageKey,
} from "../../src/frontend/institutional/institutionalContent.js";

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
});
