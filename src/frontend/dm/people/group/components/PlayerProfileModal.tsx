import { useState } from "react";
import { X } from "lucide-react";
import type { CampaignStateStore, PlayerProfile } from "../../../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../../shared/i18n/useTranslation.js";
import { ImagePickerButton } from "../../../../shared/components/ImagePickerButton.js";
import "../../../../shared/styles/features/player-profile-modal.css";

interface PlayerFormValues {
  name: string;
  displayName: string;
  email: string;
  imageUrl: string;
  avatarUrl: string;
}

const EMPTY_PLAYER_FORM: PlayerFormValues = { name: "", displayName: "", email: "", imageUrl: "", avatarUrl: "" };

function playerToFormValues(player: PlayerProfile): PlayerFormValues {
  return {
    name: player.name,
    displayName: player.displayName ?? player.name,
    email: player.email ?? "",
    imageUrl: player.imageUrl ?? "",
    avatarUrl: player.avatarUrl ?? "",
  };
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function PlayerProfileModal({
  editingPlayer,
  onClose,
  createPlayer,
  updatePlayer,
  addToast,
}: {
  editingPlayer: PlayerProfile | null;
  onClose: () => void;
  createPlayer: CampaignStateStore["createPlayer"];
  updatePlayer: CampaignStateStore["updatePlayer"];
  addToast: (msg: string, kind?: ToastKind) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<PlayerFormValues>(editingPlayer ? playerToFormValues(editingPlayer) : EMPTY_PLAYER_FORM);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const displayName = form.displayName.trim() || form.name.trim();
    const email = form.email.trim() || null;
    const imageUrl = form.imageUrl.trim();
    const avatarUrl = form.avatarUrl.trim();

    setBusy(true);
    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.playerId, { name: form.name.trim(), displayName, email, imageUrl, avatarUrl });
        addToast(t("players.profileUpdated", { name: displayName }), "success");
      } else {
        await createPlayer(form.name.trim(), displayName, email ?? undefined, imageUrl, avatarUrl);
        addToast(t("players.profileCreated", { name: displayName }), "success");
      }
      onClose();
    } catch (err) {
      addToast(t("players.profileSaveError", { error: errorMessage(err) }), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content player-profile-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 className="player-profile-modal__title">{editingPlayer ? t("players.editProfile") : t("players.addPlayer")}</h3>
          <button type="button" className="btn btn-icon btn-secondary" onClick={onClose} aria-label={t("common.close")}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={(event) => { void handleSubmit(event); }}>
          <div className="modal-body player-profile-modal__body">
            <div className="form-group player-profile-modal__field">
              <label className="form-label" htmlFor="player-name">{t("players.realNameLabel")}</label>
              <input
                id="player-name"
                className="form-input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder={t("players.realNamePlaceholder")}
                required
                autoFocus
              />
            </div>
            <div className="form-group player-profile-modal__field">
              <label className="form-label" htmlFor="player-display-name">{t("players.displayNameLabel")}</label>
              <input
                id="player-display-name"
                className="form-input"
                value={form.displayName}
                onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                placeholder={t("players.displayNamePlaceholder")}
              />
            </div>
            <div className="form-group player-profile-modal__field">
              <label className="form-label" htmlFor="player-email">{t("players.emailLabel")}</label>
              <input
                id="player-email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder={t("players.emailPlaceholder")}
              />
            </div>
            <div className="form-group player-profile-modal__field">
              <label className="form-label">{t("players.avatarLabel")}</label>
              <ImagePickerButton
                value={form.imageUrl || form.avatarUrl || ""}
                onChange={(path) => setForm({ ...form, imageUrl: path, avatarUrl: "" })}
                catalog="avatars"
                defaultImage="/assets/avatars/default-avatar.webp"
                shape="circle"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy || !form.name.trim()}>
              {busy ? t("common.saving") : editingPlayer ? t("common.saveChanges") : t("players.addPlayer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
