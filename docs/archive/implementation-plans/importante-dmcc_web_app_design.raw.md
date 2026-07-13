> Archived historical target-design draft.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# DMCC — Diseño final de producto web/app para agente implementador

## 0. Propósito del documento

Este documento define el producto final ideal de **DMCC — DM Campaign Companion** como plataforma web/app para mesas de rol.

No es un plan de migración incremental desde vault. No es una adaptación técnica provisional. Es el diseño objetivo del producto que una mesa de rol querría usar de verdad: antes de la sesión, durante la partida y entre sesiones.

La implementación debe transformar DMCC en una plataforma de continuidad narrativa, memoria de campaña, control de secretos, portal de jugador y preparación de sesiones.

## 1. Visión final del producto

DMCC debe ser una plataforma web/app de memoria narrativa para campañas de rol de mesa.

Su trabajo no es sustituir a un VTT, ni gestionar reglas completas, ni competir con Foundry, Roll20, Owlbear Rodeo o D&D Beyond.

Su trabajo es resolver el problema que más desgasta campañas largas:

- nadie recuerda bien qué pasó hace tres sesiones;
- los jugadores mezclan rumores, teorías y canon;
- el DM tiene secretos dispersos;
- los PNJs importantes se olvidan;
- las pistas quedan enterradas;
- los objetivos se pierden;
- las consecuencias narrativas no se siguen;
- los jugadores no tienen un lugar cómodo, móvil y claro para consultar lo que sus personajes saben.

DMCC debe convertirse en el centro de continuidad de una campaña.

## 2. Principios de producto

1. **Memoria antes que automatización.** DMCC no debe automatizar el juego por el DM. Debe ayudarle a recordar, conectar y revelar.
2. **Continuidad antes que reglas.** El foco no son tiradas, builds ni combate táctico. El foco es narrativa persistente.
3. **Secretos seguros.** Un jugador nunca debe recibir datos que no debería conocer.
4. **Jugador mobile-first.** El jugador debe poder consultar desde móvil sin sentirse dentro de una herramienta de administración.
5. **DM desktop/tablet-first.** El DM necesita potencia, filtros, paneles, preparación y control fino.
6. **La mesa manda.** DMCC debe adaptarse al ritmo de juego, no forzar una metodología rígida.
7. **Canon controlado.** Las notas y propuestas de jugadores no entran en canon hasta que el DM las acepta.
8. **No competir con VTT.** DMCC convive con VTTs. Es memoria, no tablero táctico.
9. **Web/app como producto principal.** El producto final es cloud/web/PWA/app, no local-first.
10. **PostgreSQL como fuente de verdad.** No queda vault, filesystem ni JSON local como persistencia primaria.

## 3. Posicionamiento

DMCC debe explicarse así:

> La memoria viva de tu campaña de rol. Controla secretos, conecta PNJs, recuerda pistas, prepara sesiones y da a tus jugadores un portal claro con solo lo que sus personajes saben.

No debe posicionarse como:

- VTT;
- gestor de reglas;
- generador automático de campañas;
- Notion con skin de fantasía;
- World Anvil completo;
- app de notas genérica;
- base de datos de monstruos;
- campaña IA autónoma.

## 4. Experiencias principales

### 4.1 DM — antes de la sesión

El DM debe poder abrir DMCC y responder rápido:

- ¿qué pasó la última vez?;
- ¿qué hilos están abiertos?;
- ¿qué PNJs siguen activos?;
- ¿qué secretos aún no se han revelado?;
- ¿qué pistas han visto los jugadores?;
- ¿qué consecuencias tengo pendientes?;
- ¿qué escenas quiero preparar?;
- ¿qué información puedo revelar esta sesión?;
- ¿qué jugadores tienen propuestas o notas pendientes?

Pantalla ideal: **Command Center de campaña**.

Debe contener:

- recap de última sesión;
- próximos objetivos;
- hilos narrativos abiertos;
- secretos pendientes;
- pistas sin resolver;
- PNJs relevantes;
- lugares activos;
- propuestas pendientes de jugadores;
- botón claro: “Preparar próxima sesión”.

### 4.2 DM — durante la sesión

Durante la partida, el DM no debe pelearse con formularios largos.

Necesita:

- captura rápida;
- revelar pista;
- marcar objetivo avanzado/completado;
- anotar consecuencia;
- crear NPC improvisado;
- añadir rumor;
- convertir nota en canon;
- ver qué sabe cada jugador;
- abrir modo mesa;
- compartir recap o entrada visible.

