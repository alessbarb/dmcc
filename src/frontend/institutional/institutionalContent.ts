export type InstitutionalPageKey = "about" | "contact" | "privacy" | "terms";

export type InstitutionalSection = {
  readonly title: string;
  readonly body: readonly string[];
};

export type InstitutionalPageContent = {
  readonly key: InstitutionalPageKey;
  readonly path: `/${InstitutionalPageKey}`;
  readonly navLabel: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly sections: readonly InstitutionalSection[];
};

export const institutionalContact = {
  email: "dmcampaigncompanion@gmail.com",
  github: "https://github.com/alessbarb/DMCC",
} as const;

export const institutionalPages: readonly InstitutionalPageContent[] = [
  {
    key: "about",
    path: "/about",
    navLabel: "About",
    eyebrow: "Project overview",
    title: "Campaign memory for tabletop RPG groups.",
    summary:
      "DMCC helps Dungeon Masters organize campaign facts, secrets, timelines, players, and table-ready context without losing the magic of improvisation.",
    sections: [
      {
        title: "What DMCC is",
        body: [
          "Dungeon Master Campaign Companion is a local-first campaign workspace for tabletop RPGs. It is designed to keep story memory, world relationships, session context, and player-facing portals close to the table.",
          "The project focuses on practical prep: remembering what happened, deciding what matters next, and making it easier to reveal the right information to the right audience.",
        ],
      },
      {
        title: "Design principles",
        body: [
          "DMCC favors clarity, privacy-aware campaign notes, and tools that support a DM rather than replacing one. The app treats secrets, rumors, and canonical facts as first-class campaign material.",
        ],
      },
    ],
  },
  {
    key: "contact",
    path: "/contact",
    navLabel: "Contact",
    eyebrow: "Support and feedback",
    title: "Reach the DMCC project.",
    summary:
      "Questions, bug reports, feedback, and collaboration ideas are welcome through email or the public GitHub repository.",
    sections: [
      {
        title: "Email",
        body: [
          `For direct contact, write to ${institutionalContact.email}. Please include enough context to reproduce bugs or understand your campaign workflow request.`,
        ],
      },
      {
        title: "GitHub",
        body: [
          "Use GitHub for source code, issues, and project discussions. Public reports are especially helpful when they can include steps to reproduce, expected behavior, and screenshots where relevant.",
        ],
      },
    ],
  },
  {
    key: "privacy",
    path: "/privacy",
    navLabel: "Privacy",
    eyebrow: "Data and visibility",
    title: "Privacy is part of campaign trust.",
    summary:
      "DMCC is built around local-first campaign organization and careful audience boundaries for DM-only notes, table knowledge, and player-facing information.",
    sections: [
      {
        title: "Information you choose to store",
        body: [
          "Campaign notes, characters, entities, secrets, session records, and account profile details are information you decide to add while using the app.",
          "Avoid storing sensitive personal information in campaign material unless every affected participant has agreed to that use.",
        ],
      },
      {
        title: "Visibility model",
        body: [
          "The product separates DM-private material from player-visible surfaces. Review privacy previews and visibility controls before sharing a campaign portal with players.",
        ],
      },
      {
        title: "Contact",
        body: [
          `For privacy questions or deletion requests related to a hosted deployment, contact ${institutionalContact.email}.`,
        ],
      },
    ],
  },
  {
    key: "terms",
    path: "/terms",
    navLabel: "Terms",
    eyebrow: "Use of the project",
    title: "Use DMCC responsibly at your table.",
    summary:
      "These terms summarize expected use for the application and project resources. They are intentionally plain-language and should be reviewed before relying on a hosted deployment.",
    sections: [
      {
        title: "Acceptable use",
        body: [
          "Use DMCC to plan, run, and preserve tabletop RPG campaigns. Do not use the service to store unlawful content, harass participants, or publish private information without permission.",
        ],
      },
      {
        title: "No warranty",
        body: [
          "DMCC is provided as a campaign companion tool. Keep your own backups for important campaign data and verify any generated or imported content before using it at the table.",
        ],
      },
      {
        title: "Project repository",
        body: [
          "Source code and issue tracking are available through the GitHub repository linked on this page. Repository license terms govern code reuse where applicable.",
        ],
      },
    ],
  },
] as const;

export function getInstitutionalPage(key: InstitutionalPageKey): InstitutionalPageContent {
  return institutionalPages.find((page) => page.key === key) ?? institutionalPages[0];
}
