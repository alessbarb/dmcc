import React, { useState, useEffect } from "react";
import { useCampaignStore } from "../../stores/campaignStore.js";
import { X, Trash2, ArrowUpRight } from "lucide-react";

export interface CanvasInspectorProps {
  canvasId: string;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onClose: () => void;
  onOpenDetail?: (entityId: string) => void;
  addToast?: (message: string, kind: "success" | "error" | "info" | "warning") => void;
}

export function CanvasInspector({
  canvasId,
  selectedNodeId,
  selectedEdgeId,
  onClose,
  onOpenDetail,
  addToast,
}: CanvasInspectorProps) {
  const {
    campaignState,
    canvasesById,
    updateEntity,
    archiveEntity,
    removeNodeFromCanvas,
    updateCanvasNode,
    updateCanvasEdge,
    removeEdgeFromCanvas,
    updateRelation,
    archiveRelation
  } = useCampaignStore();

  const canvas = canvasesById[canvasId];

  // Selected Node data
  const selectedNode = selectedNodeId ? canvas?.nodes?.find((n: any) => n.id === selectedNodeId) : null;
  const entity = selectedNode?.entityId ? campaignState?.entities?.find((e: any) => e.entityId === selectedNode.entityId) : null;

  // Selected Edge data
  const selectedEdge = selectedEdgeId ? canvas?.edges?.find((e: any) => e.id === selectedEdgeId) : null;
  const relation = selectedEdge?.relationshipId ? campaignState?.relations?.find((r: any) => r.relationId === selectedEdge.relationshipId) : null;

  // Local form state for selected Node (Entity or Note)
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [noteText, setNoteText] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Local form state for selected Edge
  const [edgeLabel, setEdgeLabel] = useState("");
  const [edgeDesc, setEdgeDesc] = useState("");

  // Sync node data
  useEffect(() => {
    if (selectedNode) {
      if (selectedNode.kind === "entity" && entity) {
        setTitle(entity.title || "");
        setSubtitle(entity.subtitle || "");
        setSummary(entity.summary || "");
        setContent(entity.content || "");
        setImageUrl((entity.metadata?.imageUrl as string) || "");
      } else if (selectedNode.kind === "note") {
        setNoteText(selectedNode.text || "");
        setTitle(selectedNode.title || "");
      } else if (selectedNode.kind === "group") {
        setTitle(selectedNode.title || "");
      }
    }
  }, [selectedNodeId, selectedNode, entity]);

  // Sync edge data
  useEffect(() => {
    if (selectedEdge) {
      setEdgeLabel(selectedEdge.label || "");
      setEdgeDesc(relation?.description || selectedEdge.description || "");
    }
  }, [selectedEdgeId, selectedEdge, relation]);

  // Save Node handlers
  const handleNodeTitleBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && title !== entity.title) {
      await updateEntity(entity.entityId, { title });
    } else if (selectedNode?.kind === "note" && title !== selectedNode.title) {
      await updateCanvasNode(canvasId, selectedNode.id, { title });
    } else if (selectedNode?.kind === "group" && title !== selectedNode.title) {
      await updateCanvasNode(canvasId, selectedNode.id, { title });
    }
  };

  const handleNodeSubtitleBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && subtitle !== entity.subtitle) {
      await updateEntity(entity.entityId, { subtitle });
    }
  };

  const handleNodeSummaryBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && summary !== entity.summary) {
      await updateEntity(entity.entityId, { summary });
    }
  };

  const handleNodeContentBlur = async () => {
    if (selectedNode?.kind === "entity" && entity && content !== entity.content) {
      await updateEntity(entity.entityId, { content });
    }
  };

  const handleImageUrlBlur = async () => {
    if (selectedNode?.kind === "entity" && entity) {
      const trimmed = imageUrl.trim();
      const current = (entity.metadata?.imageUrl as string) || "";
      if (trimmed !== current) {
        await updateEntity(entity.entityId, {
          metadata: { ...entity.metadata, imageUrl: trimmed || undefined },
        });
      }
    }
  };

  const handleNoteTextBlur = async () => {
    if (selectedNode?.kind === "note" && noteText !== selectedNode.text) {
      await updateCanvasNode(canvasId, selectedNode.id, { text: noteText });
    }
  };

  const handleNodeSelectChange = async (field: string, value: any) => {
    if (selectedNode?.kind === "entity" && entity) {
      if (field === "visibility") {
        await updateEntity(entity.entityId, { visibility: { kind: value } });
      } else if (field === "importance") {
        await updateEntity(entity.entityId, { importance: value });
      } else if (field === "status") {
        await updateEntity(entity.entityId, { status: value });
      }
    } else if (selectedNode?.kind === "note" || selectedNode?.kind === "group") {
      if (field === "color") {
        await updateCanvasNode(canvasId, selectedNode.id, { color: value });
      }
    }
  };

  // Save Edge handlers
  const handleEdgeLabelBlur = async () => {
    if (selectedEdge && edgeLabel !== selectedEdge.label) {
      await updateCanvasEdge(canvasId, selectedEdge.id, { label: edgeLabel });
    }
  };

  const handleEdgeDescBlur = async () => {
    if (selectedEdge) {
      if (relation) {
        await updateRelation(relation.relationId, { description: edgeDesc });
      } else {
        await updateCanvasEdge(canvasId, selectedEdge.id, { description: edgeDesc });
      }
    }
  };

  const handleEdgeSelectChange = async (field: string, value: any) => {
    if (selectedEdge) {
      if (field === "style") {
        await updateCanvasEdge(canvasId, selectedEdge.id, { style: value });
      } else if (field === "visibility" && relation) {
        await updateRelation(relation.relationId, { visibility: { kind: value } });
      }
    }
  };

  const handleArchiveEntity = async () => {
    if (entity && window.confirm(`¿Estás seguro de que quieres archivar la entidad "${entity.title}" de toda la campaña?`)) {
      // 1. Remove from canvas first
      await removeNodeFromCanvas(canvasId, selectedNodeId!);
      // 2. Archive campaign entity
      await archiveEntity(entity.entityId);
      onClose();
    }
  };

  const handleRemoveNode = async () => {
    if (window.confirm("¿Quitar esta tarjeta del canvas? (La entidad seguirá existiendo en el lore de la campaña)")) {
      const entityId = entity?.entityId;
      const entityTitle = entity?.title;
      await removeNodeFromCanvas(canvasId, selectedNodeId!);
      onClose();

      if (entityId && addToast) {
        const { canvasesById: updatedCanvases } = useCampaignStore.getState();
        const isOnAnyCanvas = Object.values(updatedCanvases).some(
          (c: any) => !c.archived && c.nodes?.some((n: any) => n.entityId === entityId)
        );
        if (!isOnAnyCanvas) {
          addToast(
            `"${entityTitle}" existe en el lore pero no está en ningún tablero visual.`,
            "warning"
          );
        }
      }
    }
  };

  const handleRemoveEdge = async () => {
    if (window.confirm("¿Quitar esta conexión del canvas? (La relación seguirá existiendo en el lore de la campaña)")) {
      const relationshipId = selectedEdge?.relationshipId;
      const edgeLabel = selectedEdge?.label;
      await removeEdgeFromCanvas(canvasId, selectedEdgeId!);
      onClose();

      if (relationshipId && addToast) {
        const { canvasesById: updatedCanvases } = useCampaignStore.getState();
        const isInAnyCanvas = Object.values(updatedCanvases).some(
          (c: any) => !c.archived && c.edges?.some((e: any) => e.relationshipId === relationshipId)
        );
        if (!isInAnyCanvas) {
          addToast(
            `La relación "${edgeLabel}" existe en el lore pero no está en ningún tablero visual.`,
            "warning"
          );
        }
      }
    }
  };

  const handleArchiveRelation = async () => {
    if (selectedEdge?.relationshipId && window.confirm("¿Archivar esta relación del lore de la campaña permanentemente?")) {
      await archiveRelation(selectedEdge.relationshipId);
      await removeEdgeFromCanvas(canvasId, selectedEdgeId!);
      onClose();
    }
  };

  const triggerOpenDetail = () => {
    if (entity && onOpenDetail) {
      onOpenDetail(entity.entityId);
    } else if (entity) {
      // Fallback: search for page details triggers or use store modals
      useCampaignStore.setState({ isEntityModalOpen: false }); // close creation
      // Actually we will trigger dispatch event or open detail modal using Zustand triggers if added,
      // but the callback prop is the primary way
    }
  };

  return (
    <div className="canvas-inspector">
      <div className="inspector-header">
        <h2>Detalle del elemento</h2>
        <button onClick={onClose} className="inspector-close-btn">
          <X size={16} />
        </button>
      </div>

      <div className="inspector-content">
        {selectedNode && (
          <div className="inspector-node-details">
            {/* Note Node Info */}
            {selectedNode.kind === "note" && (
              <>
                <div className="inspector-badge-row">
                  <span className="badge badge-secondary">Nota rápida</span>
                </div>

                <div className="form-group">
                  <label>Título de la nota (opcional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleNodeTitleBlur}
                    placeholder="Título rápido..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Contenido</label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onBlur={handleNoteTextBlur}
                    rows={8}
                    className="form-textarea font-mono note-inspector-textarea"
                    placeholder="Escribe tu nota adhesiva..."
                  />
                </div>

                <div className="form-group">
                  <label>Color de fondo</label>
                  <select
                    value={selectedNode.color || "yellow"}
                    onChange={(e) => handleNodeSelectChange("color", e.target.value)}
                    className="form-select"
                  >
                    <option value="yellow">Amarillo cálido</option>
                    <option value="blue">Azul claro</option>
                    <option value="green">Verde suave</option>
                    <option value="pink">Rosa pastel</option>
                    <option value="purple">Lila / Lavanda</option>
                  </select>
                </div>

                <div className="inspector-actions">
                  <button
                    onClick={handleRemoveNode}
                    className="btn btn-secondary btn-sm text-critical btn-block"
                  >
                    <Trash2 size={14} /> Eliminar nota
                  </button>
                </div>
              </>
            )}

            {/* Group Node Info */}
            {selectedNode.kind === "group" && (
              <>
                <div className="inspector-badge-row">
                  <span className="badge badge-secondary">Grupo visual</span>
                </div>

                <div className="form-group">
                  <label>Nombre del grupo</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleNodeTitleBlur}
                    placeholder="Título del grupo..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Color del marco</label>
                  <select
                    value={selectedNode.color || "purple"}
                    onChange={(e) => handleNodeSelectChange("color", e.target.value)}
                    className="form-select"
                  >
                    <option value="purple">Lila</option>
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                    <option value="yellow">Amarillo</option>
                    <option value="pink">Rosa</option>
                  </select>
                </div>

                <div className="inspector-actions">
                  <button
                    onClick={handleRemoveNode}
                    className="btn btn-secondary btn-sm text-critical btn-block"
                  >
                    <Trash2 size={14} /> Eliminar grupo
                  </button>
                </div>
              </>
            )}

            {/* Entity Node Info */}
            {selectedNode.kind === "entity" && entity && (
              <>
                <div className="inspector-badge-row">
                  <span className="badge badge-primary">{entity.entityType.toUpperCase()}</span>
                  {entity.importance === "critical" && (
                    <span className="badge badge-warning">CRÍTICO 🔍</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleNodeTitleBlur}
                    className="form-input font-bold"
                  />
                </div>

                <div className="form-group">
                  <label>Subtítulo / Rol corto</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    onBlur={handleNodeSubtitleBlur}
                    className="form-input"
                    placeholder="Ej. Líder tribal, Cueva inundada..."
                  />
                </div>

                <div className="form-group">
                  <label>Imagen / Retrato (URL)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onBlur={handleImageUrlBlur}
                    className="form-input"
                    placeholder="https://… o ruta local /assets/…"
                  />
                  {imageUrl && (
                    <div className="inspector-image-preview">
                      <img src={imageUrl} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Resumen / Lore público</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    onBlur={handleNodeSummaryBlur}
                    rows={4}
                    className="form-textarea"
                    placeholder="Lore general conocido..."
                  />
                </div>

                <div className="form-group">
                  <label>Notas del DM (Secretos / Preparación)</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleNodeContentBlur}
                    rows={6}
                    className="form-textarea inspector-dm-notes"
                    placeholder="Añade secretos, mecánicas de combate, recompensas..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group col">
                    <label>Visibilidad</label>
                    <select
                      value={entity.visibility?.kind || "dm_only"}
                      onChange={(e) => handleNodeSelectChange("visibility", e.target.value)}
                      className="form-select"
                    >
                      <option value="dm_only">Solo DM (Oculto)</option>
                      <option value="public">Público (Revelado)</option>
                    </select>
                  </div>
                  <div className="form-group col">
                    <label>Importancia</label>
                    <select
                      value={entity.importance || "normal"}
                      onChange={(e) => handleNodeSelectChange("importance", e.target.value)}
                      className="form-select"
                    >
                      <option value="low">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Estado Narrativo</label>
                  <select
                    value={entity.status || "ready"}
                    onChange={(e) => handleNodeSelectChange("status", e.target.value)}
                    className="form-select"
                  >
                    <option value="ready">Disponible / Activo</option>
                    <option value="blocked">Bloqueado / Pendiente</option>
                    <option value="resolved">Resuelto / Completado</option>
                    <option value="archived">Archivado / Muerto</option>
                  </select>
                </div>

                <div className="inspector-actions">
                  {onOpenDetail && (
                    <button
                      onClick={triggerOpenDetail}
                      className="btn btn-primary btn-sm btn-block"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      Editar Ficha Completa <ArrowUpRight size={14} />
                    </button>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleRemoveNode}
                      className="btn btn-secondary btn-sm text-warning"
                      style={{ flex: 1 }}
                      title="Quita la tarjeta del canvas sin borrar la entidad de la campaña"
                    >
                      Quitar del canvas
                    </button>
                    <button
                      onClick={handleArchiveEntity}
                      className="btn btn-secondary btn-sm text-critical"
                      style={{ flex: 1 }}
                      title="Archiva la entidad de forma permanente en la campaña"
                    >
                      Archivar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {selectedEdge && (
          <div className="inspector-edge-details">
            <div className="inspector-badge-row">
              <span className="badge badge-secondary">
                {selectedEdge.status === "domain" ? "Relación Lore" : "Conexión Visual"}
              </span>
            </div>

            <div className="form-group">
              <label>Etiqueta / Relación</label>
              <input
                type="text"
                value={edgeLabel}
                onChange={(e) => setEdgeLabel(e.target.value)}
                onBlur={handleEdgeLabelBlur}
                className="form-input font-bold"
                placeholder="Ej. vive en, odia a, apunta a..."
              />
            </div>

            <div className="form-group">
              <label>Estilo de línea</label>
              <select
                value={selectedEdge.style || "solid"}
                onChange={(e) => handleEdgeSelectChange("style", e.target.value)}
                className="form-select"
              >
                <option value="solid">Línea sólida (normal)</option>
                <option value="dashed">Línea discontinua (débil/borrador)</option>
                <option value="secret">Línea de secreto (roja/discontinua)</option>
                <option value="strong">Línea gruesa (fuerte)</option>
                <option value="weak">Línea fina (tenue)</option>
              </select>
            </div>

            {selectedEdge.status === "domain" && relation && (
              <>
                <div className="form-group">
                  <label>Descripción detallada</label>
                  <input
                    type="text"
                    value={edgeDesc}
                    onChange={(e) => setEdgeDesc(e.target.value)}
                    onBlur={handleEdgeDescBlur}
                    className="form-input"
                    placeholder="Detalles sobre esta relación social o lógica..."
                  />
                </div>

                <div className="form-group">
                  <label>Visibilidad de la relación</label>
                  <select
                    value={relation.visibility?.kind || "dm_only"}
                    onChange={(e) => handleEdgeSelectChange("visibility", e.target.value)}
                    className="form-select"
                  >
                    <option value="dm_only">Solo DM (Oculto)</option>
                    <option value="public">Público (Revelado)</option>
                  </select>
                </div>
              </>
            )}

            <div className="inspector-actions">
              <button
                onClick={handleRemoveEdge}
                className="btn btn-secondary btn-sm text-warning btn-block"
              >
                <Trash2 size={14} /> Quitar del canvas
              </button>
              {selectedEdge?.relationshipId && (
                <button
                  onClick={handleArchiveRelation}
                  className="btn btn-secondary btn-sm text-critical btn-block"
                  title="Elimina esta relación del lore de la campaña permanentemente"
                >
                  <Trash2 size={14} /> Archivar relación del lore
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
