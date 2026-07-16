import { useEffect } from "react";
import { create } from "zustand";
import type { ShortcutTargetType } from "@core/domain/resource/resourceType.js";
import { readApiError } from "../../shared/api/apiClient.js";
import { createShortcut, deleteShortcut, listShortcuts, reorderShortcuts } from "../../shared/api/shortcutsApi.js";

interface ResolvedShortcutResource {
  title: string;
  subtitle?: string;
  archived: boolean;
}

interface CampaignShortcut {
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
const useCampaignShortcutsStore = create<CampaignShortcutsState>((set, get) => ({
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
