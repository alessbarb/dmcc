> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 1: Extend i18n Dictionaries (es.ts and en.ts)

## Context
This is Task 1 of 7 in an i18n migration. A rogue i18n system (`frontendText.ts`) needs to be deleted
and 15 React components need to be migrated to the canonical i18n system. First, the canonical
dictionaries must be extended with all the new keys that the components will need.

## Files to Modify
- `/home/alessbarb/workspace/repos/incubating/dmcc/src/shared/i18n/dictionaries/es.ts`
- `/home/alessbarb/workspace/repos/incubating/dmcc/src/shared/i18n/dictionaries/en.ts`

## Current State
`es.ts` currently ends with:
```
  toasts: {
    success: "Operación realizada con éxito",
    error: "Ha ocurrido un error",
  },
  dialogs: {
    confirmDeleteTitle: "¿Estás seguro?",
    confirmDeleteDescription: "Esta acción no se puede deshacer.",
  },
} as const;
```

`canvas.toolbar` currently has: present, direction, addNode, resetView, selectMode, panMode, multiSelectMode, quickNote, visualGroup, fitView, focusSelection, zoomIn, zoomOut, minimap, focusGroup, focusPlaceholder, groupFallback, newGroup, unlockPositions, lockPositions

`canvas.palette` currently has: title, entitiesTab, factsTab, notesTab

`common` currently has: save, cancel, delete, edit, search, close, actions, loading, confirm, back, create, copied

## What to Add

### 1. Extend `common` namespace in es.ts (add these 4 keys):
```typescript
yes: "Sí",
saveChanges: "Guardar cambios",
cancelEdit: "Cancelar edición",
summary: "Resumen",
```

### 2. Extend `toasts` namespace in es.ts (add after existing `success` and `error`):
```typescript
entityRevealedCanvas: "El DM reveló la entidad \"{title}\" desde el canvas de dirección.",
statusUpdatedCanvas: "Se actualizó el estado de \"{title}\" a \"{status}\" desde el canvas.",
secretAutoRevealed: "Secreto \"{secret}\" revelado automáticamente al activarse su ancla \"{anchor}\".",
secretRevealed: "Secreto \"{title}\" revelado.",
entityRevealedInspector: "El DM reveló la entidad \"{title}\" desde el panel de dirección.",
statusUpdatedInspector: "Se actualizó el estado de \"{title}\" a \"{status}\" desde el panel de dirección.",
sessionStartedWithPrep: "Sesión \"{title}\" iniciada con la preparación del canvas.",
elementsAddedToSession: "Elementos agregados a la sesión activa.",
decisionRecorded: "Decisión registrada.",
decisionError: "Error al guardar decisión: {error}",
sessionClosed: "Sesión cerrada y guardada.",
```

### 3. Extend `canvas.toolbar` namespace in es.ts (add after existing keys):
```typescript
deactivateDirection: "Desactivar modo dirección en vivo",
activateDirection: "Activar modo dirección en vivo para controlar la sesión",
exitPresentation: "Salir de presentación",
activatePlayerView: "Activar vista de jugadores (Modo presentación)",
playerViewLabel: "👁 Vista Jugadores",
showingPublicOnly: "Mostrando solo información pública",
showingAll: "Mostrando todo (público y secretos)",
publicOnly: "Solo público",
activateMysteryFlow: "Activar Mystery Flow para ver conexiones de investigación",
filterConnections: "Filtrar las líneas de conexión",
prepareSession: "Preparar sesión con los elementos seleccionados",
revealSelectedConfirm: "¿Revelar a los jugadores las {count} entidades seleccionadas?",
hideSelectedConfirm: "¿Hacer secretas (solo DM) las {count} entidades seleccionadas?",
removeSelectedConfirm: "¿Quitar los {count} nodos seleccionados de este canvas? (Las entidades seguirán existiendo)",
sessionPrepTitle: "Preparación de Sesión",
```

### 4. Extend `canvas.palette` namespace in es.ts (add after existing keys):
```typescript
addNoteDragHint: "Arrastra o haz clic para añadir nota",
addGroupDragHint: "Arrastra o haz clic para añadir grupo",
searchEntityPlaceholder: "Buscar entidad...",
searchFactPlaceholder: "Buscar hecho...",
allFactsOnCanvas: "Todos los hechos ya están en el canvas",
typeLabelLocation: "Lugar / Localización",
typeLabelQuest: "Misión / Hilo Narrativo",
typeLabelSecret: "Secreto de DM",
typeLabelFaction: "Facción / Organización",
typeLabelScene: "Escena de Sesión",
typeLabelHandout: "Documento / Pista para Jugadores",
searchEntityExampleHint: "Ej. Mara, Taberna El Jabalí Rojo, Rumor de las luces...",
```

