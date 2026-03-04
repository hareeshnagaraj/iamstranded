import { getMockCrisis } from "@/lib/mock-data";
import type { CrisisEvent } from "@/types/crisis";

const GEO_REGION_MAP = [
  {
    crisisSlug: "uae-airspace-closure",
    minLat: 20,
    maxLat: 30,
    minLng: 50,
    maxLng: 60,
  },
];

function fromCoordinates(lat: number, lng: number): string | null {
  const match = GEO_REGION_MAP.find(
    (region) =>
      lat >= region.minLat &&
      lat <= region.maxLat &&
      lng >= region.minLng &&
      lng <= region.maxLng,
  );
  return match?.crisisSlug ?? null;
}

export function resolveSlug(params: {
  slug?: string;
  lat?: number;
  lng?: number;
}): string {
  if (params.slug) return params.slug;

  if (typeof params.lat === "number" && typeof params.lng === "number") {
    const geo = fromCoordinates(params.lat, params.lng);
    if (geo) return geo;
  }

  return "uae-airspace-closure";
}

export function resolveCrisis(slug?: string): CrisisEvent {
  const crisis = getMockCrisis(slug);
  if (crisis) return crisis;
  return getMockCrisis()!;
}
