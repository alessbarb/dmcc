import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Check, Clock, Copy, Link2, Plus, Trash2, Users } from "lucide-react";
import { apiFetch } from "../../../shared/api/apiClient.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";

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
  void operation.catch((error: unknown) => console.error(errorMessage, error));
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
  if (
    typeof value.invitationId !== "string" ||
    typeof value.role !== "string" ||
    typeof value.maxUses !== "number" ||
    typeof value.usesCount !== "number" ||
    typeof value.expiresAt !== "string" ||
    !(value.revokedAt === null || typeof value.revokedAt === "string") ||
    typeof value.createdAt !== "string" ||
    !isInvitationStatus(value.status)
  ) {
    return null;
  }
  return {
    invitationId: value.invitationId,
    role: value.role,
    maxUses: value.maxUses,
    usesCount: value.usesCount,
    expiresAt: value.expiresAt,
    revokedAt: value.revokedAt,
    createdAt: value.createdAt,
    status: value.status,
  };
}

function normalizeListCampaignInvitationsResponse(value: unknown): ListCampaignInvitationsResponse {
  if (!isRecord(value) || !Array.isArray(value.invitations)) throw new Error("Invalid invitations response");
  const invitations = value.invitations.map(normalizeInvitation);
  if (invitations.some((invitation) => invitation === null)) throw new Error("Invalid invitation in response");
  return { invitations: invitations.filter((invitation): invitation is CampaignInvitation => invitation !== null) };
}

function normalizeCreateCampaignInvitationResponse(value: unknown): CreateCampaignInvitationResponse {
  if (!isRecord(value) || !isRecord(value.invitation)) throw new Error("Invalid invitation response");
  const invitation = value.invitation;
  if (
    typeof invitation.invitationId !== "string" ||
    typeof invitation.url !== "string" ||
    typeof invitation.token !== "string" ||
    typeof invitation.expiresAt !== "string"
  ) {
    throw new Error("Invalid invitation response");
  }
  return { invitation: { invitationId: invitation.invitationId, url: invitation.url, token: invitation.token, expiresAt: invitation.expiresAt } };
}

export function InvitationsView() {
  const { locale, t } = useTranslation();
  const activeCampaignId = useCampaignStore((state) => state.activeCampaignId);
  const { addToast } = useToast();
  const [invitations, setInvitations] = useState<CampaignInvitation[]>([]);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [newInviteUrl, setNewInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchInvitations = useCallback(async () => {
    if (!activeCampaignId) return;
    try {
      const response = await apiFetch(`/api/campaigns/${activeCampaignId}/invitations`);
      if (!response.ok) throw new Error(t("players.invitationListError"));
      const data: unknown = await response.json();
      setInvitations(normalizeListCampaignInvitationsResponse(data).invitations);
      setInvitationError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("players.invitationListError");
      setInvitationError(message);
      addToast(message, "error");
    }
  }, [activeCampaignId, addToast, t]);

  useEffect(() => {
    runPlayersAction(fetchInvitations(), "No se pudieron cargar las invitaciones.");
  }, [fetchInvitations]);

  const handleCreateInvite = async () => {
    if (!activeCampaignId) return;
    setInviteLoading(true);
    setNewInviteUrl(null);
    setCopied(false);
    try {
      const response = await apiFetch(`/api/campaigns/${activeCampaignId}/invitations`, {
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expiresInHours: 72 }),
        },
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message = isRecord(data) && typeof data.error === "string" ? data.error : t("players.invitationCreateError");
        throw new Error(message);
      }
      const created = normalizeCreateCampaignInvitationResponse(data);
      setNewInviteUrl(created.invitation.url);
      await fetchInvitations();
    } catch (error) {
      addToast(error instanceof Error ? error.message : t("players.invitationCreateError"), "error");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!newInviteUrl) return;
    try {
      await navigator.clipboard.writeText(newInviteUrl);
      setCopied(true);
      addToast(t("players.linkCopied"), "success");
    } catch {
      addToast(t("players.copyInvitationError"), "error");
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    if (!activeCampaignId) return;
    try {
      const response = await apiFetch(`/api/campaigns/${activeCampaignId}/invitations/${invitationId}/revoke`, {
        init: { method: "POST" },
      });
      if (!response.ok) throw new Error(t("players.invitationRevokeError"));
      await fetchInvitations();
    } catch (error) {
      addToast(error instanceof Error ? error.message : t("players.invitationRevokeError"), "error");
    }
  };

  return (
    <div className="people-invitations-view">
      <section className="people-invitations-hero surface-panel">
        <div className="people-invitations-hero__icon" aria-hidden="true"><Link2 size={26} /></div>
        <div className="people-invitations-hero__copy">
          <p className="people-section-eyebrow">{invitations.length}</p>
          <h2>{t("players.playerInvitations")}</h2>
          <p>{t("players.shareInvitationLink")}</p>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => runPlayersAction(handleCreateInvite(), "No se pudo crear la invitación.")}
          disabled={inviteLoading}
          aria-busy={inviteLoading}
        >
          <Plus size={16} />
          {inviteLoading ? t("players.creatingInvitation") : t("players.createInvitationLink")}
        </button>
      </section>

      {invitationError && <div className="people-inline-error surface-panel" role="alert">{invitationError}</div>}

      {newInviteUrl && (
        <section className="people-invite-share surface-panel" aria-live="polite">
          <div className="people-invite-share__heading">
            <Check size={18} aria-hidden="true" />
            <span>{t("players.shareInvitationLink")}</span>
          </div>
          <div className="people-invite-share__value">
            <code>{newInviteUrl}</code>
            <button className="btn btn-secondary btn-icon" type="button" aria-label={t("players.copyInvitationLink")} onClick={() => void handleCopy()}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </section>
      )}

      {invitations.length === 0 && !invitationError ? (
        <section className="people-empty-state surface-panel">
          <Users size={34} aria-hidden="true" />
          <h3>{t("players.playerInvitations")}</h3>
          <p>{t("players.shareInvitationLink")}</p>
        </section>
      ) : (
        <section className="people-invitation-list" aria-label={t("players.activeInvitations")}>
          {invitations.map((invitation) => {
            const statusKey = `players.invitationStatus${invitation.status.charAt(0).toUpperCase()}${invitation.status.slice(1)}`;
            return (
              <article key={invitation.invitationId} className={`people-invitation-card is-${invitation.status}`}>
                <div className="people-invitation-card__identity">
                  <div className="people-invitation-card__icon" aria-hidden="true"><Clock size={18} /></div>
                  <div>
                    <h3>{t("players.invitationFallback", { id: invitationDisplayId(invitation.invitationId) })}</h3>
                    <span className={`people-status-badge is-${invitation.status}`}>{t(statusKey)}</span>
                  </div>
                </div>
                <div className="people-invitation-card__meta">
                  <span><Users size={14} aria-hidden="true" /> {invitation.usesCount} / {invitation.maxUses}</span>
                  <time dateTime={invitation.expiresAt}>
                    <CalendarClock size={14} aria-hidden="true" />
                    {new Date(invitation.expiresAt).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}
                  </time>
                </div>
                {invitation.status === "active" && (
                  <button
                    className="btn btn-danger btn-icon"
                    type="button"
                    aria-label={t("players.revokeInvitation")}
                    title={t("players.revokeInvitation")}
                    onClick={() => runPlayersAction(handleRevokeInvite(invitation.invitationId), "No se pudo revocar la invitación.")}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
