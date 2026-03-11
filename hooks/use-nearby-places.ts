import { useEffect, useState, useRef } from "react";
import type { Airport, Lodging } from "@/types/crisis";

interface NearbyPlaces {
  airports: Airport[];
  lodging: Lodging[];
}

// Client-side cache by rounded coords
const clientCache = new Map<string, { data: NearbyPlaces; expiry: number }>();
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;

function roundedKey(lat: number, lon: number, crisisId: string): string {
  return `${lat.toFixed(1)},${lon.toFixed(1)},${crisisId}`;
}

export function useNearbyPlaces(
  coords: { lat: number; lon: number } | null,
  crisisId: string,
): NearbyPlaces | null {
  const [data, setData] = useState<NearbyPlaces | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!coords) {
      setData(null);
      return;
    }

    // Check client cache
    const key = roundedKey(coords.lat, coords.lon, crisisId);
    const cached = clientCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      setData(cached.data);
      return;
    }

    // Debounce 400ms
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/nearby-places?lat=${coords.lat}&lon=${coords.lon}&crisisId=${encodeURIComponent(crisisId)}`,
        );
        if (!res.ok) return;

        const result = (await res.json()) as NearbyPlaces;
        clientCache.set(key, { data: result, expiry: Date.now() + CLIENT_CACHE_TTL_MS });
        setData(result);
      } catch {
        // Keep previous data on error
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [coords?.lat, coords?.lon, crisisId]); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}
