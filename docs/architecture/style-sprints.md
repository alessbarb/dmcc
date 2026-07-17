# Plan de trabajo por sprints

Cada sprint debe terminar con:

* implementación completa de su alcance;
* tests añadidos o actualizados;
* auditoría de estilos ejecutada;
* CI verde;
* PR con título y descripción ajustados al resultado real;
* informe de cambios, incidencias restantes y métricas;
* revisión visual de las superficies afectadas.

No se inicia el sprint siguiente hasta que hayas revisado el anterior y confirmado su cierre.

---

## Sprint 1 — Auditoría mecánica y baseline versionado

### Objetivo

Construir el sistema que mida objetivamente toda la deuda de estilos y que impida añadir nuevas infracciones.

### Alcance

* Crear `scripts/styles/`.
* Analizar CSS, TS, TSX y SVG.
* Inventariar todos los CSS.
* Construir el grafo directo e inverso de imports.
* Detectar:

  * estilos inline;
  * objetos `CSSProperties`;
  * colores literales;
  * gradientes y sombras literales;
  * variables CSS desconocidas;
  * aliases antiguos;
  * `!important`;
  * selectores globales peligrosos;
  * selectores cruzados;
  * CSS huérfano;
  * hojas monolíticas;
  * responsabilidades mezcladas;
  * imports cruzados;
  * imports repetidos de CSS de terceros.
* Clasificar cada hoja:

  * `foundation`;
  * `primitive`;
  * `layout`;
  * `vendor`;
  * `feature`;
  * `component`;
  * `legacy`.
* Generar:

  * JSON;
  * Markdown;
  * resumen por dominio;
  * grafo de dependencias;
  * baseline versionado.
* Documentar la arquitectura aprobada.
* Añadir scripts npm.
* Añadir un ratchet de CI que impida nuevas incidencias.

### Entregables

```text
scripts/styles/*
docs/architecture/style-system.md
docs/audits/style-audit-baseline.json
docs/audits/style-audit-baseline.md
.artifacts/style-audit.json
.artifacts/style-audit.md
```

### Fuera de alcance

* Cambios visuales.
* Migración de componentes.
* Reorganización masiva de CSS.
* Eliminación de hardcodes existentes.

### Criterios de cierre

```text
Todos los CSS inventariados                  ✅
Todos los CSS clasificados                   ✅
Imports directos e inversos registrados      ✅
Hardcodes localizados por archivo y línea    ✅
Inline styles clasificados                   ✅
Baseline reproducible                        ✅
Ratchet activo                               ✅
Tests del auditor                            ✅
```

---

## Sprint 2 — Fundación global y cascada única

### Objetivo

Establecer una entrada global única y eliminar las capas globales ambiguas.

### Alcance

Crear:

```text
shared/styles/main.css
shared/styles/foundation/reset.css
shared/styles/foundation/fonts.css
shared/styles/foundation/structural-tokens.css
shared/styles/foundation/accessibility.css
shared/styles/foundation/motion.css
shared/styles/foundation/color-scheme.css
```

Migrar desde:

* `tokens.css`;
* reglas fundacionales de `index.css`;
* reglas fundacionales de `p1.css`.

Además:

* hacer que `main.tsx` importe un único CSS global;
* eliminar `p1.css`;
* retirar de `index.css` todo lo trasladado;
* documentar el orden de cascada;
* evitar cambios visuales deliberados;
* actualizar el auditor con la estructura definitiva.

### Criterios de cierre

```text
CSS global importado por main.tsx            1
p1.css                                       eliminado
Fundaciones con responsabilidad mezclada     0
Colores visuales en foundation               0
Orden de cascada documentado                 ✅
Regresión visual fundacional                 0
```

---

## Sprint 3 — Primitivas globales compartidas

### Objetivo

Centralizar todos los patrones visuales reutilizables en `shared/styles`.

### Alcance

Crear o reconstruir:

```text
primitives/button.css
primitives/form-control.css
primitives/badge.css
primitives/card.css
primitives/dialog.css
primitives/tabs.css
primitives/menu.css
primitives/tooltip.css
primitives/overlay.css
primitives/toolbar.css
primitives/empty-state.css
primitives/status.css
```

Debe cubrir:

* tamaños;
* variantes;
* hover;
* active;
* focus-visible;
* selected;
* disabled;
* loading;
* danger;
* icon buttons;
* superficies normales;
* superficies inversas;
* superficies sobre imagen o media.

Se actualizan consumidores representativos para comprobar el contrato, sin migrar todavía todos los dominios.

### Criterios de cierre

