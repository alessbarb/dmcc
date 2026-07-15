import React from "react";
import { Outlet, useParams } from "@tanstack/react-router";
import { CampaignWorkspace } from "../workspaces/CampaignWorkspace.js";
import { List, LayoutGrid, BookOpen } from "lucide-react";
import "./boards/entityBoards.css";

export function LibraryWorkspacePage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };

  const tabs = [
    {
      id: "list",
      labelKey: "campaignShell.nav.entities",
      path: `/campaigns/${campaignId}/library/list`,
      icon: List,
    },
    {
      id: "boards",
      labelKey: "campaignShell.nav.boards",
      path: `/campaigns/${campaignId}/library/boards`,
      icon: LayoutGrid,
    },
    {
      id: "notebooks",
      labelKey: "campaignShell.nav.notebooks",
      path: `/campaigns/${campaignId}/library/notebooks`,
      icon: BookOpen,
    },
  ];

  return (
    <CampaignWorkspace
      titleKey="campaignShell.meta.libraryTitle"
      descriptionKey="campaignShell.meta.libraryDescription"
      tabs={tabs}
    >
      <Outlet />
    </CampaignWorkspace>
  );
}
