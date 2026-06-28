import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { registerPlayerSession } from "../../shared/auth/authClient.js";
import { RpgPortalBackground } from "../../shared/components/RpgPortalBackground.js";
import { Shield, User, Mail, ChevronRight, Sparkles, ArrowLeft, Sword } from "lucide-react";

type CharacterChoice =
  | { kind: "premade"; entityId: string }
  | { kind: "new"; name: string; characterClass: string; race: string }
  | null;

interface PremadeCharacter {
  entityId: string;
  title: string;
  subtitle?: string;
}

export function RegisterPage() {
  const { campaignId, inviteToken } = useParams({ strict: false }) as {
    campaignId: string;
    inviteToken: string;
  };
  const navigate = useNavigate();
  const vaultId = useCampaignStore.getState().activeVaultId || "default";

  const [step, setStep] = useState<"profile" | "character">("profile");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [characterChoice, setCharacterChoice] = useState<CharacterChoice>(null);
  const [newCharName, setNewCharName] = useState("");
  const [newCharClass, setNewCharClass] = useState("");
  const [newCharRace, setNewCharRace] = useState("");
  const [premadeChars, setPremadeChars] = useState<PremadeCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState<string>("");

  useEffect(() => {
    // Load campaign info + available player_character entities
    const load = async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/entities?type=player_character`, {
          headers: { "x-vault-id": vaultId },
        });
        if (res.ok) {
          const data = await res.json();
          const entities: PremadeCharacter[] = (data.entities ?? data ?? [])
            .filter((e: any) => !e.archived && e.entityType === "player_character" && !e.metadata?.playerId)
            .map((e: any) => ({ entityId: e.entityId || e.id, title: e.title, subtitle: e.subtitle }));
          setPremadeChars(entities);
        }
      } catch {
        // non-fatal
      }
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`, {
          headers: { "x-vault-id": vaultId },
        });
        if (res.ok) {
          const data = await res.json();
          setCampaignTitle(data.title ?? data.campaign?.title ?? "");
        }
      } catch {
        // non-fatal
      }
    };
    load();
  }, [campaignId, vaultId]);

  const handleProfileNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) return;
    setStep("character");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedChoice: CharacterChoice = characterChoice?.kind === "new"
      ? { kind: "new", name: newCharName.trim(), characterClass: newCharClass.trim(), race: newCharRace.trim() }
      : characterChoice;

    if (resolvedChoice?.kind === "new" && !resolvedChoice.name) {
      setError("Character name is required");
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
          characterChoice: resolvedChoice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const { playerToken, playerId, campaignTitle } = data as { playerToken: string; playerId: string; campaignTitle?: string };
      registerPlayerSession(campaignId, playerId, playerToken, {
        campaignId,
        campaignTitle: campaignTitle || campaignId,
        playerId,
        displayName: displayName.trim(),
      });

      await useCampaignStore.getState().selectCampaign(campaignId);
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

        {step === "profile" ? (
          <form onSubmit={handleProfileNext} className="join-portal-form">
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Step 1 of 2 — Your profile
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
            <button
              type="submit"
              className="btn btn-primary join-portal-btn"
              disabled={!displayName.trim() || !email.trim()}
            >
              Next <ChevronRight size={16} style={{ marginLeft: "4px" }} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="join-portal-form">
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Step 2 of 2 — Your character
            </p>

            {premadeChars.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <p className="form-label" style={{ marginBottom: "0.5rem" }}>Choose a premade character</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {premadeChars.map((c) => (
                    <label
                      key={c.entityId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        border: characterChoice?.kind === "premade" && characterChoice.entityId === c.entityId
                          ? "1.5px solid var(--accent)"
                          : "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                        background: characterChoice?.kind === "premade" && characterChoice.entityId === c.entityId
                          ? "rgba(var(--accent-rgb),0.08)"
                          : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="charChoice"
                        value={c.entityId}
                        checked={characterChoice?.kind === "premade" && characterChoice.entityId === c.entityId}
                        onChange={() => setCharacterChoice({ kind: "premade", entityId: c.entityId })}
                        style={{ display: "none" }}
                      />
                      <Sword size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{c.title}</span>
                      {c.subtitle && <span style={{ color: "var(--text-muted)", fontSize: "0.8em" }}>{c.subtitle}</span>}
                    </label>
                  ))}
                </div>
                <p className="form-label" style={{ margin: "0.75rem 0 0.5rem" }}>Or create your own</p>
              </div>
            )}

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.6rem 0.8rem",
                borderRadius: "8px",
                border: characterChoice?.kind === "new"
                  ? "1.5px solid var(--accent)"
                  : "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                background: characterChoice?.kind === "new"
                  ? "rgba(var(--accent-rgb),0.08)"
                  : "transparent",
                marginBottom: characterChoice?.kind === "new" ? "0.75rem" : "0",
              }}
            >
              <input
                type="radio"
                name="charChoice"
                checked={characterChoice?.kind === "new"}
                onChange={() => setCharacterChoice({ kind: "new", name: newCharName, characterClass: newCharClass, race: newCharRace })}
                style={{ display: "none" }}
              />
              <User size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>
                {premadeChars.length > 0 ? "Create a new character" : "Create your character"}
              </span>
            </label>

            {characterChoice?.kind === "new" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", paddingLeft: "0.5rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="charName">Character name *</label>
                  <input
                    id="charName"
                    type="text"
                    className="form-input join-portal-input"
                    placeholder="Name"
                    value={newCharName}
                    onChange={(e) => {
                      setNewCharName(e.target.value);
                      setCharacterChoice({ kind: "new", name: e.target.value, characterClass: newCharClass, race: newCharRace });
                    }}
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="charClass">Class</label>
                    <input
                      id="charClass"
                      type="text"
                      className="form-input join-portal-input"
                      placeholder="Rogue, Wizard..."
                      value={newCharClass}
                      onChange={(e) => {
                        setNewCharClass(e.target.value);
                        setCharacterChoice({ kind: "new", name: newCharName, characterClass: e.target.value, race: newCharRace });
                      }}
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="charRace">Race</label>
                    <input
                      id="charRace"
                      type="text"
                      className="form-input join-portal-input"
                      placeholder="Elf, Human..."
                      value={newCharRace}
                      onChange={(e) => {
                        setNewCharRace(e.target.value);
                        setCharacterChoice({ kind: "new", name: newCharName, characterClass: newCharClass, race: e.target.value });
                      }}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="join-portal-error">
                <p>{error}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep("profile")}
                style={{ flex: "0 0 auto" }}
              >
                <ArrowLeft size={14} />
              </button>
              <button
                type="submit"
                className="btn btn-primary join-portal-btn"
                style={{ flex: 1 }}
                disabled={loading || (!characterChoice)}
              >
                {loading ? "Joining..." : "Join Campaign"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
