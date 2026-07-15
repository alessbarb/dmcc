import React from "react";
import { Outlet, useParams } from "@tanstack/react-router";
import { Eye, Link2, Users } from "lucide-react";
import { CampaignWorkspace } from "../workspaces/CampaignWorkspace.js";
import "./peopleWorkspace.css";

export function PeopleWorkspacePage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };

  const tabs = [
    {
      id: "group",
      labelKey: "campaignShell.nav.players",
      path: `/campaigns/${campaignId}/people/group`,
      icon: Users,
    },
    {
      id: "invitations",
      labelKey: "players.playerInvitations",
      path: `/campaigns/${campaignId}/people/invitations`,
      icon: Link2,
    },
    {
      id: "knowledge",
      labelKey: "campaignShell.nav.knowledge",
      path: `/campaigns/${campaignId}/people/knowledge`,
      icon: Eye,
    },
  ];

  return (
    <CampaignWorkspace
      titleKey="campaignShell.meta.peopleTitle"
      descriptionKey="campaignShell.meta.peopleDescription"
      tabs={tabs}
    >
      <Outlet />
    </CampaignWorkspace>
  );
}
