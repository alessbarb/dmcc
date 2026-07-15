import { useState } from "react";
import { Eye } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { CampaignStateStore, Entity, Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";

export function RevealClueForm({
  campaignState,
  activeSession,
  revealClue,
  addToast,
  onClose,
}: {
  campaignState: MaybeCampaignState;
  activeSession: Session;
  revealClue: CampaignStateStore["revealClue"];
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const clues = (campaignState?.entities ?? []).filter(
    (entity: Entity) =>
      entity.entityType === "clue" &&
      !entity.archived &&
      (entity.status === "prepared" || entity.status === "hidden"),
  );

  const [selectedClue, setSelectedClue] = useState("");
  const [audience, setAudience] = useState<"party" | "character">("party");
  const [characterId, setCharacterId] = useState("");
  const [how, setHow] = useState("");
  const [busy, setBusy] = useState(false);

  const characters = (campaignState?.entities ?? []).filter(
    (entity: Entity) => entity.entityType === "player_character" && !entity.archived,
  );

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (!selectedClue) return;

    const audiencePayload =
      audience === "character" && characterId
        ? { kind: "characters" as const, characterEntityIds: [characterId] }
        : { kind: "party" as const };

    setBusy(true);
    try {
      await revealClue(activeSession.sessionId, selectedClue, audiencePayload, how);
      addToast(t("toasts.clueRevealed"), "success");
      onClose();
    } catch (error) {
      addToast(errorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  };

  if (clues.length === 0) {
    return (
      <div className="session-form-empty">
        <Eye size={32} aria-hidden="true" />
        <p>{t("sessionPage.noUnrevealedClues")}</p>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.close")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => runSessionAction(handleSubmit(event), "No se pudo revelar la pista.") }>
      <div className="form-group">
        <label className="form-label" htmlFor="pista-select">
          {t("sessionPage.clueToReveal")}
        </label>
        <select
          id="pista-select"
          className="form-select"
          value={selectedClue}
          onChange={(event) => setSelectedClue(event.target.value)}
          required
        >
          <option value="">{t("sessionPage.selectClue")}</option>
          {clues.map((clue: Entity) => (
            <option key={clue.entityId} value={clue.entityId}>
              {clue.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t("sessionPage.audience")}</label>
        <div className="session-form-choice-group">
          <button
            type="button"
            className={`btn btn-sm ${audience === "party" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setAudience("party")}
          >
            {t("sessionPage.wholeParty")}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${audience === "character" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setAudience("character")}
          >
            {t("sessionPage.specificCharacter")}
          </button>
        </div>
      </div>

      {audience === "character" && (
        <div className="form-group">
          <label className="form-label" htmlFor="pista-character">
            {t("sessionPage.character")}
          </label>
          <select
            id="pista-character"
            className="form-select"
            value={characterId}
            onChange={(event) => setCharacterId(event.target.value)}
            required
          >
            <option value="">{t("sessionPage.selectCharacter")}</option>
            {characters.map((character: Entity) => (
              <option key={character.entityId} value={character.entityId}>
                {character.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="pista-how">
          {t("sessionPage.howRevealedOptional")}
        </label>
        <input
          id="pista-how"
          type="text"
          className="form-input"
          placeholder={t("sessionPage.howRevealedPlaceholder")}
          value={how}
          onChange={(event) => setHow(event.target.value)}
        />
      </div>

      <div className="session-form-actions">
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy || !selectedClue}>
          {busy ? t("sessionPage.revealing") : t("sessionPage.revealClueButton")}
        </button>
      </div>
    </form>
  );
}
