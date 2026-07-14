import React from "react";
import { Outlet, useParams, useRouterState } from "@tanstack/react-router";
import { CampaignWorkspace } from "../workspaces/CampaignWorkspace.js";
import { WorkspaceTabs } from "../workspaces/WorkspaceTabs.js";
import { LayoutGrid, GitFork } from "lucide-react";

export function CampaignMapWorkspacePage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const routerState = useRouterState();
  const isCanvas = routerState.location.pathname.includes("/map/canvas");

  const tabs = [
    {
      id: "canvas",
      labelKey: "campaignShell.nav.canvas",
      path: `/campaigns/${campaignId}/map/canvas`,
      icon: LayoutGrid,
    },
    {
      id: "network",
      labelKey: "campaignShell.nav.graph",
      path: `/campaigns/${campaignId}/map/network`,
      icon: GitFork,
    },
  ];

  if (isCanvas) {
    return (
      <div className="campaign-workspace campaign-workspace--canvas" style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <div style={{ padding: "0 24px" }}>
          <WorkspaceTabs tabs={tabs} />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <CampaignWorkspace
      titleKey="campaignShell.meta.mapTitle"
      descriptionKey="campaignShell.meta.mapDescription"
      tabs={tabs}
    >
      <Outlet />
    </CampaignWorkspace>
  );
}
