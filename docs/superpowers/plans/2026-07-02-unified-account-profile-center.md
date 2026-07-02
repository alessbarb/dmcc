# Unified Account Profile Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared `/account` center for DM and player users with contextual social profiles, field-level privacy, extensible visual preferences, session security, personal-data export, and guarded account deletion.

**Architecture:** Keep credentials in the existing per-vault `auth.json`, add versioned preferences and social-profile records to that store, and expose narrow authenticated routes from a new account route plugin. The frontend uses one feature module and route for both roles; presentation preferences are resolved through registries plus device-local overrides.

**Tech Stack:** TypeScript, Fastify, React 19, TanStack Router, Vitest, CSS custom properties, existing file-backed vault persistence.

---

## Delivery strategy

This is one product surface but four gated waves. Do not start a later wave until
the earlier wave passes its listed tests.

1. **Foundation:** schemas, persistence migration, owner read model, account route.
2. **Profiles and privacy:** DM/player profiles, audience projections, publication.
3. **Experience and security:** UI modules, theme/font registries, sessions.
4. **Lifecycle:** export, guarded deletion, integration and accessibility.

The checkout already contains unrelated local changes. Stage only paths named by
the current task and inspect `git status --short` after every build.

## File map

### Backend

- Create `src/backend/server/account/accountTypes.ts` — persisted and API account/profile types.
- Create `src/backend/server/account/accountValidation.ts` — bounded input and registry-ID validation.
- Create `src/backend/server/account/profileProjection.ts` — audience-only DTO construction.
- Create `src/backend/server/routes/accountRoutes.ts` — authenticated account/profile/preferences/session/data routes.
- Modify `src/backend/server/userAuthStore.ts` — schema v4 migration and focused store operations.
- Modify `src/backend/server/createServer.ts` — register the account route plugin.
- Test `tests/backend/accountStore.test.ts`.
- Test `tests/backend/accountRoutes.test.ts`.
- Test `tests/backend/accountPrivacy.test.ts`.
- Test `tests/backend/accountLifecycle.test.ts`.

### Frontend

- Create `src/frontend/account/accountTypes.ts` — frontend contracts matching account DTOs.
- Create `src/frontend/account/accountClient.ts` — focused API calls.
- Create `src/frontend/account/accountState.ts` — pure dirty/version/device-override helpers.
- Create `src/frontend/account/AccountPage.tsx` — route-level loading and responsive shell.
- Create `src/frontend/account/AccountNav.tsx` — desktop/mobile module navigation.
- Create `src/frontend/account/ProfileEditor.tsx` — reusable social-field editor.
- Create `src/frontend/account/PrivacyPreview.tsx` — owner/DM/table/global preview.
- Create `src/frontend/account/PreferencesPanel.tsx` — appearance/accessibility/device overrides.
- Create `src/frontend/account/NotificationsPanel.tsx` — global internal notices and campaign exceptions.
- Create `src/frontend/account/SecurityPanel.tsx` — password, recovery, and session actions.
- Create `src/frontend/account/DataLifecyclePanel.tsx` — export and guarded deletion.
- Create `src/frontend/account/themeRegistry.ts` — versioned theme-package contract and default theme.
- Create `src/frontend/account/typographyRegistry.ts` — typography-package contract and Cinzel/Outfit default.
- Create `src/frontend/account/deviceOverrides.ts` — presentation-only local persistence.
- Create `src/frontend/account/account.css` — account-center responsive and accessible layout.
- Modify `src/frontend/router.tsx` — authenticated global `/account` route.
- Modify `src/frontend/App.tsx` — DM-home account entry.
- Modify `src/frontend/dm/layouts/CampaignShell.tsx` — campaign-shell account entry.
- Modify `src/frontend/player/components/PlayerPortalView.tsx` — player account entry.
- Modify `src/frontend/shared/styles/index.css` — import account styles.
- Modify `src/shared/i18n/dictionaries/{en,es,de,fr,it,pt}.ts` — account-center strings.
- Test `tests/frontend/accountState.test.ts`.
- Test `tests/frontend/accountRegistries.test.ts`.
- Test `tests/frontend/accountSurface.test.ts`.
- Modify `e2e/minimum-flow.spec.ts` — DM/player entry and responsive smoke path.

