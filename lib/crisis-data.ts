import { getMockPayload } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Airport,
  CrisisEvent,
  CrisisPayload,
  EmergencyContact,
  IntelFeedItem,
  Lodging,
  Route,
  RouteLeg,
} from "@/types/crisis";

type Row = Record<string, unknown>;

function mapCrisisRow(row: Row): CrisisEvent {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    location: String(row.location ?? ""),
    description: String(row.description ?? ""),
    severity: (row.severity as CrisisEvent["severity"]) ?? "critical",
    isActive: Boolean(row.is_active ?? true),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapRouteLegRow(row: Row): RouteLeg {
  return {
    id: String(row.id),
    routeId: String(row.route_id),
    legOrder: Number(row.leg_order ?? 0),
    airportCode: String(row.airport_code),
    airportStatus: (row.airport_status as RouteLeg["airportStatus"]) ?? "open",
    flightCode: row.flight_code ? String(row.flight_code) : null,
    departureTime: row.departure_time ? String(row.departure_time) : null,
  };
}

function mapRouteRow(row: Row, legs: RouteLeg[]): Route {
  return {
    id: String(row.id),
    crisisId: String(row.crisis_id),
    rank: Number(row.rank ?? 99),
    title: String(row.title),
    confidence: (row.confidence as Route["confidence"]) ?? "LOW",
    timeEstimate: String(row.time_estimate ?? ""),
    costRange: String(row.cost_range ?? ""),
    warningText: row.warning_text ? String(row.warning_text) : null,
    detail: row.detail ? String(row.detail) : null,
    origin: String(row.origin ?? ""),
    destination: String(row.destination ?? ""),
    legs,
  };
}

function mapAirportRow(row: Row): Airport {
  return {
    id: String(row.id),
    crisisId: String(row.crisis_id),
    airportCode: String(row.airport_code),
    airportName: String(row.airport_name),
    status: (row.status as Airport["status"]) ?? "closed",
    statusLabel: String(row.status_label ?? "Unknown"),
    distanceKm: Number(row.distance_km ?? 0),
    latitude: Number(row.latitude ?? 0),
    longitude: Number(row.longitude ?? 0),
  };
}

function mapLodgingRow(row: Row): Lodging {
  return {
    id: String(row.id),
    crisisId: String(row.crisis_id),
    name: String(row.name),
    status: (row.status as Lodging["status"]) ?? "closed",
    statusLabel: String(row.status_label ?? "Unknown"),
    availableRooms: row.available_rooms != null ? Number(row.available_rooms) : null,
    priceRange: row.price_range ? String(row.price_range) : null,
    distanceKm: Number(row.distance_km ?? 0),
    latitude: Number(row.latitude ?? 0),
    longitude: Number(row.longitude ?? 0),
    notes: row.notes ? String(row.notes) : null,
  };
}

function mapFeedRow(row: Row): IntelFeedItem {
  return {
    id: String(row.id),
    crisisId: String(row.crisis_id),
    category: (row.category as IntelFeedItem["category"]) ?? "flight",
    message: String(row.message),
    source: String(row.source ?? ""),
    sourceUrl: row.source_url ? String(row.source_url) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapContactRow(row: Row): EmergencyContact {
  return {
    id: String(row.id),
    crisisId: String(row.crisis_id),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : null,
    url: row.url ? String(row.url) : null,
  };
}

export async function getCrisisPayload(
  slug: string,
): Promise<CrisisPayload> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return getMockPayload();
  }

  try {
    // Resolve crisis by slug
    const { data: crisisRows, error: crisisErr } = await supabase
      .from("crisis_events")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .limit(1);

    if (crisisErr || !crisisRows || crisisRows.length === 0) {
      return getMockPayload();
    }

    const crisis = mapCrisisRow(crisisRows[0] as Row);

    // Fetch non-route data in parallel (routes are per-search, fetched via /api/routes)
    const [airportsRes, lodgingRes, feedRes, contactsRes] = await Promise.all([
      supabase
        .from("nearby_airports")
        .select("*")
        .eq("crisis_id", crisis.id)
        .order("distance_km", { ascending: true }),
      supabase
        .from("nearby_lodging")
        .select("*")
        .eq("crisis_id", crisis.id)
        .order("distance_km", { ascending: true }),
      supabase
        .from("intel_feed")
        .select("*")
        .eq("crisis_id", crisis.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("emergency_contacts")
        .select("*")
        .eq("crisis_id", crisis.id),
    ]);

    if (airportsRes.error || lodgingRes.error || feedRes.error || contactsRes.error) {
      return getMockPayload();
    }

    const mappedAirports = (airportsRes.data ?? []).map((r) =>
      mapAirportRow(r as Row),
    );
    const mappedLodging = (lodgingRes.data ?? []).map((r) =>
      mapLodgingRow(r as Row),
    );
    const mappedFeed = (feedRes.data ?? []).map((r) => mapFeedRow(r as Row));
    const mappedContacts = (contactsRes.data ?? []).map((r) =>
      mapContactRow(r as Row),
    );

    const mock = getMockPayload();

    return {
      crisis,
      routes: [], // Routes are fetched per-search via /api/routes
      airports: mappedAirports.length > 0 ? mappedAirports : mock.airports,
      lodging: mappedLodging.length > 0 ? mappedLodging : mock.lodging,
      feed: mappedFeed.length > 0 ? mappedFeed : mock.feed,
      contacts: mappedContacts.length > 0 ? mappedContacts : mock.contacts,
    };
  } catch {
    return getMockPayload();
  }
}

export async function getIntelFeed(
  slug: string,
): Promise<{ crisis: CrisisEvent; feed: IntelFeedItem[] }> {
  const payload = await getCrisisPayload(slug);
  return { crisis: payload.crisis, feed: payload.feed };
}

export async function getCrisisShellData(
  slug: string,
): Promise<{
  crisis: CrisisEvent;
  airports: Airport[];
  lodging: Lodging[];
  contacts: EmergencyContact[];
}> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const mock = getMockPayload();
    return { crisis: mock.crisis, airports: mock.airports, lodging: mock.lodging, contacts: mock.contacts };
  }

  try {
    const { data: crisisRows, error: crisisErr } = await supabase
      .from("crisis_events")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .limit(1);

    if (crisisErr || !crisisRows || crisisRows.length === 0) {
      const mock = getMockPayload();
      return { crisis: mock.crisis, airports: mock.airports, lodging: mock.lodging, contacts: mock.contacts };
    }

    const crisis = mapCrisisRow(crisisRows[0] as Row);

    const [airportsRes, lodgingRes, contactsRes] = await Promise.all([
      supabase
        .from("nearby_airports")
        .select("*")
        .eq("crisis_id", crisis.id)
        .order("distance_km", { ascending: true }),
      supabase
        .from("nearby_lodging")
        .select("*")
        .eq("crisis_id", crisis.id)
        .order("distance_km", { ascending: true }),
      supabase
        .from("emergency_contacts")
        .select("*")
        .eq("crisis_id", crisis.id),
    ]);

    const mock = getMockPayload();
    const mappedAirports = airportsRes.error
      ? mock.airports
      : (airportsRes.data ?? []).map((r) => mapAirportRow(r as Row));
    const mappedLodging = lodgingRes.error
      ? mock.lodging
      : (lodgingRes.data ?? []).map((r) => mapLodgingRow(r as Row));
    const mappedContacts = contactsRes.error
      ? mock.contacts
      : (contactsRes.data ?? []).map((r) => mapContactRow(r as Row));

    return {
      crisis,
      airports: mappedAirports.length > 0 ? mappedAirports : mock.airports,
      lodging: mappedLodging.length > 0 ? mappedLodging : mock.lodging,
      contacts: mappedContacts.length > 0 ? mappedContacts : mock.contacts,
    };
  } catch {
    const mock = getMockPayload();
    return { crisis: mock.crisis, airports: mock.airports, lodging: mock.lodging, contacts: mock.contacts };
  }
}

