import type { StoredEvent } from "../../domain/shared/events.js";
import { activityIdForSource } from "./activityId.js";

export function projectDomainEventToActivity(event: StoredEvent): any[] {
  const { eventId, campaignId, type, occurredAt, actorId, payload } = event;
  if (!campaignId) return [];

  const base = {
    activityId: activityIdForSource({ campaignId, sourceKind: "domain_event", sourceId: eventId }),
    campaignId,
    sourceKind: "domain_event" as const,
    sourceId: eventId,
    actorUserId: actorId === "system" ? null : actorId,
    occurredAt: new Date(occurredAt),
    sessionId: null as string | null,
    targetType: null as string | null,
    targetId: null as string | null,
  };

  switch (type) {
    case "CampaignCreated":
      return [{
        ...base,
        type: "campaign.created",
        category: "collaboration",
        data: { title: payload?.title || "" },
      }];
    case "CampaignUpdated":
      return [{
        ...base,
        type: "campaign.updated",
        category: "collaboration",
        data: { title: payload?.title || "" },
      }];
    case "PlayerProfileCreated":
      return [{
        ...base,
        type: "player.profile.created",
        category: "people",
        data: { profileId: payload?.profileId, name: payload?.name, displayName: payload?.displayName },
        targetType: "player_profile",
        targetId: payload?.profileId,
      }];
    case "PlayerProfileUpdated":
      return [{
        ...base,
        type: "player.profile.updated",
        category: "people",
        data: { profileId: payload?.profileId, name: payload?.name, displayName: payload?.displayName },
        targetType: "player_profile",
        targetId: payload?.profileId,
      }];
    case "PlayerProfileArchived":
      return [{
        ...base,
        type: "player.profile.archived",
        category: "people",
        data: { profileId: payload?.profileId },
        targetType: "player_profile",
        targetId: payload?.profileId,
      }];
    case "PlayerInvitationCreated":
      return [{
        ...base,
        type: "player.invitation.created",
        category: "people",
        data: { invitationId: payload?.invitationId, role: payload?.role },
        targetType: "player_invitation",
        targetId: payload?.invitationId,
      }];
    case "PlayerInvitationConsumed":
      return [{
        ...base,
        type: "player.invitation.consumed",
        category: "people",
        data: { invitationId: payload?.invitationId, userId: payload?.userId },
        targetType: "player_invitation",
        targetId: payload?.invitationId,
      }];
    case "PlayerInvitationRevoked":
      return [{
        ...base,
        type: "player.invitation.revoked",
        category: "people",
        data: { invitationId: payload?.invitationId },
        targetType: "player_invitation",
        targetId: payload?.invitationId,
      }];
    case "EntityCreated":
      return [{
        ...base,
        type: "entity.created",
        category: "content",
        data: { entityId: payload?.entityId || payload?.id, name: payload?.name || payload?.title, type: payload?.type || payload?.entityType },
        targetType: "entity",
        targetId: payload?.entityId || payload?.id,
      }];
    case "EntityUpdated":
      return [{
        ...base,
        type: "entity.updated",
        category: "content",
        data: { entityId: payload?.entityId || payload?.id, name: payload?.name || payload?.title, type: payload?.type || payload?.entityType },
        targetType: "entity",
        targetId: payload?.entityId || payload?.id,
      }];
    case "EntityArchived":
      return [{
        ...base,
        type: "entity.archived",
        category: "content",
        data: { entityId: payload?.entityId || payload?.id },
        targetType: "entity",
        targetId: payload?.entityId || payload?.id,
      }];
    case "RelationCreated":
      return [{
        ...base,
        type: "relation.created",
        category: "content",
        data: { relationId: payload?.relationId || payload?.id, sourceId: payload?.sourceId, targetId: payload?.targetId, type: payload?.type || payload?.relationType },
        targetType: "relation",
        targetId: payload?.relationId || payload?.id,
      }];
    case "RelationUpdated":
      return [{
        ...base,
        type: "relation.updated",
        category: "content",
        data: { relationId: payload?.relationId || payload?.id, sourceId: payload?.sourceId, targetId: payload?.targetId, type: payload?.type || payload?.relationType },
        targetType: "relation",
        targetId: payload?.relationId || payload?.id,
      }];
    case "RelationArchived":
      return [{
        ...base,
        type: "relation.archived",
        category: "content",
        data: { relationId: payload?.relationId || payload?.id },
        targetType: "relation",
        targetId: payload?.relationId || payload?.id,
      }];
    case "FactCreated":
      return [{
        ...base,
        type: "fact.created",
        category: "content",
        data: { factId: payload?.factId || payload?.id, title: payload?.title || payload?.statement },
        targetType: "fact",
        targetId: payload?.factId || payload?.id,
      }];
    case "FactUpdated":
      return [{
        ...base,
        type: "fact.updated",
        category: "content",
        data: { factId: payload?.factId || payload?.id, title: payload?.title || payload?.statement },
        targetType: "fact",
        targetId: payload?.factId || payload?.id,
      }];
    case "FactArchived":
      return [{
        ...base,
        type: "fact.archived",
        category: "content",
        data: { factId: payload?.factId || payload?.id },
        targetType: "fact",
        targetId: payload?.factId || payload?.id,
      }];
    case "SessionCreated":
      return [{
        ...base,
        type: "session.created",
        category: "session",
        sessionId: payload?.sessionId || payload?.id,
        data: { sessionId: payload?.sessionId || payload?.id, sessionNumber: payload?.sessionNumber || payload?.number, title: payload?.title },
        targetType: "session",
        targetId: payload?.sessionId || payload?.id,
      }];
    case "SessionStarted":
      return [{
        ...base,
        type: "session.started",
        category: "session",
        sessionId: payload?.sessionId || payload?.id,
        data: { sessionId: payload?.sessionId || payload?.id, sessionNumber: payload?.sessionNumber || payload?.number, title: payload?.title },
        targetType: "session",
        targetId: payload?.sessionId || payload?.id,
      }];
    case "SessionClosed":
      return [{
        ...base,
        type: "session.closed",
        category: "session",
        sessionId: payload?.sessionId || payload?.id,
        data: { sessionId: payload?.sessionId || payload?.id, sessionNumber: payload?.sessionNumber || payload?.number, title: payload?.title },
        targetType: "session",
        targetId: payload?.sessionId || payload?.id,
      }];
    case "SessionCancelled":
      return [{
        ...base,
        type: "session.cancelled",
        category: "session",
        sessionId: payload?.sessionId || payload?.id,
        data: { sessionId: payload?.sessionId || payload?.id, sessionNumber: payload?.sessionNumber || payload?.number, title: payload?.title },
        targetType: "session",
        targetId: payload?.sessionId || payload?.id,
      }];
    case "SessionArchived":
      return [{
        ...base,
        type: "session.archived",
        category: "session",
        sessionId: payload?.sessionId || payload?.id,
        data: { sessionId: payload?.sessionId || payload?.id },
        targetType: "session",
        targetId: payload?.sessionId || payload?.id,
      }];
    case "AttachmentAdded":
      return [{
        ...base,
        type: "attachment.added",
        category: "content",
        data: { attachmentId: payload?.attachmentId || payload?.id, name: payload?.name },
        targetType: "attachment",
        targetId: payload?.attachmentId || payload?.id,
      }];
    case "AttachmentRemoved":
      return [{
        ...base,
        type: "attachment.removed",
        category: "content",
        data: { attachmentId: payload?.attachmentId || payload?.id },
        targetType: "attachment",
        targetId: payload?.attachmentId || payload?.id,
      }];
    case "CanvasCreated":
      return [{
        ...base,
        type: "canvas.created",
        category: "content",
        data: { canvasId: payload?.id, title: payload?.title },
        targetType: "canvas",
        targetId: payload?.id,
      }];
    case "CanvasUpdated":
      return [{
        ...base,
        type: "canvas.updated",
        category: "content",
        data: { canvasId: payload?.id, title: payload?.title },
        targetType: "canvas",
        targetId: payload?.id,
      }];
    case "CanvasArchived":
      return [{
        ...base,
        type: "canvas.archived",
        category: "content",
        data: { canvasId: payload?.id },
        targetType: "canvas",
        targetId: payload?.id,
      }];
    case "NotebookCreated":
      return [{
        ...base,
        type: "notebook.created",
        category: "content",
        data: { notebookId: payload?.notebookId, title: payload?.title },
        targetType: "notebook",
        targetId: payload?.notebookId,
      }];
    case "NotebookUpdated":
      return [{
        ...base,
        type: "notebook.updated",
        category: "content",
        data: { notebookId: payload?.notebookId, title: payload?.title },
        targetType: "notebook",
        targetId: payload?.notebookId,
      }];
    case "NotebookArchived":
      return [{
        ...base,
        type: "notebook.archived",
        category: "content",
        data: { notebookId: payload?.notebookId },
        targetType: "notebook",
        targetId: payload?.notebookId,
      }];
    case "StoryThreadCreated":
      return [{
        ...base,
        type: "story_thread.created",
        category: "story",
        data: { threadId: payload?.threadId, title: payload?.title },
        targetType: "story_thread",
        targetId: payload?.threadId,
      }];
    case "StoryThreadUpdated":
      return [{
        ...base,
        type: "story_thread.updated",
        category: "story",
        data: { threadId: payload?.threadId, title: payload?.title },
        targetType: "story_thread",
        targetId: payload?.threadId,
      }];
    case "StoryThreadArchived":
      return [{
        ...base,
        type: "story_thread.archived",
        category: "story",
        data: { threadId: payload?.threadId },
        targetType: "story_thread",
        targetId: payload?.threadId,
      }];
    case "StoryStepCreated":
      return [{
        ...base,
        type: "story_step.created",
        category: "story",
        data: { stepId: payload?.stepId, title: payload?.title },
        targetType: "story_step",
        targetId: payload?.stepId,
      }];
    case "StoryStepUpdated":
      return [{
        ...base,
        type: "story_step.updated",
        category: "story",
        data: { stepId: payload?.stepId, title: payload?.title },
        targetType: "story_step",
        targetId: payload?.stepId,
      }];
    case "StoryStepScheduled":
      return [{
        ...base,
        type: "story_step.scheduled",
        category: "story",
        data: { stepId: payload?.stepId, plannedSessionId: payload?.plannedSessionId, plannedSessionOrder: payload?.plannedSessionOrder },
        targetType: "story_step",
        targetId: payload?.stepId,
      }];
    case "StoryStepDeferred":
      return [{
        ...base,
        type: "story_step.deferred",
        category: "story",
        data: { stepId: payload?.stepId, plannedSessionId: payload?.plannedSessionId, plannedSessionOrder: payload?.plannedSessionOrder },
        targetType: "story_step",
        targetId: payload?.stepId,
      }];
    case "StoryStepUnscheduled":
      return [{
        ...base,
        type: "story_step.unscheduled",
        category: "story",
        data: { stepId: payload?.stepId },
        targetType: "story_step",
        targetId: payload?.stepId,
      }];
    case "StoryStepReconciled":
      return [{
        ...base,
        type: "story_step.reconciled",
        category: "story",
        data: { stepId: payload?.stepId, resolvedSessionId: payload?.resolvedSessionId, status: payload?.status, resolutionKind: payload?.resolutionKind, actualOutcome: payload?.actualOutcome },
        targetType: "story_step",
        targetId: payload?.stepId,
      }];
    default:
      return [];
  }
}
