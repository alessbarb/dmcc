import React from "react";
import { Handle, Position } from "reactflow";
import { useCampaignStore } from "../../stores/campaignStore.js";
import {
  User, UserCheck, MapPin, Shield, Award, HelpCircle, Key, Box, Skull,
  Activity, Film, AlertTriangle, Clock, GitPullRequest, RefreshCcw,
  MessageSquare, BookOpen, FileText, StickyNote, Lock, Eye
} from "lucide-react";

// Mapping of types to icons and colors
const TYPE_CONFIGS: Record<string, { label: string; icon: any; color: string }> = {
  player_character: { label: "PJ", icon: User, color: "#6366f1" },
  npc: { label: "PNJ", icon: UserCheck, color: "#3b82f6" },
  location: { label: "Lugar", icon: MapPin, color: "#10b981" },
  faction: { label: "Facción", icon: Shield, color: "#f59e0b" },
  quest: { label: "Misión", icon: Award, color: "#f97316" },
  clue: { label: "Pista", icon: HelpCircle, color: "#eab308" },
  secret: { label: "Secreto", icon: Key, color: "#ef4444" },
  item: { label: "Objeto", icon: Box, color: "#8b5cf6" },
  creature: { label: "Criatura", icon: Skull, color: "#dc2626" },
  encounter: { label: "Encuentro", icon: Activity, color: "#0891b2" },
  scene: { label: "Escena", icon: Film, color: "#64748b" },
  front: { label: "Frente", icon: AlertTriangle, color: "#7c3aed" },
  clock: { label: "Reloj", icon: Clock, color: "#0ea5e9" },
  decision: { label: "Decisión", icon: GitPullRequest, color: "#d97706" },
  consequence: { label: "Consecuencia", icon: RefreshCcw, color: "#b45309" },
  rumor: { label: "Rumor", icon: MessageSquare, color: "#6b7280" },
  rule_reference: { label: "Regla", icon: BookOpen, color: "#374151" },
  handout: { label: "Documento", icon: FileText, color: "#1d4ed8" },
  note: { label: "Nota", icon: StickyNote, color: "#475569" },
};

export interface CanvasEntityNodeProps {
  id: string;
  data: {
    entityId: string;
  };
  selected?: boolean;
}

export function CanvasEntityNode({ id: _id, data, selected }: CanvasEntityNodeProps) {
  const { campaignState } = useCampaignStore();
  const entity = campaignState?.entities?.find((e: any) => e.entityId === data.entityId);

  if (!entity || entity.archived) {
    return (
      <div className={`canvas-node-card entity-node archived ${selected ? "selected" : ""}`}>
        <Handle type="target" position={Position.Top} className="canvas-handle" />
        <div className="node-body">
          <div className="node-title font-mono text-muted">[Entidad Archivada]</div>
          <div className="node-subtitle">{data.entityId}</div>
        </div>
        <Handle type="source" position={Position.Bottom} className="canvas-handle" />
      </div>
    );
  }

  const typeConfig = TYPE_CONFIGS[entity.entityType] || { label: "Entidad", icon: FileText, color: "#64748b" };
  const IconComponent = typeConfig.icon;

  const isDmOnly = !entity.visibility || entity.visibility.kind === "dm_only" || entity.visibility.kind === "dm";
  const importanceClass = entity.importance ? `importance-${entity.importance}` : "";

  // Check if has warnings/conflicts
  const hasWarnings = (entity as any).hasWarnings || (entity.status === "blocked");

  return (
    <div
      className={`canvas-node-card entity-node ${importanceClass} ${selected ? "selected" : ""}`}
      style={{ borderLeftColor: typeConfig.color }}
    >
      {/* Target handle on top */}
      <Handle type="target" position={Position.Top} className="canvas-handle target-handle" />

      {/* Main card contents */}
      <div className="node-icon-wrapper" style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}>
        <IconComponent size={16} />
      </div>

      <div className="node-body">
        <div className="node-title-row">
          <div className="node-title" title={entity.title}>
            {entity.title}
          </div>
          {hasWarnings && (
            <span title="Tiene alertas o conflictos">
              <AlertTriangle size={14} className="text-warning" />
            </span>
          )}
        </div>
        
        <div className="node-meta-row">
          <span className="node-type-label" style={{ color: typeConfig.color }}>
            {typeConfig.label}
          </span>
          <span className="node-meta-dot">&middot;</span>
          <span className="node-visibility-badge text-muted">
            {isDmOnly ? (
              <span className="flex-align-gap" title="Visible solo para el DM">
                <Lock size={10} /> DM
              </span>
            ) : (
              <span className="flex-align-gap text-success" title="Visible para jugadores">
                <Eye size={10} /> Público
              </span>
            )}
          </span>
        </div>
        
        {entity.summary && (
          <div className="node-summary text-muted" title={entity.summary}>
            {entity.summary.length > 50 ? `${entity.summary.substring(0, 50)}...` : entity.summary}
          </div>
        )}
      </div>

      {/* Source handle on bottom */}
      <Handle type="source" position={Position.Bottom} className="canvas-handle source-handle" />
    </div>
  );
}