Pantalla ideal: **Live Table Mode**.

Debe ofrecer:

- sesión activa;
- panel de captura rápida;
- reloj/estado opcional;
- feed de hechos recientes;
- botones de revelar;
- lista de jugadores conectados;
- cambios visibles en tiempo real.

### 4.3 DM — después de la sesión

El DM debe poder cerrar sesión sin perder continuidad.

Debe poder:

- escribir recap;
- revisar notas rápidas;
- convertir capturas en facts/canon/rumor/secreto;
- actualizar objetivos;
- marcar escenas jugadas;
- decidir qué se publica a jugadores;
- generar resumen visible;
- dejar preparación inicial para próxima sesión.

Pantalla ideal: **Session Wrap-up**.

### 4.4 Jugador — antes de jugar

El jugador abre DMCC en el móvil y ve:

- dónde estamos;
- qué pasó la última vez;
- qué objetivos tenemos;
- qué PNJs conocemos;
- qué pistas hemos encontrado;
- qué sabe mi personaje;
- qué notas he escrito;
- qué propuestas tengo pendientes.

No debe ver:

- secretos del DM;
- notas privadas de otros jugadores;
- pistas no reveladas;
- mentiras marcadas como tales si su personaje no lo sabe;
- conclusiones internas del DM.

### 4.5 Jugador — durante la sesión

El jugador debe poder:

- consultar recap;
- consultar personaje;
- ver objetivos;
- tomar notas privadas;
- mandar propuesta al DM;
- marcar recordatorios personales;
- recibir revelaciones en vivo;
- ver imágenes, pistas o handouts compartidos.

### 4.6 Jugador — entre sesiones

El jugador debe poder:

- revisar memoria conocida;
- escribir diario de personaje;
- preguntar/proponer al DM;
- ver recap nuevo;
- preparar decisiones;
- consultar relaciones y lugares conocidos.

## 5. Superficies del producto

### 5.1 Web app DM

Rutas principales:

```txt
/app
/app/campaigns
/app/campaigns/:campaignId/command-center
/app/campaigns/:campaignId/memory
/app/campaigns/:campaignId/entities
/app/campaigns/:campaignId/relations
/app/campaigns/:campaignId/clues
/app/campaigns/:campaignId/objectives
/app/campaigns/:campaignId/sessions
/app/campaigns/:campaignId/live
/app/campaigns/:campaignId/canvas
/app/campaigns/:campaignId/players
/app/campaigns/:campaignId/invitations
/app/campaigns/:campaignId/settings
/account
```

### 5.2 Portal jugador

Rutas mobile-first:

```txt
/player
/player/campaigns
/player/campaigns/:campaignId/home
/player/campaigns/:campaignId/recap
/player/campaigns/:campaignId/character
/player/campaigns/:campaignId/memory
/player/campaigns/:campaignId/objectives
/player/campaigns/:campaignId/notes
/player/campaigns/:campaignId/proposals
```

### 5.3 Join/invitaciones

```txt
/join/:token
/join-code
/login
/register
```

### 5.4 PWA/app

El producto debe ser PWA instalable desde el principio.

Capacitor puede envolver la web después sin rediseñar el producto.

La app móvil es especialmente importante para jugadores. La experiencia de jugador debe sentirse nativa aunque técnicamente sea web/PWA.

## 6. Arquitectura final

```txt
Frontend React/Vite/TanStack Router
        ↓
Fastify API
        ↓
Services + CommandBus
        ↓
PostgreSQL
        ↓
Event Store + Snapshots + Read Models
        ↓
SSE realtime metadata
```

### 6.1 Stack final

Mantener:

- React;
- Vite;
- TanStack Router;
- Zustand, pero separado por dominios;
- Fastify;
- Zod;
- dominio, comandos, eventos y proyecciones actuales;
- i18n;
- premades.

Añadir:

- PostgreSQL;
- Drizzle ORM;
- `pg`;
- `@fastify/cookie`;
- `@fastify/helmet`;
- `@fastify/rate-limit`;
- `argon2`;
- SSE;
- almacenamiento de adjuntos controlado.

No añadir:

- SQLite;
- React Native;
- CRDTs;
- offline completo;
- pagos;
- marketplace;
- Supabase client directo desde frontend para saltarse backend.

## 7. Persistencia final: modelo híbrido write/read

