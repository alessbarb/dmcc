import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { resetPassword } from "./authClient.js";
import { PortalTopBar } from "../components/PortalTopBar.js";
import { RpgPortalBackground } from "../components/RpgPortalBackground.js";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const routeParams = useParams({ strict: false }) as { token?: string };
  const initialToken = useMemo(() => routeParams.token ?? "", [routeParams.token]);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resetPassword(token.trim(), password);
      setMessage("Password updated successfully. You can now sign in.");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
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
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>New Password</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
              Enter your recovery token and define a new password.
            </p>
          </div>

          <form onSubmit={submit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="token">Recovery Token</label>
              <input
                id="token"
                type="text"
                className="form-input join-portal-input"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="one-time-code"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
              <div className="access-code-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input join-portal-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button type="button" className="input-icon" style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }} onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                className="form-input join-portal-input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {message && <div className="join-portal-success"><p>{message}</p></div>}
            {error && <div className="join-portal-error"><p>{error}</p></div>}

            <button type="submit" className="btn btn-primary join-portal-btn" disabled={loading || !token.trim() || !password || !confirmPassword}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <button type="button" className="join-portal-back-btn" onClick={() => navigate({ to: "/login" })}>
            <ArrowLeft size={14} style={{ marginRight: "6px" }} /> Go to login
          </button>
        </div>
      </div>
    </div>
  );
}
