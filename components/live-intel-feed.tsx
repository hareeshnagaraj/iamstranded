"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Car,
  Plane,
  Shield,
} from "lucide-react";
import { FilterChips } from "@/components/ui/filter-chips";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { FeedCategory, IntelFeedItem } from "@/types/crisis";

const categoryColor: Record<string, string> = {
  flight: "text-status-info",
  ground: "text-status-warning",
  accommodation: "text-[#8B5CF6]",
  embassy: "text-status-open",
  safety: "text-status-closed",
};

const categoryLabel: Record<string, string> = {
  flight: "Flight Status",
  ground: "Ground Transport",
  accommodation: "Accommodation",
  embassy: "Embassy",
  safety: "Safety",
};

function CategoryIcon({ category }: { category: string }) {
  const size = 14;
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
}

export function LiveIntelFeed({ feed: initialFeed, crisisId }: LiveIntelFeedProps) {
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

  const filtered =
    filter === "all" ? feed : feed.filter((f) => f.category === filter);

  return (
    <div className="mb-8">
      <h2 className="mb-3.5 text-base font-semibold">Live Intel</h2>
      <div className="mb-4">
        <FilterChips active={filter} onChange={setFilter} />
      </div>
      <div className="rounded-lg border border-border-subtle bg-surface-secondary px-4 py-0.5">
        {filtered.map((item, i) => (
          <div
            key={item.id}
            className={`py-3.5 ${
              i < filtered.length - 1 ? "border-b border-border-subtle" : ""
            }`}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span className={categoryColor[item.category]}>
                <CategoryIcon category={item.category} />
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.06em] ${categoryColor[item.category]}`}
              >
                {categoryLabel[item.category] ?? item.category}
              </span>
              <span className="ml-auto font-mono text-[10px] text-text-tertiary">
                {timeAgo(item.createdAt)}
              </span>
            </div>
            <p className="text-[13px] leading-snug text-text-secondary">
              {item.message}
            </p>
            <span className="mt-1 block text-[11px] text-text-tertiary">
              {item.source}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-text-tertiary">
            No updates in this category.
          </p>
        )}
      </div>
    </div>
  );
}
