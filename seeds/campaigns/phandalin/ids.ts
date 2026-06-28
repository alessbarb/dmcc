function uid(prefix: string): string {
  return `${prefix}_${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
}

// Pre-made player characters
export const ENT_PC_ARIC = uid("ent");
export const ENT_PC_MIRA = uid("ent");
export const ENT_PC_BROM = uid("ent");
export const ENT_PC_NIM = uid("ent");

// Locations
export const ENT_LOC_PHANDALIN = uid("ent");
export const ENT_LOC_TRIBOAR_TRAIL = uid("ent");
export const ENT_LOC_CRAGMAW_HIDEOUT = uid("ent");
export const ENT_LOC_STONEHILL = uid("ent");
export const ENT_LOC_BARTHEN = uid("ent");
export const ENT_LOC_LIONSHIELD = uid("ent");
export const ENT_LOC_TRESENDAR = uid("ent");
export const ENT_LOC_SLEEPING_GIANT = uid("ent");
export const ENT_LOC_TOWNMASTER = uid("ent");
export const ENT_LOC_SHRINE = uid("ent");
export const ENT_LOC_EDERMATH = uid("ent");
export const ENT_LOC_ALDERLEAF = uid("ent");
export const ENT_LOC_MINERS_EXCHANGE = uid("ent");
export const ENT_LOC_CRAGMAW_CASTLE = uid("ent");
export const ENT_LOC_WAVE_ECHO = uid("ent");
export const ENT_LOC_FORGE_OF_SPELLS = uid("ent");
export const ENT_LOC_CONYBERRY = uid("ent");
export const ENT_LOC_AGATHA_LAIR = uid("ent");
export const ENT_LOC_OLD_OWL_WELL = uid("ent");
export const ENT_LOC_WYVERN_TOR = uid("ent");
export const ENT_LOC_THUNDERTREE = uid("ent");

// Factions
export const ENT_FAC_TOWN = uid("ent");
export const ENT_FAC_REDBRANDS = uid("ent");
export const ENT_FAC_CRAGMAW = uid("ent");
export const ENT_FAC_ROCKSEEKER = uid("ent");
export const ENT_FAC_LORDS_ALLIANCE = uid("ent");
export const ENT_FAC_ZHENTARIM = uid("ent");
export const ENT_FAC_ORDER_GAUNTLET = uid("ent");
export const ENT_FAC_EMERALD_ENCLAVE = uid("ent");
export const ENT_FAC_WYVERN_ORCS = uid("ent");
export const ENT_FAC_ASH_ZOMBIES = uid("ent");

// NPCs
export const ENT_NPC_GUNDREN = uid("ent");
export const ENT_NPC_SILDAR = uid("ent");
export const ENT_NPC_ELMAR = uid("ent");
export const ENT_NPC_TOBLEN = uid("ent");
export const ENT_NPC_TRILENA = uid("ent");
export const ENT_NPC_HARBIN = uid("ent");
export const ENT_NPC_HALIA = uid("ent");
export const ENT_NPC_GARAELE = uid("ent");
export const ENT_NPC_DARAN = uid("ent");
export const ENT_NPC_QELLINE = uid("ent");
export const ENT_NPC_CARP = uid("ent");
export const ENT_NPC_LINENE = uid("ent");
export const ENT_NPC_MIRNA = uid("ent");
export const ENT_NPC_IARNO = uid("ent");
export const ENT_NPC_GLASSTAFF_ALIAS = uid("ent");
export const ENT_NPC_NOTHIC = uid("ent");
export const ENT_NPC_GRISTA = uid("ent");
export const ENT_NPC_KLARG = uid("ent");
export const ENT_NPC_YEEMIK = uid("ent");
export const ENT_NPC_GROL = uid("ent");
export const ENT_NPC_VYERITH = uid("ent");
export const ENT_NPC_NEZZNAR = uid("ent");
export const ENT_NPC_NUNDRO = uid("ent");
export const ENT_NPC_THARDEN = uid("ent");
export const ENT_NPC_HAMUN = uid("ent");
export const ENT_NPC_REIDOTH = uid("ent");
export const ENT_NPC_AGATHA = uid("ent");
export const ENT_NPC_BRUGHOR = uid("ent");
export const ENT_NPC_VENOMFANG = uid("ent");

// Quests
export const ENT_Q_ESCORT = uid("ent");
export const ENT_Q_RESCUE_GUNDREN = uid("ent");
export const ENT_Q_REDBRANDS = uid("ent");
export const ENT_Q_DENDRAR_RESCUE = uid("ent");
export const ENT_Q_FIND_CASTLE = uid("ent");
export const ENT_Q_WAVE_ECHO = uid("ent");
export const ENT_Q_BLACK_SPIDER = uid("ent");
export const ENT_Q_RECOVER_LIONSHIELD = uid("ent");
export const ENT_Q_AGATHA = uid("ent");
export const ENT_Q_OLD_OWL_WELL = uid("ent");
export const ENT_Q_WYVERN_TOR = uid("ent");
export const ENT_Q_THUNDERTREE = uid("ent");
export const ENT_Q_FUTURE_PHANDALIN = uid("ent");

// Clues
export const ENT_CLUE_DEAD_HORSES = uid("ent");
export const ENT_CLUE_GOBLIN_TRAIL = uid("ent");
export const ENT_CLUE_SILDAR_WARNING = uid("ent");
export const ENT_CLUE_REDBRAND_THREATS = uid("ent");
export const ENT_CLUE_TOWN_FEARS = uid("ent");
export const ENT_CLUE_CARP_TUNNEL = uid("ent");
export const ENT_CLUE_SLEEPING_GIANT_BOAST = uid("ent");
export const ENT_CLUE_RED_BRAND_LEDGER = uid("ent");
export const ENT_CLUE_GLASSTAFF_LETTER = uid("ent");
export const ENT_CLUE_NOTHIC_WHISPERS = uid("ent");
export const ENT_CLUE_MIRNA_HEIRLOOM = uid("ent");
export const ENT_CLUE_HALIA_OFFER = uid("ent");
export const ENT_CLUE_HARBIN_NOTICE = uid("ent");
export const ENT_CLUE_DARAN_REPORT = uid("ent");
export const ENT_CLUE_LINENE_CARGO_MARKS = uid("ent");
export const ENT_CLUE_CASTLE_MARKS = uid("ent");
export const ENT_CLUE_CRAGMAW_RANSOM = uid("ent");
export const ENT_CLUE_VYERITH_DISGUISE = uid("ent");
export const ENT_CLUE_GROL_BARGAIN = uid("ent");
export const ENT_CLUE_NUNDRO_TESTIMONY = uid("ent");
export const ENT_CLUE_SPIDER_SIGIL = uid("ent");
export const ENT_CLUE_MINE_MAP = uid("ent");
export const ENT_CLUE_FORGE_ECHO = uid("ent");
export const ENT_CLUE_THARDEN_BODY = uid("ent");
export const ENT_CLUE_REIDOTH_WARNING = uid("ent");
export const ENT_CLUE_DRAGON_SIGNS = uid("ent");
export const ENT_CLUE_OLD_OWL_SIGNS = uid("ent");
export const ENT_CLUE_AGATHA_MEMORY = uid("ent");
export const ENT_CLUE_WYVERN_TOR_RAIDS = uid("ent");
export const ENT_CLUE_PHANDALIN_POWER_VACUUM = uid("ent");

// Secrets
export const ENT_SEC_IARNO_GLASSTAFF = uid("ent");
export const ENT_SEC_NEZZNAR = uid("ent");
export const ENT_SEC_CASTLE_LOCATION = uid("ent");
export const ENT_SEC_GUNDREN_MAP = uid("ent");
export const ENT_SEC_HALIA_AMBITION = uid("ent");
export const ENT_SEC_HARBIN_COWARDICE = uid("ent");
export const ENT_SEC_CRAGMAW_BARGAIN = uid("ent");
export const ENT_SEC_FORGE_REAL = uid("ent");
export const ENT_SEC_DENDRARS_ALIVE = uid("ent");
export const ENT_SEC_NOTHIC_HUNGER = uid("ent");
export const ENT_SEC_REDBRAND_HOSTAGES = uid("ent");
export const ENT_SEC_VYERITH_DOPPELGANGER = uid("ent");
export const ENT_SEC_THARDEN_DEAD = uid("ent");
export const ENT_SEC_HAMUN_NOT_PRIMARY = uid("ent");
export const ENT_SEC_VENOMFANG_MANIPULATES = uid("ent");
export const ENT_SEC_AGATHA_KNOWS = uid("ent");
export const ENT_SEC_WYVERN_ORCS_PRESSURE = uid("ent");
export const ENT_SEC_PHANDALIN_POWER_VACUUM = uid("ent");

// Sessions
export const SESS_ROAD = "sess_seed_phandalin_road";
export const SESS_RED_BRANDS = "sess_seed_phandalin_redbrands";
export const SESS_TRESENDAR = "sess_seed_phandalin_tresendar";
export const SESS_CRAGMAW_CASTLE = "sess_seed_phandalin_castle";
export const SESS_SIDE_FRONTS = "sess_seed_phandalin_side_fronts";
export const SESS_WAVE_ECHO_APPROACH = "sess_seed_phandalin_wave_approach";
export const SESS_WAVE_ECHO_FINAL = "sess_seed_phandalin_final";
export const SESS_EPILOGUE = "sess_seed_phandalin_epilogue";
