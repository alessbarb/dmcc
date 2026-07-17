import type { Dispatch, SetStateAction } from "react";
import type { Edge } from "@xyflow/react";
import type { CanvasFlowNode } from "../components/CampaignCanvasFlow.js";
import { SessionPrepForm } from "../components/SessionPrepForm.js";
import { X } from "lucide-react";
import type { Session } from "../../../shared/stores/campaignStore.js";
import type { CampaignStateStore } from "../../../shared/stores/campaignStore.js";

interface CanvasSessionPrepDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  campaignState: CampaignStateStore["campaignState"];
  preparedSessions: Session[];
  selectedNodes: CanvasFlowNode[];
  createPreparedSession: CampaignStateStore["createPreparedSession"];
  updateSessionPrep: CampaignStateStore["updateSessionPrep"];
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
  updateSessionPrep,
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
              const sceneIds = selectedNodes
                .filter((n) => n.type === "entity" && n.data.entityType === "scene" && n.data.entityId)
                .map((n) => n.data.entityId)
                .filter(isStringId);
              const clueIds = selectedNodes
                .filter((n) => n.type === "entity" && n.data.entityType === "clue" && n.data.entityId)
                .map((n) => n.data.entityId)
                .filter(isStringId);
              const secretIds = selectedNodes
                .filter((n) => n.type === "entity" && n.data.entityType === "secret" && n.data.entityId)
                .map((n) => n.data.entityId)
                .filter(isStringId);
              const consequenceIds = selectedNodes
                .filter((n) => n.type === "entity" && n.data.entityType === "consequence" && n.data.entityId)
                .map((n) => n.data.entityId)
                .filter(isStringId);
              
              if (targetMode === "new") {
                await createPreparedSession(sessionTitle, {
                  state: "ready",
                  summary: t("sessionPage.preparedFromCanvasSummary", { count: selectedNodes.length }),
                  goals: [],
                  sceneIds,
                  involvedEntityIds: entIds,
                  availableClueIds: clueIds,
                  secretsAtRiskIds: secretIds,
                  expectedConsequenceIds: consequenceIds,
                  checklist: [],
                  notes: t("sessionPage.preparedFromCanvasNotes", { names: entNames.join(", ") }),
                });
                addToast(t("toasts.sessionPrepared", { title: sessionTitle }), "success");
              } else if (targetMode === "prepared" && targetSessionId) {
                const targetSession = preparedSessions.find((session: Session) => session.sessionId === targetSessionId);
                if (!targetSession) return;
                const currentPrep = targetSession.prep ?? { state: "draft" };
                const mergeIds = (...groups: string[][]) => Array.from(new Set(groups.flat().filter(Boolean)));
                await updateSessionPrep(targetSessionId, {
                  title: targetSession.title,
                  scheduledAt: targetSession.scheduledAt,
                  prep: {
                    ...currentPrep,
                    state: currentPrep.state ?? "draft",
                    sceneIds: mergeIds(currentPrep.sceneIds ?? [], sceneIds),
                    involvedEntityIds: mergeIds(currentPrep.involvedEntityIds ?? [], entIds),
                    availableClueIds: mergeIds(currentPrep.availableClueIds ?? [], clueIds),
                    secretsAtRiskIds: mergeIds(currentPrep.secretsAtRiskIds ?? [], secretIds),
                    expectedConsequenceIds: mergeIds(currentPrep.expectedConsequenceIds ?? [], consequenceIds),
                    notes: [currentPrep.notes, t("sessionPage.preparedFromCanvasNotes", { names: entNames.join(", ") })].filter(Boolean).join("\n"),
                  },
                });
                addToast(t("toasts.elementsAddedToPreparation", { title: targetSession.title }), "success");
              } else if (activeSession) {
                await recordSessionEvent(activeSession.sessionId, {
                  type: "scene_started",
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
