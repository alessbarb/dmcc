import type { ReactNode } from "react";

export interface DmHubDashboardBoardProps {
  campaignsSlot: ReactNode;
  tablesSlot: ReactNode;
  alertsSlot: ReactNode;
  summarySlot: ReactNode;
  activitySlot: ReactNode;
  preparationSlot: ReactNode;
  threadsSlot: ReactNode;
  continuationSlot: ReactNode;
}

export function DmHubDashboardBoard({ campaignsSlot, tablesSlot, alertsSlot, summarySlot, activitySlot, preparationSlot, threadsSlot, continuationSlot }: DmHubDashboardBoardProps) {
  return (
    <div className="dm-hub-board" data-dm-hub-panel="board">
      <div className="dm-hub-board__campaigns">{campaignsSlot}</div>
      <div className="dm-hub-board__right-grid">
        <div className="dm-hub-board__tables">{tablesSlot}</div>
        <div className="dm-hub-board__alerts">{alertsSlot}</div>
        <div className="dm-hub-board__summary">{summarySlot}</div>
        <div className="dm-hub-board__activity">{activitySlot}</div>
        <div className="dm-hub-board__preparation">{preparationSlot}</div>
        <div className="dm-hub-board__threads">{threadsSlot}</div>
        <div className="dm-hub-board__continuation">{continuationSlot}</div>
      </div>
    </div>
  );
}
