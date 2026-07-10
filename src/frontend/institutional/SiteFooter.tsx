import React from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Shield } from "lucide-react";
import { institutionalContact } from "./institutionalContent.js";

const footerLinks = [
  { label: "Sobre DMCC", to: "/about" },
  { label: "Contacto", to: "/contact" },
  { label: "Privacidad", to: "/privacy" },
  { label: "Términos", to: "/terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="rl-footer">
      <div className="rl-footer__inner">
        <div className="rl-footer__identity">
          <div className="rl-footer__brand"><Shield size={13} aria-hidden="true" /><span>DMCC — Campaign Memory Engine</span></div>
          <div className="rl-footer__meta"><Lock size={11} aria-hidden="true" /><span>Local-first · Exportable · Bajo tu control</span></div>
        </div>

        <nav className="rl-footer__nav" aria-label="Enlaces institucionales">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="rl-footer__link">
              {link.label}
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
