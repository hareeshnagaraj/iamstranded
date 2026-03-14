import type { CrisisEvent } from "@/types/crisis";
import { CrisisCard } from "@/components/crisis-card";

export function CrisisGrid({ crises }: { crises: CrisisEvent[] }) {
  return (
    <section className="pb-16">
      <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
        Active Crises
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {crises.map((crisis) => (
          <CrisisCard key={crisis.id} crisis={crisis} />
        ))}
      </div>
    </section>
  );
}
