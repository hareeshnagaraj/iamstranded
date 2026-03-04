"use client";

import { ArrowRight, MapPin, Plane } from "lucide-react";
import type { CrisisEvent } from "@/types/crisis";

export function CrisisBanner({
  crisis,
  origin,
  destination,
  loading,
  onOriginChange,
  onDestinationChange,
  onSearch,
}: {
  crisis: CrisisEvent;
  origin: string;
  destination: string;
  loading: boolean;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="mb-6 rounded-lg border-l-[3px] border-l-status-closed bg-surface-secondary p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-status-closed" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-status-closed">
            Active Crisis
          </span>
        </div>
        <span className="font-mono text-[11px] text-text-tertiary">
          Updated 4m ago
        </span>
      </div>

      <h1 className="-tracking-[0.02em] mb-1.5 text-2xl font-bold leading-tight text-text-primary">
        {crisis.title}
      </h1>
      <p className="mb-5 text-sm leading-normal text-text-secondary">
        {crisis.description}
      </p>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[140px] flex-1">
          <MapPin
            size={14}
            className="absolute left-3 top-3 text-text-tertiary"
          />
          <input
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            placeholder="Your location"
            className="w-full rounded-md border border-border-strong bg-surface-elevated py-2.5 pl-[34px] pr-3 text-sm text-text-primary outline-none focus:border-accent"
          />
        </div>
        <div className="relative min-w-[140px] flex-1">
          <Plane
            size={14}
            className="absolute left-3 top-3 text-text-tertiary"
          />
          <input
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="Destination"
            className="w-full rounded-md border border-border-strong bg-surface-elevated py-2.5 pl-[34px] pr-3 text-sm text-text-primary outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={onSearch}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-surface-primary disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? (
            "Analyzing..."
          ) : (
            <>
              Find Routes <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
