import React from "react";
import { Link } from "@tanstack/react-router";

type InstitutionalSection = "about" | "contact" | "privacy" | "terms";

interface InstitutionalContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly bullets: readonly string[];
}

const institutionalContent: Record<InstitutionalSection, InstitutionalContent> = {
  about: {
    eyebrow: "About DMCC",
    title: "Campaign memory for safer, clearer tabletop play.",
    description:
      "DM Campaign Companion keeps your campaign context organized so game masters can prepare faster and players can revisit the story without exposing private notes.",
    bullets: [
      "Local-first tools for sessions, entities, relationships, and player-facing recaps.",
      "Purpose-built privacy boundaries between DM preparation and table-visible knowledge.",
      "A focused workspace for long-running tabletop campaigns and shared narrative continuity.",
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Reach the DMCC team.",
    description:
      "Questions, support requests, and feedback can be sent through the project contact channels configured by the operator of this deployment.",
    bullets: [
      "Include the deployment URL and browser details when reporting access issues.",
      "Avoid sending campaign secrets, passwords, or player personal data in support messages.",
      "For account-specific concerns, sign in and review your account settings first.",
    ],
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy is part of the campaign model.",
    description:
      "DMCC separates private DM data from player-visible projections and keeps account data scoped to the capabilities enabled by your deployment.",
    bullets: [
      "DM-only preparation notes should remain private unless explicitly shared.",
      "Player portal views are designed around table-safe summaries and visibility controls.",
      "Deployment owners are responsible for their hosting, retention, and backup policies.",
    ],
  },
  terms: {
    eyebrow: "Terms",
    title: "Use DMCC responsibly at your table.",
    description:
      "These institutional pages provide baseline product information. Deployment-specific legal terms may vary depending on who hosts the service.",
    bullets: [
      "Do not use the service to store unlawful, abusive, or harmful content.",
      "Respect player consent and table safety when recording campaign details.",
      "Back up important campaign data before major operational changes.",
    ],
  },
};

interface InstitutionalPageProps {
  readonly activeSection: InstitutionalSection;
}

function InstitutionalPage({ activeSection }: InstitutionalPageProps) {
  const content = institutionalContent[activeSection];

  return (
    <main className="institutional-page" style={{ minHeight: "100vh", padding: "96px 24px", background: "var(--bg-abyss)", color: "var(--text-primary)" }}>
      <article style={{ maxWidth: "780px", margin: "0 auto" }}>
        <nav aria-label="Institutional pages" style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "48px" }}>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <p style={{ color: "var(--accent-fire)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{content.eyebrow}</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.25rem, 6vw, 4.5rem)", lineHeight: 1, margin: "0 0 24px" }}>{content.title}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", lineHeight: 1.7 }}>{content.description}</p>
        <ul style={{ display: "grid", gap: "16px", marginTop: "32px", paddingLeft: "1.25rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {content.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </article>
    </main>
  );
}

export function AboutPage() {
  return <InstitutionalPage activeSection="about" />;
}

export function ContactPage() {
  return <InstitutionalPage activeSection="contact" />;
}

export function PrivacyPage() {
  return <InstitutionalPage activeSection="privacy" />;
}

export function TermsPage() {
  return <InstitutionalPage activeSection="terms" />;
}
