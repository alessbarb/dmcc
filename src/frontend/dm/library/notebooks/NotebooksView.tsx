import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { NotebookItemTargetType } from "@core/domain/resource/resourceType.js";
import { notebookUiCopy } from "@shared/i18n/notebookUi.js";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Bookmark,
  BookmarkMinus,
  Check,
  Edit2,
  FileText,
  FolderPlus,
  Layers,
  Link,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import { notebooksApi } from "../../../shared/api.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useCampaignShortcuts } from "../../shortcuts/useCampaignShortcuts.js";

type CampaignState = NonNullable<ReturnType<typeof useCampaignStore.getState>["campaignState"]>;
type Notebook = CampaignState["notebooks"][number];
type NotebookItem = CampaignState["notebookItems"][number];

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function NotebooksView() {
  const { locale, t } = useTranslation();
  const copy = notebookUiCopy[locale];
  const { addToast } = useToast();
  const campaignState = useCampaignStore((state) => state.campaignState);
  const activeCampaignId = useCampaignStore((state) => state.activeCampaignId);
  const { shortcuts, addShortcut, removeShortcut } = useCampaignShortcuts(activeCampaignId ?? undefined);

  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<NotebookItemTargetType>("entity");
  const [selectedItemId, setSelectedItemId] = useState("");

  const refreshNotebooks = useCallback(async () => {
    if (!activeCampaignId) return;
    const response = await notebooksApi.listNotebooks(activeCampaignId);
    if (!response.ok) throw new Error(copy.genericError);
    const payload = await response.json() as {
      notebooks?: CampaignState["notebooks"];
      items?: CampaignState["notebookItems"];
    };
    useCampaignStore.setState((state) => {
      if (!state.campaignState || state.activeCampaignId !== activeCampaignId) return state;
      return {
        campaignState: {
          ...state.campaignState,
          notebooks: payload.notebooks ?? [],
          notebookItems: payload.items ?? [],
        },
      };
    });
  }, [activeCampaignId, copy.genericError]);

  useEffect(() => {
    void refreshNotebooks().catch((error: unknown) => addToast(errorMessage(error, copy.genericError), "error"));
  }, [refreshNotebooks]);

  const notebooks = useMemo(
    () => (campaignState?.notebooks ?? []).filter((notebook) => !notebook.archivedAt),
    [campaignState?.notebooks],
  );
  const notebookItems = campaignState?.notebookItems ?? [];
  const rootNotebooks = useMemo(
    () => notebooks.filter((notebook) => !notebook.parentNotebookId).sort((a, b) => a.sortOrder - b.sortOrder),
    [notebooks],
  );
  const selectedNotebook = notebooks.find((notebook) => notebook.notebookId === selectedNotebookId);
  const selectedNotebookItems = selectedNotebook
    ? notebookItems.filter((item) => item.notebookId === selectedNotebook.notebookId).sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  useEffect(() => {
    const requestedNotebookId = new URLSearchParams(window.location.search).get("notebookId");
    if (requestedNotebookId && notebooks.some((notebook) => notebook.notebookId === requestedNotebookId)) {
      setSelectedNotebookId(requestedNotebookId);
    }
  }, [notebooks]);

  const getChildren = (parentId: string) => notebooks
    .filter((notebook) => notebook.parentNotebookId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const isShortcutAdded = selectedNotebookId
    ? shortcuts.some((shortcut) => shortcut.targetType === "notebook" && shortcut.targetId === selectedNotebookId)
    : false;

  const toggleShortcut = async () => {
    if (!selectedNotebookId) return;
    try {
      const existing = shortcuts.find((shortcut) => shortcut.targetType === "notebook" && shortcut.targetId === selectedNotebookId);
      if (existing) {
        await removeShortcut(existing.shortcutId);
        addToast(t("shortcuts.removedToast"), "success");
      } else {
        await addShortcut("notebook", selectedNotebookId);
        addToast(t("shortcuts.addedToast"), "success");
      }
    } catch (error: unknown) {
      addToast(errorMessage(error, copy.genericError), "error");
    }
  };

  const createNotebook = async (parentNotebookId: string | null) => {
    if (!activeCampaignId || !newTitle.trim()) return;
    try {
      const response = await notebooksApi.createNotebook(activeCampaignId, {
        title: newTitle.trim(),
        parentNotebookId,
      });
      if (!response.ok) throw new Error(copy.createError);
      setNewTitle("");
      setIsCreatingRoot(false);
      setIsCreatingChild(false);
      await refreshNotebooks();
      addToast(copy.createSuccess, "success");
    } catch (error: unknown) {
      addToast(errorMessage(error, copy.createError), "error");
    }
  };

  const updateNotebook = async () => {
    if (!activeCampaignId || !selectedNotebookId || !editTitle.trim()) return;
    try {
      const response = await notebooksApi.updateNotebook(activeCampaignId, selectedNotebookId, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        parentNotebookId: editParentId,
      });
      if (!response.ok) throw new Error(copy.updateError);
      setIsEditing(false);
      await refreshNotebooks();
      addToast(copy.updateSuccess, "success");
    } catch (error: unknown) {
      addToast(errorMessage(error, copy.updateError), "error");
    }
  };

  const archiveNotebook = async () => {
    if (!activeCampaignId || !selectedNotebookId || !window.confirm(copy.confirmArchive)) return;
    try {
      const response = await notebooksApi.deleteNotebook(activeCampaignId, selectedNotebookId);
      if (!response.ok) throw new Error(copy.archiveError);
      setSelectedNotebookId(null);
      await refreshNotebooks();
      addToast(copy.archiveSuccess, "success");
    } catch (error: unknown) {
      addToast(errorMessage(error, copy.archiveError), "error");
    }
  };

  const addItem = async () => {
    if (!activeCampaignId || !selectedNotebookId || !selectedItemId) return;
    try {
      const response = await notebooksApi.addNotebookItem(activeCampaignId, selectedNotebookId, {
        targetType: selectedItemType,
        targetId: selectedItemId,
      });
      if (!response.ok) throw new Error(copy.itemAddError);
      setSelectedItemId("");
      setIsAddingItem(false);
      await refreshNotebooks();
      addToast(copy.itemAddedSuccess, "success");
    } catch (error: unknown) {
      addToast(errorMessage(error, copy.itemAddError), "error");
    }
  };

  const removeItem = async (notebookItemId: string) => {
    if (!activeCampaignId) return;
    try {
      const response = await notebooksApi.removeNotebookItem(activeCampaignId, notebookItemId);
      if (!response.ok) throw new Error(copy.itemRemoveError);
      await refreshNotebooks();
      addToast(copy.itemRemovedSuccess, "success");
    } catch (error: unknown) {
      addToast(errorMessage(error, copy.itemRemoveError), "error");
    }
  };

  const reorderItems = async (index: number, direction: "up" | "down") => {
    if (!activeCampaignId || !selectedNotebookId) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedNotebookItems.length) return;
    const reordered = [...selectedNotebookItems];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    try {
      const response = await notebooksApi.reorderNotebookItems(activeCampaignId, selectedNotebookId, {
        orderedItemIds: reordered.map((item) => item.notebookItemId),
      });
      if (!response.ok) throw new Error(copy.reorderError);
      await refreshNotebooks();
    } catch (error: unknown) {
      addToast(errorMessage(error, copy.reorderError), "error");
    }
  };

  const candidates = useMemo(() => {
    const existingIds = new Set(selectedNotebookItems.map((item) => item.targetId));
    if (selectedItemType === "entity") {
      return (campaignState?.entities ?? []).filter((entity) => !entity.archived && !existingIds.has(entity.entityId));
    }
    if (selectedItemType === "session") {
      return (campaignState?.sessions ?? []).filter((session) => session.status !== "archived" && !existingIds.has(session.sessionId));
    }
    return (campaignState?.canvases ?? []).filter((canvas) => !canvas.archived && !existingIds.has(canvas.id));
  }, [campaignState, selectedItemType, selectedNotebookItems]);

  const itemDetails = (item: NotebookItem) => {
    if (item.targetType === "entity") {
      const entity = campaignState?.entities.find((candidate) => candidate.entityId === item.targetId);
      return { title: entity?.title ?? item.targetId, subtitle: copy.typeEntity, icon: User };
    }
    if (item.targetType === "session") {
      const session = campaignState?.sessions.find((candidate) => candidate.sessionId === item.targetId);
      return { title: session?.title ?? item.targetId, subtitle: copy.typeSession, icon: FileText };
    }
    const canvas = campaignState?.canvases.find((candidate) => candidate.id === item.targetId);
    return { title: canvas?.title ?? item.targetId, subtitle: copy.typeCanvas, icon: Layers };
  };

  const selectNotebook = (notebook: Notebook) => {
    setSelectedNotebookId(notebook.notebookId);
    setEditTitle(notebook.title);
    setEditDescription(notebook.description ?? "");
    setEditParentId(notebook.parentNotebookId ?? null);
    setIsEditing(false);
  };

  const renderNotebook = (notebook: Notebook, depth = 0): React.ReactNode => (
    <div key={notebook.notebookId} style={{ marginLeft: depth * 12 }}>
      <button
        type="button"
        className={`notebook-tree-item ${selectedNotebookId === notebook.notebookId ? "selected" : ""}`}
        onClick={() => selectNotebook(notebook)}
      >
        <BookOpen size={14} />
        <span>{notebook.title}</span>
      </button>
      {getChildren(notebook.notebookId).map((child) => renderNotebook(child, depth + 1))}
    </div>
  );

  return (
    <div className="notebooks-workspace">
      <aside className="notebooks-sidebar glass-panel">
        <div className="notebooks-sidebar__header">
          <h3>{copy.title}</h3>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            title={copy.addRoot}
            onClick={() => { setIsCreatingRoot(true); setIsCreatingChild(false); setNewTitle(""); }}
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {isCreatingRoot && (
          <div className="glass-form notebooks-inline-form">
            <label>{copy.newRootName}</label>
            <input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder={copy.titlePlaceholder} />
            <div className="notebooks-form-actions">
              <button type="button" className="btn btn-sm btn-secondary" title={copy.cancel} onClick={() => setIsCreatingRoot(false)}><X size={12} /></button>
              <button type="button" className="btn btn-sm btn-primary" title={copy.save} disabled={!newTitle.trim()} onClick={() => void createNotebook(null)}><Check size={12} /></button>
            </div>
          </div>
        )}

        <div className="notebooks-tree-container">
          {rootNotebooks.length ? rootNotebooks.map((notebook) => renderNotebook(notebook)) : <p className="notebooks-empty">{copy.emptyTree}</p>}
        </div>
      </aside>

      <section className="notebook-content-area">
        {selectedNotebook ? (
          <div className="glass-panel notebook-detail-panel">
            <div className="notebook-detail-header">
              <div className="notebook-detail-copy">
                {isEditing ? (
                  <div className="notebooks-edit-form">
                    <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} placeholder={copy.titlePlaceholder} />
                    <textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} placeholder={copy.descriptionPlaceholder} rows={2} />
                    <select value={editParentId ?? ""} onChange={(event) => setEditParentId(event.target.value || null)}>
                      <option value="">{copy.newRootName}</option>
                      {notebooks.filter((notebook) => notebook.notebookId !== selectedNotebookId).map((notebook) => (
                        <option key={notebook.notebookId} value={notebook.notebookId}>{notebook.title}</option>
                      ))}
                    </select>
                    <div className="notebooks-form-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>{copy.cancel}</button>
                      <button type="button" className="btn btn-primary" disabled={!editTitle.trim()} onClick={() => void updateNotebook()}>{copy.save}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>{selectedNotebook.title}</h2>
                    <p>{selectedNotebook.description || copy.noDescription}</p>
                  </>
                )}
              </div>
              <div className="notebook-detail-actions">
                <button type="button" className={`btn btn-sm ${isShortcutAdded ? "btn-primary" : "btn-outline-secondary"}`} title={isShortcutAdded ? t("shortcuts.remove") : t("shortcuts.add")} onClick={() => void toggleShortcut()}>
                  {isShortcutAdded ? <BookmarkMinus size={16} /> : <Bookmark size={16} />}
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" title={copy.editNotebook} onClick={() => setIsEditing(true)}><Edit2 size={16} /></button>
                <button type="button" className="btn btn-sm btn-outline-primary" title={copy.addChild} onClick={() => { setIsCreatingChild(true); setIsCreatingRoot(false); setNewTitle(""); }}><FolderPlus size={16} /></button>
                <button type="button" className="btn btn-sm btn-outline-danger" title={copy.archive} onClick={() => void archiveNotebook()}><Trash2 size={16} /></button>
              </div>
            </div>

            {isCreatingChild && (
              <div className="glass-form notebooks-inline-form">
                <label>{copy.newChildName}</label>
                <input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder={copy.titlePlaceholder} />
                <div className="notebooks-form-actions">
                  <button type="button" className="btn btn-sm btn-secondary" title={copy.cancel} onClick={() => setIsCreatingChild(false)}><X size={12} /></button>
                  <button type="button" className="btn btn-sm btn-primary" title={copy.save} disabled={!newTitle.trim()} onClick={() => void createNotebook(selectedNotebook.notebookId)}><Check size={12} /></button>
                </div>
              </div>
            )}

            <div className="notebook-items-section">
              <div className="notebook-items-header">
                <h4>{copy.items}</h4>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => { setIsAddingItem(true); setSelectedItemId(""); }}><Plus size={14} /> {copy.addItem}</button>
              </div>

              {isAddingItem && (
                <div className="glass-panel notebook-resource-form">
                  <h5>{copy.selectResource}</h5>
                  <label>{copy.resourceType}</label>
                  <select value={selectedItemType} onChange={(event) => { setSelectedItemType(event.target.value as NotebookItemTargetType); setSelectedItemId(""); }}>
                    <option value="entity">{copy.typeEntity}</option>
                    <option value="session">{copy.typeSession}</option>
                    <option value="canvas">{copy.typeCanvas}</option>
                  </select>
                  <label>{copy.resourceSelect}</label>
                  <select value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)} disabled={!candidates.length}>
                    <option value="">{copy.selectOption}</option>
                    {candidates.map((candidate) => {
                      const id = "entityId" in candidate ? candidate.entityId : "sessionId" in candidate ? candidate.sessionId : candidate.id;
                      return <option key={id} value={id}>{candidate.title}</option>;
                    })}
                  </select>
                  <div className="notebooks-form-actions">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIsAddingItem(false)}>{copy.cancel}</button>
                    <button type="button" className="btn btn-sm btn-primary" disabled={!selectedItemId} onClick={() => void addItem()}>{copy.link}</button>
                  </div>
                </div>
              )}

              {selectedNotebookItems.length ? (
                <div className="notebook-items-list">
                  {selectedNotebookItems.map((item, index) => {
                    const details = itemDetails(item);
                    const ItemIcon = details.icon;
                    return (
                      <div key={item.notebookItemId} className="notebook-item-card glass-panel">
                        <ItemIcon size={16} />
                        <div className="notebook-item-copy"><strong>{details.title}</strong><span>{details.subtitle}</span></div>
                        <div className="notebook-item-actions">
                          <button type="button" className="btn btn-sm btn-link" title={copy.moveUp} disabled={index === 0} onClick={() => void reorderItems(index, "up")}><ArrowUp size={14} /></button>
                          <button type="button" className="btn btn-sm btn-link" title={copy.moveDown} disabled={index === selectedNotebookItems.length - 1} onClick={() => void reorderItems(index, "down")}><ArrowDown size={14} /></button>
                          <button type="button" className="btn btn-sm btn-link text-danger" title={copy.removeItem} onClick={() => void removeItem(item.notebookItemId)}><X size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="notebooks-empty notebooks-empty--items"><Link size={24} /><p>{copy.emptyItems}</p></div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel notebook-placeholder">
            <BookOpen size={48} />
            <h3>{copy.selectPlaceholderTitle}</h3>
            <p>{copy.selectPlaceholderDesc}</p>
          </div>
        )}
      </section>
    </div>
  );
}
