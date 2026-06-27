import React from "react";
import { Handle, Position } from "reactflow";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import {
  User, UserCheck, MapPin, Shield, Award, HelpCircle, Key, Box, Skull,
  Activity, Film, AlertTriangle, Clock, GitPullRequest, RefreshCcw,
  MessageSquare, BookOpen, FileText, StickyNote, Eye, Zap,
  CheckCircle2
} from "lucide-react";

const TYPE_CONFIGS: Record<string, { label: string; icon: any; color: string; heroStyle: "portrait" | "panorama" | "compact" }> = {
  player_character: { label: "PJ",         icon: User,           color: "#6366f1", heroStyle: "portrait"  },
  npc:              { label: "PNJ",         icon: UserCheck,      color: "#3b82f6", heroStyle: "portrait"  },
  location:         { label: "Lugar",       icon: MapPin,         color: "#10b981", heroStyle: "panorama"  },
  faction:          { label: "Facción",     icon: Shield,         color: "#f59e0b", heroStyle: "portrait"  },
  quest:            { label: "Misión",      icon: Award,          color: "#f97316", heroStyle: "compact"   },
  clue:             { label: "Pista",       icon: HelpCircle,     color: "#eab308", heroStyle: "compact"   },
  secret:           { label: "Secreto",     icon: Key,            color: "#ef4444", heroStyle: "compact"   },
  item:             { label: "Objeto",      icon: Box,            color: "#8b5cf6", heroStyle: "compact"   },
  creature:         { label: "Criatura",    icon: Skull,          color: "#dc2626", heroStyle: "portrait"  },
  encounter:        { label: "Encuentro",   icon: Activity,       color: "#0891b2", heroStyle: "compact"   },
  scene:            { label: "Escena",      icon: Film,           color: "#64748b", heroStyle: "panorama"  },
  front:            { label: "Frente",      icon: AlertTriangle,  color: "#7c3aed", heroStyle: "compact"   },
  clock:            { label: "Reloj",       icon: Clock,          color: "#0ea5e9", heroStyle: "compact"   },
  decision:         { label: "Decisión",    icon: GitPullRequest, color: "#d97706", heroStyle: "compact"   },
  consequence:      { label: "Consecuencia",icon: RefreshCcw,     color: "#b45309", heroStyle: "compact"   },
  rumor:            { label: "Rumor",       icon: MessageSquare,  color: "#6b7280", heroStyle: "compact"   },
  rule_reference:   { label: "Regla",       icon: BookOpen,       color: "#374151", heroStyle: "compact"   },
  handout:          { label: "Documento",   icon: FileText,       color: "#1d4ed8", heroStyle: "compact"   },
  note:             { label: "Nota",        icon: StickyNote,     color: "#475569", heroStyle: "compact"   },
};

export interface CanvasEntityNodeProps {
  id: string;
  data: {
    canvasId: string;
    entityId: string;
    isDirectionMode?: boolean;
    isPlayerView?: boolean;
    isAttenuated?: boolean;
  };
  selected?: boolean;
}

