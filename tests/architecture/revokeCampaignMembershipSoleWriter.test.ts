import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../..");
const SCAN_ROOT = join(REPOSITORY_ROOT, "src/backend");
const ALLOWED_FILES = new Set([
  join(SCAN_ROOT, "server/campaignMembership/revokeCampaignMembership.ts"),
]);

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(absolutePath);
    return entry.name.endsWith(".ts") ? [absolutePath] : [];
  });
}

describe("revokeCampaignMembership is the sole writer of campaign_memberships.revoked_at", () => {
  it("no other file under src/backend sets revokedAt on campaignMemberships", () => {
    const offenders: string[] = [];

    for (const filePath of listFiles(SCAN_ROOT)) {
      if (ALLOWED_FILES.has(filePath)) continue;
      if (statSync(filePath).isSymbolicLink()) continue;

      const source = readFileSync(filePath, "utf8");
      // Look for an actual write statement against the membership table
      // (`.update(...campaignMemberships)` or a raw `UPDATE campaign_memberships`)
      // with `revokedAt`/`revoked_at` set within the same statement, not just
      // co-occurring anywhere in the file — files that create memberships and
      // separately revoke an unrelated table (e.g. campaign_invitations) must
      // not false-positive here.
      const updateMembershipPattern = /update\s*\(\s*(?:schema\.)?campaignMemberships\s*\)[\s\S]{0,200}?revoked_?[Aa]t/;
      const rawSqlPattern = /UPDATE\s+campaign_memberships[\s\S]{0,200}?revoked_at/i;
      if (updateMembershipPattern.test(source) || rawSqlPattern.test(source)) {
        offenders.push(filePath.replace(REPOSITORY_ROOT + "/", ""));
      }
    }

    expect(offenders).toEqual([]);
  });
});
