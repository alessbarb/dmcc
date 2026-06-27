import React, { useState, useEffect } from "react";
import { NodeResizer, useReactFlow } from "reactflow";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { MapPin, Shield, BookOpen, Play, HelpCircle, Plus, Minus } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";


export interface CanvasGroupNodeProps {
  id: string;
  data: {
    canvasId: string;
    title?: string;
    color?: string;
    groupType?: "location" | "faction" | "arc" | "session" | "mystery" | "custom";
    collapsed?: boolean;
    prevWidth?: number;
    prevHeight?: number;
  };
  selected?: boolean;
}

const CHILD_CARD_W = 162;
const CHILD_CARD_H = 190;
const GROUP_PAD = 20;
const GROUP_HEADER_H = 32;

export function CanvasGroupNode({ id, data, selected }: CanvasGroupNodeProps) {
  const { t } = useTranslation();
  const { updateCanvasNode, updateCanvasNodesLayout } = useCampaignStore();
  const { getNodes } = useReactFlow();
  const [localTitle, setLocalTitle] = useState(data.title || "Grupo");

  useEffect(() => {
    setLocalTitle(data.title || "Grupo");
  }, [data.title]);

  const handleBlur = async () => {
    if (localTitle !== data.title) {
      await updateCanvasNode(data.canvasId, id, { title: localTitle });
    }
  };

  const isCollapsed = !!data.collapsed;
  const canvas = useCampaignStore(state => state.canvasesById[data.canvasId]);
  const campaignState = useCampaignStore(state => state.campaignState);
  
  const rawChildren = canvas?.nodes?.filter((n: any) => n.parentId === id) || [];
  const npcsCount = rawChildren.filter((n: any) => {
    const ent = campaignState?.entities?.find((e: any) => e.entityId === n.entityId);
    return ent?.entityType === "npc";
  }).length;
  const secretsCount = rawChildren.filter((n: any) => {
    const ent = campaignState?.entities?.find((e: any) => e.entityId === n.entityId);
    return ent?.entityType === "secret";
  }).length;
  const cluesCount = rawChildren.filter((n: any) => {
    const ent = campaignState?.entities?.find((e: any) => e.entityId === n.entityId);
    return ent?.entityType === "clue";
  }).length;

  const handleToggleCollapse = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCollapsed = !isCollapsed;
    
    if (nextCollapsed) {
      const node = canvas?.nodes?.find((n: any) => n.id === id);
      const currentWidth = node?.width || 340;
      const currentHeight = node?.height || 220;
      await updateCanvasNode(data.canvasId, id, {
        collapsed: true,
        prevWidth: currentWidth,
        prevHeight: currentHeight,
        width: 200,
        height: 95
      });
    } else {
      const node = canvas?.nodes?.find((n: any) => n.id === id);
      const prevW = node?.prevWidth || 340;
      const prevH = node?.prevHeight || 220;
      await updateCanvasNode(data.canvasId, id, {
        collapsed: false,
        width: prevW,
        height: prevH
      });
    }
  };

  // Compute min size from current children
  const children = getNodes().filter(n => n.parentNode === id);
  const minW = children.length > 0
    ? Math.max(160, Math.max(...children.map(c => c.position.x + (c.width ?? CHILD_CARD_W))) + GROUP_PAD)
    : 160;
  const minH = children.length > 0
    ? Math.max(120, Math.max(...children.map(c => c.position.y + (c.height ?? CHILD_CARD_H))) + GROUP_PAD + GROUP_HEADER_H)
    : 120;

  const GROUP_COLORS: Record<string, string> = {
    purple: "#7c3aed",
    blue:   "#2563eb",
    green:  "#059669",
    yellow: "#d97706",
    pink:   "#db2777",
  };

  const GROUP_TYPE_CONFIGS: Record<string, { label: string; icon: any; color: string }> = {
    location: { label: t("canvas.node.typeLocation"),       icon: MapPin,     color: "#10b981" },
    faction:  { label: t("domain.entityTypes.faction"),     icon: Shield,     color: "#f59e0b" },
    arc:      { label: "Arco",                              icon: BookOpen,   color: "#7c3aed" },
    session:  { label: t("canvas.node.typeSession"),        icon: Play,       color: "#6366f1" },
    mystery:  { label: "Misterio",  icon: HelpCircle, color: "#ef4444" },
  };

  const groupType = data.groupType || "custom";
  const typeCfg = GROUP_TYPE_CONFIGS[groupType];
  const Icon = typeCfg?.icon;

  const borderColor = data.color
    ? (GROUP_COLORS[data.color] ?? GROUP_COLORS.purple)
    : (typeCfg?.color ?? GROUP_COLORS.purple);

  if (isCollapsed) {
    return (
      <div
        className={`canvas-node-card group-node group-node--collapsed ${selected ? "selected" : ""}`}
        style={{ borderColor, backgroundColor: `${borderColor}12`, width: "100%", height: "100%", padding: "10px", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "2px solid", borderRadius: "var(--radius-md)" }}
      >
        <div className="group-header nodrag" style={{ display: "flex", alignItems: "center", gap: "6px", position: "static" }}>
          <button
            onClick={handleToggleCollapse}
            className="btn btn-xs btn-icon btn-secondary"
            style={{ padding: "2px", height: "18px", width: "18px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            title="Expandir grupo"
          >
            <Plus size={10} style={{ color: "var(--text-main)" }} />
          </button>
          {Icon && (
            <span className="group-type-icon" style={{ display: "flex", color: borderColor }}>
              <Icon size={12} />
            </span>
          )}
          <div style={{ fontWeight: "bold", fontSize: "11px", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{localTitle}</div>
        </div>
        <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "4px" }}>
          <div>{rawChildren.length} elementos</div>
          {rawChildren.length > 0 && (
            <div style={{ display: "flex", gap: "6px", marginTop: "2px", opacity: 0.85 }}>
              {npcsCount > 0 && <span title="PNJs">🎭 {npcsCount}</span>}
              {secretsCount > 0 && <span title="Secretos">🔒 {secretsCount}</span>}
              {cluesCount > 0 && <span title="Pistas">🧩 {cluesCount}</span>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`canvas-node-card group-node ${selected ? "selected" : ""}`}
      style={{ borderColor, backgroundColor: `${borderColor}08` }}
    >
      <NodeResizer
        minWidth={minW}
        minHeight={minH}
        isVisible={selected}
        lineClassName="group-resizer-line"
        handleClassName="group-resizer-handle"
        onResizeEnd={(_event, params) => {
          const { x, y, width, height } = params;
          updateCanvasNodesLayout(data.canvasId, [
            {
              nodeId: id,
              x: Math.round(x),
              y: Math.round(y),
              width: Math.round(Math.max(width, minW)),
              height: Math.round(Math.max(height, minH)),
            }
          ]);
        }}
      />

      <div className="group-header nodrag" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={handleToggleCollapse}
          className="btn btn-xs btn-icon btn-secondary"
          style={{ padding: "2px", height: "18px", width: "18px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          title="Colapsar grupo"
        >
          <Minus size={10} style={{ color: "var(--text-main)" }} />
        </button>
        {Icon && (
          <span className="group-type-icon" style={{ display: "flex", color: borderColor }}>
            <Icon size={14} />
          </span>
        )}
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleBlur}
          className="group-title-input"
          placeholder="Nombre del grupo..."
        />
        {typeCfg && (
          <span className="badge" style={{ fontSize: "9px", padding: "1px 5px", backgroundColor: `${borderColor}20`, border: `1px solid ${borderColor}40`, color: borderColor, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {typeCfg.label}
          </span>
        )}
      </div>

      <div className="group-info-footer" style={{ position: "absolute", bottom: "4px", right: "8px", fontSize: "8px", color: "var(--text-muted)", pointerEvents: "none", opacity: 0.75 }}>
        {rawChildren.length} elementos {secretsCount > 0 && `· ${secretsCount} secretos`}
      </div>
    </div>
  );
}
