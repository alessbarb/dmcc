import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { ReactFlowProvider } from "@xyflow/react";
import type { Edge } from "@xyflow/react";
import { CampaignCanvasFlow } from "../components/CampaignCanvasFlow.js";
import type { CampaignCanvasFlowHandle, CanvasDeviceMode, CanvasFlowNode } from "../components/CampaignCanvasFlow.js";
import { CanvasNavigatorPanel } from "../components/CanvasNavigatorPanel.js";
import { CanvasPalette } from "../components/CanvasPalette.js";
import { CanvasInspector } from "../components/CanvasInspector.js";
import { CanvasBoardDialogs } from "../components/CanvasBoardDialogs.js";
import { CanvasPageHeader } from "../components/CanvasPageHeader.js";
import { MysteryHealthPanel } from "../components/MysteryHealthPanel.js";
import { CanvasNarrativeLintDrawer } from "../components/CanvasNarrativeLintDrawer.js";
import { CanvasMobileMorePanel } from "../components/CanvasMobileMorePanel.js";
import { CanvasBulkActionsBar } from "../components/CanvasBulkActionsBar.js";
import { CanvasSessionPrepDialog } from "../components/CanvasSessionPrepDialog.js";
import { Plus, Layout, MoreHorizontal, Search, ListPlus, MousePointer2, Hand } from "lucide-react";
import type { InteractionMode } from "../components/CanvasToolbar.js";
import { EntityDetailModal } from "../../entities/EntityDetailModal.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { ToastContainer } from "../../../shared/components/ToastContainer.js";
import { useCanvasHistoryStore } from "../../../shared/stores/canvasHistoryStore.js";
import { useBodyWatermark } from "../../../shared/hooks/useBodyWatermark.js";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import type { Canvas, CanvasNode, CanvasEdge } from "@core/domain/canvas/types.js";
import { isCanvasDensity, type CanvasDensity, type RelationsFilter } from "../canvasPageFilters.js";
import type { Entity, Relation, Session } from "../../../shared/stores/campaignStore.js";
import "../../../shared/styles/features/campaign-canvas.css";
import "../../../shared/styles/features/canvas-board-dialogs.css";
import "../../../shared/styles/features/canvas-bulk-actions.css";
import "../../../shared/styles/features/canvas-dialog-forms.css";
import "../../../shared/styles/features/canvas-entity-node.css";
import "../../../shared/styles/features/canvas-flow.css";
import "../../../shared/styles/features/canvas-group-hulls.css";
import "../../../shared/styles/features/canvas-inspector.css";
import "../../../shared/styles/features/canvas-mystery-health.css";
import "../../../shared/styles/features/canvas-narrative-lint.css";
import "../../../shared/styles/features/canvas-page-header.css";
import "../../../shared/styles/features/canvas-palette.css";
import "../../../shared/styles/features/canvas-toolbar.css";
import "../../../shared/styles/features/canvas-presentation.css";

import { getCanvasTemplate } from "../templates/index.js";
import { applyCanvasTemplate } from "../services/applyCanvasTemplate.js";
import { parseAndImportText } from "../services/importCanvasText.js";

type CanvasMobilePanel = "search" | "add" | "detail" | "more" | null;

