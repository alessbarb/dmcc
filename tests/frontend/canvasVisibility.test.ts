import { describe, expect, it } from "vitest";
import type { CanvasEdge, CanvasNode } from "../../src/core/domain/canvas/types.js";
import { isDmOnlyVisibility, toCanvasVisibility, toVisibilityRule } from "../../src/core/domain/visibility/visibility.js";
import { isPublicCanvasEdge, isPublicCanvasNode } from "../../src/frontend/dm/canvas/services/canvasVisibility.js";

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
  it("converts between domain visibility and visual canvas visibility", () => {
    expect(toCanvasVisibility({ kind: "dm_only" })).toBe("dm");
    expect(toCanvasVisibility({ kind: "party" })).toBe("public");
    expect(toVisibilityRule("dm")).toEqual({ kind: "dm_only" });
    expect(toVisibilityRule("public")).toEqual({ kind: "public" });
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
