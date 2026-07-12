const campaignMessagingTranslations = {
  en: {
    loadOlder: "Load earlier messages",
    sending: "Sending…",
    failed: "Message not sent",
    retry: "Retry",
    newMessages: "new messages",
    jumpToLatest: "Jump to latest messages",
  },
  es: {
    loadOlder: "Cargar mensajes anteriores",
    sending: "Enviando…",
    failed: "No se pudo enviar el mensaje",
    retry: "Reintentar",
    newMessages: "mensajes nuevos",
    jumpToLatest: "Ir a los mensajes más recientes",
  },
  fr: {
    loadOlder: "Charger les messages précédents",
    sending: "Envoi…",
    failed: "Message non envoyé",
    retry: "Réessayer",
    newMessages: "nouveaux messages",
    jumpToLatest: "Aller aux messages les plus récents",
  },
  de: {
    loadOlder: "Frühere Nachrichten laden",
    sending: "Wird gesendet…",
    failed: "Nachricht nicht gesendet",
    retry: "Erneut versuchen",
    newMessages: "neue Nachrichten",
    jumpToLatest: "Zu den neuesten Nachrichten springen",
  },
  it: {
    loadOlder: "Carica messaggi precedenti",
    sending: "Invio…",
    failed: "Messaggio non inviato",
    retry: "Riprova",
    newMessages: "nuovi messaggi",
    jumpToLatest: "Vai ai messaggi più recenti",
  },
  pt: {
    loadOlder: "Carregar mensagens anteriores",
    sending: "A enviar…",
    failed: "Mensagem não enviada",
    retry: "Tentar novamente",
    newMessages: "novas mensagens",
    jumpToLatest: "Ir para as mensagens mais recentes",
  },
} as const;

export type CampaignMessagingLocale = keyof typeof campaignMessagingTranslations;

export function withCampaignMessagingTranslations<T extends {
  playerPortal: { messaging: Record<string, unknown> };
}>(dictionary: T, locale: CampaignMessagingLocale): T {
  return {
    ...dictionary,
    playerPortal: {
      ...dictionary.playerPortal,
      messaging: {
        ...dictionary.playerPortal.messaging,
        ...campaignMessagingTranslations[locale],
      },
    },
  };
}
