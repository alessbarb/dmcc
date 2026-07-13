> Archived historical implementation plan.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Plan maestro de rediseño visual de DMCC

> **Para agentes de implementación:** usar `superpowers:subagent-driven-development` (recomendado) o `superpowers:executing-plans` para ejecutar cada fase. Las tareas usan casillas (`- [ ]`) para permitir seguimiento.

**Objetivo:** evolucionar DMCC hacia el lenguaje visual **Modern Dark Narrative** sin degradar legibilidad, privacidad, rendimiento, navegación ni los flujos existentes de dirección de campaña.

**Arquitectura:** la migración será incremental. Primero se consolidarán tokens, fuentes y primitivas globales; después se migrarán superficies acotadas; el Canvas se tratará como un subsistema propio; y los efectos atmosféricos quedarán para el final. La visibilidad DM/jugador seguirá resolviéndose en datos y proyecciones, no mediante ocultación CSS.

**Stack:** React 19, TypeScript 6, CSS global, Lucide React, React Flow, Vitest y Playwright.

**Fecha:** 2026-07-02

---

## 1. Resultado esperado

DMCC debe sentirse como el cuaderno digital de un cronista: oscuro, preciso y narrativo, sin parecer un panel SaaS genérico ni caer en ornamentación medieval literal.

El rediseño estará completo cuando:

1. títulos y nombres narrativos utilicen una serif evocadora y el contenido operativo conserve una sans legible;
2. los acentos principales sean cálidos y menos fatigantes;
3. tarjetas, paneles, inputs y botones compartan un sistema visual coherente;
4. ningún texto funcional quede por debajo de `0.75rem`;
5. los controles táctiles primarios alcancen al menos `44 × 44px`;
6. los elementos esenciales cumplan WCAG AA y los textos críticos aspiren a AAA;
7. `prefers-reduced-motion`, teclado, foco visible y dispositivos táctiles mantengan una experiencia completa;
8. el portal del jugador nunca reciba información privada del DM;
9. el Canvas diferencie entidades y relaciones sin depender únicamente del color;
10. todas las puertas automáticas del repositorio permanezcan verdes.

## 2. Decisiones cerradas

### 2.1 Estrategia de entrega

Se adopta una **migración incremental por superficies**, no un cambio global de una sola vez.

- Cada fase debe poder desplegarse y revertirse por separado.
- Los tokens nuevos conservarán alias compatibles con los nombres actuales durante la migración.
- No se reorganizarán datos o flujos de dominio para conseguir un efecto puramente visual.
- Cada fase tendrá capturas de referencia en escritorio, tableta y móvil.

### 2.2 Fuentes

- Encabezados y nombres narrativos: **Cinzel**.
- Contenido, navegación, formularios y controles: **Outfit**.
- Identificadores, fechas técnicas y metadatos compactos: la pila monoespaciada existente.
- Las fuentes se servirán localmente desde `public/fonts/`; no se añadirá una dependencia de ejecución de Google Fonts.
- La carga usará WOFF2, `font-display: swap` y fallbacks del sistema.

### 2.3 Glassmorphism

El vidrio oscuro se reservará para:

- barra superior;
- inspector y drawers;
- modales;
- overlays;
- tarjetas destacadas de campaña.

Las listas densas y las tarjetas repetidas usarán superficies opacas o casi opacas. Se ofrecerá fallback sin `backdrop-filter` y se evitarán capas de blur anidadas.

### 2.4 Estilos en React

La regla será:

> No introducir estilos inline estáticos o eventos de hover que muten estilos. Se permiten variables CSS calculadas y geometría dinámica justificada.

Por tanto, `style={{ "--rg-accent": color }}` en React Flow puede mantenerse tipado como `React.CSSProperties`, mientras que espaciados, tamaños, colores y estados hover pasarán a clases CSS.

### 2.5 Secretos y privacidad

- La exclusión de secretos del portal se mantiene en la proyección y las rutas de datos.
- El Canvas del DM mostrará siempre que una entidad es privada mediante icono, etiqueta y tratamiento de borde.
- El desenfoque de contenido será una preferencia explícita de **modo mesa compartida**, no el comportamiento normal del DM.
- El blur nunca será la única barrera: al activarlo, el contenido sensible también tendrá `aria-label` neutro hasta recibir foco o revelación deliberada.

