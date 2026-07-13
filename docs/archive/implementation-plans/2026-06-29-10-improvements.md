> Archived historical implementation plan.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# DMCC 10 Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 8 concrete improvements (2 were already done: #5 WhatNow checklist, #9 Timeline search) across 3 parallel waves.

**Architecture:** Wave 1 = pure backend (no frontend conflict). Wave 2 = isolated frontend features. Wave 3 = major refactor + new pages requiring Wave 1+2 merged. Each wave can dispatch multiple agents in parallel.

**Tech Stack:** TypeScript, Fastify 5, React 19, TanStack Router 1.x, Zustand 5, Zod 4, Vitest

## Global Constraints

- All tests must pass: `npm test` (143 tests currently)
- TypeScript strict: `npm run typecheck:all` must pass
- All text UI in Spanish; i18n keys in `src/frontend/shared/i18n/`
- No hard deletes; archive instead
- IDs: prefixed strings (`cmp_`, `ent_`, `fact_`, etc.)
- Server at `127.0.0.1:4877`; all campaign routes require `assertDM()`

---

## WAVE 1A — Domain + CommandBus (no frontend, run parallel with 1B)

### Task 1: FactConfidence + FactSource Consolidation

**Context:** `src/core/domain/fact/fact.ts` defines `FactConfidence` and `FactSource` as manual TypeScript types. `src/core/domain/fact/types.ts` defines them as Zod schemas with diverged `FactSource` (different shapes). Goal: `fact.ts` imports types from `types.ts`; no duplicate definitions.

**Files:**

- Modify: `src/core/domain/fact/fact.ts`
- Modify: `src/core/domain/fact/types.ts` (reconcile FactSource shapes)
- Modify: `src/core/application/commands.ts` (already imports FactConfidence from fact.ts — update import)
- Test: `src/core/domain/fact/fact.test.ts` (if exists) or add to nearest test file

**Interfaces:**

- Produces: `FactConfidence`, `FactKind`, `FactSource` exported from `types.ts` only; `fact.ts` re-exports them

- [ ] **Step 1: Reconcile FactSource shapes**

Current `fact.ts` FactSource:

```ts
export type FactSource =
  | { kind: "session"; sessionId: SessionId }
  | { kind: "preparation" }
  | { kind: "manual" }
  | { kind: "player"; playerId: PlayerId };
```

Current `types.ts` factSourceSchema (3 union members, looser):

```ts
z.union([
  z.object({ type: z.string().optional(), kind: z.string().optional(), sessionId: sessionIdSchema, sessionEventId: sessionEventIdSchema }),
  z.object({ type: z.string().optional(), kind: z.string().optional(), note: z.string().optional() }),
  z.object({ type: z.string().optional(), kind: z.string().optional(), importId: z.string(), sourcePath: z.string().optional() }),
])
```

Replace `factSourceSchema` in `types.ts` with discriminated union matching `fact.ts`:

```ts
export const factSourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("session"), sessionId: sessionIdSchema, sessionEventId: sessionEventIdSchema.optional() }),
  z.object({ kind: z.literal("preparation") }),
  z.object({ kind: z.literal("manual"), note: z.string().optional() }),
  z.object({ kind: z.literal("player"), playerId: playerIdSchema }),
  z.object({ kind: z.literal("import"), importId: z.string(), sourcePath: z.string().optional() }),
]);
export type FactSource = z.infer<typeof factSourceSchema>;
```

- [ ] **Step 2: Remove duplicates from fact.ts, re-export from types.ts**

Replace `fact.ts` content for the type section:

```ts
// Remove these from fact.ts:
// export type FactKind = "canon" | ...
// export type FactConfidence = "unconfirmed" | ...
// export type FactSource = ...

// Add at top of fact.ts:
export type { FactKind, FactConfidence, FactSource } from "./types.js";
```

Keep `createFact()` and the `Fact` interface in `fact.ts`. Update `Fact` interface to use `FactSource` from types.

- [ ] **Step 3: Fix imports in commands.ts**

```ts
// src/core/application/commands.ts
// Change:
import type { FactConfidence, FactKind, FactSource } from "../domain/fact/fact.js";
// To (same import path is fine since fact.ts re-exports):
import type { FactConfidence, FactKind, FactSource } from "../domain/fact/fact.js";
// No change needed if re-export works — verify with typecheck
```

- [ ] **Step 4: Fix any callers of old FactSource shape**

Search for `kind: "session"` usages vs old `kind` string patterns:

```bash
grep -rn "kind.*session\|kind.*preparation\|kind.*manual\|kind.*player\|kind.*import" src/ --include="*.ts" --include="*.tsx"
```

Update any callers that used the old loose schema to use discriminated union.

- [ ] **Step 5: Run typecheck**

```bash
npm run typecheck:all
```

Expected: 0 errors

- [ ] **Step 6: Run tests**

```bash
npm test
```

Expected: all 143 tests pass

- [ ] **Step 7: Commit**

