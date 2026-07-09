import type { CanvasTemplateFactory } from "./types.js";

export const sessionTemplate: CanvasTemplateFactory = (t) => ({
  id: "session",
  entities: [
    { entityType: "scene", title: t("canvas.seedData.scene1"), summary: t("canvas.seedData.scene1Desc") },
    { entityType: "scene", title: t("canvas.seedData.scene2"), summary: "Investigan el lugar del incidente." },
    { entityType: "scene", title: "Escena 3: Combate", summary: "Encuentro con las criaturas." },
    { entityType: "scene", title: "Escena 4: Cierre", summary: t("canvas.seedData.sessionResolution") },
    { entityType: "consequence", title: "Consecuencia Inmediata", summary: t("canvas.seedData.nextSessionChanges") },
  ],
  nodes: [
    { entityIndex: 0, x: 100, y: 200 },
    { entityIndex: 1, x: 300, y: 200 },
    { entityIndex: 2, x: 500, y: 200 },
    { entityIndex: 3, x: 700, y: 200 },
    { entityIndex: 4, x: 900, y: 200 },
  ],
  relations: [
    { from: 0, to: 1, label: "siguiente" },
    { from: 1, to: 2, label: "siguiente" },
    { from: 2, to: 3, label: "siguiente" },
    { from: 3, to: 4, label: "siguiente" },
  ],
});
