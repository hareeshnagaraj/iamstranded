"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  ConnectivityState,
  GroundTruthUpdate,
} from "@/types/crisis";

function dedupeAndSort(rows: GroundTruthUpdate[]): GroundTruthUpdate[] {
  const map = new Map<string, GroundTruthUpdate>();
  for (const row of rows) {
    map.set(row.id, row);
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime(),
  );
}

function dispatchNetworkState(state: ConnectivityState) {
  window.dispatchEvent(new CustomEvent("crisis-network-state", { detail: { state } }));
}

function formatUtc(ts: string): string {
  const date = new Date(ts);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC`;
}

export function GroundTruthFeed({
  regionId,
  initialUpdates,
  maxItems = 8,
}: {
  regionId: string;
  initialUpdates: GroundTruthUpdate[];
  maxItems?: number;
}) {
  const [updates, setUpdates] = useState<GroundTruthUpdate[]>(initialUpdates);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/feed?region=${encodeURIComponent(regionId)}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok || cancelled) {
          dispatchNetworkState("degraded");
          return;
        }

        const payload = (await response.json()) as {
          updates: GroundTruthUpdate[];
        };

        setUpdates((previous) => dedupeAndSort([...payload.updates, ...previous]));
        dispatchNetworkState("stable");
      } catch {
        if (!cancelled) {
          dispatchNetworkState("degraded");
        }
      }
    };

    const interval = window.setInterval(poll, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [regionId]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      dispatchNetworkState("degraded");
      return;
    }

    const channel = supabase
      .channel(`ground-truth-${regionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ground_truth_updates",
          filter: `region_id=eq.${regionId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            region_id: string;
            timestamp_utc: string;
            message: string;
            severity: GroundTruthUpdate["severity"];
            source_label: string;
          };

          const item: GroundTruthUpdate = {
            id: row.id,
            regionId: row.region_id,
            timestampUtc: row.timestamp_utc,
            message: row.message,
            severity: row.severity,
            sourceLabel: row.source_label,
          };

          setUpdates((previous) => dedupeAndSort([item, ...previous]));
          dispatchNetworkState("stable");
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          dispatchNetworkState("stable");
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          dispatchNetworkState("degraded");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [regionId]);

  const renderedUpdates = useMemo(() => updates.slice(0, maxItems), [maxItems, updates]);

  return (
    <section className="flex h-full min-h-[280px] flex-col border border-neutral-800">
      <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <h2 className="font-heading text-lg tracking-[0.04em] text-white">Ground Truth Feed</h2>
        <span className="inline-flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.18em] text-neutral-400">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          Chronological
        </span>
      </header>

      <ul className="min-h-0 flex-1 overflow-hidden">
        {renderedUpdates.map((update, index) => {
          const critical = update.severity === "critical";

          return (
            <li
              key={update.id}
              className={`px-4 py-3 ${index < renderedUpdates.length - 1 ? "border-b border-neutral-800" : ""}`}
            >
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-400">
                {formatUtc(update.timestampUtc)}
                <span className="mx-2 text-neutral-600">|</span>
                {update.sourceLabel}
              </p>
              <p
                className={`mt-1 overflow-hidden font-mono text-[13px] leading-5 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] ${critical ? "text-critical" : "text-white"}`}
              >
                {critical ? "[CRITICAL] " : ""}
                {update.message}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
