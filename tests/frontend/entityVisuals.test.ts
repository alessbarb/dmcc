import { describe, expect, it } from "vitest";
import { entityTypeSchema } from "../../src/core/domain/entity/types.js";
import {
  ENTITY_VISUALS,
  getEntityVisual,
  getRelationVisual,
} from "../../src/frontend/dm/entities/entityVisuals.js";

describe("entity visuals", () => {
  it("defines a complete semantic visual for every entity type", () => {
    for (const type of entityTypeSchema.options) {
      expect(ENTITY_VISUALS[type]).toMatchObject({
        labelKey: `domain.entityTypes.${type}`,
      });
      expect(ENTITY_VISUALS[type].icon).toBeTypeOf("object");
      expect(ENTITY_VISUALS[type].accent).toMatch(/^var\(--entity-/);
      expect(ENTITY_VISUALS[type].accentSoft).toMatch(/^var\(--entity-/);
    }
  });

  it("keeps the flagship narrative types visually distinguishable without color", () => {
    expect(getEntityVisual("npc")).toMatchObject({
      shape: "portrait",
      borderPattern: "solid",
    });
    expect(getEntityVisual("location")).toMatchObject({
      shape: "hex-header",
      borderPattern: "solid",
    });
    expect(getEntityVisual("secret")).toMatchObject({
      shape: "veiled",
      borderPattern: "double",
      privacy: "private",
    });
    expect(getEntityVisual("rumor")).toMatchObject({
      shape: "compact",
      borderPattern: "dashed",
      privacy: "uncertain",
    });
  });

  it("returns the note visual as the safe fallback", () => {
    expect(getEntityVisual("unknown")).toBe(ENTITY_VISUALS.note);
  });

  it("maps narrative relationship semantics to color, line and label cues", () => {
    expect(getRelationVisual("confirms")).toMatchObject({
      semantic: "canon",
      line: "solid",
      label: "Canon",
    });
    expect(getRelationVisual("rumor")).toMatchObject({
      semantic: "rumor",
      line: "dashed",
      label: "Rumor",
    });
    expect(getRelationVisual("distrusts")).toMatchObject({
      semantic: "distrust",
      line: "dashed",
      label: "Desconfianza",
    });
    expect(getRelationVisual("hostile_to")).toMatchObject({
      semantic: "hostility",
      line: "double",
      label: "Hostilidad",
    });
  });
});
