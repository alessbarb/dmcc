# Player Portal Toolkit Design

Date: 2026-06-27
Status: Approved design
Scope: Improve the player portal by prioritizing player tools first, narrative clarity second, and visual polish third.

## Goals

The player portal should become useful during play, not only a read-only viewer. It must support players who use either a campaign premade character or their own character, while preserving DM authority over campaign canon and rule-impacting changes.

Priority order:

1. Player tools: playable character state, resources, notes, objectives, and DM questions.
2. Narrative clarity: known missions, clues, facts, sessions, and relations organized for players.
3. UX/UI polish: responsive navigation, clearer hierarchy, and reduced inline styling.

## Non-goals for the first implementation

- Real-time chat.
- WebSockets or live collaboration infrastructure.
- Full class/rules automation for D&D.
- A campaign rules editor.
- Player-to-player note sharing.
- A full visual redesign before the data and permission model exists.

## Core concepts

### Character ownership

A player can play one of two character types:

- `campaign_premade`: a `player_character` created by the DM and assigned to the player.
- `player_owned`: a character created or configured by the player and submitted to the campaign.

Both should be represented as, or resolve into, a campaign `player_character` entity visible to the DM. Existing characters that already use `metadata.playerId` should be treated as initial premade links.

### Hybrid synchronization model

The portal uses hybrid sync:

- Live player-editable fields update immediately and are visible to the DM.
- Structural/rule-impacting fields require DM validation before becoming accepted campaign state.

Live fields include:

- current and maximum HP when allowed by the preset;
- armor class when allowed by the preset;
- inspiration;
- conditions;
- resource counters;
- personal notes;
- objectives and checklists;
- questions or reminders for the DM.

DM-reviewed fields include:

- creating a player-owned character for the campaign;
- changing class, species/race, level, core attributes, major proficiencies, background, alignment, or equivalent rule-impacting fields;
- any field marked structural by the active rules preset.

## Data model

### PlayerCharacterLink

Represents the active relationship between a player and a campaign character.

```ts
interface PlayerCharacterLink {
  campaignId: string;
  playerId: string;
  characterEntityId: string;
  ownership: "campaign_premade" | "player_owned";
  syncMode: "live_player_editable" | "dm_review_required";
  createdAt: string;
  updatedAt: string;
}
```

### PlayerCharacterSheetState

Represents the playable synchronized state for a linked character.

```ts
interface PlayerCharacterSheetState {
  campaignId: string;
  playerId: string;
  characterEntityId: string;
  status: {
    hitPointsCurrent?: number;
    hitPointsMax?: number;
    armorClass?: number;
    inspiration?: boolean;
    conditions: string[];
  };
  resources: PlayerResource[];
  updatedBy: "player" | "dm";
  updatedAt: string;
}

interface PlayerResource {
  resourceId: string;
  label: string;
  current: number;
  max: number;
  recovery?: "short_rest" | "long_rest" | "manual";
}
```

### PlayerPortalNote

Personal note owned by a player.

```ts
interface PlayerPortalNote {
  noteId: string;
  campaignId: string;
  playerId: string;
  title: string;
  content: string;
  visibility: "private" | "dm_visible";
  linkedEntityIds: string[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}
```

### PlayerPortalObjective

Personal checklist item, session task, or DM question.

```ts
interface PlayerPortalObjective {
  objectiveId: string;
  campaignId: string;
  playerId: string;
  title: string;
  description?: string;
  kind: "personal" | "session" | "question_for_dm";
  status: "open" | "done" | "archived";
  visibility: "private" | "dm_visible";
  linkedEntityIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### PlayerCharacterProposal

Represents a player-submitted character or structural character change that requires DM review.

```ts
interface PlayerCharacterProposal {
  proposalId: string;
  campaignId: string;
  playerId: string;
  targetCharacterEntityId?: string;
  kind: "create_character" | "update_character_core";
  status: "pending" | "approved" | "rejected";
  proposedChanges: Record<string, unknown>;
  dmResolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}
