import React, { useEffect, useState } from "react";
import { useCampaignStore } from "../stores/campaignStore.js";
import { ReactFlowProvider } from "reactflow";
import { CampaignCanvasFlow } from "../components/canvas/CampaignCanvasFlow.js";
import { CanvasPalette } from "../components/canvas/CanvasPalette.js";
import { CanvasInspector } from "../components/canvas/CanvasInspector.js";
import { Plus, Layout, Folder } from "lucide-react";
import { EntityDetailModal } from "../components/EntityDetailModal.js";
import { useToast } from "../hooks/useToast.js";
import { useParams } from "@tanstack/react-router";

export function CanvasPage() {
  const { campaignId } = useParams({ from: "/campaigns/$campaignId/canvas" });
  const {
    campaignState,
    canvasesById,
    activeCanvasId,
    createCanvas,
    setActiveCanvasId,
    updateEntity,
    archiveEntity,
    selectCampaign,
    activeCampaignId,
    loading
  } = useCampaignStore();

  const { addToast } = useToast();

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      selectCampaign(campaignId);
    }
  }, [campaignId, activeCampaignId, selectCampaign]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.height = originalHtmlHeight;
    };
  }, []);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardKind, setNewBoardKind] = useState<any>("world");
  
  const [detailEntityId, setDetailEntityId] = useState<string | null>(null);


  const selectedEntityLocal = detailEntityId && campaignState ? campaignState.entities.find((e: any) => e.entityId === detailEntityId) : null;

  const canvases = Object.values(canvasesById || {}).filter(c => !c.archived);
  const activeCanvas = activeCanvasId ? canvasesById[activeCanvasId] : null;

  // Auto-select first canvas if none selected
  useEffect(() => {
    if (!activeCanvasId && canvases.length > 0) {
      setActiveCanvasId(canvases[0].id);
    }
  }, [canvases, activeCanvasId]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    await createCanvas(newBoardTitle, newBoardKind);
    setNewBoardTitle("");
    setIsCreateBoardOpen(false);
  };

  if (loading && canvases.length === 0) {
    return <div className="canvas-loading">Cargando tableros de campaña…</div>;
  }

  return (
    <div className="canvas-page-container">
      {/* Top toolbar */}
      <div className="canvas-header-bar">
        <div className="canvas-selector-group">
          <Folder size={16} className="text-muted" />
          <span className="canvas-selector-label">Tablero:</span>
          <select
            value={activeCanvasId || ""}
            onChange={(e) => {
              setActiveCanvasId(e.target.value || null);
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            className="canvas-select"
          >
            {canvases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.kind === "world" ? "Mundo" : c.kind === "session" ? "Sesión" : c.kind === "mystery" ? "Conspiración" : c.kind === "location" ? "Ubicaciones" : c.kind === "characters" ? "Relaciones" : "Personalizado"})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateBoardOpen(true)}
            className="btn btn-secondary btn-sm btn-icon"
            title="Crear nuevo tablero"
          >
            <Plus size={14} /> Nuevo tablero
          </button>
        </div>

        {activeCanvas && (
          <div className="canvas-board-info">
            <span className="badge badge-primary">{activeCanvas.kind}</span>
            {activeCanvas.description && (
              <span className="canvas-board-desc text-muted">{activeCanvas.description}</span>
            )}
          </div>
        )}
      </div>

      {/* Create Board Modal Overlay */}
      {isCreateBoardOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateBoardOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2>Crear nuevo tablero visual</h2>
            </div>
            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label>Nombre del tablero</label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Ej. Bosque Sombrío, Conspiración del Culto..."
                  className="form-control"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Tipo de Tablero / Plantilla</label>
                <select
                  value={newBoardKind}
                  onChange={(e) => setNewBoardKind(e.target.value as any)}
                  className="form-control"
                >
                  <option value="world">Mapa del Mundo / Estructura General</option>
                  <option value="session">Preparación de Sesión (Escenas, encuentros)</option>
                  <option value="mystery">Mapa de Conspiración (Pistas, sospechosos)</option>
                  <option value="location">Ubicación / Mazmorra (Salas, trampas)</option>
                  <option value="characters">Personajes (Relaciones sociales, familias)</option>
                  <option value="custom">Tablero en blanco personalizado</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateBoardOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear tablero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main workspace */}
      {activeCanvas ? (
        <div className="canvas-layout">
          <CanvasPalette canvasId={activeCanvas.id} />
          
          <div className="canvas-work-area">
            <ReactFlowProvider>
              <CampaignCanvasFlow
                canvasId={activeCanvas.id}
                canvas={activeCanvas}
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                onSelectNode={(nodeId) => {
                  setSelectedNodeId(nodeId);
                  setSelectedEdgeId(null);
                }}
                onSelectEdge={(edgeId) => {
                  setSelectedEdgeId(edgeId);
                  setSelectedNodeId(null);
                }}
                onClearSelection={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                }}
              />
            </ReactFlowProvider>
          </div>

          {(selectedNodeId || selectedEdgeId) && (
            <CanvasInspector
              canvasId={activeCanvas.id}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              onClose={() => {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }}
              onOpenDetail={(entityId) => {
                setDetailEntityId(entityId);
              }}
            />
          )}
        </div>
      ) : (
        <div className="canvas-empty-state">
          <Layout size={48} className="text-muted" />
          <h2>No hay tableros en esta campaña</h2>
          <p>Crea tu primer canvas visual para empezar a estructurar la aventura.</p>
          <button className="btn btn-primary" onClick={() => setIsCreateBoardOpen(true)}>
            <Plus size={16} /> Crear tablero
          </button>
        </div>
      )}

      {/* Full details modal for entities */}
      {selectedEntityLocal && campaignState && (
        <EntityDetailModal
          selectedEntity={selectedEntityLocal}
          campaignState={campaignState}
          onClose={() => {
            setDetailEntityId(null);
          }}
          onEdit={async (entityId, updates) => {
            await updateEntity(entityId, updates);
          }}
          onArchive={async (entityId) => {
            await archiveEntity(entityId);
            setDetailEntityId(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            await updateEntity(entityId, { visibility });
          }}
          addToast={addToast}
        />
      )}
    </div>
  );
}
