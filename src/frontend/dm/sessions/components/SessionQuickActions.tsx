import {
  StickyNote,
  Eye,
  GitMerge,
  Zap,
  UserPlus,
  X,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { CampaignStateStore, Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { QuickNoteForm } from "./QuickNoteForm.js";
import { RevealClueForm } from "./RevealClueForm.js";
import { RecordDecisionForm } from "./RecordDecisionForm.js";
import { CreateConsequenceForm } from "./CreateConsequenceForm.js";
import { QuickNpcForm } from "./QuickNpcForm.js";
import { CloseSessionForm } from "./CloseSessionForm.js";
import "./session-actions.css";

export type ActionId =
  | "nota"
  | "pista"
  | "decision"
  | "consecuencia"
  | "pnj"
  | "cerrar";

interface ActionDef {
  id: ActionId;
  label: string;
  icon: React.ReactNode;
  toneClass: string;
}

export function SessionQuickActions({
  campaignState,
  activeSession,
  activeAction,
  onSelectAction,
  createEntity,
  createRelation,
  recordSessionEvent,
  revealClue,
  closeSession,
  setCurrentPage,
  addToast,
}: {
  campaignState: MaybeCampaignState;
  activeSession: Session;
  activeAction: ActionId | null;
  onSelectAction: (action: ActionId | null) => void;
  createEntity: CampaignStateStore["createEntity"];
  createRelation: CampaignStateStore["createRelation"];
  recordSessionEvent: CampaignStateStore["recordSessionEvent"];
  revealClue: CampaignStateStore["revealClue"];
  closeSession: (sessionId: string, summary: string) => Promise<void>;
  setCurrentPage: (page: string) => void;
  addToast: (msg: string, kind?: ToastKind) => void;
}) {
  const { t } = useTranslation();

  const actions: ActionDef[] = [
    { id: "nota", label: t("session.quickNote"), icon: <StickyNote size={22} />, toneClass: "session-actions__item--note" },
    { id: "pista", label: t("sessionPage.revealClueButton"), icon: <Eye size={22} />, toneClass: "session-actions__item--clue" },
    { id: "decision", label: t("session.recordDecision"), icon: <GitMerge size={22} />, toneClass: "session-actions__item--decision" },
    { id: "consecuencia", label: t("session.createConsequence"), icon: <Zap size={22} />, toneClass: "session-actions__item--consequence" },
    { id: "pnj", label: t("session.createQuickNpc"), icon: <UserPlus size={22} />, toneClass: "session-actions__item--npc" },
    { id: "cerrar", label: t("session.closeSession"), icon: <X size={22} />, toneClass: "session-actions__item--close" },
  ];

  const selectedAction = actions.find((action) => action.id === activeAction);
  const onClose = () => onSelectAction(null);

  return (
    <>
      <div className="session-actions" role="group" aria-label={t("session.actions")}>
        {actions.map((action) => {
          const isActive = activeAction === action.id;
          return (
            <button
              key={action.id}
              type="button"
              className={`session-actions__item ${action.toneClass}${isActive ? " is-active" : ""}`}
              onClick={() => onSelectAction(isActive ? null : action.id)}
              aria-pressed={isActive}
            >
              <span className="session-actions__icon">{action.icon}</span>
              <span className="session-actions__label">{action.label}</span>
              {isActive && <ChevronRight className="session-actions__chevron" size={12} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {activeAction && selectedAction && (
        <section className={`card session-action-panel ${selectedAction.toneClass}`} aria-label={`Panel: ${selectedAction.label}`}>
          <header className="session-action-panel__header">
            <h3 className="session-action-panel__title">
              {selectedAction.icon}
              {selectedAction.label}
            </h3>
            <button type="button" className="btn btn-icon btn-secondary session-action-panel__close" onClick={onClose} aria-label={t("common.close")}>
              <X size={16} />
            </button>
          </header>

          {activeAction === "nota" && <QuickNoteForm createEntity={createEntity} recordSessionEvent={recordSessionEvent} activeSession={activeSession} addToast={addToast} onClose={onClose} />}
          {activeAction === "pista" && <RevealClueForm campaignState={campaignState} activeSession={activeSession} revealClue={revealClue} addToast={addToast} onClose={onClose} />}
          {activeAction === "decision" && <RecordDecisionForm campaignState={campaignState} createEntity={createEntity} createRelation={createRelation} recordSessionEvent={recordSessionEvent} activeSession={activeSession} addToast={addToast} onClose={onClose} />}
          {activeAction === "consecuencia" && <CreateConsequenceForm campaignState={campaignState} createEntity={createEntity} recordSessionEvent={recordSessionEvent} activeSession={activeSession} addToast={addToast} onClose={onClose} />}
          {activeAction === "pnj" && <QuickNpcForm createEntity={createEntity} activeSession={activeSession} addToast={addToast} onClose={onClose} />}
          {activeAction === "cerrar" && <CloseSessionForm activeSession={activeSession} closeSession={closeSession} setCurrentPage={setCurrentPage} addToast={addToast} onClose={onClose} />}
        </section>
      )}
    </>
  );
}
