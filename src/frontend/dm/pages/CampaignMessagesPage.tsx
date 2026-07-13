import { useParams } from "@tanstack/react-router";
import { CampaignMessagingPanel } from "../../shared/components/CampaignMessagingPanel.js";

export function CampaignMessagesPage() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId" });
  return <CampaignMessagingPanel campaignId={campaignId} dmMode />;
}
