# M2: Feature Completion Implementation Plan

> **Status (2026-06-26):** Tasks 1–3 committed. Tasks 4–5 not yet started.
> - Task 1: Tags system — commit 4713fb8 ✅ (fix included)
> - Task 2: LAN join endpoint — commit a5d3485 ✅ (fix included)
> - Task 3: Real per-page routing — commit 9f0c940 (committed, under review) ⚠️
> - Task 4: Graph node colors — NOT STARTED ❌
> - Task 5: Boards page entity type filter — NOT STARTED ❌
>
> Next: complete review of Task 3, then proceed to Task 4.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete all missing features from the v1.0 spec: tag management, LAN join endpoint, real per-page routing in the React app, graph node colors, and App.tsx component split.

**Architecture:** The codebase already has boards (BoardsPage), WhatNow in Spanish, Fuse.js search, graph/timeline/visibility routes, and a router with correct paths — but all routes render `<App />` instead of per-page components. Tags have event schemas but no commands/routes. LAN has a toggle but no join endpoint. App.tsx concentrates all logic in 1500+ lines. This plan wires the remaining pieces.

**Tech Stack:** TypeScript, React 19, TanStack Router, Zustand, Fastify, Zod

## Global Constraints

- Spanish UI strings, English code identifiers/types/enums
- No D&D proprietary content; SRD 5.2.1 CC-BY-4.0 only
- `npm test -- --run` must pass green at end of every task
- `x-dm-token` header required for all DM API calls
- Default visibility for new content: `dm_only`

---

### Task 1: Tags — domain command, route, and campaign store

**Files:**

- Modify: `src/application/commands.ts`
- Modify: `src/application/commandBus.ts`
- Create: `src/server/routes/tagRoutes.ts`
- Modify: `src/server/createServer.ts`
- Modify: `src/projections/campaignProjection.ts` (wire TagCreated into projection)
- Modify: `src/app/stores/campaignStore.ts`

**Interfaces:**

- Produces: `POST /api/campaigns/:id/tags` → create tag
- Produces: `GET /api/campaigns/:id/tags` → list tags
- Produces: `CreateTag` and `AddTagToEntity` in `Command` union

Tags already have `TagCreated`/`TagUpdated` event schemas in `src/domain/shared/events.ts:112-113` and the `tags` map already exists in `CampaignProjection`. Wiring just needs commands + route + projection handler.

- [x] **Step 1: Write failing test**

Create `tests/domain/tags.test.ts`:

```ts
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-tags-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

describe("Tags", () => {
  it("creates a tag and lists it back", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = (server as any).dmSessionToken;

      await server.inject({
        method: "POST", url: "/api/campaigns",
        payload: { campaignId: "cmp_tag1", title: "Tag Test", actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });

      const createRes = await server.inject({
        method: "POST", url: "/api/campaigns/cmp_tag1/tags",
        payload: { name: "protagonistas", color: "#6366f1" },
        headers: { "x-dm-token": token },
      });
      expect(createRes.statusCode).toBe(201);
      expect(createRes.json().tagId).toMatch(/^tag_/);

      const listRes = await server.inject({
        method: "GET", url: "/api/campaigns/cmp_tag1/tags",
        headers: { "x-dm-token": token },
      });
      expect(listRes.statusCode).toBe(200);
      const tags = listRes.json().tags;
      expect(tags.length).toBe(1);
      expect(tags[0].name).toBe("protagonistas");
    });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test -- --run tests/domain/tags.test.ts
```

Expected: FAIL with 404 (route not found).

- [x] **Step 3: Add CreateTag and AddTagToEntity commands**

In `src/application/commands.ts`, add to `Command` union:

```ts
| {
    type: "CreateTag";
    campaignId: CampaignId;
    actorId: string;
    tagId?: string;
    name: string;
    color?: string;
  }
| {
    type: "AddTagToEntity";
    campaignId: CampaignId;
    actorId: string;
    entityId: EntityId;
    tagId: string;
  }
| {
    type: "RemoveTagFromEntity";
    campaignId: CampaignId;
    actorId: string;
    entityId: EntityId;
    tagId: string;
  }
```

- [x] **Step 4: Wire commandBus.ts**

In `src/application/commandBus.ts`, add the import at top:

```ts
import { createId } from "../shared/ids.js";  // already imported
```

Add cases:

