# Diseño técnico completo: refactorización y atomización del sistema de estilos de DMCC

## 1. Objetivo

Refactorizar completamente el sistema de estilos del frontend de DMCC para conseguir:

* una única cascada predecible;
* una separación estricta entre estilos globales y locales;
* cero estilos visuales estáticos en TSX;
* cero colores hardcodeados fuera de los paquetes de tema;
* hojas CSS atomizadas por responsabilidad;
* componentes locales alimentados por primitivas y tokens globales;
* un sistema mecánico de auditoría y cumplimiento en CI;
* compatibilidad completa con `default`, `fantasy` y `sci-fi`;
* validación visual real en modo claro y oscuro.

La arquitectura objetivo es:

```text
ThemePackage
    ↓
variables CSS --theme-*
    ↓
shared/styles/foundation
    ↓
shared/styles/primitives
    ↓
shared/styles/layout
    ↓
CSS local del componente
```

Los estilos locales no crean un sistema visual propio. Solo describen composición, estructura y particularidades exclusivas del componente.

## Estado de implementación

Esta especificación describe el estado objetivo y el plan de migración. En el
checkout actual la migración es incremental:

* el runtime de temas, el contrato `--theme-*` y los modos claro/oscuro están
  implementados;
* `main.tsx` tiene una única importación CSS directa;
* la fundación, las primitivas iniciales y parte de los layouts ya están
  extraídos en `shared/styles/`;
* la importación monolítica `index.css` ya fue eliminada;
* `application-domains.css`, `landing.css` y `account.css` conservan dominios
  todavía pendientes de subdivisión y no deben recibir estilos nuevos;
* el baseline del auditor es un ratchet de deuda existente, no una aprobación
  de esa deuda como arquitectura final.

Cada sprint debe reducir deuda o aislarla en una responsabilidad explícita.
Actualizar el baseline sin una reducción o una justificación revisada no se
considera cierre de sprint.

---

# 2. Principios arquitectónicos

## 2.1 Una sola fuente de verdad visual

Los únicos lugares donde pueden aparecer valores cromáticos literales son:

```text
src/frontend/account/defaultTheme.ts
src/frontend/account/fantasyTheme.ts
src/frontend/account/sciFiTheme.ts
```

Fuera de estos archivos:

* no `#hex`;
* no `rgb()`;
* no `rgba()`;
* no `hsl()`;
* no `hsla()`;
* no nombres como `white`, `black`, `red`;
* no gradientes con colores literales;
* no sombras cromáticas literales;
* no fallbacks visuales dentro de `var(...)`.

Ejemplo prohibido:

```css
color: var(--color-primary, hsl(210 80% 55%));
```

Ejemplo correcto:

```css
color: var(--theme-accents-primary-foreground);
```

## 2.2 Separación global/local

### `shared/styles`

Debe contener cualquier patrón visual reutilizable o transversal:

* reset;
* fuentes;
* tokens estructurales;
* accesibilidad;
* motion;
* botones;
* formularios;
* badges;
* cards;
* dialogs;
* tabs;
* menús;
* tooltips;
* overlays;
* navegación;
* shell;
* workspaces;
* footer;
* responsive global;
* adaptadores de terceros.

### CSS local

Solo puede contener:

* estructura propia;
* disposición interna;
* áreas del componente;
* relaciones entre subelementos;
* dimensiones exclusivas justificadas;
* estados propios del componente;
* adaptación local de primitivas globales;
* variables CSS dinámicas propias.

No puede:

* reconstruir botones;
* reconstruir inputs;
* reconstruir modales;
* definir colores propios;
* definir sombras propias;
* crear escalas de espaciado;
* afectar componentes externos;
* depender de la posición DOM de otro componente.

## 2.3 Atomización por responsabilidad

Cada hoja debe tener una responsabilidad principal:

```text
foundation
primitive
layout
vendor
component
feature
```

Una hoja no debe mezclar:

```text
reset + cards + timeline + landing + kanban
```

Ese fue el problema de `shared/styles/index.css`; sus reglas restantes viven
ahora en hojas de dominio explícitas y `application-domains.css` sigue siendo
el siguiente candidato a subdivisión.

## 2.4 Imports locales explícitos

Cada componente o feature debe importar sus estilos.

Correcto:

```tsx
import "./campaign-guided-tour.css";
```

Incorrecto:

