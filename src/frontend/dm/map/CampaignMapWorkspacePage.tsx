import React from "react";
import { Outlet, useParams, useRouterState } from "@tanstack/react-router";
import { PageSubshell } from "../workspaces/PageSubshell.js";
import { GitFork, LayoutGrid } from "lucide-react";
import "./mapWorkspace.css";

export function CampaignMapWorkspacePage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const routerState = useRouterState();
  const isCanvas = routerState.location.pathname.includes("/map/canvas");
  const isNetwork = routerState.location.pathname.includes("/map/network");
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

  return (
    <PageSubshell
      titleKey="campaignShell.meta.mapTitle"
      variant="canvas"
      className={`campaign-workspace--map-tool ${isCanvas ? "campaign-workspace--canvas" : ""} ${isNetwork ? "campaign-workspace--network" : ""}`}
      contentClassName="campaign-workspace--map-tool__content"
      tabs={tabs}
    >
      <Outlet />
    </PageSubshell>
  );
}