## Wave 1 — Foundation

### Task 1: Add schema-v4 account records and migration

**Files:**

- Create: `src/backend/server/account/accountTypes.ts`
- Modify: `src/backend/server/userAuthStore.ts`
- Test: `tests/backend/accountStore.test.ts`

- [ ] **Step 1: Write the failing migration test**

```ts
it("migrates schema 3 without changing user IDs or memberships", async () => {
  await writeFile(join(vaultDir, "auth.json"), JSON.stringify(schema3Fixture));
  const store = await readUserAuthStore(vaultDir);
  expect(store.schemaVersion).toBe(4);
  expect(store.users.map((user) => user.userId)).toEqual(["usr_dm", "usr_player"]);
  expect(store.memberships).toEqual(schema3Fixture.memberships);
  expect(store.preferences).toEqual([]);
  expect(store.dmProfiles).toEqual([]);
  expect(store.playerProfiles).toEqual([]);
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run: `npm test -- tests/backend/accountStore.test.ts`

Expected: FAIL because schema version 4 and the new collections do not exist.

- [ ] **Step 3: Define explicit persisted types**

```ts
export type ProfileAudience = "private" | "dm" | "table" | "global";
export type PublicationState = "private" | "unlisted" | "published";
export type SocialField = "displayName" | "avatarUrl" | "pronouns" | "timeZone" | "biography" | "contact";
export type SocialVisibility = Record<SocialField, ProfileAudience>;

export type UserPreferences = {
  userId: string;
  locale: string;
  timeFormat: "system" | "12h" | "24h";
  themeId: string;
  colorMode: "system" | "light" | "dark";
  typographySetId: string;
  density: "comfortable" | "compact";
  textScale: number;
  enhancedContrast: boolean;
  reducedMotion: boolean;
  interfaceSounds: boolean;
  notifications: Record<"membership" | "campaignActivity" | "sessionReminder" | "direct", boolean>;
  campaignNotifications: Record<string, Partial<UserPreferences["notifications"]>>;
  version: number;
};

export type SocialProfileBase = {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  pronouns?: string;
  timeZone?: string;
  biography?: string;
  contact?: string;
  visibility: SocialVisibility;
  publicHandle?: string;
  publicationState: PublicationState;
  version: number;
};

export type DmSocialProfile = SocialProfileBase;
export type PlayerSocialProfile = SocialProfileBase & { campaignId: string; playerId: string };
```

- [ ] **Step 4: Upgrade `UserAuthStore` to schema 4**

Add `preferences`, `dmProfiles`, and `playerProfiles` arrays. Convert schema 3
records in memory, preserve all existing security collections, and persist the
migrated document once through `writeUserAuthStore`.

```ts
return {
  ...legacy,
  schemaVersion: 4,
  preferences: [],
  dmProfiles: [],
  playerProfiles: [],
  migration: { fromSchemaVersion: legacy.schemaVersion, completedAt: nowIso() },
};
```

- [ ] **Step 5: Run migration and existing auth tests**

Run: `npm test -- tests/backend/accountStore.test.ts tests/backend/userAuth.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the foundation**

```bash
git add src/backend/server/account/accountTypes.ts src/backend/server/userAuthStore.ts tests/backend/accountStore.test.ts
git commit -m "feat(account): add versioned profile storage"
```

### Task 2: Add validated store operations and owner bootstrap

**Files:**

- Create: `src/backend/server/account/accountValidation.ts`
- Modify: `src/backend/server/userAuthStore.ts`
- Create: `src/backend/server/routes/accountRoutes.ts`
- Modify: `src/backend/server/createServer.ts`
- Test: `tests/backend/accountRoutes.test.ts`

