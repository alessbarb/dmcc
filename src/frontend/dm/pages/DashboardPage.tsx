import React, { useState } from "react";
import {
  MapPin,
  ScrollText,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  Users,
  Lock,
  Zap,
  Network,
  Plus,
  Play,
  ChevronRight,
  CalendarDays,
  Flame,
  BookOpen,
} from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { EntityDetailModal } from "../entities/EntityDetailModal.js";
import { useToast } from "../../shared/hooks/useToast.js";

export interface DashboardPageProps {
  dashboard?: any;
  campaignState?: any;
  setCurrentPage?: (page: string) => void;
  setSelectedEntity?: (entity: any) => void;
}

// ─── tiny helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "16px",
      }}
    >
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {children}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background:
            "linear-gradient(to right, var(--border-color), transparent)",
        }}
      />
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.88rem" }}>
      {label}
    </span>
  );
}

function EntityRow({
  entity,
  badge,
  badgeClass,
  onClick,
}: {
  entity: any;
  badge?: string;
  badgeClass?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "8px 10px",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "var(--bg-input)",
        cursor: onClick ? "pointer" : "default",
        transition: "var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            "var(--bg-card-hover)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          "var(--bg-input)";
      }}
    >
      <span
        style={{
          fontWeight: 600,
          fontSize: "0.9rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {entity.title ?? entity.name ?? "Sin título"}
      </span>
      {badge && (
        <span className={`badge ${badgeClass ?? "badge-default"}`}>{badge}</span>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function DashboardPage(_props: DashboardPageProps = {}) {
  const { campaignId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const storeData = useCampaignStore();
  const dashboard = _props.dashboard ?? storeData.dashboard;
  const campaignState = _props.campaignState ?? storeData.campaignState;
  const { updateEntity, archiveEntity } = storeData;
  const { addToast } = useToast();
  const [selectedEntityLocal, setSelectedEntityLocal] = useState<any>(null);
  const selectedEntity = selectedEntityLocal;
  const setSelectedEntity = _props.setSelectedEntity ?? setSelectedEntityLocal;

  const setCurrentPage = _props.setCurrentPage ?? ((page: string) => {
    if (campaignId) navigate({ to: `/campaigns/${campaignId}/${page}` });
  });

  // ── derived values ──────────────────────────────────────────────────────────
  const campaign = campaignState?.campaign ?? null;
  const sessions: any[] = campaignState?.sessions ?? [];
  const activeSession = sessions.find((s: any) => s.status === "active") ?? null;

  const currentLocationId = campaign?.currentLocationId ?? null;
  const currentLocationEntity =
    currentLocationId && Array.isArray(campaignState?.entities)
      ? campaignState.entities.find((e: any) => e.entityId === currentLocationId)
      : null;

  const firstActiveQuest: any = dashboard?.activeQuests?.[0] ?? null;
  const lastSession: any = dashboard?.lastSession ?? null;

  const npcWarnings: any[] = dashboard?.importantNpcWarnings ?? [];
  const blockedQuests: any[] = dashboard?.blockedQuests ?? [];
  const criticalHiddenClues: any[] = dashboard?.criticalHiddenClues ?? [];
  const pendingConsequences: any[] = dashboard?.pendingConsequences ?? [];

  const preparedClues: any[] = dashboard?.preparedClues ?? [];
  const readyConsequences: any[] = pendingConsequences.filter(
    (c: any) => c.ready === true
  );
  const recentEntities: any[] =
    dashboard?.recentlyUpdatedEntities ??
    dashboard?.recentlyChangedEntities ??
    [];

  const hasWarnings =
    npcWarnings.length > 0 ||
    blockedQuests.length > 0 ||
    criticalHiddenClues.length > 0 ||
    pendingConsequences.length > 0;

  const importanceBadge = (importance: string | undefined) => {
    if (!importance) return { label: "normal", cls: "badge-default" };
    const map: Record<string, { label: string; cls: string }> = {
      critical: { label: "crítica", cls: "badge-critical" },
      high: { label: "alta", cls: "badge-warning" },
      medium: { label: "media", cls: "badge-primary" },
      low: { label: "baja", cls: "badge-default" },
    };
    return map[importance.toLowerCase()] ?? { label: importance, cls: "badge-default" };
  };

  // ── layout ──────────────────────────────────────────────────────────────────
  return (<>
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — ESTADO ACTUAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>Estado actual de la campaña</SectionLabel>

        {/* Campaign header strip */}
        <div
          className="card"
          style={{
            background: `linear-gradient(135deg,
              hsla(255, 85%, 12%, 0.9) 0%,
              hsla(230, 35%, 11%, 1) 60%,
              hsla(175, 40%, 10%, 0.9) 100%)`,
            borderColor: "hsla(255, 85%, 65%, 0.25)",
            marginBottom: "20px",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "4px",
                }}
              >
                <h1
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "var(--text-main)",
                  }}
                >
                  {campaign?.name ?? "Sin campaña activa"}
                </h1>
                {campaign?.system && (
                  <span className="badge badge-primary">{campaign.system}</span>
                )}
              </div>
              {campaign?.description && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    maxWidth: "520px",
                  }}
                >
                  {campaign.description}
                </p>
              )}
            </div>

            {activeSession ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-success-bg)",
                  border: "1px solid hsla(142, 70%, 50%, 0.3)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-success)",
                    boxShadow: "0 0 6px var(--color-success)",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--color-success)",
                  }}
                >
                  Sesión activa
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Three-column status row */}
        <div className="grid grid-cols-3">
          {/* Ubicación actual */}
          <div
            className="card"
            style={{ padding: "18px 20px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <MapPin
                size={14}
                style={{ color: "var(--secondary)", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                Ubicación actual
              </span>
            </div>
            {currentLocationEntity ? (
              <button
                className="btn btn-secondary btn-sm"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  gap: "8px",
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onClick={() => setSelectedEntity(currentLocationEntity)}
              >
                <MapPin size={13} />
                {currentLocationEntity.title ?? currentLocationEntity.name}
              </button>
            ) : (
              <EmptySlot label="No establecida" />
            )}
          </div>

          {/* Misión activa */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <ScrollText
                size={14}
                style={{ color: "var(--color-warning)", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                Misión principal
              </span>
            </div>
            {firstActiveQuest ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--text-main)",
                  }}
                  onClick={() => setSelectedEntity(firstActiveQuest)}
                >
                  {firstActiveQuest.title}
                </button>
                <span
                  className={`badge ${importanceBadge(firstActiveQuest.importance).cls}`}
                  style={{ alignSelf: "flex-start" }}
                >
                  {importanceBadge(firstActiveQuest.importance).label}
                </span>
              </div>
            ) : (
              <EmptySlot label="Sin misión activa" />
            )}
          </div>

          {/* Última sesión */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <CalendarDays
                size={14}
                style={{ color: "var(--color-info)", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                Última sesión
              </span>
            </div>
            {lastSession ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {lastSession.title ?? `Sesión ${lastSession.number ?? ""}`}
                </span>
                {lastSession.date && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {lastSession.date}
                  </span>
                )}
                {lastSession.summary && (
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {lastSession.summary}
                  </p>
                )}
              </div>
            ) : (
              <EmptySlot label="Sin sesiones anteriores" />
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — QUÉ REQUIERE ATENCIÓN
      ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>Qué requiere atención</SectionLabel>

        {!hasWarnings ? (
          <div
            className="card"
            style={{
              borderColor: "hsla(142, 70%, 50%, 0.3)",
              backgroundColor: "var(--color-success-bg)",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <CheckCircle2 size={20} style={{ color: "var(--color-success)", flexShrink: 0 }} />
            <span style={{ fontWeight: 700, color: "var(--color-success)" }}>
              Todo en orden — no hay alertas activas
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2">
            {/* PNJs olvidados */}
            <div
              className="card"
              style={{
                padding: "18px 20px",
                borderColor:
                  npcWarnings.length > 0
                    ? "hsla(38, 95%, 55%, 0.35)"
                    : "var(--border-color)",
                backgroundColor:
                  npcWarnings.length > 0
                    ? "hsla(38, 95%, 55%, 0.06)"
                    : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <Users
                  size={15}
                  style={{
                    color:
                      npcWarnings.length > 0
                        ? "var(--color-warning)"
                        : "var(--text-muted)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color:
                      npcWarnings.length > 0
                        ? "var(--color-warning)"
                        : "var(--text-muted)",
                  }}
                >
                  PNJs olvidados
                </span>
                {npcWarnings.length > 0 && (
                  <span className="badge badge-warning" style={{ marginLeft: "auto" }}>
                    {npcWarnings.length}
                  </span>
                )}
              </div>
              {npcWarnings.length === 0 ? (
                <EmptySlot label="Ninguno" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {npcWarnings.slice(0, 4).map((w: any, i: number) => (
                    <EntityRow
                      key={w.entityId ?? i}
                      entity={w}
                      badge={w.importance}
                      badgeClass={importanceBadge(w.importance).cls}
                      onClick={w.entityId ? () => setSelectedEntity(w) : undefined}
                    />
                  ))}
                  {npcWarnings.length > 4 && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                      +{npcWarnings.length - 4} más
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Misiones bloqueadas */}
            <div
              className="card"
              style={{
                padding: "18px 20px",
                borderColor:
                  blockedQuests.length > 0
                    ? "hsla(0, 85%, 60%, 0.35)"
                    : "var(--border-color)",
                backgroundColor:
                  blockedQuests.length > 0
                    ? "hsla(0, 85%, 60%, 0.06)"
                    : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <Lock
                  size={15}
                  style={{
                    color:
                      blockedQuests.length > 0
                        ? "var(--color-critical)"
                        : "var(--text-muted)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color:
                      blockedQuests.length > 0
                        ? "var(--color-critical)"
                        : "var(--text-muted)",
                  }}
                >
                  Misiones bloqueadas
                </span>
                {blockedQuests.length > 0 && (
                  <span className="badge badge-critical" style={{ marginLeft: "auto" }}>
                    {blockedQuests.length}
                  </span>
                )}
              </div>
              {blockedQuests.length === 0 ? (
                <EmptySlot label="Ninguna" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {blockedQuests.slice(0, 4).map((q: any, i: number) => (
                    <EntityRow
                      key={q.entityId ?? i}
                      entity={q}
                      badge="bloqueada"
                      badgeClass="badge-critical"
                      onClick={q.entityId ? () => setSelectedEntity(q) : undefined}
                    />
                  ))}
                  {blockedQuests.length > 4 && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                      +{blockedQuests.length - 4} más
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Pistas críticas sin revelar */}
            <div
              className="card"
              style={{
                padding: "18px 20px",
                borderColor:
                  criticalHiddenClues.length > 0
                    ? "hsla(0, 85%, 60%, 0.35)"
                    : "var(--border-color)",
                backgroundColor:
                  criticalHiddenClues.length > 0
                    ? "hsla(0, 85%, 60%, 0.06)"
                    : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <EyeOff
                  size={15}
                  style={{
                    color:
                      criticalHiddenClues.length > 0
                        ? "var(--color-critical)"
                        : "var(--text-muted)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color:
                      criticalHiddenClues.length > 0
                        ? "var(--color-critical)"
                        : "var(--text-muted)",
                  }}
                >
                  Pistas críticas sin revelar
                </span>
                {criticalHiddenClues.length > 0 && (
                  <span className="badge badge-critical" style={{ marginLeft: "auto" }}>
                    {criticalHiddenClues.length}
                  </span>
                )}
              </div>
              {criticalHiddenClues.length === 0 ? (
                <EmptySlot label="Ninguna" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {criticalHiddenClues.slice(0, 4).map((c: any, i: number) => (
                    <EntityRow
                      key={c.entityId ?? i}
                      entity={c}
                      badge="oculta"
                      badgeClass="badge-critical"
                      onClick={c.entityId ? () => setSelectedEntity(c) : undefined}
                    />
                  ))}
                  {criticalHiddenClues.length > 4 && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                      +{criticalHiddenClues.length - 4} más
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Consecuencias pendientes */}
            <div
              className="card"
              style={{
                padding: "18px 20px",
                borderColor:
                  pendingConsequences.length > 0
                    ? "hsla(38, 95%, 55%, 0.35)"
                    : "var(--border-color)",
                backgroundColor:
                  pendingConsequences.length > 0
                    ? "hsla(38, 95%, 55%, 0.06)"
                    : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <Flame
                  size={15}
                  style={{
                    color:
                      pendingConsequences.length > 0
                        ? "var(--color-warning)"
                        : "var(--text-muted)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color:
                      pendingConsequences.length > 0
                        ? "var(--color-warning)"
                        : "var(--text-muted)",
                  }}
                >
                  Consecuencias pendientes
                </span>
                {pendingConsequences.length > 0 && (
                  <span className="badge badge-warning" style={{ marginLeft: "auto" }}>
                    {pendingConsequences.length}
                  </span>
                )}
              </div>
              {pendingConsequences.length === 0 ? (
                <EmptySlot label="Ninguna" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {pendingConsequences.slice(0, 4).map((c: any, i: number) => (
                    <EntityRow
                      key={c.entityId ?? i}
                      entity={c}
                      badge={c.ready ? "lista" : "pendiente"}
                      badgeClass={c.ready ? "badge-success" : "badge-warning"}
                      onClick={c.entityId ? () => setSelectedEntity(c) : undefined}
                    />
                  ))}
                  {pendingConsequences.length > 4 && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                      +{pendingConsequences.length - 4} más
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — PREPARACIÓN
      ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>Preparación para próxima sesión</SectionLabel>

        <div className="grid grid-cols-3">
          {/* Pistas listas para revelar */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Eye size={14} style={{ color: "var(--secondary)" }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: "var(--text-main)",
                }}
              >
                Pistas listas para revelar
              </span>
              {preparedClues.length > 0 && (
                <span className="badge badge-success" style={{ marginLeft: "auto" }}>
                  {preparedClues.length}
                </span>
              )}
            </div>
            {preparedClues.length === 0 ? (
              <EmptySlot label="Sin pistas preparadas" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {preparedClues.slice(0, 5).map((c: any, i: number) => (
                  <EntityRow
                    key={c.entityId ?? i}
                    entity={c}
                    onClick={c.entityId ? () => setSelectedEntity(c) : undefined}
                  />
                ))}
                {preparedClues.length > 5 && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                    +{preparedClues.length - 5} más
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Consecuencias listas */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Zap size={14} style={{ color: "var(--color-warning)" }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: "var(--text-main)",
                }}
              >
                Consecuencias listas
              </span>
              {readyConsequences.length > 0 && (
                <span className="badge badge-warning" style={{ marginLeft: "auto" }}>
                  {readyConsequences.length}
                </span>
              )}
            </div>
            {readyConsequences.length === 0 ? (
              <EmptySlot label="Ninguna lista aún" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {readyConsequences.slice(0, 5).map((c: any, i: number) => (
                  <EntityRow
                    key={c.entityId ?? i}
                    entity={c}
                    badge="lista"
                    badgeClass="badge-success"
                    onClick={c.entityId ? () => setSelectedEntity(c) : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actualizado recientemente */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Clock size={14} style={{ color: "var(--color-info)" }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: "var(--text-main)",
                }}
              >
                Actualizado recientemente
              </span>
            </div>
            {recentEntities.length === 0 ? (
              <EmptySlot label="Sin cambios recientes" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {recentEntities.slice(0, 5).map((e: any, i: number) => (
                  <div
                    key={e.entityId ?? i}
                    onClick={() => setSelectedEntity(e)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "7px 10px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-input)",
                      cursor: "pointer",
                      transition: "var(--transition-fast)",
                    }}
                    onMouseEnter={(ev) => {
                      (ev.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(ev) => {
                      (ev.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--bg-input)";
                    }}
                  >
                    <BookOpen size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {e.title ?? e.name}
                    </span>
                    {e.entityType && (
                      <span
                        className="badge badge-default"
                        style={{ fontSize: "0.6rem", padding: "2px 6px" }}
                      >
                        {e.entityType}
                      </span>
                    )}
                  </div>
                ))}
                {recentEntities.length > 5 && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                    +{recentEntities.length - 5} más
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — ACCIONES RÁPIDAS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>Acciones rápidas</SectionLabel>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {/* Iniciar sesión */}
          <button
            className="btn btn-primary"
            style={{
              flexDirection: "column",
              gap: "10px",
              padding: "22px 16px",
              height: "auto",
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              borderRadius: "var(--radius-lg)",
              boxShadow:
                "var(--shadow-primary), inset 0 1px 0 hsla(255, 100%, 90%, 0.15)",
            }}
            onClick={() => setCurrentPage("session")}
          >
            <Play size={20} />
            Iniciar sesión
          </button>

          {/* Nueva pista */}
          <button
            className="btn btn-secondary"
            style={{
              flexDirection: "column",
              gap: "10px",
              padding: "22px 16px",
              height: "auto",
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              borderRadius: "var(--radius-lg)",
              borderColor: "hsla(175, 85%, 45%, 0.3)",
            }}
            onClick={() => setCurrentPage("entities")}
          >
            <Plus size={20} style={{ color: "var(--secondary)" }} />
            <span>Nueva pista</span>
          </button>

          {/* Nuevo PNJ */}
          <button
            className="btn btn-secondary"
            style={{
              flexDirection: "column",
              gap: "10px",
              padding: "22px 16px",
              height: "auto",
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              borderRadius: "var(--radius-lg)",
            }}
            onClick={() => setCurrentPage("entities")}
          >
            <Users size={20} style={{ color: "var(--text-muted)" }} />
            <span>Nuevo PNJ</span>
          </button>

          {/* Ver grafo */}
          <button
            className="btn btn-secondary"
            style={{
              flexDirection: "column",
              gap: "10px",
              padding: "22px 16px",
              height: "auto",
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              borderRadius: "var(--radius-lg)",
            }}
            onClick={() => setCurrentPage("graph")}
          >
            <Network size={20} style={{ color: "var(--text-muted)" }} />
            <span>Ver grafo</span>
            <ChevronRight
              size={14}
              style={{ color: "var(--text-muted)", position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
          </button>
        </div>
      </section>
    </div>
    {selectedEntity && campaignState && (
      <EntityDetailModal
        selectedEntity={selectedEntity}
        campaignState={campaignState}
        onClose={() => setSelectedEntityLocal(null)}
        onEdit={async (entityId, updates) => {
          await updateEntity(entityId, updates);
          setSelectedEntityLocal({ ...selectedEntity, ...updates });
        }}
        onArchive={async (entityId) => {
          await archiveEntity(entityId);
          setSelectedEntityLocal(null);
        }}
        onVisibilityChange={async (entityId, visibility) => {
          await updateEntity(entityId, { visibility });
          setSelectedEntityLocal({ ...selectedEntity, visibility });
        }}
        addToast={addToast}
      />
    )}
  </>);
}
