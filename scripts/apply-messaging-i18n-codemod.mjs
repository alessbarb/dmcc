import { readFileSync, writeFileSync, rmSync } from "node:fs";

const translations = {
  en: {
    tab: "Messages", characterHeading: "Character", notLinked: "No character is linked yet. You can request one from the character screen.", requestSent: "Character request sent", requestAction: "Request character",
    heading: "Campaign messages", playerSubtitle: "Talk with Game Direction and the rest of the group.", dmSubtitle: "Shared channel for Game Direction and players.", loading: "Loading messages…", empty: "There are no messages yet. Start the conversation with the group.", party: "Campaign channel", dm: "Private with Game Direction", player: "Private with a player", select: "Select player…", partyDescription: "Visible to Game Direction and all players.", dmDescription: "Visible only to you and Game Direction.", playerDescription: "Visible only to Game Direction, you, and the selected player.", placeholder: "Write a message…", send: "Send", readBy: "read by", back: "Back to portal", direction: "Game Direction", privateWith: "Private with", privateMessage: "Private message",
  },
  es: {
    tab: "Mensajes", characterHeading: "Personaje", notLinked: "Todavía no hay personaje vinculado. Puedes solicitar uno desde esta pantalla.", requestSent: "Solicitud de personaje enviada", requestAction: "Solicitar personaje",
    heading: "Mensajes de campaña", playerSubtitle: "Habla con Dirección de juego y el resto del grupo.", dmSubtitle: "Canal compartido de Dirección de juego y jugadores.", loading: "Cargando mensajes…", empty: "Todavía no hay mensajes. Abre la conversación con el grupo.", party: "Canal de campaña", dm: "Privado con Dirección de juego", player: "Privado con un jugador", select: "Seleccionar jugador…", partyDescription: "Visible para Dirección de juego y todos los jugadores.", dmDescription: "Solo visible para ti y Dirección de juego.", playerDescription: "Solo visible para Dirección de juego, tú y el jugador seleccionado.", placeholder: "Escribe un mensaje…", send: "Enviar", readBy: "leído por", back: "Volver al portal", direction: "Dirección de juego", privateWith: "Privado con", privateMessage: "Mensaje privado",
  },
  fr: {
    tab: "Messages", characterHeading: "Personnage", notLinked: "Aucun personnage n’est encore lié. Vous pouvez en demander un depuis cet écran.", requestSent: "Demande de personnage envoyée", requestAction: "Demander le personnage",
    heading: "Messages de campagne", playerSubtitle: "Discutez avec la Direction de jeu et le reste du groupe.", dmSubtitle: "Canal partagé entre la Direction de jeu et les joueurs.", loading: "Chargement des messages…", empty: "Aucun message pour le moment. Lancez la conversation avec le groupe.", party: "Canal de campagne", dm: "Privé avec la Direction de jeu", player: "Privé avec un joueur", select: "Sélectionner un joueur…", partyDescription: "Visible par la Direction de jeu et tous les joueurs.", dmDescription: "Visible uniquement par vous et la Direction de jeu.", playerDescription: "Visible uniquement par la Direction de jeu, vous et le joueur sélectionné.", placeholder: "Écrire un message…", send: "Envoyer", readBy: "lu par", back: "Retour au portail", direction: "Direction de jeu", privateWith: "Privé avec", privateMessage: "Message privé",
  },
  de: {
    tab: "Nachrichten", characterHeading: "Charakter", notLinked: "Noch kein Charakter verknüpft. Du kannst auf dieser Seite einen anfragen.", requestSent: "Charakteranfrage gesendet", requestAction: "Charakter anfragen",
    heading: "Kampagnennachrichten", playerSubtitle: "Sprich mit der Spielleitung und der restlichen Gruppe.", dmSubtitle: "Gemeinsamer Kanal für Spielleitung und Spieler.", loading: "Nachrichten werden geladen…", empty: "Noch keine Nachrichten. Starte die Unterhaltung mit der Gruppe.", party: "Kampagnenkanal", dm: "Privat mit der Spielleitung", player: "Privat mit einem Spieler", select: "Spieler auswählen…", partyDescription: "Sichtbar für Spielleitung und alle Spieler.", dmDescription: "Nur für dich und die Spielleitung sichtbar.", playerDescription: "Nur für die Spielleitung, dich und den ausgewählten Spieler sichtbar.", placeholder: "Nachricht schreiben…", send: "Senden", readBy: "gelesen von", back: "Zurück zum Portal", direction: "Spielleitung", privateWith: "Privat mit", privateMessage: "Private Nachricht",
  },
  it: {
    tab: "Messaggi", characterHeading: "Personaggio", notLinked: "Non è ancora collegato alcun personaggio. Puoi richiederne uno da questa schermata.", requestSent: "Richiesta del personaggio inviata", requestAction: "Richiedi personaggio",
    heading: "Messaggi della campagna", playerSubtitle: "Parla con la Direzione di gioco e con il resto del gruppo.", dmSubtitle: "Canale condiviso tra Direzione di gioco e giocatori.", loading: "Caricamento messaggi…", empty: "Non ci sono ancora messaggi. Avvia la conversazione con il gruppo.", party: "Canale della campagna", dm: "Privato con la Direzione di gioco", player: "Privato con un giocatore", select: "Seleziona giocatore…", partyDescription: "Visibile alla Direzione di gioco e a tutti i giocatori.", dmDescription: "Visibile solo a te e alla Direzione di gioco.", playerDescription: "Visibile solo alla Direzione di gioco, a te e al giocatore selezionato.", placeholder: "Scrivi un messaggio…", send: "Invia", readBy: "letto da", back: "Torna al portale", direction: "Direzione di gioco", privateWith: "Privato con", privateMessage: "Messaggio privato",
  },
  pt: {
    tab: "Mensagens", characterHeading: "Personagem", notLinked: "Ainda não há personagem associado. Pode solicitar um neste ecrã.", requestSent: "Pedido de personagem enviado", requestAction: "Solicitar personagem",
    heading: "Mensagens da campanha", playerSubtitle: "Fale com a Direção de jogo e com o resto do grupo.", dmSubtitle: "Canal partilhado entre Direção de jogo e jogadores.", loading: "A carregar mensagens…", empty: "Ainda não há mensagens. Inicie a conversa com o grupo.", party: "Canal da campanha", dm: "Privado com a Direção de jogo", player: "Privado com um jogador", select: "Selecionar jogador…", partyDescription: "Visível para a Direção de jogo e todos os jogadores.", dmDescription: "Visível apenas para si e para a Direção de jogo.", playerDescription: "Visível apenas para a Direção de jogo, para si e para o jogador selecionado.", placeholder: "Escreva uma mensagem…", send: "Enviar", readBy: "lido por", back: "Voltar ao portal", direction: "Direção de jogo", privateWith: "Privado com", privateMessage: "Mensagem privada",
  },
};

