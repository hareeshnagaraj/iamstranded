"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Car,
  ExternalLink,
  Plane,
  Shield,
} from "lucide-react";
import { FilterChips } from "@/components/ui/filter-chips";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { FeedCategory, IntelFeedItem } from "@/types/crisis";

const categoryColor: Record<string, string> = {
  flight: "text-blue-500",
  ground: "text-amber-500",
  accommodation: "text-violet-500",
  embassy: "text-emerald-500",
  safety: "text-red-500",
};

const categoryLabel: Record<string, string> = {
  flight: "Flight Status",
  ground: "Ground Transport",
  accommodation: "Accommodation",
  embassy: "Embassy",
  safety: "Safety",
};

function CategoryIcon({ category }: { category: string }) {
  const size = 13;
  switch (category) {
    case "flight":
      return <Plane size={size} />;
    case "ground":
      return <Car size={size} />;
    case "accommodation":
      return <Building2 size={size} />;
    case "embassy":
      return <Shield size={size} />;
    case "safety":
      return <AlertTriangle size={size} />;
    default:
      return null;
  }
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface LiveIntelFeedProps {
  feed: IntelFeedItem[];
  crisisId: string;
  nearbyAirportCodes?: string[];
}

export function LiveIntelFeed({
  feed: initialFeed,
  crisisId,
  nearbyAirportCodes = [],
}: LiveIntelFeedProps) {
  const [feed, setFeed] = useState(initialFeed);
  const [filter, setFilter] = useState("all");

  // Realtime subscription for new intel_feed rows
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`intel-feed-${crisisId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "intel_feed",
          filter: `crisis_id=eq.${crisisId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const item: IntelFeedItem = {
            id: String(row.id),
            crisisId: String(row.crisis_id),
            category: (row.category as FeedCategory) ?? "flight",
            message: String(row.message),
            source: String(row.source ?? ""),
            sourceUrl: row.source_url ? String(row.source_url) : null,
            createdAt: String(row.created_at ?? new Date().toISOString()),
          };
          setFeed((prev) => [item, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [crisisId]);

  // Check if a feed item mentions any nearby airport code
  const isNearUser = (item: IntelFeedItem): boolean => {
    if (nearbyAirportCodes.length === 0) return false;
    const msg = item.message.toUpperCase();
    return nearbyAirportCodes.some((code) => msg.includes(code));
  };

  const filtered = (() => {
    const base =
      filter === "all" ? feed : feed.filter((f) => f.category === filter);
    if (nearbyAirportCodes.length === 0) return base;
    // Soft-sort: "near you" items first, preserving time order within each group
    const near = base.filter(isNearUser);
    const rest = base.filter((item) => !isNearUser(item));
    return [...near, ...rest];
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between border-b border-neutral-800 pb-3">
        <h2 className="font-display text-lg font-bold text-text-primary">
          Live Intel
        </h2>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 animate-blink bg-emerald-500" />
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-600">
            Real-time
          </span>
        </span>
      </div>

      <div className="mb-3 shrink-0">
        <FilterChips active={filter} onChange={setFilter} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border border-neutral-800">
        {filtered.map((item, i) => (
          <div
            key={item.id}
            className={`px-4 py-3.5 ${
              i < filtered.length - 1 ? "border-b border-neutral-800" : ""
            }`}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span className={categoryColor[item.category]}>
                <CategoryIcon category={item.category} />
              </span>
              <span
                className={`font-mono text-[9px] font-semibold uppercase tracking-[0.12em] ${categoryColor[item.category]}`}
              >
                {categoryLabel[item.category] ?? item.category}
              </span>
              {isNearUser(item) && (
                <span className="rounded-sm bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-500">
                  Near you
                </span>
              )}
              <span className="ml-auto font-mono text-[10px] uppercase tracking-tight text-neutral-700">
                {timeAgo(item.createdAt)}
              </span>
            </div>
            <p className="text-[13px] leading-snug text-neutral-400">
              {item.message}
            </p>
            {item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-600 transition-colors hover:text-neutral-400"
              >
                {item.source}
                <ExternalLink size={9} />
              </a>
            ) : (
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-700">
                {item.source}
              </span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-700">
            No updates in this category.
          </p>
        )}
      </div>
    </div>
  );
}
