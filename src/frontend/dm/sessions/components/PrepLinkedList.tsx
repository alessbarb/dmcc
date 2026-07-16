import { findEntityTitle } from "../prep/sessionPrepUtils.js";
import type { MaybeCampaignState } from "../sessionTypes.js";

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
    <div>
      <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--theme-text-secondary)", marginBottom: "6px" }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {safeIds.map((id) => (
          <span key={id} className="badge" style={{ backgroundColor: "var(--theme-surfaces-interactive)", border: "1px solid var(--theme-borders-default)", color: "var(--theme-text-primary)" }}>
            {findEntityTitle(campaignState, id)}
          </span>
        ))}
      </div>
    </div>
  );
}
