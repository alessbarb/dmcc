import React from "react";
import { Outlet, useParams } from "@tanstack/react-router";
import { CampaignWorkspace } from "../workspaces/CampaignWorkspace.js";
import { Users, Link2, Eye } from "lucide-react";

export function PeopleWorkspacePage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };

  const tabs = [
    {
      id: "group",
      labelKey: "campaignShell.nav.players", // "Jugadores" / "Players"
      path: `/campaigns/${campaignId}/people/group`,
      icon: Users,
    },
    {
      id: "invitations",
      labelKey: "players.playerInvitations", // "Invitaciones"
      path: `/campaigns/${campaignId}/people/invitations`,
      icon: Link2,
    },
    {
      id: "knowledge",
      labelKey: "campaignShell.nav.knowledge", // "Conocimiento" / "Knowledge"
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
