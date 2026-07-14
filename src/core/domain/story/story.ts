import type { StoryStep } from "./types.js";

/**
 * Validates if a story thread can be resolved based on its steps.
 * A thread can only be resolved when all of its steps are in a terminal state
 * (resolved or discarded) and at least one step was actually resolved (not all discarded).
 */
export function canResolveStoryThread(steps: StoryStep[]): boolean {
  if (steps.length === 0) {
    return false;
  }

  const allStepsAreTerminal = steps.every(
    (step) => step.status === "resolved" || step.status === "discarded"
  );

  const hasResolvedStep = steps.some(
    (step) => step.status === "resolved"
  );

  return allStepsAreTerminal && hasResolvedStep;
}
