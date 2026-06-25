export * from "./types.js";

export function createSession(props: {
  sessionId: string;
  campaignId: string;
  title: string;
  status?: string;
  existingSessions?: any[];
  archived?: boolean;
}): any {
  const status = props.status || "active";
  if (status === "active" && props.existingSessions) {
    const activeExists = props.existingSessions.some((s) => s.status === "active");
    if (activeExists) {
      throw new Error("Only one active session per campaign is allowed");
    }
  }
  const now = new Date().toISOString();
  return {
    id: props.sessionId,
    sessionId: props.sessionId,
    campaignId: props.campaignId,
    number: (props.existingSessions?.length || 0) + 1,
    title: props.title,
    status,
    archived: props.archived || false,
    createdAt: now,
    updatedAt: now,
  };
}

export function closeSession(session: any, summary: string): any {
  if (!summary || summary.trim() === "") {
    throw new Error("Session summary is required");
  }
  return {
    ...session,
    status: "closed",
    summary,
  };
}
