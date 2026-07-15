import { useState } from "react";
import type { PlayerCharacterProposalKind } from "@core/domain/playerPortal/types.js";
import type { CampaignStateStore } from "../../../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../../../shared/hooks/useToast.js";
import type { DmPortalCharacterSummary, DmPortalProposal } from "../../../../shared/api/playerPortalApi.js";
import { useTranslation } from "../../../../shared/i18n/useTranslation.js";

const PROPOSAL_KIND_KEYS: Record<PlayerCharacterProposalKind, string> = {
  link_request: "players.proposalKindLinkRequestCard",
  create_character: "players.proposalKindCreateCharacterCard",
  update_character_core: "players.proposalKindUpdateCharacterCard",
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function PlayerProposalReview({
  proposals,
  availableCharacters,
  resolvePlayerCharacterProposal,
  addToast,
}: {
  proposals: DmPortalProposal[];
  availableCharacters: DmPortalCharacterSummary[];
  resolvePlayerCharacterProposal: CampaignStateStore["resolvePlayerCharacterProposal"];
  addToast: (msg: string, kind?: ToastKind) => void;
}) {
  const { t } = useTranslation();
  const [resolvingProposalIds, setResolvingProposalIds] = useState<Set<string>>(new Set());

  if (proposals.length === 0) return null;

  const resolve = async (proposal: DmPortalProposal, status: "approved" | "rejected") => {
    setResolvingProposalIds((prev) => new Set(prev).add(proposal.proposalId));
    try {
      const dmResolutionNote = status === "approved" ? t("players.proposalApprovedNote") : t("players.proposalRejectedNote");
      await resolvePlayerCharacterProposal(proposal.proposalId, { status, dmResolutionNote });
      addToast(status === "approved" ? t("players.proposalApprovedToast") : t("players.proposalRejectedToast"), "success");
    } catch (err) {
      addToast(t("players.proposalResolveError", { error: errorMessage(err) }), "error");
    } finally {
      setResolvingProposalIds((prev) => {
        const next = new Set(prev);
        next.delete(proposal.proposalId);
        return next;
      });
    }
  };

  return (
    <div className="group-view-portal-section">
      <p className="group-view-portal-section__label">{t("players.pendingProposals")}</p>
      <div className="group-view-proposal-list">
        {proposals.map((proposal) => {
          const busy = resolvingProposalIds.has(proposal.proposalId);
          const kindKey = proposal.kind ? PROPOSAL_KIND_KEYS[proposal.kind] : "players.proposalKindGenericCard";
          return (
            <div key={proposal.proposalId} className="group-view-proposal-card">
              <p className="group-view-proposal-card__kind">{t(kindKey)}</p>

              {proposal.kind === "link_request" && proposal.targetCharacterEntityId && (
                <p className="group-view-proposal-card__detail">
                  {t("players.proposalLinkRequestTarget", {
                    character: availableCharacters.find((character) => character.entityId === proposal.targetCharacterEntityId)?.title
                      ?? proposal.targetCharacterEntityId,
                  })}
                </p>
              )}

              {proposal.kind === "create_character" && proposal.proposedChanges && (
                <div className="group-view-proposal-card__fields">
                  <span><strong>{t("players.proposalFieldName")}</strong> {proposal.proposedChanges.title ?? proposal.proposedChanges.name ?? "—"}</span>
                  <span><strong>{t("players.proposalFieldClass")}</strong> {proposal.proposedChanges.className ?? "—"}</span>
                  <span><strong>{t("players.proposalFieldSpecies")}</strong> {proposal.proposedChanges.species ?? proposal.proposedChanges.race ?? "—"}</span>
                  <span><strong>{t("players.proposalFieldBackground")}</strong> {proposal.proposedChanges.background ?? "—"}</span>
                </div>
              )}

              <div className="group-view-proposal-card__actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busy}
                  onClick={() => { void resolve(proposal, "approved"); }}
                >
                  {t("players.approveProposal")}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={busy}
                  onClick={() => { void resolve(proposal, "rejected"); }}
                >
                  {t("players.rejectProposal")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
