import type { CampaignId, EntityId, FactId, RelationId, SessionId } from "@shared/ids.js";
import type { EntityImportance, EntityType } from "../domain/entity/entity.js";
import type { FactConfidence, FactKind, FactSource } from "../domain/fact/fact.js";
import type { RelationType } from "../domain/relation/relation.js";
import type { VisibilityRule } from "../domain/visibility/visibility.js";
import type { PlayerCharacterProposal } from "../domain/playerPortal/types.js";

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
      subtitle?: string;
      tagIds?: string[];
      createdInSessionId?: string;
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
      subtitle?: string;
      tagIds?: string[];
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
    }
  | {
      type: "RestoreBackup";
      campaignId: CampaignId;
      actorId: string;
      backupId: string;
    }
  | {
      type: "CreateTag";
      campaignId: CampaignId;
      actorId: string;
      tagId?: string;
      name: string;
      color?: string;
    }
  | {
      type: "AddTagToEntity";
      campaignId: CampaignId;
      actorId: string;
      entityId: EntityId;
      tagId: string;
    }
  | {
      type: "RemoveTagFromEntity";
      campaignId: CampaignId;
      actorId: string;
      entityId: EntityId;
      tagId: string;
    }
  | {
      type: "CreateCanvas";
      campaignId: CampaignId;
      actorId: string;
      canvasId?: string;
      title: string;
      kind: "world" | "session" | "mystery" | "location" | "characters" | "custom";
      description?: string;
      template?: boolean;
    }
  | {
      type: "UpdateCanvas";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
      title?: string;
      viewport?: { x: number; y: number; zoom: number };
      description?: string;
    }
  | {
      type: "ArchiveCanvas";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
    }
  | {
      type: "PlaceNodeOnCanvas";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
      node: {
        id?: string;
        kind: "entity" | "note" | "group" | "image" | "fact";
        entityId?: string;
        factId?: string;
        text?: string;
        title?: string;
        color?: "yellow" | "blue" | "green" | "pink" | "purple" | string;
        groupId?: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
        collapsed?: boolean;
        zIndex?: number;
        status?: "draft" | "ready" | "revealed" | "resolved";
        visibility?: "dm" | "public";
        metadata?: Record<string, unknown>;
      };
    }
  | {
      type: "UpdateCanvasNode";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
      nodeId: string;
      updates: {
        text?: string;
        title?: string;
        color?: "yellow" | "blue" | "green" | "pink" | "purple";
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        collapsed?: boolean;
        zIndex?: number;
        status?: "draft" | "ready" | "revealed" | "resolved";
        visibility?: "dm" | "public";
        metadata?: Record<string, unknown>;
      };
    }
  | {
      type: "UpdateCanvasNodesLayout";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
      nodeUpdates: Array<{
        nodeId: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
        parentId?: string | null;
        groupId?: string | null;
      }>;
    }
  | {
      type: "RemoveNodeFromCanvas";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
      nodeId: string;
    }
  | {
      type: "AddEdgeToCanvas";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
      edge: {
        id?: string;
        sourceNodeId: string;
        targetNodeId: string;
        relationshipId?: string;
        label?: string;
        status: "draft" | "domain";
        visibility?: "dm" | "public";
        style?: "solid" | "dashed" | "secret" | "weak" | "strong";
        metadata?: Record<string, unknown>;
      };
    }
  | {
      type: "UpdateCanvasEdge";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
      edgeId: string;
      updates: {
        label?: string;
        status?: "draft" | "domain";
        visibility?: "dm" | "public";
        style?: "solid" | "dashed" | "secret" | "weak" | "strong";
        metadata?: Record<string, unknown>;
      };
    }
  | {
      type: "RemoveEdgeFromCanvas";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
      edgeId: string;
    }
  | {
      type: "CreatePlayerInvitation";
      campaignId: CampaignId;
      actorId: string;
      inviteId: string;
      inviteTokenHash: string;
      label?: string;
      createdAt: string;
      expiresAt?: string;
    }
  | {
      type: "ConsumePlayerInvitation";
      campaignId: CampaignId;
      actorId: string;
      inviteId: string;
      playerId: string;
      emailHash: string;
      consumedAt: string;
    }
  | {
      type: "RevokePlayerInvitation";
      campaignId: CampaignId;
      actorId: string;
      inviteId: string;
    }
  | {
      type: "IssuePlayerToken";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      tokenId: string;
      tokenHash: string;
      label?: string;
      createdAt: string;
    }
  | {
      type: "RevokePlayerToken";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      tokenId: string;
      revokedAt: string;
    }
  | {
      type: "UpdatePlayerLiveStatus";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      characterEntityId: string;
      status: {
        hitPointsCurrent?: number;
        hitPointsMax?: number;
        armorClass?: number;
        inspiration?: boolean;
        conditions?: string[];
      };
      updatedBy: "player" | "dm";
      updatedAt: string;
    }
  | {
      type: "UpsertPlayerResource";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      characterEntityId: string;
      resource: {
        resourceId: string;
        label: string;
        current: number;
        max: number;
        recovery?: "short_rest" | "long_rest" | "manual";
      };
      updatedBy: "player" | "dm";
      updatedAt: string;
    }
  | {
      type: "RemovePlayerResource";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      characterEntityId: string;
      resourceId: string;
      removedAt: string;
    }
  | {
      type: "CreatePlayerPortalNote";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      noteId: string;
      title: string;
      content: string;
      visibility: "private" | "dm_visible";
      linkedEntityIds: string[];
      createdAt: string;
    }
  | {
      type: "UpdatePlayerPortalNote";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      noteId: string;
      title?: string;
      content?: string;
      visibility?: "private" | "dm_visible";
      linkedEntityIds?: string[];
      archived?: boolean;
      updatedAt: string;
    }
  | {
      type: "ArchivePlayerPortalNote";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      noteId: string;
      archivedAt: string;
    }
  | {
      type: "CreatePlayerPortalObjective";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      objectiveId: string;
      title: string;
      description?: string;
      kind: "personal" | "session" | "question_for_dm";
      status: "open" | "done" | "archived";
      visibility: "private" | "dm_visible";
      linkedEntityIds: string[];
      createdAt: string;
    }
  | {
      type: "UpdatePlayerPortalObjective";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      objectiveId: string;
      title?: string;
      description?: string;
      kind?: "personal" | "session" | "question_for_dm";
      status?: "open" | "done" | "archived";
      visibility?: "private" | "dm_visible";
      linkedEntityIds?: string[];
      updatedAt: string;
    }
  | {
      type: "ArchivePlayerPortalObjective";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      objectiveId: string;
      archivedAt: string;
    }
  | {
      type: "ConvertCanvasNoteToEntity";
      campaignId: CampaignId;
      actorId: string;
      canvasId: string;
      nodeId: string;
      entityType: EntityType;
      title: string;
      subtitle?: string;
      summary?: string;
      content?: string;
      status?: string;
      importance?: EntityImportance;
      visibility?: VisibilityRule;
      metadata?: Record<string, unknown>;
    }
  | {
      type: "LinkPlayerCharacter";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      characterEntityId: EntityId;
      ownership: "campaign_premade" | "player_owned";
      syncMode: "live_player_editable" | "dm_review_required";
      createdAt: string;
    }
  | {
      type: "UnlinkPlayerCharacter";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      characterEntityId: EntityId;
      removedAt: string;
    }
  | {
      type: "CreatePlayerCharacterProposal";
      campaignId: CampaignId;
      actorId: string;
      playerId: string;
      proposalId: string;
      targetCharacterEntityId?: EntityId;
      kind: "create_character" | "update_character_core" | "link_request";
      proposedChanges: Record<string, unknown>;
      createdAt: string;
    }
  | {
      type: "ResolvePlayerCharacterProposal";
      campaignId: CampaignId;
      actorId: string;
      proposal: PlayerCharacterProposal;
      status: "approved" | "rejected";
      dmResolutionNote?: string;
      resolvedAt: string;
      entityUpdate?: { entityId: EntityId; updates: Record<string, unknown> };
      linkUpdate?: {
        playerId: string;
        characterEntityId: string;
        ownership: "campaign_premade" | "player_owned";
        syncMode: "live_player_editable" | "dm_review_required";
        linkedAt: string;
      };
    };
