export type RelationshipHandleSide = "top" | "right" | "bottom" | "left";

const OPPOSITE: Record<RelationshipHandleSide, RelationshipHandleSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

// Picks which side of a node a connection line should leave from, given the
// vector from that node toward the other one — whichever axis has the
// larger delta wins, so the line always exits toward its actual target
// instead of being pinned to a fixed top/bottom pair.
export function pickRelationshipHandleSide(dx: number, dy: number): RelationshipHandleSide {
  if (dx === 0 && dy === 0) return "bottom";
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "bottom" : "top";
}

export function oppositeRelationshipHandleSide(side: RelationshipHandleSide): RelationshipHandleSide {
  return OPPOSITE[side];
}
