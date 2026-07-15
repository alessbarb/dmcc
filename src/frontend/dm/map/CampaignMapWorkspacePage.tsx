import React, { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useParams, useRouterState } from "@tanstack/react-router";
import { WorkspaceTabs } from "../workspaces/WorkspaceTabs.js";
import { GitFork, LayoutGrid, Maximize2, Minimize2 } from "lucide-react";
import "../workspaces/workspaceSystem.css";
import "./mapWorkspace.css";

export function CampaignMapWorkspacePage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const routerState = useRouterState();
  const isCanvas = routerState.location.pathname.includes("/map/canvas");
  const isNetwork = routerState.location.pathname.includes("/map/network");
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === workspaceRef.current);
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    if (document.fullscreenElement === workspace) {
      await document.exitFullscreen();
      return;
    }

    if (document.fullscreenElement) await document.exitFullscreen();
    await workspace.requestFullscreen({ navigationUI: "hide" });
  }, []);

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
      ref={workspaceRef}
      className={`campaign-workspace campaign-workspace--map-tool ${isCanvas ? "campaign-workspace--canvas" : ""} ${isNetwork ? "campaign-workspace--network" : ""}`}
    >
      <div className="campaign-workspace--map-tool__tabs">
        <WorkspaceTabs tabs={tabs} />
        {isNetwork ? (
          <button
            type="button"
            className="map-workspace-fullscreen-button"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        ) : null}
      </div>
      <div className="campaign-workspace--map-tool__content">
        <Outlet />
      </div>
    </div>
  );
}
