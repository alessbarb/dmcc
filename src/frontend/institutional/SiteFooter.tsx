import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import { institutionalLinks, institutionalPageLinks } from "./institutionalLinks.js";

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="rl-footer">
      <div className="rl-footer__inner">
        <div className="rl-footer__identity">
          <div className="rl-footer__brand"><Shield size={13} aria-hidden="true" /><span>DMCC — Campaign Memory Engine</span></div>
          <div className="rl-footer__meta"><span>Privacy-aware campaign workspace · DMCC</span></div>
        </div>

        <nav className="rl-footer__nav" aria-label={t("appFooter.ariaLabel")}>
          {institutionalPageLinks.map((link) => (
            <Link key={link.to} to={link.to} className="rl-footer__link">
              {t(link.labelKey)}
            </Link>
          ))}
          <a href={institutionalLinks.github.href} className="rl-footer__link" target="_blank" rel="noopener noreferrer">
            {t(institutionalLinks.github.labelKey)}
          </a>
          <a href={`mailto:${institutionalLinks.email.email}`} className="rl-footer__link">
            {institutionalLinks.email.email}
          </a>
        </nav>
      </div>
    </footer>
  );
}
