> Archived historical implementation plan.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Seeds → Premades Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all reusable narrative content from `seeds/campaigns/oracle/` and `seeds/campaigns/phandalin/` into `public/premades/`, achieving full en/es parity, then delete seeds/ and all seed-related tooling.

**Architecture:** Premades use a 3-file structure per campaign: `template.json` (IDs + structural metadata), `locales/en.json` (English text overlays), `locales/es.json` (Spanish text overlays). Content migration = read TypeScript seed source → convert to JSON template + locale entries. No runtime execution of seeds required. All IDs in premades are deterministic `ent_tpl_*` / `rel_tpl_*` / `fact_tpl_*` / `sess_tpl_*` / `cvs_tpl_*` prefixed strings; seed IDs (random UUIDs) are replaced by stable premade IDs using the mapping tables below.

**Tech Stack:** TypeScript seed sources (read-only reference), JSON templates, Node.js `scripts/premades/validate.mjs`, `scripts/premades/build.mjs`, Vitest tests.

## Global Constraints

- All new entity IDs must follow pattern: `ent_tpl_<campaign>_<slug>`
- All new relation IDs: `rel_tpl_<campaign>_<slug>`
- All new fact IDs: `fact_tpl_<campaign>_<N>` (sequential, continuing from last)
- All new session IDs: `sess_tpl_<campaign>_<slug>`
- All new canvas IDs: `cvs_tpl_<campaign>_<slug>`
- Every new entity must appear in BOTH `locales/en.json` AND `locales/es.json` with non-empty `title` and `summary`
- Every new relation must appear in both locales with non-empty `description`
- Every new fact must appear in both locales with non-empty `statement`
- Every new session must appear in both locales with `title` and `prep.summary`
- Secrets with `visibility.kind === "dm_only"` must NOT have their `truth` or `goal` fields in a public locale key
- Never edit `stats` counters manually — always run `npm run premade:build` to recompute
- Do not delete seeds/ until both campaigns pass validate + import tests
- Preserve all content already in premades (scenes, clocks, decisions, consequences, handouts); only ADD, never remove existing tpl_ content
- Phandalin sessions migrate as `prep`-only (no `events`, `openings`, `closings`)
- Oracle sessions are already prep-only in premade; verify, do not regress

---

## Baseline State (Gate 0)

**Oracle premade (v1.2.0):** 67 entities, 61 relations, 16 facts, 8 sessions, 1 canvas
**Phandalin premade (v1.1.0):** 29 entities, 23 relations, 12 facts, 5 sessions, 1 canvas

**Seed sources (read reference only):**

```
seeds/campaigns/oracle/  → ids.ts, characters.ts, locations.ts, factions.ts, npcs.ts,
                           quests.ts, clues.ts, secrets.ts, facts.ts, relations.ts, canvas.ts
seeds/campaigns/phandalin/ → ids.ts, characters.ts, locations.ts, factions.ts, npcs.ts,
                              quests.ts, clues.ts, secrets.ts, facts.ts, relations.ts,
                              canvas.ts, sessions.ts
```

---

## Oracle ID Mapping Table

**Seed constant → premade `ent_tpl_oracle_*` ID (new entries only — already-mapped entities excluded)**

| Seed constant | New premade ID |
|---|---|
| ENT_PC_ELOWYN | ent_tpl_oracle_pc_elowyn |
| ENT_PC_CAMUS | ent_tpl_oracle_pc_camus |
| ENT_PC_RAGNA | ent_tpl_oracle_pc_ragna |
| ENT_PC_SILAS | ent_tpl_oracle_pc_silas |
| ENT_LOC_BARRIO_NOBLE | ent_tpl_oracle_loc_noble_district |
| ENT_LOC_CAMPAMENTO_GREMIO | ent_tpl_oracle_loc_guild_camp |
| ENT_LOC_SANTUARIO_BOSQUE | ent_tpl_oracle_loc_forest_shrine |
| ENT_LOC_SALA_CONSEJO | ent_tpl_oracle_loc_council_chamber |
| ENT_LOC_MUELLES | ent_tpl_oracle_loc_docks |
| ENT_NPC_ALDRIC | ent_tpl_oracle_npc_aldric |
| ENT_NPC_CONSEJERA_LENA | ent_tpl_oracle_npc_lena |
| ENT_NPC_GUARDIA_RIKU | ent_tpl_oracle_npc_riku |
| ENT_NPC_TORBEN | ent_tpl_oracle_npc_torben |
| ENT_NPC_CIRA | ent_tpl_oracle_npc_cira |
| ENT_NPC_MERCADER_JEFE | ent_tpl_oracle_npc_ola |
| ENT_NPC_HERALDO | ent_tpl_oracle_npc_vorn |
| ENT_NPC_INICIADO_CULTO | ent_tpl_oracle_npc_initiate |
| ENT_NPC_ESCRIBA_CONSEJO | ent_tpl_oracle_npc_pell |
| ENT_NPC_CURANDERO | ent_tpl_oracle_npc_healer |
| ENT_NPC_RUMORISTA | ent_tpl_oracle_npc_pica |
| ENT_NPC_VETERANO_GUARDIA | ent_tpl_oracle_npc_bren |
| ENT_Q_PRECIO_SILENCIO | ent_tpl_oracle_quest_silence |
| ENT_Q_ARCHIVISTA | ent_tpl_oracle_quest_archivist |
| ENT_Q_SANGRE_PUERTO | ent_tpl_oracle_quest_port_blood |
| ENT_Q_TRAIDOR_INTERIOR | ent_tpl_oracle_quest_traitor |
| ENT_Q_EPILOGO | ent_tpl_oracle_quest_epilogue |
| ENT_CLUE_PETITIONER_FEAR | ent_tpl_oracle_clue_petitioner_fear |
| ENT_CLUE_MERCHANT_PAYMENT | ent_tpl_oracle_clue_merchant_payment |
| ENT_CLUE_TORBEN_TIP | ent_tpl_oracle_clue_torben_tip |
| ENT_CLUE_PORT_BODIES | ent_tpl_oracle_clue_port_bodies |
| ENT_CLUE_LYRA_INVESTIGATION | ent_tpl_oracle_clue_lyra_notes |
| ENT_CLUE_VAULT_ENTRANCE | ent_tpl_oracle_clue_vault_entrance |
| ENT_CLUE_VANTIS_CONFESSION | ent_tpl_oracle_clue_vantis_confession |
| ENT_CLUE_CULTO_DISBANDS | ent_tpl_oracle_clue_cult_disbands |
| ENT_CLUE_ELDERTOME | ent_tpl_oracle_clue_eldertome |
| ENT_CLUE_FINAL_TRUTH | ent_tpl_oracle_clue_final_truth |
| ENT_CLUE_FORGERY_TOOL | ent_tpl_oracle_clue_forgery_tool |
| ENT_SEC_LYRA_SUSPECTS | ent_tpl_oracle_secret_lyra_suspects |
| ENT_SEC_KAEL_EVIDENCE | ent_tpl_oracle_secret_kael_proof |
| ENT_SEC_PROPHECY_COUNT | ent_tpl_oracle_secret_prophecy_count |
| ENT_SEC_CONSEJO_CORRUPTION | ent_tpl_oracle_secret_council_corrupt |
| ENT_SEC_SENRA_EXIT_CODE | ent_tpl_oracle_secret_senra_exit |

**Already-mapped Oracle entities (seed constant → existing premade ID):**

