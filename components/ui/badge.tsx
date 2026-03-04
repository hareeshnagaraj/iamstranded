import type { AirportStatus } from "@/types/crisis";

const statusColors: Record<AirportStatus, { dot: string; text: string; bg: string }> = {
  open: { dot: "bg-status-open", text: "text-status-open", bg: "bg-status-open/15" },
  warning: { dot: "bg-status-warning", text: "text-status-warning", bg: "bg-status-warning/15" },
  closed: { dot: "bg-status-closed", text: "text-status-closed", bg: "bg-status-closed/15" },
};

export function Badge({
  status,
  label,
}: {
  status: AirportStatus;
  label: string;
}) {
  const c = statusColors[status] ?? statusColors.closed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] ${c.text} ${c.bg}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}
