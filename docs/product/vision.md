# DMCC product vision

**Last reviewed:** 2026-07-13

DM Campaign Companion — DMCC — is a web-first campaign workspace for tabletop RPG Dungeon Masters. It is the memory layer around a campaign: a place to prepare sessions, track continuity, connect clues and secrets, manage NPCs and locations, and decide what players are allowed to know.

DMCC is not a virtual tabletop, rules engine, campaign generator, or generic notes app. It should coexist with VTTs and rule references while focusing on narrative continuity.

## Product promise

DMCC helps a table answer the questions that become hard in long-running campaigns:

- What happened last session?
- Which quests, clues, secrets, consequences, NPCs, and locations are still active?
- What does each player or character know?
- What is private DM knowledge versus player-visible knowledge?
- What should the DM prepare or reveal next?
- Which player proposals are waiting for DM review?

The goal is to spend less time searching through notes and more time running the game.

## Core principles

1. **Memory before automation.** DMCC helps the DM remember, connect, and reveal; it does not run the game for them.
2. **Continuity before rules.** The focus is persistent narrative state, not tactical combat or full rules automation.
3. **Secrets are data boundaries.** Player-facing views must be produced by server projections and access control, not by hiding DM-only data in the browser.
4. **Canvas is a flagship surface.** The Canvas should make campaign structure visible, editable, and safe for complex mystery, faction, city, dungeon, and session-planning boards.
5. **Player portal is mobile-first.** Players need a clear, lightweight view of only what they can know.
6. **DM workspace is desktop/tablet-first.** DMs need power tools, filters, panels, fast capture, and review workflows.
7. **Canon is controlled.** Player notes and proposals do not become campaign truth until the DM accepts them.
8. **Web-first architecture.** PostgreSQL-backed accounts, campaign memberships, invitations, and sessions are the current product direction.
9. **No legacy compatibility by default.** Obsolete routes, storage keys, identity headers, and duplicate modules should be removed once migrated.

## DM experience

### Before a session

The DM should open the campaign and quickly understand:

- the latest recap;
- open objectives and unresolved consequences;
- relevant NPCs, locations, factions, clues, and secrets;
- what the players know;
- what can be revealed next;
- what needs preparation.

The current target surface for this is the campaign **Command Center**.

### During a session

The DM should be able to capture and reveal information without fighting long forms:

- quick notes;
- facts established at the table;
- clues revealed;
- objectives advanced or completed;
- improvised NPCs or locations;
- player decisions;
- consequences created;
- relationship changes.

### After a session

The DM should be able to close the loop:

- write or refine the recap;
- convert rough captures into structured entities, facts, consequences, or proposals;
- decide what becomes visible to players;
- prepare the next session from actual campaign state.

## Player experience

Players should be able to use DMCC from a phone before, during, and between sessions.

They should see:

- campaign recap;
- visible objectives;
- known NPCs, places, clues, handouts, and relationships;
- their character material;
- their own notes and proposals;
- session information shared by the DM.

They must not receive:

- DM-only secrets;
- unrevealed clues;
- private notes from other players;
- internal DM conclusions;
- facts not visible to their table, membership, or character context.

## Current documentation boundaries

This document is product direction, not an implementation checklist. Use it with:

- `docs/p1-product-decisions.md` for active product decisions;
- `README.md` for setup and current capabilities;
- source and tests for the implementation truth.
