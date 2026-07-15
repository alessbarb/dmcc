import { describe, it, expect } from "vitest";
import {
  splitLines,
  joinLines,
  uniqueIds,
  isPrepState,
  findEntityTitle,
  mergeChecklist,
} from "../../../../src/frontend/dm/sessions/prep/sessionPrepUtils.js";

describe("splitLines", () => {
  it("trims each line and drops blank ones", () => {
    expect(splitLines("  first  \n\nsecond\n   \nthird")).toEqual(["first", "second", "third"]);
  });

  it("returns an empty array for blank input", () => {
    expect(splitLines("   \n  \n")).toEqual([]);
  });
});

describe("joinLines", () => {
  it("joins non-empty values with newlines", () => {
    expect(joinLines(["a", "b", "c"])).toBe("a\nb\nc");
  });

  it("filters out falsy entries", () => {
    expect(joinLines(["a", "", "b"])).toBe("a\nb");
  });

  it("returns an empty string for undefined", () => {
    expect(joinLines(undefined)).toBe("");
  });
});

describe("uniqueIds", () => {
  it("deduplicates and drops falsy ids", () => {
    expect(uniqueIds(["a", "b", "a", "", "c"])).toEqual(["a", "b", "c"]);
  });
});

describe("isPrepState", () => {
  it("accepts draft and ready", () => {
    expect(isPrepState("draft")).toBe(true);
    expect(isPrepState("ready")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isPrepState("active")).toBe(false);
    expect(isPrepState("")).toBe(false);
  });
});

describe("findEntityTitle", () => {
  const campaignState = {
    entities: [{ entityId: "ent_1", title: "Mira the Innkeeper" }],
  } as unknown as Parameters<typeof findEntityTitle>[0];

  it("returns the matching entity's title", () => {
    expect(findEntityTitle(campaignState, "ent_1")).toBe("Mira the Innkeeper");
  });

  it("falls back to the raw id when not found", () => {
    expect(findEntityTitle(campaignState, "ent_missing")).toBe("ent_missing");
  });

  it("falls back to the raw id when campaignState is null", () => {
    expect(findEntityTitle(null, "ent_2")).toBe("ent_2");
  });
});

describe("mergeChecklist", () => {
  it("creates new checklist items with fresh ids for new labels", () => {
    const result = mergeChecklist(undefined, ["Buy torches", "Scout the ruins"]);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ label: "Buy torches", done: false, priority: "medium" });
    expect(result[0].id).toBeTruthy();
  });

  it("preserves id, done, and priority for labels that already existed", () => {
    const existing = [{ id: "chk_1", label: "Buy torches", done: true, priority: "high" as const }];
    const result = mergeChecklist(existing, ["Buy torches"]);
    expect(result).toEqual([{ id: "chk_1", label: "Buy torches", done: true, priority: "high" }]);
  });

  it("drops items whose label is no longer present", () => {
    const existing = [{ id: "chk_1", label: "Old task", done: false, priority: "medium" as const }];
    const result = mergeChecklist(existing, ["New task"]);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("New task");
    expect(result[0].id).not.toBe("chk_1");
  });
});