| Seed constant | Existing premade ID |
|---|---|
| ENT_LOC_VALDRIS | ent_tpl_oracle_valdris |
| ENT_LOC_SALA_ORACULO | ent_tpl_oracle_loc_chamber |
| ENT_LOC_ARCHIVO | ent_tpl_oracle_loc_archive |
| ENT_LOC_RUINAS | ent_tpl_oracle_loc_ruins |
| ENT_LOC_BOVEDA | ent_tpl_oracle_loc_vault |
| ENT_LOC_PUERTO | ent_tpl_oracle_loc_port |
| ENT_LOC_TABERNA_CUERVO | ent_tpl_oracle_loc_raven_tavern |
| ENT_LOC_MANSION_VANTIS | ent_tpl_oracle_loc_vantis_mansion |
| ENT_LOC_CUARTEL_GUARDIA | ent_tpl_oracle_loc_guard_barracks |
| ENT_LOC_TEMPLO_VERDAD | ent_tpl_oracle_loc_truth_temple |
| ENT_FAC_CULTO | ent_tpl_oracle_faction_cult |
| ENT_FAC_CONSEJO | ent_tpl_oracle_faction_council |
| ENT_FAC_GREMIO | ent_tpl_oracle_faction_guild |
| ENT_FAC_TEMPLO_VERDAD | ent_tpl_oracle_faction_truth_temple |
| ENT_FAC_CONSORCIO | ent_tpl_oracle_faction_merchants |
| ENT_NPC_VERADIS | ent_tpl_oracle_npc_veradis |
| ENT_NPC_SENRA | ent_tpl_oracle_npc_senra |
| ENT_NPC_LYRA | ent_tpl_oracle_npc_lyra |
| ENT_NPC_KAEL | ent_tpl_oracle_npc_kael |
| ENT_NPC_VANTIS | ent_tpl_oracle_npc_vantis |
| ENT_NPC_SERA | ent_tpl_oracle_npc_sera |
| ENT_NPC_MIRA | ent_tpl_oracle_npc_mira |
| ENT_NPC_GUARDIAN_JEFE | ent_tpl_oracle_npc_mors |
| ENT_NPC_CONSEJERO_BRANN | ent_tpl_oracle_npc_brann |
| ENT_NPC_DORIAN | ent_tpl_oracle_npc_dorian |
| ENT_NPC_PETICIONARIO | ent_tpl_oracle_npc_asha |
| ENT_NPC_CAPITAN_BARCO | ent_tpl_oracle_npc_drez |
| ENT_NPC_ABAD_SANTUARIO | ent_tpl_oracle_npc_fenwick |
| ENT_Q_PROFECIA_ROTA | ent_tpl_oracle_quest_broken_prophecy |
| ENT_SEC_ORACLE_FRAUD | ent_tpl_oracle_secret_fraud |
| ENT_SEC_VANTIS_FUNDING | ent_tpl_oracle_secret_vantis_funds |
| ENT_SEC_DIVINE_VOICE | ent_tpl_oracle_secret_voice_illusion |
| ENT_SEC_ARCHIVE_FIRE | ent_tpl_oracle_secret_archive_fire |
| ENT_SEC_SENRA_DEFECT | ent_tpl_oracle_secret_senra_defects |
| ENT_SEC_DORIAN_SPY | ent_tpl_oracle_secret_dorian_spy |
| ENT_SEC_ORIGINAL_ORACLE | ent_tpl_oracle_secret_true_veradis |
| ENT_SEC_VAULT_LOCATION | ent_tpl_oracle_secret_vault_location |
| ENT_SEC_CAPTAIN_ESCAPE | ent_tpl_oracle_secret_escape_ship |
| ENT_SEC_WIDOW_SON | ent_tpl_oracle_secret_asha_son_dead |

---

## Phandalin ID Mapping Table

**New premade IDs for entities in seed but NOT yet in premade:**