export function CanvasEntityNode({ id: _id, data, selected }: CanvasEntityNodeProps) {
  const {
    campaignState,
    updateEntity,
    createEntity,
    placeNodeOnCanvas,
    addEdgeToCanvas,
    recordSessionEvent
  } = useCampaignStore();

  const entity = campaignState?.entities?.find((e: any) => e.entityId === data.entityId);

  if (!entity || entity.archived) {
    return (
      <div className={`rg-card rg-card--compact ${selected ? "rg-card--selected" : ""}`}
           style={{ "--rg-accent": "#475569" } as any}>
        <Handle type="target" position={Position.Top} className="canvas-handle target-handle" />
        <div className="rg-card__hero rg-card__hero--icon">
          <FileText size={24} style={{ color: "#475569", opacity: 0.5 }} />
        </div>
        <div className="rg-card__body">
          <div className="rg-card__name rg-card__name--muted">[Archivada]</div>
          <div className="rg-card__sub">{data.entityId.slice(0, 16)}…</div>
        </div>
        <Handle type="source" position={Position.Bottom} className="canvas-handle source-handle" />
      </div>
    );
  }

  const cfg = TYPE_CONFIGS[entity.entityType] || { label: "Entidad", icon: FileText, color: "#64748b", heroStyle: "compact" };
  const IconComponent = cfg.icon;
  const imageUrl = entity.metadata?.imageUrl as string | undefined;
  const heroStyle = cfg.heroStyle;

  const isCritical = entity.importance === "critical";
  const isHigh = entity.importance === "high";
  const isBlocked = entity.status === "blocked";
  const isResolved = entity.status === "resolved";

  const density = (data as any).density || "normal";
  const hasDirectionToolbar = !!data.isDirectionMode && !data.isPlayerView;

  const cardClasses = [
    "rg-card",
    `rg-card--${heroStyle}`,
    `rg-card--density-${density}`,
    selected    ? "rg-card--selected"  : "",
    isCritical  ? "rg-card--critical"  : "",
    isHigh      ? "rg-card--high"      : "",
    isBlocked   ? "rg-card--blocked"   : "",
    isResolved  ? "rg-card--resolved"  : "",
    hasDirectionToolbar ? "has-direction-toolbar" : "",
  ].filter(Boolean).join(" ");

  const subtitle = entity.subtitle || (entity.summary && entity.summary.length > 0
    ? (density === "detailed" ? entity.summary : (entity.summary.length > 48 ? entity.summary.slice(0, 48) + "…" : entity.summary))
    : undefined);

  return (
    <div className={cardClasses} style={{ "--rg-accent": cfg.color } as any}>
      <Handle type="target" position={Position.Top} className="canvas-handle target-handle" />

      {/* Hero area */}
      <div className={`rg-card__hero ${imageUrl ? "rg-card__hero--img" : "rg-card__hero--icon"}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={entity.title} className="rg-card__img" />
        ) : (
          <IconComponent size={heroStyle === "portrait" ? 36 : heroStyle === "panorama" ? 30 : 24}
                         style={{ color: cfg.color }} />
        )}

        {/* Gradient overlay for readability over image */}
        {imageUrl && <div className="rg-card__img-gradient" />}

        {/* Type badge — overlaid bottom-left of hero */}
        <div className="rg-card__type-badge">
          <IconComponent size={9} />
          <span>{cfg.label}</span>
        </div>

        {/* Visibility badge — top-right */}
        {(() => {
          const kind = entity.visibility?.kind || "dm_only";
          if (kind === "dm_only" || kind === "dm") {
            return (
              <div className="rg-card__dm-badge rg-card__dm-badge--secret" title="Secreto DM (Solo visible para el DM)">
                <span style={{ fontSize: "9px" }}>🔒 Secreto DM</span>
              </div>
            );
          } else if (kind === "public" || kind === "party") {
            return (
              <div className="rg-card__dm-badge rg-card__dm-badge--revealed" title="Revelado (Visible para todos los jugadores)">
                <span style={{ fontSize: "9px" }}>👁 Revelado</span>
              </div>
            );
          } else {
            return (
              <div className="rg-card__dm-badge rg-card__dm-badge--partial" title="Parcialmente descubierto (Visible para algunos jugadores/personajes)">
                <span style={{ fontSize: "9px" }}>🕯 Parcial</span>
              </div>
            );
          }
        })()}
      </div>

      {/* Body */}
      <div className="rg-card__body">
        <div className="rg-card__name" title={entity.title}>{entity.title}</div>
        {subtitle && <div className="rg-card__sub">{subtitle}</div>}
      </div>

      {/* Status footer strip */}
      {(isBlocked || isResolved || isCritical) && (
        <div className={`rg-card__status-strip ${isCritical ? "rg-card__status-strip--critical" : isBlocked ? "rg-card__status-strip--blocked" : "rg-card__status-strip--resolved"}`}>
          {isBlocked  && <><AlertTriangle size={9} /> Bloqueado</>}
          {isResolved && <><CheckCircle2 size={9} /> Resuelto</>}
          {isCritical && !isBlocked && !isResolved && <><Zap size={9} /> Crítico</>}
        </div>
      )}

      {/* Live direction quick actions toolbar */}
      {hasDirectionToolbar && (
        <div className="node-direction-toolbar">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await updateEntity(entity.entityId, { visibility: { kind: "public" } });
              const activeSession = campaignState?.sessions?.find((s: any) => s.status === "active");
              if (activeSession) {
                await recordSessionEvent(activeSession.sessionId, {
                  type: "reveal",
                  title: `Revelado: ${entity.title}`,
                  description: `El DM reveló la entidad "${entity.title}" desde el canvas de dirección.`,
                  relatedEntityIds: [entity.entityId],
                });
              }
            }}
            disabled={entity.visibility?.kind === "public"}
            title="Revelar a los jugadores"
            className="node-direction-btn"
          >
            <Eye size={12} />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const text = window.prompt(`Añadir nota de sesión para: ${entity.title}`);
              if (text && text.trim()) {
                const activeSession = campaignState?.sessions?.find((s: any) => s.status === "active");
                if (activeSession) {
                  await recordSessionEvent(activeSession.sessionId, {
                    type: "note_recorded",
                    title: `Nota sobre ${entity.title}`,
                    description: text.trim(),
                    relatedEntityIds: [entity.entityId],
                  });
                } else {
                  alert("No hay ninguna sesión activa en curso para añadir notas.");
                }
              }
            }}
            title="Añadir Nota de Sesión"
            className="node-direction-btn"
          >
            <StickyNote size={12} />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const currentStatus = entity.status || "ready";
              let newStatus = "resolved";
              
              if (entity.entityType === "npc") {
                newStatus = currentStatus === "alive" ? "dead" : "alive";
              } else if (entity.entityType === "location") {
                newStatus = currentStatus === "unvisited" ? "visited" : "unvisited";
              } else if (entity.entityType === "clue") {
                newStatus = currentStatus === "unfound" ? "found" : "unfound";
              } else if (entity.entityType === "quest") {
                newStatus = currentStatus === "active" ? "completed" : "active";
              } else if (entity.entityType === "secret") {
                newStatus = currentStatus === "hidden" ? "revealed" : "hidden";
              } else {
                newStatus = currentStatus === "resolved" ? "ready" : "resolved";
              }

              await updateEntity(entity.entityId, { status: newStatus });
              const activeSession = campaignState?.sessions?.find((s: any) => s.status === "active");
              if (activeSession) {
                await recordSessionEvent(activeSession.sessionId, {
                  type: "status_changed",
                  title: `Estado de ${entity.title}: ${newStatus}`,
                  description: `Se actualizó el estado de "${entity.title}" a "${newStatus}" desde el canvas.`,
                  relatedEntityIds: [entity.entityId],
                });
              }
            }}
            title="Cambiar/Resolver Estado"
            className="node-direction-btn"
          >
            <CheckCircle2 size={12} />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const title = window.prompt(`Título de la consecuencia para: ${entity.title}`);
              if (title && title.trim()) {
                const campaignId = campaignState?.campaign?.campaignId;
                if (!campaignId) return;
                try {
                  await createEntity({
                    entityType: "consequence",
                    title: title.trim(),
                    status: "ready",
                    importance: "normal",
                    visibility: { kind: "dm_only" }
                  });
                  
                  const updatedStore = useCampaignStore.getState();
                  const created = updatedStore.campaignState?.entities?.slice(-1)[0];
                  if (created) {
                    const canvas = updatedStore.canvasesById[data.canvasId];
                    const currentNode = canvas?.nodes?.find((n: any) => n.entityId === entity.entityId);
                    const x = currentNode ? currentNode.x + 200 : 100;
                    const y = currentNode ? currentNode.y : 100;
                    
                    await placeNodeOnCanvas(data.canvasId, { kind: "entity", entityId: created.entityId, x, y });
                    
                    const finalStore = useCampaignStore.getState();
                    const finalCanvas = finalStore.canvasesById[data.canvasId];
                    const newNode = finalCanvas?.nodes?.find((n: any) => n.entityId === created.entityId);
                    
                    if (currentNode && newNode) {
                      await addEdgeToCanvas(data.canvasId, {
                        sourceNodeId: currentNode.id,
                        targetNodeId: newNode.id,
                        label: "consecuencia",
                        status: "domain",
                        visibility: "dm",
                        style: "solid",
                      });
                    }
                  }
                } catch (err) {
                  console.error("Failed to create consequence", err);
                }
              }
            }}
            title="Añadir Consecuencia Conectada"
            className="node-direction-btn"
          >
            <RefreshCcw size={12} />
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="canvas-handle source-handle" />
    </div>
  );
}