DMCC debe usar un modelo híbrido obligatorio.

### 7.1 Write model

El historial canónico vive en:

- `domain_events`;
- `command_index`;
- `campaign_snapshots`.

Cada cambio importante entra como comando y genera eventos.

### 7.2 Read model

La UI no debe depender solo de parsear un snapshot JSON enorme.

Deben existir tablas de lectura relacionales para:

- entidades;
- facts;
- relaciones;
- visibilidad;
- sesiones;
- escenas;
- objetivos;
- pistas;
- notas;
- propuestas;
- actividad;
- notificaciones.

### 7.3 Flujo de escritura

```txt
POST /api/campaigns/:campaignId/commands
  requireAuth
  requireCampaignRole según comando
  withTransaction
    acquireCampaignAdvisoryLock
    check command_index
    load current snapshot/tip
    execute domain command
    append domain_events
    update command_index
    update campaign_snapshots
    project read models synchronously
    write activity feed/notifications if needed
  commit
  publish SSE metadata
```

### 7.4 Proyector síncrono

El proyector de read models debe ejecutarse dentro de la misma transacción del comando.

Motivo:

- no drift entre eventos, snapshot y read models;
- errores detectables inmediatamente;
- menos complejidad operacional en V1;
- read endpoints siempre consistentes.

Regla:

- proyectar solo tablas afectadas por los eventos del comando;
- no hacer jobs externos pesados dentro de la transacción;
- no recalcular toda la campaña salvo import o reparación.

## 8. Schema PostgreSQL final

Implementar en `src/backend/db/schema.ts` con Drizzle.

### 8.1 Identidad

Tablas:

- `users`;
- `auth_sessions`;
- `user_preferences`.

`users` debe soportar:

- email normalizado;
- display name;
- password hash argon2id;
- posible proveedor OAuth futuro;
- estado disabled;
- timestamps.

`auth_sessions` debe guardar solo hash del token.

Nunca guardar token de sesión en claro.

### 8.2 Tenancy

Tablas:

- `workspaces`;
- `workspace_memberships`.

Aunque la UI no haga muy visible el workspace, el modelo debe existir para:

- campañas personales;
- mesas compartidas;
- co-DMs;
- clubes;
- familias;
- futura facturación si aparece.

### 8.3 Campañas y membresías

Tablas:

- `campaigns`;
- `campaign_memberships`.

Roles de campaña:

```txt
dm
co_dm
player
viewer
```

Reglas:

- un usuario solo puede tener una membership activa por campaña;
- DM/co-DM puede modificar canon;
- player accede a portal filtrado;
- viewer accede a vista pública/solo lectura;
- todas las campañas se listan por membership, nunca por filesystem.

Índice:

```sql
CREATE UNIQUE INDEX ux_campaign_membership_active_user
ON campaign_memberships(campaign_id, user_id)
WHERE revoked_at IS NULL;
```

### 8.4 Player profiles y characters

Tablas:

- `player_profiles`;
- `characters`.

`player_profiles` sustituye al concepto simple de player.

Debe incluir:

- campaign_id;
- user_id;
- display_name;
- pronouns opcional;
- status: `active`, `retired`, `archived`;
- linked_character_id opcional;
- timestamps.

Regla V1:

- un usuario solo puede tener un player profile activo por campaña;
- perfiles archivados/históricos están permitidos;
- aceptar invitación dos veces no duplica profile.

Índice:

```sql
CREATE UNIQUE INDEX ux_player_profiles_one_active_user_campaign
ON player_profiles(campaign_id, user_id)
WHERE user_id IS NOT NULL AND status = 'active';
```

`characters` conecta el perfil de jugador con una entidad narrativa.

### 8.5 Event sourcing

Tablas:

- `domain_events`;
- `command_index`;
- `campaign_snapshots`.

`domain_events`:

- sequence por campaña;
- event_id único;
- type;
- payload jsonb;
- actor_user_id;
- actor_id textual si el dominio actual lo necesita;
- command_id;
- previous_hash;
- hash;
- schema_version;
- occurred_at.

`command_index`:

```sql
PRIMARY KEY (campaign_id, command_id)
```

Debe guardar:

- command_hash;
- first_sequence;
- last_sequence;
- result_json;
- created_at.

No implementar idempotencia con un unique index débil sobre `domain_events(campaign_id, command_id, sequence)`.

`campaign_snapshots` guarda la proyección completa canónica.

