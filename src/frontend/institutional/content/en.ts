import type { InstitutionalLocaleContent } from "../institutionalTypes.js";
import { institutionalContact } from "../institutionalContact.js";

const legalLastUpdated = "July 10, 2026";

const commonPages = {
    about: {
      eyebrow: "Project overview",
      title: "Campaign memory for tabletop RPG groups.",
      summary: "DMCC helps Dungeon Masters organize campaign facts, secrets, timelines, players, and table-ready context without losing the magic of improvisation.",
      sections: [
        { title: "What DMCC is", paragraphs: ["Dungeon Master Campaign Companion is a campaign workspace for tabletop RPGs. It keeps story memory, world relationships, session context, and player-facing portals close to the table.", "The project focuses on practical prep: remembering what happened, deciding what matters next, and revealing the right information to the right audience."] },
        { title: "Design principles", paragraphs: ["DMCC favors clarity, privacy-aware campaign notes, and tools that support a DM rather than replacing one. Secrets, rumors, and canonical facts are first-class campaign material."] },
      ],
    },
    contact: {
      eyebrow: "Support and feedback",
      title: "Reach the DMCC project.",
      summary: "Questions, bug reports, feedback, and collaboration ideas are welcome through email or the public GitHub repository.",
      sections: [
        { title: "Email", paragraphs: [`For direct contact, write to ${institutionalContact.email}. Please include enough context to reproduce bugs or understand your campaign workflow request.`] },
        { title: "GitHub", paragraphs: ["Use GitHub for source code, issues, and project discussions. Public reports are most helpful when they include steps to reproduce, expected behavior, and screenshots where relevant."] },
      ],
    },
  } as const;

