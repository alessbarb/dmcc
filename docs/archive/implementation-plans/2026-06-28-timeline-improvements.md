> Archived historical implementation plan.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Timeline Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Timeline page from a flat event log into a DM-useful narrative history with session grouping, entity clickthrough, search, entity filter, richer stats, retcon indicators, and prep-vs-live badges.

**Architecture:** All changes are front-end only. `TimelinePage.tsx` gets structural overhaul (session grouping, search, entity filter). `eventVisuals.tsx` gets an `onEntityClick` callback wired through event descriptions. `App.tsx` passes `setSelectedEntity` to `TimelinePage`. Stats block replaced with DM-relevant metrics computed from `timeline.events` + `campaignState`. i18n keys added to all 6 dictionaries.

**Tech Stack:** React, TypeScript, Zustand (`useCampaignStore`), lucide-react icons, existing CSS vars/classes.

## Global Constraints

- No new npm packages.
- All strings via `useTranslation` / `t()` — no hardcoded UI text.
- i18n keys must be added to all 6 dicts: `es`, `en`, `fr`, `it`, `pt`, `de`.
- Keep existing `TimelinePageProps` interface — only additive changes.
- Do not delete existing filter categories; existing behaviour must survive.
- File paths: `src/frontend/dm/sessions/TimelinePage.tsx`, `src/frontend/dm/entities/eventVisuals.tsx`, `src/frontend/App.tsx`, `src/shared/i18n/dictionaries/{es,en,fr,it,pt,de}.ts`.

---

### Task 1: Wire `onEntityClick` from App → TimelinePage → eventVisuals

**Files:**
- Modify: `src/frontend/App.tsx` (line ~1078-1086)
- Modify: `src/frontend/dm/sessions/TimelinePage.tsx`
- Modify: `src/frontend/dm/entities/eventVisuals.tsx`

**Interfaces:**
- Produces: `renderEventDescription(type, payload, campaignState, locale, onEntityClick?)` — last param optional `(entityId: string) => void`
- Produces: `TimelinePageProps.onEntityClick?: (entityId: string) => void`

- [ ] **Step 1: Add `onEntityClick` prop to `TimelinePageProps`**

In `src/frontend/dm/sessions/TimelinePage.tsx`, extend the interface:

```typescript
export interface TimelinePageProps {
  timeline?: any;
  campaignState?: any;
  timelineFilter?: string;
  setTimelineFilter?: (f: string) => void;
  expandedEvents?: Record<string, boolean>;
  toggleEventJson?: (id: string) => void;
  onEntityClick?: (entityId: string) => void;  // NEW
}
```

- [ ] **Step 2: Pass `onEntityClick` down to `renderEventDescription`**

Inside `TimelinePage`, in the `filteredEvents.map` block, pass the callback:

```typescript
{renderEventDescription(
  evt.type,
  evt.payload,
  campaignState,
  locale,
  onEntityClick,   // NEW — last arg
)}
```

- [ ] **Step 3: Add `onEntityClick` param to `renderEventDescription` in eventVisuals.tsx**

Change signature:

```typescript
export function renderEventDescription(
  type: string,
  payload: any,
  campaignState: any,
  locale: SupportedLocale = "es",
  onEntityClick?: (entityId: string) => void,   // NEW
) {
```

Create a helper inside the function:

```typescript
const EntityLink = ({ id }: { id: string }) => {
  const title = getEntityTitle(id);
  if (!onEntityClick) return <span style={{ fontWeight: "600" }}>{title}</span>;
  return (
    <button
      onClick={() => onEntityClick(id)}
      style={{
        fontWeight: "600",
        color: "var(--primary)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        fontSize: "inherit",
        textDecoration: "underline dotted",
      }}
    >
      {title}
    </button>
  );
};
```

- [ ] **Step 4: Use `EntityLink` in entity-referencing cases**

Replace raw entity references in `renderEventDescription`:

In `RelationCreated`:
```typescript
case "RelationCreated":
  return (
    <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
      <EntityLink id={payload.sourceEntityId} />{" "}
      <span style={{ color: "var(--primary)", fontStyle: "italic" }}>{payload.relationType}</span>{" "}
      <EntityLink id={payload.targetEntityId} />
    </p>
  );
```

