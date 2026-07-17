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
      <div style={{ display: "flex", padding: "12px", alignItems: "center", gap: "12px" }}>
        <FileText size={24} style={{ color: "#475569", opacity: 0.5 }} />
        <div>
          <div style={{ color: "var(--theme-text-secondary)", fontSize: "0.85rem", fontWeight: "600" }}>[Archivada]</div>
          <div style={{ color: "var(--theme-text-secondary)", fontSize: "0.75rem" }}>{entity.entityId.slice(0, 8)}…</div>
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {isTableHidden && (
        <button
          type="button"
          className="rg-card__privacy-cover"
          onClick={(event) => {
            event.stopPropagation();
            if (onRevealPrivacy) onRevealPrivacy();
          }}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15, 23, 42, 0.9)",
            border: "none",
            color: "var(--theme-text-secondary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            zIndex: 10,
            cursor: "pointer"
          }}
        >
          <KeyRound size={22} />
          <span style={{ fontSize: "0.75rem" }}>{t("canvas.toolbar.privateContent")}</span>
        </button>
      )}

      {/* Hero Area */}
      <div
        className={`rg-card__hero ${imageUrl ? "rg-card__hero--img" : "rg-card__hero--icon"}`}
        style={{
          height: density === "compact" ? "40px" : "120px",
          position: "relative",
          overflow: "hidden",
          background: "var(--theme-borders-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={entity.title}
            className="rg-card__img"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <IconComponent
            className="rg-card__hero-icon"
            size={heroStyle === "portrait" ? 36 : heroStyle === "panorama" ? 30 : 24}
            style={{ color: cfg.accent }}
          />
        )}

        {imageUrl && <div className="rg-card__img-gradient" />}

        {/* Type Badge */}
        <div className="rg-card__type-badge" style={{ position: "absolute", bottom: "8px", left: "8px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(15, 23, 42, 0.75)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", color: "var(--theme-text-primary)" }}>
          <IconComponent size={9} />
          <span>{t(cfg.labelKey)}</span>
        </div>

        {/* Visibility Badge */}
        <div style={{ position: "absolute", top: "8px", right: "8px" }}>
          {(() => {
            const kind = entity.visibility?.kind;
            if (isDmOnly) {
              return (
                <div style={{ background: "rgba(239, 68, 68, 0.85)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "600" }}>
                  🔒 Secreto
                </div>
              );
            } else if (kind === "public" || kind === "party") {
              return (
                <div style={{ background: "rgba(16, 185, 129, 0.85)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "600" }}>
                  👁 Revelado
                </div>
              );
            } else {
              return (
                <div style={{ background: "rgba(245, 158, 11, 0.85)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "600" }}>
                  🕯 Parcial
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Body */}
      <div className="rg-card__body" style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        <div className="rg-card__name" style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--theme-text-primary)" }} title={entity.title}>
          {entity.title}
        </div>
        {subtitle && (
          <div className="rg-card__sub" style={{ fontSize: "0.8rem", color: "var(--theme-text-secondary)" }}>
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
