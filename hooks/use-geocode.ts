"use client";

import { useEffect, useRef, useState } from "react";

interface LatLon {
  lat: number;
  lon: number;
}

export function useGeocode(location: string): LatLon | null {
  const [coords, setCoords] = useState<LatLon | null>(null);
  const cache = useRef<Map<string, LatLon>>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = location.trim();
    if (trimmed.length < 3) {
      setCoords(null);
      return;
    }

    // Check cache
    const cached = cache.current.get(trimmed);
    if (cached) {
      setCoords(cached);
      return;
    }

    // Debounce
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`,
          { headers: { "User-Agent": "iamstranded/1.0" } },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.length > 0) {
          const result: LatLon = {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          };
          cache.current.set(trimmed, result);
          setCoords(result);
        }
      } catch {
        // geocode failed — keep previous value
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location]);

  return coords;
}