### 8.6 Read models narrativos

Tablas mínimas:

- `campaign_entities`;
- `campaign_facts`;
- `campaign_relations`;
- `visibility_grants`;
- `campaign_sessions`;
- `campaign_scenes`;
- `campaign_objectives`;
- `campaign_clues`;
- `campaign_notes`;
- `player_proposals`;
- `activity_feed`;
- `notifications`.

#### campaign_entities

Debe representar:

- NPC;
- lugar;
- facción;
- objeto;
- organización;
- amenaza;
- personaje;
- concepto relevante.

Campos recomendados:

- campaign_id;
- entity_id del dominio;
- type;
- name;
- public_summary;
- dm_summary;
- status;
- importance;
- tags;
- updated_at.

#### campaign_facts

Debe representar:

- canon;
- dm_secret;
- rumor;
- lie;
- player_theory;
- mistake;
- retcon;
- unknown.

Campos recomendados:

- fact_id;
- campaign_id;
- subject_entity_id;
- kind;
- content_public;
- content_dm;
- confidence;
- source;
- status;
- created_at;
- updated_at.

#### campaign_relations

Debe representar relaciones como:

- aliado de;
- enemigo de;
- debe favor a;
- traicionó a;
- protege a;
- sirve a;
- oculta algo de;
- contiene;
- causa;
- depende de.

#### visibility_grants

Debe controlar acceso narrativo fino.

Scopes:

```txt
public
all_players
specific_user
specific_player
dm_only
```

La visibilidad debe aplicarse en:

- portal jugador;
- búsqueda;
- read endpoints;
- SSE/refetch;
- export jugador;
- adjuntos.

### 8.7 Sesiones y modo mesa

Tablas:

- `campaign_sessions`;
- `campaign_scenes`;
- `live_tables`.

`campaign_sessions` debe cubrir:

- preparación;
- recap DM;
- recap público;
- estado: planned, live, completed, cancelled;
- fecha prevista;
- fecha jugada;
- notas.

`campaign_scenes` debe permitir ordenar escenas, pistas, PNJs y objetivos.

`live_tables` sustituye a LAN conceptualmente.

Debe permitir:

- código corto temporal;
- sesión activa;
- jugadores conectados;
- expiración;
- cierre manual.

No es LAN. Es “modo mesa”.

### 8.8 Invitaciones

Tablas:

- `campaign_invitations`;
- `campaign_invitation_acceptances`.

Reglas:

- token en claro solo se entrega al crear invitación;
- DB guarda hash del token;
- short code también hasheado;
- `max_uses` y `uses_count`;
- expiración;
- revocación;
- aceptar dos veces por el mismo usuario debe ser idempotente;
- otro usuario no puede usar una invitación agotada.

### 8.9 Notas, propuestas y canon

`campaign_notes`:

- notas privadas de DM;
- notas privadas de jugador;
- notas compartidas;
- notas ligadas a sesión, entidad o pista.

`player_proposals`:

- propuesta de personaje;
- propuesta de nota pública;
- teoría;
- petición al DM;
- corrección de recap;
- propuesta de vínculo o background.

Regla crítica:

- lo que escribe el jugador no entra en canon automáticamente;
- queda en `draft` o `submitted`;
- el DM aprueba, rechaza o convierte en evento canónico.

### 8.10 Storage

Tabla:

- `attachments`.

Storage real:

- desarrollo: carpeta controlada `.dmcc-storage`;
- producción: S3/R2/Supabase Storage o equivalente.

El backend siempre comprueba permisos antes de servir adjuntos.

## 9. Seguridad narrativa

Esta es una prioridad absoluta.

### 9.1 Reglas innegociables

- El frontend nunca decide permisos.
- El frontend nunca recibe secretos para ocultarlos visualmente.
- El backend resuelve actor desde cookie httpOnly.
- El backend ignora `actorId`, `role`, `playerId` enviados por cliente para permisos.
- El portal jugador recibe solo datos filtrados.
- Search filtra en SQL antes de devolver resultados.
- SSE nunca contiene payload sensible.
- Los adjuntos también se filtran.

### 9.2 Search seguro

La búsqueda debe tener dos caminos:

#### DM search

Puede buscar en:

- public_summary;
- dm_summary;
- notes DM;
- facts secretos;
- pistas no reveladas;
- relaciones ocultas.

#### Player search

Solo puede buscar en:

