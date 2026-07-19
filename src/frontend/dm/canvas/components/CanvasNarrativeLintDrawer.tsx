import type { Canvas } from "@core/domain/canvas/types.js";
import type { Entity, Relation } from "../../../shared/stores/campaignStore.js";
import { X } from "lucide-react";
import { runNarrativeLint } from "../services/canvasNarrativeLint.js";

interface CanvasNarrativeLintDrawerProps {
  activeCanvas: Canvas;
  campaignState: { entities: Entity[]; relations: Relation[] };
  onClose: () => void;
  onSelectEntity: (entityId: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function CanvasNarrativeLintDrawer({
  activeCanvas,
  campaignState,
  onClose,
  onSelectEntity,
  t,
}: CanvasNarrativeLintDrawerProps) {
  const issues = runNarrativeLint(campaignState, activeCanvas, t);

  return (
    <div className="canvas-inspector canvas-lint-drawer">
      <div className="inspector-header">
        <h2>🧠 Consistencia Narrativa</h2>
        <button onClick={onClose} className="inspector-close-btn">
          <X size={16} />
        </button>
      </div>
      <div className="inspector-content">
        {issues.length === 0 ? (
          <div className="canvas-lint-empty">
            <span className="canvas-lint-empty__icon">✨</span>
            <p className="canvas-lint-empty__success">¡Todo perfecto!</p>
            <p className="canvas-lint-empty__message">No se han detectado problemas de consistencia narrativa en tu canvas.</p>
          </div>
        ) : (
          <div className="canvas-lint-content">
            <p className="canvas-lint-summary">
              Se han encontrado <strong>{issues.length}</strong> detalles a revisar:
            </p>
            <div className="canvas-lint-issues">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`canvas-lint-issue canvas-lint-issue--${issue.type}`}
                >
                  <div className="canvas-lint-issue__title">
                    {issue.type === "error" ? t("canvas.node.statusCritical") : issue.type === "warning" ? "⚠️ Advertencia" : "💡 Sugerencia"}
                  </div>
                  <div>{issue.message}</div>
                  {issue.entityId && (
                    <button
                      onClick={() => onSelectEntity(issue.entityId!)}
                      className="btn btn-link btn-xs canvas-lint-issue__inspect"
                    >
                      Inspeccionar elemento
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
