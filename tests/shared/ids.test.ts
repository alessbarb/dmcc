import { describe, expect, it } from "vitest";
import { assertIdPrefix, createId, isIdWithPrefix } from "../../src/shared/ids.js";

describe("ID primitives", () => {
  it("creates stable prefixed ids", () => {
    const id = createId("ent");
    expect(id.startsWith("ent_")).toBe(true);
    expect(id.length).toBeGreaterThan("ent_".length);
  });

  it("validates required prefixes", () => {
    expect(isIdWithPrefix("cmp_abc", "cmp")).toBe(true);
    expect(isIdWithPrefix("ent_abc", "cmp")).toBe(false);
  });

  it("throws for the wrong prefix", () => {
    expect(() => assertIdPrefix("fact_123", "ent")).toThrow("Expected id prefix ent_");
  });
});
