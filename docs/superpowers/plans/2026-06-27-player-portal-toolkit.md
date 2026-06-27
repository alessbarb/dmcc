# Player Portal Toolkit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the player portal toolkit: persistent player tokens, player-character sync, live state/resources/notes/objectives, proposal review, DM visibility, and a functional player portal UI.

**Architecture:** Keep campaign canon and player-live state separate. Add dedicated player portal events and a `PlayerPortalProjection`; expose player-safe and DM-safe Fastify routes; keep structural character changes behind proposals. First enable multi-event command handling so approval can atomically persist proposal resolution plus canonical entity update.

**Tech Stack:** TypeScript, Fastify, React 19, Zustand, Zod, Vitest, existing NDJSON event sourcing.

---

## Source spec

Implement from:

- `docs/superpowers/specs/2026-06-27-player-portal-toolkit-design.md`

Priority order:

1. Player tools: state, resources, notes, objectives, DM questions.
2. Narrative clarity: History tab exists as a stub in this plan; full narrative grouping is a later plan.
3. Visual polish: only minimal layout cleanup needed for functional UI in this plan.

## Scope for this plan

In scope:

- Multi-event CommandBus foundation.
- Dedicated player portal types and projection.
- Persistent per-player tokens stored as `tokenHash`, not raw token.
- Player-safe portal API.
- DM-safe summary/link/proposal review API.
- Functional player portal UI sections: Summary, Character/State, Resources, Diary, Objectives, History stub.
- Players page DM subsection for portal state and proposals.
- Server tests and projection tests.

Out of scope:

- WebSockets/live push.
- Full class automation.
- Full History/narrative grouping.
- Mobile redesign beyond simple usable layout.
- Player-to-player sharing.

## File structure

Create:

```text
src/domain/playerPortal/types.ts
src/projections/playerPortalProjection.ts
src/server/routes/playerPortalRoutes.ts
tests/application/multiEventCommandBus.test.ts
tests/projections/playerPortalProjection.test.ts
tests/server/playerPortalRoutes.test.ts
```

Modify:

```text
src/application/commands.ts
src/application/commandBus.ts
src/domain/shared/events.ts
src/persistence/repositories/campaignRepository.ts
src/projections/campaignProjection.ts
src/server/auth.ts
src/server/createServer.ts
src/server/routes/playerRoutes.ts
src/app/stores/campaignStore.ts
src/app/components/PlayerPortalView.tsx
src/app/pages/PlayersPage.tsx
```

Keep responsibilities clear:

- `domain/playerPortal/types.ts`: TypeScript interfaces, constants, small pure helpers.
- `projections/playerPortalProjection.ts`: derives portal state from stored events and campaign projection; no HTTP logic.
- `server/routes/playerPortalRoutes.ts`: auth, request validation, commands/endpoints.
- `campaignStore.ts`: HTTP client methods only; no portal business rules.
- `PlayerPortalView.tsx`: player-facing UI and local form state.
- `PlayersPage.tsx`: DM-facing portal summary/review subsection.

---

### Task 1: CommandBus supports multi-event command results

**Files:**

- Modify: `src/application/commandBus.ts`
- Modify: `src/persistence/repositories/campaignRepository.ts`
- Test: `tests/application/multiEventCommandBus.test.ts`

**Why:** Proposal approval must persist `PlayerCharacterProposalResolved` and `EntityUpdated` as one command result. Existing handlers should continue emitting exactly one event.

- [ ] **Step 1: Write failing test for single-event compatibility**

Create `tests/application/multiEventCommandBus.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { handleCommand } from "../../src/application/commandBus.js";
import type { CampaignState } from "../../src/domain/state.js";

function emptyState(campaignId = "cmp_multi"): CampaignState {
  return {
    campaignId: campaignId as any,
    campaign: null,
    entities: new Map(),
    relations: new Map(),
    facts: new Map(),
    sessions: new Map(),
    sessionEvents: new Map(),
    players: new Map(),
    tags: new Map(),
    canvases: new Map(),
  } as CampaignState;
}

describe("multi-event command bus", () => {
  it("wraps existing single event handlers in an events array", () => {
    const result = handleCommand(emptyState(), {
      type: "CreateCampaign",
      campaignId: "cmp_multi" as any,
      actorId: "usr_dm",
      title: "Multi Event Campaign",
    });

    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe("CampaignCreated");
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm test -- tests/application/multiEventCommandBus.test.ts
```

Expected: FAIL because `result.events` is undefined and current `CommandResult` exposes `event`.

- [ ] **Step 3: Change CommandResult shape**

In `src/application/commandBus.ts`, change the interface:

```ts
export interface CommandResult {
  state: CampaignState;
  events: StoredEvent[];
}
```

Add helper near `makeEvent`:

```ts
function singleEvent(state: CampaignState, event: StoredEvent): CommandResult {
  return { state, events: [event] };
}
```

Then update each `return { state: ..., event: makeEvent(...) }` to:

```ts
return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "CampaignCreated", campaign));
```

For handlers that currently inline object literals, keep the existing event payload exactly the same and only wrap with `singleEvent(...)`.

- [ ] **Step 4: Update repository persistence loop**

In `src/persistence/repositories/campaignRepository.ts`, replace:

```ts
const event = result.event;
return this.appendEvent(campaignId, event.type as DomainEventType, event.actorId, event.payload);
```

with:

```ts
let projection = await this.getCampaignState(campaignId);
for (const event of result.events) {
  projection = await this.appendEvent(campaignId, event.type as DomainEventType, event.actorId, event.payload);
}
return projection;
```

This serializes all events through the existing event store queue. It does not provide filesystem transaction rollback, but it guarantees command-generated events are appended in order and no parallel writer interleaves them.

- [ ] **Step 5: Run test and full server tests**

Run:

