import React from "react";
import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import { institutionalContact } from "./institutionalContent.js";

const footerLinks = [
  { labelKey: "footer.about", to: "/about" },
  { labelKey: "footer.contact", to: "/contact" },
  { labelKey: "footer.privacy", to: "/privacy" },
  { labelKey: "footer.terms", to: "/terms" },
] as const;

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
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="rl-footer__link">
              {t(link.labelKey)}
            </Link>
          ))}
          <a href={institutionalContact.github} className="rl-footer__link" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={`mailto:${institutionalContact.email}`} className="rl-footer__link">
            {institutionalContact.email}
          </a>
        </nav>
      </div>
    </footer>
  );
}
