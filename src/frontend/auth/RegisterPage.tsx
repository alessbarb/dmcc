import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
import { fetchSession, registerAccount } from "../shared/auth/authClient.js";
import { consumeAuthReturnTo } from "../shared/auth/authReturnTo.js";
import { RpgPortalBackground } from "../shared/components/RpgPortalBackground.js";
import { PortalTopBar } from "../shared/components/PortalTopBar.js";

const MIN_PASSWORD_LENGTH = 12;

export function RegisterPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSession()
      .then((session) => {
        if (session.sessionValid) window.location.assign(consumeAuthReturnTo());
      })
      .catch(() => undefined)
      .finally(() => setCheckingSession(false));
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void (async () => {
      if (!email.includes("@")) { setError("Introduce un correo electrónico válido."); return; }
      if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
      if (password.length < MIN_PASSWORD_LENGTH) { setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`); return; }
      setLoading(true);
      setError(null);
      try {
        await registerAccount({ email, password, displayName });
        window.location.assign(consumeAuthReturnTo());
      } catch (cause: unknown) {
        setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        setLoading(false);
      }
    })();
  };

  if (checkingSession) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-main)", color: "var(--text-muted)" }}>Cargando…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-main)" }}>
      <PortalTopBar />
      <div className="join-portal-container" style={{ flex: 1 }}>
        <div className="join-portal-background"><RpgPortalBackground /><div className="join-portal-radial-glow" /></div>
        <div className="join-portal-card">
          <div className="join-portal-header">
            <div className="join-portal-icon-wrapper"><UserPlus className="join-portal-icon" size={32} /><div className="join-portal-icon-glow" /></div>
            <h1 className="join-portal-title" style={{ fontSize: "1.3rem" }}>Crear cuenta</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>Una sola cuenta para dirigir campañas, jugar y administrar tus personajes.</p>
          </div>

          <form onSubmit={handleSubmit} className="join-portal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="displayName">Nombre visible</label>
              <input id="displayName" type="text" className="form-input join-portal-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <input id="email" type="email" className="form-input join-portal-input" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <div className="access-code-input-wrapper">
                <input id="password" type={showPassword ? "text" : "password"} className="form-input join-portal-input" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={MIN_PASSWORD_LENGTH} maxLength={128} autoComplete="new-password" />
                <button type="button" className="input-icon" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirmar contraseña</label>
              <input id="confirmPassword" type={showPassword ? "text" : "password"} className="form-input join-portal-input" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={MIN_PASSWORD_LENGTH} maxLength={128} autoComplete="new-password" />
            </div>
            {error && <div className="join-portal-error"><p role="alert">{error}</p></div>}
            <button type="submit" className="btn btn-primary join-portal-btn" disabled={loading || !email || !password || !confirmPassword}>{loading ? "Creando cuenta…" : "Crear cuenta"}</button>
          </form>

          <button type="button" className="join-portal-back-btn" onClick={() => void navigate({ to: "/auth/login" })}><ArrowLeft size={14} style={{ marginRight: 6 }} /> Volver al inicio de sesión</button>
        </div>
      </div>
    </div>
  );
}
