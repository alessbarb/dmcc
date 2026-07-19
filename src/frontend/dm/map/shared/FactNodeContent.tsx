import React from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { CONFIDENCE_DOTS, getFactKindPresentation } from "./factNodePresentation.js";

export interface FactNodeContentProps {
  statement: string;
  kind: string;
  confidence: string;
  relatedCount: number;
}

type FactNodeStyle = React.CSSProperties & { "--fact-color": string };

export function FactNodeContent({
  statement,
  kind,
  confidence,
  relatedCount
}: FactNodeContentProps) {
  const { t } = useTranslation();

  const KIND_CONFIG = getFactKindPresentation(kind, t("canvas.factNode.kindTheory"));

  const cfg = KIND_CONFIG[kind] ?? KIND_CONFIG.unknown;
  const { color, label, Icon } = cfg;
  const conf = CONFIDENCE_DOTS[confidence] ?? CONFIDENCE_DOTS.unconfirmed;
  const factNodeStyle: FactNodeStyle = { "--fact-color": color };

  return (
    <div className="fact-node__content" style={factNodeStyle}>
      {/* Banner */}
      <div
        className="fact-node__banner"
      >
        <Icon size={11} strokeWidth={2.5} />
        <span>{label}</span>
      </div>

      {/* Statement Body */}
      <div className="fact-node__body">
        <p className="fact-node__statement">
          {statement}
        </p>
      </div>

      {/* Footer */}
      <div className="fact-node__footer">
        <span className="fact-node__confidence">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`fact-node__dot${i < conf.dots ? "" : " fact-node__dot--muted"}`}
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
    </div>
  );
}
