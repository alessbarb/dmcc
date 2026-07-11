import type { SupportedLocale } from "@shared/i18n/index.js";
import { institutionalLinks } from "./institutionalLinks.js";

export type InstitutionalPageKey = "about" | "contact" | "privacy" | "terms";

export type InstitutionalSection = {
  readonly title: string;
  readonly paragraphs: readonly string[];
};

export type InstitutionalPageContent = {
  readonly key: InstitutionalPageKey;
  readonly path: `/${InstitutionalPageKey}`;
  readonly navLabel: string;
  readonly navLabelKey: `footer.${InstitutionalPageKey}`;
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly lastUpdated?: string;
  readonly translationNotice?: string;
  readonly sections: readonly InstitutionalSection[];
};

export const institutionalContact = {
  email: institutionalLinks.email.email,
  github: institutionalLinks.github.href,
} as const;

const legalLastUpdated = "July 10, 2026";
const legalLastUpdatedEs = "10 de julio de 2026";

const fallbackContentLocaleCodes = ["fr", "de", "it", "pt"] as const satisfies readonly SupportedLocale[];
type FallbackContentLocale = (typeof fallbackContentLocaleCodes)[number];

const translationNotices = {
  fr: "Cette page est disponible en anglais pendant que nous terminons sa traduction.",
  de: "Diese Seite ist auf Englisch verfügbar, während wir die Übersetzung fertigstellen.",
  it: "Questa pagina è disponibile in inglese mentre completiamo la traduzione.",
  pt: "Esta página está disponível em inglês enquanto concluímos a tradução.",
} satisfies Record<FallbackContentLocale, string>;

const fallbackContentLocales = new Set<SupportedLocale>(fallbackContentLocaleCodes);

const commonPages = {
  en: {
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
  },
  es: {
    about: {
      eyebrow: "Resumen del proyecto",
      title: "Memoria de campaña para grupos de rol de mesa.",
      summary: "DMCC ayuda a directores de juego a organizar hechos, secretos, cronologías, jugadores y contexto listo para la mesa sin perder la magia de improvisar.",
      sections: [
        { title: "Qué es DMCC", paragraphs: ["Dungeon Master Campaign Companion es un espacio de trabajo para campañas de rol de mesa. Mantiene la memoria narrativa, las relaciones del mundo, el contexto de sesión y los portales para jugadores cerca de la mesa.", "El proyecto se centra en preparación práctica: recordar qué ocurrió, decidir qué importa después y revelar la información adecuada a la audiencia correcta."] },
        { title: "Principios de diseño", paragraphs: ["DMCC prioriza claridad, notas conscientes de la privacidad y herramientas que apoyan al director de juego sin sustituirlo. Secretos, rumores y hechos canónicos son material de campaña de primera clase."] },
      ],
    },
    contact: {
      eyebrow: "Soporte y feedback",
      title: "Contacta con el proyecto DMCC.",
      summary: "Preguntas, errores, comentarios e ideas de colaboración son bienvenidas por email o en el repositorio público de GitHub.",
      sections: [
        { title: "Email", paragraphs: [`Para contacto directo, escribe a ${institutionalContact.email}. Incluye contexto suficiente para reproducir errores o entender tu necesidad de flujo de campaña.`] },
        { title: "GitHub", paragraphs: ["Usa GitHub para código fuente, incidencias y conversaciones del proyecto. Los reportes públicos son más útiles cuando incluyen pasos de reproducción, comportamiento esperado y capturas si procede."] },
      ],
    },
  },
} as const;