- [ ] **Step 1: Write failing route tests**

```ts
it("returns only the signed-in owner's account aggregate", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/api/account",
    headers: { cookie: ownerCookie, "x-vault-id": "default" },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json().account.email).toBe("owner@example.com");
  expect(response.json()).not.toHaveProperty("passwordHash");
  expect(response.json().preferences.themeId).toBe("default");
});

it("rejects stale preference updates", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/api/account/preferences",
    headers: { cookie: ownerCookie },
    payload: { version: 0, themeId: "default", colorMode: "dark" },
  });
  expect(response.statusCode).toBe(409);
});
```

- [ ] **Step 2: Verify the tests fail with route-not-found**

Run: `npm test -- tests/backend/accountRoutes.test.ts`

Expected: FAIL with status 404.

- [ ] **Step 3: Implement bounded validation**

```ts
export const PROFILE_LIMITS = {
  displayName: 80,
  pronouns: 80,
  timeZone: 80,
  biography: 1000,
  contact: 500,
  publicHandle: 32,
} as const;

export function normalizePublicHandle(value: string): string {
  const handle = value.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(handle)) {
    throw Object.assign(new Error("Invalid public handle"), { statusCode: 400, field: "publicHandle" });
  }
  return handle;
}
```

Reuse `isSafeImageUrl` for avatars and accept only registered IDs:
`default`, `system`, and `cinzel-outfit` in this wave.

- [ ] **Step 4: Add focused store functions**

Implement:

```ts
getAccountAggregate(vaultDir, userId)
updatePrivateIdentity(vaultDir, userId, input)
getOrCreatePreferences(vaultDir, userId)
updatePreferences(vaultDir, userId, expectedVersion, patch)
```

`updatePreferences` increments `version` and throws a status-409 error when the
expected version differs.

`updatePrivateIdentity` accepts the current password when changing email,
verifies it through the existing password verifier, and revokes every other
session after the update. Display-name or avatar changes do not mutate existing
social profiles.

- [ ] **Step 5: Register authenticated account routes**

Add `registerAccountRoutes` to `createServer.ts`. In the route plugin, resolve
the owner exclusively through `getSessionUser(vaultDir, readSessionCookie(request))`.
Add:

```ts
server.get("/api/account", ownerAggregateHandler);
server.put("/api/account/identity", updateIdentityHandler);
server.put("/api/account/preferences", updatePreferencesHandler);
```

Use the same-origin mutation guard already used by `userAuthRoutes.ts`; extract
it to `src/backend/server/sameOrigin.ts` only if both plugins need the same
implementation.

- [ ] **Step 6: Run focused and regression tests**

Run: `npm test -- tests/backend/accountRoutes.test.ts tests/backend/userAuth.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/backend/server/account/accountValidation.ts src/backend/server/userAuthStore.ts src/backend/server/routes/accountRoutes.ts src/backend/server/createServer.ts tests/backend/accountRoutes.test.ts
git commit -m "feat(account): expose private account preferences"
```

## Wave 2 — Profiles and privacy

### Task 3: Add DM and campaign-player profile mutations

**Files:**

- Modify: `src/backend/server/userAuthStore.ts`
- Modify: `src/backend/server/routes/accountRoutes.ts`
- Test: `tests/backend/accountRoutes.test.ts`

- [ ] **Step 1: Write failing ownership and membership tests**

```ts
it("updates the owner's DM profile", async () => {
  const response = await put("/api/account/profiles/dm", ownerCookie, {
    version: 0,
    displayName: "Keeper Alex",
    biography: "Runs investigative fantasy.",
    visibility: validVisibility,
  });
  expect(response.statusCode).toBe(200);
  expect(response.json().profile.displayName).toBe("Keeper Alex");
});

it("cannot edit another membership's player profile", async () => {
  const response = await put("/api/account/profiles/player/cmp_other", ownerCookie, playerInput);
  expect(response.statusCode).toBe(403);
});
```