```bash
npm test -- tests/application/multiEventCommandBus.test.ts tests/server/createServer.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/application/commandBus.ts src/persistence/repositories/campaignRepository.ts tests/application/multiEventCommandBus.test.ts
git commit -m "refactor: support multi-event command results"
```

---

### Task 2: Add player portal event schemas and domain types

**Files:**

- Create: `src/domain/playerPortal/types.ts`
- Modify: `src/domain/shared/events.ts`
- Test: `tests/projections/playerPortalProjection.test.ts` begins here with projection schema smoke coverage.

**Interfaces to add:**

```ts
export type PlayerCharacterOwnership = "campaign_premade" | "player_owned";
export type PlayerCharacterSyncMode = "live_player_editable" | "dm_review_required";
export type PlayerPortalVisibility = "private" | "dm_visible";
export type PlayerPortalObjectiveKind = "personal" | "session" | "question_for_dm";
export type PlayerPortalObjectiveStatus = "open" | "done" | "archived";
export type PlayerCharacterProposalKind = "create_character" | "update_character_core";
export type PlayerCharacterProposalStatus = "pending" | "approved" | "rejected";
export type PlayerPortalUpdatedBy = "player" | "dm";
```

- [ ] **Step 1: Create domain type file**

Create `src/domain/playerPortal/types.ts`:

```ts
export type PlayerCharacterOwnership = "campaign_premade" | "player_owned";
export type PlayerCharacterSyncMode = "live_player_editable" | "dm_review_required";
export type PlayerPortalVisibility = "private" | "dm_visible";
export type PlayerPortalObjectiveKind = "personal" | "session" | "question_for_dm";
export type PlayerPortalObjectiveStatus = "open" | "done" | "archived";
export type PlayerCharacterProposalKind = "create_character" | "update_character_core";
export type PlayerCharacterProposalStatus = "pending" | "approved" | "rejected";
export type PlayerPortalUpdatedBy = "player" | "dm";

export interface PlayerTokenRecord {
  tokenId: string;
  tokenHash: string;
  campaignId: string;
  playerId: string;
  label?: string;
  createdAt: string;
  revokedAt?: string;
}

export interface PlayerCharacterLink {
  campaignId: string;
  playerId: string;
  characterEntityId: string;
  ownership: PlayerCharacterOwnership;
  syncMode: PlayerCharacterSyncMode;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerCharacterLiveStatus {
  hitPointsCurrent?: number;
  hitPointsMax?: number;
  armorClass?: number;
  inspiration?: boolean;
  conditions: string[];
}

export interface PlayerResource {
  resourceId: string;
  label: string;
  current: number;
  max: number;
  recovery?: "short_rest" | "long_rest" | "manual";
}

export interface PlayerCharacterSheetState {
  campaignId: string;
  playerId: string;
  characterEntityId: string;
  status: PlayerCharacterLiveStatus;
  resources: PlayerResource[];
  updatedBy: PlayerPortalUpdatedBy;
  updatedAt: string;
}

export interface PlayerPortalNote {
  noteId: string;
  campaignId: string;
  playerId: string;
  title: string;
  content: string;
  visibility: PlayerPortalVisibility;
  linkedEntityIds: string[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface PlayerPortalObjective {
  objectiveId: string;
  campaignId: string;
  playerId: string;
  title: string;
  description?: string;
  kind: PlayerPortalObjectiveKind;
  status: PlayerPortalObjectiveStatus;
  visibility: PlayerPortalVisibility;
  linkedEntityIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlayerCharacterProposal {
  proposalId: string;
  campaignId: string;
  playerId: string;
  targetCharacterEntityId?: string;
  kind: PlayerCharacterProposalKind;
  status: PlayerCharacterProposalStatus;
  proposedChanges: Record<string, unknown>;
  dmResolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}
```

- [ ] **Step 2: Extend event schema union**

In `src/domain/shared/events.ts`, add Zod schemas for these event payloads and include event names in the domain event type union:

```ts
export const playerTokenIssuedPayloadSchema = z.object({
  tokenId: z.string().min(1),
  tokenHash: z.string().min(1),
  campaignId: z.string().min(1),
  playerId: z.string().min(1),
  label: z.string().optional(),
  createdAt: z.string().min(1),
});

export const playerTokenRevokedPayloadSchema = z.object({
  tokenId: z.string().min(1),
  campaignId: z.string().min(1),
  revokedAt: z.string().min(1),
});

export const playerCharacterLinkedPayloadSchema = z.object({
  campaignId: z.string().min(1),
  playerId: z.string().min(1),
  characterEntityId: z.string().min(1),
  ownership: z.enum(["campaign_premade", "player_owned"]),
  syncMode: z.enum(["live_player_editable", "dm_review_required"]),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const playerCharacterUnlinkedPayloadSchema = z.object({
  campaignId: z.string().min(1),
  playerId: z.string().min(1),
  characterEntityId: z.string().min(1),
  unlinkedAt: z.string().min(1),
});

export const playerCharacterLiveStateUpdatedPayloadSchema = z.object({
  campaignId: z.string().min(1),
  playerId: z.string().min(1),
  characterEntityId: z.string().min(1),
  status: z.object({
    hitPointsCurrent: z.number().int().optional(),
    hitPointsMax: z.number().int().optional(),
    armorClass: z.number().int().optional(),
    inspiration: z.boolean().optional(),
    conditions: z.array(z.string()),
  }).partial().extend({ conditions: z.array(z.string()).optional() }),
  updatedBy: z.enum(["player", "dm"]),
  updatedAt: z.string().min(1),
});
```

