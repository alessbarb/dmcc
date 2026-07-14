import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ROUTER_PATH = join(REPOSITORY_ROOT, "src/frontend/router.tsx");
const OLD_GRAPH_DIR = join(REPOSITORY_ROOT, "src/frontend/dm/graph");

describe("Red 2D route contract", () => {
  it("does not register a /graph route in the router", () => {
    const source = readFileSync(ROUTER_PATH, "utf8");
    expect(source).not.toMatch(/path:\s*"\/graph"/);
    expect(source).not.toContain("GraphPage");
    expect(source).not.toContain("react-force-graph-3d");
  });

  it("has no leftover 3D graph module directory", () => {
    expect(existsSync(OLD_GRAPH_DIR)).toBe(false);
  });

  it("has removed the 3D graph packages from package.json", () => {
    const pkg = JSON.parse(readFileSync(join(REPOSITORY_ROOT, "package.json"), "utf8"));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps).not.toHaveProperty("react-force-graph-3d");
    expect(allDeps).not.toHaveProperty("three-spritetext");
    expect(allDeps).not.toHaveProperty("three");
  });

  it("registers /map/network as the Red 2D route", () => {
    const source = readFileSync(ROUTER_PATH, "utf8");
    expect(source).toMatch(/path:\s*"\/network"/);
    expect(source).toContain("NetworkView");
  });
});
