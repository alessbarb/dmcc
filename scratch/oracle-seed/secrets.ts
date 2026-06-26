// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.ts";
import { CMP } from "./config.ts";
import * as ids from "./ids.ts";

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
        impact: "Toda la legitimidad política del Consejo y del Magister Aldric depende del Oráculo. Su caída provocará una crisis de fe y la posible destitución del gobierno local." 
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
        impact: "Si se demuestra su implicación, Vantis perderá su asiento en el gremio, todos sus bienes comerciales serán confiscados por alta traición y buscará silenciar físicamente a cualquiera que le investigue." 
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
        revealConditions: ["Detectar magia en el Sanctum durante la profecía", "Interceptar a la Maga Senra en su taller de ilusiones", "Hallar los componentes y diagramas mecánicos de la proyección"] 
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
        revealConditions: ["Ganarse la confianza de Lyra mediante la resolución de la quest de Sangre en el Puerto", "Mostrarle evidencias contables de Lord Vantis"] 
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
        revealConditions: ["Cerrar un acuerdo de inmunidad o amnistía comercial con Kael", "Infiltrarse con éxito en las alcantarillas de la guarida del Gremio y saquear su caja fuerte"] 
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
        revealConditions: ["Interrogar a la Archivista Mira tras ganarse su confianza y curar sus antiguas quemaduras"] 
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
        revealConditions: ["Establecer un canal de comunicación seguro y privado con Senra", "Ofrecer garantías de rescate y asilo para su hermana en la capital"] 
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
        revealConditions: ["Seguimiento físico y vigilancia de sus movimientos nocturnos", "Interrogar a los inquisidores del círculo interno capturados"] 
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
        revealConditions: ["Hallar el Tomo de los Antiguos Videntes en el Santuario del Bosque"] 
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
        revealConditions: ["Obtener la palabra de paso de la Maga Senra", "Usar conjuros de detección y excavación física en las ruinas"] 
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
        impact: "Hacer pública esta cifra en la plaza del mercado provocará el colapso absoluto del apoyo popular al templo de forma irreversible." 
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
        revealConditions: ["Confrontar a Brann en la Sala del Consejo con el libro del Gremio", "Hallar correspondencia sellada en su escritorio privado"] 
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
        revealConditions: ["Registrar la oficina de Veradis en el templo", "Interrogar al Capitán Drez en los muelles de la ciudad"] 
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
        revealConditions: ["Persuadir a la Maga Senra para que colabore con la Capitana Lyra"] 
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
        impact: "Un doloroso recordatorio del daño moral y la total falta de escrúpulos de Veradis y sus sacerdotes." 
      } 
    },
  ];

  for (const sec of SECRETS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...sec, actorId: "usr_dm" });
  }
  console.log(`✓ ${SECRETS.length} secrets created`);
}