Add equivalent schemas for `PlayerResourceUpserted`, `PlayerResourceRemoved`, notes, objectives, proposal created, and proposal resolved using the interfaces from `types.ts`.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/domain/playerPortal/types.ts src/domain/shared/events.ts
git commit -m "feat: add player portal event types"
```

---

### Task 3: Build PlayerPortalProjection

**Files:**

- Create: `src/projections/playerPortalProjection.ts`
- Test: `tests/projections/playerPortalProjection.test.ts`

**Projection behavior:**

- Builds token records by `tokenHash` and `tokenId`.
- Builds one active link per player: latest `PlayerCharacterLinked`, removed by `PlayerCharacterUnlinked`.
- Synthesizes a soft legacy link from `player_character.metadata.playerId` when no explicit link exists.
- Tracks live state, resources, notes, objectives, and proposals.
- DM summary excludes private notes/objectives entirely.

- [ ] **Step 1: Write failing projection tests**

Create `tests/projections/playerPortalProjection.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildPlayerPortalProjection } from "../../src/projections/playerPortalProjection.js";
import type { CampaignProjection } from "../../src/projections/campaignProjection.js";
import type { StoredEvent } from "../../src/domain/shared/events.js";

function event(type: string, payload: any, sequence = 1): StoredEvent {
  return {
    id: `evt_${sequence}`,
    campaignId: payload.campaignId ?? "cmp_portal",
    sequence,
    type,
    actorId: "usr_test",
    payload,
    timestamp: `2026-06-27T00:00:${String(sequence).padStart(2, "0")}.000Z`,
    hash: `hash_${sequence}`,
  } as StoredEvent;
}

function campaignProjection(): CampaignProjection {
  return {
    campaign: { campaignId: "cmp_portal", title: "Portal Test", system: "dnd_5_2_1" } as any,
    entities: [
      {
        entityId: "ent_pc_1",
        campaignId: "cmp_portal",
        entityType: "player_character",
        title: "Premade Hero",
        metadata: { playerId: "ply_1", className: "Fighter" },
        visibility: { kind: "party" },
        archived: false,
      } as any,
    ],
    relations: [],
    facts: [],
    sessions: [],
    players: [{ playerId: "ply_1", displayName: "Player One", archived: false } as any],
    tags: [],
    canvases: [],
    settings: {},
    lastSequence: 0,
  } as CampaignProjection;
}

describe("PlayerPortalProjection", () => {
  it("synthesizes legacy metadata.playerId links when no explicit link exists", () => {
    const projection = buildPlayerPortalProjection(campaignProjection(), []);

    expect(projection.linksByPlayerId.get("ply_1")?.characterEntityId).toBe("ent_pc_1");
    expect(projection.linksByPlayerId.get("ply_1")?.ownership).toBe("campaign_premade");
  });

  it("uses explicit latest link over legacy metadata.playerId", () => {
    const projection = buildPlayerPortalProjection(campaignProjection(), [
      event("PlayerCharacterLinked", {
        campaignId: "cmp_portal",
        playerId: "ply_1",
        characterEntityId: "ent_pc_2",
        ownership: "player_owned",
        syncMode: "live_player_editable",
        createdAt: "2026-06-27T00:00:01.000Z",
        updatedAt: "2026-06-27T00:00:01.000Z",
      }),
    ]);

    expect(projection.linksByPlayerId.get("ply_1")?.characterEntityId).toBe("ent_pc_2");
    expect(projection.linksByPlayerId.get("ply_1")?.ownership).toBe("player_owned");
  });

  it("excludes private notes and objectives from dm summary", () => {
    const projection = buildPlayerPortalProjection(campaignProjection(), [
      event("PlayerPortalNoteCreated", {
        noteId: "note_private",
        campaignId: "cmp_portal",
        playerId: "ply_1",
        title: "Private",
        content: "Only me",
        visibility: "private",
        linkedEntityIds: [],
        createdAt: "2026-06-27T00:00:01.000Z",
        updatedAt: "2026-06-27T00:00:01.000Z",
        archived: false,
      }, 1),
      event("PlayerPortalNoteCreated", {
        noteId: "note_dm",
        campaignId: "cmp_portal",
        playerId: "ply_1",
        title: "DM visible",
        content: "Show DM",
        visibility: "dm_visible",
        linkedEntityIds: [],
        createdAt: "2026-06-27T00:00:02.000Z",
        updatedAt: "2026-06-27T00:00:02.000Z",
        archived: false,
      }, 2),
    ]);

    const summary = projection.dmSummaries.find((item) => item.playerId === "ply_1");
    expect(summary?.notes.map((note) => note.noteId)).toEqual(["note_dm"]);
  });
});
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- tests/projections/playerPortalProjection.test.ts
```

Expected: FAIL because `buildPlayerPortalProjection` does not exist.

- [ ] **Step 3: Implement projection file**

Create `src/projections/playerPortalProjection.ts` with these exports:

```ts
import type { StoredEvent } from "../domain/shared/events.js";
import type { CampaignProjection } from "./campaignProjection.js";
import type {
  PlayerCharacterLink,
  PlayerCharacterProposal,
  PlayerCharacterSheetState,
  PlayerPortalNote,
  PlayerPortalObjective,
  PlayerResource,
  PlayerTokenRecord,
} from "../domain/playerPortal/types.js";

export interface PlayerPortalDmSummary {
  playerId: string;
  displayName: string;
  link?: PlayerCharacterLink;
  sheet?: PlayerCharacterSheetState;
  notes: PlayerPortalNote[];
  objectives: PlayerPortalObjective[];
  proposals: PlayerCharacterProposal[];
}

export interface PlayerPortalProjection {
  tokensByHash: Map<string, PlayerTokenRecord>;
  tokensById: Map<string, PlayerTokenRecord>;
  linksByPlayerId: Map<string, PlayerCharacterLink>;
  sheetsByPlayerId: Map<string, PlayerCharacterSheetState>;
  notesByPlayerId: Map<string, PlayerPortalNote[]>;
  objectivesByPlayerId: Map<string, PlayerPortalObjective[]>;
  proposalsByPlayerId: Map<string, PlayerCharacterProposal[]>;
  dmSummaries: PlayerPortalDmSummary[];
}

