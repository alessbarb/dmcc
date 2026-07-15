from __future__ import annotations

from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def path_for(relative: str) -> Path:
    return ROOT / relative


def read(relative: str) -> str:
    return path_for(relative).read_text(encoding="utf-8")


def write(relative: str, content: str) -> None:
    target = path_for(relative)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    print(f"updated {relative}")


def replace_once(relative: str, old: str, new: str) -> None:
    content = read(relative)
    count = content.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one match in {relative}, found {count}: {old[:120]!r}")
    write(relative, content.replace(old, new, 1))


def sub_once(relative: str, pattern: str, replacement: str, flags: int = 0) -> None:
    content = read(relative)
    updated, count = re.subn(pattern, replacement, content, count=1, flags=flags)
    if count != 1:
        raise RuntimeError(f"Expected exactly one regex match in {relative}, found {count}: {pattern[:160]!r}")
    write(relative, updated)


def remove(relative: str) -> None:
    target = path_for(relative)
    if not target.exists():
        raise RuntimeError(f"Expected file to exist: {relative}")
    target.unlink()
    print(f"removed {relative}")


# ---------------------------------------------------------------------------
# Remove the LAN compatibility regression. DMCC is a hosted web application;
# invitation links use the canonical web origin and never expose host interfaces.
# ---------------------------------------------------------------------------
remove("src/backend/server/web/routes/networkInfoWebRoutes.ts")
replace_once(
    "src/backend/server/web/registerWebRoutes.ts",
    'import { registerNetworkInfoWebRoutes } from "./routes/networkInfoWebRoutes.js";\n',
    "",
)
replace_once(
    "src/backend/server/web/registerWebRoutes.ts",
    "  void registerNetworkInfoWebRoutes(server);\n",
    "",
)
replace_once(
    "src/backend/entry/index.ts",
    'if (host === "0.0.0.0") {\n  (server as any).lanExposed = true;\n}\n\n',
    "",
)
replace_once(
    "src/frontend/dm/people/invitations/InvitationsView.tsx",
    'import { Plus, Link2, Copy, Trash2, Clock, Wifi } from "lucide-react";',
    'import { Plus, Link2, Copy, Trash2, Clock } from "lucide-react";',
)
replace_once(
    "src/frontend/dm/people/invitations/InvitationsView.tsx",
    '  const [networkUrl, setNetworkUrl] = useState<string | null>(null);\n',
    "",
)
sub_once(
    "src/frontend/dm/people/invitations/InvitationsView.tsx",
    r'\n  useEffect\(\(\) => \{\n    fetch\("/api/network-info"\).*?\n  \}, \[\]\);\n',
    "\n",
    re.S,
)
sub_once(
    "src/frontend/dm/people/invitations/InvitationsView.tsx",
    r'\n        \{networkUrl && \(\n          <div.*?\n        \)\}\n',
    "\n",
    re.S,
)

# ---------------------------------------------------------------------------
# Shared command error mapping for command-backed HTTP endpoints.
# ---------------------------------------------------------------------------
write(
    "src/backend/server/web/commandErrorResponse.ts",
    '''import type { FastifyReply } from "fastify";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Command failed";
}

function explicitStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return typeof statusCode === "number" ? statusCode : undefined;
}

export function writeCommandError(reply: FastifyReply, error: unknown): { error: string } {
  const message = errorMessage(error);
  const normalized = message.toLowerCase();
  let statusCode = explicitStatus(error);

  if (!statusCode && (error as { name?: string } | null)?.name === "CommandConflictError") {
    statusCode = 409;
  }
  if (!statusCode && normalized.includes("not found")) {
    statusCode = 404;
  }
  if (!statusCode && /(already|conflict|cycle|cannot|archived|does not belong|terminal)/i.test(message)) {
    statusCode = 409;
  }
  if (!statusCode && /(invalid|required|must|expected|limit exceeded|non-negative|unsupported)/i.test(message)) {
    statusCode = 400;
  }

  reply.code(statusCode ?? 500);
  return { error: message };
}
''',
)

# ---------------------------------------------------------------------------
# Personal shortcuts: all implemented resource types are accepted and API
# failures are propagated instead of showing false success notifications.
# ---------------------------------------------------------------------------
replace_once(
    "src/backend/server/web/routes/shortcutsWebRoutes.ts",
    'const SHORTCUT_TARGET_TYPES: readonly ShortcutTargetType[] = ["entity", "session", "canvas"];',
    'const SHORTCUT_TARGET_TYPES: readonly ShortcutTargetType[] = ["entity", "session", "canvas", "notebook", "story_thread", "story_step"];',
)
replace_once(
    "src/backend/server/web/routes/shortcutsWebRoutes.ts",
    '      return { error: "targetType (entity|session|canvas) and targetId are required" };',
    '      return { error: `targetType (${SHORTCUT_TARGET_TYPES.join("|")}) and targetId are required` };',
)
write(
    "src/frontend/dm/shortcuts/useCampaignShortcuts.ts",
    '''import { useEffect } from "react";
import { create } from "zustand";
import type { ShortcutTargetType } from "@core/domain/resource/resourceType.js";
import { readApiError } from "../../shared/api/apiClient.js";
import { createShortcut, deleteShortcut, listShortcuts, reorderShortcuts } from "../../shared/api/shortcutsApi.js";

export interface ResolvedShortcutResource {
  title: string;
  subtitle?: string;
  archived: boolean;
}

export interface CampaignShortcut {
  shortcutId: string;
  targetType: ShortcutTargetType;
  targetId: string;
  sortOrder: number;
  resource: ResolvedShortcutResource | null;
}

interface CampaignShortcutsState {
  shortcutsByCampaignId: Record<string, CampaignShortcut[] | undefined>;
  loadingCampaignIds: Record<string, boolean | undefined>;
  fetchShortcuts: (campaignId: string) => Promise<void>;
  addShortcut: (campaignId: string, targetType: ShortcutTargetType, targetId: string) => Promise<void>;
  removeShortcut: (campaignId: string, shortcutId: string) => Promise<void>;
  reorder: (campaignId: string, shortcutIds: string[]) => Promise<void>;
}

async function requireOk(response: Response, fallback: string): Promise<void> {
  if (!response.ok) throw new Error(await readApiError(response, fallback));
}

/** Personal per-user shortcuts, deliberately separate from campaignState. */
export const useCampaignShortcutsStore = create<CampaignShortcutsState>((set, get) => ({
  shortcutsByCampaignId: {},
  loadingCampaignIds: {},

  fetchShortcuts: async (campaignId) => {
    set((state) => ({ loadingCampaignIds: { ...state.loadingCampaignIds, [campaignId]: true } }));
    try {
      const response = await listShortcuts(campaignId);
      await requireOk(response, "Could not load campaign shortcuts");
      const body = await response.json() as { shortcuts?: CampaignShortcut[] };
      set((state) => ({
        shortcutsByCampaignId: { ...state.shortcutsByCampaignId, [campaignId]: body.shortcuts ?? [] },
      }));
    } finally {
      set((state) => ({ loadingCampaignIds: { ...state.loadingCampaignIds, [campaignId]: false } }));
    }
  },

  addShortcut: async (campaignId, targetType, targetId) => {
    const response = await createShortcut(campaignId, { targetType, targetId });
    await requireOk(response, "Could not add campaign shortcut");
    await get().fetchShortcuts(campaignId);
  },

  removeShortcut: async (campaignId, shortcutId) => {
    const previous = get().shortcutsByCampaignId[campaignId] ?? [];
    set((state) => ({
      shortcutsByCampaignId: {
        ...state.shortcutsByCampaignId,
        [campaignId]: previous.filter((shortcut) => shortcut.shortcutId !== shortcutId),
      },
    }));
    const response = await deleteShortcut(campaignId, shortcutId);
    if (!response.ok) {
      set((state) => ({ shortcutsByCampaignId: { ...state.shortcutsByCampaignId, [campaignId]: previous } }));
      throw new Error(await readApiError(response, "Could not remove campaign shortcut"));
    }
  },

  reorder: async (campaignId, shortcutIds) => {
    const previous = get().shortcutsByCampaignId[campaignId] ?? [];
    const reordered = shortcutIds
      .map((shortcutId) => previous.find((shortcut) => shortcut.shortcutId === shortcutId))
      .filter((shortcut): shortcut is CampaignShortcut => Boolean(shortcut));
    set((state) => ({ shortcutsByCampaignId: { ...state.shortcutsByCampaignId, [campaignId]: reordered } }));
    const response = await reorderShortcuts(campaignId, shortcutIds);
    if (!response.ok) {
      set((state) => ({ shortcutsByCampaignId: { ...state.shortcutsByCampaignId, [campaignId]: previous } }));
      throw new Error(await readApiError(response, "Could not reorder campaign shortcuts"));
    }
  },
}));

export function useCampaignShortcuts(campaignId: string | undefined) {
  const shortcutsByCampaignId = useCampaignShortcutsStore((state) => state.shortcutsByCampaignId);
  const loadingCampaignIds = useCampaignShortcutsStore((state) => state.loadingCampaignIds);
  const fetchShortcuts = useCampaignShortcutsStore((state) => state.fetchShortcuts);
  const addShortcut = useCampaignShortcutsStore((state) => state.addShortcut);
  const removeShortcut = useCampaignShortcutsStore((state) => state.removeShortcut);
  const reorder = useCampaignShortcutsStore((state) => state.reorder);

  useEffect(() => {
    if (campaignId) void fetchShortcuts(campaignId).catch((error: unknown) => {
      console.error("Could not load campaign shortcuts", error);
    });
  }, [campaignId, fetchShortcuts]);

  return {
    shortcuts: (campaignId ? shortcutsByCampaignId[campaignId] : undefined) ?? [],
    loading: campaignId ? Boolean(loadingCampaignIds[campaignId]) : false,
    addShortcut: (targetType: ShortcutTargetType, targetId: string) =>
      campaignId ? addShortcut(campaignId, targetType, targetId) : Promise.resolve(),
    removeShortcut: (shortcutId: string) => (campaignId ? removeShortcut(campaignId, shortcutId) : Promise.resolve()),
    reorder: (shortcutIds: string[]) => (campaignId ? reorder(campaignId, shortcutIds) : Promise.resolve()),
  };
}
''',
)
replace_once(
    "src/frontend/dm/shortcuts/ShortcutsPanel.tsx",
    "                    void removeShortcut(shortcut.shortcutId);",
    "                    void removeShortcut(shortcut.shortcutId).catch((error: unknown) => {\n                      console.error(\"Could not remove campaign shortcut\", error);\n                    });",
)

