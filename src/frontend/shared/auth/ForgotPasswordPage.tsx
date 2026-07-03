import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound } from "lucide-react";
import { requestPasswordReset } from "./authClient.js";
import { PortalTopBar } from "../components/PortalTopBar.js";
import { RpgPortalBackground } from "../components/RpgPortalBackground.js";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await requestPasswordReset(email.trim());
      if (result.resetToken) {
        setMessage("A local recovery token has been generated. Redirecting to the next step.");
        await navigate({ to: "/reset-password/$token", params: { token: result.resetToken } });
        return;
      }
      setMessage("If an account exists with that email, you will receive instructions to reset your password.");
    } catch (err: any) {
      setError(err.message || "Could not request password reset.");
    } finally {
      setLoading(false);
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

        <div className="join-portal-card">
          <div className="join-portal-header">
            <div className="join-portal-icon-wrapper">
              <KeyRound className="join-portal-icon" size={32} />
              <div className="join-portal-icon-glow" />
            </div>
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>Recover Password</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
              Enter your account email. The system will not reveal whether the email exists.
            </p>
          </div>

          <form onSubmit={submit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input join-portal-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
            </div>

            {message && <div className="join-portal-success"><p>{message}</p></div>}
            {error && <div className="join-portal-error"><p>{error}</p></div>}

            <button type="submit" className="btn btn-primary join-portal-btn" disabled={loading || !email.trim()}>
              {loading ? "Sending..." : "Request Recovery"}
            </button>
          </form>

          <button type="button" className="join-portal-back-btn" onClick={() => navigate({ to: "/login" })}>
            <ArrowLeft size={14} style={{ marginRight: "6px" }} /> Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
