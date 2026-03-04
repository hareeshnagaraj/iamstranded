"use client";

import { ArrowRight, MapPin, Plane } from "lucide-react";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
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
  onOriginChange: (value: string, coords?: { lat: number; lon: number }) => void;
  onDestinationChange: (value: string, coords?: { lat: number; lon: number }) => void;
  onSearch: () => void;
}) {
  return (
    <div className="border border-neutral-800 bg-obsidian">
      {/* Status bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse bg-red-500" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-red-500">
            Active Crisis
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-600">
          Updated 4m ago
        </span>
      </div>

      {/* Hero */}
      <div className="px-5 pb-5 pt-6">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
          {crisis.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          {crisis.description}
        </p>

        {/* Search inputs */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <LocationAutocomplete
            value={origin}
            onChange={onOriginChange}
            placeholder="Your location"
            icon={MapPin}
          />
          <LocationAutocomplete
            value={destination}
            onChange={onDestinationChange}
            placeholder="Destination"
            icon={Plane}
          />
          <button
            onClick={onSearch}
            disabled={loading}
            className="flex shrink-0 items-center justify-center gap-2 border border-text-primary bg-text-primary px-6 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.1em] text-obsidian transition-colors hover:bg-neutral-200 disabled:cursor-wait disabled:opacity-70"
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
    </div>
  );
}
