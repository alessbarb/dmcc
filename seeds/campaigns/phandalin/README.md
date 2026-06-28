# Las Sombras sobre Phandalin — DMCC seed

Seed local-first para probar DMCC con una campaña de fantasía clásica de frontera: pueblo, goblins, bandidos, facciones, secretos, sesiones preparadas y una mina perdida.

La campaña está escrita como contenido jugable para mesa, no solo como datos de prueba. Incluye:

- capa visible para jugadores: Phandalin, rumores, PNJ de apoyo, misiones abiertas y personajes pregenerados;
- capa DM-only: Glasstaff, Araña Negra, Vyerith, Nothic, Forja de Conjuros, relojes blandos y consecuencias políticas;
- relaciones completas para evitar entidades huérfanas en grafo;
- 2 sesiones jugadas de ejemplo, con eventos y pistas reveladas;
- 6 sesiones preparadas y listas para dirigir: Tresendar, Castillo Cragmaw, frentes opcionales, Wave Echo, clímax y epílogo;
- 4 tableros de canvas: resumen, investigación, mapa y plan de sesiones.

## Uso

```bash
npm run seed:phandalin
npm run seed:phandalin:dry
npm run seed:phandalin:replace
```

También puedes apuntar a otra instancia o campaña:

```bash
DMCC_BASE_URL=http://localhost:4877 DMCC_CAMPAIGN_ID=cmp_mi_phandalin npm run seed:phandalin
```

El seed usa la API local de DMCC, igual que la campaña del Oráculo. No escribe directamente en `Documents`, no mezcla otras campañas y ejecuta una verificación final de dashboard, grafo, timeline, visibilidad, sesiones, relaciones y secretos anclados.
