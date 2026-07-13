import { entitySchema, type Entity, type EntityType, type EntityImportance } from "./types.js";
import { validatePlayerCharacterMetadata } from "./metadata.js";
export * from "./types.js";

export function createEntity(props: {
  entityId: string;
  campaignId: string;
  entityType: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  status?: string;
  importance?: string;
  visibility?: { kind: string } | { mode: string };
  metadata?: Record<string, unknown>;
  tagIds?: string[];
  createdInSessionId?: string;
  firstSeenSessionId?: string;
  lastSeenSessionId?: string;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  campaignSystem?: string;
}): Entity {
  if (!props.title || props.title.trim() === "") {
    throw new Error("Entity title is required");
  }
  const now = new Date().toISOString();
  const metadata: Record<string, unknown> = props.metadata ? { ...props.metadata } : {};
  
  const content = metadata.content;
  if (props.entityType === "clue" && (typeof content !== "string" || content.trim() === "")) {
    metadata.content = "...";
  }
  
  const truth = metadata.truth;
  if (props.entityType === "secret" && (typeof truth !== "string" || truth.trim() === "")) {
    metadata.truth = "...";
  }

  if (props.entityType === "player_character") {
    validatePlayerCharacterMetadata(metadata, props.campaignSystem);
  }


  if (props.entityType === "decision") {
    if (metadata.decisionText === undefined) {
      metadata.decisionText = props.content || props.summary || props.title || "";
    }
    if (metadata.sessionId === undefined) {
      metadata.sessionId = props.metadata?.sessionId || "sess_unknown";
    }
  }
  if (props.entityType === "front" && metadata.goal === undefined) {
    metadata.goal = props.content || props.summary || props.title || "Goal";
  }
  if (props.entityType === "clock") {
    if (metadata.maxSegments === undefined) metadata.maxSegments = 4;
    if (metadata.currentSegments === undefined) metadata.currentSegments = 0;
    if (metadata.meaning === undefined) metadata.meaning = props.title || "Meaning";
  }

  const entity = {
    id: props.entityId,
    entityId: props.entityId,
    campaignId: props.campaignId,
    entityType: props.entityType as EntityType,
    title: props.title,
    subtitle: props.subtitle,
    summary: props.summary,
    content: props.content,
    status: props.status || "",
    importance: (props.importance || "normal") as EntityImportance,
    visibility: (props.visibility || { kind: "dm_only" }) as Entity["visibility"],
    metadata: metadata,
    tagIds: props.tagIds || [],
    tags: props.tagIds || [],
    ...(props.createdInSessionId && { createdInSessionId: props.createdInSessionId }),
    ...(props.firstSeenSessionId && { firstSeenSessionId: props.firstSeenSessionId }),
    ...(props.lastSeenSessionId && { lastSeenSessionId: props.lastSeenSessionId }),
    archived: props.archived || false,
    createdAt: props.createdAt || now,
    updatedAt: props.updatedAt || now,
  };

  entitySchema.parse(entity);
  return entity;
}
