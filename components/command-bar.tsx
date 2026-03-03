import type { ConnectivityState } from "@/types/crisis";
import { SystemStatus } from "@/components/system-status";

export function CommandBar({ initialStatus }: { initialStatus: ConnectivityState }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-neutral-800 bg-[#050505]">
      <div className="mx-auto flex h-12 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          Crisis Routing Instrument
        </p>
        <SystemStatus initialStatus={initialStatus} />
      </div>
    </header>
  );
}
