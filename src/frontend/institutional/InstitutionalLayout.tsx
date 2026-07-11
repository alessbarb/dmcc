import React from "react";
import { Link } from "@tanstack/react-router";
import { GitBranch, Mail, Sparkles } from "lucide-react";
import { getInstitutionalPages, type InstitutionalPageContent } from "@shared/i18n/institutional/index.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import { institutionalLinks } from "./institutionalLinks.js";
import { SiteFooter } from "./SiteFooter.js";
import "./institutional.css";

type InstitutionalLayoutProps = {
  readonly page: InstitutionalPageContent;
};

export function InstitutionalLayout({ page }: InstitutionalLayoutProps) {
  const { locale, t } = useTranslation();
  const institutionalPages = getInstitutionalPages(locale);

  return (
    <main className="institutional-shell">
      <div className="institutional-orb institutional-orb--gold" aria-hidden="true" />
      <div className="institutional-orb institutional-orb--violet" aria-hidden="true" />

      <section className="institutional-hero" aria-labelledby="institutional-title">
        <div className="institutional-hero__mark"><Sparkles size={20} aria-hidden="true" /></div>
        <p className="institutional-hero__kicker">DMCC</p>
        <h1 id="institutional-title">Dungeon Master Campaign Companion</h1>
        <p>{page.summary}</p>
      </section>

      <div className="institutional-frame">
        <nav className="institutional-nav" aria-label={t("institutional.navAriaLabel")}>
          {institutionalPages.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`institutional-nav__link${item.key === page.key ? " is-active" : ""}`}
              aria-current={item.key === page.key ? "page" : undefined}
            >
              <span>{t(item.navLabelKey)}</span>
            </Link>
          ))}
        </nav>

        <article className="institutional-panel" aria-labelledby="institutional-page-title">
          <p className="institutional-panel__eyebrow">{page.eyebrow}</p>
          <h2 id="institutional-page-title">{page.title}</h2>
          {page.lastUpdated ? <p className="institutional-panel__eyebrow">{t("legal.lastUpdated", { date: page.lastUpdated })}</p> : null}
          {page.translationNotice ? <p className="institutional-panel__notice">{page.translationNotice}</p> : null}
          <p className="institutional-panel__summary">{page.summary}</p>
          <div className="institutional-panel__sections">
            {page.sections.map((section) => (
              <section key={section.title} className="institutional-section">
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <aside className="institutional-contact" aria-labelledby="institutional-contact-title">
          <p className="institutional-contact__eyebrow">{t("footer.contact")}</p>
          <h2 id="institutional-contact-title">{t("contact.cardTitle")}</h2>
          <p>{t("contact.cardDescription")}</p>
          <a href={`mailto:${institutionalLinks.email.email}`} className="institutional-contact__link">
            <Mail size={16} aria-hidden="true" />
            <span>{institutionalLinks.email.email}</span>
          </a>
          <a href={institutionalLinks.github.href} className="institutional-contact__link" target="_blank" rel="noopener noreferrer">
            <GitBranch size={16} aria-hidden="true" />
            <span>{t(institutionalLinks.github.labelKey)}</span>
          </a>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