```text
CampaignShell importa CSS de varios modales
LibraryWorkspace importa CSS de todas las pestañas
AppFooter importa CSS de transiciones de rutas
```

Actualmente `CampaignShell` carga estilos de detalle de entidad de forma persistente.

`AppFooter` importa una hoja de transiciones de campaña, lo que refleja una dependencia cruzada incorrecta.

---

# 3. Arquitectura de carpetas objetivo

```text
src/frontend/shared/styles/
├── main.css
│
├── foundation/
│   ├── reset.css
│   ├── fonts.css
│   ├── structural-tokens.css
│   ├── accessibility.css
│   ├── motion.css
│   └── color-scheme.css
│
├── primitives/
│   ├── button.css
│   ├── form-control.css
│   ├── badge.css
│   ├── card.css
│   ├── dialog.css
│   ├── tabs.css
│   ├── menu.css
│   ├── tooltip.css
│   ├── overlay.css
│   ├── empty-state.css
│   ├── toolbar.css
│   └── status.css
│
├── layout/
│   ├── app-shell.css
│   ├── campaign-shell.css
│   ├── workspace.css
│   ├── navigation.css
│   ├── sidebar.css
│   ├── top-bar.css
│   ├── footer.css
│   ├── grid.css
│   └── responsive.css
│
└── vendor/
    └── react-flow.css
```

`main.css` será el único CSS global importado por `main.tsx`.

Durante la migración, `main.css` puede importar hojas de dominio para preservar
el aspecto existente. Las hojas agregadas deben desaparecer o subdividirse
antes de cerrar el Sprint 2; no se consideran parte de la cascada objetivo.

```css
@import "./foundation/reset.css";
@import "./foundation/fonts.css";
@import "./foundation/structural-tokens.css";
@import "./foundation/accessibility.css";
@import "./foundation/motion.css";
@import "./foundation/color-scheme.css";

@import "./primitives/button.css";
@import "./primitives/form-control.css";
@import "./primitives/badge.css";
@import "./primitives/card.css";
@import "./primitives/dialog.css";
@import "./primitives/tabs.css";
@import "./primitives/menu.css";
@import "./primitives/tooltip.css";
@import "./primitives/overlay.css";
@import "./primitives/empty-state.css";
@import "./primitives/toolbar.css";
@import "./primitives/status.css";

@import "./layout/app-shell.css";
@import "./layout/campaign-shell.css";
@import "./layout/workspace.css";
@import "./layout/navigation.css";
@import "./layout/sidebar.css";
@import "./layout/top-bar.css";
@import "./layout/footer.css";
@import "./layout/grid.css";
@import "./layout/responsive.css";

@import "./vendor/react-flow.css";
```

`main.tsx` quedará reducido a:

```tsx
import "./shared/styles/main.css";
```

La cascada global ya no importa `index.css` ni `p1.css`; los dominios pendientes
están explícitamente nombrados en `shared/styles/features/`.

---

# 4. Organización de estilos locales

## Onboarding

```text
src/frontend/dm/onboarding/
├── CampaignGuidedTour.tsx
├── campaign-guided-tour.css
├── CampaignStarterHub.tsx
├── campaign-starter-hub.css
├── guidance-dialog.css
└── campaign-premise-dialog.css
```

### `campaign-guided-tour.css`

Responsabilidad:

* posición del highlight;
* disposición del card;
* header propio;
* contenido;
* progreso;
* footer;
* comportamiento responsive.

No debe definir:

* apariencia de botón;
* superficie del dialog;
* colores globales;
* bordes;
* sombras;
* focus ring.

Ejemplo:

```tsx
<section className="dialog dialog--overlay campaign-tour__card">
```

```css
.campaign-tour__card {
  width: min(24rem, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
}

.campaign-tour__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}
```

## Entidades

```text
src/frontend/dm/entities/
├── EntityDetailModal.tsx
├── entity-detail.css
├── ResumenTab.tsx
├── entity-summary.css
├── HechosTab.tsx
├── entity-facts.css
├── TrazabilidadTab.tsx
├── entity-trace.css
├── player-character-detail.css
├── entity-image.css
└── relations/
    ├── EntityRelationsTab.tsx
    ├── entity-relations.css
    └── relationship-graph.css
```

`ResumenTab.tsx` es una prioridad crítica porque contiene fondos fijos `#06070e` y colores HSL inline.

Debe quedar sin `style={{...}}` estático.

Ejemplo objetivo:

