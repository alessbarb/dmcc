import type { AccountPreferences, NotificationPreferences } from "./accountTypes.js";

export function NotificationsPanel({
  preferences,
  onChange,
}: {
  preferences: AccountPreferences;
  onChange(value: AccountPreferences): void;
}) {
  return (
    <section aria-labelledby="notifications-title">
      <h2 id="notifications-title">Internal notifications</h2>
      {(Object.keys(preferences.notifications) as Array<keyof NotificationPreferences>).map((key) => (
        <label className="account-checkbox" key={key}>
          <input
            type="checkbox"
            checked={preferences.notifications[key]}
            onChange={(event) => onChange({
              ...preferences,
              notifications: { ...preferences.notifications, [key]: event.target.checked },
            })}
          />
          {key}
        </label>
      ))}
      <h3>Campaign exceptions</h3>
      <p>Campaign-specific overrides will appear here as memberships are configured.</p>
    </section>
  );
}
