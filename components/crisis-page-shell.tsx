"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CrisisBanner } from "@/components/crisis-banner";
import { LoadingShimmer } from "@/components/loading-shimmer";
import { RouteList } from "@/components/route-list";
import { AirportTable } from "@/components/airport-table";
import { LodgingTable } from "@/components/lodging-table";
import { EmergencyContacts } from "@/components/emergency-contacts";
import { LiveIntelFeed } from "@/components/live-intel-feed";
import { NearbyAirportsProvider } from "@/components/nearby-airports-provider";
import { haversineKm } from "@/lib/geo";
import type {
  Airport,
  CrisisEvent,
  EmergencyContact,
  IntelFeedItem,
  Lodging,
  Route,
} from "@/types/crisis";

interface ShellData {
  crisis: CrisisEvent;
  airports: Airport[];
  lodging: Lodging[];
  feed: IntelFeedItem[];
  contacts: EmergencyContact[];
}

export function CrisisPageShell({
  data,
}: {
  data: ShellData;
}) {
  const [origin, setOrigin] = useState("Al Nahda, Dubai");
  const [destination, setDestination] = useState("Athens, Greece");
  const [loading, setLoading] = useState(false);
  const [searchRoutes, setSearchRoutes] = useState<Route[] | null>(null);
  const [originCoords, setOriginCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Auto-detect user location via browser geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
            { headers: { "User-Agent": "iamstranded/1.0" } },
          );
          if (!res.ok) return;
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "";
          const country = data.address?.country || "";
          const placeName = [city, country].filter(Boolean).join(", ");
          if (placeName) setOrigin(placeName);
        } catch {
          // silently keep default origin
        }
      },
      () => {
        // permission denied or error — keep default
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearchRoutes(null);

    try {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crisisId: data.crisis.id,
          origin,
          destination,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSearchRoutes(json.routes ?? []);
      } else {
        setSearchRoutes([]);
      }
    } catch {
      setSearchRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const userCoords = originCoords;

  const onOriginChange = useCallback(
    (value: string, coords?: { lat: number; lon: number }) => {
      setOrigin(value);
      // When coords provided (autocomplete selection), use them directly.
      // When not (manual typing), clear — autocomplete's onAutoGeocode will provide coords.
      setOriginCoords(coords ?? null);
    },
    [],
  );

  // Coords from autocomplete search results (first hit) — no separate Nominatim call needed
  const onOriginAutoGeocode = useCallback(
    (coords: { lat: number; lon: number }) => {
      setOriginCoords(coords);
    },
    [],
  );

  // Compute user-relative distances and sort airports
  const sortedAirports = useMemo(() => {
    if (!userCoords) return data.airports;

    const withUserDistance: (Airport & { userDistanceKm: number })[] =
      data.airports.map((ap) => ({
        ...ap,
        userDistanceKm: Math.round(
          haversineKm(userCoords.lat, userCoords.lon, ap.latitude, ap.longitude),
        ),
      }));

    return withUserDistance.sort((a, b) => a.userDistanceKm - b.userDistanceKm);
  }, [data.airports, userCoords]);

  // Compute user-relative distances and sort lodging
  const sortedLodging = useMemo(() => {
    if (!userCoords) return data.lodging;

    return data.lodging
      .map((l) => ({
        ...l,
        userDistanceKm: Math.round(
          haversineKm(userCoords.lat, userCoords.lon, l.latitude, l.longitude),
        ),
      }))
      .sort((a, b) => a.userDistanceKm - b.userDistanceKm);
  }, [data.lodging, userCoords]);

  // Top 3 nearest airport codes for "Near you" feed matching
  const nearbyAirportCodes = useMemo(() => {
    if (!userCoords) return [];
    return sortedAirports.slice(0, 3).map((ap) => ap.airportCode);
  }, [sortedAirports, userCoords]);

  const displayRoutes = searchRoutes ?? null;
  const showShimmer = loading;
  const showRoutes = !loading && displayRoutes !== null;

  return (
    <NearbyAirportsProvider codes={nearbyAirportCodes}>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* LEFT: Live Intel — sticky scrollable sidebar */}
        <div className="flex flex-col max-h-[60vh] overflow-hidden lg:sticky lg:top-4 lg:self-start lg:w-[380px] lg:shrink-0 lg:max-h-[calc(100vh-2rem)]">
          <LiveIntelFeed feed={data.feed} crisisId={data.crisis.id} />
        </div>

        {/* RIGHT: Everything else — scrolls normally */}
        <div className="flex-1 space-y-8 min-w-0">
          <CrisisBanner
            crisis={data.crisis}
            origin={origin}
            destination={destination}
            loading={loading}
            onOriginChange={onOriginChange}
            onOriginAutoGeocode={onOriginAutoGeocode}
            onDestinationChange={setDestination}
            onSearch={handleSearch}
          />

          {showShimmer && <LoadingShimmer origin={origin} />}
          {showRoutes && <RouteList routes={displayRoutes} />}

          <AirportTable
            airports={sortedAirports}
            origin={userCoords ? origin : null}
          />

          <LodgingTable
            lodging={sortedLodging}
            origin={userCoords ? origin : null}
          />

          <EmergencyContacts contacts={data.contacts} />
        </div>
      </div>
    </NearbyAirportsProvider>
  );
}
