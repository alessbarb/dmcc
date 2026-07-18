import { describe, expect, it } from "vitest";
import { validateSessionEventDetails } from "../../src/core/domain/session/sessionEventDetails.js";

describe("validateSessionEventDetails", () => {
  it("passes through an empty object without validating, for backward compatibility", () => {
    expect(() => validateSessionEventDetails("decision_made", {})).not.toThrow();
    expect(() => validateSessionEventDetails("material_introduced", {})).not.toThrow();
  });

  it("validates populated details against the type's schema", () => {
    expect(() => validateSessionEventDetails("decision_made", { choice: "Flee" })).not.toThrow();
    expect(() => validateSessionEventDetails("decision_made", { alternativesRejected: ["Fight"] })).toThrow();
  });

  it("validates material_introduced's source enum", () => {
    expect(() => validateSessionEventDetails("material_introduced", { source: "canvas" })).not.toThrow();
    expect(() => validateSessionEventDetails("material_introduced", { source: "invalid" })).toThrow();
  });

  it("passes through unvalidated for a type with no registered schema", () => {
    expect(() => validateSessionEventDetails("npc_met", { anything: true })).not.toThrow();
  });
});