export function buildPlayerPortalProjection(
  campaign: CampaignProjection,
  events: StoredEvent[]
): PlayerPortalProjection {
  const tokensByHash = new Map<string, PlayerTokenRecord>();
  const tokensById = new Map<string, PlayerTokenRecord>();
  const explicitLinkedPlayers = new Set<string>();
  const linksByPlayerId = new Map<string, PlayerCharacterLink>();
  const sheetsByPlayerId = new Map<string, PlayerCharacterSheetState>();
  const notesById = new Map<string, PlayerPortalNote>();
  const objectivesById = new Map<string, PlayerPortalObjective>();
  const proposalsById = new Map<string, PlayerCharacterProposal>();

  for (const item of campaign.entities ?? []) {
    if (item.entityType !== "player_character" || item.archived) continue;
    const playerId = item.metadata?.playerId;
    if (!playerId) continue;
    linksByPlayerId.set(playerId, {
      campaignId: item.campaignId,
      playerId,
      characterEntityId: item.entityId,
      ownership: "campaign_premade",
      syncMode: "live_player_editable",
      createdAt: item.createdAt ?? "",
      updatedAt: item.updatedAt ?? item.createdAt ?? "",
    });
  }

  for (const event of [...events].sort((a, b) => a.sequence - b.sequence)) {
    const payload: any = event.payload;
    switch (event.type) {
      case "PlayerTokenIssued": {
        const record: PlayerTokenRecord = { ...payload };
        tokensByHash.set(record.tokenHash, record);
        tokensById.set(record.tokenId, record);
        break;
      }
      case "PlayerTokenRevoked": {
        const existing = tokensById.get(payload.tokenId);
        if (existing) {
          const revoked = { ...existing, revokedAt: payload.revokedAt };
          tokensById.set(payload.tokenId, revoked);
          tokensByHash.set(revoked.tokenHash, revoked);
        }
        break;
      }
      case "PlayerCharacterLinked": {
        explicitLinkedPlayers.add(payload.playerId);
        linksByPlayerId.set(payload.playerId, { ...payload });
        break;
      }
      case "PlayerCharacterUnlinked": {
        explicitLinkedPlayers.add(payload.playerId);
        linksByPlayerId.delete(payload.playerId);
        sheetsByPlayerId.delete(payload.playerId);
        break;
      }
      case "PlayerCharacterLiveStateUpdated": {
        const previous = sheetsByPlayerId.get(payload.playerId);
        sheetsByPlayerId.set(payload.playerId, {
          campaignId: payload.campaignId,
          playerId: payload.playerId,
          characterEntityId: payload.characterEntityId,
          status: {
            conditions: [],
            ...(previous?.status ?? {}),
            ...(payload.status ?? {}),
            conditions: payload.status?.conditions ?? previous?.status.conditions ?? [],
          },
          resources: previous?.resources ?? [],
          updatedBy: payload.updatedBy,
          updatedAt: payload.updatedAt,
        });
        break;
      }
      case "PlayerResourceUpserted": {
        const previous = sheetsByPlayerId.get(payload.playerId);
        const resources = upsertResource(previous?.resources ?? [], payload.resource);
        sheetsByPlayerId.set(payload.playerId, {
          campaignId: payload.campaignId,
          playerId: payload.playerId,
          characterEntityId: payload.characterEntityId,
          status: previous?.status ?? { conditions: [] },
          resources,
          updatedBy: payload.updatedBy,
          updatedAt: payload.updatedAt,
        });
        break;
      }
      case "PlayerResourceRemoved": {
        const previous = sheetsByPlayerId.get(payload.playerId);
        if (!previous) break;
        sheetsByPlayerId.set(payload.playerId, {
          ...previous,
          resources: previous.resources.filter((resource) => resource.resourceId !== payload.resourceId),
          updatedBy: payload.updatedBy,
          updatedAt: payload.updatedAt,
        });
        break;
      }
      case "PlayerPortalNoteCreated":
      case "PlayerPortalNoteUpdated": {
        notesById.set(payload.noteId, { ...(notesById.get(payload.noteId) as any), ...payload });
        break;
      }
      case "PlayerPortalNoteArchived": {
        const note = notesById.get(payload.noteId);
        if (note) notesById.set(payload.noteId, { ...note, archived: true, updatedAt: payload.archivedAt });
        break;
      }
      case "PlayerPortalObjectiveCreated":
      case "PlayerPortalObjectiveUpdated": {
        objectivesById.set(payload.objectiveId, { ...(objectivesById.get(payload.objectiveId) as any), ...payload });
        break;
      }
      case "PlayerPortalObjectiveArchived": {
        const objective = objectivesById.get(payload.objectiveId);
        if (objective) objectivesById.set(payload.objectiveId, { ...objective, status: "archived", updatedAt: payload.archivedAt });
        break;
      }
      case "PlayerCharacterProposalCreated": {
        proposalsById.set(payload.proposalId, { ...payload, status: "pending" });
        break;
      }
      case "PlayerCharacterProposalResolved": {
        const proposal = proposalsById.get(payload.proposalId);
        if (proposal) {
          proposalsById.set(payload.proposalId, {
            ...proposal,
            status: payload.status,
            dmResolutionNote: payload.dmResolutionNote,
            resolvedAt: payload.resolvedAt,
          });
        }
        break;
      }
    }
  }

  for (const playerId of explicitLinkedPlayers) {
    const explicit = [...events].some((event) => event.type === "PlayerCharacterLinked" && (event.payload as any).playerId === playerId);
    if (!explicit) linksByPlayerId.delete(playerId);
  }

  const notesByPlayerId = groupActiveByPlayer([...notesById.values()].filter((note) => !note.archived));
  const objectivesByPlayerId = groupActiveByPlayer([...objectivesById.values()].filter((objective) => objective.status !== "archived"));
  const proposalsByPlayerId = groupActiveByPlayer([...proposalsById.values()]);

  const dmSummaries = (campaign.players ?? []).filter((player: any) => !player.archived).map((player: any) => ({
    playerId: player.playerId,
    displayName: player.displayName ?? player.name ?? player.playerId,
    link: linksByPlayerId.get(player.playerId),
    sheet: sheetsByPlayerId.get(player.playerId),
    notes: (notesByPlayerId.get(player.playerId) ?? []).filter((note) => note.visibility === "dm_visible"),
    objectives: (objectivesByPlayerId.get(player.playerId) ?? []).filter((objective) => objective.visibility === "dm_visible"),
    proposals: proposalsByPlayerId.get(player.playerId) ?? [],
  }));

  return { tokensByHash, tokensById, linksByPlayerId, sheetsByPlayerId, notesByPlayerId, objectivesByPlayerId, proposalsByPlayerId, dmSummaries };
}

