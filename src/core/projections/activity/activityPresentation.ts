import type { CampaignActivityData } from "./activityTypes.js";

export interface ActivityVisualConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

export function getActivityVisualConfig(
  type: string,
  data: CampaignActivityData,
  locale: "es" | "en"
): ActivityVisualConfig {
  const isEs = locale === "es";
  
  let label = isEs ? "Otro" : "Other";
  let color = "hsl(220, 15%, 65%)";
  let bgColor = "hsla(220, 15%, 65%, 0.15)";
  let icon = "HelpCircle";
  let description = isEs ? "Actividad registrada" : "Activity recorded";

  switch (type) {
    case "campaign.created":
      label = isEs ? "Campaña" : "Campaign";
      color = "hsl(255, 85%, 65%)";
      bgColor = "hsla(255, 85%, 65%, 0.15)";
      icon = "BookOpen";
      description = isEs 
        ? `Campaña "${data.title || ""}" inicializada.` 
        : `Campaign "${data.title || ""}" initialized.`;
      break;
    case "campaign.updated":
      label = isEs ? "Campaña" : "Campaign";
      color = "hsl(255, 85%, 65%)";
      bgColor = "hsla(255, 85%, 65%, 0.15)";
      icon = "Settings";
      description = isEs 
        ? `Ajustes de campaña actualizados: ${data.title || ""}.` 
        : `Campaign settings updated: ${data.title || ""}.`;
      break;
    case "player.profile.created":
      label = isEs ? "Jugador" : "Player";
      color = "hsl(195, 95%, 50%)";
      bgColor = "hsla(195, 95%, 50%, 0.15)";
      icon = "UserPlus";
      description = isEs 
        ? `El jugador ${data.displayName || data.name} se ha unido.` 
        : `Player ${data.displayName || data.name} has joined.`;
      break;
    case "player.profile.updated":
      label = isEs ? "Jugador" : "Player";
      color = "hsl(195, 95%, 50%)";
      bgColor = "hsla(195, 95%, 50%, 0.15)";
      icon = "UserCheck";
      description = isEs 
        ? `Perfil del jugador ${data.displayName || data.name} actualizado.` 
        : `Player profile of ${data.displayName || data.name} updated.`;
      break;
    case "player.profile.archived":
      label = isEs ? "Jugador" : "Player";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "UserX";
      description = isEs ? `Perfil de jugador archivado.` : `Player profile archived.`;
      break;
    case "player.invitation.created":
      label = isEs ? "Invitación" : "Invitation";
      color = "hsl(195, 95%, 50%)";
      bgColor = "hsla(195, 95%, 50%, 0.15)";
      icon = "Mail";
      description = isEs 
        ? `Invitación creada para el rol ${data.role || "player"}.` 
        : `Invitation created for role ${data.role || "player"}.`;
      break;
    case "player.invitation.consumed":
      label = isEs ? "Invitación" : "Invitation";
      color = "hsl(142, 70%, 50%)";
      bgColor = "hsla(142, 70%, 50%, 0.15)";
      icon = "CheckCircle2";
      description = isEs 
        ? `Invitación aceptada por el rol ${data.role || "player"}.` 
        : `Invitation accepted for role ${data.role || "player"}.`;
      break;
    case "player.invitation.revoked":
      label = isEs ? "Invitación" : "Invitation";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "XCircle";
      description = isEs ? `Invitación revocada.` : `Invitation revoked.`;
      break;
    case "entity.created":
      label = isEs ? "Entidad" : "Entity";
      color = "hsl(175, 85%, 45%)";
      bgColor = "hsla(175, 85%, 45%, 0.15)";
      icon = "Plus";
      description = isEs 
        ? `Nueva entidad "${data.name || ""}" (${data.type || ""}) creada.` 
        : `New entity "${data.name || ""}" (${data.type || ""}) created.`;
      break;
    case "entity.updated":
      label = isEs ? "Entidad" : "Entity";
      color = "hsl(175, 85%, 45%)";
      bgColor = "hsla(175, 85%, 45%, 0.15)";
      icon = "Pencil";
      description = isEs 
        ? `Entidad "${data.name || ""}" actualizada.` 
        : `Entity "${data.name || ""}" updated.`;
      break;
    case "entity.archived":
      label = isEs ? "Entidad" : "Entity";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "Archive";
      description = isEs ? `Entidad archivada.` : `Entity archived.`;
      break;
    case "relation.created":
      label = isEs ? "Relación" : "Relation";
      color = "hsl(320, 85%, 60%)";
      bgColor = "hsla(320, 85%, 60%, 0.15)";
      icon = "Link";
      description = isEs 
        ? `Nueva relación "${data.type || ""}" establecida.` 
        : `New relationship "${data.type || ""}" established.`;
      break;
    case "relation.updated":
      label = isEs ? "Relación" : "Relation";
      color = "hsl(320, 85%, 60%)";
      bgColor = "hsla(320, 85%, 60%, 0.15)";
      icon = "Link2";
      description = isEs ? `Relación actualizada.` : `Relationship updated.`;
      break;
    case "relation.archived":
      label = isEs ? "Relación" : "Relation";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "Unlink";
      description = isEs ? `Relación archivada.` : `Relationship archived.`;
      break;
    case "fact.created":
      label = isEs ? "Hecho" : "Fact";
      color = "hsl(38, 95%, 55%)";
      bgColor = "hsla(38, 95%, 55%, 0.15)";
      icon = "Info";
      description = isEs 
        ? `Hecho registrado: "${data.title || ""}".` 
        : `Fact recorded: "${data.title || ""}".`;
      break;
    case "fact.updated":
      label = isEs ? "Hecho" : "Fact";
      color = "hsl(38, 95%, 55%)";
      bgColor = "hsla(38, 95%, 55%, 0.15)";
      icon = "Info";
      description = isEs ? `Hecho actualizado: "${data.title || ""}".` : `Fact updated: "${data.title || ""}".`;
      break;
    case "fact.archived":
      label = isEs ? "Hecho" : "Fact";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "Archive";
      description = isEs ? `Hecho archivado.` : `Fact archived.`;
      break;
    case "session.created":
      label = isEs ? "Sesión" : "Session";
      color = "hsl(10, 95%, 60%)";
      bgColor = "hsla(10, 95%, 60%, 0.15)";
      icon = "Calendar";
      description = isEs 
        ? `Sesión planificada: Sesión ${data.sessionNumber || ""}${data.title ? ` — ${data.title}` : ""}.` 
        : `Session planned: Session ${data.sessionNumber || ""}${data.title ? ` — ${data.title}` : ""}.`;
      break;
    case "session.started":
      label = isEs ? "Sesión" : "Session";
      color = "hsl(142, 70%, 50%)";
      bgColor = "hsla(142, 70%, 50%, 0.15)";
      icon = "Play";
      description = isEs 
        ? `Sesión iniciada: Sesión ${data.sessionNumber || ""}${data.title ? ` — ${data.title}` : ""}.` 
        : `Session started: Session ${data.sessionNumber || ""}${data.title ? ` — ${data.title}` : ""}.`;
      break;
    case "session.closed":
      label = isEs ? "Sesión" : "Session";
      color = "hsl(10, 95%, 60%)";
      bgColor = "hsla(10, 95%, 60%, 0.15)";
      icon = "CheckCircle2";
      description = isEs 
        ? `Sesión concluida: Sesión ${data.sessionNumber || ""}${data.title ? ` — ${data.title}` : ""}.` 
        : `Session completed: Session ${data.sessionNumber || ""}${data.title ? ` — ${data.title}` : ""}.`;
      break;
    case "session.cancelled":
      label = isEs ? "Sesión" : "Session";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "AlertCircle";
      description = isEs ? `Sesión cancelada.` : `Session cancelled.`;
      break;
    case "session.archived":
      label = isEs ? "Sesión" : "Session";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "Archive";
      description = isEs ? `Sesión archivada.` : `Session archived.`;
      break;
    case "attachment.added":
      label = isEs ? "Adjunto" : "Attachment";
      color = "hsl(142, 70%, 50%)";
      bgColor = "hsla(142, 70%, 50%, 0.15)";
      icon = "Paperclip";
      description = isEs 
        ? `Archivo adjunto añadido: "${data.name || ""}".` 
        : `Attachment added: "${data.name || ""}".`;
      break;
    case "attachment.removed":
      label = isEs ? "Adjunto" : "Attachment";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "Trash";
      description = isEs ? `Archivo adjunto eliminado.` : `Attachment removed.`;
      break;
    case "canvas.created":
      label = isEs ? "Mapa" : "Map";
      color = "hsl(175, 85%, 45%)";
      bgColor = "hsla(175, 85%, 45%, 0.15)";
      icon = "Map";
      description = isEs 
        ? `Mapa/Lienzo "${data.title || ""}" creado.` 
        : `Map/Canvas "${data.title || ""}" created.`;
      break;
    case "canvas.updated":
      label = isEs ? "Mapa" : "Map";
      color = "hsl(175, 85%, 45%)";
      bgColor = "hsla(175, 85%, 45%, 0.15)";
      icon = "Map";
      description = isEs 
        ? `Mapa/Lienzo "${data.title || ""}" actualizado.` 
        : `Map/Canvas "${data.title || ""}" updated.`;
      break;
    case "canvas.archived":
      label = isEs ? "Mapa" : "Map";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "Archive";
      description = isEs ? `Mapa/Lienzo archivado.` : `Map/Canvas archived.`;
      break;
    case "live_table.opened":
      label = isEs ? "Mesa Activa" : "Live Table";
      color = "hsl(142, 70%, 50%)";
      bgColor = "hsla(142, 70%, 50%, 0.15)";
      icon = "Tv";
      description = isEs 
        ? `Mesa de juego activa abierta. Código de acceso rápido: ${data.shortCode || ""}.` 
        : `Live game table opened. Quick access code: ${data.shortCode || ""}.`;
      break;
    case "live_table.closed":
      label = isEs ? "Mesa Activa" : "Live Table";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "Tv";
      description = isEs ? `Mesa de juego activa cerrada.` : `Live game table closed.`;
      break;
    case "player.character.linked":
      label = isEs ? "Personaje" : "Character";
      color = "hsl(195, 95%, 50%)";
      bgColor = "hsla(195, 95%, 50%, 0.15)";
      icon = "UserCheck";
      description = isEs 
        ? `Personaje vinculado al jugador.` 
        : `Character linked to player.`;
      break;
    case "player.character.unlinked":
      label = isEs ? "Personaje" : "Character";
      color = "hsl(0, 85%, 60%)";
      bgColor = "hsla(0, 85%, 60%, 0.15)";
      icon = "UserMinus";
      description = isEs ? `Vinculación de personaje eliminada.` : `Character unlinked.`;
      break;
    case "player.objective.created":
      label = isEs ? "Objetivo" : "Objective";
      color = "hsl(38, 95%, 55%)";
      bgColor = "hsla(38, 95%, 55%, 0.15)";
      icon = "Flag";
      description = isEs 
        ? `Objetivo personal creado: "${data.title || ""}".` 
        : `Personal objective created: "${data.title || ""}".`;
      break;
    case "player.character.link.requested":
      label = isEs ? "Propuesta" : "Proposal";
      color = "hsl(195, 95%, 50%)";
      bgColor = "hsla(195, 95%, 50%, 0.15)";
      icon = "HelpCircle";
      description = isEs 
        ? `Solicitud de vinculación de personaje enviada por el jugador.` 
        : `Character link request submitted by player.`;
      break;
  }

  return { label, color, bgColor, icon, description };
}
