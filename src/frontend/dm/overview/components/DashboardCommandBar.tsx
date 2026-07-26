import React from "react";

export interface DashboardCommand {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface DashboardCommandBarProps {
  label: string;
  commands: DashboardCommand[];
  className?: string;
}

/** Primary, action-oriented entry points for the DM command center. */
export function DashboardCommandBar({ label, commands, className = "" }: DashboardCommandBarProps) {
  return (
    <div className={`quick-actions-bar dashboard-section-gap ${className}`.trim()} aria-label={label}>
      {commands.map((command) => (
        <button
          key={command.key}
          className="quick-action-link"
          type="button"
          onClick={command.onClick}
          disabled={command.disabled}
        >
          {command.icon}
          <span>{command.label}</span>
        </button>
      ))}
    </div>
  );
}
