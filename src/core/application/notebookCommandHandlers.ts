import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";
import type { CommandResult } from "./commandBus.js";
import { hasNotebookCycle, getHierarchyDepthIfParentSet } from "../domain/notebook/notebook.js";
import { validateNotebookTitle, validateNotebookId, validateNotebookItemId, validateNotebookItemTarget } from "../domain/notebook/validators.js";

type NotebookCommandType =
  | "CreateNotebook"
  | "UpdateNotebook"
  | "ArchiveNotebook"
  | "AddNotebookItem"
  | "RemoveNotebookItem"
  | "ReorderNotebookItems";

type NotebookCommand = Extract<Command, { type: NotebookCommandType }>;

function makeEvent<TPayload>(actorId: string, campaignId: CampaignState["campaignId"], type: StoredEvent["type"], payload: TPayload): StoredEvent<TPayload> {
  // The event union is discriminated by the command handlers above; the generic payload is preserved by callers.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return {
    eventId: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    campaignId,
    type,
    actorId,
    occurredAt: new Date().toISOString(),
    payload,
  } as StoredEvent;
}

export function handleNotebookCommand(state: CampaignState, command: NotebookCommand): CommandResult {
  switch (command.type) {
case "CreateNotebook": {
  validateNotebookId(command.notebookId);
  validateNotebookTitle(command.title);

  const notebooks = new Map(state.notebooks || new Map());
  if (command.parentNotebookId) {
    validateNotebookId(command.parentNotebookId);
    const parent = notebooks.get(command.parentNotebookId);
    if (!parent) {
      throw new Error(`Parent notebook not found: ${command.parentNotebookId}`);
    }
    if (parent.archivedAt) {
      throw new Error("Cannot create a notebook under an archived parent");
    }
    if (getHierarchyDepthIfParentSet(notebooks, command.notebookId, command.parentNotebookId) > 3) {
      throw new Error("Notebook depth limit exceeded. Maximum depth is 3");
    }
  }

  const notebook = {
    campaignId: command.campaignId,
    notebookId: command.notebookId,
    parentNotebookId: command.parentNotebookId ?? null,
    title: command.title,
    description: command.description ?? null,
    icon: command.icon ?? null,
    sortOrder: command.sortOrder,
    archivedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notebooks.set(command.notebookId, notebook);

  return {
    state: { ...state, notebooks },
    events: [makeEvent(command.actorId, command.campaignId, "NotebookCreated", notebook)],
  };
}
case "UpdateNotebook": {
  validateNotebookId(command.notebookId);
  const notebooks = new Map(state.notebooks || new Map());
  const existing = notebooks.get(command.notebookId);
  if (!existing) {
    throw new Error(`Notebook not found: ${command.notebookId}`);
  }

  if (command.title !== undefined) {
    validateNotebookTitle(command.title);
  }

  let parentNotebookId = existing.parentNotebookId;
  if (command.parentNotebookId !== undefined) {
    parentNotebookId = command.parentNotebookId;
    if (parentNotebookId) {
      validateNotebookId(parentNotebookId);
      const parent = notebooks.get(parentNotebookId);
      if (!parent) {
        throw new Error(`Parent notebook not found: ${parentNotebookId}`);
      }
      if (parent.archivedAt) {
        throw new Error("Cannot move a notebook under an archived parent");
      }
      if (hasNotebookCycle(notebooks, command.notebookId, parentNotebookId)) {
        throw new Error("Setting parent would create a cycle");
      }
      if (getHierarchyDepthIfParentSet(notebooks, command.notebookId, parentNotebookId) > 3) {
        throw new Error("Notebook depth limit exceeded. Maximum depth is 3");
      }
    }
  }

  const updated = {
    ...existing,
    parentNotebookId,
    ...(command.title !== undefined && { title: command.title }),
    ...(command.description !== undefined && { description: command.description }),
    ...(command.icon !== undefined && { icon: command.icon }),
    updatedAt: new Date().toISOString(),
  };
  notebooks.set(command.notebookId, updated);

  return {
    state: { ...state, notebooks },
    events: [makeEvent(command.actorId, command.campaignId, "NotebookUpdated", updated)],
  };
}
case "ArchiveNotebook": {
  validateNotebookId(command.notebookId);
  const notebooks = new Map(state.notebooks || new Map());
  const existing = notebooks.get(command.notebookId);
  if (!existing) {
    throw new Error(`Notebook not found: ${command.notebookId}`);
  }

  const now = new Date().toISOString();
  const updated = {
    ...existing,
    archivedAt: now,
    updatedAt: now,
  };
  notebooks.set(command.notebookId, updated);

  return {
    state: { ...state, notebooks },
    events: [makeEvent(command.actorId, command.campaignId, "NotebookArchived", { notebookId: command.notebookId })],
  };
}
case "AddNotebookItem": {
  validateNotebookItemId(command.notebookItemId);
  validateNotebookId(command.notebookId);
  
  const notebooks = state.notebooks || new Map();
  const notebook = notebooks.get(command.notebookId);
  if (!notebook) {
    throw new Error(`Notebook not found: ${command.notebookId}`);
  }
  if (notebook.archivedAt) {
    throw new Error("Cannot add an item to an archived notebook");
  }

  validateNotebookItemTarget(command.targetType, command.targetId);

  // Validate target existence in the campaign
  const targetType = command.targetType;
  const targetId = command.targetId;
  if (targetType === "entity") {
    if (!state.entities.has(targetId)) throw new Error(`Entity not found: ${targetId}`);
  } else if (targetType === "fact") {
    if (!state.facts.has(targetId)) throw new Error(`Fact not found: ${targetId}`);
  } else if (targetType === "relation") {
    if (!state.relations.has(targetId)) throw new Error(`Relation not found: ${targetId}`);
  } else if (targetType === "session") {
    if (!state.sessions.has(targetId)) throw new Error(`Session not found: ${targetId}`);
  } else if (targetType === "session_event") {
    if (!state.sessionEvents.has(targetId)) throw new Error(`Session event not found: ${targetId}`);
  } else if (targetType === "canvas") {
    if (!state.canvases.has(targetId)) throw new Error(`Canvas not found: ${targetId}`);
  } else if (targetType === "attachment") {
    if (!state.attachments.has(targetId)) throw new Error(`Attachment not found: ${targetId}`);
  }

  // No duplicate resources in the same notebook
  const items = new Map(state.notebookItems || new Map());
  for (const item of items.values()) {
    if (item.notebookId === command.notebookId && item.targetType === targetType && item.targetId === targetId) {
      throw Object.assign(
        new Error(`Notebook item already exists: Resource ${targetType}:${targetId} is already in the notebook`),
        {
          errorCode: "NOTEBOOK_ITEM_DUPLICATE",
          details: {
            notebookId: command.notebookId,
            targetType,
            targetId,
          },
        }
      );
    }
  }

  const item = {
    campaignId: command.campaignId,
    notebookItemId: command.notebookItemId,
    notebookId: command.notebookId,
    targetType,
    targetId: targetId,
    sortOrder: command.sortOrder,
    createdAt: new Date().toISOString(),
  };
  items.set(command.notebookItemId, item);

  return {
    state: { ...state, notebookItems: items },
    events: [makeEvent(command.actorId, command.campaignId, "NotebookItemAdded", item)],
  };
}
case "RemoveNotebookItem": {
  validateNotebookItemId(command.notebookItemId);
  const items = new Map(state.notebookItems || new Map());
  if (!items.has(command.notebookItemId)) {
    throw new Error(`Notebook item not found: ${command.notebookItemId}`);
  }
  items.delete(command.notebookItemId);

  return {
    state: { ...state, notebookItems: items },
    events: [makeEvent(command.actorId, command.campaignId, "NotebookItemRemoved", { notebookItemId: command.notebookItemId })],
  };
}
case "ReorderNotebookItems": {
  validateNotebookId(command.notebookId);
  const items = new Map(state.notebookItems || new Map());
  const notebookItemIds = Array.from(items.values()).filter((item) => item.notebookId === command.notebookId).map((item) => item.notebookItemId);
  const requestedItemIds = command.orderedItemIds;
  if (new Set(requestedItemIds).size !== requestedItemIds.length || requestedItemIds.length !== notebookItemIds.length || requestedItemIds.some((itemId) => !notebookItemIds.includes(itemId))) {
    throw new Error("orderedItemIds must exactly match the notebook items");
  }

  for (const [idx, itemId] of requestedItemIds.entries()) {
    const item = items.get(itemId);
    if (!item) {
      throw new Error(`Notebook item not found: ${itemId}`);
    }
    if (item.notebookId !== command.notebookId) {
      throw new Error(`Notebook item ${itemId} does not belong to notebook ${command.notebookId}`);
    }
    items.set(itemId, { ...item, sortOrder: idx });
  }

  return {
    state: { ...state, notebookItems: items },
    events: [makeEvent(command.actorId, command.campaignId, "NotebookItemsReordered", { notebookId: command.notebookId, orderedItemIds: command.orderedItemIds })],
  };
}
  }
  throw new Error("Unsupported notebook command");
}
