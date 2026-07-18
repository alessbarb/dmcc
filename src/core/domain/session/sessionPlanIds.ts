import type { SessionId } from "@shared/ids.js";

export type SessionPlanUpcastElement =
  | "flow_item"
  | "content_link"
  | "transition"
  | "binding"
  | "goal"
  | "checklist_item";

// FNV-1a 64-bit, kept in pure TS (no node:crypto) so this stays usable from
// both the server and the browser bundle — see @core/domain tsconfig.app.json.
function fnv1a64Hex(input: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, "0");
}

// Deterministic (no dates/Math.random) so re-running the upcaster is a no-op.
export function upcastSessionPlanId(params: {
  prefix: string;
  sessionId: SessionId;
  element: SessionPlanUpcastElement;
  content: string;
  appearanceIndex: number;
}): string {
  const hashInput = `${params.sessionId}:${params.element}:${params.content}:${params.appearanceIndex}`;
  return `${params.prefix}_${fnv1a64Hex(hashInput)}`;
}
