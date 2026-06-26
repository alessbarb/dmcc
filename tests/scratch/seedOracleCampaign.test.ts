import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const contentModules = [
  "campaign",
  "characters",
  "locations",
  "factions",
  "npcs",
  "quests",
  "clues",
  "secrets",
  "relations",
  "facts",
  "verify",
];

const seedFiles = [
  "scratch/seed-oracle-campaign.ts",
  "scratch/oracle-seed/config.ts",
  "scratch/oracle-seed/client.ts",
  "scratch/oracle-seed/ids.ts",
  "scratch/oracle-seed/content.ts",
  ...contentModules.map((name) => `scratch/oracle-seed/${name}.ts`),
];

const readRepoFile = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const entrySource = readRepoFile("scratch/seed-oracle-campaign.ts");
const seedSource = seedFiles.map(readRepoFile).join("\n");

describe("oracle campaign seed", () => {
  it("is split into a small entrypoint and focused modules", () => {
    expect(entrySource.split(/\r?\n/).length).toBeLessThan(80);
    expect(entrySource).toContain("./oracle-seed/client.ts");
    expect(entrySource).toContain("./oracle-seed/content.ts");
  });


  it("keeps seed content split by editable typology", () => {
    const barrelSource = readRepoFile("scratch/oracle-seed/content.ts");
    expect(barrelSource.split(/\r?\n/).length).toBeLessThan(30);
    for (const moduleName of contentModules) {
      expect(barrelSource).toContain(`./${moduleName}.ts`);
      expect(readRepoFile(`scratch/oracle-seed/${moduleName}.ts`)).toContain("Generated seed content module");
    }
  });

  it("does not pre-create DM sessions", () => {
    expect(seedSource).toContain("Sessions are intentionally not seeded");
    expect(seedSource).toContain("Seed must not create sessions");
    expect(seedSource).not.toMatch(/function\s+seedSessions/);
    expect(seedSource).not.toMatch(/await\s+seedSessions\s*\(/);
    expect(seedSource).not.toMatch(/\bSESS_/);
    expect(seedSource).not.toMatch(/\/api\/campaigns\/\$\{CMP\}\/sessions/);
  });

  it("keeps destructive replace mode behind explicit confirmation", () => {
    expect(seedSource).toContain('MODE === "replace"');
    expect(seedSource).toContain("DMCC_SEED_CONFIRM");
    expect(seedSource).toContain("confirmTitle");
  });
});
