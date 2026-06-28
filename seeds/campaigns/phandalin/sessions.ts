import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

type Priority = "low" | "medium" | "high";

type PrepInput = {
  sessionId: string;
  title: string;
  summary: string;
  openingPrompt: string;
  goals: string[];
  sceneIds: string[];
  involvedEntityIds: string[];
  availableClueIds: string[];
  secretsAtRiskIds: string[];
  expectedConsequenceIds: string[];
  notes: string;
  checklist: Array<{ id: string; label: string; priority?: Priority }>;
};

async function start(sessionId: string, title: string) {
  await api("POST", `/api/campaigns/${CMP}/sessions`, { actorId: "usr_dm", sessionId, title });
}

async function prepare(input: PrepInput) {
  await api("POST", `/api/campaigns/${CMP}/sessions/prepared`, {
    actorId: "usr_dm",
    sessionId: input.sessionId,
    title: input.title,
    prep: {
      state: "ready",
      summary: input.summary,
      openingPrompt: input.openingPrompt,
      goals: input.goals,
      sceneIds: input.sceneIds,
      involvedEntityIds: input.involvedEntityIds,
      availableClueIds: input.availableClueIds,
      secretsAtRiskIds: input.secretsAtRiskIds,
      expectedConsequenceIds: input.expectedConsequenceIds,
      notes: input.notes,
      checklist: input.checklist.map((item) => ({ done: false, priority: item.priority ?? "medium", ...item })),
    },
  });
}

async function event(sessionId: string, index: number, type: string, title: string, description: string, relatedEntityIds: string[] = []) {
  await api("POST", `/api/campaigns/${CMP}/sessions/${sessionId}/events`, {
    actorId: "usr_dm",
    sessionEventId: `sevt_${sessionId}_${index}`,
    type,
    title,
    description,
    relatedEntityIds,
    visibility: { kind: "party" },
  });
}

async function reveal(sessionId: string, clueEntityId: string, note: string) {
  await api("POST", `/api/campaigns/${CMP}/sessions/${sessionId}/reveal-clue`, {
    actorId: "usr_dm",
    clueEntityId,
    audience: { kind: "party" },
    note,
  });
}

async function close(sessionId: string, summary: string) {
  await api("POST", `/api/campaigns/${CMP}/sessions/${sessionId}/close`, { actorId: "usr_dm", summary });
}

