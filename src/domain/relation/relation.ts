export * from "./types.js";

export function createRelation(props: {
  relationId: string;
  campaignId: string;
  source: any;
  target: any;
  relationType: string;
  description?: string;
  status?: string;
  visibility?: any;
  sourceSessionId?: string;
  sourceFactId?: string;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}): any {
  if (props.source.campaignId !== props.target.campaignId) {
    throw new Error("Relations must connect entities in the same campaign");
  }
  const now = new Date().toISOString();
  return {
    id: props.relationId,
    relationId: props.relationId,
    campaignId: props.campaignId,
    sourceEntityId: props.source.entityId || props.source.id,
    targetEntityId: props.target.entityId || props.target.id,
    relationType: props.relationType,
    description: props.description,
    status: props.status || "active",
    visibility: props.visibility || { kind: "dm_only" },
    sourceSessionId: props.sourceSessionId,
    sourceFactId: props.sourceFactId,
    archived: props.archived || false,
    createdAt: props.createdAt || now,
    updatedAt: props.updatedAt || now,
  };
}
