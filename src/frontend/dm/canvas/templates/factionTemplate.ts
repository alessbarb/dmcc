import type { CanvasTemplateFactory } from "./types.js";

export const factionTemplate: CanvasTemplateFactory = (t) => ({
  id: "faction",
  groups: [{ key: "hq", title: "Cuartel General", color: "purple", x: 80, y: 60, width: 320, height: 350, groupType: "faction" }],
  entities: [
    { entityType: "npc", title: t("canvas.seedData.factionLeader"), subtitle: "Dirige con mano de hierro" },
    { entityType: "npc", title: "Mano Derecha", subtitle: "Ejecuta los planes" },
    { entityType: "item", title: "Recurso Clave", summary: "Un artefacto o tesoro que les da poder." },
    { entityType: "secret", title: "Plan Oculto", summary: "Su objetivo secreto.", visibility: { kind: "dm_only" } },
    { entityType: "faction", title: t("canvas.seedData.enemyFaction"), subtitle: "Su gran rival" },
    { entityType: "quest", title: "Objetivo Principal", summary: t("canvas.seedData.missionToStop") },
  ],
  nodes: [
    { entityIndex: 0, x: 300, y: 100, groupKey: "hq" },
    { entityIndex: 1, x: 300, y: 280, groupKey: "hq" },
    { entityIndex: 2, x: 100, y: 190 },
    { entityIndex: 3, x: 500, y: 100 },
    { entityIndex: 4, x: 100, y: 380 },
    { entityIndex: 5, x: 500, y: 280 },
  ],
  relations: [
    { from: 0, to: 1, label: "lidera" },
    { from: 0, to: 2, label: "custodia" },
    { from: 0, to: 3, label: "planea" },
    { from: 0, to: 4, label: "enemigo de" },
    { from: 3, to: 5, label: "desbloquea" },
  ],
});
