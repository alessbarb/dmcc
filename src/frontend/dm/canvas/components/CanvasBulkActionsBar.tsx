import type { Dispatch, SetStateAction } from "react";
import type { Canvas, CanvasNode } from "@core/domain/canvas/types.js";
import type { Edge } from "@xyflow/react";
import type { CanvasFlowNode } from "../components/CampaignCanvasFlow.js";
import { useCanvasHistoryStore } from "../../../shared/stores/canvasHistoryStore.js";
import type { Entity } from "../../../shared/stores/campaignStore.js";

interface CanvasBulkActionsBarProps {
  activeCanvas: Canvas;
  selectedNodes: CanvasFlowNode[];
  bulkGroupId: string;
  setBulkGroupId: Dispatch<SetStateAction<string>>;
  bulkConfirm: "reveal" | "hide" | "remove" | null;
  setBulkConfirm: Dispatch<SetStateAction<"reveal" | "hide" | "remove" | null>>;
  setSelectedNodes: Dispatch<SetStateAction<CanvasFlowNode[]>>;
  setSelectedEdges: Dispatch<SetStateAction<Edge[]>>;
  setIsSessionPrepOpen: Dispatch<SetStateAction<boolean>>;
  updateCanvasNodesLayout: (canvasId: string, updates: Array<{ nodeId: string; x: number; y: number; groupId?: string | null; parentId?: string | null }>) => Promise<unknown>;
  updateEntity: (entityId: string, updates: Partial<Entity>) => Promise<unknown>;
  removeNodeFromCanvas: (canvasId: string, nodeId: string) => Promise<unknown>;
  runCanvasPageAction: (operation: Promise<unknown>, errorMessage: string) => void;
  addToast: (message: string, kind?: "success" | "error" | "info" | "warning") => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function CanvasBulkActionsBar({
  activeCanvas,
  selectedNodes,
  bulkGroupId,
  setBulkGroupId,
  bulkConfirm,
  setBulkConfirm,
  setSelectedNodes,
  setSelectedEdges,
  setIsSessionPrepOpen,
  updateCanvasNodesLayout,
  updateEntity,
  removeNodeFromCanvas,
  runCanvasPageAction,
  addToast,
  t,
}: CanvasBulkActionsBarProps) {
  return (
<div className="canvas-multiselect-bar">
  <span className="canvas-multiselect-text">
    <strong>{selectedNodes.length}</strong> elementos seleccionados
  </span>
  <div className="canvas-multiselect-actions">
    {/* Assign group to all selected nodes */}
    {(() => {
      const groups = activeCanvas?.nodes?.filter((n: CanvasNode) => n.kind === "group") ?? [];
      if (groups.length === 0) return null;
      return (
        <select
          className="form-select canvas-multiselect-group-select"
          value={bulkGroupId}
          onChange={(e) => {
            const gid = (e.target.value && e.target.value !== "__none__") ? e.target.value : null;
            setBulkGroupId(e.target.value);
            const updates = selectedNodes.map((n) => ({
              nodeId: n.id,
              x: Math.round(n.position?.x ?? 0),
              y: Math.round(n.position?.y ?? 0),
              groupId: gid,
              parentId: null,
            }));

            // Push history entry for group assignment
            const beforeLayout = selectedNodes.map((n) => {
              const originalNode = activeCanvas.nodes.find(sn => sn.id === n.id)!;
              return {
                nodeId: n.id,
                x: Math.round(n.position?.x ?? 0),
                y: Math.round(n.position?.y ?? 0),
                width: originalNode.width,
                height: originalNode.height,
                groupId: originalNode.groupId ?? originalNode.parentId ?? null,
                parentId: originalNode.parentId ?? null,
              };
            });
            const afterLayout = updates.map((u) => {
              const originalNode = activeCanvas.nodes.find(sn => sn.id === u.nodeId)!;
              return {
                nodeId: u.nodeId,
                x: u.x,
                y: u.y,
                width: originalNode.width,
                height: originalNode.height,
                groupId: u.groupId,
                parentId: u.parentId,
              };
            });
            useCanvasHistoryStore.getState().pushEntry(activeCanvas.id, {
              kind: "group-assignment",
              label: gid ? `Asignar a grupo` : "Quitar del grupo",
              before: beforeLayout,
              after: afterLayout,
            });

            runCanvasPageAction(updateCanvasNodesLayout(activeCanvas.id, updates).then(() => {
              addToast(`${selectedNodes.length} nodos asignados al grupo.`, "success");
              setBulkGroupId("");
            }), "No se pudo asignar el grupo a los nodos seleccionados.");
          }}
        >
          <option value="">📁 Asignar grupo...</option>
          <option value="__none__">Sin grupo</option>
          {groups.map((g: CanvasNode) => (
            <option key={g.id} value={g.id}>{g.title || "Grupo"}</option>
          ))}
        </select>
      );
    })()}
    <button
      onClick={() => setIsSessionPrepOpen(true)}
      className="btn btn-primary btn-sm"
      title={t("canvas.toolbar.prepareSession")}
    >
      {t("sessionPage.prepareSessionSelectionButton")}
    </button>
    <button
      onClick={() => {
        const entities = selectedNodes.filter(n => n.type === 'entity');
        if (entities.length === 0) return;
        if (bulkConfirm !== "reveal") { setBulkConfirm("reveal"); return; }
        setBulkConfirm(null);
        runCanvasPageAction((async () => {
          for (const node of entities) {
            if (node.data.entityId) {
              await updateEntity(node.data.entityId, { visibility: { kind: 'public' } });
            }
          }
          addToast(`Se han revelado ${entities.length} entidades.`, "success");
        })(), "No se pudieron revelar las entidades seleccionadas.");
      }}
      onBlur={() => setBulkConfirm(prev => prev === "reveal" ? null : prev)}
      className={`btn btn-sm ${bulkConfirm === "reveal" ? "btn-warning" : "btn-secondary"}`}
      disabled={selectedNodes.filter(n => n.type === 'entity').length === 0}
    >
      {bulkConfirm === "reveal" ? t("canvas.toolbar.bulkConfirm") : t("canvas.toolbar.bulkReveal")}
    </button>
    <button
      onClick={() => {
        const entities = selectedNodes.filter(n => n.type === 'entity');
        if (entities.length === 0) return;
        if (bulkConfirm !== "hide") { setBulkConfirm("hide"); return; }
        setBulkConfirm(null);
        runCanvasPageAction((async () => {
          for (const node of entities) {
            if (node.data.entityId) {
              await updateEntity(node.data.entityId, { visibility: { kind: 'dm_only' } });
            }
          }
          addToast(`Se han marcado como secretas ${entities.length} entidades.`, "success");
        })(), "No se pudieron ocultar las entidades seleccionadas.");
      }}
      onBlur={() => setBulkConfirm(prev => prev === "hide" ? null : prev)}
      className={`btn btn-sm ${bulkConfirm === "hide" ? "btn-warning" : "btn-secondary"}`}
      disabled={selectedNodes.filter(n => n.type === 'entity').length === 0}
    >
      {bulkConfirm === "hide" ? t("canvas.toolbar.bulkConfirm") : t("canvas.toolbar.bulkHide")}
    </button>
    <button
      onClick={() => {
        if (bulkConfirm !== "remove") { setBulkConfirm("remove"); return; }
        setBulkConfirm(null);
        runCanvasPageAction((async () => {
          for (const node of selectedNodes) {
            await removeNodeFromCanvas(activeCanvas.id, node.id);
          }
          setSelectedNodes([]);
          setSelectedEdges([]);
          addToast(`Se han quitado ${selectedNodes.length} nodos del canvas.`, "info");
        })(), "No se pudieron quitar los nodos seleccionados del canvas.");
      }}
      onBlur={() => setBulkConfirm(prev => prev === "remove" ? null : prev)}
      className={`btn btn-sm ${bulkConfirm === "remove" ? "btn-danger" : "btn-secondary text-warning"}`}
    >
      {bulkConfirm === "remove" ? t("canvas.toolbar.bulkConfirm") : t("canvas.toolbar.bulkRemove")}
    </button>
  </div>
</div>
  );
}
