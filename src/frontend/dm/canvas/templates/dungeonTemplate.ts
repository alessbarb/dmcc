import type { CanvasTemplateFactory } from "./types.js";

export const dungeonTemplate: CanvasTemplateFactory = (t) => ({
  id: "dungeon",
  groups: [{ key: "ruins", title: "Ruinas Olvidadas", color: "blue", x: 80, y: 90, width: 720, height: 350, groupType: "location" }],
  entities: [
    { entityType: "location", title: "Entrada Inundada", subtitle: "Nivel 1 de la mazmorra" },
    { entityType: "encounter", title: "Sala de Trampa", summary: "Trampa de flechas oculta." },
    { entityType: "creature", title: "Guardias Orco", summary: "Dos orcos montando guardia." },
    { entityType: "item", title: "Cofre del Tesoro", summary: "Contiene oro y una gema brilnetworkte." },
    { entityType: "secret", title: t("canvas.seedData.secretPassage"), summary: t("canvas.seedData.behindTapestry"), visibility: { kind: "dm_only" } },
    { entityType: "creature", title: "Jefe de la Mazmorra", subtitle: t("canvas.seedData.orcShaman") },
  ],
  nodes: [
    { entityIndex: 0, x: 100, y: 150, groupKey: "ruins" },
    { entityIndex: 1, x: 300, y: 150, groupKey: "ruins" },
    { entityIndex: 2, x: 500, y: 150, groupKey: "ruins" },
    { entityIndex: 3, x: 500, y: 320, groupKey: "ruins" },
    { entityIndex: 4, x: 300, y: 320, groupKey: "ruins" },
    { entityIndex: 5, x: 700, y: 150, groupKey: "ruins" },
  ],
  relations: [
    { from: 0, to: 1, label: "conecta con" },
    { from: 1, to: 2, label: "conecta con" },
    { from: 2, to: 5, label: "custodia" },
    { from: 2, to: 3, label: "protege" },
    { from: 4, to: 3, label: "conduce a" },
  ],
});
