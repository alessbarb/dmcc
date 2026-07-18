import type { Dispatch, SetStateAction } from "react";
import type { Edge } from "@xyflow/react";
import type { CanvasFlowNode } from "../components/CampaignCanvasFlow.js";
import { SessionPrepForm } from "../components/SessionPrepForm.js";
import { X } from "lucide-react";
import type { Session } from "../../../shared/stores/campaignStore.js";
import type { CampaignStateStore } from "../../../shared/stores/campaignStore.js";
import { createEmptySessionPlan } from "@core/domain/session/sessionPlan.js";
import { addEntitiesToSessionPlan } from "@core/domain/session/sessionPlanCanvasClassification.js";

interface CanvasSessionPrepDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  campaignState: CampaignStateStore["campaignState"];
  preparedSessions: Session[];
  selectedNodes: CanvasFlowNode[];
  createPreparedSession: CampaignStateStore["createPreparedSession"];
  reviseSessionPlan: CampaignStateStore["reviseSessionPlan"];
  recordSessionEvent: CampaignStateStore["recordSessionEvent"];
  addToast: (message: string, kind?: "success" | "error" | "info" | "warning") => void;
  setSelectedNodes: Dispatch<SetStateAction<CanvasFlowNode[]>>;
  setSelectedEdges: Dispatch<SetStateAction<Edge[]>>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function CanvasSessionPrepDialog({
  isOpen,
  setIsOpen,
  campaignState,
  preparedSessions,
  selectedNodes,
  createPreparedSession,
  reviseSessionPlan,
  recordSessionEvent,
  addToast,
  setSelectedNodes,
  setSelectedEdges,
  t,
}: CanvasSessionPrepDialogProps) {
  if (!isOpen) return null;

  return (
  <div className="modal-overlay" onClick={() => setIsOpen(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
      <div className="modal-header">
        <h2>{t("sessionPage.prepareSessionFromSelectionTitle")}</h2>
        <button onClick={() => setIsOpen(false)} className="modal-close-btn"><X size={16} /></button>
      </div>
      {(() => {
        const activeSession = campaignState?.sessions?.find((s: Session) => s.status === "active");
        const entNames = selectedNodes.map((n) => n.data.title || n.data.text || "Elemento");

        return (
          <SessionPrepForm
            activeSession={activeSession}
            preparedSessions={preparedSessions}
            selectedCount={selectedNodes.length}
            elementNames={entNames}
            onSubmit={async (sessionTitle, targetMode, targetSessionId) => {
              const isStringId = (id: string | undefined): id is string => id !== undefined;
              const entIds = selectedNodes
                .filter((n) => n.type === "entity" && n.data.entityId)
                .map((n) => n.data.entityId)
                .filter(isStringId);
              const isClassifiable = (
                n: CanvasFlowNode,
              ): n is CanvasFlowNode & { data: { entityId: string; entityType: string } } =>
                n.type === "entity" && n.data.entityId !== undefined && n.data.entityType !== undefined;
              const classifiableEntities = selectedNodes
                .filter(isClassifiable)
                .map((n) => ({ entityId: n.data.entityId, entityType: n.data.entityType }));
              const notesLine = t("sessionPage.preparedFromCanvasNotes", { names: entNames.join(", ") });

              if (targetMode === "new") {
                const sessionId = await createPreparedSession(sessionTitle);
                if (!sessionId) return;
                const plan = addEntitiesToSessionPlan({
                  plan: {
                    ...createEmptySessionPlan(),
                    state: "ready",
                    summary: t("sessionPage.preparedFromCanvasSummary", { count: selectedNodes.length }),
                    privateNotes: notesLine,
                  },
                  entities: classifiableEntities,
                });
                await reviseSessionPlan(sessionId, { title: sessionTitle, expectedRevision: 0, plan });
                addToast(t("toasts.sessionPrepared", { title: sessionTitle }), "success");
              } else if (targetMode === "prepared" && targetSessionId) {
                const targetSession = preparedSessions.find((session: Session) => session.sessionId === targetSessionId);
                if (!targetSession) return;
                const currentPlan = targetSession.plan ?? createEmptySessionPlan();
                const plan = addEntitiesToSessionPlan({
                  plan: {
                    ...currentPlan,
                    privateNotes: [currentPlan.privateNotes, notesLine].filter(Boolean).join("\n"),
                  },
                  entities: classifiableEntities,
                });
                await reviseSessionPlan(targetSessionId, {
                  title: targetSession.title,
                  scheduledAt: targetSession.scheduledAt,
                  expectedRevision: currentPlan.revision,
                  plan,
                });
                addToast(t("toasts.elementsAddedToPreparation", { title: targetSession.title }), "success");
              } else if (activeSession) {
                await recordSessionEvent(activeSession.sessionId, {
                  type: "material_introduced",
                  title: t("sessionPage.loadedFromCanvasTitle"),
                  description: t("sessionPage.loadedFromCanvasDescription", { names: entNames.join(", ") }),
                  relatedEntityIds: entIds,
                });
                addToast(t("toasts.elementsAddedToSession"), "success");
              }
              setIsOpen(false);
              setSelectedNodes([]);
              setSelectedEdges([]);
            }}
            onCancel={() => setIsOpen(false)}
          />
        );
      })()}
    </div>
  </div>
  );
}