```text
Botones globales completos                    ✅
Formularios globales completos                ✅
Dialogs y overlays completos                  ✅
Tabs y cards completos                        ✅
Estados y badges completos                    ✅
Primitivas con colores literales               0
Primitivas duplicadas en shared/styles         0
Contraste de primitivas validado               ✅
```

---

## Sprint 4 — Layouts, shells y navegación

### Objetivo

Atomizar la estructura transversal de la aplicación.

### Alcance

Crear o consolidar:

```text
layout/app-shell.css
layout/campaign-shell.css
layout/workspace.css
layout/navigation.css
layout/sidebar.css
layout/top-bar.css
layout/footer.css
layout/grid.css
layout/responsive.css
```

Migrar:

* app shell;
* campaign shell;
* DM hub;
* workspaces;
* sidebar;
* top bar;
* mobile dock;
* footer;
* estructura responsive.

Eliminar:

* imports CSS cruzados desde `AppFooter`;
* CSS de componentes importado desde `CampaignShell`;
* solapamiento entre `campaignWorkspace.css` y `workspaceSystem.css`;
* reglas de shell dentro de `index.css`.

### Criterios de cierre

```text
Shells con estilos inline estáticos            0
Imports CSS cruzados de shell                  0
Layouts globales duplicados                    0
Reglas de layout en index.css                  0
Responsive global centralizado                 ✅
Navegación desktop y móvil validada            ✅
```

---

## Sprint 5 — Entidades: listado y tarjetas

### Objetivo

Refactorizar la presentación de la biblioteca de entidades antes de abordar los modales.

### Alcance

Atomizar:

```text
entity-list.css
entity-list-toolbar.css
entity-card.css
entity-grid.css
entity-empty-state.css
entity-boards.css
notebooks-workspace.css
```

Migrar:

* `EntityListView`;
* refinamientos del listado;
* boards;
* notebooks;
* tarjetas de entidad;
* filtros;
* badges;
* imágenes;
* estados vacíos.

Eliminar el solapamiento entre:

* `entities.css`;
* `entityListRefinements.css`;
* estilos globales de cards;
* estilos inline del listado.

### Criterios de cierre

```text
Inline styles estáticos del listado            0
Colores literales del dominio                  0
Tarjetas reconstruyendo primitivas             0
Selectores cruzados                            0
CSS monolítico del listado                     0
Default/fantasy/sci-fi × claro/oscuro           ✅
```

---

## Sprint 6 — Entidades: detalle, resumen y personaje

### Objetivo

Eliminar el principal foco actual de regresiones visuales.

### Alcance

Atomizar:

```text
entity-detail.css
entity-detail-hero.css
entity-detail-tabs.css
entity-summary.css
entity-metadata.css
entity-facts.css
entity-trace.css
entity-image.css
player-character-detail.css
```

Migrar:

* `EntityDetailModal`;
* `ResumenTab`;
* `HechosTab`;
* `TrazabilidadTab`;
* `PlayerCharacterDetailModal`;
* acciones de imagen;
* lightbox;
* ajuste de foco;
* footer;
* visibilidad;
* metadatos D&D.

Eliminar:

* `#06070e`;
* HSL inline;
* `--color-primary`;
* estilos estáticos en JSX;
* selectores basados en `first-child`;
* reglas de modal importadas desde `CampaignShell`;
* superposición entre las hojas antiguas del detalle.

Los valores dinámicos del foco de imagen se conservarán mediante variables CSS tipadas.

### Criterios de cierre

```text
Inline styles estáticos en entidades           0
Colores literales en entidades                 0
Tokens desconocidos                            0
Selectores que atraviesan componentes          0
CSS de detalle importado desde el shell        0
Detalle estándar validado                      ✅
Personaje jugable validado                     ✅
Imagen y lightbox validados                    ✅
```

---

## Sprint 7 — Relaciones de entidad

### Objetivo

Separar correctamente el modal relacional, el grafo y sus nodos.

### Alcance

Atomizar:

```text
entity-relations.css
relationship-explorer.css
relationship-node.css
relationship-edge.css
relationship-inspector.css
relationship-toolbar.css
```

Migrar:

* `EntityRelationsTab`;
* `RelationshipGraphCanvas`;
* nodos;
* aristas;
* etiquetas;
* inspector;
* toolbar;
* presentación ampliada y fullscreen.

La hoja compartida solo puede contener adaptaciones de React Flow y primitivas globales. Los estilos propios del grafo quedan en el dominio relacional.

### Criterios de cierre

```text
Inline styles estáticos                        0
Colores literales                              0
Responsabilidades mezcladas                    0
React Flow importado localmente                0
Tokens graph usados correctamente              ✅
Responsive y fullscreen validados              ✅
```

---

## Sprint 8 — Onboarding y ayudas

