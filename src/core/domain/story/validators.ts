import { isIdWithPrefix } from "@shared/ids.js";
import type { StoryThreadStatus, StoryStepStatus, StoryStepResolutionKind } from "./types.js";

export function validateStoryThreadId(threadId: string): void {
  if (!isIdWithPrefix(threadId, "sth")) {
    throw new Error("Invalid Story Thread ID prefix. Expected sth_");
  }
}

export function validateStoryStepId(stepId: string): void {
  if (!isIdWithPrefix(stepId, "stp")) {
    throw new Error("Invalid Story Step ID prefix. Expected stp_");
  }
}

export function validateStoryThreadTitle(title: string): void {
  if (!title || title.trim() === "") {
    throw new Error("Story Thread title is required");
  }
}

export function validateStoryStepTitle(title: string): void {
  if (!title || title.trim() === "") {
    throw new Error("Story Step title is required");
  }
}

export function validateStoryThreadStatus(status: string): void {
  const validStatuses: StoryThreadStatus[] = ["planned", "active", "resolved", "discarded"];
  if (!validStatuses.includes(status as StoryThreadStatus)) {
    throw new Error(`Invalid Story Thread status: ${status}`);
  }
}

export function validateStoryStepStatus(status: string): void {
  const validStatuses: StoryStepStatus[] = ["planned", "ready", "active", "resolved", "discarded"];
  if (!validStatuses.includes(status as StoryStepStatus)) {
    throw new Error(`Invalid Story Step status: ${status}`);
  }
}

export function validateStoryStepResolutionCoherence(
  status: StoryStepStatus,
  resolutionKind?: StoryStepResolutionKind | null,
  actualOutcome?: string | null
): void {
  if (status === "resolved") {
    if (resolutionKind !== "as_planned" && resolutionKind !== "changed") {
      throw new Error("Resolved steps must have a resolution kind of 'as_planned' or 'changed'");
    }
    if (resolutionKind === "changed" && (!actualOutcome || actualOutcome.trim() === "")) {
      throw new Error("Steps resolved as 'changed' require an actual outcome");
    }
  } else if (status === "discarded") {
    if (resolutionKind !== "discarded") {
      throw new Error("Discarded steps must have a resolution kind of 'discarded'");
    }
  } else {
    if (resolutionKind !== undefined && resolutionKind !== null) {
      throw new Error("Non-terminal steps cannot have a resolution kind");
    }
  }
}
