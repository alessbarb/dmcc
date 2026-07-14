import React, { useEffect, useState } from "react";
import { AlertTriangle, Info, X, Megaphone } from "lucide-react";
import { apiFetch } from "../api/apiClient.js";

interface Announcement {
  announcementId: string;
  kind: "info" | "warning" | "maintenance";
  content: {
    title: string;
    body: string;
  };
  isDismissible: boolean;
  priority: number;
}

export function SystemAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed IDs from local storage
    try {
      const stored = localStorage.getItem("dmcc_dismissed_announcements");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load dismissed announcements from localStorage", e);
    }

    // Fetch active announcements
    apiFetch("/api/announcements")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data) => {
        if (data && Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements);
        }
      })
      .catch((err) => {
        console.error("Failed to load system announcements", err);
      });
  }, []);

  const handleDismiss = (id: string) => {
    const nextDismissed = [...dismissedIds, id];
    setDismissedIds(nextDismissed);
    try {
      localStorage.setItem("dmcc_dismissed_announcements", JSON.stringify(nextDismissed));
    } catch (e) {
      console.error("Failed to save dismissed announcements to localStorage", e);
    }
  };

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedIds.includes(a.announcementId)
  );

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
        boxSizing: "border-box",
        padding: "8px 16px",
        backgroundColor: "rgba(20, 20, 25, 0.95)",
        borderBottom: "1px solid var(--border)",
        zIndex: 9999,
        position: "relative",
      }}
    >
      {visibleAnnouncements.map((ann) => {
        // Compute premium color palette and icon based on kind
        let bgColor = "rgba(218, 165, 32, 0.05)"; // gold/info default
        let borderColor = "var(--gold)";
        let iconColor = "var(--gold)";
        let Icon = Info;

        if (ann.kind === "warning") {
          bgColor = "rgba(224, 86, 36, 0.05)";
          borderColor = "#e05624";
          iconColor = "#e05624";
          Icon = AlertTriangle;
        } else if (ann.kind === "maintenance") {
          bgColor = "rgba(196, 42, 42, 0.05)";
          borderColor = "#c42a2a";
          iconColor = "#c42a2a";
          Icon = Megaphone;
        }

        return (
          <div
            key={ann.announcementId}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px",
                borderRadius: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                color: iconColor,
              }}
            >
              <Icon size={18} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--text-main, #fff)",
                }}
              >
                {ann.content.title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--text-muted, #a0a0a5)",
                  lineHeight: "1.4",
                }}
              >
                {ann.content.body}
              </p>
            </div>

            {ann.isDismissible && (
              <button
                onClick={() => handleDismiss(ann.announcementId)}
                aria-label="Dismiss announcement"
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  color: "var(--text-muted, #a0a0a5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main, #fff)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted, #a0a0a5)";
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