# ---------------------------------------------------------------------------
# Notebooks API and command boundary.
# ---------------------------------------------------------------------------
write(
    "src/frontend/shared/api/notebooksApi.ts",
    '''import { apiFetch } from "./apiClient.js";
import type { NotebookItemTargetType } from "@core/domain/resource/resourceType.js";

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export interface NotebookMutation {
  title?: string;
  description?: string | null;
  icon?: string | null;
  parentNotebookId?: string | null;
}

export const listNotebooks = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/notebooks`);

export const createNotebook = (campaignId: string, payload: NotebookMutation & { title: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks`, { init: jsonInit("POST", payload) });

export const updateNotebook = (campaignId: string, notebookId: string, payload: NotebookMutation) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/${notebookId}`, { init: jsonInit("PATCH", payload) });

export const deleteNotebook = (campaignId: string, notebookId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/${notebookId}`, { init: { method: "DELETE" } });

export const addNotebookItem = (campaignId: string, notebookId: string, payload: { targetType: NotebookItemTargetType; targetId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/${notebookId}/items`, { init: jsonInit("POST", payload) });

export const removeNotebookItem = (campaignId: string, notebookItemId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/items/${notebookItemId}`, { init: { method: "DELETE" } });

export const reorderNotebookItems = (campaignId: string, notebookId: string, payload: { orderedItemIds: string[] }) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/${notebookId}/items/reorder`, { init: jsonInit("PATCH", payload) });
''',
)
write(
    "src/backend/server/web/routes/notebooksWebRoutes.ts",
    '''import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Command } from "@core/application/commands.js";
import type { NotebookItemTargetType } from "@core/domain/resource/resourceType.js";
import { createId } from "@shared/ids.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";
import { writeCommandError } from "../commandErrorResponse.js";

async function executeNotebookCommand(
  request: FastifyRequest,
  reply: FastifyReply,
  campaignId: string,
  command: Record<string, unknown>,
  repository: PostgresCampaignRepository,
) {
  const { user } = await requireCampaignRole(request, campaignId, ["dm", "co_dm"]);
  const commandIdHeader = request.headers["idempotency-key"];
  const commandId = Array.isArray(commandIdHeader) ? commandIdHeader[0] : commandIdHeader ?? createId("cmd");
  try {
    const projection = await repository.executeCommand(campaignId, {
      ...command,
      campaignId,
      actorId: user.userId,
    } as Command, { commandId, actorUserId: user.userId });
    campaignEventBus.publish(campaignId, { type: "projection.updated", sequence: projection.lastSequence });
    return { ok: true, sequence: projection.lastSequence };
  } catch (error: unknown) {
    return writeCommandError(reply, error);
  }
}

export async function registerNotebooksWebRoutes(server: FastifyInstance): Promise<void> {
  const repository = new PostgresCampaignRepository();

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/notebooks", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repository.getCampaignState(request.params.campaignId);
    return {
      notebooks: Array.from(projection.notebooks.values()).filter((notebook) => !notebook.archivedAt),
      items: Array.from(projection.notebookItems.values()),
    };
  });

  server.post<{
    Params: { campaignId: string };
    Body: { title: string; description?: string | null; icon?: string | null; parentNotebookId?: string | null; sortOrder?: number };
  }>("/api/campaigns/:campaignId/notebooks", async (request, reply) => {
    const campaignId = request.params.campaignId;
    const parentNotebookId = request.body.parentNotebookId ?? null;
    const notebooks = (await repository.getCampaignState(campaignId)).notebooks;
    const nextSortOrder = request.body.sortOrder ?? Array.from(notebooks.values())
      .filter((notebook) => notebook.parentNotebookId === parentNotebookId && !notebook.archivedAt)
      .reduce((maximum, notebook) => Math.max(maximum, notebook.sortOrder), -1) + 1;

    return executeNotebookCommand(request, reply, campaignId, {
      type: "CreateNotebook",
      notebookId: createId("nbk"),
      parentNotebookId,
      title: request.body.title,
      description: request.body.description ?? null,
      icon: request.body.icon ?? null,
      sortOrder: nextSortOrder,
    }, repository);
  });

  server.patch<{
    Params: { campaignId: string; notebookId: string };
    Body: { title?: string; description?: string | null; icon?: string | null; parentNotebookId?: string | null };
  }>("/api/campaigns/:campaignId/notebooks/:notebookId", async (request, reply) => {
    return executeNotebookCommand(request, reply, request.params.campaignId, {
      type: "UpdateNotebook",
      notebookId: request.params.notebookId,
      title: request.body.title,
      description: request.body.description,
      icon: request.body.icon,
      parentNotebookId: request.body.parentNotebookId,
    }, repository);
  });

  server.delete<{ Params: { campaignId: string; notebookId: string } }>(
    "/api/campaigns/:campaignId/notebooks/:notebookId",
    async (request, reply) => executeNotebookCommand(request, reply, request.params.campaignId, {
      type: "ArchiveNotebook",
      notebookId: request.params.notebookId,
    }, repository),
  );

  server.post<{
    Params: { campaignId: string; notebookId: string };
    Body: { targetType: NotebookItemTargetType; targetId: string };
  }>("/api/campaigns/:campaignId/notebooks/:notebookId/items", async (request, reply) => {
    const campaignId = request.params.campaignId;
    const items = (await repository.getCampaignState(campaignId)).notebookItems;
    const nextSortOrder = Array.from(items.values())
      .filter((item) => item.notebookId === request.params.notebookId)
      .reduce((maximum, item) => Math.max(maximum, item.sortOrder), -1) + 1;

    return executeNotebookCommand(request, reply, campaignId, {
      type: "AddNotebookItem",
      notebookItemId: createId("nbi"),
      notebookId: request.params.notebookId,
      targetType: request.body.targetType,
      targetId: request.body.targetId,
      sortOrder: nextSortOrder,
    }, repository);
  });

  server.delete<{ Params: { campaignId: string; notebookItemId: string } }>(
    "/api/campaigns/:campaignId/notebooks/items/:notebookItemId",
    async (request, reply) => executeNotebookCommand(request, reply, request.params.campaignId, {
      type: "RemoveNotebookItem",
      notebookItemId: request.params.notebookItemId,
    }, repository),
  );

  server.patch<{
    Params: { campaignId: string; notebookId: string };
    Body: { orderedItemIds: string[] };
  }>("/api/campaigns/:campaignId/notebooks/:notebookId/items/reorder", async (request, reply) => {
    return executeNotebookCommand(request, reply, request.params.campaignId, {
      type: "ReorderNotebookItems",
      notebookId: request.params.notebookId,
      orderedItemIds: request.body.orderedItemIds,
    }, repository);
  });
}
''',
)

