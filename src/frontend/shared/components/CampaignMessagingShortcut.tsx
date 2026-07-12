import React from "react";
import { MessageCircle } from "lucide-react";

function currentMessagingHref(): string | null {
  const { pathname, search } = window.location;
  if (pathname.startsWith("/portal/messages/")) return null;
  if (pathname === "/portal") {
    const campaignId = new URLSearchParams(search).get("campaignId");
    return campaignId ? `/portal/messages/${encodeURIComponent(campaignId)}` : null;
  }
  const campaignMatch = pathname.match(/^\/campaigns\/([^/]+)(?:\/|$)/);
  if (!campaignMatch || pathname.endsWith("/messages")) return null;
  return `/campaigns/${encodeURIComponent(campaignMatch[1])}/messages`;
}

export function CampaignMessagingShortcut() {
  const href = currentMessagingHref();
  if (!href) return null;

  return (
    <a
      href={href}
      className="btn btn-primary"
      aria-label="Abrir mensajes de campaña"
      title="Mensajes de campaña"
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        width: 48,
        height: 48,
        borderRadius: 16,
        display: "grid",
        placeItems: "center",
        zIndex: 70,
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <MessageCircle size={21} />
    </a>
  );
}