### 2.6 Geometría del Canvas

No se deformará toda la tarjeta, porque una forma circular o hexagonal reduce demasiado el espacio de lectura.

- PNJ/personaje: retrato o icono circular dentro de una tarjeta legible.
- Lugar: cabecera o marco visual hexagonal, manteniendo cuerpo rectangular.
- Secreto: borde velado, indicador de candado y tratamiento opcional de privacidad.
- Rumor: borde discontinuo y etiqueta de incertidumbre.
- Las relaciones usarán color, patrón de línea, icono y etiqueta; nunca solo color.

### 2.7 Movimiento y atmósfera

- Duración normal: entre `120ms` y `200ms`.
- Solo `transform` y `opacity` en animaciones continuas.
- `prefers-reduced-motion: reduce` eliminará partículas, giro decorativo y elevaciones.
- El fondo atmosférico será CSS/SVG ligero. No se añadirá una librería de partículas.
- El d20 del portal será decorativo, no interactivo ni necesario para comprender la pantalla.

## 3. Fuera de alcance

- Cambiar el modelo de dominio o el esquema persistente.
- Sustituir React Flow.
- Rediseñar autenticación, sesiones o membresías.
- Añadir ilustraciones generativas o imágenes remotas.
- Convertir todo el CSS global a CSS Modules, Tailwind o CSS-in-JS.
- Reescribir todas las pantallas antes de validar el nuevo sistema en superficies piloto.
- Usar blur como control de acceso.
- Garantizar AAA para todos los textos secundarios si ello destruye la jerarquía visual; AA es la puerta obligatoria.

## 4. Mapa de archivos

### Archivos que se crearán

- `public/fonts/cinzel-latin.woff2`: fuente display local con los pesos aprobados.
- `public/fonts/outfit-latin.woff2`: fuente de interfaz local con los pesos aprobados.
- `src/frontend/shared/styles/tokens.css`: tokens base, semánticos y compatibilidad.
- `src/frontend/shared/styles/primitives.css`: botones, inputs, tarjetas, badges, tooltips y superficies.
- `src/frontend/shared/styles/atmosphere.css`: fondos decorativos y reglas de movimiento reducido.
- `src/frontend/shared/components/ContextMenu.tsx`: menú accesible reutilizable para acciones secundarias.
- `tests/frontend/entityVisuals.test.ts`: contrato de configuración semántica de entidades.
- `tests/e2e/visual-language.spec.ts`: recorrido funcional y accesible de las superficies migradas.

### Archivos que se modificarán

- `index.html`: metadatos de color y precarga de fuentes locales.
- `src/frontend/shared/styles/index.css`: imports ordenados y migración progresiva de reglas existentes.
- `src/frontend/main.tsx`: orden de carga de hojas si fuera necesario.
- `src/frontend/dm/entities/entityVisuals.ts`: única fuente de color, icono y variante semántica.
- `src/frontend/shared/components/LandingCampaignCard.tsx`: acciones contextuales y tarjeta piloto.
- `src/frontend/SmartLanding.tsx`: jerarquía narrativa y atmósfera de entrada.
- `src/frontend/dm/layouts/CampaignShell.tsx`: navegación, top bar y estados activos.
- `src/frontend/dm/pages/DashboardPage.tsx`: clases CSS y jerarquía de foco/memoria/captura.
- `src/frontend/dm/sessions/TimelinePage.tsx`: hilo narrativo y metadatos legibles.
- `src/frontend/dm/canvas/pages/CanvasPage.tsx`: controles, privacidad explícita y retirada de estilos inline estáticos.
- `src/frontend/dm/canvas/components/CanvasEntityNode.tsx`: variantes semánticas de nodo.
- `src/frontend/dm/canvas/components/CanvasPalette.tsx`: clases y tokens.
- `src/frontend/dm/canvas/components/CanvasInspector.tsx`: secciones y navegación interna.
- `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx`: clases de aristas y estados.
- `src/frontend/player/components/PlayerPortalView.tsx`: migración a clases y composición tipo tablón.
- `src/frontend/dm/onboarding/CampaignGuidedTour.tsx`: tono narrativo y foco accesible.
- `src/frontend/dm/pages/PremadeCampaignPreviewPage.tsx`: galería y tarjetas.
- `playwright.config.ts`: proyecto de capturas solo si la configuración actual no cubre los tres viewports.

