import React from "react";
import { Outlet, useParams } from "@tanstack/react-router";
import { CampaignWorkspace } from "../workspaces/CampaignWorkspace.js";
import { List } from "lucide-react";

export function StoryWorkspacePage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };

  const tabs = [
    {
      id: "history",
      labelKey: "campaignShell.nav.timeline",
      path: `/campaigns/${campaignId}/story/history`,
      icon: List,
    },
  ];

  return (
    <CampaignWorkspace
      titleKey="campaignShell.meta.storyTitle"
      descriptionKey="campaignShell.meta.storyDescription"
      tabs={tabs}
    >
      <Outlet />
    </CampaignWorkspace>
  );
}
