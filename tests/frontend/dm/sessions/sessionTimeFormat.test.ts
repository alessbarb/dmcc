import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatElapsed, formatRelative } from "../../../../src/frontend/dm/sessions/sessionTimeFormat.js";

const NOW = new Date("2026-07-15T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatElapsed", () => {
  it("returns an em-dash placeholder when there is no start time", () => {
    expect(formatElapsed(undefined)).toBe("—");
  });

  it("formats sub-hour durations as minutes only", () => {
    const startedAt = new Date(NOW.getTime() - 25 * 60_000).toISOString();
    expect(formatElapsed(startedAt)).toBe("25m");
  });

  it("formats multi-hour durations as hours and minutes", () => {
    const startedAt = new Date(NOW.getTime() - (2 * 60 + 15) * 60_000).toISOString();
    expect(formatElapsed(startedAt)).toBe("2h 15m");
  });
});

describe("formatRelative", () => {
  const t = (key: string, values?: Record<string, string | number>) =>
    values ? `${key}:${JSON.stringify(values)}` : key;

  it("reports 'now' for anything under a minute old", () => {
    const isoDate = new Date(NOW.getTime() - 30_000).toISOString();
    expect(formatRelative(isoDate, t)).toBe("sessionPage.relativeNow");
  });

  it("reports elapsed minutes under an hour", () => {
    const isoDate = new Date(NOW.getTime() - 42 * 60_000).toISOString();
    expect(formatRelative(isoDate, t)).toBe('sessionPage.relativeMinutes:{"count":42}');
  });

  it("reports elapsed hours once past 60 minutes", () => {
    const isoDate = new Date(NOW.getTime() - 3 * 60 * 60_000).toISOString();
    expect(formatRelative(isoDate, t)).toBe('sessionPage.relativeHours:{"count":3}');
  });
});
