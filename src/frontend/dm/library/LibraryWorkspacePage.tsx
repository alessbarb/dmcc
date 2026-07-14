import React from "react";
import { Outlet, useParams } from "@tanstack/react-router";
import { CampaignWorkspace } from "../workspaces/CampaignWorkspace.js";
import { List, LayoutGrid } from "lucide-react";

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
