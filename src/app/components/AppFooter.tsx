const APP_VERSION = "0.1.0";

type AppFooterProps = {
  variant?: "default" | "landing";
};

export function AppFooter({ variant = "default" }: AppFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`app-footer app-footer--${variant}`}>
      <div className="app-footer__brand">
        <strong>DM Campaign Companion</strong>
        <span>Memoria narrativa local para dirigir campañas con continuidad.</span>
      </div>

      <div className="app-footer__meta" aria-label="Información de la aplicación">
        <span>v{APP_VERSION}</span>
        <span>Local-first</span>
        <span>Datos guardados en local</span>
        <span>© {currentYear}</span>
      </div>
    </footer>
  );
}