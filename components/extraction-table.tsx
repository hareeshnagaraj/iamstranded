import type { ExtractionOption } from "@/types/crisis";

function formatMode(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function ExtractionTable({
  options,
  maxItems = 6,
}: {
  options: ExtractionOption[];
  maxItems?: number;
}) {
  const visibleOptions = options.slice(0, maxItems);

  return (
    <section className="flex h-full min-h-[220px] flex-col border border-neutral-800">
      <header className="border-b border-neutral-800 px-4 py-3">
        <h2 className="font-heading text-lg tracking-[0.04em] text-white">Alternative Extraction</h2>
      </header>

      <div className="grid grid-cols-[140px_1fr] border-b border-neutral-800 px-4 py-2 font-ui text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        <span>Mode</span>
        <span>Distance / Status</span>
      </div>

      <ul className="min-h-0 flex-1 overflow-hidden">
        {visibleOptions.map((option, index) => {
          const isClosed = option.status === "closed";

          return (
            <li
              key={option.id}
              className={`grid grid-cols-[140px_1fr] items-start gap-2 px-4 py-3 ${
                index < visibleOptions.length - 1 ? "border-b border-neutral-800" : ""
              }`}
            >
              <p className="font-mono text-sm uppercase text-white">{formatMode(option.mode)}</p>
              <div>
                <p className={`font-mono text-sm ${isClosed ? "text-critical" : "text-white"}`}>
                  {option.distanceKm} km · {option.status.toUpperCase()}
                </p>
                <p className="mt-1 font-ui text-xs text-neutral-400">{option.note}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
