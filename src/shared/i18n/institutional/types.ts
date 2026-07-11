export type InstitutionalPageKey = "about" | "contact" | "privacy" | "terms";

export type InstitutionalSection = {
  readonly title: string;
  readonly paragraphs: readonly string[];
};

export type InstitutionalPageBody = {
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly lastUpdated?: string;
  readonly sections: readonly InstitutionalSection[];
};

export type InstitutionalLocaleContent = Record<InstitutionalPageKey, InstitutionalPageBody>;

export type InstitutionalPageContent = InstitutionalPageBody & {
  readonly key: InstitutionalPageKey;
  readonly path: `/${InstitutionalPageKey}`;
  readonly navLabel: string;
  readonly navLabelKey: `footer.${InstitutionalPageKey}`;
  readonly translationNotice?: string;
};
