import type { Entity } from "../entity/types.js";
import type { Relation, RelationStatus } from "./types.js";
export * from "./types.js";

export function createRelation(props: {
  relationId: string;
  campaignId: string;
  source: Entity;
  target: Entity;
  relationType: string;
  description?: string;
  status?: RelationStatus;
  visibility?: unknown;
  sourceSessionId?: string;
  sourceFactId?: string;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}): Relation {
  if (props.source.campaignId !== props.target.campaignId) {
    throw new Error("Relations must connect entities in the same campaign");
  }
  const now = new Date().toISOString();
  return {
    id: props.relationId,
    relationId: props.relationId,
    campaignId: props.campaignId,
    sourceEntityId: props.source.entityId || props.source.id || "",
    targetEntityId: props.target.entityId || props.target.id || "",
    relationType: props.relationType,
    description: props.description,
    status: props.status || "active",
    visibility: (props.visibility || { kind: "dm_only" }) as Relation["visibility"],
    sourceSessionId: props.sourceSessionId,
    sourceFactId: props.sourceFactId,
    archived: props.archived || false,
    createdAt: props.createdAt || now,
    updatedAt: props.updatedAt || now,
  };
}
