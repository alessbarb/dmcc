import React from "react";
import { X } from "lucide-react";
import type { SessionProjectionNode } from "@core/domain/session/projection/sessionProjectionTypes.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { getNarrativeNodeVisual } from "../narrativeMap/narrativeNodeVisuals.js";

export interface ConsequenceChainInspectorProps {
  node: SessionProjectionNode;
  onClose: () => void;
  onReview: (decision: "accepted" | "hidden") => void;
}

function sourceRefLabel(ref: SessionProjectionNode["reference"]): string {
  switch (ref.type) {
    case "entity":
      return `entity:${ref.entityId}`;
    case "fact":
      return `fact:${ref.factId}`;
    case "relation":
      return `relation:${ref.relationId}`;
    case "plan_item":
      return `plan_item:${ref.planItemId}`;
    case "session_event":
      return `session_event:${ref.sessionEventId}`;
    case "story_step":
      return `story_step:${ref.storyStepId}`;
    case "objective":
      return `objective:${ref.objectiveId}`;
  }
}

export function ConsequenceChainInspector({ node, onClose, onReview }: ConsequenceChainInspectorProps) {
  const { t } = useTranslation();
  const visual = getNarrativeNodeVisual(node.kind);

  return (
    <aside className="consequence-chain-inspector" style={{ "--consequence-inspector-accent": visual.accent } as React.CSSProperties & Record<`--${string}`, string>}>
      <header className="consequence-chain-inspector__header">
        <div className="consequence-chain-inspector__eyebrow-row">
          <span className="consequence-chain-inspector__eyebrow">{t(`sessionConsequenceChain.nodeKinds.${node.kind}`)}</span>
          <button type="button" className="consequence-chain-inspector__close" onClick={onClose} aria-label={t("common.close")}>
            <X size={16} />
          </button>
        </div>
        <h3>{node.label}</h3>
      </header>

      {node.summary && <p className="consequence-chain-inspector__summary">{node.summary}</p>}

      <div className="consequence-chain-inspector__provenance">
        <div className="consequence-chain-inspector__section-title">{t("sessionConsequenceChain.provenanceTitle")}</div>
        <dl>
          <dt>{t("sessionConsequenceChain.provenanceBasis")}</dt>
          <dd>{t(`sessionConsequenceChain.provenanceBasisValues.${node.provenance.basis}`)}</dd>
          <dt>{t("sessionConsequenceChain.provenanceRule")}</dt>
          <dd><code>{node.provenance.ruleId}</code></dd>
          {node.provenance.confidence && (
            <>
              <dt>{t("sessionConsequenceChain.provenanceConfidence")}</dt>
              <dd>{t(`sessionConsequenceChain.confidenceValues.${node.provenance.confidence}`)}</dd>
            </>
          )}
        </dl>
        {node.provenance.sourceRefs.length > 0 && (
          <ul className="consequence-chain-inspector__source-refs">
            {node.provenance.sourceRefs.map((ref, index) => (
              <li key={index}><code>{sourceRefLabel(ref)}</code></li>
            ))}
          </ul>
        )}
      </div>

      <div className="consequence-chain-inspector__review-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onReview("accepted")}>
          {t("sessionConsequenceChain.reviewConfirm")}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onReview("hidden")}>
          {t("sessionConsequenceChain.reviewHide")}
        </button>
      </div>
    </aside>
  );
}
