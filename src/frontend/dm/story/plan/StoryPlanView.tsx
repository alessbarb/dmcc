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
    } catch (err: any) {
      addToast(err.message || "Failed to create thread", "error");
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
    } catch (err: any) {
      addToast(err.message || "Failed to archive thread", "error");
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
    } catch (err: any) {
      addToast(err.message || "Failed to activate thread", "error");
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
    } catch (err: any) {
      addToast(err.message || "Error resolving thread", "error");
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
    } catch (err: any) {
      addToast(err.message || "Error discarding thread", "error");
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
    } catch (err: any) {
      addToast(err.message || "Error creating step", "error");
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
    } catch (err: any) {
      addToast(err.message || "Error scheduling step", "error");
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
    } catch (err: any) {
      addToast(err.message || "Error deferring step", "error");
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
    } catch (err: any) {
      addToast(err.message || "Error reconciling step", "error");
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
    <div className="story-plan-workspace" style={{ display: "flex", gap: "24px", minHeight: "60vh" }}>
      {/* SIDEBAR: Threads list */}
      <div
        className="story-sidebar glass-panel"
        style={{
          width: "280px",
          padding: "16px",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{t("story.threads") || "Hilos Narrativos"}</h3>
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
          <div className="glass-form" style={{ padding: 12, borderRadius: 8, background: "var(--bg-main)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6 }}>
              {t("story.newThreadTitle") || "Nuevo Hilo Narrativo"}
            </div>
            <input
              type="text"
              className="form-control form-control-sm"
              value={threadTitle}
              onChange={(e) => setThreadTitle(e.target.value)}
              placeholder="Title..."
              style={{ marginBottom: 8 }}
            />
            <textarea
              className="form-control form-control-sm"
              value={threadSummary}
              onChange={(e) => setThreadSummary(e.target.value)}
              placeholder="Summary..."
              rows={2}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
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

        <div className="threads-list" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {activeThreads.length === 0 ? (
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
              {t("story.emptyThreads") || "No hay hilos narrativos."}
            </div>
          ) : (
            activeThreads.map((thread) => {
              const isSelected = selectedThreadId === thread.threadId;
              let badgeColor = "var(--text-muted)";
              if (thread.status === "active") badgeColor = "var(--color-primary)";
              if (thread.status === "resolved") badgeColor = "var(--color-success)";

              return (
                <button
                  type="button"
                  key={thread.threadId}
                  onClick={() => setSelectedThreadId(thread.threadId)}
                  className={`thread-item-btn ${isSelected ? "selected" : ""}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    background: isSelected ? "var(--bg-active)" : "none",
                    color: isSelected ? "var(--text-active)" : "var(--text-main)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    borderLeft: `3px solid ${badgeColor}`,
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                    {thread.title}
                  </span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.6, textTransform: "uppercase", marginTop: 4 }}>
                    {thread.status}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN STORY WORKSPACE */}
      <div className="story-content-area" style={{ flex: 1 }}>
        {selectedThread ? (
          <div
            className="glass-panel"
            style={{
              padding: "24px",
              borderRadius: "12px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Header section with statuses and thread management */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ margin: 0 }}>{selectedThread.title}</h2>
                  <span
                    className={`badge badge-${selectedThread.status}`}
                    style={{
                      fontSize: "0.75rem",
                      padding: "4px 8px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedThread.status}
                  </span>
                </div>
                {selectedThread.summary && (
                  <p style={{ color: "var(--text-muted)", margin: "8px 0 0", fontSize: "0.95rem" }}>
                    {selectedThread.summary}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
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
                    <Play size={14} style={{ marginRight: 4 }} /> {t("story.activate") || "Activar"}
                  </button>
                )}
                {selectedThread.status === "active" && (
                  <button type="button" className="btn btn-sm btn-success" onClick={() => void handleResolveThread()}>
                    <CheckCircle2 size={14} style={{ marginRight: 4 }} /> {t("story.resolve") || "Resolver"}
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
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h5 style={{ margin: 0 }}>{t("story.linkedEntities") || "Entidades vinculadas al hilo"}</h5>
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
                <div className="glass-form" style={{ padding: 12, borderRadius: 8, background: "var(--bg-main)", marginBottom: 12, display: "flex", gap: 12, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
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

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(selectedThread.entityIds || []).map((eid: string) => {
                  const ent = entities.find((e) => e.entityId === eid);
                  if (!ent) return null;
                  return (
                    <span
                      key={eid}
                      className="badge"
                      style={{
                        background: "var(--bg-main)",
                        border: "1px solid var(--border-color)",
                        padding: "4px 8px",
                        borderRadius: 6,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.8rem",
                      }}
                    >
                      {ent.title}
                      <button
                        type="button"
                        onClick={() => void handleUnlinkEntityFromThread(eid)}
                        style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "var(--color-danger)" }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Steps section */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>{t("story.steps") || "Pasos del Plan"}</h4>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => setIsCreatingStep(true)}
                >
                  <Plus size={14} style={{ marginRight: 4 }} /> {t("story.addStep") || "Añadir paso"}
                </button>
              </div>

              {/* Create Step Form */}
              {isCreatingStep && (
                <div className="glass-panel" style={{ padding: 16, borderRadius: 8, background: "var(--bg-main)", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <h5 style={{ margin: 0 }}>{t("story.newStep") || "Nuevo paso narrativo"}</h5>
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
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
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
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIsCreatingStep(false)}>{t("common.cancel")}</button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleCreateStep()} disabled={!stepTitle.trim()}>{t("common.save")}</button>
                  </div>
                </div>
              )}

              {/* Steps List */}
              {selectedThreadSteps.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                  <GitBranch size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p>{t("story.emptySteps") || "No hay pasos planificados en esta trama."}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {selectedThreadSteps.map((step, index) => {
                    const sceneEnt = step.sceneEntityId ? entities.find((e) => e.entityId === step.sceneEntityId) : null;
                    const resolvedSess = step.resolvedSessionId ? sessions.find((s) => s.sessionId === step.resolvedSessionId) : null;
                    const plannedSess = step.plannedSessionId ? sessions.find((s) => s.sessionId === step.plannedSessionId) : null;

                    return (
                      <div
                        key={step.stepId}
                        className={`step-card glass-panel status-${step.status}`}
                        style={{
                          padding: "16px",
                          borderRadius: "8px",
                          background: "var(--bg-main)",
                          border: "1px solid var(--border-color)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {/* Title and Badge row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{step.title}</span>
                            <span className={`badge badge-${step.status}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>{step.status}</span>
                            {step.resolutionKind && (
                              <span className="badge badge-secondary" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>{step.resolutionKind}</span>
                            )}
                          </div>

                          {/* Reordering & Action buttons */}
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-link"
                              onClick={() => void handleToggleStepShortcut(step.stepId)}
                              title={t("shortcuts.add")}
                              style={{ padding: 2 }}
                            >
                              {shortcuts.some((shortcut) => shortcut.targetType === "story_step" && shortcut.targetId === step.stepId)
                                ? <BookmarkMinus size={14} />
                                : <Bookmark size={14} />}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-link"
                              disabled={index === 0}
                              onClick={() => void handleReorderSteps(index, "up")}
                              style={{ padding: 2 }}
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-link"
                              disabled={index === selectedThreadSteps.length - 1}
                              onClick={() => void handleReorderSteps(index, "down")}
                              style={{ padding: 2 }}
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Step Details grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
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
                            <div style={{ gridColumn: "span 2" }}>
                              <strong>{t("story.actualOutcome") || "Resultado real"}:</strong> {step.actualOutcome}
                            </div>
                          )}
                        </div>

                        {/* Step Linked Entities */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: 4 }}>
                            {t("story.linked") || "Vinculados"}:
                          </span>
                          {(step.entityIds || []).map((eid) => {
                            const ent = entities.find((e) => e.entityId === eid);
                            if (!ent) return null;
                            return (
                              <span key={eid} className="badge" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", fontSize: "0.75rem", padding: "2px 4px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                {ent.title}
                                <button type="button" onClick={() => void handleUnlinkEntityFromStep(step.stepId, eid)} style={{ border: "none", background: "none", padding: 0, color: "var(--color-danger)" }}><X size={10} /></button>
                              </span>
                            );
                          })}
                          {linkingToStepId === step.stepId ? (
                            <div style={{ display: "inline-flex", gap: 4 }}>
                              <select
                                className="form-control form-control-sm"
                                style={{ fontSize: "0.75rem", padding: "2px 4px" }}
                                value={selectedEntityId}
                                onChange={(e) => setSelectedEntityId(e.target.value)}
                              >
                                <option value="">-- Link --</option>
                                {getLinkableEntities(step.entityIds || []).map((e) => (
                                  <option key={e.entityId} value={e.entityId}>{e.title}</option>
                                ))}
                              </select>
                              <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleLinkEntityToStep()} style={{ padding: "2px 4px" }}><Check size={10} /></button>
                              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setLinkingToStepId(null)} style={{ padding: "2px 4px" }}><X size={10} /></button>
                            </div>
                          ) : (
                            <button type="button" className="btn btn-sm btn-link" onClick={() => { setLinkingToStepId(step.stepId); setSelectedEntityId(""); }} style={{ fontSize: "0.75rem", padding: "2px 4px" }}>
                              + vincular
                            </button>
                          )}
                        </div>

                        {/* Step actions: schedule, defer, reconcile */}
                        <div style={{ display: "flex", gap: 8, marginTop: 4, borderTop: "1px solid var(--border-color)", paddingTop: 8 }}>
                          {step.status === "planned" && (
                            <>
                              {schedulingStepId === step.stepId ? (
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                                  <Calendar size={12} style={{ marginRight: 4 }} /> {t("story.schedule") || "Programar"}
                                </button>
                              )}
                            </>
                          )}

                          {step.status === "ready" && (
                            <>
                              <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleActivateStep(step.stepId)}>
                                <Play size={12} style={{ marginRight: 4 }} /> {t("story.activate")}
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => void handleDeferStep(step.stepId)}>
                                <RotateCcw size={12} style={{ marginRight: 4 }} /> {t("story.defer") || "Posponer"}
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => void handleUnscheduleStep(step.stepId)}>
                                {t("story.unschedule") || "Desprogramar"}
                              </button>
                            </>
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
                              <CheckCircle2 size={12} style={{ marginRight: 4 }} /> {t("story.reconcile") || "Reconciliar / Cerrar"}
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
            className="glass-panel"
            style={{
              padding: "48px",
              borderRadius: "12px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              textAlign: "center",
              color: "var(--text-muted)",
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <GitBranch size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <h3>{t("story.selectPlaceholderTitle") || "Gestionar Hilos y Plan Narrativo"}</h3>
            <p style={{ maxWidth: 420, margin: "0 auto" }}>
              {t("story.selectPlaceholderDesc") ||
                "Planifica tramas complejas, crea pasos secuenciales, programalos para sesiones futuras y realiza la reconciliación interactiva cuando tus jugadores resuelvan o cambien la historia."}
            </p>
          </div>
        )}
      </div>

      {/* RECONCILIATION MODAL/DIALOG OVERLAY */}
      {reconcilingStepId && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            className="glass-panel modal-content"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              padding: "24px",
              borderRadius: "12px",
              width: "480px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <h3 style={{ margin: 0 }}>{t("story.reconcileStepTitle") || "Reconciliar paso narrativo"}</h3>
            
            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
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
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                {t("story.reconcileStatus") || "Estado final"}
              </label>
              <select
                className="form-control"
                value={reconcileStatus}
                onChange={(e) => {
                  const val = e.target.value as "resolved" | "discarded";
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
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                  {t("story.reconcileKind") || "Cómo se resolvió"}
                </label>
                <select
                  className="form-control"
                  value={reconcileKind}
                  onChange={(e) => setReconcileKind(e.target.value as any)}
                >
                  <option value="as_planned">As Planned (Como estaba planeado)</option>
                  <option value="changed">Changed (Cambió / Inesperado)</option>
                </select>
              </div>
            )}

            {reconcileKind === "changed" && (
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
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

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
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
