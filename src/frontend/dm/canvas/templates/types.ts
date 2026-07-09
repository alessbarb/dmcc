import type { CanvasEdgeStatus } from "../services/connectCanvasNodes.js";

type TranslationFn = (key: string, params?: Record<string, string | number>) => string;

export type CanvasTemplateEntityType =
  | "clue"
  | "consequence"
  | "creature"
  | "encounter"
  | "faction"
  | "item"
  | "location"
  | "npc"
  | "quest"
  | "rumor"
  | "scene"
  | "secret";

export interface CanvasTemplateEntity {
  entityType: CanvasTemplateEntityType;
  title: string;
  subtitle?: string;
  summary?: string;
  visibility?: { kind: "dm_only" | "public" };
}

export interface CanvasTemplateNode {
  entityIndex: number;
  x: number;
  y: number;
  groupKey?: string;
}

export interface CanvasTemplateGroup {
  key: string;
  title: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  groupType?: "faction" | "location" | string;
}

export interface CanvasTemplateRelation {
  from: number;
  to: number;
  label: string;
  status?: CanvasEdgeStatus;
  relationType?: string;
  description?: string;
  visibility?: "dm" | "public" | string;
  style?: "solid" | "dashed" | "dotted" | string;
}

export interface CanvasTemplateFact {
  statement: string;
  kind: string;
  confidence?: string;
  relatedEntityIndexes?: number[];
  relatedRelationIndexes?: number[];
  visibility?: { kind: "dm_only" | "public" };
}

export interface CanvasTemplate {
  id: string;
  entities: CanvasTemplateEntity[];
  nodes: CanvasTemplateNode[];
  groups?: CanvasTemplateGroup[];
  relations: CanvasTemplateRelation[];
  facts?: CanvasTemplateFact[];
}

export type CanvasTemplateFactory = (t: TranslationFn) => CanvasTemplate;
