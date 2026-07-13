> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 4 Completion Report: Quests, Clues, and Secrets

## Status
**DONE**

## Commits
- `6f4c3cf` feat(seed): add quests, 20 clues, 15 secrets

## Counts
- Quests: 6
- Clues: 21 (Note: Brief text says 20, but code block contains 21 items)
- Secrets: 15

## Details

### Quests (6 total)
All quests implemented with full metadata:
- `ent_q_profecia_rota` — Main arc quest
- `ent_q_precio_silencio` — Side quest (Torben)
- `ent_q_archivista` — Side quest (Mira)
- `ent_q_sangre_puerto` — Side quest (port murders)
- `ent_q_traidor_interior` — Side quest (spy, dm_only visibility)
- `ent_q_epilogo` — Background quest (optional session 9)

### Clues (21 total)
All clues implemented across four session blocks:
- **Sessions 1-2** (5 clues): prophecy text, petitioner fears, merchant payment, arcane components, Torben's tip
- **Sessions 3-4** (6 clues): archive records, guild ledger, port body marks, Sera's texts, Lyra's investigation, inner circle meeting
- **Sessions 5-6** (4 clues): false prophecy audio, Senra's doubts, vault entrance, vault records
- **Sessions 7-8** (6 clues): escape plan, Vantis confession, cult defectors, ancient tome, original Oracle truth, forgery tool

All hidden clues and secrets marked with `visibility: { kind: "dm_only" as const }` as required.

### Secrets (15 total)
All secrets implemented with full truth descriptions and reveal conditions:
- Core conspiracy: oracle fraud, Vantis funding, divine voice illusion
- Key suspects: Lyra's suspicions, Kael's evidence, archive fire, Senra's defection, Dorian's espionage
- Historical truth: original Oracle, vault location, prophecy count, Brann's knowledge
- Tactical details: escape plan, vault password, widow's tragedy

## Verification
```bash
$ grep -c 'entityType: "quest"' scratch/seed-oracle-campaign.ts
6

$ grep 'entityId: "ent_clue_' scratch/seed-oracle-campaign.ts | wc -l
21

$ grep 'entityId: "ent_sec_' scratch/seed-oracle-campaign.ts | wc -l
15
```

## Concerns
**Note on clue count discrepancy**: The brief text says "20 clues" expected, but the provided code block contains 21 clue objects. The implementation matches the code block exactly (21 clues). If this is a requirement issue, it can be easily corrected by removing one clue or updating the brief expectation.

All content is sourced from the provided brief. No new content was invented. All visibility rules, statuses, and importance levels follow the specifications.
