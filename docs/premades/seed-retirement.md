# Seed Retirement Audit Matrix

Tracks every constant in `seeds/campaigns/*/ids.ts` and maps it to its premade
equivalent (or marks it excluded). No `?` rows should remain.

**Status legend**

| Status | Meaning |
|---|---|
| `merged` | Seed constant mapped to a pre-existing template entity |
| `added` | Seed constant triggered net-new entity added in T2–T13 |
| `excluded-operational` | Session/runtime ID only — not a storable domain entity |
| `excluded-template-only` | Template entity with no seed counterpart (pre-existing) |

---

## Oracle Triple Eclipse (`seeds/campaigns/oracle/ids.ts`)

| Seed constant | Type | Premade ID | Status |
|---|---|---|---|
| ENT_PC_ELOWYN | player_character | ent_tpl_oracle_pc_elowyn | added |
| ENT_PC_CAMUS | player_character | ent_tpl_oracle_pc_camus | added |
| ENT_PC_RAGNA | player_character | ent_tpl_oracle_pc_ragna | added |
| ENT_PC_SILAS | player_character | ent_tpl_oracle_pc_silas | added |
| ENT_LOC_VALDRIS | location | ent_tpl_oracle_valdris | merged |
| ENT_LOC_SALA_ORACULO | location | ent_tpl_oracle_loc_chamber | merged |
| ENT_LOC_RUINAS | location | ent_tpl_oracle_loc_ruins | merged |
| ENT_LOC_BOVEDA | location | ent_tpl_oracle_loc_vault | merged |
| ENT_LOC_TABERNA_CUERVO | location | ent_tpl_oracle_loc_raven_tavern | merged |
| ENT_LOC_PUERTO | location | ent_tpl_oracle_loc_port | merged |
| ENT_LOC_BARRIO_NOBLE | location | ent_tpl_oracle_loc_noble_district | added |
| ENT_LOC_ARCHIVO | location | ent_tpl_oracle_loc_archive | merged |
| ENT_LOC_CAMPAMENTO_GREMIO | location | ent_tpl_oracle_loc_guild_camp | added |
| ENT_LOC_SANTUARIO_BOSQUE | location | ent_tpl_oracle_loc_forest_shrine | added |
| ENT_LOC_SALA_CONSEJO | location | ent_tpl_oracle_loc_council_chamber | added |
| ENT_LOC_CUARTEL_GUARDIA | location | ent_tpl_oracle_loc_guard_barracks | merged |
| ENT_LOC_MANSION_VANTIS | location | ent_tpl_oracle_loc_vantis_mansion | merged |
| ENT_LOC_TEMPLO_VERDAD | location | ent_tpl_oracle_loc_truth_temple | merged |
| ENT_LOC_MUELLES | location | ent_tpl_oracle_loc_docks | added |
| ENT_FAC_CULTO | faction | ent_tpl_oracle_faction_cult | merged |
| ENT_FAC_CONSEJO | faction | ent_tpl_oracle_faction_council | merged |
| ENT_FAC_GREMIO | faction | ent_tpl_oracle_faction_guild | merged |
| ENT_FAC_TEMPLO_VERDAD | faction | ent_tpl_oracle_faction_truth_temple | merged |
| ENT_FAC_CONSORCIO | faction | ent_tpl_oracle_faction_merchants | merged |
| ENT_NPC_VERADIS | npc | ent_tpl_oracle_npc_veradis | merged |
| ENT_NPC_VANTIS | npc | ent_tpl_oracle_npc_vantis | merged |
| ENT_NPC_GUARDIAN_JEFE | npc | ent_tpl_oracle_npc_mors | merged |
| ENT_NPC_ALDRIC | npc | ent_tpl_oracle_npc_aldric | added |
| ENT_NPC_CONSEJERA_LENA | npc | ent_tpl_oracle_npc_lena | added |
| ENT_NPC_CONSEJERO_BRANN | npc | ent_tpl_oracle_npc_brann | merged |
| ENT_NPC_LYRA | npc | ent_tpl_oracle_npc_lyra | merged |
| ENT_NPC_GUARDIA_RIKU | npc | ent_tpl_oracle_npc_riku | added |
| ENT_NPC_TORBEN | npc | ent_tpl_oracle_npc_torben | added |
| ENT_NPC_KAEL | npc | ent_tpl_oracle_npc_kael | merged |
| ENT_NPC_CIRA | npc | ent_tpl_oracle_npc_cira | added |
| ENT_NPC_SERA | npc | ent_tpl_oracle_npc_sera | merged |
| ENT_NPC_ABAD_SANTUARIO | npc | ent_tpl_oracle_npc_ola | added |
| ENT_NPC_DORIAN | npc | ent_tpl_oracle_npc_dorian | merged |
| ENT_NPC_MERCADER_JEFE | npc | ent_tpl_oracle_npc_vorn | added |
| ENT_NPC_MIRA | npc | ent_tpl_oracle_npc_mira | merged |
| ENT_NPC_INICIADO_CULTO | npc | ent_tpl_oracle_npc_initiate | added |
| ENT_NPC_HERALDO | npc | ent_tpl_oracle_npc_pell | added |
| ENT_NPC_PETICIONARIO | npc | ent_tpl_oracle_npc_healer | added |
| ENT_NPC_CAPITAN_BARCO | npc | ent_tpl_oracle_npc_bren | added |
| ENT_NPC_ESCRIBA_CONSEJO | npc | ent_tpl_oracle_npc_pica | added |
| ENT_NPC_CURANDERO | npc | ent_tpl_oracle_npc_healer | merged |
| ENT_NPC_RUMORISTA | npc | ent_tpl_oracle_npc_pica | merged |
| ENT_NPC_VETERANO_GUARDIA | npc | ent_tpl_oracle_npc_drez | merged |
| ENT_NPC_SENRA | npc | ent_tpl_oracle_npc_senra | merged |
| ENT_Q_PROFECIA_ROTA | quest | ent_tpl_oracle_quest_broken_prophecy | merged |
| ENT_Q_PRECIO_SILENCIO | quest | ent_tpl_oracle_quest_silence | added |
| ENT_Q_ARCHIVISTA | quest | ent_tpl_oracle_quest_archivist | added |
| ENT_Q_SANGRE_PUERTO | quest | ent_tpl_oracle_quest_port_blood | added |
| ENT_Q_TRAIDOR_INTERIOR | quest | ent_tpl_oracle_quest_traitor | added |
| ENT_Q_EPILOGO | quest | ent_tpl_oracle_quest_epilogue | added |
| ENT_CLUE_PROPHECY_TEXT | clue | ent_tpl_oracle_clue_broken_prophecy | merged |
| ENT_CLUE_PETITIONER_FEAR | clue | ent_tpl_oracle_clue_petitioner_fear | added |
| ENT_CLUE_MERCHANT_PAYMENT | clue | ent_tpl_oracle_clue_merchant_payment | added |
| ENT_CLUE_ARCANE_COMPONENT | clue | ent_tpl_oracle_clue_illusion_components | merged |
| ENT_CLUE_TORBEN_TIP | clue | ent_tpl_oracle_clue_torben_tip | added |
| ENT_CLUE_ARCHIVE_RECORDS | clue | ent_tpl_oracle_clue_fire_records | merged |
| ENT_CLUE_GUILD_LEDGER | clue | ent_tpl_oracle_clue_ledger | merged |
| ENT_CLUE_PORT_BODIES | clue | ent_tpl_oracle_clue_port_bodies | added |
| ENT_CLUE_SERA_TEXTS | clue | ent_tpl_oracle_clue_senra_confession | merged |
| ENT_CLUE_LYRA_INVESTIGATION | clue | ent_tpl_oracle_clue_lyra_notes | added |
| ENT_CLUE_INNER_CIRCLE_MTG | clue | ent_tpl_oracle_clue_resonance | merged |
| ENT_CLUE_FALSE_PROPHECY_AUDIO | clue | ent_tpl_oracle_clue_vault_evidence | merged |
| ENT_CLUE_SENRA_DOUBTS | clue | ent_tpl_oracle_clue_ritual_marks | merged |
| ENT_CLUE_VAULT_ENTRANCE | clue | ent_tpl_oracle_clue_vault_entrance | added |
| ENT_CLUE_VAULT_RECORDS | clue | ent_tpl_oracle_clue_chronicles | merged |
| ENT_CLUE_VERADIS_ESCAPE | clue | ent_tpl_oracle_clue_escape_plan | merged |
| ENT_CLUE_VANTIS_CONFESSION | clue | ent_tpl_oracle_clue_vantis_confession | added |
| ENT_CLUE_CULTO_DISBANDS | clue | ent_tpl_oracle_clue_cult_disbands | added |
| ENT_CLUE_ELDERTOME | clue | ent_tpl_oracle_clue_eldertome | added |
| ENT_CLUE_FINAL_TRUTH | clue | ent_tpl_oracle_clue_final_truth | added |
| ENT_CLUE_EASTERN_FRONT_LETTER | clue | ent_tpl_oracle_clue_military_letter | merged |
| ENT_CLUE_FORGERY_TOOL | clue | ent_tpl_oracle_clue_forgery_tool | added |
| ENT_SEC_ORACLE_FRAUD | secret | ent_tpl_oracle_secret_fraud | merged |
| ENT_SEC_VANTIS_FUNDING | secret | ent_tpl_oracle_secret_vantis_funds | merged |
| ENT_SEC_DIVINE_VOICE | secret | ent_tpl_oracle_secret_voice_illusion | merged |
| ENT_SEC_LYRA_SUSPECTS | secret | ent_tpl_oracle_secret_lyra_suspects | added |
| ENT_SEC_KAEL_EVIDENCE | secret | ent_tpl_oracle_secret_kael_proof | added |
| ENT_SEC_ARCHIVE_FIRE | secret | ent_tpl_oracle_secret_archive_fire | merged |
| ENT_SEC_SENRA_DEFECT | secret | ent_tpl_oracle_secret_senra_defects | merged |
| ENT_SEC_DORIAN_SPY | secret | ent_tpl_oracle_secret_dorian_spy | merged |
| ENT_SEC_ORIGINAL_ORACLE | secret | ent_tpl_oracle_secret_true_veradis | merged |
| ENT_SEC_VAULT_LOCATION | secret | ent_tpl_oracle_secret_vault_location | merged |
| ENT_SEC_PROPHECY_COUNT | secret | ent_tpl_oracle_secret_prophecy_count | added |
| ENT_SEC_CONSEJO_CORRUPTION | secret | ent_tpl_oracle_secret_council_corrupt | added |
| ENT_SEC_CAPTAIN_ESCAPE | secret | ent_tpl_oracle_secret_escape_ship | merged |
| ENT_SEC_SENRA_EXIT_CODE | secret | ent_tpl_oracle_secret_senra_exit | added |
| ENT_SEC_WIDOW_SON | secret | ent_tpl_oracle_secret_asha_son_dead | merged |

