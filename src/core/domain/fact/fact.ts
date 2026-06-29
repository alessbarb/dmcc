import type { CampaignId, EntityId, FactId, RelationId } from "@shared/ids.js";
import { dmOnlyVisibility, type VisibilityRule } from "../visibility/visibility.js";
import type { FactKind, FactConfidence, FactSource } from "./types.js";

export type { FactKind, FactConfidence, FactSource };

export interface Fact {
  id?: FactId;
  factId: FactId;
  campaignId: CampaignId;
  statement: string;
  kind: FactKind;
  confidence: FactConfidence;
  visibility: VisibilityRule;
  relatedEntityIds: EntityId[];
  relatedRelationIds: RelationId[];
  source: FactSource;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function createFact(input: Omit<Fact, "archived" | "visibility" | "relatedRelationIds"> & Partial<Pick<Fact, "visibility" | "relatedRelationIds" | "id" | "createdAt" | "updatedAt">>): Fact {
  if (input.statement.trim().length === 0) {
    throw new Error("Fact statement is required");
  }
  const now = new Date().toISOString();
  return {
    ...input,
    id: input.id || input.factId,
    visibility: input.visibility ?? dmOnlyVisibility,
    relatedRelationIds: input.relatedRelationIds ?? [],
    archived: false,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}