```

## Persistence and events

Use the existing event-sourced architecture. Avoid opaque parallel files and avoid storing all portal state inside `Entity.metadata`.

Candidate events:

- `PlayerTokenIssued`
- `PlayerTokenRevoked`
- `PlayerCharacterLinked`
- `PlayerCharacterUnlinked`
- `PlayerCharacterLiveStateUpdated`
- `PlayerResourceUpserted`
- `PlayerResourceRemoved`
- `PlayerPortalNoteCreated`
- `PlayerPortalNoteUpdated`
- `PlayerPortalNoteArchived`
- `PlayerPortalObjectiveCreated`
- `PlayerPortalObjectiveUpdated`
- `PlayerPortalObjectiveArchived`
- `PlayerCharacterProposalCreated`
- `PlayerCharacterProposalResolved`

The projection should derive a player portal state from these events and from visible campaign state.

## API design

All player endpoints require a valid `x-player-token`. The server derives `playerId` from the token and ignores any client-supplied player identity for authorization. DM endpoints require the DM token.

### Token issuance

Tokens are per-player opaque codes issued by the DM, extending the existing LAN campaign access code mechanism. The DM generates a token for each player via `POST /api/campaigns/:campaignId/players/:playerId/token`.

**Tokens are never stored in clear text.** The server derives a `tokenId` (UUID) and a `tokenHash` (bcrypt or SHA-256 of the raw token). Only `tokenId` and `tokenHash` are persisted in the `PlayerTokenIssued` event payload — never the raw token. The raw token is returned to the DM once in the HTTP response and never again. The projection indexes `tokenHash → playerId` for O(1) lookup.

On player login/join, the server receives the raw token, computes its hash, and looks it up in the projection. This prevents exported event files or backups from leaking active access credentials.

`PlayerTokenIssued` and `PlayerTokenRevoked` are **authentication-layer events**, not portal-only events. They authenticate persistent LAN access per player and are consumed by the portal, but belong conceptually to the server auth/player-session layer. Tokens are campaign-scoped: a player in two campaigns holds two tokens.

```ts
// PlayerTokenIssued payload (what goes into events.ndjson)
{
  tokenId: string;       // UUID, identifies the token record
  tokenHash: string;     // hash of the raw token
  campaignId: string;
  playerId: string;
  label?: string;        // e.g. "Alejandro's phone"
  createdAt: string;
}

