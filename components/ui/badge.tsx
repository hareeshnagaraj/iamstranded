import type { AirportStatus } from "@/types/crisis";

const statusColors: Record<AirportStatus, { dot: string; text: string; bg: string }> = {
  open: { dot: "bg-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10" },
  warning: { dot: "bg-amber-500", text: "text-amber-500", bg: "bg-amber-500/10" },
  closed: { dot: "bg-red-500", text: "text-red-500", bg: "bg-red-500/10" },
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
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${c.text} ${c.bg}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 ${c.dot}`} />
      {label}
    </span>
  );
}
