# Sistema de Seeding y Campañas Premade (`seeds/`)

Esta carpeta contiene las herramientas internas para mantener campañas demo de **DM Campaign Companion**.

La aplicación ya no necesita ejecutar seeds para mostrar ejemplos: las campañas preparadas que ve el usuario viven como templates JSON versionados en:

```txt
public/premades/
  manifest.json
  oracle-triple-eclipse.dmcc-template.json
  phandalin-starter.dmcc-template.json
```

La UI lee esos templates mediante `/api/premade-campaigns` y cada DM puede crear su propia copia editable sin ensuciar el vault hasta que pulsa “Crear mi copia”.

## Estructura

- `campaigns/`: Módulos individuales de campaña usados para desarrollo y regeneración manual.
  - `oracle/`: Campaña completa *La Sombra del Oráculo*, sembrada mediante la API HTTP REST.
  - `phandalin/`: Campaña de prueba *Las Sombras sobre Phandalin*, sembrada directamente en los almacenes de eventos en disco.
- `shared/`: Utilidades compartidas para los scripts de sembrado (clientes HTTP, tipos, etc.).
- `public/premades/`: fuente de producto que viaja con la app y no requiere seed.

## Autenticación de seeds

Los seeds ya no usan el antiguo atajo `/api/auth/local-token`. Ahora entran como un DM real usando `email + clave`, igual que la aplicación.

Por defecto, si no existe, el script crea un DM local de seed:

```bash
DMCC_SEED_DM_EMAIL=seed.dm@dmcc.local
DMCC_SEED_DM_KEY=dmcc-seed-key
DMCC_SEED_DM_NAME="Seed DM"
```

Si quieres sembrar una campaña en tu propio DM, ejecuta el seed pasando tus credenciales:

```bash
DMCC_SEED_DM_EMAIL="tu@email.com" DMCC_SEED_DM_KEY="tu-clave" npm run seed:oracle
```

Si no quieres que el seed cree cuentas automáticamente, usa:

```bash
DMCC_SEED_DM_SETUP=0 DMCC_SEED_DM_EMAIL="tu@email.com" DMCC_SEED_DM_KEY="tu-clave" npm run seed:oracle
```

## Ejecución de seeds

Para ejecutar cualquier campaña demo, utiliza los comandos estandarizados de `package.json`:

```bash
# Sembrar La Sombra del Oráculo
npm run seed:oracle

# Probar ejecución en seco de La Sombra del Oráculo
npm run seed:oracle:dry

# Reemplazar La Sombra del Oráculo existente
npm run seed:oracle:replace

# Sembrar Phandalin directamente en disco
npm run seed:phandalin
```

## Regla de producto

Los seeds son una herramienta de desarrollo. Los ejemplos que debe ver cualquier usuario de la app deben terminar como JSON en `public/premades/`, con entrada en `public/premades/manifest.json`.

La fase de mantenimiento de templates se apoya en estos comandos:

```bash
# Normaliza metadatos derivados — stats, versión, título y manifest
npm run premade:build

# Falla si manifest/templates no están normalizados
npm run premade:build:check

# Valida integridad de referencias entre entidades, relaciones, hechos, sesiones y canvas
npm run premade:validate
```

`premade:build` todavía no ejecuta los seeds automáticamente; normaliza los JSON ya exportados en `public/premades/`. El siguiente salto natural será añadir un exportador que convierta el resultado de cada seed en template sin pasos manuales.

## Guía de contribución para nuevas campañas premade

1. Crea o actualiza un seed bajo `seeds/campaigns/<nombre_campana>/` si necesitas generar contenido.
2. Exporta el resultado final a `public/premades/<templateId>.dmcc-template.json`.
3. Añade la entrada correspondiente en `public/premades/manifest.json`.
4. Ejecuta `npm run premade:build` para recalcular metadatos derivados.
5. Ejecuta `npm run premade:validate` para detectar relaciones, hechos, sesiones o canvas con referencias huérfanas.
6. Comprueba que `/api/premade-campaigns` lista el template.
7. Comprueba que `POST /api/premade-campaigns/:templateId/import` crea una copia editable para el DM actual.
