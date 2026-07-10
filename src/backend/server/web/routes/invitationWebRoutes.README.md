# Invitation route extraction cleanup

This module is authoritative for web invitation routes.

The duplicated invitation block has been physically removed from `src/backend/server/web/webPlatformRoutes.ts`, and `src/backend/server/web/registerWebRoutes.ts` now registers the focused route modules directly without a temporary route facade.

Recommended validation:

```bash
npx eslint src/backend/server/web/registerWebRoutes.ts src/backend/server/web/routes/invitationWebRoutes.ts src/backend/server/web/webPlatformRoutes.ts
npm run typecheck:all
npm run build
```
