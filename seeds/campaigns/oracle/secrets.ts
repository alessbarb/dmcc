// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

type RevelationAnchorStrength = "weak" | "medium" | "strong";

type RevelationAnchor = {
  entityId: string;
  trigger: string;
  strength: RevelationAnchorStrength;
  note: string;
};

function revealAnchors(anchors: RevelationAnchor[]) {
  return {
    revelationAnchorIds: anchors.map((anchor) => anchor.entityId),
    revelationAnchors: anchors,
  };
}

// ---------------------------------------------------------------------------
// Secrets
// ---------------------------------------------------------------------------

export async function seedSecrets() {
  const SECRETS = [
    { 
      entityId: ids.ENT_SEC_ORACLE_FRAUD, 
      entityType: "secret", 
      title: "El Oráculo es un fraude", 
      summary: "Veradis lleva 20 años falsificando profecías.", 
      status: "active", 
      importance: "critical", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        graphAnchor: "main_secret",
        truth: "El Oráculo no posee poderes sobrenaturales ni don de profecía. Es Jack Corvo, un astuto ilusionista exiliado de la capital que simula los milagros mediante un cristal arcano.", 
        impact: "Toda la legitimidad política del Consejo y del Magister Aldric depende del Oráculo. Su caída provocará una crisis de fe y la posible destitución del gobierno local.",
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_PROPHECY_TEXT, trigger: "Al comparar el texto con registros antiguos, los errores de estilo delatan una falsificación.", strength: "medium", note: "Primera grieta pública del caso." },
          { entityId: ids.ENT_CLUE_FALSE_PROPHECY_AUDIO, trigger: "El residuo mágico de la voz prueba que la profecía fue proyectada.", strength: "strong", note: "Prueba técnica de manipulación." },
          { entityId: ids.ENT_CLUE_VAULT_RECORDS, trigger: "Los registros de la bóveda documentan cientos de profecías fabricadas.", strength: "strong", note: "Prueba definitiva del fraude." },
          { entityId: ids.ENT_CLUE_FINAL_TRUTH, trigger: "La identidad real de Veradis Thorn desmonta la legitimidad del impostor.", strength: "strong", note: "Revelación final." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_VANTIS_FUNDING, 
      entityType: "secret", 
      title: "Lord Vantis financia el culto", 
      summary: "Paga al Oráculo a cambio de profecías económicamente favorables.", 
      status: "active", 
      importance: "critical", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "Lord Vantis ha entregado sumas mensuales fijas en plata durante siete años al círculo interno del culto. A cambio, el Oráculo entrega profecías redactadas para sabotear los negocios de sus competidores mercantiles.", 
        impact: "Si se demuestra su implicación, Vantis perderá su asiento en el gremio, todos sus bienes comerciales serán confiscados por alta traición y buscará silenciar físicamente a cualquiera que le investigue.",
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_MERCHANT_PAYMENT, trigger: "Las donaciones anónimas se vinculan con el sello de la Mansión Vantis.", strength: "medium", note: "Indicio financiero temprano." },
          { entityId: ids.ENT_CLUE_GUILD_LEDGER, trigger: "El libro paralelo del Gremio identifica pagos mensuales al círculo interno.", strength: "strong", note: "Prueba contable." },
          { entityId: ids.ENT_CLUE_VAULT_RECORDS, trigger: "La bóveda conserva el archivo maestro de pagos y beneficiarios.", strength: "strong", note: "Confirma escala y beneficiarios." },
          { entityId: ids.ENT_CLUE_VANTIS_CONFESSION, trigger: "Vantis confiesa al ser confrontado con su propia contabilidad.", strength: "strong", note: "Confesión directa." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_DIVINE_VOICE, 
      entityType: "secret", 
      title: "La voz divina es una ilusión arcana", 
      summary: "Lo que los peticionarios oyen es una proyección ilusoria mantenida por una técnica especializada.", 
      status: "active", 
      importance: "critical", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "La supuesta voz divina proyectada en el Sanctum proviene de una cámara de control adyacente equipada con espejos arcanos y operada en secreto por la Maga Senra.", 
        revealConditions: ["Detectar magia en el Sanctum durante la profecía", "Interceptar a la Maga Senra en su taller de ilusiones", "Hallar los componentes y diagramas mecánicos de la proyección"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_ARCANE_COMPONENT, trigger: "Los componentes ocultos tras el altar explican cómo se fabrica la voz.", strength: "strong", note: "Prueba física." },
          { entityId: ids.ENT_CLUE_FALSE_PROPHECY_AUDIO, trigger: "La resonancia mágica es incompatible con una voz natural.", strength: "strong", note: "Prueba mágica." },
          { entityId: ids.ENT_CLUE_FORGERY_TOOL, trigger: "El cristal de resonancia revela el mecanismo exacto de la ilusión.", strength: "strong", note: "Objeto clave." },
          { entityId: ids.ENT_CLUE_SERA_TEXTS, trigger: "Las Crónicas describen una técnica similar de falso profeta.", strength: "medium", note: "Marco teológico e histórico." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_LYRA_SUSPECTS, 
      entityType: "secret", 
      title: "La capitana sospecha y tiene miedo", 
      summary: "Lleva meses documentando anomalías pero no tiene pruebas suficientes para actuar.", 
      status: "active", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "La Capitana Lyra ha documentado en su diario personal siete desapariciones vinculadas al culto, pero el Consejo de la Ciudad la ha amenazado con destituirla de su puesto si prosigue con la investigación formal.", 
        revealConditions: ["Ganarse la confianza de Lyra mediante la resolución de la quest de Sangre en el Puerto", "Mostrarle evidencias contables de Lord Vantis"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_LYRA_INVESTIGATION, trigger: "El diario muestra las sospechas de Lyra y las presiones del Consejo.", strength: "strong", note: "Ancla principal del secreto." },
          { entityId: ids.ENT_CLUE_PORT_BODIES, trigger: "Las marcas rituales conectan el puerto con los inquisidores.", strength: "medium", note: "Presiona la subtrama Sangre en el Puerto." },
          { entityId: ids.ENT_CLUE_INNER_CIRCLE_MTG, trigger: "Las minutas prueban que Mors vigila y sabotea la investigación.", strength: "medium", note: "Conecta con el círculo interno." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_KAEL_EVIDENCE, 
      entityType: "secret", 
      title: "El Gremio tiene las pruebas", 
      summary: "El líder del Gremio guarda registros contables como seguro de vida.", 
      status: "active", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "El Gremio de Ladrones posee una copia idéntica del libro contable duplicado de Lord Vantis donde se detallan los pagos de los sobornos inquisitoriales.", 
        revealConditions: ["Cerrar un acuerdo de inmunidad o amnistía comercial con Kael", "Infiltrarse con éxito en las alcantarillas de la guarida del Gremio y saquear su caja fuerte"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_GUILD_LEDGER, trigger: "El libro de cuentas paralelo es la prueba que Kael usa como seguro de vida.", strength: "strong", note: "Ancla principal." },
          { entityId: ids.ENT_CLUE_TORBEN_TIP, trigger: "Torben puede señalar que el Gremio guarda documentos que el culto teme.", strength: "medium", note: "Entrada social hacia Kael." },
          { entityId: ids.ENT_CLUE_MERCHANT_PAYMENT, trigger: "Los pagos sospechosos permiten reconocer la importancia del libro.", strength: "medium", note: "Conecta pista financiera y Gremio." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_ARCHIVE_FIRE, 
      entityType: "secret", 
      title: "El culto provocó el incendio del archivo", 
      summary: "Hace 20 años el impostor eliminó los registros de los videntes reales.", 
      status: "active", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "El gran incendio que arrasó la sección histórica del archivo hace 20 años fue provocado intencionadamente por los inquisidores del culto bajo órdenes directas de Veradis para eliminar los registros de los antiguos videntes.", 
        revealConditions: ["Interrogar a la Archivista Mira tras ganarse su confianza y curar sus antiguas quemaduras"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_ARCHIVE_RECORDS, trigger: "Los registros supervivientes muestran desapariciones coordinadas la noche del incendio.", strength: "strong", note: "Prueba documental." },
          { entityId: ids.ENT_CLUE_TORBEN_TIP, trigger: "Torben vio figuras del culto huyendo con sacos la noche del incendio.", strength: "medium", note: "Testimonio externo." },
          { entityId: ids.ENT_CLUE_SERA_TEXTS, trigger: "Las Crónicas contradicen la versión oficial difundida por el culto.", strength: "medium", note: "Contexto histórico." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_SENRA_DEFECT, 
      entityType: "secret", 
      title: "La técnica puede defeccionar", 
      summary: "Mantiene la ilusión por miedo, no por lealtad. Es rescatable.", 
      status: "active", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "La Maga Senra opera la ilusión bajo amenazas directas contra su hermana menor, retenida por Lord Vantis en una propiedad de la capital. Ella odia al culto y busca desesperadamente una forma de desertar.", 
        revealConditions: ["Establecer un canal de comunicación seguro y privado con Senra", "Ofrecer garantías de rescate y asilo para su hermana en la capital"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_SENRA_DOUBTS, trigger: "La carta de Senra revela que desea confesar y huir.", strength: "strong", note: "Ancla principal." },
          { entityId: ids.ENT_CLUE_FORGERY_TOOL, trigger: "El cristal prueba que Senra es operaria, no necesariamente ideóloga.", strength: "medium", note: "Abre la vía de negociación." },
          { entityId: ids.ENT_CLUE_INNER_CIRCLE_MTG, trigger: "Las minutas muestran que el círculo interno la presiona y vigila.", strength: "medium", note: "Confirma coacción." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_DORIAN_SPY, 
      entityType: "secret", 
      title: "El representante del Consorcio es un espía", 
      summary: "Vende información al Oráculo y al Gremio según quién pague más.", 
      status: "active", 
      importance: "normal", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "Dorian Vex es un agente doble pagado por Lord Vantis para espiar al Consejo y filtrar los planes de contingencia del grupo de aventureros al círculo interno.", 
        revealConditions: ["Seguimiento físico y vigilancia de sus movimientos nocturnos", "Interrogar a los inquisidores del círculo interno capturados"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_INNER_CIRCLE_MTG, trigger: "Las minutas sitúan a Dorian en reuniones que no debería conocer.", strength: "strong", note: "Prueba directa." },
          { entityId: ids.ENT_CLUE_LYRA_INVESTIGATION, trigger: "El diario de Lyra contiene filtraciones que solo alguien del Consejo pudo entregar.", strength: "medium", note: "Indicio de traidor interno." },
          { entityId: ids.ENT_CLUE_GUILD_LEDGER, trigger: "El libro del Gremio registra pagos cruzados a intermediarios del Consorcio.", strength: "medium", note: "Conecta Gremio y Consorcio." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_ORIGINAL_ORACLE, 
      entityType: "secret", 
      title: "El primer Veradis era un vidente real", 
      summary: "Fue asesinado hace 22 años por el impostor que tomó su identidad.", 
      status: "active", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "El verdadero Veradis Thorn fue un vidente ciego y ermitaño devoto de la Verdad. Fue asesinado hace 22 años por Jack Corvo, quien posteriormente fundó el actual Culto del Oráculo usurpando su nombre.", 
        revealConditions: ["Hallar el Tomo de los Antiguos Videntes en el Santuario del Bosque"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_FINAL_TRUTH, trigger: "La lápida y las notas de la bóveda identifican al verdadero Veradis Thorn.", strength: "strong", note: "Revelación final." },
          { entityId: ids.ENT_CLUE_SERA_TEXTS, trigger: "Las Crónicas preservan una versión anterior del culto y del vidente real.", strength: "medium", note: "Ancla doctrinal." },
          { entityId: ids.ENT_CLUE_ELDERTOME, trigger: "El Tomo de la Antigua Fe recoge la genealogía de los videntes auténticos.", strength: "strong", note: "Prueba histórica." },
          { entityId: ids.ENT_CLUE_ARCHIVE_RECORDS, trigger: "Los registros quemados muestran desapariciones alrededor de la ascensión del impostor.", strength: "medium", note: "Indicio de suplantación." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_VAULT_LOCATION, 
      entityType: "secret", 
      title: "Ubicación de la bóveda de pruebas", 
      summary: "Bajo las ruinas hay una bóveda con 20 años de registros de profecías falsificadas.", 
      status: "active", 
      importance: "critical", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "La Bóveda Subterránea que contiene los registros históricos y financieros se encuentra bajo las losas del altar de las Ruinas del Templo Antiguo, sellada por una contraseña arcana.", 
        revealConditions: ["Obtener la palabra de paso de la Maga Senra", "Usar conjuros de detección y excavación física en las ruinas"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_VAULT_ENTRANCE, trigger: "El mapa de las ruinas marca el acceso sellado bajo el altar.", strength: "strong", note: "Ancla principal." },
          { entityId: ids.ENT_CLUE_ARCHIVE_RECORDS, trigger: "Los registros supervivientes conservan referencias a dependencias subterráneas.", strength: "medium", note: "Indicio temprano." },
          { entityId: ids.ENT_CLUE_ELDERTOME, trigger: "El tomo antiguo nombra la cripta sellada de los videntes.", strength: "medium", note: "Pista religiosa." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_PROPHECY_COUNT, 
      entityType: "secret", 
      title: "Escala del fraude", 
      summary: "El número exacto de personas que recibieron profecías falsas en 20 años.", 
      status: "active", 
      importance: "normal", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "Se han registrado y cobrado 847 profecías falsas. De ellas, al menos cincuenta provocaron la ruina total de familias nobles honestas y quince resultaron en ejecuciones indirectas.", 
        impact: "Hacer pública esta cifra en la plaza del mercado provocará el colapso absoluto del apoyo popular al templo de forma irreversible.",
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_VAULT_RECORDS, trigger: "Los libros de la bóveda contienen el recuento exacto de profecías vendidas.", strength: "strong", note: "Ancla definitiva." },
          { entityId: ids.ENT_CLUE_PROPHECY_TEXT, trigger: "El texto falso permite comparar un caso con un patrón mayor.", strength: "weak", note: "Primer indicio." },
          { entityId: ids.ENT_CLUE_PETITIONER_FEAR, trigger: "El miedo de los fieles muestra que las víctimas no son casos aislados.", strength: "medium", note: "Escala social." },
          { entityId: ids.ENT_CLUE_CULTO_DISBANDS, trigger: "Los iniciados confirman que había un volumen masivo de audiencias manipuladas.", strength: "medium", note: "Testimonio posterior." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_CONSEJO_CORRUPTION, 
      entityType: "secret", 
      title: "El consejero conservador sabía", 
      summary: "Conocía parte de la corrupción y eligió no actuar.", 
      status: "active", 
      importance: "normal", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "El Consejero Brann descubrió a Lord Vantis conspirando con Mors en las bodegas del muelle hace cuatro años, pero aceptó un porcentaje de los monopolios portuarios a cambio de su silencio.", 
        revealConditions: ["Confrontar a Brann en la Sala del Consejo con el libro del Gremio", "Hallar correspondencia sellada en su escritorio privado"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_INNER_CIRCLE_MTG, trigger: "Las minutas prueban que Brann conocía reuniones del círculo interno.", strength: "strong", note: "Ancla principal." },
          { entityId: ids.ENT_CLUE_GUILD_LEDGER, trigger: "El libro del Gremio registra dividendos desviados a intermediarios del Consejo.", strength: "medium", note: "Prueba financiera." },
          { entityId: ids.ENT_CLUE_LYRA_INVESTIGATION, trigger: "Lyra documentó interferencias políticas procedentes de la facción conservadora.", strength: "medium", note: "Indicio político." },
          { entityId: ids.ENT_CLUE_VANTIS_CONFESSION, trigger: "Vantis puede delatar a Brann para reducir su propia condena.", strength: "strong", note: "Confesión cruzada." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_CAPTAIN_ESCAPE, 
      entityType: "secret", 
      title: "El Oráculo tiene plan de huida", 
      summary: "Un barco preparado. Zarpa si llega una señal de alarma.", 
      status: "active", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "Veradis ha depositado una fortuna en gemas en la caja fuerte del Capitán Drez a cambio de mantener el navío 'La Gaviota de Plata' listo para zarpar a la menor señal de alerta.", 
        revealConditions: ["Registrar la oficina de Veradis en el templo", "Interrogar al Capitán Drez en los muelles de la ciudad"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_VERADIS_ESCAPE, trigger: "La misiva cifrada de Veradis detalla la ruta y la señal de alarma.", strength: "strong", note: "Ancla principal." },
          { entityId: ids.ENT_CLUE_PORT_BODIES, trigger: "La actividad de los inquisidores en el puerto permite investigar al Capitán Drez.", strength: "medium", note: "Entrada por Sangre en el Puerto." },
          { entityId: ids.ENT_CLUE_VANTIS_CONFESSION, trigger: "Vantis sabe del plan de huida y puede revelarlo si se le presiona.", strength: "medium", note: "Ancla social." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_SENRA_EXIT_CODE, 
      entityType: "secret", 
      title: "Contraseña de la bóveda", 
      summary: "La contraseña arcana para abrir la trampilla.", 
      status: "active", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "La palabra clave arcana que desactiva la trampilla de hierro reforzado de la Bóveda de las Ruinas es 'Umbra Veritatis' (La sombra de la verdad).", 
        revealConditions: ["Persuadir a la Maga Senra para que colabore con la Capitana Lyra"],
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_SENRA_DOUBTS, trigger: "Senra puede entregar la palabra clave si obtiene protección.", strength: "strong", note: "Ancla principal." },
          { entityId: ids.ENT_CLUE_VAULT_ENTRANCE, trigger: "El acceso oculto menciona que se requiere una palabra arcana.", strength: "medium", note: "Necesidad de contraseña." },
          { entityId: ids.ENT_CLUE_ELDERTOME, trigger: "El Tomo de la Antigua Fe conserva la frase litúrgica original.", strength: "medium", note: "Pista alternativa." },
        ]) 
      } 
    },
    { 
      entityId: ids.ENT_SEC_WIDOW_SON, 
      entityType: "secret", 
      title: "El hijo de la peticionaria ha muerto", 
      summary: "La profecía que busca será falsa. Su hijo murió en combate hace meses.", 
      status: "active", 
      importance: "low", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        truth: "El hijo de Asha la Viuda falleció en combate hace cuatro meses en la frontera del este. El Oráculo planea mentirle prometiéndole su retorno a cambio de sus últimas monedas de plata.", 
        impact: "Un doloroso recordatorio del daño moral y la total falta de escrúpulos de Veradis y sus sacerdotes.",
        ...revealAnchors([
          { entityId: ids.ENT_CLUE_EASTERN_FRONT_LETTER, trigger: "La carta militar confirma la muerte del hijo antes de la audiencia.", strength: "strong", note: "Nueva pista añadida al seed." },
          { entityId: ids.ENT_CLUE_PETITIONER_FEAR, trigger: "Los fieles aterrorizados permiten presentar a Asha como víctima del mismo patrón.", strength: "medium", note: "Gancho emocional." },
          { entityId: ids.ENT_CLUE_CULTO_DISBANDS, trigger: "Los iniciados pueden reconocer que se preparó una profecía falsa para Asha.", strength: "medium", note: "Testimonio posterior." },
        ]) 
      } 
    },
  ];

  for (const sec of SECRETS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...sec, actorId: "usr_dm" });
  }
  console.log(`✓ ${SECRETS.length} secrets created`);
}
