import React from "react";
import { Link } from "@tanstack/react-router";
import { GitBranch, Mail, Sparkles } from "lucide-react";
import { institutionalContact, institutionalPages, type InstitutionalPageContent } from "./institutionalContent.js";
import { SiteFooter } from "./SiteFooter.js";
import "./institutional.css";

type InstitutionalLayoutProps = {
  readonly page: InstitutionalPageContent;
};

export function InstitutionalLayout({ page }: InstitutionalLayoutProps) {
  return (
    <main className="institutional-shell">
      <div className="institutional-orb institutional-orb--gold" aria-hidden="true" />
      <div className="institutional-orb institutional-orb--violet" aria-hidden="true" />

      <section className="institutional-hero" aria-labelledby="institutional-title">
        <div className="institutional-hero__mark"><Sparkles size={20} aria-hidden="true" /></div>
        <p className="institutional-hero__kicker">DMCC</p>
        <h1 id="institutional-title">Dungeon Master Campaign Companion</h1>
        <p>Institutional information for players, Dungeon Masters, and contributors.</p>
      </section>

      <div className="institutional-frame">
        <nav className="institutional-nav" aria-label="Institutional pages">
          {institutionalPages.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`institutional-nav__link${item.key === page.key ? " is-active" : ""}`}
              aria-current={item.key === page.key ? "page" : undefined}
            >
              <span>{item.navLabel}</span>
            </Link>
          ))}
        </nav>

        <article className="institutional-panel" aria-labelledby="institutional-page-title">
          <p className="institutional-panel__eyebrow">{page.eyebrow}</p>
          <h2 id="institutional-page-title">{page.title}</h2>
          <p className="institutional-panel__summary">{page.summary}</p>
          <div className="institutional-panel__sections">
            {page.sections.map((section) => (
              <section key={section.title} className="institutional-section">
                <h3>{section.title}</h3>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <aside className="institutional-contact" aria-labelledby="institutional-contact-title">
          <p className="institutional-contact__eyebrow">Get in touch</p>
          <h2 id="institutional-contact-title">Questions or feedback?</h2>
          <p>Contact the project or review the public repository.</p>
          <a href={`mailto:${institutionalContact.email}`} className="institutional-contact__link">
            <Mail size={16} aria-hidden="true" />
            <span>{institutionalContact.email}</span>
          </a>
          <a href={institutionalContact.github} className="institutional-contact__link" target="_blank" rel="noopener noreferrer">
            <GitBranch size={16} aria-hidden="true" />
            <span>github.com/alessbarb/DMCC</span>
          </a>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
