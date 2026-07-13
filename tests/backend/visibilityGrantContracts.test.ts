import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const migrationPath = join(ROOT, "src/backend/db/migrations/0008_visibility_grant_identity.sql");
const knowledgeProjectionPath = join(ROOT, "src/backend/server/web/playerKnowledgeProjection.ts");
const characterLinkRoutesPath = join(ROOT, "src/backend/server/web/routes/playerCharacterLinkWebRoutes.ts");
const characterProposalRoutesPath = join(ROOT, "src/backend/server/web/routes/playerCharacterProposalWebRoutes.ts");

describe("canonical visibility grant identity", () => {
  it("supports independent common, player and user grants", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain('CREATE UNIQUE INDEX "uq_visibility_grants_common"');
    expect(migration).toContain('CREATE UNIQUE INDEX "uq_visibility_grants_specific_player"');
    expect(migration).toContain('CREATE UNIQUE INDEX "uq_visibility_grants_specific_user"');
    expect(migration).toContain('WHERE "scope" = \'specific_player\'');
    expect(migration).toContain('WHERE "scope" = \'specific_user\'');
  });

  it("normalizes legacy encoded scopes before adding constraints", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("WHERE \"scope\" LIKE 'specific_player:%'");
    expect(migration).toContain("WHERE \"scope\" LIKE 'specific_user:%'");
    expect(migration).toContain('SET "player_id" = NULL\nWHERE "scope" = \'specific_user\'');
    expect(migration).toContain('SET "user_id" = NULL\nWHERE "scope" = \'specific_player\'');
    expect(migration).toContain('ADD CONSTRAINT "chk_visibility_grants_principal"');
  });

  it("writes canonical specific-player grants without encoding the principal in scope", () => {
    const projection = readFileSync(knowledgeProjectionPath, "utf8");

    expect(projection).toContain('"specific_player", playerId');
    expect(projection).not.toContain("function specificPlayerScope");
    expect(projection).not.toContain("await insertGrant(campaignId, \"entity\", targetId, specificPlayerScope");
  });

  it("does not upsert character grants against the removed four-column key", () => {
    const linkRoutes = readFileSync(characterLinkRoutesPath, "utf8");
    const proposalRoutes = readFileSync(characterProposalRoutesPath, "utf8");

    for (const source of [linkRoutes, proposalRoutes]) {
      expect(source).toContain('scope: "specific_user"');
      expect(source).toContain("playerId: null");
      expect(source).toContain(".onConflictDoNothing()");
      expect(source).not.toContain("schema.visibilityGrants.scope,\n      ],");
    }
  });

  it("removes only the linked user's character grant", () => {
    const linkRoutes = readFileSync(characterLinkRoutesPath, "utf8");

    expect(linkRoutes).toContain("eq(schema.visibilityGrants.userId, profile.userId)");
  });
});
