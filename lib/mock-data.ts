import type {
  ConsularContact,
  CrisisRegion,
  ExtractionOption,
  GroundTruthUpdate,
  SafeRouteCache,
} from "@/types/crisis";

function isoMinutesAgo(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

const regions: CrisisRegion[] = [
  {
    id: "region-gulf-corridor",
    slug: "gulf-corridor",
    name: "Gulf Evacuation Corridor",
    countryCode: "AE",
    isActive: true,
    priority: 1,
  },
  {
    id: "region-east-rail",
    slug: "east-rail-axis",
    name: "Eastern Rail Axis",
    countryCode: "TR",
    isActive: true,
    priority: 2,
  },
];

const updatesByRegion: Record<string, GroundTruthUpdate[]> = {
  "region-gulf-corridor": [
    {
      id: "gt-001",
      regionId: "region-gulf-corridor",
      timestampUtc: isoMinutesAgo(8),
      message: "Airport shutdown confirmed across primary terminal access roads.",
      severity: "critical",
      sourceLabel: "Civil Aviation Desk",
    },
    {
      id: "gt-002",
      regionId: "region-gulf-corridor",
      timestampUtc: isoMinutesAgo(15),
      message: "Border checkpoint B2 operating at reduced throughput.",
      severity: "warning",
      sourceLabel: "Ground Relay",
    },
    {
      id: "gt-003",
      regionId: "region-gulf-corridor",
      timestampUtc: isoMinutesAgo(28),
      message: "Fuel restock completed at convoy node Delta-3.",
      severity: "info",
      sourceLabel: "Logistics Monitor",
    },
  ],
  "region-east-rail": [
    {
      id: "gt-101",
      regionId: "region-east-rail",
      timestampUtc: isoMinutesAgo(12),
      message: "Rail platform 4 reopened for escorted departures.",
      severity: "warning",
      sourceLabel: "Transit Ops",
    },
    {
      id: "gt-102",
      regionId: "region-east-rail",
      timestampUtc: isoMinutesAgo(21),
      message: "Road convoy lane remains operational with delays.",
      severity: "info",
      sourceLabel: "Route Monitor",
    },
  ],
};

const extractionByRegion: Record<string, ExtractionOption[]> = {
  "region-gulf-corridor": [
    {
      id: "ex-001",
      regionId: "region-gulf-corridor",
      mode: "bus",
      distanceKm: 42,
      status: "limited",
      note: "Escorted departures every 30 minutes",
      updatedAt: isoMinutesAgo(6),
    },
    {
      id: "ex-002",
      regionId: "region-gulf-corridor",
      mode: "train",
      distanceKm: 18,
      status: "closed",
      note: "Station access denied",
      updatedAt: isoMinutesAgo(5),
    },
    {
      id: "ex-003",
      regionId: "region-gulf-corridor",
      mode: "border",
      distanceKm: 96,
      status: "operational",
      note: "Documents pre-check required",
      updatedAt: isoMinutesAgo(14),
    },
  ],
  "region-east-rail": [
    {
      id: "ex-101",
      regionId: "region-east-rail",
      mode: "bus",
      distanceKm: 36,
      status: "operational",
      note: "Low seat reserve",
      updatedAt: isoMinutesAgo(11),
    },
    {
      id: "ex-102",
      regionId: "region-east-rail",
      mode: "border",
      distanceKm: 74,
      status: "limited",
      note: "Processing queue approximately 90 minutes",
      updatedAt: isoMinutesAgo(17),
    },
  ],
};

const consularByRegion: Record<string, ConsularContact[]> = {
  "region-gulf-corridor": [
    {
      id: "co-001",
      regionId: "region-gulf-corridor",
      country: "United States",
      primaryPhone: "+971-4-309-4000",
      secondaryPhone: "+971-50-645-6999",
      hoursUtc: "24/7 emergency line",
    },
  ],
  "region-east-rail": [
    {
      id: "co-101",
      regionId: "region-east-rail",
      country: "United States",
      primaryPhone: "+90-312-455-5555",
      secondaryPhone: "+90-532-555-1221",
      hoursUtc: "Emergency desk always staffed",
    },
  ],
};

const safeRouteByRegion: Record<string, SafeRouteCache> = {
  "region-gulf-corridor": {
    id: "sr-001",
    regionId: "region-gulf-corridor",
    snapshotJson: {
      routeVersion: "2026.03.03-01",
      checkpoints: ["Delta-3", "B2", "Harbor Spur"],
      fuelNodes: 3,
      medNodes: 2,
    },
    generatedAt: isoMinutesAgo(4),
  },
  "region-east-rail": {
    id: "sr-101",
    regionId: "region-east-rail",
    snapshotJson: {
      routeVersion: "2026.03.03-02",
      checkpoints: ["Rail-4", "South Gate", "North Crossing"],
      fuelNodes: 2,
      medNodes: 1,
    },
    generatedAt: isoMinutesAgo(9),
  },
};

export function getMockRegions(): CrisisRegion[] {
  return regions;
}

export function getMockRegion(regionInput?: string): CrisisRegion {
  if (!regionInput) {
    return regions[0];
  }

  const normalized = regionInput.toLowerCase();
  return (
    regions.find(
      (item) =>
        item.id === normalized ||
        item.slug === normalized ||
        item.name.toLowerCase() === normalized,
    ) ?? regions[0]
  );
}

export function getMockGroundTruth(regionId: string): GroundTruthUpdate[] {
  return (updatesByRegion[regionId] ?? updatesByRegion["region-gulf-corridor"])
    .slice()
    .sort((a, b) =>
      new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime(),
    );
}

export function getMockExtraction(regionId: string): ExtractionOption[] {
  return (extractionByRegion[regionId] ?? extractionByRegion["region-gulf-corridor"])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function getMockConsular(regionId: string): ConsularContact[] {
  return consularByRegion[regionId] ?? consularByRegion["region-gulf-corridor"];
}

export function getMockSafeRoute(regionId: string): SafeRouteCache | null {
  return safeRouteByRegion[regionId] ?? safeRouteByRegion["region-gulf-corridor"];
}