### Objetivo

Corregir las regresiones mostradas en las capturas y reconstruir las ayudas sobre primitivas globales.

### Alcance

Atomizar:

```text
campaign-guided-tour.css
campaign-starter-hub.css
guidance-dialog.css
campaign-premise-dialog.css
guided-empty-state.css
```

Migrar:

* tour;
* highlight;
* scrim;
* starter hub;
* modal de ayuda;
* recetas;
* modal de premisa;
* estados vacíos;
* hero de bienvenida.

El tour debe reutilizar:

* overlay global;
* dialog global;
* botones globales;
* contexto inverso o sobre media;
* estados de foco globales.

El CSS local solo define posición, composición y responsive.

### Criterios de cierre

```text
Texto ilegible sobre fondo oscuro              0
Inline styles estáticos                        0
Colores literales                              0
Primitivas duplicadas                          0
Tour completo en seis combinaciones            ✅
Ayuda completa en seis combinaciones           ✅
Teclado, foco y Escape                         ✅
```

---

## Sprint 9 — Canvas

### Objetivo

Atomizar el editor de canvas y centralizar su integración visual con React Flow.

### Alcance

Crear:

```text
canvas-workspace.css
canvas-flow.css
canvas-node.css
canvas-edge.css
canvas-toolbar.css
canvas-palette.css
canvas-dialog.css
canvas-minimap.css
canvas-selection.css
```

Migrar:

* nodos de entidad;
* notas;
* hechos;
* grupos;
* conexiones;
* toolbar desktop y móvil;
* palette;
* diálogos;
* selección;
* minimap;
* modos de interacción;
* undo/redo;
* layouts.

Los valores dinámicos de posición y tamaño se mantienen mediante APIs de React Flow o variables CSS.

### Criterios de cierre

```text
Import directo de React Flow CSS               0
Inline visual estático                         0
Color literal                                  0
Toolbar duplicando botones                     0
Canvas claro/oscuro                            ✅
Fantasy y sci-fi                               ✅
Desktop y móvil                                ✅
```

---

## Sprint 10 — Network y mapa

### Objetivo

Separar la red general del canvas y del grafo relacional.

### Alcance

Atomizar:

```text
map-workspace.css
network-flow.css
network-node.css
network-fact-node.css
network-edge.css
network-label.css
network-filter.css
network-inspector.css
network-toolbar.css
```

Migrar:

* workspace del mapa;
* network;
* nodos;
* hechos;
* relaciones;
* etiquetas;
* inspector;
* filtros;
* fullscreen;
* controles de navegación.

### Criterios de cierre

```text
Inline visual estático                         0
Color literal                                  0
CSS compartido injustificadamente con canvas   0
Tokens de graph/network correctos              ✅
Red visible en seis combinaciones              ✅
Fullscreen validado                            ✅
```

---

## Sprint 11 — Sesiones

### Objetivo

Refactorizar el workspace de sesión y todos sus subcomponentes.

### Alcance

Atomizar:

```text
session-workspace.css
session-status.css
session-prep.css
session-event-feed.css
quick-capture.css
quick-note.css
session-actions.css
session-linked-list.css
```

Migrar:

* estado de sesión;
* preparación;
* capturas;
* notas;
* feed;
* acciones;
* formularios;
* paneles.

### Criterios de cierre

```text
Inline styles estáticos                        0
Colores literales                              0
Formularios locales duplicados                 0
Estados de sesión usando status global         ✅
Desktop y móvil                                ✅
Seis combinaciones visuales                    ✅
```

---

## Sprint 12 — Historia y planificación

### Objetivo

Atomizar timeline, historial y story plan.

### Alcance

Crear:

```text
campaign-history.css
timeline.css
timeline-event.css
timeline-filter.css
timeline-stats.css
story-plan.css
story-plan-node.css
story-plan-toolbar.css
```

Migrar:

* timeline;
* actividad;
* filtros;
* estadísticas;
* JSON details;
* planificación;
* nodos narrativos;
* estados canon, retcon y consecuencias.

### Criterios de cierre

```text
Paleta paralela de actividad                   0
Inline styles estáticos                        0
Colores literales                              0
Tokens activity/narrative centralizados        ✅
Timeline validado                              ✅
Planificación validada                         ✅
```

---

## Sprint 13 — Personas, jugadores y mensajería

### Objetivo

Refactorizar las superficies colaborativas y de comunicación.

### Alcance

Atomizar:

```text
people-workspace.css
group-view.css
player-card.css
player-profile-dialog.css
invitations.css
knowledge.css
messaging-panel.css
message-thread.css
message-composer.css
message-identity.css
```

Migrar:

