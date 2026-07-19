import React from "react";
import { AlertTriangle, CheckCircle2, FileText, KeyRound } from "lucide-react";
import type { Entity } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { getEntityVisual } from "../../entities/entityVisuals.js";
import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";

export interface EntityNodeContentProps {
  entity: Entity;
  density?: "compact" | "normal" | "detailed";
  isPrivacyRevealed?: boolean;
  onRevealPrivacy?: () => void;
  tablePrivacy?: boolean;
}

function resolveEntityImageUrl(entity: Entity): string | undefined {
  const metadata = entity.metadata && typeof entity.metadata === "object" ? entity.metadata : {};
  const candidates = [
    metadata.imageUrl,
    metadata.avatarUrl,
    metadata.portraitUrl,
    metadata.coverUrl,
  ];
  return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim();
}

export function EntityNodeContent({
  entity,
  density = "normal",
  isPrivacyRevealed = false,
  onRevealPrivacy,
  tablePrivacy = false
}: EntityNodeContentProps) {
  const { t } = useTranslation();

  if (entity.archived) {
    return (
      <div className="entity-node-content__archived">
        <FileText className="entity-node-content__archived-icon" size={24} />
        <div>
          <div className="entity-node-content__archived-title">[Archivada]</div>
          <div className="entity-node-content__archived-id">{entity.entityId.slice(0, 8)}…</div>
        </div>
      </div>
    );
  }

  const cfg = getEntityVisual(entity.entityType);
  const IconComponent = cfg.icon;
  const imageUrl = resolveEntityImageUrl(entity);
  const heroStyle = cfg.heroStyle;
  const isDmOnly = isDmOnlyVisibility(entity.visibility);
  const isTableHidden = Boolean(tablePrivacy && isDmOnly && !isPrivacyRevealed);

  const isCritical = entity.importance === "critical";
  const isBlocked = entity.status === "blocked";
  const isResolved = entity.status === "resolved";

  const subtitle = entity.subtitle || (entity.summary && entity.summary.length > 0
    ? (density === "detailed" ? entity.summary : (entity.summary.length > 48 ? entity.summary.slice(0, 48) + "…" : entity.summary))
    : undefined);

  return (
    <div
      className={`entity-node-content rg-card--density-${density}`}
      style={{ "--rg-accent": cfg.accent } as React.CSSProperties & Record<`--${string}`, string>}
    >
      {isTableHidden && (
        <button
          type="button"
          className="rg-card__privacy-cover entity-node-content__privacy-cover"
          onClick={(event) => {
            event.stopPropagation();
            if (onRevealPrivacy) onRevealPrivacy();
          }}
        >
          <KeyRound size={22} />
          <span className="entity-node-content__privacy-label">{t("canvas.toolbar.privateContent")}</span>
        </button>
      )}

      {/* Hero Area */}
      <div
        className={`rg-card__hero entity-node-content__hero entity-node-content__hero--${density} ${imageUrl ? "rg-card__hero--img" : "rg-card__hero--icon"}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={entity.title}
            className="rg-card__img"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <IconComponent
            className={`rg-card__hero-icon entity-node-content__hero-icon entity-node-content__hero-icon--${heroStyle}`}
          />
        )}

        {imageUrl && <div className="rg-card__img-gradient" />}

        {/* Type Badge */}
        <div className="rg-card__type-badge entity-node-content__type-badge">
          <IconComponent size={9} />
          <span>{t(cfg.labelKey)}</span>
        </div>

        {/* Visibility Badge */}
        <div className="entity-node-content__visibility">
          {(() => {
            const kind = entity.visibility?.kind;
            if (isDmOnly) {
              return (
                <div className="entity-node-content__visibility-badge entity-node-content__visibility-badge--secret">
                  🔒 Secreto
                </div>
              );
            } else if (kind === "public" || kind === "party") {
              return (
                <div className="entity-node-content__visibility-badge entity-node-content__visibility-badge--revealed">
                  👁 Revelado
                </div>
              );
            } else {
              return (
                <div className="entity-node-content__visibility-badge entity-node-content__visibility-badge--partial">
                  🕯 Parcial
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Body */}
      <div className="rg-card__body entity-node-content__body">
        <div className="rg-card__name entity-node-content__name" title={entity.title}>
          {entity.title}
        </div>
        {subtitle && (
          <div className="rg-card__sub entity-node-content__subtitle">
            {subtitle}
          </div>
        )}
      </div>

      {/* Footer Status strip */}
      {(isBlocked || isResolved || isCritical) && (
        <div
          className={`rg-card__status-strip ${isCritical ? "rg-card__status-strip--critical" : isBlocked ? "rg-card__status-strip--blocked" : "rg-card__status-strip--resolved"}`}
        >
          {isBlocked && <><AlertTriangle size={9} /> Bloqueado</>}
          {isResolved && <><CheckCircle2 size={9} /> Resuelto</>}
          {isCritical && !isBlocked && !isResolved && <><CheckCircle2 size={9} /> Crítico</>}
        </div>
      )}
    </div>
  );
}
