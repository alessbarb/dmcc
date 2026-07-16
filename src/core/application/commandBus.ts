import { createId } from "@shared/ids.js";
import { createCampaign } from "../domain/campaign/campaign.js";
import { campaignSettingsSchema } from "../domain/campaign/types.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";
import { handleStoryCommand } from "./storyCommandHandlers.js";
import { handleCanvasCommand } from "./canvasCommandHandlers.js";
import { handlePlayerPortalCommand } from "./playerPortalCommandHandlers.js";
import { handleNotebookCommand } from "./notebookCommandHandlers.js";
import { handleContentCommand } from "./contentCommandHandlers.js";
import { handleSessionCommand } from "./sessionCommandHandlers.js";
import { handleSupportCommand } from "./supportCommandHandlers.js";

export interface CommandResult {
  state: CampaignState;
  events: StoredEvent[];
}

function singleEvent(state: CampaignState, event: StoredEvent): CommandResult {
  return { state, events: [event] };
}

export function handleCommand(state: CampaignState, command: Command): CommandResult {
  switch (command.type) {
    case "CreateCampaign": {
      const campaign = createCampaign({
        campaignId: command.campaignId,
        title: command.title,
        summary: command.summary,
        system: command.system,
        coverUrl: command.coverUrl,
        settings: command.settings ? campaignSettingsSchema.parse(command.settings) : undefined,
        metadata: command.metadata,
      });
      const nextState = { ...state, campaign };
      return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "CampaignCreated", campaign));
    }
    case "UpdateCampaign": {
      if (!state.campaign) throw new Error("Campaign not found");
      const title = command.title !== undefined ? command.title.trim() : undefined;
      if (title !== undefined && title.length === 0) {
        throw new Error("Campaign title is required");
      }
      const nextCampaign = {
        ...state.campaign,
        ...(title !== undefined && { title }),
        ...(command.summary !== undefined && { summary: command.summary }),
        ...(command.system !== undefined && { system: command.system }),
        ...(command.status !== undefined && { status: command.status }),
        ...(command.coverUrl !== undefined && { coverUrl: command.coverUrl }),
        ...(command.metadata !== undefined && { metadata: { ...state.campaign.metadata, ...command.metadata } }),
        updatedAt: new Date().toISOString(),
      };
      return singleEvent({ ...state, campaign: nextCampaign }, makeEvent(command.actorId, command.campaignId, "CampaignUpdated", {
        id: command.campaignId,
        campaignId: command.campaignId,
        ...(title !== undefined && { title }),
        ...(command.summary !== undefined && { summary: command.summary }),
        ...(command.system !== undefined && { system: command.system }),
        ...(command.status !== undefined && { status: command.status }),
        ...(command.coverUrl !== undefined && { coverUrl: command.coverUrl }),
        ...(command.metadata !== undefined && { metadata: nextCampaign.metadata }),
      }));
    }
    case "CreateEntity":
    case "CreateRelation":
    case "RecordFact":
    case "UpdateEntity":
    case "ArchiveEntity":
    case "UpdateRelation":
    case "ArchiveRelation":
    case "UpdateFact":
    case "ArchiveFact":
    case "RevealClue":
      return handleContentCommand(state, command);
    case "CreatePreparedSession":
    case "UpdateSessionPrep":
    case "ActivatePreparedSession":
    case "StartSession":
    case "CloseSession":
    case "CancelPreparedSession":
    case "ArchiveSession":
    case "RecordSessionEvent":
      return handleSessionCommand(state, command);
    case "UpdateCampaignSettings":
    case "CreatePlayerProfile":
    case "UpdatePlayerProfile":
    case "ArchivePlayerProfile":
    case "AddAttachment":
    case "RemoveAttachment":
    case "RecordImport":
    case "RecordExport":
    case "ChangeVisibility":
    case "RestoreBackup":
    case "CreateTag":
    case "AddTagToEntity":
    case "RemoveTagFromEntity":
      return handleSupportCommand(state, command);
    case "CreateCanvas":
    case "UpdateCanvas":
    case "ArchiveCanvas":
    case "PlaceNodeOnCanvas":
    case "UpdateCanvasNode":
    case "UpdateCanvasNodesLayout":
    case "RemoveNodeFromCanvas":
    case "AddEdgeToCanvas":
    case "UpdateCanvasEdge":
    case "RemoveEdgeFromCanvas":
      return handleCanvasCommand(state, command);
    case "CreatePlayerInvitation":
    case "ConsumePlayerInvitation":
    case "RevokePlayerInvitation":
    case "IssuePlayerToken":
    case "RevokePlayerToken":
    case "UpdatePlayerLiveStatus":
    case "UpsertPlayerResource":
    case "RemovePlayerResource":
    case "CreatePlayerPortalNote":
    case "UpdatePlayerPortalNote":
    case "ArchivePlayerPortalNote":
    case "CreatePlayerPortalObjective":
    case "UpdatePlayerPortalObjective":
    case "ArchivePlayerPortalObjective":
    case "LinkPlayerCharacter":
    case "UnlinkPlayerCharacter":
    case "CreatePlayerCharacterProposal":
    case "ResolvePlayerCharacterProposal":
      return handlePlayerPortalCommand(state, command);
    case "DuplicateCampaign": {
      throw new Error("DuplicateCampaign must be handled by the repository layer, not the command bus");
    }
    case "ConvertCanvasNoteToEntity":
      return handleCanvasCommand(state, command);
    case "CreateNotebook":
    case "UpdateNotebook":
    case "ArchiveNotebook":
    case "AddNotebookItem":
    case "RemoveNotebookItem":
    case "ReorderNotebookItems":
      return handleNotebookCommand(state, command);
    case "CreateStoryThread":
    case "UpdateStoryThread":
    case "ArchiveStoryThread":
    case "ReorderStoryThreads":
    case "ActivateStoryThread":
    case "ResolveStoryThread":
    case "DiscardStoryThread":
    case "CreateStoryStep":
    case "UpdateStoryStep":
    case "ScheduleStoryStep":
    case "DeferStoryStep":
    case "UnscheduleStoryStep":
    case "MarkStoryStepReady":
    case "ActivateStoryStep":
    case "ReconcileStoryStep":
    case "ReorderStorySteps":
    case "LinkEntityToStoryThread":
    case "UnlinkEntityFromStoryThread":
    case "LinkEntityToStoryStep":
    case "UnlinkEntityFromStoryStep":
      return handleStoryCommand(state, command);

  }
}

function makeEvent<TPayload>(actorId: string, campaignId: CampaignState["campaignId"], type: StoredEvent["type"], payload: TPayload): StoredEvent<TPayload> {
  return {
    sequence: 0,
    eventId: createId("evt"),
    campaignId,
    type,
    occurredAt: new Date().toISOString(),
    actorId,
    payload,
    schemaVersion: 1,
  };
}