## 5. Fases y dependencias

```text
Fase 0: línea base
    ↓
Fase 1: tokens, fuentes y primitivas
    ↓
Fase 2: landing, selector y shell
    ↓
Fase 3: dashboard y timeline
    ↓
Fase 4: Canvas
    ↓
Fase 5: portal, premades y onboarding
    ↓
Fase 6: atmósfera, auditoría final y retirada de compatibilidad
```

Cada fase exige la puerta rápida:

```bash
npm run lint
npm run typecheck:all
npm test
npm run build
```

Antes de cerrar las fases 2 a 6 también se ejecutará:

```bash
npm run test:e2e
```

## 6. Plan de implementación

### Fase 0 — Capturar la línea base

**Propósito:** evitar que el rediseño oculte regresiones funcionales o de accesibilidad ya existentes.

- [ ] Ejecutar `git status --short` y confirmar que el alcance no absorbe cambios ajenos.
- [ ] Ejecutar `npm run lint`, `npm run typecheck:all`, `npm test`, `npm run build` y registrar cualquier fallo previo.
- [ ] Levantar la aplicación con los comandos de desarrollo existentes y capturar:
  - landing y selector de campañas;
  - Dashboard;
  - Timeline;
  - Canvas con `scratch/oracle-seed` o una campaña de densidad equivalente;
  - portal del jugador;
  - modal, drawer, estado vacío y error representativos.
- [ ] Repetir capturas a `1440 × 900`, `1024 × 768` y `390 × 844`.
- [ ] Registrar mediciones de contraste para texto principal, texto atenuado, botón primario, botón secundario, error, éxito y foco.
- [ ] Registrar tiempos de carga y fluidez del Canvas con la herramienta de rendimiento del navegador; esta línea base será comparativa, no un benchmark absoluto.

**Puerta:** existe un inventario visual reproducible y las regresiones previas están separadas de las introducidas por el plan.

### Fase 1 — Construir el sistema visual base

#### 1.1 Fuentes locales

**Archivos:** `public/fonts/*`, `index.html`, `src/frontend/shared/styles/tokens.css`.

- [ ] Añadir los subconjuntos WOFF2 de Cinzel y Outfit con licencias compatibles conservadas en `public/fonts/`.
- [ ] Declarar `@font-face` con `font-display: swap`.
- [ ] Pre-cargar únicamente los dos recursos usados en el primer render.
- [ ] Definir `--font-display`, `--font-sans` y mantener `--font-mono`.
- [ ] Verificar en modo sin red que no se realizan peticiones a proveedores externos y que los fallbacks no rompen el layout.

#### 1.2 Tokens

**Archivo:** `src/frontend/shared/styles/tokens.css`.

- [ ] Definir fondos `--bg-abyss`, `--bg-mist`, `--bg-tomb` y superficies elevadas.
- [ ] Definir `--accent-fire`, `--accent-fire-hover`, `--accent-amethyst` y sus versiones suaves.
- [ ] Definir texto principal, secundario, atenuado e inverso mediante valores que superen la puerta de contraste.
- [ ] Definir tokens semánticos para secreto, rumor, canon, teoría, consecuencia, éxito, advertencia e información.
- [ ] Definir escala de espacio `4/8/12/16/24/32/48`, radio narrativo, sombras y transiciones.
- [ ] Mapear temporalmente `--bg-main`, `--bg-card`, `--bg-input`, `--primary`, `--secondary` y demás nombres existentes a los tokens nuevos.
- [ ] Evitar un segundo bloque `:root` disperso: integrar `--touch-target-min` en el archivo de tokens.

#### 1.3 Primitivas

**Archivos:** `src/frontend/shared/styles/primitives.css`, `src/frontend/shared/styles/index.css`.

