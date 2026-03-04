import { Radio } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border-subtle px-5 py-3.5">
      <div className="mx-auto flex max-w-[720px] items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-md border-2 border-accent">
            <div className="h-1 w-1 rounded-full bg-accent" />
            <div
              className="absolute -top-0.5 left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderBottom: "6px solid #F59E0B",
              }}
            />
          </div>
          <span className="text-base font-bold tracking-[0.08em]">
            IAMSTRANDED
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio size={14} className="text-status-open" />
          <span className="font-mono text-[11px] text-status-open">LIVE</span>
        </div>
      </div>
    </header>
  );
}