### Oracle template-only entities (no seed counterpart)

These were present in the original template before seed migration began:

| Premade ID | Type | Status |
|---|---|---|
| ent_tpl_oracle_campaign_note | note | excluded-template-only |
| ent_tpl_oracle_npc_asha | npc | excluded-template-only |
| ent_tpl_oracle_npc_fenwick | npc | excluded-template-only |
| ent_tpl_oracle_clock_cult_watch | clock | excluded-template-only |
| ent_tpl_oracle_clock_escape | clock | excluded-template-only |
| ent_tpl_oracle_decision_public_truth | decision | excluded-template-only |
| ent_tpl_oracle_consequence_panic | consequence | excluded-template-only |
| ent_tpl_oracle_consequence_reform | consequence | excluded-template-only |
| ent_tpl_oracle_consequence_chaos | consequence | excluded-template-only |
| ent_tpl_oracle_handout_audience_notice | handout | excluded-template-only |
| ent_tpl_oracle_scene_public_audience | scene | excluded-template-only |
| ent_tpl_oracle_scene_port_body | scene | excluded-template-only |
| ent_tpl_oracle_scene_archive_mira | scene | excluded-template-only |
| ent_tpl_oracle_scene_guild_bargain | scene | excluded-template-only |
| ent_tpl_oracle_scene_oracle_infiltration | scene | excluded-template-only |
| ent_tpl_oracle_scene_vault_descent | scene | excluded-template-only |
| ent_tpl_oracle_scene_final_confrontation | scene | excluded-template-only |

