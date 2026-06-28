import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaUpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "calc(80px + env(safe-area-inset-bottom))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-hover)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        fontSize: "0.85rem",
        color: "var(--text-main)",
        whiteSpace: "nowrap",
      }}
    >
      <span>Nueva versión disponible</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: "var(--primary)",
          color: "var(--text-main)",
          border: "none",
          borderRadius: "var(--radius-md)",
          padding: "5px 12px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.8rem",
        }}
      >
        Actualizar
      </button>
    </div>
  );
}
