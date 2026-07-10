import React from "react";
import { getInstitutionalPage, type InstitutionalPageKey } from "./institutionalContent.js";
import { InstitutionalLayout } from "./InstitutionalLayout.js";

interface InstitutionalRoutePageProps {
  readonly pageKey: InstitutionalPageKey;
}

function InstitutionalRoutePage({ pageKey }: InstitutionalRoutePageProps) {
  return <InstitutionalLayout page={getInstitutionalPage(pageKey)} />;
}

export function AboutPage() {
  return <InstitutionalRoutePage pageKey="about" />;
}

export function ContactPage() {
  return <InstitutionalRoutePage pageKey="contact" />;
}

export function PrivacyPage() {
  return <InstitutionalRoutePage pageKey="privacy" />;
}

export function TermsPage() {
  return <InstitutionalRoutePage pageKey="terms" />;
}
