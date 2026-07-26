import type { ReactNode } from "react";
import { useParams } from "@tanstack/react-router";
import { CalendarClock, GitFork, Waypoints } from "lucide-react";
import { PageSubshell } from "../workspaces/PageSubshell.js";

interface SessionPageShellProps {
  children: ReactNode;
  className?: string;
}

export function SessionPageShell({ children, className }: SessionPageShellProps) {
  const { campaignId, sessionId } = useParams({ strict: false }) as { campaignId?: string; sessionId?: string };
  const sessionPath = campaignId && sessionId ? `/campaigns/${campaignId}/sessions/${sessionId}` : null;
  const tabs = [
    {
      id: "sessions",
      labelKey: "campaignShell.nav.session",
      path: `/campaigns/${campaignId ?? ""}/sessions`,
      icon: CalendarClock,
    },
    ...(sessionPath
      ? [
          {
            id: "narrative-map",
            labelKey: "sessionNarrativeMap.title",
            path: `${sessionPath}/map`,
            icon: Waypoints,
          },
          {
            id: "consequences",
            labelKey: "sessionConsequenceChain.title",
            path: `${sessionPath}/consequences`,
            icon: GitFork,
          },
        ]
      : []),
  ];

  return (
    <PageSubshell
      titleKey="campaignShell.meta.sessionTitle"
      variant="narrative"
      className="session-page-shell"
      contentClassName={["session-page", className].filter(Boolean).join(" ")}
      tabs={tabs}
    >
      {children}
    </PageSubshell>
  );
}
