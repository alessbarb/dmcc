import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Send, User } from "lucide-react";
import type { TranslationKey } from "@shared/i18n/types.js";
import { requestPlayerCharacterLink } from "../../shared/api/webProductClient.js";

function runCharacterSelectionAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

interface PortalCharacter {
  entityId: string;
  title: string;
  summary?: string;
}

export interface PlayerCharacterSelectionCardProps {
  campaignId: string;
  payload: {
    linkedCharacter?: PortalCharacter | null;
    availableCharacters?: PortalCharacter[];
  };
  reload: () => Promise<void>;
  t: (key: TranslationKey) => string;
}

export function PlayerCharacterSelectionCard({ campaignId, payload, reload, t }: PlayerCharacterSelectionCardProps) {
  const characters = Array.isArray(payload.availableCharacters) ? payload.availableCharacters : [];
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedCharacterId, setSubmittedCharacterId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCharacterId("");
    setSubmittedCharacterId(null);
    setError(null);
  }, [campaignId, payload.linkedCharacter?.entityId]);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.entityId === selectedCharacterId) ?? null,
    [characters, selectedCharacterId],
  );

  if (payload.linkedCharacter) {
    return (
      <section className="card" style={{ padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t("playerPortal.character.heading")}</h2>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <User size={22} aria-hidden="true" />
          <div>
            <strong>{payload.linkedCharacter.title}</strong>
            <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
              {payload.linkedCharacter.summary ?? t("playerPortal.empty.noVisibleSummary")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card" style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{t("playerPortal.character.heading")}</h2>
      <p style={{ color: "var(--text-muted)" }}>{t("playerPortal.character.notLinked")}</p>

      {characters.length === 0 ? (
        <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>{t("playerPortal.empty.nothingYet")}</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <label className="player-portal-field" htmlFor="player-character-selection">
            <span>{t("playerPortal.character.heading")}</span>
            <select
              id="player-character-selection"
              className="form-select"
              value={selectedCharacterId}
              onChange={(event) => {
                setSelectedCharacterId(event.target.value);
                setSubmittedCharacterId(null);
                setError(null);
              }}
            >
              <option value="">—</option>
              {characters.map((character) => (
                <option key={character.entityId} value={character.entityId}>{character.title}</option>
              ))}
            </select>
          </label>

          {selectedCharacter && (
            <article style={{ border: "1px solid var(--border-color)", borderRadius: 12, padding: 12 }}>
              <strong>{selectedCharacter.title}</strong>
              <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
                {selectedCharacter.summary ?? t("playerPortal.empty.noVisibleSummary")}
              </p>
            </article>
          )}

          {error && <p role="alert" style={{ color: "var(--color-danger)", margin: 0 }}>{error}</p>}
          {submittedCharacterId && (
            <p role="status" aria-live="polite" style={{ margin: 0 }}>
              <CheckCircle2 size={16} aria-hidden="true" /> {t("playerPortal.character.requestSent")}
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedCharacter || submitting || submittedCharacterId === selectedCharacter?.entityId}
            aria-busy={submitting}
            onClick={() => {
              if (!selectedCharacter) return;
              runCharacterSelectionAction((async () => {
                setSubmitting(true);
                setError(null);
                try {
                  await requestPlayerCharacterLink(campaignId, {
                    characterEntityId: selectedCharacter.entityId,
                    characterTitle: selectedCharacter.title,
                  });
                  setSubmittedCharacterId(selectedCharacter.entityId);
                  await reload();
                } catch (requestError) {
                  setError(requestError instanceof Error ? requestError.message : String(requestError));
                } finally {
                  setSubmitting(false);
                }
              })(), "No se pudo solicitar el personaje.");
            }}
          >
            <Send size={16} aria-hidden="true" /> {t("playerPortal.character.requestAction")}
          </button>
        </div>
      )}
    </section>
  );
}