### 5. Add new `canvas.node` namespace in es.ts (inside the `canvas` object):
```typescript
node: {
  visibilityDmOnly: "Secreto DM (Solo visible para el DM)",
  visibilityRevealed: "Revelado (Visible para todos los jugadores)",
  visibilityPartial: "Parcialmente descubierto",
  addSessionNotePrompt: "Añadir nota de sesión para: {title}",
  noActiveSessionNote: "No hay ninguna sesión activa en curso para añadir notas.",
  addSessionNoteLabel: "Añadir Nota de Sesión",
  statusPrompt: "Estado de {title}: {status}",
  changeStatus: "Cambiar/Resolver Estado",
  consequenceTitlePrompt: "Título de la consecuencia para: {title}",
  addConsequence: "Añadir Consecuencia Conectada",
  typeLocation: "Ubicación",
  typeSession: "Sesión",
  secretAnchorRevealPrompt: "¡El elemento \"{anchor}\" descubierto/completado sirve de ancla para el secreto: \"{secret}\"!\n¿Deseas revelar este secreto ahora a los jugadores?",
  archiveEntityConfirm: "¿Estás seguro de que quieres archivar la entidad \"{title}\" de toda la campaña?",
  removeFromCanvasConfirm: "¿Quitar esta tarjeta del canvas? (La entidad seguirá existiendo en el lore de la campaña)",
  entityNotOnBoard: "\"{title}\" existe en el lore pero no está en ningún tablero visual.",
  removeRelationFromCanvasConfirm: "¿Quitar esta conexión del canvas? (La relación seguirá existiendo en el lore de la campaña)",
  relationNotOnBoard: "La relación \"{title}\" existe en el lore pero no está en ningún tablero visual.",
  archiveRelationConfirm: "¿Archivar esta relación del lore de la campaña permanentemente?",
  quickTitlePlaceholder: "Título rápido...",
  rolePlaceholder: "Ej. Líder tribal, Cueva inundada...",
  notesPlaceholder: "Añade secretos, mecánicas de combate, recompensas...",
  consequencePlaceholder: "Ej. Alerta general, pérdida de reputación...",
  removeFromCanvasTooltip: "Quita la tarjeta del canvas sin borrar la entidad de la campaña",
  archiveEntityTooltip: "Archiva la entidad de forma permanente en la campaña",
  relationLore: "Relación Lore",
  connectionVisual: "Conexión Visual",
  relationDetailPlaceholder: "Detalles sobre esta relación social o lógica...",
  archiveRelationTooltip: "Elimina esta relación del lore de la campaña permanentemente",
  untitledElement: "Elemento sin título",
  generalNotesPlaceholder: "Notas generales que describen la entidad...",
  statusCritical: "🚨 Crítico",
  statusBlocked: "Bloqueado",
  statusResolved: "Resuelto",
},
```

### 6. Add new `canvas.factNode` namespace:
```typescript
factNode: {
  newFactPrompt: "Nuevo hecho ({kind}):\n\nEscribe la declaración:",
  kindCanon: "CANON",
  kindDmSecret: "SECRETO DM",
  kindRumor: "RUMOR",
  kindLie: "MENTIRA",
  kindTheory: "TEORÍA",
  kindMistake: "ERROR",
  kindRetcon: "RETCON",
  kindUnknown: "DESCONOCIDO",
  kindTheoryShort: "Teoría",
  kindDmSecretShort: "Secreto DM",
  noStatement: "(sin declaración)",
  statementPlaceholder: "Escribe la declaración del hecho...",
  confidenceUnconfirmed: "Sin confirmar",
  confidenceSuspected: "Sospechado",
  confidenceLikely: "Probable",
  confidenceConfirmed: "Confirmado",
  confidenceFalse: "Falso",
},
```

### 7. Add new `canvas.noteNode` namespace:
```typescript
noteNode: {
  deleteNote: "Eliminar nota",
  contentPlaceholder: "Escribe una idea rápida...",
  contentPlaceholderLong: "Nota rápida. Escribe tu idea aquí...",
  addQuickSessionNote: "Añadir nota de sesión rápida:",
  quickSessionNote: "Nota de sesión rápida",
  noActiveSession: "No hay ninguna sesión activa en curso.",
},
```

