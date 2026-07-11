import { Link } from "@tanstack/react-router";
import { useTranslation } from "../i18n/useTranslation.js";
import "../../dm/layouts/campaign-route-transitions.css";
import "../../dm/graph/graph-mobile.css";

const APP_VERSION = "0.1.0";
const GITHUB_URL = "https://github.com/alessbarb/DMCC";

const institutionalLinks = [
  { labelKey: "footer.about", to: "/about" },
  { labelKey: "footer.contact", to: "/contact" },
  { labelKey: "footer.privacy", to: "/privacy" },
  { labelKey: "footer.terms", to: "/terms" },
] as const;

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
          {institutionalLinks.map((link) => (
            <Link key={link.to} to={link.to} className="app-footer__institutional-link">
              {t(link.labelKey)}
            </Link>
          ))}
          <a href={GITHUB_URL} className="app-footer__institutional-link" target="_blank" rel="noopener noreferrer">
            GitHub
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
