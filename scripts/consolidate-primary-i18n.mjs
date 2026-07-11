import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const updates = {
  en: {
    entitiesPage: {
      filters: "Entity filters",
      type: "Type",
      status: "Status",
      allStatuses: "All statuses",
      importanceLabel: "Importance",
      allImportance: "All importance levels",
      visibility: "Visibility",
      allVisibility: "All visibility levels",
      clearFilters: "Clear filters",
      resultCount: "{count} entities",
    },
    boards: {
      ariaLabel: "Campaign boards",
      total: "Total",
      dropHint: "Drop a card here or use Move to.",
      noItems: "No {board} yet.",
      moveTo: "Move to",
      moveLabel: "Move {title} to another status",
      moved: "{title} moved to {status}",
      unknownStatus: "No status",
      tabs: { quests: "Quests", clues: "Clues", consequences: "Consequences", npcs: "NPCs", secrets: "Secrets" },
      statuses: {
        active: "Active", blocked: "Blocked", completed: "Completed", failed: "Failed", abandoned: "Abandoned",
        prepared: "Prepared", hidden: "Hidden", hinted: "Hinted", revealedToOne: "Revealed to one",
        revealedToSome: "Revealed to some", revealed: "Revealed to group", misunderstood: "Misunderstood",
        confirmed: "Confirmed", resolved: "Resolved", obsolete: "Obsolete", pending: "Pending",
        triggered: "Triggered", averted: "Averted", alive: "Alive", deceased: "Deceased", missing: "Missing",
        ally: "Ally", enemy: "Enemy", neutral: "Neutral", dmOnly: "DM only",
      },
    },
    searchPage: {
      resultTypes: { entity: "Entity", fact: "Fact", relation: "Relationship", clue: "Clue", objective: "Objective", note: "Note", rule: "Rule" },
    },
  },
  es: {
    entitiesPage: {
      filters: "Filtros de entidades",
      type: "Tipo",
      status: "Estado",
      allStatuses: "Todos los estados",
      importanceLabel: "Importancia",
      allImportance: "Todas las importancias",
      visibility: "Visibilidad",
      allVisibility: "Todas las visibilidades",
      clearFilters: "Limpiar filtros",
      resultCount: "{count} entidades",
    },
    boards: {
      ariaLabel: "Tableros de campaña",
      total: "Total",
      dropHint: "Suelta una tarjeta aquí o usa Mover a.",
      noItems: "Todavía no hay {board}.",
      moveTo: "Mover a",
      moveLabel: "Mover {title} a otro estado",
      moved: "{title} movido a {status}",
      unknownStatus: "Sin estado",
      tabs: { quests: "Misiones", clues: "Pistas", consequences: "Consecuencias", npcs: "PNJs", secrets: "Secretos" },
      statuses: {
        active: "Activa", blocked: "Bloqueada", completed: "Completada", failed: "Fallida", abandoned: "Abandonada",
        prepared: "Preparada", hidden: "Oculta", hinted: "Insinuada", revealedToOne: "Revelada a uno",
        revealedToSome: "Revelada a algunos", revealed: "Revelada al grupo", misunderstood: "Malinterpretada",
        confirmed: "Confirmada", resolved: "Resuelta", obsolete: "Obsoleta", pending: "Pendiente",
        triggered: "Activada", averted: "Evitada", alive: "Vivo", deceased: "Muerto", missing: "Desaparecido",
        ally: "Aliado", enemy: "Enemigo", neutral: "Neutral", dmOnly: "Solo DM",
      },
    },
    searchPage: {
      resultTypes: { entity: "Entidad", fact: "Hecho", relation: "Relación", clue: "Pista", objective: "Objetivo", note: "Nota", rule: "Regla" },
    },
  },
  fr: {
    entitiesPage: {
      filters: "Filtres des entités", type: "Type", status: "Statut", allStatuses: "Tous les statuts",
      importanceLabel: "Importance", allImportance: "Toutes les importances", visibility: "Visibilité",
      allVisibility: "Toutes les visibilités", clearFilters: "Effacer les filtres", resultCount: "{count} entités",
    },
    boards: {
      ariaLabel: "Tableaux de campagne", total: "Total", dropHint: "Déposez une carte ici ou utilisez Déplacer vers.",
      noItems: "Aucun élément dans {board} pour le moment.", moveTo: "Déplacer vers",
      moveLabel: "Déplacer {title} vers un autre statut", moved: "{title} déplacé vers {status}", unknownStatus: "Sans statut",
      tabs: { quests: "Quêtes", clues: "Indices", consequences: "Conséquences", npcs: "PNJ", secrets: "Secrets" },
      statuses: {
        active: "Active", blocked: "Bloquée", completed: "Terminée", failed: "Échouée", abandoned: "Abandonnée",
        prepared: "Préparée", hidden: "Cachée", hinted: "Suggérée", revealedToOne: "Révélée à un joueur",
        revealedToSome: "Révélée à plusieurs", revealed: "Révélée au groupe", misunderstood: "Mal comprise",
        confirmed: "Confirmée", resolved: "Résolue", obsolete: "Obsolète", pending: "En attente",
        triggered: "Déclenchée", averted: "Évitée", alive: "Vivant", deceased: "Décédé", missing: "Disparu",
        ally: "Allié", enemy: "Ennemi", neutral: "Neutre", dmOnly: "MJ uniquement",
      },
    },
    searchPage: { resultTypes: { entity: "Entité", fact: "Fait", relation: "Relation", clue: "Indice", objective: "Objectif", note: "Note", rule: "Règle" } },
  },
  de: {
    entitiesPage: {
      filters: "Entitätsfilter", type: "Typ", status: "Status", allStatuses: "Alle Status", importanceLabel: "Wichtigkeit",
      allImportance: "Alle Wichtigkeiten", visibility: "Sichtbarkeit", allVisibility: "Alle Sichtbarkeiten",
      clearFilters: "Filter löschen", resultCount: "{count} Entitäten",
    },
    boards: {
      ariaLabel: "Kampagnenboards", total: "Gesamt", dropHint: "Karte hier ablegen oder Verschieben nach verwenden.",
      noItems: "Noch keine Einträge in {board}.", moveTo: "Verschieben nach", moveLabel: "{title} in einen anderen Status verschieben",
      moved: "{title} nach {status} verschoben", unknownStatus: "Ohne Status",
      tabs: { quests: "Quests", clues: "Hinweise", consequences: "Konsequenzen", npcs: "NSC", secrets: "Geheimnisse" },
      statuses: {
        active: "Aktiv", blocked: "Blockiert", completed: "Abgeschlossen", failed: "Gescheitert", abandoned: "Aufgegeben",
        prepared: "Vorbereitet", hidden: "Verborgen", hinted: "Angedeutet", revealedToOne: "Einer Person enthüllt",
        revealedToSome: "Mehreren enthüllt", revealed: "Der Gruppe enthüllt", misunderstood: "Missverstanden",
        confirmed: "Bestätigt", resolved: "Gelöst", obsolete: "Veraltet", pending: "Ausstehend",
        triggered: "Ausgelöst", averted: "Abgewendet", alive: "Lebendig", deceased: "Verstorben", missing: "Verschollen",
        ally: "Verbündet", enemy: "Feind", neutral: "Neutral", dmOnly: "Nur SL",
      },
    },
    searchPage: { resultTypes: { entity: "Entität", fact: "Fakt", relation: "Beziehung", clue: "Hinweis", objective: "Ziel", note: "Notiz", rule: "Regel" } },
  },
  it: {
    entitiesPage: {
      filters: "Filtri entità", type: "Tipo", status: "Stato", allStatuses: "Tutti gli stati", importanceLabel: "Importanza",
      allImportance: "Tutte le importanze", visibility: "Visibilità", allVisibility: "Tutte le visibilità",
      clearFilters: "Cancella filtri", resultCount: "{count} entità",
    },
    boards: {
      ariaLabel: "Bacheche della campagna", total: "Totale", dropHint: "Rilascia una carta qui o usa Sposta in.",
      noItems: "Ancora nessun elemento in {board}.", moveTo: "Sposta in", moveLabel: "Sposta {title} in un altro stato",
      moved: "{title} spostato in {status}", unknownStatus: "Senza stato",
      tabs: { quests: "Missioni", clues: "Indizi", consequences: "Conseguenze", npcs: "PNG", secrets: "Segreti" },
      statuses: {
        active: "Attiva", blocked: "Bloccata", completed: "Completata", failed: "Fallita", abandoned: "Abbandonata",
        prepared: "Preparata", hidden: "Nascosta", hinted: "Suggerita", revealedToOne: "Rivelata a uno",
        revealedToSome: "Rivelata ad alcuni", revealed: "Rivelata al gruppo", misunderstood: "Fraintesa",
        confirmed: "Confermata", resolved: "Risolta", obsolete: "Obsoleta", pending: "In sospeso",
        triggered: "Attivata", averted: "Evitata", alive: "Vivo", deceased: "Morto", missing: "Scomparso",
        ally: "Alleato", enemy: "Nemico", neutral: "Neutrale", dmOnly: "Solo DM",
      },
    },
    searchPage: { resultTypes: { entity: "Entità", fact: "Fatto", relation: "Relazione", clue: "Indizio", objective: "Obiettivo", note: "Nota", rule: "Regola" } },
  },
  pt: {
    entitiesPage: {
      filters: "Filtros de entidades", type: "Tipo", status: "Estado", allStatuses: "Todos os estados", importanceLabel: "Importância",
      allImportance: "Todas as importâncias", visibility: "Visibilidade", allVisibility: "Todas as visibilidades",
      clearFilters: "Limpar filtros", resultCount: "{count} entidades",
    },
    boards: {
      ariaLabel: "Quadros da campanha", total: "Total", dropHint: "Solte um cartão aqui ou use Mover para.",
      noItems: "Ainda não há itens em {board}.", moveTo: "Mover para", moveLabel: "Mover {title} para outro estado",
      moved: "{title} movido para {status}", unknownStatus: "Sem estado",
      tabs: { quests: "Missões", clues: "Pistas", consequences: "Consequências", npcs: "PNJs", secrets: "Segredos" },
      statuses: {
        active: "Ativa", blocked: "Bloqueada", completed: "Concluída", failed: "Falhou", abandoned: "Abandonada",
        prepared: "Preparada", hidden: "Oculta", hinted: "Insinuada", revealedToOne: "Revelada a um",
        revealedToSome: "Revelada a alguns", revealed: "Revelada ao grupo", misunderstood: "Mal interpretada",
        confirmed: "Confirmada", resolved: "Resolvida", obsolete: "Obsoleta", pending: "Pendente",
        triggered: "Ativada", averted: "Evitada", alive: "Vivo", deceased: "Morto", missing: "Desaparecido",
        ally: "Aliado", enemy: "Inimigo", neutral: "Neutro", dmOnly: "Apenas MJ",
      },
    },
    searchPage: { resultTypes: { entity: "Entidade", fact: "Fato", relation: "Relação", clue: "Pista", objective: "Objetivo", note: "Nota", rule: "Regra" } },
  },
};