export async function getFeedBySlug(
  slug: string,
): Promise<{ crisisId: string; feed: IntelFeedItem[] }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const mock = getMockPayload();
    return { crisisId: mock.crisis.id, feed: mock.feed };
  }

  try {
    const { data: crisisRows } = await supabase
      .from("crisis_events")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .limit(1);

    if (!crisisRows || crisisRows.length === 0) {
      const mock = getMockPayload();
      return { crisisId: mock.crisis.id, feed: mock.feed };
    }

    const crisisId = String((crisisRows[0] as Row).id);

    const { data: feedRows, error } = await supabase
      .from("intel_feed")
      .select("*")
      .eq("crisis_id", crisisId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !feedRows || feedRows.length === 0) {
      const mock = getMockPayload();
      return { crisisId, feed: mock.feed };
    }

    return { crisisId, feed: feedRows.map((r) => mapFeedRow(r as Row)) };
  } catch {
    const mock = getMockPayload();
    return { crisisId: mock.crisis.id, feed: mock.feed };
  }
}

const ROUTE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function getCachedRoutes(
  crisisId: string,
  origin: string,
  destination: string,
): Promise<Route[] | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data: routeRows, error } = await supabase
      .from("routes")
      .select("*")
      .eq("crisis_id", crisisId)
      .eq("origin", origin)
      .eq("destination", destination)
      .order("rank", { ascending: true });

    if (error || !routeRows || routeRows.length === 0) return null;

    // Check TTL — use the newest route's created_at
    const newest = routeRows[0] as Row;
    const createdAt = new Date(String(newest.created_at)).getTime();
    if (Date.now() - createdAt > ROUTE_CACHE_TTL_MS) return null;

    // Fetch legs for all cached routes
    const routeIds = routeRows.map((r) => String((r as Row).id));
    const { data: legRows } = await supabase
      .from("route_legs")
      .select("*")
      .in("route_id", routeIds)
      .order("leg_order", { ascending: true });

    const allLegs = (legRows ?? []).map((r) => mapRouteLegRow(r as Row));
    const legsByRoute = new Map<string, RouteLeg[]>();
    for (const leg of allLegs) {
      const existing = legsByRoute.get(leg.routeId) ?? [];
      existing.push(leg);
      legsByRoute.set(leg.routeId, existing);
    }

    return routeRows.map((r) => {
      const row = r as Row;
      return mapRouteRow(row, legsByRoute.get(String(row.id)) ?? []);
    });
  } catch {
    return null;
  }
}

