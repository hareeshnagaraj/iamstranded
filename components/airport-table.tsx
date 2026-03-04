import { Badge } from "@/components/ui/badge";
import type { Airport } from "@/types/crisis";

interface AirportWithUserDistance extends Airport {
  userDistanceKm?: number;
}

interface AirportTableProps {
  airports: AirportWithUserDistance[];
  origin?: string | null;
}

export function AirportTable({ airports, origin }: AirportTableProps) {
  const hasUserDistance = airports.some((a) => a.userDistanceKm != null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
        <h2 className="font-display text-lg font-bold text-text-primary">
          Airport Telemetry
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-600">
          {hasUserDistance && origin ? `From ${origin}` : "500km radius"}
        </span>
      </div>
      <div className="overflow-x-auto border border-neutral-800">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-[#0A0A0A]">
              <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Code
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Name
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Status
              </th>
              <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                Distance
              </th>
            </tr>
          </thead>
          <tbody>
            {airports.map((airport, i) => (
              <tr
                key={airport.id}
                className={`${
                  i < airports.length - 1 ? "border-b border-neutral-800" : ""
                } hover:bg-[#0A0A0A]`}
              >
                <td className="px-4 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.08em] text-text-primary">
                  {airport.airportCode}
                </td>
                <td className="px-4 py-2.5 text-[13px] text-neutral-500">
                  {airport.airportName}
                </td>
                <td className="px-4 py-2.5">
                  <Badge status={airport.status} label={airport.statusLabel} />
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-[11px] uppercase tracking-tight text-neutral-600">
                  {airport.userDistanceKm != null
                    ? `${airport.userDistanceKm} km`
                    : `${airport.distanceKm} km`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
