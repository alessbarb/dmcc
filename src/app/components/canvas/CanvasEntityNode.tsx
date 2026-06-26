import React from "react";
import { Handle, Position } from "reactflow";
import { useCampaignStore } from "../../stores/campaignStore.js";
import {
  User, UserCheck, MapPin, Shield, Award, HelpCircle, Key, Box, Skull,
  Activity, Film, AlertTriangle, Clock, GitPullRequest, RefreshCcw,
  MessageSquare, BookOpen, FileText, StickyNote, EyeOff, Zap,
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
  data: { entityId: string };
  selected?: boolean;
}

export function CanvasEntityNode({ id: _id, data, selected }: CanvasEntityNodeProps) {
  const { campaignState } = useCampaignStore();
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

  const isDmOnly = !entity.visibility || entity.visibility.kind === "dm_only" || entity.visibility.kind === "dm";
  const isCritical = entity.importance === "critical";
  const isHigh = entity.importance === "high";
  const isBlocked = entity.status === "blocked";
  const isResolved = entity.status === "resolved";

  const cardClasses = [
    "rg-card",
    `rg-card--${heroStyle}`,
    selected    ? "rg-card--selected"  : "",
    isCritical  ? "rg-card--critical"  : "",
    isHigh      ? "rg-card--high"      : "",
    isBlocked   ? "rg-card--blocked"   : "",
    isResolved  ? "rg-card--resolved"  : "",
  ].filter(Boolean).join(" ");

  const subtitle = entity.subtitle || (entity.summary && entity.summary.length > 0
    ? (entity.summary.length > 48 ? entity.summary.slice(0, 48) + "…" : entity.summary)
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

        {/* DM-only lock — top-right */}
        {isDmOnly && (
          <div className="rg-card__dm-badge" title="Solo visible para el DM">
            <EyeOff size={9} />
          </div>
        )}
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

      <Handle type="source" position={Position.Bottom} className="canvas-handle source-handle" />
    </div>
  );
}
