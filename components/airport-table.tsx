import { Badge } from "@/components/ui/badge";
import type { Airport } from "@/types/crisis";

export function AirportTable({ airports }: { airports: Airport[] }) {
  return (
    <div className="mb-8">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-base font-semibold">Nearby Airports</h2>
        <span className="font-mono text-[11px] text-text-tertiary">
          500km radius
        </span>
      </div>
      <div className="rounded-lg border border-border-subtle bg-surface-secondary px-4 py-1">
        {airports.map((airport, i) => (
          <div
            key={airport.id}
            className={`flex items-center gap-3 py-2.5 ${
              i < airports.length - 1 ? "border-b border-border-subtle" : ""
            }`}
          >
            <span className="w-9 shrink-0 font-mono text-sm font-semibold text-text-primary">
              {airport.airportCode}
            </span>
            <span className="flex-1 truncate text-[13px] text-text-secondary">
              {airport.airportName}
            </span>
            <Badge status={airport.status} label={airport.statusLabel} />
            <span className="w-[60px] shrink-0 text-right font-mono text-[11px] text-text-tertiary">
              {airport.distanceKm} km
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
