import { describe, expect, it } from "vitest";
import type { Canvas } from "../../../src/core/domain/canvas/types.js";
import type { Entity, Fact, Relation } from "../../../src/frontend/shared/stores/campaignStore.js";
import { analyzeMysteryHealth } from "../../../src/frontend/dm/canvas/analysis/mysteryAnalysis.js";

const now = "2026-07-09T00:00:00.000Z";

const canvas = (nodes: Canvas["nodes"] = [], edges: Canvas["edges"] = []): Canvas => ({
  id: "canvas-1",
  campaignId: "campaign-1",
  title: "Mystery",
  kind: "mystery",
  nodes,
  edges,
  viewport: { x: 0, y: 0, zoom: 1 },
  archived: false,
  createdAt: now,
  updatedAt: now,
});

const entity = (overrides: Partial<Entity>): Entity => ({
  entityId: "entity-1",
  campaignId: "campaign-1",
  entityType: "clue",
  title: "Bloodstained letter",
  status: "ready",
  importance: "normal",
  visibility: { kind: "public" },
  metadata: {},
  tagIds: [],
  archived: false,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const relation = (overrides: Partial<Relation>): Relation => ({
  relationId: "relation-1",
  campaignId: "campaign-1",
  sourceEntityId: "clue-1",
  targetEntityId: "secret-1",
  relationType: "reveals",
  status: "active",
  visibility: { kind: "dm_only" },
  archived: false,
  ...overrides,
});

const fact = (overrides: Partial<Fact> = {}): Fact => ({
  factId: "fact-1",
  campaignId: "campaign-1",
  statement: "The witness lied",
  kind: "observation",
  confidence: "confirmed",
  visibility: { kind: "public" },
  relatedEntityIds: [],
  source: {},
  archived: false,
  ...overrides,
});

describe("analyzeMysteryHealth", () => {
  it("detects clues without a target", () => {
    const issues = analyzeMysteryHealth({
      canvas: canvas(),
      entities: [entity({ entityId: "clue-1" })],
      facts: [],
      relations: [],
    });

    expect(issues.map((issue) => issue.code)).toContain("clue_without_target");
  });

  it("does not flag a clue that points to a secret", () => {
    const issues = analyzeMysteryHealth({
      canvas: canvas(),
      entities: [
        entity({ entityId: "clue-1" }),
        entity({ entityId: "secret-1", entityType: "secret", title: "The duke is the cult leader" }),
      ],
      facts: [],
      relations: [relation({})],
    });

    expect(issues.some((issue) => issue.code === "clue_without_target")).toBe(false);
    expect(issues.some((issue) => issue.code === "secret_without_anchor")).toBe(false);
  });

  it("detects secrets without an anchor", () => {
    const issues = analyzeMysteryHealth({
      canvas: canvas(),
      entities: [entity({ entityId: "secret-1", entityType: "secret", title: "The hidden heir" })],
      facts: [],
      relations: [],
    });

    expect(issues.map((issue) => issue.code)).toContain("secret_without_anchor");
  });

  it("detects unresolved contradiction facts", () => {
    const issues = analyzeMysteryHealth({
      canvas: canvas(),
      entities: [],
      facts: [fact({ kind: "contradiction", confidence: "unresolved" })],
      relations: [],
    });

    expect(issues.map((issue) => issue.code)).toContain("contradiction_unresolved");
  });
});
