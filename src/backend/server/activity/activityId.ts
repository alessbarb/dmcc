import { createHash } from "node:crypto";

export function activityIdForSource(params: {
  campaignId: string;
  sourceKind: "domain_event" | "operation";
  sourceId: string;
}): string {
  const hashInput = `${params.campaignId}:${params.sourceKind}:${params.sourceId}`;
  const hash = createHash("sha256").update(hashInput).digest("hex").slice(0, 32);
  return `act_${hash}`;
}