# Notebook UI: persist descriptions and parent moves, honor deep links, and do
# not report successful shortcut mutations when the request failed.
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    'import React, { useState } from "react";',
    'import React, { useEffect, useState } from "react";',
)
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    'import { useCampaignShortcuts } from "../../shortcuts/useCampaignShortcuts.js";\n',
    'import { useCampaignShortcuts } from "../../shortcuts/useCampaignShortcuts.js";\nimport type { NotebookItemTargetType } from "@core/domain/resource/resourceType.js";\n',
)
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    '  const [editDesc, setEditDesc] = useState("");\n',
    '  const [editDesc, setEditDesc] = useState("");\n  const [editParentId, setEditParentId] = useState<string | null>(null);\n',
)
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    '  const [selectedItemType, setSelectedItemType] = useState("entity");',
    '  const [selectedItemType, setSelectedItemType] = useState<NotebookItemTargetType>("entity");',
)
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    '  const activeNotebooks = notebooks.filter((n) => !n.archivedAt);\n',
    '  const activeNotebooks = notebooks.filter((n) => !n.archivedAt);\n\n  useEffect(() => {\n    const requestedNotebookId = new URLSearchParams(window.location.search).get("notebookId");\n    if (requestedNotebookId && activeNotebooks.some((notebook) => notebook.notebookId === requestedNotebookId)) {\n      setSelectedNotebookId(requestedNotebookId);\n    }\n  }, [notebooks]);\n',
)
sub_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    r'  const handleToggleShortcut = async \(\) => \{.*?\n  \};\n\n  const handleCreateNotebook',
    '''  const handleToggleShortcut = async () => {
    if (!selectedNotebookId || !activeCampaignId) return;
    try {
      if (isShortcutAdded) {
        const existing = shortcuts.find((shortcut) => shortcut.targetType === "notebook" && shortcut.targetId === selectedNotebookId);
        if (existing) await removeShortcut(existing.shortcutId);
        addToast(t("shortcuts.removedToast"), "success");
      } else {
        await addShortcut("notebook", selectedNotebookId);
        addToast(t("shortcuts.addedToast"), "success");
      }
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : t("common.error"), "error");
    }
  };

  const handleCreateNotebook''',
    re.S,
)
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    '        title: editTitle.trim(),\n',
    '        title: editTitle.trim(),\n        description: editDesc.trim() || null,\n        parentNotebookId: editParentId,\n',
)
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    '            setEditDesc(notebook.description || "");\n',
    '            setEditDesc(notebook.description || "");\n            setEditParentId(notebook.parentNotebookId ?? null);\n',
)
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    '                      rows={2}\n                    />\n',
    '                      rows={2}\n                    />\n                    <select\n                      className="form-control"\n                      value={editParentId ?? ""}\n                      onChange={(event) => setEditParentId(event.target.value || null)}\n                    >\n                      <option value="">{t("notebooks.rootLevel")}</option>\n                      {activeNotebooks\n                        .filter((notebook) => notebook.notebookId !== selectedNotebookId)\n                        .map((notebook) => (\n                          <option key={notebook.notebookId} value={notebook.notebookId}>{notebook.title}</option>\n                        ))}\n                    </select>\n',
)
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    '                         onChange={(e) => {\n                           setSelectedItemType(e.target.value);',
    '                         onChange={(e) => {\n                           setSelectedItemType(e.target.value as NotebookItemTargetType);',
)
replace_once(
    "src/frontend/dm/library/notebooks/NotebooksView.tsx",
    '                         <option value="canvas">{t("notebooks.type.canvas") || "Canvas"}</option>\n',
    '                         <option value="canvas">{t("notebooks.type.canvas") || "Canvas"}</option>\n                         <option value="fact">{t("notebooks.type.fact")}</option>\n                         <option value="relation">{t("notebooks.type.relation")}</option>\n                         <option value="session_event">{t("notebooks.type.sessionEvent")}</option>\n                         <option value="attachment">{t("notebooks.type.attachment")}</option>\n',
)

