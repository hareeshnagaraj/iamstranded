import type { GlobalSignals } from "@/lib/external-apis";

export function GlobalSignalBar({ signals }: { signals: GlobalSignals }) {
  const hasData = signals.earthquakeCount > 0 || signals.advisoryCount > 0;
  if (!hasData) return null;

  return (
    <section className="mb-8">
      <div className="rounded border border-neutral-800 bg-surface-secondary px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-status-warning opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-warning" />
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-status-warning">
              LIVE DATA
            </span>
          </div>

          {signals.earthquakeCount > 0 && (
            <span className="font-mono text-[11px] text-text-secondary">
              <span className="text-text-primary">{signals.earthquakeCount}</span>{" "}
              significant {signals.earthquakeCount === 1 ? "earthquake" : "earthquakes"} in last 30 days
              {signals.earthquakes[0] && (
                <span className="text-text-tertiary">
                  {" "}— latest: M{signals.earthquakes[0].mag.toFixed(1)}{" "}
                  {signals.earthquakes[0].place}
                </span>
              )}
            </span>
          )}

          {signals.advisoryCount > 0 && (
            <span className="font-mono text-[11px] text-text-secondary">
              <span className="text-text-primary">{signals.advisoryCount}</span>{" "}
              countries with updated travel advisories this week
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
