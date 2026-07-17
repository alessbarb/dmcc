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
  const kindColors: Record<string, { bg: string; fg: string }> = {
    canon: { bg: "var(--theme-narrative-canon-background)", fg: "var(--theme-narrative-canon-foreground)" },
    dm_secret: { bg: "var(--theme-narrative-secret-background)", fg: "var(--theme-narrative-secret-foreground)" },
    rumor: { bg: "var(--theme-narrative-rumor-background)", fg: "var(--theme-narrative-rumor-foreground)" },
    lie: { bg: "var(--theme-feedback-danger-background)", fg: "var(--theme-feedback-danger-foreground)" },
    player_theory: { bg: "var(--theme-narrative-theory-background)", fg: "var(--theme-narrative-theory-foreground)" },
    mistake: { bg: "var(--theme-feedback-warning-background)", fg: "var(--theme-feedback-warning-foreground)" },
    retcon: { bg: "var(--theme-accents-secondary-background)", fg: "var(--theme-accents-secondary-foreground)" },
    unknown: { bg: "var(--theme-surfaces-interactive)", fg: "var(--theme-text-secondary)" },
  };

  const facts = allFacts.filter(
    (f) =>
      !f.archived &&
      Array.isArray(f.relatedEntityIds) &&
      f.relatedEntityIds.includes(entityId)
  );

  if (facts.length === 0) {
    return (
      <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.9rem", padding: "8px 0" }}>
        No hay hechos registrados para esta entidad.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {facts.map((f) => {
        const color = kindColors[f.kind] ?? kindColors.unknown;
        return (
          <div
            key={f.factId}
            style={{
              padding: "10px 12px",
              backgroundColor: "var(--theme-surfaces-interactive)",
              borderRadius: "var(--theme-shapes-radius-small)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: "var(--theme-shapes-radius-small)",
                  backgroundColor: color.bg,
                  color: color.fg,
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {f.kind}
              </span>
              {f.confidence !== "confirmed" && (
                <span style={{ fontSize: "0.78rem", color: "var(--theme-text-secondary)" }}>
                  Confianza: {f.confidence}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: "1.5" }}>
              {f.statement}
            </p>
            {f.source && formatFactSource(f.source, sessions, t) && (
              <div style={{ fontSize: "0.75rem", color: "var(--theme-text-secondary)", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ opacity: 0.5 }}>↳</span>
                {formatFactSource(f.source, sessions, t)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
