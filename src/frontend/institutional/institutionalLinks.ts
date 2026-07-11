import { publicInstitutionalContact } from "@shared/institutional/contact.js";
import type { TranslationKey } from "@shared/i18n/index.js";

type InternalInstitutionalLink = {
  readonly labelKey: TranslationKey;
  readonly to: string;
};

type ExternalInstitutionalLink = {
  readonly labelKey: TranslationKey;
  readonly href: string;
};

type EmailInstitutionalLink = {
  readonly labelKey: TranslationKey;
  readonly email: string;
};

/** Shared institutional destinations and i18n label keys used by footers and institutional navigation. */
export const institutionalLinks = {
  about: { labelKey: "footer.about", to: "/about" },
  contact: { labelKey: "footer.contact", to: "/contact" },
  privacy: { labelKey: "footer.privacy", to: "/privacy" },
  terms: { labelKey: "footer.terms", to: "/terms" },
  github: { labelKey: "footer.github", href: publicInstitutionalContact.github },
  email: { labelKey: "footer.email", email: publicInstitutionalContact.email },
} as const satisfies {
  readonly about: InternalInstitutionalLink;
  readonly contact: InternalInstitutionalLink;
  readonly privacy: InternalInstitutionalLink;
  readonly terms: InternalInstitutionalLink;
  readonly github: ExternalInstitutionalLink;
  readonly email: EmailInstitutionalLink;
};

export const institutionalPageLinks = [
  institutionalLinks.about,
  institutionalLinks.contact,
  institutionalLinks.privacy,
  institutionalLinks.terms,
] as const;