### 8. Add new `canvas.groupNode` namespace:
```typescript
groupNode: {
  titlePlaceholder: "Título del grupo...",
},
```

### 9. Add new `canvas.relationPopover` namespace:
```typescript
relationPopover: {
  worksFor: "trabaja para él/ella",
  hidesAbout: "oculta algo sobre él/ella",
  revealsInfo: "revela información de",
  memberOf: "miembro de / está en",
  detailsPlaceholder: "Detalles sobre esta relación...",
},
```

### 10. Add new `canvas.flow` namespace:
```typescript
flow: {
  warningOrphanClue: "La pista 🔎 \"{title}\" está huérfana: no conduce a ningún secreto, misión o personaje.",
  warningStuckQuest: "La misión ⚔️ \"{title}\" no tiene conexiones de escena o consecuencias que la resuelvan.",
  warningEmptyLocation: "El lugar 🗺️ \"{title}\" está vacío: no contiene personajes ni pistas en el canvas.",
  warningSecretRelation: "La relación secreta entre \"{source}\" y \"{target}\" une dos entidades públicas.",
},
```

### 11. Add new `canvas.page` namespace:
```typescript
page: {
  initializingTemplate: "Inicializando plantilla de campaña: {name}...",
  templateInitialized: "Campaña inicializada con plantilla de {name}",
  relationCount: "{count} relación{suffix}",
  notOnBoard: "{count} del lore no están en ningún tablero visual.",
  boardInitialized: "Tablero inicializado con plantilla \"{name}\"",
  templateConspiration: "Conspiración",
  templateRelations: "Relaciones",
  createNewBoard: "Crear nuevo tablero",
  importExamplePlaceholder: "Ej. Bosque Sombrío, Conspiración del Culto...",
  importExampleContent: "# Conspiración del Culto\n[NPC] Veradis el Inquisidor\n[Lugar] Sala del Oráculo\n[Pista] Profecía Rota\n[Secreto] El Oráculo es un Fraude\n\nVeradis el Inquisidor -> controla -> Sala del Oráculo\nProfecía Rota -> revela -> El Oráculo es un Fraude",
  importSuccess: "Importación completada con éxito.",
  sessionNamePlaceholder: "Ej. Sesión 4: El reencuentro",
  loadIntoSession: "Cargar en Sesión",
},
```

### 12. Add new `canvas.seedData` namespace:
```typescript
seedData: {
  investigationTrigger: "El detonante de la investigación. ¿Qué ocurrió?",
  redHerring: "Un rumor que intenta desviar la atención.",
  centralSecret: "Secreto Central",
  finalRevelation: "Revelación Final",
  factionLeader: "Líder de Facción",
  enemyFaction: "Facción Enemiga",
  missionToStop: "La misión para detenerlos o apoyarlos.",
  publicMeetingPoint: "Punto de encuentro público",
  darkAlley: "Callejón Oscuro",
  scene1: "Escena 1: Introducción",
  scene1Desc: "Los jugadores se reúnen y reciben el encargo.",
  scene2: "Escena 2: Exploración",
  sessionResolution: "Resolución de la sesión.",
  nextSessionChanges: "Qué cambia para la siguiente sesión.",
  secretPassage: "Pasadizo Secreto",
  behindTapestry: "Detrás del tapiz.",
  orcShaman: "El orco chamán",
},
```

### 13. Add new TOP-LEVEL `session` namespace (before `toasts`):
```typescript
session: {
  actions: "Acciones de sesión",
  decisionMade: "Decisión tomada: {decision}{suffix}",
  decisionConsequence: "Consecuencia de la decisión",
  decisionCausesConsequence: "La decisión causa esta consecuencia",
  pendingConsequence: "Consecuencia pendiente originada por la decisión: {decision}",
  exampleConsequence: "Los bandidos reclamarán un favor más adelante…",
  recordDecision: "Registrar decisión",
  exampleNote: "El rey convoca al grupo en 3 días…",
  createConsequence: "Crear consecuencia",
  createNpc: "Crear PNJ",
  exampleSummary: "El grupo exploró las ruinas, encontró a Elara prisionera y decidió negociar con el jefe de la guardia…",
  closeAndSave: "Cerrar sesión y guardar",
  sessionNumber: "Sesión {number}",
  quickNote: "Nota rápida",
  createQuickNpc: "Crear PNJ rápido",
  closeSession: "Cerrar sesión",
  archiveNoteConfirm: "¿Archivar esta nota?",
  summary: "Resumen",
},
```

