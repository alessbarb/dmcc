> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

## Task 5: Cascade-behavior test and test-fixture cleanup fix

**Files:**

- Modify: `tests/setup.ts` (remove the silent `catch {}`; add explicit cleanup for `campaignObjectives`, `campaignClues`, `characters` — these three tables have never been cleaned between tests, a pre-existing gap independent of this plan's cascade FKs, since a mid-test crash before the top-level `campaigns` delete would otherwise leave rows behind even with cascade in place)
- Create: `tests/backend/campaignOwnershipCascade.integration.test.ts`

**Interfaces:**

- Consumes: `schema.campaigns`, `schema.campaignEntities`, `schema.campaignSessions`, `schema.campaignObjectives`, `schema.attachments`, `schema.domainEvents` from `src/backend/db/schema.ts`; `db` from `src/backend/db/client.ts`.
- Produces: nothing consumed by later tasks; this is the last task in the plan.

- [ ] **Step 1: Fix the pre-existing `tests/setup.ts` cleanup gaps**

Current `tests/setup.ts` (lines 1-43):

```typescript
import { beforeEach } from "vitest";
import { db } from "../src/backend/db/client.js";
import { campaignMessageReads, campaignMessages } from "../src/backend/db/messagingSchema.js";
import { playerPortalResources, playerPortalStates } from "../src/backend/db/playerPortalSchema.js";
import * as schema from "../src/backend/db/schema.js";

async function cleanDatabase() {
  try {
    await db.delete(campaignMessageReads);
    await db.delete(campaignMessages);
    await db.delete(schema.activityFeed);
    await db.delete(schema.attachments);
    await db.delete(schema.campaignInvitationAcceptances);
    await db.delete(schema.campaignInvitations);
    await db.delete(schema.campaignNotes);
    await db.delete(schema.playerProposals);
    await db.delete(schema.campaignScenes);
    await db.delete(schema.campaignSessions);
    await db.delete(schema.liveTables);
    await db.delete(playerPortalResources);
    await db.delete(playerPortalStates);
    await db.delete(schema.visibilityGrants);
    await db.delete(schema.campaignRelations);
    await db.delete(schema.campaignFacts);
    await db.delete(schema.campaignEntities);
    await db.delete(schema.campaignSnapshots);
    await db.delete(schema.commandIndex);
    await db.delete(schema.domainEvents);
    await db.delete(schema.playerProfiles);
    await db.delete(schema.dmProfiles);
    await db.delete(schema.campaignMemberships);
    await db.delete(schema.campaigns);
    await db.delete(schema.workspaceMemberships);
    await db.delete(schema.workspaces);
    await db.delete(schema.authSessions);
    await db.delete(schema.userPreferences);
    await db.delete(schema.recoveryCodes);
    await db.delete(schema.passwordResetTokens);
    await db.delete(schema.users);
  } catch {
    // ignore clean errors
  }
}

beforeEach(async () => {
  await cleanDatabase();
});
```

Replace it with:

```typescript
import { beforeEach } from "vitest";
import { db } from "../src/backend/db/client.js";
import { campaignMessageReads, campaignMessages } from "../src/backend/db/messagingSchema.js";
import { playerPortalResources, playerPortalStates } from "../src/backend/db/playerPortalSchema.js";
import * as schema from "../src/backend/db/schema.js";

async function cleanDatabase() {
  await db.delete(campaignMessageReads);
  await db.delete(campaignMessages);
  await db.delete(schema.activityFeed);
  await db.delete(schema.attachments);
  await db.delete(schema.campaignInvitationAcceptances);
  await db.delete(schema.campaignInvitations);
  await db.delete(schema.campaignNotes);
  await db.delete(schema.playerProposals);
  await db.delete(schema.campaignObjectives);
  await db.delete(schema.campaignClues);
  await db.delete(schema.characters);
  await db.delete(schema.campaignScenes);
  await db.delete(schema.campaignSessions);
  await db.delete(schema.liveTables);
  await db.delete(playerPortalResources);
  await db.delete(playerPortalStates);
  await db.delete(schema.visibilityGrants);
  await db.delete(schema.campaignRelations);
  await db.delete(schema.campaignFacts);
  await db.delete(schema.campaignEntities);
  await db.delete(schema.campaignSnapshots);
  await db.delete(schema.commandIndex);
  await db.delete(schema.domainEvents);
  await db.delete(schema.playerProfiles);
  await db.delete(schema.dmProfiles);
  await db.delete(schema.campaignMemberships);
  await db.delete(schema.campaigns);
  await db.delete(schema.workspaceMemberships);
  await db.delete(schema.workspaces);
  await db.delete(schema.authSessions);
  await db.delete(schema.userPreferences);
  await db.delete(schema.recoveryCodes);
  await db.delete(schema.passwordResetTokens);
  await db.delete(schema.users);
}

beforeEach(async () => {
  await cleanDatabase();
});
```

Two changes from the original: (1) the silent `try { ... } catch { /* ignore */ }` is gone — a cleanup failure now throws and fails the test run loudly, instead of leaving the next test to run against a dirty database and fail with a confusing, unrelated-looking error (this is exactly what happened during the PR #116 review session: `campaign_objectives`/`campaign_clues` rows left over from a previous run caused an unrelated-looking unique-constraint failure two tests later); (2) `campaignObjectives`, `campaignClues`, `characters` are now explicitly deleted. They *would* also get cleaned automatically once `db.delete(schema.campaigns)` cascades to them (Tasks 2-4 add exactly that FK), but keep the explicit deletes anyway: `cleanDatabase` is deliberately exhaustive and self-documenting table-by-table, matching every other table in this function, and explicit deletes remain correct as a safety net even if a future change ever narrows `ON DELETE CASCADE` to `RESTRICT` for one of these tables.

Do **not** attempt the "delete only the roots and let cascade handle the rest" simplification in this task — `dm_profiles`, `users`, `workspaces` etc. are not campaign-owned and still need their own explicit deletes, and re-deriving a minimal correct delete order from the new cascade graph is a separate, riskier refactor with its own review; it's out of scope here.

- [ ] **Step 2: Write the cascade-behavior integration test**

```typescript
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";

const ids = {
  owner: "usr_cascade_owner",
  workspace: "wks_cascade",
  campaign: "cmp_cascade",
};

async function seedCampaignWithChildren(): Promise<void> {
  await db.insert(schema.users).values({
    userId: ids.owner,
    emailNormalized: "cascade-owner@example.test",
    emailHash: "cascade-owner",
    displayName: "Owner",
    passwordHash: "hash",
    passwordSalt: "salt",
  });
  await db.insert(schema.workspaces).values({ workspaceId: ids.workspace, name: "Cascade workspace", ownerId: ids.owner });
  await db.insert(schema.campaigns).values({ campaignId: ids.campaign, title: "Cascade campaign", workspaceId: ids.workspace, ownerId: ids.owner });

  await db.insert(schema.domainEvents).values({
    campaignId: ids.campaign,
    sequence: 1,
    eventId: "evt_cascade_1",
    type: "CampaignCreated",
    payload: {},
    occurredAt: new Date().toISOString(),
    actorId: ids.owner,
    hash: "hash1",
    schemaVersion: 1,
  });
  await db.insert(schema.campaignEntities).values({
    campaignId: ids.campaign,
    entityId: "ent_cascade_1",
    type: "npc",
    name: "Cascade NPC",
  });
  await db.insert(schema.campaignSessions).values({
    campaignId: ids.campaign,
    sessionId: "sess_cascade_1",
    number: 1,
    title: "Session one",
  });
  await db.insert(schema.campaignObjectives).values({
    campaignId: ids.campaign,
    objectiveId: "obj_cascade_1",
    title: "Cascade objective",
  });
  await db.insert(schema.attachments).values({
    campaignId: ids.campaign,
    attachmentId: "att_cascade_1",
    name: "map.png",
    path: "/attachments/map.png",
    mimeType: "image/png",
    size: 1024,
  });
}

describe("campaign ownership cascade delete", () => {
  it("removes rows from a representative table in each group when the campaign is deleted", async () => {
    // This is a smoke test, not exhaustive proof: it confirms cascade actually
    // fires end-to-end for one table per migration group (domain_events from
    // Group A, campaign_sessions/campaign_objectives from Group B, attachments
    // from Group C, plus campaign_entities). Full coverage across all 16
    // tables — including that every FK specifically uses CASCADE and not some
    // other delete_rule — is asserted by campaignOwnershipFkAudit.integration.test.ts.
    await seedCampaignWithChildren();

    await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, ids.campaign));

    const [events, entities, sessions, objectives, attachments] = await Promise.all([
      db.select().from(schema.domainEvents).where(eq(schema.domainEvents.campaignId, ids.campaign)),
      db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, ids.campaign)),
      db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, ids.campaign)),
      db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, ids.campaign)),
      db.select().from(schema.attachments).where(eq(schema.attachments.campaignId, ids.campaign)),
    ]);

    expect(events).toHaveLength(0);
    expect(entities).toHaveLength(0);
    expect(sessions).toHaveLength(0);
    expect(objectives).toHaveLength(0);
    expect(attachments).toHaveLength(0);
  });

  it("rejects inserting a campaign-owned row for a campaign that does not exist", async () => {
    await expect(db.insert(schema.campaignEntities).values({
      campaignId: "cmp_does_not_exist",
      entityId: "ent_orphan",
      type: "npc",
      name: "Orphan NPC",
    })).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Run the new test**

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npx vitest run tests/backend/campaignOwnershipCascade.integration.test.ts`
Expected: 2 passing.

- [ ] **Step 4: Run the full backend integration suite**

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npx vitest run tests/backend`

Expected: **the entire suite is green.** If any test fails, do not assume it's pre-existing — prove it, in this order. By this point Tasks 1-4 are already committed (per their own commit steps), so there's nothing left to `git stash` for those changes — compare against the pre-plan commit in an isolated worktree instead:

1. Note the commit this plan started from (the tip of `agent/harden-integrity-authorization` before Task 1's commit — `git log --oneline` to find it, or whatever commit hash you recorded when starting this plan).
2. `git worktree add /tmp/campaign-fk-plan-base <that commit hash>` — creates an isolated checkout at the pre-plan state without touching your current working tree or its uncommitted Task 5 changes.
3. In that worktree, run the same failing test file against the same database (or point it at a freshly migrated disposable database if the schema differences make sharing one unsafe — the pre-plan worktree doesn't have Tasks 2-4's migrations, so it needs a database state that matches, i.e. don't run it against a database that already has migrations `0010`-`0012` applied).
4. If it fails identically there, it's confirmed pre-existing and out of this plan's scope — note the file name and the exact failure in the PR description with this worktree-based evidence, and continue. Do not add a blanket "this file is expected to fail" note without that evidence attached, and do not silently skip or delete the failing test.
5. If it does *not* fail in the pre-plan worktree, treat it as a real regression introduced by this plan — stop and fix it before continuing.
6. `git worktree remove /tmp/campaign-fk-plan-base` when done.

(At the time this plan was written, `tests/backend/campaignMessagingWebRoutes.integration.test.ts` failed on `main` and on this branch identically, confirmed with exactly the stash procedure above during the PR #116 review — see `docs/pr-116-review.md` in this repo for that evidence. That messaging system has since had further changes, so re-verify it fresh with the procedure above rather than trusting that note.)

- [ ] **Step 5: Typecheck, build, and E2E smoke check**

Run: `npm run typecheck:all`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

Run: `npm run test:e2e`
Expected: passes. This is a broad smoke check, not targeted at this plan's changes specifically (Playwright drives the UI, not the schema directly) — if it fails, check whether the failure is pre-existing using the same stash procedure as Step 4 before treating it as caused by this plan.

- [ ] **Step 6: Commit**

```bash
git add tests/backend/campaignOwnershipCascade.integration.test.ts tests/setup.ts
git commit -m "test: verify campaign delete cascades to owned tables; fix silent cleanup failures and stale gaps in tests/setup.ts"
```

---

## Self-Review Notes

- **Spec coverage**: this plan implements exactly "Bloque 1 — propiedad de campaña" from the proposal (point 1, plus the point-10 structural audit scoped to campaign ownership, plus the orphan-visibility and cascade-verification requests raised in review). Points 2-9 (compound FKs for internal references, bridge tables for JSON id arrays, `CASCADE`/`RESTRICT`/`SET NULL` policy per relationship, unified ID strategy, user-player business rules) are Blocks 2-5 of the proposal and are intentionally out of scope for this plan — each is a separate plan given they touch different invariants and carry different risk profiles (Block 2 in particular repeats the compound-FK backfill pattern from PR #116, which already broke default entity creation once when a migration constraint outran a write path — it deserves its own plan and its own careful review of every write path, not a shared plan with Block 1).
- **Placeholder scan**: no TBD/TODO markers; every SQL and TypeScript block is complete and copy-pasteable.
- **Type consistency**: `campaigns.campaignId` (`src/backend/db/schema.ts:60` on this branch) is the referenced column throughout; every `.references()` call points at it by the same name. Table/column names in the audit test (`campaign_id`, `campaigns`) match the actual Postgres identifiers Drizzle generates (snake_case), not the TS camelCase property names — verified against the existing migrations' quoting style.
- **Corrections applied after first review**: (1) `player_proposals` moved from "pending" to "already compliant" — it was fixed by `0009_player_visibility_integrity.sql`, and the original draft's Group C migration would have failed on `ADD CONSTRAINT fk_player_proposals_campaign` colliding with an existing constraint of the same name; (2) counts corrected from 4-already/17-pending to 7-already/16-pending after re-auditing all three schema files (`schema.ts`, `playerPortalSchema.ts`, `messagingSchema.ts`) instead of just `schema.ts` — `player_portal_states`/`player_portal_resources` were also missing from the "already compliant" list in the original draft; (3) the audit test now discovers tables dynamically via `information_schema.columns` instead of asserting against a hardcoded array, and checks `delete_rule = 'CASCADE'` via `information_schema.referential_constraints`, not just FK existence; (4) each migration task gets an explicit orphan-count diagnostic step with an instruction to get sign-off before destroying non-zero rows on a real database; (5) `tests/setup.ts`'s silent `catch { /* ignore */ }` is removed as part of Task 5; (6) migrations are described as "orphan-cleanup is safely re-runnable, `ADD CONSTRAINT` is not" rather than "idempotent"; (7) typecheck steps switched from `npx tsc --noEmit -p .` to the repo's own `npm run typecheck:all`, and Task 5 adds `npm run build` and `npm run test:e2e`.
- **Corrections applied after second review**: (8) the count-floor assertion in Task 1's PostgreSQL audit test was checking `>= 23 - 1 = 22` against a list that had *already* had `"campaigns"` filtered out — off-by-one, fixed to `>= 23` (the constant is now named `BASELINE_CAMPAIGN_OWNED_TABLE_COUNT`, verified by recounting `pgTable(` blocks across `schema.ts` (21, including `campaigns` itself), `playerPortalSchema.ts` (2), and `messagingSchema.ts` (1) = 24 raw rows with a `campaign_id` column, minus 1 for `campaigns` = 23); (9) the PostgreSQL-side FK lookup switched from `LIMIT 1` to fetching every matching constraint and flagging duplicates as a distinct violation, instead of silently picking one nondeterministically; (10) added a second, Drizzle-side `describe` block using `getTableConfig` from `drizzle-orm/pg-core` (verified against the installed version's `foreign-keys.d.ts`/`utils.d.ts` — `ForeignKey.reference()` returns `{ foreignTable, columns, foreignColumns }`, `ForeignKey.onDelete` is a plain string) so a constraint added straight to a migration without a matching `schema.ts` change fails this test too, not just a future manual review; (11) Task 5 Step 4's pre-existing-failure verification switched from `git stash` to a `git worktree` against the pre-plan commit hash, since by Task 5 the schema/migration changes from Tasks 1-4 are already committed and there is nothing left in the working tree to stash; (12) the transactional-migration note in Global Constraints now explains that step-by-step execution runs `db:migrate` once per task (one migration pending, one commit) while only a from-scratch deployment with all three migrations pending at once gets the single-transaction-across-all-three behavior; (13) the "orphan counts verified zero" commit message wording is now conditional on the diagnostic query in Step 1 actually returning zero — a nonzero result requires recording the real counts and the explicit approval instead.
- **Corrections applied after third review**: (14) the Drizzle-side companion test (`findCampaignOwnershipReferences`, previously `hasCampaignOwnershipReference`) switched from `.some(...)` returning a boolean to `.filter(...)` asserted with `toHaveLength(1)`, so a table with two campaign-ownership FKs (one correct, one stray duplicate) or a composite FK that merely includes `campaign_id` among other columns fails instead of passing — mirrors the same exactly-one requirement already enforced on the PostgreSQL side; (15) the `information_schema` joins in `findCampaignForeignKeys` now pin `constraint_catalog`/`constraint_schema`/`constraint_name` (and `table_name` on the `key_column_usage` join) instead of joining on `constraint_name` + `table_schema` alone — `constraint_name` is only unique per schema+table in Postgres, not globally, so the looser join could in principle match a same-named constraint on an unrelated table; (16) Task 1 Step 4 now says to commit locally but hold off pushing the initially-red test until Task 4's commit lands, since this repo may run CI/automation on every push; (17) every "diagnose orphan counts" step now explicitly separates the local/CI database (agent runs this now) from the deployed database (Neon — a separate, human-gated pre-deploy checklist item, not something to run unsupervised against a production connection string).
- **Corrections applied after fourth review**: (18) `findCampaignOwnershipReferences` in the Drizzle-side test from correction (14) still had the same bug in a new location — it filtered candidate FKs down to only the *well-formed* ones (single-column, `campaign_id`, `onDelete === "cascade"`) before counting, so a table with one correct FK plus one malformed duplicate (`NO ACTION`, or a composite FK that happens to include `campaign_id`) would have the bad one silently dropped and still report `toHaveLength(1)` — a real false-green, not just a theoretical one. Fixed by splitting into two steps: `findCampaignOwnershipReferences` now does only the loose match (any FK pointing `campaign_id`-something at `campaigns`, `.some()` not exact-shape), and the test asserts `toHaveLength(1)` on that unfiltered set *before* separately asserting the single surviving candidate's exact shape and `onDelete` value; (19) the `BASELINE_CAMPAIGN_OWNED_TABLE_COUNT` floor check in the PostgreSQL describe block now runs against `discoveredTables` before the `CAMPAIGN_ID_FK_EXCEPTIONS` filter is applied, not after — with the exception set currently empty this made no difference, but once an exception is ever added, checking the floor post-filter would shrink the expected minimum for the wrong reason (an intentionally-excused table, not a broken discovery query) and mask a real regression in the discovery query itself.
