"use client";

import { useState } from "react";
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
    <>
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
      <LiveIntelFeed feed={data.feed} crisisId={data.crisis.id} />
      <EmergencyContacts contacts={data.contacts} />
    </>
  );
}