### 14. Add new TOP-LEVEL `players` namespace (before `toasts`):
```typescript
players: {
  editProfile: "Editar perfil de jugador",
  addPlayer: "Añadir jugador",
  saveNote: "Guardar nota",
  playerSummary: "Resumen del Jugador",
  characterStatus: "Estado del Personaje",
  dmNotes: "Descripción o notas para el DM",
  observationsPlaceholder: "Escribe tus observaciones aquí...",
  characterGoalPlaceholder: "Encontrar al oráculo...",
},
```

### 15. Add new TOP-LEVEL `entityModal` namespace (before `toasts`):
```typescript
entityModal: {
  playerCharacters: "Personajes",
  descriptionPlaceholder: "Descripción breve...",
  motivationPlaceholder: "¿Qué quiere este personaje?",
  regionLabel: "Región",
  tabCreation: "Creación",
  tabVisibility: "Visibilidad",
  tabRelation: "Relación",
  cancelEdit: "Cancelar edición",
},
```

---

## en.ts Equivalent Changes

Apply the SAME structural changes to en.ts with English translations:

### common (add 4 keys):
- yes: "Yes"
- saveChanges: "Save changes"
- cancelEdit: "Cancel editing"
- summary: "Summary"

### toasts (add 11 keys):
- entityRevealedCanvas: "DM revealed entity \"{title}\" from the direction canvas."
- statusUpdatedCanvas: "Updated status of \"{title}\" to \"{status}\" from the canvas."
- secretAutoRevealed: "Secret \"{secret}\" automatically revealed when anchor \"{anchor}\" activated."
- secretRevealed: "Secret \"{title}\" revealed."
- entityRevealedInspector: "DM revealed entity \"{title}\" from the direction panel."
- statusUpdatedInspector: "Updated status of \"{title}\" to \"{status}\" from the direction panel."
- sessionStartedWithPrep: "Session \"{title}\" started with canvas preparation."
- elementsAddedToSession: "Elements added to active session."
- decisionRecorded: "Decision recorded."
- decisionError: "Error saving decision: {error}"
- sessionClosed: "Session closed and saved."

### canvas.toolbar (add 15 keys):
- deactivateDirection: "Deactivate live direction mode"
- activateDirection: "Activate live direction mode to control the session"
- exitPresentation: "Exit presentation"
- activatePlayerView: "Activate player view (Presentation mode)"
- playerViewLabel: "👁 Player View"
- showingPublicOnly: "Showing only public information"
- showingAll: "Showing everything (public and secrets)"
- publicOnly: "Public only"
- activateMysteryFlow: "Activate Mystery Flow to see investigation connections"
- filterConnections: "Filter connection lines"
- prepareSession: "Prepare session with selected elements"
- revealSelectedConfirm: "Reveal the {count} selected entities to players?"
- hideSelectedConfirm: "Make the {count} selected entities secret (DM only)?"
- removeSelectedConfirm: "Remove the {count} selected nodes from this canvas? (Entities will still exist)"
- sessionPrepTitle: "Session Preparation"

### canvas.palette (add 12 keys):
- addNoteDragHint: "Drag or click to add a note"
- addGroupDragHint: "Drag or click to add a group"
- searchEntityPlaceholder: "Search entity..."
- searchFactPlaceholder: "Search fact..."
- allFactsOnCanvas: "All facts are already on the canvas"
- typeLabelLocation: "Place / Location"
- typeLabelQuest: "Quest / Narrative Thread"
- typeLabelSecret: "DM Secret"
- typeLabelFaction: "Faction / Organization"
- typeLabelScene: "Session Scene"
- typeLabelHandout: "Document / Player Handout"
- searchEntityExampleHint: "e.g. Mara, Red Boar Tavern, Lights rumor..."

