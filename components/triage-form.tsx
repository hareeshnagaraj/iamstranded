"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";

type TriageFormProps = {
  initialLocation?: string;
  initialNationality?: string;
  initialLat?: number;
  initialLng?: number;
  compact?: boolean;
};

export function TriageForm({
  initialLocation,
  initialNationality,
  initialLat,
  initialLng,
  compact = false,
}: TriageFormProps) {
  const [lat, setLat] = useState<number | undefined>(initialLat);
  const [lng, setLng] = useState<number | undefined>(initialLng);
  const [geoState, setGeoState] = useState<"idle" | "resolving" | "ready" | "blocked">(
    "idle",
  );

  const requestCoordinates = () => {
    if (!navigator.geolocation) {
      setGeoState("blocked");
      return;
    }

    setGeoState("resolving");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(Number(position.coords.latitude.toFixed(6)));
        setLng(Number(position.coords.longitude.toFixed(6)));
        setGeoState("ready");
      },
      () => {
        setGeoState("blocked");
      },
      {
        enableHighAccuracy: false,
        timeout: 6000,
      },
    );
  };

  const locationHint =
    geoState === "ready"
      ? `GPS locked: ${lat}, ${lng}`
      : geoState === "blocked"
        ? "GPS unavailable. Manual entry enabled."
        : "GPS optional. Manual entry accepted.";

  return (
    <form
      action="/"
      method="get"
      className={`mt-3 w-full border border-neutral-800 ${compact ? "p-3" : "p-4"}`}
    >
      <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-neutral-400">
        Enter current location and nationality
      </p>

      <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_170px_auto]">
        <label className="flex min-h-10 items-center border border-neutral-800 px-3">
          <span className="sr-only">Current location</span>
          <input
            type="text"
            name="location"
            defaultValue={initialLocation}
            placeholder="City, country, checkpoint"
            className="h-full w-full bg-transparent font-ui text-xs text-white placeholder:text-neutral-500 focus:outline-none sm:text-sm"
          />
        </label>

        <label className="flex min-h-10 items-center border border-neutral-800 px-3">
          <span className="sr-only">Nationality</span>
          <input
            type="text"
            name="nationality"
            maxLength={56}
            defaultValue={initialNationality}
            placeholder="Nationality"
            className="h-full w-full bg-transparent font-ui text-xs text-white placeholder:text-neutral-500 focus:outline-none sm:text-sm"
          />
        </label>

        <button
          type="submit"
          className="min-h-10 border border-white px-3 font-ui text-[11px] uppercase tracking-[0.2em] text-white transition-none hover:bg-white hover:text-black focus:bg-white focus:text-black"
        >
          Route
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={requestCoordinates}
          className="inline-flex min-h-9 items-center gap-2 border border-neutral-700 px-3 font-ui text-[11px] uppercase tracking-[0.2em] text-neutral-200 transition-none hover:bg-white hover:text-black focus:bg-white focus:text-black"
        >
          <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
          Use Current Coordinates
        </button>
        <span className="font-mono text-[11px] text-neutral-400">{locationHint}</span>
      </div>

      <input type="hidden" name="lat" value={lat ?? ""} />
      <input type="hidden" name="lng" value={lng ?? ""} />
    </form>
  );
}
