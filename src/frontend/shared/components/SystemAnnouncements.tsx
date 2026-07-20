import React, { useEffect, useState } from "react";
import { AlertTriangle, Info, X, Megaphone } from "lucide-react";
import { apiFetch } from "../api/apiClient.js";
import "../styles/features/system-announcements.css";

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
    <div className="system-announcements">
      {visibleAnnouncements.map((ann) => {
        let Icon = Info;

        if (ann.kind === "warning") {
          Icon = AlertTriangle;
        } else if (ann.kind === "maintenance") {
          Icon = Megaphone;
        }

        return (
          <div
            key={ann.announcementId}
            className={`system-announcements__item system-announcements__item--${ann.kind}`}
          >
            <div className="system-announcements__icon">
              <Icon size={18} />
            </div>

            <div className="system-announcements__content">
              <h4 className="system-announcements__title">
                {ann.content.title}
              </h4>
              <p className="system-announcements__body">
                {ann.content.body}
              </p>
            </div>

            {ann.isDismissible && (
              <button
                onClick={() => handleDismiss(ann.announcementId)}
                aria-label="Dismiss announcement"
                className="system-announcements__dismiss"
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