for (const [locale, value] of Object.entries(translations)) {
  const path = `src/shared/i18n/dictionaries/${locale}.ts`;
  let source = readFileSync(path, "utf8");
  const start = source.indexOf("  playerPortal: {");
  const end = source.indexOf("  entityDetail: {", start);
  if (start < 0 || end < 0) throw new Error(`playerPortal block not found in ${locale}`);
  let block = source.slice(start, end);
  block = block.replace(/      proposals: "[^"]+",\n/, `      messages: ${JSON.stringify(value.tab)},\n`);
  block = block.replace(/      noProposalsYet: "[^"]+",\n/, "");
  block = block.replace(
    /    character: \{ heading: "[^"]+", notLinked: "[^"]+" \},/,
    `    character: {\n      heading: ${JSON.stringify(value.characterHeading)},\n      notLinked: ${JSON.stringify(value.notLinked)},\n      requestSent: ${JSON.stringify(value.requestSent)},\n      requestAction: ${JSON.stringify(value.requestAction)},\n    },`,
  );
  block = block.replace(
    /    proposals: \{[\s\S]*?\n    \},\n    characterSheet:/,
    `    messaging: {\n      heading: ${JSON.stringify(value.heading)},\n      playerSubtitle: ${JSON.stringify(value.playerSubtitle)},\n      dmSubtitle: ${JSON.stringify(value.dmSubtitle)},\n      loading: ${JSON.stringify(value.loading)},\n      empty: ${JSON.stringify(value.empty)},\n      channelParty: ${JSON.stringify(value.party)},\n      channelDm: ${JSON.stringify(value.dm)},\n      channelPlayer: ${JSON.stringify(value.player)},\n      selectPlayer: ${JSON.stringify(value.select)},\n      partyDescription: ${JSON.stringify(value.partyDescription)},\n      dmDescription: ${JSON.stringify(value.dmDescription)},\n      playerDescription: ${JSON.stringify(value.playerDescription)},\n      placeholder: ${JSON.stringify(value.placeholder)},\n      send: ${JSON.stringify(value.send)},\n      readBy: ${JSON.stringify(value.readBy)},\n      backToPortal: ${JSON.stringify(value.back)},\n      directionName: ${JSON.stringify(value.direction)},\n      privateWith: ${JSON.stringify(value.privateWith)},\n      privateMessage: ${JSON.stringify(value.privateMessage)},\n    },\n    characterSheet:`,
  );
  if (block.includes("proposals:")) throw new Error(`Legacy proposal translations remain in ${locale}`);
  source = source.slice(0, start) + block + source.slice(end);
  writeFileSync(path, source);
}

rmSync("scripts/apply-messaging-i18n-codemod.mjs");
rmSync(".github/workflows/apply-messaging-i18n-codemod.yml");