* grupo;
* jugadores;
* invitaciones;
* knowledge;
* perfiles;
* mensajes;
* burbujas;
* identidad de remitentes;
* privado y party.

### Criterios de cierre

```text
Inline styles estáticos                        0
Colores literales                              0
Identidades fuera de identityPalette           0
Mensajería duplicando formularios              0
DM y jugador validados                         ✅
Seis combinaciones visuales                    ✅
```

---

## Sprint 14 — Administración

### Objetivo

Refactorizar por completo la consola administrativa.

### Alcance

Atomizar:

```text
admin-shell.css
admin-navigation.css
admin-table.css
admin-filter.css
admin-dialog.css
admin-status.css
admin-dashboard.css
```

Migrar:

* shell;
* usuarios;
* campañas;
* invitaciones;
* anuncios;
* auditoría;
* purgas;
* sistemas;
* templates;
* diálogos de confirmación.

### Criterios de cierre

```text
Inline styles estáticos                        0
Colores literales                              0
Tablas duplicadas                              0
Dialogs duplicados                             0
Feedback fuera de primitivas                   0
Admin validado en seis combinaciones           ✅
```

---

## Sprint 15 — Cuenta, autenticación y preferencias

### Objetivo

Completar la migración de las superficies de cuenta y selección de apariencia.

### Alcance

Atomizar:

```text
account-shell.css
account-form.css
preferences-panel.css
appearance-preview.css
auth-layout.css
auth-form.css
```

Migrar:

* login;
* registro;
* recuperación;
* cuenta;
* preferencias;
* preview;
* selectores de tema;
* densidad;
* tipografía;
* accesibilidad.

Eliminar `account.css` monolítico.

### Criterios de cierre

```text
account.css monolítico                         eliminado
Inline styles estáticos                        0
Colores literales                              0
Preview aislado visualmente correcto           ✅
Bootstrap sin flash visual                     ✅
Seis combinaciones visuales                    ✅
```

---

## Sprint 16 — Landing e institucional

### Objetivo

Separar completamente las superficies públicas del CSS global de aplicación.

### Alcance

Atomizar:

```text
public-shell.css
landing-hero.css
landing-features.css
landing-campaigns.css
landing-forms.css
institutional-shell.css
institutional-navigation.css
institutional-content.css
site-footer.css
```

Migrar:

* landing;
* hero;
* campañas;
* formularios;
* tarjetas;
* backup;
* páginas institucionales;
* footer público.

Eliminar:

* landing dentro de `index.css`;
* fondos oscuros literales;
* colores de marca repetidos;
* estilos públicos cargados en rutas privadas.

### Criterios de cierre

```text
landing.css global                             eliminado
Reglas landing en main global                  0
Inline styles estáticos                        0
Colores literales                              0
Landing responsive                             ✅
Institucional responsive                       ✅
```

---

## Sprint 17 — Saneamiento final y cero tolerancia

### Objetivo

Eliminar toda excepción temporal y cerrar definitivamente la refactorización.

### Alcance

* Eliminar `index.css` antiguo.
* Eliminar hojas legacy.
* Eliminar allowlist temporal.
* Resolver CSS huérfano.
* Resolver imports cruzados restantes.
* Resolver selectores globales peligrosos.
* Resolver `!important`.
* Resolver variables desconocidas.
* Resolver duplicaciones.
* Ejecutar auditoría completa.
* Activar política de cero tolerancia.
* Completar matriz visual.

### Criterios de cierre

```text
Hardcodes cromáticos fuera de temas            0
Inline styles estáticos                        0
Variables CSS desconocidas                     0
Aliases legacy                                 0
CSS huérfano                                   0
CSS sin clasificar                             0
Hojas monolíticas críticas                     0
Responsabilidades mezcladas                    0
Imports cruzados injustificados                0
Selectores entre componentes                   0
!important sin excepción                       0
Auditoría CI en cero tolerancia                ✅
Matriz visual completa                         ✅
```

---

# Protocolo de revisión entre sprints

Al terminar cada sprint te presentaré:

```text
Alcance implementado
Archivos creados, movidos y eliminados
Decisiones arquitectónicas aplicadas
Métricas antes y después
Hallazgos corregidos
Hallazgos pendientes
Tests ejecutados
Estado del CI
Capturas o superficies revisadas
PR creada o actualizada
```

Tú revisas el resultado y das una de estas instrucciones:

```text
Aprobado: continuar
Corregir dentro del sprint
Ampliar el alcance del sprint
Replantear una decisión
```

Cuando hablemos del sprint siguiente, el anterior deberá estar implementado, corregido, validado y aceptado. El primer trabajo operativo será el **Sprint 1: auditoría mecánica y baseline versionado**.
