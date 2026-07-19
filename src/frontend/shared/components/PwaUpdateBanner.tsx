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
      className="pwa-update-banner"
      role="status"
      aria-live="polite"
    >
      <span>Nueva versión disponible</span>
      <button
        onClick={() => {
          runPwaUpdateAction(updateServiceWorker(true), "No se pudo actualizar el service worker.");
        }}
        className="pwa-update-banner__action"
      >
        Actualizar
      </button>
    </div>
  );
}
