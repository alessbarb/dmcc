import { useMemo } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, GitBranch, Lock, Sparkles, Wand2, X } from "lucide-react";
import type { Entity, Relation } from "../../shared/stores/campaignStore.js";
import { getEntityVisual } from "../entities/entityVisuals.js";
import { buildEntityNeighborhood } from "../entities/relations/entityRelationshipNeighborhood.js";
import { EntityRelationsList } from "../entities/relations/EntityRelationsList.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { MarkdownContent } from "../../shared/components/MarkdownContent.js";
import {
  ENTITY_TYPE_LABEL_KEYS,
  FACT_KIND_LABEL_KEYS,
  CONFIDENCE_LABEL_KEYS,
  labelFor,
  visibilityLabel,
} from "./campaignTemplatePreviewLabels.js";
import "./template-entity-preview-modal.css";

export interface TemplateEntityPreviewFact {
  factId: string;
  statement: string;
  kind: string;
  confidence: string;
  visibility?: { kind: string };
  relatedEntityIds?: string[];
}

export interface TemplateEntityPreviewModalProps {
  entity: Entity;
  entities: Entity[];
  relations: Relation[];
  facts: TemplateEntityPreviewFact[];
  onNavigateEntity: (entityId: string) => void;
  onClose: () => void;
  onRequestCopy: () => void;
}

export function TemplateEntityPreviewModal({
  entity,
  entities,
  relations,
  facts,
  onNavigateEntity,
  onClose,
  onRequestCopy,
}: TemplateEntityPreviewModalProps) {
  const { t } = useTranslation();
  const visual = getEntityVisual(entity.entityType);
  const Icon = visual.icon;
  const isDmOnly = (entity.visibility?.kind ?? "dm_only") === "dm_only";

  const neighborhood = useMemo(
    () => buildEntityNeighborhood(entity, entities, relations),
    [entity, entities, relations],
  );

  const relatedFacts = useMemo(
    () => facts.filter((fact) => fact.relatedEntityIds?.includes(entity.entityId)),
    [facts, entity.entityId],
  );

  return createPortal(
    <div className="modal-overlay campaign-template-preview-portal" onClick={onClose}>
      <div
        className="modal-content template-entity-preview-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header template-entity-preview-modal__header">
          <div className="template-entity-preview-modal__heading">
            <span
              className="template-entity-preview-modal__icon"
              style={{ background: visual.accentSoft, color: visual.accent }}
            >
              <Icon size={18} />
            </span>
            <div>
              <span className="template-entity-preview-modal__type">
                {labelFor(entity.entityType, ENTITY_TYPE_LABEL_KEYS, t)}
              </span>
              <h2>{entity.title}</h2>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label={t("campaignTemplatePreview.entityModal.close")}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body template-entity-preview-modal__body">
          <div className="template-entity-preview-modal__badges">
            <span className={isDmOnly ? "badge badge-warning" : "badge badge-success"}>
              {isDmOnly ? <EyeOff size={12} /> : <Eye size={12} />}
              {visibilityLabel(entity.visibility, t)}
            </span>
            {entity.importance === "critical" && (
              <span className="badge badge-danger">{t("campaignTemplatePreview.entityModal.critical")}</span>
            )}
          </div>

          {entity.subtitle && <p className="template-entity-preview-modal__subtitle">{entity.subtitle}</p>}
          {entity.summary || entity.content ? (
            <MarkdownContent
              value={entity.summary || entity.content}
              className="template-entity-preview-modal__summary"
            />
          ) : (
            <p className="template-entity-preview-modal__summary">{t("campaignTemplatePreview.noSummary")}</p>
          )}

          {relatedFacts.length > 0 && (
            <section className="template-entity-preview-modal__section">
              <h3>
                <Sparkles size={14} /> {t("campaignTemplatePreview.entityModal.factsTitle")}
              </h3>
              <ul className="template-entity-preview-modal__facts">
                {relatedFacts.map((fact) => (
                  <li key={fact.factId}>
                    <div className="template-entity-preview-modal__fact-heading">
                      <strong>{labelFor(fact.kind, FACT_KIND_LABEL_KEYS, t)}</strong>
                      <span>{labelFor(fact.confidence, CONFIDENCE_LABEL_KEYS, t)}</span>
                    </div>
                    <p>{fact.statement}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="template-entity-preview-modal__section">
            <h3>
              <GitBranch size={14} /> {t("campaignTemplatePreview.entityModal.relationsTitle")}
            </h3>
            <EntityRelationsList neighborhood={neighborhood} onNavigateEntity={onNavigateEntity} />
          </section>
        </div>

        <div className="modal-footer template-entity-preview-modal__footer">
          <span className="template-entity-preview-modal__footer-hint">
            <Lock size={13} /> {t("campaignTemplatePreview.entityModal.readOnlyHint")}
          </span>
          <button type="button" className="btn btn-primary" onClick={onRequestCopy}>
            <Wand2 size={14} /> {t("campaignTemplatePreview.createCopy")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
