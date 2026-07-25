import type { ReactNode } from "react";

export interface DmHubDashboardBoardProps {
  campaignsSlot: ReactNode;
  tablesSlot: ReactNode;
  alertsSlot: ReactNode;
  summarySlot: ReactNode;
  activitySlot: ReactNode;
}

export function DmHubDashboardBoard({ campaignsSlot, tablesSlot, alertsSlot, summarySlot, activitySlot }: DmHubDashboardBoardProps) {
  return (
    <div className="dm-hub-board" data-dm-hub-panel="board">
      <div className="dm-hub-board__campaigns">{campaignsSlot}</div>
      <div className="dm-hub-board__tables">{tablesSlot}</div>
      <div className="dm-hub-board__alerts">{alertsSlot}</div>
      <div className="dm-hub-board__summary">{summarySlot}</div>
      <div className="dm-hub-board__activity">{activitySlot}</div>
    </div>
  );
}