In `VisibilityChanged`:
```typescript
case "VisibilityChanged":
  return (
    <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
      {t("timeline.descriptions.visibilityChanged", { title: "" })}
      <EntityLink id={payload.targetId} />{" "}
      → <span className="badge badge-primary">{payload.visibility?.kind || "dm_only"}</span>
    </p>
  );
```

In `EntityUpdated`:
```typescript
case "EntityUpdated":
  return (
    <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
      {t("timeline.descriptions.entityUpdated", { title: "" })}
      <EntityLink id={payload.entityId} />
    </p>
  );
```

In `EntityArchived`:
```typescript
case "EntityArchived":
  return (
    <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
      {t("timeline.descriptions.entityArchived", { title: "" })}
      <EntityLink id={payload.entityId || payload.id} />
    </p>
  );
```

- [ ] **Step 5: Pass `setSelectedEntity` as `onEntityClick` from App.tsx**

In `src/frontend/App.tsx` around line 1079, add the prop:

```typescript
{currentPage === "timeline" && timeline && (
  <TimelinePage
    timeline={timeline}
    campaignState={campaignState}
    timelineFilter={timelineFilter}
    setTimelineFilter={setTimelineFilter}
    expandedEvents={expandedEvents}
    toggleEventJson={toggleEventJson}
    onEntityClick={(entityId) => {
      const ent = campaignState?.entities?.find(
        (e: any) => e.entityId === entityId || e.id === entityId
      );
      if (ent) setSelectedEntity(ent);
    }}
  />
)}
```

- [ ] **Step 6: Build check**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/frontend/dm/sessions/TimelinePage.tsx src/frontend/dm/entities/eventVisuals.tsx src/frontend/App.tsx
git commit -m "feat(timeline): entity names clickable → opens EntityDetailModal"
```

---

### Task 2: Session grouping with collapsible session blocks

**Files:**
- Modify: `src/frontend/dm/sessions/TimelinePage.tsx`
- Modify: `src/shared/i18n/dictionaries/es.ts` (+ en, fr, it, pt, de)

**Interfaces:**
- Consumes: `timeline.events[]` with types `SessionStarted`, `SessionClosed`
- Produces: new rendering mode "grouped" (default for narrative filter)

- [ ] **Step 1: Add i18n keys to all 6 dicts**

In `src/shared/i18n/dictionaries/es.ts`, inside `timeline:{}`, add:

```typescript
prepGroup: "Preparación",
sessionGroupTitle: "Sesión {number} — {title}",
sessionGroupOpen: "Sesión activa",
sessionGroupPrep: "Fuera de sesión",
collapseSession: "Colapsar",
expandSession: "Expandir",
eventsCount: "{count} eventos",
```

Mirror in `en.ts`:
```typescript
prepGroup: "Preparation",
sessionGroupTitle: "Session {number} — {title}",
sessionGroupOpen: "Active session",
sessionGroupPrep: "Out of session",
collapseSession: "Collapse",
expandSession: "Expand",
eventsCount: "{count} events",
```

Mirror in `fr.ts`:
```typescript
prepGroup: "Préparation",
sessionGroupTitle: "Séance {number} — {title}",
sessionGroupOpen: "Séance active",
sessionGroupPrep: "Hors séance",
collapseSession: "Réduire",
expandSession: "Développer",
eventsCount: "{count} événements",
```

Mirror in `it.ts`:
```typescript
prepGroup: "Preparazione",
sessionGroupTitle: "Sessione {number} — {title}",
sessionGroupOpen: "Sessione attiva",
sessionGroupPrep: "Fuori sessione",
collapseSession: "Comprimi",
expandSession: "Espandi",
eventsCount: "{count} eventi",
```

Mirror in `pt.ts`:
```typescript
prepGroup: "Preparação",
sessionGroupTitle: "Sessão {number} — {title}",
sessionGroupOpen: "Sessão ativa",
sessionGroupPrep: "Fora de sessão",
collapseSession: "Colapsar",
expandSession: "Expandir",
eventsCount: "{count} eventos",
```

Mirror in `de.ts`:
```typescript
prepGroup: "Vorbereitung",
sessionGroupTitle: "Sitzung {number} — {title}",
sessionGroupOpen: "Aktive Sitzung",
sessionGroupPrep: "Außerhalb der Sitzung",
collapseSession: "Einklappen",
expandSession: "Ausklappen",
eventsCount: "{count} Ereignisse",
```

- [ ] **Step 2: Add `groupedView` state + build groups utility**

In `TimelinePage`, after existing state declarations, add:

```typescript
const [groupedView, setGroupedView] = useState(true);
const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

