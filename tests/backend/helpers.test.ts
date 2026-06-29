import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { assertWithinDir, isPathWithinDir } from "../../src/backend/server/helpers.js";

describe("path containment helpers", () => {
  it("accepts child paths on the current platform", () => {
    const root = path.join("tmp", "dmcc", "vaults", "default", "campaigns");
    const child = path.join(root, "cmp_123", "events.ndjson");

    expect(isPathWithinDir(child, root)).toBe(true);
    expect(() => assertWithinDir(child, root)).not.toThrow();
  });

  it("accepts Windows child paths with backslash separators", () => {
    const root = String.raw`C:\Users\alice\Documents\DMCampaignCompanion\vaults\default\campaigns`;
    const child = String.raw`C:\Users\alice\Documents\DMCampaignCompanion\vaults\default\campaigns\cmp_123\events.ndjson`;

    expect(isPathWithinDir(child, root, path.win32)).toBe(true);
  });

  it("rejects Windows path traversal outside the allowed directory", () => {
    const root = String.raw`C:\Users\alice\Documents\DMCampaignCompanion\vaults\default\campaigns`;
    const outside = String.raw`C:\Users\alice\Documents\DMCampaignCompanion\vaults\default\evil\events.ndjson`;

    expect(isPathWithinDir(outside, root, path.win32)).toBe(false);
  });

  it("rejects similarly-prefixed sibling directories", () => {
    const root = "/tmp/dmcc/vaults/default/campaigns";
    const sibling = "/tmp/dmcc/vaults/default/campaigns-old/cmp_123";

    expect(isPathWithinDir(sibling, root, path.posix)).toBe(false);
  });
});
