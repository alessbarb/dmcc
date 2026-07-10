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
    navLabel: "Privacidad",
    eyebrow: "Política de privacidad",
    title: "Política de privacidad",
    summary:
      "Última actualización: 10 de julio de 2026. Esta política explica cómo DMCC trata los datos asociados al uso de la aplicación dmcc.onrender.com y del proyecto publicado en github.com/alessbarb/DMCC.",
    sections: [
      {
        title: "Responsable y contacto",
        body: [
          `El responsable del tratamiento es DMCC. Para consultas sobre privacidad, solicitudes de derechos o comunicaciones relacionadas con esta política, puedes escribir a ${institutionalContact.email}.`,
          "La aplicación está disponible en dmcc.onrender.com y el repositorio público del proyecto se encuentra en github.com/alessbarb/DMCC.",
        ],
      },
      {
        title: "Datos tratados",
        body: [
          "DMCC puede tratar los datos que introduces voluntariamente al usar la aplicación, incluyendo datos de cuenta, dirección de correo electrónico, perfiles de usuario, campañas, personajes, jugadores, sesiones, notas, entidades, relaciones, hechos, secretos, cronologías, tableros, propuestas, contenido compartido con jugadores y preferencias de configuración.",
          "También pueden tratarse datos técnicos necesarios para operar el servicio, como identificadores de sesión, cookies, datos de autenticación, dirección IP, agente de usuario, registros de seguridad, eventos de errores y metadatos de uso razonablemente necesarios para mantener la disponibilidad, integridad y protección de la aplicación.",
          "No debes introducir categorías especiales de datos personales ni información personal sensible de jugadores u otras personas salvo que exista una base legítima para hacerlo y todas las personas afectadas hayan sido informadas y hayan prestado el consentimiento que corresponda.",
        ],
      },
      {
        title: "Finalidades",
        body: [
          "Los datos se tratan para crear y gestionar cuentas, autenticar sesiones, permitir el acceso seguro a campañas, almacenar y sincronizar información de juego, mostrar portales para jugadores, conservar preferencias, prestar soporte, diagnosticar errores, prevenir abusos, proteger la seguridad del servicio y cumplir obligaciones legales aplicables.",
          "El contenido de campaña se utiliza para proporcionar las funciones de organización, preparación, consulta, visibilidad y colaboración propias de DMCC. No se utiliza para vender perfiles publicitarios ni para publicidad comportamental.",
        ],
      },
      {
        title: "Base legal",
        body: [
          "La base legal principal es la ejecución de la relación solicitada por el usuario al crear una cuenta o utilizar la aplicación. Determinados tratamientos técnicos y de seguridad se basan en el interés legítimo de DMCC en mantener un servicio estable, seguro y funcional.",
          "Cuando una operación requiera consentimiento, por ejemplo para determinadas cookies no esenciales o comunicaciones opcionales, el tratamiento se realizará sobre la base de dicho consentimiento y podrá retirarse en cualquier momento. También pueden existir tratamientos necesarios para cumplir obligaciones legales.",
        ],
      },
      {
        title: "Conservación",
        body: [
          "Los datos se conservarán mientras la cuenta esté activa, mientras sean necesarios para prestar la aplicación o mientras exista una obligación legal, técnica o de seguridad que justifique su conservación.",
          "El contenido de campañas y datos asociados podrá eliminarse o anonimizarse cuando el usuario solicite la supresión y no exista una razón legítima para conservarlo. Las copias de seguridad y registros técnicos pueden permanecer durante un periodo limitado hasta su rotación o eliminación segura.",
        ],
      },
      {
        title: "Cookies y almacenamiento local",
        body: [
          "DMCC puede utilizar cookies, almacenamiento local del navegador y tecnologías similares para mantener sesiones, recordar preferencias, proteger formularios, habilitar funciones de la interfaz y mejorar la estabilidad de la aplicación.",
          "Puedes configurar el navegador para bloquear o eliminar cookies y almacenamiento local, aunque algunas funciones esenciales, como el inicio de sesión o la persistencia de preferencias, podrían dejar de funcionar correctamente.",
        ],
      },
      {
        title: "Servicios de terceros",
        body: [
          "La aplicación puede depender de proveedores de infraestructura, alojamiento, base de datos, correo electrónico, repositorio de código y herramientas técnicas necesarias para operar, desplegar, mantener y proteger el servicio.",
          "Estos terceros solo deberían acceder a datos en la medida necesaria para prestar sus servicios a DMCC y conforme a sus propias condiciones y políticas. El repositorio público en github.com/alessbarb/DMCC no debe usarse para publicar secretos, credenciales, datos personales privados ni contenido sensible de campañas.",
        ],
      },
      {
        title: "Derechos del usuario",
        body: [
          `Puedes solicitar el ejercicio de tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a ${institutionalContact.email}.`,
          "La solicitud debe incluir información suficiente para verificar la identidad de la persona solicitante y localizar los datos afectados. DMCC responderá conforme a los plazos y requisitos establecidos por la normativa aplicable.",
        ],
      },
      {
        title: "Seguridad",
        body: [
          "DMCC aplica medidas técnicas y organizativas orientadas a proteger los datos frente a acceso no autorizado, pérdida, alteración o divulgación indebida, incluyendo controles de sesión, separación entre contenido privado del director de juego y contenido visible para jugadores, y prácticas razonables de mantenimiento seguro.",
          "Ningún sistema es completamente infalible. Los usuarios deben proteger sus credenciales, revisar los permisos y vistas compartidas, evitar subir secretos innecesarios y mantener copias propias de la información importante de sus campañas.",
        ],
      },
      {
        title: "Cambios en la política",
        body: [
          "DMCC puede actualizar esta política para reflejar cambios legales, técnicos u operativos. Cuando los cambios sean relevantes, se actualizará la fecha de última actualización y, si procede, se comunicará mediante la aplicación o los canales disponibles.",
          "El uso continuado de la aplicación después de una actualización implica la aceptación de la política vigente, sin perjuicio de los derechos que la normativa aplicable reconozca al usuario.",
        ],
      },
    ],
  },
  {
    key: "terms",
    path: "/terms",
    navLabel: "Términos",
    eyebrow: "Términos de uso",
    title: "Términos de uso",
    summary:
      "Última actualización: 10 de julio de 2026. Estos términos regulan el acceso y uso de DMCC, la aplicación publicada en dmcc.onrender.com y el proyecto disponible en github.com/alessbarb/DMCC.",
    sections: [
      {
        title: "Qué es DMCC",
        body: [
          "DMCC, Dungeon Master Campaign Companion, es una herramienta de apoyo para directores de juego, jugadores y grupos de rol de mesa. Permite organizar campañas, sesiones, personajes, entidades, hechos, secretos, relaciones, cronologías, tableros, propuestas, contenido visible para jugadores y otra información útil para preparar y dirigir partidas.",
          "DMCC no sustituye el criterio del director de juego ni las reglas acordadas por cada mesa. La aplicación sirve como espacio de organización y consulta, y cada grupo conserva la responsabilidad de decidir cómo utiliza la información dentro de su campaña.",
        ],
      },
      {
        title: "Uso permitido",
        body: [
          "Puedes usar DMCC para crear, guardar, editar, consultar y compartir información de campañas de rol, coordinar sesiones, gestionar contenido de personajes y jugadores, preparar material narrativo, registrar decisiones de mesa y colaborar con otros participantes de forma razonable y conforme a la ley.",
          "También puedes usar el repositorio público para revisar el código, proponer mejoras, reportar errores, abrir incidencias, participar en discusiones técnicas y colaborar con el proyecto conforme a las reglas de GitHub, la licencia aplicable y las instrucciones del repositorio.",
        ],
      },
      {
        title: "Usos no permitidos",
        body: [
          "No debes usar DMCC para actividades ilegales, abusivas, fraudulentas, discriminatorias, difamatorias, invasivas de la privacidad, de acoso, de suplantación de identidad, de distribución de malware, de explotación de vulnerabilidades o de interferencia con la seguridad, disponibilidad o integridad del servicio.",
          "No debes subir, publicar ni compartir datos personales, secretos, credenciales, contenido sensible de terceros, material protegido por derechos de autor o información privada de jugadores sin autorización suficiente. Tampoco debes intentar acceder a campañas, cuentas, sistemas, repositorios o datos que no te correspondan.",
        ],
      },
      {
        title: "Responsabilidad sobre la cuenta",
        body: [
          "Eres responsable de mantener la confidencialidad de tus credenciales, controlar el acceso a tus dispositivos y revisar qué contenido compartes con otros usuarios o jugadores. Cualquier actividad realizada desde tu cuenta puede atribuirse a ti salvo que comuniques oportunamente un acceso no autorizado.",
          `Si detectas uso indebido, pérdida de credenciales, acceso no autorizado o una configuración de visibilidad incorrecta, debes corregirla cuanto antes y contactar con DMCC en ${institutionalContact.email} cuando necesites ayuda razonable.`,
        ],
      },
      {
        title: "Propiedad del contenido del usuario",
        body: [
          "Conservas la titularidad de los textos, notas, campañas, personajes, mundos, imágenes, ideas y demás contenido que introduzcas en DMCC, siempre que dicho contenido sea tuyo o tengas permiso para usarlo. Al guardar o compartir contenido en la aplicación, concedes a DMCC una autorización limitada para alojarlo, procesarlo, mostrarlo, sincronizarlo y ponerlo a disposición únicamente en la medida necesaria para prestar el servicio.",
          "Eres responsable de asegurarte de que tu contenido no infringe derechos de terceros ni obligaciones de confidencialidad. DMCC no reclama propiedad sobre el material creativo de tus campañas por el solo hecho de que lo organices dentro de la aplicación.",
        ],
      },
      {
        title: "Contenido de terceros",
        body: [
          "DMCC puede permitir introducir, enlazar, importar, mencionar o consultar contenido procedente de terceros, como reglas de juego, material de editoriales, recursos de la comunidad, imágenes, enlaces externos, integraciones técnicas o repositorios públicos. Ese contenido pertenece a sus respectivos titulares y puede estar sujeto a condiciones adicionales.",
          "Debes verificar que tienes derecho a usar, transformar o compartir cualquier contenido de terceros antes de incorporarlo a tus campañas. DMCC no garantiza la exactitud, disponibilidad, legalidad o idoneidad de recursos externos, enlaces o materiales que no controla directamente.",
        ],
      },
      {
        title: "Disponibilidad del servicio",
        body: [
          "DMCC se proporciona como proyecto y aplicación en evolución. Aunque se realizan esfuerzos razonables para mantener el servicio disponible, seguro y funcional, pueden producirse interrupciones, errores, mantenimiento, pérdida de conectividad, cambios de infraestructura o limitaciones técnicas.",
          "Debes conservar copias propias de la información importante de tus campañas y no depender de DMCC como único archivo de datos críticos. La disponibilidad continua, la ausencia de errores y la conservación indefinida de datos no están garantizadas.",
        ],
      },
      {
        title: "Cambios en la aplicación",
        body: [
          "DMCC puede modificar, añadir, reorganizar o retirar funciones, pantallas, modelos de datos, flujos de colaboración, integraciones, documentación y configuraciones para mejorar el producto, corregir errores, reforzar la seguridad o adaptar el proyecto a nuevas necesidades.",
          "Cuando un cambio pueda afectar de forma relevante al uso de la aplicación, se procurará comunicarlo mediante la propia aplicación, el repositorio, notas de versión u otros canales disponibles. Algunas funciones experimentales pueden cambiar sin aviso previo.",
        ],
      },
      {
        title: "Limitación de responsabilidad",
        body: [
          "DMCC se ofrece en la medida permitida por la ley, sin garantías de adecuación a un propósito concreto, disponibilidad ininterrumpida, ausencia total de errores, compatibilidad permanente o resultados específicos en una campaña. El uso de la aplicación se realiza bajo tu responsabilidad.",
          "En la máxima medida permitida por la normativa aplicable, DMCC no será responsable por daños indirectos, pérdida de datos, pérdida de beneficios, interrupciones de partidas, conflictos entre participantes, uso indebido de contenido, decisiones tomadas por usuarios o consecuencias derivadas de materiales externos o configuraciones incorrectas.",
        ],
      },
      {
        title: "Proyecto, colaboración y GitHub",
        body: [
          "El código fuente, las incidencias y parte de la colaboración del proyecto se gestionan en el repositorio público github.com/alessbarb/DMCC. Las contribuciones, comentarios, reportes y propuestas deben ser respetuosos, verificables cuando sea posible y pertinentes para el proyecto.",
          "Al participar en GitHub aceptas las condiciones de esa plataforma y las reglas del repositorio. No publiques en incidencias, discusiones, commits o pull requests datos personales privados, secretos de campañas, credenciales, tokens, claves de API ni información que no deba ser pública.",
        ],
      },
      {
        title: "Contacto",
        body: [
          `Para consultas sobre estos términos, soporte razonable, reportes de errores, solicitudes relacionadas con cuentas o propuestas de colaboración, puedes escribir a ${institutionalContact.email}.`,
          "Para asuntos técnicos o seguimiento público del proyecto, también puedes utilizar el repositorio de GitHub enlazado en esta página, evitando siempre publicar información confidencial o privada.",
        ],
      },
      {
        title: "Cambios en los términos",
        body: [
          "DMCC puede actualizar estos términos para reflejar cambios legales, técnicos, operativos o de alcance del proyecto. Cuando se publiquen cambios, se actualizará la fecha de última actualización y la versión vigente será la mostrada en esta página.",
          "El uso continuado de DMCC después de la publicación de una actualización implica la aceptación de los términos modificados, sin perjuicio de los derechos que la normativa aplicable reconozca al usuario. Si no estás de acuerdo con los términos vigentes, debes dejar de usar la aplicación.",
        ],
      },
    ],
  },
] as const;

export function getInstitutionalPage(key: InstitutionalPageKey): InstitutionalPageContent {
  return institutionalPages.find((page) => page.key === key) ?? institutionalPages[0];
}
