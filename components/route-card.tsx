"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Route } from "@/types/crisis";

const confidenceColor: Record<string, string> = {
  HIGH: "text-status-open",
  MEDIUM: "text-status-warning",
  LOW: "text-text-tertiary",
};

const confidenceDot: Record<string, string> = {
  HIGH: "bg-status-open",
  MEDIUM: "bg-status-warning",
  LOW: "bg-text-tertiary",
};

export function RouteCard({
  route,
  index,
}: {
  route: Route;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const isRecommended = index === 0;

  return (
    <div
      className={`mb-3 rounded-lg border bg-surface-secondary p-4 ${
        isRecommended
          ? "border-accent/30 border-l-[3px] border-l-accent"
          : "border-border-subtle"
      }`}
    >
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-semibold text-text-tertiary">
            #{index + 1}
          </span>
          {isRecommended && (
            <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
              Recommended
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${confidenceDot[route.confidence]}`}
          />
          <span
            className={`font-mono text-[11px] font-medium ${confidenceColor[route.confidence]}`}
          >
            {route.confidence}
          </span>
        </div>
      </div>

      {/* Title + leg codes */}
      <div className="mb-3">
        <div className="mb-1 text-[15px] font-semibold leading-snug text-text-primary">
          {route.title}
        </div>
        <div className="font-mono text-[13px] text-text-secondary">
          {route.legs.map((leg, j) => (
            <span key={leg.id}>
              {j > 0 && (
                <span className="mx-1.5 text-text-tertiary">&rarr;</span>
              )}
              <span
                className={
                  leg.airportStatus === "open"
                    ? "text-status-open"
                    : leg.airportStatus === "warning"
                      ? "text-status-warning"
                      : "text-text-primary"
                }
              >
                {leg.airportCode}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Leg badges */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {route.legs
          .filter((l) => l.flightCode)
          .map((leg) => (
            <div
              key={leg.id}
              className="flex items-center gap-2 rounded bg-surface-elevated px-2.5 py-1.5 text-xs"
            >
              <Badge status={leg.airportStatus} label={leg.airportCode} />
              <span className="font-mono text-[11px] text-text-secondary">
                {leg.flightCode}
              </span>
              <span className="font-mono text-[11px] text-text-tertiary">
                {leg.departureTime}
              </span>
            </div>
          ))}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border-subtle pt-2.5 text-[13px] text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock size={13} className="text-text-tertiary" />
          {route.timeEstimate}
        </span>
        <span className="font-mono text-xs">{route.costRange}</span>
        {route.warningText && (
          <span className="flex items-center gap-1 text-xs text-status-warning">
            <AlertTriangle size={12} />
            {route.warningText}
          </span>
        )}
      </div>

      {/* Expandable detail */}
      {open && route.detail && (
        <div className="mt-3 rounded-md bg-surface-elevated p-3 text-[13px] leading-relaxed text-text-secondary">
          {route.detail}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 pt-2 text-xs text-status-info"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {open ? "Less" : "Route details & reasoning"}
      </button>
    </div>
  );
}
