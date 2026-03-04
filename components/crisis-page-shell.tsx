"use client";

import { useEffect, useState } from "react";
import { CrisisBanner } from "@/components/crisis-banner";
import { LoadingShimmer } from "@/components/loading-shimmer";
import { RouteList } from "@/components/route-list";
import { AirportTable } from "@/components/airport-table";
import { LiveIntelFeed } from "@/components/live-intel-feed";
import { EmergencyContacts } from "@/components/emergency-contacts";
import type { CrisisPayload, Route } from "@/types/crisis";

export function CrisisPageShell({ data }: { data: CrisisPayload }) {
  const [origin, setOrigin] = useState("Al Nahda, Dubai");
  const [destination, setDestination] = useState("Athens, Greece");
  const [loading, setLoading] = useState(false);
  const [searchRoutes, setSearchRoutes] = useState<Route[] | null>(null);

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
        setSearchRoutes(json.routes ?? data.routes);
      } else {
        // Fallback to pre-loaded routes on error
        setSearchRoutes(data.routes);
      }
    } catch {
      setSearchRoutes(data.routes);
    } finally {
      setLoading(false);
    }
  };

  const displayRoutes = searchRoutes ?? null;
  const showShimmer = loading;
  const showRoutes = !loading && displayRoutes !== null;

  return (
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
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onSearch={handleSearch}
        />

        {showShimmer && <LoadingShimmer origin={origin} />}
        {showRoutes && <RouteList routes={displayRoutes} />}

        <AirportTable airports={data.airports} />

        <EmergencyContacts contacts={data.contacts} />
      </div>
    </div>
  );
}