- contenido público;
- contenido `all_players`;
- contenido específico para su user/player;
- sus propias notas privadas.

Nunca debe buscar en `dm_summary` ni devolver snippets de secretos.

Índices separados:

```sql
CREATE INDEX ix_campaign_entities_public_search
ON campaign_entities
USING gin(to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(public_summary,'')));

CREATE INDEX ix_campaign_entities_dm_search
ON campaign_entities
USING gin(to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(public_summary,'') || ' ' || coalesce(dm_summary,'')));
```

### 9.3 SSE seguro

Eventos SSE permitidos:

```txt
campaign.updated
projection.updated
player.portal.updated
invitation.accepted
notification.created
```

Payload permitido:

```json
{
  "type": "projection.updated",
  "campaignId": "...",
  "sequence": 123
}
```

Payload prohibido:

- nombres secretos;
- contenido de facts;
- texto de notas;
- detalles de pistas;
- relaciones ocultas;
- resúmenes DM.

El cliente recibe SSE y refetch contra endpoints filtrados.

### 9.4 Limpieza SSE

Implementar:

```ts
request.raw.on('close', () => {
  campaignEventBus.unsubscribe(campaignId, listenerId);
});
```

## 10. Concurrencia e idempotencia

### 10.1 Advisory lock

Todas las escrituras de comandos deben serializarse por campaña.

Helper obligatorio:

```ts
export async function acquireCampaignAdvisoryLock(
  tx: DbTransaction,
  campaignId: string,
): Promise<void> {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${campaignId}::text, 0))`);
}
```

Usar en:

- command API;
- imports premade;
- aprobación de propuestas;
- creación de sesión si genera eventos;
- revelaciones;
- cambios de canvas;
- updates que afecten event store.

### 10.2 Idempotency-Key obligatorio

`POST /api/campaigns/:campaignId/commands` debe exigir:

```txt
Idempotency-Key: <uuid/string>
```

Reglas:

- falta key: `400`;
- mismo key + mismo command hash: devolver `result_json` cacheado;
- mismo key + distinto hash: `409 Conflict`;
- key nueva: ejecutar comando.

### 10.3 Secuencia y hash chain

Cada evento debe tener:

- sequence consecutiva por campaña;
- previous_hash correcto;
- hash calculado;
- actor_user_id;
- command_id;
- schema_version.

Dos comandos concurrentes en la misma campaña nunca deben generar la misma sequence.

## 11. API final

### 11.1 Auth

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/me
```

Registro:

- normaliza email;
- hash password argon2id;
- crea user;
- crea workspace personal;
- crea membership owner;
- crea sesión cookie httpOnly;
- devuelve usuario + campañas.

### 11.2 Workspaces

```txt
GET  /api/workspaces
POST /api/workspaces
GET  /api/workspaces/:workspaceId
PATCH /api/workspaces/:workspaceId
```

### 11.3 Campañas

```txt
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/:campaignId
PATCH  /api/campaigns/:campaignId
DELETE /api/campaigns/:campaignId
POST   /api/campaigns/:campaignId/archive
POST   /api/campaigns/:campaignId/restore
POST   /api/campaigns/:campaignId/duplicate
```

`GET /api/campaigns` lista por membership.

### 11.4 Comandos

```txt
POST /api/campaigns/:campaignId/commands
```

El backend inyecta:

- campaignId desde URL;
- actorUserId desde sesión;
- actorId interno;
- role desde membership.

No confiar en actor enviado por frontend.

### 11.5 Read endpoints DM

```txt
GET /api/campaigns/:campaignId/command-center
GET /api/campaigns/:campaignId/projection
GET /api/campaigns/:campaignId/entities
GET /api/campaigns/:campaignId/facts
GET /api/campaigns/:campaignId/relations
GET /api/campaigns/:campaignId/clues
GET /api/campaigns/:campaignId/objectives
GET /api/campaigns/:campaignId/sessions
GET /api/campaigns/:campaignId/search
GET /api/campaigns/:campaignId/activity
```

DM/co-DM ve completo según rol.

### 11.6 Player portal endpoints

```txt
GET  /api/player/campaigns
GET  /api/player/campaigns/:campaignId/home
GET  /api/player/campaigns/:campaignId/memory
GET  /api/player/campaigns/:campaignId/character
GET  /api/player/campaigns/:campaignId/objectives
GET  /api/player/campaigns/:campaignId/recap
GET  /api/player/campaigns/:campaignId/search
POST /api/player/campaigns/:campaignId/notes
POST /api/player/campaigns/:campaignId/proposals
PATCH /api/player/campaigns/:campaignId/character-state
```