### canvas.node (new, 34 keys):
- visibilityDmOnly: "DM Secret (Only visible to the DM)"
- visibilityRevealed: "Revealed (Visible to all players)"
- visibilityPartial: "Partially discovered"
- addSessionNotePrompt: "Add session note for: {title}"
- noActiveSessionNote: "There is no active session in progress to add notes."
- addSessionNoteLabel: "Add Session Note"
- statusPrompt: "Status of {title}: {status}"
- changeStatus: "Change/Resolve Status"
- consequenceTitlePrompt: "Consequence title for: {title}"
- addConsequence: "Add Connected Consequence"
- typeLocation: "Location"
- typeSession: "Session"
- secretAnchorRevealPrompt: "The element \"{anchor}\" discovered/completed serves as anchor for the secret: \"{secret}\"!\nDo you want to reveal this secret to players now?"
- archiveEntityConfirm: "Are you sure you want to archive the entity \"{title}\" from the entire campaign?"
- removeFromCanvasConfirm: "Remove this card from the canvas? (The entity will still exist in the campaign lore)"
- entityNotOnBoard: "\"{title}\" exists in the lore but is not on any visual board."
- removeRelationFromCanvasConfirm: "Remove this connection from the canvas? (The relation will still exist in the campaign lore)"
- relationNotOnBoard: "The relation \"{title}\" exists in the lore but is not on any visual board."
- archiveRelationConfirm: "Archive this relation from the campaign lore permanently?"
- quickTitlePlaceholder: "Quick title..."
- rolePlaceholder: "e.g. Tribal leader, Flooded cave..."
- notesPlaceholder: "Add secrets, combat mechanics, rewards..."
- consequencePlaceholder: "e.g. General alert, reputation loss..."
- removeFromCanvasTooltip: "Remove the card from canvas without deleting the entity from the campaign"
- archiveEntityTooltip: "Archive the entity permanently from the campaign"
- relationLore: "Lore Relation"
- connectionVisual: "Visual Connection"
- relationDetailPlaceholder: "Details about this social or logical relation..."
- archiveRelationTooltip: "Permanently delete this relation from the campaign lore"
- untitledElement: "Untitled element"
- generalNotesPlaceholder: "General notes describing the entity..."
- statusCritical: "🚨 Critical"
- statusBlocked: "Blocked"
- statusResolved: "Resolved"

### canvas.factNode (new, 18 keys):
- newFactPrompt: "New fact ({kind}):\n\nWrite the statement:"
- kindCanon: "CANON"
- kindDmSecret: "DM SECRET"
- kindRumor: "RUMOR"
- kindLie: "LIE"
- kindTheory: "THEORY"
- kindMistake: "MISTAKE"
- kindRetcon: "RETCON"
- kindUnknown: "UNKNOWN"
- kindTheoryShort: "Theory"
- kindDmSecretShort: "DM Secret"
- noStatement: "(no statement)"
- statementPlaceholder: "Write the fact statement..."
- confidenceUnconfirmed: "Unconfirmed"
- confidenceSuspected: "Suspected"
- confidenceLikely: "Likely"
- confidenceConfirmed: "Confirmed"
- confidenceFalse: "False"

### canvas.noteNode (new, 6 keys):
- deleteNote: "Delete note"
- contentPlaceholder: "Write a quick idea..."
- contentPlaceholderLong: "Quick note. Write your idea here..."
- addQuickSessionNote: "Add quick session note:"
- quickSessionNote: "Quick session note"
- noActiveSession: "There is no active session in progress."

### canvas.groupNode (new, 1 key):
- titlePlaceholder: "Group title..."

### canvas.relationPopover (new, 5 keys):
- worksFor: "works for"
- hidesAbout: "hides something about"
- revealsInfo: "reveals information about"
- memberOf: "member of / is in"
- detailsPlaceholder: "Details about this relation..."

### canvas.flow (new, 4 keys):
- warningOrphanClue: "Clue 🔎 \"{title}\" is orphaned: it doesn't lead to any secret, quest, or character."
- warningStuckQuest: "Quest ⚔️ \"{title}\" has no scene connections or consequences to resolve it."
- warningEmptyLocation: "Location 🗺️ \"{title}\" is empty: it contains no characters or clues on the canvas."
- warningSecretRelation: "The secret relation between \"{source}\" and \"{target}\" connects two public entities."

