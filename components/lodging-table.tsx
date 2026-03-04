import type { Lodging, LodgingStatus } from "@/types/crisis";

interface LodgingWithUserDistance extends Lodging {
  userDistanceKm?: number;
}

interface LodgingTableProps {
  lodging: LodgingWithUserDistance[];
  origin?: string | null;
}

const statusColors: Record<LodgingStatus, { dot: string; text: string; bg: string }> = {
  available: { dot: "bg-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10" },
  limited: { dot: "bg-amber-500", text: "text-amber-500", bg: "bg-amber-500/10" },
  full: { dot: "bg-red-500", text: "text-red-500", bg: "bg-red-500/10" },
  closed: { dot: "bg-red-500", text: "text-red-500", bg: "bg-red-500/10" },
  shelter: { dot: "bg-teal-400", text: "text-teal-400", bg: "bg-teal-400/10" },
};

function LodgingBadge({ status, label }: { status: LodgingStatus; label: string }) {
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

export function LodgingTable({ lodging, origin }: LodgingTableProps) {
  const hasUserDistance = lodging.some((l) => l.userDistanceKm != null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
        <h2 className="font-display text-lg font-bold text-text-primary">
          Lodging Status
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-600">
          {hasUserDistance && origin ? `From ${origin}` : "Nearby"}
        </span>
      </div>
      <div className="overflow-x-auto border border-neutral-800">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-[#0A0A0A]">
              <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Name
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Status
              </th>
              <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Rooms
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Price
              </th>
              <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Distance
              </th>
            </tr>
          </thead>
          <tbody>
            {lodging.map((l, i) => (
              <tr
                key={l.id}
                className={`${
                  i < lodging.length - 1 ? "border-b border-neutral-800" : ""
                } hover:bg-[#0A0A0A]`}
              >
                <td className="px-4 py-2.5 text-[13px] text-text-primary">
                  <span>{l.name}</span>
                  {l.notes && (
                    <span className="ml-2 text-[11px] text-neutral-600">
                      — {l.notes}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <LodgingBadge status={l.status} label={l.statusLabel} />
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-[11px] tracking-tight text-neutral-500">
                  {l.availableRooms != null ? l.availableRooms : "—"}
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px] tracking-tight text-neutral-500">
                  {l.priceRange ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-[11px] uppercase tracking-tight text-neutral-600">
                  {l.userDistanceKm != null
                    ? `${l.userDistanceKm} km`
                    : `${l.distanceKm} km`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