```ts
case "CreateTag": {
  const tagId = command.tagId ?? createId("tag");
  const tag = { id: tagId, name: command.name, color: command.color ?? "#6366f1" };
  const tags = new Map(state.tags ?? []);
  tags.set(tagId, tag);
  return {
    state: { ...state, tags },
    event: makeEvent(command.actorId, command.campaignId, "TagCreated", tag),
  };
}
case "AddTagToEntity": {
  const entity = requireEntity(state, command.entityId);
  const tagIds = [...new Set([...(entity.tagIds ?? []), command.tagId])];
  const updated = { ...entity, tagIds };
  const entities = new Map(state.entities);
  entities.set(updated.entityId, updated);
  return {
    state: { ...state, entities },
    event: makeEvent(command.actorId, command.campaignId, "EntityUpdated", updated),
  };
}
case "RemoveTagFromEntity": {
  const entity = requireEntity(state, command.entityId);
  const tagIds = (entity.tagIds ?? []).filter((t: string) => t !== command.tagId);
  const updated = { ...entity, tagIds };
  const entities = new Map(state.entities);
  entities.set(updated.entityId, updated);
  return {
    state: { ...state, entities },
    event: makeEvent(command.actorId, command.campaignId, "EntityUpdated", updated),
  };
}
```

- [x] **Step 5: Wire TagCreated into campaignProjection**

In `src/projections/campaignProjection.ts`, find the `applyEvent` function and add a case for `TagCreated`:

```ts
case "TagCreated": {
  next.tags.set(payload.id, payload);
  break;
}
```

Add it in the switch/if-else block near the other event type handlers.

- [x] **Step 6: Create tag routes**

Create `src/server/routes/tagRoutes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import { EventStore } from "../../persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../../persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../../persistence/repositories/campaignRepository.js";
import { assertDM, getValidatedVaultId, getValidatedCampaignId } from "../auth.js";

export async function registerTagRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  server.post<{ Params: { campaignId: string }; Body: { name: string; color?: string; tagId?: string } }>(
    "/api/campaigns/:campaignId/tags",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { name, color, tagId } = request.body;

      if (!name || name.trim() === "") {
        reply.code(400);
        return { error: "Tag name is required" };
      }

      try {
        const result = await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "CreateTag",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          tagId,
          name: name.trim(),
          color,
        });
        reply.code(201);
        const tagId2 = result.event.payload.id;
        return { tagId: tagId2, name, color };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/tags",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId as any);
        const tags = Array.from((state.tags ?? new Map()).values());
        return { tags };
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );
}
```

- [x] **Step 7: Register tag routes in createServer.ts**

In `src/server/createServer.ts`, add:

```ts
import { registerTagRoutes } from "./routes/tagRoutes.js";
// ... in the server body:
server.register(registerTagRoutes, opts);
```

- [x] **Step 8: Add createTag to campaignStore.ts**

In `src/app/stores/campaignStore.ts`, add a `createTag` action:

```ts
createTag: async (name: string, color?: string) => {
  const { activeCampaignId, dmToken } = get();
  if (!activeCampaignId) throw new Error("No active campaign");
  const res = await fetch(`/api/campaigns/${activeCampaignId}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-dm-token": dmToken ?? "" },
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) throw new Error("Failed to create tag");
  return res.json();
},
```

- [x] **Step 9: Run tests**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test -- --run tests/domain/tags.test.ts
```

Expected: PASS.

- [x] **Step 10: Run all tests**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test -- --run
```

Expected: all pass.

- [x] **Step 11: Commit**

```bash
git add src/application/commands.ts src/application/commandBus.ts \
        src/projections/campaignProjection.ts \
        src/server/routes/tagRoutes.ts src/server/createServer.ts \
        src/app/stores/campaignStore.ts tests/domain/tags.test.ts
git commit -m "feat: add tag management (CreateTag command, routes, projection)"
```

---

### Task 2: LAN join server endpoint

**Files:**

- Modify: `src/server/routes/campaignRoutes.ts` (add `/join/:campaignId` POST)
- Modify: `src/server/createServer.ts` (expose in-memory player tokens map)

**Interfaces:**

- Produces: `POST /api/join/:campaignId` with body `{ accessCode: string }` → `{ playerToken: string, campaignTitle: string }`
- Produces: validated player session usable in `assertCampaignAccess`

Currently the router.tsx has a `/join/$campaignId` front-end route but there is no API endpoint to exchange an access code for a player token.

- [x] **Step 1: Write failing test**

Create `tests/server/lan.test.ts`:

```ts
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-lan-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

