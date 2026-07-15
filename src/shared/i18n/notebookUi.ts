import type { SupportedLocale } from "./index.js";

export interface NotebookUiCopy {
  title: string;
  addRoot: string;
  newRootName: string;
  newChildName: string;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  emptyTree: string;
  noDescription: string;
  addChild: string;
  archive: string;
  confirmArchive: string;
  items: string;
  addItem: string;
  selectResource: string;
  resourceType: string;
  resourceSelect: string;
  selectOption: string;
  link: string;
  cancel: string;
  save: string;
  emptyItems: string;
  selectPlaceholderTitle: string;
  selectPlaceholderDesc: string;
  createSuccess: string;
  createError: string;
  updateSuccess: string;
  updateError: string;
  archiveSuccess: string;
  archiveError: string;
  itemAddedSuccess: string;
  itemAddError: string;
  itemRemovedSuccess: string;
  itemRemoveError: string;
  reorderError: string;
  genericError: string;
  typeEntity: string;
  typeSession: string;
  typeCanvas: string;
  moveUp: string;
  moveDown: string;
  removeItem: string;
  editNotebook: string;
}

export const notebookUiCopy: Record<SupportedLocale, NotebookUiCopy> = {
  en: {
    title: "Notebooks", addRoot: "Create root notebook", newRootName: "New root notebook", newChildName: "New sub-notebook",
    titlePlaceholder: "Notebook title", descriptionPlaceholder: "Add a description", emptyTree: "No notebooks created yet.",
    noDescription: "No description.", addChild: "Create sub-notebook", archive: "Archive notebook",
    confirmArchive: "Archive this notebook? Nested notebooks will also become inaccessible.", items: "Linked items", addItem: "Add item",
    selectResource: "Link campaign resource", resourceType: "Resource type", resourceSelect: "Resource", selectOption: "Select",
    link: "Link", cancel: "Cancel", save: "Save", emptyItems: "No items in this notebook yet.",
    selectPlaceholderTitle: "Manage campaign notebooks", selectPlaceholderDesc: "Create hierarchical notebooks to organize campaign entities, sessions, and canvases.",
    createSuccess: "Notebook created successfully", createError: "Could not create the notebook.", updateSuccess: "Notebook updated successfully",
    updateError: "Could not update the notebook.", archiveSuccess: "Notebook archived successfully", archiveError: "Could not archive the notebook.",
    itemAddedSuccess: "Item added to notebook", itemAddError: "Could not add the item.", itemRemovedSuccess: "Item removed from notebook",
    itemRemoveError: "Could not remove the item.", reorderError: "Could not reorder the items.", genericError: "An unexpected error occurred.",
    typeEntity: "Entity", typeSession: "Session", typeCanvas: "Canvas", moveUp: "Move up", moveDown: "Move down",
    removeItem: "Remove item", editNotebook: "Edit notebook",
  },
  es: {
    title: "Cuadernos", addRoot: "Crear cuaderno raíz", newRootName: "Nuevo cuaderno raíz", newChildName: "Nuevo subcuaderno",
    titlePlaceholder: "Título del cuaderno", descriptionPlaceholder: "Añade una descripción", emptyTree: "Todavía no hay cuadernos.",
    noDescription: "Sin descripción.", addChild: "Crear subcuaderno", archive: "Archivar cuaderno",
    confirmArchive: "¿Archivar este cuaderno? Sus subcuadernos también dejarán de estar accesibles.", items: "Elementos vinculados", addItem: "Añadir elemento",
    selectResource: "Vincular recurso de campaña", resourceType: "Tipo de recurso", resourceSelect: "Recurso", selectOption: "Seleccionar",
    link: "Vincular", cancel: "Cancelar", save: "Guardar", emptyItems: "Todavía no hay elementos en este cuaderno.",
    selectPlaceholderTitle: "Gestiona los cuadernos de campaña", selectPlaceholderDesc: "Crea cuadernos jerárquicos para organizar entidades, sesiones y canvas de la campaña.",
    createSuccess: "Cuaderno creado correctamente", createError: "No se pudo crear el cuaderno.", updateSuccess: "Cuaderno actualizado correctamente",
    updateError: "No se pudo actualizar el cuaderno.", archiveSuccess: "Cuaderno archivado correctamente", archiveError: "No se pudo archivar el cuaderno.",
    itemAddedSuccess: "Elemento añadido al cuaderno", itemAddError: "No se pudo añadir el elemento.", itemRemovedSuccess: "Elemento eliminado del cuaderno",
    itemRemoveError: "No se pudo eliminar el elemento.", reorderError: "No se pudieron reordenar los elementos.", genericError: "Se produjo un error inesperado.",
    typeEntity: "Entidad", typeSession: "Sesión", typeCanvas: "Canvas", moveUp: "Subir", moveDown: "Bajar",
    removeItem: "Eliminar elemento", editNotebook: "Editar cuaderno",
  },
  fr: {
    title: "Carnets", addRoot: "Créer un carnet racine", newRootName: "Nouveau carnet racine", newChildName: "Nouveau sous-carnet",
    titlePlaceholder: "Titre du carnet", descriptionPlaceholder: "Ajouter une description", emptyTree: "Aucun carnet pour le moment.",
    noDescription: "Aucune description.", addChild: "Créer un sous-carnet", archive: "Archiver le carnet",
    confirmArchive: "Archiver ce carnet ? Ses sous-carnets deviendront également inaccessibles.", items: "Éléments liés", addItem: "Ajouter un élément",
    selectResource: "Lier une ressource de campagne", resourceType: "Type de ressource", resourceSelect: "Ressource", selectOption: "Sélectionner",
    link: "Lier", cancel: "Annuler", save: "Enregistrer", emptyItems: "Aucun élément dans ce carnet.",
    selectPlaceholderTitle: "Gérer les carnets de campagne", selectPlaceholderDesc: "Créez des carnets hiérarchiques pour organiser les entités, sessions et canevas de la campagne.",
    createSuccess: "Carnet créé", createError: "Impossible de créer le carnet.", updateSuccess: "Carnet mis à jour",
    updateError: "Impossible de mettre à jour le carnet.", archiveSuccess: "Carnet archivé", archiveError: "Impossible d’archiver le carnet.",
    itemAddedSuccess: "Élément ajouté au carnet", itemAddError: "Impossible d’ajouter l’élément.", itemRemovedSuccess: "Élément retiré du carnet",
    itemRemoveError: "Impossible de retirer l’élément.", reorderError: "Impossible de réordonner les éléments.", genericError: "Une erreur inattendue s’est produite.",
    typeEntity: "Entité", typeSession: "Session", typeCanvas: "Canevas", moveUp: "Monter", moveDown: "Descendre",
    removeItem: "Retirer l’élément", editNotebook: "Modifier le carnet",
  },
  de: {
    title: "Notizbücher", addRoot: "Stammnotizbuch erstellen", newRootName: "Neues Stammnotizbuch", newChildName: "Neues Unternotizbuch",
    titlePlaceholder: "Titel des Notizbuchs", descriptionPlaceholder: "Beschreibung hinzufügen", emptyTree: "Noch keine Notizbücher vorhanden.",
    noDescription: "Keine Beschreibung.", addChild: "Unternotizbuch erstellen", archive: "Notizbuch archivieren",
    confirmArchive: "Dieses Notizbuch archivieren? Untergeordnete Notizbücher sind dann ebenfalls nicht mehr zugänglich.", items: "Verknüpfte Elemente", addItem: "Element hinzufügen",
    selectResource: "Kampagnenressource verknüpfen", resourceType: "Ressourcentyp", resourceSelect: "Ressource", selectOption: "Auswählen",
    link: "Verknüpfen", cancel: "Abbrechen", save: "Speichern", emptyItems: "Dieses Notizbuch enthält noch keine Elemente.",
    selectPlaceholderTitle: "Kampagnen-Notizbücher verwalten", selectPlaceholderDesc: "Erstelle hierarchische Notizbücher für Kampagnenentitäten, Sitzungen und Canvas.",
    createSuccess: "Notizbuch erstellt", createError: "Notizbuch konnte nicht erstellt werden.", updateSuccess: "Notizbuch aktualisiert",
    updateError: "Notizbuch konnte nicht aktualisiert werden.", archiveSuccess: "Notizbuch archiviert", archiveError: "Notizbuch konnte nicht archiviert werden.",
    itemAddedSuccess: "Element zum Notizbuch hinzugefügt", itemAddError: "Element konnte nicht hinzugefügt werden.", itemRemovedSuccess: "Element aus dem Notizbuch entfernt",
    itemRemoveError: "Element konnte nicht entfernt werden.", reorderError: "Elemente konnten nicht neu sortiert werden.", genericError: "Ein unerwarteter Fehler ist aufgetreten.",
    typeEntity: "Entität", typeSession: "Sitzung", typeCanvas: "Canvas", moveUp: "Nach oben", moveDown: "Nach unten",
    removeItem: "Element entfernen", editNotebook: "Notizbuch bearbeiten",
  },
  it: {
    title: "Quaderni", addRoot: "Crea quaderno principale", newRootName: "Nuovo quaderno principale", newChildName: "Nuovo sottoquaderno",
    titlePlaceholder: "Titolo del quaderno", descriptionPlaceholder: "Aggiungi una descrizione", emptyTree: "Non ci sono ancora quaderni.",
    noDescription: "Nessuna descrizione.", addChild: "Crea sottoquaderno", archive: "Archivia quaderno",
    confirmArchive: "Archiviare questo quaderno? Anche i sottoquaderni non saranno più accessibili.", items: "Elementi collegati", addItem: "Aggiungi elemento",
    selectResource: "Collega risorsa della campagna", resourceType: "Tipo di risorsa", resourceSelect: "Risorsa", selectOption: "Seleziona",
    link: "Collega", cancel: "Annulla", save: "Salva", emptyItems: "Non ci sono ancora elementi in questo quaderno.",
    selectPlaceholderTitle: "Gestisci i quaderni della campagna", selectPlaceholderDesc: "Crea quaderni gerarchici per organizzare entità, sessioni e canvas della campagna.",
    createSuccess: "Quaderno creato", createError: "Impossibile creare il quaderno.", updateSuccess: "Quaderno aggiornato",
    updateError: "Impossibile aggiornare il quaderno.", archiveSuccess: "Quaderno archiviato", archiveError: "Impossibile archiviare il quaderno.",
    itemAddedSuccess: "Elemento aggiunto al quaderno", itemAddError: "Impossibile aggiungere l’elemento.", itemRemovedSuccess: "Elemento rimosso dal quaderno",
    itemRemoveError: "Impossibile rimuovere l’elemento.", reorderError: "Impossibile riordinare gli elementi.", genericError: "Si è verificato un errore imprevisto.",
    typeEntity: "Entità", typeSession: "Sessione", typeCanvas: "Canvas", moveUp: "Sposta su", moveDown: "Sposta giù",
    removeItem: "Rimuovi elemento", editNotebook: "Modifica quaderno",
  },
  pt: {
    title: "Cadernos", addRoot: "Criar caderno principal", newRootName: "Novo caderno principal", newChildName: "Novo subcaderno",
    titlePlaceholder: "Título do caderno", descriptionPlaceholder: "Adicionar uma descrição", emptyTree: "Ainda não existem cadernos.",
    noDescription: "Sem descrição.", addChild: "Criar subcaderno", archive: "Arquivar caderno",
    confirmArchive: "Arquivar este caderno? Os subcadernos também deixarão de estar acessíveis.", items: "Elementos associados", addItem: "Adicionar elemento",
    selectResource: "Associar recurso da campanha", resourceType: "Tipo de recurso", resourceSelect: "Recurso", selectOption: "Selecionar",
    link: "Associar", cancel: "Cancelar", save: "Guardar", emptyItems: "Ainda não existem elementos neste caderno.",
    selectPlaceholderTitle: "Gerir cadernos da campanha", selectPlaceholderDesc: "Crie cadernos hierárquicos para organizar entidades, sessões e canvas da campanha.",
    createSuccess: "Caderno criado", createError: "Não foi possível criar o caderno.", updateSuccess: "Caderno atualizado",
    updateError: "Não foi possível atualizar o caderno.", archiveSuccess: "Caderno arquivado", archiveError: "Não foi possível arquivar o caderno.",
    itemAddedSuccess: "Elemento adicionado ao caderno", itemAddError: "Não foi possível adicionar o elemento.", itemRemovedSuccess: "Elemento removido do caderno",
    itemRemoveError: "Não foi possível remover o elemento.", reorderError: "Não foi possível reordenar os elementos.", genericError: "Ocorreu um erro inesperado.",
    typeEntity: "Entidade", typeSession: "Sessão", typeCanvas: "Canvas", moveUp: "Mover para cima", moveDown: "Mover para baixo",
    removeItem: "Remover elemento", editNotebook: "Editar caderno",
  },
};
