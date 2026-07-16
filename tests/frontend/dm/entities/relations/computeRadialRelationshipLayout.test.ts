import { describe, expect, it } from "vitest";
import { computeRadialRelationshipLayout } from "../../../../../src/frontend/dm/entities/relations/computeRadialRelationshipLayout.js";
import type { RelationshipGraphEntity } from "../../../../../src/frontend/dm/entities/relations/entityRelationshipNeighborhood.js";

function makeNode(entityId: string, overrides: Partial<RelationshipGraphEntity> = {}): RelationshipGraphEntity {
  return {
    entityId,
    title: entityId,
    entityType: "npc",
    isCenter: false,
    ...overrides,
  };
}

const center = makeNode("ent_center", { isCenter: true });

describe("computeRadialRelationshipLayout", () => {
  it("keeps the center fixed at the origin", () => {
    const positions = computeRadialRelationshipLayout({ centerNode: center, neighborNodes: [] });

    expect(positions.get("ent_center")).toEqual({ centerX: 0, centerY: 0 });
  });

  it("produces a finite position for every neighbor", () => {
    const neighbors = Array.from({ length: 5 }, (_, i) => makeNode(`ent_${i}`));
    const positions = computeRadialRelationshipLayout({ centerNode: center, neighborNodes: neighbors });

    for (const neighbor of neighbors) {
      const point = positions.get(neighbor.entityId);
      expect(point).toBeDefined();
      expect(Number.isFinite(point!.centerX)).toBe(true);
      expect(Number.isFinite(point!.centerY)).toBe(true);
    }
  });

  it("does not place two neighbors at the same position within one ring", () => {
    const neighbors = Array.from({ length: 6 }, (_, i) => makeNode(`ent_${i}`));
    const positions = computeRadialRelationshipLayout({ centerNode: center, neighborNodes: neighbors });

    const points = neighbors.map((n) => positions.get(n.entityId));
    const unique = new Set(points.map((p) => `${p!.centerX},${p!.centerY}`));
    expect(unique.size).toBe(neighbors.length);
  });

  it("orders neighbors deterministically regardless of input order", () => {
    const neighbors = [makeNode("ent_b", { title: "Bruno" }), makeNode("ent_a", { title: "Aldric" })];
    const shuffled = [neighbors[1], neighbors[0]];

    const a = computeRadialRelationshipLayout({ centerNode: center, neighborNodes: neighbors });
    const b = computeRadialRelationshipLayout({ centerNode: center, neighborNodes: shuffled });

    expect(a.get("ent_a")).toEqual(b.get("ent_a"));
    expect(a.get("ent_b")).toEqual(b.get("ent_b"));
  });

  it("keeps everything on the first ring when under capacity", () => {
    const neighbors = Array.from({ length: 6 }, (_, i) => makeNode(`ent_${i}`));
    const positions = computeRadialRelationshipLayout({
      centerNode: center,
      neighborNodes: neighbors,
      firstRingCapacity: 8,
      firstRingRadius: 220,
    });

    for (const neighbor of neighbors) {
      const point = positions.get(neighbor.entityId)!;
      const radius = Math.hypot(point.centerX, point.centerY);
      expect(radius).toBeCloseTo(220, 3);
    }
  });

  it("spills into a second ring once the first is full", () => {
    const neighbors = Array.from({ length: 12 }, (_, i) => makeNode(`ent_${i}`));
    const positions = computeRadialRelationshipLayout({
      centerNode: center,
      neighborNodes: neighbors,
      firstRingCapacity: 8,
      firstRingRadius: 220,
      ringSpacing: 160,
    });

    const radii = neighbors.map((n) => Math.hypot(...(Object.values(positions.get(n.entityId)!) as [number, number])));
    const distinctRadii = new Set(radii.map((r) => Math.round(r)));
    expect(distinctRadii.size).toBe(2);
  });

  it("produces the same result for the same input", () => {
    const neighbors = Array.from({ length: 40 }, (_, i) => makeNode(`ent_${i}`, { entityType: i % 2 === 0 ? "npc" : "location" }));

    const a = computeRadialRelationshipLayout({ centerNode: center, neighborNodes: neighbors });
    const b = computeRadialRelationshipLayout({ centerNode: center, neighborNodes: neighbors });

    expect([...a.entries()]).toEqual([...b.entries()]);
  });

  it("handles a narrow set of 40 neighbors without collisions", () => {
    const neighbors = Array.from({ length: 40 }, (_, i) => makeNode(`ent_${i}`));
    const positions = computeRadialRelationshipLayout({ centerNode: center, neighborNodes: neighbors });

    const points = neighbors.map((n) => positions.get(n.entityId)!);
    const unique = new Set(points.map((p) => `${p.centerX.toFixed(1)},${p.centerY.toFixed(1)}`));
    expect(unique.size).toBe(neighbors.length);
  });
});
