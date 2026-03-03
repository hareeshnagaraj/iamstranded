import { getMockRegion, getMockRegions } from "@/lib/mock-data";
import type { CrisisRegion, DashboardQuery } from "@/types/crisis";

const GEO_REGION_MAP = [
  {
    regionSlug: "gulf-corridor",
    minLat: 20,
    maxLat: 30,
    minLng: 50,
    maxLng: 60,
  },
  {
    regionSlug: "east-rail-axis",
    minLat: 35,
    maxLat: 44,
    minLng: 25,
    maxLng: 45,
  },
];

function fromCoordinates(lat: number, lng: number): CrisisRegion | null {
  const match = GEO_REGION_MAP.find(
    (region) =>
      lat >= region.minLat &&
      lat <= region.maxLat &&
      lng >= region.minLng &&
      lng <= region.maxLng,
  );

  if (!match) {
    return null;
  }

  return getMockRegion(match.regionSlug);
}

function fromText(location: string): CrisisRegion | null {
  const normalized = location.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const match = getMockRegions().find(
    (region) =>
      region.slug.includes(normalized) ||
      region.name.toLowerCase().includes(normalized),
  );

  return match ?? null;
}

export function resolveRegion(query: DashboardQuery): CrisisRegion {
  if (typeof query.lat === "number" && typeof query.lng === "number") {
    const coordinateMatch = fromCoordinates(query.lat, query.lng);
    if (coordinateMatch) {
      return coordinateMatch;
    }
  }

  if (query.location) {
    const textMatch = fromText(query.location);
    if (textMatch) {
      return textMatch;
    }
  }

  if (query.region) {
    return getMockRegion(query.region);
  }

  return getMockRegion();
}
