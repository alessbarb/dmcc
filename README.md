# DM Campaign Companion

**DM Campaign Companion** — **DMCC** — is a web-first campaign workspace for tabletop RPG Dungeon Masters.

It helps you prepare sessions, track what happened at the table, connect clues and secrets, manage NPCs and locations, and keep long-running campaigns coherent as they grow.

DMCC is built for DMs who enjoy living worlds: recurring characters, hidden information, unresolved consequences, faction drama, player decisions, mystery threads and storylines that evolve over time.

It is not a virtual tabletop.

It is the memory layer around your campaign.

## Why DMCC exists

Campaign notes usually start simple. A few NPCs, a couple of places, one main quest.

Then the players spare the wrong villain, adopt a suspicious goblin, ignore the obvious clue, invent a theory that is better than your plan, and accidentally start a political crisis.

A few sessions later, the hard part is no longer imagination. The hard part is continuity.

DMCC helps you keep track of:

- what exists in the world,
- what the players know,
- what is still hidden,
- what changed because of their choices,
- what threads are still open,
- and what deserves attention next session.

The goal is simple: **spend less time searching through notes and more time running the game**.

## Main features

### Campaign dashboard

Start from a high-level view of the current campaign state.

The dashboard highlights active quests, important NPCs, pending consequences, recent changes, current locations and issues that may need the DM's attention.

It is designed as a quick briefing before you start preparing or running a session.

### Visual campaign canvas

The canvas is the main visual workspace for planning and understanding your campaign.

You can place entities, facts, quick notes and visual groups on a board, then connect them with meaningful relationships. Use it for mysteries, factions, cities, dungeons, session plans or any custom structure that helps you think.

The canvas supports:

- entity cards,
- fact cards,
- quick notes,
- visual groups,
- connected consequences,
- public vs DM-only visibility,
- presentation mode,
- player-facing view,
- quick session notes,
- quick text import,
- and conversion of rough notes into structured campaign entities.

For a DM, this makes the campaign easier to see, not just easier to store.

### Narrative entities

DMCC lets you create and manage the important building blocks of a campaign:

- player characters,
- NPCs,
- locations,
- factions,
- quests,
- clues,
- secrets,
- items,
- creatures,
- encounters,
- scenes,
- fronts,
- clocks,
- decisions,
- consequences,
- rumors,
- rule references,
- handouts,
- and notes.

Entities can include descriptions, summaries, status, importance, visibility, tags, images and type-specific details.

This allows DMCC to treat a clue differently from an NPC, a secret differently from a location, and a consequence differently from a simple note.

### Relationship graph

Campaigns are made of connections.

DMCC includes a graph view to explore how entities relate to each other: who knows what, which clue points to which secret, what quest depends on which location, or how one consequence affects another part of the world.

The graph includes search and filtering tools so you can quickly focus on the part of the campaign that matters right now.

### Active session tools

DMCC is designed around the real rhythm of play.

During a session, you can record what happens without stopping the game:

- scenes started or closed,
- notes recorded,
- facts established,
- clues revealed,
- secrets hinted,
- quests updated,
- player decisions,
- consequences created or triggered,
- NPCs met,
- locations visited,
- items obtained,
- combat events,
- relationship changes,
- and custom events.

At the end of the session, you can close it with a summary and carry its consequences forward.

### Timeline

The timeline gives you a chronological view of the campaign.

It helps answer questions like:

- When did the party meet this NPC?
- When was this clue revealed?
- What happened last session?
- Which events created this consequence?

This is especially useful when there are weeks between sessions and everyone remembers the story slightly differently.

### What's Next

The **What's Next** view helps prepare the next session from the current campaign state.

It surfaces open threads, relevant quests, unresolved consequences and preparation tasks so the next session starts from what actually happened, not from what you vaguely remember planning three weeks ago.

### Boards

Boards provide focused views of campaign material.

Use them to review active quests, prepared clues, secrets, consequences, important NPCs or anything else that needs a more practical working view than the full graph.

### Search

DMCC includes fast search across campaign entities and facts.

Search by title, summary, content or type, then jump straight to the relevant entity. This is useful both while preparing and during the session, when speed matters.

### Player management and player portal

DMCC can track players and their characters.

The player portal allows invited players to sign in from the web. From there, they can access player-facing campaign information, character material, notes and objectives depending on what the DM has made visible.

This keeps a clear separation between DM knowledge and player knowledge.

### Rules handbook

DMCC includes a searchable rules handbook for supported rules content.

The current app includes a D&D SRD 5.2.1 rules dataset with categories such as gameplay, character creation, classes, origins, feats, equipment, spellcasting, spells, monsters and glossary entries.

### Backups and exports

Campaign data can be exported for review and long-term storage.

DMCC currently supports:

- JSON export,
- Markdown export,
- and web-based campaign records backed by PostgreSQL.

Markdown export is especially useful for offline reading, long-term storage, and reviewing the campaign as a narrative dossier outside the app.

### Multiple languages

The interface supports multiple languages:

- English,
- Spanish,
- French,
- German,
- Italian,
- Portuguese.

## Current product focus

DMCC is currently focused on:

- campaign memory,
- session continuity,
- narrative structure,
- relationship mapping,
- player-facing visibility,
- web invitations,
- and workspace-based campaign ownership.

The app is now PostgreSQL-backed and web-first. User access is handled through account sessions, campaign memberships and invitations.

