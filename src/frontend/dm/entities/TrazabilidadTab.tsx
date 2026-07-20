import type { Entity, Fact, Relation, Session } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { formatRelationType } from "@shared/i18n/index.js";
import type { SupportedLocale } from "@shared/i18n/types.js";
import "../../shared/styles/features/entity-trace.css";

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

  // 3. Relations involving this entity
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

  // 4. Associated facts
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

  const kindStyles: Record<TraceEntry["kind"], { label: string }> = {
    creacion: { label: t("entityModal.tabCreation") },
    visibilidad: { label: t("entityModal.tabVisibility") },
    relacion: { label: t("entityModal.tabRelation") },
    hecho: { label: "Hecho" },
  };

  if (entries.length === 0) {
    return (
      <p className="entity-trace-empty">
        Sin datos de trazabilidad disponibles.
      </p>
    );
  }

  return (
    <div className="entity-trace-list">
      {/* Timeline vertical line container */}
      {entries.map((entry, idx) => {
        const style = kindStyles[entry.kind];
        const isLast = idx === entries.length - 1;
        return (
          <div
            key={idx}
            className="entity-trace-entry"
          >
            {/* Dot + vertical line */}
            <div
              className="entity-trace-marker-column"
            >
              <div
                className={`entity-trace-dot entity-trace-dot--${entry.kind}`}
              />
              {!isLast && (
                <div
                  className="entity-trace-line"
                />
              )}
            </div>

            {/* Content */}
            <div
              className={`entity-trace-content ${isLast ? "entity-trace-content--last" : ""}`}
            >
              <div
                className="entity-trace-meta"
              >
                <span
                  className={`entity-trace-kind entity-trace-kind--${entry.kind}`}
                >
                  {style.label}
                </span>
                <span className="entity-trace-date">
                  {formatDate(entry.at, locale)}
                </span>
              </div>
              <p
                className="entity-trace-label"
              >
                {entry.label}
              </p>
              {entry.detail && (
                <p
                  className="entity-trace-detail"
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
