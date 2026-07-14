import { isIdWithPrefix } from "@shared/ids.js";
import type { NotebookItemTargetType } from "../resource/resourceType.js";

export function validateNotebookTitle(title: string): void {
  if (!title || title.trim() === "") {
    throw new Error("Notebook title is required");
  }
}

export function validateNotebookId(notebookId: string): void {
  if (!isIdWithPrefix(notebookId, "nbk")) {
    throw new Error("Invalid Notebook ID prefix. Expected nbk_");
  }
}

export function validateNotebookItemId(notebookItemId: string): void {
  if (!isIdWithPrefix(notebookItemId, "nbi")) {
    throw new Error("Invalid Notebook Item ID prefix. Expected nbi_");
  }
}

export function validateNotebookItemTarget(targetType: NotebookItemTargetType, targetId: string): void {
  const validPrefixes: Record<NotebookItemTargetType, string> = {
    entity: "ent",
    fact: "fact",
    relation: "rel",
    session: "sess",
    session_event: "sevt",
    canvas: "cvs",
    attachment: "att"
  };

  const expectedPrefix = validPrefixes[targetType];
  if (!expectedPrefix) {
    throw new Error(`Unsupported targetType: ${targetType}`);
  }

  if (!isIdWithPrefix(targetId, expectedPrefix)) {
    throw new Error(`Invalid targetId prefix for ${targetType}. Expected ${expectedPrefix}_`);
  }
}
