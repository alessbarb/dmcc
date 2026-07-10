import React from "react";
import { getInstitutionalPage, type InstitutionalPageKey } from "./institutionalContent.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import { InstitutionalLayout } from "./InstitutionalLayout.js";

interface InstitutionalRoutePageProps {
  readonly pageKey: InstitutionalPageKey;
}

function InstitutionalRoutePage({ pageKey }: InstitutionalRoutePageProps) {
  const { locale } = useTranslation();
  return <InstitutionalLayout page={getInstitutionalPage(pageKey, locale)} />;
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
