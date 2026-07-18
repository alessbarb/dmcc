export type AccountModuleId =
  | "account"
  | "dm-profile"
  | "player-profiles"
  | "privacy"
  | "appearance"
  | "notifications"
  | "security"
  | "data";

import { useTranslation } from "../shared/i18n/useTranslation.js";

const ACCOUNT_MODULES: Array<{ id: AccountModuleId; label: string }> = [
  { id: "account", label: "Account" },
  { id: "dm-profile", label: "DM profile" },
  { id: "player-profiles", label: "Player profiles" },
  { id: "privacy", label: "Privacy" },
  { id: "appearance", label: "Appearance" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "data", label: "Your data" },
];

function getNavKey(id: AccountModuleId) {
  if (id === "dm-profile") return "dmProfile";
  if (id === "player-profiles") return "playerProfiles";
  return id;
}

export function AccountNav({
  active,
  onSelect,
}: {
  active: AccountModuleId;
  onSelect(id: AccountModuleId): void;
}) {
  const { t } = useTranslation();
  return (
    <nav className="account-nav" aria-label={t("account.nav.account")}>
      {ACCOUNT_MODULES.map((module) => (
        <button
          type="button"
          key={module.id}
          aria-current={active === module.id ? "page" : undefined}
          onClick={() => onSelect(module.id)}
        >
          {t(`account.nav.${getNavKey(module.id)}`)}
        </button>
      ))}
    </nav>
  );
}
