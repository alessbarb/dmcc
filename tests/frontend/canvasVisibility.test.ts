import { describe, expect, it } from "vitest";
import type { CanvasEdge, CanvasNode } from "../../src/core/domain/canvas/types.js";
import { isDmOnlyVisibility } from "../../src/core/domain/visibility/visibility.js";
import type { VisibilityRule } from "../../src/core/domain/visibility/visibility.js";
import { canvasVisibilityToVisibilityRule, isPublicCanvasEdge, isPublicCanvasNode, visibilityRuleToCanvasVisibility } from "../../src/frontend/dm/canvas/services/canvasVisibility.js";

const baseNode = (overrides: Partial<CanvasNode>): CanvasNode => ({
  id: "cvn_public",
  campaignId: "cmp_test",
  canvasId: "cvs_test",
  kind: "entity",
  x: 0,
  y: 0,
  createdAt: "2026-07-09T00:00:00.000Z",
  updatedAt: "2026-07-09T00:00:00.000Z",
  ...overrides,
});

const baseEdge = (overrides: Partial<CanvasEdge>): CanvasEdge => ({
  id: "cve_public",
  campaignId: "cmp_test",
  canvasId: "cvs_test",
  sourceNodeId: "cvn_a",
  targetNodeId: "cvn_b",
  status: "draft",
  createdAt: "2026-07-09T00:00:00.000Z",
  updatedAt: "2026-07-09T00:00:00.000Z",
  ...overrides,
});

describe("canvas visibility helpers", () => {
  it.each<[VisibilityRule, "dm" | "public"]>([
    [{ kind: "dm_only" }, "dm"],
    [{ kind: "public" }, "public"],
    [{ kind: "party" }, "public"],
    [{ kind: "players", playerIds: ["player-1"] }, "public"],
    [{ kind: "characters", characterEntityIds: ["entity-1"] }, "public"],
  ])("converts %j domain visibility to %s visual canvas visibility", (domainVisibility, canvasVisibility) => {
    expect(visibilityRuleToCanvasVisibility(domainVisibility)).toBe(canvasVisibility);
  });

  it.each([
    ["dm" as const, { kind: "dm_only" }],
    ["public" as const, { kind: "public" }],
  ])("converts %s visual canvas visibility to coarse domain visibility", (canvasVisibility, domainVisibility) => {
    expect(canvasVisibilityToVisibilityRule(canvasVisibility)).toEqual(domainVisibility);
  });

  it("recognizes current and legacy DM-only domain visibility values", () => {
    expect(isDmOnlyVisibility({ kind: "dm_only" })).toBe(true);
    expect(isDmOnlyVisibility({ kind: "dm" })).toBe(true);
    expect(isDmOnlyVisibility({ kind: "party" })).toBe(false);
  });

  it("hides a DM-only entity from player/publicOnly canvas views", () => {
    expect(isPublicCanvasNode(baseNode({ entityId: "ent_secret" }), { visibility: { kind: "dm_only" } })).toBe(false);
  });

  it("hides a DM-only relationship from player/publicOnly canvas views", () => {
    expect(isPublicCanvasEdge(baseEdge({ relationshipId: "rel_secret" }), { visibility: { kind: "dm_only" } })).toBe(false);
  });

  it("hides a visual canvas edge marked as dm from player/publicOnly canvas views", () => {
    expect(isPublicCanvasEdge(baseEdge({ visibility: "dm" }), { visibility: { kind: "public" } })).toBe(false);
  });

  it("hides a secret fact from player/publicOnly canvas views", () => {
    expect(isPublicCanvasNode(baseNode({ kind: "fact", factId: "fact_secret" }), { visibility: { kind: "dm_only" } })).toBe(false);
  });

  it("hides legacy kind: dm combinations from player/publicOnly canvas views", () => {
    expect(isPublicCanvasNode(baseNode({ entityId: "ent_legacy" }), { visibility: { kind: "dm" } })).toBe(false);
    expect(isPublicCanvasEdge(baseEdge({ relationshipId: "rel_legacy" }), { visibility: { kind: "dm" } })).toBe(false);
  });
});
