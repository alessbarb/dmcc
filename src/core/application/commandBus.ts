import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { NarrativeChangeContext } from "../domain/shared/narrativeChangeContext.js";
import type { Command } from "./commands.js";
import { handleStoryCommand } from "./storyCommandHandlers.js";
import { handleCanvasCommand } from "./canvasCommandHandlers.js";
import { handlePlayerPortalCommand } from "./playerPortalCommandHandlers.js";
import { handleNotebookCommand } from "./notebookCommandHandlers.js";
import { handleContentCommand } from "./contentCommandHandlers.js";
import { handleSessionCommand } from "./sessionCommandHandlers.js";
import { handleSupportCommand } from "./supportCommandHandlers.js";
import { handleCampaignCommand } from "./campaignCommandHandlers.js";
import { handleWorldCommand } from "./worldCommandHandlers.js";

export interface CommandResult {
  state: CampaignState;
  events: StoredEvent<unknown>[];
}

export function handleCommand(
  state: CampaignState,
  command: Command,
  narrativeContext?: NarrativeChangeContext,
): CommandResult {
  const result = dispatchCommand(state, command);
  if (!narrativeContext || !result) return result;
  return {
    state: result.state,
    events: result.events.map((event) => (event.context ? event : { ...event, context: narrativeContext })),
  };
}

function dispatchCommand(state: CampaignState, command: Command): CommandResult {
  switch (command.type) {
    case "CreateCampaign":
    case "UpdateCampaign":
      return handleCampaignCommand(state, command);
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
    case "ReviseSessionPlan":
    case "ActivatePlannedSession":
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
    case "AdvanceClock":
    case "TriggerConsequence":
    case "ResolveConsequence":
    case "ActivateFront":
    case "ResolveFront":
    case "HintSecret":
    case "UpdateObjectiveProgress":
      return handleWorldCommand(state, command);
  }
}
