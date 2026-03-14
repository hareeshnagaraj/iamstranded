import Link from "next/link";
import type { CrisisEvent } from "@/types/crisis";

const severityConfig = {
  critical: {
    border: "border-l-status-closed",
    bg: "bg-red-950/40",
    text: "text-status-closed",
    label: "CRITICAL",
  },
  high: {
    border: "border-l-status-warning",
    bg: "bg-amber-950/40",
    text: "text-status-warning",
    label: "HIGH",
  },
  medium: {
    border: "border-l-status-info",
    bg: "bg-blue-950/40",
    text: "text-status-info",
    label: "MEDIUM",
  },
  low: {
    border: "border-l-status-open",
    bg: "bg-emerald-950/40",
    text: "text-status-open",
    label: "LOW",
  },
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function CrisisCard({ crisis }: { crisis: CrisisEvent }) {
  const cfg = severityConfig[crisis.severity];

  return (
    <Link
      href={`/crisis/${crisis.slug}`}
      className={`group block rounded border border-neutral-800 ${cfg.border} border-l-2 bg-surface-secondary transition-colors hover:bg-surface-elevated`}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}
              >
                {cfg.label}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                {crisis.location}
              </span>
            </div>

            <h3 className="font-mono text-sm font-semibold text-text-primary group-hover:text-white">
              {crisis.title}
            </h3>

            <p className="mt-1.5 line-clamp-2 font-mono text-xs leading-relaxed text-text-secondary">
              {crisis.description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
            Updated {timeAgo(crisis.updatedAt)}
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary transition-colors group-hover:text-accent">
            View Intel →
          </span>
        </div>
      </div>
    </Link>
  );
}