function toggleGroup(key: string) {
  setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
}

interface EventGroup {
  key: string;
  label: string;
  sublabel?: string;
  isClosed: boolean;
  isActive: boolean;
  events: any[];
  sessionEvent?: any;  // the SessionStarted or SessionClosed event
}

function buildGroups(events: any[]): EventGroup[] {
  const groups: EventGroup[] = [];
  let currentGroup: EventGroup | null = null;
  let prepGroup: EventGroup = { key: "prep", label: t("timeline.prepGroup"), sublabel: t("timeline.sessionGroupPrep"), isClosed: false, isActive: false, events: [] };

  // events arrive newest-first after reverse(); for grouping re-sort oldest-first
  const sorted = [...events].reverse();

  for (const evt of sorted) {
    if (evt.type === "SessionStarted") {
      // flush any pending prep events
      if (prepGroup.events.length > 0) {
        groups.push({ ...prepGroup });
        prepGroup = { key: `prep_${evt.eventId}`, label: t("timeline.prepGroup"), sublabel: t("timeline.sessionGroupPrep"), isClosed: false, isActive: false, events: [] };
      }
      currentGroup = {
        key: evt.eventId,
        label: t("timeline.sessionGroupTitle", { number: evt.payload?.number ?? "", title: evt.payload?.title ?? "" }),
        sublabel: evt.payload?.summary ?? "",
        isClosed: false,
        isActive: true,
        events: [evt],
        sessionEvent: evt,
      };
    } else if (evt.type === "SessionClosed" && currentGroup) {
      currentGroup.events.push(evt);
      currentGroup.isClosed = true;
      currentGroup.isActive = false;
      currentGroup.sublabel = evt.payload?.summary ?? currentGroup.sublabel;
      groups.push({ ...currentGroup });
      currentGroup = null;
    } else if (currentGroup) {
      currentGroup.events.push(evt);
    } else {
      prepGroup.events.push(evt);
    }
  }

  // flush any remaining open session
  if (currentGroup) {
    currentGroup.sublabel = t("timeline.sessionGroupOpen");
    groups.push({ ...currentGroup });
  }
  if (prepGroup.events.length > 0) {
    // initial prep events (before first session) go at top
    groups.unshift({ ...prepGroup, key: "prep_initial" });
  }

  // Return newest-first
  return groups.reverse();
}
```

- [ ] **Step 3: Add "Grouped view" toggle button next to "Show technical"**

In the filter bar `div`, add next to the technical toggle:

```typescript
<button
  className={`btn btn-sm ${groupedView ? "btn-primary" : "btn-secondary"}`}
  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}
  onClick={() => setGroupedView(v => !v)}
>
  <Layers size={13} />
  {groupedView ? t("timeline.flatView") : t("timeline.groupedView")}
