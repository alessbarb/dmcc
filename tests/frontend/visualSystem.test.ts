import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

function frontendSourceFiles(directory = resolve(root, "src/frontend")): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    if (statSync(path).isDirectory()) return frontendSourceFiles(path);
    return [".css", ".ts", ".tsx"].includes(extname(path)) ? [path] : [];
  });
}

const RETIRED_THEME_TOKENS = [
  "--bg-abyss", "--bg-mist", "--bg-tomb", "--bg-main", "--bg-card", "--bg-card-hover", "--bg-input",
  "--surface-raised", "--surface-hover", "--surface-glass",
  "--accent-fire", "--accent-fire-hover", "--accent-fire-soft", "--accent-amethyst", "--accent-amethyst-soft",
  "--text-primary", "--text-secondary", "--text-subtle", "--text-inverse", "--text-main", "--text-muted",
  "--border-color", "--border-hover", "--primary", "--primary-hover", "--primary-light", "--secondary", "--secondary-hover",
  "--semantic-secret", "--semantic-rumor", "--semantic-canon", "--semantic-theory", "--semantic-consequence",
  "--semantic-success", "--semantic-warning", "--semantic-danger", "--semantic-info",
  "--color-critical", "--color-warning", "--color-success", "--color-info",
  "--radius-sm", "--radius-md", "--radius-lg", "--radius-narrative", "--radius-full",
  "--shadow-sm", "--shadow-md", "--shadow-lg", "--shadow-primary", "--focus-ring",
] as const;

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

  it("keeps structural tokens separate from runtime theme values", () => {
    const tokens = read("src/frontend/shared/styles/tokens.css");
    expect(tokens).toContain("--space-5: 1.25rem");
    expect(tokens).toContain("--touch-target-min: 44px");
    expect(tokens).not.toContain("Theme v1 bridge");
    expect(tokens).not.toContain("Temporary aliases");
    for (const retiredToken of RETIRED_THEME_TOKENS) {
      expect(tokens, retiredToken).not.toContain(retiredToken);
    }
  });

  it("uses only the v1 theme vocabulary throughout frontend consumers", () => {
    const offenders: string[] = [];
    for (const path of frontendSourceFiles()) {
      const source = readFileSync(path, "utf8");
      for (const retiredToken of RETIRED_THEME_TOKENS) {
        if (source.includes(retiredToken)) {
          offenders.push(`${relative(root, path)} -> ${retiredToken}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("uses the runtime contract in shared primitives", () => {
    const primitives = read("src/frontend/shared/styles/primitives.css");
    expect(primitives).toContain("var(--theme-surfaces-base)");
    expect(primitives).toContain("var(--theme-borders-default)");
    expect(primitives).toContain("var(--theme-text-primary)");
    expect(primitives).toContain("var(--theme-feedback-danger-foreground)");
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

  it("loads structural tokens before primitives and module styles", () => {
    const styles = read("src/frontend/shared/styles/index.css");
    const tokensIndex = styles.indexOf('@import "./tokens.css"');
    const primitivesIndex = styles.indexOf('@import "./primitives.css"');
    expect(tokensIndex).toBe(0);
    expect(primitivesIndex).toBeGreaterThan(tokensIndex);
  });
});
