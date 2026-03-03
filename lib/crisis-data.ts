import {
  getMockConsular,
  getMockExtraction,
  getMockGroundTruth,
  getMockRegion,
  getMockSafeRoute,
} from "@/lib/mock-data";
import { resolveRegion } from "@/lib/region-resolver";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ConnectivityState,
  ConsularContact,
  CrisisRegion,
  DashboardPayload,
  DashboardQuery,
  ExtractionOption,
  GroundTruthUpdate,
  OfflinePacket,
  SafeRouteCache,
} from "@/types/crisis";

type Row = Record<string, unknown>;

function mapRegionRow(row: Row): CrisisRegion {
  return {
    id: String(row.id),
    slug: String(row.slug ?? row.id),
    name: String(row.name),
    countryCode: String(row.country_code ?? "US"),
    isActive: Boolean(row.is_active ?? true),
    priority: Number(row.priority ?? 99),
  };
}

function mapGroundTruthRow(row: Row): GroundTruthUpdate {
  return {
    id: String(row.id),
    regionId: String(row.region_id),
    timestampUtc: String(row.timestamp_utc),
    message: String(row.message),
    severity: (row.severity as GroundTruthUpdate["severity"]) ?? "info",
    sourceLabel: String(row.source_label ?? "Operator Feed"),
  };
}

