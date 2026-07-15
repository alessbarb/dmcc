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
  accentVar: string;
}

// activeAction lives in the parent (SessionPage) because QuickCaptureBar, a
// sibling component, must be able to open the "pista" (reveal clue) panel
// via its `+pista` command.
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
    {
      id: "nota",
      label: t("session.quickNote"),
      icon: <StickyNote size={22} />,
      accentVar: "var(--color-info)",
    },
    {
      id: "pista",
      label: t("sessionPage.revealClueButton"),
      icon: <Eye size={22} />,
      accentVar: "var(--secondary)",
    },
    {
      id: "decision",
      label: t("session.recordDecision"),
      icon: <GitMerge size={22} />,
      accentVar: "var(--primary)",
    },
    {
      id: "consecuencia",
      label: t("session.createConsequence"),
      icon: <Zap size={22} />,
      accentVar: "var(--color-warning)",
    },
    {
      id: "pnj",
      label: t("session.createQuickNpc"),
      icon: <UserPlus size={22} />,
      accentVar: "var(--color-success)",
    },
    {
      id: "cerrar",
      label: t("session.closeSession"),
      icon: <X size={22} />,
      accentVar: "var(--color-critical)",
    },
  ];

  const selectedAction = actions.find((a) => a.id === activeAction);
  const onClose = () => onSelectAction(null);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
        role="group"
        aria-label={t("session.actions")}
      >
        {actions.map((action) => {
          const isActive = activeAction === action.id;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() =>
                onSelectAction(isActive ? null : action.id)
              }
              aria-pressed={isActive}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                minHeight: "96px",
                padding: "16px 12px",
                backgroundColor: isActive
                  ? "var(--bg-card-hover)"
                  : "var(--bg-card)",
                border: isActive
                  ? `2px solid ${action.accentVar}`
                  : "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
                transition: "var(--transition-fast)",
                color: isActive ? action.accentVar : "var(--text-muted)",
                boxShadow: isActive
                  ? `0 0 14px ${action.accentVar}33`
                  : "none",
              }}
            >
              <span
                style={{
                  color: isActive ? action.accentVar : "var(--text-muted)",
                  transition: "var(--transition-fast)",
                }}
              >
                {action.icon}
              </span>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  textAlign: "center",
                  lineHeight: 1.25,
                  color: isActive ? "var(--text-main)" : "var(--text-muted)",
                }}
              >
                {action.label}
              </span>
              {isActive && (
                <ChevronRight
                  size={12}
                  style={{
                    transform: "rotate(90deg)",
                    color: action.accentVar,
                    marginTop: "-4px",
                  }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {activeAction && selectedAction && (
        <section
          className="card"
          style={{
            borderLeft: `3px solid ${selectedAction.accentVar}`,
            padding: "24px",
          }}
          aria-label={`Panel: ${selectedAction.label}`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontWeight: "800",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: selectedAction.accentVar,
              }}
            >
              {selectedAction.icon}
              {selectedAction.label}
            </h3>
            <button
              type="button"
              className="btn btn-icon btn-secondary"
              onClick={onClose}
              aria-label={t("common.close")}
              style={{ padding: "6px" }}
            >
              <X size={16} />
            </button>
          </div>

          {activeAction === "nota" && (
            <QuickNoteForm
              createEntity={createEntity}
              recordSessionEvent={recordSessionEvent}
              activeSession={activeSession}
              addToast={addToast}
              onClose={onClose}
            />
          )}
          {activeAction === "pista" && (
            <RevealClueForm
              campaignState={campaignState}
              activeSession={activeSession}
              revealClue={revealClue}
              addToast={addToast}
              onClose={onClose}
            />
          )}
          {activeAction === "decision" && (
            <RecordDecisionForm
              campaignState={campaignState}
              createEntity={createEntity}
              createRelation={createRelation}
              recordSessionEvent={recordSessionEvent}
              activeSession={activeSession}
              addToast={addToast}
              onClose={onClose}
            />
          )}
          {activeAction === "consecuencia" && (
            <CreateConsequenceForm
              campaignState={campaignState}
              createEntity={createEntity}
              recordSessionEvent={recordSessionEvent}
              activeSession={activeSession}
              addToast={addToast}
              onClose={onClose}
            />
          )}
          {activeAction === "pnj" && (
            <QuickNpcForm
              createEntity={createEntity}
              activeSession={activeSession}
              addToast={addToast}
              onClose={onClose}
            />
          )}
          {activeAction === "cerrar" && (
            <CloseSessionForm
              activeSession={activeSession}
              closeSession={closeSession}
              setCurrentPage={setCurrentPage}
              addToast={addToast}
              onClose={onClose}
            />
          )}
        </section>
      )}
    </>
  );
}
