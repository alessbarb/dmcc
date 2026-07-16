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

  it("defines the previously implicit fifth spacing step", () => {
    const tokens = read("src/frontend/shared/styles/tokens.css");
    expect(tokens).toContain("--space-5: 1.25rem");
    expect(tokens).not.toContain("var(--space-5, 1.25rem)");
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
