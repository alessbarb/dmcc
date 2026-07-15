import React from "react";
import { Eye, EyeOff, ExternalLink, Route, X } from "lucide-react";
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
  const config = getEntityVisual(entity.entityType);
  const isDmOnly = entity.visibility?.kind === "dm_only";

  return (
    <aside className="network-inspector" style={{ "--network-inspector-accent": config.accent } as React.CSSProperties}>
      <header className="network-inspector__header">
        <div className="network-inspector__eyebrow-row">
          <span className="network-inspector__eyebrow">{formatEntityType(entity.entityType, locale)}</span>
          <button type="button" className="network-inspector__close" onClick={onClose} aria-label={t("common.close")}>
            <X size={16} />
          </button>
        </div>
        <h3>{entity.title}</h3>
        <div className="network-inspector__visibility">
          {isDmOnly ? <EyeOff size={12} /> : <Eye size={12} />}
          {isDmOnly ? t("domain.visibility.dm_only") : t("network.title")}
        </div>
        <div className="network-inspector__actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenDetail}>
            <ExternalLink size={13} /> {t("network.openDetail")}
          </button>
          {onFindPathTo && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onFindPathTo}>
              <Route size={13} /> {t("network.findPath")}
            </button>
          )}
        </div>
      </header>

      {entity.summary && <p className="network-inspector__summary">{entity.summary}</p>}

      <div className="network-inspector__relations">
        <div className="network-inspector__section-title">
          {t("entityDetail.tabsRelations")} <span>{relations.length}</span>
        </div>
        <div className="network-inspector__relation-list">
          {relations.slice(0, 20).map((relation) => {
            const isSource = relation.sourceEntityId === entity.entityId;
            const otherId = isSource ? relation.targetEntityId : relation.sourceEntityId;
            const other = entitiesById.get(otherId);
            const otherAccent = other ? getEntityVisual(other.entityType).accent : config.accent;
            return (
              <button
                key={relation.relationId}
                type="button"
                className="network-inspector__relation"
                onClick={() => onSelectEntity(otherId)}
              >
                <span className="network-inspector__relation-type">
                  {isSource ? "→" : "←"} {formatRelationType(relation.relationType ?? "", locale)}
                </span>
                <span className="network-inspector__relation-target">
                  <span className="network-inspector__relation-dot" style={{ backgroundColor: otherAccent }} />
                  <strong>{other?.title ?? otherId}</strong>
                </span>
              </button>
            );
          })}
          {relations.length === 0 && <p className="network-inspector__empty">—</p>}
        </div>
      </div>
    </aside>
  );
}
