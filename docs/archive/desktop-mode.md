# Desktop mode archive

Desktop mode is archived and experimental. DMCC is web-first: the current production path uses the browser UI, session-cookie authentication, PostgreSQL/Neon storage, and Render-style deployment.

Do not extend Electron packaging or desktop release flows unless desktop mode is explicitly reactivated. Desktop scripts remain isolated under `desktop:*` commands and are not part of the main `build`, `start`, or deployment flow.
