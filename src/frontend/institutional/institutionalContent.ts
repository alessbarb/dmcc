import type { SupportedLocale } from "@shared/i18n/index.js";

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
  readonly sections: readonly InstitutionalSection[];
};

export const institutionalContact = {
  email: "dmcampaigncompanion@gmail.com",
  github: "https://github.com/alessbarb/DMCC",
  } as const;

const legalLastUpdated = "10 July 2026";
const legalLastUpdatedEs = "10 de julio de 2026";

const commonPages = {
  en: {
    about: {
      eyebrow: "Project overview",
      title: "Campaign memory for tabletop RPG groups.",
      summary: "DMCC helps Dungeon Masters organize campaign facts, secrets, timelines, players, and table-ready context without losing the magic of improvisation.",
      sections: [
        { title: "What DMCC is", paragraphs: ["Dungeon Master Campaign Companion is a local-first campaign workspace for tabletop RPGs. It keeps story memory, world relationships, session context, and player-facing portals close to the table.", "The project focuses on practical prep: remembering what happened, deciding what matters next, and revealing the right information to the right audience."] },
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
      title: "Memoria de campa\xf1a para grupos de rol de mesa.",
      summary: "DMCC ayuda a directores de juego a organizar hechos, secretos, cronolog\xedas, jugadores y contexto listo para la mesa sin perder la magia de improvisar.",
      sections: [
        { title: "Qu\xe9 es DMCC", paragraphs: ["Dungeon Master Campaign Companion es un espacio de trabajo local-first para campa\xf1as de rol de mesa. Mantiene la memoria narrativa, las relaciones del mundo, el contexto de sesi\xf3n y los portales para jugadores cerca de la mesa.", "El proyecto se centra en preparaci\xf3n pr\xe1ctica: recordar qu\xe9 ocurri\xf3, decidir qu\xe9 importa despu\xe9s y revelar la informaci\xf3n adecuada a la audiencia correcta."] },
        { title: "Principios de dise\xf1o", paragraphs: ["DMCC prioriza claridad, notas conscientes de la privacidad y herramientas que apoyan al director de juego sin sustituirlo. Secretos, rumores y hechos can\xf3nicos son material de campa\xf1a de primera clase."] },
      ],
    },
    contact: {
      eyebrow: "Soporte y feedback",
      title: "Contacta con el proyecto DMCC.",
      summary: "Preguntas, errores, comentarios e ideas de colaboraci\xf3n son bienvenidas por email o en el repositorio p\xfablico de GitHub.",
      sections: [
        { title: "Email", paragraphs: [`Para contacto directo, escribe a ${institutionalContact.email}. Incluye contexto suficiente para reproducir errores o entender tu necesidad de flujo de campa\xf1a.`] },
        { title: "GitHub", paragraphs: ["Usa GitHub para c\xf3digo fuente, incidencias y conversaciones del proyecto. Los reportes p\xfablicos son m\xe1s \xfatiles cuando incluyen pasos de reproducci\xf3n, comportamiento esperado y capturas si procede."] },
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
        { title: "Controller and contact", paragraphs: [`DMCC is responsible for handling application data. For privacy questions, rights requests, or policy communications, write to ${institutionalContact.email}.`, "The application is available at dmcc.onrender.com and the public project repository is hosted at github.com/alessbarb/DMCC."] },
        { title: "Data processed", paragraphs: ["DMCC may process information you voluntarily enter, including account data, email address, user profiles, campaigns, characters, players, sessions, notes, entities, relationships, facts, secrets, timelines, boards, proposals, player-visible content, and configuration preferences.", "Technical data required to operate the service may also be processed, including session identifiers, cookies, authentication data, IP address, user agent, security logs, error events, and usage metadata reasonably necessary to maintain availability, integrity, and protection.", "Do not enter special categories of personal data or sensitive personal information about players or other people unless you have a lawful basis and the affected people have been informed and have provided any required consent."] },
        { title: "Purposes", paragraphs: ["Data is processed to create and manage accounts, authenticate sessions, provide secure campaign access, store and synchronize game information, display player portals, preserve preferences, provide support, diagnose errors, prevent abuse, protect service security, and comply with applicable legal obligations.", "Campaign content is used to provide DMCC organization, preparation, consultation, visibility, and collaboration features. It is not used to sell advertising profiles or behavioral advertising."] },
        { title: "Legal basis and retention", paragraphs: ["The main legal basis is performance of the relationship requested by the user when creating an account or using the application. Some technical and security processing relies on DMCC's legitimate interest in maintaining a stable, secure, and functional service.", "Data is retained while the account is active, while needed to provide the application, or while a legal, technical, or security reason justifies retention. Backups and technical logs may remain for a limited period until rotation or secure deletion."] },
        { title: "Cookies, local storage, and providers", paragraphs: ["DMCC may use cookies, browser local storage, and similar technologies to maintain sessions, remember preferences, protect forms, enable interface features, and improve application stability.", "The application may rely on infrastructure, hosting, database, email, code repository, and technical providers needed to operate, deploy, maintain, and protect the service. Those providers should access data only as needed to provide their services."] },
        { title: "User rights and security", paragraphs: [`You may request access, rectification, deletion, objection, restriction, and portability by writing to ${institutionalContact.email}. Requests should include enough information to verify identity and locate the affected data.`, "DMCC applies technical and organizational measures aimed at protecting data against unauthorized access, loss, alteration, or improper disclosure. No system is infallible, so users should protect credentials, review shared views, avoid unnecessary secrets, and keep their own copies of important campaign information."] },
        { title: "Changes", paragraphs: ["DMCC may update this policy to reflect legal, technical, or operational changes. Relevant changes will update the last-updated date and may be communicated through the application or available channels."] },
      ],
    },
    terms: {
      eyebrow: "Terms of use",
      title: "Terms of Use",
      summary: "These terms govern access to and use of DMCC, the application published at dmcc.onrender.com, and the project available at github.com/alessbarb/DMCC.",
      lastUpdated: legalLastUpdated,
      sections: [
        { title: "What DMCC is", paragraphs: ["DMCC, Dungeon Master Campaign Companion, is a support tool for game masters, players, and tabletop role-playing groups. It helps organize campaigns, sessions, characters, entities, facts, secrets, relationships, timelines, boards, proposals, player-visible content, and other useful game information.", "DMCC does not replace the game master's judgment or the rules agreed by each table. Each group remains responsible for deciding how information is used in its campaign."] },
        { title: "Allowed use", paragraphs: ["You may use DMCC to create, save, edit, consult, and share tabletop campaign information, coordinate sessions, manage character and player content, prepare narrative material, record table decisions, and collaborate with participants reasonably and lawfully.", "You may use the public repository to review code, propose improvements, report bugs, open issues, participate in technical discussions, and collaborate with the project according to GitHub rules, the applicable license, and repository instructions."] },
        { title: "Prohibited use", paragraphs: ["Do not use DMCC for illegal, abusive, fraudulent, discriminatory, defamatory, privacy-invasive, harassing, impersonation, malware, vulnerability exploitation, or service interference activities.", "Do not upload, publish, or share personal data, secrets, credentials, sensitive third-party content, copyrighted material, or private player information without sufficient authorization. Do not attempt to access campaigns, accounts, systems, repositories, or data that are not yours."] },
        { title: "Account and content responsibility", paragraphs: ["You are responsible for maintaining credential confidentiality, controlling access to your devices, and reviewing what content you share with other users or players.", "You retain ownership of texts, notes, campaigns, characters, worlds, images, ideas, and other content you enter in DMCC, provided that the content is yours or you have permission to use it. By storing or sharing content, you grant DMCC a limited authorization to host, process, display, synchronize, and make it available only as needed to provide the service."] },
        { title: "Third-party content and availability", paragraphs: ["DMCC may allow you to enter, link, import, mention, or consult third-party content such as game rules, publisher material, community resources, images, external links, technical integrations, or public repositories. That content belongs to its respective owners and may be subject to additional conditions.", "DMCC is provided as an evolving project and application. Interruptions, errors, maintenance, connectivity loss, infrastructure changes, or technical limits may occur. Keep your own copies of important campaign information."] },
        { title: "Changes and liability", paragraphs: ["DMCC may modify, add, reorganize, or remove features, screens, data models, collaboration flows, integrations, documentation, and settings to improve the product, fix bugs, strengthen security, or adapt the project.", "To the maximum extent allowed by law, DMCC is not liable for indirect damages, data loss, lost profits, interrupted games, participant conflicts, content misuse, user decisions, or consequences from external materials or incorrect settings."] },
        { title: "Project, GitHub, and contact", paragraphs: [`For questions about these terms, reasonable support, bug reports, account-related requests, or collaboration proposals, write to ${institutionalContact.email}.`, "Do not publish private personal data, campaign secrets, credentials, tokens, API keys, or information that should not be public in GitHub issues, discussions, commits, or pull requests."] },
      ],
    },
  },
  es: {
    privacy: {
      eyebrow: "Pol\xedtica de privacidad",
      title: "Pol\xedtica de privacidad",
      summary: "Esta pol\xedtica explica c\xf3mo DMCC trata los datos asociados al uso de dmcc.onrender.com y del proyecto publicado en github.com/alessbarb/DMCC.",
      lastUpdated: legalLastUpdatedEs,
      sections: [
        { title: "Responsable y contacto", paragraphs: [`El responsable del tratamiento es DMCC. Para consultas de privacidad, solicitudes de derechos o comunicaciones sobre esta pol\xedtica, escribe a ${institutionalContact.email}.`, "La aplicaci\xf3n est\xe1 disponible en dmcc.onrender.com y el repositorio p\xfablico del proyecto se encuentra en github.com/alessbarb/DMCC."] },
        { title: "Datos tratados", paragraphs: ["DMCC puede tratar datos que introduces voluntariamente, incluyendo cuenta, correo electr\xf3nico, perfiles, campa\xf1as, personajes, jugadores, sesiones, notas, entidades, relaciones, hechos, secretos, cronolog\xedas, tableros, propuestas, contenido visible para jugadores y preferencias.", "Tambi\xe9n pueden tratarse datos t\xe9cnicos necesarios para operar el servicio, como identificadores de sesi\xf3n, cookies, autenticaci\xf3n, IP, agente de usuario, registros de seguridad, eventos de error y metadatos de uso razonablemente necesarios.", "No introduzcas categor\xedas especiales de datos personales ni informaci\xf3n sensible de jugadores u otras personas salvo que exista base leg\xedtima y las personas afectadas hayan sido informadas y hayan prestado el consentimiento necesario."] },
        { title: "Finalidades", paragraphs: ["Los datos se tratan para crear y gestionar cuentas, autenticar sesiones, permitir acceso seguro a campa\xf1as, almacenar y sincronizar informaci\xf3n de juego, mostrar portales para jugadores, conservar preferencias, prestar soporte, diagnosticar errores, prevenir abusos, proteger el servicio y cumplir obligaciones legales.", "El contenido de campa\xf1a se usa para proporcionar funciones de organizaci\xf3n, preparaci\xf3n, consulta, visibilidad y colaboraci\xf3n propias de DMCC. No se utiliza para vender perfiles publicitarios ni publicidad comportamental."] },
        { title: "Base legal y conservaci\xf3n", paragraphs: ["La base legal principal es la ejecuci\xf3n de la relaci\xf3n solicitada por el usuario al crear una cuenta o usar la aplicaci\xf3n. Algunos tratamientos t\xe9cnicos y de seguridad se basan en el inter\xe9s leg\xedtimo de mantener un servicio estable, seguro y funcional.", "Los datos se conservar\xe1n mientras la cuenta est\xe9 activa, mientras sean necesarios para prestar la aplicaci\xf3n o mientras exista una raz\xf3n legal, t\xe9cnica o de seguridad. Copias de seguridad y registros t\xe9cnicos pueden permanecer durante un periodo limitado hasta su rotaci\xf3n o eliminaci\xf3n segura."] },
        { title: "Cookies, almacenamiento local y proveedores", paragraphs: ["DMCC puede usar cookies, almacenamiento local del navegador y tecnolog\xedas similares para mantener sesiones, recordar preferencias, proteger formularios, habilitar funciones y mejorar la estabilidad.", "La aplicaci\xf3n puede depender de proveedores de infraestructura, alojamiento, base de datos, correo, repositorio de c\xf3digo y herramientas t\xe9cnicas necesarias para operar, desplegar, mantener y proteger el servicio. Estos proveedores deber\xedan acceder a datos solo en la medida necesaria."] },
        { title: "Derechos y seguridad", paragraphs: [`Puedes solicitar acceso, rectificaci\xf3n, supresi\xf3n, oposici\xf3n, limitaci\xf3n y portabilidad escribiendo a ${institutionalContact.email}. La solicitud debe incluir informaci\xf3n suficiente para verificar identidad y localizar datos afectados.`, "DMCC aplica medidas t\xe9cnicas y organizativas para proteger datos frente a acceso no autorizado, p\xe9rdida, alteraci\xf3n o divulgaci\xf3n indebida. Ning\xfan sistema es infalible: protege credenciales, revisa vistas compartidas, evita secretos innecesarios y mant\xe9n copias propias."] },
        { title: "Cambios", paragraphs: ["DMCC puede actualizar esta pol\xedtica para reflejar cambios legales, t\xe9cnicos u operativos. Los cambios relevantes actualizar\xe1n la fecha de \xfaltima actualizaci\xf3n y podr\xe1n comunicarse mediante la aplicaci\xf3n o canales disponibles."] },
      ],
    },
    terms: {
      eyebrow: "T\xe9rminos de uso",
      title: "T\xe9rminos de uso",
      summary: "Estos t\xe9rminos regulan el acceso y uso de DMCC, la aplicaci\xf3n publicada en dmcc.onrender.com y el proyecto disponible en github.com/alessbarb/DMCC.",
      lastUpdated: legalLastUpdatedEs,
      sections: [
        { title: "Qu\xe9 es DMCC", paragraphs: ["DMCC, Dungeon Master Campaign Companion, es una herramienta de apoyo para directores de juego, jugadores y grupos de rol de mesa. Permite organizar campa\xf1as, sesiones, personajes, entidades, hechos, secretos, relaciones, cronolog\xedas, tableros, propuestas, contenido visible para jugadores y otra informaci\xf3n \xfatil.", "DMCC no sustituye el criterio del director de juego ni las reglas acordadas por cada mesa. Cada grupo conserva la responsabilidad de decidir c\xf3mo utiliza la informaci\xf3n en su campa\xf1a."] },
        { title: "Uso permitido", paragraphs: ["Puedes usar DMCC para crear, guardar, editar, consultar y compartir informaci\xf3n de campa\xf1as, coordinar sesiones, gestionar contenido de personajes y jugadores, preparar material narrativo, registrar decisiones de mesa y colaborar razonablemente conforme a la ley.", "Tambi\xe9n puedes usar el repositorio p\xfablico para revisar c\xf3digo, proponer mejoras, reportar errores, abrir incidencias, participar en discusiones t\xe9cnicas y colaborar conforme a las reglas de GitHub, la licencia aplicable y las instrucciones del repositorio."] },
        { title: "Usos no permitidos", paragraphs: ["No debes usar DMCC para actividades ilegales, abusivas, fraudulentas, discriminatorias, difamatorias, invasivas de privacidad, acoso, suplantaci\xf3n, malware, explotaci\xf3n de vulnerabilidades o interferencia con seguridad, disponibilidad o integridad del servicio.", "No debes subir, publicar ni compartir datos personales, secretos, credenciales, contenido sensible de terceros, material protegido por derechos de autor o informaci\xf3n privada de jugadores sin autorizaci\xf3n suficiente. Tampoco intentes acceder a campa\xf1as, cuentas, sistemas, repositorios o datos ajenos."] },
        { title: "Cuenta y contenido", paragraphs: ["Eres responsable de mantener la confidencialidad de credenciales, controlar el acceso a tus dispositivos y revisar qu\xe9 contenido compartes con otros usuarios o jugadores.", "Conservas la titularidad de textos, notas, campa\xf1as, personajes, mundos, im\xe1genes, ideas y dem\xe1s contenido que introduzcas en DMCC, siempre que sea tuyo o tengas permiso. Al guardar o compartir contenido concedes a DMCC una autorizaci\xf3n limitada para alojarlo, procesarlo, mostrarlo, sincronizarlo y ponerlo a disposici\xf3n solo en la medida necesaria."] },
        { title: "Terceros y disponibilidad", paragraphs: ["DMCC puede permitir introducir, enlazar, importar, mencionar o consultar contenido de terceros como reglas, material editorial, recursos comunitarios, im\xe1genes, enlaces externos, integraciones o repositorios p\xfablicos. Ese contenido pertenece a sus titulares y puede tener condiciones adicionales.", "DMCC se proporciona como proyecto y aplicaci\xf3n en evoluci\xf3n. Pueden producirse interrupciones, errores, mantenimiento, p\xe9rdida de conectividad, cambios de infraestructura o l\xedmites t\xe9cnicos. Conserva copias propias de la informaci\xf3n importante de tus campa\xf1as."] },
        { title: "Cambios y responsabilidad", paragraphs: ["DMCC puede modificar, a\xf1adir, reorganizar o retirar funciones, pantallas, modelos de datos, flujos de colaboraci\xf3n, integraciones, documentaci\xf3n y configuraciones para mejorar el producto, corregir errores, reforzar la seguridad o adaptar el proyecto.", "En la m\xe1xima medida permitida por la ley, DMCC no ser\xe1 responsable por da\xf1os indirectos, p\xe9rdida de datos, lucro cesante, interrupciones de partidas, conflictos entre participantes, uso indebido de contenido, decisiones de usuarios o consecuencias de materiales externos o configuraciones incorrectas."] },
        { title: "Proyecto, GitHub y contacto", paragraphs: [`Para consultas sobre estos t\xe9rminos, soporte razonable, reportes de errores, solicitudes de cuenta o propuestas de colaboraci\xf3n, escribe a ${institutionalContact.email}.`, "No publiques en GitHub datos personales privados, secretos de campa\xf1as, credenciales, tokens, claves de API ni informaci\xf3n que no deba ser p\xfablica."] },
      ],
    },
  },
} as const;

const pageOrder: readonly InstitutionalPageKey[] = ["about", "contact", "privacy", "terms"];

function contentLocale(locale: SupportedLocale): "en" | "es" {
  return locale === "es" ? "es" : "en";
}

export function getInstitutionalPages(locale: SupportedLocale): readonly InstitutionalPageContent[] {
  const language = contentLocale(locale);
  const pages = { ...commonPages[language], ...legalPages[language] };
  return pageOrder.map((key) => ({
    key,
    path: `/${key}`,
    navLabel: key === "about" ? "About" : key === "contact" ? "Contact" : key === "privacy" ? "Privacy" : "Terms",
    navLabelKey: `footer.${key}`,
    ...pages[key],
  }));
}

export const institutionalPages = getInstitutionalPages("en");

export function getInstitutionalPage(key: InstitutionalPageKey, locale: SupportedLocale = "en"): InstitutionalPageContent {
  return getInstitutionalPages(locale).find((page) => page.key === key) ?? getInstitutionalPages(locale)[0];
}
