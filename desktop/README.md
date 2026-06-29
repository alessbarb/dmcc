# DMCC Desktop

This folder contains the Electron entrypoint for the standalone desktop build.

The desktop app reuses the same frontend and backend used by the web/PWA mode:

- `npm run start` keeps the current browser/server workflow.
- `npm run desktop:dev` builds the app, starts an internal Fastify server, and opens an Electron window.
- `npm run desktop:build` creates desktop packages in `release/`.

By default the internal server listens only on `127.0.0.1` and uses a random free port. Data is stored in `Documents/DMCampaignCompanion`, unless `DMCC_DATA_DIR` is provided.

For LAN testing, launch with:

```bash
DMCC_DESKTOP_LAN=1 npm run desktop:dev
```

or pass `--lan` to Electron. LAN mode exposes the internal server on `0.0.0.0`, so use it only on trusted networks.