```bash
git add src/core/domain/fact/fact.ts src/core/domain/fact/types.ts src/core/application/commands.ts
git commit -m "refactor(domain): consolidate FactConfidence/FactSource into types.ts Zod schema"
```

---

### Task 2: DuplicateCampaign via CommandBus

**Context:** `src/backend/server/routes/campaignRoutes.ts:351` calls `newRepo.appendEvent()` directly. Every mutation must go through `executeCommand()` via commandBus. Need a `DuplicateCampaign` command.

**Files:**

- Modify: `src/core/application/commands.ts` (add DuplicateCampaign command type)
- Modify: `src/core/application/commandBus.ts` (add handler)
- Modify: `src/backend/server/routes/campaignRoutes.ts` (use executeCommand)
- Modify: `src/core/persistence/repositories/campaignRepository.ts` (expose needed method if missing)

**Interfaces:**

- Consumes: `CampaignRepository.getCampaignState()`, `CampaignRepository.executeCommand()`
- Produces: `DuplicateCampaign` command dispatched through commandBus

- [ ] **Step 1: Add DuplicateCampaign command type**

In `src/core/application/commands.ts`, add:

```ts
| {
    type: "DuplicateCampaign";
    sourceCampaignId: CampaignId;
    newCampaignId: CampaignId;
    newTitle: string;
    actorId: string;
  }
```

- [ ] **Step 2: Add DuplicateCampaign handler to commandBus**

Read `src/core/application/commandBus.ts` to understand handler pattern, then add:

```ts
case "DuplicateCampaign": {
  // Read source events and replay them into new campaign
  const sourceState = await repo.getCampaignState(command.sourceCampaignId);
  if (!sourceState) throw new Error(`Source campaign not found: ${command.sourceCampaignId}`);
  // Get raw events from source
  const sourceEvents = await repo.getRawEvents(command.sourceCampaignId);
  for (const ev of sourceEvents) {
    const payload = { ...ev.payload, campaignId: command.newCampaignId };
    if (ev.type === "CampaignCreated") {
      payload.campaignId = command.newCampaignId;
      payload.title = command.newTitle;
    }
    await repo.appendRawEvent(command.newCampaignId, ev.type, command.actorId, payload);
  }
  await repo.rebuildSnapshot(command.newCampaignId);
  return { campaignId: command.newCampaignId, title: command.newTitle };
}
```

Note: If `getRawEvents` and `appendRawEvent` don't exist on the repo, expose them. Check `src/core/persistence/repositories/campaignRepository.ts` and `src/core/persistence/eventStore/eventStore.ts`.

- [ ] **Step 3: Check what raw event methods exist**

```bash
grep -n "getRawEvents\|appendRawEvent\|appendEvent\|readEvents\|loadEvents" src/core/persistence/repositories/campaignRepository.ts
grep -n "getRawEvents\|appendRawEvent\|appendEvent\|readEvents\|loadEvents" src/core/persistence/eventStore/eventStore.ts
```

If no raw event reader exists, add one to EventStore:

```ts
async getRawEvents(campaignId: CampaignId): Promise<StoredEvent[]> {
  const file = this.eventsFile(campaignId);
  const content = await fs.readFile(file, "utf-8").catch(() => "");
  return content.trim().split("\n").filter(Boolean).map(l => JSON.parse(l) as StoredEvent);
}
```

- [ ] **Step 4: Update campaignRoutes.ts to use executeCommand**

Find the duplication route (around line 340-360) and replace direct `appendEvent` calls:

```ts
// Replace the for-loop with appendEvent calls with:
await repo.executeCommand(newCampaignId as CampaignId, {
  type: "DuplicateCampaign",
  sourceCampaignId: campaignId as CampaignId,
  newCampaignId: newCampaignId as CampaignId,
  newTitle,
  actorId: "usr_dm",
});
```

- [ ] **Step 5: Run typecheck + tests**

```bash
npm run typecheck:all && npm test
```

Expected: 0 errors, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/core/application/commands.ts src/core/application/commandBus.ts src/core/persistence/ src/backend/server/routes/campaignRoutes.ts
git commit -m "feat(domain): route campaign duplication through commandBus"
```

---

## WAVE 1B — Server Routes `any` Types (run parallel with 1A)

### Task 3: Eliminate `as any` in Server Routes

**Context:** Routes in `entityRoutes.ts`, `factRoutes.ts`, `relationRoutes.ts` use `as any` for request bodies, campaign IDs, and server decorations. Fix with proper Fastify typed routes + a server type augmentation for `dmSessionToken`.

**Files:**

- Create: `src/backend/server/fastifyDeclarations.d.ts`
- Modify: `src/backend/server/routes/entityRoutes.ts`
- Modify: `src/backend/server/routes/factRoutes.ts`
- Modify: `src/backend/server/routes/relationRoutes.ts`
- Modify: `src/backend/server/routes/sessionRoutes.ts` (check for any)
- Modify: `src/backend/server/helpers.ts` (use typed server)

**Interfaces:**

- Produces: `FastifyInstance` augmented with `dmSessionToken: string`; typed route bodies

- [ ] **Step 1: Create Fastify type augmentation**

Create `src/backend/server/fastifyDeclarations.d.ts`:

```ts
import "fastify";
declare module "fastify" {
  interface FastifyInstance {
    dmSessionToken: string;
  }
}
```

Add to tsconfig.node.json `include` array: `"src/backend/server/fastifyDeclarations.d.ts"` (or it may be picked up automatically if already under `src/`).

- [ ] **Step 2: Fix entityRoutes.ts — define body schemas**

At the top of `entityRoutes.ts`, import Zod schemas and define typed route generics:

```ts
import type { CampaignId } from "@core/domain/campaign/types.js";

