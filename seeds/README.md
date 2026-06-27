# Sistema de Seeding y Campañas Demo (`seeds/`)

Esta carpeta contiene el contenido inicial formal, datos precargados y campañas demo mantenidas del proyecto **DM Campaign Companion**.

## Estructura

- `campaigns/`: Módulos individuales de campaña.
  - `oracle/`: Campaña completa *La Sombra del Oráculo*, sembrada mediante la API HTTP REST.
  - `phandalin/`: Campaña de prueba *Las Sombras sobre Phandalin*, sembrada directamente en los almacenes de eventos en disco.
- `shared/`: Utilidades compartidas para los scripts de sembrado (clientes HTTP, tipos, etc.).

## Ejecución de Seeds

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

## Guía de Contribución para Nuevas Campañas

Al añadir una nueva campaña demo:

1. Crea un directorio bajo `seeds/campaigns/<nombre_campana>/`.
2. Incluye un `seed.ts` como punto de entrada principal.
3. Añade un `README.md` documentando la campaña.
4. Registra los accesos directos correspondientes en `package.json`.
