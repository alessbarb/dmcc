import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const source = readFileSync(join(ROOT, "src/frontend/SmartLanding.tsx"), "utf8");

describe("SmartLanding current contracts", () => {
  it("uses registered player portal translation keys", () => {
    expect(source).toContain('t("playerPortal.tabs.constellation")');
    expect(source).toContain('t("playerPortal.messaging.heading")');
    expect(source).not.toContain("playerPortal.constellation.heading");
    expect(source).not.toContain("playerPortal.constellation.description");
    expect(source).not.toContain("playerPortal.empty.noSharedConstellation");
    expect(source).not.toContain("playerPortal.messaging.title");
  });

  it("uses the current CampaignCanvasFlow API", () => {
    expect(source).toContain("canvasId={activeCanvas.id}");
    expect(source).toContain("onClearSelection={() =>");
    expect(source).toContain("onModeChange={setInteractionMode}");
    expect(source).toContain("onLockChange={setLocked}");
    expect(source).not.toContain("onCanvasChange=");
    expect(source).not.toContain("onInteractionModeChange=");
    expect(source).not.toContain("onLockedChange=");
  });

  it("does not pass children to the decorative background", () => {
    expect(source).not.toContain("<RpgPortalBackground>");
    expect(source).toContain("<RpgPortalBackground />");
  });

  it("constructs a complete signed-out auth status", () => {
    expect(source).toContain("accountConfigured: false");
    expect(source).toContain("sessionValid: false");
    expect(source).toContain("user: null");
    expect(source).not.toContain("as AuthStatus");
  });
});
