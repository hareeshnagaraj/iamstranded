"use client";

import { useEffect, useMemo, useState } from "react";
import type { ConnectivityState } from "@/types/crisis";

type NetworkEventDetail = {
  state: ConnectivityState;
};

function normalizeStatus(online: boolean, runtimeState: ConnectivityState): ConnectivityState {
  if (!online) {
    return "offline";
  }

  return runtimeState;
}

function statusLabel(status: ConnectivityState): string {
  switch (status) {
    case "stable":
      return "LIVE: NETWORK STABLE";
    case "offline":
      return "LIVE: NETWORK OFFLINE";
    default:
      return "LIVE: NETWORK DEGRADED";
  }
}

export function SystemStatus({
  initialStatus,
}: {
  initialStatus: ConnectivityState;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [runtimeState, setRuntimeState] = useState<ConnectivityState>(initialStatus);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setRuntimeState((current) => (current === "offline" ? "degraded" : current));
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleNetworkState = (event: Event) => {
      const customEvent = event as CustomEvent<NetworkEventDetail>;
      if (customEvent.detail?.state) {
        setRuntimeState(customEvent.detail.state);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("crisis-network-state", handleNetworkState);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("crisis-network-state", handleNetworkState);
    };
  }, []);

  const resolvedStatus = useMemo(
    () => normalizeStatus(isOnline, runtimeState),
    [isOnline, runtimeState],
  );

  const critical = resolvedStatus !== "stable";

  return (
    <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.14em]">
      <span
        aria-hidden="true"
        className={`status-dot inline-block h-2 w-2 rounded-full ${
          critical ? "bg-critical" : "bg-white"
        }`}
      />
      <span className={critical ? "text-critical" : "text-white"}>{statusLabel(resolvedStatus)}</span>
    </div>
  );
}
