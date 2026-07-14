import React, { useState } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { notebooksApi } from "../../../shared/api.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { useCampaignShortcuts } from "../../shortcuts/useCampaignShortcuts.js";
import {
  BookOpen,
  Plus,
  FolderPlus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Bookmark,
  BookmarkMinus,
  Link,
  Eye,
  FileText,
  Layers,
  HelpCircle,
  User,
} from "lucide-react";

export function NotebooksView() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const store = useCampaignStore();
  const { campaignState, reloadCampaign, activeCampaignId } = store;

  // Shortcuts integration
  const { shortcuts, addShortcut, removeShortcut } = useCampaignShortcuts(activeCampaignId ?? undefined);

  // Component states
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Adding items state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState("entity");
  const [selectedItemId, setSelectedItemId] = useState("");

  const notebooks = campaignState?.notebooks ?? [];
  const items = campaignState?.notebookItems ?? [];

  // Active notebooks (not archived)
  const activeNotebooks = notebooks.filter((n) => !n.archivedAt);

  // Group by parent
  const rootNotebooks = activeNotebooks.filter((n) => !n.parentNotebookId).sort((a, b) => a.sortOrder - b.sortOrder);
  const getChildren = (parentId: string) =>
    activeNotebooks.filter((n) => n.parentNotebookId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedNotebook = activeNotebooks.find((n) => n.notebookId === selectedNotebookId);
  const selectedNotebookItems = selectedNotebook
    ? items.filter((item) => item.notebookId === selectedNotebookId).sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const isShortcutAdded = selectedNotebookId
    ? shortcuts.some((s) => s.targetType === "notebook" && s.targetId === selectedNotebookId)
    : false;

  const handleToggleShortcut = async () => {
    if (!selectedNotebookId || !activeCampaignId) return;
    if (isShortcutAdded) {
      const existing = shortcuts.find((s) => s.targetType === "notebook" && s.targetId === selectedNotebookId);
      if (existing) {
        await removeShortcut(existing.shortcutId);
        addToast(t("shortcuts.removedToast"), "success");
      }
    } else {
      await addShortcut("notebook", selectedNotebookId);
      addToast(t("shortcuts.addedToast"), "success");
    }
  };

  const handleCreateNotebook = async (parentId: string | null = null) => {
    if (!activeCampaignId || !newTitle.trim()) return;
    try {
      const res = await notebooksApi.createNotebook(activeCampaignId, {
        title: newTitle.trim(),
        parentNotebookId: parentId,
      });
      if (res.ok) {
        setNewTitle("");
        setIsCreatingRoot(false);
        setIsCreatingChild(false);
        addToast(t("notebooks.createSuccess") || "Notebook created successfully", "success");
        await reloadCampaign();
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.error || "Failed to create notebook", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Error creating notebook", "error");
    }
  };

  const handleUpdateNotebook = async () => {
    if (!activeCampaignId || !selectedNotebookId || !editTitle.trim()) return;
    try {
      const res = await notebooksApi.updateNotebook(activeCampaignId, selectedNotebookId, {
        title: editTitle.trim(),
      });
      if (res.ok) {
        setIsEditing(false);
        addToast(t("notebooks.updateSuccess") || "Notebook updated successfully", "success");
        await reloadCampaign();
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.error || "Failed to update notebook", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Error updating notebook", "error");
    }
  };

  const handleArchiveNotebook = async () => {
    if (!activeCampaignId || !selectedNotebookId) return;
    if (!confirm(t("notebooks.confirmArchive") || "Are you sure you want to archive this notebook? All nested notebooks will also be inaccessible.")) return;
    try {
      const res = await notebooksApi.deleteNotebook(activeCampaignId, selectedNotebookId);
      if (res.ok) {
        setSelectedNotebookId(null);
        addToast(t("notebooks.archiveSuccess") || "Notebook archived successfully", "success");
        await reloadCampaign();
      } else {
        addToast("Failed to archive notebook", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Error archiving notebook", "error");
    }
  };

  const handleAddItem = async () => {
    if (!activeCampaignId || !selectedNotebookId || !selectedItemId) return;
    try {
      const res = await notebooksApi.addNotebookItem(activeCampaignId, selectedNotebookId, {
        targetType: selectedItemType,
        targetId: selectedItemId,
      });
      if (res.ok) {
        setSelectedItemId("");
        setIsAddingItem(false);
        addToast(t("notebooks.itemAddedSuccess") || "Item added to notebook", "success");
        await reloadCampaign();
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.error || "Failed to add item", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Error adding item", "error");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!activeCampaignId) return;
    try {
      const res = await notebooksApi.removeNotebookItem(activeCampaignId, itemId);
      if (res.ok) {
        addToast(t("notebooks.itemRemovedSuccess") || "Item removed from notebook", "success");
        await reloadCampaign();
      } else {
        addToast("Failed to remove item", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Error removing item", "error");
    }
  };

  const handleReorderItems = async (index: number, direction: "up" | "down") => {
    if (!activeCampaignId || !selectedNotebookId) return;
    const reordered = [...selectedNotebookItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reordered.length) return;

    // Swap
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orderedItemIds = reordered.map((item) => item.notebookItemId);
    try {
      const res = await notebooksApi.reorderNotebookItems(activeCampaignId, selectedNotebookId, { orderedItemIds });
      if (res.ok) {
        await reloadCampaign();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to resolve linked item display name and icon
  const resolveItemDetails = (type: string, id: string) => {
    if (type === "entity") {
      const entity = campaignState?.entities.find((e) => e.entityId === id);
      return { title: entity?.title || id, subtitle: entity?.entityType || "Entity", icon: User };
    } else if (type === "session") {
      const session = campaignState?.sessions.find((s) => s.sessionId === id);
      return { title: session?.title || id, subtitle: "Session", icon: FileText };
    } else if (type === "canvas") {
      const canvas = campaignState?.canvases.find((c) => c.id === id);
      return { title: canvas?.title || id, subtitle: "Canvas", icon: Layers };
    }
    return { title: id, subtitle: type, icon: HelpCircle };
  };

  // Filter out candidates that are already inside the selected notebook
  const getAddItemCandidates = () => {
    const existingIds = new Set(selectedNotebookItems.map((item) => item.targetId));
    if (selectedItemType === "entity") {
      return (campaignState?.entities ?? []).filter((e) => !e.archived && !existingIds.has(e.entityId));
    } else if (selectedItemType === "session") {
      return (campaignState?.sessions ?? []).filter((s) => s.status !== "archived" && !existingIds.has(s.sessionId));
    } else if (selectedItemType === "canvas") {
      return (campaignState?.canvases ?? []).filter((c) => !c.archived && !existingIds.has(c.id));
    }
    return [];
  };

  const candidates = getAddItemCandidates();

  // Recursively render notebook items in hierarchy sidebar
  const renderNotebookNode = (notebook: any, depth: number = 0) => {
    const isSelected = selectedNotebookId === notebook.notebookId;
    const children = getChildren(notebook.notebookId);

    return (
      <div key={notebook.notebookId} style={{ marginLeft: depth * 12 }}>
        <button
          type="button"
          onClick={() => {
            setSelectedNotebookId(notebook.notebookId);
            setEditTitle(notebook.title);
            setEditDesc(notebook.description || "");
            setIsEditing(false);
          }}
          className={`notebook-tree-item ${isSelected ? "selected" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "8px 12px",
            border: "none",
            background: isSelected ? "var(--bg-active)" : "none",
            color: isSelected ? "var(--text-active)" : "var(--text-main)",
            borderRadius: "6px",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "0.9rem",
            marginBottom: "2px",
            transition: "all 0.2s ease",
          }}
        >
          <BookOpen size={14} style={{ marginRight: 8, opacity: 0.7 }} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {notebook.title}
          </span>
          {children.length > 0 && (
            <span style={{ fontSize: "0.75rem", opacity: 0.5, marginLeft: "auto" }}>
              ({children.length})
            </span>
          )}
        </button>
        {children.map((child) => renderNotebookNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="notebooks-workspace" style={{ display: "flex", gap: "24px", minHeight: "60vh" }}>
      {/* LEFT SIDEBAR: Notebooks hierarchy list */}
      <div
        className="notebooks-sidebar glass-panel"
        style={{
          width: "280px",
          padding: "16px",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{t("notebooks.title") || "Cuadernos"}</h3>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              setIsCreatingRoot(true);
              setIsCreatingChild(false);
              setNewTitle("");
            }}
            title={t("notebooks.addRoot") || "Crear cuaderno raíz"}
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {/* Create Root Notebook form inline */}
        {isCreatingRoot && (
          <div className="glass-form" style={{ padding: 12, borderRadius: 8, background: "var(--bg-main)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6 }}>
              {t("notebooks.newRootName") || "Nuevo Cuaderno Raíz"}
            </div>
            <input
              type="text"
              className="form-control form-control-sm"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title..."
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setIsCreatingRoot(false)}
              >
                <X size={12} />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => handleCreateNotebook(null)}
                disabled={!newTitle.trim()}
              >
                <Check size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="notebooks-tree-container" style={{ flex: 1, overflowY: "auto" }}>
          {rootNotebooks.length === 0 ? (
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
              {t("notebooks.emptyTree") || "No hay cuadernos creados."}
            </div>
          ) : (
            rootNotebooks.map((notebook) => renderNotebookNode(notebook, 0))
          )}
        </div>
      </div>

      {/* RIGHT WORKSPACE: Notebook contents/details */}
      <div className="notebook-content-area" style={{ flex: 1 }}>
        {selectedNotebook ? (
          <div
            className="glass-panel"
            style={{
              padding: "24px",
              borderRadius: "12px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Header section with inline edits / shortcuts toggle / archive */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title..."
                    />
                    <textarea
                      className="form-control"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Add a description..."
                      rows={2}
                    />
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        {t("common.cancel") || "Cancelar"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleUpdateNotebook}
                        disabled={!editTitle.trim()}
                      >
                        {t("common.save") || "Guardar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 12 }}>
                      {selectedNotebook.title}
                      <button
                        type="button"
                        className="btn btn-sm btn-link"
                        onClick={() => setIsEditing(true)}
                        style={{ padding: 4 }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </h2>
                    <p style={{ color: "var(--text-muted)", margin: 0, whiteSpace: "pre-wrap" }}>
                      {selectedNotebook.description || t("notebooks.noDescription") || "Sin descripción."}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {/* Shortcut toggle */}
                <button
                  type="button"
                  className={`btn btn-sm ${isShortcutAdded ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={handleToggleShortcut}
                  title={isShortcutAdded ? t("shortcuts.remove") : t("shortcuts.add")}
                >
                  {isShortcutAdded ? <BookmarkMinus size={16} /> : <Bookmark size={16} />}
                </button>

                {/* Subfolder addition */}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setIsCreatingChild(true);
                    setIsCreatingRoot(false);
                    setNewTitle("");
                  }}
                  title={t("notebooks.addChild") || "Crear subcuaderno"}
                >
                  <FolderPlus size={16} />
                </button>

                {/* Archive button */}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleArchiveNotebook}
                  title={t("common.archive") || "Archivar"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Create Child Notebook inline form */}
            {isCreatingChild && (
              <div className="glass-form" style={{ padding: 12, borderRadius: 8, background: "var(--bg-main)", maxWidth: 320 }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6 }}>
                  {t("notebooks.newChildName") || "Nuevo Subcuaderno"}
                </div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Title..."
                  style={{ marginBottom: 8 }}
                />
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setIsCreatingChild(false)}
                  >
                    <X size={12} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleCreateNotebook(selectedNotebook.notebookId)}
                    disabled={!newTitle.trim()}
                  >
                    <Check size={12} />
                  </button>
                </div>
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>{t("notebooks.items") || "Elementos vinculados"}</h4>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setIsAddingItem(true);
                    setSelectedItemId("");
                  }}
                >
                  <Plus size={14} style={{ marginRight: 4 }} /> {t("notebooks.addItem") || "Añadir elemento"}
                </button>
              </div>

              {/* Add Item Panel */}
              {isAddingItem && (
                <div className="glass-panel" style={{ padding: 16, borderRadius: 8, background: "var(--bg-main)", marginBottom: 16 }}>
                  <h5 style={{ margin: "0 0 12px" }}>{t("notebooks.selectResource") || "Vincular recurso de campaña"}</h5>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>
                        {t("notebooks.resourceType") || "Tipo de recurso"}
                      </label>
                      <select
                        className="form-control"
                        value={selectedItemType}
                        onChange={(e) => {
                          setSelectedItemType(e.target.value);
                          setSelectedItemId("");
                        }}
                      >
                        <option value="entity">{t("notebooks.type.entity") || "Entidad"}</option>
                        <option value="session">{t("notebooks.type.session") || "Sesión"}</option>
                        <option value="canvas">{t("notebooks.type.canvas") || "Canvas"}</option>
                      </select>
                    </div>

                    <div style={{ flex: 2 }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>
                        {t("notebooks.resourceSelect") || "Seleccionar..."}
                      </label>
                      <select
                        className="form-control"
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        disabled={candidates.length === 0}
                      >
                        <option value="">-- {t("common.select") || "Seleccionar"} --</option>
                        {candidates.map((c: any) => (
                          <option key={c.entityId || c.sessionId || c.canvasId} value={c.entityId || c.sessionId || c.canvasId}>
                            {c.title} {c.entityType ? `(${c.entityType})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setIsAddingItem(false)}
                    >
                      {t("common.cancel") || "Cancelar"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={handleAddItem}
                      disabled={!selectedItemId}
                    >
                      {t("common.add") || "Vincular"}
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              {selectedNotebookItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                  <Link size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    {t("notebooks.emptyItems") || "No hay elementos en este cuaderno todavía."}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedNotebookItems.map((item, index) => {
                    const details = resolveItemDetails(item.targetType, item.targetId);
                    const ItemIcon = details.icon;

                    return (
                      <div
                        key={item.notebookItemId}
                        className="notebook-item-card glass-panel"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 16px",
                          borderRadius: 8,
                          background: "var(--bg-main)",
                          border: "1px solid var(--border-color)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <ItemIcon size={16} style={{ color: "var(--text-muted)" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: "0.92rem" }}>{details.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{details.subtitle}</div>
                        </div>

                        {/* Reordering and removal controls */}
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-link"
                            disabled={index === 0}
                            onClick={() => handleReorderItems(index, "up")}
                            style={{ padding: 2 }}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-link"
                            disabled={index === selectedNotebookItems.length - 1}
                            onClick={() => handleReorderItems(index, "down")}
                            style={{ padding: 2 }}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger"
                            onClick={() => handleRemoveItem(item.notebookItemId)}
                            style={{ padding: 2, marginLeft: 6 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{
              padding: "48px",
              borderRadius: "12px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              textAlign: "center",
              color: "var(--text-muted)",
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <h3>{t("notebooks.selectPlaceholderTitle") || "Gestionar Cuadernos de Campaña"}</h3>
            <p style={{ maxWidth: 420, margin: "0 auto 16px" }}>
              {t("notebooks.selectPlaceholderDesc") ||
                "Crea cuadernos jerárquicos de hasta 3 niveles de profundidad para organizar tus NPC, sesiones, mapas y tableros en un único lugar lógico."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
