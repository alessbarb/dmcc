import { describe, expect, it } from "vitest";
import { formatSessionCardTitle } from "../../../../src/frontend/dm/sessions/formatSessionCardTitle.js";

const t = (key: string, params?: Record<string, string | number>) =>
  key === "session.sessionNumber" ? `Sesión ${params?.number}` : key;

describe("formatSessionCardTitle", () => {
  it("returns the raw title when there is no session number", () => {
    expect(formatSessionCardTitle({ title: "Prólogo" }, t)).toBe("Prólogo");
  });

  it("normalizes a plain descriptive title to the canonical format", () => {
    expect(formatSessionCardTitle({ number: 6, title: "Castillo Cragmaw" }, t)).toBe(
      "Sesión 6 — Castillo Cragmaw",
    );
  });

  it("normalizes a title that already embeds the localized number prefix", () => {
    expect(
      formatSessionCardTitle({ number: 1, title: "Sesión 1 — La emboscada en el camino" }, t),
    ).toBe("Sesión 1 — La emboscada en el camino");
  });

  it("normalizes a title that embeds a raw #N prefix instead of the localized one", () => {
    expect(formatSessionCardTitle({ number: 6, title: "#6 Castillo Cragmaw" }, t)).toBe(
      "Sesión 6 — Castillo Cragmaw",
    );
  });

  it("falls back to just the number label when the title is empty after stripping the prefix", () => {
    expect(formatSessionCardTitle({ number: 3, title: "Sesión 3" }, t)).toBe("Sesión 3");
  });
});
