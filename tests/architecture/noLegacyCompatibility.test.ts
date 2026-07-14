import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { createServer } from "../../src/backend/server/createServer.js";

// Paths to scan
const SCAN_PATHS = [
  "src",
  "scripts",
  "e2e",
  "public/campaign-templates",
  "package.json",
  "drizzle.config.ts",
  ".env.example",
  ".env.development.example"
];

// Absolute forbidden tokens (cannot exist in any file)
const FORBIDDEN_TOKENS = [
  "setupDmAccount",
  "DmSetupPage",
  "DmLoginPage",
  "accountConfigured",
  "ensurePostLegacySchemaCompatibility",
  "vault_id",
  "vault_role",
  "appRole",
  "app_role",
  "workspacePartitionId",
  "workspace_partition_id",
  "raw?.projection ?? raw",
  "canvasId ?? id",
  "passwordSalt",
  "passwordAlgorithm",
  "verifySecret",
  "hashSecret",
  "scryptAsync",
  "x-role",
  "x-player-id",
  "x-dm-token",
  "x-player-token",
  "x-access-code",
  "lanModeEnabled",
  "localAccessCode",
  "localAccessCodeHash",
  "backupOnClose",
  "generic_fantasy_d20",
  "dnd_srd_5_2_1"
];

// Excluded files/folders from the text scan
const EXCLUDED_PATHS = [
  "src/backend/db/migrations",
  "tests/architecture/noLegacyCompatibility.test.ts"
];

function getFiles(dir: string): string[] {
  let results: string[] = [];
  let list;
  try {
    list = readdirSync(dir);
  } catch {
    return [dir]; // It's a file
  }

  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

describe("Architecture Test — No Legacy Compatibility Allowed", () => {
  it("verifies absolute absence of legacy/deprecated tokens in the codebase", () => {
    const violations: string[] = [];

    // Resolve all files to scan
    const allFiles: string[] = [];
    for (const scanPath of SCAN_PATHS) {
      const resolvedScanPath = resolve(scanPath);
      const files = getFiles(resolvedScanPath);
      allFiles.push(...files);
    }

    const resolvedExclusions = EXCLUDED_PATHS.map((p) => resolve(p));

    for (const filePath of allFiles) {
      // Check if file is inside an excluded path
      const isExcluded = resolvedExclusions.some((exclusion) => filePath.startsWith(exclusion));
      if (isExcluded) continue;

      const content = readFileSync(filePath, "utf-8");

      for (const token of FORBIDDEN_TOKENS) {
        if (content.includes(token)) {
          violations.push(`${filePath}: contains forbidden token "${token}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("verifies that legacy HTTP routes return 404 Not Found", async () => {
    const server = createServer();

    const routesToTest = [
      "/dm/login",
      "/dm/setup",
      "/api/premade-campaigns"
    ];

    for (const route of routesToTest) {
      const response = await server.inject({
        method: "GET",
        url: route,
      });

      expect(response.statusCode).toBe(404);
    }

    await server.close();
  });
});
