"use client";

export function LoadingShimmer({ origin }: { origin: string }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-[13px] text-text-tertiary">
        <span className="animate-pulse text-accent">&#9679;</span>
        Analyzing routes from {origin}...
      </div>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="mb-3 rounded-lg border border-border-subtle bg-surface-secondary p-4"
        >
          <div className="mb-2.5 h-3.5 w-full animate-shimmer rounded bg-surface-elevated opacity-60" />
          <div className="mb-2.5 h-3 w-4/5 animate-shimmer rounded bg-surface-elevated opacity-60" />
          <div className="h-3 w-3/5 animate-shimmer rounded bg-surface-elevated opacity-60" />
        </div>
      ))}
    </div>
  );
}
