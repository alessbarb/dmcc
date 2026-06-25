import type { CampaignId, EntityId, FactId, RelationId, SessionId } from "../shared/ids.js";
import type { EntityImportance, EntityType } from "../domain/entity/entity.js";
import type { FactConfidence, FactKind, FactSource } from "../domain/fact/fact.js";
import type { RelationType } from "../domain/relation/relation.js";
import type { VisibilityRule } from "../domain/visibility/visibility.js";

export type Command =
  | {
      type: "CreateCampaign";
      campaignId: CampaignId;
      actorId: string;
      title: string;
      summary?: string;
      system?: string;
      settings?: any;
    }
  | {
      type: "CreateEntity";
      campaignId: CampaignId;
      actorId: string;
      entityId?: EntityId;
      entityType: EntityType;
      title: string;
      summary?: string;
      content?: string;
      status?: string;
      importance?: EntityImportance;
      visibility?: VisibilityRule;
      metadata?: Record<string, unknown>;
    }
  | {
      type: "CreateRelation";
      campaignId: CampaignId;
      actorId: string;
      relationId?: RelationId;
      sourceEntityId: EntityId;
      targetEntityId: EntityId;
      relationType: RelationType;
      description?: string;
      visibility?: VisibilityRule;
      allowDuplicate?: boolean;
      sourceSessionId?: SessionId;
      sourceFactId?: FactId;
    }
  | {
      type: "RecordFact";
      campaignId: CampaignId;
      actorId: string;
      factId?: FactId;
      statement: string;
      kind: FactKind;
      confidence: FactConfidence;
      visibility?: VisibilityRule;
      relatedEntityIds: EntityId[];
      relatedRelationIds?: RelationId[];
      source: FactSource;
    }
  | {
      type: "StartSession";
      campaignId: CampaignId;
      actorId: string;
      sessionId?: SessionId;
      title: string;
    }
  | {
      type: "CloseSession";
      campaignId: CampaignId;
      actorId: string;
      sessionId: SessionId;
      summary: string;
    }
  | {
      type: "UpdateEntity";
      campaignId: CampaignId;
      actorId: string;
      entityId: EntityId;
      title?: string;
      summary?: string;
      content?: string;
      status?: string;
      importance?: EntityImportance;
      visibility?: VisibilityRule;
      metadata?: Record<string, unknown>;
    }
  | {
      type: "ArchiveEntity";
      campaignId: CampaignId;
      actorId: string;
      entityId: EntityId;
    }
  | {
      type: "UpdateRelation";
      campaignId: CampaignId;
      actorId: string;
      relationId: RelationId;
      description?: string;
      visibility?: VisibilityRule;
    }
  | {
      type: "ArchiveRelation";
      campaignId: CampaignId;
      actorId: string;
      relationId: RelationId;
    }
  | {
      type: "UpdateFact";
      campaignId: CampaignId;
      actorId: string;
      factId: FactId;
      statement?: string;
      kind?: FactKind;
      confidence?: FactConfidence;
      visibility?: VisibilityRule;
    }
  | {
      type: "ArchiveFact";
      campaignId: CampaignId;
      actorId: string;
      factId: FactId;
    }
  | {
      type: "RevealClue";
      campaignId: CampaignId;
      actorId: string;
      clueEntityId: EntityId;
      sessionId: SessionId;
      audience: VisibilityRule;
      note?: string;
    }
  | {
      type: "UpdateCampaignSettings";
      campaignId: CampaignId;
      actorId: string;
      settings: Partial<{
        backupOnClose: boolean;
        lanModeEnabled: boolean;
        activeQuestsLimit: number;
        localAccessCodeHash?: string;
        localAccessCode?: string;
      }>;
    }
  | {
      type: "CreatePlayerProfile";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      name?: string;
      displayName?: string;
      email?: string | null;
      imageUrl?: string;
      role?: string;
      color?: string;
    }
  | {
      type: "UpdatePlayerProfile";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      displayName?: string;
      email?: string | null;
      imageUrl?: string;
      role?: string;
      color?: string;
      isActive?: boolean;
    }
  | {
      type: "ArchivePlayerProfile";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
    }
  | {
      type: "AddAttachment";
      campaignId: CampaignId;
      actorId: string;
      attachmentId: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
    }
  | {
      type: "RemoveAttachment";
      campaignId: CampaignId;
      actorId: string;
      attachmentId: string;
    }
  | {
      type: "RecordImport";
      campaignId: CampaignId;
      actorId: string;
      importId: string;
      format: string;
      count: number;
    }
  | {
      type: "RecordExport";
      campaignId: CampaignId;
      actorId: string;
      exportId: string;
      format: string;
    }
  | {
      type: "ChangeVisibility";
      campaignId: CampaignId;
      actorId: string;
      targetId: string;
      targetType: "entity" | "relation" | "fact";
      visibility: VisibilityRule;
    }
  | {
      type: "RecordSessionEvent";
      campaignId: CampaignId;
      actorId: string;
      sessionEventId?: string;
      sessionId: SessionId;
      eventType: string;
      title: string;
      description?: string;
      relatedEntityIds?: string[];
      relatedFactIds?: string[];
      relatedRelationIds?: string[];
      visibility?: VisibilityRule;
      metadata?: Record<string, unknown>;
    };
