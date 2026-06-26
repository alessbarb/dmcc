import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import { Plus, Eye, EyeOff, AlertTriangle, X, Maximize, ExternalLink, Lock } from "lucide-react";
import type { Entity } from "../stores/campaignStore.js";
import { useCampaignStore } from "../stores/campaignStore.js";
import { findNarrativeAnchor, findUndirectedShortestPath } from "../features/graph/findNarrativePath.js";
import { GraphNodeSearch } from "../components/GraphNodeSearch.js";
import type { GraphSearchItem } from "../components/GraphNodeSearch.js";
import { EntityDetailModal } from "../components/EntityDetailModal.js";
import { getEntityDefaultImage } from "../utils/entityVisuals.js";
import { useToast } from "../hooks/useToast.js";

export interface GraphPageProps {
  graph?: any;
  campaignState?: any;
  selectedEntity?: any;
  setSelectedEntity?: (e: any) => void;
  graphTypeFilter?: string[];
  setGraphTypeFilter?: (filter: string[] | ((prev: string[]) => string[])) => void;
  setIsRelationModalOpen?: (open: boolean) => void;
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  player_character: "#6366f1",
  npc: "#3b82f6",
  location: "#10b981",
  faction: "#f59e0b",
  quest: "#f97316",
  clue: "#eab308",
  secret: "#ef4444",
  item: "#8b5cf6",
  creature: "#dc2626",
  encounter: "#0891b2",
  scene: "#64748b",
  front: "#7c3aed",
  clock: "#0ea5e9",
  decision: "#d97706",
  consequence: "#b45309",
  rumor: "#6b7280",
  rule_reference: "#374151",
  handout: "#1d4ed8",
  note: "#475569",
};

const TYPE_LABEL_ES: Record<string, string> = {
  player_character: "PJ", npc: "PNJ", location: "Ubicación", quest: "Misión",
  clue: "Pista", secret: "Secreto", faction: "Facción", consequence: "Consecuencia",
  clock: "Reloj", item: "Objeto", creature: "Criatura", encounter: "Encuentro",
  scene: "Escena", front: "Frente", decision: "Decisión", rumor: "Rumor",
  rule_reference: "Regla", handout: "Documento", note: "Nota",
};

const RELATION_LABELS_ES: Record<string, string> = {
  hides: "oculta", unlocks: "desbloquea", points_to: "apunta a", causes: "causa",
  contradicts: "contradice", confirms: "confirma", knows: "conoce", fears: "teme",
  located_in: "ubicado en", member_of: "miembro de", leader_of: "lidera",
  threatens: "amenaza", trusts: "confía en", hates: "odia", loves: "ama",
  ally_of: "aliado de", enemy_of: "enemigo de", reveals: "revela", blocks: "bloquea",
  foreshadows: "presagia", depends_on: "depende de", affected_by: "afectado por",
  created_by: "creado por", protects: "protege", suspects: "sospecha de",
  knows_partially: "conoce parcialmente", lies_about: "miente sobre",
  appears_in: "aparece en", contains: "contiene", lives_in: "vive en",
  works_for: "trabaja para", owes_debt_to: "le debe a", transforms_into: "se transforma en",
};

type FilterPreset = "todos" | "nextSession" | "criticalClues" | "unrevealedSecrets" | "misiones" | "personajes" | "secretos" | "lugares" | "facciones" | "consecuencias";
type ViewMode = "all" | "dm_only" | "players";

const PRESET_TYPES: Record<string, string[] | null> = {
  todos: null,
  misiones: ["quest", "clue", "consequence"],
  personajes: ["npc", "player_character"],
  secretos: ["secret"],
  lugares: ["location"],
  facciones: ["faction"],
  consecuencias: ["consequence", "front", "clock"],
};

const PRESET_LABELS: Record<FilterPreset, string> = {
  todos: "Todos",
  nextSession: "Próxima Sesión ⭐",
  criticalClues: "Pistas Críticas 🔍",
  unrevealedSecrets: "Secretos sin Revelar 🔑",
  misiones: "Misiones",
  personajes: "Personajes",
  secretos: "Secretos",
  lugares: "Lugares",
  facciones: "Facciones",
  consecuencias: "Consecuencias",
};

