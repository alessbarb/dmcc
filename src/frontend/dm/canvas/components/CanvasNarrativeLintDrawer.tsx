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
          <div style={{ textAlign: "center", padding: "20px", color: "var(--theme-text-secondary)" }}>
            <span style={{ fontSize: "2rem" }}>✨</span>
            <p style={{ marginTop: "10px", color: "var(--theme-feedback-success-foreground)", fontWeight: "600" }}>¡Todo perfecto!</p>
            <p style={{ fontSize: "0.85rem" }}>No se han detectado problemas de consistencia narrativa en tu canvas.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)" }}>
              Se han encontrado <strong>{issues.length}</strong> detalles a revisar:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "calc(100vh - 160px)" }}>
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    padding: "10px",
                    borderRadius: "var(--theme-shapes-radius-small)",
                    borderLeft: `3px solid ${issue.type === "error" ? "var(--theme-feedback-danger-foreground)" : issue.type === "warning" ? "var(--theme-feedback-warning-foreground)" : "var(--theme-accents-primary-foreground)"}`,
                    backgroundColor: "var(--theme-surfaces-interactive)",
                    fontSize: "0.82rem",
                    lineHeight: "1.4",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: issue.type === "error" ? "var(--theme-feedback-danger-foreground)" : issue.type === "warning" ? "var(--theme-feedback-warning-foreground)" : "var(--theme-text-primary)" }}>
                    {issue.type === "error" ? t("canvas.node.statusCritical") : issue.type === "warning" ? "⚠️ Advertencia" : "💡 Sugerencia"}
                  </div>
                  <div>{issue.message}</div>
                  {issue.entityId && (
                    <button
                      onClick={() => onSelectEntity(issue.entityId!)}
                      className="btn btn-link btn-xs"
                      style={{ padding: 0, marginTop: "6px", fontSize: "10px", color: "var(--theme-accents-primary-foreground)", border: "none", background: "transparent", cursor: "pointer" }}
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
