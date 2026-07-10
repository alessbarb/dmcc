# Invitation route extraction cleanup

This module is authoritative for web invitation routes.

Before closing Oleada 1 for invitations, physically remove the duplicated invitation block from `src/backend/server/web/webPlatformRoutes.ts` and then simplify `src/backend/server/web/registerWebRoutes.ts` by deleting:

- `INVITATION_WEB_ROUTES`
- `createWebPlatformRoutesFacade`

The duplicated block to remove from `webPlatformRoutes.ts` includes:

- `makeInviteUrl`
- `acceptInvitation`
- `POST /api/campaigns/:campaignId/invitations`
- `GET /api/campaigns/:campaignId/invitations`
- `POST /api/campaigns/:campaignId/invitations/:invitationId/revoke`
- `GET /api/invitations/:token`
- `POST /api/invitations/:token/accept`

Recommended validation:

```bash
npx eslint src/backend/server/web/registerWebRoutes.ts src/backend/server/web/routes/invitationWebRoutes.ts src/backend/server/web/webPlatformRoutes.ts
npm run typecheck:all
npm run build
```