function upsertResource(resources: PlayerResource[], resource: PlayerResource): PlayerResource[] {
  const next = resources.filter((item) => item.resourceId !== resource.resourceId);
  next.push(resource);
  return next;
}

function groupActiveByPlayer<T extends { playerId: string }>(items: T[]): Map<string, T[]> {
  const result = new Map<string, T[]>();
  for (const item of items) {
    result.set(item.playerId, [...(result.get(item.playerId) ?? []), item]);
  }
  return result;
}
```

- [ ] **Step 4: Run projection tests**

```bash
npm test -- tests/projections/playerPortalProjection.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/projections/playerPortalProjection.ts tests/projections/playerPortalProjection.test.ts
git commit -m "feat: add player portal projection"
```

---

### Task 4: Persistent player tokens and DM token endpoints

**Files:**

- Modify: `src/application/commands.ts`
- Modify: `src/application/commandBus.ts`
- Modify: `src/server/auth.ts`
- Modify: `src/server/routes/playerRoutes.ts`
- Test: `tests/server/playerPortalRoutes.test.ts`

**Endpoints:**

```txt
POST   /api/campaigns/:campaignId/players/:playerId/token
DELETE /api/campaigns/:campaignId/players/:playerId/token/:tokenId
```

- [ ] **Step 1: Write failing token tests**

Create `tests/server/playerPortalRoutes.test.ts` with initial token tests:

```ts
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-player-portal-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

async function seedPlayer(server: any, campaignId = "cmp_portal") {
  const token = (server as any).dmSessionToken;
  await server.inject({
    method: "POST",
    url: "/api/campaigns",
    payload: { campaignId, title: "Portal Campaign", actorId: "usr_dm" },
    headers: { "x-dm-token": token },
  });
  await server.inject({
    method: "POST",
    url: `/api/campaigns/${campaignId}/players`,
    payload: { playerId: "ply_1", name: "Player One", displayName: "Player One" },
    headers: { "x-dm-token": token },
  });
  return token;
}

describe("player portal tokens", () => {
  it("issues a raw token once and does not expose it in dm summary", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmToken = await seedPlayer(server);

      const res = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_portal/players/ply_1/token",
        payload: { label: "phone" },
        headers: { "x-dm-token": dmToken },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().tokenId).toMatch(/^ptok_/);
      expect(res.json().token).toMatch(/^[A-Z0-9]{8}$/);
      expect(res.json().tokenHash).toBeUndefined();
    });
  });
});
```

- [ ] **Step 2: Run failing test**

```bash
npm test -- tests/server/playerPortalRoutes.test.ts
```

Expected: FAIL with 404 route missing.

- [ ] **Step 3: Add token commands**

In `src/application/commands.ts`, add:

```ts
| {
    type: "IssuePlayerToken";
    campaignId: CampaignId;
    actorId: string;
    playerId: string;
    tokenId: string;
    tokenHash: string;
    label?: string;
    createdAt: string;
  }
| {
    type: "RevokePlayerToken";
    campaignId: CampaignId;
    actorId: string;
    playerId: string;
    tokenId: string;
    revokedAt: string;
  }
```

- [ ] **Step 4: Add CommandBus handlers**

In `src/application/commandBus.ts`, add cases:

```ts
case "IssuePlayerToken": {
  if (!state.players.has(command.playerId as any)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerTokenIssued", {
    tokenId: command.tokenId,
    tokenHash: command.tokenHash,
    campaignId: command.campaignId,
    playerId: command.playerId,
    label: command.label,
    createdAt: command.createdAt,
  }));
}
case "RevokePlayerToken": {
  if (!state.players.has(command.playerId as any)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerTokenRevoked", {
    tokenId: command.tokenId,
    campaignId: command.campaignId,
    revokedAt: command.revokedAt,
  }));
}
```

- [ ] **Step 5: Add token helpers**

In `src/server/auth.ts`, add:

```ts
import { createHash, randomInt } from "crypto";

