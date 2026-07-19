import { X } from "lucide-react";
import type { SessionProjectionEdge } from "@core/domain/session/projection/sessionProjectionTypes.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { isPromotableInferenceRule } from "./promotableInferenceRules.js";

export interface ConsequenceChainEdgeInspectorProps {
  edge: SessionProjectionEdge;
  onClose: () => void;
  onReview: (decision: "accepted" | "hidden") => void;
  onPromote: () => void;
}

export function ConsequenceChainEdgeInspector({ edge, onClose, onReview, onPromote }: ConsequenceChainEdgeInspectorProps) {
  const { t } = useTranslation();
  const canPromote = edge.provenance.basis !== "explicit" && isPromotableInferenceRule(edge.provenance.ruleId);

  return (
    <aside className="consequence-chain-inspector">
      <header className="consequence-chain-inspector__header">
        <div className="consequence-chain-inspector__eyebrow-row">
          <span className="consequence-chain-inspector__eyebrow">{t(`sessionConsequenceChain.edgeKinds.${edge.kind}`)}</span>
          <button type="button" className="consequence-chain-inspector__close" onClick={onClose} aria-label={t("common.close")}>
            <X size={16} />
          </button>
        </div>
        <h3>{edge.label ?? `${edge.sourceId} → ${edge.targetId}`}</h3>
      </header>

      <div className="consequence-chain-inspector__provenance">
        <div className="consequence-chain-inspector__section-title">{t("sessionConsequenceChain.provenanceTitle")}</div>
        <dl>
          <dt>{t("sessionConsequenceChain.provenanceBasis")}</dt>
          <dd>{t(`sessionConsequenceChain.provenanceBasisValues.${edge.provenance.basis}`)}</dd>
          <dt>{t("sessionConsequenceChain.provenanceRule")}</dt>
          <dd><code>{edge.provenance.ruleId}</code></dd>
        </dl>
      </div>

      <div className="consequence-chain-inspector__review-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onReview("accepted")}>
          {t("sessionConsequenceChain.reviewConfirm")}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onReview("hidden")}>
          {t("sessionConsequenceChain.reviewHide")}
        </button>
        {canPromote && (
          <button type="button" className="btn btn-primary btn-sm" onClick={onPromote}>
            {t("sessionConsequenceChain.reviewPromote")}
          </button>
        )}
      </div>
    </aside>
  );
}
