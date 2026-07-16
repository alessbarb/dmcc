import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("account profile write contracts", () => {
  const source = readFileSync("src/backend/server/web/routes/accountWebRoutes.ts", "utf8");

  it("normalizes public handles before storing or resolving them", () => {
    expect(source).toContain("function normalizePublicHandle");
    expect(source).toContain('raw.replace(/^@+/, "").toLowerCase()');
    expect(source).toContain("await assertPublicHandleAvailable(publicHandle");
    expect(source).not.toContain("publicHandle: body.publicHandle ?? null");
  });

  it("uses optimistic concurrency for DM and player profile updates", () => {
    expect(source).toContain("expectedProfileVersion(body.version)");
    expect(source).toContain("Profile was modified by another request");
    expect(source).toContain("eq(schema.dmProfiles.version, existing.version)");
    expect(source).toContain("eq(schema.playerProfiles.version, current.version)");
    expect(source).not.toContain("onConflictDoUpdate({ target: schema.dmProfiles.userId");
  });
});
