import { useTranslation } from "../i18n/useTranslation.js";

const APP_VERSION = "0.1.0";

type AppFooterProps = {
  variant?: "default" | "landing";
};

export function AppFooter({ variant = "default" }: AppFooterProps) {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className={`app-footer app-footer--${variant}`}>
      <div className="app-footer__brand">
        <strong>DM Campaign Companion</strong>
        <span>{t("appFooter.tagline")}</span>
      </div>

      <div className="app-footer__meta" aria-label={t("appFooter.ariaLabel")}>
        <span>v{APP_VERSION}</span>
        <span>Local-first</span>
        <span>{t("appFooter.localData")}</span>
        <span>© {currentYear}</span>
      </div>
    </footer>
  );
}