import { Pill, type PillProps } from "../../../shared/components/Pill.js";

export interface AttentionQueueItem {
  key: string;
  label: string;
  count: number;
  tone: Extract<NonNullable<PillProps["tone"]>, "danger" | "warning">;
}

interface AttentionQueueProps {
  items: AttentionQueueItem[];
  total: number;
  emptyMessage: string;
  onSelect: (item: AttentionQueueItem) => void;
}

/** Actionable attention rows; an empty queue is a valid campaign state. */
export function AttentionQueue({ items, total, emptyMessage, onSelect }: AttentionQueueProps) {
  return (
    <div className="dashboard-attention-queue">
      {items.length === 0 ? <p className="dashboard-empty-message">{emptyMessage}</p> : items.map((item) => (
        <button key={item.key} type="button" className="dashboard-attention-queue__row" onClick={() => onSelect(item)}>
          <Pill tone={item.tone}>{item.count}</Pill><span>{item.label}</span><span aria-hidden="true">→</span>
        </button>
      ))}
      <span className="sr-only">Total attention items: {total}</span>
    </div>
  );
}
