import { describe, it, expect } from "vitest";
import { parseQuickCapture } from "../../../../src/frontend/dm/sessions/capture/parseQuickCapture.js";

describe("parseQuickCapture", () => {
  it("treats bare text with no leading '+' as a note", () => {
    expect(parseQuickCapture("The party enters the tavern")).toEqual({
      kind: "note",
      text: "The party enters the tavern",
    });
  });

  it("returns note for empty input", () => {
    expect(parseQuickCapture("")).toEqual({ kind: "note", text: "" });
  });

  it("trims surrounding whitespace before dispatching on the command", () => {
    expect(parseQuickCapture("   +nota   dragon spotted   ")).toEqual({
      kind: "note",
      text: "dragon spotted",
    });
  });

  for (const alias of ["+nota", "+note", "+n", "+h"]) {
    it(`parses the ${alias} note alias`, () => {
      expect(parseQuickCapture(`${alias} left a note`)).toEqual({
        kind: "note",
        text: "left a note",
      });
    });
  }

  for (const alias of ["+pnj", "+npc"]) {
    it(`parses the ${alias} npc alias with name and role`, () => {
      expect(parseQuickCapture(`${alias} Mira | Innkeeper`)).toEqual({
        kind: "npc",
        name: "Mira",
        role: "Innkeeper",
      });
    });
  }

  it("parses an npc alias with no role segment", () => {
    expect(parseQuickCapture("+pnj Mira")).toEqual({
      kind: "npc",
      name: "Mira",
      role: "",
    });
  });

  for (const alias of ["+decision", "+d"]) {
    it(`parses the ${alias} decision alias`, () => {
      expect(parseQuickCapture(`${alias} they open the door`)).toEqual({
        kind: "decision",
        text: "they open the door",
      });
    });
  }

  for (const alias of ["+consecuencia", "+consequence", "+c"]) {
    it(`parses the ${alias} consequence alias`, () => {
      expect(parseQuickCapture(`${alias} the alarm is raised`)).toEqual({
        kind: "consequence",
        text: "the alarm is raised",
      });
    });
  }

  for (const alias of ["+pista", "+clue", "+reveal"]) {
    it(`parses the ${alias} clue alias with no body`, () => {
      expect(parseQuickCapture(alias)).toEqual({ kind: "clue" });
    });

    it(`is case-insensitive for the ${alias} clue alias`, () => {
      expect(parseQuickCapture(alias.toUpperCase())).toEqual({ kind: "clue" });
    });
  }

  it("returns unknown for an unrecognized '+' command", () => {
    expect(parseQuickCapture("+bogus something")).toEqual({ kind: "unknown" });
  });

  it("returns unknown for a bare '+' with no command", () => {
    expect(parseQuickCapture("+")).toEqual({ kind: "unknown" });
  });
});
