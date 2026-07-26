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

  // M5 (UX audit 2026-07-26): "hace 1 semanas" — the plural-only string was
  // used even when count was exactly 1 (also affected hours/days).
  it("uses the singular form when the count is exactly one", () => {
    const now = Date.now();
    expect(formatRelativeTime(new Date(now - 1 * 3_600_000), "es")).toBe("hace 1 hora");
    expect(formatRelativeTime(new Date(now - 1 * 86_400_000), "es")).toBe("hace 1 día");
    expect(formatRelativeTime(new Date(now - 7 * 86_400_000), "es")).toBe("hace 1 semana");

    expect(formatRelativeTime(new Date(now - 1 * 3_600_000), "en")).toBe("1 hour ago");
    expect(formatRelativeTime(new Date(now - 1 * 86_400_000), "en")).toBe("1 day ago");
    expect(formatRelativeTime(new Date(now - 7 * 86_400_000), "en")).toBe("1 week ago");
  });

  it("still uses the plural form for counts other than one", () => {
    const now = Date.now();
    expect(formatRelativeTime(new Date(now - 3 * 3_600_000), "es")).toBe("hace 3 horas");
    expect(formatRelativeTime(new Date(now - 2 * 86_400_000), "es")).toBe("hace 2 días");
    expect(formatRelativeTime(new Date(now - 14 * 86_400_000), "es")).toBe("hace 2 semanas");
  });
});
