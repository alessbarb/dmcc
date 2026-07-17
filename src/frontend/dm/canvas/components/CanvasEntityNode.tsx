import { Handle, Position } from "@xyflow/react";
import { useEffect, useState, type CSSProperties } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import type { Entity, Session } from "../../../shared/stores/campaignStore.js";
import { AlertTriangle, CheckCircle2, Eye, FileText, KeyRound, RefreshCcw, StickyNote, Zap } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { getEntityVisual } from "../../entities/entityVisuals.js";
import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";


/** CSSProperties plus arbitrary CSS custom properties (`--foo`) used for theming hooks. */
type CanvasCardStyle = CSSProperties & Record<`--${string}`, string>;

const archivedCardStyle: CanvasCardStyle = { "--rg-accent": "#475569" };

export interface CanvasEntityNodeProps {
  id: string;
  data: {
    canvasId: string;
    entityId: string;
    isDirectionMode?: boolean;
    isPlayerView?: boolean;
    tablePrivacy?: boolean;
    isAttenuated?: boolean;
    density?: "compact" | "normal" | "detailed";
  };
  selected?: boolean;
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

export function CanvasEntityNode({ id: _id, data, selected }: CanvasEntityNodeProps) {
  const { t } = useTranslation();
  const [isPrivacyRevealed, setIsPrivacyRevealed] = useState(false);
  useEffect(() => {
    if (!data.tablePrivacy) setIsPrivacyRevealed(false);
  }, [data.tablePrivacy]);

  const {
    campaignState,
    updateEntity,
    recordSessionEvent
  } = useCampaignStore();

  const reportCanvasNodeError = (message: string) => (error: unknown) => {
    console.error(message, error);
  };

  const runCanvasNodeAction = (operation: Promise<unknown>, errorMessage: string) => {
    void operation.catch(reportCanvasNodeError(errorMessage));
  };

  const entity = campaignState?.entities?.find((e: Entity) => e.entityId === data.entityId);

  if (!entity || entity.archived) {
    return (
      <div className={`rg-card rg-card--compact ${selected ? "rg-card--selected" : ""}`}
           style={archivedCardStyle}>
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

  const cfg = getEntityVisual(entity.entityType);
  const IconComponent = cfg.icon;
  const imageUrl = resolveEntityImageUrl(entity);
  const heroStyle = cfg.heroStyle;
  const isDmOnly = isDmOnlyVisibility(entity.visibility);
  const isTableHidden = Boolean(data.tablePrivacy && isDmOnly && !isPrivacyRevealed);

  const isCritical = entity.importance === "critical";
  const isHigh = entity.importance === "high";
  const isBlocked = entity.status === "blocked";
  const isResolved = entity.status === "resolved";

  const density = data.density || "normal";
  const hasDirectionToolbar = !!data.isDirectionMode && !data.isPlayerView;

  const cardClasses = [
    "rg-card",
    `rg-card--${heroStyle}`,
    `rg-card--shape-${cfg.shape}`,
    `rg-card--border-${cfg.borderPattern}`,
    `rg-card--density-${density}`,
    selected    ? "rg-card--selected"  : "",
    isCritical  ? "rg-card--critical"  : "",
    isHigh      ? "rg-card--high"      : "",
    isBlocked   ? "rg-card--blocked"   : "",
    isResolved  ? "rg-card--resolved"  : "",
    hasDirectionToolbar ? "has-direction-toolbar" : "",
    isTableHidden ? "rg-card--table-hidden" : "",
  ].filter(Boolean).join(" ");

  const subtitle = entity.subtitle || (entity.summary && entity.summary.length > 0
    ? (density === "detailed" ? entity.summary : (entity.summary.length > 48 ? entity.summary.slice(0, 48) + "…" : entity.summary))
    : undefined);

  const cardStyle: CanvasCardStyle = {
    "--rg-accent": cfg.accent,
    "--card-accent": cfg.accent,
    "--card-accent-soft": cfg.accentSoft,
  };

  return (
    <div
      className={cardClasses}
      style={cardStyle}
    >
      <Handle type="target" position={Position.Top} className="canvas-handle target-handle" />

      {isTableHidden && (
        <button
          type="button"
          className="rg-card__privacy-cover"
          onClick={(event) => {
            event.stopPropagation();
            setIsPrivacyRevealed(true);
          }}
          onFocus={() => setIsPrivacyRevealed(true)}
          onBlur={() => setIsPrivacyRevealed(false)}
          aria-label={t("canvas.toolbar.revealPrivateTemporarily")}
        >
          <KeyRound aria-hidden="true" size={22} />
          <span>{t("canvas.toolbar.privateContent")}</span>
        </button>
      )}

      {/* Hero area */}
      <div className={`rg-card__hero ${imageUrl ? "rg-card__hero--img" : "rg-card__hero--icon"}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={entity.title} className="rg-card__img" loading="lazy" draggable={false} />
        ) : (
          <IconComponent
            className="rg-card__hero-icon"
            size={heroStyle === "portrait" ? 36 : heroStyle === "panorama" ? 30 : 24}
          />
        )}

        {/* Gradient overlay for readability over image */}
        {imageUrl && <div className="rg-card__img-gradient" />}

        {/* Type badge — overlaid bottom-left of hero */}
        <div className="rg-card__type-badge">
          <IconComponent size={9} />
          <span>{t(cfg.labelKey)}</span>
        </div>

        {/* Visibility badge — top-right */}
        {(() => {
          const kind = entity.visibility?.kind;
          if (isDmOnlyVisibility(entity.visibility)) {
            return (
              <div className="rg-card__dm-badge rg-card__dm-badge--secret" title={t("canvas.node.visibilityDmOnly")}>
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
            onClick={(e) => {
              e.stopPropagation();
              runCanvasNodeAction(
                (async () => {
                  await updateEntity(entity.entityId, { visibility: { kind: "public" } });
                  const activeSession = campaignState?.sessions?.find((s: Session) => s.status === "active");
                  if (activeSession) {
                    await recordSessionEvent(activeSession.sessionId, {
                      type: "reveal",
                      title: `Revelado: ${entity.title}`,
                      description: t("toasts.entityRevealedCanvas", { title: entity.title }),
                      relatedEntityIds: [entity.entityId],
                    });
                  }
                })(),
                "No se pudo revelar la entidad desde el canvas."
              );
            }}
            disabled={entity.visibility?.kind === "public"}
            title="Revelar a los jugadores"
            className="node-direction-btn"
          >
            <Eye size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const text = window.prompt(t("canvas.node.addSessionNotePrompt", { title: entity.title }));
              runCanvasNodeAction(
                (async () => {
                  if (text && text.trim()) {
                    const activeSession = campaignState?.sessions?.find((s: Session) => s.status === "active");
                    if (activeSession) {
                      await recordSessionEvent(activeSession.sessionId, {
                        type: "note_recorded",
                        title: `Nota sobre ${entity.title}`,
                        description: text.trim(),
                        relatedEntityIds: [entity.entityId],
                      });
                    } else {
                      alert(t("canvas.node.noActiveSessionNote"));
                    }
                  }
                })(),
                "No se pudo añadir la nota de sesión desde el canvas."
              );
            }}
            title={t("canvas.node.addSessionNoteLabel")}
            className="node-direction-btn"
          >
            <StickyNote size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              runCanvasNodeAction(
                (async () => {
                  const currentStatus = entity.status || "ready";
                  let newStatus = "resolved";

                  if (entity.entityType === "npc") {
                    newStatus = currentStatus === "alive" ? "dead" : "alive";
                  } else if (entity.entityType === "location") {
                    newStatus = currentStatus === "available" ? "visited" : "available";
                  } else if (entity.entityType === "quest") {
                    newStatus = currentStatus === "active" ? "completed" : "active";
                  }

                  await updateEntity(entity.entityId, { status: newStatus });
                })(),
                "No se pudo actualizar el estado de la entidad desde el canvas."
              );
            }}
            title={t("canvas.node.cycleStatusLabel")}
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
