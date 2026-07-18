import { createHash } from "node:crypto";
import type { SessionId } from "@shared/ids.js";

export type SessionPlanUpcastElement =
  | "flow_item"
  | "content_link"
  | "transition"
  | "binding"
  | "goal"
  | "checklist_item";

// Deterministic (no dates/Math.random) so re-running the upcaster is a no-op.
export function upcastSessionPlanId(params: {
  prefix: string;
  sessionId: SessionId;
  element: SessionPlanUpcastElement;
  content: string;
  appearanceIndex: number;
}): string {
  const hashInput = `${params.sessionId}:${params.element}:${params.content}:${params.appearanceIndex}`;
  const hash = createHash("sha256").update(hashInput).digest("hex").slice(0, 32);
  return `${params.prefix}_${hash}`;
}