- [ ] **Step 2: Verify red state**

Run: `npm test -- tests/backend/accountRoutes.test.ts`

Expected: FAIL with 404 for profile routes.

- [ ] **Step 3: Implement profile upserts**

Add store functions that validate the expected version and enforce a unique
normalized handle within active vault profiles:

```ts
upsertDmProfile(vaultDir, userId, expectedVersion, input)
upsertPlayerProfile(vaultDir, userId, campaignId, playerId, expectedVersion, input)
```

For player updates, derive `playerId` from the active `CampaignMembership`; never
accept it from the request body.

- [ ] **Step 4: Add narrow routes**

```ts
server.put("/api/account/profiles/dm", updateDmProfileHandler);
server.put("/api/account/profiles/player/:campaignId", updatePlayerProfileHandler);
```

Return field errors as:

```ts
{ error: "Validation failed", fields: { biography: "Maximum 1000 characters" } }
```

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- tests/backend/accountRoutes.test.ts`

Expected: PASS.

```bash
git add src/backend/server/userAuthStore.ts src/backend/server/routes/accountRoutes.ts tests/backend/accountRoutes.test.ts
git commit -m "feat(account): manage contextual social profiles"
```

### Task 4: Enforce audience projections and publication semantics

**Files:**

- Create: `src/backend/server/account/profileProjection.ts`
- Modify: `src/backend/server/routes/accountRoutes.ts`
- Test: `tests/backend/accountPrivacy.test.ts`

- [ ] **Step 1: Write the failing privacy matrix**

Use table-driven cases for owner, campaign DM, table member, unrelated account,
and unauthenticated request. Assert exact keys, not only missing email.

```ts
expect(projectProfile(profile, { audience: "table", published: false })).toEqual({
  displayName: "Alex",
  avatarUrl: "/assets/avatars/aric.jpg",
  pronouns: "they/them",
});
expect(projectProfile(profile, { audience: "global", published: true })).toEqual({
  publicHandle: "alex",
  displayName: "Alex",
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/backend/accountPrivacy.test.ts`

Expected: FAIL because `projectProfile` does not exist.

- [ ] **Step 3: Implement allow-list projection**

```ts
const SOCIAL_FIELDS = ["displayName", "avatarUrl", "pronouns", "timeZone", "biography", "contact"] as const;

export function projectProfile(profile: SocialProfileBase, audience: ProfileAudience) {
  const output: Record<string, string> = {};
  for (const field of SOCIAL_FIELDS) {
    if (isVisibleTo(profile.visibility[field], audience) && profile[field]) output[field] = profile[field]!;
  }
  if (audience === "global" && profile.publicationState !== "private") {
    output.publicHandle = profile.publicHandle!;
  }
  return output;
}
```

The route layer derives `owner`, `dm`, or `table` from memberships. During the
local stage, global projections still require an authenticated vault account.

- [ ] **Step 4: Add preview and projection routes**

```ts
server.get("/api/account/privacy/preview", ownerPreviewHandler);
server.get("/api/profiles/:publicHandle", authenticatedGlobalProfileHandler);
server.get("/api/campaigns/:campaignId/member-profiles", campaignProfilesHandler);
```

Reject `published` or `unlisted` without a valid handle. Publication remains
local-authenticated; do not add an anonymous route.

- [ ] **Step 5: Run privacy and auth regression tests**

Run: `npm test -- tests/backend/accountPrivacy.test.ts tests/backend/userAuth.test.ts tests/backend/playerPortalRoutes.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/backend/server/account/profileProjection.ts src/backend/server/routes/accountRoutes.ts tests/backend/accountPrivacy.test.ts
git commit -m "feat(account): enforce profile audience projections"
```

## Wave 3 — Experience and security

### Task 5: Add account client, state helpers, and authenticated route

**Files:**

- Create: `src/frontend/account/accountTypes.ts`
- Create: `src/frontend/account/accountClient.ts`
- Create: `src/frontend/account/accountState.ts`
- Create: `src/frontend/account/AccountPage.tsx`
- Modify: `src/frontend/router.tsx`
- Test: `tests/frontend/accountState.test.ts`

- [ ] **Step 1: Write failing pure-state tests**

```ts
it("preserves unsaved values after a version conflict", () => {
  expect(mergeConflict(serverProfile, localDraft)).toEqual({
    server: serverProfile,
    draft: localDraft,
    conflicted: true,
  });
});

it("marks a module dirty only when values differ", () => {
  expect(isDirty(profile, { ...profile })).toBe(false);
  expect(isDirty(profile, { ...profile, biography: "Changed" })).toBe(true);
});
```

- [ ] **Step 2: Verify red state**

Run: `npm test -- tests/frontend/accountState.test.ts`

Expected: FAIL because helpers do not exist.

- [ ] **Step 3: Implement contracts and API calls**

`accountClient.ts` exports `fetchAccount`, `updateIdentity`,
`updatePreferences`, `updateDmProfile`, and `updatePlayerProfile`. Every request
uses `apiFetch` and `readApiError`; a 409 response throws an `AccountConflict`
containing the latest server resource.

- [ ] **Step 4: Implement route shell**

Add lazy `AccountPage` and:

```ts
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  beforeLoad: requireDmSession,
  component: withSuspense(AccountPageLazy),
});
```

Rename `requireDmSession` to `requireAccountSession`, because player and DM now
use the same cookie account session. Keep route behavior unchanged.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- tests/frontend/accountState.test.ts && npm run typecheck:app`

