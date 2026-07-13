import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { ReactFlowProvider } from "@xyflow/react";
import type { Edge } from "@xyflow/react";
import { CampaignCanvasFlow } from "../components/CampaignCanvasFlow.js";
import type { CampaignCanvasFlowHandle, CanvasDeviceMode, CanvasFlowNode } from "../components/CampaignCanvasFlow.js";
import { CanvasNavigatorPanel } from "../components/CanvasNavigatorPanel.js";
import { CanvasPalette } from "../components/CanvasPalette.js";
import { CanvasInspector } from "../components/CanvasInspector.js";
import { MysteryHealthPanel } from "../components/MysteryHealthPanel.js";
import { Plus, Layout, Folder, Eye, EyeOff, Zap, Play, X, User, UserCheck, MapPin, Shield, HelpCircle, Key, Award, Film, Search, ListPlus, MoreHorizontal, MousePointer2, Hand, StickyNote, Frame, Maximize2, ZoomIn, ZoomOut, SlidersHorizontal, CalendarDays } from "lucide-react";
import type { InteractionMode } from "../components/CanvasToolbar.js";
import { EntityDetailModal } from "../../entities/EntityDetailModal.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { connectCanvasNodes } from "../services/connectCanvasNodes.js";
import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";
import type { Canvas, CanvasNode, CanvasEdge } from "@core/domain/canvas/types.js";
import type { Entity, Relation, Session } from "../../../shared/stores/campaignStore.js";

import { getCanvasTemplate } from "../templates/index.js";
import { applyCanvasTemplate } from "../services/applyCanvasTemplate.js";

type CanvasDensity = "compact" | "normal" | "detailed";
type CanvasMobilePanel = "search" | "add" | "detail" | "more" | null;

const CANVAS_DENSITY_STORAGE_KEY = "dmcc.canvas.density";
const DEFAULT_CANVAS_DENSITY: CanvasDensity = "normal";
const CANVAS_DENSITY_OPTIONS = new Set<CanvasDensity>(["compact", "normal", "detailed"]);

const isCanvasDensity = (value: string | null): value is CanvasDensity => (
  value !== null && CANVAS_DENSITY_OPTIONS.has(value as CanvasDensity)
);

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


