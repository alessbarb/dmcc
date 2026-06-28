import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

export async function seedQuests() {
  const party = { kind: "party" as const };
  const dm = { kind: "dm_only" as const };
  const QUESTS = [
    { entityId: ids.ENT_Q_ESCORT, title: "Entregar las provisiones", subtitle: "Entrada a la campaña", summary: "Llevar la carreta de Gundren hasta Phandalin y descubrir por qué él no llegó antes.", status: "completed", importance: "high", visibility: party, metadata: { successState: "Las provisiones llegan y el grupo gana un punto de anclaje social en Barthen." } },
    { entityId: ids.ENT_Q_RESCUE_GUNDREN, title: "Rescatar a Gundren", subtitle: "Misión principal", summary: "Seguir la pista de goblins, compradores ocultos y rutas falsas hasta encontrar al patrón desaparecido.", status: "active", importance: "critical", visibility: party, metadata: { failurePressure: "Si el grupo se demora, Grol vende o pierde el mapa." } },
    { entityId: ids.ENT_Q_REDBRANDS, title: "Romper el dominio Redbrand", subtitle: "Amenaza urbana", summary: "Investigar la banda que intimida Phandalin y decidir si atacar, negociar, exponerla o decapitar su liderazgo.", status: "active", importance: "critical", visibility: party, metadata: { decision: "¿Justicia pública, golpe quirúrgico o pacto sucio?" } },
    { entityId: ids.ENT_Q_DENDRAR_RESCUE, title: "Salvar a la familia Dendrar", subtitle: "Coste humano del miedo", summary: "Localizar a Mirna y sus hijos antes de que los Redbrands los vendan, trasladen o usen como escudo.", status: "available", importance: "high", visibility: party, metadata: { comfort: "Una misión emocionalmente clara para jugadores que necesitan una razón concreta." } },
    { entityId: ids.ENT_Q_FIND_CASTLE, title: "Encontrar el Castillo Cragmaw", subtitle: "Búsqueda de ubicación", summary: "Convertir rumores, marcas de ruta y testimonios en una ruta clara hacia la fortaleza oculta.", status: "pending", importance: "critical", visibility: dm, metadata: { unlocks: "Castillo Cragmaw, rescate de Gundren, recuperación del mapa." } },
    { entityId: ids.ENT_Q_WAVE_ECHO, title: "Llegar a la Cueva del Eco de la Ola", subtitle: "Mina perdida", summary: "Proteger el mapa, localizar la entrada y decidir quién controla el descubrimiento.", status: "hidden", importance: "critical", visibility: dm, metadata: { decision: "¿La mina se entrega, se protege, se explota o se oculta?" } },
    { entityId: ids.ENT_Q_BLACK_SPIDER, title: "Desenmascarar a la Araña Negra", subtitle: "Arco antagonista", summary: "Reunir pistas suficientes para entender quién está comprando favores, cadáveres y silencios en la región.", status: "hidden", importance: "critical", visibility: dm, metadata: { revealPlan: "Nombre tarde; símbolo pronto; consecuencias desde el principio." } },
    { entityId: ids.ENT_Q_RECOVER_LIONSHIELD, title: "Recuperar el cargamento Lionshield", subtitle: "Economía en peligro", summary: "Rastrear mercancías robadas para que el pueblo vea beneficios tangibles por ayudar al grupo.", status: "available", importance: "normal", visibility: party, metadata: { reward: "Equipo, crédito local y confianza de Linene." } },
    { entityId: ids.ENT_Q_AGATHA, title: "Preguntar a Agatha", subtitle: "Información peligrosa", summary: "Conseguir una respuesta de la banshee sin convertir el encuentro en una provocación absurda.", status: "available", importance: "normal", visibility: party, metadata: { tone: "Cortesía, ofrenda y una sola pregunta realmente buena." } },
    { entityId: ids.ENT_Q_OLD_OWL_WELL, title: "Investigar el Viejo Pozo del Búho", subtitle: "Ruina arcana", summary: "Descubrir por qué hay muertos caminando cerca del viejo pozo y si Hamun Kost es amenaza, síntoma o posible fuente.", status: "available", importance: "normal", visibility: party, metadata: { twist: "No todo mago con esqueletos es el villano central." } },
    { entityId: ids.ENT_Q_WYVERN_TOR, title: "Expulsar a los orcos del Tor del Guiverno", subtitle: "Frontera bajo presión", summary: "Resolver los asaltos que ponen nerviosos a granjeros y caravanas.", status: "available", importance: "normal", visibility: party, metadata: { useWhen: "Necesitas una sesión de acción clara o recordar que el mundo avanza fuera del pueblo." } },
    { entityId: ids.ENT_Q_THUNDERTREE, title: "Tratar con Thundertree", subtitle: "Riesgo mayor", summary: "Buscar a Reidoth, evitar a los muertos de ceniza y decidir si conviene acercarse a un dragón joven.", status: "hidden", importance: "high", visibility: dm, metadata: { warning: "No lo presentes como reto obligatorio; debe sentirse opcional y peligroso." } },
    { entityId: ids.ENT_Q_FUTURE_PHANDALIN, title: "Decidir el futuro de Phandalin", subtitle: "Consecuencia de campaña", summary: "Tras la caída de Redbrands y Cragmaw, el grupo debe decidir a quién fortalece: vecinos, Halia, Alianza, Rockseeker o nadie.", status: "hidden", importance: "critical", visibility: dm, metadata: { finaleUse: "Cierra la campaña como consecuencia social, no solo con tesoro." } },
  ];

  for (const quest of QUESTS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { actorId: "usr_dm", entityType: "quest", ...quest });
  }
  console.log(`✓ ${QUESTS.length} quests created`);
}