Expected: PASS.

```bash
git add src/frontend/account/accountTypes.ts src/frontend/account/accountClient.ts src/frontend/account/accountState.ts src/frontend/account/AccountPage.tsx src/frontend/router.tsx tests/frontend/accountState.test.ts
git commit -m "feat(account): add shared account route"
```

### Task 6: Build responsive account navigation and profile editors

**Files:**

- Create: `src/frontend/account/AccountNav.tsx`
- Create: `src/frontend/account/ProfileEditor.tsx`
- Create: `src/frontend/account/PrivacyPreview.tsx`
- Create: `src/frontend/account/NotificationsPanel.tsx`
- Create: `src/frontend/account/account.css`
- Modify: `src/frontend/account/AccountPage.tsx`
- Modify: `src/frontend/shared/styles/index.css`
- Modify: `src/shared/i18n/dictionaries/{en,es,de,fr,it,pt}.ts`
- Test: `tests/frontend/accountSurface.test.ts`

- [ ] **Step 1: Write failing structural tests**

Assert that the route exposes all eight module IDs, uses semantic `nav`, `main`,
and labeled controls, and contains no role-specific duplicate account page.

```ts
for (const id of ["account", "dm-profile", "player-profiles", "privacy", "appearance", "notifications", "security", "data"]) {
  expect(read("src/frontend/account/AccountPage.tsx")).toContain(`"${id}"`);
}
```

- [ ] **Step 2: Verify red state**

Run: `npm test -- tests/frontend/accountSurface.test.ts`

Expected: FAIL because navigation and editors are absent.

- [ ] **Step 3: Implement module navigation**

Use buttons/links with `aria-current`, a desktop sidebar above `900px`, and a
mobile module index below it. Store the origin in router search:
`/account?returnTo=<encoded same-origin path>`; reject external return URLs.

- [ ] **Step 4: Implement reusable profile editing**

`ProfileEditor` receives:

```ts
type Props = {
  profile: EditableSocialProfile;
  allowedAudiences: Record<SocialField, ProfileAudience[]>;
  onSave(profile: EditableSocialProfile): Promise<void>;
  onDiscard(): void;
};
```