```tsx
<div className="entity-summary__visibility">
  <span className="entity-summary__visibility-label">
    {t("entityDetail.visibility")}
  </span>

  <span
    className={`status-badge ${
      visKind === "dm_only"
        ? "status-badge--danger"
        : "status-badge--success"
    }`}
  >
    {formatVisibility(visKind, locale)}
  </span>
</div>
```

## Canvas y red

```text
src/frontend/dm/map/
├── map-workspace.css
├── network/
│   ├── network.css
│   ├── network-node.css
│   ├── network-edge.css
│   ├── network-inspector.css
│   └── network-toolbar.css
└── shared/
    ├── resource-node.css
    └── relation-edge-label.css
```

```text
src/frontend/dm/canvas/
├── canvas.css
├── canvas-node.css
├── canvas-edge.css
├── canvas-toolbar.css
├── canvas-palette.css
├── canvas-dialogs.css
└── canvas-minimap.css
```

React Flow debe cargarse una sola vez desde `shared/styles/vendor/react-flow.css`.

Actualmente se importa directamente en canvas, network y relationship graph.

## Workspaces

```text
src/frontend/dm/workspaces/
├── CampaignWorkspace.tsx
├── campaign-workspace.css
├── WorkspaceTabs.tsx
└── workspace-tabs.css
```

El actual solapamiento entre `campaignWorkspace.css` y `workspaceSystem.css` debe eliminarse. Ambos son importados por `CampaignWorkspace.tsx`.

---

# 5. Primitivas globales

## 5.1 Botones

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--touch-target-min);
  padding-inline: var(--space-4);
  border-radius: var(--theme-shapes-radius-interactive);
  border: 1px solid transparent;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    opacity var(--transition-fast);
}

.btn-primary {
  background: var(--theme-accents-primary-foreground);
  border-color: var(--theme-accents-primary-border);
  color: var(--theme-accents-primary-on-accent);
}

.btn-secondary {
  background: var(--theme-surfaces-interactive);
  border-color: var(--theme-borders-default);
  color: var(--theme-text-primary);
}

.btn-danger {
  background: var(--theme-feedback-danger-strong);
  border-color: var(--theme-feedback-danger-border);
  color: var(--theme-feedback-danger-on-strong);
}

.btn-icon {
  width: var(--touch-target-min);
  padding-inline: 0;
}
```

Los CSS locales solo pueden adaptar:

```css
.campaign-tour__close {
  flex: none;
}
```

## 5.2 Dialogs

```css
.dialog {
  background: var(--theme-surfaces-raised);
  border: 1px solid var(--theme-borders-default);
  border-radius: var(--theme-shapes-radius-panel);
  color: var(--theme-text-primary);
  box-shadow: var(--theme-shadows-overlay);
}

.dialog--overlay {
  background: var(--theme-surfaces-overlay);
  border-color: var(--theme-borders-overlay);
  color: var(--theme-text-on-media);
}

.dialog__header,
.dialog__body,
.dialog__footer {
  padding: var(--space-5);
}

.dialog__header {
  border-bottom: 1px solid var(--theme-borders-default);
}

.dialog__footer {
  border-top: 1px solid var(--theme-borders-default);
}
```

Esto resuelve correctamente los tours y ayudas sobre superficies oscuras sin introducir colores locales.

## 5.3 Cards

```css
.card {
  background: var(--theme-surfaces-base);
  border: 1px solid var(--theme-borders-default);
  border-radius: var(--theme-shapes-radius-large);
  box-shadow: var(--theme-shadows-small);
}

.card--raised {
  background: var(--theme-surfaces-raised);
  box-shadow: var(--theme-shadows-medium);
}

.card--interactive:hover {
  background: var(--theme-surfaces-interactive-hover);
  border-color: var(--theme-borders-interactive-hover);
}
```

## 5.4 Estados

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--theme-shapes-radius-pill);
  border: 1px solid;
}

.status-badge--success {
  color: var(--theme-feedback-success-foreground);
  background: var(--theme-feedback-success-background);
  border-color: var(--theme-feedback-success-border);
}
```

---

# 6. Normas para estilos inline

## 6.1 Prohibidos

```tsx
style={{
  color: "...",
  background: "...",
  padding: "...",
  display: "flex",
  fontSize: "...",
  borderRadius: "...",
}}
```

## 6.2 Permitidos

Solo valores genuinamente dinámicos:

```tsx
style={{
  "--campaign-progress": `${progress}%`,
} as React.CSSProperties}
```

