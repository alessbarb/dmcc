import type { SupportedLocale } from "../../../../shared/i18n/localeTypes.js";
import { formatActivity } from "../../../shared/presentation/formatActivity.js";
import { formatRelativeTime } from "../../../shared/presentation/formatRelativeTime.js";

export interface RecentActivityItem {
  key: string;
  type: string;
  latestOccurredAt: string;
  data?: Record<string, unknown>;
}

interface RecentActivityTimelineProps {
  items: RecentActivityItem[];
  locale: SupportedLocale;
  emptyMessage: string;
}

export function RecentActivityTimeline({ items, locale, emptyMessage }: RecentActivityTimelineProps) {
  return (
    <div className="dashboard-command-activity">
      {items.length === 0 ? <p className="dashboard-empty-message">{emptyMessage}</p> : items.slice(0, 4).map((item) => (
        <div key={item.key}>
          <strong>{formatActivity({ type: item.type, occurredAt: item.latestOccurredAt, data: item.data }, locale)}</strong>
          <time dateTime={item.latestOccurredAt}>{formatRelativeTime(item.latestOccurredAt, locale)}</time>
        </div>
      ))}
    </div>
  );
}