Render explicit labels, field errors, one visibility selector per social field,
and an `aria-live="polite"` save-status region. `PrivacyPreview` switches among
owner, DM, table, and global using the server preview result.

- [ ] **Step 5: Implement account identity and notification modules**

The Account module edits default display name, safe avatar URL, locale, time
format, and private email. Show a current-password input only when email changes.
`NotificationsPanel` edits the four internal notification categories and a
campaign-exception table; it contains no email or push controls.

- [ ] **Step 6: Add all six dictionary namespaces**

Define the same `accountCenter` key shape in every dictionary. English and
Spanish receive final copy; German, French, Italian, and Portuguese receive
accurate concise translations rather than falling back to raw keys.

- [ ] **Step 7: Run frontend gates and commit**

Run: `npm test -- tests/frontend/accountSurface.test.ts && npm run typecheck:app`

Expected: PASS.

```bash
git add src/frontend/account/AccountNav.tsx src/frontend/account/ProfileEditor.tsx src/frontend/account/PrivacyPreview.tsx src/frontend/account/NotificationsPanel.tsx src/frontend/account/AccountPage.tsx src/frontend/account/account.css src/frontend/shared/styles/index.css src/shared/i18n/dictionaries tests/frontend/accountSurface.test.ts
git commit -m "feat(account): build profile and privacy center"
```

### Task 7: Add extensible theme, mode, typography, and device overrides

**Files:**

- Create: `src/frontend/account/themeRegistry.ts`
- Create: `src/frontend/account/typographyRegistry.ts`
- Create: `src/frontend/account/deviceOverrides.ts`
- Create: `src/frontend/account/PreferencesPanel.tsx`
- Test: `tests/frontend/accountRegistries.test.ts`

- [ ] **Step 1: Write failing registry tests**

```ts
expect(getTheme("default").variants.dark).toBeDefined();
expect(getTheme("default").variants.light).toBeDefined();
expect(getTypographySet("cinzel-outfit").bodyFamily).toContain("Outfit");
expect(readDeviceOverrides(storage)).not.toHaveProperty("email");
```

- [ ] **Step 2: Verify red state**

Run: `npm test -- tests/frontend/accountRegistries.test.ts`

Expected: FAIL because registries do not exist.

- [ ] **Step 3: Implement versioned registries**

```ts
export type ThemePackage = {
  id: string;
  contractVersion: 1;
  labelKey: string;
  variants: Record<"light" | "dark", Record<string, string>>;
  supportsEnhancedContrast: boolean;
};

export const themes = new Map([["default", defaultTheme]]);
```

Define the corresponding typography contract with heading, body, mono,
supported weights, scale, and license metadata. Register only the existing
default packages in this release.

- [ ] **Step 4: Implement presentation-only device overrides**

Persist under `dmcc.account.device-preferences.v1`. Parse through an allow-list
containing only theme, mode, typography, density, text scale, contrast, motion,
and sounds. Invalid IDs fall back to account defaults.

- [ ] **Step 5: Implement preference controls and live preview**

