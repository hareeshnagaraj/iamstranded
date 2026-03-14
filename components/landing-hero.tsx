export function LandingHero({ crisisCount }: { crisisCount: number }) {
  return (
    <section className="pb-10 pt-16 sm:pb-14 sm:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-bold uppercase tracking-[0.08em] text-text-primary sm:text-5xl md:text-6xl">
          IAMSTRANDED
        </h1>

        <p className="mx-auto mt-4 max-w-xl font-mono text-sm leading-relaxed text-text-secondary sm:text-base">
          Crisis travel intelligence — real-time escape routes for stranded
          travelers.
        </p>

        <div className="mt-8 inline-flex items-center gap-2.5 rounded border border-neutral-800 bg-surface-secondary px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-status-closed opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-closed" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-text-secondary">
            {crisisCount} active{" "}
            {crisisCount === 1 ? "crisis" : "crises"} tracked
          </span>
        </div>
      </div>
    </section>
  );
}