- [ ] Migrar `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger` y `.btn-icon`.
- [ ] Garantizar `:focus-visible`, estado disabled, active, hover y fallback para dispositivos sin hover.
- [ ] Migrar inputs, selects y textareas con etiquetas y errores legibles.
- [ ] Crear variantes de superficie: sólida, vidrio flotante y destacada.
- [ ] Limitar `backdrop-filter` a superficies flotantes y añadir `@supports` con fallback opaco.
- [ ] Migrar badges y tooltips sin bajar de `0.75rem`.
- [ ] Añadir reglas globales de `prefers-reduced-motion`.
- [ ] Actualizar `theme-color` de `index.html`.

**Pruebas:**

- [ ] Añadir a `tests/e2e/visual-language.spec.ts` navegación por teclado y comprobaciones de foco visible para botones, enlaces e inputs.
- [ ] Comprobar tamaños mínimos mediante `getBoundingClientRect()` en controles primarios.
- [ ] Ejecutar la puerta rápida y revisar visualmente las pantallas aún no migradas gracias a los alias compatibles.

**Puerta:** el tema cambia sin romper superficies antiguas y las primitivas funcionan con ratón, teclado y táctil.

### Fase 2 — Landing, selector y shell

#### 2.1 Selector de campañas

**Archivos:** `src/frontend/shared/components/ContextMenu.tsx`, `src/frontend/shared/components/LandingCampaignCard.tsx`, `src/frontend/shared/styles/index.css`.

- [ ] Implementar un menú contextual con botón de tres puntos, `aria-expanded`, `aria-controls`, cierre con Escape y devolución de foco.
- [ ] Mover renombrado y borrado al menú; conservar una confirmación explícita para borrar.
- [ ] Mantener “entrar en campaña” como acción dominante y no anidar botones dentro de un botón.
- [ ] Sustituir mutaciones `onMouseEnter/onMouseLeave` y estilos inline estáticos por clases.
- [ ] Conservar las insignias de sistema ya existentes y mejorar su jerarquía.

#### 2.2 Landing

**Archivo:** `src/frontend/SmartLanding.tsx`.

- [ ] Introducir el mensaje “Escribe la crónica de tu mundo” como encabezado narrativo localizado.
- [ ] Mantener creación, importación, búsqueda y selección con el mismo comportamiento.
- [ ] Aplicar fondo radial y polvo estático muy sutil; la animación se aplaza hasta la fase 6.
- [ ] Garantizar que búsqueda y llamada principal aparecen antes del listado en orden de lectura y tabulación.

#### 2.3 Shell

**Archivo:** `src/frontend/dm/layouts/CampaignShell.tsx`.

- [ ] Aplicar tipografía display solo al título de campaña y encabezados de primer nivel.
- [ ] Actualizar navegación activa con color, borde/indicador e icono.
- [ ] Mantener los patrones responsive y el mínimo táctil de `44px` ya establecido.
- [ ] Evitar blur simultáneo en sidebar y top bar si comparten fondo.

**Pruebas:**

- [ ] Verificar con Playwright que renombrar, cancelar y borrar conservan el comportamiento.
- [ ] Verificar apertura/cierre del menú por teclado.
- [ ] Verificar landing y shell en los tres viewports.

**Puerta:** la primera impresión demuestra el nuevo lenguaje sin alterar la administración de campañas.

### Fase 3 — Dashboard y Timeline

#### 3.1 Dashboard

**Archivo:** `src/frontend/dm/pages/DashboardPage.tsx`.

- [ ] Inventariar los 118 bloques `style={{...}}` detectados y clasificarlos como estáticos o dinámicos.
- [ ] Sustituir estilos estáticos y hovers manipulados por JavaScript por clases `dashboard-*`.
- [ ] Mantener variables CSS únicamente cuando el valor proceda del estado.
- [ ] Dividir la composición visual en:
  1. **Foco de partida:** sesión y escena activas, personajes relevantes y acción inmediata;
  2. **Memoria inmediata:** últimos hechos, pistas y consecuencias;
  3. **Captura rápida:** accesos a registro, entidad y sesión.
- [ ] No cambiar llamadas al store, navegación ni contratos de datos durante esta fase.
- [ ] Elevar microetiquetas a un mínimo de `0.75rem` y descripciones a `0.875rem`.
- [ ] Convertir filas clicables basadas en `div` en botones o enlaces semánticos cuando ejecuten una acción.

#### 3.2 Timeline