# ---------------------------------------------------------------------------
# Story API and semantic command endpoints. Generic update no longer changes
# lifecycle status, so thread invariants cannot be bypassed.
# ---------------------------------------------------------------------------
write(
    "src/frontend/shared/api/storyApi.ts",
    '''import { apiFetch } from "./apiClient.js";

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export const loadStoryPlan = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/story`);
export const createStoryThread = (campaignId: string, payload: { title: string; summary?: string | null }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads`, { init: jsonInit("POST", payload) });
export const updateStoryThread = (campaignId: string, threadId: string, payload: { title?: string; summary?: string | null }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}`, { init: jsonInit("PATCH", payload) });
export const activateStoryThread = (campaignId: string, threadId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/activate`, { init: { method: "POST" } });
export const resolveStoryThread = (campaignId: string, threadId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/resolve`, { init: { method: "POST" } });
export const discardStoryThread = (campaignId: string, threadId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/discard`, { init: { method: "POST" } });
export const deleteStoryThread = (campaignId: string, threadId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}`, { init: { method: "DELETE" } });
export const reorderStoryThreads = (campaignId: string, payload: { orderedThreadIds: string[] }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/reorder`, { init: jsonInit("PATCH", payload) });

export const createStoryStep = (campaignId: string, threadId: string, payload: {
  title: string;
  intent?: string | null;
  expectedOutcome?: string | null;
  sceneEntityId?: string | null;
  plannedSessionId?: string | null;
  plannedSessionOrder?: number | null;
}) => apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/steps`, { init: jsonInit("POST", payload) });
export const updateStoryStep = (campaignId: string, stepId: string, payload: {
  title?: string;
  intent?: string | null;
  expectedOutcome?: string | null;
  sceneEntityId?: string | null;
}) => apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}`, { init: jsonInit("PATCH", payload) });
export const scheduleStoryStep = (campaignId: string, stepId: string, payload: { plannedSessionId: string; plannedSessionOrder: number }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/schedule`, { init: jsonInit("POST", payload) });
export const deferStoryStep = (campaignId: string, stepId: string, payload: { plannedSessionId: string; plannedSessionOrder: number }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/defer`, { init: jsonInit("POST", payload) });
export const unscheduleStoryStep = (campaignId: string, stepId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/unschedule`, { init: { method: "POST" } });
export const reconcileStoryStep = (campaignId: string, stepId: string, payload: {
  resolvedSessionId: string;
  status: "resolved" | "discarded";
  resolutionKind: "as_planned" | "changed" | "discarded";
  actualOutcome?: string | null;
}) => apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/reconcile`, { init: jsonInit("POST", payload) });
export const reorderStorySteps = (campaignId: string, threadId: string, payload: { orderedStepIds: string[] }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/steps/reorder`, { init: jsonInit("PATCH", payload) });
export const linkEntityToStoryThread = (campaignId: string, threadId: string, payload: { entityId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/link`, { init: jsonInit("POST", payload) });
export const unlinkEntityFromStoryThread = (campaignId: string, threadId: string, payload: { entityId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/unlink`, { init: jsonInit("POST", payload) });
export const linkEntityToStoryStep = (campaignId: string, stepId: string, payload: { entityId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/link`, { init: jsonInit("POST", payload) });
export const unlinkEntityFromStoryStep = (campaignId: string, stepId: string, payload: { entityId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/unlink`, { init: jsonInit("POST", payload) });
''',
)
write(
    "src/backend/server/web/routes/storyWebRoutes.ts",
    '''import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Command } from "@core/application/commands.js";
import { createId } from "@shared/ids.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";
import { writeCommandError } from "../commandErrorResponse.js";

async function executeStoryCommand(
  request: FastifyRequest,
  reply: FastifyReply,
  campaignId: string,
  command: Record<string, unknown>,
  repository: PostgresCampaignRepository,
) {
  const { user } = await requireCampaignRole(request, campaignId, ["dm", "co_dm"]);
  const commandIdHeader = request.headers["idempotency-key"];
  const commandId = Array.isArray(commandIdHeader) ? commandIdHeader[0] : commandIdHeader ?? createId("cmd");
  try {
    const projection = await repository.executeCommand(campaignId, {
      ...command,
      campaignId,
      actorId: user.userId,
    } as Command, { commandId, actorUserId: user.userId });
    campaignEventBus.publish(campaignId, { type: "projection.updated", sequence: projection.lastSequence });
    return { ok: true, sequence: projection.lastSequence };
  } catch (error: unknown) {
    return writeCommandError(reply, error);
  }
}

export async function registerStoryWebRoutes(server: FastifyInstance): Promise<void> {
  const repository = new PostgresCampaignRepository();

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/story", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repository.getCampaignState(request.params.campaignId);
    return {
      threads: Array.from(projection.storyThreads.values()).filter((thread) => !thread.archivedAt),
      steps: Array.from(projection.storySteps.values()),
    };
  });

  server.post<{ Params: { campaignId: string }; Body: { title: string; summary?: string | null } }>(
    "/api/campaigns/:campaignId/story/threads",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      const threads = (await repository.getCampaignState(campaignId)).storyThreads;
      const nextSortOrder = Array.from(threads.values())
        .filter((thread) => !thread.archivedAt)
        .reduce((maximum, thread) => Math.max(maximum, thread.sortOrder), -1) + 1;
      return executeStoryCommand(request, reply, campaignId, {
        type: "CreateStoryThread",
        threadId: createId("sth"),
        title: request.body.title,
        summary: request.body.summary ?? null,
        status: "planned",
        sortOrder: nextSortOrder,
      }, repository);
    },
  );

  server.patch<{ Params: { campaignId: string; threadId: string }; Body: { title?: string; summary?: string | null } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "UpdateStoryThread",
      threadId: request.params.threadId,
      title: request.body.title,
      summary: request.body.summary,
    }, repository),
  );

  for (const transition of [
    { path: "activate", type: "ActivateStoryThread" },
    { path: "resolve", type: "ResolveStoryThread" },
    { path: "discard", type: "DiscardStoryThread" },
  ] as const) {
    server.post<{ Params: { campaignId: string; threadId: string } }>(
      `/api/campaigns/:campaignId/story/threads/:threadId/${transition.path}`,
      async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
        type: transition.type,
        threadId: request.params.threadId,
      }, repository),
    );
  }

  server.delete<{ Params: { campaignId: string; threadId: string } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "ArchiveStoryThread",
      threadId: request.params.threadId,
    }, repository),
  );

  server.patch<{ Params: { campaignId: string }; Body: { orderedThreadIds: string[] } }>(
    "/api/campaigns/:campaignId/story/threads/reorder",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "ReorderStoryThreads",
      orderedThreadIds: request.body.orderedThreadIds,
    }, repository),
  );

  server.post<{
    Params: { campaignId: string; threadId: string };
    Body: { title: string; intent?: string | null; expectedOutcome?: string | null; sceneEntityId?: string | null; plannedSessionId?: string | null; plannedSessionOrder?: number | null };
  }>("/api/campaigns/:campaignId/story/threads/:threadId/steps", async (request, reply) => {
    const campaignId = request.params.campaignId;
    const steps = (await repository.getCampaignState(campaignId)).storySteps;
    const nextSortOrder = Array.from(steps.values())
      .filter((step) => step.threadId === request.params.threadId)
      .reduce((maximum, step) => Math.max(maximum, step.sortOrder), -1) + 1;
    return executeStoryCommand(request, reply, campaignId, {
      type: "CreateStoryStep",
      stepId: createId("stp"),
      threadId: request.params.threadId,
      title: request.body.title,
      intent: request.body.intent ?? null,
      expectedOutcome: request.body.expectedOutcome ?? null,
      sceneEntityId: request.body.sceneEntityId ?? null,
      plannedSessionId: request.body.plannedSessionId ?? null,
      plannedSessionOrder: request.body.plannedSessionOrder ?? null,
      sortOrder: nextSortOrder,
    }, repository);
  });

  server.patch<{
    Params: { campaignId: string; stepId: string };
    Body: { title?: string; intent?: string | null; expectedOutcome?: string | null; sceneEntityId?: string | null };
  }>("/api/campaigns/:campaignId/story/steps/:stepId", async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
    type: "UpdateStoryStep",
    stepId: request.params.stepId,
    title: request.body.title,
    intent: request.body.intent,
    expectedOutcome: request.body.expectedOutcome,
    sceneEntityId: request.body.sceneEntityId,
  }, repository));

  for (const scheduling of [
    { path: "schedule", type: "ScheduleStoryStep" },
    { path: "defer", type: "DeferStoryStep" },
  ] as const) {
    server.post<{ Params: { campaignId: string; stepId: string }; Body: { plannedSessionId: string; plannedSessionOrder: number } }>(
      `/api/campaigns/:campaignId/story/steps/:stepId/${scheduling.path}`,
      async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
        type: scheduling.type,
        stepId: request.params.stepId,
        plannedSessionId: request.body.plannedSessionId,
        plannedSessionOrder: request.body.plannedSessionOrder,
      }, repository),
    );
  }

  server.post<{ Params: { campaignId: string; stepId: string } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/unschedule",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "UnscheduleStoryStep",
      stepId: request.params.stepId,
    }, repository),
  );

  server.post<{
    Params: { campaignId: string; stepId: string };
    Body: { resolvedSessionId: string; status: "resolved" | "discarded"; resolutionKind: "as_planned" | "changed" | "discarded"; actualOutcome?: string | null };
  }>("/api/campaigns/:campaignId/story/steps/:stepId/reconcile", async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
    type: "ReconcileStoryStep",
    stepId: request.params.stepId,
    resolvedSessionId: request.body.resolvedSessionId,
    status: request.body.status,
    resolutionKind: request.body.resolutionKind,
    actualOutcome: request.body.actualOutcome,
  }, repository));

  server.patch<{ Params: { campaignId: string; threadId: string }; Body: { orderedStepIds: string[] } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId/steps/reorder",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "ReorderStorySteps",
      threadId: request.params.threadId,
      orderedStepIds: request.body.orderedStepIds,
    }, repository),
  );

  for (const target of ["threads", "steps"] as const) {
    const idName = target === "threads" ? "threadId" : "stepId";
    for (const action of ["link", "unlink"] as const) {
      server.post<{ Params: { campaignId: string; threadId?: string; stepId?: string }; Body: { entityId: string } }>(
        `/api/campaigns/:campaignId/story/${target}/:${idName}/${action}`,
        async (request, reply) => {
          const targetId = target === "threads" ? request.params.threadId : request.params.stepId;
          return executeStoryCommand(request, reply, request.params.campaignId, {
            type: `${action === "link" ? "Link" : "Unlink"}Entity${action === "link" ? "To" : "From"}Story${target === "threads" ? "Thread" : "Step"}`,
            [idName]: targetId,
            entityId: request.body.entityId,
          }, repository);
        },
      );
    }
  }
}
''',
)

