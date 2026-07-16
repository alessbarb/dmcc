import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { ReactFlowProvider } from "@xyflow/react";
import type { Edge } from "@xyflow/react";
import { CampaignCanvasFlow } from "../components/CampaignCanvasFlow.js";
import type { CampaignCanvasFlowHandle, CanvasDeviceMode, CanvasFlowNode } from "../components/CampaignCanvasFlow.js";
import { CanvasNavigatorPanel } from "../components/CanvasNavigatorPanel.js";
import { CanvasPalette } from "../components/CanvasPalette.js";
import { CanvasInspector } from "../components/CanvasInspector.js";
import { SessionPrepForm } from "../components/SessionPrepForm.js";
import { CanvasBoardDialogs } from "../components/CanvasBoardDialogs.js";
import { MysteryHealthPanel } from "../components/MysteryHealthPanel.js";
import { Plus, Layout, Folder, Eye, EyeOff, Zap, Play, X, Shield, Search, ListPlus, MoreHorizontal, MousePointer2, Hand, StickyNote, Frame, Maximize2, ZoomIn, ZoomOut, SlidersHorizontal, CalendarDays } from "lucide-react";
import type { InteractionMode } from "../components/CanvasToolbar.js";
import { EntityDetailModal } from "../../entities/EntityDetailModal.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { ToastContainer } from "../../../shared/components/ToastContainer.js";
import { useCanvasHistoryStore } from "../../../shared/stores/canvasHistoryStore.js";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import type { Canvas, CanvasNode, CanvasEdge } from "@core/domain/canvas/types.js";
import type { Entity, Relation, Session } from "../../../shared/stores/campaignStore.js";

import { getCanvasTemplate } from "../templates/index.js";
import { applyCanvasTemplate } from "../services/applyCanvasTemplate.js";
import { parseAndImportText } from "../services/importCanvasText.js";
import { runNarrativeLint } from "../services/canvasNarrativeLint.js";

type CanvasDensity = "compact" | "normal" | "detailed";
type CanvasMobilePanel = "search" | "add" | "detail" | "more" | null;

const CANVAS_DENSITY_STORAGE_KEY = "dmcc.canvas.density";
const DEFAULT_CANVAS_DENSITY: CanvasDensity = "normal";

const isCanvasDensity = (value: string | null): value is CanvasDensity =>
  value === "compact" || value === "normal" || value === "detailed";

type RelationsFilter = "all" | "public" | "secret" | "selection";
const isRelationsFilter = (value: string): value is RelationsFilter =>
  value === "all" || value === "public" || value === "secret" || value === "selection";

const getStoredCanvasDensity = (): CanvasDensity => {
  if (typeof window === "undefined") return DEFAULT_CANVAS_DENSITY;

  try {
    const storedDensity = window.localStorage.getItem(CANVAS_DENSITY_STORAGE_KEY);
    return isCanvasDensity(storedDensity) ? storedDensity : DEFAULT_CANVAS_DENSITY;
  } catch (error) {
    console.warn("Unable to read canvas density preference from localStorage", error);
    return DEFAULT_CANVAS_DENSITY;
  }
};

const storeCanvasDensity = (density: CanvasDensity) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CANVAS_DENSITY_STORAGE_KEY, density);
  } catch (error) {
    console.warn("Unable to persist canvas density preference to localStorage", error);
  }
};

const getCanvasDeviceMode = (): CanvasDeviceMode => {
  if (typeof window === "undefined") return "wide-screen";
  if (window.matchMedia("(max-width: 767px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1024px)").matches) return "tablet";
  return "wide-screen";
};

const seedCanvasTemplate = async (canvasId: string, templateId: string, t: (key: string, params?: Record<string, string | number>) => string) => {
  const template = getCanvasTemplate(templateId, t);
  if (!template) return;

  const store = useCampaignStore.getState();
  await applyCanvasTemplate(canvasId, template, {
    createEntity: store.createEntity,
    createRelation: store.createRelation,
    addEdgeToCanvas: store.addEdgeToCanvas,
    placeNodeOnCanvas: store.placeNodeOnCanvas,
    updateCanvasNode: store.updateCanvasNode,
    createFact: store.createFact,
    getCanvasNodes: (targetCanvasId) => useCampaignStore.getState().canvasesById[targetCanvasId]?.nodes ?? [],
  });
};


const getCanvasKindLabel = (kind: string, t: (key: string) => string) => {
  switch (kind) {
    case "world":
      return "Mundo";
    case "session":
      return t("canvas.node.typeSession");
    case "mystery":
      return t("canvas.page.templateConspiration");
    case "location":
      return t("canvas.node.typeLocation") || "Ubicación";
    case "characters":
      return t("canvas.page.templateRelations");
    default:
      return kind.charAt(0).toUpperCase() + kind.slice(1);
  }
};