**Archivo:** `src/frontend/dm/sessions/TimelinePage.tsx`.

- [ ] Convertir el eje en un hilo oro viejo mediante token semántico.
- [ ] Diferenciar hitos por icono y etiqueta además del color.
- [ ] Usar fuente mono solo en fechas y metadatos.
- [ ] Mantener filtros, orden y navegación existentes.
- [ ] Garantizar que la lectura lineal sin CSS conserva la cronología.

**Pruebas:**

- [ ] Añadir al recorrido E2E una campaña con y sin sesión activa.
- [ ] Verificar navegación por teclado de filas y acciones.
- [ ] Verificar que filtros y selección de hitos continúan funcionando.
- [ ] Comparar densidad y alturas contra la línea base; no aceptar truncado de información operativa.

**Puerta:** un DM puede identificar la acción inmediata y recuperar contexto sin escanear una cuadrícula administrativa.

### Fase 4 — Canvas como superficie insignia

Esta fase tendrá su propia rama o conjunto de commits y no se mezclará con efectos decorativos del portal.

#### 4.1 Fuente semántica única

**Archivos:** `src/frontend/dm/entities/entityVisuals.ts`, `src/frontend/dm/canvas/components/CanvasEntityNode.tsx`, `src/frontend/dm/canvas/components/CanvasPalette.tsx`.

- [ ] Centralizar etiqueta, icono, color, variante geométrica y patrón de borde por tipo.
- [ ] Eliminar hexadecimales duplicados de nodos, paleta y leyenda.
- [ ] Usar variables CSS `--entity-accent` y `--entity-accent-soft` para valores dinámicos.
- [ ] Crear `tests/frontend/entityVisuals.test.ts` para asegurar que todos los tipos conocidos tienen configuración y que secreto/rumor/lugar/PNJ poseen variantes diferenciadas.

#### 4.2 Nodos y relaciones

**Archivos:** `CanvasEntityNode.tsx`, `CampaignCanvasFlow.tsx`, `src/frontend/shared/styles/index.css`.

- [ ] Aplicar retrato circular a personajes y cabecera hexagonal a lugares sin reducir el cuerpo de texto.
- [ ] Aplicar a secretos candado, borde velado y etiqueta privada.
- [ ] Aplicar a rumores borde discontinuo y estado textual.
- [ ] Mapear relaciones de canon, rumor/desconfianza y hostilidad a patrones de línea, color y etiqueta.
- [ ] Conservar handles, selección múltiple, dirección, arrastre y densidad.
- [ ] No reactivar borrado mediante tecla si la protección actual lo mantiene deshabilitado.

#### 4.3 Privacidad de mesa compartida

**Archivos:** `CanvasPage.tsx`, `CanvasEntityNode.tsx`.

- [ ] Añadir un control explícito “Privacidad de mesa” separado de la vista del jugador.
- [ ] Aplicar el tratamiento de ocultación solo a contenido `dm_only`.
- [ ] Permitir revelación temporal mediante foco o acción deliberada, no hover como única interacción.
- [ ] Reiniciar el modo al salir del Canvas para evitar estados sorprendentes.
- [ ] Mantener `publicOnly` y la proyección del jugador como mecanismos independientes.

#### 4.4 Controles e inspector

**Archivos:** `CanvasPage.tsx`, `CanvasPalette.tsx`, `CanvasInspector.tsx`.

- [ ] Migrar estilos inline estáticos del header, filtros, menús, modales, leyenda y drawer.
- [ ] Agrupar controles por navegación, visibilidad, relaciones y acciones.
- [ ] Mantener texto visible o tooltip accesible en iconos ambiguos.
- [ ] Organizar el inspector en Resumen, Relaciones y Estado; si el contenido no justifica pestañas, usar secciones plegables para evitar navegación adicional.
- [ ] Mantener los controles destructivos separados y con confirmación.

**Pruebas:**

- [ ] Ejecutar `tests/backend/canvas.test.ts` y `tests/backend/canvasSecurity.test.ts`.
- [ ] Añadir pruebas E2E de selección, arrastre, relación, vista pública y privacidad de mesa.
- [ ] Verificar que una captura de vista jugador no contiene títulos ni resúmenes privados.
- [ ] Verificar el Canvas con una campaña densa y zoom de navegador al `200%`.
- [ ] Comparar rendimiento con la fase 0; no aceptar una caída sostenida perceptible atribuible a blur o sombras.