describe("LAN join", () => {
  it("exchanges valid access code for player token", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = (server as any).dmSessionToken;

      // Create campaign and enable LAN
      await server.inject({
        method: "POST", url: "/api/campaigns",
        payload: { campaignId: "cmp_lan_j", title: "LAN Join Test", actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });

      const toggleRes = await server.inject({
        method: "POST", url: "/api/campaigns/cmp_lan_j/lan/toggle",
        payload: { enabled: true },
        headers: { "x-dm-token": token },
      });
      expect(toggleRes.statusCode).toBe(200);
      const { accessCode } = toggleRes.json();
      expect(accessCode).toBeTruthy();

      // Exchange code for player token
      const joinRes = await server.inject({
        method: "POST", url: "/api/join/cmp_lan_j",
        payload: { accessCode },
      });
      expect(joinRes.statusCode).toBe(200);
      expect(joinRes.json().playerToken).toBeTruthy();
    });
  });

  it("rejects invalid access code", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = (server as any).dmSessionToken;

      await server.inject({
        method: "POST", url: "/api/campaigns",
        payload: { campaignId: "cmp_lan_bad", title: "LAN Bad Code", actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });
      await server.inject({
        method: "POST", url: "/api/campaigns/cmp_lan_bad/lan/toggle",
        payload: { enabled: true },
        headers: { "x-dm-token": token },
      });

      const joinRes = await server.inject({
        method: "POST", url: "/api/join/cmp_lan_bad",
        payload: { accessCode: "000000" },
      });
      expect([401, 403]).toContain(joinRes.statusCode);
    });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test -- --run tests/server/lan.test.ts
```

Expected: FAIL with 404 (join route not found).

- [x] **Step 3: Add player tokens map to server**

In `src/server/createServer.ts`, after existing decorations:

```ts
// In-memory player session tokens: token → { campaignId, playerId }
server.decorate("playerTokens", new Map<string, { campaignId: string; playerId: string }>());
```

- [x] **Step 4: Add join route**

In `src/server/routes/campaignRoutes.ts`, add after the LAN toggle route (before the closing brace of `registerCampaignRoutes`):

```ts
// LAN Join — exchange access code for player token
server.post<{ Params: { campaignId: string }; Body: { accessCode: string; playerId?: string } }>(
  "/api/join/:campaignId",
  async (request, reply) => {
    const campaignId = getValidatedCampaignId(request.params.campaignId);
    const { accessCode, playerId } = request.body;
    const vaultId = getValidatedVaultId(request);

    if (!accessCode) {
      reply.code(400);
      return { error: "accessCode is required" };
    }

    try {
      const state = await getRepository(vaultId).getCampaignState(campaignId as any);

      if (!state.campaign?.settings?.lanModeEnabled) {
        reply.code(403);
        return { error: "LAN mode is not enabled for this campaign" };
      }

      const hash = state.campaign.settings?.localAccessCodeHash;
      const legacyCode = state.campaign.settings?.localAccessCode;

      const isValid =
        (hash && hashAccessCode(accessCode) === hash) ||
        (legacyCode && accessCode === legacyCode);

      if (!isValid) {
        reply.code(401);
        return { error: "Invalid access code" };
      }

      // Issue player token
      const { randomBytes } = await import("crypto");
      const playerToken = randomBytes(24).toString("hex");
      const pid = playerId ?? `ply_${randomBytes(8).toString("hex")}`;
      (server as any).playerTokens.set(playerToken, { campaignId, playerId: pid });

      return {
        playerToken,
        playerId: pid,
        campaignTitle: state.campaign.title,
      };
    } catch (err: any) {
      if (err.statusCode) { reply.code(err.statusCode); return { error: err.message }; }
      reply.code(404);
      return { error: "Campaign not found" };
    }
  }
);
```

- [x] **Step 5: Update auth.ts to validate player tokens**

In `src/server/auth.ts`, update `assertCampaignAccess` to also accept player tokens from the server's `playerTokens` map. The cleanest way: add a `playerToken` header check in `getRequestRole`:

In `src/server/auth.ts`, add a new function:

```ts
export function getRequestRoleWithTokens(
  request: any,
  dmSessionToken: string,
  playerTokens: Map<string, { campaignId: string; playerId: string }>,
  campaignId: string
): "dm" | "player" | "unauthenticated" {
  const base = getRequestRole(request, dmSessionToken);
  if (base !== "unauthenticated") return base;

  const playerTokenHeader = request.headers["x-player-token"] as string | undefined;
  if (playerTokenHeader) {
    const session = playerTokens.get(playerTokenHeader);
    if (session && session.campaignId === campaignId) {
      return "player";
    }
  }
  return "unauthenticated";
}
```

- [x] **Step 6: Run tests**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test -- --run tests/server/lan.test.ts
```