function render(value, indent) {
  if (typeof value === "string") return JSON.stringify(value);
  const pad = " ".repeat(indent);
  const closePad = " ".repeat(Math.max(0, indent - 2));
  return `{\n${Object.entries(value)
    .map(([key, nested]) => `${pad}${key}: ${render(nested, indent + 2)},`)
    .join("\n")}\n${closePad}}`;
}

function addEntries(source, sectionName, values, sentinel) {
  if (source.includes(sentinel)) return source;
  const marker = `  ${sectionName}: {\n`;
  if (!source.includes(marker)) throw new Error(`Missing section ${sectionName}`);
  const entries = Object.entries(values)
    .map(([key, value]) => `    ${key}: ${render(value, 6)},`)
    .join("\n");
  return source.replace(marker, `${marker}${entries}\n`);
}

for (const [locale, sections] of Object.entries(updates)) {
  const path = `src/shared/i18n/dictionaries/${locale}.ts`;
  let source = readFileSync(path, "utf8");
  source = addEntries(source, "entitiesPage", sections.entitiesPage, "    allStatuses:");
  source = addEntries(source, "boards", sections.boards, "    ariaLabel:");
  source = addEntries(source, "searchPage", sections.searchPage, "    resultTypes:");
  writeFileSync(path, source);
}

unlinkSync("scripts/consolidate-primary-i18n.mjs");
unlinkSync(".github/workflows/consolidate-primary-i18n.yml");
