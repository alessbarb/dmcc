import { describe, expect, it } from "vitest";
import {
  initialEntityRelationshipNavigationState,
  isExternalEntityChange,
  popNavigation,
  pushNavigation,
  resetNavigation,
} from "../../../../../src/frontend/dm/entities/relations/entityRelationshipNavigationState.js";

describe("entity relationship navigation state", () => {
  it("starts with an empty stack", () => {
    expect(initialEntityRelationshipNavigationState.stack).toEqual([]);
  });

  it("pushes the entity being left onto the stack", () => {
    const afterFirst = pushNavigation(initialEntityRelationshipNavigationState, "ent_redbrands");
    const afterSecond = pushNavigation(afterFirst, "ent_glasstaff");

    expect(afterSecond.stack).toEqual(["ent_redbrands", "ent_glasstaff"]);
  });

  it("pops the most recently pushed entity", () => {
    const withHistory = pushNavigation(
      pushNavigation(initialEntityRelationshipNavigationState, "ent_redbrands"),
      "ent_glasstaff",
    );

    const { state, entityId } = popNavigation(withHistory);

    expect(entityId).toBe("ent_glasstaff");
    expect(state.stack).toEqual(["ent_redbrands"]);
  });

  it("returns null and leaves the state untouched when the stack is empty", () => {
    const { state, entityId } = popNavigation(initialEntityRelationshipNavigationState);

    expect(entityId).toBeNull();
    expect(state).toBe(initialEntityRelationshipNavigationState);
  });

  it("resets to an empty stack", () => {
    const withHistory = pushNavigation(initialEntityRelationshipNavigationState, "ent_redbrands");

    expect(resetNavigation().stack).toEqual([]);
    expect(withHistory.stack).toEqual(["ent_redbrands"]); // reset does not mutate the input
  });

  it("treats a change matching the last internal navigation target as internal", () => {
    expect(isExternalEntityChange("ent_glasstaff", "ent_glasstaff")).toBe(false);
  });

  it("treats any other entity change as external", () => {
    expect(isExternalEntityChange("ent_glasstaff", "ent_redbrands")).toBe(true);
    expect(isExternalEntityChange(null, "ent_redbrands")).toBe(true);
  });
});
