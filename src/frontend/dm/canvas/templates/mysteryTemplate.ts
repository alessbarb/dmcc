import type { CanvasTemplateFactory } from "./types.js";

export const mysteryTemplate: CanvasTemplateFactory = (t) => ({
  id: "mystery",
  entities: [
    { entityType: "clue", title: "Incidente Inicial", summary: t("canvas.seedData.investigationTrigger") },
    { entityType: "npc", title: "Sospechoso Principal", subtitle: "Tiene una coartada dudosa", summary: "Un personaje clave en el misterio." },
    { entityType: "clue", title: "Pista Real", summary: "Una prueba irrefutable que apunta al sospechoso." },
    { entityType: "rumor", title: "Pista Falsa", summary: t("canvas.seedData.redHerring") },
    { entityType: "secret", title: t("canvas.seedData.centralSecret"), summary: "El secreto que el sospechoso intenta ocultar a toda costa.", visibility: { kind: "dm_only" } },
    { entityType: "quest", title: t("canvas.seedData.finalRevelation"), summary: "La escena donde se confronta al culpable." },
    { entityType: "consequence", title: "Consecuencia Mayor", summary: "El impacto de resolver o fallar el misterio." },
  ],
  nodes: [
    { entityIndex: 0, x: 100, y: 150 },
    { entityIndex: 1, x: 300, y: 150 },
    { entityIndex: 2, x: 500, y: 150 },
    { entityIndex: 3, x: 300, y: 300 },
    { entityIndex: 4, x: 500, y: 300 },
    { entityIndex: 5, x: 700, y: 150 },
    { entityIndex: 6, x: 700, y: 300 },
  ],
  relations: [
    { from: 0, to: 1, label: "apunta a" },
    { from: 0, to: 2, label: "revela" },
    { from: 1, to: 4, label: "oculta" },
    { from: 2, to: 4, label: "apunta a" },
    { from: 3, to: 1, label: "sospecha de" },
    { from: 4, to: 5, label: "desbloquea" },
    { from: 5, to: 6, label: "causa" },
  ],
});