The panel separately selects theme package, color mode, and typography package.
Each control toggles between account value and device override. Apply preview
tokens to the preview container before applying account-wide document tokens.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- tests/frontend/accountRegistries.test.ts tests/frontend/visualSystem.test.ts && npm run typecheck:app`

Expected: PASS.

```bash
git add src/frontend/account/themeRegistry.ts src/frontend/account/typographyRegistry.ts src/frontend/account/deviceOverrides.ts src/frontend/account/PreferencesPanel.tsx tests/frontend/accountRegistries.test.ts
git commit -m "feat(account): add extensible appearance preferences"
```

### Task 8: Add session inventory and security controls

**Files:**

- Modify: `src/backend/server/account/accountTypes.ts`
- Modify: `src/backend/server/userAuthStore.ts`
- Modify: `src/backend/server/routes/accountRoutes.ts`
- Create: `src/frontend/account/SecurityPanel.tsx`
- Modify: `src/frontend/account/accountClient.ts`
- Test: `tests/backend/accountRoutes.test.ts`

- [ ] **Step 1: Write failing session tests**

```ts
expect(sessionList.json().sessions[0]).toEqual(expect.objectContaining({
  current: true,
  createdAt: expect.any(String),
  lastSeenAt: expect.any(String),
}));
expect(sessionList.json().sessions[0]).not.toHaveProperty("sessionIdHash");
```

Also prove that revoking one owned session does not revoke another and that
`DELETE /api/account/sessions/others` preserves the current session.

- [ ] **Step 2: Verify red state**

Run: `npm test -- tests/backend/accountRoutes.test.ts`

Expected: FAIL because session inventory routes do not exist.

- [ ] **Step 3: Add safe session metadata**

Persist an optional bounded `deviceLabel` captured from a coarse user-agent
parser at login; never store a fingerprint. Return an opaque per-owner
`sessionRef` derived from the hash, not the raw cookie or full stored hash.

- [ ] **Step 4: Add security routes**

```ts
server.get("/api/account/sessions", listOwnedSessionsHandler);
server.delete("/api/account/sessions/others", revokeOtherSessionsHandler);
server.delete("/api/account/sessions/:sessionRef", revokeOwnedSessionHandler);
```

Reuse existing password-change and recovery-code routes from
`userAuthRoutes.ts`; do not duplicate their business logic.

- [ ] **Step 5: Build `SecurityPanel`**

Call the existing password/recovery endpoints and new session endpoints. Show
new recovery codes once, require acknowledgement before closing, and mark the
current session. Sensitive buttons do not auto-retry.

- [ ] **Step 6: Run gates and commit**

Run: `npm test -- tests/backend/accountRoutes.test.ts tests/backend/userAuth.test.ts && npm run typecheck:all`

Expected: PASS.

```bash
git add src/backend/server/account/accountTypes.ts src/backend/server/userAuthStore.ts src/backend/server/routes/accountRoutes.ts src/frontend/account/SecurityPanel.tsx src/frontend/account/accountClient.ts tests/backend/accountRoutes.test.ts
git commit -m "feat(account): manage account sessions"
```

## Wave 4 — Lifecycle and integration

### Task 9: Add personal export and guarded account deletion

**Files:**

- Modify: `src/backend/server/userAuthStore.ts`
- Modify: `src/backend/server/routes/accountRoutes.ts`
- Create: `src/frontend/account/DataLifecyclePanel.tsx`
- Modify: `src/frontend/account/accountClient.ts`
- Test: `tests/backend/accountLifecycle.test.ts`

- [ ] **Step 1: Write failing export and deletion tests**

```ts
expect(exported).toHaveProperty("profiles");
for (const forbidden of ["passwordHash", "passwordSalt", "sessionIdHash", "codeHash", "tokenHash"]) {
  expect(JSON.stringify(exported)).not.toContain(forbidden);
}

expect(deleteAsSoleDm.statusCode).toBe(409);
expect(deleteAsSoleDm.json().blockers).toEqual([
  { campaignId: "cmp_owned", reason: "sole_responsible_dm" },
]);
```

- [ ] **Step 2: Verify red state**

Run: `npm test -- tests/backend/accountLifecycle.test.ts`

Expected: FAIL with route-not-found.

- [ ] **Step 3: Implement deletion analysis and export**

Add:

```ts
buildPersonalExport(store, userId)
findAccountDeletionBlockers(store, userId)
deleteAccount(vaultDir, userId, confirmation)
```

Deletion verifies the current password, public handle or email confirmation,
and zero blockers. It removes credentials, preferences, social profiles,
recovery tokens, and sessions. It revokes memberships. Historical domain events
are not rewritten; projections resolve missing actors to the localized
`Deleted user` label.

- [ ] **Step 4: Add lifecycle routes**

```ts
server.get("/api/account/export", personalExportHandler);
server.get("/api/account/deletion-impact", deletionImpactHandler);
server.delete("/api/account", deleteAccountHandler);
```

Export sets `Content-Disposition: attachment` and returns JSON. Deletion uses
same-origin protection and rate limiting.

- [ ] **Step 5: Build the lifecycle panel**

Display blockers first. Disable deletion until all are resolved. Require current
password and the exact handle/email. Download export through the authenticated
API as a Blob URL and revoke the Blob URL afterward.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- tests/backend/accountLifecycle.test.ts tests/backend/userAuth.test.ts && npm run typecheck:all`

