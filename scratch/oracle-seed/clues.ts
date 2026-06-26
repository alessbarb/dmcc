// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.ts";
import { CMP } from "./config.ts";
import * as ids from "./ids.ts";

// ---------------------------------------------------------------------------
// Clues
// ---------------------------------------------------------------------------

export async function seedClues() {
  const CLUES = [
    // Fases narrativas 1-2
    { 
      entityId: ids.ENT_CLUE_PROPHECY_TEXT, 
      entityType: "clue", 
      title: "Texto de la profecía rota", 
      summary: "Un papiro oficial que contiene la profecía entregada a los aventureros. Muestra extrañas discrepancias en la caligrafía y el estilo respecto a registros del templo de hace diez años.", 
      status: "hidden", 
      importance: "high", 
      metadata: { 
        content: "Usa términos arcaicos e incoherencias de conjugación gramatical que delatan una imitación burda del estilo antiguo del templo, con discrepancias de unos tres años.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_PETITIONER_FEAR, 
      entityType: "clue", 
      title: "Temor generalizado entre los fieles", 
      summary: "Varios ciudadanos devotos que recibieron profecías adversas han dejado de acudir al templo y sus vecinos afirman que actúan aterrorizados.", 
      status: "hidden", 
      importance: "normal", 
      metadata: { 
        content: "Al menos cuatro peticionarios adinerados que recibieron augurios funestos desaparecieron misteriosamente de la vida pública o vendieron apresuradamente sus negocios.", 
        clueType: "verbal" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_MERCHANT_PAYMENT, 
      entityType: "clue", 
      title: "Transacciones financieras sospechosas", 
      summary: "Registros de donaciones anónimas de gran volumen transferidas a las cuentas de la tesorería del templo con regularidad.", 
      status: "hidden", 
      importance: "high", 
      metadata: { 
        content: "Patrón recurrente de pagos mensuales realizados en lingotes de plata marcados con el sello personal de la Mansión Vantis, coincidiendo con sus victorias comerciales.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_ARCANE_COMPONENT, 
      entityType: "clue", 
      title: "Componentes de ilusión en el templo", 
      summary: "Restos de materiales mágicos exóticos descubiertos en una alacena oculta tras el altar de la Sala de Preparación.", 
      status: "hidden", 
      importance: "critical", 
      metadata: { 
        content: "Finísimo polvo de esmeralda molida (costo ~500 po), espejos de enfoque plano-convexos y fragmentos de cristal de resonancia, suficientes para proyectar ilusiones auditivas.", 
        clueType: "physical" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_TORBEN_TIP, 
      entityType: "clue", 
      title: "Confidencia del Tabernero Torben", 
      summary: "Torben asegura que el fuego que consumió el templo de la Verdad y sus archivos hace 20 años no se originó de forma accidental.", 
      status: "hidden", 
      importance: "normal", 
      metadata: { 
        content: "Torben relata que siendo joven vio a tres figuras con túnicas ceremoniales del culto actual huir por el callejón trasero portando pesados sacos la noche del incendio.", 
        clueType: "verbal" 
      } 
    },
    // Fases narrativas 3-4
    { 
      entityId: ids.ENT_CLUE_ARCHIVE_RECORDS, 
      entityType: "clue", 
      title: "Registros fragmentarios del incendio", 
      summary: "Un libro de actas parcialmente chamuscado superviviente en el fondo de un archivista de metal cerrado.", 
      status: "hidden", 
      importance: "critical", 
      metadata: { 
        content: "La lista superviviente muestra que los 20 videntes tradicionales de la orden original desaparecieron o fallecieron en el mismo año en que Veradis asumió su cargo.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_GUILD_LEDGER, 
      entityType: "clue", 
      title: "Libro de cuentas paralelo del Gremio", 
      summary: "Un libro contable sustraído a los recaudadores de Lord Vantis que registra sobornos e inversiones.", 
      status: "hidden", 
      importance: "critical", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        content: "Cinco años de transferencias de fondos mensuales directas desde las cuentas de Lord Vantis a las identidades secretas de los inquisidores principales del culto.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_PORT_BODIES, 
      entityType: "clue", 
      title: "Marcas rituales de la Inquisición", 
      summary: "Cuerpos recuperados del agua presentan una inconfundible marca quemada a fuego en sus hombros.", 
      status: "hidden", 
      importance: "high", 
      metadata: { 
        content: "Una marca circular con tres líneas convergentes. Corresponde al sello metálico privado de los inquisidores que Mors utiliza para señalar objetivos.", 
        clueType: "physical" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_SERA_TEXTS, 
      entityType: "clue", 
      title: "Crónicas del Verdadero Vidente", 
      summary: "Un manuscrito de teología antigua guardado celosamente por Sera Moonwhisper en el templo urbano.", 
      status: "hidden", 
      importance: "critical", 
      metadata: { 
        content: "200 páginas manuscritas en lengua celestial. El capítulo séptimo detalla la 'Proyección del Falso Profeta', un ritual para proyectar y amplificar voces usando cristales.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_LYRA_INVESTIGATION, 
      entityType: "clue", 
      title: "Diario secreto de la Capitana Lyra", 
      summary: "Notas manuscritas por Lyra donde detalla los cabos sueltos que el Consejo de la Ciudad le ordenó ignorar.", 
      status: "hidden", 
      importance: "high", 
      metadata: { 
        content: "Detalles sobre siete desapariciones sin resolver y cuatro incendios 'accidentales' de competidores de Lord Vantis, marcados con la nota: 'Interferencia del Templo'.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_INNER_CIRCLE_MTG, 
      entityType: "clue", 
      title: "Minutas de la reunión del Círculo Interno", 
      summary: "Notas de un encuentro privado recuperadas de los aposentos de Mors.", 
      status: "hidden", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        content: "Conversaciones explícitas sobre la necesidad de presionar a la Maga Senra para aumentar el alcance de la proyección y liquidar a los archivistas rebeldes.", 
        clueType: "verbal" 
      } 
    },
    // Fases narrativas 5-6
    { 
      entityId: ids.ENT_CLUE_FALSE_PROPHECY_AUDIO, 
      entityType: "clue", 
      title: "Resonancia mágica de la voz profética", 
      summary: "Muestras de la energía residual recolectadas en la Sala del Oráculo tras una audiencia pública.", 
      status: "hidden", 
      importance: "critical", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        content: "Frecuencias de vibración armónica incompatibles con una cuerda vocal biológica. Muestra el residuo característico de un cristal de resonancia arcana.", 
        clueType: "magical" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_SENRA_DOUBTS, 
      entityType: "clue", 
      title: "Confesión escrita de Senra", 
      summary: "Un borrador de carta oculta en el colchón de la Maga Senra dirigida a la Capitana Lyra.", 
      status: "hidden", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        content: "Senra expresa su arrepentimiento por haber participado involuntariamente en el engaño y solicita clemencia y protección para su hermana encarcelada a cambio de testificar.", 
        clueType: "behavioral" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_VAULT_ENTRANCE, 
      entityType: "clue", 
      title: "Acceso oculto en las ruinas", 
      summary: "Un mapa topográfico antiguo que revela la distribución del templo antes del incendio.", 
      status: "hidden", 
      importance: "critical", 
      metadata: { 
        content: "El mapa indica un pasaje subterráneo sellado con una trampilla de hierro reforzado tras el altar de oración de las ruinas. Se requiere palabra clave arcana.", 
        clueType: "physical" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_VAULT_RECORDS, 
      entityType: "clue", 
      title: "Evidencia documental de la Bóveda", 
      summary: "El archivo maestro de profecías encontrado en los cofres de hierro de la Bóveda Subterránea.", 
      status: "hidden", 
      importance: "critical", 
      metadata: { 
        content: "Cajas repletas de actas firmadas por Veradis. Se registran 847 profecías con anotaciones sobre el cliente, el coste pagado y las consecuencias buscadas.", 
        clueType: "document" 
      } 
    },
    // Fases narrativas 7-8
    { 
      entityId: ids.ENT_CLUE_VERADIS_ESCAPE, 
      entityType: "clue", 
      title: "Plan de contingencia del Impostor", 
      summary: "Una misiva cifrada y sellada con lacre rojo hallada en el escritorio personal de Veradis.", 
      status: "hidden", 
      importance: "high", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        content: "Instrucciones de pago y ruta de huida hacia los muelles del norte, donde el Capitán Drez mantiene su barco 'La Gaviota de Plata' listo para zarpar.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_VANTIS_CONFESSION, 
      entityType: "clue", 
      title: "Testimonio bajo presión de Vantis", 
      summary: "Declaración obtenida de Lord Vantis tras confrontarlo con sus propios libros de cuentas.", 
      status: "hidden", 
      importance: "high", 
      metadata: { 
        content: "Vantis admite haber sobornado a Veradis durante los últimos siete años a cambio de profecías que arruinaron a sus rivales y le otorgaron el monopolio comercial.", 
        clueType: "verbal" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_CULTO_DISBANDS, 
      entityType: "clue", 
      title: "Testimonio de los Iniciados", 
      summary: "Declaraciones voluntarias de doce novicios del templo tras el arresto de los inquisidores.", 
      status: "hidden", 
      importance: "normal", 
      metadata: { 
        content: "Los novicios admiten haber sospechado de las prolongadas ausencias de la Maga Senra y de los extraños ruidos metálicos detrás de los tapices de la Sala del Oráculo.", 
        clueType: "verbal" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_ELDERTOME, 
      entityType: "clue", 
      title: "Tomo de la Antigua Fe", 
      summary: "Un antiguo registro del Templo de la Verdad rescatado de las ruinas por el Abad Fenwick.", 
      status: "hidden", 
      importance: "high", 
      metadata: { 
        content: "Detalla los nombres e historias de los veinte videntes auténticos originales y expone las diferencias fundamentales con el falso dogma predicado por Veradis.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_FINAL_TRUTH, 
      entityType: "clue", 
      title: "El Destino del Verdadero Veradis", 
      summary: "Una lápida sin nombre en el cementerio del bosque y notas asociadas halladas en la Bóveda.", 
      status: "hidden", 
      importance: "critical", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        content: "El Oráculo real, Veradis Thorn, fue asesinado hace 22 años. El actual Oráculo es en realidad un hechicero desterrado llamado Jack Corvo que usurpó su identidad.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_EASTERN_FRONT_LETTER, 
      entityType: "clue", 
      title: "Carta militar sellada del frente oriental", 
      summary: "Una comunicación oficial, aún lacrada, que confirma la muerte del hijo de Asha semanas antes de su audiencia con el Oráculo.", 
      status: "hidden", 
      importance: "normal", 
      metadata: { 
        content: "La carta está firmada por un capitán de campaña y menciona que el joven Tomar, hijo de Asha, murió protegiendo una retirada en la frontera oriental. El sello militar demuestra que el templo pudo conocer la verdad antes de venderle una profecía falsa.", 
        clueType: "document" 
      } 
    },
    { 
      entityId: ids.ENT_CLUE_FORGERY_TOOL, 
      entityType: "clue", 
      title: "El Cristal de Resonancia Arcana", 
      summary: "El artefacto mágico de gran poder utilizado para generar y proyectar la voz simulada del Oráculo.", 
      status: "hidden", 
      importance: "critical", 
      visibility: { kind: "dm_only" as const }, 
      metadata: { 
        content: "Un cristal negro facetado de unos treinta centímetros de longitud, con venas de luz violeta parpadeante. Canaliza energía mágica de la escuela de ilusión.", 
        clueType: "physical" 
      } 
    },
  ];

  for (const clue of CLUES) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...clue, actorId: "usr_dm" });
  }
  console.log(`✓ ${CLUES.length} clues created`);
}
