// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

// ---------------------------------------------------------------------------
// Facts
// ---------------------------------------------------------------------------

export async function seedFacts() {
  const DM   = { kind: "dm_only" as const };
  const ALL  = { kind: "party"   as const };
  const SRC  = { kind: "manual"  as const };

  const FACTS = [
    // Rumores y mentiras plantados por el culto
    { 
      statement: "Se rumorea que el Oráculo predijo con años de antelación la gran plaga y posterior colapso del reino del este. Los fieles usan esto como prueba incuestionable de su divinidad.", 
      kind: "lie" as const, 
      confidence: "confirmed" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_NPC_VERADIS], 
      source: SRC 
    },
    { 
      statement: "Se susurra entre la plebe que aquellos que alzan la voz contra el Oráculo atraen de inmediato la desgracia y enfermedades terribles sobre sus familias.", 
      kind: "rumor" as const, 
      confidence: "suspected" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_NPC_VERADIS, ids.ENT_FAC_CULTO], 
      source: SRC 
    },
    { 
      statement: "El clero del Oráculo predica activamente en las plazas que el Templo de la Verdad es una secta herética y peligrosa que adora a demonios del engaño.", 
      kind: "lie" as const, 
      confidence: "suspected" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_FAC_TEMPLO_VERDAD, ids.ENT_NPC_SERA], 
      source: SRC 
    },
    { 
      statement: "Los mercaderes del Consorcio afirman que el Gremio de Ladrones controla por completo el contrabando del puerto y extorsiona a los pequeños boticas.", 
      kind: "rumor" as const, 
      confidence: "suspected" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_FAC_GREMIO, ids.ENT_NPC_KAEL], 
      source: SRC 
    },
    { 
      statement: "Existe el rumor en los barracones de que cualquier oficial de la guardia municipal que intente auditar las finanzas del templo acaba destituido por orden del Consejo.", 
      kind: "rumor" as const, 
      confidence: "suspected" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_NPC_LYRA, ids.ENT_FAC_CULTO], 
      source: SRC 
    },
    // Canon público
    { 
      statement: "El Oráculo concede audiencias públicas los martes y viernes. La entrada requiere el pago de una tasa obligatoria de diez monedas de oro de ofrenda.", 
      kind: "canon" as const, 
      confidence: "confirmed" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_NPC_VERADIS, ids.ENT_LOC_SALA_ORACULO], 
      source: SRC 
    },
    { 
      statement: "El Archivo Municipal sufrió un devastador incendio hace exactamente veinte años, reduciendo a cenizas los registros de nacimiento y defunción de la orden antigua.", 
      kind: "canon" as const, 
      confidence: "confirmed" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_LOC_ARCHIVO, ids.ENT_NPC_MIRA], 
      source: SRC 
    },
    { 
      statement: "Lord Vantis consolidó su posición como el aristócrata más rico e influyente de Valdris tras adquirir el monopolio de las rutas comerciales de especias hace siete años.", 
      kind: "canon" as const, 
      confidence: "confirmed" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_NPC_VANTIS], 
      source: SRC 
    },
    { 
      statement: "La Capitana Lyra Stonehaven y sus hombres han estado investigando desapariciones periódicas de estibadores en los muelles sin haber publicado un informe oficial.", 
      kind: "canon" as const, 
      confidence: "likely" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_NPC_LYRA], 
      source: SRC 
    },
    { 
      statement: "La Taberna del Cuervo es célebre entre marineros e informadores por ser un espacio donde el Gremio asegura la discreción y prohíbe las peleas físicas.", 
      kind: "canon" as const, 
      confidence: "confirmed" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_NPC_TORBEN, ids.ENT_LOC_TABERNA_CUERVO], 
      source: SRC 
    },
    // Secretos del DM
    { 
      statement: "Veradis es en realidad Jack Corvo, un astuto mago ilusionista. Sus visiones proféticas son invenciones completas sostenidas por magia de engaño.", 
      kind: "dm_secret" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_VERADIS, ids.ENT_SEC_ORACLE_FRAUD], 
      source: SRC 
    },
    { 
      statement: "Lord Vantis financia secretamente las operaciones y la seguridad del culto a cambio de que el Oráculo emita profecías redactadas para diezmar a sus competidores.", 
      kind: "dm_secret" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_VANTIS, ids.ENT_SEC_VANTIS_FUNDING], 
      source: SRC 
    },
    { 
      statement: "La Maga Senra es el verdadero motor del fraude. Si ella rompe la sintonía del cristal negro de resonancia arcana, la voz divina se apagará de inmediato.", 
      kind: "dm_secret" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_SENRA, ids.ENT_CLUE_FORGERY_TOOL], 
      source: SRC 
    },
    { 
      statement: "Dorian Vex interceptó el diario de investigación de la Capitana Lyra y le vendió copias de las notas al Inquisidor Mors a cambio de favores arancelarios.", 
      kind: "dm_secret" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_DORIAN, ids.ENT_NPC_LYRA, ids.ENT_FAC_CULTO], 
      source: SRC 
    },
    { 
      statement: "El Consejero Brann descubrió el acuerdo clandestino entre Vantis y el templo, pero aceptó sobornos comerciales a cambio de mantener el asunto archivado.", 
      kind: "dm_secret" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_CONSEJERO_BRANN, ids.ENT_NPC_VANTIS], 
      source: SRC 
    },
    // Espacio para teorías de jugadores
    { 
      statement: "[Teoría]: El Oráculo podría no ser un mortal común, sino una entidad sobrenatural ancestral de la costa que consume la fe de los devotos.", 
      kind: "player_theory" as const, 
      confidence: "unconfirmed" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_NPC_VERADIS], 
      source: SRC 
    },
    { 
      statement: "[Teoría]: La Capitana Lyra podría estar retrasando intencionadamente la investigación para proteger a algún familiar implicado en la guardia municipal.", 
      kind: "player_theory" as const, 
      confidence: "unconfirmed" as const, 
      visibility: ALL, 
      relatedEntityIds: [ids.ENT_NPC_LYRA], 
      source: SRC 
    },
    // Sin confirmar
    { 
      statement: "Alguien de la corte o de los intermediarios habituales de los aventureros está filtrando sistemáticamente sus planes al Inquisidor Mors.", 
      kind: "unknown" as const, 
      confidence: "suspected" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_DORIAN], 
      source: SRC 
    },
    { 
      statement: "La magnitud del fraude del Oráculo abarca cientos de testimonios y los registros de la Bóveda podrían sacudir los cimientos de toda la región.", 
      kind: "unknown" as const, 
      confidence: "suspected" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_SEC_PROPHECY_COUNT], 
      source: SRC 
    },
    // Retcon
    { 
      statement: "Retcon: El rumor de que el Oráculo predijo la plaga del este fue en realidad una mentira fabricada y difundida por los heraldos del templo.", 
      kind: "retcon" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_VERADIS], 
      source: SRC 
    },
    // Consecuencias documentadas
    { 
      statement: "Asha la Viuda acaba de entregar sus últimos ahorros en el templo para recibir una profecía falsa sobre su hijo, ignorando que él ya ha fallecido.", 
      kind: "canon" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_PETICIONARIO, ids.ENT_NPC_VERADIS, ids.ENT_SEC_WIDOW_SON], 
      source: SRC 
    },
    { 
      statement: "Cuatro comerciantes de pescado que denunciaron ante la guardia la importación irregular de materiales arcanos han desaparecido en extrañas circunstancias.", 
      kind: "canon" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_FAC_CULTO, ids.ENT_LOC_PUERTO, ids.ENT_Q_SANGRE_PUERTO], 
      source: SRC 
    },
    { 
      statement: "El incendio provocado del archivo destruyó la genealogía oficial de los videntes, permitiendo al impostor suplantar a Veradis Thorn sin levantar sospechas.", 
      kind: "dm_secret" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_LOC_ARCHIVO, ids.ENT_NPC_MIRA, ids.ENT_SEC_ARCHIVE_FIRE], 
      source: SRC 
    },
    { 
      statement: "La Consejera Lena Marsh está buscando discretamente apoyos entre los oficiales leales a Lyra para proponer una votación de auditoría en el Consejo.", 
      kind: "canon" as const, 
      confidence: "likely" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_CONSEJERA_LENA], 
      source: SRC 
    },
    { 
      statement: "El volumen de las Crónicas del Verdadero Vidente en manos de Sera Moonwhisper es una reliquia auténtica de 300 años de antigüedad que expone las falacias teológicas.", 
      kind: "dm_secret" as const, 
      confidence: "confirmed" as const, 
      visibility: DM, 
      relatedEntityIds: [ids.ENT_NPC_SERA, ids.ENT_CLUE_SERA_TEXTS], 
      source: SRC 
    },
  ];

  for (const f of FACTS) {
    await api("POST", `/api/campaigns/${CMP}/facts`, { ...f, actorId: "usr_dm" });
  }
  console.log(`✓ ${FACTS.length} facts created`);
}