### canvas.page (new, 14 keys):
- initializingTemplate: "Initializing campaign template: {name}..."
- templateInitialized: "Campaign initialized with template {name}"
- relationCount: "{count} relation{suffix}"
- notOnBoard: "{count} from the lore are not on any visual board."
- boardInitialized: "Board initialized with template \"{name}\""
- templateConspiration: "Conspiracy"
- templateRelations: "Relations"
- createNewBoard: "Create new board"
- importExamplePlaceholder: "e.g. Dark Forest, Cult Conspiracy..."
- importExampleContent: "# Cult Conspiracy\n[NPC] Veradis the Inquisitor\n[Location] Oracle's Chamber\n[Clue] Broken Prophecy\n[Secret] The Oracle Is a Fraud\n\nVeradis the Inquisitor -> controls -> Oracle's Chamber\nBroken Prophecy -> reveals -> The Oracle Is a Fraud"
- importSuccess: "Import completed successfully."
- sessionNamePlaceholder: "e.g. Session 4: The Reunion"
- loadIntoSession: "Load into Session"

### canvas.seedData (new, 17 keys):
- investigationTrigger: "The investigation trigger. What happened?"
- redHerring: "A rumor trying to divert attention."
- centralSecret: "Central Secret"
- finalRevelation: "Final Revelation"
- factionLeader: "Faction Leader"
- enemyFaction: "Enemy Faction"
- missionToStop: "The mission to stop or support them."
- publicMeetingPoint: "Public meeting point"
- darkAlley: "Dark Alley"
- scene1: "Scene 1: Introduction"
- scene1Desc: "The players gather and receive the mission."
- scene2: "Scene 2: Exploration"
- sessionResolution: "Session resolution."
- nextSessionChanges: "What changes for the next session."
- secretPassage: "Secret Passage"
- behindTapestry: "Behind the tapestry."
- orcShaman: "The orc shaman"

### session (new top-level, 17 keys):
- actions: "Session actions"
- decisionMade: "Decision made: {decision}{suffix}"
- decisionConsequence: "Decision consequence"
- decisionCausesConsequence: "The decision causes this consequence"
- pendingConsequence: "Pending consequence from decision: {decision}"
- exampleConsequence: "The bandits will claim a favor later…"
- recordDecision: "Record decision"
- exampleNote: "The king summons the group in 3 days…"
- createConsequence: "Create consequence"
- createNpc: "Create NPC"
- exampleSummary: "The group explored the ruins, found Elara prisoner and decided to negotiate with the guard captain…"
- closeAndSave: "Close session and save"
- sessionNumber: "Session {number}"
- quickNote: "Quick note"
- createQuickNpc: "Create quick NPC"
- closeSession: "Close session"
- archiveNoteConfirm: "Archive this note?"
- summary: "Summary"

### players (new top-level, 8 keys):
- editProfile: "Edit player profile"
- addPlayer: "Add player"
- saveNote: "Save note"
- playerSummary: "Player Summary"
- characterStatus: "Character Status"
- dmNotes: "Description or DM notes"
- observationsPlaceholder: "Write your observations here..."
- characterGoalPlaceholder: "Find the oracle..."

### entityModal (new top-level, 8 keys):
- playerCharacters: "Characters"
- descriptionPlaceholder: "Brief description..."
- motivationPlaceholder: "What does this character want?"
- regionLabel: "Region"
- tabCreation: "Creation"
- tabVisibility: "Visibility"
- tabRelation: "Relation"
- cancelEdit: "Cancel editing"

## Ordering Notes

For es.ts:
- Add new keys to `common` inside the existing object (after `copied:`)
- Add new keys to `toasts` inside the existing object (after `error:`)
- Add new keys to `canvas.toolbar` inside the existing object (after `lockPositions:`)
- Add new keys to `canvas.palette` inside the existing object (after `notesTab:`)
- Add `canvas.node`, `canvas.factNode`, `canvas.noteNode`, `canvas.groupNode`, `canvas.relationPopover`, `canvas.flow`, `canvas.page`, `canvas.seedData` — all inside the `canvas` object, after the `palette` block
- Add `session`, `players`, `entityModal` as new top-level namespaces — between the existing last namespace and `toasts`
- `toasts` and `dialogs` remain the last two namespaces (they end with `} as const;`)

The same ordering for en.ts (which ends with `};` not `} as const;`).

## Verification After Task
- Run `npm test` from `/home/alessbarb/workspace/repos/incubating/dmcc` — must pass (the i18n parity test checks that es.ts and en.ts have identical keys)
- Commit with message: `feat(i18n): extend es/en dictionaries with canvas, session, players, entityModal namespaces`

## Report File
Write your report to: `/home/alessbarb/workspace/repos/incubating/dmcc/.superpowers/sdd/i18n/task1-report.md`

Include:
- STATUS: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Commits made (git log --oneline -3)
- Test result (one-line summary: "X tests passed")
- Any concerns
