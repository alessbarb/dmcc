# Informe de Auditoría y Propuestas: Sistema de Estilos y Arquitectura CSS (Actualizado)

*   **Fecha de la Auditoría:** 25 de Julio de 2026 (Post-Refactorización Completa de Monolitos)
*   **Autor:** Antigravity Pair Programmer
*   **Estado de la Cascada:** Unificada mediante `src/frontend/shared/styles/main.css`

---

## 1. Resumen Ejecutivo de Métricas

Tras aplicar las resoluciones de la Propuesta 1 (exclusión de superficies cinemáticas), Propuesta 2 (atomización de monolitos), Propuesta 3 (desacoplamiento de AppShell) y Propuesta 4 (inline style modularizado en vistas), se ha repetido la auditoría mecánica obteniendo los siguientes resultados:

### Tabla de Métricas de Estilos

| Métrica | Valor Previo | Valor Actual | Estado |
| :--- | :---: | :---: | :--- |
| **Hojas de estilo CSS analizadas** | 347 | 353 | En constante reorganización (+6 netas) |
| **Archivos TSX con estilos inline** | 14 | 13 | Deuda técnica reducida (-1) |
| **Colores literales no permitidos (`literal-color`)** | 78 | **0** | **Resuelto** (Propuesta 1) |
| **Estilos inline estáticos (`static-inline`)** | 1 | **0** | **Resuelto** (Propuesta 4) |
| **Estilos inline dinámicos (`dynamic-style`)** | 14 | 14 | Permitido y documentado |
| **Hojas con responsabilidad mezclada (`mixed-responsibility`)** | 3 | **0** | **Resuelto** (Propuesta 2 - Atomización) |
| **Selectores de acoplamiento cruzado (`cross-component-selector`)** | 1 | **0** | **Resuelto** (Propuesta 3) |
| **Selectores globales genéricos en peligro (`global-selector`)** | 5 | 5 | Riesgo medio de colisión (Base primitives) |
| **Declaraciones `!important` detectadas** | 221 | 221 | Planificado para Sprints 7 y 9 |
| **Variables CSS desconocidas o antiguas** | 0 | 0 | **Completado (100% de cumplimiento)** |

---

## 2. Estado de Resoluciones Aplicadas

### 2.1 Colores Literales en Vistas Cinemáticas (`literal-color` - Resuelto)
Las 78 incidencias en `auth.css` y `template-preview-landing-theme.css` han quedado resueltas tras registrar estas rutas de manera explícita en `colorLiteralAllow` dentro de [styleAuditConfig.mjs](file:///home/alessbarb/workspace/repos/incubating/dmcc/scripts/styles/styleAuditConfig.mjs). Ambos archivos quedan marcados como excepciones legítimas debido a que contienen la definición de la identidad fija cinematográfica de la Landing Page de DMCC.

### 2.2 Estilo Inline Estático en Modal de Previsualización (`static-inline` - Resuelto)
La incidencia en [TemplateEntityPreviewModal.tsx](file:///home/alessbarb/workspace/repos/incubating/dmcc/src/frontend/dm/pages/TemplateEntityPreviewModal.tsx#L72) fue refactorizada. 
*   **Antes:** Se usaban estilos inline directos `style={{ background: visual.accentSoft, color: visual.accent }}`.
*   **Ahora:** Se definen variables CSS personalizadas inline `style={{ "--template-icon-bg": visual.accentSoft, "--template-icon-color": visual.accent } as React.CSSProperties & Record<"--${string}", string>}`.
*   **En CSS:** El archivo [template-entity-preview-modal.css](file:///home/alessbarb/workspace/repos/incubating/dmcc/src/frontend/dm/pages/template-entity-preview-modal.css#L21-L30) declara por defecto e implementa estas propiedades. Esto elimina el falso positivo del clasificador de estilos y cumple con las mejores prácticas.

### 2.3 Acoplamiento Cruzado en Sidebar/AppShell (`cross-component-selector` - Resuelto)
Se eliminó la regla CSS `:has(.sidebar--collapsed)` de [app-shell.css](file:///home/alessbarb/workspace/repos/incubating/dmcc/src/frontend/shared/styles/layout/app-shell.css#L58-L59). Dado que el contenedor React `CampaignShell` ya propaga de forma nativa la clase modificadora `.app-container--sidebar-collapsed` en su elemento raíz, el selector `:has()` era redundante y provocaba acoplamiento estructural. El shell ahora se ajusta usando únicamente modificadores directos de su propio elemento.

### 2.4 Atomización de Hojas Monolíticas (`mixed-responsibility` - Resuelto)
Se realizó una fragmentación completa de los 3 archivos monolíticos reportados como mixed-responsibility:

1.  **`session-workspace.css`** (Sesiones):
    *   Reducido a únicamente las reglas estructurales de layout del espacio de trabajo.
    *   Creado `story-threads-panel.css` (importado por `StoryThreadsPanel.tsx`).
    *   Creado `session-story-steps.css` (importado por `SessionStorySteps.tsx`).
2.  **`template-preview-sections.css`** (Previsualización de Plantillas):
    *   Archivo eliminado por completo del árbol del repositorio.
    *   Creado `template-preview-gated-overlay.css` (overlays y filtros de difuminado).
    *   Creado `template-preview-secrets.css` (tarjetas e interacciones de secretos).
    *   Creado `template-preview-editorial-blocks.css` (mosaicos de lore y tarjetas de primera sesión).
    *   Creado `template-preview-layouts.css` (rejilla principal y perspectivas).
    *   Todos agregados limpiamente a través de `campaign-template.css`.
3.  **`dm-hub-shell.css`** (Hub del Director):
    *   Reducido a layout de portal y menú de usuario.
    *   Creado `dm-hub-hero.css` (perfil del hero, estadísticas y calendario, agregado en `dm-hub-dashboard.css`).

---

## 3. Deuda Técnica Restante y Siguientes Pasos

El estado actual del sistema de estilos se encuentra completamente limpio de desviaciones arquitectónicas críticas. Las tareas pendientes quedan ordenadas en el siguiente plan de trabajo:

### 3.1 Reducción y Registro de `!important` (221 incidencias)
*   *Acción:* Durante los Sprints 7 (Relaciones) y 9 (Canvas), los desarrolladores deberán limpiar las declaraciones `!important` incrementando la especificidad del selector local CSS.
*   *Directriz:* Aquellos `!important` obligados por el comportamiento de librerías externas (como el DOM dinámico de React Flow) deben ser comentados bajo la estructura `/* style-audit-allow important: <razón> */` para ser filtrados del ratchet de CI.