export function hashPlayerToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generatePlayerToken(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < 8; i += 1) {
    token += alphabet[randomInt(0, alphabet.length)];
  }
  return token;
}
```

- [ ] **Step 6: Add token routes to playerRoutes**

In `src/server/routes/playerRoutes.ts`, add DM-only handlers using repository `executeCommand`. Generate token IDs with `ptok_${randomBytes(8).toString("hex")}` from Node `crypto`.

Route behavior:

```ts
const rawToken = generatePlayerToken();
const tokenId = `ptok_${randomBytes(8).toString("hex")}`;
await getRepository(vaultId).executeCommand(campaignId as any, {
  type: "IssuePlayerToken",
  campaignId: campaignId as any,
  actorId: "usr_dm",
  playerId,
  tokenId,
  tokenHash: hashPlayerToken(rawToken),
  label: request.body?.label,
  createdAt: new Date().toISOString(),
});
return { tokenId, token: rawToken };
```

- [ ] **Step 7: Run token test**

```bash
npm test -- tests/server/playerPortalRoutes.test.ts
```

Expected: PASS for token issuance.

- [ ] **Step 8: Commit**

```bash
git add src/application/commands.ts src/application/commandBus.ts src/server/auth.ts src/server/routes/playerRoutes.ts tests/server/playerPortalRoutes.test.ts
git commit -m "feat: issue persistent player tokens"
```

---

### Task 5: Add player portal routes for state, live fields, resources, notes, and objectives

**Files:**

- Create: `src/server/routes/playerPortalRoutes.ts`
- Modify: `src/server/createServer.ts`
- Modify: `src/application/commands.ts`
- Modify: `src/application/commandBus.ts`
- Test: `tests/server/playerPortalRoutes.test.ts`

**Endpoints:**

```txt
GET  /api/campaigns/:campaignId/player-portal/state
PUT  /api/campaigns/:campaignId/player-portal/status
POST /api/campaigns/:campaignId/player-portal/resources
PUT  /api/campaigns/:campaignId/player-portal/resources/:resourceId
POST /api/campaigns/:campaignId/player-portal/notes
PUT  /api/campaigns/:campaignId/player-portal/notes/:noteId
POST /api/campaigns/:campaignId/player-portal/objectives
PUT  /api/campaigns/:campaignId/player-portal/objectives/:objectiveId
```

- [ ] **Step 1: Extend server tests for player isolation and live state**

Append to `tests/server/playerPortalRoutes.test.ts`:

```ts
async function issueToken(server: any, dmToken: string) {
  const res = await server.inject({
    method: "POST",
    url: "/api/campaigns/cmp_portal/players/ply_1/token",
    payload: { label: "phone" },
    headers: { "x-dm-token": dmToken },
  });
  return res.json().token as string;
}

it("lets a token-authenticated player update their own live status", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    const update = await server.inject({
      method: "PUT",
      url: "/api/campaigns/cmp_portal/player-portal/status",
      payload: { characterEntityId: "ent_pc_1", hitPointsCurrent: 7, hitPointsMax: 12, armorClass: 14, inspiration: true, conditions: ["poisoned"] },
      headers: { "x-player-token": playerToken },
    });

    expect(update.statusCode).toBe(200);

    const state = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/state",
      headers: { "x-player-token": playerToken },
    });

    expect(state.statusCode).toBe(200);
    expect(state.json().sheet.status.hitPointsCurrent).toBe(7);
    expect(state.json().sheet.status.conditions).toEqual(["poisoned"]);
  });
});

