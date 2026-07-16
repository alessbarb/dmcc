import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("theme-backed visual system", () => {
  it("loads local display and interface fonts with their licenses", () => {
    expect(existsSync(resolve(root, "public/fonts/cinzel-latin.woff2"))).toBe(true);
    expect(existsSync(resolve(root, "public/fonts/outfit-latin.woff2"))).toBe(true);
    expect(existsSync(resolve(root, "public/fonts/LICENSE-Cinzel.txt"))).toBe(true);
    expect(existsSync(resolve(root, "public/fonts/LICENSE-Outfit.txt"))).toBe(true);

    const tokens = read("src/frontend/shared/styles/tokens.css");
    expect(tokens).toContain('font-family: "Cinzel"');
    expect(tokens).toContain('font-family: "Outfit"');
    expect(tokens.match(/font-display:\s*swap/g)).toHaveLength(2);

    const html = read("index.html");
    expect(html).toContain('href="/fonts/cinzel-latin.woff2"');
    expect(html).toContain('href="/fonts/outfit-latin.woff2"');
  });

  it("bridges existing consumers to the v1 runtime tokens", () => {
    const tokens = read("src/frontend/shared/styles/tokens.css");
    for (const mapping of [
      "--bg-abyss: var(--theme-surfaces-canvas",
      "--bg-mist: var(--theme-surfaces-base",
      "--accent-fire: var(--theme-accents-primary-foreground",
      "--text-primary: var(--theme-text-primary",
      "--semantic-danger: var(--theme-feedback-danger-foreground",
      "--entity-player: var(--theme-entities-player-foreground",
      "--radius-md: var(--theme-shapes-radius-medium",
      "--shadow-md: var(--theme-shadows-medium",
      "--bg-main: var(--theme-surfaces-canvas",
      "--primary: var(--theme-accents-primary-foreground",
    ]) {
      expect(tokens).toContain(mapping);
    }
    expect(tokens.match(/--touch-target-min\s*:/g)).toHaveLength(1);
  });

  it("uses only the v1 theme vocabulary in shared primitives", () => {
    const primitives = read("src/frontend/shared/styles/primitives.css");
    for (const retiredReference of [
      "var(--bg-",
      "var(--surface-",
      "var(--accent-",
      "var(--text-main",
      "var(--text-muted",
      "var(--text-primary",
      "var(--text-secondary",
      "var(--text-subtle",
      "var(--semantic-",
      "var(--border-color",
      "var(--border-hover",
      "var(--radius-",
      "var(--shadow-",
      "var(--focus-ring",
      "var(--primary",
      "var(--secondary",
    ]) {
      expect(primitives).not.toContain(retiredReference);
    }
    expect(primitives).toContain("var(--theme-surfaces-base)");
    expect(primitives).toContain("var(--theme-borders-default)");
    expect(primitives).toContain("var(--theme-text-primary)");
  });

  it("defines the previously implicit fifth spacing step", () => {
    const tokens = read("src/frontend/shared/styles/tokens.css");
    expect(tokens).toContain("--space-5: 1.25rem");
  });

  it("lets runtime preferences and the operating system reduce motion", () => {
    const primitives = read("src/frontend/shared/styles/primitives.css");
    expect(primitives).toContain("@media (prefers-reduced-motion: reduce)");
    expect(primitives).toContain(':root[data-reduced-motion="true"] *');
  });

  it("lets the resolved runtime mode control native color scheme", () => {
    const tokens = read("src/frontend/shared/styles/tokens.css");
    expect(tokens).toContain(':root[data-color-mode="dark"]');
    expect(tokens).toContain("color-scheme: dark");
    expect(tokens).toContain(':root[data-color-mode="light"]');
    expect(tokens).toContain("color-scheme: light");
  });

  it("loads tokens before primitives and previous surface rules", () => {
    const styles = read("src/frontend/shared/styles/index.css");
    const tokensIndex = styles.indexOf('@import "./tokens.css"');
    const primitivesIndex = styles.indexOf('@import "./primitives.css"');
    expect(tokensIndex).toBe(0);
    expect(primitivesIndex).toBeGreaterThan(tokensIndex);
  });
});
