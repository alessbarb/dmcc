export type AccountModuleId =
  | "account"
  | "dm-profile"
  | "player-profiles"
  | "privacy"
  | "appearance"
  | "notifications"
  | "security"
  | "data";

export const ACCOUNT_MODULES: Array<{ id: AccountModuleId; label: string }> = [
  { id: "account", label: "Account" },
  { id: "dm-profile", label: "DM profile" },
  { id: "player-profiles", label: "Player profiles" },
  { id: "privacy", label: "Privacy" },
  { id: "appearance", label: "Appearance" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "data", label: "Your data" },
];

export function AccountNav({
  active,
  onSelect,
}: {
  active: AccountModuleId;
  onSelect(id: AccountModuleId): void;
}) {
  return (
    <nav className="account-nav" aria-label="Account settings">
      {ACCOUNT_MODULES.map((module) => (
        <button
          type="button"
          key={module.id}
          aria-current={active === module.id ? "page" : undefined}
          onClick={() => onSelect(module.id)}
        >
          {module.label}
        </button>
      ))}
    </nav>
  );
}
