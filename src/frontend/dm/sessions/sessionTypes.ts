import type { CampaignStateStore, Session } from "../../shared/stores/campaignStore.js";

export type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;
// The top-level campaignState can be null before the store finishes loading; sub-panels
// receive it as-is and guard with optional chaining.
export type MaybeCampaignState = CampaignState | null;
export type SessionPrep = NonNullable<Session["prep"]>;
export type ChecklistItem = NonNullable<SessionPrep["checklist"]>[number];