const CANVAS_DENSITY_STORAGE_KEY = "dmcc.canvas.density";
const DEFAULT_CANVAS_DENSITY: CanvasDensity = "normal";

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
  useBodyWatermark("canvas");
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
    reviseSessionPlan,
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
            const themeBackground = getComputedStyle(document.documentElement)
              .getPropertyValue("--theme-surfaces-canvas")
              .trim();
            ctx.fillStyle = themeBackground || "transparent";
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
      <CanvasPageHeader
        activeCanvasId={activeCanvasId}
        setActiveCanvasId={setActiveCanvasId}
        setSelectedNodeId={setSelectedNodeId}
        setSelectedEdgeId={setSelectedEdgeId}
        setSelectedNodes={setSelectedNodes}
        setSelectedEdges={setSelectedEdges}
        canvases={canvases}
        activeCanvas={activeCanvas}
        activeSession={activeSession}
        isPlayerView={isPlayerView}
        setIsPlayerView={setIsPlayerView}
        setIsCreateBoardOpen={setIsCreateBoardOpen}
        isDirectionMode={isDirectionMode}
        setIsDirectionMode={setIsDirectionMode}
        isFullscreenPresentation={isFullscreenPresentation}
        toggleFullscreenPresentation={toggleFullscreenPresentation}
        isViewPopoverOpen={isViewPopoverOpen}
        setIsViewPopoverOpen={setIsViewPopoverOpen}
        publicOnly={publicOnly}
        setPublicOnly={setPublicOnly}
        tablePrivacy={tablePrivacy}
        setTablePrivacy={setTablePrivacy}
        mysteryFlowMode={mysteryFlowMode}
        setMysteryFlowMode={setMysteryFlowMode}
        density={density}
        setDensity={setDensity}
        relationsFilter={relationsFilter}
        setRelationsFilter={setRelationsFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        isActionsDropdownOpen={isActionsDropdownOpen}
        setIsActionsDropdownOpen={setIsActionsDropdownOpen}
        setIsImportOpen={setIsImportOpen}
        setIsLintOpen={setIsLintOpen}
        setIsLegendOpen={setIsLegendOpen}
        handleExport={handleExport}
        runCanvasPageAction={runCanvasPageAction}
        t={t}
        getCanvasKindLabel={getCanvasKindLabel}
      />

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
          className="btn btn-primary canvas-presentation-exit"
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

          {!isPlayerView && isLintOpen && campaignState && (
            <CanvasNarrativeLintDrawer
              activeCanvas={activeCanvas}
              campaignState={campaignState}
              onClose={() => setIsLintOpen(false)}
              onSelectEntity={(entityId) => {
                setSelectedNodeId(activeCanvas.nodes.find((node: CanvasNode) => node.entityId === entityId)?.id || null);
                setSelectedEdgeId(null);
              }}
              t={t}
            />
          )}

          {!isPlayerView && deviceMode === "mobile" && (
            <>
              <CanvasMobileMorePanel
                isOpen={mobilePanel === "more"}
                onClose={() => setMobilePanel(null)}
                onAddNote={handleMobileAddNote}
                onAddGroup={handleMobileAddGroup}
                onFitView={() => canvasFlowRef.current?.fitView()}
                onZoomIn={() => canvasFlowRef.current?.zoomIn()}
                onZoomOut={() => canvasFlowRef.current?.zoomOut()}
                tablePrivacy={tablePrivacy}
                setTablePrivacy={setTablePrivacy}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                onPrepareSession={() => { setIsSessionPrepOpen(true); setMobilePanel(null); }}
                isFullscreenPresentation={isFullscreenPresentation}
                onTogglePresentation={() => { toggleFullscreenPresentation(); setMobilePanel(null); }}
                onCreateBoard={() => { setIsCreateBoardOpen(true); setMobilePanel(null); }}
                onImport={() => { setIsImportOpen(true); setMobilePanel(null); }}
                onOpenLegend={() => { setIsLegendOpen(true); setMobilePanel(null); }}
                onOpenLint={() => { setIsLintOpen(true); setMobilePanel(null); }}
              />
              <nav className="canvas-mobile-dock" aria-label={t("canvas.dockAriaLabel")}>
                <button type="button" className={`canvas-mobile-dock__mode-button ${interactionMode === "pan" ? "is-active" : ""}`} onClick={() => setInteractionMode((mode) => mode === "pan" ? "select" : "pan")} title={interactionMode === "pan" ? t("canvas.toolbar.selectMode") : t("canvas.toolbar.panMode")}>{interactionMode === "pan" ? <Hand size={18} /> : <MousePointer2 size={18} />}<span>{interactionMode === "pan" ? t("common.actions") : t("common.select")}</span></button>
                <button type="button" className={mobilePanel === "search" ? "is-active" : ""} onClick={() => setMobilePanel((panel) => panel === "search" ? null : "search")}><Search size={18} /><span>{t("common.search")}</span></button>
                <button type="button" className={mobilePanel === "add" ? "is-active" : ""} onClick={() => setMobilePanel((panel) => panel === "add" ? null : "add")}><ListPlus size={18} /><span>{t("canvas.toolbar.addNode")}</span></button>
                <button type="button" className={mobilePanel === "more" ? "is-active" : ""} onClick={() => setMobilePanel((panel) => panel === "more" ? null : "more")}><MoreHorizontal size={18} /><span>{t("common.moreActions")}</span></button>
              </nav>
            </>
          )}

          {/* Floating bulk actions bar */}
          {!isPlayerView && selectedNodes.length >= 2 && (
            <CanvasBulkActionsBar
              activeCanvas={activeCanvas}
              selectedNodes={selectedNodes}
              bulkGroupId={bulkGroupId}
              setBulkGroupId={setBulkGroupId}
              bulkConfirm={bulkConfirm}
              setBulkConfirm={setBulkConfirm}
              setSelectedNodes={setSelectedNodes}
              setSelectedEdges={setSelectedEdges}
              setIsSessionPrepOpen={setIsSessionPrepOpen}
              updateCanvasNodesLayout={updateCanvasNodesLayout}
              updateEntity={updateEntity}
              removeNodeFromCanvas={removeNodeFromCanvas}
              runCanvasPageAction={runCanvasPageAction}
              addToast={addToast}
              t={t}
            />          )}
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

      <CanvasSessionPrepDialog
        isOpen={isSessionPrepOpen}
        setIsOpen={setIsSessionPrepOpen}
        campaignState={campaignState}
        preparedSessions={preparedSessions}
        selectedNodes={selectedNodes}
        createPreparedSession={createPreparedSession}
        reviseSessionPlan={reviseSessionPlan}
        recordSessionEvent={recordSessionEvent}
        addToast={addToast}
        setSelectedNodes={setSelectedNodes}
        setSelectedEdges={setSelectedEdges}
        t={t}
      />

      {/* Full details modal for entities */}
      {selectedEntityLocal && campaignState && (
        <EntityDetailModal
          selectedEntity={selectedEntityLocal}
          campaignState={campaignState}
          onClose={() => {
            setDetailEntityId(null);
          }}
          onSelectEntity={setDetailEntityId}
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
