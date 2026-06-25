export function isUndoableEvent(type: string): boolean {
  return [
    "EntityCreated",
    "EntityUpdated",
    "EntityArchived",
    "RelationCreated",
    "RelationArchived",
    "FactCreated",
    "PlayerProfileCreated",
    "PlayerProfileUpdated",
    "PlayerProfileArchived",
    "VisibilityChanged",
  ].includes(type);
}