// Markdown structured text import parser
const parseAndImportText = async (text: string, canvasId: string, _campaignId: string) => {
  const store = useCampaignStore.getState();
  const { createEntity, placeNodeOnCanvas, addEdgeToCanvas, createRelation } = store;
  
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const entitiesCreated: Record<string, string> = {};
  const nodesCreated: Record<string, string> = {};
  
  let currentGroupNodeId: string | undefined = undefined;
  let currentX = 100;
  let currentY = 150;
  
  for (const line of lines) {
    if (line.startsWith("#")) {
      const groupName = line.slice(1).trim();
      await placeNodeOnCanvas(canvasId, { kind: "group", title: groupName, color: "purple", x: currentX, y: currentY, width: 340, height: 240 });
      
      const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
      const groupNode = updatedCanvas?.nodes?.find((n: CanvasNode) => n.kind === "group" && n.title === groupName && n.x === currentX && n.y === currentY);
      currentGroupNodeId = groupNode?.id;
      
      currentX += 380;
      if (currentX > 1000) {
        currentX = 100;
        currentY += 280;
      }
    } else if (line.startsWith("[")) {
      const match = line.match(/^\[([^\]]+)\]\s*(.+)$/);
      if (match) {
        const typeStr = match[1].trim().toLowerCase();
        const nameStr = match[2].trim();
        
        const typeMapping: Record<string, string> = {
          pc: "player_character",
          pj: "player_character",
          npc: "npc",
          pnj: "npc",
          lugar: "location",
          location: "location",
          faction: "faction",
          faccion: "faction",
          quest: "quest",
          mision: "quest",
          clue: "clue",
          pista: "clue",
          secret: "secret",
          secreto: "secret",
          item: "item",
          objeto: "item",
          creature: "creature",
          criatura: "creature",
          scene: "scene",
          escena: "scene",
          consequence: "consequence",
          consecuencia: "consequence",
          rumor: "rumor",
        };
        
        const entityType = typeMapping[typeStr] || "note";
        
        if (entityType === "note") {
          await placeNodeOnCanvas(canvasId, { kind: "note", text: nameStr, color: "yellow", x: currentX + 50, y: currentY + 50, groupId: currentGroupNodeId });
          const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
          const noteNode = updatedCanvas?.nodes?.slice(-1)[0];
          if (noteNode) {
            nodesCreated[nameStr] = noteNode.id;
          }
        } else {
          const existing = store.campaignState?.entities?.find((e: Entity) => e.title.toLowerCase() === nameStr.toLowerCase() && !e.archived);
          let entityId = existing?.entityId;
          
          if (!entityId) {
            await createEntity({
              entityType,
              title: nameStr,
              status: "ready",
              importance: "normal",
              visibility: { kind: entityType === "secret" ? "dm_only" : "public" },
            });
            const created = useCampaignStore.getState().campaignState?.entities?.slice(-1)[0];
            entityId = created?.entityId;
          }
          
          if (entityId) {
            entitiesCreated[nameStr] = entityId;
            await placeNodeOnCanvas(canvasId, { kind: "entity", entityId, x: currentX + 50, y: currentY + 50, groupId: currentGroupNodeId });
            
            const updatedCanvas = useCampaignStore.getState().canvasesById[canvasId];
            const nodeObj = updatedCanvas?.nodes?.find((n: CanvasNode) => n.entityId === entityId);
            if (nodeObj) {
              nodesCreated[nameStr] = nodeObj.id;
            }
          }
        }
        
        currentY += 85;
        if (currentY > 600) {
          currentY = 150;
          currentX += 220;
        }
      }
    }
  }

  for (const line of lines) {
    if (line.includes("->")) {
      const parts = line.split("->").map(p => p.trim());
      if (parts.length >= 2) {
        const sourceName = parts[0];
        const relationLabel = parts[1];
        const targetName = parts[2] || parts[1];
        const finalLabel = parts[2] ? relationLabel : "relacionado con";

        const sourceNodeId = nodesCreated[sourceName] || useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: CanvasNode) => {
          const ent = n.entityId ? store.campaignState?.entities?.find((e: Entity) => e.entityId === n.entityId) : null;
          return ent && ent.title.toLowerCase() === sourceName.toLowerCase();
        })?.id;

        const targetNodeId = nodesCreated[targetName] || useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: CanvasNode) => {
          const ent = n.entityId ? store.campaignState?.entities?.find((e: Entity) => e.entityId === n.entityId) : null;
          return ent && ent.title.toLowerCase() === targetName.toLowerCase();
        })?.id;

        if (sourceNodeId && targetNodeId) {
          const sourceNode = useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: CanvasNode) => n.id === sourceNodeId);
          const targetNode = useCampaignStore.getState().canvasesById[canvasId]?.nodes?.find((n: CanvasNode) => n.id === targetNodeId);
          
          if (sourceNode?.entityId && targetNode?.entityId) {
            try {
              await connectCanvasNodes({
                canvasId,
                sourceNode: { id: sourceNodeId, entityId: sourceNode.entityId },
                targetNode: { id: targetNodeId, entityId: targetNode.entityId },
                edge: {
                  label: finalLabel,
                  status: "domain",
                  visibility: "dm",
                  style: "solid"
                },
                relation: {
                  relationType: finalLabel.replace(/\s+/g, "_"),
                  visibility: { kind: "dm_only" }
                },
                createRelation,
                addEdgeToCanvas,
              });
            } catch (err) {
              console.error("Relation creation failed during text import", err);
            }
          } else {
            await addEdgeToCanvas(canvasId, {
              sourceNodeId,
              targetNodeId,
              label: finalLabel,
              status: "draft",
              visibility: "dm",
              style: "solid"
            });
          }
        }
      }
    }
  }
};

