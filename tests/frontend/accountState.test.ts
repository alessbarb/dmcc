import { describe, expect, it } from "vitest";
import {
  isDirty,
  mergeConflict,
  normalizeReturnTo,
} from "../../src/frontend/account/accountState.js";

describe("account state", () => {
  it("preserves unsaved values after a version conflict", () => {
    const server = { version: 2, biography: "Server value" };
    const draft = { version: 1, biography: "Unsaved value" };

    expect(mergeConflict(server, draft)).toEqual({
      server,
      draft,
      conflicted: true,
    });
  });

  it("marks a module dirty only when values differ", () => {
    const profile = { version: 1, biography: "Original" };

    expect(isDirty(profile, { ...profile })).toBe(false);
    expect(isDirty(profile, { ...profile, biography: "Changed" })).toBe(true);
  });

  it("accepts only same-origin return paths", () => {
    expect(normalizeReturnTo("/campaigns/cmp_1/dashboard")).toBe("/campaigns/cmp_1/dashboard");
    expect(normalizeReturnTo("https://attacker.example/steal")).toBe("/dm");
    expect(normalizeReturnTo("//attacker.example/steal")).toBe("/dm");
  });
});
