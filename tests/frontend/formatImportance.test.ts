import { describe, expect, it } from "vitest";
import { formatImportance } from "../../src/frontend/shared/presentation/formatImportance.js";

describe("formatImportance", () => {
  it("returns empty string for missing input", () => {
    expect(formatImportance(null)).toBe("");
    expect(formatImportance(undefined)).toBe("");
    expect(formatImportance("")).toBe("");
  });

  it("translates known importance levels", () => {
    expect(formatImportance("critical", "en")).toBe("Critical");
    expect(formatImportance("critical", "es")).toBe("Crítica");
  });

  it("falls back to a capitalized raw value for unknown importance levels", () => {
    expect(formatImportance("bespoke", "en")).toBe("Bespoke");
  });
});