it("does not return private notes in dm summary", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/notes",
      payload: { title: "Private note", content: "secret", visibility: "private", linkedEntityIds: [] },
      headers: { "x-player-token": playerToken },
    });
    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/notes",
      payload: { title: "DM note", content: "visible", visibility: "dm_visible", linkedEntityIds: [] },
      headers: { "x-player-token": playerToken },
    });

    const summary = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/dm-summary",
      headers: { "x-dm-token": dmToken },
    });

    expect(summary.statusCode).toBe(200);
    expect(summary.json().players[0].notes.map((note: any) => note.title)).toEqual(["DM note"]);
  });
});
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- tests/server/playerPortalRoutes.test.ts
```

Expected: FAIL because portal routes do not exist.

- [ ] **Step 3: Add commands and handlers**

In `src/application/commands.ts`, add command variants:

```ts
UpdatePlayerLiveStatus
UpsertPlayerResource
RemovePlayerResource
CreatePlayerPortalNote
UpdatePlayerPortalNote
ArchivePlayerPortalNote
CreatePlayerPortalObjective
UpdatePlayerPortalObjective
ArchivePlayerPortalObjective
```

Each command must include `campaignId`, `actorId`, `playerId`, and relevant IDs/payload. In `commandBus.ts`, each handler validates player existence when needed and emits the matching portal event using `singleEvent`.

Use IDs:

- notes: `pnote_${randomBytes(8).toString("hex")}` in route layer;
- objectives: `pobj_${randomBytes(8).toString("hex")}`;
- resources: client-provided preset ID or `pres_${randomBytes(8).toString("hex")}` for custom.

- [ ] **Step 4: Implement route auth helper**

In `src/server/routes/playerPortalRoutes.ts`, create helper:

```ts
async function requirePlayerFromToken(repository: CampaignRepository, campaignId: string, rawToken: string | undefined) {
  if (!rawToken) {
    const err = new Error("Player token is required");
    (err as any).statusCode = 401;
    throw err;
  }
  const state = await repository.getCampaignState(campaignId as any);
  const events = await repository.loadEvents(campaignId as any);
  const portal = buildPlayerPortalProjection(state, events as any);
  const token = portal.tokensByHash.get(hashPlayerToken(rawToken));
  if (!token || token.revokedAt) {
    const err = new Error("Invalid player token");
    (err as any).statusCode = 401;
    throw err;
  }
  return { state, portal, playerId: token.playerId };
}
```

Add this public method to `CampaignRepository` so route tests can build the player portal projection from persisted events:

```ts
public async loadEvents(campaignId: CampaignId): Promise<StoredEvent[]> {
  return this.eventStore.loadEvents(campaignId);
}
```

Import `CampaignId` and `StoredEvent` from the same source files already used by the repository.

- [ ] **Step 5: Implement GET state**

Return:

```ts
return {
  playerId,
  link: portal.linksByPlayerId.get(playerId) ?? null,
  sheet: portal.sheetsByPlayerId.get(playerId) ?? null,
  notes: portal.notesByPlayerId.get(playerId) ?? [],
  objectives: portal.objectivesByPlayerId.get(playerId) ?? [],
  proposals: portal.proposalsByPlayerId.get(playerId) ?? [],
  history: { status: "stub" },
};
```

- [ ] **Step 6: Implement writes**

For status update, route persists:

```ts
await repository.executeCommand(campaignId as any, {
  type: "UpdatePlayerLiveStatus",
  campaignId: campaignId as any,
  actorId: playerId,
  playerId,
  characterEntityId: request.body.characterEntityId,
  status: {
    hitPointsCurrent: request.body.hitPointsCurrent,
    hitPointsMax: request.body.hitPointsMax,
    armorClass: request.body.armorClass,
    inspiration: request.body.inspiration,
    conditions: request.body.conditions ?? [],
  },
  updatedBy: "player",
  updatedAt: new Date().toISOString(),
});
return { ok: true };
```

For notes/objectives, reject `visibility` values outside `private` and `dm_visible` with 400.

- [ ] **Step 7: Register route**

In `src/server/createServer.ts`:

```ts
import { registerPlayerPortalRoutes } from "./routes/playerPortalRoutes.js";
```

and after player routes:

```ts
server.register(registerPlayerPortalRoutes, opts);
```

- [ ] **Step 8: Run tests**

```bash
npm test -- tests/server/playerPortalRoutes.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/application/commands.ts src/application/commandBus.ts src/persistence/repositories/campaignRepository.ts src/server/createServer.ts src/server/routes/playerPortalRoutes.ts tests/server/playerPortalRoutes.test.ts
git commit -m "feat: add player portal state API"
```

---

### Task 6: Add character link and proposal APIs, including approval with multi-event result

**Files:**

- Modify: `src/application/commands.ts`
- Modify: `src/application/commandBus.ts`
- Modify: `src/server/routes/playerPortalRoutes.ts`
- Test: `tests/server/playerPortalRoutes.test.ts`

**Endpoints:**

```txt
POST /api/campaigns/:campaignId/player-portal/links
POST /api/campaigns/:campaignId/player-portal/proposals
PUT  /api/campaigns/:campaignId/player-portal/proposals/:proposalId/resolve
```

- [ ] **Step 1: Add failing proposal approval test**

Append:

```ts
it("allows DM to approve a structural proposal and updates the character entity", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/proposals",
      payload: {
        kind: "update_character_core",
        targetCharacterEntityId: "ent_pc_1",
        proposedChanges: { metadata: { level: 2, className: "Fighter" } },
      },
      headers: { "x-player-token": playerToken },
    });

    const summary = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/dm-summary",
      headers: { "x-dm-token": dmToken },
    });
    const proposalId = summary.json().players[0].proposals[0].proposalId;

    const approve = await server.inject({
      method: "PUT",
      url: `/api/campaigns/cmp_portal/player-portal/proposals/${proposalId}/resolve`,
      payload: { status: "approved", dmResolutionNote: "Approved" },
      headers: { "x-dm-token": dmToken },
    });

    expect(approve.statusCode).toBe(200);

    const campaign = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal",
      headers: { "x-dm-token": dmToken },
    });
    const character = campaign.json().entities.find((entity: any) => entity.entityId === "ent_pc_1");
    expect(character.metadata.level).toBe(2);
  });
});
```

Ensure `seedPlayer` creates `ent_pc_1` or update helper to create a `player_character` assigned to `ply_1` before issuing token.

- [ ] **Step 2: Run failing test**

```bash
npm test -- tests/server/playerPortalRoutes.test.ts
```

Expected: FAIL because proposal routes/commands do not exist.

- [ ] **Step 3: Add commands**

Add:

```ts
LinkPlayerCharacter
UnlinkPlayerCharacter
CreatePlayerCharacterProposal
ResolvePlayerCharacterProposal
```

`ResolvePlayerCharacterProposal` includes:

```ts
status: "approved" | "rejected";
dmResolutionNote?: string;
resolvedAt: string;
proposal: PlayerCharacterProposal;
entityUpdate?: { entityId: EntityId; updates: Partial<Entity> };
```

- [ ] **Step 4: Add multi-event approval handler**

In `commandBus.ts`, `ResolvePlayerCharacterProposal` returns:

```ts
const resolvedEvent = makeEvent(command.actorId, command.campaignId, "PlayerCharacterProposalResolved", {
  proposalId: command.proposal.proposalId,
  campaignId: command.campaignId,
  status: command.status,
  dmResolutionNote: command.dmResolutionNote,
  resolvedAt: command.resolvedAt,
});

if (command.status === "rejected" || !command.entityUpdate) {
  return { state, events: [resolvedEvent] };
}

const entity = requireEntity(state, command.entityUpdate.entityId);
const updatedEntity = {
  ...entity,
  ...command.entityUpdate.updates,
  metadata: {
    ...entity.metadata,
    ...(command.entityUpdate.updates.metadata ?? {}),
  },
  updatedAt: command.resolvedAt,
};