Todos filtrados por membership/player profile.

### 11.7 Invitaciones

```txt
POST /api/campaigns/:campaignId/invitations
GET  /api/campaigns/:campaignId/invitations
POST /api/campaigns/:campaignId/invitations/:invitationId/revoke
GET  /api/invitations/:token
POST /api/invitations/:token/accept
POST /api/join-code/accept
```

### 11.8 Modo mesa

```txt
POST /api/campaigns/:campaignId/live-tables
GET  /api/campaigns/:campaignId/live-tables/current
POST /api/campaigns/:campaignId/live-tables/:liveTableId/close
POST /api/live-tables/:code/join
GET  /api/campaigns/:campaignId/events/stream
```

### 11.9 Premades

```txt
GET  /api/premades
GET  /api/premades/:premadeId
POST /api/premades/:premadeId/import
```

Importar premade:

- crea campaign;
- crea membership DM;
- genera domain_events;
- actualiza snapshot;
- proyecta read models;
- no escribe vault.

### 11.10 Export

```txt
GET /api/campaigns/:campaignId/export/markdown
GET /api/campaigns/:campaignId/export/json
GET /api/player/campaigns/:campaignId/export/markdown
```

Export DM puede incluir secretos. Export player no.

## 12. Servicios backend

Crear o consolidar:

```txt
src/backend/db/
  client.ts
  schema.ts
  migrate.ts
  transaction.ts
  advisoryLock.ts

src/backend/server/auth/
  password.ts
  sessionService.ts
  requireAuth.ts
  requireCampaignAccess.ts

src/backend/server/services/
  commandService.ts
  campaignService.ts
  invitationService.ts
  playerPortalService.ts
  readModelProjector.ts
  searchService.ts
  liveTableService.ts
  notificationService.ts
  activityService.ts

src/backend/server/repositories/
  postgresEventStore.ts
  postgresSnapshotStore.ts
  accountRepository.ts
  campaignRepository.ts
  campaignMembershipRepository.ts
  readModelRepository.ts
  invitationRepository.ts
  notificationRepository.ts

src/backend/server/realtime/
  campaignEventBus.ts
  sseRoutes.ts
```

## 13. Frontend final

### 13.1 Stores

Separar:

```txt
authStore
campaignListStore
campaignDetailStore
commandCenterStore
playerPortalStore
canvasStore
sessionStore
liveTableStore
notificationStore
```

No usar `sessionStorage` como fuente de verdad para campaña activa. Puede usarse solo como preferencia visual.

### 13.2 API client

Reglas:

- `credentials: "include"` siempre;
- no enviar `x-vault-id`;
- no enviar `x-player-token`;
- no enviar `x-dm-token`;
- no enviar `x-access-code`;
- no enviar `actorid`;
- todas las mutaciones command-based envían `Idempotency-Key`.

### 13.3 UX DM

Prioridades de UI:

1. Command Center.
2. Preparación de sesión.
3. Captura rápida.
4. Secretos y revelaciones.
5. Relaciones y canvas.
6. Jugadores e invitaciones.
7. Search potente.
8. Wrap-up de sesión.

### 13.4 UX jugador

Prioridades de UI:

1. Home de campaña clara.
2. Recap último.
3. Objetivos.
4. Personaje.
5. Memoria conocida.
6. Notas personales.
7. Propuestas al DM.
8. Notificaciones.

El portal jugador debe cargar bien en móvil.

## 14. Eliminación definitiva de legado

Eliminar o dejar sin uso funcional:

```txt
vaultId
x-vault-id
vaults/default
events.ndjson
snapshot.json
command-index.ndjson
events.index.json
auth.json
campaign-acl.json
dmAuthStore
campaignAclStore
server.playerTokens
server.activeAccessCodes como auth
lanExposed como permiso
x-player-token
x-dm-token
x-access-code
localIdentity como auth
DM unlock local
join LAN legacy
```

Rutas legacy a borrar o devolver 410 durante transición corta:

```txt
/api/auth/local-token
/api/join/:campaignId
/api/campaigns/:campaignId/rejoin
/api/campaigns/:campaignId/register
/api/vaults/*
```

El resultado final no debe depender de ellas.

## 15. Tests obligatorios

