import { MessageSquare, Eye, Target } from "lucide-react";
import type { PlayerCharacterProposalKind } from "@core/domain/playerPortal/types.js";
import { useTranslation } from "../../../../shared/i18n/useTranslation.js";
import type { DmInboxItems } from "../dmInbox.js";

const INBOX_PROPOSAL_KIND_KEYS: Record<PlayerCharacterProposalKind, string> = {
  link_request: "players.inboxProposalKindLinkRequest",
  create_character: "players.inboxProposalKindCreateCharacter",
  update_character_core: "players.inboxProposalKindUpdateCharacter",
};

export function DmPlayerInbox({ items }: { items: DmInboxItems }) {
  const { t } = useTranslation();
  if (items.total === 0) return null;

  return (
    <div className="card group-view-inbox">
      <div className="group-view-inbox__header">
        <div>
          <h3>
            <MessageSquare size={18} aria-hidden="true" /> {t("players.inboxTitle")}
          </h3>
          <p>{t("players.inboxDescription")}</p>
        </div>
        <span className="badge badge-default">{t("players.inboxPendingCount", { count: items.total })}</span>
      </div>

      <div className="group-view-inbox__grid">
        {items.proposals.slice(0, 4).map(({ portalPlayer, proposal }) => (
          <div key={proposal.proposalId} className="group-view-inbox-item">
            <Target size={15} aria-hidden="true" />
            <div>
              <strong>{portalPlayer.displayName}</strong>
              <p>{t(proposal.kind ? INBOX_PROPOSAL_KIND_KEYS[proposal.kind] : "players.inboxProposalKindGeneric")}</p>
            </div>
          </div>
        ))}
        {items.questions.slice(0, 6).map(({ portalPlayer, objective }) => (
          <div key={objective.objectiveId} className="group-view-inbox-item">
            <MessageSquare size={15} aria-hidden="true" />
            <div>
              <strong>{portalPlayer.displayName}: {objective.title}</strong>
              {objective.description && <p>{objective.description}</p>}
            </div>
          </div>
        ))}
        {items.notes.slice(0, 4).map(({ portalPlayer, note }) => (
          <div key={note.noteId} className="group-view-inbox-item">
            <Eye size={15} aria-hidden="true" />
            <div>
              <strong>{portalPlayer.displayName}: {note.title}</strong>
              {note.content && <p>{note.content}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
