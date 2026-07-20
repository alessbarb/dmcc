import { X } from "lucide-react";
import type { Canvas } from "@core/domain/canvas/types.js";
import type { Entity, Fact, Relation } from "../../../shared/stores/campaignStore.js";
import { analyzeMysteryHealth, type MysteryIssue } from "../analysis/mysteryAnalysis.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";

const severityLabel: Record<MysteryIssue["severity"], string> = {
  error: "Crítico",
  warning: "Advertencia",
  info: "Sugerencia",
};

export function MysteryHealthPanel({
  canvas,
  entities,
  facts,
  relations,
  onClose,
  onFocusEntity,
  onFocusFact,
}: {
  canvas: Canvas;
  entities: Entity[];
  facts: Fact[];
  relations: Relation[];
  onClose?: () => void;
  onFocusEntity?: (entityId: string) => void;
  onFocusFact?: (factId: string) => void;
}) {
  const { t } = useTranslation();
  const issues = analyzeMysteryHealth({ canvas, entities, facts, relations });
  const criticalCount = issues.filter((issue) => issue.severity === "error").length;

  return (
    <aside className="canvas-inspector canvas-lint-drawer" aria-label={t("canvas.mysteryHealth")}>
      <div className="inspector-header">
        <h2>🔍 Salud del misterio</h2>
        {onClose && (
          <button type="button" onClick={onClose} className="inspector-close-btn" aria-label={t("common.close")}>
            <X size={16} />
          </button>
        )}
      </div>
      <div className="inspector-content">
        <div className="mystery-health__summary">
          <span className="badge badge-primary">{issues.length} hallazgos</span>
          {criticalCount > 0 && <span className="badge badge-danger">{criticalCount} críticos</span>}
        </div>

        {issues.length === 0 ? (
          <div className="mystery-health__empty">
            <span className="mystery-health__empty-icon">✨</span>
            <p className="mystery-health__success">Misterio saludable</p>
            <p className="mystery-health__empty-message">Todas las pistas y revelaciones principales tienen una ruta revisable.</p>
          </div>
        ) : (
          <div className="mystery-health__issues">
            {issues.map((issue) => (
              <article
                key={issue.id}
                className={`mystery-health__issue mystery-health__issue--${issue.severity}`}
              >
                <div className="mystery-health__issue-title">
                  {severityLabel[issue.severity]}
                </div>
                <div>{issue.message}</div>
                {(issue.entityId || issue.factId) && (
                  <button
                    type="button"
                    className="btn btn-link btn-xs mystery-health__focus"
                    onClick={() => {
                      if (issue.entityId) onFocusEntity?.(issue.entityId);
                      if (issue.factId) onFocusFact?.(issue.factId);
                    }}
                  >
                    Enfocar elemento
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