## Who DMCC is for

DMCC works best for campaigns with continuity and moving parts:

- mystery campaigns,
- political intrigue,
- sandbox adventures,
- faction-heavy stories,
- long-running homebrew worlds,
- campaigns with many NPCs,
- player-driven narratives,
- and DMs who improvise but still want the world to remember.

It is less about replacing your creativity and more about making sure your campaign can grow without collapsing under its own notes.

## Documentation

Current product and engineering references live under [`docs/`](docs/README.md). Historical PR reviews, dated implementation plans, and SDD task reports are archived under `docs/archive/` and should not be treated as current implementation contracts without checking the live source.

## Getting started

### Requirements

- Node.js 20 or higher
- npm
- PostgreSQL

### Install

```bash
git clone https://github.com/alessbarb/dmcc.git
cd dmcc
npm install
```

### Run in development

Development binds the Vite dev server and backend to loopback by default:

```bash
npm run dev
```

The development app usually runs at:

```txt
http://localhost:5173
```

The API server runs on port `4877` by default.

### Build

```bash
npm run build
```

### Start the built app

```bash
npm start
```

The built app is served by the backend, usually at:

```txt
http://127.0.0.1:4877
```

## Deployment and database security

DMCC ships with a Docker Compose Postgres service for **development only**. The Compose credentials (`dmcc` / `dmcc_password`) are intentionally trivial so that contributors can start a database quickly; never reuse them in staging, production, demos exposed to a network, or shared environments.

For any deployed environment:

- Set `NODE_ENV=production` and provide an explicit `DATABASE_URL`. The backend refuses to start in production without `DATABASE_URL` so it cannot silently fall back to development credentials.
- Set `DATABASE_SSL_MODE` explicitly when a deployment needs to override automatic TLS detection. Supported values are `auto` (default: require TLS for remote hosts and disable it only for loopback/Unix socket connections), `require` (always use TLS with normal certificate validation), and `disable` (development only; production refuses remote database hosts with TLS disabled).
- Generate a unique Postgres username, password, and database name per environment. Use least-privilege database roles for the application user.
- Store `DATABASE_URL`, `SESSION_SECRET`, and other sensitive values in a secret manager such as your platform secret store, Docker/Kubernetes secrets, 1Password, Vault, AWS Secrets Manager, GCP Secret Manager, or Azure Key Vault. Do not commit real secrets to Git or paste them into documentation examples.
- Rotate credentials if they were shared in chat, logs, terminals, screenshots, or issue trackers.
- Restrict database network access to the application runtime and operational tooling only. The Compose file binds Postgres to `127.0.0.1`; production deployments should use private networking or firewall rules rather than public database ports.
- For databases signed by a private CA, keep certificate verification enabled and provide the CA through the runtime instead of disabling verification. For example, set `PGSSLROOTCERT=/path/to/root-ca.pem` or use the equivalent managed-platform secret/file mount before running `npm run db:whoami` or starting the app.

Example production environment shape:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://<unique-app-user>:<secret-from-manager>@<private-db-host>:5432/<unique-db-name>
DATABASE_SSL_MODE=auto
SESSION_SECRET=<secret-from-manager>
DMCC_PUBLIC_ORIGIN=https://your-domain.example
```

## Useful scripts

```bash
npm run dev              # Start backend and frontend bound to localhost/127.0.0.1
npm run dev:ui           # Start only the Vite UI bound to 127.0.0.1
npm run build            # Build the frontend and backend
npm start                # Start the built application
npm run test             # Run unit and integration tests
npm run test:e2e         # Run Playwright end-to-end tests
npm run typecheck:all    # Run TypeScript checks
npm run lint             # Run ESLint
npm run quality          # Run lint, typecheck, tests and build
npm run db:migrate       # Apply database migrations
```

## Premade campaigns

Demo campaign content ships as static JSON premade templates under `public/premades/`. Import them through the UI or use these maintenance scripts:

```bash
npm run premade:validate      # Validate all templates (refs, locale parity)
npm run premade:build         # Normalize template metadata
npm run premade:build:check   # Check if normalization is needed (CI-safe)
```

Templates: **oracle-triple-eclipse** (La Sombra del Oráculo) and **phandalin-starter** (Shadows over Phandalin). Both available in English and Spanish.

## Project structure

```txt
src/
  backend/       Web API, PostgreSQL repositories and deployment runtime
  frontend/      React application and campaign UI
  core/          Campaign domain, commands, events and projections
  shared/        Shared schemas, IDs, rules, i18n and utilities

public/          Static assets
tests/           Unit and integration tests
e2e/             End-to-end tests
public/premades/ Premade campaign templates (JSON)
scripts/         Build and maintenance scripts
```

## Technical overview

DMCC is built as a TypeScript web application.

### Frontend

- React
- TanStack Router
- Zustand
- React Flow
- React Force Graph 3D
- Fuse.js
- Lucide React

### Backend

- Node.js
- Fastify
- PostgreSQL
- Drizzle ORM
- Zod
- Event-based campaign state with projections

### Quality

- TypeScript
- Vitest
- Playwright
- ESLint

## Status

DMCC is in active development.

The current version is suitable for web-first campaign modelling, feature testing and product iteration. Some workflows may still change as the application evolves.

## License

Private/personal project.

You may adapt it to your own table, ruleset, campaign world or way of running games.
