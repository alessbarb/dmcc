import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

type Visibility = { kind: "party" | "dm_only" };
type RelationSeed = {
  id: string;
  source: string;
  target: string;
  type: string;
  description: string;
  visibility?: Visibility;
};

function r(id: string, source: string, target: string, type: string, description: string, visibility?: Visibility): RelationSeed {
  return { id: `rel_seed_phandalin_${id}`, source, target, type, description, visibility };
}

export async function seedRelations() {
  const DM = { kind: "dm_only" as const };
  const ALL = { kind: "party" as const };

  const RELATIONS: RelationSeed[] = [
    // Campaign spine, visible layer
    r("gundren_rockseeker", ids.ENT_NPC_GUNDREN, ids.ENT_FAC_ROCKSEEKER, "member_of", "Gundren pertenece a los hermanos Rockseeker y empuja la búsqueda de la mina.", ALL),
    r("nundro_rockseeker", ids.ENT_NPC_NUNDRO, ids.ENT_FAC_ROCKSEEKER, "member_of", "Nundro es uno de los hermanos Rockseeker atrapados en la tragedia de la mina.", DM),
    r("tharden_rockseeker", ids.ENT_NPC_THARDEN, ids.ENT_FAC_ROCKSEEKER, "member_of", "Tharden completa el coste familiar del hallazgo de Wave Echo.", DM),
    r("escort_gundren", ids.ENT_Q_ESCORT, ids.ENT_NPC_GUNDREN, "depends_on", "La entrega inicial existe porque Gundren contrató a la caravana.", ALL),
    r("escort_barthen", ids.ENT_Q_ESCORT, ids.ENT_LOC_BARTHEN, "points_to", "El contrato inicial termina en Provisiones de Barthen.", ALL),
    r("dead_horses_gundren", ids.ENT_CLUE_DEAD_HORSES, ids.ENT_NPC_GUNDREN, "points_to", "Los caballos abatidos pertenecían a Gundren y Sildar.", ALL),
    r("dead_horses_trail", ids.ENT_CLUE_DEAD_HORSES, ids.ENT_LOC_TRIBOAR_TRAIL, "located_in", "La pista aparece en el Camino de Triboar.", ALL),
    r("goblin_trail_hideout", ids.ENT_CLUE_GOBLIN_TRAIL, ids.ENT_LOC_CRAGMAW_HIDEOUT, "points_to", "El rastro lleva a la guarida Cragmaw.", ALL),
    r("sildar_rescue", ids.ENT_NPC_SILDAR, ids.ENT_Q_RESCUE_GUNDREN, "ally_of", "Sildar orienta al grupo hacia el rescate de Gundren.", ALL),
    r("sildar_lords", ids.ENT_NPC_SILDAR, ids.ENT_FAC_LORDS_ALLIANCE, "member_of", "Sildar representa una vía institucional honesta para Phandalin.", ALL),
    r("sildar_iarno", ids.ENT_NPC_SILDAR, ids.ENT_NPC_IARNO, "points_to", "Sildar quiere encontrar a Iarno antes de entender en qué se ha convertido.", DM),
    r("warning_map", ids.ENT_CLUE_SILDAR_WARNING, ids.ENT_SEC_GUNDREN_MAP, "points_to", "La advertencia de Sildar prepara la importancia real del mapa.", DM),

    // Phandalin social map
    r("phandalin_town", ids.ENT_LOC_PHANDALIN, ids.ENT_FAC_TOWN, "custom:home_of", "El pueblo es más que un tablero: es una comunidad con miedo y memoria.", ALL),
    r("stonehill_phandalin", ids.ENT_LOC_STONEHILL, ids.ENT_LOC_PHANDALIN, "located_in", "La posada funciona como plaza social de Phandalin.", ALL),
    r("barthen_phandalin", ids.ENT_LOC_BARTHEN, ids.ENT_LOC_PHANDALIN, "located_in", "Barthen mantiene el comercio cotidiano del pueblo.", ALL),
    r("lionshield_phandalin", ids.ENT_LOC_LIONSHIELD, ids.ENT_LOC_PHANDALIN, "located_in", "Lionshield sostiene la economía de equipo y rutas.", ALL),
    r("townmaster_phandalin", ids.ENT_LOC_TOWNMASTER, ids.ENT_LOC_PHANDALIN, "located_in", "El Salón del Concejo muestra la autoridad oficial.", ALL),
    r("sleeping_giant_phandalin", ids.ENT_LOC_SLEEPING_GIANT, ids.ENT_LOC_PHANDALIN, "located_in", "El Gigante Dormido muestra la autoridad real de los Redbrands.", ALL),
    r("tresendar_phandalin", ids.ENT_LOC_TRESENDAR, ids.ENT_LOC_PHANDALIN, "located_in", "Tresendar es la herida oculta bajo el pueblo.", ALL),
    r("shrine_phandalin", ids.ENT_LOC_SHRINE, ids.ENT_LOC_PHANDALIN, "located_in", "El santuario ofrece una lectura espiritual del conflicto.", ALL),
    r("edermath_phandalin", ids.ENT_LOC_EDERMATH, ids.ENT_LOC_PHANDALIN, "located_in", "El huerto de Daran da perspectiva veterana.", ALL),
    r("alderleaf_phandalin", ids.ENT_LOC_ALDERLEAF, ids.ENT_LOC_PHANDALIN, "located_in", "La granja de Qelline hace visible a las familias del pueblo.", ALL),
    r("miners_exchange_phandalin", ids.ENT_LOC_MINERS_EXCHANGE, ids.ENT_LOC_PHANDALIN, "located_in", "El intercambio de mineros canaliza dinero e influencia.", ALL),
    r("elmar_barthen", ids.ENT_NPC_ELMAR, ids.ENT_LOC_BARTHEN, "located_in", "Elmar recibe la caravana en Provisiones de Barthen.", ALL),
    r("toblen_stonehill", ids.ENT_NPC_TOBLEN, ids.ENT_LOC_STONEHILL, "located_in", "Toblen escucha casi todos los rumores del pueblo.", ALL),
    r("trilena_stonehill", ids.ENT_NPC_TRILENA, ids.ENT_LOC_STONEHILL, "located_in", "Trilena ofrece una lectura humana del miedo local.", ALL),
    r("harbin_townmaster", ids.ENT_NPC_HARBIN, ids.ENT_LOC_TOWNMASTER, "located_in", "Harbin se esconde detrás de su cargo.", ALL),
    r("harbin_town", ids.ENT_NPC_HARBIN, ids.ENT_FAC_TOWN, "leader_of", "Harbin es la autoridad oficial del pueblo, aunque no inspira confianza.", ALL),
    r("halia_miners", ids.ENT_NPC_HALIA, ids.ENT_LOC_MINERS_EXCHANGE, "located_in", "Halia opera desde el Intercambio de Mineros.", ALL),
    r("halia_zhentarim", ids.ENT_NPC_HALIA, ids.ENT_FAC_ZHENTARIM, "member_of", "Halia tiene contactos Zhentarim que no comparte con la mesa de entrada.", DM),
    r("daran_edermath", ids.ENT_NPC_DARAN, ids.ENT_LOC_EDERMATH, "located_in", "Daran observa el pueblo desde su huerto.", ALL),
    r("daran_order", ids.ENT_NPC_DARAN, ids.ENT_FAC_ORDER_GAUNTLET, "member_of", "Daran representa una respuesta ética y marcial al abuso.", ALL),
    r("garaele_shrine", ids.ENT_NPC_GARAELE, ids.ENT_LOC_SHRINE, "located_in", "Garaele atiende el Santuario de la Suerte.", ALL),
    r("qelline_alderleaf", ids.ENT_NPC_QELLINE, ids.ENT_LOC_ALDERLEAF, "located_in", "Qelline y Carp dan al grupo un hogar seguro.", ALL),
    r("carp_qelline", ids.ENT_NPC_CARP, ids.ENT_NPC_QELLINE, "family_of", "Carp es hijo de Qelline y una voz inocente pero útil.", ALL),
    r("linene_lionshield", ids.ENT_NPC_LINENE, ids.ENT_LOC_LIONSHIELD, "located_in", "Linene dirige el puesto Lionshield.", ALL),
    r("grista_sleeping_giant", ids.ENT_NPC_GRISTA, ids.ENT_LOC_SLEEPING_GIANT, "located_in", "Grista está cerca de los Redbrands aunque no sea su jefa.", ALL),
    r("mirna_dendrar_tresendar", ids.ENT_NPC_MIRNA, ids.ENT_LOC_TRESENDAR, "hides", "Mirna puede estar retenida en los sótanos de Tresendar.", DM),

    // Redbrand structure
    r("redbrands_tresendar", ids.ENT_FAC_REDBRANDS, ids.ENT_LOC_TRESENDAR, "hides", "Los Redbrands usan los sótanos de la Mansión Tresendar.", ALL),
    r("redbrands_sleeping_giant", ids.ENT_FAC_REDBRANDS, ids.ENT_LOC_SLEEPING_GIANT, "appears_in", "El Gigante Dormido es su fachada social más visible.", ALL),
    r("redbrand_threats_quest", ids.ENT_CLUE_REDBRAND_THREATS, ids.ENT_Q_REDBRANDS, "unlocks", "Las amenazas visibles activan el arco urbano.", ALL),
    r("town_fears_redbrands", ids.ENT_CLUE_TOWN_FEARS, ids.ENT_FAC_REDBRANDS, "points_to", "El miedo cotidiano señala el control Redbrand.", ALL),
    r("carp_tunnel_tresendar", ids.ENT_CLUE_CARP_TUNNEL, ids.ENT_LOC_TRESENDAR, "points_to", "La pista de Carp ofrece entrada secundaria a Tresendar.", ALL),
    r("sleeping_boast_nothic", ids.ENT_CLUE_SLEEPING_GIANT_BOAST, ids.ENT_NPC_NOTHIC, "points_to", "La bravuconada prepara la presencia de algo que ve sin ventanas.", DM),
    r("ledger_redbrands", ids.ENT_CLUE_RED_BRAND_LEDGER, ids.ENT_FAC_REDBRANDS, "confirms", "El libro muestra que la banda gobierna con cuentas y favores.", DM),
    r("ledger_halia", ids.ENT_CLUE_RED_BRAND_LEDGER, ids.ENT_NPC_HALIA, "points_to", "El libro permite matizar hasta dónde llega la influencia de Halia.", DM),
    r("glasstaff_alias_iarno", ids.ENT_NPC_GLASSTAFF_ALIAS, ids.ENT_NPC_IARNO, "custom:alias_of", "Glasstaff es la máscara criminal de Iarno.", DM),
    r("iarno_redbrands", ids.ENT_NPC_IARNO, ids.ENT_FAC_REDBRANDS, "leader_of", "Iarno dirige a los Redbrands como Glasstaff.", DM),
    r("glasstaff_redbrands", ids.ENT_NPC_GLASSTAFF_ALIAS, ids.ENT_FAC_REDBRANDS, "leader_of", "El alias Glasstaff sostiene la obediencia de los matones.", DM),
    r("iarno_tresendar", ids.ENT_NPC_IARNO, ids.ENT_LOC_TRESENDAR, "located_in", "Iarno trabaja desde el laboratorio de Tresendar.", DM),
    r("nothic_tresendar", ids.ENT_NPC_NOTHIC, ids.ENT_LOC_TRESENDAR, "located_in", "El nothic habita bajo la mansión y altera el tono del dungeon.", DM),
    r("nothic_whispers_secret", ids.ENT_CLUE_NOTHIC_WHISPERS, ids.ENT_SEC_NOTHIC_HUNGER, "confirms", "Los susurros explican que el nothic puede ser fuente de secretos.", DM),
    r("dendrar_rescue_mirna", ids.ENT_Q_DENDRAR_RESCUE, ids.ENT_NPC_MIRNA, "depends_on", "Salvar a Mirna convierte la liberación de Phandalin en algo personal.", ALL),
    r("mirna_heirloom_thundertree", ids.ENT_CLUE_MIRNA_HEIRLOOM, ids.ENT_LOC_THUNDERTREE, "points_to", "Mirna puede abrir el hilo de Thundertree como recompensa emocional.", DM),

    // Cragmaw structure
    r("cragmaw_hideout", ids.ENT_FAC_CRAGMAW, ids.ENT_LOC_CRAGMAW_HIDEOUT, "appears_in", "La primera cara del clan aparece en la guarida del arroyo.", ALL),
    r("klarg_hideout", ids.ENT_NPC_KLARG, ids.ENT_LOC_CRAGMAW_HIDEOUT, "located_in", "Klarg domina la guarida del arroyo.", DM),
    r("yeemik_hideout", ids.ENT_NPC_YEEMIK, ids.ENT_LOC_CRAGMAW_HIDEOUT, "located_in", "Yeemik puede negociar desde la guarida.", DM),
    r("yeemik_klarg", ids.ENT_NPC_YEEMIK, ids.ENT_NPC_KLARG, "enemy_of", "Yeemik puede traicionar a Klarg si ve ventaja.", DM),
    r("cragmaw_castle", ids.ENT_FAC_CRAGMAW, ids.ENT_LOC_CRAGMAW_CASTLE, "appears_in", "El castillo muestra la estructura superior del clan.", DM),
    r("grol_cragmaw", ids.ENT_NPC_GROL, ids.ENT_FAC_CRAGMAW, "leader_of", "Grol manda sobre la facción Cragmaw que retiene información crítica.", DM),
    r("grol_castle", ids.ENT_NPC_GROL, ids.ENT_LOC_CRAGMAW_CASTLE, "located_in", "Grol gobierna desde el castillo oculto.", DM),
    r("vyerith_castle", ids.ENT_NPC_VYERITH, ids.ENT_LOC_CRAGMAW_CASTLE, "appears_in", "Vyerith puede aparecer en el castillo bajo una identidad falsa.", DM),
    r("gundren_castle", ids.ENT_NPC_GUNDREN, ids.ENT_LOC_CRAGMAW_CASTLE, "located_in", "Gundren puede estar retenido en el castillo cuando el grupo llegue.", DM),
    r("cragmaw_ransom_gundren", ids.ENT_CLUE_CRAGMAW_RANSOM, ids.ENT_NPC_GUNDREN, "points_to", "El rescate confirma que Gundren vale vivo por el mapa.", DM),
    r("grol_bargain_secret", ids.ENT_CLUE_GROL_BARGAIN, ids.ENT_SEC_CRAGMAW_BARGAIN, "confirms", "Grol permite explotar divisiones del clan.", DM),
    r("castle_marks_castle", ids.ENT_CLUE_CASTLE_MARKS, ids.ENT_LOC_CRAGMAW_CASTLE, "unlocks", "Las marcas permiten convertir rumores en ruta jugable.", DM),
    r("vyerith_disguise_secret", ids.ENT_CLUE_VYERITH_DISGUISE, ids.ENT_SEC_VYERITH_DOPPELGANGER, "confirms", "Los detalles raros permiten descubrir la infiltración.", DM),

    // Black Spider network and Wave Echo
    r("nezznar_iarno", ids.ENT_NPC_NEZZNAR, ids.ENT_NPC_IARNO, "leader_of", "La Araña Negra usa a Glasstaff como agente urbano.", DM),
    r("nezznar_cragmaw", ids.ENT_NPC_NEZZNAR, ids.ENT_FAC_CRAGMAW, "custom:manipulates", "Nezznar presiona al clan Cragmaw para controlar prisioneros y mapas.", DM),
    r("nezznar_vyerith", ids.ENT_NPC_NEZZNAR, ids.ENT_NPC_VYERITH, "leader_of", "Vyerith actúa como agente flexible de la Araña Negra.", DM),
    r("spider_sigils_nezznar", ids.ENT_CLUE_SPIDER_SIGIL, ids.ENT_SEC_NEZZNAR, "points_to", "El sello de araña une órdenes, pagos y violencia regional.", DM),
    r("glasstaff_letter_iarno", ids.ENT_CLUE_GLASSTAFF_LETTER, ids.ENT_SEC_IARNO_GLASSTAFF, "confirms", "La carta revela que Glasstaff e Iarno son la misma pieza del tablero.", DM),
    r("nezznar_wave_echo", ids.ENT_NPC_NEZZNAR, ids.ENT_LOC_WAVE_ECHO, "points_to", "La Araña Negra quiere controlar la mina perdida.", DM),
    r("rockseekers_wave_echo", ids.ENT_FAC_ROCKSEEKER, ids.ENT_LOC_WAVE_ECHO, "points_to", "Los Rockseeker buscan reabrir la mina perdida.", DM),
    r("wave_echo_forge", ids.ENT_LOC_WAVE_ECHO, ids.ENT_LOC_FORGE_OF_SPELLS, "contains", "La Forja de Conjuros es el corazón de Wave Echo.", DM),
    r("forge_echo_secret", ids.ENT_CLUE_FORGE_ECHO, ids.ENT_SEC_FORGE_REAL, "confirms", "El eco mágico confirma que la forja no es solo una leyenda minera.", DM),
    r("mine_map_secret", ids.ENT_CLUE_MINE_MAP, ids.ENT_SEC_GUNDREN_MAP, "confirms", "El mapa de Gundren demuestra que la mina puede encontrarse.", DM),
    r("mine_map_wave_echo", ids.ENT_CLUE_MINE_MAP, ids.ENT_LOC_WAVE_ECHO, "unlocks", "El mapa desbloquea la ruta hacia Wave Echo.", DM),
    r("nundro_wave_echo", ids.ENT_NPC_NUNDRO, ids.ENT_LOC_WAVE_ECHO, "appears_in", "Nundro puede confirmar qué ocurrió en la mina.", DM),
    r("nundro_testimony_nezznar", ids.ENT_CLUE_NUNDRO_TESTIMONY, ids.ENT_SEC_NEZZNAR, "confirms", "Nundro puede confirmar la presencia de la Araña Negra.", DM),
    r("tharden_body_secret", ids.ENT_CLUE_THARDEN_BODY, ids.ENT_SEC_THARDEN_DEAD, "confirms", "El destino de Tharden convierte la mina en tragedia familiar.", DM),
    r("tharden_wave_echo", ids.ENT_NPC_THARDEN, ids.ENT_LOC_WAVE_ECHO, "appears_in", "Tharden queda ligado al coste final de Wave Echo.", DM),

    // Side fronts and allies
    r("recover_lionshield_linene", ids.ENT_Q_RECOVER_LIONSHIELD, ids.ENT_NPC_LINENE, "depends_on", "Linene ofrece una misión económica clara.", ALL),
    r("cargo_marks_lionshield", ids.ENT_CLUE_LINENE_CARGO_MARKS, ids.ENT_Q_RECOVER_LIONSHIELD, "unlocks", "Las marcas del cargamento dan dirección a la misión de Linene.", ALL),
    r("harbin_notice_sidequests", ids.ENT_CLUE_HARBIN_NOTICE, ids.ENT_LOC_TOWNMASTER, "located_in", "Los anuncios del concejo están físicamente en la oficina de Harbin.", ALL),
    r("harbin_notice_wyvern", ids.ENT_CLUE_HARBIN_NOTICE, ids.ENT_Q_WYVERN_TOR, "unlocks", "El tablón puede enviar al grupo hacia el Tor del Guiverno.", ALL),
    r("harbin_notice_old_owl", ids.ENT_CLUE_HARBIN_NOTICE, ids.ENT_Q_OLD_OWL_WELL, "unlocks", "El tablón también permite abrir el Viejo Pozo del Búho.", ALL),
    r("daran_report_redbrands", ids.ENT_CLUE_DARAN_REPORT, ids.ENT_Q_REDBRANDS, "points_to", "Daran puede enfocar la amenaza Redbrand como problema organizado.", ALL),
    r("garaele_agatha", ids.ENT_NPC_GARAELE, ids.ENT_Q_AGATHA, "unlocks", "Garaele puede pedir una pregunta para Agatha.", ALL),
    r("agatha_lair_presence", ids.ENT_NPC_AGATHA, ids.ENT_LOC_AGATHA_LAIR, "located_in", "Agatha habita su morada y domina el tono del encuentro.", DM),
    r("agatha_conyberry", ids.ENT_LOC_AGATHA_LAIR, ids.ENT_LOC_CONYBERRY, "custom:near", "La morada de Agatha se alcanza desde las ruinas de Conyberry.", DM),
    r("agatha_memory_secret", ids.ENT_CLUE_AGATHA_MEMORY, ids.ENT_SEC_AGATHA_KNOWS, "confirms", "La memoria de Agatha confirma que puede responder más de una cosa si se pregunta bien.", DM),
    r("old_owl_well_hamun", ids.ENT_NPC_HAMUN, ids.ENT_LOC_OLD_OWL_WELL, "located_in", "Hamun Kost investiga el Viejo Pozo del Búho.", DM),
    r("old_owl_signs_hamun", ids.ENT_CLUE_OLD_OWL_SIGNS, ids.ENT_NPC_HAMUN, "points_to", "Las señales arcanas apuntan a Hamun sin convertirlo automáticamente en enemigo final.", ALL),
    r("hamun_secret", ids.ENT_CLUE_OLD_OWL_SIGNS, ids.ENT_SEC_HAMUN_NOT_PRIMARY, "points_to", "El pozo enseña que no todo hilo extraño pertenece a la Araña Negra.", DM),
    r("wyvern_tor_brughor", ids.ENT_NPC_BRUGHOR, ids.ENT_LOC_WYVERN_TOR, "located_in", "Brughor dirige los asaltos desde el Tor del Guiverno.", DM),
    r("wyvern_orcs_brughor", ids.ENT_NPC_BRUGHOR, ids.ENT_FAC_WYVERN_ORCS, "leader_of", "Brughor lidera a los orcos locales.", DM),
    r("wyvern_raids_quest", ids.ENT_CLUE_WYVERN_TOR_RAIDS, ids.ENT_Q_WYVERN_TOR, "unlocks", "Los rastros de asalto activan la misión del Tor.", ALL),
    r("wyvern_pressure_secret", ids.ENT_CLUE_WYVERN_TOR_RAIDS, ids.ENT_SEC_WYVERN_ORCS_PRESSURE, "points_to", "Los asaltos crecen si Phandalin parece indefenso.", DM),
    r("reidoth_thundertree", ids.ENT_NPC_REIDOTH, ids.ENT_LOC_THUNDERTREE, "located_in", "Reidoth puede encontrarse en las ruinas de Thundertree.", DM),
    r("reidoth_enclave", ids.ENT_NPC_REIDOTH, ids.ENT_FAC_EMERALD_ENCLAVE, "member_of", "Reidoth representa la mirada del Enclave Esmeralda.", DM),
    r("reidoth_warning_thundertree", ids.ENT_CLUE_REIDOTH_WARNING, ids.ENT_Q_THUNDERTREE, "unlocks", "Reidoth permite convertir Thundertree en una opción informada.", DM),
    r("dragon_signs_venomfang", ids.ENT_CLUE_DRAGON_SIGNS, ids.ENT_NPC_VENOMFANG, "points_to", "Las señales preparan el peligro de Venomfang.", DM),
    r("venomfang_thundertree", ids.ENT_NPC_VENOMFANG, ids.ENT_LOC_THUNDERTREE, "located_in", "Venomfang reclama parte de Thundertree como territorio.", DM),
    r("ash_zombies_thundertree", ids.ENT_FAC_ASH_ZOMBIES, ids.ENT_LOC_THUNDERTREE, "appears_in", "Los muertos de ceniza hacen de Thundertree un lugar hostil incluso sin dragón.", DM),
    r("dragon_manipulates_secret", ids.ENT_CLUE_DRAGON_SIGNS, ids.ENT_SEC_VENOMFANG_MANIPULATES, "points_to", "El dragón deja pistas de presencia y de inteligencia estratégica.", DM),

    // Secret anchors not already covered above
    r("anchor_castle", ids.ENT_CLUE_CASTLE_MARKS, ids.ENT_SEC_CASTLE_LOCATION, "unlocks", "Las marcas hacia el castillo desbloquean la localización oculta.", DM),
    r("anchor_halia", ids.ENT_CLUE_HALIA_OFFER, ids.ENT_SEC_HALIA_AMBITION, "points_to", "La oferta de Halia muestra que su ayuda tiene intención política.", DM),
    r("anchor_harbin", ids.ENT_CLUE_TOWN_FEARS, ids.ENT_SEC_HARBIN_COWARDICE, "points_to", "El miedo del pueblo apunta a la pasividad interesada del alcalde.", DM),
    r("anchor_cragmaw", ids.ENT_CLUE_GOBLIN_TRAIL, ids.ENT_SEC_CRAGMAW_BARGAIN, "points_to", "El rastro revela una estructura goblin imperfecta y negociable.", DM),
    r("anchor_dendrars", ids.ENT_CLUE_MIRNA_HEIRLOOM, ids.ENT_SEC_DENDRARS_ALIVE, "confirms", "El recuerdo de Mirna confirma que rescatar personas abre futuro, no solo botín.", DM),
    r("anchor_hostages", ids.ENT_CLUE_RED_BRAND_LEDGER, ids.ENT_SEC_REDBRAND_HOSTAGES, "points_to", "El libro de deudas sugiere traslado de rehenes si la presión aumenta.", DM),
    r("anchor_power_vacuum", ids.ENT_CLUE_PHANDALIN_POWER_VACUUM, ids.ENT_SEC_PHANDALIN_POWER_VACUUM, "confirms", "La pista de vacío de poder prepara el epílogo político.", DM),

    // Quest progression
    r("rescue_castle", ids.ENT_Q_RESCUE_GUNDREN, ids.ENT_Q_FIND_CASTLE, "unlocks", "Rescatar a Sildar y seguir goblins abre la búsqueda del castillo.", DM),
    r("redbrands_dendrar", ids.ENT_Q_REDBRANDS, ids.ENT_Q_DENDRAR_RESCUE, "contains", "El arco Redbrand incluye la liberación de rehenes concretos.", ALL),
    r("redbrands_power_vacuum", ids.ENT_Q_REDBRANDS, ids.ENT_Q_FUTURE_PHANDALIN, "unlocks", "La caída de los Redbrands abre la pregunta política de Phandalin.", DM),
    r("castle_wave", ids.ENT_Q_FIND_CASTLE, ids.ENT_Q_WAVE_ECHO, "unlocks", "El castillo debe revelar el mapa o la ubicación de la mina.", DM),
    r("wave_spider", ids.ENT_Q_WAVE_ECHO, ids.ENT_Q_BLACK_SPIDER, "enemy_of", "La mina lleva al enfrentamiento final con la Araña Negra.", DM),
    r("spider_future", ids.ENT_Q_BLACK_SPIDER, ids.ENT_Q_FUTURE_PHANDALIN, "unlocks", "Derrotar a la Araña Negra no decide automáticamente quién gobernará el hallazgo.", DM),

    // Player character hooks
    r("aric_redbrands", ids.ENT_PC_ARIC, ids.ENT_Q_REDBRANDS, "points_to", "Aric entiende la intimidación Redbrand como abuso de fuerza contra débiles.", ALL),
    r("mira_tresendar", ids.ENT_PC_MIRA, ids.ENT_LOC_TRESENDAR, "points_to", "Mira puede brillar con entradas secretas, cerraduras y deudas ocultas.", ALL),
    r("brom_rockseeker", ids.ENT_PC_BROM, ids.ENT_FAC_ROCKSEEKER, "ally_of", "Brom conecta con la dimensión artesanal y familiar de los Rockseeker.", ALL),
    r("nim_forge", ids.ENT_PC_NIM, ids.ENT_LOC_FORGE_OF_SPELLS, "points_to", "Nimue tiene un motivo claro para investigar la resonancia mágica de la mina.", ALL),
  ];

  const unique = new Set<string>();
  for (const relation of RELATIONS) {
    const key = `${relation.source}|${relation.target}|${relation.type}`;
    if (unique.has(key)) throw new Error(`Duplicate relation edge in Phandalin seed: ${key}`);
    unique.add(key);
    await api("POST", `/api/campaigns/${CMP}/relations`, {
      actorId: "usr_dm",
      relationId: relation.id,
      sourceEntityId: relation.source,
      targetEntityId: relation.target,
      relationType: relation.type,
      description: relation.description,
      visibility: relation.visibility ?? DM,
    });
  }
  console.log(`✓ ${RELATIONS.length} relations created`);
}