// Narrative consistency check (Lint) auditor logic
const runNarrativeLint = (campaignState: { entities: Entity[]; relations: Relation[] }, activeCanvas: Canvas, t: (key: string, params?: Record<string, string | number>) => string) => {
  const issues: { id: string; type: "error" | "warning" | "info"; message: string; entityId?: string }[] = [];
  if (!campaignState || !activeCanvas) return issues;

  const entities = campaignState.entities.filter((e: Entity) => !e.archived);
  const relations = campaignState.relations.filter((r: Relation) => !r.archived);
  const canvasNodes = activeCanvas.nodes || [];
  const canvasEdges = activeCanvas.edges || [];

  // 1. Secretos sin pistas
  const secrets = entities.filter((e: Entity) => e.entityType === "secret");
  for (const secret of secrets) {
    const anchors = Array.isArray(secret.metadata?.revelationAnchors) ? secret.metadata.revelationAnchors : [];
    const hasAnchors = anchors.length > 0;
    const pointingClues = relations.filter(
      (r: Relation) => r.targetEntityId === secret.entityId &&
                  entities.find((e: Entity) => e.entityId === r.sourceEntityId)?.entityType === "clue"
    );
    const hasPointingClues = pointingClues.length > 0;
    
    if (!hasAnchors && !hasPointingClues) {
      issues.push({
        id: `secret-no-clues-${secret.entityId}`,
        type: "error",
        message: `El secreto 🔒 "${secret.title}" no tiene ninguna pista ni ancla asociada para ser revelado.`,
        entityId: secret.entityId
      });
    }
  }

  // 2. Pistas huérfanas
  const clues = entities.filter((e: Entity) => e.entityType === "clue");
  for (const clue of clues) {
    const isAnchor = secrets.some((s: Entity) => Array.isArray(s.metadata?.revelationAnchors) && s.metadata.revelationAnchors.includes(clue.entityId));
    const hasOutgoing = relations.some((r: Relation) => r.sourceEntityId === clue.entityId);
    if (!isAnchor && !hasOutgoing) {
      issues.push({
        id: `clue-orphan-${clue.entityId}`,
        type: "warning",
        message: t("canvas.flow.warningOrphanClue", { title: clue.title }),
        entityId: clue.entityId
      });
    }
  }

  // 3. NPCs importantes sin uso
  const importantNpcs = entities.filter(
    (e: Entity) => e.entityType === "npc" && (e.importance === "critical" || e.importance === "high")
  );
  for (const npc of importantNpcs) {
    const isConnected = relations.some(
      (r: Relation) => r.sourceEntityId === npc.entityId || r.targetEntityId === npc.entityId
    );
    if (!isConnected) {
      issues.push({
        id: `npc-unused-${npc.entityId}`,
        type: "warning",
        message: `El PNJ relevante 👤 "${npc.title}" no tiene conexiones con misiones o escenas.`,
        entityId: npc.entityId
      });
    }
  }

  // 4. Misiones sin cierre
  const quests = entities.filter((e: Entity) => e.entityType === "quest");
  for (const quest of quests) {
    const hasConnections = relations.some(
      (r: Relation) => r.sourceEntityId === quest.entityId || r.targetEntityId === quest.entityId
    );
    if (!hasConnections) {
      issues.push({
        id: `quest-no-end-${quest.entityId}`,
        type: "warning",
        message: t("canvas.flow.warningStuckQuest", { title: quest.title }),
        entityId: quest.entityId
      });
    }
  }

  // 5. Lugares vacíos
  const locationNodes = canvasNodes.filter((n: CanvasNode) => n.kind === "entity" && entities.find((e: Entity) => e.entityId === n.entityId)?.entityType === "location");
  for (const locNode of locationNodes) {
    const locEntity = entities.find((e: Entity) => e.entityId === locNode.entityId);
    if (!locEntity) continue;
    const hasChildren = canvasNodes.some((n: CanvasNode) => n.groupId === locNode.id);
    const hasEdges = canvasEdges.some((e: CanvasEdge) => e.sourceNodeId === locNode.id || e.targetNodeId === locNode.id);
    
    if (!hasChildren && !hasEdges) {
      issues.push({
        id: `location-empty-${locEntity.entityId}`,
        type: "info",
        message: t("canvas.flow.warningEmptyLocation", { title: locEntity.title }),
        entityId: locEntity.entityId
      });
    }
  }

  // 6. Relaciones privadas con fuga
  for (const rel of relations) {
    const source = entities.find((e: Entity) => e.entityId === rel.sourceEntityId);
    const target = entities.find((e: Entity) => e.entityId === rel.targetEntityId);
    if (source && target) {
      const relIsSecret = isDmOnlyVisibility(rel.visibility);
      const sourceIsPublic = source.visibility?.kind === "public";
      const targetIsPublic = target.visibility?.kind === "public";
      if (relIsSecret && sourceIsPublic && targetIsPublic) {
        issues.push({
          id: `relation-leak-${rel.relationId}`,
          type: "info",
          message: t("canvas.flow.warningSecretRelation", { source: source.title, target: target.title }),
        });
      }
    }
  }

  return issues;
};

