# Backend legacy filesystem API archive

PR #94 measured the legacy filesystem backend with:

```bash
rg "repositoryFactory|EventStore|SnapshotStore|vaultRoutes|authRoutes|userAuthRoutes|hardeningRoutes|exportRoutes" src tests -n
```

Classification:

- `src/backend/server/routes/vaultRoutes.ts` — B, legacy/local only; moved to `src/backend/server/legacy/routes/vaultRoutes.ts`.
- `src/backend/server/routes/authRoutes.ts` — B, legacy/local only; moved to `src/backend/server/legacy/routes/authRoutes.ts`.
- `src/backend/server/routes/userAuthRoutes.ts` — B, legacy/local only; moved to `src/backend/server/legacy/routes/userAuthRoutes.ts`.
- `src/backend/server/routes/hardeningRoutes.ts` — B, legacy/local filesystem maintenance only; moved to `src/backend/server/legacy/routes/hardeningRoutes.ts`.
- `src/backend/server/routes/exportRoutes.ts` — B, legacy/local filesystem export only; moved to `src/backend/server/legacy/routes/exportRoutes.ts`.
- `src/backend/server/repositoryFactory.ts` — B, legacy/local filesystem repositories only; moved to `src/backend/server/legacy/repositoryFactory.ts`.
- `src/core/persistence/eventStore` — A for legacy filesystem tests and core persistence coverage; retained outside web, with no web/frontend imports.
- `src/core/persistence/snapshotStore` — A for legacy filesystem tests and core persistence coverage; retained outside web, with no web/frontend imports.

The PostgreSQL web backend must not import these filesystem routes. Web compatibility for removed platform endpoints remains in `src/backend/server/web/routes/platformCompatibilityRoutes.ts`.
