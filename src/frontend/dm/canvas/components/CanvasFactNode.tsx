import React from "react";
import {
  CheckCircle2, Lock, MessageSquare, XCircle,
  Lightbulb, AlertTriangle, RefreshCw, HelpCircle,
} from "lucide-react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";


export interface CanvasFactNodeProps {
  id: string;
  data: {
    canvasId: string;
    factId?: string;
    // pre-resolved fact fields (passed from flowNodes)
    statement?: string;
    kind?: string;
    confidence?: string;
    relatedEntityCount?: number;
  };
  selected?: boolean;
}

const CONFIDENCE_DOTS: Record<string, { dots: number; label: string }> = {
  unconfirmed: { dots: 1, label: "Sin confirmar" },
  suspected:   { dots: 2, label: "Sospechado" },
  likely:      { dots: 3, label: "Probable" },
  confirmed:   { dots: 3, label: "Confirmado" },
  false:       { dots: 0, label: "Falso" },
};

export function CanvasFactNode({ id: _id, data, selected }: CanvasFactNodeProps) {
  const { t } = useTranslation();
  const campaignState = useCampaignStore(s => s.campaignState);

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

  // Resolve from store if not pre-passed
  const fact = data.factId
    ? (campaignState?.facts instanceof Map
        ? campaignState.facts.get(data.factId)
        : Array.isArray(campaignState?.facts)
          ? (campaignState!.facts as any[]).find((f: any) => f.factId === data.factId)
          : undefined)
    : undefined;

  const statement = data.statement ?? fact?.statement ?? t("canvas.factNode.noStatement");
  const kind = data.kind ?? fact?.kind ?? "unknown";
  const confidence = data.confidence ?? fact?.confidence ?? "medium";
  const relatedCount = data.relatedEntityCount
    ?? (fact?.relatedEntityIds?.length ?? 0);

  const cfg = KIND_CONFIG[kind] ?? KIND_CONFIG.unknown;
  const { color, label, Icon } = cfg;
  const conf = CONFIDENCE_DOTS[confidence] ?? CONFIDENCE_DOTS.medium;

  return (
    <div
      className={`fact-node${selected ? " fact-node--selected" : ""}`}
      style={{
        "--fact-color": color,
        borderColor: selected ? color : `${color}55`,
      } as React.CSSProperties}
    >
      {/* Kind banner */}
      <div className="fact-node__banner" style={{ background: color }}>
        <Icon size={11} strokeWidth={2.5} />
        <span>{label}</span>
      </div>

      {/* Statement body */}
      <div className="fact-node__body">
        <p className="fact-node__statement">{statement}</p>
      </div>

      {/* Footer */}
      <div className="fact-node__footer">
        <span className="fact-node__confidence">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className="fact-node__dot"
              style={{ opacity: i < conf.dots ? 1 : 0.2 }}
            />
          ))}
          <span>{conf.label}</span>
        </span>
        {relatedCount > 0 && (
          <span className="fact-node__linked">
            {relatedCount} ent.
          </span>
        )}
      </div>

      {/* Folded corner decoration */}
      <div
        className="fact-node__corner"
        style={{ borderColor: `transparent transparent ${color}33 transparent` }}
      />
    </div>
  );
}
