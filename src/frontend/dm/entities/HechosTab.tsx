import type { Fact, Session } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

function formatFactSource(
  source: { kind: string; sessionId?: string; note?: string; playerId?: string; importId?: string } | null | undefined,
  sessions: Array<{ sessionId: string; number?: number; title?: string }>,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (!source) return "";
  switch (source.kind) {
    case "session": {
      const s = sessions.find(sess => sess.sessionId === source.sessionId);
      return s
        ? t("factSource.session", { number: s.number ?? "?", title: s.title || "" })
        : t("factSource.sessionUnknown");
    }
    case "preparation": return t("factSource.preparation");
    case "manual": return source.note
      ? t("factSource.manualWithNote", { note: source.note })
      : t("factSource.manual");
    case "player": return t("factSource.player");
    case "import": return t("factSource.import");
    default: return "";
  }
}

export function HechosTab({
  entityId,
  facts: allFacts,
  sessions,
}: {
  entityId: string;
  facts: Fact[];
  sessions: Session[];
}) {
  const { t } = useTranslation();
  const facts = allFacts.filter(
    (f) =>
      !f.archived &&
      Array.isArray(f.relatedEntityIds) &&
      f.relatedEntityIds.includes(entityId)
  );

  if (facts.length === 0) {
    return (
      <p className="facts-empty">
        No hay hechos registrados para esta entidad.
      </p>
    );
  }

  return (
    <div className="facts-list">
      {facts.map((f) => {
        return (
          <div key={f.factId} className="fact-card">
            <div className="fact-card__meta">
              <span
                className={`fact-kind fact-kind--${["canon", "dm_secret", "rumor", "lie", "player_theory", "mistake", "retcon"].includes(f.kind) ? f.kind : "unknown"}`}
              >
                {f.kind}
              </span>
              {f.confidence !== "confirmed" && (
                <span className="fact-confidence">
                  Confianza: {f.confidence}
                </span>
              )}
            </div>
            <p className="fact-statement">
              {f.statement}
            </p>
            {f.source && formatFactSource(f.source, sessions, t) && (
              <div className="fact-source">
                <span className="fact-source__marker">↳</span>
                {formatFactSource(f.source, sessions, t)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
