"use client";

export function LoadingShimmer({ origin }: { origin: string }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-neutral-600">
        <span className="inline-block h-1.5 w-1.5 animate-blink bg-amber-500" />
        Analyzing routes from {origin}...
      </div>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="mb-3 border border-neutral-800 bg-[#0A0A0A] p-4"
        >
          <div className="mb-2.5 h-3.5 w-full animate-shimmer bg-[#111111]" />
          <div className="mb-2.5 h-3 w-4/5 animate-shimmer bg-[#111111]" />
          <div className="h-3 w-3/5 animate-shimmer bg-[#111111]" />
        </div>
      ))}
    </div>
  );
}
