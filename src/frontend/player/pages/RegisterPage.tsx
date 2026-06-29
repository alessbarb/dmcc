import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { registerPlayerSession } from "../../shared/auth/authClient.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { Shield, User, Mail, ChevronRight, Sparkles } from "lucide-react";

export function RegisterPage() {
  const { campaignId, inviteToken } = useParams({ strict: false }) as {
    campaignId: string;
    inviteToken: string;
  };
  const navigate = useNavigate();
  const vaultId = useCampaignStore.getState().activeVaultId || "default";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState<string>("");

  useEffect(() => {
    const loadCampaignInfo = async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`, {
          headers: { "x-vault-id": vaultId },
        });

        if (res.ok) {
          const data = await res.json();
          setCampaignTitle(data.title ?? data.campaign?.title ?? "");
        }
      } catch {
        // Non-fatal: the invitation itself is validated when submitting.
      }
    };

    void loadCampaignInfo();
  }, [campaignId, vaultId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim() || !email.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-id": vaultId,
        },
        body: JSON.stringify({
          inviteToken,
          displayName: displayName.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const { playerToken, playerId, campaignTitle } = data as {
        playerToken: string;
        playerId: string;
        campaignTitle?: string;
      };

      registerPlayerSession(campaignId, playerId, playerToken, {
        campaignId,
        campaignTitle: campaignTitle || campaignId,
        playerId,
        displayName: displayName.trim(),
        email: email.trim(),
      });

      useCampaignStore.setState({ activeCampaignId: campaignId, campaignState: null, playerPortalState: null });
      navigate({ to: `/campaigns/${campaignId}/player-portal` });
    } catch (err: any) {
      setError(err.message || "Connection error");
      setLoading(false);
    }
  };

  return (
    <div className="join-portal-container">
      <div className="join-portal-background">
        <RpgPortalBackground />
        <div className="join-portal-radial-glow" />
      </div>

      <div className="join-portal-card" style={{ maxWidth: "420px" }}>
        <div className="join-portal-header">
          <div className="join-portal-icon-wrapper">
            <Shield className="join-portal-icon" size={32} />
            <div className="join-portal-icon-glow" />
          </div>
          <span className="join-portal-badge">
            <Sparkles size={12} style={{ marginRight: "4px" }} />
            Player Registration
          </span>
          {campaignTitle && (
            <h1 className="join-portal-title" style={{ fontSize: "1.2rem" }}>
              {campaignTitle}
            </h1>
          )}
        </div>

        <form onSubmit={handleSubmit} className="join-portal-form">
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            Create your player profile. You will choose or propose a character inside the player portal.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="displayName">
              Display name
            </label>
            <div className="access-code-input-wrapper">
              <User size={16} className="input-icon" />
              <input
                id="displayName"
                type="text"
                className="form-input join-portal-input"
                placeholder="Aragorn, Liriel, ..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email <span style={{ color: "var(--text-muted)", fontSize: "0.8em" }}>(used to recognize you across devices)</span>
            </label>
            <div className="access-code-input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                className="form-input join-portal-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {error && (
            <div className="join-portal-error">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary join-portal-btn"
            disabled={loading || !displayName.trim() || !email.trim()}
          >
            {loading ? "Joining..." : "Enter Player Portal"}
            {!loading && <ChevronRight size={16} style={{ marginLeft: "4px" }} />}
          </button>
        </form>
      </div>
    </div>
  );
}
