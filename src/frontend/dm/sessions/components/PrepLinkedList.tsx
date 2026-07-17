import { findEntityTitle } from "../prep/sessionPrepUtils.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import "./session-linked-list.css";

export function PrepLinkedList({
  title,
  ids,
  campaignState,
}: {
  title: string;
  ids: string[] | undefined;
  campaignState: MaybeCampaignState;
}) {
  const safeIds = ids ?? [];
  if (safeIds.length === 0) return null;
  return (
    <section className="session-linked-list">
      <h4 className="session-linked-list__title">{title}</h4>
      <div className="session-linked-list__items">
        {safeIds.map((id) => (
          <span key={id} className="badge session-linked-list__item">
            {findEntityTitle(campaignState, id)}
          </span>
        ))}
      </div>
    </section>
  );
}
