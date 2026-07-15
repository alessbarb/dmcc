import { User } from "lucide-react";
import type { CampaignStateStore } from "../../../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../../../shared/hooks/useToast.js";
import type { DmPortalCharacterSummary, DmPortalPlayer } from "../../../../shared/api/playerPortalApi.js";
import { useTranslation } from "../../../../shared/i18n/useTranslation.js";
import { PlayerProposalReview } from "./PlayerProposalReview.js";
import { PlayerCharacterAssignment } from "./PlayerCharacterAssignment.js";

export function DmPortalPlayerCard({
  portalPlayer,
  availableCharacters,
  resolvePlayerCharacterProposal,
  linkPlayerCharacter,
  unlinkPlayerCharacter,
  addToast,
}: {
  portalPlayer: DmPortalPlayer;
  availableCharacters: DmPortalCharacterSummary[];
  resolvePlayerCharacterProposal: CampaignStateStore["resolvePlayerCharacterProposal"];
  linkPlayerCharacter: CampaignStateStore["linkPlayerCharacter"];
  unlinkPlayerCharacter: CampaignStateStore["unlinkPlayerCharacter"];
  addToast: (msg: string, kind?: ToastKind) => void;
}) {
  const { t } = useTranslation();
  const status = portalPlayer.sheet?.status;
  const pendingProposals = (portalPlayer.proposals ?? []).filter((proposal) => proposal.status === "pending");
  const linkedCharacterLabel = portalPlayer.link?.characterEntityId
    ? portalPlayer.linkedCharacter?.title ?? portalPlayer.link.characterEntityId
    : null;

  return (
    <div className="card group-view-portal-card">
      <div className="group-view-portal-card__header">
        <User size={20} aria-hidden="true" />
        <div>
          <p className="group-view-portal-card__name">{portalPlayer.displayName}</p>
          <p className="group-view-portal-card__link-status">
            {linkedCharacterLabel ? t("players.linkedCharacter", { character: linkedCharacterLabel }) : t("players.noLinkedCharacter")}
          </p>
        </div>
      </div>

      {status && (
        <div className="group-view-portal-section">
          <p className="group-view-portal-section__label">{t("players.liveStatusLabel")}</p>
          <div className="group-view-status-badges">
            <span className="group-view-status-badge">
              {t("players.hitPointsLabel", { current: status.hitPointsCurrent ?? "?", max: status.hitPointsMax ?? "?" })}
            </span>
            {status.armorClass !== undefined && (
              <span className="group-view-status-badge">{t("players.armorClassLabel", { value: status.armorClass })}</span>
            )}
            {status.inspiration && (
              <span className="group-view-status-badge group-view-status-badge--accent">{t("players.inspirationLabel")}</span>
            )}
            {(status.conditions ?? []).map((condition) => (
              <span key={condition} className="group-view-status-badge group-view-status-badge--danger">{condition}</span>
            ))}
          </div>
        </div>
      )}

      {(portalPlayer.notes ?? []).length > 0 && (
        <div className="group-view-portal-section">
          <p className="group-view-portal-section__label">{t("players.visibleNotesLabel")}</p>
          <ul className="group-view-portal-list">
            {(portalPlayer.notes ?? []).map((note) => <li key={note.noteId}>{note.title}</li>)}
          </ul>
        </div>
      )}

      {(portalPlayer.objectives ?? []).length > 0 && (
        <div className="group-view-portal-section">
          <p className="group-view-portal-section__label">{t("players.visibleObjectivesLabel")}</p>
          <ul className="group-view-portal-list">
            {(portalPlayer.objectives ?? []).map((objective) => <li key={objective.objectiveId}>{objective.title}</li>)}
          </ul>
        </div>
      )}

      <PlayerProposalReview
        proposals={pendingProposals}
        availableCharacters={availableCharacters}
        resolvePlayerCharacterProposal={resolvePlayerCharacterProposal}
        addToast={addToast}
      />

      <PlayerCharacterAssignment
        playerId={portalPlayer.playerId}
        linkedCharacterLabel={linkedCharacterLabel}
        availableCharacters={availableCharacters}
        linkPlayerCharacter={linkPlayerCharacter}
        unlinkPlayerCharacter={unlinkPlayerCharacter}
        addToast={addToast}
      />
    </div>
  );
}
