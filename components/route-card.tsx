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
  HIGH: "text-emerald-500",
  MEDIUM: "text-amber-500",
  LOW: "text-neutral-600",
};

const confidenceDot: Record<string, string> = {
  HIGH: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-neutral-600",
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
      className={`border bg-[#0A0A0A] ${
        isRecommended
          ? "border-l-[3px] border-neutral-800 border-l-emerald-500"
          : "border-neutral-800"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-600">
            #{index + 1}
          </span>
          {isRecommended && (
            <span className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-500">
              Recommended
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 ${confidenceDot[route.confidence]}`}
          />
          <span
            className={`font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${confidenceColor[route.confidence]}`}
          >
            {route.confidence}
          </span>
        </div>
      </div>

      <div className="px-4 py-3.5">
        {/* Title + leg codes */}
        <div className="mb-3">
          <div className="mb-1 text-[15px] font-semibold leading-snug text-text-primary">
            {route.title}
          </div>
          <div className="font-mono text-[13px] uppercase tracking-tight text-neutral-500">
            {route.legs.map((leg, j) => (
              <span key={leg.id}>
                {j > 0 && (
                  <span className="mx-1.5 text-neutral-700">&rarr;</span>
                )}
                <span
                  className={
                    leg.airportStatus === "open"
                      ? "text-emerald-500"
                      : leg.airportStatus === "warning"
                        ? "text-amber-500"
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
                className="flex items-center gap-2 border border-neutral-800 bg-[#111111] px-2.5 py-1.5"
              >
                <Badge status={leg.airportStatus} label={leg.airportCode} />
                <span className="font-mono text-[11px] uppercase tracking-tight text-text-secondary">
                  {leg.flightCode}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-tight text-neutral-600">
                  {leg.departureTime}
                </span>
              </div>
            ))}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 border-t border-neutral-800 pt-2.5 font-mono text-[12px] uppercase tracking-tight text-neutral-500">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-neutral-600" />
            {route.timeEstimate}
          </span>
          <span className="text-text-primary">{route.costRange}</span>
          {route.warningText && (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle size={12} />
              {route.warningText}
            </span>
          )}
        </div>

        {/* Expandable detail */}
        {open && route.detail && (
          <div className="mt-3 border border-neutral-800 bg-[#111111] p-3 font-mono text-[12px] leading-relaxed text-neutral-500">
            {route.detail}
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="mt-2 flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 hover:text-text-primary"
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {open ? "Less" : "Route details"}
        </button>
      </div>
    </div>
  );
}
