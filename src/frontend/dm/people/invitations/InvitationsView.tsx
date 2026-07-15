import React, { useState, useEffect, useCallback } from "react";
import { Plus, Link2, Copy, Trash2, Clock } from "lucide-react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { apiFetch } from "../../../shared/api/apiClient.js";

type CampaignInvitationStatus = "active" | "exhausted" | "expired" | "revoked";

interface CampaignInvitation {
  invitationId: string;
  role: string;
  maxUses: number;
  usesCount: number;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  status: CampaignInvitationStatus;
}

interface CreateCampaignInvitationResponse {
  invitation: {
    invitationId: string;
    url: string;
    token: string;
    expiresAt: string;
  };
}

interface ListCampaignInvitationsResponse {
  invitations: CampaignInvitation[];
}

function runPlayersAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function invitationDisplayId(invitationId: string): string {
  return invitationId.length > 6 ? invitationId.slice(-6) : invitationId;
}

function isInvitationStatus(value: unknown): value is CampaignInvitationStatus {
  return value === "active" || value === "exhausted" || value === "expired" || value === "revoked";
}

function normalizeInvitation(value: unknown): CampaignInvitation | null {
  if (!isRecord(value)) return null;
  const record = value;
  if (
    typeof record.invitationId !== "string" ||
    typeof record.role !== "string" ||
    typeof record.maxUses !== "number" ||
    typeof record.usesCount !== "number" ||
    typeof record.expiresAt !== "string" ||
    !(record.revokedAt === null || typeof record.revokedAt === "string") ||
    typeof record.createdAt !== "string" ||
    !isInvitationStatus(record.status)
  ) {
    return null;
  }
  return {
    invitationId: record.invitationId,
    role: record.role,
    maxUses: record.maxUses,
    usesCount: record.usesCount,
    expiresAt: record.expiresAt,
    revokedAt: record.revokedAt,
    createdAt: record.createdAt,
    status: record.status,
  };
}

function normalizeListCampaignInvitationsResponse(value: unknown): ListCampaignInvitationsResponse {
  if (!isRecord(value) || !Array.isArray(value.invitations)) {
    throw new Error("Invalid invitations response");
  }
  const invitations: CampaignInvitation[] = [];
  for (const raw of value.invitations) {
    const invitation = normalizeInvitation(raw);
    if (!invitation) {
      throw new Error("Invalid invitation in response");
    }
    invitations.push(invitation);
  }
  return { invitations };
}

function normalizeCreateCampaignInvitationResponse(value: unknown): CreateCampaignInvitationResponse {
  if (!isRecord(value)) throw new Error("Invalid invitation response");
  const invitation = value.invitation;
  if (!isRecord(invitation)) throw new Error("Invalid invitation response");
  const record = invitation;
  if (
    typeof record.invitationId !== "string" ||
    typeof record.url !== "string" ||
    typeof record.token !== "string" ||
    typeof record.expiresAt !== "string"
  ) {
    throw new Error("Invalid invitation response");
  }
  return { invitation: { invitationId: record.invitationId, url: record.url, token: record.token, expiresAt: record.expiresAt } };
}

