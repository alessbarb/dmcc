# Campaña Demo: La Sombra del Oráculo

**La Sombra del Oráculo** es la campaña demo oficial precargable para **DM Campaign Companion (DMCC)**.

## Ficha Técnica

- **Título**: La Sombra del Oráculo
- **Sistema**: D&D SRD 5.2.1 / Fantasía Medieval
- **Nivel sugerido**: 1 - 5
- **ID de Campaña**: `cmp_seed_oracle_shadow`

## Contenido Incluido

Esta campaña genera una estructura rica y compleja para demostrar todas las capacidades del motor narrativo:

- **Personajes Precreados (PCs)**: Héroes listos con transfondo y relaciones iniciales.
- **Localizaciones**: Desde tabernas locales hasta ruinas antiguas y santuarios ocultos.
- **Facciones y NPCs**: Organizaciones rivales, líderes de facción, informantes y PNJs clave.
- **Misiones y Pistas (Quests & Clues)**: Hilos de investigación interconectados.
- **Secretos y Hechos (Secrets & Facts)**: Información de DM, rumores, verdades cannónicas y mentiras.
- **Grafo de Canvas**: Disposición visual preconfigurada para el canvas interactivo de React Flow.

## Modos de Ejecución y Variables de Entorno

El script interactúa con la API REST del servidor local de DMCC (`http://localhost:4877` por defecto).

### Variables de Entorno

- `DMCC_BASE_URL`: URL del servidor DMCC (por defecto: `http://localhost:4877`).
- `DMCC_CAMPAIGN_ID`: ID personalizado para la campaña (por defecto: `cmp_seed_oracle_shadow`).
- `DMCC_SEED_MODE`: Modo de sembrado (`create` | `replace` | `dry-run`).
- `DMCC_SEED_CONFIRM`: Confirmación requerida para el modo `replace` (debe coincidir con el título o ID).

### Comandos de Ejecución

```bash
# Crear la campaña (falla si ya existe)
npm run seed:oracle

# Verificación en seco (no escribe datos)
npm run seed:oracle:dry

# Reemplazar la campaña existente (borra la anterior y la recrea)
npm run seed:oracle:replace
```
