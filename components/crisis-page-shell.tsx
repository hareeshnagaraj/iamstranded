"use client";

import { useCallback, useMemo, useState } from "react";
import { CrisisBanner } from "@/components/crisis-banner";
import { LoadingShimmer } from "@/components/loading-shimmer";
import { RouteList } from "@/components/route-list";
import { AirportTable } from "@/components/airport-table";
import { LodgingTable } from "@/components/lodging-table";
import { EmergencyContacts } from "@/components/emergency-contacts";
import { LiveIntelFeed } from "@/components/live-intel-feed";
import { NearbyAirportsProvider } from "@/components/nearby-airports-provider";
import { useNearbyPlaces } from "@/hooks/use-nearby-places";
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
  suggestedDestinations: string[];
}

export function CrisisPageShell({
  data,
}: {
  data: ShellData;
}) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchRoutes, setSearchRoutes] = useState<Route[] | null>(null);
  const [originCoords, setOriginCoords] = useState<{ lat: number; lon: number } | null>(null);

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

  // Fetch dynamic airports/lodging based on user location
  const dynamicPlaces = useNearbyPlaces(userCoords, data.crisis.id);

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

  // Use dynamic airports when available, fall back to crisis data
  const baseAirports = dynamicPlaces?.airports ?? data.airports;
  const baseLodging = dynamicPlaces?.lodging ?? data.lodging;

  // Compute user-relative distances and sort airports
  const sortedAirports = useMemo(() => {
    if (!userCoords) return baseAirports;

    const withUserDistance: (Airport & { userDistanceKm: number })[] =
      baseAirports.map((ap) => ({
        ...ap,
        userDistanceKm: Math.round(
          haversineKm(userCoords.lat, userCoords.lon, ap.latitude, ap.longitude),
        ),
      }));

    return withUserDistance.sort((a, b) => a.userDistanceKm - b.userDistanceKm);
  }, [baseAirports, userCoords]);

  // Compute user-relative distances and sort lodging
  const sortedLodging = useMemo(() => {
    if (!userCoords) return baseLodging;

    return baseLodging
      .map((l) => ({
        ...l,
        userDistanceKm: Math.round(
          haversineKm(userCoords.lat, userCoords.lon, l.latitude, l.longitude),
        ),
      }))
      .sort((a, b) => a.userDistanceKm - b.userDistanceKm);
  }, [baseLodging, userCoords]);

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
            suggestedDestinations={data.suggestedDestinations}
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
