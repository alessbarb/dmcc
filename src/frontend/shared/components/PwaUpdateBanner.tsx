import { useRegisterSW } from "virtual:pwa-register/react";

function runPwaUpdateAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

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
        background: "var(--theme-surfaces-base)",
        border: "1px solid var(--theme-borders-interactive-hover)",
        borderRadius: "var(--theme-shapes-radius-large)",
        boxShadow: "var(--theme-shadows-large)",
        fontSize: "0.85rem",
        color: "var(--theme-text-primary)",
        whiteSpace: "nowrap",
      }}
    >
      <span>Nueva versión disponible</span>
      <button
        onClick={() => {
          runPwaUpdateAction(updateServiceWorker(true), "No se pudo actualizar el service worker.");
        }}
        style={{
          background: "var(--theme-accents-primary-foreground)",
          color: "var(--theme-text-primary)",
          border: "none",
          borderRadius: "var(--theme-shapes-radius-medium)",
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