# Story UI uses semantic actions and honors canonical shortcut deep links.
replace_once(
    "src/frontend/dm/story/plan/StoryPlanView.tsx",
    'import React, { useState } from "react";',
    'import React, { useEffect, useState } from "react";',
)
replace_once(
    "src/frontend/dm/story/plan/StoryPlanView.tsx",
    '  const activeThreads = threads.filter((t) => !t.archivedAt).sort((a, b) => a.sortOrder - b.sortOrder);\n',
    '  const activeThreads = threads.filter((t) => !t.archivedAt).sort((a, b) => a.sortOrder - b.sortOrder);\n\n  useEffect(() => {\n    const search = new URLSearchParams(window.location.search);\n    const requestedStepId = search.get("stepId");\n    const requestedThreadId = search.get("threadId") ?? steps.find((step) => step.stepId === requestedStepId)?.threadId;\n    if (requestedThreadId && activeThreads.some((thread) => thread.threadId === requestedThreadId)) {\n      setSelectedThreadId(requestedThreadId);\n    }\n  }, [threads, steps]);\n',
)
sub_once(
    "src/frontend/dm/story/plan/StoryPlanView.tsx",
    r'  const handleToggleShortcut = async \(\) => \{.*?\n  \};\n\n  const handleCreateThread',
    '''  const handleToggleShortcut = async () => {
    if (!selectedThreadId || !activeCampaignId) return;
    try {
      if (isShortcutAdded) {
        const existing = shortcuts.find((shortcut) => shortcut.targetType === "story_thread" && shortcut.targetId === selectedThreadId);
        if (existing) await removeShortcut(existing.shortcutId);
        addToast(t("shortcuts.removedToast"), "success");
      } else {
        await addShortcut("story_thread", selectedThreadId);
        addToast(t("shortcuts.addedToast"), "success");
      }
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : t("common.error"), "error");
    }
  };

  const handleToggleStepShortcut = async (stepId: string) => {
    if (!activeCampaignId) return;
    const existing = shortcuts.find((shortcut) => shortcut.targetType === "story_step" && shortcut.targetId === stepId);
    try {
      if (existing) {
        await removeShortcut(existing.shortcutId);
        addToast(t("shortcuts.removedToast"), "success");
      } else {
        await addShortcut("story_step", stepId);
        addToast(t("shortcuts.addedToast"), "success");
      }
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : t("common.error"), "error");
    }
  };

  const handleCreateThread''',
    re.S,
)
replace_once(
    "src/frontend/dm/story/plan/StoryPlanView.tsx",
    '        status: "planned",\n',
    "",
)
replace_once(
    "src/frontend/dm/story/plan/StoryPlanView.tsx",
    '      const res = await storyApi.updateStoryThread(activeCampaignId, selectedThreadId, { status: "active" });',
    '      const res = await storyApi.activateStoryThread(activeCampaignId, selectedThreadId);',
)
replace_once(
    "src/frontend/dm/story/plan/StoryPlanView.tsx",
    '      const res = await storyApi.updateStoryThread(activeCampaignId, selectedThreadId, { status: "resolved" });',
    '      const res = await storyApi.resolveStoryThread(activeCampaignId, selectedThreadId);',
)
replace_once(
    "src/frontend/dm/story/plan/StoryPlanView.tsx",
    '      const res = await storyApi.updateStoryThread(activeCampaignId, selectedThreadId, { status: "discarded" });',
    '      const res = await storyApi.discardStoryThread(activeCampaignId, selectedThreadId);',
)
replace_once(
    "src/frontend/dm/story/plan/StoryPlanView.tsx",
    '                          {/* Reordering & Action buttons */}\n                          <div style={{ display: "flex", gap: 4 }}>',
    '                          {/* Reordering & Action buttons */}\n                          <div style={{ display: "flex", gap: 4 }}>\n                            <button\n                              type="button"\n                              className="btn btn-sm btn-link"\n                              onClick={() => void handleToggleStepShortcut(step.stepId)}\n                              title={t("shortcuts.add")}\n                              style={{ padding: 2 }}\n                            >\n                              {shortcuts.some((shortcut) => shortcut.targetType === "story_step" && shortcut.targetId === step.stepId)\n                                ? <BookmarkMinus size={14} />\n                                : <Bookmark size={14} />}\n                            </button>',
)
replace_once(
    "src/frontend/dm/story/plan/StoryPlanView.tsx",
    '                          {(step.status === "ready" || step.status === "active") && (',
    '                          {(step.status === "ready" || step.status === "active" || (step.status === "planned" && Boolean(step.plannedSessionId))) && (',
)

