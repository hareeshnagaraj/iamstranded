"use client";

import { RouteCard } from "@/components/route-card";
import type { Route } from "@/types/crisis";

export function RouteList({ routes }: { routes: Route[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
        <h2 className="font-display text-lg font-bold text-text-primary">
          Routing Engine
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-600">
          {routes.length} options
        </span>
      </div>
      <div className="space-y-3">
        {routes.map((route, i) => (
          <RouteCard key={route.id} route={route} index={i} />
        ))}
      </div>
    </div>
  );
}
