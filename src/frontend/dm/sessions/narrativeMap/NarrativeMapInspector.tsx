import React from "react";
import { X } from "lucide-react";
import type { SessionProjectionNode } from "@core/domain/session/projection/sessionProjectionTypes.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { getNarrativeNodeVisual } from "./narrativeNodeVisuals.js";

export interface NarrativeMapInspectorProps {
  node: SessionProjectionNode;
  onClose: () => void;
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

export function NarrativeMapInspector({ node, onClose }: NarrativeMapInspectorProps) {
  const { t } = useTranslation();
  const visual = getNarrativeNodeVisual(node.kind);

  return (
    <aside className="narrative-map-inspector" style={{ "--narrative-inspector-accent": visual.accent } as React.CSSProperties & Record<`--${string}`, string>}>
      <header className="narrative-map-inspector__header">
        <div className="narrative-map-inspector__eyebrow-row">
          <span className="narrative-map-inspector__eyebrow">{t(`sessionNarrativeMap.nodeKinds.${node.kind}`)}</span>
          <button type="button" className="narrative-map-inspector__close" onClick={onClose} aria-label={t("common.close")}>
            <X size={16} />
          </button>
        </div>
        <h3>{node.label}</h3>
      </header>

      {node.summary && <p className="narrative-map-inspector__summary">{node.summary}</p>}

      <div className="narrative-map-inspector__provenance">
        <div className="narrative-map-inspector__section-title">{t("sessionNarrativeMap.provenanceTitle")}</div>
        <dl>
          <dt>{t("sessionNarrativeMap.provenanceBasis")}</dt>
          <dd>{t(`sessionNarrativeMap.provenanceBasisValues.${node.provenance.basis}`)}</dd>
          <dt>{t("sessionNarrativeMap.provenanceRule")}</dt>
          <dd><code>{node.provenance.ruleId}</code></dd>
          {node.provenance.confidence && (
            <>
              <dt>{t("sessionNarrativeMap.provenanceConfidence")}</dt>
              <dd>{t(`sessionNarrativeMap.confidenceValues.${node.provenance.confidence}`)}</dd>
            </>
          )}
        </dl>
        {node.provenance.sourceRefs.length > 0 && (
          <ul className="narrative-map-inspector__source-refs">
            {node.provenance.sourceRefs.map((ref, index) => (
              <li key={index}><code>{sourceRefLabel(ref)}</code></li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