```tsx
style={{
  "--entity-focus-x": `${focusX}%`,
  "--entity-focus-y": `${focusY}%`,
} as React.CSSProperties}
```

```tsx
style={{
  transform: `translate(${x}px, ${y}px)`,
}}
```

Incluso los valores dinámicos deben preferir variables CSS propias:

```css
.entity-detail__hero-image {
  object-position:
    var(--entity-focus-x, 50%)
    var(--entity-focus-y, 50%);
}
```

## 6.3 Allowlist técnica

El auditor debe aceptar estilos inline únicamente cuando:

* la propiedad pertenece a la allowlist;
* el valor contiene datos dinámicos;
* existe un comentario o helper tipado que explique el uso.

Allowlist inicial:

```text
--custom-property
transform
translate
left
top
right
bottom
width
height
objectPosition
```

Pero `width` y `height` solo cuando dependan de datos runtime.

---

# 7. Auditoría mecánica versionada

## 7.1 Archivos

```text
scripts/styles/
├── auditStyles.mjs
├── styleAuditConfig.mjs
├── styleAuditRules.mjs
├── parseCss.mjs
├── parseTsx.mjs
├── buildStyleGraph.mjs
├── classifyFinding.mjs
└── renderStyleReport.mjs
```

```text
docs/architecture/
└── style-system.md
```

```text
docs/audits/
├── style-audit-baseline.json
└── style-audit-baseline.md
```

```text
.artifacts/
├── style-audit.json
└── style-audit.md
```

## 7.2 Salida JSON

```ts
type StyleAuditReport = {
  schemaVersion: 1;
  generatedAt: string;
  commitSha?: string;

  summary: {
    cssFiles: number;
    tsxFilesWithInlineStyles: number;
    forbiddenLiteralColors: number;
    staticInlineStyles: number;
    unknownCssVariables: number;
    orphanCssFiles: number;
    mixedResponsibilityFiles: number;
    crossComponentSelectors: number;
    importantDeclarations: number;
  };

  files: StyleFileAudit[];
  findings: StyleAuditFinding[];
  importGraph: StyleImportGraph;
};
```

## 7.3 Hallazgo

```ts
type StyleAuditFinding = {
  id: string;
  path: string;
  line: number;
  column?: number;

  sourceType:
    | "css"
    | "tsx-inline"
    | "tsx-style-object"
    | "svg"
    | "css-import";

  category:
    | "literal-color"
    | "static-inline"
    | "unknown-token"
    | "legacy-token"
    | "global-selector"
    | "cross-component-selector"
    | "mixed-responsibility"
    | "orphan-css"
    | "duplicate-primitive"
    | "important"
    | "vendor-import"
    | "dynamic-style";

  severity:
    | "critical"
    | "high"
    | "medium"
    | "low"
    | "info";

  selectorOrComponent?: string;
  property?: string;
  value?: string;
  reason: string;

  suggestedDestination?: string;
  suggestedClass?: string;
  suggestedToken?: string;

  status:
    | "forbidden"
    | "temporary"
    | "allowed";
};
```

---

# 8. Reglas del auditor

## 8.1 Colores literales

Detectar:

```regex
#[0-9a-fA-F]{3,8}
rgb\(
rgba\(
hsl\(
hsla\(
oklch\(
lab\(
lch\(
```

También:

```text
white
black
red
green
blue
transparent
```

`transparent` debe permitirse.

Excepciones:

```text
src/frontend/account/*Theme.ts
tests/*
public/*
emails/*
```

Los tests pueden contener literales únicamente para validar el parser o el contrato.

## 8.2 Variables CSS desconocidas

Extraer todas las referencias:

```css
var(--...)
```

Compararlas con:

* variables emitidas por el runtime;
* tokens estructurales;
* variables dinámicas allowlisted;
* variables de terceros documentadas.

Debe marcar:

```text
--color-primary
--bg-card
--accent-fire
```

## 8.3 Estilos inline

Clasificar AST de TSX:

```tsx
style={{ ... }}
style={someObject}
const foo: CSSProperties = { ... }
```

Clasificación:

```text
static
dynamic
mixed
unknown
```

`mixed` debe migrarse separando:

* clases para la parte estática;
* CSS variables para la parte dinámica.

## 8.4 Responsabilidad de hoja

Cada CSS debe tener metadatos de configuración:

