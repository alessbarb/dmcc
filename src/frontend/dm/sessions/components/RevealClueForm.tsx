import { useState } from "react";
import { Eye } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { CampaignStateStore, Entity, Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { runSessionAction } from "../sessionFormSubmit.js";

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
    (e: Entity) =>
      e.entityType === "clue" &&
      !e.archived &&
      (e.status === "prepared" || e.status === "hidden")
  );

  const [selectedClue, setSelectedClue] = useState("");
  const [audience, setAudience] = useState<"party" | "character">("party");
  const [characterId, setCharacterId] = useState("");
  const [how, setHow] = useState("");
  const [busy, setBusy] = useState(false);

  const characters = (campaignState?.entities ?? []).filter(
    (e: Entity) => e.entityType === "player_character" && !e.archived
  );

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!selectedClue) return;
    setBusy(true);
    const audiencePayload =
      audience === "character" && characterId
        ? { kind: "characters" as const, characterEntityIds: [characterId] }
        : { kind: "party" as const };
    await revealClue(activeSession?.sessionId, selectedClue, audiencePayload, how);
    addToast(t("toasts.clueRevealed"), "success");
    setBusy(false);
    onClose();
  };

  if (clues.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "24px 0",
          color: "var(--text-muted)",
        }}
      >
        <Eye size={32} style={{ opacity: 0.4 }} />
        <p>{t("sessionPage.noUnrevealedClues")}</p>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.close")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => {
      runSessionAction(handleSubmit(event), "No se pudo revelar la pista.");
    }}>
      <div className="form-group">
        <label className="form-label" htmlFor="pista-select">
          {t("sessionPage.clueToReveal")}
        </label>
        <select
          id="pista-select"
          className="form-select"
          value={selectedClue}
          onChange={(e) => setSelectedClue(e.target.value)}
          required
        >
          <option value="">{t("sessionPage.selectClue")}</option>
          {clues.map((c: Entity) => (
            <option key={c.entityId} value={c.entityId}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t("sessionPage.audience")}</label>
        <div style={{ display: "flex", gap: "10px" }}>
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
            onChange={(e) => setCharacterId(e.target.value)}
            required
          >
            <option value="">{t("sessionPage.selectCharacter")}</option>
            {characters.map((c: Entity) => (
              <option key={c.entityId} value={c.entityId}>
                {c.title}
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
          onChange={(e) => setHow(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy || !selectedClue}>
          {busy ? t("sessionPage.revealing") : t("sessionPage.revealClueButton")}
        </button>
      </div>
    </form>
  );
}