**Puerta:** el Canvas es más expresivo y seguro sin perder capacidad operativa ni legibilidad.

### Fase 5 — Portal, premades y onboarding

#### 5.1 Portal del jugador

**Archivo:** `src/frontend/player/components/PlayerPortalView.tsx`.

- [ ] Clasificar sus 216 bloques inline y migrar los estáticos a clases `player-portal-*`.
- [ ] Componer hechos, personajes, pistas y propuestas como un tablón editorial ordenado, no como posiciones aleatorias.
- [ ] Mantener orden DOM, lectura móvil y acciones existentes.
- [ ] Añadir el d20 como pseudo-elemento/SVG decorativo con `aria-hidden="true"`.
- [ ] No cambiar la proyección de datos salvo para corregir una fuga demostrada.
- [ ] Ejecutar `tests/core/playerPortalProjection.test.ts` y `tests/backend/playerPortalRoutes.test.ts`.

#### 5.2 Premades

**Archivo:** `src/frontend/dm/pages/PremadeCampaignPreviewPage.tsx`.

- [ ] Mejorar portada, metadatos y previsualizaciones con superficies destacadas.
- [ ] Mostrar galerías solo cuando existan imágenes; no crear espacios vacíos.
- [ ] Conservar importación, validación y errores actuales.

#### 5.3 Onboarding

**Archivo:** `src/frontend/dm/onboarding/CampaignGuidedTour.tsx`.

- [ ] Reescribir introducciones con tono narrativo breve sin ocultar instrucciones concretas.
- [ ] Sustituir halos intensos por foco dorado atenuado.
- [ ] Conservar Escape, avance, retroceso y restauración de foco.

**Pruebas:**

- [ ] Verificar portal vacío, parcial y poblado.
- [ ] Verificar que ningún secreto DM aparece en DOM, atributos, respuestas de red o capturas del portal.
- [ ] Verificar importación premade satisfactoria y fallida.
- [ ] Verificar el tour completo solo con teclado y con movimiento reducido.

**Puerta:** DM y jugadores comparten identidad visual sin compartir información privada.

### Fase 6 — Atmósfera, accesibilidad y cierre

**Archivos:** `src/frontend/shared/styles/atmosphere.css`, `SmartLanding.tsx`, `PlayerPortalView.tsx`, `index.css`.

- [ ] Añadir movimiento sutil de polvo/humo con una sola capa decorativa.
- [ ] Limitar el d20 a una rotación lenta y pausarla cuando la pestaña no está visible.
- [ ] Eliminar ambas animaciones con `prefers-reduced-motion`.
- [ ] Auditar contraste en estados default, hover, focus, disabled, error y selección.
- [ ] Auditar zoom al `200%`, reflow a `320px`, teclado y lector de pantalla.
- [ ] Auditar targets táctiles; los controles secundarios compactos del Canvas deberán tener alternativa accesible o alcanzar `44px`.
- [ ] Buscar estilos inline estáticos restantes:

```bash
rg -n 'style=\\{\\{' src/frontend
rg -n 'onMouseEnter|onMouseLeave' src/frontend
```

- [ ] Revisar cada coincidencia; conservar solo variables CSS y geometría dinámica documentables.
- [ ] Retirar alias de tokens únicamente cuando `rg` confirme que ningún selector depende del nombre antiguo.
- [ ] Ejecutar `npm run quality:all`.
- [ ] Repetir capturas de la fase 0 y elaborar una comparación antes/después.

**Puerta final:** todas las verificaciones pasan, no hay fuga de datos, la experiencia es legible con movimiento reducido y el sistema visual se aplica de forma coherente.

## 7. Estrategia de pruebas

### Unitarias

- Configuración semántica completa por tipo de entidad.
- Funciones puras que deriven clases o variantes.
- Proyección del portal sin datos privados.

### Integración

- Rutas de Canvas y portal con control de acceso.
- Persistencia de cambios de entidad realizados desde el Canvas.
- Importación de campañas premade.

### E2E