function mapExtractionRow(row: Row): ExtractionOption {
  return {
    id: String(row.id),
    regionId: String(row.region_id),
    mode: (row.mode as ExtractionOption["mode"]) ?? "bus",
    distanceKm: Number(row.distance_km ?? 0),
    status: (row.status as ExtractionOption["status"]) ?? "limited",
    note: String(row.note ?? ""),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapConsularRow(row: Row): ConsularContact {
  return {
    id: String(row.id),
    regionId: String(row.region_id),
    country: String(row.country),
    primaryPhone: String(row.primary_phone),
    secondaryPhone:
      typeof row.secondary_phone === "string"
        ? row.secondary_phone
        : undefined,
    hoursUtc: String(row.hours_utc ?? "Emergency desk"),
  };
}

function mapSafeRouteRow(row: Row): SafeRouteCache {
  return {
    id: String(row.id),
    regionId: String(row.region_id),
    snapshotJson: (row.snapshot_json as Record<string, unknown>) ?? {},
    generatedAt: String(row.generated_at ?? new Date().toISOString()),
  };
}

async function resolveSupabaseRegion(
  query: DashboardQuery,
): Promise<CrisisRegion | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  let regionLookup = supabase
    .from("crisis_regions")
    .select("id, slug, name, country_code, is_active, priority")
    .eq("is_active", true)
    .order("priority", { ascending: true })
    .limit(1);

  if (query.region?.trim()) {
    const normalized = query.region.trim();
    regionLookup = supabase
      .from("crisis_regions")
      .select("id, slug, name, country_code, is_active, priority")
      .eq("is_active", true)
      .or(`id.eq.${normalized},slug.eq.${normalized}`)
      .limit(1);
  } else if (query.location?.trim()) {
    const normalized = query.location.trim();
    regionLookup = supabase
      .from("crisis_regions")
      .select("id, slug, name, country_code, is_active, priority")
      .eq("is_active", true)
      .ilike("name", `%${normalized}%`)
      .order("priority", { ascending: true })
      .limit(1);
  } else if (typeof query.lat === "number" && typeof query.lng === "number") {
    const mapped = resolveRegion(query);
    regionLookup = supabase
      .from("crisis_regions")
      .select("id, slug, name, country_code, is_active, priority")
      .eq("is_active", true)
      .eq("slug", mapped.slug)
      .limit(1);
  }

  const { data, error } = await regionLookup;
  if (error || !data || data.length === 0) {
    return null;
  }

  return mapRegionRow(data[0] as Row);
}

function getFallbackDashboard(query: DashboardQuery): DashboardPayload {
  const fallbackRegion = resolveRegion(query);
  const safeRoute = getMockSafeRoute(fallbackRegion.id);

  return {
    region: fallbackRegion,
    groundTruth: getMockGroundTruth(fallbackRegion.id),
    extractionOptions: getMockExtraction(fallbackRegion.id),
    consularContacts: getMockConsular(fallbackRegion.id),
    safeRouteCache: safeRoute,
    cacheAvailable: Boolean(safeRoute),
    connectivityStatus: "degraded",
  };
}

export async function getDashboardPayload(
  query: DashboardQuery,
): Promise<DashboardPayload> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return getFallbackDashboard(query);
  }

  try {
    const region = (await resolveSupabaseRegion(query)) ?? resolveRegion(query);

    const [updatesRes, extractionRes, consularRes, safeRouteRes] =
      await Promise.all([
        supabase
          .from("ground_truth_updates")
          .select(
            "id, region_id, timestamp_utc, message, severity, source_label",
          )
          .eq("region_id", region.id)
          .order("timestamp_utc", { ascending: false })
          .limit(40),
        supabase
          .from("extraction_options")
          .select("id, region_id, mode, distance_km, status, note, updated_at")
          .eq("region_id", region.id)
          .order("updated_at", { ascending: false })
          .limit(20),
        supabase
          .from("consular_contacts")
          .select(
            "id, region_id, country, primary_phone, secondary_phone, hours_utc",
          )
          .eq("region_id", region.id)
          .limit(10),
        supabase
          .from("safe_route_cache")
          .select("id, region_id, snapshot_json, generated_at")
          .eq("region_id", region.id)
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    if (
      updatesRes.error ||
      extractionRes.error ||
      consularRes.error ||
      safeRouteRes.error
    ) {
      return getFallbackDashboard(query);
    }

    const mappedUpdates =
      updatesRes.data?.map((row) => mapGroundTruthRow(row as Row)) ?? [];
    const mappedExtraction =
      extractionRes.data?.map((row) => mapExtractionRow(row as Row)) ?? [];
    const mappedConsular =
      consularRes.data?.map((row) => mapConsularRow(row as Row)) ?? [];
    const mappedSafeRoute = safeRouteRes.data
      ? mapSafeRouteRow(safeRouteRes.data as Row)
      : null;

    return {
      region,
      groundTruth:
        mappedUpdates.length > 0
          ? mappedUpdates
          : getMockGroundTruth(region.id ?? getMockRegion().id),
      extractionOptions:
        mappedExtraction.length > 0
          ? mappedExtraction
          : getMockExtraction(region.id ?? getMockRegion().id),
      consularContacts:
        mappedConsular.length > 0
          ? mappedConsular
          : getMockConsular(region.id ?? getMockRegion().id),
      safeRouteCache: mappedSafeRoute,
      cacheAvailable: Boolean(mappedSafeRoute),
      connectivityStatus: "stable",
    };
  } catch {
    return getFallbackDashboard(query);
  }
}

export async function getGroundTruthFeed(
  query: DashboardQuery,
): Promise<{ region: CrisisRegion; updates: GroundTruthUpdate[] }> {
  const payload = await getDashboardPayload(query);
  return {
    region: payload.region,
    updates: payload.groundTruth,
  };
}

export async function getSystemStatus(
  query: DashboardQuery,
): Promise<{
  network: ConnectivityState;
  lastRealtimeEventAt: string;
  lastSsrRefreshAt: string;
}> {
  const { groundTruth, connectivityStatus } = await getDashboardPayload(query);
  return {
    network: connectivityStatus,
    lastRealtimeEventAt:
      groundTruth[0]?.timestampUtc ?? new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastSsrRefreshAt: new Date().toISOString(),
  };
}

export async function buildOfflinePacket(
  query: DashboardQuery,
): Promise<OfflinePacket> {
  const payload = await getDashboardPayload(query);

  return {
    generatedAt: new Date().toISOString(),
    region: payload.region,
    nationality: query.nationality?.trim().toUpperCase() || "UNKNOWN",
    locationInput: query.location?.trim() || "unspecified",
    connectivityStatus: payload.connectivityStatus,
    groundTruth: payload.groundTruth,
    extractionOptions: payload.extractionOptions,
    consularContacts: payload.consularContacts,
    safeRouteSnapshot: payload.safeRouteCache?.snapshotJson ?? null,
  };
}
