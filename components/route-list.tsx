"use client";

import { RouteCard } from "@/components/route-card";
import type { Route } from "@/types/crisis";

export function RouteList({ routes }: { routes: Route[] }) {
  return (
    <div className="mb-8">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-base font-semibold">Your Routes</h2>
        <span className="font-mono text-[11px] text-text-tertiary">
          {routes.length} options
        </span>
      </div>
      {routes.map((route, i) => (
        <RouteCard key={route.id} route={route} index={i} />
      ))}
    </div>
  );
}
