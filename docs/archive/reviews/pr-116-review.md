> Archived historical PR review artifact.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# PR #116 Review — Harden Integrity & Authorization

Branch: `agent/harden-integrity-authorization` vs `main`. Second pass, after
resolving the findings from the first review. No open findings remain.

## Fixed since first review

### 1. Critical: default (`dm_only`) entity/fact/relation creation was broken

`0008_visibility_grant_identity.sql` added `chk_visibility_grants_scope`
(`scope IN ('public','all_players','specific_player','specific_user')`) and
`chk_visibility_grants_principal`, but `postgresCampaignRepository.ts`
(`upsertVisibilityGrant`, line ~681) still fell through to an unconditional
insert with `scope = 'dm_only'` for the default/no-op case. Since `dm_only` is
the project-wide default visibility (`CLAUDE.md`: "All new content defaults to
`dm_only` visibility"), every `EntityCreated`/default-visibility `FactCreated`/
relation event hit a check-constraint violation and rolled back the whole
write transaction — i.e. creating an NPC with default visibility failed.

**Fix**: `upsertVisibilityGrant` now only inserts a row for `public` or
`all_players` scope; `dm_only` (and any `specific_player`/`specific_user` call
that couldn't resolve a concrete id) results in no row at all — consistent
with the new canonical-policy model where "no grant" already means "hidden by
default".

**Verified**: reproduced the failure with a scoped repro (`CreateEntity`
command, default visibility, against a local Postgres instance) — it threw
`chk_visibility_grants_principal` violation before the fix and now commits
cleanly with zero grant rows written. Confirmed with `tsc --noEmit` (clean)
and the full `tests/backend` integration suite (`visibilityGrants`,
`playerVisibilityIntegrity`, `authHardening`, `productionCsp` — 14/14 passing).

### 2. Moderate: unconditional `DELETE FROM visibility_grants` wiped valid data

The migration started with a blanket `DELETE FROM "visibility_grants";`
before adding the new constraints, discarding *every* existing grant — including
legitimate `specific_player`/`specific_user` shares that have no other source
of truth (public/`all_players` visibility is re-derivable from campaign state,
but per-player/per-user shares are not).

**Fix**: replaced the blanket delete with a scoped one that only removes rows
the new constraints would reject:

```sql
DELETE FROM "visibility_grants"
WHERE NOT (
  ("scope" = 'specific_player' AND "player_id" IS NOT NULL AND "user_id" IS NULL)
  OR ("scope" = 'specific_user' AND "user_id" IS NOT NULL AND "player_id" IS NULL)
  OR ("scope" IN ('public', 'all_players') AND "user_id" IS NULL AND "player_id" IS NULL)
);
```

Existing well-formed grants now survive the migration; only `dm_only` and
malformed rows (which would violate the new checks anyway) are dropped.

### 3. Minor: dead/misleading `grantAllowsPlayer` export

`playerKnowledgeProjection.ts` kept exporting `grantAllowsPlayer` after the
refactor to `buildKnowledgeAccessIndex`/`playerCanAccessKnowledge`. It had no
production caller left and, worse, no longer handled `public`/`all_players`
scopes — a future caller reusing it by name would silently get wrong results
for those two scopes.

**Fix**: removed the function; the one test that used it now asserts the
underlying grant fields directly instead of going through a stale helper.

### 4. Minor: schema.ts predicate text didn't match applied SQL

The Drizzle-side partial-unique-index predicate for
`uq_visibility_grants_common` read `scope not in ('specific_player',
'specific_user')`, while the actually-applied migration SQL uses `scope IN
('public', 'all_players')`. Functionally identical given the CHECK constraint
restricts the column to exactly those four values, but the two
representations should read the same for `drizzle-kit generate` to produce a
clean diff later.

**Fix**: aligned `schema.ts` to `scope in ('public', 'all_players')`.

### Not a bug — corrected in first review

`campaignMemberships.userId` foreign key was flagged as changed from a
softer delete behavior to `onDelete: "cascade"`. Re-checked against the
pre-PR diff: `userId` already used `onDelete: "cascade"` before this PR; only
`campaignId` gained a new FK. No action needed, note retracted.

## Still true from the first review (unchanged, no action needed)

- `authWebRoutes.ts`: failed logins are now recorded for unknown accounts too
  (closing an account-enumeration side channel), with a dummy Argon2 verify
  on the unknown-user path for timing consistency.
- `playerKnowledgeProjection.ts` / `playerPortalWebRoutes.ts`: clue/objective
  visibility no longer leaks to all players by default — a real
  access-control fix, covered by `visibilityGrants.integration.test.ts`.
- `0009_player_visibility_integrity.sql` cleans orphaned rows in a sensible
  dependency order before adding FKs; no issues found.
- `entry/index.ts` graceful shutdown is idempotent (`poolClosePromise`,
  `shutdownPromise`), drains HTTP before closing the pool, and force-exits via
  an `unref()`'d timer.
- `webSession.ts`: `lastSeenAt` only refreshed when stale by ≥10 minutes;
  session expiry is a separate column, unaffected.
- Production CSP (`connect-src 'self'`-only) covered by
  `productionCsp.test.ts`.
- Auth/knowledge/portal route registration switched to synchronous
  registration, removing a startup race where early requests could 404 before
  routes were attached.

## Verification performed this pass

- `npx tsc --noEmit -p .` — clean.
- Full `tests/backend` suite against a local disposable Postgres instance
  (docker-compose `postgres` service) after applying the updated migrations:
  50/54 tests pass. The 4 remaining failures
  (`campaignMessagingWebRoutes.integration.test.ts`) reproduce identically
  with this PR's fixes reverted, i.e. they are pre-existing and unrelated to
  this PR (that file is not touched by the diff).
- Targeted repro: `CreateEntity` with default visibility through
  `PostgresCampaignRepository.executeCommand` — failed with
  `chk_visibility_grants_principal` before the fix, succeeds with zero grant
  rows written after.

No open findings remain from this pass.