export function CanvasPage() {
  const canvasFlowRef = useRef<CampaignCanvasFlowHandle>(null);
  const { t } = useTranslation();
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
    loading,
    removeNodeFromCanvas,
    updateCanvasNodesLayout,
    createPreparedSession,
    updateSessionPrep,
    recordSessionEvent,
    placeNodeOnCanvas,
  } = useCampaignStore();

  const { addToast } = useToast();

  useEffect(() => {
    if (campaignId && campaignId !== activeCampaignId) {
      void selectCampaign(campaignId).catch((error: unknown) => {
        console.error("No se pudo cargar la campaña para el canvas.", error);
        addToast("No se pudo cargar la campaña para el canvas.", "error");
      });
    }
  }, [campaignId, activeCampaignId, selectCampaign, addToast]);

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
  const [relationsFilter, setRelationsFilter] = useState<"all" | "public" | "secret" | "selection">("all");
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
                {c.title} ({c.kind === "world" ? "Mundo" : c.kind === "session" ? t("canvas.node.typeSession") : c.kind === "mystery" ? t("canvas.page.templateConspiration") : c.kind === "location" ? "Ubicaciones" : c.kind === "characters" ? t("canvas.page.templateRelations") : "Personalizado"})
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
        <div className="canvas-header-filters" style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "16px", borderLeft: "1px solid var(--border-color)", paddingLeft: "16px", flex: 1, width: "100%" }}>
          {/* Grupo 1: Modos principales */}
          <div className="canvas-toolbar-group">
            {/* Live Direction Toggle */}
            {activeSession && (
              <button
                type="button"
                className={`btn btn-sm ${isDirectionMode ? "btn-primary" : "btn-secondary"}`}
                onClick={() => {
                  setIsDirectionMode(v => !v);
                }}
                title={isDirectionMode ? t("canvas.toolbar.deactivateDirection") : t("canvas.toolbar.activateDirection")}
                style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
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
              style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
            >
              <Play size={12} />
              <span>{isFullscreenPresentation ? "Detener" : "Presentar"}</span>
            </button>
          </div>

          <div className="canvas-toolbar-divider" />

          {/* Grupo 2: Configuración de Vista */}
          <div className="canvas-toolbar-group">
            {/* Player/DM View Toggle (Only if not in Fullscreen) */}
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
                style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
              >
                {isPlayerView ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{isPlayerView ? t("canvas.toolbar.playerViewLabel") : "👁 Vista DM"}</span>
              </button>
            )}

            {/* Public / Private toggle (Only if not in Player View) */}
            {!isPlayerView && (
              <button
                type="button"
                className={`btn btn-sm ${publicOnly ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setPublicOnly(v => !v)}
                title={publicOnly ? t("canvas.toolbar.showingPublicOnly") : t("canvas.toolbar.showingAll")}
                style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
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
                aria-pressed={tablePrivacy}
                title={t("canvas.toolbar.tablePrivacyHint")}
              >
                <Shield size={12} aria-hidden="true" />
                <span>{t("canvas.toolbar.tablePrivacy")}</span>
              </button>
            )}

            {/* Mystery Flow Toggle */}
            {!isPlayerView && (
              <button
                type="button"
                className={`btn btn-sm ${mysteryFlowMode ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setMysteryFlowMode(v => !v)}
                title={mysteryFlowMode ? "Desactivar Mystery Flow" : t("canvas.toolbar.activateMysteryFlow")}
                style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
              >
                <span>{mysteryFlowMode ? "🔍 Mystery Flow" : "Ver Misterio"}</span>
              </button>
            )}
          </div>

          <div className="canvas-toolbar-divider" />

          {/* Grupo 3: Filtros, Densidad y Relaciones */}
          <div className="canvas-toolbar-group">
            {/* Densidad Selector */}
            <select
              value={density}
              onChange={(e) => {
                const nextDensity = e.target.value;
                if (isCanvasDensity(nextDensity)) {
                  setDensity(nextDensity);
                }
              }}
              className="canvas-select"
              style={{ fontSize: "11px", padding: "2px 6px", height: "26px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-main)" }}
            >
              <option value="compact">🗜️ Densidad: Compacta</option>
              <option value="normal">📱 Densidad: Normal</option>
              <option value="detailed">📋 Densidad: Detallada</option>
            </select>

            {/* Relaciones Filter */}
            {!isPlayerView && (
              <select
                value={relationsFilter}
                onChange={(e) => setRelationsFilter(e.target.value as typeof relationsFilter)}
                className="canvas-select"
                style={{ fontSize: "11px", padding: "2px 6px", height: "26px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-main)" }}
                title={t("canvas.toolbar.filterConnections")}
              >
                <option value="all">🔗 Relaciones: Todas</option>
                <option value="public">🌐 Relaciones: Públicas</option>
                <option value="secret">🔴 Relaciones: Secretas</option>
                <option value="selection">🎯 Relaciones: Selección</option>
              </select>
            )}

            {/* Type Filter Select */}
            {!isPlayerView && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="canvas-select"
                style={{ fontSize: "11px", padding: "2px 6px", height: "26px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-main)" }}
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
            )}
          </div>

          <div className="canvas-toolbar-divider" />

          {/* Grupo 4: Acciones Dropdown */}
          <div className="canvas-toolbar-group" style={{ position: "relative" }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setIsActionsDropdownOpen(v => !v)}
              title="Acciones y exportaciones de Canvas"
              style={{ fontSize: "11px", padding: "4px 8px", height: "26px" }}
            >
              <span>⚙️ Acciones ▼</span>
            </button>
            {isActionsDropdownOpen && (
              <div className="dropdown-menu" style={{ position: "absolute", top: "30px", right: 0, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", zIndex: 1000, minWidth: "180px", boxShadow: "var(--shadow-lg)", padding: "4px" }}>
                {!isPlayerView && (
                  <>
                    <button className="dropdown-item" onClick={() => { setIsImportOpen(true); setIsActionsDropdownOpen(false); }}>✏️ Importar por Texto</button>
                    <button className="dropdown-item" onClick={() => { setIsLintOpen(v => !v); setIsActionsDropdownOpen(false); }}>🧠 Analizar Lore (Lint)</button>
                    <button className="dropdown-item" onClick={() => { setIsLegendOpen(true); setIsActionsDropdownOpen(false); }}>📖 Ver Leyenda</button>
                    <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "4px 0" }} />
                  </>
                )}
                <div style={{ fontSize: "9px", padding: "4px 12px", color: "var(--text-muted)", fontWeight: "bold" }}>EXPORTACIONES</div>
                <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("svg", "dm"), "No se pudo exportar el canvas en SVG para DM."); setIsActionsDropdownOpen(false); }}>Vector SVG - Vista DM</button>
                <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("svg", "player"), "No se pudo exportar el canvas en SVG para jugadores."); setIsActionsDropdownOpen(false); }}>Vector SVG - Vista Jugador</button>
                <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("png", "dm"), "No se pudo exportar el canvas en PNG para DM."); setIsActionsDropdownOpen(false); }}>Imagen PNG - Vista DM</button>
                <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("png", "player"), "No se pudo exportar el canvas en PNG para jugadores."); setIsActionsDropdownOpen(false); }}>Imagen PNG - Vista Jugador</button>
              </div>
            )}
          </div>
        </div>

        {activeCanvas && (
          <div className="canvas-board-info" style={{ marginLeft: "auto" }}>
            <span
              className="badge badge-primary"
              title={activeCanvas.description || undefined}
              style={{ cursor: activeCanvas.description ? "help" : undefined }}
            >
              {activeCanvas.kind}
            </span>
          </div>
        )}
      </div>

      {/* Create Board Modal Overlay */}
      {isCreateBoardOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateBoardOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2>Crear nuevo tablero visual</h2>
              <button onClick={() => setIsCreateBoardOpen(false)} className="modal-close-btn"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateBoard}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label>Nombre del tablero</label>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder={t("canvas.page.importExamplePlaceholder")}
                    className="form-input"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de Tablero</label>
                  <select
                    value={newBoardKind}
                    onChange={(e) => setNewBoardKind(e.target.value as Canvas["kind"])}
                    className="form-select"
                  >
                    <option value="world">Mapa del Mundo / Estructura General</option>
                    <option value="session">Preparación de Sesión (Escenas, encuentros)</option>
                    <option value="mystery">Mapa de Conspiración (Pistas, sospechosos)</option>
                    <option value="location">Ubicación / Mazmorra (Salas, trampas)</option>
                    <option value="characters">Personajes (Relaciones sociales, familias)</option>
                    <option value="custom">Tablero en blanco personalizado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Plantilla de inicio</label>
                  <select
                    value={newBoardTemplate}
                    onChange={(e) => setNewBoardTemplate(e.target.value)}
                    className="form-select"
                  >
                    <option value="custom">Ninguna (Tablero en blanco)</option>
                    <option value="mystery">🕵️ Misterio (Pistas, sospechosos y secretos)</option>
                    <option value="faction">🛡️ Facción (Líder, agentes y recursos)</option>
                    <option value="city">🏙️ Ciudad (Barrios, PNJ y rumores)</option>
                    <option value="session">🎬 Sesión (Línea de escenas secuenciales)</option>
                    <option value="dungeon">🏰 Mazmorra (Entrada, salas y monstruos)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateBoardOpen(false)}>
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear tablero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Text Modal Overlay */}
      {isImportOpen && (
        <div className="modal-overlay" onClick={() => setIsImportOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>✏️ Importación rápida por texto</h2>
              <button onClick={() => setIsImportOpen(false)} className="modal-close-btn">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                Escribe o pega texto estructurado. Usa <code># Grupo</code> para agrupar, <code>[Tipo] Nombre</code> para declarar entidades y <code>Origen -&gt; Relación -&gt; Destino</code> para enlazarlas.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={t("canvas.page.importExampleContent")}
                rows={10}
                className="form-textarea"
                style={{ fontFamily: "monospace", fontSize: "0.82rem", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-main)", padding: "10px" }}
              />
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Tipos de entidad: NPC (pnj), PC (pj), Lugar, Faccion, Pista, Secreto, Mision, Objeto, Criatura, Escena, Consecuencia, Rumor, Nota.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsImportOpen(false)}>
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleImportText}
              >
                Importar al lienzo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend Modal Overlay */}
      {isLegendOpen && (
        <div className="modal-overlay" onClick={() => setIsLegendOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "320px" }}>
            <div className="modal-header">
              <h2>📖 Leyenda del Canvas</h2>
              <button onClick={() => setIsLegendOpen(false)} className="modal-close-btn" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", color: "var(--primary)" }}>VISIBILIDAD</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <span style={{ fontSize: "12px" }}>🔒</span>
                <div><strong>Secreto DM</strong>: Visible solo para el DM.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <span style={{ fontSize: "12px" }}>🕯</span>
                <div><strong>Parcial</strong>: Revelado parcialmente.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <span style={{ fontSize: "12px" }}>👁</span>
                <div><strong>Revelado</strong>: Visible públicamente para jugadores.</div>
              </div>

              <div style={{ fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", marginTop: "8px", color: "var(--primary)" }}>ENTIDADES</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><UserCheck size={12} color="#3b82f6" /> <span>🎭 PNJ</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><User size={12} color="#6366f1" /> <span>👤 PJ</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={12} color="#10b981" /> <span>📍 Lugar</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Shield size={12} color="#f59e0b" /> <span>🏛 Facción</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><HelpCircle size={12} color="#eab308" /> <span>🧩 Pista</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Key size={12} color="#ef4444" /> <span>🔑 Secreto</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Award size={12} color="#f97316" /> <span>🏆 Misión</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Film size={12} color="#64748b" /> <span>🎬 Escena</span></div>
              </div>

              <div style={{ fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", marginTop: "8px", color: "var(--primary)" }}>RELACIONES</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <div style={{ width: "24px", height: "2px", backgroundColor: "#ef4444", borderStyle: "dashed" }} />
                <div><strong>Línea Roja Punteada</strong>: Secreto DM.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <div style={{ width: "24px", height: "2px", backgroundColor: "rgba(167, 139, 250, 0.6)", borderStyle: "dashed" }} />
                <div><strong>Línea Violeta Punteada</strong>: Ancla de secreto.</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
            boxShadow: "var(--shadow-lg)",
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
                      <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                        <span style={{ fontSize: "2rem" }}>✨</span>
                        <p style={{ marginTop: "10px", color: "var(--success)", fontWeight: "600" }}>¡Todo perfecto!</p>
                        <p style={{ fontSize: "0.85rem" }}>No se han detectado problemas de consistencia narrativa en tu canvas.</p>
                      </div>
                    );
                  }
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Se han encontrado <strong>{issues.length}</strong> detalles a revisar:
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
                        {issues.map((iss) => (
                          <div
                            key={iss.id}
                            style={{
                              padding: "10px",
                              borderRadius: "var(--radius-sm)",
                              borderLeft: `3px solid ${iss.type === "error" ? "var(--color-critical)" : iss.type === "warning" ? "var(--color-warning)" : "var(--primary)"}`,
                              backgroundColor: "var(--bg-input)",
                              fontSize: "0.82rem",
                              lineHeight: "1.4"
                            }}
                          >
                            <div style={{ fontWeight: "600", marginBottom: "4px", color: iss.type === "error" ? "var(--color-critical)" : iss.type === "warning" ? "var(--color-warning)" : "var(--text-main)" }}>
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
                                style={{ padding: 0, marginTop: "6px", fontSize: "10px", color: "var(--primary)", border: "none", background: "transparent", cursor: "pointer" }}
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


          {!isPlayerView && (
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
                    const entIds = selectedNodes.filter((n) => n.type === "entity" && n.data.entityId).map((n) => n.data.entityId as string);
                    const sceneIds = selectedNodes
                      .filter((n) => n.type === "entity" && n.data.entityType === "scene" && n.data.entityId)
                      .map((n) => n.data.entityId as string);
                    const clueIds = selectedNodes
                      .filter((n) => n.type === "entity" && n.data.entityType === "clue" && n.data.entityId)
                      .map((n) => n.data.entityId as string);
                    const secretIds = selectedNodes
                      .filter((n) => n.type === "entity" && n.data.entityType === "secret" && n.data.entityId)
                      .map((n) => n.data.entityId as string);
                    const consequenceIds = selectedNodes
                      .filter((n) => n.type === "entity" && n.data.entityType === "consequence" && n.data.entityId)
                      .map((n) => n.data.entityId as string);
                    
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
    </div>
  );
}

function SessionPrepForm({
  activeSession,
  preparedSessions,
  selectedCount,
  elementNames,
  onSubmit,
  onCancel
}: {
  activeSession: Session | undefined;
  preparedSessions: Session[];
  selectedCount: number;
  elementNames: string[];
  onSubmit: (title: string, mode: "new" | "active" | "prepared", targetSessionId?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [sessionTitle, setSessionTitle] = useState(() => t("canvas.node.typeSession"));
  const [targetMode, setTargetMode] = useState<"new" | "active" | "prepared">(activeSession ? "active" : preparedSessions.length > 0 ? "prepared" : "new");
  const [targetSessionId, setTargetSessionId] = useState(() => preparedSessions[0]?.sessionId ?? "");
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    void onSubmit(sessionTitle, targetMode, targetMode === "prepared" ? targetSessionId : undefined).then(
      () => {
        setBusy(false);
      },
      (error: unknown) => {
        console.error("No se pudo preparar la sesión desde el canvas.", error);
        setBusy(false);
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="dialog-form">
      <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p style={{ fontSize: "0.93rem" }}>
          {t("sessionPage.selectedElementsIntro", { count: selectedCount })}
        </p>
        <div style={{ maxHeight: "100px", overflowY: "auto", padding: "8px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>
          {elementNames.join(", ")}
        </div>

        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
          {activeSession && (
            <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
              <input
                type="radio"
                name="sessionPrepMode"
                checked={targetMode === "active"}
                onChange={() => setTargetMode("active")}
                style={{ marginTop: "3px" }}
              />
              <div>
                <strong>{t("sessionPage.addToActiveSessionLabel", { title: activeSession.title })}</strong>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {t("sessionPage.addToActiveSessionHelp")}
                </div>
              </div>
            </label>
          )}

          {preparedSessions.length > 0 && (
            <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
              <input
                type="radio"
                name="sessionPrepMode"
                checked={targetMode === "prepared"}
                onChange={() => setTargetMode("prepared")}
                style={{ marginTop: "3px" }}
              />
              <div style={{ flex: 1 }}>
                <strong>{t("sessionPage.addToPreparedSessionLabel")}</strong>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                  {t("sessionPage.addToPreparedSessionHelp")}
                </div>
                {targetMode === "prepared" && (
                  <select className="form-select" value={targetSessionId} onChange={(e) => setTargetSessionId(e.target.value)} required>
                    {preparedSessions.map((session: Session) => (
                      <option key={session.sessionId} value={session.sessionId}>
                        {session.number ? `#${session.number} ` : ""}{session.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>
          )}

          <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
            <input
              type="radio"
              name="sessionPrepMode"
              checked={targetMode === "new"}
              onChange={() => setTargetMode("new")}
              style={{ marginTop: "3px" }}
            />
            <div>
              <strong>{t("sessionPage.createPreparedSessionWithElements")}</strong>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {t("sessionPage.createPreparedSessionHelp")}
              </div>
            </div>
          </label>
        </div>

        {targetMode === "new" && (
          <div className="form-group">
            <label>{t("sessionPage.preparedSessionTitleLabel")}</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="form-input"
              required
              placeholder={t("canvas.page.sessionNamePlaceholder")}
            />
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("sessionPage.savingPreparation") : targetMode === "new" ? t("sessionPage.createPreparation") : targetMode === "prepared" ? t("sessionPage.addToPreparationButton") : t("canvas.page.loadIntoSession")}
        </button>
      </div>
    </form>
  );
}