### 15.1 Backend

Crear/adaptar:

```txt
tests/backend/webAuth.test.ts
tests/backend/campaignMemberships.test.ts
tests/backend/postgresEventStore.test.ts
tests/backend/commandApi.test.ts
tests/backend/idempotencyPostgres.test.ts
tests/backend/concurrencyPostgres.test.ts
tests/backend/readModelProjector.test.ts
tests/backend/visibilitySecurity.test.ts
tests/backend/searchSecurity.test.ts
tests/backend/invitations.test.ts
tests/backend/playerPortalWeb.test.ts
tests/backend/liveTable.test.ts
tests/backend/realtimeSse.test.ts
tests/backend/premadePostgresImport.test.ts
```

Casos obligatorios:

1. Register crea user + workspace + sesión.
2. Login crea sesión.
3. Logout revoca sesión.
4. Usuario no autenticado no crea campaña.
5. Usuario autenticado crea campaña y membership DM.
6. Crear campaña genera evento inicial y snapshot.
7. DM importa premade.
8. Premade proyecta entidades/facts/relaciones.
9. DM crea invitación.
10. Player acepta invitación.
11. Aceptar invitación dos veces no duplica profile.
12. Player no ve secretos DM en portal.
13. Player no encuentra secretos en search.
14. DM sí encuentra secretos en search.
15. Player no puede ejecutar comandos DM.
16. Mismo idempotency key + mismo hash devuelve cache.
17. Mismo idempotency key + distinto hash devuelve 409.
18. Comandos concurrentes mantienen sequence correcta.
19. SSE no contiene payload secreto.
20. Cierre SSE limpia listener.
21. Borrado/archivado no aparece en listado normal.

### 15.2 E2E

Crear:

```txt
e2e/dmcc-web-product-flow.spec.ts
```

Flujo mínimo:

1. abrir `/register`;
2. crear DM;
3. crear campaña;
4. importar premade;
5. abrir command center;
6. crear secreto DM;
7. crear invitación;
8. logout;
9. abrir `/join/:token`;
10. registrar jugador;
11. aceptar invitación;
12. entrar portal;
13. comprobar que ve recap/objetivos/memoria visible;
14. comprobar que no ve secreto;
15. buscar palabra secreta y comprobar que no aparece;
16. login DM;
17. buscar palabra secreta y comprobar que sí aparece.

## 16. Comandos de aceptación

El agente no debe entregar como terminado si no intenta:

```bash
npm run lint
npm run typecheck:all
npm test
npm run build
npm run premade:build:check
npm run premade:validate
npm run test:e2e
```

Si alguno falla por entorno, debe documentar:

- comando ejecutado;
- error exacto;
- causa probable;
- qué queda pendiente.

## 17. Grep final obligatorio

Al terminar, este grep no debe encontrar usos funcionales:

```bash
grep -R "vaultId\|x-vault-id\|campaign-acl\|auth.json\|events.ndjson\|snapshot.json\|command-index.ndjson\|playerTokens\|activeAccessCodes\|lanExposed\|x-player-token\|x-dm-token\|x-access-code" src tests -n
```

Permitido solo en:

- documentación;
- test de 410 temporal;
- comentario marcado como eliminación pendiente.

## 18. Prioridades de implementación

1. **Aislamiento narrativo y seguridad de secretos.**
2. **Identidad, memberships y player profiles sin duplicados.**
3. **Command reliability: transacciones, advisory lock, idempotencia.**
4. **Read models y search con permisos.**
5. **UX DM: command center, sesiones, revelaciones.**
6. **UX jugador: móvil, recap, memoria, objetivos, notas.**
7. **Modo mesa y SSE.**
8. **Premades sobre DB.**
9. **Eliminación total del legado.**
10. **E2E completo.**

## 19. Orden lógico de ejecución para el agente

Aunque el producto final no debe pensarse como provisional, el agente puede implementar por bloques lógicos:

1. DB bootstrap + schema + migrations.
2. Auth web + sesiones cookie.
3. Workspaces + campaigns + memberships + player profiles.
4. PostgresEventStore + SnapshotStore + command_index.
5. Command API transaccional.
6. ReadModelProjector síncrono.
7. SearchService con permisos.
8. Premade imports sobre DB.
9. Invitations + join flow + player portal.
10. Live table + SSE metadata.
11. Frontend routing/stores/API client.
12. UX DM command center.
13. UX player mobile portal.
14. Legacy cleanup.
15. Tests + E2E + aceptación.

