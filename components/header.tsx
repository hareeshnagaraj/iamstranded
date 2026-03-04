export function Header() {
  return (
    <header className="border-b border-neutral-800 bg-obsidian px-5 py-3">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.15em] text-text-primary">
            IAMSTRANDED
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-600 sm:inline">
            / CRISIS INTEL
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs text-neutral-600">((</span>
          <span className="inline-block h-1.5 w-1.5 animate-blink bg-emerald-500" />
          <span className="font-mono text-xs text-neutral-600">))</span>
          <span className="ml-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
            LIVE
          </span>
        </div>
      </div>
    </header>
  );
}