# ---------------------------------------------------------------------------
# Domain invariants: lifecycle changes are semantic, scheduled steps become
# ready, terminal steps cannot be mutated, and reorder commands require exact
# permutations rather than accepting partial/duplicate lists.
# ---------------------------------------------------------------------------
replace_once(
    "src/core/application/commandBus.ts",
    'import { validateStoryThreadId, validateStoryStepId, validateStoryThreadTitle, validateStoryStepTitle, validateStoryThreadStatus, validateStoryStepStatus, validateStoryStepResolutionCoherence } from "../domain/story/validators.js";',
    'import { validateStoryThreadId, validateStoryStepId, validateStoryThreadTitle, validateStoryStepTitle, validateStoryStepResolutionCoherence } from "../domain/story/validators.js";',
)
replace_once("src/core/application/commandBus.ts", "      validateStoryThreadStatus(command.status);\n", "")
replace_once("src/core/application/commandBus.ts", '        status: command.status as any,', '        status: "planned" as const,')
replace_once("src/core/application/commandBus.ts", "      if (command.status !== undefined) validateStoryThreadStatus(command.status);\n", "")
replace_once("src/core/application/commandBus.ts", '        ...(command.status !== undefined && { status: command.status as any }),\n', "")
replace_once(
    "src/core/application/commandBus.ts",
    '      const threads = new Map(state.storyThreads || new Map());\n\n      for (const [idx, threadId] of command.orderedThreadIds.entries()) {',
    '      const threads = new Map(state.storyThreads || new Map());\n      const reorderableThreadIds = Array.from(threads.values()).filter((thread) => !thread.archivedAt).map((thread) => thread.threadId);\n      const requestedThreadIds = command.orderedThreadIds;\n      if (new Set(requestedThreadIds).size !== requestedThreadIds.length || requestedThreadIds.length !== reorderableThreadIds.length || requestedThreadIds.some((threadId) => !reorderableThreadIds.includes(threadId))) {\n        throw new Error("orderedThreadIds must exactly match the active story threads");\n      }\n\n      for (const [idx, threadId] of requestedThreadIds.entries()) {',
)
replace_once(
    "src/core/application/commandBus.ts",
    '        if (!parent) {\n          throw new Error(`Parent notebook not found: ${command.parentNotebookId}`);\n        }\n',
    '        if (!parent) {\n          throw new Error(`Parent notebook not found: ${command.parentNotebookId}`);\n        }\n        if (parent.archivedAt) {\n          throw new Error("Cannot create a notebook under an archived parent");\n        }\n',
)
replace_once(
    "src/core/application/commandBus.ts",
    '          if (!parent) {\n            throw new Error(`Parent notebook not found: ${parentNotebookId}`);\n          }\n',
    '          if (!parent) {\n            throw new Error(`Parent notebook not found: ${parentNotebookId}`);\n          }\n          if (parent.archivedAt) {\n            throw new Error("Cannot move a notebook under an archived parent");\n          }\n',
)
replace_once(
    "src/core/application/commandBus.ts",
    '      if (!notebooks.has(command.notebookId)) {\n        throw new Error(`Notebook not found: ${command.notebookId}`);\n      }\n\n      validateNotebookItemTarget',
    '      const notebook = notebooks.get(command.notebookId);\n      if (!notebook) {\n        throw new Error(`Notebook not found: ${command.notebookId}`);\n      }\n      if (notebook.archivedAt) {\n        throw new Error("Cannot add an item to an archived notebook");\n      }\n\n      validateNotebookItemTarget',
)
replace_once(
    "src/core/application/commandBus.ts",
    '      const items = new Map(state.notebookItems || new Map());\n\n      for (const [idx, itemId] of command.orderedItemIds.entries()) {',
    '      const items = new Map(state.notebookItems || new Map());\n      const notebookItemIds = Array.from(items.values()).filter((item) => item.notebookId === command.notebookId).map((item) => item.notebookItemId);\n      const requestedItemIds = command.orderedItemIds;\n      if (new Set(requestedItemIds).size !== requestedItemIds.length || requestedItemIds.length !== notebookItemIds.length || requestedItemIds.some((itemId) => !notebookItemIds.includes(itemId))) {\n        throw new Error("orderedItemIds must exactly match the notebook items");\n      }\n\n      for (const [idx, itemId] of requestedItemIds.entries()) {',
)
replace_once(
    "src/core/application/commandBus.ts",
    '      if (command.plannedSessionId) {\n        if (!state.sessions.has(command.plannedSessionId)) {\n          throw new Error(`Session not found: ${command.plannedSessionId}`);\n        }\n      }\n\n      const steps = new Map',
    '      const hasPlannedSession = command.plannedSessionId !== undefined && command.plannedSessionId !== null;\n      const hasPlannedOrder = command.plannedSessionOrder !== undefined && command.plannedSessionOrder !== null;\n      if (hasPlannedSession !== hasPlannedOrder) {\n        throw new Error("plannedSessionId and plannedSessionOrder must be provided together");\n      }\n      if (hasPlannedOrder && command.plannedSessionOrder! < 0) {\n        throw new Error("plannedSessionOrder must be non-negative");\n      }\n      if (command.plannedSessionId && !state.sessions.has(command.plannedSessionId)) {\n        throw new Error(`Session not found: ${command.plannedSessionId}`);\n      }\n\n      const steps = new Map',
)
# Schedule block: validate mutable state/order and move to ready.
replace_once(
    "src/core/application/commandBus.ts",
    '      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);\n\n      if (!state.sessions.has(command.plannedSessionId)) {',
    '      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);\n      if (existing.status === "resolved" || existing.status === "discarded") {\n        throw new Error("Cannot schedule a terminal story step");\n      }\n      if (command.plannedSessionOrder < 0) {\n        throw new Error("plannedSessionOrder must be non-negative");\n      }\n\n      if (!state.sessions.has(command.plannedSessionId)) {',
)
# This exact object occurs twice (schedule and defer); replace both deliberately.
command_bus = read("src/core/application/commandBus.ts")
schedule_object = '''        plannedSessionId: command.plannedSessionId,
        plannedSessionOrder: command.plannedSessionOrder,
        updatedAt: new Date().toISOString(),
'''
if command_bus.count(schedule_object) != 2:
    raise RuntimeError(f"Expected two scheduling update objects, found {command_bus.count(schedule_object)}")
command_bus = command_bus.replace(
    schedule_object,
    '''        plannedSessionId: command.plannedSessionId,
        plannedSessionOrder: command.plannedSessionOrder,
        status: "ready" as const,
        updatedAt: new Date().toISOString(),
''',
    2,
)
write("src/core/application/commandBus.ts", command_bus)
# Add the same terminal/order guard to defer, whose block now contains the second occurrence.
sub_once(
    "src/core/application/commandBus.ts",
    r'(case "DeferStoryStep": \{.*?if \(!existing\) throw new Error\(`Story step not found: \$\{command\.stepId\}`\);)\n\n      if \(!state\.sessions\.has\(command\.plannedSessionId\)\)',
    r'\1\n      if (existing.status === "resolved" || existing.status === "discarded") {\n        throw new Error("Cannot defer a terminal story step");\n      }\n      if (command.plannedSessionOrder < 0) {\n        throw new Error("plannedSessionOrder must be non-negative");\n      }\n\n      if (!state.sessions.has(command.plannedSessionId))',
    re.S,
)
replace_once(
    "src/core/application/commandBus.ts",
    '      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);\n\n      const updated = {\n        ...existing,\n        plannedSessionId: null,\n        plannedSessionOrder: null,',
    '      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);\n      if (existing.status === "resolved" || existing.status === "discarded") {\n        throw new Error("Cannot unschedule a terminal story step");\n      }\n\n      const updated = {\n        ...existing,\n        plannedSessionId: null,\n        plannedSessionOrder: null,\n        status: "planned" as const,',
)
replace_once(
    "src/core/application/commandBus.ts",
    '      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);\n\n      const session = state.sessions.get(command.resolvedSessionId);',
    '      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);\n      if (existing.status === "resolved" || existing.status === "discarded") {\n        throw new Error("Cannot reconcile a terminal story step");\n      }\n\n      const session = state.sessions.get(command.resolvedSessionId);',
)
replace_once(
    "src/core/application/commandBus.ts",
    '      const steps = new Map(state.storySteps || new Map());\n\n      for (const [idx, stepId] of command.orderedStepIds.entries()) {',
    '      const steps = new Map(state.storySteps || new Map());\n      const threadStepIds = Array.from(steps.values()).filter((step) => step.threadId === command.threadId).map((step) => step.stepId);\n      const requestedStepIds = command.orderedStepIds;\n      if (new Set(requestedStepIds).size !== requestedStepIds.length || requestedStepIds.length !== threadStepIds.length || requestedStepIds.some((stepId) => !threadStepIds.includes(stepId))) {\n        throw new Error("orderedStepIds must exactly match the story thread steps");\n      }\n\n      for (const [idx, stepId] of requestedStepIds.entries()) {',
)

