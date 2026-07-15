import React from "react";
import { Outlet, useParams, useRouterState } from "@tanstack/react-router";
import { WorkspaceTabs } from "../workspaces/WorkspaceTabs.js";
import { LayoutGrid, GitFork } from "lucide-react";
import "./network/networkFlow.css";

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
    <div
      className={`campaign-workspace campaign-workspace--map-tool ${isCanvas ? "campaign-workspace--canvas" : ""} ${isNetwork ? "campaign-workspace--network" : ""}`}
    >
      <div className="campaign-workspace--map-tool__tabs">
        <WorkspaceTabs tabs={tabs} />
      </div>
      <div className="campaign-workspace--map-tool__content">
        <Outlet />
      </div>
    </div>
  );
}
