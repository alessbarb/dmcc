import type { CanvasTemplateFactory } from "./types.js";

export const cityTemplate: CanvasTemplateFactory = (t) => ({
  id: "city",
  groups: [{ key: "market", title: "Distrito Comercial", color: "green", x: 100, y: 100, width: 480, height: 420, groupType: "location" }],
  entities: [
    { entityType: "location", title: "Plaza Mayor", subtitle: t("canvas.seedData.publicMeetingPoint") },
    { entityType: "location", title: "Taberna Local", subtitle: "Rumores y contactos" },
    { entityType: "location", title: t("canvas.seedData.darkAlley"), subtitle: "Actividad criminal", visibility: { kind: "dm_only" } },
    { entityType: "npc", title: "Tabernero", subtitle: "Sabe todos los chismes" },
    { entityType: "faction", title: "Guardia de la Ciudad", subtitle: "Mantiene el orden" },
    { entityType: "rumor", title: "Rumor Callejero", summary: "Una pista sobre un robo inminente." },
  ],
  nodes: [
    { entityIndex: 0, x: 150, y: 150, groupKey: "market" },
    { entityIndex: 1, x: 400, y: 150, groupKey: "market" },
    { entityIndex: 2, x: 650, y: 150 },
    { entityIndex: 3, x: 400, y: 350, groupKey: "market" },
    { entityIndex: 4, x: 150, y: 350 },
    { entityIndex: 5, x: 650, y: 350 },
  ],
  relations: [
    { from: 1, to: 3, label: "trabaja en" },
    { from: 4, to: 0, label: "patrulla" },
    { from: 3, to: 5, label: "conoce" },
    { from: 5, to: 2, label: "apunta a" },
  ],
});