export async function seedSessions() {
  await start(ids.SESS_ROAD, "Sesión 1 — La emboscada del Camino de Triboar");
  await event(
    ids.SESS_ROAD,
    1,
    "scene_started",
    "La caravana encontró los caballos de Gundren",
    "El grupo descubrió que los caballos no eran un accidente de viaje, sino una emboscada preparada.",
    [ids.ENT_Q_ESCORT, ids.ENT_CLUE_DEAD_HORSES, ids.ENT_LOC_TRIBOAR_TRAIL],
  );
  await reveal(ids.SESS_ROAD, ids.ENT_CLUE_DEAD_HORSES, "Los jugadores ya conocen que Gundren y Sildar fueron atacados antes de llegar a Phandalin.");
  await reveal(ids.SESS_ROAD, ids.ENT_CLUE_GOBLIN_TRAIL, "El rastro hacia la guarida Cragmaw quedó disponible para el grupo.");
  await event(
    ids.SESS_ROAD,
    2,
    "npc_met",
    "Sildar sobrevivió a la guarida",
    "La liberación de Sildar conectó el ataque goblin con el mapa de Gundren y con una amenaza mayor.",
    [ids.ENT_NPC_SILDAR, ids.ENT_Q_RESCUE_GUNDREN, ids.ENT_CLUE_SILDAR_WARNING],
  );
  await reveal(ids.SESS_ROAD, ids.ENT_CLUE_SILDAR_WARNING, "Sildar explicó que Gundren encontró algo que otros quieren controlar.");
  await event(
    ids.SESS_ROAD,
    3,
    "decision_made",
    "El grupo eligió llegar a Phandalin con Sildar",
    "La campaña queda orientada hacia dos frentes: rescatar a Gundren y entender por qué el pueblo tiene miedo.",
    [ids.ENT_LOC_PHANDALIN, ids.ENT_Q_RESCUE_GUNDREN, ids.ENT_FAC_TOWN],
  );
  await close(
    ids.SESS_ROAD,
    "El grupo sobrevivió a la emboscada, siguió el rastro goblin y rescató a Sildar. Ahora sabe que Gundren no era solo un patrón de caravana: su mapa puede cambiar el destino de Phandalin.",
  );

  await start(ids.SESS_RED_BRANDS, "Sesión 2 — Un pueblo con miedo");
  await event(
    ids.SESS_RED_BRANDS,
    1,
    "location_visited",
    "Llegada a Phandalin",
    "La entrega de provisiones reveló un pueblo tenso, con vecinos que hablan bajo y evitan nombrar a los Redbrands.",
    [ids.ENT_LOC_PHANDALIN, ids.ENT_LOC_BARTHEN, ids.ENT_CLUE_TOWN_FEARS],
  );
  await reveal(ids.SESS_RED_BRANDS, ids.ENT_CLUE_TOWN_FEARS, "La mesa percibió que el miedo social es parte central del problema.");
  await event(
    ids.SESS_RED_BRANDS,
    2,
    "npc_met",
    "Rumores en la Posada Stonehill",
    "Toblen y Trilena permitieron escuchar el conflicto sin bloquear la agencia de los jugadores.",
    [ids.ENT_LOC_STONEHILL, ids.ENT_NPC_TOBLEN, ids.ENT_NPC_TRILENA],
  );
  await event(
    ids.SESS_RED_BRANDS,
    3,
    "quest_updated",
    "Amenazas en la calle",
    "Los Redbrands se mostraron como una amenaza inmediata, no como un rumor secundario.",
    [ids.ENT_FAC_REDBRANDS, ids.ENT_CLUE_REDBRAND_THREATS, ids.ENT_Q_REDBRANDS],
  );
  await reveal(ids.SESS_RED_BRANDS, ids.ENT_CLUE_REDBRAND_THREATS, "Los jugadores ya tienen motivos suficientes para investigar la Mansión Tresendar.");
  await event(
    ids.SESS_RED_BRANDS,
    4,
    "decision_made",
    "El grupo debe decidir cómo entrar al arco Redbrand",
    "La siguiente sesión puede empezar por fuerza directa, búsqueda de aliados, entrada secreta o presión social.",
    [ids.ENT_Q_REDBRANDS, ids.ENT_LOC_TRESENDAR, ids.ENT_CLUE_CARP_TUNNEL],
  );
  await close(
    ids.SESS_RED_BRANDS,
    "Phandalin quedó establecido como un lugar que necesita protección. La próxima decisión natural es entrar en Tresendar, buscar aliados locales o seguir la pista de Gundren hacia Cragmaw.",
  );

  await prepare({
    sessionId: ids.SESS_TRESENDAR,
    title: "Sesión 3 — Bajo la Mansión Tresendar",
    summary: "Sesión preparada para resolver el arco Redbrand con infiltración, combate, negociación y consecuencias sociales.",
    openingPrompt: "Abre con una elección explícita: ¿entrar por la puerta visible, buscar la pista de Carp, provocar a los Redbrands en el Gigante Dormido o reunir aliados antes de moverse?",
    goals: [
      "Dar al grupo una victoria clara contra el miedo del pueblo.",
      "Revelar o insinuar que Glasstaff no es solo un jefe de banda.",
      "Permitir salvar a Mirna Dendrar y convertir el dungeon en algo humano.",
    ],
    sceneIds: [ids.ENT_LOC_SLEEPING_GIANT, ids.ENT_LOC_TRESENDAR, ids.ENT_LOC_ALDERLEAF],
    involvedEntityIds: [ids.ENT_FAC_REDBRANDS, ids.ENT_NPC_IARNO, ids.ENT_NPC_GLASSTAFF_ALIAS, ids.ENT_NPC_NOTHIC, ids.ENT_NPC_MIRNA, ids.ENT_NPC_CARP],
    availableClueIds: [ids.ENT_CLUE_CARP_TUNNEL, ids.ENT_CLUE_SLEEPING_GIANT_BOAST, ids.ENT_CLUE_RED_BRAND_LEDGER, ids.ENT_CLUE_GLASSTAFF_LETTER, ids.ENT_CLUE_NOTHIC_WHISPERS, ids.ENT_CLUE_MIRNA_HEIRLOOM],
    secretsAtRiskIds: [ids.ENT_SEC_IARNO_GLASSTAFF, ids.ENT_SEC_DENDRARS_ALIVE, ids.ENT_SEC_NOTHIC_HUNGER, ids.ENT_SEC_REDBRAND_HOSTAGES, ids.ENT_SEC_PHANDALIN_POWER_VACUUM],
    expectedConsequenceIds: [ids.ENT_Q_REDBRANDS, ids.ENT_Q_DENDRAR_RESCUE, ids.ENT_Q_FUTURE_PHANDALIN],
    notes: "No fuerces que Iarno luche hasta morir. Si escapa, queda un cabo suelto útil; si cae, el foco pasa antes a la Araña Negra. En ambos casos Phandalin debe reaccionar.",
    checklist: [
      { id: "prep_tresendar_routes", label: "Tener listas tres entradas: frontal, túnel de Carp y provocación en el Gigante Dormido", priority: "high" },
      { id: "prep_nothic_offer", label: "Preparar una oferta incómoda del nothic", priority: "medium" },
      { id: "prep_dendrar_timer", label: "Decidir qué ocurre con Mirna si el grupo descansa o se demora", priority: "high" },
      { id: "prep_glasstaff_escape", label: "Preparar huida, rendición o confrontación de Glasstaff", priority: "medium" },
    ],
  });

  await prepare({
    sessionId: ids.SESS_CRAGMAW_CASTLE,
    title: "Sesión 4 — El camino al Castillo Cragmaw",
    summary: "Sesión de transición e investigación: convertir pistas sueltas en ruta, y decidir si el grupo busca a Gundren directamente o limpia frentes laterales.",
    openingPrompt: "Sildar coloca el mapa incompleto sobre la mesa: 'Podemos perder días buscando el castillo. ¿A quién vais a preguntar y qué estáis dispuestos a prometer?'",
    goals: [
      "Triangular la ubicación del Castillo Cragmaw con al menos dos fuentes.",
      "Presentar la división interna del clan como alternativa al combate lineal.",
      "Hacer que el mapa de Gundren se sienta como reloj vivo.",
    ],
    sceneIds: [ids.ENT_LOC_PHANDALIN, ids.ENT_LOC_CRAGMAW_HIDEOUT, ids.ENT_LOC_CRAGMAW_CASTLE],
    involvedEntityIds: [ids.ENT_NPC_SILDAR, ids.ENT_NPC_YEEMIK, ids.ENT_NPC_GROL, ids.ENT_NPC_VYERITH, ids.ENT_FAC_CRAGMAW],
    availableClueIds: [ids.ENT_CLUE_CASTLE_MARKS, ids.ENT_CLUE_CRAGMAW_RANSOM, ids.ENT_CLUE_GROL_BARGAIN, ids.ENT_CLUE_VYERITH_DISGUISE, ids.ENT_CLUE_MINE_MAP],
    secretsAtRiskIds: [ids.ENT_SEC_CASTLE_LOCATION, ids.ENT_SEC_CRAGMAW_BARGAIN, ids.ENT_SEC_GUNDREN_MAP, ids.ENT_SEC_VYERITH_DOPPELGANGER],
    expectedConsequenceIds: [ids.ENT_Q_FIND_CASTLE, ids.ENT_Q_RESCUE_GUNDREN, ids.ENT_Q_WAVE_ECHO],
    notes: "Si la mesa viene de una sesión urbana intensa, abre con exploración y conversación. Si viene con ganas de acción, convierte la ruta en persecución o emboscada.",
    checklist: [
      { id: "prep_castle_sources", label: "Preparar dos fuentes de ruta: goblin, Reidoth, documento o mapa parcial", priority: "high" },
      { id: "prep_grol_deal", label: "Definir qué quiere Grol en una negociación", priority: "medium" },
      { id: "prep_vyerith_tells", label: "Anotar tres detalles que delaten a Vyerith sin hacerlo obvio", priority: "medium" },
    ],
  });

  await prepare({
    sessionId: ids.SESS_SIDE_FRONTS,
    title: "Sesión opcional — Frentes de Phandalin",
    summary: "Caja de herramientas para una sesión lateral: Agatha, Viejo Pozo, Tor del Guiverno o Thundertree, según el ritmo que necesite la mesa.",
    openingPrompt: "El pueblo respira, pero el tablón del concejo, Garaele y Daran recuerdan que la región no espera a que los héroes terminen una sola trama.",
    goals: [
      "Dar descanso de la línea principal sin perder consecuencias.",
      "Mostrar que la región tiene amenazas independientes.",
      "Ofrecer información o aliados para llegar mejor a Wave Echo.",
    ],
    sceneIds: [ids.ENT_LOC_TOWNMASTER, ids.ENT_LOC_AGATHA_LAIR, ids.ENT_LOC_OLD_OWL_WELL, ids.ENT_LOC_WYVERN_TOR, ids.ENT_LOC_THUNDERTREE],
    involvedEntityIds: [ids.ENT_NPC_GARAELE, ids.ENT_NPC_AGATHA, ids.ENT_NPC_HAMUN, ids.ENT_NPC_BRUGHOR, ids.ENT_NPC_REIDOTH, ids.ENT_NPC_VENOMFANG],
    availableClueIds: [ids.ENT_CLUE_HARBIN_NOTICE, ids.ENT_CLUE_AGATHA_MEMORY, ids.ENT_CLUE_OLD_OWL_SIGNS, ids.ENT_CLUE_WYVERN_TOR_RAIDS, ids.ENT_CLUE_REIDOTH_WARNING, ids.ENT_CLUE_DRAGON_SIGNS],
    secretsAtRiskIds: [ids.ENT_SEC_AGATHA_KNOWS, ids.ENT_SEC_HAMUN_NOT_PRIMARY, ids.ENT_SEC_WYVERN_ORCS_PRESSURE, ids.ENT_SEC_VENOMFANG_MANIPULATES],
    expectedConsequenceIds: [ids.ENT_Q_AGATHA, ids.ENT_Q_OLD_OWL_WELL, ids.ENT_Q_WYVERN_TOR, ids.ENT_Q_THUNDERTREE],
    notes: "No intentes meter todos los frentes. Elige uno principal y usa los demás como rumores o costes de oportunidad.",
    checklist: [
      { id: "prep_pick_front", label: "Elegir un frente principal según energía de la mesa", priority: "high" },
      { id: "prep_front_reward", label: "Definir qué pista, aliado o consecuencia sale del frente elegido", priority: "high" },
      { id: "prep_dragon_warning", label: "Si aparece Thundertree, preparar señales de peligro antes de Venomfang", priority: "medium" },
    ],
  });

  await prepare({
    sessionId: ids.SESS_WAVE_ECHO_APPROACH,
    title: "Sesión 5 — La entrada a Wave Echo",
    summary: "Sesión de rescate, duelo familiar y entrada al gran misterio de la mina perdida.",
    openingPrompt: "Gundren sostiene el mapa con manos temblorosas. No pregunta si vais a la mina; pregunta cuánto estáis dispuestos a perder para llegar antes que la Araña Negra.",
    goals: [
      "Reforzar el coste Rockseeker antes de entrar al dungeon final.",
      "Presentar Wave Echo como lugar de maravilla y trauma.",
      "Colocar a Nezznar como presencia cercana aunque aún no esté frente al grupo.",
    ],
    sceneIds: [ids.ENT_LOC_WAVE_ECHO, ids.ENT_LOC_FORGE_OF_SPELLS],
    involvedEntityIds: [ids.ENT_NPC_GUNDREN, ids.ENT_NPC_NUNDRO, ids.ENT_NPC_THARDEN, ids.ENT_NPC_NEZZNAR, ids.ENT_FAC_ROCKSEEKER],
    availableClueIds: [ids.ENT_CLUE_MINE_MAP, ids.ENT_CLUE_NUNDRO_TESTIMONY, ids.ENT_CLUE_THARDEN_BODY, ids.ENT_CLUE_FORGE_ECHO, ids.ENT_CLUE_SPIDER_SIGIL],
    secretsAtRiskIds: [ids.ENT_SEC_THARDEN_DEAD, ids.ENT_SEC_FORGE_REAL, ids.ENT_SEC_NEZZNAR, ids.ENT_SEC_GUNDREN_MAP],
    expectedConsequenceIds: [ids.ENT_Q_WAVE_ECHO, ids.ENT_Q_BLACK_SPIDER],
    notes: "Alterna exploración, silencio y señales del enemigo. La mina no debe sentirse como una sucesión plana de habitaciones.",
    checklist: [
      { id: "prep_wave_tone", label: "Preparar una descripción de maravilla, una de pérdida y una de peligro", priority: "high" },
      { id: "prep_rockseeker_scene", label: "Decidir cómo mostrar el coste emocional de Tharden y Nundro", priority: "high" },
      { id: "prep_spider_pressure", label: "Preparar una señal de que Nezznar está cerca", priority: "medium" },
    ],
  });

  await prepare({
    sessionId: ids.SESS_WAVE_ECHO_FINAL,
    title: "Sesión 6 — La Araña Negra y la Forja",
    summary: "Clímax de campaña: confrontar a Nezznar y decidir qué ocurre con la Forja de Conjuros.",
    openingPrompt: "El eco de la roca responde a magia, metal y respiración. Por primera vez, la mina parece escuchar antes de que la Araña Negra hable.",
    goals: [
      "Resolver el enfrentamiento con Nezznar sin reducirlo a bolsa de puntos de golpe.",
      "Hacer de la Forja una decisión de poder, no solo recompensa.",
      "Conectar combate, negociación y consecuencias políticas.",
    ],
    sceneIds: [ids.ENT_LOC_FORGE_OF_SPELLS, ids.ENT_LOC_WAVE_ECHO],
    involvedEntityIds: [ids.ENT_NPC_NEZZNAR, ids.ENT_NPC_NUNDRO, ids.ENT_FAC_ROCKSEEKER, ids.ENT_NPC_HALIA, ids.ENT_NPC_SILDAR],
    availableClueIds: [ids.ENT_CLUE_FORGE_ECHO, ids.ENT_CLUE_SPIDER_SIGIL, ids.ENT_CLUE_PHANDALIN_POWER_VACUUM],
    secretsAtRiskIds: [ids.ENT_SEC_FORGE_REAL, ids.ENT_SEC_NEZZNAR, ids.ENT_SEC_PHANDALIN_POWER_VACUUM],
    expectedConsequenceIds: [ids.ENT_Q_BLACK_SPIDER, ids.ENT_Q_FUTURE_PHANDALIN],
    notes: "Ten preparada una salida si Nezznar intenta negociar, huir o destruir parte de la Forja. Lo importante es que la mesa sienta que decide el futuro de un lugar peligroso.",
    checklist: [
      { id: "prep_nezznar_offer", label: "Preparar una oferta tentadora de Nezznar", priority: "medium" },
      { id: "prep_forge_choices", label: "Definir 3 opciones sobre la Forja: proteger, explotar, sellar", priority: "high" },
      { id: "prep_final_consequence", label: "Preparar consecuencia distinta según quién controle la mina", priority: "high" },
    ],
  });

  await prepare({
    sessionId: ids.SESS_EPILOGUE,
    title: "Epílogo — ¿Quién protege Phandalin?",
    summary: "Sesión corta o cierre de campaña para recoger decisiones sociales, recompensas y semillas de continuación.",
    openingPrompt: "Días después, Phandalin ya no susurra igual. Ahora la pregunta no es quién tuvo miedo, sino quién tendrá autoridad mañana.",
    goals: [
      "Cerrar arcos de PNJ con consecuencias visibles.",
      "Permitir que los jugadores definan qué legado dejan.",
      "Sembrar continuación sin quitar cierre a la campaña.",
    ],
    sceneIds: [ids.ENT_LOC_PHANDALIN, ids.ENT_LOC_MINERS_EXCHANGE, ids.ENT_LOC_STONEHILL, ids.ENT_LOC_TOWNMASTER],
    involvedEntityIds: [ids.ENT_NPC_HALIA, ids.ENT_NPC_SILDAR, ids.ENT_NPC_HARBIN, ids.ENT_NPC_DARAN, ids.ENT_FAC_TOWN, ids.ENT_FAC_ROCKSEEKER],
    availableClueIds: [ids.ENT_CLUE_PHANDALIN_POWER_VACUUM, ids.ENT_CLUE_RED_BRAND_LEDGER, ids.ENT_CLUE_HALIA_OFFER],
    secretsAtRiskIds: [ids.ENT_SEC_HALIA_AMBITION, ids.ENT_SEC_HARBIN_COWARDICE, ids.ENT_SEC_PHANDALIN_POWER_VACUUM],
    expectedConsequenceIds: [ids.ENT_Q_FUTURE_PHANDALIN],
    notes: "Ideal como sesión de 45-90 minutos o como cierre tras el clímax. Haz preguntas directas a cada personaje.",
    checklist: [
      { id: "prep_epilogue_questions", label: "Preparar una pregunta de legado para cada personaje", priority: "high" },
      { id: "prep_power_outcome", label: "Elegir cómo cambia Phandalin según aliados favorecidos", priority: "high" },
      { id: "prep_next_seed", label: "Dejar una semilla de continuación opcional", priority: "low" },
    ],
  });

  console.log("✓ 8 sessions created (2 closed play-history sessions, 6 ready prepared sessions)");
}