// PlayerTokenRevoked payload
{
  tokenId: string;
  campaignId: string;
  revokedAt: string;
}
```

Player-safe endpoints:

```txt
GET  /api/campaigns/:campaignId/player-portal/state
PUT  /api/campaigns/:campaignId/player-portal/status
POST /api/campaigns/:campaignId/player-portal/resources
PUT  /api/campaigns/:campaignId/player-portal/resources/:resourceId
POST /api/campaigns/:campaignId/player-portal/notes
PUT  /api/campaigns/:campaignId/player-portal/notes/:noteId
POST /api/campaigns/:campaignId/player-portal/objectives
PUT  /api/campaigns/:campaignId/player-portal/objectives/:objectiveId
POST /api/campaigns/:campaignId/player-portal/proposals
```

DM-safe endpoints:

```txt
GET  /api/campaigns/:campaignId/player-portal/dm-summary
POST /api/campaigns/:campaignId/player-portal/links
PUT  /api/campaigns/:campaignId/player-portal/proposals/:proposalId/resolve
```

## Authorization rules

- A player can only read and mutate their own portal state.
- A player cannot approve or reject proposals.
- A player cannot directly mutate canonical facts, relations, session state, or hidden campaign data.
- A player cannot edit another player's character state.
- The DM can view all player portal summaries for the active campaign.
- The DM can link premade characters, approve proposals, reject proposals, and adjust state when needed.
- Notes and objectives are private unless marked `dm_visible`. Private notes and objectives are excluded entirely from `GET /dm-summary` server-side — they are never returned in any DM endpoint response, not even as hidden placeholders.

## Player UI

The portal should be organized around play tasks.

### Summary

Initial screen with:

- active character;
- HP, AC, inspiration, conditions;
- important resource counters;
- upcoming personal objectives;
- recent visible clues/sessions;
- quick actions: adjust HP, add/remove condition, spend/recover resource, create note, create DM question.

### Character and state

For premade characters:

- show DM-authored base data;
- allow edits to live fields;
- structural edits create proposals.

For player-owned characters:

- allow a character draft;
- submission creates a proposal;
- approved proposals link the character into the campaign.

### Resources

Show generic counters and D&D/SRD preset counters when applicable. The first version should not automate complex class rules; it should support current/max and recovery labels.

### Diary

Replace the current note flow with:

- create, edit, archive notes;
- `private` or `dm_visible` visibility;
- optional links to visible entities such as quest, clue, NPC, location, or session;
- simple text search.

### Objectives

Personal checklist with:

- personal objective;
- session task;
- question for DM;
- open, done, archived states;
- optional DM visibility.

### History

Phase 2 renders a stub tab only. Full data ships in Phase 4.

Acceptance criteria for the stub (intentional technical debt, not a bug):

- Tab exists in nav from Phase 2 onward.
- Renders an explicit empty state message (e.g. "Your adventure history will appear here as the campaign unfolds").
- Shows no partial or misleading data.
- Makes no API calls to history or narrative endpoints — zero network requests on mount.
- Message does not imply a user action is needed; this is a system limitation, not a missing player step.

## DM UI

DM proposal review lives inside `PlayersPage` as a new subsection, not a dedicated route. A separate `PlayerPortalAdminPage` is unnecessary overhead before the permission model is proven.

The DM should see:

- all players;
- linked character;
- ownership type;
- current live state: HP, conditions, inspiration, resources;
- latest DM-visible notes/objectives;
- pending proposals;
- last update time.

DM actions:

- assign a premade character;
- inspect player-owned character proposals;
- approve or reject proposals with an optional note;
- adjust live state if needed.

## Rules preset behavior

Use automatic presets first. Do not build a rules editor in the first implementation.

- D&D/SRD campaign: default to HP, AC, inspiration, conditions, and resource counters.
- Generic campaign: default to named resources, conditions, notes, and objectives.

The data model should allow future manual configuration without requiring a rewrite.

## Implementation phases

### Phase 1: synchronization foundation

- Add events and projection for player-character links, live state, resources, notes, objectives, and proposals.
- Add player-safe and DM-safe API endpoints.
- Treat existing `metadata.playerId` as a legacy pointer: the portal projection synthesizes a soft link at read time without emitting `PlayerCharacterLinked`. When the DM explicitly links a character via the API, a real event is emitted and supersedes the legacy pointer.

### Phase 2: functional player portal

- Replace the current portal layout with Summary, Character/State, Resources, Diary, Objectives, and History sections. History is a stub tab only (empty state, no data).
- Implement live edits for allowed fields.
- Implement note/objective CRUD.
- Implement proposal creation for structural character changes.

### Phase 3: DM visibility and review

- Add DM summary of player portal state.
- Show live player state, DM-visible notes/objectives, and pending proposals.
- Implement proposal approval/rejection.

### Phase 4: narrative clarity

- Improve History with grouped missions, clues, facts, sessions, and visible relations.
- Emphasize actionable understanding: what is known, unresolved, and connected.

### Phase 5: visual and responsive polish

- Extract inline styles touched by the portal into named classes.
- Improve mobile navigation.
- Improve card hierarchy, empty states, loading states, and error messages.

## Testing plan

Server tests:

- player can read their own portal state;
- player cannot read or mutate another player's portal state;
- player can update live fields;
- player cannot approve proposals;
- DM can view summaries;
- DM can approve and reject proposals;
- existing `metadata.playerId` is projected as an initial link;
- notes/objectives respect `private` vs `dm_visible`.

Projection/domain tests:

- premade character link;
- player-owned character proposal lifecycle;
- live state updates preserve non-overwritten fields;
- proposal approval applies approved structural changes correctly.

E2E target:

- player joins over LAN;
- player edits HP;
- player creates a DM-visible note;
- DM sees the updated HP and note;
- player submits a character change proposal;
- DM approves or rejects it.

## Risks and mitigations

- Risk: building too much D&D automation too early.
  - Mitigation: use simple counters and preset labels first.
- Risk: player state becomes mixed into canonical entity metadata.
  - Mitigation: use explicit portal events and projections.
- Risk: the DM and player see conflicting character state.
  - Mitigation: model links and live state explicitly, with last-updated metadata.
- Risk: UI polish consumes time before the permission model is safe.
  - Mitigation: implement data/API and basic UI first, then polish.

## Resolved implementation decisions

### Portal projection is separate from entity metadata

Live state is read through a dedicated `PlayerPortalProjection`, not injected into `player_character.metadata`. Merging portal state into entity metadata would couple the event-sourced entity model to mutable player state and violate the invariant that entities are campaign-canonical. The projection holds its own derived state.

### Active character link is the most recent `PlayerCharacterLinked` for that player

A player has at most one active link per campaign. The projection always resolves to the most recent `PlayerCharacterLinked` event for a given `playerId`. Relinking emits a new event; there is no `isActive` flag. The previous link becomes superseded. Unlinking emits `PlayerCharacterUnlinked`.

### Proposal approval emits a canonical `EntityUpdated` — requires multi-event CommandBus

When the DM approves a proposal, two events must be persisted atomically: `PlayerCharacterProposalResolved` (status=approved) and `EntityUpdated` (the approved structural changes applied to the entity). This keeps `events.ndjson` as the single source of truth. The portal projection does not hold approved structural changes independently.

**Blocker: the current `CommandBus` returns a single event.** `handleCommand()` returns one `StoredEvent` and `CampaignRepository.executeCommand()` persists only that one. Proposal approval cannot be implemented correctly until this is resolved.

**Decision: extend CommandBus to support multi-event commands (Option A).** Change `CommandResult` from `{ event: StoredEvent }` to `{ events: StoredEvent[] }`. All existing handlers return a single-element array; no behavior changes for them. The persistence layer appends all events in a single write. This is the minimal change that avoids split-brain (Option B: two sequential commands) and avoids polluting canonical event semantics (Option C: compound event). This change must land before Phase 3 (proposal approval implementation).

### Live state conflict: last write wins, `updatedBy` is surfaced

No special conflict rule. Given the local-first single-DM model, last write wins for all live fields. The `updatedBy` field (`"player"` or `"dm"`) is surfaced in the UI so each party can see who last touched a value. The DM always retains the ability to overwrite any live field.

### `syncMode` on `PlayerCharacterLink` is a link-level default; structural fields always require DM review

`syncMode: "live_player_editable"` means live fields (HP, AC, inspiration, conditions, resources) are player-editable by default. `syncMode: "dm_review_required"` locks even live fields — all changes create proposals. Structural fields (class, level, attributes, etc.) always require DM review regardless of `syncMode`. The rules preset defines what is structural.

### Preset resource IDs are predefined strings, not UUIDs

D&D/SRD preset resources use predefined string IDs (`spell_slots_1`, `ki_points`, `bardic_inspiration`, etc.) defined in a `rulesPreset` module in code. Player-generated resources use UUID `resourceId`. This lets presets evolve without data migrations.

### Notes and objectives use dedicated player portal events

`PlayerPortalNoteCreated/Updated/Archived` and the objective equivalents are their own event types. They do not reuse entity events. The separation preserves the clarity that portal notes are player-scoped ephemera, not campaign-canonical facts.

### DM proposal review lives inside `PlayersPage`

No dedicated `PlayerPortalAdminPage` route. The DM review UI is a subsection of `PlayersPage`. A new route adds nav complexity before the permission model is proven.
