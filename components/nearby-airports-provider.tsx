"use client";

import { createContext, useContext } from "react";

const NearbyAirportsContext = createContext<string[]>([]);

export function NearbyAirportsProvider({
  codes,
  children,
}: {
  codes: string[];
  children: React.ReactNode;
}) {
  return (
    <NearbyAirportsContext.Provider value={codes}>
      {children}
    </NearbyAirportsContext.Provider>
  );
}

export function useNearbyAirportCodes() {
  return useContext(NearbyAirportsContext);
}
