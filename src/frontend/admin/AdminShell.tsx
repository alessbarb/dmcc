import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Shield, Users, Layers, Activity, FileText, ArrowLeft, LogOut, Mail, Megaphone, BookOpen, Dices } from "lucide-react";
import { logout } from "../shared/auth/authClient.js";

interface AdminShellProps {
  children: React.ReactNode;
}

const navLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 14px",
  borderRadius: "8px",
  textDecoration: "none",
  color: "inherit",
  fontSize: "0.85rem",
  fontWeight: 500,
};

const navLinkActiveStyle: React.CSSProperties = {
  ...navLinkStyle,
  backgroundColor: "rgba(255,255,255,0.05)",
  borderLeft: "3px solid var(--gold)",
  paddingLeft: "11px",
  color: "var(--gold)",
};

function AdminNavLink({ to, exact, icon, label }: { to: string; exact?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      style={navLinkStyle}
      activeProps={() => ({ style: navLinkActiveStyle })}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      void navigate({ to: "/" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Sidebar navigation */}
      <aside style={{
        width: "260px",
        backgroundColor: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", padding: "0 8px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "rgba(218, 165, 32, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--gold)",
          }}>
            <Shield size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, letterSpacing: "0.05em" }}>DMCC ADMIN</h2>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Platform Console</span>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <AdminNavLink to="/admin" exact icon={<Activity size={16} />} label="Dashboard Overview" />
          <AdminNavLink to="/admin/campaigns" icon={<Layers size={16} />} label="Campaigns & Trash" />
          <AdminNavLink to="/admin/users" icon={<Users size={16} />} label="User Management" />
          <AdminNavLink to="/admin/invitations" icon={<Mail size={16} />} label="Invitations" />
          <AdminNavLink to="/admin/purge" icon={<Shield size={16} />} label="Purge Queue" />
          <AdminNavLink to="/admin/announcements" icon={<Megaphone size={16} />} label="Announcements" />
          <AdminNavLink to="/admin/campaign-templates" icon={<BookOpen size={16} />} label="Campaign Templates" />
          <AdminNavLink to="/admin/game-systems" icon={<Dices size={16} />} label="Game Systems" />
          <AdminNavLink to="/admin/audit" icon={<FileText size={16} />} label="Audit Logs" />
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
          <button
            onClick={() => void navigate({ to: "/home" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              width: "100%",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Portal</span>
          </button>

          <button
            onClick={() => { void handleLogout(); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              color: "var(--red)",
              fontSize: "0.85rem",
              width: "100%",
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content container */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto", maxHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