// For POST /entities body:
type CreateEntityBody = {
  entityType: string;
  title: string;
  subtitle?: string;
  summary?: string;
  visibility?: unknown;
  metadata?: Record<string, unknown>;
};

type UpdateEntityBody = {
  title?: string;
  subtitle?: string;
  summary?: string;
  status?: string;
  visibility?: unknown;
  metadata?: Record<string, unknown>;
};
```

Replace route type params:

```ts
// Before:
server.post<{ Params: { campaignId: string }; Body: any }>(...
// After:
server.post<{ Params: { campaignId: string }; Body: CreateEntityBody }>(...
```

Remove `as any` on `request.body` — access fields directly since body is typed.

Replace `campaignId as any` with `campaignId as CampaignId`.

Replace `(server as any).dmSessionToken` with `server.dmSessionToken` (after augmentation).

- [ ] **Step 3: Fix factRoutes.ts**

Define body types similarly:

```ts
type CreateFactBody = {
  statement: string;
  kind: string;
  confidence: string;
  visibility?: unknown;
  source?: unknown;
  relatedEntityIds?: string[];
};
type UpdateFactBody = Partial<CreateFactBody>;
```

Apply same pattern: typed route generics, remove `as any`.

- [ ] **Step 4: Fix relationRoutes.ts**

```ts
type CreateRelationBody = {
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  label?: string;
  description?: string;
  visibility?: unknown;
};
type UpdateRelationBody = Partial<Pick<CreateRelationBody, "label" | "description" | "visibility">>;
```

- [ ] **Step 5: Fix remaining routes (scan)**

```bash
grep -rn "as any\|body as any\|query as any" src/backend/server/routes/ --include="*.ts"
```

Fix each remaining `as any`. For `(request.query as any)?.force`, use:

```ts
const force = (request.query as Record<string, string>)?.force === "true";
```

Or add query type to route generic: `Query: { force?: string }`.

- [ ] **Step 6: Run typecheck + tests**

```bash
npm run typecheck:all && npm test
```

Expected: 0 errors, all tests pass

- [ ] **Step 7: Commit**

```bash
git add src/backend/server/
git commit -m "refactor(server): replace as-any casts with typed Fastify routes and server augmentation"
```

---

## WAVE 2A — Fact Source Visibility in UI (run parallel with 2B)

### Task 4: Show Fact Source in EntityDetailModal

**Context:** Facts have a `source` field (`{ kind: "session" | "preparation" | "manual" | "player" | "import" }`). The EntityDetailModal "Hechos" tab shows facts but not their source. Add a source badge/chip below each fact statement.

**Files:**

- Modify: `src/frontend/dm/entities/EntityDetailModal.tsx` (Hechos tab)
- Modify: `src/frontend/shared/i18n/translations/` (add source label keys for all 6 langs)

**Interfaces:**

- Consumes: `Fact.source` (already in store data)
- Produces: Visual source chip in facts list

- [ ] **Step 1: Read EntityDetailModal Hechos tab**

```bash
grep -n "Hecho\|fact\|hechos" src/frontend/dm/entities/EntityDetailModal.tsx | head -30
```

Locate where facts are rendered (look for `facts.map` or similar).

- [ ] **Step 2: Add formatFactSource helper inside EntityDetailModal**

Add a helper function before the component return:

```ts
function formatFactSource(source: { kind: string; sessionId?: string; note?: string; playerId?: string; importId?: string } | undefined, sessions: Array<{ sessionId: string; number?: number; title?: string }>, t: (key: string, params?: Record<string, unknown>) => string): string {
  if (!source) return "";
  switch (source.kind) {
    case "session": {
      const s = sessions.find(s => s.sessionId === source.sessionId);
      return s ? t("factSource.session", { number: s.number ?? "?", title: s.title || "" }) : t("factSource.sessionUnknown");
    }
    case "preparation": return t("factSource.preparation");
    case "manual": return source.note ? t("factSource.manualWithNote", { note: source.note }) : t("factSource.manual");
    case "player": return t("factSource.player");
    case "import": return t("factSource.import");
    default: return "";
  }
}
```

- [ ] **Step 3: Render source chip in Hechos tab**

Find where each fact's statement is rendered. After the statement `<p>` or `<span>`, add:

```tsx
{fact.source && (
  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
    <span style={{ opacity: 0.6 }}>⌖</span>
    {formatFactSource(fact.source, campaignState?.sessions ?? [], t)}
  </span>
)}
```

- [ ] **Step 4: Add i18n keys**

In all 6 language files (`es.ts`, `en.ts`, `fr.ts`, `de.ts`, `it.ts`, `pt.ts`), add under a `factSource` key:

```ts
factSource: {
  session: "Sesión {{number}}: {{title}}",  // es
  sessionUnknown: "Sesión desconocida",
  preparation: "Preparación",
  manual: "Entrada manual",
  manualWithNote: "Manual: {{note}}",
  player: "Portal del jugador",
  import: "Importado",
}
```

Translate appropriately for each language. For en:

```ts
factSource: {
  session: "Session {{number}}: {{title}}",
  sessionUnknown: "Unknown session",
  preparation: "Preparation",
  manual: "Manual entry",
  manualWithNote: "Manual: {{note}}",
  player: "Player portal",
  import: "Imported",
}
```

- [ ] **Step 5: Run typecheck + tests**

```bash
npm run typecheck:app && npm test
```

Expected: 0 errors, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/frontend/dm/entities/EntityDetailModal.tsx src/frontend/shared/i18n/
git commit -m "feat(ui): show fact source (session/preparation/manual) in entity detail Hechos tab"
```

---

## WAVE 2B — Global Keyboard Shortcuts (run parallel with 2A)

### Task 5: Global Keyboard Shortcuts System

**Context:** No global shortcut system exists. DMs need fast access during sessions. Implement 6 shortcuts active within the campaign shell. Shortcuts are DM-only (only active when role = "dm").

**Shortcuts:**

- `g d` → go to dashboard
- `g s` → go to session
- `g e` → go to entities
- `g b` → go to boards
- `/` → focus global search (navigate to search page)
- `n` → open new entity modal (same as the + button)

**Files:**

- Create: `src/frontend/shared/hooks/useKeyboardShortcuts.ts`
- Modify: `src/frontend/dm/layouts/CampaignShell.tsx`

**Interfaces:**

- Produces: `useKeyboardShortcuts(shortcuts: ShortcutMap, enabled: boolean): void`

- [ ] **Step 1: Create useKeyboardShortcuts hook**

Create `src/frontend/shared/hooks/useKeyboardShortcuts.ts`:

```ts
import { useEffect, useRef } from "react";

export type ShortcutHandler = () => void;
export type ShortcutMap = Record<string, ShortcutHandler>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled: boolean): void {
  const pendingKey = useRef<string | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in input, textarea, select, or contenteditable
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable) return;
      // Ignore modifier combos (except shift for /)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // Single-key shortcuts
      if (!pendingKey.current) {
        if (shortcuts[key]) {
          e.preventDefault();
          shortcuts[key]();
          return;
        }
        // Check if it's the start of a chord (g d, g s, etc.)
        if (key === "g") {
          pendingKey.current = "g";
          pendingTimer.current = setTimeout(() => { pendingKey.current = null; }, 1000);
          return;
        }
      }

      // Chord resolution
      if (pendingKey.current === "g") {
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
        pendingKey.current = null;
        const chord = `g ${key}`;
        if (shortcuts[chord]) {
          e.preventDefault();
          shortcuts[chord]();
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, [shortcuts, enabled]);
}
```

- [ ] **Step 2: Write test for useKeyboardShortcuts**

Create `src/frontend/shared/hooks/useKeyboardShortcuts.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts.js";

function fireKey(key: string, target: EventTarget = document) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("useKeyboardShortcuts", () => {
  it("calls single-key handler", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ n: handler }, true));
    fireKey("n");
    expect(handler).toHaveBeenCalledOnce();
  });

  it("calls chord handler (g d)", async () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ "g d": handler }, true));
    fireKey("g");
    fireKey("d");
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does not fire when disabled", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ n: handler }, false));
    fireKey("n");
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores keys typed in input", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ n: handler }, true));
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireKey("n", input);
    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
```

Run: `npm test -- --run src/frontend/shared/hooks/useKeyboardShortcuts.test.ts`
Expected: 4 tests pass

- [ ] **Step 3: Integrate into CampaignShell**

In `src/frontend/dm/layouts/CampaignShell.tsx`, add import:

```ts
import { useKeyboardShortcuts } from "../../shared/hooks/useKeyboardShortcuts.js";
```

Inside the `CampaignShell` component, after `const navigate = useNavigate()` and `campaignId`, add:

```ts
const isDM = sessionStorage.getItem("dmcc_role") === "dm" || !sessionStorage.getItem("dmcc_role");

useKeyboardShortcuts({
  "g d": () => navigate({ to: `/campaigns/${campaignId}/dashboard` }),
  "g s": () => navigate({ to: `/campaigns/${campaignId}/session` }),
  "g e": () => navigate({ to: `/campaigns/${campaignId}/entities` }),
  "g b": () => navigate({ to: `/campaigns/${campaignId}/boards` }),
  "/": () => navigate({ to: `/campaigns/${campaignId}/search` }),
  "n": () => setIsEntityModalOpen(true),
}, isDM);
```

- [ ] **Step 4: Run all tests**

```bash
npm run typecheck:app && npm test
```

Expected: 0 errors, all 147+ tests pass (4 new shortcut tests)

- [ ] **Step 5: Commit**

```bash
git add src/frontend/shared/hooks/useKeyboardShortcuts.ts src/frontend/shared/hooks/useKeyboardShortcuts.test.ts src/frontend/dm/layouts/CampaignShell.tsx
git commit -m "feat(ui): global keyboard shortcuts for DM (g+d/s/e/b, /, n)"
```

---

## WAVE 3A — URL Routing Fix (after Wave 1+2 merged)

### Task 6: Remove Duplicate Campaign Page Rendering from App.tsx

**Context:** App.tsx at `/dm` renders campaign pages (Dashboard, Session, etc.) based on `currentPage` derived from URL. CampaignShell at `/campaigns/$campaignId/*` does the same via Router Outlet. The duplication means navigating to `/dm` with an active campaign shows campaign UI at the wrong URL. Fix: App.tsx only shows the campaign list/landing; navigating into a campaign always goes to `/campaigns/$campaignId/dashboard`.

**Files:**

- Modify: `src/frontend/App.tsx` (strip campaign page rendering, add redirect)

**Interfaces:**

- Produces: App.tsx renders only campaign list. URL `/dm` never shows campaign pages.

- [ ] **Step 1: Add redirect when activeCampaignId exists at /dm**

In `App.tsx`, find the `useEffect` calls (around line 85-130). Add:

```ts
// Redirect to campaign shell if already have active campaign
useEffect(() => {
  if (activeCampaignId && pathname === "/dm") {
    navigate({ to: `/campaigns/${activeCampaignId}/dashboard` });
  }
}, [activeCampaignId, pathname]);
```

- [ ] **Step 2: Find where campaign pages are conditionally rendered**

Look for `{currentPage === "dashboard" && ...}` and all similar blocks (around line 1005-1140). Identify all page branches.

- [ ] **Step 3: Remove campaign page rendering blocks**

Delete all page rendering blocks that belong to CampaignShell:

```tsx
// DELETE these blocks:
{currentPage === "dashboard" && dashboard && <DashboardPage ... />}
{currentPage === "what-now" && whatNow && <WhatNowPage ... />}
{currentPage === "session" && <SessionPage ... />}
{currentPage === "entities" && <EntitiesPage ... />}
{currentPage === "graph" && graph && <GraphPage ... />}
{currentPage === "timeline" && timeline && <TimelinePage ... />}
{currentPage === "search" && <SearchPage ... />}
{currentPage === "rules" && <RulesPage ... />}
{currentPage === "players" && <PlayersPage ... />}
{currentPage === "boards" && <BoardsPage ... />}
{currentPage === "settings" && <SettingsPage ... />}
```

- [ ] **Step 4: Remove campaign sidebar / nav from App.tsx**

Find the campaign shell sidebar in App.tsx (renders when `selectedCampaignId` is set). Remove it entirely — CampaignShell handles this. App.tsx should only render the campaign list UI (the "landing" view).

- [ ] **Step 5: Remove unused imports**

After removing page renders, many page component imports will be unused. Remove them:

```ts
// Remove these imports from App.tsx:
import { TimelinePage } from "./dm/sessions/TimelinePage.js";
import { SearchPage } from "./dm/pages/SearchPage.js";
import { BoardsPage } from "./dm/pages/BoardsPage.js";
import { RulesPage } from "./dm/pages/RulesPage.js";
import { DashboardPage } from "./dm/pages/DashboardPage.js";
import { WhatNowPage } from "./dm/pages/WhatNowPage.js";
import { PlayersPage } from "./dm/pages/PlayersPage.js";
import { SessionPage } from "./dm/sessions/SessionPage.js";
import { EntitiesPage } from "./dm/entities/EntitiesPage.js";
import { GraphPage } from "./dm/graph/GraphPage.js";
import { SettingsPage } from "./dm/pages/SettingsPage.js";
```

Also remove unused state: `currentPage` related variables, `graphTypeFilter`, `selectedEntity`, etc. — anything only used inside the now-deleted page blocks.

- [ ] **Step 6: Run typecheck + tests + verify**

```bash
npm run typecheck:all && npm test
```

Expected: 0 errors, all tests pass

Verify manually: `npm run dev`, navigate to `/dm`, select a campaign → should redirect to `/campaigns/$campaignId/dashboard`. Browser back button should work.

- [ ] **Step 7: Commit**

```bash
git add src/frontend/App.tsx
git commit -m "refactor(routing): App.tsx is campaign list only — campaign pages served by CampaignShell routes"
```

---

## WAVE 3B — Onboarding Wizard (run parallel with 3C after Wave 2 merged)

### Task 7: New Campaign Onboarding Wizard

**Context:** First-time users land on SmartLanding with no campaigns. Currently there's only a raw "create campaign" form with no guidance. Add a 3-step onboarding: (1) Name + system, (2) Pick template (empty/starter), (3) Confirm + create.

**Files:**

- Create: `src/frontend/dm/pages/OnboardingPage.tsx`
- Modify: `src/frontend/SmartLanding.tsx` (show onboarding when 0 campaigns)
- Modify: `src/frontend/router.tsx` (add `/onboarding` route)
- Modify: `src/frontend/shared/i18n/` (add onboarding keys for all 6 langs)

**Interfaces:**

- Consumes: `useCampaignStore().createCampaign()`
- Produces: Multi-step wizard component; on complete, navigates to new campaign dashboard

- [ ] **Step 1: Add i18n keys (all 6 languages)**

Add to each language file under `onboarding:`:

```ts
// es.ts
onboarding: {
  step1Title: "¡Bienvenido, Dungeon Master!",
  step1Desc: "Vamos a crear tu primera campaña. Esto solo tomará un momento.",
  step1NameLabel: "Nombre de la campaña",
  step1NamePlaceholder: "Ej: La Sombra del Oráculo",
  step1SystemLabel: "Sistema de juego",
  step2Title: "Elige una plantilla",
  step2Empty: "Campaña vacía",
  step2EmptyDesc: "Empieza desde cero con total libertad",
  step2Starter: "Campaña inicial",
  step2StarterDesc: "Incluye PJs, localizaciones y misiones de ejemplo",
  step3Title: "Confirma tu campaña",
  step3Summary: "Campaña: {{title}} · Sistema: {{system}} · Plantilla: {{template}}",
  createBtn: "Crear campaña",
  back: "Atrás",
  next: "Siguiente",
}
```

English equivalent:

```ts
// en.ts
onboarding: {
  step1Title: "Welcome, Dungeon Master!",
  step1Desc: "Let's create your first campaign. This will only take a moment.",
  step1NameLabel: "Campaign name",
  step1NamePlaceholder: "E.g.: Shadows of the Oracle",
  step1SystemLabel: "Game system",
  step2Title: "Choose a template",
  step2Empty: "Empty campaign",
  step2EmptyDesc: "Start from scratch with full freedom",
  step2Starter: "Starter campaign",
  step2StarterDesc: "Includes sample PCs, locations and quests",
  step3Title: "Confirm your campaign",
  step3Summary: "Campaign: {{title}} · System: {{system}} · Template: {{template}}",
  createBtn: "Create campaign",
  back: "Back",
  next: "Next",
}
```

Add translated equivalents for `fr`, `de`, `it`, `pt`.

- [ ] **Step 2: Create OnboardingPage component**

Create `src/frontend/dm/pages/OnboardingPage.tsx`:

```tsx
import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { generateId } from "@shared/ids.js";

const SYSTEMS = [
  { value: "generic_fantasy_d20", label: "D&D 5e / D20 Fantasy" },
  { value: "pathfinder2e", label: "Pathfinder 2e" },
  { value: "shadowdark", label: "Shadowdark" },
  { value: "generic", label: "Sistema personalizado" },
];

export function OnboardingPage() {
  const { t } = useTranslation();
  const { createCampaign } = useCampaignStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [system, setSystem] = useState("generic_fantasy_d20");
  const [template, setTemplate] = useState<"empty" | "starter">("empty");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const campaignId = await createCampaign({ title: title.trim(), system, template });
      navigate({ to: `/campaigns/${campaignId}/dashboard` });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creating campaign");
      setCreating(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
      <div style={{ width: "100%", maxWidth: "480px", padding: "40px 24px" }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", justifyContent: "center" }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ width: "32px", height: "4px", borderRadius: "2px", background: n <= step ? "var(--primary)" : "var(--border-color)" }} />
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{t("onboarding.step1Title")}</h1>
            <p style={{ color: "var(--text-muted)" }}>{t("onboarding.step1Desc")}</p>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>{t("onboarding.step1NameLabel")}</label>
              <input
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t("onboarding.step1NamePlaceholder")}
                onKeyDown={e => e.key === "Enter" && title.trim() && setStep(2)}
                autoFocus
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>{t("onboarding.step1SystemLabel")}</label>
              <select className="input" value={system} onChange={e => setSystem(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }}>
                {SYSTEMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" disabled={!title.trim()} onClick={() => setStep(2)} style={{ width: "100%" }}>
              {t("onboarding.next")}
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{t("onboarding.step2Title")}</h1>
            {(["empty", "starter"] as const).map(t_ => (
              <button
                key={t_}
                className={`card ${template === t_ ? "card--selected" : ""}`}
                onClick={() => setTemplate(t_)}
                style={{ textAlign: "left", cursor: "pointer", border: template === t_ ? "2px solid var(--primary)" : "2px solid var(--border-color)", padding: "16px", borderRadius: "8px", background: "none" }}
              >
                <strong>{t(`onboarding.step2${t_ === "empty" ? "Empty" : "Starter"}`)}</strong>
                <p style={{ color: "var(--text-muted)", marginTop: "4px", fontSize: "0.85rem" }}>{t(`onboarding.step2${t_ === "empty" ? "Empty" : "Starter"}Desc`)}</p>
              </button>
            ))}
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>{t("onboarding.back")}</button>
              <button className="btn btn-primary" onClick={() => setStep(3)} style={{ flex: 1 }}>{t("onboarding.next")}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{t("onboarding.step3Title")}</h1>
            <div className="card" style={{ padding: "16px", borderRadius: "8px" }}>
              <p>{t("onboarding.step3Summary", { title, system: SYSTEMS.find(s => s.value === system)?.label ?? system, template })}</p>
            </div>
            {error && <p style={{ color: "var(--error)", fontSize: "0.85rem" }}>{error}</p>}
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>{t("onboarding.back")}</button>
              <button className="btn btn-primary" disabled={creating} onClick={handleCreate} style={{ flex: 1 }}>{t("onboarding.createBtn")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add /onboarding route in router.tsx**

```ts
// Add lazy import at top:
const OnboardingPageLazy = React.lazy(() => import("./dm/pages/OnboardingPage.js").then((m) => ({ default: m.OnboardingPage })));

// Add route:
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: withSuspense(OnboardingPageLazy),
});

