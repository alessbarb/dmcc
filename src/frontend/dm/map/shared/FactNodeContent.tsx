import React from "react";
import { CheckCircle2, Lock, MessageSquare, XCircle, Lightbulb, AlertTriangle, RefreshCw, HelpCircle } from "lucide-react";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";

export interface FactNodeContentProps {
  statement: string;
  kind: string;
  confidence: string;
  relatedCount: number;
}

const CONFIDENCE_DOTS: Record<string, { dots: number; label: string }> = {
  unconfirmed: { dots: 1, label: "Sin confirmar" },
  suspected:   { dots: 2, label: "Sospechado" },
  likely:      { dots: 3, label: "Probable" },
  confirmed:   { dots: 3, label: "Confirmado" },
  false:       { dots: 0, label: "Falso" },
};

export function FactNodeContent({
  statement,
  kind,
  confidence,
  relatedCount
}: FactNodeContentProps) {
  const { t } = useTranslation();

  const KIND_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
    canon:         { label: "CANON",                         color: "#10b981", Icon: CheckCircle2 },
    dm_secret:     { label: "SECRETO DM",                    color: "#dc2626", Icon: Lock },
    rumor:         { label: "RUMOR",                         color: "#d97706", Icon: MessageSquare },
    lie:           { label: "MENTIRA",                       color: "#ea580c", Icon: XCircle },
    player_theory: { label: t("canvas.factNode.kindTheory"), color: "#6366f1", Icon: Lightbulb },
    mistake:       { label: "ERROR",                         color: "#64748b", Icon: AlertTriangle },
    retcon:        { label: "RETCON",                        color: "#8b5cf6", Icon: RefreshCw },
    unknown:       { label: "DESCONOCIDO",                   color: "#94a3b8", Icon: HelpCircle },
  };

  const cfg = KIND_CONFIG[kind] ?? KIND_CONFIG.unknown;
  const { color, label, Icon } = cfg;
  const conf = CONFIDENCE_DOTS[confidence] ?? CONFIDENCE_DOTS.unconfirmed;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Banner */}
      <div
        className="fact-node__banner"
        style={{
          background: color,
          color: "#fff",
          padding: "4px 12px",
          fontSize: "0.7rem",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}
      >
        <Icon size={11} strokeWidth={2.5} />
        <span>{label}</span>
      </div>

      {/* Statement Body */}
      <div className="fact-node__body" style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column" }}>
        <p
          className="fact-node__statement"
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "var(--text-main)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {statement}
        </p>
      </div>

      {/* Footer */}
      <div
        className="fact-node__footer"
        style={{
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border-color)"
        }}
      >
        <span className="fact-node__confidence" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className="fact-node__dot"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: color,
                opacity: i < conf.dots ? 1 : 0.2
              }}
            />
          ))}
          <span>{conf.label}</span>
        </span>
        {relatedCount > 0 && (
          <span className="fact-node__linked" style={{ background: "rgba(255, 255, 255, 0.05)", padding: "2px 6px", borderRadius: "4px" }}>
            {relatedCount} ent.
          </span>
        )}
      </div>
    </div>
  );
}