Expected: PASS.

```bash
git add src/backend/server/userAuthStore.ts src/backend/server/routes/accountRoutes.ts src/frontend/account/DataLifecyclePanel.tsx src/frontend/account/accountClient.ts tests/backend/accountLifecycle.test.ts
git commit -m "feat(account): export and delete personal accounts"
```

### Task 10: Wire every entry point and verify the cross-role experience

**Files:**

- Modify: `src/frontend/App.tsx`
- Modify: `src/frontend/dm/layouts/CampaignShell.tsx`
- Modify: `src/frontend/player/components/PlayerPortalView.tsx`
- Modify: `e2e/minimum-flow.spec.ts`
- Test: `tests/frontend/accountSurface.test.ts`

- [ ] **Step 1: Write the failing entry-point assertions**

```ts
for (const file of [
  "src/frontend/App.tsx",
  "src/frontend/dm/layouts/CampaignShell.tsx",
  "src/frontend/player/components/PlayerPortalView.tsx",
]) {
  expect(read(file)).toContain('to: "/account"');
}
```

- [ ] **Step 2: Verify red state**

Run: `npm test -- tests/frontend/accountSurface.test.ts`

Expected: FAIL because one or more surfaces lack the account link.

- [ ] **Step 3: Add shared account navigation**

Add an account action beside existing sign-out actions. Pass the current
same-origin path as `returnTo`. Keep sign-out behavior unchanged. Do not add a
DM-only page or player-only copy.

- [ ] **Step 4: Add end-to-end coverage**

Extend `e2e/minimum-flow.spec.ts` to:

1. register and enter as DM;
2. open `/account` from DM home;
3. update the DM profile and verify persistence;
4. return to the campaign;
5. enter the player portal with an account membership;
6. open the same `/account` route;
7. update only that campaign's player profile;
8. verify the DM profile remains unchanged;
9. exercise the mobile module index at a phone viewport.

- [ ] **Step 5: Run the full verification ladder**

Run:

```bash
npm run lint
npm run typecheck:all
npm test
npm run build
npm run test:e2e
```

Expected: every command exits 0. After `npm run build`, inspect
`git status --short` and restore only incidental generated diffs; do not discard
pre-existing user changes.

- [ ] **Step 6: Commit integration**

```bash
git add src/frontend/App.tsx src/frontend/dm/layouts/CampaignShell.tsx src/frontend/player/components/PlayerPortalView.tsx e2e/minimum-flow.spec.ts tests/frontend/accountSurface.test.ts
git commit -m "feat(account): share profile center across roles"
```

## Final acceptance gate

- [ ] One cookie-authenticated account can act as DM in one campaign and player in another.
- [ ] DM and campaign-player profiles remain distinct from credentials and characters.
- [ ] Exact server DTO tests prove private fields never leak.
- [ ] `global` is persisted and previewed but is not anonymously reachable on LAN.
- [ ] Theme, light/dark mode, and typography are independent extensible registries.
- [ ] Device overrides contain presentation only.
- [ ] Session revocation, export, and deletion require authenticated same-origin requests.
- [ ] Sole-DM responsibility blocks account deletion.
- [ ] `/account` is the only account-center route and is reachable from every role surface.
- [ ] Lint, both typechecks, complete Vitest suite, build, and Playwright pass.
