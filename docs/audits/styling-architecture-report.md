# Informe de Auditoría y Propuestas: Sistema de Estilos y Arquitectura CSS

* **Fecha de la Auditoría:** 25 de Julio de 2026
* **Autor:** Antigravity Pair Programmer
* **Estado del Proyecto:** Desarrollo y Refactorización (Migración Incremental)
* **Estado de la Cascada:** Unificada mediante `src/frontend/shared/styles/main.css`

---

## 1. Resumen Ejecutivo de Métricas

Tras ejecutar el analizador de estilos (`npm run styles:audit`), se ha obtenido el estado cuantitativo actual del sistema de estilos frente a las directrices de la arquitectura definida en [style-system.md](file:///home/alessbarb/workspace/repos/incubating/dmcc/docs/architecture/style-system.md).

### Tabla de Métricas Actuales

| Métrica | Valor Actual | Estado |
| :--- | :---: | :--- |
| **Hojas de estilo CSS analizadas** | 347 | En constante reorganización |
| **Archivos TSX con estilos inline** | 14 | Deuda técnica controlada |
| **Colores literales no permitidos (`literal-color`)** | 78 | **Requiere atención** (concentrado en 2 archivos) |
| **Estilos inline estáticos (`static-inline`)** | 1 | **Acción inmediata** (Falso positivo técnico) |
| **Estilos inline dinámicos (`dynamic-style`)** | 14 | Permitido y documentado |
| **Hojas con responsabilidad mezclada (`mixed-responsibility`)** | 3 | **Acción recomendada** (Monolitos a atomizar) |
| **Selectores de acoplamiento cruzado (`cross-component-selector`)** | 1 | **Acción recomendada** (Dependencia acoplada en AppShell) |
| **Selectores globales genéricos en peligro (`global-selector`)** | 5 | Riesgo medio de colisión |
| **Declaraciones `!important` detectadas** | 221 | Deuda heredada por adaptadores de terceros |
| **Variables CSS desconocidas o antiguas** | 0 | **Completado (100% de cumplimiento)** |

---

## 2. Análisis Detallado de Incidencias Registradas

### 2.1 Colores Literales Prohibidos (`literal-color` - 78 incidencias)

El análisis espacial revela que las 78 incidencias de colores literales fuera de los temas registrados no están dispersas por la aplicación, sino localizadas en dos archivos específicos:

* **`src/frontend/shared/styles/features/auth.css`** (32 incidencias):
    Definiciones de variables semánticas `--theme-*` reescritas con valores HSL absolutos (ej. `hsl(38 66% 62%)`, `hsl(228 36% 8%)`) en el selector `.auth-page-shell`.
* **`src/frontend/shared/styles/features/campaign-template/template-preview-landing-theme.css`** (46 incidencias):
    Definiciones duplicadas de variables semánticas `--theme-*` con valores HSL absolutos en `.campaign-template-preview-page` y `.campaign-template-preview-portal`.

#### Diagnóstico Técnico

Ambos archivos tienen una justificación de diseño sólida explicada en su documentación interna: tanto la interfaz de autenticación (Login/Register) como la previsualización pública de plantillas de campaña deben representarse como una extensión visual directa de la **Landing Page pública (marketing)**. Para asegurar su estética fija cinemática ("Landing Theme & Glassmorphism") e ignorar las preferencias claras/oscuras globales del usuario autenticado, sobrescriben de manera dura toda la paleta semántica.

Sin embargo, dado que no residen en la carpeta `src/frontend/shared/styles/landing/` (que está exenta en el auditor), se interpretan como infracciones de literal cromático.

---

### 2.2 Estilo Inline Estático (`static-inline` - 1 incidencia)

* **Ubicación:** [TemplateEntityPreviewModal.tsx:L72](file:///home/alessbarb/workspace/repos/incubating/dmcc/src/frontend/dm/pages/TemplateEntityPreviewModal.tsx#L72)

    ```tsx
    style={{ background: visual.accentSoft, color: visual.accent }}
    ```

#### Diagnóstico Técnico

Este hallazgo es un **falso positivo** del algoritmo del auditor mecánico. El estilo es funcionalmente dinámico ya que depende de las propiedades `visual.accentSoft` y `visual.accent` del modelo de la entidad renderizada.
La función de análisis `classifyInlineStyle` en [auditStyles.mjs](file:///home/alessbarb/workspace/repos/incubating/dmcc/scripts/styles/auditStyles.mjs) valida la existencia de expresiones dinámicas buscando patrones como `${`, `--` o palabras clave como `props`, `state`, `value`, `index`, `progress`, etc. Al usar la palabra `visual`, no clasifica en el rango dinámico y lo marca como estático con severidad alta.

---

### 2.3 Hojas Monolíticas (`mixed-responsibility` - 3 incidencias)

El sistema impone un límite mecánico para evitar hojas gigantes y favorecer la atomización de componentes. Las hojas infractoras son:

1. **`src/frontend/dm/sessions/session-workspace.css`** (Gravedad: **Crítica**):
    * *Métricas:* 307 líneas, 46 selectores (Límite de alerta: 30 selectores).
    * *Problema:* Contiene conjuntamente la estructura del espacio de trabajo del DM (`.session-page`, `.session-active-workspace`), tarjetas del panel de hilos narrativos (`.story-thread-card`) y estilos heredados del planificador narrativo (`.threads-list`). Mezcla composición estructural, layouts y componentes.
2. **`src/frontend/shared/styles/features/campaign-template/template-preview-sections.css`** (Gravedad: **Crítica**):
    * *Métricas:* 470 líneas, 66 selectores (Límite de alerta: 45 selectores).
    * *Problema:* Confluye la estructura del grid de la previsualización, la visualización de estadísticas, los estilos de tarjetas de previsualización y el overlay de bloqueo de contenido (`.campaign-template-preview-gated`).
3. **`src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-shell.css`** (Gravedad: **Alta**):
    * *Métricas:* 242 líneas, 31 selectores.
    * *Problema:* Excede por un selector el umbral de advertencia (30). Contiene tanto el shell del dashboard del DM como las vistas de tarjetas de campañas creadas.

---

### 2.4 Selectores de Acoplamiento Cruzado (`cross-component-selector` - 1 incidencia)

* **Ubicación:** [app-shell.css:L58-59](file:///home/alessbarb/workspace/repos/incubating/dmcc/src/frontend/shared/styles/layout/app-shell.css#L58-59)

    ```css
    .app-container--campaign-shell:has(.sidebar--collapsed)::before,
    .app-container--campaign-shell:has(.sidebar--collapsed)::after {
      left: 64px;
    }
    ```

#### Diagnóstico Técnico

El selector utiliza la pseudo-clase `:has()` para alterar las propiedades de desplazamiento (`left`) del fondo de la aplicación en función del estado interno de un componente secundario (el Sidebar colapsado, `.sidebar--collapsed`).
Esto rompe el principio de encapsulación de BEM y la separación global/local descrita en la arquitectura, ya que el contenedor del layout del shell depende del marcado interno de un componente independiente.

---

### 2.5 Selectores Globales Genéricos (`global-selector` - 5 incidencias)

El auditor identifica clases que, por no llevar prefijo de componente, tienen riesgo de colisiones globales en la cascada:

* `.grid` en [grid.css](file:///home/alessbarb/workspace/repos/incubating/dmcc/src/frontend/shared/styles/layout/grid.css)
* `.card` en [card.css](file:///home/alessbarb/workspace/repos/incubating/dmcc/src/frontend/shared/styles/primitives/card.css)
* `.modal-header`, `.modal-body` y `.modal-footer` en [dialog.css](file:///home/alessbarb/workspace/repos/incubating/dmcc/src/frontend/shared/styles/primitives/dialog.css)

#### Diagnóstico Técnico

Aunque están ubicadas correctamente en el directorio de `primitives/` y actúan como resets y bases globales del framework visual de la aplicación, el auditor avisa de su genericidad. Esto se mantiene como riesgo medio para evitar que hojas locales redefinan estas clases base de forma incontrolada.

---

### 2.6 Declaraciones `!important` (221 incidencias)

#### Diagnóstico Técnico

Estas declaraciones rompen el flujo natural de la cascada CSS. En DMCC, se concentran en componentes altamente interactivos y complejos, como:

* Integración responsiva de React Flow (`react-flow.css`, `network-flow-responsive.css`).
* Componentes de arrastrar y soltar de la biblioteca y el canvas.
* El reencuadre y manipulación de imágenes de entidad (`entity-image-reframe-layout.css`).

Gran parte de esta deuda es necesaria para imponerse a los estilos en línea (`style="..."`) inyectados en el DOM directamente por las librerías de terceros (React Flow, React Flow Node wrappers, etc.). Sin embargo, muchas no están justificadas y podrían regularizarse mediante selectores de mayor especificidad o el uso de la directiva de exclusión permitida en el auditor.

---

## 3. Evaluación de la Arquitectura CSS Actual

### Puntos Fuertes Detectados

1. **Cascada Limpia y Predecible:** La eliminación del archivo monolítico global `index.css` y la consolidación de `main.css` como único punto de entrada importado en `main.tsx` ha ordenado enormemente la carga.
2. **Tokens Centralizados:** Cero variables CSS desconocidas o huérfanas. La compatibilidad de las variables `--theme-*` con los temas `default`, `fantasy` y `sci-fi` y sus modos claro/oscuro funciona al 100% de forma robusta.
3. **Aislamiento de la Landing:** `landing.css` encapsula perfectamente la paleta cinematográfica oscura original de DMCC sin contaminar las pantallas del panel autenticado del usuario.

### Limitaciones de la Implementación

1. **Falta de Clasificación de Excepciones Cinematográficas:** La arquitectura no define explícitamente cómo gestionar las páginas "híbridas" (como Login y Template Preview) que requieren la paleta fija de la landing pero viven fuera de la carpeta `/landing/`.
2. **Flexibilidad del Analizador Mecánico:** El auditor de estilos TSX es demasiado rígido frente a variables locales dinámicas de estilo (ej. objetos de configuración visual), provocando falsos positivos en estilos inline.

---

## 4. Propuestas Técnicas de Resolución y Plan de Trabajo

Con el fin de regularizar la deuda visual y estabilizar la auditoría mecánica de cara a los siguientes sprints de desarrollo, se detallan las siguientes 5 propuestas de refactorización.

### Propuesta 1: Regularización de Superficies Cinemáticas Fijas (Auth & Template Preview)

Para resolver las 78 vulneraciones de `literal-color` sin comprometer la identidad visual requerida en el login y la previsualización:

* **Opción A (Recomendada):** Extender el allowlist del auditor en [styleAuditConfig.mjs](file:///home/alessbarb/workspace/repos/incubating/dmcc/scripts/styles/styleAuditConfig.mjs) para reconocer estas páginas como superficies cinemáticas aprobadas.

    ```js
    colorLiteralAllow: [
      /^src\/frontend\/account\/(defaultTheme|fantasyTheme|sciFiTheme)\.ts$/,
      /^src\/frontend\/shared\/styles\/landing\//,
      /^src\/frontend\/shared\/styles\/features\/auth\.css$/,
      /^src\/frontend\/shared\/styles\/features\/campaign-template\/template-preview-landing-theme\.css$/
    ]
    ```

    *Razón:* Mantiene el orden de importación y el direccionamiento actual sin romper imports en los componentes React de Auth y Templates.

* **Opción B (Alternativa de Reubicación):** Reubicar las hojas infractoras dentro de una subcarpeta de la landing:
  * Mover `features/auth.css` a `landing/auth-shell.css`
  * Mover `features/campaign-template/template-preview-landing-theme.css` a `landing/template-preview-landing-theme.css`
    Y actualizar los imports en `LoginPage.tsx`, `RegisterPage.tsx`, `InvitationPage.tsx` y `campaign-template.css`.

---

### Propuesta 2: Atomización de Monolitos CSS (Sesiones y Plantillas)

Siguiendo las directrices del **Sprint 11 (Sesiones)** y el principio de responsabilidad única, se propone la división de las hojas monolíticas:

#### Desglose de `session-workspace.css` (307 líneas)

* **`layout/session-workspace-layout.css`** (Composición estructural):
    Manejo de `.session-page`, `.session-active-workspace` y áreas de flexbox principales del DM.
* **`features/story/story-threads-panel.css`** (Componentes de historia):
    Manejo de `.story-threads-panel`, `.story-thread-card` y subelementos de la tarjeta.
* **`features/story/story-backlog-steps.css`** (Control de pasos y estado):
    Manejo de `.story-thread-backlog-step` y `.threads-list`.

#### Desglose de `template-preview-sections.css` (470 líneas)

* **`features/campaign-template/template-preview-layout.css`**:
    Manejo de `.campaign-template-preview-grid` y contenedores principales.
* **`features/campaign-template/template-preview-stats.css`**:
    Estilos para `.campaign-template-preview-stats` y tipografías asociadas.
* **`features/campaign-template/template-preview-gated-overlay.css`**:
    Aislamiento del comportamiento y filtros del overlay de bloqueo (`.campaign-template-preview-gated`).

---

### Propuesta 3: Desacoplamiento del Sidebar en AppShell

Para eliminar el selector cruzado `:has()` en `app-shell.css` que acopla el shell a la estructura interna del Sidebar:

1. **Refactorización React:** Asegurar que el componente contenedor `CampaignShell` exponga y controle la clase `.app-container--sidebar-collapsed` en su propio elemento raíz cuando el estado del sidebar cambie.
2. **Simplificación CSS:** Sustituir las líneas 58-59 de `app-shell.css`:

    ```diff
    - .app-container--campaign-shell:has(.sidebar--collapsed)::before,
    - .app-container--campaign-shell:has(.sidebar--collapsed)::after
    ```

    Y mantener únicamente la versión basada en modificadores puros de contenedor:

    ```css
    .app-container--campaign-shell.app-container--sidebar-collapsed::before,
    .app-container--campaign-shell.app-container--sidebar-collapsed::after {
      left: 64px;
    }
    ```

---

### Propuesta 4: Robustecer el Clasificador de Estilos Inline en el Auditor

Para eliminar falsos positivos de estilos inline dinámicos (como el de `TemplateEntityPreviewModal.tsx`):

1. Modificar la regex de búsqueda de variables dinámicas en `classifyInlineStyle` en [auditStyles.mjs](file:///home/alessbarb/workspace/repos/incubating/dmcc/scripts/styles/auditStyles.mjs).
2. Permitir la detección de accesos a propiedades Javascript comunes dentro del objeto de estilos, como `visual.`, `theme.`, `config.`, o cualquier palabra clave que denote acceso a objetos en tiempo de ejecución.

    ```diff
    - const containsDynamic = /\$\{|--[a-zA-Z0-9_-]+|\b(?:props|state|value|index|progress|focus|position|transform|runtime|custom)\b/.test(valueSource);
    + const containsDynamic = /\$\{|--[a-zA-Z0-9_-]+|\b(?:props|state|value|index|progress|focus|position|transform|runtime|custom|visual|theme|colorValue)\b/.test(valueSource);
    ```

---

### Propuesta 5: Campaña de Justificación y Limpieza de `!important`

Reducir las 221 incidencias de `!important` a través de un proceso híbrido de limpieza y justificación:

1. **Clasificación de Terceros:** Mover estilos que interactúan directamente con React Flow a `vendor/react-flow.css` y declarar en `styleAuditConfig.mjs` una exención o justificar mediante comentarios autorizados:

    ```css
    /* style-audit-allow important: React Flow dynamic element override */
    ```

2. **Refactorización de Especificidad:** En los componentes de control propio (como `entity-image-reframe`), eliminar el `!important` incrementando la especificidad del selector CSS local o estructurando mejor la cascada del componente.
