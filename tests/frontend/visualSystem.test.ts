import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Modern Dark Narrative visual system", () => {
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

  it("defines semantic tokens, compatibility aliases, and one touch target", () => {
    const tokens = read("src/frontend/shared/styles/tokens.css");
    for (const token of [
      "--bg-abyss",
      "--bg-mist",
      "--bg-tomb",
      "--accent-fire",
      "--accent-fire-hover",
      "--accent-amethyst",
      "--semantic-secret",
      "--semantic-rumor",
      "--semantic-canon",
      "--semantic-theory",
      "--semantic-consequence",
      "--touch-target-min",
      "--bg-main",
      "--bg-card",
      "--bg-input",
      "--primary",
      "--secondary",
    ]) {
      expect(tokens).toContain(token);
    }
    expect(tokens.match(/--touch-target-min\s*:/g)).toHaveLength(1);
  });

  it("loads tokens before primitives and previous surface rules", () => {
    const styles = read("src/frontend/shared/styles/index.css");
    const tokensIndex = styles.indexOf('@import "./tokens.css"');
    const primitivesIndex = styles.indexOf('@import "./primitives.css"');
    expect(tokensIndex).toBe(0);
    expect(primitivesIndex).toBeGreaterThan(tokensIndex);
  });
});
