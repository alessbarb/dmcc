import React from "react";
import { InstitutionalLayout } from "./InstitutionalLayout.js";
import { getInstitutionalPage, type InstitutionalPageKey } from "./institutionalContent.js";

type InstitutionalPageProps = {
  readonly pageKey: InstitutionalPageKey;
};

export function InstitutionalPage({ pageKey }: InstitutionalPageProps) {
  return <InstitutionalLayout page={getInstitutionalPage(pageKey)} />;
}

export function AboutPage() {
  return <InstitutionalPage pageKey="about" />;
}

export function ContactPage() {
  return <InstitutionalPage pageKey="contact" />;
}

export function PrivacyPage() {
  return <InstitutionalPage pageKey="privacy" />;
}

export function TermsPage() {
  return <InstitutionalPage pageKey="terms" />;
}
