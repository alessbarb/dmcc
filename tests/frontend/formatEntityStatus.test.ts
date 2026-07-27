import { describe, expect, it } from "vitest";
import { formatEntityStatus } from "../../src/frontend/shared/presentation/formatEntityStatus.js";

describe("formatEntityStatus", () => {
  it("returns empty string for missing status", () => {
    expect(formatEntityStatus(null)).toBe("");
    expect(formatEntityStatus(undefined)).toBe("");
    expect(formatEntityStatus("")).toBe("");
  });

  it("translates a generic status.* key", () => {
    expect(formatEntityStatus("active", "en")).toBe("Active");
  });

  it("falls back to the broader boards.statuses.* vocabulary for entity-specific statuses", () => {
    // These previously fell through to a raw-capitalized English string
    // (e.g. "HIDDEN"/"AVAILABLE") regardless of locale.
    expect(formatEntityStatus("hidden", "es")).toBe("Oculta");
    expect(formatEntityStatus("available", "es")).toBe("Disponible");
    expect(formatEntityStatus("dm_only", "es")).toBe("Solo DM");
    expect(formatEntityStatus("revealed_to_one", "es")).toBe("Revelada a uno");
  });

  it("falls back to the localized 'no status' label for truly unknown/legacy statuses", () => {
    // A bare capitalized raw value (e.g. "Open") reads as an untranslated
    // English leak; unknown/legacy status keys should resolve to the same
    // localized placeholder used elsewhere instead (see UI/UX audit A3).
    expect(formatEntityStatus("unmapped", "en")).toBe("No status");
    expect(formatEntityStatus("open", "es")).toBe("Sin estado");
  });
});