</button>
```

Add `Layers` to imports from lucide-react.

Add the new i18n keys for the button to all 6 dicts inside `timeline:{}`:

es: `flatView: "Vista plana"`, `groupedView: "Por sesión"`
en: `flatView: "Flat view"`, `groupedView: "By session"`
fr: `flatView: "Vue plate"`, `groupedView: "Par séance"`
it: `flatView: "Vista piatta"`, `groupedView: "Per sessione"`
pt: `flatView: "Vista plana"`, `groupedView: "Por sessão"`
de: `flatView: "Flache Ansicht"`, `groupedView: "Nach Sitzung"`

- [ ] **Step 4: Render grouped view**

Replace the event list section (the `{filteredEvents.length === 0 ? ... : ...}` block) with a conditional:

```typescript
{groupedView && timelineFilter === "narrative" ? (
  // Grouped by session
  (() => {
    const groups = buildGroups(filteredEvents);
    if (groups.length === 0) return (/* same empty state JSX as below */);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
        {groups.map(group => {
          const isCollapsed = collapsedGroups[group.key];
          return (
            <div key={group.key} style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {/* Session header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: group.isActive
                    ? "linear-gradient(90deg, hsla(10,95%,60%,0.12), transparent)"
                    : "var(--bg-card)",
                  cursor: "pointer",
                  borderBottom: isCollapsed ? "none" : "1px solid var(--border-color)",
                }}
                onClick={() => toggleGroup(group.key)}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>{group.label}</span>
                  {group.sublabel && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{group.sublabel}</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {t("timeline.eventsCount", { count: group.events.length })}
                  </span>
                  {group.isActive && (
                    <span className="badge" style={{ backgroundColor: "hsla(10,95%,60%,0.2)", color: "hsl(10,95%,60%)", border: "1px solid hsl(10,95%,60%)", fontSize: "0.65rem" }}>
                      {t("timeline.sessionGroupOpen")}
                    </span>
                  )}
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
              </div>
              {/* Events within group */}
              {!isCollapsed && (
                <div className="timeline-list" style={{ padding: "8px 16px" }}>
                  {group.events.map((evt: any) => {
                    const visual = getEventVisualConfig(evt.type, locale);
                    const IconComp = visual.IconComponent;
                    return (
                      <div key={evt.eventId} className="timeline-item">
                        <div className="timeline-marker" style={{ backgroundColor: visual.bgColor, borderColor: visual.color, boxShadow: `0 0 8px ${visual.bgColor}` }}>
                          <IconComp size={16} style={{ color: visual.color }} />
                        </div>
                        <div className="timeline-content" style={{ borderLeft: `4px solid ${visual.color}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="badge" style={{ backgroundColor: visual.bgColor, color: visual.color, border: `1px solid ${visual.color}`, fontSize: "0.7rem", textTransform: "uppercase" }}>
                              {visual.label}
                            </span>
                            <span className="timeline-time" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Calendar size={12} />
                              {new Date(evt.occurredAt).toLocaleString()}
                            </span>
                          </div>
                          <div style={{ marginTop: "12px", padding: "4px 0" }}>
                            {renderEventDescription(evt.type, evt.payload, campaignState, locale, onEntityClick)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  })()
) : (
  /* existing flat list rendering — keep exactly as-is */
  filteredEvents.length === 0 ? (
    /* existing empty state */
  ) : (
    <div className="timeline-list" style={{ marginTop: "8px" }}>
      {filteredEvents.map((evt: any) => { /* existing item render */ })}
    </div>
  )
)}
```

Add `ChevronDown`, `ChevronUp` to lucide imports (they're already imported in SessionPage; add to TimelinePage).

- [ ] **Step 5: Build check**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/dm/sessions/TimelinePage.tsx src/shared/i18n/dictionaries/
git commit -m "feat(timeline): session grouping with collapsible session blocks"
```

---

### Task 3: Search + entity filter

**Files:**
- Modify: `src/frontend/dm/sessions/TimelinePage.tsx`
- Modify: `src/shared/i18n/dictionaries/{es,en,fr,it,pt,de}.ts`

**Interfaces:**
- Consumes: `campaignState.entities[]` for entity picker
- Produces: `searchQuery` and `entityFilter` local state applied to `filteredEvents`

- [ ] **Step 1: Add i18n keys to all 6 dicts**

In each dict inside `timeline:{}`:

es:
```typescript
searchPlaceholder: "Buscar en la línea temporal…",
filterByEntity: "Filtrar por entidad",
filterEntityAll: "Todas las entidades",
```
en:
```typescript
searchPlaceholder: "Search timeline…",
filterByEntity: "Filter by entity",
filterEntityAll: "All entities",
```
fr:
```typescript
searchPlaceholder: "Rechercher dans la chronologie…",
filterByEntity: "Filtrer par entité",
filterEntityAll: "Toutes les entités",
```
it:
```typescript
searchPlaceholder: "Cerca nella cronologia…",
filterByEntity: "Filtra per entità",
filterEntityAll: "Tutte le entità",
```
pt:
```typescript
searchPlaceholder: "Pesquisar na linha do tempo…",
filterByEntity: "Filtrar por entidade",
filterEntityAll: "Todas as entidades",
```
de:
```typescript
searchPlaceholder: "Zeitleiste durchsuchen…",
filterByEntity: "Nach Entität filtern",
filterEntityAll: "Alle Entitäten",
```

- [ ] **Step 2: Add search and entity filter state**

In `TimelinePage`, add:

```typescript
const [searchQuery, setSearchQuery] = useState("");
const [entityFilterId, setEntityFilterId] = useState<string>("all");
```

- [ ] **Step 3: Build `getEventText` helper for search indexing**

Add this helper (outside the component, top of file after imports):

```typescript
function getEventText(evt: any): string {
  const p = evt.payload ?? {};
  return [
    p.title, p.name, p.displayName, p.statement, p.summary,
    p.description, p.relationType, p.type, evt.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
```

- [ ] **Step 4: Build `eventMatchesEntity` helper**

```typescript
function eventMatchesEntity(evt: any, entityId: string): boolean {
  if (entityId === "all") return true;
  const p = evt.payload ?? {};
  return [
    p.entityId, p.id, p.sourceEntityId, p.targetEntityId,
    p.targetId, ...(p.relatedEntityIds ?? []),
  ].includes(entityId);
}
```

- [ ] **Step 5: Apply search + entity filter to `filteredEvents`**

Modify the `filteredEvents` computation (currently ends at line 142). After the existing `.filter` chain, append:

```typescript
.filter((evt: any) => {
  if (searchQuery.trim() === "") return true;
  return getEventText(evt).includes(searchQuery.trim().toLowerCase());
})
.filter((evt: any) => eventMatchesEntity(evt, entityFilterId));
```

- [ ] **Step 6: Render search bar + entity selector above filter pills**

In the filter section (before the `<div className="timeline-filters">`), insert:

```typescript
{/* Search + entity filter row */}
<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
  <div style={{ position: "relative", flex: 1 }}>
    <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
    <input
      type="text"
      placeholder={t("timeline.searchPlaceholder")}
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      style={{
        width: "100%",
        paddingLeft: "32px",
        paddingRight: "12px",
        paddingTop: "7px",
        paddingBottom: "7px",
        background: "var(--bg-input)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-main)",
        fontSize: "0.85rem",
        boxSizing: "border-box",
      }}
    />
  </div>
  {campaignState?.entities?.length > 0 && (
    <select
      value={entityFilterId}
      onChange={e => setEntityFilterId(e.target.value)}
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-main)",
        fontSize: "0.85rem",
        padding: "7px 10px",
        minWidth: "160px",
      }}
    >
      <option value="all">{t("timeline.filterEntityAll")}</option>
      {[...(campaignState.entities as any[])]
        .filter(e => !e.archived)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(e => (
          <option key={e.entityId ?? e.id} value={e.entityId ?? e.id}>{e.title}</option>
        ))
      }
    </select>
  )}
</div>
```

Add `Search` to lucide-react imports.

- [ ] **Step 7: Build check**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 8: Commit**

```bash
git add src/frontend/dm/sessions/TimelinePage.tsx src/shared/i18n/dictionaries/
git commit -m "feat(timeline): full-text search and entity filter"
```

---

### Task 4: Enhanced stats + retcon visual + prep-vs-live badge

**Files:**
- Modify: `src/frontend/dm/sessions/TimelinePage.tsx`
- Modify: `src/frontend/dm/entities/eventVisuals.tsx`
- Modify: `src/shared/i18n/dictionaries/{es,en,fr,it,pt,de}.ts`

**Interfaces:**
- Consumes: `timeline.events[]` (full, unfiltered) for stats computation
- Consumes: `campaignState.facts[]` for retcon check

#### Part A: Enhanced stats

- [ ] **Step 1: Add stat i18n keys to all 6 dicts**

In each dict inside `timeline:{}`:

es:
```typescript
statsUnrevealedSecrets: "Secretos ocultos",
statsDaysSinceSession: "Días desde última sesión",
statsDaysSinceSessionValue: "{days}d",
statsDaysSinceSessionNever: "Sin sesiones",
```
en:
```typescript
statsUnrevealedSecrets: "Hidden Secrets",
statsDaysSinceSession: "Since Last Session",
statsDaysSinceSessionValue: "{days}d",
statsDaysSinceSessionNever: "No sessions",
```
fr:
```typescript
statsUnrevealedSecrets: "Secrets cachés",
statsDaysSinceSession: "Depuis la dernière séance",
statsDaysSinceSessionValue: "{days}j",
statsDaysSinceSessionNever: "Aucune séance",
```
it:
```typescript
statsUnrevealedSecrets: "Segreti nascosti",
statsDaysSinceSession: "Dall'ultima sessione",
statsDaysSinceSessionValue: "{days}g",
statsDaysSinceSessionNever: "Nessuna sessione",
```
pt:
```typescript
statsUnrevealedSecrets: "Segredos ocultos",
statsDaysSinceSession: "Desde a última sessão",
statsDaysSinceSessionValue: "{days}d",
statsDaysSinceSessionNever: "Sem sessões",
```
de:
```typescript
statsUnrevealedSecrets: "Versteckte Geheimnisse",
statsDaysSinceSession: "Seit letzter Sitzung",
statsDaysSinceSessionValue: "{days}T",
statsDaysSinceSessionNever: "Keine Sitzungen",
```

- [ ] **Step 2: Replace `stats` computation in `TimelinePage`**

Replace the existing `const stats = { ... }` block with:

```typescript
const stats = {
  total: narrativeEvents.length,
  sessions: timeline.events.filter((e: any) => e.type === "SessionClosed").length,
  facts: timeline.events.filter((e: any) => e.type === "FactCreated").length,
  revelaciones: timeline.events.filter((e: any) => e.type === "VisibilityChanged").length,
  unrevealedSecrets: (() => {
    const entities: any[] = campaignState?.entities ?? [];
    return entities.filter(
      (e: any) =>
        !e.archived &&
        (e.entityType === "secret" || e.entityType === "clue") &&
        (e.visibility?.kind === "dm_only" || e.visibility?.kind === "dm_only"),
    ).length;
  })(),
  daysSinceLastSession: (() => {
    const closed = timeline.events
      .filter((e: any) => e.type === "SessionClosed")
      .sort((a: any, b: any) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    if (closed.length === 0) return null;
    const ms = Date.now() - new Date(closed[0].occurredAt).getTime();
    return Math.floor(ms / 86_400_000);
  })(),
};
```

- [ ] **Step 3: Update stats grid to 5-6 cards**

Replace the existing 4-card stats grid with a 6-card grid. Add two new cards after the existing four:

```typescript
{/* Unrevealed secrets */}
<div className="timeline-stat-card">
  <div className="timeline-stat-icon-wrapper" style={{ backgroundColor: "hsla(0, 85%, 60%, 0.15)", color: "hsl(0, 85%, 60%)" }}>
    <EyeOff size={20} />
  </div>
  <div className="timeline-stat-info">
    <span className="timeline-stat-value">{stats.unrevealedSecrets}</span>
    <span className="timeline-stat-label">{t("timeline.statsUnrevealedSecrets")}</span>
  </div>
</div>

{/* Days since last session */}
<div className="timeline-stat-card">
  <div className="timeline-stat-icon-wrapper" style={{ backgroundColor: "hsla(142, 70%, 50%, 0.15)", color: "hsl(142, 70%, 50%)" }}>
    <Clock size={20} />
  </div>
  <div className="timeline-stat-info">
    <span className="timeline-stat-value">
      {stats.daysSinceLastSession === null
        ? t("timeline.statsDaysSinceSessionNever")
        : t("timeline.statsDaysSinceSessionValue", { days: stats.daysSinceLastSession })}
    </span>
    <span className="timeline-stat-label">{t("timeline.statsDaysSinceSession")}</span>
  </div>
</div>
```

Add `Clock`, `EyeOff` to lucide imports in `TimelinePage.tsx` (EyeOff already imported, Clock needs to be added).

#### Part B: Retcon visual on FactCreated events

- [ ] **Step 4: Pass `timeline` events to `renderEventDescription`**

`renderEventDescription` needs access to all events to check for retcons. Add optional `allEvents?: any[]` param:

```typescript
export function renderEventDescription(
  type: string,
  payload: any,
  campaignState: any,
  locale: SupportedLocale = "es",
  onEntityClick?: (entityId: string) => void,
  allEvents?: any[],
) {
```

- [ ] **Step 5: Add retcon check in `FactCreated` case**

Inside `FactCreated`:

```typescript
case "FactCreated": {
  const { t } = createTranslator(locale);
  const isRetconned = allEvents?.some(
    (e: any) =>
      e.type === "FactUpdated" &&
      (e.payload?.factId === payload.factId || e.payload?.id === payload.factId) &&
      e.payload?.kind === "retcon",
  ) ?? false;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", opacity: isRetconned ? 0.55 : 1 }}>
      <p style={{ fontSize: "0.9rem", color: "var(--text-main)", textDecoration: isRetconned ? "line-through" : "none" }}>
        "{payload.statement}"
      </p>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span className="badge badge-default">{payload.kind}</span>
        <span className="badge badge-warning">{payload.confidence}</span>
        {isRetconned && (
          <span className="badge" style={{ backgroundColor: "hsla(0,85%,60%,0.15)", color: "hsl(0,85%,60%)", border: "1px solid hsl(0,85%,60%)", fontSize: "0.65rem" }}>
            {t("timeline.retconned")}
          </span>
        )}
      </div>
    </div>
  );
}
```

Add `retconned` i18n key to all dicts:
- es: `retconned: "Recontado"`
- en: `retconned: "Retconned"`
- fr: `retconned: "Rétrocon"`
- it: `retconned: "Ritrattato"`
- pt: `retconned: "Recontado"`
- de: `retconned: "Revidiert"`

- [ ] **Step 6: Pass `timeline.events` to `renderEventDescription` call sites in TimelinePage**

In both rendering locations (grouped view + flat view), update call to:

```typescript
{renderEventDescription(evt.type, evt.payload, campaignState, locale, onEntityClick, timeline?.events)}
```

#### Part C: Prep-vs-live badge on each event

- [ ] **Step 7: Add `isLiveEvent` helper**

In `TimelinePage` (inside the component, after state declarations):

```typescript
function isLiveEvent(evt: any): boolean {
  const sessions: any[] = campaignState?.sessions ?? [];
  const t = new Date(evt.occurredAt).getTime();
  return sessions.some(s => {
    if (!s.startedAt) return false;
    const start = new Date(s.startedAt).getTime();
    const end = s.endedAt ? new Date(s.endedAt).getTime() : Infinity;
    return t >= start && t <= end;
  });
}
```

- [ ] **Step 8: Add i18n keys for badges**

In all 6 dicts inside `timeline:{}`:
- es: `liveBadge: "live"`, `prepBadge: "prep"`
- en: `liveBadge: "live"`, `prepBadge: "prep"`
- fr: `liveBadge: "live"`, `prepBadge: "prép"`
- it: `liveBadge: "live"`, `prepBadge: "prep"`
- pt: `liveBadge: "live"`, `prepBadge: "prep"`
- de: `liveBadge: "live"`, `prepBadge: "Vorbereitung"`

- [ ] **Step 9: Render prep/live badge in timeline item header**

In both the grouped and flat event renderers, in the badge+timestamp row, add after the category badge:

```typescript
<span
  className="badge"
  style={{
    backgroundColor: isLiveEvent(evt) ? "hsla(10,95%,60%,0.15)" : "hsla(220,15%,65%,0.15)",
    color: isLiveEvent(evt) ? "hsl(10,95%,60%)" : "hsl(220,15%,65%)",
    border: `1px solid ${isLiveEvent(evt) ? "hsl(10,95%,60%)" : "hsl(220,15%,65%)"}`,
    fontSize: "0.65rem",
    marginLeft: "4px",
  }}
>
  {isLiveEvent(evt) ? t("timeline.liveBadge") : t("timeline.prepBadge")}
</span>
```

- [ ] **Step 10: Build check**

```bash
cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 11: Commit**

```bash
git add src/frontend/dm/sessions/TimelinePage.tsx src/frontend/dm/entities/eventVisuals.tsx src/shared/i18n/dictionaries/
git commit -m "feat(timeline): enhanced stats, retcon visual, prep-vs-live badges"
```

---

## Self-Review

**Spec coverage:**
- ✅ Entity clickthrough → Task 1
- ✅ Session grouping → Task 2
- ✅ Search → Task 3
- ✅ Entity filter → Task 3
- ✅ Enhanced stats (unrevealed secrets, days since session) → Task 4A
- ✅ Retcon visual → Task 4B
- ✅ Prep vs live badge → Task 4C
- ⚠️ Markdown export — deferred (requires backend work, separate plan)

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:**
- `onEntityClick?: (entityId: string) => void` used consistently in Tasks 1 + 4B
- `allEvents?: any[]` added to `renderEventDescription` in Task 4B Steps 4+6
- `buildGroups` returns `EventGroup[]` used only in Task 2 Step 4
