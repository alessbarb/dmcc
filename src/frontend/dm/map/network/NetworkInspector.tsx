import React from "react";
import { Eye, EyeOff, ExternalLink, X, Route } from "lucide-react";
import type { Entity, Relation } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatEntityType, formatRelationType } from "@shared/i18n/index.js";
import { getEntityVisual } from "../../entities/entityVisuals.js";

export interface NetworkInspectorProps {
  entity: Entity;
  relations: Relation[];
  entitiesById: Map<string, Entity>;
  onClose: () => void;
  onSelectEntity: (entityId: string) => void;
  onOpenDetail: () => void;
  onFindPathTo?: () => void;
}

export function NetworkInspector({
  entity,
  relations,
  entitiesById,
  onClose,
  onSelectEntity,
  onOpenDetail,
  onFindPathTo,
}: NetworkInspectorProps) {
  const { t, locale } = useTranslation();
  const cfg = getEntityVisual(entity.entityType);
  const isDmOnly = entity.visibility?.kind === "dm_only";

  return (
    <div
      style={{
        width: "290px",
        flex: "0 0 290px",
        background: "rgba(2,2,18,0.97)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.63rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cfg.accent }}>
            {formatEntityType(entity.entityType, locale)}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.5)", padding: 0 }}>
            <X size={13} />
          </button>
        </div>
        <h3 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0, color: "#e2e8f0", lineHeight: 1.3 }}>{entity.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: "rgba(100,116,139,0.55)", marginTop: "5px" }}>
          {isDmOnly ? <EyeOff size={10} /> : <Eye size={10} />}
          {isDmOnly ? t("domain.visibility.dm_only") : t("network.title")}
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={onOpenDetail}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              fontSize: "0.72rem", fontWeight: 700,
              padding: "6px 10px", borderRadius: "5px", cursor: "pointer",
              border: "1px solid rgba(99,102,241,0.4)",
              background: "rgba(99,102,241,0.12)", color: "#a5b4fc",
            }}
          >
            <ExternalLink size={11} /> {t("network.openDetail")}
          </button>
          {onFindPathTo && (
            <button
              type="button"
              onClick={onFindPathTo}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                fontSize: "0.72rem", fontWeight: 700,
                padding: "6px 10px", borderRadius: "5px", cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.8)",
              }}
            >
              <Route size={11} /> {t("network.findPath")}
            </button>
          )}
        </div>
      </div>

      {entity.summary && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontSize: "0.76rem", color: "rgba(148,163,184,0.8)", margin: 0, lineHeight: 1.55 }}>{entity.summary}</p>
        </div>
      )}

      <div style={{ padding: "12px 16px", flex: 1 }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(100,116,139,0.5)", marginBottom: "10px" }}>
          {t("entityDetail.tabsRelations")} ({relations.length})
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {relations.slice(0, 20).map((relation) => {
            const isSource = relation.sourceEntityId === entity.entityId;
            const otherId = isSource ? relation.targetEntityId : relation.sourceEntityId;
            const other = entitiesById.get(otherId);
            const otherAccent = other ? getEntityVisual(other.entityType).accent : cfg.accent;
            return (
              <div
                key={relation.relationId}
                style={{ fontSize: "0.73rem", padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "5px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.04)" }}
                onClick={() => onSelectEntity(otherId)}
              >
                <div style={{ color: "rgba(100,116,139,0.55)", fontSize: "0.63rem", marginBottom: "2px" }}>
                  {isSource ? "→" : "←"} {formatRelationType(relation.relationType ?? "", locale)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: otherAccent, flexShrink: 0 }} />
                  <span style={{ color: "#e2e8f0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {other?.title ?? otherId}
                  </span>
                </div>
              </div>
            );
          })}
          {relations.length === 0 && (
            <p style={{ fontSize: "0.76rem", color: "rgba(100,116,139,0.45)" }}>—</p>
          )}
        </div>
      </div>
    </div>
  );
}
