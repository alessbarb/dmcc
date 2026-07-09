import React from "react";
import { X } from "lucide-react";
import type { Canvas } from "@core/domain/canvas/types.js";
import type { Entity, Fact, Relation } from "../../../shared/stores/campaignStore.js";
import { analyzeMysteryHealth, type MysteryIssue } from "../analysis/mysteryAnalysis.js";

const severityLabel: Record<MysteryIssue["severity"], string> = {
  error: "Crítico",
  warning: "Advertencia",
  info: "Sugerencia",
};

const severityColor: Record<MysteryIssue["severity"], string> = {
  error: "var(--color-critical)",
  warning: "var(--color-warning)",
  info: "var(--primary)",
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
  const issues = analyzeMysteryHealth({ canvas, entities, facts, relations });
  const criticalCount = issues.filter((issue) => issue.severity === "error").length;

  return (
    <aside className="canvas-inspector canvas-lint-drawer" aria-label="Salud del misterio">
      <div className="inspector-header">
        <h2>🔍 Salud del misterio</h2>
        {onClose && (
          <button type="button" onClick={onClose} className="inspector-close-btn" aria-label="Cerrar salud del misterio">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="inspector-content">
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", fontSize: "0.8rem" }}>
          <span className="badge badge-primary">{issues.length} hallazgos</span>
          {criticalCount > 0 && <span className="badge badge-danger">{criticalCount} críticos</span>}
        </div>

        {issues.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "2rem" }}>✨</span>
            <p style={{ marginTop: "10px", color: "var(--success)", fontWeight: 600 }}>Misterio saludable</p>
            <p style={{ fontSize: "0.85rem" }}>Todas las pistas y revelaciones principales tienen una ruta revisable.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
            {issues.map((issue) => (
              <article
                key={issue.id}
                style={{
                  padding: "10px",
                  borderRadius: "var(--radius-sm)",
                  borderLeft: `3px solid ${severityColor[issue.severity]}`,
                  backgroundColor: "var(--bg-input)",
                  fontSize: "0.82rem",
                  lineHeight: 1.4,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "4px", color: severityColor[issue.severity] }}>
                  {severityLabel[issue.severity]}
                </div>
                <div>{issue.message}</div>
                {(issue.entityId || issue.factId) && (
                  <button
                    type="button"
                    className="btn btn-link btn-xs"
                    style={{ padding: 0, marginTop: "6px", fontSize: "10px", color: "var(--primary)", border: "none", background: "transparent", cursor: "pointer" }}
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
