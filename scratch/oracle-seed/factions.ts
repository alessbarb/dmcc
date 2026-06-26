// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.ts";
import { CMP } from "./config.ts";
import * as ids from "./ids.ts";

// ---------------------------------------------------------------------------
// Factions
// ---------------------------------------------------------------------------

export async function seedFactions() {
  const FACTIONS = [
    {
      entityId: ids.ENT_FAC_CULTO, entityType: "faction",
      title: "Culto del Oráculo",
      summary: "Una hermética y jerárquica orden religiosa dedicada a la veneración del Oráculo. Se compone de tres círculos: los iniciados ignorantes, los brutales inquisidores y el círculo interno corrupto.",
      status: "active", importance: "critical",
      metadata: {
        role: "Antagonistas principales de la campaña. Controlan la fe pública y extorsionan a los disidentes.",
        goal: "Consolidar el monopolio espiritual y político en Valdris, recaudando ingentes donaciones y eliminando cualquier amenaza o voz crítica.",
        secret: "Toda la estructura de mando sabe que las profecías son un fraude mágico orquestado por Veradis y ejecutado por la maga Senra.",
      },
    },
    {
      entityId: ids.ENT_FAC_CONSEJO, entityType: "faction",
      title: "Consejo de la Ciudad",
      summary: "El órgano supremo de gobierno de Valdris. Está profundamente dividido por rivalidades internas entre reformistas leales a Lena y conservadores comprados por Vantis.",
      status: "active", importance: "high",
      metadata: {
        role: "Cuerpo gobernante formal. Neutral pero vulnerable a la manipulación del culto y de los mercaderes.",
        goal: "Mantener la hegemonía administrativa, cobrar impuestos y evitar una guerra civil que destruya la economía de la ciudad.",
        secret: "Varios consejeros de la facción conservadora son plenamente conscientes de que las profecías benefician sospechosamente a ciertos nobles, pero deciden callar por conveniencia política.",
      },
    },
    {
      entityId: ids.ENT_FAC_GREMIO, entityType: "faction",
      title: "Gremio de Ladrones",
      summary: "El Gremio de Ladrones de Valdris, una organizada red que controla el contrabando, el juego y la información en los muelles de la ciudad.",
      status: "active", importance: "high",
      metadata: {
        role: "Facción ambigua. Potenciales aliados si sus intereses se alinean contra el culto, o enemigos mortales si se les cruza.",
        goal: "Asegurar que sus rutas de contrabando permanezcan libres del control de la Guardia Municipal y de la interferencia inquisitorial.",
        secret: "Custodian los duplicados de las actas de pago del culto a Lord Vantis en un cofre de hierro bajo las alcantarillas.",
      },
    },
    {
      entityId: ids.ENT_FAC_TEMPLO_VERDAD, entityType: "faction",
      title: "Templo de la Verdad",
      summary: "Una orden espiritual marginada y empobrecida que predica la honestidad absoluta y denuncia la falsedad de las profecías manipuladas del Oráculo.",
      status: "active", importance: "normal",
      metadata: {
        role: "Aliados potenciales y fuentes de conocimiento. Carecen de poder militar pero poseen la clave académica de la mentira.",
        goal: "Exponer la falsedad de Veradis, limpiar el nombre del templo original y restaurar la devoción honesta a la Verdad en Valdris.",
        secret: "Conservan las 'Crónicas del Verdadero Vidente', que describen el procedimiento exacto para desmontar las ilusiones del Oráculo.",
      },
    },
    {
      entityId: ids.ENT_FAC_CONSORCIO, entityType: "faction",
      title: "Consorcio de Mercaderes",
      summary: "La poderosa coalición de las principales familias mercantiles de la ciudad, que controla la Cámara de Comercio de Valdris y ejerce un enorme peso financiero.",
      status: "active", importance: "normal",
      metadata: {
        role: "Facción oportunista y amoral. Aliados o enemigos dependiendo puramente de los márgenes de beneficio mercantil.",
        goal: "Garantizar la seguridad de las rutas marítimas, reducir los aranceles del puerto y evitar disturbios que paralicen el comercio.",
        secret: "Tienen infiltrado a Dorian Vex en el Consejo, quien les vende las minutas y planes secretos del gobierno de Valdris antes de que se voten.",
      },
    },
  ];

  for (const fac of FACTIONS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...fac, actorId: "usr_dm" });
  }
  console.log(`✓ ${FACTIONS.length} factions created`);
}
