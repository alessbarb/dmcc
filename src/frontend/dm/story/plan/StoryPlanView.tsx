import React, { useEffect, useState } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { storyApi } from "../../../shared/api.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { useCampaignShortcuts } from "../../shortcuts/useCampaignShortcuts.js";
import {
  GitBranch,
  Plus,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Bookmark,
  BookmarkMinus,
  Play,
  CheckCircle2,
  Calendar,
  RotateCcw,
} from "lucide-react";

export function StoryPlanView() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const store = useCampaignStore();
  const { campaignState, reloadCampaign, activeCampaignId } = store;

  // Shortcuts
  const { shortcuts, addShortcut, removeShortcut } = useCampaignShortcuts(activeCampaignId ?? undefined);

  // States
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  
  // Thread creation
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [threadTitle, setThreadTitle] = useState("");
  const [threadSummary, setThreadSummary] = useState("");

  // Step creation
  const [isCreatingStep, setIsCreatingStep] = useState(false);
  const [stepTitle, setStepTitle] = useState("");
  const [stepIntent, setStepIntent] = useState("");
  const [stepExpectedOutcome, setStepExpectedOutcome] = useState("");
  const [stepSceneEntityId, setStepSceneEntityId] = useState("");

  // Reconciliation Dialog State
  const [reconcilingStepId, setReconcilingStepId] = useState<string | null>(null);
  const [reconcileSessionId, setReconcileSessionId] = useState("");
  const [reconcileStatus, setReconcileStatus] = useState<"resolved" | "discarded">("resolved");
  const [reconcileKind, setReconcileKind] = useState<"as_planned" | "changed" | "discarded">("as_planned");
  const [reconcileOutcome, setReconcileOutcome] = useState("");

  // Entity link states
  const [linkingToThread, setLinkingToThread] = useState(false);
  const [linkingToStepId, setLinkingToStepId] = useState<string | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState("");

  // Scheduling states
  const [schedulingStepId, setSchedulingStepId] = useState<string | null>(null);
  const [scheduleSessionId, setScheduleSessionId] = useState("");

  const threads = campaignState?.storyThreads ?? [];
  const steps = campaignState?.storySteps ?? [];
  const sessions = campaignState?.sessions ?? [];
  const entities = campaignState?.entities ?? [];

  const activeThreads = threads.filter((t) => !t.archivedAt).sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const requestedStepId = search.get("stepId");
    const requestedThreadId = search.get("threadId") ?? steps.find((step) => step.stepId === requestedStepId)?.threadId;
    if (requestedThreadId && activeThreads.some((thread) => thread.threadId === requestedThreadId)) {
      setSelectedThreadId(requestedThreadId);
    }
  }, [threads, steps]);
  const selectedThread = activeThreads.find((t) => t.threadId === selectedThreadId);

  const selectedThreadSteps = selectedThread
    ? steps.filter((s) => s.threadId === selectedThreadId).sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const isShortcutAdded = selectedThreadId
    ? shortcuts.some((s) => s.targetType === "story_thread" && s.targetId === selectedThreadId)
    : false;

  const handleToggleShortcut = async () => {
    if (!selectedThreadId || !activeCampaignId) return;
    try {
      if (isShortcutAdded) {
        const existing = shortcuts.find((shortcut) => shortcut.targetType === "story_thread" && shortcut.targetId === selectedThreadId);
        if (existing) await removeShortcut(existing.shortcutId);
        addToast(t("shortcuts.removedToast"), "success");
      } else {
        await addShortcut("story_thread", selectedThreadId);
        addToast(t("shortcuts.addedToast"), "success");
      }
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : t("common.error"), "error");
    }
  };

  const handleToggleStepShortcut = async (stepId: string) => {
    if (!activeCampaignId) return;
    const existing = shortcuts.find((shortcut) => shortcut.targetType === "story_step" && shortcut.targetId === stepId);
    try {
      if (existing) {
        await removeShortcut(existing.shortcutId);
        addToast(t("shortcuts.removedToast"), "success");
      } else {
        await addShortcut("story_step", stepId);
        addToast(t("shortcuts.addedToast"), "success");
      }
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : t("common.error"), "error");
    }
  };

  const handleCreateThread = async () => {
    if (!activeCampaignId || !threadTitle.trim()) return;
    try {
      const res = await storyApi.createStoryThread(activeCampaignId, {
        title: threadTitle.trim(),
        summary: threadSummary.trim() || null,
      });
      if (res.ok) {
        setThreadTitle("");
        setThreadSummary("");
        setIsCreatingThread(false);
        addToast(t("story.threadCreated") || "Story thread created successfully", "success");
        await reloadCampaign();
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to create thread", "error");
    }
  };

  const handleArchiveThread = async () => {
    if (!activeCampaignId || !selectedThreadId) return;
    if (!confirm(t("story.confirmArchiveThread") || "Are you sure you want to archive this story thread?")) return;
    try {
      const res = await storyApi.deleteStoryThread(activeCampaignId, selectedThreadId);
      if (res.ok) {
        setSelectedThreadId(null);
        addToast(t("story.threadArchived") || "Story thread archived", "success");
        await reloadCampaign();
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to archive thread", "error");
    }
  };

  const handleActivateThread = async () => {
    if (!activeCampaignId || !selectedThreadId) return;
    try {
      // Direct execute using the API wrapper that dispatches to Fastify Command boundary
      const res = await storyApi.activateStoryThread(activeCampaignId, selectedThreadId);
      if (res.ok) {
        addToast(t("story.threadActivated") || "Story thread is now active", "success");
        await reloadCampaign();
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to activate thread", "error");
    }
  };

  const handleResolveThread = async () => {
    if (!activeCampaignId || !selectedThreadId) return;
    try {
      const res = await storyApi.resolveStoryThread(activeCampaignId, selectedThreadId);
      if (res.ok) {
        addToast(t("story.threadResolved") || "Story thread resolved successfully!", "success");
        await reloadCampaign();
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.error || "Cannot resolve: ensure all steps are terminal", "error");
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Error resolving thread", "error");
    }
  };

  const handleDiscardThread = async () => {
    if (!activeCampaignId || !selectedThreadId) return;
    if (!confirm(t("story.confirmDiscardThread") || "Discard this story thread?")) return;
    try {
      const res = await storyApi.discardStoryThread(activeCampaignId, selectedThreadId);
      if (res.ok) {
        addToast(t("story.threadDiscarded") || "Story thread discarded", "success");
        await reloadCampaign();
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Error discarding thread", "error");
    }
  };

  const handleCreateStep = async () => {
    if (!activeCampaignId || !selectedThreadId || !stepTitle.trim()) return;
    try {
      const res = await storyApi.createStoryStep(activeCampaignId, selectedThreadId, {
        title: stepTitle.trim(),
        intent: stepIntent.trim() || null,
        expectedOutcome: stepExpectedOutcome.trim() || null,
        sceneEntityId: stepSceneEntityId || null,
      });
      if (res.ok) {
        setStepTitle("");
        setStepIntent("");
        setStepExpectedOutcome("");
        setStepSceneEntityId("");
        setIsCreatingStep(false);
        addToast(t("story.stepCreated") || "Story step created", "success");
        await reloadCampaign();
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Error creating step", "error");
    }
  };

  const handleReorderSteps = async (index: number, direction: "up" | "down") => {
    if (!activeCampaignId || !selectedThreadId) return;
    const reordered = [...selectedThreadSteps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reordered.length) return;

    // Swap
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orderedStepIds = reordered.map((s) => s.stepId);
    try {
      const res = await storyApi.reorderStorySteps(activeCampaignId, selectedThreadId, { orderedStepIds });
      if (res.ok) {
        await reloadCampaign();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleStep = async () => {
    if (!activeCampaignId || !schedulingStepId || !scheduleSessionId) return;
    try {
      const res = await storyApi.scheduleStoryStep(activeCampaignId, schedulingStepId, {
        plannedSessionId: scheduleSessionId,
        plannedSessionOrder: 0,
      });
      if (res.ok) {
        setSchedulingStepId(null);
        setScheduleSessionId("");
        addToast(t("story.stepScheduled") || "Step scheduled to session", "success");
        await reloadCampaign();
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Error scheduling step", "error");
    }
  };

  const handleDeferStep = async (stepId: string) => {
    if (!activeCampaignId) return;
    const step = steps.find((s) => s.stepId === stepId);
    if (!step || !step.plannedSessionId) return;
    try {
      // Find next session if available or just ask? Let's just prompt to select a session.
      const pSessionId = prompt("Enter next session ID to defer to:");
      if (!pSessionId) return;
      const res = await storyApi.deferStoryStep(activeCampaignId, stepId, {
        plannedSessionId: pSessionId,
        plannedSessionOrder: 0,
      });
      if (res.ok) {
        addToast(t("story.stepDeferred") || "Step deferred successfully", "success");
        await reloadCampaign();
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Error deferring step", "error");
    }
  };

  const handleUnscheduleStep = async (stepId: string) => {
    if (!activeCampaignId) return;
    try {
      const res = await storyApi.unscheduleStoryStep(activeCampaignId, stepId);
      if (res.ok) {
        addToast(t("story.stepUnscheduled") || "Step unscheduled", "success");
        await reloadCampaign();
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.error || "Failed to unschedule step", "error");
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Error unscheduling step", "error");
    }
  };

  const handleMarkStepReady = async (stepId: string) => {
    if (!activeCampaignId) return;
    try {
      const res = await storyApi.markStoryStepReady(activeCampaignId, stepId);
      if (res.ok) {
        addToast(t("story.ready"), "success");
        await reloadCampaign();
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.error || "Failed to mark step ready", "error");
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Error marking step ready", "error");
    }
  };

  const handleActivateStep = async (stepId: string) => {
    if (!activeCampaignId) return;
    try {
      const res = await storyApi.activateStoryStep(activeCampaignId, stepId);
      if (res.ok) {
        addToast(t("story.activate"), "success");
        await reloadCampaign();
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.error || "Failed to activate step", "error");
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Error activating step", "error");
    }
  };

  const handleReconcileStep = async () => {
    if (!activeCampaignId || !reconcilingStepId || !reconcileSessionId) return;
    if (reconcileKind === "changed" && !reconcileOutcome.trim()) {
      addToast(t("story.outcomeRequired") || "Actual outcome is required for changed resolution", "error");
      return;
    }
    try {
      const res = await storyApi.reconcileStoryStep(activeCampaignId, reconcilingStepId, {
        resolvedSessionId: reconcileSessionId,
        status: reconcileStatus,
        resolutionKind: reconcileKind,
        actualOutcome: reconcileOutcome.trim() || null,
      });
      if (res.ok) {
        setReconcilingStepId(null);
        setReconcileSessionId("");
        setReconcileOutcome("");
        addToast(t("story.stepReconciled") || "Step reconciled successfully", "success");
        await reloadCampaign();
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.error || "Reconciliation failed", "error");
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Error reconciling step", "error");
    }
  };

  const handleLinkEntityToThread = async () => {
    if (!activeCampaignId || !selectedThreadId || !selectedEntityId) return;
    try {
      const res = await storyApi.linkEntityToStoryThread(activeCampaignId, selectedThreadId, { entityId: selectedEntityId });
      if (res.ok) {
        setSelectedEntityId("");
        setLinkingToThread(false);
        await reloadCampaign();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlinkEntityFromThread = async (entityId: string) => {
    if (!activeCampaignId || !selectedThreadId) return;
    try {
      const res = await storyApi.unlinkEntityFromStoryThread(activeCampaignId, selectedThreadId, { entityId });
      if (res.ok) {
        await reloadCampaign();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkEntityToStep = async () => {
    if (!activeCampaignId || !linkingToStepId || !selectedEntityId) return;
    try {
      const res = await storyApi.linkEntityToStoryStep(activeCampaignId, linkingToStepId, { entityId: selectedEntityId });
      if (res.ok) {
        setSelectedEntityId("");
        setLinkingToStepId(null);
        await reloadCampaign();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlinkEntityFromStep = async (stepId: string, entityId: string) => {
    if (!activeCampaignId) return;
    try {
      const res = await storyApi.unlinkEntityFromStoryStep(activeCampaignId, stepId, { entityId });
      if (res.ok) {
        await reloadCampaign();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper getters
  const getPlannedSessions = () => sessions.filter((s) => s.status === "planned");
  const getClosedSessions = () => sessions.filter((s) => s.status === "closed");
  const getLinkableEntities = (existingIds: string[]) => {
    const ids = new Set(existingIds);
    return entities.filter((e) => !e.archived && !ids.has(e.entityId));
  };

  return (
    <div className="story-plan-workspace">
      {/* SIDEBAR: Threads list */}
      <div
        className="story-sidebar glass-panel"
      >
        <div className="story-plan-section-header">
          <h3 className="story-plan-title">{t("story.threads") || "Hilos Narrativos"}</h3>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setIsCreatingThread(true)}
            title={t("story.addThread") || "Nuevo hilo"}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Create Thread Form Inline */}
        {isCreatingThread && (
          <div className="glass-form story-plan-create-form">
            <div className="story-plan-form-hint">
              {t("story.newThreadTitle") || "Nuevo Hilo Narrativo"}
            </div>
            <input
              type="text"
              value={threadTitle}
              onChange={(e) => setThreadTitle(e.target.value)}
              placeholder="Title..."
              className="form-control form-control-sm story-plan-field-spaced"
            />
            <textarea
              value={threadSummary}
              onChange={(e) => setThreadSummary(e.target.value)}
              placeholder="Summary..."
              rows={2}
              className="form-control form-control-sm story-plan-field-spaced"
            />
            <div className="story-plan-actions story-plan-actions--compact">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setIsCreatingThread(false)}
              >
                <X size={12} />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => void handleCreateThread()}
                disabled={!threadTitle.trim()}
              >
                <Check size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="threads-list">
          {activeThreads.length === 0 ? (
            <div className="story-plan-empty story-plan-empty--threads">
              {t("story.emptyThreads") || "No hay hilos narrativos."}
            </div>
          ) : (
            activeThreads.map((thread) => {
              const isSelected = selectedThreadId === thread.threadId;
              return (
                <button
                  type="button"
                  key={thread.threadId}
                  onClick={() => setSelectedThreadId(thread.threadId)}
                  className={`thread-item-btn ${isSelected ? "selected" : ""}`}
                  data-status={thread.status}
                >
                  <span className="story-plan-thread-title">
                    {thread.title}
                  </span>
                  <span className="story-plan-thread-status">
                    {thread.status}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN STORY WORKSPACE */}
      <div className="story-content-area">
        {selectedThread ? (
          <div
            className="glass-panel story-plan-content-panel"
          >
            {/* Header section with statuses and thread management */}
            <div className="story-plan-header">
              <div className="story-plan-header__main">
                <div className="story-plan-heading">
                  <h2 className="story-plan-heading__title">{selectedThread.title}</h2>
                  <span
                    className={`badge badge-${selectedThread.status} story-plan-status-badge`}
                  >
                    {selectedThread.status}
                  </span>
                </div>
                {selectedThread.summary && (
                  <p className="story-plan-summary">
                    {selectedThread.summary}
                  </p>
                )}
              </div>

              <div className="story-plan-actions">
                {/* Shortcut toggle */}
                <button
                  type="button"
                  className={`btn btn-sm ${isShortcutAdded ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => void handleToggleShortcut()}
                  title={isShortcutAdded ? t("shortcuts.remove") : t("shortcuts.add")}
                >
                  {isShortcutAdded ? <BookmarkMinus size={16} /> : <Bookmark size={16} />}
                </button>

                {/* Status Transitions */}
                {selectedThread.status === "planned" && (
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleActivateThread()}>
                    <Play size={14} className="story-plan-icon-gap" /> {t("story.activate") || "Activar"}
                  </button>
                )}
                {selectedThread.status === "active" && (
                  <button type="button" className="btn btn-sm btn-success" onClick={() => void handleResolveThread()}>
                    <CheckCircle2 size={14} className="story-plan-icon-gap" /> {t("story.resolve") || "Resolver"}
                  </button>
                )}
                {selectedThread.status !== "discarded" && selectedThread.status !== "resolved" && (
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void handleDiscardThread()}>
                    {t("story.discard") || "Descartar"}
                  </button>
                )}

                {/* Archive thread */}
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void handleArchiveThread()}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Linked Entities section */}
            <div className="story-plan-section">
              <div className="story-plan-section-header story-plan-section-header--spaced">
                <h5 className="story-plan-heading__title story-plan-heading__title--small">{t("story.linkedEntities") || "Entidades vinculadas al hilo"}</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setLinkingToThread(true)}
                >
                  <Plus size={12} /> {t("story.linkEntity") || "Vincular entidad"}
                </button>
              </div>

              {/* Link Entity Form Inline */}
              {linkingToThread && (
                <div className="glass-form story-plan-link-form">
                  <div className="story-plan-link-form__field">
                    <select
                      className="form-control form-control-sm"
                      value={selectedEntityId}
                      onChange={(e) => setSelectedEntityId(e.target.value)}
                    >
                      <option value="">-- {t("story.selectEntity") || "Seleccionar..."} --</option>
                      {getLinkableEntities(selectedThread.entityIds || []).map((e) => (
                        <option key={e.entityId} value={e.entityId}>
                          {e.title} ({e.entityType})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setLinkingToThread(false)}><X size={12} /></button>
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleLinkEntityToThread()} disabled={!selectedEntityId}><Check size={12} /></button>
                </div>
              )}

              <div className="story-plan-entity-list">
                {(selectedThread.entityIds || []).map((eid: string) => {
                  const ent = entities.find((e) => e.entityId === eid);
                  if (!ent) return null;
                  return (
                    <span
                      key={eid}
                      className="badge story-plan-entity-badge"
                    >
                      {ent.title}
                      <button
                        type="button"
                        onClick={() => void handleUnlinkEntityFromThread(eid)}
                        className="story-plan-icon-button story-plan-icon-button--inline story-plan-icon-button--danger"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Steps section */}
            <div className="story-plan-section">
              <div className="story-plan-section-header story-plan-section-header--steps">
                <h4 className="story-plan-heading__title story-plan-heading__title--small">{t("story.steps") || "Pasos del Plan"}</h4>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => setIsCreatingStep(true)}
                >
                  <Plus size={14} className="story-plan-icon-gap" /> {t("story.addStep") || "Añadir paso"}
                </button>
              </div>

              {/* Create Step Form */}
              {isCreatingStep && (
                <div className="glass-panel story-plan-step-form">
                  <h5 className="story-plan-heading__title story-plan-heading__title--small">{t("story.newStep") || "Nuevo paso narrativo"}</h5>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Title / Goal..."
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Intent / Rationale..."
                    value={stepIntent}
                    onChange={(e) => setStepIntent(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Expected Outcome..."
                    value={stepExpectedOutcome}
                    onChange={(e) => setStepExpectedOutcome(e.target.value)}
                  />
                  <div>
                    <label className="story-plan-form-label">
                      {t("story.associatedScene") || "Escena o localización asociada"}
                    </label>
                    <select
                      className="form-control"
                      value={stepSceneEntityId}
                      onChange={(e) => setStepSceneEntityId(e.target.value)}
                    >
                      <option value="">-- {t("common.none") || "Ninguna"} --</option>
                      {entities.filter((e) => !e.archived && e.entityType === "scene").map((e) => (
                        <option key={e.entityId} value={e.entityId}>{e.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="story-plan-actions story-plan-actions--end">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIsCreatingStep(false)}>{t("common.cancel")}</button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleCreateStep()} disabled={!stepTitle.trim()}>{t("common.save")}</button>
                  </div>
                </div>
              )}

              {/* Steps List */}
              {selectedThreadSteps.length === 0 ? (
                <div className="story-plan-empty story-plan-empty--steps">
                  <GitBranch size={24} className="story-plan-empty__icon" />
                  <p>{t("story.emptySteps") || "No hay pasos planificados en esta trama."}</p>
                </div>
              ) : (
                <div className="story-plan-step-list">
                  {selectedThreadSteps.map((step, index) => {
                    const sceneEnt = step.sceneEntityId ? entities.find((e) => e.entityId === step.sceneEntityId) : null;
                    const resolvedSess = step.resolvedSessionId ? sessions.find((s) => s.sessionId === step.resolvedSessionId) : null;
                    const plannedSess = step.plannedSessionId ? sessions.find((s) => s.sessionId === step.plannedSessionId) : null;

                    return (
                      <div
                        key={step.stepId}
                        className={`step-card glass-panel status-${step.status}`}
                      >
                        {/* Title and Badge row */}
                        <div className="story-plan-step-header">
                          <div className="story-plan-step-heading">
                            <span className="story-plan-step-title">{step.title}</span>
                            <span className={`badge badge-${step.status} story-plan-step-badge`}>{step.status}</span>
                            {step.resolutionKind && (
                              <span className="badge badge-secondary story-plan-step-badge">{step.resolutionKind}</span>
                            )}
                          </div>

                          {/* Reordering & Action buttons */}
                          <div className="story-plan-step-actions">
                            <button
                              type="button"
                              onClick={() => void handleToggleStepShortcut(step.stepId)}
                              title={t("shortcuts.add")}
                              className="btn btn-sm btn-link story-plan-icon-button"
                            >
                              {shortcuts.some((shortcut) => shortcut.targetType === "story_step" && shortcut.targetId === step.stepId)
                                ? <BookmarkMinus size={14} />
                                : <Bookmark size={14} />}
                            </button>
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => void handleReorderSteps(index, "up")}
                              className="btn btn-sm btn-link story-plan-icon-button"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={index === selectedThreadSteps.length - 1}
                              onClick={() => void handleReorderSteps(index, "down")}
                              className="btn btn-sm btn-link story-plan-icon-button"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Step Details grid */}
                        <div className="story-plan-step-details">
                          {step.intent && (
                            <div>
                              <strong>{t("story.intent") || "Intención"}:</strong> {step.intent}
                            </div>
                          )}
                          {step.expectedOutcome && (
                            <div>
                              <strong>{t("story.expected") || "Resultado esperado"}:</strong> {step.expectedOutcome}
                            </div>
                          )}
                          {sceneEnt && (
                            <div>
                              <strong>{t("story.scene") || "Escena"}:</strong> {sceneEnt.title}
                            </div>
                          )}
                          {plannedSess && (
                            <div>
                              <strong>{t("story.plannedSession") || "Sesión programada"}:</strong> Sesión #{plannedSess.number}
                            </div>
                          )}
                          {resolvedSess && (
                            <div>
                              <strong>{t("story.resolvedSession") || "Sesión de resolución"}:</strong> Sesión #{resolvedSess.number}
                            </div>
                          )}
                          {step.actualOutcome && (
                            <div className="story-plan-step-detail--full">
                              <strong>{t("story.actualOutcome") || "Resultado real"}:</strong> {step.actualOutcome}
                            </div>
                          )}
                        </div>

                        {/* Step Linked Entities */}
                        <div className="story-plan-step-entities">
                          <span className="story-plan-step-entities__label">
                            {t("story.linked") || "Vinculados"}:
                          </span>
                          {(step.entityIds || []).map((eid) => {
                            const ent = entities.find((e) => e.entityId === eid);
                            if (!ent) return null;
                            return (
                              <span key={eid} className="badge story-plan-step-entity-badge">
                                {ent.title}
                                <button type="button" onClick={() => void handleUnlinkEntityFromStep(step.stepId, eid)} className="story-plan-icon-button story-plan-icon-button--inline story-plan-icon-button--danger"><X size={10} /></button>
                              </span>
                            );
                          })}
                          {linkingToStepId === step.stepId ? (
                            <div className="story-plan-inline-actions">
                              <select
                                className="form-control form-control-sm story-plan-inline-select"
                                value={selectedEntityId}
                                onChange={(e) => setSelectedEntityId(e.target.value)}
                              >
                                <option value="">-- Link --</option>
                                {getLinkableEntities(step.entityIds || []).map((e) => (
                                  <option key={e.entityId} value={e.entityId}>{e.title}</option>
                                ))}
                              </select>
                              <button type="button" className="btn btn-sm btn-primary story-plan-icon-button" onClick={() => void handleLinkEntityToStep()}><Check size={10} /></button>
                              <button type="button" className="btn btn-sm btn-secondary story-plan-icon-button" onClick={() => setLinkingToStepId(null)}><X size={10} /></button>
                            </div>
                          ) : (
                            <button type="button" className="btn btn-sm btn-link story-plan-link-button" onClick={() => { setLinkingToStepId(step.stepId); setSelectedEntityId(""); }}>
                              + vincular
                            </button>
                          )}
                        </div>

                        {/* Step actions: schedule, defer, reconcile */}
                        <div className="story-plan-step-footer">
                          {(step.status === "planned" || step.status === "ready" || step.status === "active") && (
                            <>
                              {step.plannedSessionId ? (
                                <>
                                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => void handleDeferStep(step.stepId)}>
                                    <RotateCcw size={12} className="story-plan-icon-gap" /> {t("story.defer") || "Posponer"}
                                  </button>
                                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => void handleUnscheduleStep(step.stepId)}>
                                    {t("story.unschedule") || "Desprogramar"}
                                  </button>
                                </>
                              ) : schedulingStepId === step.stepId ? (
                                <div className="story-plan-schedule-form">
                                  <select
                                    className="form-control form-control-sm"
                                    value={scheduleSessionId}
                                    onChange={(e) => setScheduleSessionId(e.target.value)}
                                  >
                                    <option value="">-- {t("story.selectSession") || "Sesión..."} --</option>
                                    {getPlannedSessions().map((s) => (
                                      <option key={s.sessionId} value={s.sessionId}>Sesión #{s.number} - {s.title}</option>
                                    ))}
                                  </select>
                                  <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleScheduleStep()} disabled={!scheduleSessionId}><Check size={12} /></button>
                                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSchedulingStepId(null)}><X size={12} /></button>
                                </div>
                              ) : (
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setSchedulingStepId(step.stepId); setScheduleSessionId(""); }}>
                                  <Calendar size={12} className="story-plan-icon-gap" /> {t("story.schedule") || "Programar"}
                                </button>
                              )}
                            </>
                          )}

                          {step.status === "planned" && (
                            <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleMarkStepReady(step.stepId)}>
                              <Check size={12} className="story-plan-icon-gap" /> {t("story.ready")}
                            </button>
                          )}

                          {step.status === "ready" && (
                            <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleActivateStep(step.stepId)}>
                              <Play size={12} className="story-plan-icon-gap" /> {t("story.activate")}
                            </button>
                          )}

                          {/* Reconciliation available for ready, active steps */}
                          {(step.status === "ready" || step.status === "active") && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() => {
                                setReconcilingStepId(step.stepId);
                                setReconcileSessionId("");
                                setReconcileStatus("resolved");
                                setReconcileKind("as_planned");
                                setReconcileOutcome("");
                              }}
                            >
                              <CheckCircle2 size={12} className="story-plan-icon-gap" /> {t("story.reconcile") || "Reconciliar / Cerrar"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className="glass-panel story-plan-placeholder"
          >
            <GitBranch size={48} className="story-plan-placeholder__icon" />
            <h3>{t("story.selectPlaceholderTitle") || "Gestionar Hilos y Plan Narrativo"}</h3>
            <p className="story-plan-placeholder__description">
              {t("story.selectPlaceholderDesc") ||
                "Planifica tramas complejas, crea pasos secuenciales, programalos para sesiones futuras y realiza la reconciliación interactiva cuando tus jugadores resuelvan o cambien la historia."}
            </p>
          </div>
        )}
      </div>

      {/* RECONCILIATION MODAL/DIALOG OVERLAY */}
      {reconcilingStepId && (
        <div
          className="modal-overlay story-plan-modal-overlay"
        >
          <div
            className="glass-panel modal-content story-plan-modal"
          >
            <h3 className="story-plan-heading__title">{t("story.reconcileStepTitle") || "Reconciliar paso narrativo"}</h3>
            
            <div>
              <label className="story-plan-form-label story-plan-form-label--standard">
                {t("story.reconcileSession") || "Sesión en la que se resolvió (debe estar cerrada)"}
              </label>
              <select
                className="form-control"
                value={reconcileSessionId}
                onChange={(e) => setReconcileSessionId(e.target.value)}
              >
                <option value="">-- {t("story.selectClosedSession") || "Seleccionar sesión..."} --</option>
                {getClosedSessions().map((s) => (
                  <option key={s.sessionId} value={s.sessionId}>Sesión #{s.number} - {s.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="story-plan-form-label story-plan-form-label--standard">
                {t("story.reconcileStatus") || "Estado final"}
              </label>
              <select
                className="form-control"
                value={reconcileStatus}
                onChange={(e) => {
                  const val = e.target.value === "discarded" ? "discarded" : "resolved";
                  setReconcileStatus(val);
                  setReconcileKind(val === "resolved" ? "as_planned" : "discarded");
                }}
              >
                <option value="resolved">Resolved (Resuelto)</option>
                <option value="discarded">Discarded (Descartado)</option>
              </select>
            </div>

            {reconcileStatus === "resolved" && (
              <div>
                <label className="story-plan-form-label story-plan-form-label--standard">
                  {t("story.reconcileKind") || "Cómo se resolvió"}
                </label>
                <select
                  className="form-control"
                  value={reconcileKind}
                  onChange={(e) => setReconcileKind(e.target.value === "changed" ? "changed" : "as_planned")}
                >
                  <option value="as_planned">As Planned (Como estaba planeado)</option>
                  <option value="changed">Changed (Cambió / Inesperado)</option>
                </select>
              </div>
            )}

            {reconcileKind === "changed" && (
              <div>
                <label className="story-plan-form-label story-plan-form-label--standard">
                  {t("story.actualOutcomeTitle") || "Resultado real (requerido para cambios)"}
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={reconcileOutcome}
                  onChange={(e) => setReconcileOutcome(e.target.value)}
                  placeholder="Describe what actually happened..."
                />
              </div>
            )}

            <div className="story-plan-actions story-plan-actions--end story-plan-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setReconcilingStepId(null)}>
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => void handleReconcileStep()}
                disabled={!reconcileSessionId || (reconcileKind === "changed" && !reconcileOutcome.trim())}
              >
                {t("story.completeReconciliation") || "Completar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
