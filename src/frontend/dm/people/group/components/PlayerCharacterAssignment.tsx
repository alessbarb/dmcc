import { useState } from "react";
import type { CampaignStateStore } from "../../../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../../../shared/hooks/useToast.js";
import type { DmPortalCharacterSummary } from "../../../../shared/api/playerPortalApi.js";
import { useTranslation } from "../../../../shared/i18n/useTranslation.js";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function PlayerCharacterAssignment({
  playerId,
  linkedCharacterLabel,
  availableCharacters,
  linkPlayerCharacter,
  unlinkPlayerCharacter,
  addToast,
}: {
  playerId: string;
  linkedCharacterLabel: string | null;
  availableCharacters: DmPortalCharacterSummary[];
  linkPlayerCharacter: CampaignStateStore["linkPlayerCharacter"];
  unlinkPlayerCharacter: CampaignStateStore["unlinkPlayerCharacter"];
  addToast: (msg: string, kind?: ToastKind) => void;
}) {
  const { t } = useTranslation();
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAssign = async () => {
    if (!selectedCharacterId) return;
    setBusy(true);
    try {
      await linkPlayerCharacter(playerId, selectedCharacterId);
      setSelectedCharacterId("");
      addToast(t("players.characterAssigned"), "success");
    } catch (err) {
      addToast(t("players.characterAssignError", { error: errorMessage(err) }), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm(t("players.unlinkCharacterConfirm"))) return;
    setBusy(true);
    try {
      await unlinkPlayerCharacter(playerId);
      addToast(t("players.characterUnlinked"), "success");
    } catch (err) {
      addToast(t("players.characterUnlinkError", { error: errorMessage(err) }), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group-view-portal-section">
      <p className="group-view-portal-section__label">{t("players.assignCharacterLabel")}</p>
      {linkedCharacterLabel ? (
        <div className="group-view-assignment group-view-assignment--linked">
          <p>{t("players.linkedCharacter", { character: linkedCharacterLabel })}</p>
          <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => { void handleUnlink(); }}>
            {t("players.unlinkCharacter")}
          </button>
        </div>
      ) : (
        <div className="group-view-assignment">
          <select
            className="group-view-character-select"
            value={selectedCharacterId}
            onChange={(event) => setSelectedCharacterId(event.target.value)}
            disabled={busy}
            aria-label={t("players.selectCharacterLabel")}
          >
            <option value="">{t("players.selectCharacterPlaceholder")}</option>
            {availableCharacters.map((character) => (
              <option key={character.entityId} value={character.entityId}>
                {character.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!selectedCharacterId || busy}
            onClick={() => { void handleAssign(); }}
          >
            {t("players.assignCharacter")}
          </button>
        </div>
      )}
    </div>
  );
}