Expected: PASS.

- [x] **Step 7: Run all tests**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test -- --run
```

Expected: all pass.

- [x] **Step 8: Commit**

```bash
git add src/server/routes/campaignRoutes.ts src/server/createServer.ts src/server/auth.ts \
        tests/server/lan.test.ts
git commit -m "feat: add LAN join endpoint, player token exchange"
```

---

### Task 3: Real per-page routing — split App.tsx into shell + pages

**Files:**

- Modify: `src/app/router.tsx`
- Create: `src/app/CampaignShell.tsx`
- Create: `src/app/CampaignLanding.tsx`
- Modify: `src/app/App.tsx` (reduce to campaign list + landing only)

**Interfaces:**

- Consumes: all page components from `src/app/pages/` (already exist)
- Produces: each route renders its own component; URL governs page shown

Currently all routes render `<App />`. This task wires each route to the correct page component.

- [x] **Step 1: Create CampaignShell.tsx**

Create `src/app/CampaignShell.tsx`:

```tsx
import React from "react";
import { Outlet, useParams, useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "./stores/campaignStore.js";
import { useEffect } from "react";
import { ToastContainer } from "./components/ToastContainer.js";
import { useToast } from "./hooks/useToast.js";
import {
  Shield, Activity, GitFork, List, Settings, Play, Search, MapPin, User, Layers,
} from "lucide-react";

export function CampaignShell() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  const { selectCampaign, activeCampaignId, campaignState } = useCampaignStore();
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      selectCampaign(campaignId as any);
    }
  }, [campaignId]);

  const NAV = [
    { path: "dashboard", label: "Dashboard", Icon: Shield },
    { path: "what-now", label: "¿Qué toca?", Icon: Activity },
    { path: "session", label: "Sesión", Icon: Play },
    { path: "entities", label: "Entidades", Icon: List },
    { path: "graph", label: "Grafo", Icon: GitFork },
    { path: "timeline", label: "Línea temporal", Icon: MapPin },
    { path: "boards", label: "Tableros", Icon: Layers },
    { path: "players", label: "Jugadores", Icon: User },
    { path: "search", label: "Búsqueda", Icon: Search },
    { path: "settings", label: "Ajustes", Icon: Settings },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <nav style={{
        width: "200px", background: "var(--bg-sidebar)", padding: "16px 0",
        display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto",
      }}>
        <div style={{ padding: "0 16px 16px", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {campaignState?.campaign?.title ?? "Campaña"}
        </div>
        {NAV.map(({ path, label, Icon }) => (
          <button
            key={path}
            onClick={() => navigate({ to: `/campaigns/${campaignId}/${path}` })}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 16px", background: "none", border: "none",
              cursor: "pointer", textAlign: "left", color: "var(--text-primary)",
              fontSize: "0.875rem",
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>
      <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <Outlet />
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
```

- [x] **Step 2: Update router.tsx to use per-page components**

Replace the content of `src/app/router.tsx`:

```tsx
import React from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { App } from "./App.js";
import { CampaignShell } from "./CampaignShell.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { WhatNowPage } from "./pages/WhatNowPage.js";
import { SessionPage } from "./pages/SessionPage.js";
import { EntitiesPage } from "./pages/EntitiesPage.js";
import { GraphPage } from "./pages/GraphPage.js";
import { TimelinePage } from "./pages/TimelinePage.js";
import { BoardsPage } from "./pages/BoardsPage.js";
import { PlayersPage } from "./pages/PlayersPage.js";
import { SearchPage } from "./pages/SearchPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <App />,
});

const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$campaignId",
  component: () => <App />,
});

const campaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns/$campaignId",
  component: CampaignShell,
});

