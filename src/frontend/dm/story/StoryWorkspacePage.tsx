import React from "react";
import { Outlet, useParams } from "@tanstack/react-router";
import { CampaignWorkspace } from "../workspaces/CampaignWorkspace.js";
import { List, GitBranch } from "lucide-react";
import "./plan/storyPlanWorkspace.css";

export function StoryWorkspacePage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };

  const tabs = [
    {
      id: "history",
      labelKey: "campaignShell.nav.timeline",
      path: `/campaigns/${campaignId}/story/history`,
      icon: List,
    },
    {
      id: "plan",
      labelKey: "campaignShell.nav.storyPlan",
      path: `/campaigns/${campaignId}/story/plan`,
      icon: GitBranch,
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
