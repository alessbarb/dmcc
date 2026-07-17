import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const auditSource = readFileSync(
  new URL("../../scripts/styles/auditStyles.mjs", import.meta.url),
  "utf8",
);
const configSource = readFileSync(
  new URL("../../scripts/styles/styleAuditConfig.mjs", import.meta.url),
  "utf8",
);
const architecture = readFileSync(
  new URL("../../docs/architecture/style-system.md", import.meta.url),
  "utf8",
);

describe("style audit architecture", () => {
  it("detects the required style debt categories", () => {
    for (const category of [
      "literal-color",
      "static-inline",
      "unknown-token",
      "legacy-token",
      "orphan-css",
      "mixed-responsibility",
      "cross-component-selector",
      "important",
    ]) {
      expect(auditSource).toContain(category);
    }
  });

  it("keeps literal colors restricted to registered theme packages", () => {
    expect(configSource).toContain("defaultTheme");
    expect(configSource).toContain("fantasyTheme");
    expect(configSource).toContain("sciFiTheme");
  });

  it("documents the boundary between shared and component styles", () => {
    expect(architecture).toContain("Global ownership");
    expect(architecture).toContain("Local ownership");
    expect(architecture).toContain("Local styles must consume global tokens and primitives");
  });

  it("implements a baseline ratchet rather than silently rewriting it", () => {
    expect(auditSource).toContain("Style audit ratchet failed");
    expect(auditSource).toContain("--update-baseline");
    expect(auditSource).toContain("--check");
  });
});
