import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "../../src/frontend/shared/presentation/formatRelativeTime.js";

describe("formatRelativeTime", () => {
  it("returns empty string for missing input", () => {
    expect(formatRelativeTime(null)).toBe("");
    expect(formatRelativeTime(undefined)).toBe("");
  });

  it("returns empty string for an invalid date", () => {
    expect(formatRelativeTime("not-a-date")).toBe("");
  });

  it("formats seconds/minutes/hours/days/weeks ago", () => {
    const now = Date.now();
    expect(formatRelativeTime(new Date(now - 5_000), "en")).toBe("just now");
    expect(formatRelativeTime(new Date(now - 5 * 60_000), "en")).toBe("5 min ago");
    expect(formatRelativeTime(new Date(now - 3 * 3_600_000), "en")).toBe("3 hours ago");
    expect(formatRelativeTime(new Date(now - 2 * 86_400_000), "en")).toBe("2 days ago");
    expect(formatRelativeTime(new Date(now - 14 * 86_400_000), "en")).toBe("2 weeks ago");
  });

  it("clamps future dates to the present instead of producing a negative/garbled value", () => {
    const future = new Date(Date.now() + 60_000);
    expect(formatRelativeTime(future, "en")).toBe("just now");
  });
});
