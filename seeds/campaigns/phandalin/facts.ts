import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

export async function seedFacts() {
  const DM = { kind: "dm_only" as const };
  const ALL = { kind: "party" as const };
  const SRC = { kind: "manual" as const, note: "Phandalin enhanced seed" };

  const FACTS = [
    { factId: "fact_seed_phandalin_gundren_missing", statement: "Gundren Rockseeker no llegó a Phandalin y sus caballos aparecieron muertos en el Camino de Triboar.", kind: "canon", confidence: "confirmed", visibility: ALL, relatedEntityIds: [ids.ENT_NPC_GUNDREN, ids.ENT_CLUE_DEAD_HORSES, ids.ENT_LOC_TRIBOAR_TRAIL] },
    { factId: "fact_seed_phandalin_sildar_rescued", statement: "Sildar Hallwinter sobrevivió a la captura Cragmaw y puede explicar por qué Gundren era un objetivo valioso.", kind: "canon", confidence: "confirmed", visibility: ALL, relatedEntityIds: [ids.ENT_NPC_SILDAR, ids.ENT_Q_RESCUE_GUNDREN] },
    { factId: "fact_seed_phandalin_redbrands_control", statement: "Los Redbrands intimidan a Phandalin con suficiente libertad como para que la gente dude de la autoridad local.", kind: "canon", confidence: "confirmed", visibility: ALL, relatedEntityIds: [ids.ENT_FAC_REDBRANDS, ids.ENT_CLUE_REDBRAND_THREATS, ids.ENT_NPC_HARBIN] },
    { factId: "fact_seed_phandalin_people_need_proof", statement: "Los vecinos de Phandalin no necesitan discursos heroicos; necesitan ver una consecuencia real contra quienes los amenazan.", kind: "canon", confidence: "confirmed", visibility: ALL, relatedEntityIds: [ids.ENT_FAC_TOWN, ids.ENT_Q_REDBRANDS, ids.ENT_LOC_PHANDALIN] },
    { factId: "fact_seed_phandalin_carp_tunnel", statement: "Carp Alderleaf ha visto una posible entrada secundaria a los sótanos de Tresendar.", kind: "rumor", confidence: "likely", visibility: ALL, relatedEntityIds: [ids.ENT_NPC_CARP, ids.ENT_CLUE_CARP_TUNNEL, ids.ENT_LOC_TRESENDAR] },
    { factId: "fact_seed_phandalin_lionshield_cargo", statement: "Parte del cargamento de Lionshield robado por goblins puede recuperarse y mejorar la confianza local en el grupo.", kind: "canon", confidence: "confirmed", visibility: ALL, relatedEntityIds: [ids.ENT_Q_RECOVER_LIONSHIELD, ids.ENT_NPC_LINENE, ids.ENT_CLUE_LINENE_CARGO_MARKS] },
    { factId: "fact_seed_phandalin_iarno_secret", statement: "Iarno Albrek se oculta bajo el alias Glasstaff y dirige a los Redbrands desde Tresendar.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_NPC_IARNO, ids.ENT_NPC_GLASSTAFF_ALIAS, ids.ENT_SEC_IARNO_GLASSTAFF, ids.ENT_LOC_TRESENDAR] },
    { factId: "fact_seed_phandalin_nothic_knows", statement: "El nothic de Tresendar puede revelar secretos útiles, pero cada trato con él debe tener sabor incómodo.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_NPC_NOTHIC, ids.ENT_SEC_NOTHIC_HUNGER, ids.ENT_CLUE_NOTHIC_WHISPERS] },
    { factId: "fact_seed_phandalin_dendrar_clock", statement: "La familia Dendrar está viva al inicio del arco Redbrand, pero su situación debe empeorar si el grupo ignora Tresendar durante demasiado tiempo.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_NPC_MIRNA, ids.ENT_SEC_DENDRARS_ALIVE, ids.ENT_SEC_REDBRAND_HOSTAGES, ids.ENT_Q_DENDRAR_RESCUE] },
    { factId: "fact_seed_phandalin_halia_theory", statement: "[Teoría de mesa]: Halia podría ser una aliada temporal que luego intente gobernar el comercio de Phandalin.", kind: "player_theory", confidence: "unconfirmed", visibility: ALL, relatedEntityIds: [ids.ENT_NPC_HALIA, ids.ENT_SEC_HALIA_AMBITION] },
    { factId: "fact_seed_phandalin_spider_network", statement: "La Araña Negra conecta el secuestro de Gundren, la presión sobre Glasstaff y el interés por la mina perdida.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_NPC_NEZZNAR, ids.ENT_SEC_NEZZNAR, ids.ENT_Q_BLACK_SPIDER] },
    { factId: "fact_seed_phandalin_cragmaw_divided", statement: "El clan Cragmaw no es monolítico: Yeemik, Grol y Vyerith pueden tener incentivos distintos.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_FAC_CRAGMAW, ids.ENT_NPC_YEEMIK, ids.ENT_NPC_GROL, ids.ENT_NPC_VYERITH, ids.ENT_SEC_CRAGMAW_BARGAIN] },
    { factId: "fact_seed_phandalin_map_is_timer", statement: "El mapa de Gundren funciona como reloj de campaña: cada retraso aumenta la probabilidad de que cambie de manos.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_CLUE_MINE_MAP, ids.ENT_SEC_GUNDREN_MAP, ids.ENT_Q_FIND_CASTLE] },
    { factId: "fact_seed_phandalin_vyerith_twist", statement: "Vyerith puede convertir una victoria en el Castillo Cragmaw en una persecución si roba o sustituye información clave.", kind: "dm_secret", confidence: "likely", visibility: DM, relatedEntityIds: [ids.ENT_NPC_VYERITH, ids.ENT_SEC_VYERITH_DOPPELGANGER, ids.ENT_CLUE_VYERITH_DISGUISE] },
    { factId: "fact_seed_phandalin_tharden_dead", statement: "Tharden Rockseeker ya ha pagado el precio de Wave Echo, lo que evita que el final sea solo una carrera por botín.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_NPC_THARDEN, ids.ENT_SEC_THARDEN_DEAD, ids.ENT_CLUE_THARDEN_BODY] },
    { factId: "fact_seed_phandalin_forge_true", statement: "La Cueva del Eco de la Ola conserva una fuente mágica real, deteriorada pero todavía poderosa.", kind: "dm_secret", confidence: "suspected", visibility: DM, relatedEntityIds: [ids.ENT_LOC_WAVE_ECHO, ids.ENT_LOC_FORGE_OF_SPELLS, ids.ENT_SEC_FORGE_REAL, ids.ENT_CLUE_FORGE_ECHO] },
    { factId: "fact_seed_phandalin_hamun_side", statement: "Hamun Kost es una amenaza lateral o una fuente incómoda, no una extensión automática de la Araña Negra.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_NPC_HAMUN, ids.ENT_LOC_OLD_OWL_WELL, ids.ENT_SEC_HAMUN_NOT_PRIMARY] },
    { factId: "fact_seed_phandalin_venomfang_warning", statement: "Venomfang debe aparecer como peligro negociador e inteligente; la mesa debería entender que no todo reto está para ganarse por fuerza.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_NPC_VENOMFANG, ids.ENT_SEC_VENOMFANG_MANIPULATES, ids.ENT_CLUE_DRAGON_SIGNS] },
    { factId: "fact_seed_phandalin_power_vacuum", statement: "Derrotar a los Redbrands y a la Araña Negra abre una pregunta política: quién protege Phandalin cuando los aventureros se marchen.", kind: "dm_secret", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_Q_FUTURE_PHANDALIN, ids.ENT_SEC_PHANDALIN_POWER_VACUUM, ids.ENT_CLUE_PHANDALIN_POWER_VACUUM] },
    { factId: "fact_seed_phandalin_next_hook", statement: "La próxima sesión preparada debe abrir con una decisión clara: entrar en Tresendar, buscar más apoyo local o perseguir la pista Cragmaw hacia el castillo.", kind: "canon", confidence: "confirmed", visibility: DM, relatedEntityIds: [ids.ENT_Q_REDBRANDS, ids.ENT_Q_FIND_CASTLE, ids.ENT_LOC_TRESENDAR] },
  ];

  for (const fact of FACTS) {
    await api("POST", `/api/campaigns/${CMP}/facts`, {
      actorId: "usr_dm",
      source: SRC,
      relatedRelationIds: [],
      ...fact,
    });
  }
  console.log(`✓ ${FACTS.length} facts created`);
}
