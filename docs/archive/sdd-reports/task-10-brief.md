> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

### Task 10: End-to-end verification and cleanup

**Files:**

- Make the smallest cleanup change required by each verification failure, then rerun the same failing command.
- Do not add Playwright coverage in this plan; keep verification to Vitest, typecheck, build, and the manual flow below.

- [ ] **Step 1: Run focused tests**

```bash
npm test -- tests/application/multiEventCommandBus.test.ts tests/projections/playerPortalProjection.test.ts tests/server/playerPortalRoutes.test.ts
```

Expected: all pass.

- [ ] **Step 2: Run full unit/integration suite**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 3: Run typechecks**

```bash
npm run typecheck:all
```

Expected: PASS.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: PASS. Existing large chunk warnings are acceptable; build exit code must be 0.

- [ ] **Step 5: Manual smoke test over LAN/dev**

Run app:

```bash
npm run dev
```

Manual flow:

1. DM opens campaign.
2. DM creates/uses player profile.
3. DM issues player token.
4. Player joins portal with token.
5. Player updates HP.
6. Player creates one private note and one DM-visible note.
7. DM opens Players page.
8. DM sees updated HP and only the DM-visible note.
9. Player creates structural proposal.
10. DM approves proposal and character metadata updates.

- [ ] **Step 6: Commit final cleanup changes**

When verification-driven cleanup changed files, stage those exact files and commit them:

```bash
git diff --name-only
git commit -m "fix: stabilize player portal toolkit"
```

Before the commit, run `git add` only for the paths printed by `git diff --name-only`.

When verification required no code changes, stop after recording the verification evidence in the final implementation report.

---

## Self-review checklist

Spec coverage:

- [x] Multi-event CommandBus blocker covered by Task 1.
- [x] Token hash-only persistence covered by Task 4.
- [x] Portal projection separate from entity metadata covered by Task 3.
- [x] Legacy `metadata.playerId` soft link covered by Task 3.
- [x] Live state/resources/notes/objectives covered by Tasks 5, 7, 8.
- [x] DM private filtering covered by Tasks 3 and 5.
- [x] Proposals and approval covered by Task 6.
- [x] DM review inside `PlayersPage` covered by Task 9.
- [x] History stub acceptance covered by Task 8.

Known implementation risk:

- Multi-event append is ordered but not filesystem-transactional. This is acceptable for this local NDJSON architecture because each event append is already flush-before-success and the command-generated events are serialized through the existing queue. If a later requirement demands rollback semantics, introduce an event-store batch append API.