// Add to routeTree:
const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,  // ← add this
  dmRoute,
  ...
]);
```

- [ ] **Step 4: Redirect to /onboarding from SmartLanding when 0 campaigns**

In `src/frontend/SmartLanding.tsx`, find where campaigns are loaded. Add:

```ts
useEffect(() => {
  if (!loading && campaigns.length === 0 && !dmSetupNeeded) {
    navigate({ to: "/onboarding" });
  }
}, [campaigns, loading, dmSetupNeeded]);
```

(Check actual variable names in SmartLanding.tsx — adjust to match.)

- [ ] **Step 5: Run typecheck + tests**

```bash
npm run typecheck:all && npm test
```

Expected: 0 errors, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/frontend/dm/pages/OnboardingPage.tsx src/frontend/router.tsx src/frontend/SmartLanding.tsx src/frontend/shared/i18n/
git commit -m "feat(ui): 3-step onboarding wizard for new DM accounts with zero campaigns"
```

---

## WAVE 3C — Player Knowledge Comparison Page (run parallel with 3B)

### Task 8: Player Knowledge Comparison View

**Context:** The DM needs to see, per player character, what entities/facts are visible to them vs. what the DM knows. The `VisibilityProjection` and `PlayerPortalProjection` already compute per-player visible entities. Build a new page that shows a comparison matrix.

