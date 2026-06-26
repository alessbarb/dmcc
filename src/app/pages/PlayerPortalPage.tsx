import React from "react";
import { useParams } from "@tanstack/react-router";
import { PlayerPortalView } from "../components/PlayerPortalView.js";

export function PlayerPortalPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  return <PlayerPortalView campaignId={campaignId} />;
}
