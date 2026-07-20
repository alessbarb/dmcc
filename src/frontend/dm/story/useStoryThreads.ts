import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { storyApi } from "../../shared/api.js";
import { readApiError } from "../../shared/api/apiClient.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export function useStoryThreads() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const store = useCampaignStore();
  const { campaignState, reloadCampaign, activeCampaignId } = store;

  const threads = campaignState?.storyThreads ?? [];
  const steps = campaignState?.storySteps ?? [];

  async function run(action: () => Promise<Response>, successMessage: string, fallbackError: string): Promise<boolean> {
    if (!activeCampaignId) return false;
    try {
      const res = await action();
      if (res.ok) {
        if (successMessage) addToast(successMessage, "success");
        await reloadCampaign();
        return true;
      }
      addToast(await readApiError(res, fallbackError), "error");
      return false;
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : fallbackError, "error");
      return false;
    }
  }

  return {
    threads,
    steps,

    createThread: (title: string, summary: string | null) =>
      run(
        () => storyApi.createStoryThread(activeCampaignId!, { title, summary }),
        t("story.threadCreated") || "Story thread created successfully",
        "Failed to create thread",
      ),

    archiveThread: (threadId: string) =>
      run(
        () => storyApi.deleteStoryThread(activeCampaignId!, threadId),
        t("story.threadArchived") || "Story thread archived",
        "Failed to archive thread",
      ),

    activateThread: (threadId: string) =>
      run(
        () => storyApi.activateStoryThread(activeCampaignId!, threadId),
        t("story.threadActivated") || "Story thread is now active",
        "Failed to activate thread",
      ),

    resolveThread: (threadId: string) =>
      run(
        () => storyApi.resolveStoryThread(activeCampaignId!, threadId),
        t("story.threadResolved") || "Story thread resolved successfully!",
        "Cannot resolve: ensure all steps are terminal",
      ),

    discardThread: (threadId: string) =>
      run(
        () => storyApi.discardStoryThread(activeCampaignId!, threadId),
        t("story.threadDiscarded") || "Story thread discarded",
        "Error discarding thread",
      ),

    createStep: (
      threadId: string,
      payload: { title: string; intent?: string | null; expectedOutcome?: string | null; sceneEntityId?: string | null },
    ) =>
      run(
        () => storyApi.createStoryStep(activeCampaignId!, threadId, payload),
        t("story.stepCreated") || "Story step created",
        "Error creating step",
      ),

    reorderSteps: (threadId: string, orderedStepIds: string[]) =>
      run(
        () => storyApi.reorderStorySteps(activeCampaignId!, threadId, { orderedStepIds }),
        "",
        "Error reordering steps",
      ),

    scheduleStep: (stepId: string, plannedSessionId: string) =>
      run(
        () => storyApi.scheduleStoryStep(activeCampaignId!, stepId, { plannedSessionId, plannedSessionOrder: 0 }),
        t("story.stepScheduled") || "Step scheduled to session",
        "Error scheduling step",
      ),

    deferStep: (stepId: string, plannedSessionId: string) =>
      run(
        () => storyApi.deferStoryStep(activeCampaignId!, stepId, { plannedSessionId, plannedSessionOrder: 0 }),
        t("story.stepDeferred") || "Step deferred successfully",
        "Error deferring step",
      ),

    unscheduleStep: (stepId: string) =>
      run(
        () => storyApi.unscheduleStoryStep(activeCampaignId!, stepId),
        t("story.stepUnscheduled") || "Step unscheduled",
        "Failed to unschedule step",
      ),

    markStepReady: (stepId: string) =>
      run(
        () => storyApi.markStoryStepReady(activeCampaignId!, stepId),
        t("story.ready"),
        "Failed to mark step ready",
      ),

    activateStep: (stepId: string) =>
      run(
        () => storyApi.activateStoryStep(activeCampaignId!, stepId),
        t("story.activate"),
        "Failed to activate step",
      ),

    reconcileStep: (
      stepId: string,
      payload: { resolvedSessionId: string; status: "resolved" | "discarded"; resolutionKind: "as_planned" | "changed" | "discarded"; actualOutcome: string | null },
    ) =>
      run(
        () => storyApi.reconcileStoryStep(activeCampaignId!, stepId, payload),
        t("story.stepReconciled") || "Step reconciled successfully",
        "Reconciliation failed",
      ),

    linkEntityToThread: (threadId: string, entityId: string) =>
      run(
        () => storyApi.linkEntityToStoryThread(activeCampaignId!, threadId, { entityId }),
        "",
        "Failed to link entity",
      ),

    unlinkEntityFromThread: (threadId: string, entityId: string) =>
      run(
        () => storyApi.unlinkEntityFromStoryThread(activeCampaignId!, threadId, { entityId }),
        "",
        "Failed to unlink entity",
      ),

    linkEntityToStep: (stepId: string, entityId: string) =>
      run(
        () => storyApi.linkEntityToStoryStep(activeCampaignId!, stepId, { entityId }),
        "",
        "Failed to link entity",
      ),

    unlinkEntityFromStep: (stepId: string, entityId: string) =>
      run(
        () => storyApi.unlinkEntityFromStoryStep(activeCampaignId!, stepId, { entityId }),
        "",
        "Failed to unlink entity",
      ),
  };
}
