# DM Campaign Companion (DMCC)

> Motor de Memoria Narrativa y Estado para Campañas de Rol

DMCC no es solo un bloc de notas para el Dungeon Master; es un motor de memoria cognitiva estructurado bajo los principios de **Event Sourcing** y **Soberanía de Datos**. Diseñado para gestionar escenarios de *world-building* densos (como intrigas palaciegas, la influencia gravitatoria de una *Triple Eclipse* o las complejas relaciones de un *Panteón de los Hábitos*), el sistema garantiza que la historia de tu mesa sea inmutable, auditable y, lo más importante, completamente tuya.

## 🌌 Filosofía del Proyecto

1. **Soberanía de la Información:** El DM es el dueño absoluto de los datos. Sin dependencias de la nube ni servidores externos. Los datos se almacenan localmente con soporte para *Snapshots* y exportación total a Markdown.
2. **Arquitectura Orientada a Eventos:** Cada acción en la campaña (revelar una pista, conocer a un PNJ, generar una consecuencia) es un evento inmutable. El estado actual es una proyección matemática de la historia narrativa.
3. **Documentation-First:** El diseño de la campaña prioriza la estructura semántica de los datos, preparando el terreno para futuras integraciones con agentes o formatos de alta densidad (SDIF).

## ✨ Características Principales

- **Gestor de Entidades Narrativas:** Crea y cataloga PNJs, Pistas, Secretos, Misiones y Consecuencias. Búsqueda instantánea en toda la base de conocimientos gracias a `Fuse.js`.
- **Grafo de Relaciones:** Visualización interactiva y mapeo de conexiones entre entidades (impulsado por `ReactFlow`). Descubre cómo un secreto conecta a un PNJ con una pista.
- **Ciclo de Vida de Sesión:**
  - **Sesión Activa:** Captura rápida de consecuencias y revelación de pistas en tiempo real sin perder el ritmo de la partida.
  - **Cierre y Resumen:** Generación del estado "Qué toca ahora", proyectando las bases narrativas para la próxima sesión.
- **Tableros (Boards):** Organización visual de misiones, pistas y actitudes de los PNJs.
- **Exportación Universal:** Generación de volcados completos de la campaña a Markdown para lectura offline o portabilidad.

## 🛠️ Stack Tecnológico

La arquitectura está separada rigurosamente en Dominio, Aplicación y Persistencia (DDD/CQRS):

- **Frontend:** React 19, Zustand (gestión de estado), TanStack Router.
- **Backend / Persistencia Local:** Fastify, Zod (validación de esquemas).
- **Visualización y Búsqueda:** ReactFlow, Fuse.js, Lucide React.
- **Testing:** Playwright (E2E) y Vitest (Unitario/Integración).

## 🚀 Inicio Rápido (Local-First)

### Prerrequisitos

- Node.js (v20 o superior)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/alessbarb/dmcc.git
cd dmcc

# 2. Instalar dependencias
npm install

# 3. Iniciar el entorno de desarrollo
npm run dev
```

La aplicación estará disponible de forma local (usualmente en `http://localhost:5173`).

### Testing

El proyecto mantiene un alto rigor de pruebas, asegurando que el flujo de eventos y las proyecciones sean precisos.

```bash
# Ejecutar pruebas unitarias (Vitest)
npm run test

# Ejecutar pruebas E2E (Playwright)
npx playwright test
```

## 🏗️ Estructura del Dominio

- `src/domain/`: Contiene la lógica pura de la campaña, entidades (NPCs, pistas, secretos), reglas de validación (Zod) y la definición estricta de eventos narrativos.
- `src/application/`: Contiene el `commandBus` y los casos de uso.
- `src/persistence/`: Gestiona el `eventStore` y los `snapshotStore` (archivos locales JSON).
- `src/projections/`: Construye las vistas de lectura a partir de los eventos (ej. `whatNowProjection.ts`, `dashboardProjection.ts`).

## 🛡️ Licencia

El código fuente y la arquitectura de DMCC son de uso privado/personal. Eres libre de modificar el motor para adaptar las reglas y proyecciones a tu propio sistema de juego o universo narrativo.