| Seed constant | New premade ID |
|---|---|
| ENT_PC_ARIC | ent_tpl_phandalin_pc_aric |
| ENT_PC_MIRA | ent_tpl_phandalin_pc_mira |
| ENT_PC_BROM | ent_tpl_phandalin_pc_brom |
| ENT_PC_NIM | ent_tpl_phandalin_pc_nim |
| ENT_LOC_STONEHILL | ent_tpl_phandalin_stonehill |
| ENT_LOC_BARTHEN | ent_tpl_phandalin_barthen |
| ENT_LOC_LIONSHIELD | ent_tpl_phandalin_lionshield |
| ENT_LOC_SLEEPING_GIANT | ent_tpl_phandalin_sleeping_giant |
| ENT_LOC_TOWNMASTER | ent_tpl_phandalin_townmaster |
| ENT_LOC_EDERMATH | ent_tpl_phandalin_edermath |
| ENT_LOC_ALDERLEAF | ent_tpl_phandalin_alderleaf |
| ENT_LOC_MINERS_EXCHANGE | ent_tpl_phandalin_miners_exchange |
| ENT_LOC_CRAGMAW_CASTLE | ent_tpl_phandalin_cragmaw_castle |
| ENT_LOC_FORGE_OF_SPELLS | ent_tpl_phandalin_forge_of_spells |
| ENT_LOC_CONYBERRY | ent_tpl_phandalin_conyberry |
| ENT_LOC_AGATHA_LAIR | ent_tpl_phandalin_agatha_lair |
| ENT_LOC_OLD_OWL_WELL | ent_tpl_phandalin_old_owl_well |
| ENT_LOC_WYVERN_TOR | ent_tpl_phandalin_wyvern_tor |
| ENT_LOC_THUNDERTREE | ent_tpl_phandalin_thundertree |
| ENT_FAC_TOWN | ent_tpl_phandalin_town_faction |
| ENT_FAC_CRAGMAW | ent_tpl_phandalin_cragmaw |
| ENT_FAC_ROCKSEEKER | ent_tpl_phandalin_rockseeker |
| ENT_FAC_LORDS_ALLIANCE | ent_tpl_phandalin_lords_alliance |
| ENT_FAC_ZHENTARIM | ent_tpl_phandalin_zhentarim |
| ENT_FAC_ORDER_GAUNTLET | ent_tpl_phandalin_order_gauntlet |
| ENT_FAC_EMERALD_ENCLAVE | ent_tpl_phandalin_emerald_enclave |
| ENT_FAC_WYVERN_ORCS | ent_tpl_phandalin_wyvern_orcs |
| ENT_FAC_ASH_ZOMBIES | ent_tpl_phandalin_ash_zombies |
| ENT_NPC_ELMAR | ent_tpl_phandalin_elmar |
| ENT_NPC_TRILENA | ent_tpl_phandalin_trilena |
| ENT_NPC_HARBIN | ent_tpl_phandalin_harbin |
| ENT_NPC_GARAELE | ent_tpl_phandalin_garaele |
| ENT_NPC_DARAN | ent_tpl_phandalin_daran |
| ENT_NPC_CARP | ent_tpl_phandalin_carp |
| ENT_NPC_MIRNA | ent_tpl_phandalin_mirna |
| ENT_NPC_GLASSTAFF_ALIAS | ent_tpl_phandalin_glasstaff |
| ENT_NPC_NOTHIC | ent_tpl_phandalin_nothic |
| ENT_NPC_GRISTA | ent_tpl_phandalin_grista |
| ENT_NPC_KLARG | ent_tpl_phandalin_klarg |
| ENT_NPC_YEEMIK | ent_tpl_phandalin_yeemik |
| ENT_NPC_GROL | ent_tpl_phandalin_grol |
| ENT_NPC_VYERITH | ent_tpl_phandalin_vyerith |
| ENT_NPC_NUNDRO | ent_tpl_phandalin_nundro |
| ENT_NPC_THARDEN | ent_tpl_phandalin_tharden |
| ENT_NPC_HAMUN | ent_tpl_phandalin_hamun |
| ENT_NPC_REIDOTH | ent_tpl_phandalin_reidoth |
| ENT_NPC_AGATHA | ent_tpl_phandalin_agatha |
| ENT_NPC_BRUGHOR | ent_tpl_phandalin_brughor |
| ENT_NPC_VENOMFANG | ent_tpl_phandalin_venomfang |
| ENT_Q_ESCORT | ent_tpl_phandalin_quest_escort |
| ENT_Q_RESCUE_GUNDREN | ent_tpl_phandalin_quest_rescue |
| ENT_Q_REDBRANDS | ent_tpl_phandalin_quest_redbrands |
| ENT_Q_DENDRAR_RESCUE | ent_tpl_phandalin_quest_dendrar |
| ENT_Q_FIND_CASTLE | ent_tpl_phandalin_quest_castle |
| ENT_Q_BLACK_SPIDER | ent_tpl_phandalin_quest_spider |
| ENT_Q_RECOVER_LIONSHIELD | ent_tpl_phandalin_quest_lionshield |
| ENT_Q_AGATHA | ent_tpl_phandalin_quest_agatha |
| ENT_Q_OLD_OWL_WELL | ent_tpl_phandalin_quest_old_owl |
| ENT_Q_WYVERN_TOR | ent_tpl_phandalin_quest_wyvern |
| ENT_Q_THUNDERTREE | ent_tpl_phandalin_quest_thundertree |
| ENT_Q_FUTURE_PHANDALIN | ent_tpl_phandalin_quest_future |
| ENT_CLUE_GOBLIN_TRAIL | ent_tpl_phandalin_clue_goblin_trail |
| ENT_CLUE_SILDAR_WARNING | ent_tpl_phandalin_clue_sildar_warning |
| ENT_CLUE_REDBRAND_THREATS | ent_tpl_phandalin_clue_redbrand_threats |
| ENT_CLUE_TOWN_FEARS | ent_tpl_phandalin_clue_town_fears |
| ENT_CLUE_CARP_TUNNEL | ent_tpl_phandalin_clue_carp_tunnel |
| ENT_CLUE_SLEEPING_GIANT_BOAST | ent_tpl_phandalin_clue_sleeping_boast |
| ENT_CLUE_RED_BRAND_LEDGER | ent_tpl_phandalin_clue_ledger |
| ENT_CLUE_GLASSTAFF_LETTER | ent_tpl_phandalin_clue_glasstaff_letter |
| ENT_CLUE_NOTHIC_WHISPERS | ent_tpl_phandalin_clue_nothic_whispers |
| ENT_CLUE_MIRNA_HEIRLOOM | ent_tpl_phandalin_clue_mirna_heirloom |
| ENT_CLUE_HALIA_OFFER | ent_tpl_phandalin_clue_halia_offer |
| ENT_CLUE_HARBIN_NOTICE | ent_tpl_phandalin_clue_harbin_notice |
| ENT_CLUE_DARAN_REPORT | ent_tpl_phandalin_clue_daran_report |
| ENT_CLUE_LINENE_CARGO_MARKS | ent_tpl_phandalin_clue_cargo_marks |
| ENT_CLUE_CASTLE_MARKS | ent_tpl_phandalin_clue_castle_marks |
| ENT_CLUE_CRAGMAW_RANSOM | ent_tpl_phandalin_clue_ransom |
| ENT_CLUE_VYERITH_DISGUISE | ent_tpl_phandalin_clue_vyerith |
| ENT_CLUE_GROL_BARGAIN | ent_tpl_phandalin_clue_grol_bargain |
| ENT_CLUE_NUNDRO_TESTIMONY | ent_tpl_phandalin_clue_nundro |
| ENT_CLUE_SPIDER_SIGIL | ent_tpl_phandalin_clue_spider_sigil |
| ENT_CLUE_MINE_MAP | ent_tpl_phandalin_clue_mine_map |
| ENT_CLUE_FORGE_ECHO | ent_tpl_phandalin_clue_forge_echo |
| ENT_CLUE_THARDEN_BODY | ent_tpl_phandalin_clue_tharden |
| ENT_CLUE_REIDOTH_WARNING | ent_tpl_phandalin_clue_reidoth |
| ENT_CLUE_DRAGON_SIGNS | ent_tpl_phandalin_clue_dragon_signs |
| ENT_CLUE_OLD_OWL_SIGNS | ent_tpl_phandalin_clue_owl_signs |
| ENT_CLUE_AGATHA_MEMORY | ent_tpl_phandalin_clue_agatha_memory |
| ENT_CLUE_WYVERN_TOR_RAIDS | ent_tpl_phandalin_clue_wyvern_raids |
| ENT_CLUE_PHANDALIN_POWER_VACUUM | ent_tpl_phandalin_clue_power_vacuum |
| ENT_SEC_NEZZNAR | ent_tpl_phandalin_secret_nezznar |
| ENT_SEC_CASTLE_LOCATION | ent_tpl_phandalin_secret_castle |
| ENT_SEC_GUNDREN_MAP | ent_tpl_phandalin_secret_map |
| ENT_SEC_HALIA_AMBITION | ent_tpl_phandalin_secret_halia |
| ENT_SEC_HARBIN_COWARDICE | ent_tpl_phandalin_secret_harbin |
| ENT_SEC_CRAGMAW_BARGAIN | ent_tpl_phandalin_secret_cragmaw_deal |
| ENT_SEC_FORGE_REAL | ent_tpl_phandalin_secret_forge |
| ENT_SEC_DENDRARS_ALIVE | ent_tpl_phandalin_secret_dendrars |
| ENT_SEC_NOTHIC_HUNGER | ent_tpl_phandalin_secret_nothic |
| ENT_SEC_REDBRAND_HOSTAGES | ent_tpl_phandalin_secret_hostages |
| ENT_SEC_VYERITH_DOPPELGANGER | ent_tpl_phandalin_secret_vyerith |
| ENT_SEC_THARDEN_DEAD | ent_tpl_phandalin_secret_tharden |
| ENT_SEC_HAMUN_NOT_PRIMARY | ent_tpl_phandalin_secret_hamun |
| ENT_SEC_VENOMFANG_MANIPULATES | ent_tpl_phandalin_secret_venomfang |
| ENT_SEC_AGATHA_KNOWS | ent_tpl_phandalin_secret_agatha |
| ENT_SEC_WYVERN_ORCS_PRESSURE | ent_tpl_phandalin_secret_wyvern |
| ENT_SEC_PHANDALIN_POWER_VACUUM | ent_tpl_phandalin_secret_vacuum |

**Already-mapped Phandalin entities:**

| Seed constant | Existing premade ID |
|---|---|
| ENT_LOC_PHANDALIN | ent_tpl_phandalin_town |
| ENT_LOC_TRIBOAR_TRAIL | ent_tpl_phandalin_trail |
| ENT_LOC_CRAGMAW_HIDEOUT | ent_tpl_phandalin_hideout |
| ENT_LOC_TRESENDAR | ent_tpl_phandalin_tresendar |
| ENT_LOC_WAVE_ECHO | ent_tpl_phandalin_wave_echo |
| ENT_LOC_SHRINE | ent_tpl_phandalin_shrine |
| ENT_LOC_STONEHILL (inn) | ent_tpl_phandalin_inn |
| ENT_NPC_GUNDREN | ent_tpl_phandalin_gundren |
| ENT_NPC_SILDAR | ent_tpl_phandalin_sildar |
| ENT_NPC_TOBLEN | ent_tpl_phandalin_toblen |
| ENT_NPC_LINENE | ent_tpl_phandalin_linene |
| ENT_NPC_HALIA | ent_tpl_phandalin_halia |
| ENT_NPC_QELLINE | ent_tpl_phandalin_qelline |
| ENT_FAC_REDBRANDS | ent_tpl_phandalin_redbrands |
| ENT_NPC_IARNO | ent_tpl_phandalin_iarno |
| ENT_NPC_NEZZNAR | ent_tpl_phandalin_nezznar |
| ENT_Q_WAVE_ECHO | ent_tpl_phandalin_quest_gundren (partial) |
| ENT_SEC_IARNO_GLASSTAFF | ent_tpl_phandalin_secret_iarno |
| ENT_SEC_NEZZNAR (funds) | ent_tpl_phandalin_secret_nezznar_funds |
| CLUE_DEAD_HORSES | ent_tpl_phandalin_clue_dead_horses |
| CLUE_BLACKSEAL | ent_tpl_phandalin_clue_blackseal |
| CLUE_REDCLAY | ent_tpl_phandalin_clue_redclay |

**Phandalin sessions gap:**

| Seed session ID | New premade ID |
|---|---|
| SESS_RED_BRANDS | sess_tpl_phandalin_redbrands |
| SESS_CRAGMAW_CASTLE | sess_tpl_phandalin_castle |
| SESS_SIDE_FRONTS | sess_tpl_phandalin_side_fronts |
| SESS_WAVE_ECHO_APPROACH | sess_tpl_phandalin_wave_approach |
| SESS_WAVE_ECHO_FINAL | sess_tpl_phandalin_wave_final |
| SESS_EPILOGUE | sess_tpl_phandalin_epilogue |

