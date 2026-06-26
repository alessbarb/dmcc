import React, { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../stores/campaignStore.js";

export function JoinPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const vaultId = useCampaignStore.getState().activeVaultId || "default";
      const res = await fetch(`/api/join/${campaignId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-id": vaultId,
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al unirse a la campaña");
        setLoading(false);
        return;
      }

      const { playerToken, playerId } = data as { playerToken: string; playerId: string; campaignTitle: string };

      sessionStorage.setItem("dmcc_role", "player");
      sessionStorage.setItem("dmcc_playerId", playerId);
      sessionStorage.setItem("dmcc_accessCode", accessCode.trim());
      sessionStorage.setItem("dmcc_playerToken", playerToken);

      await useCampaignStore.getState().selectCampaign(campaignId);

      navigate({ to: `/campaigns/${campaignId}/dashboard` });
    } catch (err: any) {
      setError(err.message || "Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className="landing-shell">
      <header className="landing-hero">
        <img
          className="landing-hero__image"
          src="/assets/background.png"
          alt=""
          aria-hidden="true"
        />
        <div className="landing-hero__content">
          <h1 className="landing-hero__title">
            DM Campaign <span>Companion</span>
          </h1>
          <p className="landing-hero__subtitle">Portal del jugador</p>
        </div>
      </header>

      <div className="landing-grid" style={{ maxWidth: "480px", margin: "0 auto" }}>
        <section className="card landing-card">
          <div className="landing-section-header">
            <h2>Unirse a la campaña</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="accessCode">
                Código de acceso
              </label>
              <input
                id="accessCode"
                type="text"
                className="form-input"
                placeholder="Introduce el código que te dio tu DM"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
                autoFocus
                autoComplete="off"
              />
            </div>

            {error && (
              <p style={{ color: "var(--color-critical)", fontSize: "0.875rem", marginBottom: "12px" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary landing-primary-action"
              disabled={loading || !accessCode.trim()}
            >
              {loading ? "Conectando..." : "Unirse"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