// Each sub-route renders its own page component.
// Props come from useCampaignStore() inside each page.
const dashboardRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/dashboard", component: DashboardPage });
const whatNowRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/what-now", component: WhatNowPage });
const sessionRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/session", component: SessionPage });
const entitiesRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/entities", component: EntitiesPage });
const graphRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/graph", component: GraphPage });
const timelineRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/timeline", component: TimelinePage });
const boardsRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/boards", component: BoardsPage });
const playersRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/players", component: PlayersPage });
const searchRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/search", component: SearchPage });
const settingsRoute = createRoute({ getParentRoute: () => campaignRoute, path: "/settings", component: SettingsPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  joinRoute,
  campaignRoute.addChildren([
    dashboardRoute, whatNowRoute, sessionRoute, entitiesRoute,
    graphRoute, timelineRoute, boardsRoute, playersRoute,
    searchRoute, settingsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register { router: typeof router; }
}
```

- [x] **Step 3: Update page components to use store instead of props**

Each page currently receives props from App.tsx (`campaignState`, `setSelectedEntity`, etc.). With real routing they render standalone. Check each page for required props and update them to call `useCampaignStore()` directly.

For example, `WhatNowPage.tsx`:

```ts
// BEFORE: export function WhatNowPage({ whatNow, campaignState, setSelectedEntity }: WhatNowPageProps)
// AFTER:
export function WhatNowPage() {
  const { whatNow, campaignState, setSelectedEntity } = useCampaignStore();
  // rest of component unchanged
}
```

Apply the same pattern to each page that receives props: DashboardPage, SessionPage, EntitiesPage, GraphPage, TimelinePage, BoardsPage, PlayersPage, SearchPage, SettingsPage.

- [x] **Step 4: Build TypeScript**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npx tsc --noEmit 2>&1 | head -40
```

Fix any TypeScript errors from the prop-to-store migration.

- [x] **Step 5: Run dev server and verify navigation**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run dev
```

Open `http://localhost:4877`. Create a campaign, navigate to it. Click each nav item. Verify URL changes to `/campaigns/:id/dashboard` etc. and page content renders.

- [x] **Step 6: Run all tests**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test -- --run
```

Expected: all pass.

- [x] **Step 7: Commit**

```bash
git add src/app/router.tsx src/app/CampaignShell.tsx src/app/pages/ src/app/App.tsx
git commit -m "feat: real per-page routing, CampaignShell layout, URL governs page shown"
```

---

### Task 4: Graph node colors by entity type

**Files:**

- Modify: `src/app/pages/GraphPage.tsx`

**Interfaces:**

- Consumes: `graph` state from `useCampaignStore()` — nodes with `entityType`, edges with `relationType`, `label`
- Produces: nodes colored by entity type, edges labeled with relation type in Spanish

- [ ] **Step 1: Define color map and Spanish relation labels**

In `src/app/pages/GraphPage.tsx`, add near the top:

```ts
const ENTITY_TYPE_COLORS: Record<string, string> = {
  player_character: "#6366f1",
  npc:             "#3b82f6",
  location:        "#10b981",
  faction:         "#f59e0b",
  quest:           "#f97316",
  clue:            "#eab308",
  secret:          "#ef4444",
  item:            "#8b5cf6",
  creature:        "#dc2626",
  encounter:       "#0891b2",
  scene:           "#64748b",
  front:           "#7c3aed",
  clock:           "#0ea5e9",
  decision:        "#d97706",
  consequence:     "#b45309",
  rumor:           "#6b7280",
  rule_reference:  "#374151",
  handout:         "#1d4ed8",
  note:            "#475569",
};

const RELATION_LABELS_ES: Record<string, string> = {
  hides:          "oculta",
  unlocks:        "desbloquea",
  points_to:      "apunta a",
  causes:         "causa",
  contradicts:    "contradice",
  confirms:       "confirma",
  belongs_to:     "pertenece a",
  leads_to:       "lleva a",
  opposes:        "se opone a",
  allies_with:    "aliado de",
  knows:          "conoce",
  fears:          "teme",
  employs:        "emplea",
  seeks:          "busca",
  guards:         "custodia",
  located_in:     "ubicado en",
  member_of:      "miembro de",
  owns:           "posee",
  controls:       "controla",
  threatens:      "amenaza",
};
```

- [ ] **Step 2: Apply colors to React Flow nodes**

Find where React Flow `nodes` array is built in `GraphPage.tsx`. Update node `style` or `data`:

```tsx
const rfNodes = (graph?.nodes ?? []).map((n: any) => ({
  id: n.id,
  data: {
    label: n.title,
    entityType: n.entityType,
    importance: n.importance,
    hasWarnings: n.hasWarnings,
  },
  position: { x: 0, y: 0 }, // layout handled by ReactFlow auto-layout or existing logic
  style: {
    background: ENTITY_TYPE_COLORS[n.entityType] ?? "#6b7280",
    color: "#fff",
    border: n.hasWarnings ? "2px solid #ef4444" : "1px solid rgba(255,255,255,0.2)",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "12px",
    minWidth: "100px",
  },
}));
```

- [ ] **Step 3: Apply Spanish labels to React Flow edges**

```tsx
const rfEdges = (graph?.edges ?? []).map((e: any) => ({
  id: e.id,
  source: e.source,
  target: e.target,
  label: RELATION_LABELS_ES[e.relationType] ?? e.relationType ?? "",
  style: { stroke: "#64748b" },
  labelStyle: { fontSize: "10px", fill: "#94a3b8" },
  labelBgStyle: { fill: "#1e293b", fillOpacity: 0.8 },
}));
```

- [ ] **Step 4: Add entity type legend**

Below the graph, add a legend:

```tsx
<div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "8px 0" }}>
  {Object.entries(ENTITY_TYPE_COLORS).map(([type, color]) => (
    <span key={type} style={{
      display: "flex", alignItems: "center", gap: "4px",
      fontSize: "11px", color: "var(--text-muted)",
    }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
      {type.replace("_", " ")}
    </span>
  ))}
</div>
```

- [ ] **Step 5: Start dev server and verify**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run dev
```

Navigate to a campaign with entities and relations. Open the Graph page. Verify nodes are colored by type and edges show Spanish labels.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/GraphPage.tsx
git commit -m "feat: graph nodes colored by entity type, edges labeled in Spanish"
```

---

### Task 5: Boards page entity type filter

**Files:**

- Modify: `src/app/pages/BoardsPage.tsx`

**Interfaces:**

- Consumes: `campaignState` from `useCampaignStore()`
- Produces: board type selector (tabs or buttons) that filters kanban columns by entity type

The BoardsPage already implements kanban columns in Spanish. This task ensures it reads from the store instead of props and adds a board type switcher if not already present.

- [ ] **Step 1: Update BoardsPage to use store**

In `src/app/pages/BoardsPage.tsx`, replace prop-based access with:

```ts
export function BoardsPage() {
  const { campaignState, setSelectedEntity } = useCampaignStore();
  const [activeBoardId, setActiveBoardId] = useState<BoardType>("misiones");
  // rest of existing logic unchanged, but read campaignState and setSelectedEntity from store
}
```

Remove the `BoardsPageProps` interface if it only existed for prop passing.

- [ ] **Step 2: Verify tabs render board type switcher**

Ensure the BOARDS array selector is rendered at the top of the page. If it's already there from the existing implementation, verify it works with the store-sourced data.

- [ ] **Step 3: Start dev server and verify boards**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run dev
```

Navigate to `/campaigns/:id/boards`. Click each board tab. Verify entities appear in the correct kanban columns.

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/BoardsPage.tsx
git commit -m "feat: boards page reads from store, full kanban navigation"
```

---

## Verification

After all tasks complete:

```bash
npm test -- --run  # all tests pass

npm run dev        # dev server starts

# Navigate in browser:
# / → campaign list
# /campaigns/:id/dashboard → dashboard
# /campaigns/:id/what-now → ¿Qué toca ahora? in Spanish
# /campaigns/:id/graph → colored nodes, labeled edges
# /campaigns/:id/boards → kanban with board type tabs
# /campaigns/:id/entities → entity list

# LAN join flow:
TOKEN=$(curl -s http://localhost:4877/api/auth/local-token | jq -r .token)
curl -s -X POST http://localhost:4877/api/campaigns/cmp_test/lan/toggle \
  -H "Content-Type: application/json" -H "x-dm-token: $TOKEN" \
  -d '{"enabled":true}' | jq .
# → { ok: true, accessCode: "XXXXXX" }

curl -s -X POST http://localhost:4877/api/join/cmp_test \
  -H "Content-Type: application/json" \
  -d '{"accessCode":"XXXXXX"}' | jq .
# → { playerToken: "...", campaignTitle: "..." }

# Tags:
curl -s -X POST http://localhost:4877/api/campaigns/cmp_test/tags \
  -H "Content-Type: application/json" -H "x-dm-token: $TOKEN" \
  -d '{"name":"protagonistas","color":"#6366f1"}' | jq .
# → { tagId: "tag_...", name: "protagonistas" }
```