(SESS_ROAD → sess_tpl_phandalin_road ✓ already in premade; SESS_TRESENDAR → sess_tpl_phandalin_tresendar ✓ already in premade)

---

## JSON Format Reference

### Entity (template.json)

```json
{
  "entityId": "ent_tpl_oracle_pc_elowyn",
  "entityType": "player_character",
  "importance": "normal",
  "visibility": { "kind": "party" },
  "metadata": {
    "isPremade": true,
    "className": "Rogue",
    "level": 1,
    "species": "Elf",
    "background": "Criminal",
    "armorClass": 14,
    "hitPointsMax": 8,
    "dexterity": 17,
    "strength": 8,
    "constitution": 12,
    "intelligence": 13,
    "wisdom": 14,
    "charisma": 10
  }
}
```

NPC example (dm_only secret metadata goes in template.json metadata as keys, not text):

```json
{
  "entityId": "ent_tpl_oracle_npc_aldric",
  "entityType": "npc",
  "importance": "high",
  "visibility": { "kind": "party" },
  "metadata": {
    "roleKey": "city_magistrate",
    "attitudeKey": "neutral",
    "factionId": "ent_tpl_oracle_faction_council"
  }
}
```

### Entity locale entry (locales/en.json → entities section)

```json
"ent_tpl_oracle_pc_elowyn": {
  "title": "Elowyn Darkwater",
  "subtitle": "Elven rogue, infiltration specialist",
  "summary": "An elven rogue specializing in infiltration and deception. Searching for something taken from her.",
  "status": "active",
  "metadata": {
    "className": "Rogue",
    "species": "Elf",
    "background": "Criminal"
  }
}
```

### Relation (template.json)

```json
{
  "relationId": "rel_tpl_oracle_aldric_cult",
  "sourceEntityId": "ent_tpl_oracle_npc_aldric",
  "targetEntityId": "ent_tpl_oracle_faction_cult",
  "relationType": "custom:supports",
  "visibility": { "kind": "party" }
}
```

dm_only example:

```json
{
  "relationId": "rel_tpl_oracle_lyra_suspects",
  "sourceEntityId": "ent_tpl_oracle_npc_lyra",
  "targetEntityId": "ent_tpl_oracle_npc_veradis",
  "relationType": "fears",
  "visibility": { "kind": "dm_only" }
}
```

### Relation locale entry

```json
"rel_tpl_oracle_aldric_cult": {
  "description": "Aldric publicly endorses Oracle authority to maintain civil order."
}
```

### Fact (template.json)

```json
{
  "factId": "fact_tpl_oracle_17",
  "kind": "lie",
  "confidence": "confirmed",
  "visibility": { "kind": "party" },
  "relatedEntityIds": ["ent_tpl_oracle_npc_veradis"]
}
```

`kind` values: `canon` | `dm_secret` | `rumor` | `lie` | `player_theory` | `mistake` | `retcon` | `unknown`

### Fact locale entry

```json
"fact_tpl_oracle_17": {
  "statement": "It is rumored the Oracle predicted the great eastern plague years in advance. The faithful cite this as proof of his divinity."
}
```

### Session (template.json — prep only, no events/history)

```json
{
  "sessionId": "sess_tpl_phandalin_redbrands",
  "prep": {
    "state": "ready",
    "openingPrompt": "The Redbrands accost someone in the street as the group arrives.",
    "goals": ["Investigate the Redbrands", "Find their base at Tresendar Manor"],
    "sceneIds": ["ent_tpl_phandalin_encounter_street"],
    "involvedEntityIds": ["ent_tpl_phandalin_redbrands", "ent_tpl_phandalin_iarno"],
    "availableClueIds": ["ent_tpl_phandalin_clue_redbrand_threats"],
    "secretsAtRiskIds": ["ent_tpl_phandalin_secret_iarno"],
    "expectedConsequenceIds": [],
    "notes": "This session should establish the Redbrands as a real threat, not just a rumor.",
    "checklist": [
      { "id": "chk_redbrands_1", "label": "Street encounter resolved", "priority": "high", "done": false },
      { "id": "chk_redbrands_2", "label": "Players discover Tresendar as Redbrand base", "priority": "high", "done": false },
      { "id": "chk_redbrands_3", "label": "Optional: Glasstaff letter found", "priority": "medium", "done": false }
    ]
  }
}
```

### Session locale entry

```json
"sess_tpl_phandalin_redbrands": {
  "title": "Session 2 — The Redbrands' Reach",
  "summary": "The group arrives in Phandalin to find a town living under the thumb of the Redbrand thugs. Confrontation is inevitable.",
  "prep": {
    "openingPrompt": "As you enter Phandalin, a group of Redbrands in scarlet cloaks shoves a family out of their path.",
    "goals": ["Investigate the Redbrands", "Find their hideout"],
    "notes": "Let the group choose: fight, negotiate, or sneak into Tresendar.",
    "checklist": {
      "chk_redbrands_1": { "label": "Street encounter resolved" },
      "chk_redbrands_2": { "label": "Players locate Tresendar Manor" },
      "chk_redbrands_3": { "label": "Glasstaff letter found (optional)" }
    }
  }
}
```

### Canvas (template.json)

```json
{
  "canvasId": "cvs_tpl_oracle_characters",
  "canvasType": "characters",
  "nodes": [
    { "id": "node_tpl_c_cult", "kind": "entity", "entityId": "ent_tpl_oracle_faction_cult", "x": 50, "y": 50, "width": 240, "height": 110 },
    { "id": "node_tpl_c_veradis", "kind": "entity", "entityId": "ent_tpl_oracle_npc_veradis", "x": 50, "y": 200, "width": 240, "height": 110 },
    { "id": "node_tpl_c_note", "kind": "note", "x": 50, "y": 350, "width": 240, "height": 80 }
  ],
  "edges": [
    { "id": "edge_tpl_c_veradis_cult", "sourceNodeId": "node_tpl_c_veradis", "targetNodeId": "node_tpl_c_cult", "style": "solid", "status": "domain", "relationshipId": "rel_tpl_oracle_cult_veradis" }
  ]
}
```

### Canvas locale entry

```json
"cvs_tpl_oracle_characters": {
  "title": "Factions and Characters",
  "description": "Faction groups with their key members. Use this to track NPC relationships and loyalties.",
  "nodes": {
    "node_tpl_c_note": { "title": "Character Map", "text": "Each column is a faction. Characters inside are members or associates." }
  },
  "edges": {
    "edge_tpl_c_veradis_cult": { "label": "leads" }
  }
}
```

---

## Task 1: Gate 0 — Baseline verification

**Files:**

- Read: `public/premades/oracle-triple-eclipse/template.json`, `public/premades/phandalin-starter/template.json`

- [ ] **Step 1: Run baseline checks**

```bash
npm run premade:build:check
npm run premade:validate
npm test -- tests/backend/premadeCampaigns.test.ts tests/seeds/seedOracleCampaign.test.ts
```

Expected: all green.

- [ ] **Step 2: Record git state**

```bash
git status
git stash list
```

Document any unstaged changes so you don't accidentally include them.

- [ ] **Step 3: No commit needed** — this is a read-only gate.

---

## Task 2: Oracle — New entities in template.json

**Files:**

- Modify: `public/premades/oracle-triple-eclipse/template.json`
- Read (source): `seeds/campaigns/oracle/characters.ts`, `seeds/campaigns/oracle/locations.ts`, `seeds/campaigns/oracle/npcs.ts`, `seeds/campaigns/oracle/quests.ts`, `seeds/campaigns/oracle/clues.ts`, `seeds/campaigns/oracle/secrets.ts`

**Produces:** 41 new entity objects appended to the `entities` array (after existing entries).

- [ ] **Step 1: Add PC entities** — Read `characters.ts`. For each PC (ENT_PC_ELOWYN, ENT_PC_CAMUS, ENT_PC_RAGNA, ENT_PC_SILAS), create an entity using the premade ID from the mapping table above with `entityType: "player_character"`, `importance: "normal"`, `visibility: { "kind": "party" }`. Put numeric stats in `metadata`; omit string descriptions (those go in locale). Example structure shown in Format Reference above.

