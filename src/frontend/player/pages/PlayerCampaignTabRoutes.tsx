import { useParams } from "@tanstack/react-router";
import { PlayerCampaignTabContent, type PlayerCampaignTab } from "./PlayerCampaignTabContent.js";

function useCampaignId(): string {
  return (useParams({ strict: false }) as { campaignId: string }).campaignId;
}

function PlayerCampaignTabRoute({ tab }: { tab: PlayerCampaignTab }) {
  return <PlayerCampaignTabContent campaignId={useCampaignId()} tab={tab} />;
}

export function PlayerCampaignOverviewRoute() {
  return <PlayerCampaignTabRoute tab="overview" />;
}

export function PlayerCampaignRecapRoute() {
  return <PlayerCampaignTabRoute tab="recap" />;
}

export function PlayerCampaignCharacterRoute() {
  return <PlayerCampaignTabRoute tab="character" />;
}

export function PlayerCampaignMemoryRoute() {
  return <PlayerCampaignTabRoute tab="memory" />;
}

export function PlayerCampaignConstellationRoute() {
  return <PlayerCampaignTabRoute tab="constellation" />;
}

export function PlayerCampaignObjectivesRoute() {
  return <PlayerCampaignTabRoute tab="objectives" />;
}

export function PlayerCampaignNotesRoute() {
  return <PlayerCampaignTabRoute tab="notes" />;
}