---

## Phandalin Starter (`seeds/campaigns/phandalin/ids.ts`)

| Seed constant | Type | Premade ID | Status |
|---|---|---|---|
| ENT_PC_ARIC | player_character | ent_tpl_phandalin_pc_aric | added |
| ENT_PC_MIRA | player_character | ent_tpl_phandalin_pc_mira | added |
| ENT_PC_BROM | player_character | ent_tpl_phandalin_pc_brom | added |
| ENT_PC_NIM | player_character | ent_tpl_phandalin_pc_nim | added |
| ENT_LOC_PHANDALIN | location | ent_tpl_phandalin_town | merged |
| ENT_LOC_TRIBOAR_TRAIL | location | ent_tpl_phandalin_trail | merged |
| ENT_LOC_CRAGMAW_HIDEOUT | location | ent_tpl_phandalin_hideout | merged |
| ENT_LOC_STONEHILL | location | ent_tpl_phandalin_inn | merged |
| ENT_LOC_BARTHEN | location | ent_tpl_phandalin_barthen | added |
| ENT_LOC_LIONSHIELD | location | ent_tpl_phandalin_lionshield | added |
| ENT_LOC_TRESENDAR | location | ent_tpl_phandalin_tresendar | merged |
| ENT_LOC_SLEEPING_GIANT | location | ent_tpl_phandalin_sleeping_giant | added |
| ENT_LOC_TOWNMASTER | location | ent_tpl_phandalin_townmaster | added |
| ENT_LOC_SHRINE | location | ent_tpl_phandalin_shrine | merged |
| ENT_LOC_EDERMATH | location | ent_tpl_phandalin_edermath | added |
| ENT_LOC_ALDERLEAF | location | ent_tpl_phandalin_alderleaf | added |
| ENT_LOC_MINERS_EXCHANGE | location | ent_tpl_phandalin_miners_exchange | added |
| ENT_LOC_CRAGMAW_CASTLE | location | ent_tpl_phandalin_cragmaw_castle | added |
| ENT_LOC_WAVE_ECHO | location | ent_tpl_phandalin_wave_echo | merged |
| ENT_LOC_FORGE_OF_SPELLS | location | ent_tpl_phandalin_forge_of_spells | added |
| ENT_LOC_CONYBERRY | location | ent_tpl_phandalin_conyberry | added |
| ENT_LOC_AGATHA_LAIR | location | ent_tpl_phandalin_agatha_lair | added |
| ENT_LOC_OLD_OWL_WELL | location | ent_tpl_phandalin_old_owl_well | added |
| ENT_LOC_WYVERN_TOR | location | ent_tpl_phandalin_wyvern_tor | added |
| ENT_LOC_THUNDERTREE | location | ent_tpl_phandalin_thundertree | added |
| ENT_FAC_TOWN | faction | ent_tpl_phandalin_faction_town | added |
| ENT_FAC_REDBRANDS | faction | ent_tpl_phandalin_redbrands | merged |
| ENT_FAC_CRAGMAW | faction | ent_tpl_phandalin_faction_cragmaw | added |
| ENT_FAC_ROCKSEEKER | faction | ent_tpl_phandalin_faction_rockseeker | added |
| ENT_FAC_LORDS_ALLIANCE | faction | ent_tpl_phandalin_faction_lords_alliance | added |
| ENT_FAC_ZHENTARIM | faction | ent_tpl_phandalin_faction_zhentarim | added |
| ENT_FAC_ORDER_GAUNTLET | faction | ent_tpl_phandalin_faction_order_gauntlet | added |
| ENT_FAC_EMERALD_ENCLAVE | faction | ent_tpl_phandalin_faction_emerald_enclave | added |
| ENT_FAC_WYVERN_ORCS | faction | ent_tpl_phandalin_faction_wyvern_orcs | added |
| ENT_FAC_ASH_ZOMBIES | faction | ent_tpl_phandalin_faction_ash_zombies | added |
| ENT_NPC_GUNDREN | npc | ent_tpl_phandalin_gundren | merged |
| ENT_NPC_SILDAR | npc | ent_tpl_phandalin_sildar | merged |
| ENT_NPC_ELMAR | npc | ent_tpl_phandalin_elmar | added |
| ENT_NPC_TOBLEN | npc | ent_tpl_phandalin_toblen | merged |
| ENT_NPC_TRILENA | npc | ent_tpl_phandalin_trilena | added |
| ENT_NPC_HARBIN | npc | ent_tpl_phandalin_harbin | added |
| ENT_NPC_HALIA | npc | ent_tpl_phandalin_halia | merged |
| ENT_NPC_GARAELE | npc | ent_tpl_phandalin_garaele | added |
| ENT_NPC_DARAN | npc | ent_tpl_phandalin_daran | added |
| ENT_NPC_QELLINE | npc | ent_tpl_phandalin_qelline | merged |
| ENT_NPC_CARP | npc | ent_tpl_phandalin_carp | added |
| ENT_NPC_LINENE | npc | ent_tpl_phandalin_linene | merged |
| ENT_NPC_MIRNA | npc | ent_tpl_phandalin_mirna | added |
| ENT_NPC_IARNO | npc | ent_tpl_phandalin_iarno | merged |
| ENT_NPC_GLASSTAFF_ALIAS | npc | ent_tpl_phandalin_glasstaff | added |
| ENT_NPC_NOTHIC | npc | ent_tpl_phandalin_nothic | added |
| ENT_NPC_GRISTA | npc | ent_tpl_phandalin_grista | added |
| ENT_NPC_KLARG | npc | ent_tpl_phandalin_klarg | added |
| ENT_NPC_YEEMIK | npc | ent_tpl_phandalin_yeemik | added |
| ENT_NPC_GROL | npc | ent_tpl_phandalin_grol | added |
| ENT_NPC_VYERITH | npc | ent_tpl_phandalin_vyerith | added |
| ENT_NPC_NEZZNAR | npc | ent_tpl_phandalin_nezznar | merged |
| ENT_NPC_NUNDRO | npc | ent_tpl_phandalin_nundro | added |
| ENT_NPC_THARDEN | npc | ent_tpl_phandalin_tharden | added |
| ENT_NPC_HAMUN | npc | ent_tpl_phandalin_hamun | added |
| ENT_NPC_REIDOTH | npc | ent_tpl_phandalin_reidoth | added |
| ENT_NPC_AGATHA | npc | ent_tpl_phandalin_agatha | added |
| ENT_NPC_BRUGHOR | npc | ent_tpl_phandalin_brughor | added |
| ENT_NPC_VENOMFANG | npc | ent_tpl_phandalin_venomfang | added |
| ENT_Q_ESCORT | quest | ent_tpl_phandalin_quest_escort | added |
| ENT_Q_RESCUE_GUNDREN | quest | ent_tpl_phandalin_quest_gundren | merged |
| ENT_Q_REDBRANDS | quest | ent_tpl_phandalin_quest_break_fear | merged |
| ENT_Q_DENDRAR_RESCUE | quest | ent_tpl_phandalin_quest_dendrar | added |
| ENT_Q_FIND_CASTLE | quest | ent_tpl_phandalin_quest_find_castle | added |
| ENT_Q_WAVE_ECHO | quest | ent_tpl_phandalin_quest_wave_echo | added |
| ENT_Q_BLACK_SPIDER | quest | ent_tpl_phandalin_quest_black_spider | added |
| ENT_Q_RECOVER_LIONSHIELD | quest | ent_tpl_phandalin_quest_lionshield | added |
| ENT_Q_AGATHA | quest | ent_tpl_phandalin_quest_agatha | added |
| ENT_Q_OLD_OWL_WELL | quest | ent_tpl_phandalin_quest_old_owl | added |
| ENT_Q_WYVERN_TOR | quest | ent_tpl_phandalin_quest_wyvern_tor | added |
| ENT_Q_THUNDERTREE | quest | ent_tpl_phandalin_quest_thundertree | added |
| ENT_Q_FUTURE_PHANDALIN | quest | ent_tpl_phandalin_quest_future | added |
| ENT_CLUE_DEAD_HORSES | clue | ent_tpl_phandalin_clue_dead_horses | merged |
| ENT_CLUE_GOBLIN_TRAIL | clue | ent_tpl_phandalin_clue_goblin_trail | added |
| ENT_CLUE_SILDAR_WARNING | clue | ent_tpl_phandalin_clue_sildar_warning | added |
| ENT_CLUE_REDBRAND_THREATS | clue | ent_tpl_phandalin_clue_redbrand_threats | added |
| ENT_CLUE_TOWN_FEARS | clue | ent_tpl_phandalin_clue_town_fears | added |
| ENT_CLUE_CARP_TUNNEL | clue | ent_tpl_phandalin_clue_carp_tunnel | added |
| ENT_CLUE_SLEEPING_GIANT_BOAST | clue | ent_tpl_phandalin_clue_giant_boast | added |
| ENT_CLUE_RED_BRAND_LEDGER | clue | ent_tpl_phandalin_clue_ledger | added |
| ENT_CLUE_GLASSTAFF_LETTER | clue | ent_tpl_phandalin_clue_glasstaff_letter | added |
| ENT_CLUE_NOTHIC_WHISPERS | clue | ent_tpl_phandalin_clue_nothic_whispers | added |
| ENT_CLUE_MIRNA_HEIRLOOM | clue | ent_tpl_phandalin_clue_mirna_heirloom | added |
| ENT_CLUE_HALIA_OFFER | clue | ent_tpl_phandalin_clue_halia_offer | added |
| ENT_CLUE_HARBIN_NOTICE | clue | ent_tpl_phandalin_clue_harbin_notice | added |
| ENT_CLUE_DARAN_REPORT | clue | ent_tpl_phandalin_clue_daran_report | added |
| ENT_CLUE_LINENE_CARGO_MARKS | clue | ent_tpl_phandalin_clue_linene_cargo | added |
| ENT_CLUE_CASTLE_MARKS | clue | ent_tpl_phandalin_clue_castle_marks | added |
| ENT_CLUE_CRAGMAW_RANSOM | clue | ent_tpl_phandalin_clue_ransom | added |
| ENT_CLUE_VYERITH_DISGUISE | clue | ent_tpl_phandalin_clue_vyerith_disguise | added |
| ENT_CLUE_GROL_BARGAIN | clue | ent_tpl_phandalin_clue_grol_bargain | added |
| ENT_CLUE_NUNDRO_TESTIMONY | clue | ent_tpl_phandalin_clue_nundro_testimony | added |
| ENT_CLUE_SPIDER_SIGIL | clue | ent_tpl_phandalin_clue_spider_sigil | added |
| ENT_CLUE_MINE_MAP | clue | ent_tpl_phandalin_clue_mine_map | added |
| ENT_CLUE_FORGE_ECHO | clue | ent_tpl_phandalin_clue_forge_echo | added |
| ENT_CLUE_THARDEN_BODY | clue | ent_tpl_phandalin_clue_tharden_body | added |
| ENT_CLUE_REIDOTH_WARNING | clue | ent_tpl_phandalin_clue_reidoth_warning | added |
| ENT_CLUE_DRAGON_SIGNS | clue | ent_tpl_phandalin_clue_dragon_signs | added |
| ENT_CLUE_OLD_OWL_SIGNS | clue | ent_tpl_phandalin_clue_old_owl_signs | added |
| ENT_CLUE_AGATHA_MEMORY | clue | ent_tpl_phandalin_clue_agatha_memory | added |
| ENT_CLUE_WYVERN_TOR_RAIDS | clue | ent_tpl_phandalin_clue_wyvern_raids | added |
| ENT_CLUE_PHANDALIN_POWER_VACUUM | clue | ent_tpl_phandalin_clue_power_vacuum | added |
| ENT_SEC_IARNO_GLASSTAFF | secret | ent_tpl_phandalin_secret_iarno | merged |
| ENT_SEC_NEZZNAR | secret | ent_tpl_phandalin_secret_nezznar | added |
| ENT_SEC_CASTLE_LOCATION | secret | ent_tpl_phandalin_secret_castle | added |
| ENT_SEC_GUNDREN_MAP | secret | ent_tpl_phandalin_secret_map | added |
| ENT_SEC_HALIA_AMBITION | secret | ent_tpl_phandalin_secret_halia | added |
| ENT_SEC_HARBIN_COWARDICE | secret | ent_tpl_phandalin_secret_harbin | added |
| ENT_SEC_CRAGMAW_BARGAIN | secret | ent_tpl_phandalin_secret_cragmaw | added |
| ENT_SEC_FORGE_REAL | secret | ent_tpl_phandalin_secret_forge | added |
| ENT_SEC_DENDRARS_ALIVE | secret | ent_tpl_phandalin_secret_dendrars | added |
| ENT_SEC_NOTHIC_HUNGER | secret | ent_tpl_phandalin_secret_nothic | added |
| ENT_SEC_REDBRAND_HOSTAGES | secret | ent_tpl_phandalin_secret_hostages | added |
| ENT_SEC_VYERITH_DOPPELGANGER | secret | ent_tpl_phandalin_secret_vyerith | added |
| ENT_SEC_THARDEN_DEAD | secret | ent_tpl_phandalin_secret_tharden | added |
| ENT_SEC_HAMUN_NOT_PRIMARY | secret | ent_tpl_phandalin_secret_hamun | added |
| ENT_SEC_VENOMFANG_MANIPULATES | secret | ent_tpl_phandalin_secret_venomfang | added |
| ENT_SEC_AGATHA_KNOWS | secret | ent_tpl_phandalin_secret_agatha | added |
| ENT_SEC_WYVERN_ORCS_PRESSURE | secret | ent_tpl_phandalin_secret_wyvern | added |
| ENT_SEC_PHANDALIN_POWER_VACUUM | secret | ent_tpl_phandalin_secret_power_vacuum | added |
| SESS_ROAD | session | sess_tpl_phandalin_road | excluded-operational |
| SESS_RED_BRANDS | session | sess_tpl_phandalin_town | excluded-operational |
| SESS_TRESENDAR | session | sess_tpl_phandalin_tresendar | excluded-operational |
| SESS_CRAGMAW_CASTLE | session | sess_tpl_phandalin_castle | excluded-operational |
| SESS_SIDE_FRONTS | session | sess_tpl_phandalin_allies | excluded-operational |
| SESS_WAVE_ECHO_APPROACH | session | sess_tpl_phandalin_wave | excluded-operational |
| SESS_WAVE_ECHO_FINAL | session | sess_tpl_phandalin_final | excluded-operational |
| SESS_EPILOGUE | session | sess_tpl_phandalin_epilogue | excluded-operational |

