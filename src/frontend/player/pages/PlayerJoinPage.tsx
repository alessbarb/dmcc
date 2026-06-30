import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Link2, Mail, Search, Shield, UserRound } from "lucide-react";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../../shared/components/PortalTopBar.js";
import { registerPlayerSession } from "../../shared/auth/authClient.js";
import { getAllPlayerProfiles } from "../../shared/auth/localIdentity.js";
import type { PlayerProfileEntry } from "../../shared/auth/authTypes.js";
import { getPlayerToken, setPlayerSession } from "../../shared/auth/sessionCreds.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";

type RejoinMatch = {
  campaignId: string;
  campaignTitle: string;
  playerId: string;
  displayName: string;
  characterEntityId?: string;
  characterName?: string;
  hasLinkedCharacter: boolean;
  lastActiveAt?: string;
};

export function PlayerJoinPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const vaultId = useCampaignStore.getState().activeVaultId || "default";

  const [inviteUrl, setInviteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [knownProfiles, setKnownProfiles] = useState<PlayerProfileEntry[]>([]);
  const [matches, setMatches] = useState<RejoinMatch[]>([]);
  const [lookupDone, setLookupDone] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [joiningKey, setJoiningKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setKnownProfiles(getAllPlayerProfiles().sort((a, b) => b.lastAccessed.localeCompare(a.lastAccessed)));
  }, []);

  const activeSessionProfiles = useMemo(
    () => knownProfiles.filter((profile) => Boolean(getPlayerToken(profile.campaignId))),
    [knownProfiles]
  );

  const rememberedProfiles = useMemo(
    () => knownProfiles.filter((profile) => !getPlayerToken(profile.campaignId)),
    [knownProfiles]
  );

  const openPortal = (campaignId: string) => {
    useCampaignStore.getState().enterPlayerCampaign(campaignId);
    navigate({ to: `/campaigns/${campaignId}/player-portal` });
  };

  const handleResumeSession = (profile: PlayerProfileEntry) => {
    const token = getPlayerToken(profile.campaignId);
    if (!token) {
      if (profile.email) setEmail(profile.email);
      setError(t("playerJoin.errorEmailRequiredForRenewal"));
      return;
    }

    setPlayerSession(profile.campaignId, profile.playerId, token);
    openPortal(profile.campaignId);
  };

  const handleUseRememberedProfile = (profile: PlayerProfileEntry) => {
    if (profile.email) {
      setEmail(profile.email);
      setError(null);
    } else {
      setError(t("playerJoin.errorRememberedWithoutEmail"));
    }
  };

  const handleLinkRedirect = () => {
    if (!inviteUrl.trim()) return;
    setError(null);
    try {
      const url = new URL(inviteUrl.trim(), window.location.origin);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "register" && parts.length >= 3) {
        navigate({ to: `/register/${parts[1]}/${parts[2]}` });
      } else {
        setError(t("playerJoin.errorInvalidFormat"));
      }
    } catch {
      setError(t("playerJoin.errorInvalidUrl"));
    }
  };

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;

    setLoadingLookup(true);
    setLookupDone(false);
    setMatches([]);
    setError(null);

    try {
      const res = await fetch("/api/player/rejoin/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-id": vaultId,
        },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || t("playerJoin.lookupError"));
      }

      setMatches(Array.isArray(data.matches) ? data.matches : []);
      setLookupDone(true);
    } catch (err: any) {
      setError(err.message || t("playerJoin.lookupConnectionError"));
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleRejoin = async (match: RejoinMatch) => {
    if (!email.trim()) return;
    const key = `${match.campaignId}:${match.playerId}`;
    setJoiningKey(key);
    setError(null);

    try {
      const res = await fetch("/api/player/rejoin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-id": vaultId,
        },
        body: JSON.stringify({
          email: email.trim(),
          campaignId: match.campaignId,
          playerId: match.playerId,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || t("playerJoin.rejoinError"));
      }

      registerPlayerSession(data.campaignId, data.playerId, data.playerToken, {
        campaignId: data.campaignId,
        campaignTitle: data.campaignTitle || match.campaignTitle || data.campaignId,
        playerId: data.playerId,
        displayName: data.displayName || match.displayName,
        email: email.trim(),
        characterName: data.characterName || match.characterName,
      });

      openPortal(data.campaignId);
    } catch (err: any) {
      setError(err.message || t("playerJoin.rejoinConnectionError"));
    } finally {
      setJoiningKey(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-main)" }}>
      <PortalTopBar />
      <div className="join-portal-container" style={{ flex: 1 }}>
        <div className="join-portal-background">
          <RpgPortalBackground />
          <div className="join-portal-radial-glow" />
        </div>

        <div className="join-portal-card" style={{ maxWidth: "760px" }}>
          <div className="join-portal-header">
            <div className="join-portal-icon-wrapper">
              <Shield className="join-portal-icon" size={32} />
              <div className="join-portal-icon-glow" />
            </div>
            <h1 className="join-portal-title" style={{ fontSize: "1.35rem" }}>{t("playerJoin.title")}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
              Entra con una invitación nueva o recupera tus campañas activas con tu email.
            </p>
          </div>

          {error && <div className="join-portal-error" style={{ marginBottom: "1rem" }}><p>{error}</p></div>}

          {activeSessionProfiles.length > 0 && (
            <section style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "0.95rem", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <BookOpen size={16} /> Continuar en este dispositivo
              </h2>
              <div style={{ display: "grid", gap: "0.6rem" }}>
                {activeSessionProfiles.map((profile) => (
                  <PlayerProfileCard key={`${profile.campaignId}:${profile.playerId}`} profile={profile} actionLabel="Entrar" onAction={() => handleResumeSession(profile)} />
                ))}
              </div>
            </section>
          )}

          <section style={{ marginBottom: "1.25rem", padding: "1rem", border: "1px solid var(--border-subtle)", borderRadius: "14px", background: "var(--bg-surface-soft)" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <Mail size={16} /> Ya soy jugador
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", marginBottom: "0.9rem" }}>
              Escribe el email con el que te registraste. Si participas en varias campañas, podrás elegir en cuál entrar.
            </p>
            <form onSubmit={handleLookup} className="join-portal-form" style={{ marginBottom: "0.8rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="rejoinEmail">Email</label>
                <input
                  id="rejoinEmail"
                  type="email"
                  className="form-input join-portal-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="btn btn-primary join-portal-btn" disabled={loadingLookup || !email.trim()}>
                <Search size={15} style={{ marginRight: "6px" }} />
                {loadingLookup ? t("playerJoin.searchingBtn") : t("playerJoin.searchCampaignsBtn")}
              </button>
            </form>

            {lookupDone && matches.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                No hay jugadores activos con ese email. Usa una invitación nueva o pide al DM que te envíe una.
              </p>
            )}

            {matches.length > 0 && (
              <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.75rem" }}>
                {matches.map((match) => {
                  const key = `${match.campaignId}:${match.playerId}`;
                  return (
                    <RejoinMatchCard
                      key={key}
                      match={match}
                      loading={joiningKey === key}
                      onJoin={() => handleRejoin(match)}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {rememberedProfiles.length > 0 && (
            <section style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "0.95rem", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <UserRound size={16} /> Campañas recordadas
              </h2>
              <div style={{ display: "grid", gap: "0.6rem" }}>
                {rememberedProfiles.slice(0, 4).map((profile) => (
                  <PlayerProfileCard
                    key={`${profile.campaignId}:${profile.playerId}`}
                    profile={profile}
                    actionLabel={profile.email ? "Usar email" : "Recuperar"}
                    onAction={() => handleUseRememberedProfile(profile)}
                  />
                ))}
              </div>
            </section>
          )}

          <section style={{ padding: "1rem", border: "1px solid var(--border-subtle)", borderRadius: "14px", background: "var(--bg-surface-soft)" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <Link2 size={16} /> Tengo una invitación
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", marginBottom: "0.9rem" }}>
              Usa este camino solo para entrar por primera vez o cuando el DM te haya enviado una invitación nueva.
            </p>
            <div className="join-portal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="inviteUrl">{t("playerJoin.linkLabel")}</label>
                <input
                  id="inviteUrl"
                  type="text"
                  className="form-input join-portal-input"
                  placeholder={t("playerJoin.linkPlaceholder")}
                  value={inviteUrl}
                  onChange={(e) => setInviteUrl(e.target.value)}
                  autoComplete="off"
                  onKeyDown={(e) => { if (e.key === "Enter") handleLinkRedirect(); }}
                />
              </div>
              <button type="button" className="btn btn-secondary join-portal-btn" disabled={!inviteUrl.trim()} onClick={handleLinkRedirect}>
                {t("playerJoin.continueBtn")}
              </button>
            </div>
          </section>

          <button type="button" className="join-portal-back-btn" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft size={14} style={{ marginRight: "6px" }} /> {t("playerJoin.backHome")}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerProfileCard(props: { profile: PlayerProfileEntry; actionLabel: string; onAction: () => void }) {
  const { profile, actionLabel, onAction } = props;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.75rem", border: "1px solid var(--border-subtle)", borderRadius: "12px", background: "var(--bg-surface)" }}>
      <div style={{ minWidth: 0 }}>
        <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.campaignTitle}</strong>
        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
          {profile.displayName}{profile.characterName ? ` · ${profile.characterName}` : ""}
        </span>
      </div>
      <button type="button" className="btn btn-secondary" onClick={onAction} style={{ flexShrink: 0 }}>
        {actionLabel}
      </button>
    </div>
  );
}

function RejoinMatchCard(props: { match: RejoinMatch; loading: boolean; onJoin: () => void }) {
  const { match, loading, onJoin } = props;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.8rem", border: "1px solid var(--border-subtle)", borderRadius: "12px", background: "var(--bg-surface)" }}>
      <div style={{ minWidth: 0 }}>
        <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{match.campaignTitle}</strong>
        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
          {match.displayName}{match.characterName ? ` · ${match.characterName}` : " · Sin personaje vinculado"}
        </span>
      </div>
      <button type="button" className="btn btn-primary" disabled={loading} onClick={onJoin} style={{ flexShrink: 0 }}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </div>
  );
}