# ---------------------------------------------------------------------------
# Project notebook/story events into their SQL read models in the same command
# transaction. The event-sourced aggregate remains canonical.
# ---------------------------------------------------------------------------
workspace_projection_cases = r'''
      case "NotebookCreated":
      case "NotebookUpdated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        await tx.insert(schema.campaignNotebooks).values({
          campaignId,
          notebookId: payload.notebookId,
          parentNotebookId: payload.parentNotebookId ?? null,
          title: payload.title,
          description: payload.description ?? null,
          icon: payload.icon ?? null,
          sortOrder: payload.sortOrder ?? 0,
          archivedAt: payload.archivedAt ? new Date(payload.archivedAt) : null,
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        }).onConflictDoUpdate({
          target: [schema.campaignNotebooks.campaignId, schema.campaignNotebooks.notebookId],
          set: {
            parentNotebookId: payload.parentNotebookId ?? null,
            title: payload.title,
            description: payload.description ?? null,
            icon: payload.icon ?? null,
            sortOrder: payload.sortOrder ?? 0,
            archivedAt: payload.archivedAt ? new Date(payload.archivedAt) : null,
            updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
          },
        });
        break;
      }
      case "NotebookArchived": {
        await tx.update(schema.campaignNotebooks).set({
          archivedAt: new Date(event.occurredAt),
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignNotebooks.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignNotebooks.notebookId, payload.notebookId),
        ));
        break;
      }
      case "NotebookItemAdded": {
        await tx.insert(schema.campaignNotebookItems).values({
          campaignId: event.campaignId ?? payload.campaignId,
          notebookItemId: payload.notebookItemId,
          notebookId: payload.notebookId,
          targetType: payload.targetType,
          targetId: payload.targetId,
          sortOrder: payload.sortOrder ?? 0,
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
        }).onConflictDoUpdate({
          target: [schema.campaignNotebookItems.campaignId, schema.campaignNotebookItems.notebookItemId],
          set: {
            notebookId: payload.notebookId,
            targetType: payload.targetType,
            targetId: payload.targetId,
            sortOrder: payload.sortOrder ?? 0,
          },
        });
        break;
      }
      case "NotebookItemRemoved": {
        await tx.delete(schema.campaignNotebookItems).where(and(
          eq(schema.campaignNotebookItems.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignNotebookItems.notebookItemId, payload.notebookItemId),
        ));
        break;
      }
      case "NotebookItemsReordered": {
        for (const [sortOrder, notebookItemId] of (payload.orderedItemIds ?? []).entries()) {
          await tx.update(schema.campaignNotebookItems).set({ sortOrder }).where(and(
            eq(schema.campaignNotebookItems.campaignId, event.campaignId ?? payload.campaignId),
            eq(schema.campaignNotebookItems.notebookId, payload.notebookId),
            eq(schema.campaignNotebookItems.notebookItemId, notebookItemId),
          ));
        }
        break;
      }
      case "StoryThreadCreated":
      case "StoryThreadUpdated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        await tx.insert(schema.campaignStoryThreads).values({
          campaignId,
          threadId: payload.threadId,
          title: payload.title,
          summary: payload.summary ?? null,
          status: payload.status ?? "planned",
          sortOrder: payload.sortOrder ?? 0,
          archivedAt: payload.archivedAt ? new Date(payload.archivedAt) : null,
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        }).onConflictDoUpdate({
          target: [schema.campaignStoryThreads.campaignId, schema.campaignStoryThreads.threadId],
          set: {
            title: payload.title,
            summary: payload.summary ?? null,
            status: payload.status ?? "planned",
            sortOrder: payload.sortOrder ?? 0,
            archivedAt: payload.archivedAt ? new Date(payload.archivedAt) : null,
            updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
          },
        });
        break;
      }
      case "StoryThreadArchived": {
        await tx.update(schema.campaignStoryThreads).set({ archivedAt: new Date(event.occurredAt), updatedAt: new Date(event.occurredAt) }).where(and(
          eq(schema.campaignStoryThreads.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStoryThreads.threadId, payload.threadId),
        ));
        break;
      }
      case "StoryThreadActivated":
      case "StoryThreadResolved":
      case "StoryThreadDiscarded": {
        const status = event.type === "StoryThreadActivated" ? "active" : event.type === "StoryThreadResolved" ? "resolved" : "discarded";
        await tx.update(schema.campaignStoryThreads).set({ status, updatedAt: new Date(event.occurredAt) }).where(and(
          eq(schema.campaignStoryThreads.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStoryThreads.threadId, payload.threadId),
        ));
        break;
      }
      case "StoryThreadReordered": {
        for (const [sortOrder, threadId] of (payload.orderedThreadIds ?? []).entries()) {
          await tx.update(schema.campaignStoryThreads).set({ sortOrder, updatedAt: new Date(event.occurredAt) }).where(and(
            eq(schema.campaignStoryThreads.campaignId, event.campaignId ?? payload.campaignId),
            eq(schema.campaignStoryThreads.threadId, threadId),
          ));
        }
        break;
      }
      case "StoryStepCreated":
      case "StoryStepUpdated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        await tx.insert(schema.campaignStorySteps).values({
          campaignId,
          stepId: payload.stepId,
          threadId: payload.threadId,
          title: payload.title,
          intent: payload.intent ?? null,
          expectedOutcome: payload.expectedOutcome ?? null,
          actualOutcome: payload.actualOutcome ?? null,
          status: payload.status ?? "planned",
          resolutionKind: payload.resolutionKind ?? null,
          sceneEntityId: payload.sceneEntityId ?? null,
          plannedSessionId: payload.plannedSessionId ?? null,
          plannedSessionOrder: payload.plannedSessionOrder ?? null,
          resolvedSessionId: payload.resolvedSessionId ?? null,
          sortOrder: payload.sortOrder ?? 0,
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        }).onConflictDoUpdate({
          target: [schema.campaignStorySteps.campaignId, schema.campaignStorySteps.stepId],
          set: {
            threadId: payload.threadId,
            title: payload.title,
            intent: payload.intent ?? null,
            expectedOutcome: payload.expectedOutcome ?? null,
            actualOutcome: payload.actualOutcome ?? null,
            status: payload.status ?? "planned",
            resolutionKind: payload.resolutionKind ?? null,
            sceneEntityId: payload.sceneEntityId ?? null,
            plannedSessionId: payload.plannedSessionId ?? null,
            plannedSessionOrder: payload.plannedSessionOrder ?? null,
            resolvedSessionId: payload.resolvedSessionId ?? null,
            sortOrder: payload.sortOrder ?? 0,
            updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
          },
        });
        break;
      }
      case "StoryStepScheduled":
      case "StoryStepDeferred": {
        await tx.update(schema.campaignStorySteps).set({
          plannedSessionId: payload.plannedSessionId,
          plannedSessionOrder: payload.plannedSessionOrder,
          status: "ready",
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStorySteps.stepId, payload.stepId),
        ));
        break;
      }
      case "StoryStepUnscheduled": {
        await tx.update(schema.campaignStorySteps).set({
          plannedSessionId: null,
          plannedSessionOrder: null,
          status: "planned",
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStorySteps.stepId, payload.stepId),
        ));
        break;
      }
      case "StoryStepReconciled": {
        await tx.update(schema.campaignStorySteps).set({
          status: payload.status,
          resolutionKind: payload.resolutionKind,
          actualOutcome: payload.actualOutcome ?? null,
          resolvedSessionId: payload.resolvedSessionId,
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStorySteps.stepId, payload.stepId),
        ));
        break;
      }
      case "StoryStepsReordered": {
        for (const [sortOrder, stepId] of (payload.orderedStepIds ?? []).entries()) {
          await tx.update(schema.campaignStorySteps).set({ sortOrder, updatedAt: new Date(event.occurredAt) }).where(and(
            eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
            eq(schema.campaignStorySteps.threadId, payload.threadId),
            eq(schema.campaignStorySteps.stepId, stepId),
          ));
        }
        break;
      }
      case "EntityLinkedToStoryThread": {
        await tx.insert(schema.campaignStoryThreadEntities).values({
          campaignId: event.campaignId ?? payload.campaignId,
          threadId: payload.threadId,
          entityId: payload.entityId,
        }).onConflictDoNothing();
        break;
      }
      case "EntityUnlinkedFromStoryThread": {
        await tx.delete(schema.campaignStoryThreadEntities).where(and(
          eq(schema.campaignStoryThreadEntities.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStoryThreadEntities.threadId, payload.threadId),
          eq(schema.campaignStoryThreadEntities.entityId, payload.entityId),
        ));
        break;
      }
      case "EntityLinkedToStoryStep": {
        await tx.insert(schema.campaignStoryStepEntities).values({
          campaignId: event.campaignId ?? payload.campaignId,
          stepId: payload.stepId,
          entityId: payload.entityId,
        }).onConflictDoNothing();
        break;
      }
      case "EntityUnlinkedFromStoryStep": {
        await tx.delete(schema.campaignStoryStepEntities).where(and(
          eq(schema.campaignStoryStepEntities.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStoryStepEntities.stepId, payload.stepId),
          eq(schema.campaignStoryStepEntities.entityId, payload.entityId),
        ));
        break;
      }
'''
replace_once(
    "src/backend/server/web/postgresCampaignRepository.ts",
    '      case "PlayerPortalNoteCreated": {',
    workspace_projection_cases + '      case "PlayerPortalNoteCreated": {',
)

