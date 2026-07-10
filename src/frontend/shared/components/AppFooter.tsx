import { Link } from "@tanstack/react-router";
import { useTranslation } from "../i18n/useTranslation.js";
import { institutionalContact } from "../../institutional/institutionalContent.js";
import "../styles/appFooter.css";
import "../../dm/layouts/campaign-route-transitions.css";

const APP_VERSION = "0.1.0";

const footerLinks = [
  { labelKey: "footer.about", to: "/about" },
  { labelKey: "footer.contact", to: "/contact" },
  { labelKey: "footer.privacy", to: "/privacy" },
  { labelKey: "footer.terms", to: "/terms" },
] as const;

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
        <span>Campaign Memory Engine</span>
      </div>

      <nav className="app-footer__links" aria-label={t("appFooter.ariaLabel")}>
        {footerLinks.map((link) => (
          <Link key={link.to} to={link.to} className="app-footer__link">
            {t(link.labelKey)}
          </Link>
        ))}
        <a href={institutionalContact.github} className="app-footer__link" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={`mailto:${institutionalContact.email}`} className="app-footer__link">
          {institutionalContact.email}
        </a>
      </nav>

      <div className="app-footer__meta" aria-label="DMCC metadata">
        <span>v{APP_VERSION}</span>
        <span>© {currentYear}</span>
        <span>DMCC</span>
      </div>
    </footer>
  );
}