export async function cacheRoutes(
  crisisId: string,
  origin: string,
  destination: string,
  routes: Route[],
): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  try {
    // Delete stale cached routes for this crisis+origin+dest
    const { data: oldRoutes } = await supabase
      .from("routes")
      .select("id")
      .eq("crisis_id", crisisId)
      .eq("origin", origin)
      .eq("destination", destination);

    if (oldRoutes && oldRoutes.length > 0) {
      const oldIds = oldRoutes.map((r) => String((r as Row).id));
      // Cascade delete handles route_legs via FK
      await supabase.from("routes").delete().in("id", oldIds);
    }

    // Insert new routes
    for (const route of routes) {
      const { data: inserted } = await supabase
        .from("routes")
        .insert({
          crisis_id: crisisId,
          rank: route.rank,
          title: route.title,
          confidence: route.confidence,
          time_estimate: route.timeEstimate,
          cost_range: route.costRange,
          warning_text: route.warningText,
          detail: route.detail,
          origin,
          destination,
        })
        .select("id")
        .single();

      if (inserted && route.legs.length > 0) {
        await supabase.from("route_legs").insert(
          route.legs.map((leg) => ({
            route_id: String((inserted as Row).id),
            leg_order: leg.legOrder,
            airport_code: leg.airportCode,
            airport_status: leg.airportStatus,
            flight_code: leg.flightCode,
            departure_time: leg.departureTime,
          })),
        );
      }
    }
  } catch {
    // Cache write failure is non-fatal — routes still returned to client
  }
}

export async function getCrisisContext(
  crisisId: string,
): Promise<{ crisis: CrisisEvent; airports: Airport[]; feed: IntelFeedItem[] }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const mock = getMockPayload();
    return { crisis: mock.crisis, airports: mock.airports, feed: mock.feed };
  }

  try {
    const [crisisRes, airportsRes, feedRes] = await Promise.all([
      supabase.from("crisis_events").select("*").eq("id", crisisId).limit(1),
      supabase
        .from("nearby_airports")
        .select("*")
        .eq("crisis_id", crisisId)
        .order("distance_km", { ascending: true }),
      supabase
        .from("intel_feed")
        .select("*")
        .eq("crisis_id", crisisId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (
      crisisRes.error ||
      !crisisRes.data?.length ||
      airportsRes.error ||
      feedRes.error
    ) {
      const mock = getMockPayload();
      return { crisis: mock.crisis, airports: mock.airports, feed: mock.feed };
    }

    const crisis = mapCrisisRow(crisisRes.data[0] as Row);
    const airports = (airportsRes.data ?? []).map((r) => mapAirportRow(r as Row));
    const feed = (feedRes.data ?? []).map((r) => mapFeedRow(r as Row));

    const mock = getMockPayload();
    return {
      crisis,
      airports: airports.length > 0 ? airports : mock.airports,
      feed: feed.length > 0 ? feed : mock.feed,
    };
  } catch {
    const mock = getMockPayload();
    return { crisis: mock.crisis, airports: mock.airports, feed: mock.feed };
  }
}

export async function getSystemStatus(
  slug: string,
): Promise<{
  crisisTitle: string;
  isActive: boolean;
  lastUpdate: string;
}> {
  const payload = await getCrisisPayload(slug);
  return {
    crisisTitle: payload.crisis.title,
    isActive: payload.crisis.isActive,
    lastUpdate: payload.feed[0]?.createdAt ?? new Date().toISOString(),
  };
}
