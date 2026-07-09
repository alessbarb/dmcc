import { describe, expect, it } from "vitest";
import type { Canvas } from "../../../src/core/domain/canvas/types.js";
import type { Entity, Fact } from "../../../src/frontend/shared/stores/campaignStore.js";
import {
  filterNavigatorEntities,
  getPlacedNodesByType,
  getUnplacedEntities,
  searchFacts,
  searchNoteNodes,
} from "../../../src/frontend/dm/canvas/selectors/canvasNavigatorSelectors.js";

const entity = (overrides: Partial<Entity>): Entity => ({
  entityId: "entity-1",
  campaignId: "campaign-1",
  entityType: "npc",
  title: "Mara",
  status: "ready",
  importance: "normal",
  visibility: { kind: "public" },
  metadata: {},
  tagIds: [],
  archived: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const canvas = {
  id: "canvas-1",
  canvasId: "canvas-1",
  campaignId: "campaign-1",
  title: "Canvas",
  kind: "world",
  nodes: [
    { id: "node-entity", kind: "entity", entityId: "entity-1", x: 0, y: 0 },
    { id: "node-fact", kind: "fact", factId: "fact-1", x: 0, y: 0 },
    { id: "node-note", kind: "note", title: "Session lead", text: "Meet at the docks", x: 0, y: 0 },
  ],
  edges: [],
} as Canvas;

describe("canvasNavigatorSelectors", () => {
  it("groups placed nodes by navigable content type", () => {
    const placed = getPlacedNodesByType(canvas, {
      entities: [entity({ entityId: "entity-1" })],
      facts: [{ factId: "fact-1", statement: "The harbor is cursed" } as Fact],
    });

    expect(placed.entities).toHaveLength(1);
    expect(placed.facts).toHaveLength(1);
    expect(placed.notes).toHaveLength(1);
  });

  it("returns entities not placed on the current canvas", () => {
    const unplaced = getUnplacedEntities(canvas, {
      entities: [entity({ entityId: "entity-1" }), entity({ entityId: "entity-2", title: "Old Lighthouse" })],
    });

    expect(unplaced.map((item) => item.entityId)).toEqual(["entity-2"]);
  });

  it("searches entity title, subtitle, summary, and type with filters", () => {
    const results = filterNavigatorEntities([
      entity({ title: "Mara", subtitle: "Spy", summary: "Knows the red key" }),
      entity({ entityId: "entity-2", title: "Vault", entityType: "location", visibility: { kind: "dm_only" } }),
    ], { query: "red key", type: "npc", visibility: "public", status: "active" });

    expect(results.map((item) => item.title)).toEqual(["Mara"]);
  });

  it("searches facts and note title/text", () => {
    expect(searchFacts([{ factId: "fact-1", statement: "The moon door opens" } as Fact], "moon")).toHaveLength(1);
    expect(searchNoteNodes(canvas.nodes, "docks").map((node) => node.id)).toEqual(["node-note"]);
  });
});