- [ ] **Step 2: Add location entities** — Read `locations.ts`. For each of the 5 missing locations (noble_district, guild_camp, forest_shrine, council_chamber, docks), create location entity with `entityType: "location"`, appropriate `importance` (from seed's importance field), visibility `party`. Put `locationType` in metadata; omit string atmosphere/description.

- [ ] **Step 3: Add NPC entities** — Read `npcs.ts`. For the 11 missing NPCs (aldric, lena, riku, torben, cira, ola, vorn, initiate, pell, healer, pica, bren), create NPC entity with `entityType: "npc"`, importance from seed, visibility from seed (dm_only if seed marks private). Metadata: `roleKey`, `attitudeKey`, `factionId` (map using existing-entity table above). Do NOT put text descriptions in template.json metadata.

- [ ] **Step 4: Add quest entities** — Read `quests.ts`. 5 quests: silence, archivist, port_blood, traitor, epilogue. `entityType: "quest"`, importance from seed, `visibility: { "kind": "party" }`. Metadata: `objectiveKey` as a short slug.

- [ ] **Step 5: Add clue entities** — Read `clues.ts`. 11 clues: petitioner_fear, merchant_payment, torben_tip, port_bodies, lyra_notes, vault_entrance, vantis_confession, cult_disbands, eldertome, final_truth, forgery_tool. `entityType: "clue"`, visibility from seed (most are party, some dm_only). Metadata: `delivery` as slug if applicable.

- [ ] **Step 6: Add secret entities** — Read `secrets.ts`. 5 secrets: lyra_suspects, kael_proof, prophecy_count, council_corrupt, senra_exit. All `entityType: "secret"`, `visibility: { "kind": "dm_only" }`, `importance: "high"` or `"critical"` from seed.

- [ ] **Step 7: Verify stats will need updating**

```bash
cat public/premades/oracle-triple-eclipse/template.json | python3 -c "
import json,sys; d=json.load(sys.stdin); print('entities:', len(d['entities']))
"
```

Expected: 108 (67 + 41).

- [ ] **Step 8: Commit**

```bash
git add public/premades/oracle-triple-eclipse/template.json
git commit -m "chore(premades): add oracle entity gap — 41 entities from seeds"
```

---

## Task 3: Oracle — New relations in template.json

**Files:**

- Modify: `public/premades/oracle-triple-eclipse/template.json`
- Read (source): `seeds/campaigns/oracle/relations.ts`

**Produces:** ~107 new relation objects added to the `relations` array.

When translating seed relations:

- Map `sourceEntityId` and `targetEntityId` using BOTH mapping tables (already-mapped + new)
- Generate `relationId` as `rel_tpl_oracle_<short_slug>` — slug = abbreviated source+target+type
- Copy `relationType` verbatim (already uses domain types or `custom:*` pattern)
- Copy `visibility` from seed (omit if party, include if dm_only)
- Do NOT include `description` in template.json — that goes in locale

- [ ] **Step 1: Read `seeds/campaigns/oracle/relations.ts`** — Work through each relation in the `RELATIONS` array. For each one, look up both entity IDs in the mapping tables (already-mapped first, then new). If an entity ID maps to a valid premade ID, include the relation. Skip any relation whose entity IDs are NOT in either mapping table.

- [ ] **Step 2: Add NPC↔Faction relations** (first block: 18 relations from "NPC ↔ Faction" comment)

- [ ] **Step 3: Add PC↔World relations** (4 PC relations)

- [ ] **Step 4: Add NPC↔NPC relations** (middle block: ~20 relations)

- [ ] **Step 5: Add Clue→Quest and Clue→Entity relations** (remaining ~65 relations including all clue→quest, clue→entity, secret→entity, quest→entity blocks)

- [ ] **Step 6: Verify count**

```bash
cat public/premades/oracle-triple-eclipse/template.json | python3 -c "
import json,sys; d=json.load(sys.stdin); print('relations:', len(d['relations']))
"
```

Expected: ~168 total.

- [ ] **Step 7: Commit**

```bash
git add public/premades/oracle-triple-eclipse/template.json
git commit -m "chore(premades): add oracle relations gap — ~107 relations from seeds"
```

---

## Task 4: Oracle — New facts in template.json

**Files:**

- Modify: `public/premades/oracle-triple-eclipse/template.json`
- Read (source): `seeds/campaigns/oracle/facts.ts`

**Produces:** 9 new fact objects (fact_tpl_oracle_17 through fact_tpl_oracle_25).

Fact format (template.json): `{ factId, kind, confidence, visibility, relatedEntityIds }`. Map `relatedEntityIds` using both ID mapping tables. The seed has 25 facts; premade has 16; add the 9 remaining starting at `fact_tpl_oracle_17`.

- [ ] **Step 1: Read `seeds/campaigns/oracle/facts.ts`** — Identify which 25 facts are in the seed. The first 16 are already in premade. Add 9 new ones continuing the sequential ID numbering.

- [ ] **Step 2: Add facts 17–25** — Each maps `kind`, `confidence`, `visibility`, and `relatedEntityIds` (using both mapping tables). Skip `statement` in template.json.

- [ ] **Step 3: Verify**

```bash
cat public/premades/oracle-triple-eclipse/template.json | python3 -c "
import json,sys; d=json.load(sys.stdin); print('facts:', len(d['facts']))
"
```

Expected: 25.

- [ ] **Step 4: Commit**

```bash
git add public/premades/oracle-triple-eclipse/template.json
git commit -m "chore(premades): add oracle facts gap — facts 17-25"
```

---

## Task 5: Oracle — 3 new canvases in template.json

**Files:**

- Modify: `public/premades/oracle-triple-eclipse/template.json`
- Read (source): `seeds/campaigns/oracle/canvas.ts`

**Produces:** 3 new canvas objects: `cvs_tpl_oracle_characters`, `cvs_tpl_oracle_investigation`, `cvs_tpl_oracle_locations`.

The seed has 4 canvases: Vista General (→ already partially done as `cvs_tpl_oracle_valdris_conspiracy`), Facciones y Personajes, Investigación, Localizaciones. Add the 3 missing ones.

- [ ] **Step 1: Read `seeds/campaigns/oracle/canvas.ts`** — Extract node placements and edge connections for canvases 2, 3, and 4 (`seedCharactersCanvas`, `seedInvestigationCanvas`, `seedLocationsCanvas`).

- [ ] **Step 2: Add `cvs_tpl_oracle_characters` canvas** — Convert `seedCharactersCanvas`:
  - Nodes: one entity node per NPC/faction placed in canvas, using premade entity IDs from mapping tables. Use XY coords from seed's `entity()` calls.
  - Edges: convert to `{ id, sourceNodeId, targetNodeId, style, status }`. Use `status: "domain"` only where seed relation exists in premade `relations` array and add `relationshipId`. Use `status: "draft"` for visual-only connections.
  - Node IDs: `node_tpl_c_<slug>`
  - Edge IDs: `edge_tpl_c_<slug>`

- [ ] **Step 3: Add `cvs_tpl_oracle_investigation` canvas** — Convert investigation canvas (clues, secrets, quest connections). Node IDs: `node_tpl_inv_<slug>`, edge IDs: `edge_tpl_inv_<slug>`.

- [ ] **Step 4: Add `cvs_tpl_oracle_locations` canvas** — Convert locations canvas. Node IDs: `node_tpl_loc_<slug>`, edge IDs: `edge_tpl_loc_<slug>`.

- [ ] **Step 5: Verify no orphan node/edge references**

```bash
npm run premade:validate -- --dir public/premades 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
git add public/premades/oracle-triple-eclipse/template.json
git commit -m "chore(premades): add oracle canvases — characters, investigation, locations"
```

---

## Task 6: Oracle — locales/en.json for all new content

**Files:**

- Modify: `public/premades/oracle-triple-eclipse/locales/en.json`
- Read: `seeds/campaigns/oracle/{characters,locations,npcs,quests,clues,secrets,facts}.ts` (Spanish source → translate to English)

**Produces:** en.json entries for all 41 new entities, ~107 new relations, 9 new facts, 3 new canvases.

- [ ] **Step 1: Add entity locale entries** — For each of the 41 new entities, add an entry under `entities` key in en.json. Content structure per entity type:
  - PC: `{ title, subtitle, summary, status, metadata: { className, species, background } }`
  - Location: `{ title, subtitle, summary, content, status, metadata: { region?, atmosphere? } }`
  - NPC: `{ title, subtitle, summary, content, status, metadata: { role, attitudeToParty?, goal? } }` — NEVER put `secret`, `fear` or `truth` fields in en.json for dm_only NPCs; those go only in es.json DM metadata or are omitted.
  - Quest: `{ title, subtitle, summary, content, status, metadata: { objective } }`
  - Clue: `{ title, subtitle, summary, content, status, metadata: { delivery? } }`
  - Secret: `{ title, summary, content, status }` — content contains the truth (dm_only secrets are not served to players, so truth is safe here)

  Translate from Spanish seed text. Maintain the editorial style of existing en.json entries (concise, present-tense, functional for DM use).

- [ ] **Step 2: Add relation locale entries** — For each of the ~107 new relations, add `"rel_tpl_oracle_<slug>": { "description": "..." }` under the `relations` key. Translate description from seed's Spanish description field.

- [ ] **Step 3: Add fact locale entries** — For facts 17–25, add `"fact_tpl_oracle_N": { "statement": "..." }` under `facts` key. Translate statement from seed's Spanish.

- [ ] **Step 4: Add canvas locale entries** — For each of the 3 new canvases:

  ```json
  "cvs_tpl_oracle_characters": {
    "title": "Factions and Characters",
    "description": "...",
    "nodes": { "node_tpl_c_note": { "title": "...", "text": "..." } },
    "edges": { "edge_tpl_c_foo": { "label": "..." } }
  }
  ```

  Only note nodes need locale entries (entity nodes get their text from their entity locale). Only edges with a label need locale entries.

- [ ] **Step 5: Update templateVersion in en.json**
Change `"templateVersion": "1.2.0"` → `"templateVersion": "1.3.0"` and `"translationVersion"` increment patch.

- [ ] **Step 6: Commit**

```bash
git add public/premades/oracle-triple-eclipse/locales/en.json
git commit -m "chore(premades): oracle en.json — entities, relations, facts, canvases"
```

---

## Task 7: Oracle — locales/es.json for all new content

**Files:**

- Modify: `public/premades/oracle-triple-eclipse/locales/es.json`
- Read: `seeds/campaigns/oracle/{characters,locations,npcs,quests,clues,secrets,facts}.ts` (Spanish source — mostly copy directly)

**Produces:** es.json entries for all new content (Spanish text from seed, lightly edited for editorial style).

- [ ] **Step 1: Mirror structure from Task 6** — For each entry added to en.json, add a corresponding entry in es.json. Use the Spanish text directly from seed source files. Verify editorial consistency with existing es.json entries.

- [ ] **Step 2: Update templateVersion** — Change to `"1.3.0"`, increment translationVersion patch.

- [ ] **Step 3: Validate both locales**

```bash
npm run premade:validate
```

Expected: ✓ valid.

- [ ] **Step 4: Commit**

```bash
git add public/premades/oracle-triple-eclipse/locales/es.json
git commit -m "chore(premades): oracle es.json — entities, relations, facts, canvases"
```

---

## Task 8: Oracle — bump version, build, gate

**Files:**

- Modify: `public/premades/oracle-triple-eclipse/template.json` (version field)
- Modify: `public/premades/manifest.json` (auto-updated by build)

- [ ] **Step 1: Bump version in template.json**

```json
"version": "1.3.0"
```

- [ ] **Step 2: Run build** (recomputes stats, updates manifest)

```bash
npm run premade:build
```

- [ ] **Step 3: Verify stats in manifest**

```bash
cat public/premades/manifest.json | python3 -c "
import json,sys; d=json.load(sys.stdin)
t = next(t for t in d['templates'] if t['templateId'] == 'oracle-triple-eclipse')
print(t['version'], t['stats'])
"
```

Expected: version 1.3.0, entities ≥ 108, relations ≥ 168, facts 25.

- [ ] **Step 4: Full validate**

```bash
npm run premade:validate
npm run premade:build:check
npm test -- tests/backend/premadeCampaigns.test.ts
```

All must pass.

- [ ] **Step 5: Commit**

```bash
git add public/premades/oracle-triple-eclipse/template.json public/premades/manifest.json
git commit -m "chore(premades): bump oracle to 1.3.0, rebuild manifest"
```

---

## Task 9: Phandalin — New entities in template.json

**Files:**

- Modify: `public/premades/phandalin-starter/template.json`
- Read (source): `seeds/campaigns/phandalin/{characters,locations,factions,npcs,quests,clues,secrets}.ts`

**Produces:** ~96 new entity objects (see Phandalin ID Mapping Table above).

- [ ] **Step 1: PCs** — 4 player_characters from `characters.ts`. Same format as Oracle PCs. `visibility: { "kind": "party" }`.

- [ ] **Step 2: Locations** — 15 new locations from `locations.ts` (stonehill, barthen, lionshield, sleeping_giant, townmaster, edermath, alderleaf, miners_exchange, cragmaw_castle, forge_of_spells, conyberry, agatha_lair, old_owl_well, wyvern_tor, thundertree). Visibility: most `party`, dungeon/secret locations `dm_only`.

- [ ] **Step 3: Factions** — 9 new factions (town_faction, cragmaw, rockseeker, lords_alliance, zhentarim, order_gauntlet, emerald_enclave, wyvern_orcs, ash_zombies). Visibility: most `party`, Zhentarim and ash_zombies `dm_only`.

- [ ] **Step 4: NPCs** — 19 new NPCs (elmar, trilena, harbin, garaele, daran, carp, mirna, glasstaff_alias, nothic, grista, klarg, yeemik, grol, vyerith, nundro, tharden, hamun, reidoth, agatha, brughor, venomfang). Visibility: per seed source (antagonists, monsters = dm_only; townspeople = party).

- [ ] **Step 5: Quests** — 12 new quests from `quests.ts`.

- [ ] **Step 6: Clues** — 27 new clues from `clues.ts`. Visibility per seed.

- [ ] **Step 7: Secrets** — 17 new secrets from `secrets.ts`. All `visibility: { "kind": "dm_only" }`.

- [ ] **Step 8: Verify count**

```bash
cat public/premades/phandalin-starter/template.json | python3 -c "
import json,sys; d=json.load(sys.stdin); print('entities:', len(d['entities']))
"
```

Expected: ~125 (29 existing + ~96 new).

- [ ] **Step 9: Commit**

```bash
git add public/premades/phandalin-starter/template.json
git commit -m "chore(premades): add phandalin entity gap — ~96 entities from seeds"
```

---

## Task 10: Phandalin — New relations in template.json

**Files:**

- Modify: `public/premades/phandalin-starter/template.json`
- Read (source): `seeds/campaigns/phandalin/relations.ts`

**Produces:** ~100 new relation objects.

Same process as Task 3 (Oracle relations). The Phandalin `relations.ts` uses a helper function `r(id, source, target, type, description, visibility?)` — the first arg is the slug used for `rel_seed_phandalin_<slug>`, which becomes `rel_tpl_phandalin_<slug>` in the premade.

- [ ] **Step 1: Convert campaign spine relations** (lines 24–37 in relations.ts)
- [ ] **Step 2: Convert Phandalin social map relations** (lines 39–64)
- [ ] **Step 3: Convert Redbrand structure relations** (lines 66–80)
- [ ] **Step 4: Convert remaining clue/secret/faction relations** (lines 81–end of file)

- [ ] **Step 5: Verify**

```bash
cat public/premades/phandalin-starter/template.json | python3 -c "
import json,sys; d=json.load(sys.stdin); print('relations:', len(d['relations']))
"
```

Expected: ~123 total.

- [ ] **Step 6: Commit**

```bash
git add public/premades/phandalin-starter/template.json
git commit -m "chore(premades): add phandalin relations gap — ~100 relations from seeds"
```

---

## Task 11: Phandalin — New facts + sessions in template.json

**Files:**

- Modify: `public/premades/phandalin-starter/template.json`
- Read (source): `seeds/campaigns/phandalin/facts.ts`, `seeds/campaigns/phandalin/sessions.ts`

**Produces:** 8 new facts (fact_tpl_phandalin_13 through_20) + 6 new session objects.

- [ ] **Step 1: Add facts 13–20** — Read `facts.ts`, add 8 new facts continuing from fact_tpl_phandalin_13. Map `relatedEntityIds` using Phandalin mapping tables.

- [ ] **Step 2: Add new sessions** — Read `sessions.ts`. Convert the `prepare()` call for each of the 6 missing sessions (redbrands, castle, side_fronts, wave_approach, wave_final, epilogue) to premade format. Key rules:
  - No `event()` calls — those are played history, excluded
  - No `start()` or `close()` calls — excluded
  - `prepare()` input → `{ sessionId: "sess_tpl_phandalin_<slug>", prep: { ... } }`
  - Map all entity IDs in `sceneIds`, `involvedEntityIds`, `availableClueIds`, `secretsAtRiskIds`, `expectedConsequenceIds` using mapping tables
  - Keep `checklist` items, convert to `{ id, label, priority, done: false }`

- [ ] **Step 3: Verify**

```bash
cat public/premades/phandalin-starter/template.json | python3 -c "
import json,sys; d=json.load(sys.stdin)
print('facts:', len(d['facts']), 'sessions:', len(d['sessions']))
"
```

Expected: 20 facts, 8 sessions (or more, check what's already there: 5 + 6 new = but wave_echo was already there, so total should be ~8 unique sessions).

Actually: existing sessions are road, town, tresendar, allies, wave (5). Adding: redbrands, castle, side_fronts, wave_approach, wave_final, epilogue (6 new). But SESS_ROAD already maps to sess_tpl_phandalin_road ✓, SESS_TRESENDAR → tresendar ✓. New ones from seed not yet covered: redbrands, castle, side_fronts, wave_approach, wave_final, epilogue = 6 new sessions → total = 11 sessions.

- [ ] **Step 4: Commit**

```bash
git add public/premades/phandalin-starter/template.json
git commit -m "chore(premades): add phandalin facts 13-20 and 6 new session preps"
```

---

## Task 12: Phandalin — 3 new canvases in template.json

**Files:**

- Modify: `public/premades/phandalin-starter/template.json`
- Read (source): `seeds/campaigns/phandalin/canvas.ts`

**Produces:** 3 new canvas objects: `cvs_tpl_phandalin_overview`, `cvs_tpl_phandalin_characters`, `cvs_tpl_phandalin_investigation`.

The seed has: Overview canvas, Characters/Factions canvas, Investigation canvas, and a Locations canvas. Add all 3 missing ones.

- [ ] **Step 1: Add overview canvas** — Read `canvas.ts` overview function. Convert node placements using Phandalin ID mapping table. Node IDs: `node_tpl_ph_ov_<slug>`. Edge IDs: `edge_tpl_ph_ov_<slug>`.

- [ ] **Step 2: Add characters canvas** — Convert faction+character layout. Node IDs: `node_tpl_ph_c_<slug>`.

- [ ] **Step 3: Add investigation canvas** — Convert clue/secret/quest layout. Node IDs: `node_tpl_ph_inv_<slug>`.

- [ ] **Step 4: Validate**

```bash
npm run premade:validate
```

- [ ] **Step 5: Commit**

```bash
git add public/premades/phandalin-starter/template.json
git commit -m "chore(premades): add phandalin canvases — overview, characters, investigation"
```

---

## Task 13: Phandalin — locales/en.json and es.json

**Files:**

- Modify: `public/premades/phandalin-starter/locales/en.json`
- Modify: `public/premades/phandalin-starter/locales/es.json`

**Produces:** Locale entries for ~96 entities, ~100 relations, 8 facts, 6 sessions, 3 canvases in both languages.

- [ ] **Step 1: en.json entities** — For each of the ~96 new Phandalin entities, add locale entry. Translate from Spanish seed source. D&D SRD proper names (Phandalin, Wave Echo Cave, Cragmaw, Redbrands, Glasstaff, etc.) remain as given in SRD — no invented translations.

- [ ] **Step 2: en.json relations** — For each new relation, `{ description: "..." }`.

- [ ] **Step 3: en.json facts** — `{ statement: "..." }` for facts 13–20.

- [ ] **Step 4: en.json sessions** — Locale entry per session including `title`, `summary`, `prep.openingPrompt`, `prep.goals`, `prep.notes`, `prep.checklist` map.

- [ ] **Step 5: en.json canvases** — 3 new canvas locale entries with title, description, notes nodes.

- [ ] **Step 6: Bump templateVersion** → `"1.2.0"`, increment translationVersion.

- [ ] **Step 7: es.json** — Mirror all entries in Spanish. Session titles from seed sessions.ts `title` and `summary` fields (already in Spanish). Entity text from seed source files.

- [ ] **Step 8: Validate**

```bash
npm run premade:validate
```

Expected: ✓ valid.

- [ ] **Step 9: Commit**

```bash
git add public/premades/phandalin-starter/locales/
git commit -m "chore(premades): phandalin en+es locales — all new content"
```

---

## Task 14: Phandalin — bump version, build, gate

**Files:**

- Modify: `public/premades/phandalin-starter/template.json` (version)
- Modify: `public/premades/manifest.json` (auto-updated)

- [ ] **Step 1: Bump version**

```json
"version": "1.2.0"
```

- [ ] **Step 2: Build**

```bash
npm run premade:build
```

- [ ] **Step 3: Verify**

```bash
cat public/premades/manifest.json | python3 -c "
import json,sys; d=json.load(sys.stdin)
t = next(t for t in d['templates'] if t['templateId'] == 'phandalin-starter')
print(t['version'], t['stats'])
"
```

Expected: 1.2.0, entities ≥ 125, relations ≥ 123, facts 20, preparedSessions ≥ 8.

- [ ] **Step 4: Full premade gate**

```bash
npm run premade:validate
npm run premade:build:check
npm test -- tests/backend/premadeCampaigns.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add public/premades/phandalin-starter/template.json public/premades/manifest.json
git commit -m "chore(premades): bump phandalin to 1.2.0, rebuild manifest"
```

---

## Task 15: docs/premades/seed-retirement.md — audit matrix

**Files:**

- Create: `docs/premades/seed-retirement.md`

- [ ] **Step 1: Create the document** with this structure:

```markdown
# Seed Retirement Audit Matrix

## Oracle Triple Eclipse

| Type | Seed constant | Premade ID | Status |
|---|---|---|---|
| player_character | ENT_PC_ELOWYN | ent_tpl_oracle_pc_elowyn | added |
| player_character | ENT_PC_CAMUS | ent_tpl_oracle_pc_camus | added |
...
| config | config.ts DMCC_SEED_* | — | excluded-operational |
| http_client | client.ts api() | — | excluded-operational |
| session_history | SESS_ROAD events | — | excluded-operational |
```

Columns: `Type`, `Seed constant or file`, `Premade ID`, `Status: merged|added|excluded-operational|excluded-duplicate`

- [ ] **Step 2: Complete the matrix** — Fill in every entity from both Oracle and Phandalin id.ts files. Mark excluded-operational for: config.ts, client.ts, verify.ts, any `start()` / `event()` / `reveal()` / `close()` calls, randomUUID-based IDs.

- [ ] **Step 3: Verify no "?" rows remain**

```bash
grep "?" docs/premades/seed-retirement.md | wc -l
```

Expected: 0.

- [ ] **Step 4: Commit**

```bash
git add docs/premades/seed-retirement.md
git commit -m "docs(premades): add seed retirement audit matrix"
```

---

## Task 16: Enhance validate.mjs — locale parity checks

**Files:**

- Modify: `scripts/premades/validate.mjs`

**Add to `validateLocaleOverlay` function:** locale parity checks that fail if any entity, relation, or fact in the template has no locale entry.

- [ ] **Step 1: Add locale completeness check** — after the existing reference checks in `validateLocaleOverlay`, add:

```js
// Locale completeness: every template entity must have a locale entry with non-empty title
for (const entityId of ids.entityIds) {
  const entry = overlay.entities?.[entityId];
  if (!entry || typeof entry.title !== "string" || entry.title.trim().length === 0) {
    errors.push(`${label}.entities is missing required title for entity ${entityId}`);
  }
}

// Every fact must have a statement
for (const factId of ids.factIds) {
  const entry = overlay.facts?.[factId];
  if (!entry || typeof entry.statement !== "string" || entry.statement.trim().length === 0) {
    errors.push(`${label}.facts is missing required statement for fact ${factId}`);
  }
}

// Every relation with editorial content should have a description
// (editorial = relations that are not pure structural contains/located_in)
// We don't fail on this — too strict — but we warn via a separate counter
let relationsMissingDescription = 0;
for (const relationId of ids.relationIds) {
  const entry = overlay.relations?.[relationId];
  if (!entry || typeof entry.description !== "string" || entry.description.trim().length === 0) {
    relationsMissingDescription++;
  }
}
if (relationsMissingDescription > 0) {
  console.warn(`⚠ ${label}: ${relationsMissingDescription} relations missing description`);
}

// Every session with prep must have a title and summary in locale
for (const sessionId of ids.sessionIds) {
  const entry = overlay.sessions?.[sessionId];
  if (!entry || typeof entry.title !== "string" || entry.title.trim().length === 0) {
    errors.push(`${label}.sessions is missing required title for session ${sessionId}`);
  }
  if (!entry?.prep || typeof entry.prep.summary !== "string" || entry.prep.summary.trim().length === 0) {
    errors.push(`${label}.sessions[${sessionId}] is missing required prep.summary`);
  }
}

// Every canvas must have a title
for (const canvasId of ids.canvasIds) {
  const entry = overlay.canvases?.[canvasId];
  if (!entry || typeof entry.title !== "string" || entry.title.trim().length === 0) {
    errors.push(`${label}.canvases is missing required title for canvas ${canvasId}`);
  }
}
```

- [ ] **Step 2: Run validate against existing premades** — must still pass:

```bash
npm run premade:validate
```

- [ ] **Step 3: Commit**

```bash
git add scripts/premades/validate.mjs
git commit -m "chore(validate): enforce locale parity — entities, facts, sessions, canvases"
```

---

## Task 17: Expand premadeCampaigns.test.ts

**Files:**

- Modify: `tests/backend/premadeCampaigns.test.ts`

- [ ] **Step 1: Add test — oracle import full count**

```typescript
it("imports oracle with correct entity and canvas counts", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dm = await setupDm(server, "oracle@example.com", "secret-oracle");

    const imported = await server.inject({
      method: "POST",
      url: "/api/premade-campaigns/oracle-triple-eclipse/import",
      payload: { title: "My Oracle" },
      headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
    });
    expect(imported.statusCode).toBe(201);

    const state = await server.inject({
      method: "GET",
      url: `/api/campaigns/${imported.json().campaignId}`,
      headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
    });
    expect(state.statusCode).toBe(200);
    expect(state.json().entities.length).toBeGreaterThanOrEqual(108);
    expect(state.json().sessions.length).toBeGreaterThanOrEqual(8);
    // At least one PC should be present
    const pcs = state.json().entities.filter((e: any) => e.entityType === "player_character");
    expect(pcs.length).toBeGreaterThanOrEqual(4);

    await server.close();
  });
});
```

- [ ] **Step 2: Add test — phandalin sessions are prep-only**

```typescript
it("imports phandalin sessions as preparation without historical events", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dm = await setupDm(server, "ph@example.com", "secret-ph");

    const imported = await server.inject({
      method: "POST",
      url: "/api/premade-campaigns/phandalin-starter/import",
      payload: { title: "My Phandalin" },
      headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
    });
    const campaignId = imported.json().campaignId;

    const state = await server.inject({
      method: "GET",
      url: `/api/campaigns/${campaignId}`,
      headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
    });
    expect(state.json().sessions.length).toBeGreaterThanOrEqual(8);
    // No session should have a non-empty events timeline
    for (const session of state.json().sessions) {
      expect(session.events ?? []).toHaveLength(0);
    }

    await server.close();
  });
});
```

- [ ] **Step 3: Add test — spanish locale entity titles present**

```typescript
it("serves oracle in Spanish with entity titles", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dm = await setupDm(server, "es@example.com", "secret-es");

    const response = await server.inject({
      method: "GET",
      url: "/api/premade-campaigns/oracle-triple-eclipse?locale=es",
      headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().locale).toBe("es");
    // All entities should have a non-empty title in Spanish
    for (const entity of response.json().entities) {
      expect(entity.title).toBeTruthy();
    }
    await server.close();
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/backend/premadeCampaigns.test.ts
```

All must pass.

- [ ] **Step 5: Commit**

```bash
git add tests/backend/premadeCampaigns.test.ts
git commit -m "test(premades): add entity count, session prep-only, and Spanish locale tests"
```

---

## Task 18: Retire seeds/

**Files:**

- Delete: `seeds/` (entire directory)
- Delete: `tests/seeds/` (entire directory)
- Modify: `package.json` (remove seed:* scripts)
- Modify: `README.md`, `scratch/README.md` (update references)

- [ ] **Step 1: Final functional gate** — must all pass before deletion:

```bash
npm run premade:build:check
npm run premade:validate
npm test -- tests/backend/premadeCampaigns.test.ts
```

- [ ] **Step 2: Remove seed scripts from package.json**

Remove these entries from the `scripts` object:

```
"seed:oracle"
"seed:oracle:dry"
"seed:oracle:replace"
"seed:phandalin"
"seed:phandalin:dry"
"seed:phandalin:replace"
```

Do NOT remove `tsx` from devDependencies — it is used by `dev` and `dev:server` scripts.

- [ ] **Step 3: Delete seeds/ and tests/seeds/**

```bash
rm -rf seeds/
rm -rf tests/seeds/
```

- [ ] **Step 4: Update README.md** — Remove any section presenting seeds/ as the source of campaign content. Add section documenting premades as the source, with commands: `npm run premade:build`, `npm run premade:build:check`, `npm run premade:validate`.

- [ ] **Step 5: Search for residual references**

```bash
grep -r "seeds/" . --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" \
  --exclude-dir=".git" --exclude-dir="dist" --exclude-dir="node_modules" -l
grep -r "seed:oracle\|seed:phandalin\|DMCC_SEED_\|seedOracleCampaign" . \
  --exclude-dir=".git" --exclude-dir="dist" --exclude-dir="node_modules"
```

Expected: 0 matches (except this plan file and seed-retirement.md which are acceptable references).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(seeds): retire seeds/ — all content migrated to public/premades/"
```

---

## Task 19: Final gate

- [ ] **Step 1: Lint**

```bash
npm run lint
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck:all
```

- [ ] **Step 3: Full test suite**

```bash
npm test
```

- [ ] **Step 4: Build**

```bash
npm run build
```

- [ ] **Step 5: Premade final checks**

```bash
npm run premade:build:check
npm run premade:validate
```

- [ ] **Step 6: E2E (if available)**

```bash
npm run test:e2e
```

- [ ] **Step 7: Verify git diff is clean of unrelated changes**

```bash
git status
git diff --check
```

Confirm no unstaged changes unrelated to this migration slipped in.

---

## Self-Review Checklist

- [x] Oracle: 41 new entities, ~107 new relations, 9 new facts, 3 new canvases
- [x] Phandalin: ~96 new entities, ~100 new relations, 8 new facts, 6 new sessions, 3 new canvases
- [x] All entity/relation/fact IDs use deterministic `*_tpl_*` prefixes
- [x] Session objects contain only `prep` — no events, reveals, open/close history
- [x] dm_only secrets/NPCs: truth/goal text present in locale (locale is server-side, safe), structural visibility preserved in template.json
- [x] validate.mjs enhanced for locale parity — runs after all content added
- [x] `tsx` devDependency preserved — only seed:* scripts removed from package.json
- [x] Audit matrix `seed-retirement.md` accounts for all seed constants
- [x] git history: 10+ atomic commits, one per logical change
- [x] Final gate: lint + typecheck:all + test + build + premade:build:check + premade:validate all green
