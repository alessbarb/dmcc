// ---------------------------------------------------------------------------
// ID generation — all IDs are prefix_<uuid>, generated once per seed run
// ---------------------------------------------------------------------------

function uid(prefix: string): string {
  return `${prefix}_${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
}

// Campaign ID is stable by default so reruns can detect an existing seed.

// Pre-made player characters (options for players to choose — not linked to any player)
export const ENT_PC_ELOWYN  = uid("ent");
export const ENT_PC_CAMUS   = uid("ent");
export const ENT_PC_RAGNA   = uid("ent");
export const ENT_PC_SILAS   = uid("ent");

// Locations
export const ENT_LOC_VALDRIS          = uid("ent");
export const ENT_LOC_SALA_ORACULO     = uid("ent");
export const ENT_LOC_RUINAS           = uid("ent");
export const ENT_LOC_BOVEDA           = uid("ent");
export const ENT_LOC_TABERNA_CUERVO   = uid("ent");
export const ENT_LOC_PUERTO           = uid("ent");
export const ENT_LOC_BARRIO_NOBLE     = uid("ent");
export const ENT_LOC_ARCHIVO          = uid("ent");
export const ENT_LOC_CAMPAMENTO_GREMIO= uid("ent");
export const ENT_LOC_SANTUARIO_BOSQUE = uid("ent");
export const ENT_LOC_SALA_CONSEJO     = uid("ent");
export const ENT_LOC_CUARTEL_GUARDIA  = uid("ent");
export const ENT_LOC_MANSION_VANTIS   = uid("ent");
export const ENT_LOC_TEMPLO_VERDAD    = uid("ent");
export const ENT_LOC_MUELLES          = uid("ent");

// Factions
export const ENT_FAC_CULTO         = uid("ent");
export const ENT_FAC_CONSEJO       = uid("ent");
export const ENT_FAC_GREMIO        = uid("ent");
export const ENT_FAC_TEMPLO_VERDAD = uid("ent");
export const ENT_FAC_CONSORCIO     = uid("ent");

// NPCs
export const ENT_NPC_VERADIS          = uid("ent");
export const ENT_NPC_VANTIS           = uid("ent");
export const ENT_NPC_GUARDIAN_JEFE    = uid("ent");
export const ENT_NPC_ALDRIC           = uid("ent");
export const ENT_NPC_CONSEJERA_LENA   = uid("ent");
export const ENT_NPC_CONSEJERO_BRANN  = uid("ent");
export const ENT_NPC_LYRA             = uid("ent");
export const ENT_NPC_GUARDIA_RIKU     = uid("ent");
export const ENT_NPC_TORBEN           = uid("ent");
export const ENT_NPC_KAEL             = uid("ent");
export const ENT_NPC_CIRA             = uid("ent");
export const ENT_NPC_SERA             = uid("ent");
export const ENT_NPC_ABAD_SANTUARIO   = uid("ent");
export const ENT_NPC_DORIAN           = uid("ent");
export const ENT_NPC_MERCADER_JEFE    = uid("ent");
export const ENT_NPC_MIRA             = uid("ent");
export const ENT_NPC_INICIADO_CULTO   = uid("ent");
export const ENT_NPC_HERALDO          = uid("ent");
export const ENT_NPC_PETICIONARIO     = uid("ent");
export const ENT_NPC_CAPITAN_BARCO    = uid("ent");
export const ENT_NPC_ESCRIBA_CONSEJO  = uid("ent");
export const ENT_NPC_CURANDERO        = uid("ent");
export const ENT_NPC_RUMORISTA        = uid("ent");
export const ENT_NPC_VETERANO_GUARDIA = uid("ent");
export const ENT_NPC_SENRA            = uid("ent");

// Quests
export const ENT_Q_PROFECIA_ROTA    = uid("ent");
export const ENT_Q_PRECIO_SILENCIO  = uid("ent");
export const ENT_Q_ARCHIVISTA       = uid("ent");
export const ENT_Q_SANGRE_PUERTO    = uid("ent");
export const ENT_Q_TRAIDOR_INTERIOR = uid("ent");
export const ENT_Q_EPILOGO          = uid("ent");

// Clues
export const ENT_CLUE_PROPHECY_TEXT       = uid("ent");
export const ENT_CLUE_PETITIONER_FEAR     = uid("ent");
export const ENT_CLUE_MERCHANT_PAYMENT    = uid("ent");
export const ENT_CLUE_ARCANE_COMPONENT    = uid("ent");
export const ENT_CLUE_TORBEN_TIP          = uid("ent");
export const ENT_CLUE_ARCHIVE_RECORDS     = uid("ent");
export const ENT_CLUE_GUILD_LEDGER        = uid("ent");
export const ENT_CLUE_PORT_BODIES         = uid("ent");
export const ENT_CLUE_SERA_TEXTS          = uid("ent");
export const ENT_CLUE_LYRA_INVESTIGATION  = uid("ent");
export const ENT_CLUE_INNER_CIRCLE_MTG    = uid("ent");
export const ENT_CLUE_FALSE_PROPHECY_AUDIO= uid("ent");
export const ENT_CLUE_SENRA_DOUBTS        = uid("ent");
export const ENT_CLUE_VAULT_ENTRANCE      = uid("ent");
export const ENT_CLUE_VAULT_RECORDS       = uid("ent");
export const ENT_CLUE_VERADIS_ESCAPE      = uid("ent");
export const ENT_CLUE_VANTIS_CONFESSION   = uid("ent");
export const ENT_CLUE_CULTO_DISBANDS      = uid("ent");
export const ENT_CLUE_ELDERTOME           = uid("ent");
export const ENT_CLUE_FINAL_TRUTH         = uid("ent");
export const ENT_CLUE_FORGERY_TOOL        = uid("ent");

// Secrets
export const ENT_SEC_ORACLE_FRAUD       = uid("ent");
export const ENT_SEC_VANTIS_FUNDING     = uid("ent");
export const ENT_SEC_DIVINE_VOICE       = uid("ent");
export const ENT_SEC_LYRA_SUSPECTS      = uid("ent");
export const ENT_SEC_KAEL_EVIDENCE      = uid("ent");
export const ENT_SEC_ARCHIVE_FIRE       = uid("ent");
export const ENT_SEC_SENRA_DEFECT       = uid("ent");
export const ENT_SEC_DORIAN_SPY         = uid("ent");
export const ENT_SEC_ORIGINAL_ORACLE    = uid("ent");
export const ENT_SEC_VAULT_LOCATION     = uid("ent");
export const ENT_SEC_PROPHECY_COUNT     = uid("ent");
export const ENT_SEC_CONSEJO_CORRUPTION = uid("ent");
export const ENT_SEC_CAPTAIN_ESCAPE     = uid("ent");
export const ENT_SEC_SENRA_EXIT_CODE    = uid("ent");
export const ENT_SEC_WIDOW_SON          = uid("ent");