```ts
{
  path: "src/frontend/dm/entities/entity-summary.css",
  layer: "component",
  domain: "entities",
  owner: "ResumenTab",
}
```

El auditor infiere y compara:

* selectores;
* imports;
* clases usadas;
* dominios mencionados;
* tamaño;
* dependencias.

Debe marcar como `mixed-responsibility` una hoja que contenga:

```text
sidebar
timeline
modal
landing
kanban
```

## 8.5 Selectores peligrosos

Marcar:

```css
.modal-content > div:first-child > img
```

```css
body:has(.canvas-page-container)
```

```css
.some-component .other-component .button
```

Severidad alta cuando una hoja local atraviesa el límite de otro componente.

## 8.6 `!important`

Todo `!important` debe ser hallazgo.

Solo se permite mediante comentario:

```css
/* style-audit-allow important: vendor override */
```

## 8.7 CSS huérfano

Una hoja es huérfana si:

* no está importada por CSS;
* no está importada por TS/TSX;
* no está en la entrada global;
* no es parte de un bundle explícito.

---

# 9. Grafo de estilos

El auditor debe generar:

## Grafo directo

```text
main.tsx
└── shared/styles/main.css
    ├── foundation/*
    ├── primitives/*
    ├── layout/*
    └── vendor/*
```

## Grafo local

```text
CampaignGuidedTour.tsx
└── campaign-guided-tour.css
```

## Grafo inverso

```text
relationship-graph.css
├── EntityRelationsTab.tsx
└── RelationshipGraphCanvas.tsx
```

Toda hoja con más de un consumidor debe justificarse como:

* primitive;
* layout;
* feature shared;
* vendor override.

---

# 10. Política de tamaño y atomización

Límites orientativos:

```text
CSS global foundation       ≤ 250 líneas por archivo
CSS primitive               ≤ 300 líneas
CSS layout                  ≤ 350 líneas
CSS component               ≤ 250 líneas
CSS feature shared          ≤ 400 líneas
```

Alertas:

```text
> 400 líneas                 revisión
> 500 líneas                 hallazgo alto
> 30 selectores              revisión
> 45 selectores              hallazgo alto
> 3 responsabilidades        hallazgo crítico
```

No son límites absolutos de compilación, sino reglas de revisión.

---

# 11. Plan de migración

## Fase 0 — Auditoría y baseline

Entrega:

* script completo;
* informe JSON;
* informe Markdown;
* grafo de imports;
* baseline versionado;
* configuración de allowlist;
* documentación de arquitectura;
* scripts npm;
* CI en modo ratchet.

No se cambia todavía el aspecto.

## Fase 1 — Fundación global

Objetivos:

* crear `shared/styles/main.css`;
* dividir `tokens.css`;
* separar reset, fonts, motion y accesibilidad;
* eliminar `p1.css`;
* subdividir progresivamente `application-domains.css`;
* definir un único orden de carga.

Criterio:

```text
main.tsx importa un solo CSS global
```

## Fase 2 — Primitivas

Migrar:

* `.btn`;
* formularios;
* badges;
* cards;
* dialogs;
* tabs;
* menus;
* tooltips;
* overlays;
* toolbars;
* estados.

Criterio:

```text
ningún componente redefine una primitiva global
```

## Fase 3 — Shells y layouts

Migrar:

* app shell;
* campaign shell;
* workspace;
* sidebar;
* navegación;
* topbar;
* footer;
* responsive;
* rutas.

Eliminar importaciones cruzadas como la de `AppFooter` con CSS de rutas.

## Fase 4 — Entidades

Prioridad:

1. `ResumenTab`;
2. `EntityDetailModal`;
3. hero e imagen;
4. tabs;
5. listado;
6. tarjetas;
7. relaciones;
8. personaje jugable;
9. metadatos.

Objetivo:

```text
style={{...}} estático en entidades = 0
colores literales = 0
```

## Fase 5 — Onboarding

Migrar:

* guided tour;
* starter hub;
* guidance dialog;
* premise dialog;
* empty states;
* hero.

Debe corregir directamente las regresiones visuales de las capturas.

## Fase 6 — Canvas, network y graph

* centralizar React Flow;
* eliminar imports repetidos;
* mover estilos de nodos;
* mover aristas;
* toolbars;
* minimap;
* inspector;
* labels;
* overlays.

## Fase 7 — Sesiones, historia y planificación

* session workspace;
* quick capture;
* event feed;
* timeline;
* story plan;
* history.

## Fase 8 — Personas y mensajería

