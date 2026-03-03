"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { ConnectivityState } from "@/types/crisis";

function connectivityLabel(state: ConnectivityState): string {
  switch (state) {
    case "stable":
      return "Stable";
    case "offline":
      return "Offline";
    default:
      return "Unstable";
  }
}

function resolveRuntimeConnectivity(
  online: boolean,
  initial: ConnectivityState,
): ConnectivityState {
  if (!online) {
    return "offline";
  }

  return initial;
}

export function OfflinePacket({
  region,
  location,
  nationality,
  initialConnectivity,
  cacheAvailable,
}: {
  region: string;
  location?: string;
  nationality?: string;
  initialConnectivity: ConnectivityState;
  cacheAvailable: boolean;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const connectivityState = useMemo(
    () => resolveRuntimeConnectivity(isOnline, initialConnectivity),
    [initialConnectivity, isOnline],
  );

  const downloadPacket = async () => {
    if (isDownloading) {
      return;
    }

    setDownloaded(true);
    setIsDownloading(true);

    const params = new URLSearchParams({
      region,
      location: location ?? "",
      nationality: nationality ?? "",
    });

    try {
      const response = await fetch(`/api/offline-packet?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setIsDownloading(false);
        return;
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = `offline-packet-${region}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(fileUrl);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="flex h-full min-h-[220px] flex-col border border-neutral-800">
      <header className="border-b border-neutral-800 px-4 py-3">
        <h2 className="font-heading text-lg tracking-[0.04em] text-white">Utility / Offline Packet</h2>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-hidden px-4 py-4">
        <div className="grid gap-2 border border-neutral-800 px-4 py-3 font-mono text-xs uppercase tracking-[0.1em]">
          <p className="text-neutral-300">
            Current Connectivity: <span className="text-white">{connectivityLabel(connectivityState)}</span>
          </p>
          <p className="text-neutral-300">
            Cached Safe Routes: <span className="text-white">{cacheAvailable ? "Available" : "Unavailable"}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={downloadPacket}
          className={`inline-flex min-h-12 w-full items-center justify-center gap-2 border px-4 font-ui text-xs uppercase tracking-[0.2em] transition-none focus:bg-white focus:text-black hover:bg-white hover:text-black ${
            downloaded
              ? "border-white bg-white text-black"
              : "border-neutral-200 bg-transparent text-white"
          }`}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {isDownloading ? "Packaging..." : "Download Offline Packet"}
        </button>
      </div>
    </section>
  );
}
