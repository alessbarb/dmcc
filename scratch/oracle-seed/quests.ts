// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.ts";
import { CMP } from "./config.ts";
import * as ids from "./ids.ts";

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------

export async function seedQuests() {
  const QUESTS = [
    {
      entityId: ids.ENT_Q_PROFECIA_ROTA, entityType: "quest",
      title: "La Profecía Rota",
      summary: "Arco narrativo principal. La profecía que originalmente guio al grupo de aventureros hacia la ciudad de Valdris resulta ser una falsificación mágica. Esto desencadena la investigación de una gigantesca conspiración.",
      status: "active", importance: "critical",
      metadata: {
        priority: "main",
        publicObjective: "Investigar el origen de la profecía rota que guio al grupo y encontrar a su autor en la ciudad.",
        hiddenObjective: "Reunir evidencias suficientes para desenmascarar públicamente a Veradis como un fraude, derrotar a sus inquisidores y desmantelar el culto.",
        failureConsequence: "El culto consolida un control total sobre el Consejo, silenciando permanentemente a los aventureros y ejecutando a los disidentes leales a la Verdad.",
      },
    },
    {
      entityId: ids.ENT_Q_PRECIO_SILENCIO, entityType: "quest",
      title: "El Precio del Silencio",
      summary: "Misión secundaria. Varios comerciantes y marineros del puerto de Valdris están siendo intimidados por figuras encapuchadas del culto para evitar que testifiquen sobre cargamentos inusuales.",
      status: "active", importance: "normal",
      metadata: {
        priority: "side",
        publicObjective: "Descubrir la identidad y motivaciones de los matones encapuchados que asustan a los mercaderes del barrio portuario.",
        hiddenObjective: "Impedir que el culto interfiera con las rutas de contrabando del Gremio de Ladrones y proteger los intereses del Gremio en el puerto.",
      },
    },
    {
      entityId: ids.ENT_Q_ARCHIVISTA, entityType: "quest",
      title: "La Archivista y sus Secretos",
      summary: "Misión secundaria. La anciana Mira custodia documentos históricos de incalculable valor, pero se niega a colaborar con los aventureros hasta que demuestren ser dignos de su confianza.",
      status: "active", importance: "high",
      metadata: {
        priority: "side",
        publicObjective: "Demostrar honradez y ganarse la confianza de la recelosa archivista municipal ayudándola en sus tareas cotidianas.",
        hiddenObjective: "Obtener acceso a los pocos pergaminos supervivientes del gran incendio provocado por el culto hace veinte años.",
      },
    },
    {
      entityId: ids.ENT_Q_SANGRE_PUERTO, entityType: "quest",
      title: "Sangre en el Puerto",
      summary: "Misión secundaria. Varios cadáveres con misteriosas quemaduras mágicas han aparecido flotando en las inmediaciones de los muelles. La Capitana Lyra investiga el caso de forma paralela.",
      status: "active", importance: "normal",
      metadata: {
        priority: "side",
        publicObjective: "Investigar la escena del crimen del puerto y cooperar discretamente con la Capitana Lyra Stonehaven.",
        hiddenObjective: "Descubrir que el círculo interno del culto está asesinando a estibadores que presenciaron la importación ilegal de los valiosos cristales de resonancia mágica.",
      },
    },
    {
      entityId: ids.ENT_Q_TRAIDOR_INTERIOR, entityType: "quest",
      title: "El Traidor Interior",
      summary: "Misión secundaria. Hay indicios de que el círculo interno del culto conoce de antemano los movimientos y planes secretos de los aventureros. Alguien está filtrando información confidencial.",
      status: "pending", importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: {
        priority: "side",
        publicObjective: "Identificar y tender una trampa al traidor que comparte secretos del grupo con el templo.",
        hiddenObjective: "Descubrir y neutralizar a Dorian Vex, el representante del Consorcio que actúa como espía a sueldo de Lord Vantis.",
      },
    },
    {
      entityId: ids.ENT_Q_EPILOGO, entityType: "quest",
      title: "Epílogo: Los Hilos Sueltos",
      summary: "Epílogo narrativo. El colapso del Oráculo deja un gran vacío de poder en Valdris. Las repercusiones de las alianzas y decisiones tomadas por los aventureros determinarán el futuro destino de la ciudad.",
      status: "pending", importance: "normal",
      metadata: {
        priority: "background",
        publicObjective: "Ayudar a la Capitana Lyra y a la Consejera Lena a estabilizar la ciudad y restaurar el orden civil tras la caída del Oráculo.",
      },
    },
  ];

  for (const q of QUESTS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...q, actorId: "usr_dm" });
  }
  console.log(`✓ ${QUESTS.length} quests created`);
}