# ---------------------------------------------------------------------------
# Remove the obsolete parallel campaign_scenes table and all live consumers.
# ---------------------------------------------------------------------------
sub_once(
    "src/backend/db/schema.ts",
    r'\nexport const campaignScenes = pgTable\("campaign_scenes", \{.*?\n\}\)\);\n',
    "\n",
    re.S,
)
replace_once(
    "src/backend/server/web/routes/adminWebRoutes.ts",
    '    const [scenesCount] = await db.select({ value: count() }).from(schema.campaignScenes).where(eq(schema.campaignScenes.campaignId, campaignId));\n',
    "",
)
replace_once(
    "src/backend/server/web/routes/adminWebRoutes.ts",
    '        scenes: scenesCount.value,\n',
    "",
)
replace_once("tests/setup.ts", "  await db.delete(schema.campaignScenes);\n", "")
replace_once("tests/backend/campaignOwnershipFkAudit.integration.test.ts", "const BASELINE_CAMPAIGN_OWNED_TABLE_COUNT = 24;", "const BASELINE_CAMPAIGN_OWNED_TABLE_COUNT = 23;")
replace_once("tests/backend/campaignOwnershipFkAudit.integration.test.ts", "  schema.campaignScenes,\n", "")
write(
    "src/backend/db/migrations/0019_stabilize_campaign_workspaces.sql",
    'DROP TABLE IF EXISTS "campaign_scenes" CASCADE;\n',
)
journal_path = "src/backend/db/migrations/meta/_journal.json"
journal = json.loads(read(journal_path))
if any(entry.get("tag") == "0019_stabilize_campaign_workspaces" for entry in journal["entries"]):
    raise RuntimeError("Migration 0019 already exists in journal")
journal["entries"].append({
    "idx": 19,
    "version": "7",
    "when": 1784210000000,
    "tag": "0019_stabilize_campaign_workspaces",
    "breakpoints": True,
})
write(journal_path, json.dumps(journal, indent=2, ensure_ascii=False) + "\n")

# ---------------------------------------------------------------------------
# History pagination validation and Canvas shell layout regression.
# ---------------------------------------------------------------------------
replace_once(
    "src/backend/server/activity/activityRepository.ts",
    '    return { occurredAt: new Date(dateStr), activityId };',
    '    const occurredAt = new Date(dateStr);\n    if (Number.isNaN(occurredAt.getTime())) return null;\n    return { occurredAt, activityId };',
)
replace_once(
    "src/backend/server/activity/activityRepository.ts",
    '    const limit = Math.min(filters.limit || 50, 100);',
    '    const limit = Math.max(1, Math.min(filters.limit || 50, 100));',
)
replace_once(
    "src/frontend/dm/CampaignShell.tsx",
    '      className={`app-container app-container--campaign-shell ${currentSegment === "canvas" ? "app-container--canvas" : ""\n        }`}',
    '      className={`app-container app-container--campaign-shell ${isCanvasRoute ? "app-container--canvas" : ""\n        }`}',
)

# ---------------------------------------------------------------------------
# Navigation metadata: Messages is one of the seven primary spaces and has its
# own metadata rather than borrowing People labels.
# ---------------------------------------------------------------------------
replace_once(
    "src/frontend/dm/navigation/campaignSections.tsx",
    '    labelKey: "campaignShell.nav.messages", // Wait, this key is added in campaignMessaging.ts or we can use "campaignShell.nav.players"\n    titleKey: "campaignShell.meta.playersTitle",\n    eyebrowKey: "campaignShell.meta.playersEyebrow",\n    descriptionKey: "campaignShell.meta.playersDescription",',
    '    labelKey: "campaignShell.nav.messages",\n    titleKey: "campaignShell.meta.messagesTitle",\n    eyebrowKey: "campaignShell.meta.messagesEyebrow",\n    descriptionKey: "campaignShell.meta.messagesDescription",',
)
replace_once(
    "src/frontend/dm/navigation/campaignSections.tsx",
    '    placement: "secondary",\n    mobilePlacement: "more",\n    mobilePriority: 70,',
    '    placement: "primary",\n    mobilePlacement: "more",\n    mobilePriority: 70,',
)

# ---------------------------------------------------------------------------
# CI now enforces lint and the dependency boundary that caught the earlier
# Core->Backend regression.
# ---------------------------------------------------------------------------
replace_once(
    ".github/workflows/ci.yml",
    '      - name: Typecheck\n        run: npm run typecheck:all\n',
    '      - name: Lint\n        run: npm run lint\n\n      - name: Dependency boundaries\n        run: npm run audit:deps\n\n      - name: Typecheck\n        run: npm run typecheck:all\n',
)

# ---------------------------------------------------------------------------
# Tests for the repaired invariants and SQL projections.
# ---------------------------------------------------------------------------
write(
    "tests/core/workspaceStabilization.test.ts",
    '''import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";

function storyState() {
  const state = createCampaignState("cmp_workspace");
  state.sessions.set("sess_planned", {
    id: "sess_planned",
    sessionId: "sess_planned",
    campaignId: "cmp_workspace",
    number: 1,
    title: "Planned session",
    status: "planned",
    presentPlayerIds: [],
    presentCharacterIds: [],
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
  });
  let next = handleCommand(state, {
    type: "CreateStoryThread",
    campaignId: "cmp_workspace",
    actorId: "usr_dm",
    threadId: "sth_main",
    title: "Main thread",
    status: "resolved",
    sortOrder: 0,
  }).state;
  next = handleCommand(next, {
    type: "CreateStoryStep",
    campaignId: "cmp_workspace",
    actorId: "usr_dm",
    stepId: "stp_main",
    threadId: "sth_main",
    title: "First step",
    sortOrder: 0,
  }).state;
  return next;
}

describe("campaign workspace stabilization", () => {
  it("always creates threads as planned and only resolves them through the semantic command", () => {
    const state = storyState();
    expect(state.storyThreads.get("sth_main")?.status).toBe("planned");
    expect(() => handleCommand(state, {
      type: "ResolveStoryThread",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      threadId: "sth_main",
    })).toThrow("Cannot resolve story thread");
  });

  it("moves scheduled steps to ready and unscheduling returns them to planned", () => {
    let state = storyState();
    state = handleCommand(state, {
      type: "ScheduleStoryStep",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      stepId: "stp_main",
      plannedSessionId: "sess_planned",
      plannedSessionOrder: 0,
    }).state;
    expect(state.storySteps.get("stp_main")?.status).toBe("ready");
    state = handleCommand(state, {
      type: "UnscheduleStoryStep",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      stepId: "stp_main",
    }).state;
    expect(state.storySteps.get("stp_main")?.status).toBe("planned");
  });

  it("rejects partial and duplicate reorder payloads", () => {
    let state = storyState();
    state = handleCommand(state, {
      type: "CreateStoryStep",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      stepId: "stp_second",
      threadId: "sth_main",
      title: "Second step",
      sortOrder: 1,
    }).state;
    expect(() => handleCommand(state, {
      type: "ReorderStorySteps",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      threadId: "sth_main",
      orderedStepIds: ["stp_main"],
    })).toThrow("must exactly match");
    expect(() => handleCommand(state, {
      type: "ReorderStorySteps",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      threadId: "sth_main",
      orderedStepIds: ["stp_main", "stp_main"],
    })).toThrow("must exactly match");
  });
});
''',
)

# Guard against leaving the removed LAN/scene implementation behind.
for forbidden in ["networkInfoWebRoutes", "api/network-info", "lanExposed", "campaignScenes"]:
    matches = []
    for candidate in (ROOT / "src").rglob("*"):
        if candidate.is_file() and candidate.suffix in {".ts", ".tsx", ".js", ".mjs"}:
            if forbidden in candidate.read_text(encoding="utf-8"):
                matches.append(str(candidate.relative_to(ROOT)))
    if matches:
        raise RuntimeError(f"Forbidden legacy token {forbidden!r} remains in {matches}")

print("campaign workspace stabilization patch applied")
