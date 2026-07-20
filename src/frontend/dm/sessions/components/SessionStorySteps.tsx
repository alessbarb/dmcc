import { useState } from "react";
import { RotateCcw, Check, Play, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { useStoryThreads } from "../../story/useStoryThreads.js";
import type { Session } from "../../../shared/stores/campaignStore.js";

export function SessionStorySteps({ sessionId, closedSessions }: { sessionId: string; closedSessions: Session[] }) {
  const { t } = useTranslation();
  const { steps, threads, deferStep, unscheduleStep, markStepReady, activateStep, reconcileStep } = useStoryThreads();

  const [reconcilingStepId, setReconcilingStepId] = useState<string | null>(null);
  const [reconcileSessionId, setReconcileSessionId] = useState("");
  const [reconcileStatus, setReconcileStatus] = useState<"resolved" | "discarded">("resolved");
  const [reconcileKind, setReconcileKind] = useState<"as_planned" | "changed" | "discarded">("as_planned");
  const [reconcileOutcome, setReconcileOutcome] = useState("");

  const scheduledSteps = steps.filter((step) => step.plannedSessionId === sessionId);
  if (scheduledSteps.length === 0) return null;

  const threadTitle = (threadId: string) => threads.find((thread) => thread.threadId === threadId)?.title ?? "";

  const handleDefer = async (stepId: string) => {
    const nextSessionId = prompt("Enter next session ID to defer to:");
    if (!nextSessionId) return;
    await deferStep(stepId, nextSessionId);
  };

  const openReconcile = (stepId: string) => {
    setReconcilingStepId(stepId);
    setReconcileSessionId("");
    setReconcileStatus("resolved");
    setReconcileKind("as_planned");
    setReconcileOutcome("");
  };

  const handleReconcile = async () => {
    if (!reconcilingStepId || !reconcileSessionId) return;
    if (reconcileKind === "changed" && !reconcileOutcome.trim()) return;
    const ok = await reconcileStep(reconcilingStepId, {
      resolvedSessionId: reconcileSessionId,
      status: reconcileStatus,
      resolutionKind: reconcileKind,
      actualOutcome: reconcileOutcome.trim() || null,
    });
    if (ok) setReconcilingStepId(null);
  };

  return (
    <div className="card session-story-steps">
      <h3 className="story-plan-heading__title story-plan-heading__title--small">{t("story.steps") || "Pasos del Plan"}</h3>
      <div className="story-plan-step-list">
        {scheduledSteps.map((step) => (
          <div key={step.stepId} className={`step-card glass-panel status-${step.status}`}>
            <div className="story-plan-step-header">
              <div className="story-plan-step-heading">
                <span className="story-plan-thread-title">{threadTitle(step.threadId)}</span>
                <span className="story-plan-step-title">{step.title}</span>
                <span className={`badge badge-${step.status} story-plan-step-badge`}>{step.status}</span>
              </div>
            </div>

            <div className="story-plan-step-footer">
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => void handleDefer(step.stepId)}>
                <RotateCcw size={12} /> {t("story.defer") || "Posponer"}
              </button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => void unscheduleStep(step.stepId)}>
                {t("story.unschedule") || "Desprogramar"}
              </button>
              {step.status === "planned" && (
                <button type="button" className="btn btn-sm btn-primary" onClick={() => void markStepReady(step.stepId)}>
                  <Check size={12} /> {t("story.ready") || "Marcar Listo"}
                </button>
              )}
              {step.status === "ready" && (
                <button type="button" className="btn btn-sm btn-primary" onClick={() => void activateStep(step.stepId)}>
                  <Play size={12} /> {t("story.activate")}
                </button>
              )}
              {(step.status === "ready" || step.status === "active") && (
                <button type="button" className="btn btn-sm btn-outline-success" onClick={() => openReconcile(step.stepId)}>
                  <CheckCircle2 size={12} /> {t("story.reconcile") || "Reconciliar / Cerrar"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {reconcilingStepId && (
        <div className="modal-overlay story-plan-modal-overlay">
          <div className="glass-panel modal-content story-plan-modal">
            <h3 className="story-plan-heading__title">{t("story.reconcileStepTitle") || "Reconciliar paso narrativo"}</h3>

            <div>
              <label className="story-plan-form-label story-plan-form-label--standard">
                {t("story.reconcileSession") || "Sesión en la que se resolvió (debe estar cerrada)"}
              </label>
              <select className="form-control" value={reconcileSessionId} onChange={(e) => setReconcileSessionId(e.target.value)}>
                <option value="">-- {t("story.selectClosedSession") || "Seleccionar sesión..."} --</option>
                {closedSessions.map((s) => (
                  <option key={s.sessionId} value={s.sessionId}>Sesión #{s.number} - {s.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="story-plan-form-label story-plan-form-label--standard">{t("story.reconcileStatus") || "Estado final"}</label>
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
                <label className="story-plan-form-label story-plan-form-label--standard">{t("story.reconcileKind") || "Cómo se resolvió"}</label>
                <select className="form-control" value={reconcileKind} onChange={(e) => setReconcileKind(e.target.value === "changed" ? "changed" : "as_planned")}>
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
                <textarea className="form-control" rows={3} value={reconcileOutcome} onChange={(e) => setReconcileOutcome(e.target.value)} />
              </div>
            )}

            <div className="story-plan-actions story-plan-actions--end story-plan-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setReconcilingStepId(null)}>
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => void handleReconcile()}
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
