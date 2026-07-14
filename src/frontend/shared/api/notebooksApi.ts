import { apiFetch } from "./apiClient.js";

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export const listNotebooks = (campaignId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks`);

export const createNotebook = (campaignId: string, payload: { title: string; parentNotebookId?: string | null }) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks`, { init: jsonInit("POST", payload) });

export const updateNotebook = (campaignId: string, notebookId: string, payload: { title?: string; parentNotebookId?: string | null }) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/${notebookId}`, { init: jsonInit("PATCH", payload) });

export const deleteNotebook = (campaignId: string, notebookId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/${notebookId}`, { init: { method: "DELETE" } });

export const addNotebookItem = (campaignId: string, notebookId: string, payload: { targetType: string; targetId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/${notebookId}/items`, { init: jsonInit("POST", payload) });

export const removeNotebookItem = (campaignId: string, notebookItemId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/items/${notebookItemId}`, { init: { method: "DELETE" } });

export const reorderNotebookItems = (campaignId: string, notebookId: string, payload: { orderedItemIds: string[] }) =>
  apiFetch(`/api/campaigns/${campaignId}/notebooks/${notebookId}/items/reorder`, { init: jsonInit("PATCH", payload) });
