import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Plus,
  Trash2,
  User,
  X,
  Search,
  ArrowLeft,
} from "lucide-react";
import { notebooksApi } from "../../../shared/api.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useCampaignShortcuts } from "../../shortcuts/useCampaignShortcuts.js";
import { getEntityVisual } from "../../entities/entityVisuals.js";
import { ContextMenu, type ContextMenuItem } from "../../../shared/components/ContextMenu.js";

type CampaignState = NonNullable<ReturnType<typeof useCampaignStore.getState>["campaignState"]>;
type Notebook = CampaignState["notebooks"][number];
type NotebookItem = CampaignState["notebookItems"][number];

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function NotebooksView() {
  const { t } = useTranslation();
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
  
  // Link resource states
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "entity" | "session" | "canvas">("all");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isLinking, setIsLinking] = useState(false);

  // Notebook tree search query
  const [notebookSearch, setNotebookSearch] = useState("");

  // Mobile layout state ("index" or "detail")
  const [mobileView, setMobileView] = useState<"index" | "detail">("index");

  const refreshNotebooks = useCallback(async () => {
    if (!activeCampaignId) return;
    const response = await notebooksApi.listNotebooks(activeCampaignId);
    if (!response.ok) throw new Error(t("notebooks.errors.genericError"));
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
  }, [activeCampaignId, t]);

  useEffect(() => {
    void refreshNotebooks().catch((error: unknown) => 
      addToast(errorMessage(error, t("notebooks.errors.genericError")), "error")
    );
  }, [refreshNotebooks, addToast, t]);

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
  
  const selectedNotebookItems = useMemo(() => {
    return selectedNotebook
      ? notebookItems.filter((item) => item.notebookId === selectedNotebook.notebookId).sort((a, b) => a.sortOrder - b.sortOrder)
      : [];
  }, [selectedNotebook, notebookItems]);

  const existingIds = useMemo(() => {
    return new Set(selectedNotebookItems.map((item) => item.targetId));
  }, [selectedNotebookItems]);

  useEffect(() => {
    const requestedNotebookId = new URLSearchParams(window.location.search).get("notebookId");
    if (requestedNotebookId && notebooks.some((notebook) => notebook.notebookId === requestedNotebookId)) {
      setSelectedNotebookId(requestedNotebookId);
      setMobileView("detail");
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
      addToast(errorMessage(error, t("notebooks.errors.genericError")), "error");
    }
  };

  const createNotebook = async (parentNotebookId: string | null) => {
    if (!activeCampaignId || !newTitle.trim()) return;
    try {
      const response = await notebooksApi.createNotebook(activeCampaignId, {
        title: newTitle.trim(),
        parentNotebookId,
      });
      if (!response.ok) throw new Error(t("notebooks.errors.createError"));
      setNewTitle("");
      setIsCreatingRoot(false);
      setIsCreatingChild(false);
      await refreshNotebooks();
      addToast(t("notebooks.feedback.createSuccess"), "success");
    } catch (error: unknown) {
      addToast(errorMessage(error, t("notebooks.errors.createError")), "error");
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
      if (!response.ok) throw new Error(t("notebooks.errors.updateError"));
      setIsEditing(false);
      await refreshNotebooks();
      addToast(t("notebooks.feedback.updateSuccess"), "success");
    } catch (error: unknown) {
      addToast(errorMessage(error, t("notebooks.errors.updateError")), "error");
    }
  };

  const archiveNotebook = async () => {
    if (!activeCampaignId || !selectedNotebookId || !window.confirm(t("notebooks.form.confirmArchive"))) return;
    try {
      const response = await notebooksApi.deleteNotebook(activeCampaignId, selectedNotebookId);
      if (!response.ok) throw new Error(t("notebooks.errors.archiveError"));
      setSelectedNotebookId(null);
      setMobileView("index");
      await refreshNotebooks();
      addToast(t("notebooks.feedback.archiveSuccess"), "success");
    } catch (error: unknown) {
      addToast(errorMessage(error, t("notebooks.errors.archiveError")), "error");
    }
  };

  const handleLinkMultiple = async () => {
    if (!activeCampaignId || !selectedNotebookId || selectedItemIds.size === 0) return;
    setIsLinking(true);
    let successCount = 0;
    let lastError: string | null = null;
    
    for (const itemId of selectedItemIds) {
      const candidate = unifiedCandidates.find((c) => c.id === itemId);
      if (!candidate) continue;
      try {
        const response = await notebooksApi.addNotebookItem(activeCampaignId, selectedNotebookId, {
          targetType: candidate.type,
          targetId: candidate.id,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            payload?.errorCode === "NOTEBOOK_ITEM_DUPLICATE"
              ? t("notebooks.errors.duplicateItem")
              : payload?.error ?? t("notebooks.errors.itemAddError")
          );
        }
        successCount++;
      } catch (error: unknown) {
        lastError = error instanceof Error ? error.message : t("notebooks.errors.itemAddError");
      }
    }

    setIsLinking(false);
    setIsAddingItem(false);
    setSelectedItemIds(new Set());
    await refreshNotebooks();

    if (successCount > 0) {
      addToast(
        successCount === 1
          ? t("notebooks.feedback.itemAddedSuccess")
          : `${successCount} ${t("notebooks.feedback.itemAddedSuccess").toLowerCase()}`,
        "success"
      );
    }
    if (lastError) {
      addToast(lastError, "error");
    }
  };

  const openLinkModal = async () => {
    // Reload notebooks to prevent stale tree discrepancies
    try {
      await refreshNotebooks();
    } catch {
      // ignore
    }
    setSearchQuery("");
    setFilterType("all");
    setSelectedItemIds(new Set());
    setIsAddingItem(true);
  };

  const openAddWithType = (type: "entity" | "session" | "canvas") => {
    void openLinkModal().then(() => {
      setFilterType(type);
    });
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const removeItem = async (notebookItemId: string) => {
    if (!activeCampaignId) return;
    try {
      const response = await notebooksApi.removeNotebookItem(activeCampaignId, notebookItemId);
      if (!response.ok) throw new Error(t("notebooks.errors.itemRemoveError"));
      await refreshNotebooks();
      addToast(t("notebooks.feedback.itemRemovedSuccess"), "success");
    } catch (error: unknown) {
      addToast(errorMessage(error, t("notebooks.errors.itemRemoveError")), "error");
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
      if (!response.ok) throw new Error(t("notebooks.errors.reorderError"));
      await refreshNotebooks();
    } catch (error: unknown) {
      addToast(errorMessage(error, t("notebooks.errors.reorderError")), "error");
    }
  };

  // Unified candidates for the multi-select link modal
  const unifiedCandidates = useMemo(() => {
    const list: Array<{ id: string; title: string; subtitle: string; type: "entity" | "session" | "canvas"; rawType?: string }> = [];
    
    // Entities
    (campaignState?.entities ?? []).forEach((entity) => {
      if (!entity.archived) {
        const visual = getEntityVisual(entity.entityType);
        list.push({
          id: entity.entityId,
          title: entity.title,
          subtitle: t(visual?.labelKey || "notebooks.types.entity"),
          type: "entity",
          rawType: entity.entityType,
        });
      }
    });

    // Sessions
    (campaignState?.sessions ?? []).forEach((session) => {
      if (session.status !== "archived") {
        list.push({
          id: session.sessionId,
          title: session.title,
          subtitle: t("notebooks.types.session"),
          type: "session",
        });
      }
    });

    // Canvases
    (campaignState?.canvases ?? []).forEach((canvas) => {
      if (!canvas.archived) {
        list.push({
          id: canvas.id,
          title: canvas.title,
          subtitle: t("notebooks.types.canvas"),
          type: "canvas",
        });
      }
    });

    return list;
  }, [campaignState, t]);

  const filteredCandidates = useMemo(() => {
    return unifiedCandidates.filter((candidate) => {
      if (filterType !== "all" && candidate.type !== filterType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          candidate.title.toLowerCase().includes(query) ||
          candidate.subtitle.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [unifiedCandidates, searchQuery, filterType]);

  const itemDetails = (item: NotebookItem) => {
    if (item.targetType === "entity") {
      const entity = campaignState?.entities.find((candidate) => candidate.entityId === item.targetId);
      const visual = entity ? getEntityVisual(entity.entityType) : null;
      return {
        title: entity?.title ?? item.targetId,
        subtitle: entity ? t(visual?.labelKey || "notebooks.types.entity") : t("notebooks.types.entity"),
        icon: visual?.icon ?? User,
        color: visual?.accent ?? "var(--text-subtle)",
        description: entity?.summary || "",
      };
    }
    if (item.targetType === "session") {
      const session = campaignState?.sessions.find((candidate) => candidate.sessionId === item.targetId);
      return {
        title: session?.title ?? item.targetId,
        subtitle: t("notebooks.types.session"),
        icon: FileText,
        color: "var(--semantic-info)",
        description: session ? `${session.status === "active" ? "En curso" : session.status === "completed" ? "Finalizada" : "Preparada"}` : "",
      };
    }
    const canvas = campaignState?.canvases.find((candidate) => candidate.id === item.targetId);
    return {
      title: canvas?.title ?? item.targetId,
      subtitle: t("notebooks.types.canvas"),
      icon: Layers,
      color: "var(--semantic-secret)",
      description: "",
    };
  };

  const selectNotebook = (notebook: Notebook) => {
    setSelectedNotebookId(notebook.notebookId);
    setEditTitle(notebook.title);
    setEditDescription(notebook.description ?? "");
    setEditParentId(notebook.parentNotebookId ?? null);
    setIsEditing(false);
    setMobileView("detail");
  };

  const filterNotebookTree = (notebook: Notebook): boolean => {
    if (!notebookSearch.trim()) return true;
    const matchesSelf = notebook.title.toLowerCase().includes(notebookSearch.toLowerCase());
    if (matchesSelf) return true;
    const children = getChildren(notebook.notebookId);
    return children.some(filterNotebookTree);
  };

  const renderNotebook = (notebook: Notebook, depth = 0): React.ReactNode => {
    if (!filterNotebookTree(notebook)) return null;
    const itemCount = notebookItems.filter((item) => item.notebookId === notebook.notebookId).length;
    const children = getChildren(notebook.notebookId);
    
    return (
      <div key={notebook.notebookId} className="notebook-tree-node">
        <button
          type="button"
          className={`notebook-tree-item ${selectedNotebookId === notebook.notebookId ? "selected" : ""}`}
          style={{ paddingLeft: depth * 12 + 12 }}
          onClick={() => selectNotebook(notebook)}
        >
          <BookOpen size={14} className="notebook-tree-item-icon" />
          <span className="notebook-tree-item-title">{notebook.title}</span>
          {itemCount > 0 && <span className="notebook-tree-item-count">{itemCount}</span>}
        </button>
        {children.length > 0 && (
          <div className="notebook-tree-children">
            <div className="notebook-tree-guide" style={{ left: depth * 12 + 19 }} />
            {children.map((child) => renderNotebook(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Group context menu items
  const menuItems: ContextMenuItem[] = useMemo(() => [
    {
      id: "shortcut",
      label: isShortcutAdded ? t("shortcuts.remove") : t("shortcuts.add"),
      icon: isShortcutAdded ? BookmarkMinus : Bookmark,
      onSelect: () => void toggleShortcut(),
    },
    {
      id: "archive",
      label: t("notebooks.actions.archive"),
      icon: Trash2,
      destructive: true,
      onSelect: () => void archiveNotebook(),
    }
  ], [isShortcutAdded, t, selectedNotebookId]);

  return (
    <div className={`notebooks-workspace mobile-view-${mobileView}`}>
      <aside className="notebooks-sidebar glass-panel">
        <div className="notebooks-sidebar__header">
          <h3>{t("notebooks.title")}</h3>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            title={t("notebooks.actions.addRoot")}
            onClick={() => { setIsCreatingRoot(true); setIsCreatingChild(false); setNewTitle(""); }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Notebook search in tree */}
        <div className="notebooks-sidebar-search">
          <Search size={14} className="search-icon" />
          <input
            type="search"
            placeholder="Buscar..."
            value={notebookSearch}
            onChange={(e) => setNotebookSearch(e.target.value)}
          />
          {notebookSearch && (
            <button type="button" className="clear-search" onClick={() => setNotebookSearch("")}>
              <X size={12} />
            </button>
          )}
        </div>

        {isCreatingRoot && (
          <div className="glass-form notebooks-inline-form">
            <label>{t("notebooks.form.newRootName")}</label>
            <input type="text" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder={t("notebooks.form.titlePlaceholder")} autoFocus />
            <div className="notebooks-form-actions">
              <button type="button" className="btn btn-sm btn-secondary" title={t("notebooks.actions.cancel")} onClick={() => setIsCreatingRoot(false)}><X size={12} /></button>
              <button type="button" className="btn btn-sm btn-primary" title={t("notebooks.actions.save")} disabled={!newTitle.trim()} onClick={() => void createNotebook(null)}><Check size={12} /></button>
            </div>
          </div>
        )}

        <div className="notebooks-tree-container">
          {rootNotebooks.length ? rootNotebooks.map((notebook) => renderNotebook(notebook)) : <p className="notebooks-empty">{t("notebooks.emptyTree")}</p>}
        </div>
      </aside>

      <section className="notebook-content-area">
        {selectedNotebook ? (
          <div className="glass-panel notebook-detail-panel">
            {/* Mobile Header navigation back to list */}
            <div className="notebook-mobile-nav">
              <button type="button" className="btn btn-sm btn-link" onClick={() => setMobileView("index")}>
                <ArrowLeft size={16} style={{ marginRight: 6 }} />
                {t("notebooks.title")}
              </button>
            </div>

            <div className="notebook-detail-header">
              <div className="notebook-detail-copy">
                {isEditing ? (
                  <div className="notebooks-edit-form">
                    <input type="text" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} placeholder={t("notebooks.form.titlePlaceholder")} autoFocus />
                    <textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} placeholder={t("notebooks.form.descriptionPlaceholder")} rows={2} />
                    <select value={editParentId ?? ""} onChange={(event) => setEditParentId(event.target.value || null)}>
                      <option value="">{t("notebooks.form.newRootName")}</option>
                      {notebooks.filter((notebook) => notebook.notebookId !== selectedNotebookId).map((notebook) => (
                        <option key={notebook.notebookId} value={notebook.notebookId}>{notebook.title}</option>
                      ))}
                    </select>
                    <div className="notebooks-form-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>{t("notebooks.actions.cancel")}</button>
                      <button type="button" className="btn btn-primary" disabled={!editTitle.trim()} onClick={() => void updateNotebook()}>{t("notebooks.actions.save")}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>{selectedNotebook.title}</h2>
                    <p className={selectedNotebook.description ? "" : "no-desc"}>
                      {selectedNotebook.description || t("notebooks.noDescription")}
                    </p>
                  </>
                )}
              </div>
              <div className="notebook-detail-actions">
                <button type="button" className="btn btn-sm btn-outline-secondary" title={t("notebooks.actions.editNotebook")} onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} style={{ marginRight: 6 }} />
                  <span>Editar</span>
                </button>
                <button type="button" className="btn btn-sm btn-outline-primary" title={t("notebooks.actions.addChild")} onClick={() => { setIsCreatingChild(true); setIsCreatingRoot(false); setNewTitle(""); }}>
                  <FolderPlus size={16} style={{ marginRight: 6 }} />
                  <span>Subcuaderno</span>
                </button>
                <ContextMenu
                  buttonLabel="Más acciones"
                  items={menuItems}
                  align="end"
                />
              </div>
            </div>

            {isCreatingChild && (
              <div className="glass-form notebooks-inline-form">
                <label>{t("notebooks.form.newChildName")}</label>
                <input type="text" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder={t("notebooks.form.titlePlaceholder")} autoFocus />
                <div className="notebooks-form-actions">
                  <button type="button" className="btn btn-sm btn-secondary" title={t("notebooks.actions.cancel")} onClick={() => setIsCreatingChild(false)}><X size={12} /></button>
                  <button type="button" className="btn btn-sm btn-primary" title={t("notebooks.actions.save")} disabled={!newTitle.trim()} onClick={() => void createNotebook(selectedNotebook.notebookId)}><Check size={12} /></button>
                </div>
              </div>
            )}

            <div className="notebook-items-section">
              <div className="notebook-items-header">
                <h4>{t("notebooks.items")}</h4>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => void openLinkModal()}>
                  <Plus size={14} style={{ marginRight: 4 }} /> {t("notebooks.actions.addItem")}
                </button>
              </div>

              {selectedNotebookItems.length ? (
                <div className="notebook-items-list">
                  {selectedNotebookItems.map((item, index) => {
                    const details = itemDetails(item);
                    const ItemIcon = details.icon;
                    return (
                      <div key={item.notebookItemId} className="notebook-item-card glass-panel" style={{ borderLeft: `3px solid ${details.color}` }}>
                        <div className="notebook-item-icon-wrapper" style={{ color: details.color }}>
                          <ItemIcon size={16} />
                        </div>
                        <div className="notebook-item-copy">
                          <div className="notebook-item-header-row">
                            <strong>{details.title}</strong>
                            <span className="notebook-item-badge" style={{ backgroundColor: `${details.color}15`, color: details.color }}>
                              {details.subtitle}
                            </span>
                          </div>
                          {details.description && <p className="notebook-item-desc">{details.description}</p>}
                        </div>
                        <div className="notebook-item-actions">
                          <button type="button" className="btn btn-sm btn-link" title={t("notebooks.actions.moveUp")} disabled={index === 0} onClick={() => void reorderItems(index, "up")}><ArrowUp size={14} /></button>
                          <button type="button" className="btn btn-sm btn-link" title={t("notebooks.actions.moveDown")} disabled={index === selectedNotebookItems.length - 1} onClick={() => void reorderItems(index, "down")}><ArrowDown size={14} /></button>
                          <button type="button" className="btn btn-sm btn-link text-danger" title={t("notebooks.actions.removeItem")} onClick={() => void removeItem(item.notebookItemId)}><X size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="notebooks-empty-actionable glass-panel">
                  <p>{t("notebooks.emptyItems")}</p>
                  <p className="subtext">
                    Este cuaderno está vacío. Añade personajes, sesiones o tableros para reunir aquí la preparación relacionada.
                  </p>
                  <div className="action-buttons">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openAddWithType("entity")}>
                      <User size={14} style={{ marginRight: 6 }} />
                      Añadir personaje
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openAddWithType("session")}>
                      <FileText size={14} style={{ marginRight: 6 }} />
                      Añadir sesión
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openAddWithType("canvas")}>
                      <Layers size={14} style={{ marginRight: 6 }} />
                      Añadir tablero
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel notebook-placeholder">
            <BookOpen size={48} className="placeholder-logo" />
            <h3>{t("notebooks.selectPlaceholderTitle")}</h3>
            <p>{t("notebooks.selectPlaceholderDesc")}</p>
          </div>
        )}
      </section>

      {/* Link resource multi-select Modal */}
      {isAddingItem && (
        <div className="modal-overlay" role="presentation" onClick={() => setIsAddingItem(false)}>
          <div className="modal-content notebooks-link-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("notebooks.form.selectResource")}</h3>
              <button type="button" className="btn btn-sm btn-link close-btn" onClick={() => setIsAddingItem(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="explanation">
                Busca y selecciona uno o varios elementos para vincularlos a este cuaderno.
              </p>
              
              {/* Search Control */}
              <div className="search-control">
                <Search size={16} className="search-icon" />
                <input
                  type="search"
                  placeholder="Buscar personajes, sesiones o tableros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              
              {/* Filter Tabs */}
              <div className="filter-tabs">
                <button
                  type="button"
                  className={`tab-btn ${filterType === "all" ? "active" : ""}`}
                  onClick={() => setFilterType("all")}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={`tab-btn ${filterType === "entity" ? "active" : ""}`}
                  onClick={() => setFilterType("entity")}
                >
                  {t("notebooks.types.entity")}
                </button>
                <button
                  type="button"
                  className={`tab-btn ${filterType === "session" ? "active" : ""}`}
                  onClick={() => setFilterType("session")}
                >
                  {t("notebooks.types.session")}
                </button>
                <button
                  type="button"
                  className={`tab-btn ${filterType === "canvas" ? "active" : ""}`}
                  onClick={() => setFilterType("canvas")}
                >
                  {t("notebooks.types.canvas")}
                </button>
              </div>
              
              {/* Scrollable list of candidates */}
              <div className="candidates-list">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => {
                    const isChecked = selectedItemIds.has(candidate.id);
                    const isLinked = existingIds.has(candidate.id);
                    
                    return (
                      <label
                        key={candidate.id}
                        className={`candidate-item ${isLinked ? "linked" : ""} ${isChecked ? "selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked || isLinked}
                          disabled={isLinked}
                          onChange={() => toggleSelectItem(candidate.id)}
                        />
                        <div className="item-info">
                          <strong>{candidate.title}</strong>
                          <span>{candidate.subtitle}</span>
                        </div>
                        {isLinked && <span className="linked-badge">Vinculado</span>}
                      </label>
                    );
                  })
                ) : (
                  <div className="no-candidates">
                    <p>No hay elementos disponibles para vincular con este filtro.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddingItem(false)}>
                {t("notebooks.actions.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={selectedItemIds.size === 0 || isLinking}
                onClick={() => void handleLinkMultiple()}
              >
                {isLinking ? "Vinculando..." : `${t("notebooks.actions.link")} (${selectedItemIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
