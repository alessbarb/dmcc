export interface EntityRelationshipNavigationState {
  stack: string[];
}

export const initialEntityRelationshipNavigationState: EntityRelationshipNavigationState = {
  stack: [],
};

export function pushNavigation(
  state: EntityRelationshipNavigationState,
  fromEntityId: string,
): EntityRelationshipNavigationState {
  return { stack: [...state.stack, fromEntityId] };
}

export function popNavigation(
  state: EntityRelationshipNavigationState,
): { state: EntityRelationshipNavigationState; entityId: string | null } {
  if (state.stack.length === 0) return { state, entityId: null };
  const entityId = state.stack[state.stack.length - 1];
  return { state: { stack: state.stack.slice(0, -1) }, entityId };
}

export function resetNavigation(): EntityRelationshipNavigationState {
  return initialEntityRelationshipNavigationState;
}

// A change of entity only counts as "internal" (and keeps the history) when it
// matches the target the hook itself just navigated to.
export function isExternalEntityChange(
  internalNavigationTarget: string | null,
  newEntityId: string,
): boolean {
  return internalNavigationTarget !== newEntityId;
}
