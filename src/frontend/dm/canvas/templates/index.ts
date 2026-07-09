import { cityTemplate } from "./cityTemplate.js";
import { dungeonTemplate } from "./dungeonTemplate.js";
import { factionTemplate } from "./factionTemplate.js";
import { mysteryTemplate } from "./mysteryTemplate.js";
import { sessionTemplate } from "./sessionTemplate.js";
import type { CanvasTemplate, CanvasTemplateFactory } from "./types.js";

const templateFactories: Record<string, CanvasTemplateFactory> = {
  city: cityTemplate,
  dungeon: dungeonTemplate,
  faction: factionTemplate,
  mystery: mysteryTemplate,
  session: sessionTemplate,
};

export const getCanvasTemplate = (
  templateId: string,
  t: Parameters<CanvasTemplateFactory>[0],
): CanvasTemplate | undefined => templateFactories[templateId]?.(t);

export type { CanvasTemplate } from "./types.js";