export function InvitationsView() {
  const { t } = useTranslation();
  const store = useCampaignStore();
  const { addToast } = useToast();

  const [invitations, setInvitations] = useState<CampaignInvitation[]>([]);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [newInviteUrl, setNewInviteUrl] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    const activeCampaignId = store.activeCampaignId;
    if (!activeCampaignId) return;
    try {
      const res = await apiFetch(`/api/campaigns/${activeCampaignId}/invitations`);
      if (!res.ok) {
        throw new Error(t("players.invitationListError"));
      }
      const data: unknown = await res.json();
      setInvitations(normalizeListCampaignInvitationsResponse(data).invitations);
      setInvitationError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("players.invitationListError");
      setInvitationError(message);
      addToast(message, "error");
    }
  }, [addToast, store.activeCampaignId, t]);

  useEffect(() => {
    runPlayersAction(fetchInvitations(), "No se pudieron cargar las invitaciones.");
  }, [fetchInvitations]);


  const handleCreateInvite = async () => {
    const activeCampaignId = store.activeCampaignId;
    if (!activeCampaignId) return;
    setInviteLoading(true);
    setNewInviteUrl(null);
    try {
      const res = await apiFetch(`/api/campaigns/${activeCampaignId}/invitations`, {
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expiresInHours: 72 }),
        },
      });
      const data: unknown = await res.json();
      if (res.ok) {
        const created = normalizeCreateCampaignInvitationResponse(data);
        setNewInviteUrl(created.invitation.url);
        await fetchInvitations();
      } else {
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : t("players.invitationCreateError");
        addToast(message, "error");
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : t("players.invitationCreateError"), "error");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    const activeCampaignId = store.activeCampaignId;
    if (!activeCampaignId) return;
    try {
      const response = await apiFetch(`/api/campaigns/${activeCampaignId}/invitations/${invitationId}/revoke`, {
        init: { method: "POST" },
      });
      if (!response.ok) {
        throw new Error(t("players.invitationRevokeError"));
      }
      await fetchInvitations();
    } catch (error) {
      addToast(error instanceof Error ? error.message : t("players.invitationRevokeError"), "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: "18px", border: "1px solid rgba(99,102,241,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontWeight: "600", fontSize: "0.95rem", margin: 0 }}>
            <Link2 size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            {t("players.playerInvitations")}
          </h3>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            runPlayersAction(handleCreateInvite(), "No se pudo crear la invitación.");
          }}
          disabled={inviteLoading}
          aria-busy={inviteLoading}
          aria-live="polite"
          style={{ marginBottom: "12px" }}
        >
          <Plus size={14} /> {inviteLoading ? t("players.creatingInvitation") : t("players.createInvitationLink")}
        </button>

        {invitationError && (
          <p role="alert" style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "12px" }}>{invitationError}</p>
        )}

        {newInviteUrl && (
          <div aria-live="polite" style={{ background: "rgba(99,102,241,0.08)", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              {t("players.shareInvitationLink")}
            </p>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <code style={{ fontSize: "0.75rem", wordBreak: "break-all", flex: 1, color: "var(--accent)" }}>{newInviteUrl}</code>
              <button
                className="btn btn-secondary btn-icon"
                style={{ padding: "4px", flexShrink: 0 }}
                aria-label={t("players.copyInvitationLink")}
                onClick={() => {
                  navigator.clipboard.writeText(newInviteUrl)
                    .then(() => addToast(t("players.linkCopied"), "success"))
                    .catch(() => addToast(t("players.copyInvitationError"), "error"));
                }}
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        )}

        {invitations.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>{t("players.activeInvitations")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {invitations.map((inv) => (
                <div key={inv.invitationId} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.03)",
                  fontSize: "0.8rem",
                }}>
                  <Clock size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
                  <span style={{ flex: 1, color: inv.status === "active" ? "var(--text-main)" : "var(--text-muted)" }}>
                    {t("players.invitationFallback", { id: invitationDisplayId(inv.invitationId) })}
                  </span>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    background: inv.status === "active" ? "rgba(99,102,241,0.15)" : inv.status === "exhausted" ? "rgba(16,185,129,0.15)" : inv.status === "expired" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                    color: inv.status === "active" ? "#818cf8" : inv.status === "exhausted" ? "#34d399" : inv.status === "expired" ? "#fbbf24" : "#f87171",
                  }}>
                    {t(`players.invitationStatus${inv.status.charAt(0).toUpperCase()}${inv.status.slice(1)}`)}
                  </span>
                  {inv.status === "active" && (
                    <button
                      className="btn btn-danger btn-icon"
                      style={{ padding: "3px" }}
                      aria-label={t("players.revokeInvitation")}
                      onClick={() => {
                        runPlayersAction(handleRevokeInvite(inv.invitationId), "No se pudo revocar la invitación.");
                      }}
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