const legalPages = {
  en: {
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
  },
  es: {
    privacy: {
      eyebrow: "Política de privacidad",
      title: "Política de privacidad",
      summary: "Esta política explica cómo DMCC trata los datos asociados al uso de dmcc.onrender.com y del proyecto publicado en github.com/alessbarb/DMCC.",
      lastUpdated: legalLastUpdatedEs,
      sections: [
        { title: "Responsable del proyecto", paragraphs: [`El responsable de contacto del proyecto es DMCC. Para consultas de privacidad, solicitudes de derechos o comunicaciones sobre esta política, escribe a ${institutionalContact.email}.`, "La aplicación está disponible en dmcc.onrender.com y el repositorio público del proyecto se encuentra en github.com/alessbarb/DMCC."] },
        { title: "Datos que podemos tratar", paragraphs: ["DMCC puede tratar datos que introduces voluntariamente, incluyendo cuenta, correo electrónico, perfiles, campañas, personajes, jugadores, sesiones, notas, entidades, relaciones, hechos, secretos, cronologías, tableros, propuestas, contenido visible para jugadores y preferencias.", "También pueden tratarse datos técnicos necesarios para operar el servicio, como identificadores de sesión, autenticación, IP, agente de usuario, registros de seguridad, eventos de error y metadatos de uso razonablemente necesarios.", "No introduzcas categorías especiales de datos personales ni información sensible de jugadores u otras personas salvo que exista base legítima y las personas afectadas hayan sido informadas y hayan prestado el consentimiento necesario."] },
        { title: "Para qué usamos los datos", paragraphs: ["Los datos se tratan para crear y gestionar cuentas, autenticar sesiones, permitir acceso seguro a campañas, almacenar y sincronizar información de juego, mostrar portales para jugadores, conservar preferencias, prestar soporte, diagnosticar errores, prevenir abusos, proteger el servicio y cumplir obligaciones legales.", "El contenido de campaña se usa para proporcionar funciones de organización, preparación, consulta, visibilidad y colaboración propias de DMCC. No se utiliza para vender perfiles publicitarios ni publicidad comportamental."] },
        { title: "Base legal", paragraphs: ["La base legal principal es la ejecución de la relación solicitada por el usuario al crear una cuenta o usar la aplicación. Algunos tratamientos técnicos y de seguridad se basan en el interés legítimo de mantener un servicio estable, seguro y funcional.", "Cuando el tratamiento dependa del consentimiento, incluidas cookies o tecnologías similares no necesarias cuando corresponda, puedes retirarlo en cualquier momento sin afectar al tratamiento ya realizado lícitamente."] },
        { title: "Conservación de los datos", paragraphs: ["Los datos se conservarán mientras la cuenta esté activa, mientras sean necesarios para prestar la aplicación o mientras exista una razón legal, técnica o de seguridad.", "Copias de seguridad y registros técnicos pueden permanecer durante un periodo limitado hasta su rotación o eliminación segura."] },
        { title: "Cookies y almacenamiento local", paragraphs: ["DMCC puede usar cookies, almacenamiento local del navegador y tecnologías similares para mantener sesiones, recordar preferencias, proteger formularios, habilitar funciones y mejorar la estabilidad.", "Las cookies técnicas necesarias para seguridad, autenticación, preferencias o funciones solicitadas de la aplicación pueden utilizarse sin consentimiento cuando la ley lo permita porque son necesarias para el servicio.", "Las cookies analíticas, publicitarias o de seguimiento, o tecnologías similares, solo se usarán con información clara y consentimiento previo y revocable cuando corresponda."] },
        { title: "Servicios de terceros", paragraphs: ["La aplicación puede depender de proveedores de infraestructura, alojamiento, base de datos, correo, repositorio de código y herramientas técnicas necesarias para operar, desplegar, mantener y proteger el servicio.", "Estos proveedores deberían acceder a datos solo en la medida necesaria para prestar sus servicios y pueden estar sujetos a sus propios términos y políticas de privacidad."] },
        { title: "Tus derechos", paragraphs: [`Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${institutionalContact.email}. La solicitud debe incluir información suficiente para verificar identidad y localizar datos afectados.`, "También puedes retirar el consentimiento cuando el tratamiento se base en el consentimiento, sin afectar a la licitud del tratamiento realizado antes de retirarlo."] },
        { title: "Seguridad", paragraphs: ["DMCC aplica medidas técnicas y organizativas para proteger datos frente a acceso no autorizado, pérdida, alteración o divulgación indebida.", "Ningún sistema es infalible: protege credenciales, revisa vistas compartidas, evita secretos innecesarios y mantén copias propias."] },
        { title: "Cambios en esta política", paragraphs: ["DMCC puede actualizar esta política para reflejar cambios legales, técnicos u operativos. Los cambios relevantes actualizarán la fecha de última actualización y podrán comunicarse mediante la aplicación o canales disponibles."] },
      ],
    },
    terms: {
      eyebrow: "Términos de uso",
      title: "Términos de uso",
      summary: "Estos términos regunetwork el acceso y uso de DMCC, la aplicación publicada en dmcc.onrender.com y el proyecto disponible en github.com/alessbarb/DMCC.",
      lastUpdated: legalLastUpdatedEs,
      sections: [
        { title: "Qué es DMCC", paragraphs: ["DMCC, Dungeon Master Campaign Companion, es una herramienta de apoyo para directores de juego, jugadores y grupos de rol de mesa. Permite organizar campañas, sesiones, personajes, entidades, hechos, secretos, relaciones, cronologías, tableros, propuestas, contenido visible para jugadores y otra información útil.", "DMCC no sustituye el criterio del director de juego ni las reglas acordadas por cada mesa. Cada grupo conserva la responsabilidad de decidir cómo utiliza la información en su campaña."] },
        { title: "Uso permitido", paragraphs: ["Puedes usar DMCC para crear, guardar, editar, consultar y compartir información de campañas, coordinar sesiones, gestionar contenido de personajes y jugadores, preparar material narrativo, registrar decisiones de mesa y colaborar razonablemente conforme a la ley.", "Solo debes usar DMCC de forma respetuosa con la ley aplicable, otros usuarios, la privacidad de los jugadores, la seguridad del servicio y las instrucciones del repositorio."] },
        { title: "Tu cuenta", paragraphs: ["Eres responsable de mantener la confidencialidad de tus credenciales, controlar el acceso a tus dispositivos y revisar la actividad realizada desde tu cuenta.", "No intentes acceder a campañas, cuentas, sistemas, repositorios o datos ajenos, y avisa al proyecto si crees que la seguridad de tu cuenta se ha visto comprometida."] },
        { title: "Tu contenido", paragraphs: ["Conservas la titularidad de textos, notas, campañas, personajes, mundos, imágenes, ideas y demás contenido que introduzcas en DMCC, siempre que sea tuyo o tengas permiso para usarlo.", "Al guardar o compartir contenido concedes a DMCC una autorización limitada para alojarlo, procesarlo, mostrarlo, sincronizarlo y ponerlo a disposición solo en la medida necesaria para prestar el servicio. No subas, publiques ni compartas datos personales, secretos, credenciales, contenido sensible de terceros, material protegido por derechos de autor o información privada de jugadores sin autorización suficiente."] },
        { title: "Contenido de terceros", paragraphs: ["DMCC puede permitir introducir, enlazar, importar, mencionar o consultar contenido de terceros como reglas, material editorial, recursos comunitarios, imágenes, enlaces externos, integraciones o repositorios públicos.", "Ese contenido pertenece a sus titulares y puede tener condiciones adicionales. Eres responsable de confirmar que tu uso del contenido de terceros está permitido."] },
        { title: "Disponibilidad del servicio", paragraphs: ["DMCC se proporciona como proyecto y aplicación en evolución. Pueden producirse interrupciones, errores, mantenimiento, pérdida de conectividad, cambios de infraestructura o límites técnicos.", "Conserva copias propias de la información importante de tus campañas y evita depender de DMCC como único registro de material crítico."] },
        { title: "Cambios en la aplicación", paragraphs: ["DMCC puede modificar, añadir, reorganizar o retirar funciones, pantallas, modelos de datos, flujos de colaboración, integraciones, documentación y configuraciones para mejorar el producto, corregir errores, reforzar la seguridad o adaptar el proyecto.", "Los cambios pueden afectar a cómo se muestra, organiza, comparte, importa o exporta la información de campaña."] },
        { title: "Limitación de responsabilidad", paragraphs: ["En la máxima medida permitida por la ley, DMCC no será responsable por daños indirectos, pérdida de datos, lucro cesante, interrupciones de partidas, conflictos entre participantes, uso indebido de contenido, decisiones de usuarios o consecuencias de materiales externos o configuraciones incorrectas.", "Nada en estos términos limita responsabilidades cuando la ley aplicable no permita dicha limitación."] },
        { title: "Proyecto, colaboración y GitHub", paragraphs: ["El repositorio público del proyecto está disponible en github.com/alessbarb/DMCC. Puedes usarlo para revisar código, proponer mejoras, reportar errores, abrir incidencias, participar en discusiones técnicas y colaborar conforme a las reglas de GitHub, la licencia aplicable y las instrucciones del repositorio.", "No publiques en GitHub datos personales privados, secretos de campañas, credenciales, tokens, claves de API ni información que no deba ser pública."] },
        { title: "Contacto", paragraphs: [`Para consultas sobre estos términos, soporte razonable, reportes de errores, solicitudes de cuenta o propuestas de colaboración, escribe a ${institutionalContact.email}.`] },
        { title: "Cambios en estos términos", paragraphs: ["DMCC puede actualizar estos términos para reflejar cambios legales, técnicos u operativos. Los cambios relevantes actualizarán la fecha de última actualización y podrán comunicarse mediante la aplicación o canales disponibles."] },
      ],
    },
  },
} as const;