**Files:**

- Create: `src/frontend/dm/pages/PlayerKnowledgePage.tsx`
- Modify: `src/frontend/router.tsx` (add `/campaigns/$campaignId/knowledge` route)
- Modify: `src/frontend/dm/layouts/CampaignShell.tsx` (add nav item)
- Modify: `src/frontend/shared/i18n/` (add knowledge page keys all 6 langs)
- Modify: `src/backend/server/routes/projectionRoutes.ts` (add knowledge endpoint if needed)

**Interfaces:**

- Consumes: `/api/vaults/:vaultId/campaigns/:campaignId/visibility` (check if exists) or `campaignState`
- Produces: Page at `/campaigns/$campaignId/knowledge` listing per-PC visible entities

- [ ] **Step 1: Audit what visibility data is available client-side**

```bash
grep -n "visibility\|playerPortal\|visibleTo" src/frontend/shared/stores/campaignStore.ts | head -20
grep -n "visibility\|audience" src/backend/server/routes/projectionRoutes.ts | head -20
```

Determine if visibility projection is already fetched in the store. If `campaignState.visibility` exists and contains per-player data, use it. If not, add a dedicated API call.

- [ ] **Step 2: Check visibility projection structure**

```bash
grep -n "export\|interface\|type " src/core/projections/campaignProjection.ts | head -40
```

