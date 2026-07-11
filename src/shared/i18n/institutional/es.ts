import { institutionalContact } from "../../institutional/contact.js";
import type { InstitutionalLocaleContent } from "./types.js";

const legalLastUpdated = "10 de julio de 2026";

const commonPages = {
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
  } as const;

const legalPages = {
    privacy: {
      eyebrow: "Política de privacidad",
      title: "Política de privacidad",
      summary: "Esta política explica cómo DMCC trata los datos asociados al uso de dmcc.onrender.com y del proyecto publicado en github.com/alessbarb/DMCC.",
      lastUpdated: legalLastUpdated,
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
      summary: "Estos términos regulan el acceso y uso de DMCC, la aplicación publicada en dmcc.onrender.com y el proyecto disponible en github.com/alessbarb/DMCC.",
      lastUpdated: legalLastUpdated,
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
  } as const;

export const institutionalContentES = {
  ...commonPages,
  ...legalPages,
} satisfies InstitutionalLocaleContent;
