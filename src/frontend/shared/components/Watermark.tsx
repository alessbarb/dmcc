import "./watermark.css";

/**
 * Global Watermark Component.
 * Deactivated per product decision.
 * Preserved in the codebase and layout architecture for future release/beta branding uses.
 */
export function Watermark() {
  const ENABLE_WATERMARK = false;

  if (!ENABLE_WATERMARK) {
    return null;
  }

  return <div className="watermark" aria-hidden="true" />;
}