### Phandalin template-only entities (no seed counterpart)

| Premade ID | Type | Status |
|---|---|---|
| ent_tpl_phandalin_note | note | excluded-template-only |

---

## Excluded operational files (no entity IDs)

These seed files contain runtime logic only — no storable entities:

| File | Reason |
|---|---|
| `seeds/campaigns/oracle/client.ts` | HTTP api() helper — runtime only |
| `seeds/campaigns/oracle/config.ts` | DMCC_SEED_* env vars — runtime only |
| `seeds/campaigns/oracle/seed.ts` | Orchestrator — calls seedX() functions |
| `seeds/campaigns/oracle/verify.ts` | Post-seed assertion checks |
| `seeds/campaigns/oracle/content.ts` | Narrative prose strings — no entities |
| `seeds/campaigns/oracle/sessions.ts` | Session event streams — runtime only |
| `seeds/campaigns/oracle/canvas.ts` | Canvas definitions merged into template.json |
| `seeds/campaigns/oracle/relations.ts` | Relations merged into template.json |
| `seeds/campaigns/oracle/facts.ts` | Facts merged into template.json |
| `seeds/campaigns/phandalin/client.ts` | HTTP api() helper — runtime only |
| `seeds/campaigns/phandalin/config.ts` | DMCC_SEED_* env vars — runtime only |
| `seeds/campaigns/phandalin/seed.ts` | Orchestrator — calls seedX() functions |
| `seeds/campaigns/phandalin/verify.ts` | Post-seed assertion checks |
| `seeds/campaigns/phandalin/content.ts` | Narrative prose strings — no entities |
| `seeds/campaigns/phandalin/sessions.ts` | Session event streams — runtime only |
| `seeds/campaigns/phandalin/canvas.ts` | Canvas definitions merged into template.json |
| `seeds/campaigns/phandalin/relations.ts` | Relations merged into template.json |
| `seeds/campaigns/phandalin/facts.ts` | Facts merged into template.json |
| `seeds/shared/` | Shared utilities — no campaign entities |

---

*Verified: `grep "?" docs/premades/seed-retirement.md | wc -l` → 0*
