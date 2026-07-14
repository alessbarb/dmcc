import { useEffect } from "react";
import { create } from "zustand";
import type { ShortcutTargetType } from "@core/domain/resource/resourceType.js";
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

/**
 * Personal per-user shortcuts, separate from campaignState — shortcuts never
 * grant access and shouldn't be conflated with the shared campaign aggregate.
 */
export const useCampaignShortcutsStore = create<CampaignShortcutsState>((set, get) => ({
  shortcutsByCampaignId: {},
  loadingCampaignIds: {},

  fetchShortcuts: async (campaignId) => {
    set((state) => ({ loadingCampaignIds: { ...state.loadingCampaignIds, [campaignId]: true } }));
    try {
      const res = await listShortcuts(campaignId);
      const shortcuts: CampaignShortcut[] = res.ok ? (await res.json()).shortcuts : [];
      set((state) => ({
        shortcutsByCampaignId: { ...state.shortcutsByCampaignId, [campaignId]: shortcuts },
      }));
    } finally {
      set((state) => ({ loadingCampaignIds: { ...state.loadingCampaignIds, [campaignId]: false } }));
    }
  },

  addShortcut: async (campaignId, targetType, targetId) => {
    const res = await createShortcut(campaignId, { targetType, targetId });
    if (res.ok) {
      await get().fetchShortcuts(campaignId);
    }
  },

  removeShortcut: async (campaignId, shortcutId) => {
    const previous = get().shortcutsByCampaignId[campaignId] ?? [];
    set((state) => ({
      shortcutsByCampaignId: {
        ...state.shortcutsByCampaignId,
        [campaignId]: previous.filter((shortcut) => shortcut.shortcutId !== shortcutId),
      },
    }));
    const res = await deleteShortcut(campaignId, shortcutId);
    if (!res.ok) {
      set((state) => ({ shortcutsByCampaignId: { ...state.shortcutsByCampaignId, [campaignId]: previous } }));
    }
  },

  reorder: async (campaignId, shortcutIds) => {
    const previous = get().shortcutsByCampaignId[campaignId] ?? [];
    const reordered = shortcutIds
      .map((shortcutId) => previous.find((shortcut) => shortcut.shortcutId === shortcutId))
      .filter((shortcut): shortcut is CampaignShortcut => Boolean(shortcut));
    set((state) => ({ shortcutsByCampaignId: { ...state.shortcutsByCampaignId, [campaignId]: reordered } }));
    const res = await reorderShortcuts(campaignId, shortcutIds);
    if (!res.ok) {
      set((state) => ({ shortcutsByCampaignId: { ...state.shortcutsByCampaignId, [campaignId]: previous } }));
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
    if (campaignId) void fetchShortcuts(campaignId);
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
