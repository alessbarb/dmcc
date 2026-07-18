import { describe, expect, it } from "vitest";
import { narrativeChangeContextSchema } from "../../src/core/domain/shared/narrativeChangeContext.js";

describe("narrativeChangeContextSchema", () => {
  it("accepts a manual context without a sessionId", () => {
    expect(() => narrativeChangeContextSchema.parse({ origin: "manual" })).not.toThrow();
  });

  it("requires sessionId when origin is session_live", () => {
    expect(() => narrativeChangeContextSchema.parse({ origin: "session_live" })).toThrow();
    expect(() =>
      narrativeChangeContextSchema.parse({ origin: "session_live", sessionId: "sess_1" }),
    ).not.toThrow();
  });

  it("requires sessionId when origin is session_reconciliation", () => {
    expect(() =>
      narrativeChangeContextSchema.parse({ origin: "session_reconciliation" }),
    ).toThrow();
  });
});
