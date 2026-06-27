// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

// ---------------------------------------------------------------------------
// NPCs
// ---------------------------------------------------------------------------

export async function seedNpcs() {
  const NPCS = [
    // === ANTAGONISTAS ===
    {
      entityId: ids.ENT_NPC_VERADIS, entityType: "npc",
      title: "Veradis el Oráculo",
      summary: "El respetado y temido Oráculo de Valdris. Lleva más de dos décadas falsificando profecías divinas mediante un elaborado entramado de ilusión arcana.",
      status: "active", importance: "critical",
      visibility: { kind: "dm_only" as const },
      metadata: {
        role: "Antagonista principal de la campaña y líder del culto.", attitudeToParty: "deceptive",
        goal: "Preservar a toda costa el inmenso poder político, la influencia absoluta y las riquezas acumuladas bajo su fachada sagrada.",
        fear: "Ser expuesto públicamente como un farsante ordinario. Tiene listo un plan de huida de emergencia con oro y un barco contratado.",
        secret: "Carece de cualquier don profético real. Es un astuto ilusionista de nivel equivalente a Mago del SRD 5.2.1, cuyo poder proviene de un cristal de resonancia oculto.",
        factionId: ids.ENT_FAC_CULTO, currentLocationId: ids.ENT_LOC_SALA_ORACULO,
        voice: "Profunda, grave, sumamente pausada y calculada. Jamás improvisa ante el público y sus palabras resuenan con una falsa vibración divina.",
      },
    },
    {
      entityId: ids.ENT_NPC_VANTIS, entityType: "npc",
      title: "Lord Vantis",
      summary: "Un influyente y codicioso aristócrata que financia en secreto al culto. A cambio, recibe profecías diseñadas a medida para favorecer sus monopolios mercantiles y destruir a su competencia.",
      status: "active", importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: {
        role: "Cómplice financiero clave del culto y señor de la Mansión Vantis.", attitudeToParty: "hostile",
        goal: "Mantener su estatus como el hombre más rico de Valdris y asegurar que el fraude del Oráculo no salga a la luz.",
        fear: "Que los libros de cuentas paralelos que posee el Gremio de Ladrones caigan en manos del Consejo de la Ciudad.",
        factionId: ids.ENT_FAC_CULTO, currentLocationId: ids.ENT_LOC_MANSION_VANTIS,
      },
    },
    {
      entityId: ids.ENT_NPC_GUARDIAN_JEFE, entityType: "npc",
      title: "Inquisidor Mors",
      summary: "El fanático y despiadado comandante de los Guardianes del Culto. Ejecuta las sentencias y los trabajos sucios de Veradis con fervor casi religioso y sin el menor atisbo de duda moral.",
      status: "active", importance: "normal",
      visibility: { kind: "dm_only" as const },
      metadata: { 
        role: "Antagonista secundario y ejecutor del culto.", 
        attitudeToParty: "hostile", 
        goal: "Erradicar cualquier foco de herejía o disidencia que amenace al Oráculo.",
        fear: "Fallarle a Veradis, a quien ve no solo como un líder, sino como un mensajero divino real.",
        factionId: ids.ENT_FAC_CULTO 
      },
    },
    // === CONSEJO ===
    {
      entityId: ids.ENT_NPC_ALDRIC, entityType: "npc",
      title: "Magister Aldric",
      summary: "El Magister supremo y líder del Consejo de Valdris. Apoya firmemente al Oráculo y utiliza sus profecías para legitimar decisiones políticas impopulares, creyendo firmemente en su autenticidad.",
      status: "active", importance: "high",
      metadata: {
        role: "Autoridad neutral y gobernante formal de la ciudad.", attitudeToParty: "neutral",
        goal: "Gobernar Valdris con estabilidad. Cree que las profecías son el único ancla moral que evita que la población se rebele.",
        fear: "El colapso del orden social, el estallido de revueltas y la pérdida del control gubernamental si la institución del Oráculo llegara a caer.",
        factionId: ids.ENT_FAC_CONSEJO, currentLocationId: ids.ENT_LOC_SALA_CONSEJO,
      },
    },
    {
      entityId: ids.ENT_NPC_CONSEJERA_LENA, entityType: "npc",
      title: "Consejera Lena Marsh",
      summary: "Líder de la facción reformista del Consejo de la Ciudad. Sospecha desde hace tiempo del secretismo del Oráculo y de las sospechosas coincidencias comerciales que favorecen a Lord Vantis.",
      status: "active", importance: "normal",
      metadata: { 
        role: "Aliada política potencial del grupo en las altas esferas.", 
        attitudeToParty: "friendly", 
        goal: "Instituir una auditoría independiente del culto y erradicar la corrupción institucional en Valdris.",
        fear: "Ser desacreditada políticamente o sufrir un 'accidente' provocado por los inquisidores del culto antes de reunir pruebas suficientes.",
        factionId: ids.ENT_FAC_CONSEJO 
      },
    },
    {
      entityId: ids.ENT_NPC_CONSEJERO_BRANN, entityType: "npc",
      title: "Consejero Brann",
      summary: "Líder de la facción conservadora en el Consejo de la Ciudad. Es plenamente consciente de que hay corrupción económica en el gobierno, pero prefiere no actuar en aras de la estabilidad.",
      status: "active", importance: "normal",
      visibility: { kind: "dm_only" as const },
      metadata: {
        role: "Obstáculo político pragmático.", attitudeToParty: "suspicious",
        goal: "Mantener el equilibrio de poder actual y proteger los intereses de la nobleza tradicional.",
        secret: "Presenció un encuentro clandestino entre Lord Vantis y el Inquisidor Mors en el barrio noble hace cuatro años, pero decidió enterrar el asunto.",
        factionId: ids.ENT_FAC_CONSEJO,
      },
    },
    // === GUARDIA ===
    {
      entityId: ids.ENT_NPC_LYRA, entityType: "npc",
      title: "Lyra Stonehaven",
      summary: "La íntegra y metódica Capitana de la Guardia Municipal de Valdris. Ha documentado en secreto una serie de misteriosas desapariciones en el puerto, pero teme que actuar sin pruebas firmes provoque una guerra civil.",
      status: "active", importance: "high",
      metadata: {
        role: "Aliada militar potencial o complicación de orden público.", attitudeToParty: "neutral",
        goal: "Proteger las vidas de los ciudadanos de Valdris y mantener la paz pública de acuerdo con la ley.",
        fear: "Desencadenar el caos en la ciudad si ataca al culto sin evidencias indiscutibles, destruyendo la misma paz que juró defender.",
        currentLocationId: ids.ENT_LOC_CUARTEL_GUARDIA,
      },
    },
    {
      entityId: ids.ENT_NPC_GUARDIA_RIKU, entityType: "npc",
      title: "Riku el Guardia",
      summary: "Un guardia de bajo rango, honesto pero sumamente nervioso. Mientras patrullaba el muelle norte, presenció cómo los inquisidores arrojaban un bulto sospechoso al mar, y ahora teme por su vida.",
      status: "active", importance: "low",
      metadata: { 
        role: "Informante asustadizo y testigo de cargo.", 
        attitudeToParty: "friendly",
        goal: "Sobrevivir a su patrulla diaria sin llamar la atención de sus superiores corruptos.",
        fear: "Aparecer flotando en los muelles como los demás testigos."
      },
    },
    // === CONTACTOS ===
    {
      entityId: ids.ENT_NPC_TORBEN, entityType: "npc",
      title: "Torben el Tabernero",
      summary: "El robusto y perspicaz tabernero de la Taberna del Cuervo. Antiguo contrabandista reconvertido, actúa como un informador clave para el Gremio de Ladrones a cambio de que no haya disturbios en su local.",
      status: "active", importance: "normal",
      metadata: {
        role: "Aliado logístico, fuente de rumores y contacto inicial.", attitudeToParty: "friendly",
        goal: "Mantener su taberna abierta y a sus clientes habituales a salvo del escrutinio de la guardia.",
        factionId: ids.ENT_FAC_GREMIO, currentLocationId: ids.ENT_LOC_TABERNA_CUERVO,
      },
    },
    // === GREMIO ===
    {
      entityId: ids.ENT_NPC_KAEL, entityType: "npc",
      title: "Kael Nightblade",
      summary: "El astuto y pragmático líder del Gremio de Ladrones de Valdris. Posee las pruebas contables definitivas que incriminan a Lord Vantis con el culto, pero las conserva estrictamente como su seguro de vida.",
      status: "active", importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: {
        role: "Fuerza neutral y manipuladora en las sombras.", attitudeToParty: "suspicious",
        goal: "Utilizar la información del culto para extorsionar a los nobles y expandir el control de su organización criminal.",
        secret: "Guarda el libro de contabilidad duplicado del culto en una caja fuerte oculta en las alcantarillas de la guarida.",
        factionId: ids.ENT_FAC_GREMIO, currentLocationId: ids.ENT_LOC_CAMPAMENTO_GREMIO,
      },
    },
    {
      entityId: ids.ENT_NPC_CIRA, entityType: "npc",
      title: "Cira la Sombra",
      summary: "Una ágil y letal operativa del Gremio de Ladrones. Sirve como enlace directo entre Kael y las bandas callejeras del puerto, y es la primera en evaluar si los aventureros son dignos de confianza.",
      status: "active", importance: "normal",
      metadata: { 
        role: "Contacto de campo y guía en los bajos fondos.", 
        attitudeToParty: "neutral", 
        goal: "Cumplir las órdenes de Kael y mantener el flujo de contrabando en los muelles.",
        factionId: ids.ENT_FAC_GREMIO 
      },
    },
    // === TEMPLO DE LA VERDAD ===
    {
      entityId: ids.ENT_NPC_SERA, entityType: "npc",
      title: "Sera Moonwhisper",
      summary: "Una joven y devota sacerdotisa del Templo de la Verdad. Está convencida de que el Oráculo usurpa la fe verdadera y atesora en secreto manuscritos históricos que desmitifican sus supuestos milagros.",
      status: "active", importance: "high",
      metadata: {
        role: "Aliada espiritual y erudita clave.", attitudeToParty: "friendly",
        goal: "Desenmascarar la falsedad del Oráculo y devolver a la ciudadanía la adoración a la Verdad sin adulterar.",
        fear: "La violencia física de los inquisidores. Sabe que el culto no dudará en quemar su templo si sospechan lo que oculta.",
        secret: "Oculta las 'Crónicas del Verdadero Vidente' en un doble fondo del altar principal del templo.",
        factionId: ids.ENT_FAC_TEMPLO_VERDAD, currentLocationId: ids.ENT_LOC_TEMPLO_VERDAD,
      },
    },
    {
      entityId: ids.ENT_NPC_ABAD_SANTUARIO, entityType: "npc",
      title: "Abad Fenwick",
      summary: "El anciano abad Fenwick, guardián del Santuario del Bosque. Sobreviviente del clero original del Templo de la Verdad que fue purgado hace 20 años durante la misteriosa ascensión del Oráculo.",
      status: "active", importance: "normal",
      metadata: { 
        role: "Fuente de conocimiento histórico y mentor espiritual.", 
        attitudeToParty: "friendly", 
        goal: "Preservar la memoria histórica y los antiguos ritos de la Verdad antes de que su ancianidad le impida transmitirlos.",
        factionId: ids.ENT_FAC_TEMPLO_VERDAD, 
        currentLocationId: ids.ENT_LOC_SANTUARIO_BOSQUE 
      },
    },
    // === CONSORCIO ===
    {
      entityId: ids.ENT_NPC_DORIAN, entityType: "npc",
      title: "Dorian Vex",
      summary: "Un refinado y sibilino diplomático que representa al Consorcio de Mercaderes en el Consejo de la Ciudad. Es un agente doble que vende información confidencial tanto al Oráculo como al Gremio.",
      status: "active", importance: "normal",
      visibility: { kind: "dm_only" as const },
      metadata: {
        role: "Espía corporativo y posible saboteador.", attitudeToParty: "deceptive",
        goal: "Maximizar su beneficio económico personal y asegurar que la balanza de poder nunca se incline demasiado hacia un solo lado.",
        factionId: ids.ENT_FAC_CONSORCIO,
      },
    },
    {
      entityId: ids.ENT_NPC_MERCADER_JEFE, entityType: "npc",
      title: "Maestra Ola Brightstone",
      summary: "La pragmática presidenta del Consorcio de Mercaderes. No le importa la teología del Oráculo ni la moralidad del Consejo, siempre y cuando las rutas marítimas sigan siendo seguras y libres de impuestos abusivos.",
      status: "active", importance: "normal",
      metadata: { 
        role: "Poder económico influyente.", 
        attitudeToParty: "neutral", 
        goal: "Proteger los márgenes de ganancia del consorcio frente a la inestabilidad política.",
        factionId: ids.ENT_FAC_CONSORCIO 
      },
    },
    // === ARCHIVO ===
    {
      entityId: ids.ENT_NPC_MIRA, entityType: "npc",
      title: "Mira la Archivista",
      summary: "La anciana y taciturna jefa del Archivo de la Ciudad. Lleva cuarenta años cuidando de los manuscritos y sobrevivió milagrosamente al incendio de hace 20 años, conservando cicatrices de quemaduras en sus manos.",
      status: "active", importance: "high",
      metadata: {
        role: "Fuente histórica fundamental y guardiana de la memoria.", attitudeToParty: "neutral",
        goal: "Mantener a salvo los pocos documentos históricos reales que sobrevivieron a la purga del culto.",
        fear: "Que los agentes del culto regresen para terminar el trabajo y reduzcan a cenizas el resto del archivo.",
        currentLocationId: ids.ENT_LOC_ARCHIVO,
      },
    },
    // === SECUNDARIOS ===
    {
      entityId: ids.ENT_NPC_INICIADO_CULTO, entityType: "npc",
      title: "Iniciado del Culto",
      summary: "Fieles novicios del culto. Están genuinamente convencidos de la divinidad de Veradis y realizan tareas de mantenimiento, caridad ficticia y vigilancia menor en el recinto del templo.",
      status: "active", importance: "low",
      metadata: { role: "Obstáculo social y creyentes engañados.", attitudeToParty: "hostile", factionId: ids.ENT_FAC_CULTO },
    },
    {
      entityId: ids.ENT_NPC_HERALDO, entityType: "npc",
      title: "Heraldo Vorn",
      summary: "El pomposo portavoz público del Oráculo. Administra las audiencias oficiales, lee los edictos proféticos y decide, tras un jugoso pago, quién es digno de recibir la palabra de Veradis.",
      status: "active", importance: "low",
      metadata: { role: "Filtro burocrático del templo.", attitudeToParty: "suspicious", factionId: ids.ENT_FAC_CULTO, currentLocationId: ids.ENT_LOC_SALA_ORACULO },
    },
    {
      entityId: ids.ENT_NPC_PETICIONARIO, entityType: "npc",
      title: "Asha la Viuda",
      summary: "Una humilde mujer desesperada por noticias de su único hijo, desaparecido en la última campaña militar. Está dispuesta a entregar sus últimas monedas de plata para obtener una palabra del Oráculo.",
      status: "active", importance: "low",
      metadata: { role: "Recordatorio trágico de las víctimas del engaño.", attitudeToParty: "friendly" },
    },
    {
      entityId: ids.ENT_NPC_CAPITAN_BARCO, entityType: "npc",
      title: "Capitán Drez",
      summary: "Un rudo contrabandista y capitán del navío 'La Gaviota de Plata'. Trabaja regularmente para el Gremio de Ladrones y ha sido contratado en secreto por el Oráculo para una posible evacuación de emergencia.",
      status: "active", importance: "low",
      metadata: { role: "Recurso de escape o vía de intercepción.", attitudeToParty: "neutral", factionId: ids.ENT_FAC_GREMIO, currentLocationId: ids.ENT_LOC_PUERTO },
    },
    {
      entityId: ids.ENT_NPC_ESCRIBA_CONSEJO, entityType: "npc",
      title: "Escriba Pell",
      summary: "El tímido copista del Consejo. Su trabajo le permite leer toda la correspondencia oficial entre el Magister Aldric, Lord Vantis y el templo del Oráculo, registrando actas incriminatorias.",
      status: "active", importance: "low",
      metadata: { role: "Contacto burocrático y fuente documental.", attitudeToParty: "friendly" },
    },
    {
      entityId: ids.ENT_NPC_CURANDERO, entityType: "npc",
      title: "Maestra Ilva",
      summary: "Una curandera de los barrios bajos del puerto. Ha atendido clandestinamente a varios marineros y guardias con extrañas quemaduras mágicas e insolubles heridas causadas por las armas del culto.",
      status: "active", importance: "low",
      metadata: { role: "Soporte médico e informante local.", attitudeToParty: "friendly" },
    },
    {
      entityId: ids.ENT_NPC_RUMORISTA, entityType: "npc",
      title: "Pica la Pescadera",
      summary: "Una vivaz comerciante del mercado que vende pescado y difunde cotilleos. Sus rumores son una mezcla caótica de propaganda del culto, chismes del palacio y verdades distorsionadas del puerto.",
      status: "active", importance: "low",
      metadata: { role: "Termómetro social y fuente de rumores del mercado.", attitudeToParty: "neutral" },
    },
    {
      entityId: ids.ENT_NPC_VETERANO_GUARDIA, entityType: "npc",
      title: "Sargento Bren",
      summary: "Un veterano sargento de la guardia municipal. De carácter cínico y cicatrices curtidas, es el único oficial en quien la Capitana Lyra confía plenamente para llevar a cabo investigaciones secretas.",
      status: "active", importance: "low",
      metadata: { role: "Contacto táctico y mano derecha de Lyra.", attitudeToParty: "neutral" },
    },
    {
      entityId: ids.ENT_NPC_SENRA, entityType: "npc",
      title: "Maga Senra",
      summary: "La brillante maga ilusionista que opera desde la cámara secreta del templo y sostiene la Proyección del Oráculo. Está atrapada en el culto por miedo a las represalias contra su familia.",
      status: "active", importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: {
        role: "Pieza técnica fundamental del fraude.", attitudeToParty: "hostile",
        goal: "Escapar de las garras de Veradis y asegurar la libertad de su familia.",
        secret: "Si ella deja de canalizar el cristal de control, la voz y la imagen del Oráculo colapsarán instantáneamente. Está dispuesta a confesar a cambio de asilo y protección.",
        factionId: ids.ENT_FAC_CULTO,
      },
    },
  ];

  for (const npc of NPCS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...npc, actorId: "usr_dm" });
  }
  console.log(`✓ ${NPCS.length} NPCs created`);
}