Find the `visibility` field in `CampaignProjection`. It contains the `VisibilityProjection` with audience filtering.

- [ ] **Step 3: Create PlayerKnowledgePage**

Create `src/frontend/dm/pages/PlayerKnowledgePage.tsx`:

```tsx
import React, { useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { EntityDetailModal } from "../entities/EntityDetailModal.js";
import { Eye, EyeOff, User } from "lucide-react";

export function PlayerKnowledgePage() {
  const { t } = useTranslation();
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  const { campaignState } = useCampaignStore();
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  const players = useMemo(() =>
    campaignState?.players?.filter(p => !p.archived) ?? [],
    [campaignState]
  );

  const entities = useMemo(() =>
    campaignState?.entities?.filter(e => !e.archived) ?? [],
    [campaignState]
  );

  // Build visibility matrix: for each entity, which players can see it?
  const matrix = useMemo(() => {
    return entities.map(entity => {
      const vis = entity.visibility;
      const visibleToPlayers: string[] = [];

      if (!vis || vis.kind === "dm_only") {
        // No players
      } else if (vis.kind === "public" || vis.kind === "party") {
        players.forEach(p => visibleToPlayers.push(p.playerId));
      } else if (vis.kind === "players" && Array.isArray(vis.playerIds)) {
        visibleToPlayers.push(...vis.playerIds);
      }

      return { entity, visibleToPlayers };
    });
  }, [entities, players]);

  if (!campaignState) {
    return <div style={{ color: "var(--text-muted)", padding: "24px" }}>{t("common.loading")}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontWeight: "700" }}>{t("playerKnowledge.title")}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{t("playerKnowledge.subtitle")}</p>
      </div>

      {players.length === 0 && (
        <div className="card" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
          {t("playerKnowledge.noPlayers")}
        </div>
      )}

      {players.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--border-color)", position: "sticky", left: 0, background: "var(--bg-main)" }}>
                  {t("playerKnowledge.entityColumn")}
                </th>
                {players.map(p => (
                  <th key={p.playerId} style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-color)", textAlign: "center", minWidth: "80px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <User size={14} />
                      <span>{p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(({ entity, visibleToPlayers }) => (
                <tr key={entity.entityId} style={{ borderBottom: "1px solid var(--border-color-subtle, var(--border-color))" }}>
                  <td
                    style={{ padding: "8px 12px", cursor: "pointer", color: "var(--primary)", position: "sticky", left: 0, background: "var(--bg-main)" }}
                    onClick={() => setSelectedEntity(entity)}
                  >
                    {entity.title}
                    <span style={{ marginLeft: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {t(`entityTypes.${entity.entityType}`, { defaultValue: entity.entityType })}
                    </span>
                  </td>
                  {players.map(p => (
                    <td key={p.playerId} style={{ padding: "8px 12px", textAlign: "center" }}>
                      {visibleToPlayers.includes(p.playerId)
                        ? <Eye size={16} style={{ color: "var(--success, #22c55e)" }} />
                        : <EyeOff size={16} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEntity && (
        <EntityDetailModal
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Add i18n keys**

Add to all 6 language files:

```ts
// es.ts
playerKnowledge: {
  title: "Conocimiento por jugador",
  subtitle: "Qué puede ver cada PJ en comparación con lo que sabe el DM",
  noPlayers: "No hay jugadores en esta campaña todavía",
  entityColumn: "Entidad",
}
// en.ts
playerKnowledge: {
  title: "Player knowledge",
  subtitle: "What each PC can see compared to what the DM knows",
  noPlayers: "No players in this campaign yet",
  entityColumn: "Entity",
}
```

Translate for `fr`, `de`, `it`, `pt`.

- [ ] **Step 5: Add route**

In `router.tsx`:

```ts
const PlayerKnowledgePageLazy = React.lazy(() => import("./dm/pages/PlayerKnowledgePage.js").then((m) => ({ default: m.PlayerKnowledgePage })));