- Landing: entrar, renombrar, cancelar y borrar con confirmación.
- Dashboard: sesión activa, memoria reciente y captura.
- Canvas: crear/seleccionar/mover/conectar, vista jugador y privacidad de mesa.
- Portal: estados vacío y poblado sin información privada.
- Onboarding: recorrido por teclado.

### Visual manual

Matriz mínima:

| Superficie | 1440×900 | 1024×768 | 390×844 | Teclado | Movimiento reducido |
|---|---:|---:|---:|---:|---:|
| Landing | Sí | Sí | Sí | Sí | Sí |
| Dashboard | Sí | Sí | Sí | Sí | Sí |
| Timeline | Sí | Sí | Sí | Sí | Sí |
| Canvas | Sí | Sí | Sí | Sí | Sí |
| Portal | Sí | Sí | Sí | Sí | Sí |
| Modal/Drawer | Sí | Sí | Sí | Sí | Sí |

## 8. Métricas y criterios de aceptación

### Accesibilidad

- Texto normal: contraste mínimo `4.5:1`.
- Texto grande: contraste mínimo `3:1`.
- Texto crítico y acciones principales: objetivo `7:1`.
- Foco visible: contraste mínimo `3:1` respecto a colores adyacentes.
- Texto funcional mínimo: `0.75rem`; notas narrativas: `0.875rem`.
- Objetivo táctil: `44 × 44px`.

### Rendimiento

- No introducir librerías de animación o partículas.
- No animar `filter`, `box-shadow` o `backdrop-filter` de forma continua.
- No anidar superficies con blur.
- No provocar peticiones externas de fuentes.
- El Canvas denso debe conservar interacción fluida comparable con la línea base.

### Mantenibilidad

- Un único origen para tokens.
- Un único origen para visuales semánticos de entidades.
- Ningún hover implementado mutando `element.style`.
- Estilos inline limitados a variables CSS o geometría dinámica.
- Cada fase produce commits pequeños y reversibles.

## 9. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Cambio global rompe pantallas no migradas | Alto | Alias compatibles y entrega incremental |
| Oro viejo con contraste insuficiente | Alto | Medir combinaciones reales antes de fijar tokens |
| Blur reduce rendimiento | Alto | Reservarlo para overlays, fallback opaco y medición |
| Tipografías externas fallan en LAN/offline | Medio | WOFF2 local y `font-display: swap` |
| Geometrías reducen legibilidad del Canvas | Alto | Geometría en hero/marco, cuerpo rectangular |
| Blur de secretos crea falsa seguridad | Crítico | Proyección de datos como barrera real |
| Ocultar acciones dificulta descubrirlas | Medio | Menú accesible, labels y acción principal visible |
| Refactor visual altera lógica | Alto | No mezclar cambios de store/dominio con migración CSS |
| Animación fatiga o distrae | Medio | Movimiento mínimo y `prefers-reduced-motion` |
| CSS global acumula más deuda | Medio | Separar tokens/primitivas/atmósfera y retirar alias al final |

## 10. Orden de commits recomendado

1. `chore(ui): add local narrative fonts`
2. `feat(ui): introduce modern dark narrative tokens`
3. `feat(ui): migrate shared controls and surfaces`
4. `feat(landing): apply narrative campaign selection`
5. `refactor(dashboard): replace static inline styles`
6. `feat(timeline): apply narrative thread styling`
7. `refactor(canvas): centralize entity visual semantics`
8. `feat(canvas): add accessible node and relation variants`
9. `feat(canvas): add explicit shared-table privacy mode`
10. `refactor(portal): migrate board composition to classes`
11. `feat(ui): add reduced-motion atmosphere`
12. `test(ui): complete visual language regression coverage`

## 11. Definición de terminado

Una fase solo se considera terminada si:

- cumple sus criterios funcionales;
- pasa las pruebas indicadas;
- ha sido revisada en los tres viewports;
- funciona con teclado;
- respeta movimiento reducido;
- no introduce información privada en superficies de jugador;
- no contiene estilos inline estáticos nuevos;
- dispone de una comparación visual con la línea base;
- puede revertirse sin depender de una fase posterior.

El programa completo termina únicamente tras superar `npm run quality:all` y una revisión manual del Canvas, Dashboard y portal durante un flujo realista de preparación y dirección de sesión.