const legalPages = {
    privacy: {
      eyebrow: "Privacy policy",
      title: "Privacy Policy",
      summary: "This policy explains how DMCC handles data associated with dmcc.onrender.com and the public project at github.com/alessbarb/DMCC.",
      lastUpdated: legalLastUpdated,
      sections: [
        { title: "Project controller", paragraphs: [`The contact controller for this project is DMCC. For privacy questions, rights requests, or policy communications, write to ${institutionalContact.email}.`, "The application is available at dmcc.onrender.com and the public project repository is hosted at github.com/alessbarb/DMCC."] },
        { title: "Data we may process", paragraphs: ["DMCC may process information you voluntarily enter, including account data, email address, user profiles, campaigns, characters, players, sessions, notes, entities, relationships, facts, secrets, timelines, boards, proposals, player-visible content, and configuration preferences.", "Technical data required to operate the service may also be processed, including session identifiers, authentication data, IP address, user agent, security logs, error events, and usage metadata reasonably necessary to maintain availability, integrity, and protection.", "Do not enter special categories of personal data or sensitive personal information about players or other people unless you have a lawful basis and the affected people have been informed and have provided any required consent."] },
        { title: "How we use data", paragraphs: ["Data is processed to create and manage accounts, authenticate sessions, provide secure campaign access, store and synchronize game information, display player portals, preserve preferences, provide support, diagnose errors, prevent abuse, protect service security, and comply with applicable legal obligations.", "Campaign content is used to provide DMCC organization, preparation, consultation, visibility, and collaboration features. It is not used to sell advertising profiles or behavioral advertising."] },
        { title: "Legal basis", paragraphs: ["The main legal basis is performance of the relationship requested by the user when creating an account or using the application. Some technical and security processing relies on DMCC's legitimate interest in maintaining a stable, secure, and functional service.", "Where processing depends on consent, including non-essential cookies or similar technologies when applicable, you may withdraw that consent at any time without affecting processing already performed lawfully."] },
        { title: "Data retention", paragraphs: ["Data is retained while the account is active, while needed to provide the application, or while a legal, technical, or security reason justifies retention.", "Backups and technical logs may remain for a limited period until rotation or secure deletion."] },
        { title: "Cookies and local storage", paragraphs: ["DMCC may use cookies, browser local storage, and similar technologies to maintain sessions, remember preferences, protect forms, enable interface features, and improve application stability.", "Technical cookies that are necessary to provide security, authentication, preferences, or requested application features may be used without consent when legally permitted because they are required for the service.", "Analytics, advertising, or tracking cookies or similar technologies will only be used with clear information and prior, revocable consent when required by applicable law."] },
        { title: "Third-party services", paragraphs: ["The application may rely on infrastructure, hosting, database, email, code repository, and technical providers needed to operate, deploy, maintain, and protect the service.", "Those providers should access data only as needed to provide their services and may be subject to their own terms and privacy policies."] },
        { title: "Your rights", paragraphs: [`You may request access, rectification, deletion, objection, restriction, and portability by writing to ${institutionalContact.email}. Requests should include enough information to verify identity and locate the affected data.`, "You may also withdraw consent when processing is based on consent, without affecting the lawfulness of processing carried out before withdrawal."] },
        { title: "Security", paragraphs: ["DMCC applies technical and organizational measures aimed at protecting data against unauthorized access, loss, alteration, or improper disclosure.", "No system is infallible, so users should protect credentials, review shared views, avoid unnecessary secrets, and keep their own copies of important campaign information."] },
        { title: "Changes to this policy", paragraphs: ["DMCC may update this policy to reflect legal, technical, or operational changes. Relevant changes will update the last-updated date and may be communicated through the application or available channels."] },
      ],
    },
    terms: {
      eyebrow: "Terms of use",
      title: "Terms of Use",
      summary: "These terms govern access to and use of DMCC, the application published at dmcc.onrender.com, and the project available at github.com/alessbarb/DMCC.",
      lastUpdated: legalLastUpdated,
      sections: [
        { title: "What DMCC is", paragraphs: ["DMCC, Dungeon Master Campaign Companion, is a support tool for game masters, players, and tabletop role-playing groups. It helps organize campaigns, sessions, characters, entities, facts, secrets, relationships, timelines, boards, proposals, player-visible content, and other useful game information.", "DMCC does not replace the game master's judgment or the rules agreed by each table. Each group remains responsible for deciding how information is used in its campaign."] },
        { title: "Allowed use", paragraphs: ["You may use DMCC to create, save, edit, consult, and share tabletop campaign information, coordinate sessions, manage character and player content, prepare narrative material, record table decisions, and collaborate with participants reasonably and lawfully.", "You may use DMCC only in ways that respect applicable law, other users, player privacy, service security, and repository instructions."] },
        { title: "Your account", paragraphs: ["You are responsible for maintaining credential confidentiality, controlling access to your devices, and reviewing the activity that happens through your account.", "Do not attempt to access campaigns, accounts, systems, repositories, or data that are not yours, and notify the project if you believe account security has been compromised."] },
        { title: "Your content", paragraphs: ["You retain ownership of texts, notes, campaigns, characters, worlds, images, ideas, and other content you enter in DMCC, provided that the content is yours or you have permission to use it.", "By storing or sharing content, you grant DMCC a limited authorization to host, process, display, synchronize, and make it available only as needed to provide the service. Do not upload, publish, or share personal data, secrets, credentials, sensitive third-party content, copyrighted material, or private player information without sufficient authorization."] },
        { title: "Third-party content", paragraphs: ["DMCC may allow you to enter, link, import, mention, or consult third-party content such as game rules, publisher material, community resources, images, external links, technical integrations, or public repositories.", "That content belongs to its respective owners and may be subject to additional conditions. You are responsible for confirming that your use of third-party content is allowed."] },
        { title: "Service availability", paragraphs: ["DMCC is provided as an evolving project and application. Interruptions, errors, maintenance, connectivity loss, infrastructure changes, or technical limits may occur.", "Keep your own copies of important campaign information and avoid relying on DMCC as the only record for critical material."] },
        { title: "Changes to the application", paragraphs: ["DMCC may modify, add, reorganize, or remove features, screens, data models, collaboration flows, integrations, documentation, and settings to improve the product, fix bugs, strengthen security, or adapt the project.", "Changes may affect how campaign information is displayed, organized, shared, imported, or exported."] },
        { title: "Limitation of liability", paragraphs: ["To the maximum extent allowed by law, DMCC is not liable for indirect damages, data loss, lost profits, interrupted games, participant conflicts, content misuse, user decisions, or consequences from external materials or incorrect settings.", "Nothing in these terms limits liability where applicable law does not allow such limitation."] },
        { title: "Project, collaboration, and GitHub", paragraphs: ["The public project repository is available at github.com/alessbarb/DMCC. You may use it to review code, propose improvements, report bugs, open issues, participate in technical discussions, and collaborate according to GitHub rules, the applicable license, and repository instructions.", "Do not publish private personal data, campaign secrets, credentials, tokens, API keys, or information that should not be public in GitHub issues, discussions, commits, or pull requests."] },
        { title: "Contact", paragraphs: [`For questions about these terms, reasonable support, bug reports, account-related requests, or collaboration proposals, write to ${institutionalContact.email}.`] },
        { title: "Changes to these terms", paragraphs: ["DMCC may update these terms to reflect legal, technical, or operational changes. Relevant changes will update the last-updated date and may be communicated through the application or available channels."] },
      ],
    },
  } as const;

export const institutionalContentEN = {
  ...commonPages,
  ...legalPages,
} satisfies InstitutionalLocaleContent;
