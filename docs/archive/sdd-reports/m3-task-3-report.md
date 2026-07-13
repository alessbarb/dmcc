> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 3 Report: NPCs (25)

## Status
**DONE**

## Commits
- `6a9679b` — feat(seed): add 25 NPCs

## NPC Count
**25 NPCs verified** via:
```bash
grep -c "entityId: \"ent_npc_" scratch/seed-oracle-campaign.ts
→ 25
```

## Implementation Details
Replaced stub `seedNpcs()` in `scratch/seed-oracle-campaign.ts` with complete implementation of all 25 NPCs from the task brief:

### NPCs Added
- **Antagonistas (3)**: Veradis el Oráculo, Lord Vantis, Inquisidor Mors
- **Consejo (3)**: Magister Aldric, Consejera Lena Marsh, Consejero Brann
- **Guardia (2)**: Lyra Stonehaven, Riku
- **Taberna/Contactos (1)**: Torben el Tabernero
- **Gremio (2)**: Kael Nightblade, Cira la Sombra
- **Templo de la Verdad (2)**: Sera Moonwhisper, Abad Fenwick
- **Consorcio (2)**: Dorian Vex, Maestra Ola Brightstone
- **Archivo (1)**: Mira la Archivista
- **Secundarios (8)**: Iniciado del Culto, Heraldo Vorn, Widow Asha, Capitán Drez, Escriba Pell, Maestra Ilva, Pica, Sargento Bren, Maga Senra

All use `entityType: "npc"` and `ent_npc_*` ID prefixes as required. Spanish summaries, English metadata identifiers. Visibility rules and faction associations intact.

## Concerns
None. Implementation complete and verified.
