import { useRef, useState } from "react";
import {
  initialEntityRelationshipNavigationState,
  isExternalEntityChange,
  popNavigation,
  pushNavigation,
  resetNavigation,
  type EntityRelationshipNavigationState,
} from "./entityRelationshipNavigationState.js";

export interface UseEntityRelationshipNavigationInput {
  currentEntityId: string;
  onSelectEntity: (entityId: string) => void;
}

export interface EntityRelationshipNavigation {
  canGoBack: boolean;
  navigateToEntity: (entityId: string) => void;
  goBack: () => void;
  reset: () => void;
}

export function useEntityRelationshipNavigation({
  currentEntityId,
  onSelectEntity,
}: UseEntityRelationshipNavigationInput): EntityRelationshipNavigation {
  const [state, setState] = useState<EntityRelationshipNavigationState>(
    initialEntityRelationshipNavigationState,
  );
  const internalNavigationTargetRef = useRef<string | null>(null);
  const previousEntityIdRef = useRef(currentEntityId);

  const reset = () => {
    setState(resetNavigation());
    internalNavigationTargetRef.current = null;
  };

  if (currentEntityId !== previousEntityIdRef.current) {
    if (isExternalEntityChange(internalNavigationTargetRef.current, currentEntityId)) {
      setState(resetNavigation());
    }
    internalNavigationTargetRef.current = null;
    previousEntityIdRef.current = currentEntityId;
  }

  const navigateToEntity = (entityId: string) => {
    if (entityId === currentEntityId) return;
    setState((prev) => pushNavigation(prev, currentEntityId));
    internalNavigationTargetRef.current = entityId;
    onSelectEntity(entityId);
  };

  const goBack = () => {
    setState((prev) => {
      const { state: next, entityId } = popNavigation(prev);
      if (entityId === null) return prev;
      internalNavigationTargetRef.current = entityId;
      onSelectEntity(entityId);
      return next;
    });
  };

  return { canGoBack: state.stack.length > 0, navigateToEntity, goBack, reset };
}