const knowledgeRoute = createRoute({
  getParentRoute: () => campaignRoute,
  path: "/knowledge",
  component: withSuspense(PlayerKnowledgePageLazy),
});

// Add to campaignRoute.addChildren([..., knowledgeRoute])
```

- [ ] **Step 6: Add nav item to CampaignShell**

In `CampaignShell.tsx`, add `Users` to lucide imports and add to NAV array:

```ts
import { ..., Users } from "lucide-react";

// In NAV array, after "players":
{ path: "knowledge", label: t("campaignShell.nav.knowledge"), Icon: Users },
```

Add i18n key `campaignShell.nav.knowledge` = "Conocimiento" (es) / "Knowledge" (en) etc.

Add `knowledge` entry to `PAGE_META` in CampaignShell:

```ts
knowledge: {
  titleKey: "campaignShell.meta.knowledgeTitle",
  eyebrowKey: "campaignShell.meta.knowledgeEyebrow",
  descriptionKey: "campaignShell.meta.knowledgeDescription",
},
```

Add corresponding i18n keys.

- [ ] **Step 7: Run typecheck + tests**

```bash
npm run typecheck:all && npm test
```

Expected: 0 errors, all tests pass

- [ ] **Step 8: Commit**

```bash
git add src/frontend/dm/pages/PlayerKnowledgePage.tsx src/frontend/router.tsx src/frontend/dm/layouts/CampaignShell.tsx src/frontend/shared/i18n/
git commit -m "feat(ui): player knowledge comparison page — visibility matrix per entity per PC"
```

---

## Execution Order

```text
Wave 1A + Wave 1B  →  merge  →  Wave 2A + Wave 2B  →  merge  →  Wave 3A + Wave 3B + Wave 3C
(parallel)                       (parallel)                        (parallel)
```

- Wave 1A: Tasks 1 + 2 (same agent, domain only)
- Wave 1B: Task 3 (separate agent, server routes only)
- Wave 2A: Task 4 (EntityDetailModal fact source)
- Wave 2B: Task 5 (keyboard shortcuts)
- Wave 3A: Task 6 (App.tsx routing fix)
- Wave 3B: Task 7 (onboarding wizard)
- Wave 3C: Task 8 (player knowledge page)