export function CanvasPage() {
  const canvasFlowRef = useRef<CampaignCanvasFlowHandle>(null);
  const { t } = useTranslation();
  const { campaignId } = useParams({ from: "/campaigns/$campaignId/map/canvas" });
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
    loading,
    removeNodeFromCanvas,
    updateCanvasNodesLayout,
    createPreparedSession,
    updateSessionPrep,
    recordSessionEvent,
    placeNodeOnCanvas,
  } = useCampaignStore();

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      useCanvasHistoryStore.getState().clearAllHistories();
      void selectCampaign(campaignId).catch((error: unknown) => {
        console.error("No se pudo cargar la campaña para el canvas.", error);
        addToast("No se pudo cargar la campaña para el canvas.", "error");
      });
    }
  }, [campaignId, activeCampaignId, selectCampaign, addToast]);

  // Deep link support (e.g. from Atajos): /map/canvas?canvasId=... selects
  // that canvas instead of leaving the generic section on whatever was active.
  useEffect(() => {
    if (Object.keys(canvasesById).length === 0) return;
    const parameters = new URLSearchParams(window.location.search);
    const canvasId = parameters.get("canvasId");
    if (!canvasId || !canvasesById[canvasId]) return;
    setActiveCanvasId(canvasId);
    window.history.replaceState(null, "", window.location.pathname);
  }, [canvasesById, setActiveCanvasId]);

  const handleUndo = useCallback(async () => {
    if (!activeCanvasId) return;
    const res = await useCanvasHistoryStore.getState().undo(activeCanvasId);
    if (res.success && res.entry) {
      addToast(`Deshecho: ${res.entry.label}`, "info");
    } else if (res.error === "conflict") {
      addToast("No se puede deshacer esta acción porque algunas tarjetas cambiaron después.", "error");
    }
  }, [activeCanvasId, addToast]);

  const handleRedo = useCallback(async () => {
    if (!activeCanvasId) return;
    const res = await useCanvasHistoryStore.getState().redo(activeCanvasId);
    if (res.success && res.entry) {
      addToast(`Rehecho: ${res.entry.label}`, "info");
    } else if (res.error === "conflict") {
      addToast("No se puede rehacer esta acción porque algunas tarjetas cambiaron después.", "error");
    }
  }, [activeCanvasId, addToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      if (isMod && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "z") {
          e.preventDefault();
          if (isShift) {
            void handleRedo();
          } else {
            void handleUndo();
          }
        } else if (key === "y") {
          e.preventDefault();
          void handleRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardKind, setNewBoardKind] = useState<Canvas["kind"]>("world");
  
  const [detailEntityId, setDetailEntityId] = useState<string | null>(null);

  const [interactionMode, setInteractionMode] = useState<InteractionMode>("select");
  const [isLocked, setIsLocked] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [publicOnly, setPublicOnly] = useState(false);

  // Toggles for Phase 2 & Second Wave
  const [isDirectionMode, setIsDirectionMode] = useState(false);
  const [isPlayerView, setIsPlayerView] = useState(false);
  const [tablePrivacy, setTablePrivacy] = useState(false);
  const [mysteryFlowMode, setMysteryFlowMode] = useState(false);
  const [isFullscreenPresentation, setIsFullscreenPresentation] = useState(false);
  const [newBoardTemplate, setNewBoardTemplate] = useState("custom");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [isLintOpen, setIsLintOpen] = useState(false);
  const [density, setDensity] = useState<CanvasDensity>(getStoredCanvasDensity);
  const [relationsFilter, setRelationsFilter] = useState<RelationsFilter>("all");
  const [mobilePanel, setMobilePanel] = useState<CanvasMobilePanel>(null);
  const [deviceMode, setDeviceMode] = useState<CanvasDeviceMode>(getCanvasDeviceMode);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const tabletQuery = window.matchMedia("(max-width: 1024px)");
    const updateDeviceMode = () => setDeviceMode(getCanvasDeviceMode());

    updateDeviceMode();
    mobileQuery.addEventListener("change", updateDeviceMode);
    tabletQuery.addEventListener("change", updateDeviceMode);

    return () => {
      mobileQuery.removeEventListener("change", updateDeviceMode);
      tabletQuery.removeEventListener("change", updateDeviceMode);
    };
  }, []);

  useEffect(() => {
    storeCanvasDensity(density);
  }, [density]);

  useEffect(() => {
    if (isPlayerView) {
      setMobilePanel(null);
    }
  }, [isPlayerView]);

  const focusCanvasNode = (nodeId: string) => {
    const focused = canvasFlowRef.current?.focusNode(nodeId, { zoom: 1.2, duration: 350 }) ?? false;
    if (focused) {
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
    }
    return focused;
  };

  const focusCanvasEntity = (entityId: string) => {
    const focused = canvasFlowRef.current?.focusEntity(entityId, { zoom: 1.2, duration: 350 }) ?? false;
    if (focused) {
      const nodeId = useCampaignStore.getState().canvasesById[activeCanvasId ?? ""]?.nodes?.find((node: CanvasNode) => node.entityId === entityId)?.id;
      if (nodeId) setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
    }
    return focused;
  };

  const focusCanvasFact = (factId: string) => {
    const focused = canvasFlowRef.current?.focusFact(factId, { zoom: 1.2, duration: 350 }) ?? false;
    if (focused) {
      const nodeId = useCampaignStore.getState().canvasesById[activeCanvasId ?? ""]?.nodes?.find((node: CanvasNode) => node.factId === factId)?.id;
      if (nodeId) setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
    }
    return focused;
  };
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isViewPopoverOpen, setIsViewPopoverOpen] = useState(false);

  // Multi-selection
  const [selectedNodes, setSelectedNodes] = useState<CanvasFlowNode[]>([]);
  const [, setSelectedEdges] = useState<Edge[]>([]);
  const [bulkGroupId, setBulkGroupId] = useState<string>("");
  const [bulkConfirm, setBulkConfirm] = useState<"reveal" | "hide" | "remove" | null>(null);

  const runCanvasPageAction = useCallback((operation: Promise<unknown>, errorMessage: string) => {
    void operation.catch((error: unknown) => {
      console.error(errorMessage, error);
      addToast(errorMessage, "error");
    });
  }, [addToast]);

  const startFullscreenPresentation = () => {
    const elem = document.querySelector<HTMLElement>(".canvas-page-container");
    if (elem?.requestFullscreen) {
      runCanvasPageAction(
        elem.requestFullscreen(),
        "No se pudo activar el modo presentación en pantalla completa.",
      );
    }
    setIsFullscreenPresentation(true);
    setIsPlayerView(true);
    setIsDirectionMode(false);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSelectedNodes([]);
    setSelectedEdges([]);
  };

  const stopFullscreenPresentation = () => {
    if (document.fullscreenElement) {
      runCanvasPageAction(
        document.exitFullscreen(),
        "No se pudo salir del modo presentación en pantalla completa.",
      );
    }
    setIsFullscreenPresentation(false);
  };

  const toggleFullscreenPresentation = () => {
    if (isFullscreenPresentation) {
      stopFullscreenPresentation();
      return;
    }
    startFullscreenPresentation();
  };

  useEffect(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSelectedNodes([]);
    setSelectedEdges([]);
    setBulkGroupId("");
    setTablePrivacy(false);
  }, [campaignId]);

  // Session Prep Dialog
  const [isSessionPrepOpen, setIsSessionPrepOpen] = useState(false);

  const isCurrentCampaignLoaded = activeCampaignId === campaignId && campaignState?.campaign?.campaignId === campaignId;
  const selectedEntityLocal = detailEntityId && isCurrentCampaignLoaded && campaignState
    ? campaignState.entities.find((e: Entity) => e.entityId === detailEntityId)
    : null;
  const canvases = isCurrentCampaignLoaded
    ? Object.values(canvasesById || {}).filter((c: Canvas) => !c.archived)
    : [];
  const activeCanvas = isCurrentCampaignLoaded && activeCanvasId && canvasesById[activeCanvasId] && !canvasesById[activeCanvasId].archived
    ? canvasesById[activeCanvasId]
    : null;
  const activeSession = isCurrentCampaignLoaded ? campaignState?.sessions?.find((s: Session) => s.status === "active") : undefined;
  const preparedSessions = isCurrentCampaignLoaded
    ? (campaignState?.sessions ?? []).filter((session: Session) => session.status === "planned")
    : [];

  // Keep the selected canvas scoped to the current campaign.
  // When switching campaigns, the previous campaign's activeCanvasId may still be in local state
  // until the fresh campaign snapshot arrives. Never keep an id that does not exist in the
  // currently loaded canvas collection.
  useEffect(() => {
    if (canvases.length === 0) {
      if (activeCanvasId) {
        setActiveCanvasId(null);
      }
      return;
    }

    const selectedCanvasBelongsToCurrentCampaign = Boolean(
      activeCanvasId && canvases.some((canvas: Canvas) => canvas.id === activeCanvasId),
    );

    if (!selectedCanvasBelongsToCurrentCampaign) {
      setActiveCanvasId(canvases[0].id);
    }
  }, [canvases, activeCanvasId, setActiveCanvasId]);

  // Seed pending template if campaign was newly created from landing page
  useEffect(() => {
    if (activeCanvasId && campaignId) {
      const pendingTemplate = sessionStorage.getItem("dmcc_pending_seed_template");
      if (pendingTemplate && pendingTemplate !== "custom" && pendingTemplate !== "empty") {
        sessionStorage.removeItem("dmcc_pending_seed_template");
        window.setTimeout(() => {
          addToast(t("canvas.page.initializingTemplate", { name: pendingTemplate }), "info");
          runCanvasPageAction(
            seedCanvasTemplate(activeCanvasId, pendingTemplate, t).then(() => {
              addToast(t("canvas.page.templateInitialized", { name: pendingTemplate === "mystery" ? "Misterio" : "Facciones" }), "success");
            }),
            "No se pudo inicializar la plantilla del canvas.",
          );
        }, 300);
      }
    }
  }, [activeCanvasId, campaignId, addToast, runCanvasPageAction, t]);

  // Fullscreen escape monitor
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreenPresentation(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Alert anchors or orphans
  useEffect(() => {
    if (!campaignState || canvases.length === 0) return;

    const allNodes = canvases.flatMap((c: Canvas) => c.nodes || []);
    const allEdges = canvases.flatMap((c: Canvas) => c.edges || []);

    const orphanEntities = campaignState.entities.filter(
      (entity: Entity) => !entity.archived && !allNodes.some((node: CanvasNode) => node.entityId === entity.entityId)
    );
    const orphanRelations = campaignState.relations.filter(
      (relation: Relation) => !relation.archived && !allEdges.some((edge: CanvasEdge) => edge.relationshipId === relation.relationId)
    );

    if (orphanEntities.length === 0 && orphanRelations.length === 0) return;

    const parts: string[] = [];
    if (orphanEntities.length > 0)
      parts.push(`${orphanEntities.length} entidad${orphanEntities.length > 1 ? "es" : ""}`);
    if (orphanRelations.length > 0)
      parts.push(t("canvas.page.relationCount", { count: orphanRelations.length, suffix: orphanRelations.length > 1 ? "es" : "" }));

    addToast(
      t("canvas.page.notOnBoard", { count: parts.join(" y ") }),
      "warning"
    );
  }, [activeCampaignId]);

  const handleCreateBoard = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    runCanvasPageAction((async () => {
      await createCanvas(newBoardTitle, newBoardKind);

      const createdCanvasId = useCampaignStore.getState().activeCanvasId;
      const campaignId = useCampaignStore.getState().activeCampaignId;

      if (createdCanvasId && campaignId && newBoardTemplate !== "custom") {
        addToast(`Inicializando plantilla: ${newBoardTemplate}...`, "info");
        await seedCanvasTemplate(createdCanvasId, newBoardTemplate, t);
        addToast(t("canvas.page.boardInitialized", { name: newBoardTemplate }), "success");
      }

      setNewBoardTitle("");
      setNewBoardTemplate("custom");
      setIsCreateBoardOpen(false);
    })(), "No se pudo crear el tablero visual.");
  };

  const handleExport = async (format: "svg" | "png", viewMode: "dm" | "player") => {
    const originalPlayerView = isPlayerView;
    const originalDirectionMode = isDirectionMode;
    const originalMysteryFlowMode = mysteryFlowMode;

    if (viewMode === "player") {
      setIsPlayerView(true);
      setIsDirectionMode(false);
      setMysteryFlowMode(false);
    }
    
    // Wait for state propagate & React Flow DOM updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    const svgElement = document.querySelector('.react-flow__renderer svg') || document.querySelector('.react-flow svg');
    if (!svgElement) {
      addToast("No se pudo encontrar el lienzo del canvas para exportar.", "error");
      setIsPlayerView(originalPlayerView);
      setIsDirectionMode(originalDirectionMode);
      setMysteryFlowMode(originalMysteryFlowMode);
      return;
    }

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      
      if (format === "svg") {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeCanvas?.title || 'canvas'}-${viewMode}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        addToast(`Canvas (${viewMode.toUpperCase()}) exportado como SVG vectorial.`, "success");
      } else {
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          const canvasObj = document.createElement('canvas');
          const bbox = svgElement.getBoundingClientRect();
          const scale = 2;
          
          canvasObj.width = bbox.width * scale;
          canvasObj.height = bbox.height * scale;
          
          const ctx = canvasObj.getContext('2d');
          if (ctx) {
            ctx.fillStyle = "hsl(230, 28%, 10%)";
            ctx.fillRect(0, 0, canvasObj.width, canvasObj.height);
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            
            canvasObj.toBlob((pngBlob) => {
              if (pngBlob) {
                const pngUrl = URL.createObjectURL(pngBlob);
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = `${activeCanvas?.title || 'canvas'}-${viewMode}.png`;
                link.click();
                URL.revokeObjectURL(pngUrl);
                addToast(`Canvas (${viewMode.toUpperCase()}) exportado como imagen PNG.`, "success");
              }
              URL.revokeObjectURL(url);
            }, 'image/png');
          }
        };
        img.src = url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addToast(`Error al exportar canvas: ${message}`, "error");
    } finally {
      setIsPlayerView(originalPlayerView);
      setIsDirectionMode(originalDirectionMode);
      setMysteryFlowMode(originalMysteryFlowMode);
    }
  };

  if (loading && canvases.length === 0) {
    return <div className="canvas-loading">Cargando tableros de campaña…</div>;
  }


  const getMobileActionPosition = () => canvasFlowRef.current?.getViewportCenter() ?? { x: 200, y: 200 };

  const handleImportText = () => {
    if (!importText.trim() || !activeCanvas) return;
    addToast("Importando elementos y relaciones...", "info");
    runCanvasPageAction((async () => {
      try {
        await parseAndImportText(importText, activeCanvas.id, activeCampaignId!);
        addToast(t("canvas.page.importSuccess"), "success");
        setIsImportOpen(false);
        setImportText("");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        addToast(`Error al importar: ${message}`, "error");
      }
    })(), "No se pudo completar la importación al lienzo.");
  };

  const handleMobileAddNote = () => {
    if (!activeCanvas) return;
    const position = getMobileActionPosition();
    runCanvasPageAction(placeNodeOnCanvas(activeCanvas.id, {
      kind: "note",
      text: "",
      color: "yellow",
      x: position.x,
      y: position.y,
    }).then(() => {
      setMobilePanel(null);
    }), "No se pudo añadir la nota rápida al canvas.");
  };

  const handleMobileAddGroup = () => {
    if (!activeCanvas) return;
    const position = getMobileActionPosition();
    runCanvasPageAction(placeNodeOnCanvas(activeCanvas.id, {
      kind: "group",
      title: t("canvas.toolbar.newGroup"),
      color: "purple",
      x: position.x,
      y: position.y,
      width: 340,
      height: 220,
    }).then(() => {
      setMobilePanel(null);
    }), "No se pudo añadir el grupo visual al canvas.");
  };

  const isViewLocked = isPlayerView || isLocked;
  const isPublicView = isPlayerView || publicOnly;

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
              setSelectedNodes([]);
              setSelectedEdges([]);
            }}
            className="canvas-select"
            disabled={isPlayerView}
          >
            {canvases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({getCanvasKindLabel(c.kind, t)})
              </option>
            ))}
          </select>

          {!isPlayerView && (
            <button
              onClick={() => setIsCreateBoardOpen(true)}
              className="btn btn-secondary btn-sm"
              title={t("canvas.page.createNewBoard")}
            >
              <Plus size={14} /> Nuevo tablero
            </button>
          )}
        </div>
                 {/* View toggles & Filters */}
        <div className="canvas-header-filters" style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
          {/* Live Direction Toggle */}
          {activeSession && (
            <button
              type="button"
              className={`btn btn-sm ${isDirectionMode ? "btn-primary" : "btn-secondary"}`}
              onClick={() => {
                setIsDirectionMode(v => !v);
              }}
              title={isDirectionMode ? t("canvas.toolbar.deactivateDirection") : t("canvas.toolbar.activateDirection")}
            >
              <Zap size={12} />
              <span>{isDirectionMode ? "⚡ Dirigiendo" : "Dirigir partida"}</span>
            </button>
          )}

          {/* Fullscreen Presentation View Toggle */}
          <button
            type="button"
            className={`btn btn-sm ${isFullscreenPresentation ? "btn-primary" : "btn-secondary"}`}
            onClick={toggleFullscreenPresentation}
            title={isFullscreenPresentation ? t("canvas.toolbar.exitPresentation") : "Presentar en pantalla completa (Vista Jugador segura)"}
          >
            <Play size={12} />
            <span>{isFullscreenPresentation ? "Detener" : "Presentar"}</span>
          </button>

          {/* Vista Popover Container */}
          <div className="canvas-toolbar-group" style={{ position: "relative" }}>
            <button
              type="button"
              className={`btn btn-sm ${isViewPopoverOpen ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setIsViewPopoverOpen(v => !v)}
              title="Ajustes de Vista del Canvas"
              style={{ gap: "6px" }}
            >
              <SlidersHorizontal size={12} />
              <span>Vista</span>
            </button>
            {isViewPopoverOpen && (
              <div
                className="dropdown-menu"
                style={{
                  position: "absolute",
                  top: "34px",
                  right: 0,
                  backgroundColor: "var(--theme-surfaces-base)",
                  border: "1px solid var(--theme-borders-default)",
                  borderRadius: "var(--theme-shapes-radius-medium)",
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 1000,
                  minWidth: "220px",
                  boxShadow: "var(--theme-shadows-large)",
                  padding: "12px",
                  gap: "10px",
                }}
              >
                {/* Section 1: Modos (Buttons) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "10px", color: "var(--theme-text-secondary)", fontWeight: "bold", letterSpacing: "0.05em" }}>MODOS DE VISTA</div>
                  
                  {!isFullscreenPresentation && (
                    <button
                      type="button"
                      className={`btn btn-sm ${isPlayerView ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => {
                        const nextView = !isPlayerView;
                        setIsPlayerView(nextView);
                        if (nextView) {
                          setIsDirectionMode(false);
                          setSelectedNodeId(null);
                          setSelectedEdgeId(null);
                          setSelectedNodes([]);
                          setSelectedEdges([]);
                        }
                      }}
                      title={isPlayerView ? "Volver a vista de DM" : t("canvas.toolbar.activatePlayerView")}
                      style={{ width: "100%", justifyContent: "flex-start", gap: "8px" }}
                    >
                      {isPlayerView ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{isPlayerView ? t("canvas.toolbar.playerViewLabel") : "👁 Vista DM"}</span>
                    </button>
                  )}

                  {!isPlayerView && (
                    <button
                      type="button"
                      className={`btn btn-sm ${publicOnly ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setPublicOnly(v => !v)}
                      title={publicOnly ? t("canvas.toolbar.showingPublicOnly") : t("canvas.toolbar.showingAll")}
                      style={{ width: "100%", justifyContent: "flex-start", gap: "8px" }}
                    >
                      {publicOnly ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{publicOnly ? t("canvas.toolbar.publicOnly") : "Mostrar secretos"}</span>
                    </button>
                  )}

                  {!isPlayerView && (
                    <button
                      type="button"
                      className={`btn btn-sm ${tablePrivacy ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setTablePrivacy(value => !value)}
                      title={t("canvas.toolbar.tablePrivacyHint")}
                      style={{ width: "100%", justifyContent: "flex-start", gap: "8px" }}
                    >
                      <Shield size={12} />
                      <span>{t("canvas.toolbar.tablePrivacy")}</span>
                    </button>
                  )}

                  {!isPlayerView && (
                    <button
                      type="button"
                      className={`btn btn-sm ${mysteryFlowMode ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setMysteryFlowMode(v => !v)}
                      title={mysteryFlowMode ? "Desactivar Mystery Flow" : t("canvas.toolbar.activateMysteryFlow")}
                      style={{ width: "100%", justifyContent: "flex-start", gap: "8px" }}
                    >
                      <SlidersHorizontal size={12} />
                      <span>{mysteryFlowMode ? "🔍 Mystery Flow" : "Ver Misterio"}</span>
                    </button>
                  )}
                </div>

                <div style={{ height: "1px", backgroundColor: "var(--theme-borders-default)", margin: "4px 0" }} />

                {/* Section 2: Configurations / Filtros */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "10px", color: "var(--theme-text-secondary)", fontWeight: "bold", letterSpacing: "0.05em" }}>FILTROS Y DENSIDAD</div>

                  {/* Densidad Selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>Densidad</span>
                    <select
                      value={density}
                      onChange={(e) => {
                        const nextDensity = e.target.value;
                        if (isCanvasDensity(nextDensity)) {
                          setDensity(nextDensity);
                        }
                      }}
                      className="canvas-select"
                      style={{ width: "100%", backgroundColor: "var(--theme-surfaces-interactive)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-small)", color: "var(--theme-text-primary)", padding: "4px 6px", height: "32px", fontSize: "12px" }}
                    >
                      <option value="compact">🗜️ Compacta</option>
                      <option value="normal">📱 Normal</option>
                      <option value="detailed">📋 Detallada</option>
                    </select>
                  </div>

                  {/* Relaciones Filter */}
                  {!isPlayerView && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>Relaciones</span>
                      <select
                        value={relationsFilter}
                        onChange={(e) => { if (isRelationsFilter(e.target.value)) setRelationsFilter(e.target.value); }}
                        className="canvas-select"
                        style={{ width: "100%", backgroundColor: "var(--theme-surfaces-interactive)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-small)", color: "var(--theme-text-primary)", padding: "4px 6px", height: "32px", fontSize: "12px" }}
                        title={t("canvas.toolbar.filterConnections")}
                      >
                        <option value="all">🔗 Todas</option>
                        <option value="public">🌐 Públicas</option>
                        <option value="secret">🔴 Secretas</option>
                        <option value="selection">🎯 Selección</option>
                      </select>
                    </div>
                  )}

                  {/* Type Filter Select */}
                  {!isPlayerView && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>Tipos de entidad</span>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="canvas-select"
                        style={{ width: "100%", backgroundColor: "var(--theme-surfaces-interactive)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-small)", color: "var(--theme-text-primary)", padding: "4px 6px", height: "32px", fontSize: "12px" }}
                      >
                        <option value="all">Todos los tipos</option>
                        <option value="npc">PNJs</option>
                        <option value="location">Lugares</option>
                        <option value="quest">Misiones</option>
                        <option value="clue">Pistas</option>
                        <option value="secret">Secretos</option>
                        <option value="scene">Escenas</option>
                        <option value="other">Otros</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Grupo 4: Acciones Dropdown */}
          <div className="canvas-toolbar-group" style={{ position: "relative" }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setIsActionsDropdownOpen(v => !v)}
              title="Acciones y exportaciones de Canvas"
              style={{ gap: "6px" }}
            >
              <MoreHorizontal size={12} />
              <span>Más</span>
            </button>
            {isActionsDropdownOpen && (
              <div className="dropdown-menu" style={{ position: "absolute", top: "34px", right: 0, backgroundColor: "var(--theme-surfaces-base)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-medium)", display: "flex", flexDirection: "column", zIndex: 1000, minWidth: "180px", boxShadow: "var(--theme-shadows-large)", padding: "4px" }}>
                {!isPlayerView && (
                  <>
                    <button className="dropdown-item" onClick={() => { setIsImportOpen(true); setIsActionsDropdownOpen(false); }}>✏️ Importar por Texto</button>
                    <button className="dropdown-item" onClick={() => { setIsLintOpen(v => !v); setIsActionsDropdownOpen(false); }}>🧠 Analizar Lore (Lint)</button>
                    <button className="dropdown-item" onClick={() => { setIsLegendOpen(true); setIsActionsDropdownOpen(false); }}>📖 Ver Leyenda</button>
                    <div style={{ height: "1px", backgroundColor: "var(--theme-borders-default)", margin: "4px 0" }} />
                  </>
                )}
                <div style={{ fontSize: "9px", padding: "4px 12px", color: "var(--theme-text-secondary)", fontWeight: "bold" }}>EXPORTACIONES</div>
                <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("svg", "dm"), "No se pudo exportar el canvas en SVG para DM."); setIsActionsDropdownOpen(false); }}>Vector SVG - Vista DM</button>
                <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("svg", "player"), "No se pudo exportar el canvas en SVG para jugadores."); setIsActionsDropdownOpen(false); }}>Vector SVG - Vista Jugador</button>
                <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("png", "dm"), "No se pudo exportar el canvas en PNG para DM."); setIsActionsDropdownOpen(false); }}>Imagen PNG - Vista DM</button>
                <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("png", "player"), "No se pudo exportar el canvas en PNG para jugadores."); setIsActionsDropdownOpen(false); }}>Imagen PNG - Vista Jugador</button>
              </div>
            )}
          </div>
        </div>

        {activeCanvas && (
          <div className="canvas-board-info" style={{ marginLeft: "12px", borderLeft: "1px solid var(--theme-borders-default)", paddingLeft: "12px" }}>
            <span
              className="badge badge-primary"
              title={activeCanvas.description || undefined}
              style={{ cursor: activeCanvas.description ? "help" : undefined }}
            >
              {getCanvasKindLabel(activeCanvas.kind, t)}
            </span>
          </div>
        )}
      </div>

      <CanvasBoardDialogs
        isCreateBoardOpen={isCreateBoardOpen}
        setIsCreateBoardOpen={setIsCreateBoardOpen}
        isImportOpen={isImportOpen}
        setIsImportOpen={setIsImportOpen}
        isLegendOpen={isLegendOpen}
        setIsLegendOpen={setIsLegendOpen}
        newBoardTitle={newBoardTitle}
        setNewBoardTitle={setNewBoardTitle}
        newBoardKind={newBoardKind}
        setNewBoardKind={setNewBoardKind}
        newBoardTemplate={newBoardTemplate}
        setNewBoardTemplate={setNewBoardTemplate}
        importText={importText}
        setImportText={setImportText}
        handleCreateBoard={handleCreateBoard}
        handleImportText={handleImportText}
      />

      {/* Floating Exit Presentation Mode Button */}
      {isFullscreenPresentation && (
        <button
          onClick={() => {
            stopFullscreenPresentation();
          }}
          className="btn btn-primary"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 99999,
            boxShadow: "var(--theme-shadows-large)",
            fontSize: "12px",
            padding: "8px 12px",
            opacity: 0.8
          }}
        >
          ❌ Salir de Presentación
        </button>
      )}

      {/* Main workspace */}
      {activeCanvas ? (
        <div className="canvas-layout">
          {!isPlayerView && (
            <CanvasPalette
              canvasId={activeCanvas.id}
              isDirectionMode={isDirectionMode}
              selectedNodeId={selectedNodeId}
              getViewportCenter={() => canvasFlowRef.current?.getViewportCenter() ?? null}
              className={mobilePanel === "add" ? "is-open" : undefined}
              onMobileClose={() => setMobilePanel(null)}
            />
          )}
          {!isPlayerView && (
            <CanvasNavigatorPanel
              canvas={activeCanvas}
              onFocusNode={focusCanvasNode}
              onFocusEntity={focusCanvasEntity}
              onFocusFact={focusCanvasFact}
              getViewportCenter={() => canvasFlowRef.current?.getViewportCenter() ?? null}
              className={mobilePanel === "search" ? "is-open" : undefined}
              onMobileClose={() => setMobilePanel(null)}
            />
          )}
          
          <div className="canvas-work-area">
            <ReactFlowProvider key={`${campaignId}:${activeCanvas.id}`}>
              <CampaignCanvasFlow
                ref={canvasFlowRef}
                addToast={addToast}
                key={`${campaignId}:${activeCanvas.id}`}
                canvasId={activeCanvas.id}
                canvas={activeCanvas}
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                onSelectNode={(nodeId) => {
                  if (isPlayerView) return;
                  setSelectedNodeId(nodeId);
                  setSelectedEdgeId(null);
                }}
                onSelectEdge={(edgeId) => {
                  if (isPlayerView) return;
                  setSelectedEdgeId(edgeId);
                  setSelectedNodeId(null);
                }}
                onClearSelection={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                }}
                interactionMode={interactionMode}
                isLocked={isViewLocked}
                showMinimap={showMinimap}
                onModeChange={setInteractionMode}
                onLockChange={setIsLocked}
                onMinimapToggle={() => setShowMinimap(v => !v)}
                typeFilter={typeFilter}
                publicOnly={isPublicView}
                onSelectionChange={(nodes, edges) => {
                  if (isPlayerView) return;
                  setSelectedNodes(nodes);
                  setSelectedEdges(edges);
                }}
                isDirectionMode={isDirectionMode}
                isPlayerView={isPlayerView}
                tablePrivacy={tablePrivacy}
                mysteryFlowMode={mysteryFlowMode}
                density={density}
                relationsFilter={relationsFilter}
                deviceMode={deviceMode}
                interactionProfile={deviceMode === "mobile" ? "direct" : "edit"}
              />
            </ReactFlowProvider>
          </div>

          {!isPlayerView && mysteryFlowMode && campaignState && (
            <MysteryHealthPanel
              canvas={activeCanvas}
              entities={campaignState.entities}
              facts={campaignState.facts}
              relations={campaignState.relations}
              onClose={() => setMysteryFlowMode(false)}
              onFocusEntity={(entityId) => {
                focusCanvasEntity(entityId);
              }}
              onFocusFact={(factId) => {
                focusCanvasFact(factId);
              }}
            />
          )}

          {!isPlayerView && (selectedNodeId || selectedEdgeId) && (
            <CanvasInspector
              canvasId={activeCanvas.id}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              onClose={() => {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
                setMobilePanel(null);
              }}
              onOpenDetail={(entityId) => {
                setDetailEntityId(entityId);
              }}
              addToast={addToast}
              className={mobilePanel === "detail" ? "is-open" : undefined}
            />
          )}

          {/* Narrative Lint Drawer Panel */}
          {!isPlayerView && isLintOpen && (
            <div className="canvas-inspector canvas-lint-drawer">
              <div className="inspector-header">
                <h2>🧠 Consistencia Narrativa</h2>
                <button onClick={() => setIsLintOpen(false)} className="inspector-close-btn">
                  <X size={16} />
                </button>
              </div>
              <div className="inspector-content">
                {(() => {
                  if (!campaignState) return null;
                  const issues = runNarrativeLint(campaignState, activeCanvas, t);
                  if (issues.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "20px", color: "var(--theme-text-secondary)" }}>
                        <span style={{ fontSize: "2rem" }}>✨</span>
                        <p style={{ marginTop: "10px", color: "var(--success)", fontWeight: "600" }}>¡Todo perfecto!</p>
                        <p style={{ fontSize: "0.85rem" }}>No se han detectado problemas de consistencia narrativa en tu canvas.</p>
                      </div>
                    );
                  }
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)" }}>
                        Se han encontrado <strong>{issues.length}</strong> detalles a revisar:
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
                        {issues.map((iss) => (
                          <div
                            key={iss.id}
                            style={{
                              padding: "10px",
                              borderRadius: "var(--theme-shapes-radius-small)",
                              borderLeft: `3px solid ${iss.type === "error" ? "var(--theme-feedback-danger-foreground)" : iss.type === "warning" ? "var(--theme-feedback-warning-foreground)" : "var(--theme-accents-primary-foreground)"}`,
                              backgroundColor: "var(--theme-surfaces-interactive)",
                              fontSize: "0.82rem",
                              lineHeight: "1.4"
                            }}
                          >
                            <div style={{ fontWeight: "600", marginBottom: "4px", color: iss.type === "error" ? "var(--theme-feedback-danger-foreground)" : iss.type === "warning" ? "var(--theme-feedback-warning-foreground)" : "var(--theme-text-primary)" }}>
                              {iss.type === "error" ? t("canvas.node.statusCritical") : iss.type === "warning" ? "⚠️ Advertencia" : "💡 Sugerencia"}
                            </div>
                            <div>{iss.message}</div>
                            {iss.entityId && (
                              <button
                                onClick={() => {
                                  setSelectedNodeId(activeCanvas.nodes.find((n: CanvasNode) => n.entityId === iss.entityId)?.id || null);
                                  setSelectedEdgeId(null);
                                }}
                                className="btn btn-link btn-xs"
                                style={{ padding: 0, marginTop: "6px", fontSize: "10px", color: "var(--theme-accents-primary-foreground)", border: "none", background: "transparent", cursor: "pointer" }}
                              >
                                Inspeccionar elemento
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}


          {!isPlayerView && deviceMode === "mobile" && (
            <>
              <div className={`canvas-mobile-more-panel ${mobilePanel === "more" ? "is-open" : ""}`} aria-label="Acciones secundarias del canvas">
                <div className="canvas-mobile-sheet-header">
                  <span>Más acciones</span>
                  <button type="button" className="canvas-mobile-sheet-close" onClick={() => setMobilePanel(null)} aria-label="Cerrar panel de más acciones">
                    <X size={16} />
                  </button>
                </div>
                <div className="canvas-mobile-more-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleMobileAddNote}><StickyNote size={14} /> Nota rápida</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleMobileAddGroup}><Frame size={14} /> Grupo visual</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => canvasFlowRef.current?.fitView()}><Maximize2 size={14} /> Ajustar vista</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => canvasFlowRef.current?.zoomIn()}><ZoomIn size={14} /> Zoom +</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => canvasFlowRef.current?.zoomOut()}><ZoomOut size={14} /> Zoom -</button>
                  <button type="button" className={`btn btn-sm ${tablePrivacy ? "btn-primary" : "btn-secondary"}`} onClick={() => setTablePrivacy(value => !value)}><Shield size={14} /> Privacidad de mesa</button>
                  <label className="canvas-mobile-more-field"><SlidersHorizontal size={14} /> Filtros<select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="canvas-select"><option value="all">Todos los tipos</option><option value="npc">PNJs</option><option value="location">Lugares</option><option value="quest">Misiones</option><option value="clue">Pistas</option><option value="secret">Secretos</option><option value="scene">Escenas</option><option value="other">Otros</option></select></label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setIsSessionPrepOpen(true); setMobilePanel(null); }}><CalendarDays size={14} /> Preparar sesión</button>
                  <button type="button" className={`btn btn-sm ${isFullscreenPresentation ? "btn-primary" : "btn-secondary"}`} onClick={() => { toggleFullscreenPresentation(); setMobilePanel(null); }}><Play size={14} /> Modo presentación</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setIsCreateBoardOpen(true); setMobilePanel(null); }}>Nuevo tablero</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setIsImportOpen(true); setMobilePanel(null); }}>Importar texto</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setIsLegendOpen(true); setMobilePanel(null); }}>Leyenda</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setIsLintOpen(true); setMobilePanel(null); }}>Consistencia</button>
                </div>
              </div>
              <nav className="canvas-mobile-dock" aria-label="Paneles del canvas">
                <button type="button" className={interactionMode === "pan" ? "is-active" : ""} onClick={() => setInteractionMode((mode) => mode === "pan" ? "select" : "pan")} title={interactionMode === "pan" ? "Cambiar a seleccionar" : "Cambiar a mover"}>{interactionMode === "pan" ? <Hand size={18} /> : <MousePointer2 size={18} />}<span>{interactionMode === "pan" ? "Mover" : "Seleccionar"}</span></button>
                <button type="button" className={mobilePanel === "search" ? "is-active" : ""} onClick={() => setMobilePanel((panel) => panel === "search" ? null : "search")}><Search size={18} /><span>Buscar</span></button>
                <button type="button" className={mobilePanel === "add" ? "is-active" : ""} onClick={() => setMobilePanel((panel) => panel === "add" ? null : "add")}><ListPlus size={18} /><span>Añadir</span></button>
                <button type="button" className={mobilePanel === "more" ? "is-active" : ""} onClick={() => setMobilePanel((panel) => panel === "more" ? null : "more")}><MoreHorizontal size={18} /><span>Más</span></button>
              </nav>
            </>
          )}

          {/* Floating bulk actions bar */}
          {!isPlayerView && selectedNodes.length >= 2 && (
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
                      className="form-select"
                      style={{ fontSize: "12px", padding: "3px 6px", height: "28px" }}
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

      {/* Session Prep Dialog Overlay */}
      {isSessionPrepOpen && (
        <div className="modal-overlay" onClick={() => setIsSessionPrepOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2>{t("sessionPage.prepareSessionFromSelectionTitle")}</h2>
              <button onClick={() => setIsSessionPrepOpen(false)} className="modal-close-btn"><X size={16} /></button>
            </div>
            {(() => {
              const activeSession = campaignState?.sessions?.find((s: Session) => s.status === "active");
              const entNames = selectedNodes.map((n) => n.data.title || n.data.text || "Elemento");
              
              return (
                <SessionPrepForm
                  activeSession={activeSession}
                  preparedSessions={preparedSessions}
                  selectedCount={selectedNodes.length}
                  elementNames={entNames}
                  onSubmit={async (sessionTitle, targetMode, targetSessionId) => {
                    const isStringId = (id: string | undefined): id is string => id !== undefined;
                    const entIds = selectedNodes
                      .filter((n) => n.type === "entity" && n.data.entityId)
                      .map((n) => n.data.entityId)
                      .filter(isStringId);
                    const sceneIds = selectedNodes
                      .filter((n) => n.type === "entity" && n.data.entityType === "scene" && n.data.entityId)
                      .map((n) => n.data.entityId)
                      .filter(isStringId);
                    const clueIds = selectedNodes
                      .filter((n) => n.type === "entity" && n.data.entityType === "clue" && n.data.entityId)
                      .map((n) => n.data.entityId)
                      .filter(isStringId);
                    const secretIds = selectedNodes
                      .filter((n) => n.type === "entity" && n.data.entityType === "secret" && n.data.entityId)
                      .map((n) => n.data.entityId)
                      .filter(isStringId);
                    const consequenceIds = selectedNodes
                      .filter((n) => n.type === "entity" && n.data.entityType === "consequence" && n.data.entityId)
                      .map((n) => n.data.entityId)
                      .filter(isStringId);
                    
                    if (targetMode === "new") {
                      await createPreparedSession(sessionTitle, {
                        state: "ready",
                        summary: t("sessionPage.preparedFromCanvasSummary", { count: selectedNodes.length }),
                        goals: [],
                        sceneIds,
                        involvedEntityIds: entIds,
                        availableClueIds: clueIds,
                        secretsAtRiskIds: secretIds,
                        expectedConsequenceIds: consequenceIds,
                        checklist: [],
                        notes: t("sessionPage.preparedFromCanvasNotes", { names: entNames.join(", ") }),
                      });
                      addToast(t("toasts.sessionPrepared", { title: sessionTitle }), "success");
                    } else if (targetMode === "prepared" && targetSessionId) {
                      const targetSession = preparedSessions.find((session: Session) => session.sessionId === targetSessionId);
                      if (!targetSession) return;
                      const currentPrep = targetSession.prep ?? { state: "draft" };
                      const mergeIds = (...groups: string[][]) => Array.from(new Set(groups.flat().filter(Boolean)));
                      await updateSessionPrep(targetSessionId, {
                        title: targetSession.title,
                        scheduledAt: targetSession.scheduledAt,
                        prep: {
                          ...currentPrep,
                          state: currentPrep.state ?? "draft",
                          sceneIds: mergeIds(currentPrep.sceneIds ?? [], sceneIds),
                          involvedEntityIds: mergeIds(currentPrep.involvedEntityIds ?? [], entIds),
                          availableClueIds: mergeIds(currentPrep.availableClueIds ?? [], clueIds),
                          secretsAtRiskIds: mergeIds(currentPrep.secretsAtRiskIds ?? [], secretIds),
                          expectedConsequenceIds: mergeIds(currentPrep.expectedConsequenceIds ?? [], consequenceIds),
                          notes: [currentPrep.notes, t("sessionPage.preparedFromCanvasNotes", { names: entNames.join(", ") })].filter(Boolean).join("\n"),
                        },
                      });
                      addToast(t("toasts.elementsAddedToPreparation", { title: targetSession.title }), "success");
                    } else if (activeSession) {
                      await recordSessionEvent(activeSession.sessionId, {
                        type: "scene_started",
                        title: t("sessionPage.loadedFromCanvasTitle"),
                        description: t("sessionPage.loadedFromCanvasDescription", { names: entNames.join(", ") }),
                        relatedEntityIds: entIds,
                      });
                      addToast(t("toasts.elementsAddedToSession"), "success");
                    }
                    setIsSessionPrepOpen(false);
                    setSelectedNodes([]);
                    setSelectedEdges([]);
                  }}
                  onCancel={() => setIsSessionPrepOpen(false)}
                />
              );
            })()}
          </div>
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
