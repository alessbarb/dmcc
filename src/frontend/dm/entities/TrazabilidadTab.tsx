import type { Entity, Fact, Relation, Session } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { formatRelationType } from "@shared/i18n/index.js";
import type { SupportedLocale } from "@shared/i18n/types.js";

function formatDate(iso: string | undefined, locale?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Trazabilidad types ───────────────────────────────────────────────────────

interface TraceEntry {
  at: string; // ISO string — used for sorting
  kind: "creacion" | "visibilidad" | "relacion" | "hecho";
  label: string;
  detail?: string;
}

function buildTrazabilidad(
  entity: Entity,
  relations: Relation[],
  facts: Fact[],
  sessions: Session[],
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: SupportedLocale
): TraceEntry[] {
  const entries: TraceEntry[] = [];

  // 1. Creación
  const createdInSessionId = entity.createdInSessionId ?? entity.metadata?.createdInSessionId;
  const createdSession = createdInSessionId
    ? sessions.find((s: Session) => s.sessionId === createdInSessionId)
    : null;

  entries.push({
    at: entity.createdAt ?? new Date(0).toISOString(),
    kind: "creacion",
    label: t("entityDetail.entityCreated"),
    detail: createdSession
      ? t("entityDetail.sessionTrace", { number: createdSession.number ?? "?", title: createdSession.title || createdSession.sessionId })
      : undefined,
  });

  // 2. Cambios de visibilidad (from timeline events if available)
  // Not available in campaignState directly — derive from entity.visibility history if ever present
  // No-op for now (events are in timeline store, not campaignState)

  // 3. Relaciones que involucran esta entidad
  const entityRelations = relations.filter(
    (r: Relation) =>
      !r.archived &&
      (r.sourceEntityId === entity.entityId || r.targetEntityId === entity.entityId)
  );

  for (const r of entityRelations) {
    const isSource = r.sourceEntityId === entity.entityId;
    const otherId = isSource ? r.targetEntityId : r.sourceEntityId;
    entries.push({
      at: r.createdAt ?? entity.createdAt ?? new Date(0).toISOString(),
      kind: "relacion",
      label: isSource
        ? t("entityDetail.outgoingRelation", { type: formatRelationType(r.relationType, locale), target: otherId })
        : t("entityDetail.incomingRelation", { source: otherId, type: formatRelationType(r.relationType, locale) }),
      detail: r.description,
    });
  }

  // 4. Hechos asociados
  const entityFacts = facts.filter(
    (f: Fact) =>
      !f.archived &&
      Array.isArray(f.relatedEntityIds) &&
      f.relatedEntityIds.includes(entity.entityId)
  );

  for (const f of entityFacts) {
    entries.push({
      at: f.createdAt ?? entity.createdAt ?? new Date(0).toISOString(),
      kind: "hecho",
      label: `Hecho (${f.kind}): ${f.statement.length > 60 ? f.statement.slice(0, 60) + "…" : f.statement}`,
      detail: f.confidence !== "confirmed" ? `Confianza: ${f.confidence}` : undefined,
    });
  }

  // Sort chronologically
  entries.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return entries;
}

export function TrazabilidadTab({
  entity,
  relations,
  facts,
  sessions,
}: {
  entity: Entity;
  relations: Relation[];
  facts: Fact[];
  sessions: Session[];
}) {
  const { locale, t } = useTranslation();
  const entries = buildTrazabilidad(entity, relations, facts, sessions, t, locale);

  const kindStyles: Record<
    TraceEntry["kind"],
    { accentColor: string; label: string }
  > = {
    creacion: { accentColor: "var(--theme-activity-entity-foreground)", label: t("entityModal.tabCreation") },
    visibilidad: { accentColor: "var(--theme-activity-visibility-foreground)", label: t("entityModal.tabVisibility") },
    relacion: { accentColor: "var(--theme-activity-relation-foreground)", label: t("entityModal.tabRelation") },
    hecho: { accentColor: "var(--theme-activity-fact-foreground)", label: "Hecho" },
  };

  if (entries.length === 0) {
    return (
      <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.9rem", padding: "8px 0" }}>
        Sin datos de trazabilidad disponibles.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Timeline vertical line container */}
      {entries.map((entry, idx) => {
        const style = kindStyles[entry.kind];
        const isLast = idx === entries.length - 1;
        return (
          <div
            key={idx}
            style={{ display: "flex", gap: "12px", position: "relative" }}
          >
            {/* Dot + vertical line */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                width: "20px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: style.accentColor,
                  marginTop: "14px",
                  flexShrink: 0,
                }}
              />
              {!isLast && (
                <div
                  style={{
                    width: "2px",
                    flex: "1",
                    minHeight: "16px",
                    backgroundColor: "var(--theme-borders-default)",
                    marginTop: "2px",
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div
              style={{
                padding: "10px 0",
                paddingBottom: isLast ? "0" : "14px",
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: style.accentColor,
                  }}
                >
                  {style.label}
                </span>
                <span style={{ fontSize: "0.76rem", color: "var(--theme-text-secondary)" }}>
                  {formatDate(entry.at, locale)}
                </span>
              </div>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.87rem",
                  color: "var(--theme-text-primary)",
                  lineHeight: "1.4",
                }}
              >
                {entry.label}
              </p>
              {entry.detail && (
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.8rem",
                    color: "var(--theme-text-secondary)",
                  }}
                >
                  {entry.detail}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

