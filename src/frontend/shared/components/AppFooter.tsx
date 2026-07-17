import { Link } from "@tanstack/react-router";
import { useTranslation } from "../i18n/useTranslation.js";
import { institutionalLinks, institutionalPageLinks } from "../../institutional/institutionalLinks.js";

const APP_VERSION = "0.1.0";

type AppFooterProps = {
  variant?: "default" | "landing";
  showInstitutionalLinks?: boolean;
};

export function AppFooter({ variant = "default", showInstitutionalLinks = true }: AppFooterProps) {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className={`app-footer app-footer--${variant}`}>
      <div className="app-footer__brand">
        <strong>DM Campaign Companion</strong>
        <span>Campaign Memory Engine</span>
      </div>

      {showInstitutionalLinks ? (
        <nav className="app-footer__institutional-links" aria-label={t("appFooter.ariaLabel")}>
          {institutionalPageLinks.map((link) => (
            <Link key={link.to} to={link.to} className="app-footer__institutional-link">
              {t(link.labelKey)}
            </Link>
          ))}
          <a href={institutionalLinks.github.href} className="app-footer__institutional-link" target="_blank" rel="noopener noreferrer">
            {t(institutionalLinks.github.labelKey)}
          </a>
        </nav>
      ) : null}

      <div className="app-footer__meta" aria-label="DMCC metadata">
        <span>v{APP_VERSION}</span>
        <span>© {currentYear}</span>
        <span>DMCC</span>
      </div>
    </footer>
  );
}
