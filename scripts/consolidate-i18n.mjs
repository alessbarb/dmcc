import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const translations = {
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
    playerPortal: {
      eyebrow: "Player portal",
      back: "Portal",
      switchCampaign: "Switch campaign",
      account: "Account",
      signOut: "Sign out",
      navigationLabel: "Player portal sections",
      refresh: "Refresh",
      campaign: "Campaign",
      tabs: { home: "Home", recap: "Recap", character: "Character", memory: "Memory", constellation: "Constellation", objectives: "Objectives", notes: "Notes", proposals: "Proposals" },
      beforePlay: "Before playing",
      noRecap: "No recap has been shared yet.",
      memories: "memories",
      facts: "facts",
      searchLabel: "Search what your character knows",
      searchPlaceholder: "NPC, clue, place, objective…",
      noVisibleSummary: "No visible summary.",
      noVisibleContent: "No visible content.",
      knownMemory: "Known memory",
      knownMemoryDescription: "Only information authorized for your character and table is shown.",
      nothingYet: "Nothing yet.",
      knownFacts: "Known facts",
      noKnownFacts: "No visible facts yet.",
      knownRelations: "Known relationships",
      noKnownRelations: "No visible relationships yet.",
      knownRelationship: "known relationship",
      noLinkedCharacter: "No character is linked yet. You can send a proposal to the DM.",
      noObjectives: "There are no open objectives.",
      notesTitle: "Personal notes",
      notePlaceholder: "Write something you want to remember…",
      saveNote: "Save note",
      noNotes: "No notes yet.",
      proposalsTitle: "Propose to the DM",
      proposalPlaceholder: "Theory, question, recap correction, or character idea…",
      sendProposal: "Send proposal",
      noProposals: "No proposals sent.",
      constellationLoading: "Loading constellation…",
      noConstellations: "No public constellations are available yet.",
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
    playerPortal: {
      eyebrow: "Portal jugador",
      back: "Portal",
      switchCampaign: "Cambiar campaña",
      account: "Cuenta",
      signOut: "Salir",
      navigationLabel: "Secciones del portal jugador",
      refresh: "Actualizar",
      campaign: "Campaña",
      tabs: { home: "Inicio", recap: "Recap", character: "Personaje", memory: "Memoria", constellation: "Constelación", objectives: "Objetivos", notes: "Notas", proposals: "Propuestas" },
      beforePlay: "Antes de jugar",
      noRecap: "Todavía no hay recap compartido.",
      memories: "recuerdos",
      facts: "hechos",
      searchLabel: "Buscar en lo que sabe tu personaje",
      searchPlaceholder: "PNJ, pista, lugar, objetivo…",
      noVisibleSummary: "Sin resumen visible.",
      noVisibleContent: "Sin contenido visible.",
      knownMemory: "Memoria conocida",
      knownMemoryDescription: "Solo aparece información autorizada para tu personaje y tu mesa.",
      nothingYet: "Nada por ahora.",
      knownFacts: "Hechos conocidos",
      noKnownFacts: "No hay hechos visibles todavía.",
      knownRelations: "Relaciones conocidas",
      noKnownRelations: "No hay relaciones visibles todavía.",
      knownRelationship: "relación conocida",
      noLinkedCharacter: "Todavía no hay personaje vinculado. Puedes enviar una propuesta al DM.",
      noObjectives: "No hay objetivos abiertos.",
      notesTitle: "Notas personales",
      notePlaceholder: "Apunta algo que quieras recordar…",
      saveNote: "Guardar nota",
      noNotes: "Sin notas todavía.",
      proposalsTitle: "Proponer al DM",
      proposalPlaceholder: "Teoría, pregunta, corrección de recap o idea de personaje…",
      sendProposal: "Enviar propuesta",
      noProposals: "Sin propuestas enviadas.",
      constellationLoading: "Cargando constelación…",
      noConstellations: "No hay constelaciones públicas disponibles todavía.",
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
    playerPortal: {
      eyebrow: "Portail joueur", back: "Portail", switchCampaign: "Changer de campagne", account: "Compte", signOut: "Se déconnecter",
      navigationLabel: "Sections du portail joueur", refresh: "Actualiser", campaign: "Campagne",
      tabs: { home: "Accueil", recap: "Récapitulatif", character: "Personnage", memory: "Mémoire", constellation: "Constellation", objectives: "Objectifs", notes: "Notes", proposals: "Propositions" },
      beforePlay: "Avant de jouer", noRecap: "Aucun récapitulatif n'a encore été partagé.", memories: "souvenirs", facts: "faits",
      searchLabel: "Rechercher dans les connaissances de votre personnage", searchPlaceholder: "PNJ, indice, lieu, objectif…",
      noVisibleSummary: "Aucun résumé visible.", noVisibleContent: "Aucun contenu visible.", knownMemory: "Mémoire connue",
      knownMemoryDescription: "Seules les informations autorisées pour votre personnage et votre table sont affichées.", nothingYet: "Rien pour le moment.",
      knownFacts: "Faits connus", noKnownFacts: "Aucun fait visible pour le moment.", knownRelations: "Relations connues",
      noKnownRelations: "Aucune relation visible pour le moment.", knownRelationship: "relation connue",
      noLinkedCharacter: "Aucun personnage n'est encore lié. Vous pouvez envoyer une proposition au MJ.", noObjectives: "Aucun objectif ouvert.",
      notesTitle: "Notes personnelles", notePlaceholder: "Écrivez quelque chose à retenir…", saveNote: "Enregistrer la note", noNotes: "Aucune note.",
      proposalsTitle: "Proposer au MJ", proposalPlaceholder: "Théorie, question, correction du récapitulatif ou idée de personnage…",
      sendProposal: "Envoyer la proposition", noProposals: "Aucune proposition envoyée.", constellationLoading: "Chargement de la constellation…",
      noConstellations: "Aucune constellation publique n'est disponible.",
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
    playerPortal: {
      eyebrow: "Spielerportal", back: "Portal", switchCampaign: "Kampagne wechseln", account: "Konto", signOut: "Abmelden",
      navigationLabel: "Bereiche des Spielerportals", refresh: "Aktualisieren", campaign: "Kampagne",
      tabs: { home: "Start", recap: "Rückblick", character: "Charakter", memory: "Erinnerung", constellation: "Konstellation", objectives: "Ziele", notes: "Notizen", proposals: "Vorschläge" },
      beforePlay: "Vor dem Spiel", noRecap: "Noch kein Rückblick geteilt.", memories: "Erinnerungen", facts: "Fakten",
      searchLabel: "Im Wissen deines Charakters suchen", searchPlaceholder: "NSC, Hinweis, Ort, Ziel…",
      noVisibleSummary: "Keine sichtbare Zusammenfassung.", noVisibleContent: "Kein sichtbarer Inhalt.", knownMemory: "Bekanntes Wissen",
      knownMemoryDescription: "Es werden nur für deinen Charakter und deine Runde freigegebene Informationen angezeigt.", nothingYet: "Noch nichts.",
      knownFacts: "Bekannte Fakten", noKnownFacts: "Noch keine sichtbaren Fakten.", knownRelations: "Bekannte Beziehungen",
      noKnownRelations: "Noch keine sichtbaren Beziehungen.", knownRelationship: "bekannte Beziehung",
      noLinkedCharacter: "Noch kein Charakter verknüpft. Du kannst der SL einen Vorschlag senden.", noObjectives: "Keine offenen Ziele.",
      notesTitle: "Persönliche Notizen", notePlaceholder: "Notiere etwas, das du behalten möchtest…", saveNote: "Notiz speichern", noNotes: "Noch keine Notizen.",
      proposalsTitle: "Der SL vorschlagen", proposalPlaceholder: "Theorie, Frage, Rückblickkorrektur oder Charakteridee…",
      sendProposal: "Vorschlag senden", noProposals: "Noch keine Vorschläge.", constellationLoading: "Konstellation wird geladen…",
      noConstellations: "Noch keine öffentlichen Konstellationen verfügbar.",
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
    playerPortal: {
      eyebrow: "Portale giocatore", back: "Portale", switchCampaign: "Cambia campagna", account: "Account", signOut: "Esci",
      navigationLabel: "Sezioni del portale giocatore", refresh: "Aggiorna", campaign: "Campagna",
      tabs: { home: "Inizio", recap: "Riepilogo", character: "Personaggio", memory: "Memoria", constellation: "Costellazione", objectives: "Obiettivi", notes: "Note", proposals: "Proposte" },
      beforePlay: "Prima di giocare", noRecap: "Non è stato ancora condiviso alcun riepilogo.", memories: "ricordi", facts: "fatti",
      searchLabel: "Cerca nelle conoscenze del personaggio", searchPlaceholder: "PNG, indizio, luogo, obiettivo…",
      noVisibleSummary: "Nessun riepilogo visibile.", noVisibleContent: "Nessun contenuto visibile.", knownMemory: "Memoria conosciuta",
      knownMemoryDescription: "Sono mostrate solo le informazioni autorizzate per il personaggio e il tavolo.", nothingYet: "Ancora nulla.",
      knownFacts: "Fatti conosciuti", noKnownFacts: "Nessun fatto visibile.", knownRelations: "Relazioni conosciute",
      noKnownRelations: "Nessuna relazione visibile.", knownRelationship: "relazione conosciuta",
      noLinkedCharacter: "Nessun personaggio collegato. Puoi inviare una proposta al DM.", noObjectives: "Nessun obiettivo aperto.",
      notesTitle: "Note personali", notePlaceholder: "Scrivi qualcosa da ricordare…", saveNote: "Salva nota", noNotes: "Nessuna nota.",
      proposalsTitle: "Proponi al DM", proposalPlaceholder: "Teoria, domanda, correzione del riepilogo o idea del personaggio…",
      sendProposal: "Invia proposta", noProposals: "Nessuna proposta inviata.", constellationLoading: "Caricamento costellazione…",
      noConstellations: "Nessuna costellazione pubblica disponibile.",
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
    playerPortal: {
      eyebrow: "Portal do jogador", back: "Portal", switchCampaign: "Trocar campanha", account: "Conta", signOut: "Sair",
      navigationLabel: "Seções do portal do jogador", refresh: "Atualizar", campaign: "Campanha",
      tabs: { home: "Início", recap: "Resumo", character: "Personagem", memory: "Memória", constellation: "Constelação", objectives: "Objetivos", notes: "Notas", proposals: "Propostas" },
      beforePlay: "Antes de jogar", noRecap: "Nenhum resumo foi compartilhado ainda.", memories: "memórias", facts: "fatos",
      searchLabel: "Buscar no que seu personagem sabe", searchPlaceholder: "PNJ, pista, lugar, objetivo…",
      noVisibleSummary: "Sem resumo visível.", noVisibleContent: "Sem conteúdo visível.", knownMemory: "Memória conhecida",
      knownMemoryDescription: "Apenas informações autorizadas para seu personagem e mesa são exibidas.", nothingYet: "Nada por enquanto.",
      knownFacts: "Fatos conhecidos", noKnownFacts: "Ainda não há fatos visíveis.", knownRelations: "Relações conhecidas",
      noKnownRelations: "Ainda não há relações visíveis.", knownRelationship: "relação conhecida",
      noLinkedCharacter: "Nenhum personagem está vinculado. Você pode enviar uma proposta ao MJ.", noObjectives: "Não há objetivos abertos.",
      notesTitle: "Notas pessoais", notePlaceholder: "Escreva algo que deseja lembrar…", saveNote: "Salvar nota", noNotes: "Ainda não há notas.",
      proposalsTitle: "Propor ao MJ", proposalPlaceholder: "Teoria, pergunta, correção do resumo ou ideia de personagem…",
      sendProposal: "Enviar proposta", noProposals: "Nenhuma proposta enviada.", constellationLoading: "Carregando constelação…",
      noConstellations: "Nenhuma constelação pública disponível.",
    },
    searchPage: { resultTypes: { entity: "Entidade", fact: "Fato", relation: "Relação", clue: "Pista", objective: "Objetivo", note: "Nota", rule: "Regra" } },
  },
};

function toTs(value, indent) {
  const padding = " ".repeat(indent);
  if (typeof value === "string") return JSON.stringify(value);
  const lines = Object.entries(value).map(([key, nested]) => {
    if (typeof nested === "string") return `${padding}${key}: ${JSON.stringify(nested)},`;
    return `${padding}${key}: ${toTs(nested, indent + 2)},`;
  });
  return `{\n${lines.join("\n")}\n${" ".repeat(indent - 2)}}`;
}

function insertSection(source, sectionName, values, sentinel) {
  if (source.includes(sentinel)) return source;
  const marker = `  ${sectionName}: {\n`;
  if (!source.includes(marker)) throw new Error(`Missing ${sectionName} marker`);
  const lines = Object.entries(values).map(([key, value]) => {
    if (typeof value === "string") return `    ${key}: ${JSON.stringify(value)},`;
    return `    ${key}: ${toTs(value, 6)},`;
  });
  return source.replace(marker, `${marker}${lines.join("\n")}\n`);
}

for (const [locale, sections] of Object.entries(translations)) {
  const path = `src/shared/i18n/dictionaries/${locale}.ts`;
  let source = readFileSync(path, "utf8");
  source = insertSection(source, "entitiesPage", sections.entitiesPage, "allStatuses:");
  source = insertSection(source, "boards", sections.boards, "ariaLabel:");
  source = insertSection(source, "playerPortal", sections.playerPortal, "navigationLabel:");
  source = insertSection(source, "searchPage", sections.searchPage, "resultTypes:");
  writeFileSync(path, source);
}

unlinkSync("scripts/consolidate-i18n.mjs");
unlinkSync(".github/workflows/consolidate-i18n.yml");
