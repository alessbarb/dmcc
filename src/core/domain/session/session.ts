import { sessionPrepSchema, sessionSchema, type Session, type SessionStatus } from "./types.js";
export * from "./types.js";

export function createSession(props: {
  sessionId: string;
  campaignId: string;
  title: string;
  status?: string;
  scheduledAt?: string;
  prep?: unknown;
  existingSessions?: Session[];
  archived?: boolean;
}): Session {
  const status = (props.status || "active") as SessionStatus;
  if (status === "active" && props.existingSessions) {
    const activeExists = props.existingSessions.some((s) => s.status === "active");
    if (activeExists) {
      throw new Error("Only one active session per campaign is allowed");
    }
  }
  const now = new Date().toISOString();
  const session = {
    id: props.sessionId,
    sessionId: props.sessionId,
    campaignId: props.campaignId,
    number: (props.existingSessions?.length || 0) + 1,
    title: props.title,
    status,
    ...(props.scheduledAt && { scheduledAt: props.scheduledAt }),
    ...(props.prep ? { prep: sessionPrepSchema.parse(props.prep) } : {}),
    archived: props.archived || false,
    presentPlayerIds: [],
    presentCharacterIds: [],
    createdAt: now,
    updatedAt: now,
  };

  sessionSchema.parse(session);
  return session;
}

export function closeSession(session: Session, summary: string): Session {
  if (session.status !== "active") {
    throw new Error("Only active sessions can be closed");
  }
  if (!summary || summary.trim() === "") {
    throw new Error("Session summary is required");
  }
  return {
    ...session,
    status: "closed",
    summary,
    updatedAt: new Date().toISOString(),
  };
}