const pageOrder: readonly InstitutionalPageKey[] = ["about", "contact", "privacy", "terms"];

// Option A: long institutional content is intentionally complete only in ES/EN; FR/DE/IT/PT keep localized navigation and show a transparent English-content notice until translations are ready.
function contentLocale(locale: SupportedLocale): "en" | "es" {
  return locale === "es" ? "es" : "en";
}

function isFallbackContentLocale(locale: SupportedLocale): locale is FallbackContentLocale {
  return fallbackContentLocales.has(locale);
}

function translationNotice(locale: SupportedLocale): string | undefined {
  return isFallbackContentLocale(locale) ? translationNotices[locale] : undefined;
}

export function getInstitutionalPages(locale: SupportedLocale): readonly InstitutionalPageContent[] {
  const networkguage = contentLocale(locale);
  const pages = { ...commonPages[networkguage], ...legalPages[networkguage] };
  const notice = translationNotice(locale);
  return pageOrder.map((key) => ({
    key,
    path: `/${key}`,
    navLabel: key === "about" ? "About" : key === "contact" ? "Contact" : key === "privacy" ? "Privacy" : "Terms",
    navLabelKey: `footer.${key}`,
    translationNotice: notice,
    ...pages[key],
  }));
}

export const institutionalPages = getInstitutionalPages("en");

export function getInstitutionalPage(key: InstitutionalPageKey, locale: SupportedLocale = "en"): InstitutionalPageContent {
  return getInstitutionalPages(locale).find((page) => page.key === key) ?? getInstitutionalPages(locale)[0];
}