## 20. Qué no debe hacer el agente

- No crear compatibilidad con vaults antiguos.
- No mantener dos fuentes de verdad.
- No usar SQLite.
- No reescribir todo el dominio como CRUD.
- No saltarse CommandBus/event sourcing.
- No confiar permisos al frontend.
- No mandar secretos al jugador.
- No meter React Native.
- No implementar offline completo.
- No implementar pagos.
- No usar Supabase client desde frontend para escribir dominio.
- No guardar tokens en claro.
- No dejar player duplication como “ya lo arreglaremos”.
- No dejar búsqueda sin pruebas de fuga de secretos.

## 21. Definición final de éxito

DMCC está correctamente transformado cuando:

- un DM se registra;
- crea o importa campaña;
- ve command center útil;
- prepara sesiones;
- crea secretos, pistas, facts, relaciones y objetivos;
- invita jugadores;
- los jugadores entran con cuenta propia;
- cada jugador ve solo lo que debe ver;
- el jugador tiene portal móvil claro;
- notas/propuestas de jugadores no entran en canon sin aprobación;
- la búsqueda respeta permisos;
- SSE no filtra payloads;
- eventos viven en PostgreSQL con sequence/hash chain;
- command_index garantiza idempotencia;
- snapshots y read models están sincronizados;
- no queda dependencia funcional de vault/filesystem para campaña/auth/eventos;
- la app está lista para desplegarse como web/PWA/app.

## 22. Prompt maestro para agente implementador

```txt
Quiero que transformes DMCC en su producto final ideal: una plataforma web/app de memoria narrativa para campañas de rol de mesa.

No pienses en migración gradual desde vault. No preserves campañas antiguas. No mantengas compatibilidad con filesystem local como fuente de verdad.

Objetivo de producto:
DMCC debe permitir que un DM gestione la continuidad narrativa de una campaña: secretos, pistas, PNJs, lugares, relaciones, sesiones, recaps, objetivos, revelaciones y propuestas de jugadores. Los jugadores deben tener un portal mobile-first con solo lo que sus personajes saben.

Objetivo técnico:
- PostgreSQL es la fuente de verdad.
- Fastify API con auth cookie httpOnly.
- React/Vite/TanStack Router frontend.
- Drizzle ORM.
- Event sourcing conservado en domain_events.
- command_index para idempotencia.
- campaign_snapshots para proyección completa.
- read models relacionales para entidades, facts, relaciones, visibilidad, sesiones, objetivos, pistas, notas, propuestas, actividad y notificaciones.
- Search seguro con permisos en SQL.
- SSE solo con metadata, sin payload secreto.
- Invitations y live table sustituyen LAN.
- Player profiles únicos activos por user/campaign.
- No secrets leakage.

Reglas obligatorias:
- No confiar en actorId/role/playerId enviados por frontend.
- No mandar secretos al portal jugador.
- No buscar secretos desde endpoint jugador.
- No crear players duplicados.
- No usar x-vault-id, x-player-token, x-dm-token ni x-access-code como auth.
- No listar campañas por filesystem.
- No escribir events.ndjson, snapshot.json, auth.json ni campaign-acl.json.
- Toda escritura command-based debe ir en transacción con advisory lock por campaignId.
- Idempotency-Key obligatorio.
- Mismo idempotency key y distinto hash devuelve 409.
- Propuestas de jugador no entran en canon sin aprobación del DM.

Implementa por bloques:
1. DB schema/migrations.
2. Auth web.
3. Campaigns/memberships/player profiles.
4. Postgres event store/snapshots/command_index.
5. Command API transaccional.
6. ReadModelProjector síncrono.
7. Search con permisos.
8. Premades sobre DB.
9. Invitations/join/player portal.
10. Live table/SSE.
11. Frontend web/app routing/stores/API client.
12. UX DM command center.
13. UX jugador mobile portal.
14. Legacy cleanup.
15. Tests/E2E.

Entrega:
- Código completo.
- Migraciones.
- Tests actualizados.
- E2E mínimo.
- Resumen de ficheros modificados.
- Comandos ejecutados y resultados.
- Limitaciones reales si queda alguna.

No entregues como terminado si no has intentado:
npm run lint
npm run typecheck:all
npm test
npm run build
npm run premade:build:check
npm run premade:validate
npm run test:e2e
```