* people workspace;
* group;
* invitations;
* knowledge;
* messaging.

## Fase 9 — Administración, cuenta y landing

* admin;
* account;
* preferences;
* public landing;
* institutional.

## Fase 10 — Cero tolerancia

Objetivo final:

```text
forbidden literal colors             0
static inline styles                 0
unknown CSS variables                0
legacy CSS variables                 0
critical mixed-responsibility files  0
orphan CSS files                     0
cross-component selectors            0
unclassified CSS files               0
```

---

# 12. Ratchet y CI

## Scripts

```json
{
  "scripts": {
    "styles:audit": "node scripts/styles/auditStyles.mjs",
    "styles:audit:report": "node scripts/styles/auditStyles.mjs --format both",
    "styles:audit:check": "node scripts/styles/auditStyles.mjs --check",
    "styles:audit:update-baseline": "node scripts/styles/auditStyles.mjs --update-baseline"
  }
}
```

## Primera etapa

La CI falla únicamente si:

* aparecen nuevas incidencias;
* aumenta una categoría;
* aparece un color hardcodeado en un archivo nuevo;
* aparece un token desconocido;
* aparece un CSS huérfano nuevo.

## Etapa final

La CI falla ante cualquier incidencia prohibida.

```yaml
- name: Style architecture audit
  run: npm run styles:audit:check
```

---

# 13. Pruebas

## Unitarias

* parser CSS;
* parser TSX;
* clasificación de literales;
* clasificación inline;
* detección de tokens;
* detección de imports;
* grafo inverso;
* allowlist;
* ratchet.

## Contratos

* ningún CSS local define colores literales;
* ningún TSX contiene estilos estáticos;
* ningún componente usa `--color-primary`;
* ningún alias legacy reaparece;
* todos los CSS están clasificados;
* todas las hojas tienen consumidor;
* React Flow se importa una vez.

## Visuales

Matriz:

```text
3 temas
× 2 modos
× pantallas críticas
```

Pantallas:

* login;
* hub DM;
* campaña;
* onboarding;
* listado de entidades;
* detalle;
* personaje;
* canvas;
* network;
* graph;
* sessions;
* messages;
* preferences;
* admin.

Capturas Playwright con comparación visual.

---

# 14. Estrategia de PR

No debe implementarse toda la refactorización en una única PR.

## PR 1 — Auditoría

```text
feat(styles): add versioned style architecture audit
```

Incluye:

* scripts;
* informes baseline;
* docs;
* CI ratchet;
* clasificación de CSS;
* cero cambios visuales.

## PR 2 — Foundation

```text
refactor(styles): establish the global style foundation
```

## PR 3 — Primitives

```text
refactor(styles): centralize shared visual primitives
```

## PR 4 — Shells

```text
refactor(styles): atomize application shells and workspaces
```

## PR 5 — Entities

```text
refactor(styles): remove entity inline styles and local visual hardcodes
```

## PR 6 — Onboarding

```text
fix(styles): rebuild onboarding surfaces on shared primitives
```

## PR 7 — Canvas and graph

```text
refactor(styles): unify canvas and graph styling
```

## PR 8+ — Resto de dominios

Una PR por dominio o conjunto coherente.

---

# 15. Definición de terminado

La refactorización se considera completada cuando:

```text
ThemePackage es la única fuente cromática
shared/styles contiene todas las reglas globales
CSS local solo contiene composición propia
no existen estilos visuales estáticos en TSX
no existen colores literales fuera de temas
no existen hojas monolíticas
no existen imports CSS cruzados injustificados
no existen selectores que atraviesen componentes
no existen variables CSS desconocidas
no existen hojas huérfanas
los tres temas pasan validación visual
```

Estado de objetivo:

```text
Inventario mecánico                  ✅
Grafo de estilos                     ✅
Baseline versionado                  ✅
Atomización global                   ✅
Atomización local                    ✅
Hardcodes en TSX                     0
Hardcodes cromáticos en CSS          0
Aliases legacy                       0
Selectores cruzados                  0
Contraste visual                     ✅
Default                              ✅
Fantasy                              ✅
Sci-fi                               ✅
```

Este diseño convierte la refactorización en un proceso medible y demostrable. La fase inicial debe ser únicamente el informe mecánico versionado y la arquitectura de cumplimiento; ese será el instrumento que impedirá volver a cerrar el trabajo antes de que el sistema visual esté realmente saneado.
