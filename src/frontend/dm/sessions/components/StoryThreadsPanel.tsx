import { useState } from "react";
import { Plus, X, Check, Calendar, GitBranch } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { useStoryThreads } from "../../story/useStoryThreads.js";
import type { Session } from "../../../shared/stores/campaignStore.js";

export function StoryThreadsPanel({ plannedSessions }: { plannedSessions: Session[] }) {
  const { t } = useTranslation();
  const { threads, steps, createThread, archiveThread, createStep, scheduleStep } = useStoryThreads();

  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [threadTitle, setThreadTitle] = useState("");
  const [threadSummary, setThreadSummary] = useState("");
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [isCreatingStepForThread, setIsCreatingStepForThread] = useState<string | null>(null);
  const [stepTitle, setStepTitle] = useState("");
  const [schedulingStepId, setSchedulingStepId] = useState<string | null>(null);
  const [scheduleSessionId, setScheduleSessionId] = useState("");

  const activeThreads = threads.filter((thread) => !thread.archivedAt).sort((a, b) => a.sortOrder - b.sortOrder);
  const backlogStepsByThread = (threadId: string) =>
    steps
      .filter((step) => step.threadId === threadId && !step.plannedSessionId && step.status !== "resolved" && step.status !== "discarded")
      .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleCreateThread = async () => {
    if (!threadTitle.trim()) return;
    const ok = await createThread(threadTitle.trim(), threadSummary.trim() || null);
    if (ok) {
      setThreadTitle("");
      setThreadSummary("");
      setIsCreatingThread(false);
    }
  };

  const handleCreateStep = async (threadId: string) => {
    if (!stepTitle.trim()) return;
    const ok = await createStep(threadId, { title: stepTitle.trim() });
    if (ok) {
      setStepTitle("");
      setIsCreatingStepForThread(null);
    }
  };

  const handleSchedule = async (stepId: string) => {
    if (!scheduleSessionId) return;
    const ok = await scheduleStep(stepId, scheduleSessionId);
    if (ok) {
      setSchedulingStepId(null);
      setScheduleSessionId("");
    }
  };

  const handleArchiveThread = async (threadId: string) => {
    if (!confirm(t("story.confirmArchiveThread") || "¿Seguro que quieres archivar este hilo narrativo?")) return;
    await archiveThread(threadId);
  };

  return (
    <section className="session-list-section surface-panel story-threads-panel" aria-labelledby="story-threads-heading">
      <div className="session-list-section__header">
        <div>
          <p className="session-section-eyebrow">{activeThreads.length}</p>
          <h3 id="story-threads-heading">{t("story.threads") || "Hilos Narrativos"}</h3>
        </div>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setIsCreatingThread(true)}>
          <Plus size={16} /> {t("story.addThread") || "Nuevo hilo"}
        </button>
      </div>

      {isCreatingThread && (
        <div className="glass-form story-plan-create-form">
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
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIsCreatingThread(false)}>
              <X size={12} />
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleCreateThread()} disabled={!threadTitle.trim()}>
              <Check size={12} />
            </button>
          </div>
        </div>
      )}

      {activeThreads.length === 0 ? (
        <p className="story-plan-empty story-plan-empty--threads">{t("story.emptyThreads") || "No hay hilos narrativos."}</p>
      ) : (
        <div className="threads-list">
          {activeThreads.map((thread) => {
            const isExpanded = expandedThreadId === thread.threadId;
            const backlog = backlogStepsByThread(thread.threadId);
            return (
              <div key={thread.threadId} className="story-thread-card">
                <button
                  type="button"
                  className={`thread-item-btn ${isExpanded ? "selected" : ""}`}
                  data-status={thread.status}
                  onClick={() => setExpandedThreadId(isExpanded ? null : thread.threadId)}
                >
                  <span className="story-plan-thread-title">{thread.title}</span>
                  <span className="story-plan-thread-status">{thread.status}</span>
                </button>

                {isExpanded && (
                  <div className="story-thread-card__body">
                    {backlog.length === 0 ? (
                      <p className="story-plan-empty story-plan-empty--steps">{t("story.emptySteps") || "No hay pasos planificados en esta trama."}</p>
                    ) : (
                      backlog.map((step) => (
                        <div key={step.stepId} className="story-thread-backlog-step">
                          <span>{step.title}</span>
                          {schedulingStepId === step.stepId ? (
                            <div className="story-plan-schedule-form">
                              <select
                                className="form-control form-control-sm"
                                value={scheduleSessionId}
                                onChange={(e) => setScheduleSessionId(e.target.value)}
                              >
                                <option value="">-- {t("story.selectSession") || "Sesión..."} --</option>
                                {plannedSessions.map((s) => (
                                  <option key={s.sessionId} value={s.sessionId}>Sesión #{s.number} - {s.title}</option>
                                ))}
                              </select>
                              <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleSchedule(step.stepId)} disabled={!scheduleSessionId}>
                                <Check size={12} />
                              </button>
                              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSchedulingStepId(null)}>
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setSchedulingStepId(step.stepId); setScheduleSessionId(""); }}>
                              <Calendar size={12} /> {t("story.schedule") || "Programar"}
                            </button>
                          )}
                        </div>
                      ))
                    )}

                    {isCreatingStepForThread === thread.threadId ? (
                      <div className="story-plan-actions story-plan-actions--compact">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Title..."
                          value={stepTitle}
                          onChange={(e) => setStepTitle(e.target.value)}
                        />
                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIsCreatingStepForThread(null)}>
                          <X size={12} />
                        </button>
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleCreateStep(thread.threadId)} disabled={!stepTitle.trim()}>
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setIsCreatingStepForThread(thread.threadId); setStepTitle(""); }}>
                        <Plus size={12} /> {t("story.addStep") || "Añadir paso"}
                      </button>
                    )}

                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void handleArchiveThread(thread.threadId)}>
                      <GitBranch size={12} /> Archivar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