return {
  state: { ...state, entities: new Map(state.entities).set(updatedEntity.entityId, updatedEntity) },
  events: [
    resolvedEvent,
    makeEvent(command.actorId, command.campaignId, "EntityUpdated", updatedEntity),
  ],
};
```

- [ ] **Step 5: Implement routes**

Player proposal creation uses player token identity. DM resolution loads projection, finds proposal by ID, rejects if not pending, and passes proposal into command. For approved update proposals, build `entityUpdate` from `proposal.proposedChanges`.

- [ ] **Step 6: Run tests**

```bash
npm test -- tests/server/playerPortalRoutes.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/application/commands.ts src/application/commandBus.ts src/server/routes/playerPortalRoutes.ts tests/server/playerPortalRoutes.test.ts
git commit -m "feat: add player character proposals"
```

---

### Task 7: Add campaign store client methods

**Files:**

- Modify: `src/app/stores/campaignStore.ts`
- Test: `npm run typecheck:app`

**Methods to add:**

```ts
playerPortalState: any | null;
dmPlayerPortalSummary: any | null;
loadPlayerPortalState: (campaignId?: string) => Promise<void>;
updatePlayerPortalStatus: (payload: any) => Promise<void>;
upsertPlayerPortalResource: (payload: any) => Promise<void>;
createPlayerPortalNote: (payload: any) => Promise<void>;
updatePlayerPortalNote: (noteId: string, payload: any) => Promise<void>;
createPlayerPortalObjective: (payload: any) => Promise<void>;
updatePlayerPortalObjective: (objectiveId: string, payload: any) => Promise<void>;
createPlayerCharacterProposal: (payload: any) => Promise<void>;
loadDmPlayerPortalSummary: () => Promise<void>;
resolvePlayerCharacterProposal: (proposalId: string, payload: any) => Promise<void>;
```

- [ ] **Step 1: Add store state and method signatures**

Extend `CampaignStateStore` and initial state with `playerPortalState: null` and `dmPlayerPortalSummary: null`.

- [ ] **Step 2: Implement player methods**

Each method calls the new API using `fetchWithVault`. Example:

```ts
loadPlayerPortalState: async (campaignIdOverride) => {
  const campaignId = campaignIdOverride ?? get().activeCampaignId;
  if (!campaignId) return;
  const res = await fetchWithVault(`/api/campaigns/${campaignId}/player-portal/state`);
  if (!res.ok) throw new Error("Failed to load player portal state");
  set({ playerPortalState: await res.json() });
},
```

After write methods, call `await get().loadPlayerPortalState(activeCampaignId)`.

- [ ] **Step 3: Implement DM methods**

`loadDmPlayerPortalSummary` calls `/dm-summary`; proposal resolution refreshes DM summary.

- [ ] **Step 4: Typecheck app**

```bash
npm run typecheck:app
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/stores/campaignStore.ts
git commit -m "feat: add player portal store methods"
```

---

### Task 8: Replace PlayerPortalView with functional toolkit sections

**Files:**

- Modify: `src/app/components/PlayerPortalView.tsx`
- Test: `npm run typecheck:app`

**Sections:** Summary, Character/State, Resources, Diary, Objectives, History.

- [ ] **Step 1: Add state loading**

Change component to use `playerPortalState`, `loadPlayerPortalState`, and portal write methods. On mount:

```ts
useEffect(() => {
  void selectCampaign(campaignId);
  void loadPlayerPortalState(campaignId);
}, [campaignId, selectCampaign, loadPlayerPortalState]);
```

- [ ] **Step 2: Add Summary tab**

Render active character, live status, resources, objectives, and quick action buttons. Use safe defaults:

```ts
const sheet = playerPortalState?.sheet;
const status = sheet?.status ?? { conditions: [] };
const resources = sheet?.resources ?? [];
const objectives = playerPortalState?.objectives ?? [];
```

- [ ] **Step 3: Add Character/State form**

Form fields:

- HP current/max
- AC
- inspiration checkbox
- comma-separated conditions

Submit calls `updatePlayerPortalStatus({ characterEntityId, hitPointsCurrent, hitPointsMax, armorClass, inspiration, conditions })`.

- [ ] **Step 4: Add Resources section**

Render resources with current/max inputs and save button. Add simple create form with label/current/max/recovery. Submit calls `upsertPlayerPortalResource`.

- [ ] **Step 5: Upgrade Diary section**

Support create, edit, and archive with visibility. Use `updatePlayerPortalNote(noteId, { archived: true })`; Task 5 must implement this patch shape.

Fields:

- title
- content
- visibility: private/dm_visible
- linkedEntityIds initially empty array

- [ ] **Step 6: Add Objectives section**

Fields:

- title
- description
- kind: personal/session/question_for_dm
- status: open/done/archived
- visibility: private/dm_visible

- [ ] **Step 7: Add History stub**

Render tab and empty state only:

```tsx
<div className="card" style={{ padding: "24px", textAlign: "center" }}>
  <h3>Historia de la aventura</h3>
  <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
    Tu historial de aventura aparecerá aquí a medida que la campaña avance.
  </p>
</div>
```

Do not call additional history endpoints from this tab.

- [ ] **Step 8: Typecheck app**

```bash
npm run typecheck:app
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/app/components/PlayerPortalView.tsx
git commit -m "feat: build player portal toolkit UI"
```

---

### Task 9: Add DM portal subsection to PlayersPage

**Files:**

- Modify: `src/app/pages/PlayersPage.tsx`
- Test: `npm run typecheck:app`

**UI behavior:**

- Load DM summary on page mount.
- Show each player, linked character, live state, DM-visible notes/objectives, and pending proposals.
- Approve/reject proposals.
- Private notes/objectives never appear because server excludes them.

- [ ] **Step 1: Inspect existing PlayersPage layout**

Run:

```bash
sed -n '1,260p' src/app/pages/PlayersPage.tsx
```

- [ ] **Step 2: Add summary loading**

Use store methods:

```ts
const { dmPlayerPortalSummary, loadDmPlayerPortalSummary, resolvePlayerCharacterProposal } = useCampaignStore();

useEffect(() => {
  void loadDmPlayerPortalSummary();
}, [loadDmPlayerPortalSummary]);
```

- [ ] **Step 3: Render portal cards**

For each summary player:

- display `displayName`
- `link.characterEntityId` or “Sin personaje vinculado”
- HP/AC/conditions/resources if `sheet` exists
- DM-visible notes/objectives
- pending proposals

- [ ] **Step 4: Add approve/reject buttons**

For pending proposals:

```tsx
<button className="btn btn-primary btn-sm" onClick={() => resolvePlayerCharacterProposal(proposal.proposalId, { status: "approved", dmResolutionNote: "Aprobado" })}>
  Aprobar
</button>
<button className="btn btn-secondary btn-sm" onClick={() => resolvePlayerCharacterProposal(proposal.proposalId, { status: "rejected", dmResolutionNote: "Rechazado por el DM" })}>
  Rechazar
</button>
```

- [ ] **Step 5: Typecheck app**

```bash
npm run typecheck:app
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/PlayersPage.tsx
git commit -m "feat: show player portal state to DM"
```

---

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