function hexToInt(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

function getNodeRadius(importance?: string): number {
  switch (importance) {
    case "critical": return 7.5;
    case "high": return 5.5;
    case "low": return 2.2;
    case "normal":
    default: return 3.5;
  }
}

export function GraphPage(props: GraphPageProps = {}) {
  const store = useCampaignStore();
  const campaignState = props.campaignState ?? store.campaignState;
  const graph = props.graph ?? store.graph ?? { nodes: [], links: [] };
  const setIsRelationModalOpen = props.setIsRelationModalOpen ?? store.setIsRelationModalOpen;
  const setSelectedEntity = props.setSelectedEntity ?? ((_e: any) => { });

  const { addToast } = useToast();
  const [preset, setPreset] = useState<FilterPreset>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [labelsMode, setLabelsMode] = useState<"Auto" | "Todas" | "Mínimas">("Auto");
  const [localPanelEntity, setPanelEntity] = useState<any>(null);
  const [detailEntityOpen, setDetailEntityOpen] = useState(false);
  const selectedEntity = props.selectedEntity ?? localPanelEntity;
  const panelEntity = localPanelEntity ?? props.selectedEntity ?? null;
  const [containerSize, setContainerSize] = useState({ w: 900, h: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const hoveredNodeRef = useRef<any>(null);
  const panelEntityRef = useRef<any>(null);
  const [hasZoomed, setHasZoomed] = useState(false);
  const [pendingFocusNodeId, setPendingFocusNodeId] = useState<string | null>(null);

  useEffect(() => { panelEntityRef.current = panelEntity; }, [panelEntity]);

  useEffect(() => {
    setHasZoomed(false);
  }, [campaignState?.campaign?.campaignId]);

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: width || 900, h: height || 600 });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Tune d3 forces after mount to keep nodes close
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const charge = fg.d3Force("charge");
    if (charge) charge.strength(-70);
    const link = fg.d3Force("link");
    if (link) link.distance(45);
  });

  const entitiesArr: Entity[] = Array.from(
    (campaignState?.entities instanceof Map
      ? campaignState.entities.values()
      : Object.values(campaignState?.entities ?? {})) as Iterable<Entity>
  );

  const relationsArr: any[] = Array.from(
    (campaignState?.relations instanceof Map
      ? campaignState.relations.values()
      : Object.values(campaignState?.relations ?? {})) as Iterable<any>
  );

  const graphSearchItems = useMemo<GraphSearchItem[]>(() => {
    const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];

    return nodes.map((node: any) => {
      const nodeId = String(node.id ?? "");
      const entity = entitiesArr.find((e) => e.entityId === nodeId);
      const rawType = entity?.entityType ?? node.type ?? "unknown";

      return {
        nodeId,
        title: entity?.title ?? node.name ?? nodeId,
        type: TYPE_LABEL_ES[rawType] ?? rawType,
        summary: entity?.summary ?? "",
        content: entity?.content ?? "",
        status: entity?.status ?? "",
        importance: entity?.importance ?? "",
        metadataText: entity?.metadata
          ? Object.values(entity.metadata)
            .filter((value) => typeof value === "string" || typeof value === "number")
            .join(" ")
          : "",
      };
    });
  }, [entitiesArr, graph]);

  // Next session entity calculation helper
  const getNextSessionEntityIds = useCallback(() => {
    const direct = new Set<string>();
    entitiesArr.forEach((e) => {
      const isPinned = e.metadata?.pinned === true || e.metadata?.nextSession === true;
      const isMainActiveQuest = e.entityType === "quest" && e.status === "active" && (e.importance === "critical" || e.importance === "high");
      if (isPinned || isMainActiveQuest) {
        direct.add(e.entityId);
      }
    });

    const finalIds = new Set(direct);
    relationsArr.forEach((r) => {
      if (r.archived) return;
      const sourceDirect = direct.has(r.sourceEntityId);
      const targetDirect = direct.has(r.targetEntityId);
      if (sourceDirect || targetDirect) {
        const otherId = sourceDirect ? r.targetEntityId : r.sourceEntityId;
        const other = entitiesArr.find((e) => e.entityId === otherId);
        if (other) {
          const isClueOrConsequence = other.entityType === "clue" || other.entityType === "consequence";
          const isCriticalOrHigh = other.importance === "critical" || other.importance === "high";
          if (isClueOrConsequence && isCriticalOrHigh) {
            finalIds.add(otherId);
          }
        }
      }
    });

    return finalIds;
  }, [entitiesArr, relationsArr]);

  const nextSessionIds = preset === "nextSession" ? getNextSessionEntityIds() : new Set<string>();

  const visibleEntities = entitiesArr.filter((e: Entity) => {
    if ((e as any).archived) return false;
    if (viewMode === "dm_only" && (e as any).visibility?.kind !== "dm_only") return false;
    if (viewMode === "players" && (e as any).visibility?.kind === "dm_only") return false;

    if (preset === "todos") return true;
    if (preset === "nextSession") return nextSessionIds.has(e.entityId);
    if (preset === "criticalClues") return e.entityType === "clue" && (e.importance === "critical" || e.importance === "high");
    if (preset === "unrevealedSecrets") return e.entityType === "secret" && e.status !== "revealed" && e.status !== "resolved" && e.visibility?.kind === "dm_only";

    const allowedTypes = PRESET_TYPES[preset];
    if (allowedTypes && !allowedTypes.includes(e.entityType)) return false;
    return true;
  });

  const visibleIds = new Set(visibleEntities.map((e: Entity) => e.entityId));

  const graphData = {
    nodes: visibleEntities.map((e: Entity) => ({
      id: e.entityId,
      title: e.title,
      entityType: e.entityType,
      entityData: e,
      importance: e.importance,
      val: getNodeRadius(e.importance),
    })),
    links: relationsArr
      .filter((r: any) => !r.archived && visibleIds.has(r.sourceEntityId) && visibleIds.has(r.targetEntityId))
      .map((r: any) => ({
        source: r.sourceEntityId,
        target: r.targetEntityId,
        relationType: r.relationType,
        label: RELATION_LABELS_ES[r.relationType] ?? (r.relationType?.replace("custom:", "") ?? ""),
      })),
  };

  const selectGraphEntity = useCallback((entity: Entity | null) => {
    setPanelEntity(entity);
    setSelectedEntity(entity);
  }, [setSelectedEntity]);

  const focusVisibleNode = useCallback((nodeId: string) => {
    const visibleNode = graphData.nodes.find((node: any) => node.id === nodeId) as any | undefined;
    const entity = entitiesArr.find((e) => e.entityId === nodeId);

    if (!visibleNode || !entity) {
      return false;
    }

    selectGraphEntity(entity);

    window.setTimeout(() => {
      const d = 90;
      const x = visibleNode.x ?? 0;
      const y = visibleNode.y ?? 0;
      const z = visibleNode.z ?? 0;
      fgRef.current?.cameraPosition({ x: x + d, y: y + d * 0.35, z: z + d }, { x, y, z }, 900);
    }, 80);

    return true;
  }, [entitiesArr, graphData.nodes, selectGraphEntity]);

  const focusGraphNode = useCallback((nodeId: string) => {
    const isVisible = graphData.nodes.some((node: any) => node.id === nodeId);

    if (!isVisible) {
      setPreset("todos");
      setViewMode("all");
      setPendingFocusNodeId(nodeId);
      return;
    }

    focusVisibleNode(nodeId);
  }, [focusVisibleNode, graphData.nodes]);

  useEffect(() => {
    if (!pendingFocusNodeId) return;

    const isNowVisible = graphData.nodes.some((node: any) => node.id === pendingFocusNodeId);
    if (!isNowVisible) return;

    const nodeId = pendingFocusNodeId;
    setPendingFocusNodeId(null);
    window.setTimeout(() => {
      focusVisibleNode(nodeId);
    }, 120);
  }, [focusVisibleNode, graphData.nodes, pendingFocusNodeId]);

  const panelRelations = panelEntity
    ? relationsArr.filter((r: any) =>
      !r.archived && (r.sourceEntityId === panelEntity.entityId || r.targetEntityId === panelEntity.entityId)
    )
    : [];

  const relatedFacts = panelEntity
    ? (campaignState?.facts ?? []).filter((f: any) =>
      !f.archived && f.relatedEntityIds?.includes(panelEntity.entityId)
    )
    : [];

  // Shortest path BFS logic to the anchor
  const narrativeAnchorId = findNarrativeAnchor(graphData.nodes);
  const narrativePath = (selectedEntity && narrativeAnchorId && selectedEntity.entityId !== narrativeAnchorId)
    ? findUndirectedShortestPath(graphData.nodes, graphData.links, selectedEntity.entityId, narrativeAnchorId)
    : null;

  const getLinkId = (nodeVal: any): string => {
    if (typeof nodeVal === "object" && nodeVal !== null) {
      return nodeVal.id ?? "";
    }
    return String(nodeVal);
  };

  const isLinkOnPath = useCallback((link: any): boolean => {
    if (!narrativePath) return false;
    const u = getLinkId(link.source);
    const v = getLinkId(link.target);
    const uIdx = narrativePath.indexOf(u);
    const vIdx = narrativePath.indexOf(v);
    return uIdx !== -1 && vIdx !== -1 && Math.abs(uIdx - vIdx) === 1;
  }, [narrativePath]);

  const getLinkColor = useCallback((link: any) => {
    if (narrativePath) {
      return isLinkOnPath(link) ? "#10b981" : "rgba(148,163,184,0.15)";
    }
    return "rgba(148,163,184,0.55)";
  }, [narrativePath, isLinkOnPath]);

  const getLinkWidth = useCallback((link: any) => {
    if (narrativePath) {
      return isLinkOnPath(link) ? 3.5 : 1.0;
    }
    return 1.5;
  }, [narrativePath, isLinkOnPath]);

  const getLinkDirectionalArrowColor = useCallback((link: any) => {
    if (narrativePath) {
      return isLinkOnPath(link) ? "#10b981" : "rgba(148,163,184,0.15)";
    }
    return "rgba(148,163,184,0.7)";
  }, [narrativePath, isLinkOnPath]);

  // STABLE nodeThreeObject
  const nodeThreeObject = useCallback((node: any) => {
    const isDmOnly = node.entityData?.visibility?.kind === "dm_only";
    const isPending = node.entityData?.status === "pending" || node.entityData?.status === "suspected";
    const isResolved = node.entityData?.status === "resolved" || node.entityData?.status === "revealed";

    const color = ENTITY_TYPE_COLORS[node.entityType] ?? "#6366f1";
    const colorInt = hexToInt(color);
    const r = node.val ?? 3.5;
    const group = new THREE.Group();

    const coreMat = new THREE.MeshLambertMaterial({ color: colorInt, transparent: true, opacity: isResolved ? 0.4 : 0.9 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), coreMat);
    group.add(core);

    let glowColorInt = colorInt;
    let glowOpacity = 0.15;

    if (isDmOnly) {
      glowColorInt = hexToInt("#a855f7"); // violet
      glowOpacity = 0.35;
    } else if (isPending) {
      glowColorInt = hexToInt("#f97316"); // orange
      glowOpacity = 0.3;
    }

    if (isResolved) {
      glowOpacity = 0.05;
    }

    const glowMat = new THREE.MeshLambertMaterial({ color: glowColorInt, transparent: true, opacity: glowOpacity, side: THREE.BackSide });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(r * 1.9, 10, 10), glowMat);
    group.add(glow);

    const sprite = new SpriteText(node.title) as SpriteText & { position: { y: number } };
    sprite.color = "rgba(203,213,225,0.75)";
    sprite.textHeight = Math.max(2.5, r * 0.6);
    sprite.fontWeight = "600";
    sprite.backgroundColor = "transparent";
    sprite.padding = 0;
    sprite.position.y = r + 5;
    group.add(sprite);

    node._coreMat = coreMat;
    node._glowMat = glowMat;
    node._sprite = sprite;

    return group;
  }, []);

  // Highlighting and visibility sync effect
  useEffect(() => {
    graphData.nodes.forEach((node: any) => {
      if (!node._sprite || !node._coreMat) return;

      const isPlayerChar = node.entityType === "player_character";
      const isSelected = selectedEntity && selectedEntity.entityId === node.id;
      const isHovered = hoveredNodeRef.current && hoveredNodeRef.current.id === node.id;
      const isOnPath = narrativePath && narrativePath.includes(node.id);

      // Label visibility
      let isLabelVisible = false;
      if (labelsMode === "Todas") {
        isLabelVisible = true;
      } else if (labelsMode === "Mínimas") {
        isLabelVisible = isSelected || isPlayerChar || isOnPath;
      } else {
        // Auto
        const importance = node.entityData?.importance;
        const isImportant = importance === "critical" || importance === "high";
        isLabelVisible = isImportant || isPlayerChar || isSelected || isHovered || isOnPath;
      }
      node._sprite.visible = isLabelVisible;

      // Text highlighting style
      const isHighlighted = isSelected || isHovered;
      node._sprite.color = isHighlighted ? "#ffffff" : "rgba(203,213,225,0.75)";
      node._sprite.textHeight = isHighlighted ? Math.max(3.5, (node.val ?? 3.5) * 0.8) : Math.max(2.5, (node.val ?? 3.5) * 0.6);

      // Narrative path fading
      const isDmOnly = node.entityData?.visibility?.kind === "dm_only";
      const isPending = node.entityData?.status === "pending" || node.entityData?.status === "suspected";
      const isResolved = node.entityData?.status === "resolved" || node.entityData?.status === "revealed";
      const baseCoreOpacity = isResolved ? 0.4 : 0.9;

      let baseGlowOpacity = isResolved ? 0.05 : 0.15;
      if (isDmOnly) baseGlowOpacity = 0.35;
      else if (isPending) baseGlowOpacity = 0.3;

      let fadeFactor = 1.0;
      if (narrativePath) {
        const isNodeOnPath = narrativePath.includes(node.id);
        if (!isNodeOnPath) {
          fadeFactor = 0.20;
        }
      }

      node._coreMat.opacity = baseCoreOpacity * fadeFactor;
      if (node._glowMat) {
        node._glowMat.opacity = baseGlowOpacity * fadeFactor;
      }
      node._sprite.material.opacity = fadeFactor;
    });
  }, [labelsMode, selectedEntity, narrativePath, graphData.nodes]);

  const applyHighlight = useCallback((node: any, active: boolean) => {
    if (!node) return;

    const isPlayerChar = node.entityType === "player_character";
    const isSelected = selectedEntity && selectedEntity.entityId === node.id;
    const isOnPath = narrativePath && narrativePath.includes(node.id);

    let isLabelVisible = false;
    if (labelsMode === "Todas") {
      isLabelVisible = true;
    } else if (labelsMode === "Mínimas") {
      isLabelVisible = isSelected || isPlayerChar || isOnPath;
    } else {
      const importance = node.entityData?.importance;
      const isImportant = importance === "critical" || importance === "high";
      isLabelVisible = isImportant || isPlayerChar || isSelected || active || isOnPath;
    }

    if (node._sprite) {
      node._sprite.visible = isLabelVisible;
      const isHighlighted = isSelected || active;
      node._sprite.color = isHighlighted ? "#ffffff" : "rgba(203,213,225,0.75)";
      node._sprite.textHeight = isHighlighted ? Math.max(3.5, (node.val ?? 3.5) * 0.8) : Math.max(2.5, (node.val ?? 3.5) * 0.6);
    }

    if (node._glowMat) {
      const isDmOnly = node.entityData?.visibility?.kind === "dm_only";
      const isPending = node.entityData?.status === "pending" || node.entityData?.status === "suspected";
      const isResolved = node.entityData?.status === "resolved" || node.entityData?.status === "revealed";

      let baseGlowOpacity = isResolved ? 0.05 : 0.15;
      if (isDmOnly) baseGlowOpacity = 0.35;
      else if (isPending) baseGlowOpacity = 0.3;

      let fadeFactor = 1.0;
      if (narrativePath) {
        const isNodeOnPath = narrativePath.includes(node.id);
        if (!isNodeOnPath) {
          fadeFactor = 0.20;
        }
      }

      node._glowMat.opacity = active ? (baseGlowOpacity * 2.5 * fadeFactor) : (baseGlowOpacity * fadeFactor);
    }
  }, [labelsMode, selectedEntity, narrativePath]);

  const handleNodeHover = useCallback((node: any) => {
    if (hoveredNodeRef.current === node) return;
    applyHighlight(hoveredNodeRef.current, false);
    hoveredNodeRef.current = node;
    applyHighlight(node, true);
    document.body.style.cursor = node ? "pointer" : "default";
  }, [applyHighlight]);

  const handleNodeClick = useCallback((node: any) => {
    focusVisibleNode(node.id);
  }, [focusVisibleNode]);

  const handleZoomToFit = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(800, 40);
    }
  }, []);

  // Initial fit zoom on campaign load
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0 && !hasZoomed) {
      const timer = setTimeout(() => {
        fgRef.current.zoomToFit(1000, 50);
        setHasZoomed(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [graphData.nodes.length, hasZoomed]);

  const handleToggleNextSession = async () => {
    if (!panelEntity) return;
    const isPinned = panelEntity.metadata?.nextSession === true || panelEntity.metadata?.pinned === true;
    const currentMeta = panelEntity.metadata ?? {};
    const nextVal = !isPinned;
    const updatedMeta = { ...currentMeta, nextSession: nextVal, pinned: nextVal };

    await store.updateEntity(panelEntity.entityId, { metadata: updatedMeta });

    const updatedEntity = { ...panelEntity, metadata: updatedMeta };
    setPanelEntity(updatedEntity);
    setSelectedEntity(updatedEntity);
  };

  const handleToggleVisibility = async () => {
    if (!panelEntity) return;
    const isDmOnly = panelEntity.visibility?.kind === "dm_only";

    if (isDmOnly && panelEntity.entityType === "secret") {
      const confirmed = window.confirm("⚠️ ADVERTENCIA: Estás a punto de revelar un Secreto a los jugadores. ¿Estás seguro de que deseas continuar?");
      if (!confirmed) return;
    }

    const nextKind = isDmOnly ? "party" : "dm_only";
    const updatedVisibility = { ...panelEntity.visibility, kind: nextKind };

    await store.updateEntity(panelEntity.entityId, { visibility: updatedVisibility });

    const updatedEntity = { ...panelEntity, visibility: updatedVisibility };
    setPanelEntity(updatedEntity);
    setSelectedEntity(updatedEntity);
  };

  const isEntityPinned = panelEntity?.metadata?.nextSession === true || panelEntity?.metadata?.pinned === true;

  const graphWidth = containerSize.w;
  const graphHeight = containerSize.h;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontWeight: "700" }}>Grafo narrativo</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
            {visibleEntities.length} nodos · {graphData.links.length} relaciones visibles
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setIsRelationModalOpen(true)}>
          <Plus size={16} /> Nueva relación
        </button>
      </div>

      {/* Search and Filters Row */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <GraphNodeSearch
          items={graphSearchItems}
          onSelectNode={focusGraphNode}
        />

        {/* Filters */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "4px" }}>Filtro:</span>
          {(Object.keys(PRESET_LABELS) as FilterPreset[]).map((p) => (
            <button key={p} className={`btn btn-sm ${preset === p ? "btn-primary" : "btn-secondary"}`} onClick={() => setPreset(p)}>
              {PRESET_LABELS[p]}
            </button>
          ))}
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "12px", marginRight: "4px" }}>Vista:</span>
          {(["all", "dm_only", "players"] as ViewMode[]).map((m) => (
            <button key={m} className={`btn btn-sm ${viewMode === m ? "btn-primary" : "btn-secondary"}`} onClick={() => setViewMode(m)}>
              {m === "all" ? "Todo" : m === "dm_only" ? "Solo DM" : "Solo jugadores"}
            </button>
          ))}
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "12px", marginRight: "4px" }}>Etiquetas:</span>
          {(["Auto", "Todas", "Mínimas"] as const).map((mode) => (
            <button key={mode} className={`btn btn-sm ${labelsMode === mode ? "btn-primary" : "btn-secondary"}`} onClick={() => setLabelsMode(mode)}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Graph + panel */}
      <div style={{ display: "flex", gap: "0", width: "100%", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-color)", height: "calc(100vh - 210px)", minHeight: "500px" }}>

        {/* 3D canvas */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            flex: "1 1 auto",
            minWidth: 0,
            overflow: "hidden",
            background: "#000008",
          }}
        >
          {visibleEntities.length === 0 ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "var(--text-muted)" }}>
              <AlertTriangle size={32} />
              <p>Sin entidades para este filtro</p>
            </div>
          ) : (
            <>
              <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                width={graphWidth}
                height={graphHeight}
                backgroundColor="#000008"
                nodeThreeObject={nodeThreeObject}
                nodeThreeObjectExtend={false}
                // Links visible
                linkColor={getLinkColor}
                linkWidth={getLinkWidth}
                linkOpacity={1}
                linkDirectionalArrowLength={(link: any) => isLinkOnPath(link) ? 7 : 5}
                linkDirectionalArrowRelPos={1}
                linkDirectionalArrowColor={getLinkDirectionalArrowColor}
                linkCurvature={0.1}
                // Interaction
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                onBackgroundClick={() => selectGraphEntity(null)}
                // Physics
                cooldownTicks={150}
                d3AlphaDecay={0.025}
                d3VelocityDecay={0.4}
                showNavInfo={false}
              />
              <button
                onClick={handleZoomToFit}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "rgba(15,23,42,0.85)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#f8fafc",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(30,41,59,0.9)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(15,23,42,0.85)"; }}
              >
                <Maximize size={13} /> Ajustar a pantalla
              </button>
            </>
          )}

          {/* Legend */}
          <div style={{
            position: "absolute", bottom: "16px", left: "16px",
            background: "rgba(0,0,12,0.85)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "8px", padding: "10px 14px", backdropFilter: "blur(8px)",
            pointerEvents: "none", maxWidth: "220px",
          }}>
            <p style={{ fontSize: "0.63rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)", marginBottom: "8px" }}>
              Leyenda
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 10px" }}>
              {Object.entries(ENTITY_TYPE_COLORS).map(([type, color]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.67rem" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
                  <span style={{ color: "rgba(203,213,225,0.75)" }}>{TYPE_LABEL_ES[type] ?? type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls hint */}
          <div style={{ position: "absolute", bottom: "16px", right: "16px", fontSize: "0.63rem", color: "rgba(100,116,139,0.45)", textAlign: "right", pointerEvents: "none", lineHeight: 1.7 }}>
            Rotar · clic + arrastrar<br />
            Zoom · scroll<br />
            Mover · clic derecho<br />
            Seleccionar · clic en nodo
          </div>
        </div>

        {/* Side panel */}
        {panelEntity && (
          <div style={{
            position: "relative",
            zIndex: 2,
            width: "290px",
            flex: "0 0 290px",
            background: "rgba(2,2,18,0.97)", borderLeft: "1px solid rgba(255,255,255,0.07)",
            display: "flex", flexDirection: "column", overflowY: "auto",
          }}>
            {/* Entity image */}
            {(() => {
              const imgUrl = panelEntity.metadata?.imageUrl || getEntityDefaultImage(panelEntity.entityType);
              const isDmOnly = panelEntity.visibility?.kind === "dm_only" || panelEntity.entityType === "secret";
              return (
                <div style={{ position: "relative", width: "100%", height: "160px", overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={imgUrl}
                    alt={isDmOnly ? "" : panelEntity.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: isDmOnly ? "grayscale(70%) brightness(30%)" : "none",
                      opacity: panelEntity.metadata?.imageUrl ? 1 : 0.5,
                      display: "block",
                    }}
                  />
                  {isDmOnly && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      backgroundColor: "rgba(6,7,14,0.45)",
                      color: "#ef4444", fontSize: "0.75rem", fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      <Lock size={14} /> Solo DM
                    </div>
                  )}
                  {/* gradient fade at the bottom */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "60px",
                    background: "linear-gradient(to top, rgba(2,2,18,0.97), transparent)",
                  }} />
                </div>
              );
            })()}

            {/* Header */}
            <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.63rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: ENTITY_TYPE_COLORS[panelEntity.entityType] ?? "#6366f1" }}>
                    {TYPE_LABEL_ES[panelEntity.entityType] ?? panelEntity.entityType}
                  </span>
                  {panelEntity.importance === "critical" && (
                    <span style={{ fontSize: "0.58rem", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                      CRITICAL
                    </span>
                  )}
                  {panelEntity.importance === "high" && (
                    <span style={{ fontSize: "0.58rem", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", background: "rgba(249,115,22,0.15)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" }}>
                      ALTO
                    </span>
                  )}
                </div>
                <button onClick={() => selectGraphEntity(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.5)", padding: 0 }}>
                  <X size={13} />
                </button>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0, color: "#e2e8f0", lineHeight: 1.3 }}>{panelEntity.title}</h3>
              {panelEntity.visibility && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: "rgba(100,116,139,0.55)", marginTop: "5px" }}>
                  {panelEntity.visibility.kind === "dm_only" ? <EyeOff size={10} /> : <Eye size={10} />}
                  {panelEntity.visibility.kind === "dm_only" ? "Solo DM" : "Visible para Jugadores"}
                  {isEntityPinned && <span style={{ marginLeft: "4px", color: "#fbbf24" }}>⭐ Fijado</span>}
                </div>
              )}
              {/* Ver detalle button */}
              <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                <button
                  onClick={() => setDetailEntityOpen(true)}
                  style={{
                    flex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                    fontSize: "0.72rem", fontWeight: 700,
                    padding: "6px 10px", borderRadius: "5px", cursor: "pointer",
                    border: "1px solid rgba(99,102,241,0.4)",
                    background: "rgba(99,102,241,0.12)", color: "#a5b4fc",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.22)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; }}
                >
                  <ExternalLink size={11} /> Ver detalle
                </button>
              </div>
            </div>

            {panelEntity.summary && (
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "0.76rem", color: "rgba(148,163,184,0.8)", margin: 0, lineHeight: 1.55 }}>{panelEntity.summary}</p>
              </div>
            )}

            {panelEntity.status && (
              <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 7px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "rgba(203,213,225,0.6)" }}>
                  Estado: {panelEntity.status}
                </span>
              </div>
            )}

            {/* Quick Actions (DM) */}
            {viewMode !== "players" && (
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(100,116,139,0.5)", margin: "0 0 4px 0" }}>
                  Acciones rápidas (DM)
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleToggleNextSession}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      fontSize: "0.72rem",
                      padding: "6px 8px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: isEntityPinned ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
                      color: isEntityPinned ? "#fbbf24" : "rgba(255,255,255,0.8)",
                      fontWeight: 600,
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = isEntityPinned ? "rgba(245,158,11,0.22)" : "rgba(255,255,255,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isEntityPinned ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)"; }}
                  >
                    <span>⭐</span> {isEntityPinned ? "Quitar Sesión" : "Próxima Sesión"}
                  </button>

                  <button
                    onClick={handleToggleVisibility}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      fontSize: "0.72rem",
                      padding: "6px 8px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: panelEntity.visibility?.kind === "dm_only" ? "rgba(255,255,255,0.04)" : "rgba(16,185,129,0.12)",
                      color: panelEntity.visibility?.kind === "dm_only" ? "rgba(255,255,255,0.8)" : "#34d399",
                      fontWeight: 600,
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = panelEntity.visibility?.kind === "dm_only" ? "rgba(255,255,255,0.08)" : "rgba(16,185,129,0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = panelEntity.visibility?.kind === "dm_only" ? "rgba(255,255,255,0.04)" : "rgba(16,185,129,0.12)"; }}
                  >
                    {panelEntity.visibility?.kind === "dm_only" ? <EyeOff size={11} /> : <Eye size={11} />}
                    {panelEntity.visibility?.kind === "dm_only" ? "Revelar" : "Ocultar"}
                  </button>
                </div>
              </div>
            )}

            {/* Entity-specific Narrative Details */}
            {panelEntity.entityType === "npc" && (
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {panelEntity.metadata?.role && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Rol</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.role}</p>
                  </div>
                )}
                {panelEntity.metadata?.attitudeToParty && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Actitud hacia el grupo</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4 }}>
                      {panelEntity.metadata.attitudeToParty === "friendly" ? "🟢 Amistoso" :
                        panelEntity.metadata.attitudeToParty === "hostile" ? "🔴 Hostil" :
                          panelEntity.metadata.attitudeToParty === "deceptive" ? "🟡 Engañoso" :
                            panelEntity.metadata.attitudeToParty === "neutral" ? "⚪ Neutral" :
                              panelEntity.metadata.attitudeToParty}
                    </p>
                  </div>
                )}
                {panelEntity.metadata?.goal && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Objetivo</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.goal}</p>
                  </div>
                )}
                {viewMode !== "players" && panelEntity.metadata?.fear && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a855f7" }}>Temor (DM)</span>
                    <p style={{ fontSize: "0.74rem", color: "#e9d5ff", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.fear}</p>
                  </div>
                )}
                {viewMode !== "players" && panelEntity.metadata?.secret && (
                  <div style={{ background: "rgba(168,85,247,0.06)", border: "1px dashed rgba(168,85,247,0.3)", borderRadius: "6px", padding: "8px" }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#c084fc" }}>Secreto Oculto (DM)</span>
                    <p style={{ fontSize: "0.74rem", color: "#f3e8ff", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.secret}</p>
                  </div>
                )}
                {panelEntity.metadata?.voice && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Pauta de voz/interpretación</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4, fontStyle: "italic" }}>"{panelEntity.metadata.voice}"</p>
                  </div>
                )}
              </div>
            )}

            {panelEntity.entityType === "secret" && (
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {viewMode !== "players" && panelEntity.metadata?.truth && (
                  <div style={{ background: "rgba(168,85,247,0.06)", border: "1px dashed rgba(168,85,247,0.3)", borderRadius: "6px", padding: "8px" }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#c084fc" }}>La Verdad (DM)</span>
                    <p style={{ fontSize: "0.74rem", color: "#f3e8ff", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.truth}</p>
                  </div>
                )}
                {panelEntity.metadata?.impact && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Impacto narrativo</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.impact}</p>
                  </div>
                )}
              </div>
            )}

            {panelEntity.entityType === "clue" && (
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {panelEntity.metadata?.content && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Contenido/Revelación</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.content}</p>
                  </div>
                )}
                {panelEntity.metadata?.clueType && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Tipo de pista</span>
                    <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", color: "#e2e8f0", display: "inline-block", marginTop: "3px", width: "fit-content" }}>
                      {panelEntity.metadata.clueType === "document" ? "📄 Documento" :
                        panelEntity.metadata.clueType === "verbal" ? "🗣️ Verbal" :
                          panelEntity.metadata.clueType === "physical" ? "🏺 Físico" :
                            panelEntity.metadata.clueType}
                    </span>
                  </div>
                )}
                {panelEntity.metadata?.atmosphere && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Atmósfera</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4, fontStyle: "italic" }}>{panelEntity.metadata.atmosphere}</p>
                  </div>
                )}
              </div>
            )}

            {panelEntity.entityType === "location" && (
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {panelEntity.metadata?.publicDescription && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Descripción Pública</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.publicDescription}</p>
                  </div>
                )}
                {viewMode !== "players" && panelEntity.metadata?.privateDescription && (
                  <div style={{ background: "rgba(168,85,247,0.06)", border: "1px dashed rgba(168,85,247,0.3)", borderRadius: "6px", padding: "8px" }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#c084fc" }}>Descripción Privada (DM)</span>
                    <p style={{ fontSize: "0.74rem", color: "#f3e8ff", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.privateDescription}</p>
                  </div>
                )}
                {panelEntity.metadata?.atmosphere && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Atmósfera</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4, fontStyle: "italic" }}>{panelEntity.metadata.atmosphere}</p>
                  </div>
                )}
                {panelEntity.metadata?.dangers && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ef4444" }}>Peligros</span>
                    {Array.isArray(panelEntity.metadata.dangers) ? (
                      <ul style={{ margin: "3px 0 0 0", paddingLeft: "14px", fontSize: "0.74rem", color: "#fecaca", lineHeight: 1.4 }}>
                        {panelEntity.metadata.dangers.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                      </ul>
                    ) : (
                      <p style={{ fontSize: "0.74rem", color: "#fecaca", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.dangers}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {panelEntity.entityType === "quest" && (
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {panelEntity.metadata?.publicObjective && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)" }}>Objetivo público</span>
                    <p style={{ fontSize: "0.74rem", color: "#f1f5f9", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.publicObjective}</p>
                  </div>
                )}
                {viewMode !== "players" && panelEntity.metadata?.hiddenObjective && (
                  <div style={{ background: "rgba(168,85,247,0.06)", border: "1px dashed rgba(168,85,247,0.3)", borderRadius: "6px", padding: "8px" }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#c084fc" }}>Objetivo Oculto (DM)</span>
                    <p style={{ fontSize: "0.74rem", color: "#f3e8ff", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.hiddenObjective}</p>
                  </div>
                )}
                {panelEntity.metadata?.failureConsequence && (
                  <div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ef4444" }}>Consecuencia del Fracaso</span>
                    <p style={{ fontSize: "0.74rem", color: "#fecaca", margin: "2px 0 0 0", lineHeight: 1.4 }}>{panelEntity.metadata.failureConsequence}</p>
                  </div>
                )}
              </div>
            )}

            {/* Related Facts (Traceability) */}
            {relatedFacts.length > 0 && (
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(100,116,139,0.5)", marginBottom: "8px" }}>
                  Hechos Relacionados ({relatedFacts.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {relatedFacts.map((fact: any) => (
                    <div key={fact.factId} style={{ fontSize: "0.72rem", padding: "6px 8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "5px", color: "rgba(203,213,225,0.8)", lineHeight: 1.4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.58rem", color: "rgba(148,163,184,0.4)", marginBottom: "3px" }}>
                        <span>{fact.kind?.toUpperCase()}</span>
                        <span>{fact.confidence?.toUpperCase()}</span>
                      </div>
                      {fact.statement}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relations */}
            <div style={{ padding: "12px 16px", flex: 1 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(100,116,139,0.5)", marginBottom: "10px" }}>
                Relaciones ({panelRelations.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {panelRelations.slice(0, 15).map((r: any) => {
                  const isSource = r.sourceEntityId === panelEntity.entityId;
                  const otherId = isSource ? r.targetEntityId : r.sourceEntityId;
                  const other = entitiesArr.find((e: Entity) => e.entityId === otherId);
                  const otherColor = other ? (ENTITY_TYPE_COLORS[other.entityType] ?? "#6366f1") : "#6366f1";
                  const label = RELATION_LABELS_ES[r.relationType] ?? r.relationType?.replace("custom:", "") ?? r.relationType;
                  return (
                    <div
                      key={r.relationId}
                      style={{ fontSize: "0.73rem", padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "5px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.04)" }}
                      onClick={() => focusGraphNode(otherId)}
                      onMouseEnter={(ev) => (ev.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                      onMouseLeave={(ev) => (ev.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    >
                      <div style={{ color: "rgba(100,116,139,0.55)", fontSize: "0.63rem", marginBottom: "2px" }}>
                        {isSource ? "→" : "←"} {label}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: otherColor, boxShadow: `0 0 4px ${otherColor}`, flexShrink: 0 }} />
                        <span style={{ color: "#e2e8f0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {other?.title ?? otherId}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {panelRelations.length > 15 && (
                  <p style={{ fontSize: "0.7rem", color: "rgba(100,116,139,0.45)", textAlign: "center", marginTop: "4px" }}>+{panelRelations.length - 15} más</p>
                )}
                {panelRelations.length === 0 && (
                  <p style={{ fontSize: "0.76rem", color: "rgba(100,116,139,0.45)" }}>Sin relaciones</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entity detail modal */}
      {detailEntityOpen && panelEntity && (
        <EntityDetailModal
          selectedEntity={panelEntity}
          campaignState={campaignState}
          onClose={() => setDetailEntityOpen(false)}
          onEdit={async (entityId, updates) => {
            await store.updateEntity(entityId, updates);
          }}
          onArchive={async (entityId) => {
            await store.archiveEntity(entityId);
            setDetailEntityOpen(false);
            selectGraphEntity(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            await store.updateEntity(entityId, { visibility });
          }}
          addToast={addToast}
        />
      )}
    </div>
  );
}
