import { NextRequest, NextResponse } from "next/server";
import { haversineKm } from "@/lib/geo";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMockAirports, getMockLodging } from "@/lib/mock-data";
import type { Airport, Lodging } from "@/types/crisis";

// In-memory cache: 5-min TTL, keyed on rounded lat/lon + crisisId
const cache = new Map<string, { data: { airports: Airport[]; lodging: Lodging[] }; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(lat: number, lon: number, crisisId: string): string {
  return `${lat.toFixed(1)},${lon.toFixed(1)},${crisisId}`;
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  center?: { lat: number; lon: number };
}

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) return [];

  const json = await res.json();
  return (json.elements ?? []) as OverpassElement[];
}

function getElementCoords(el: OverpassElement): { lat: number; lon: number } | null {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lon: el.lon };
  if (el.center) return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get("lat") ?? "");
  const lon = parseFloat(params.get("lon") ?? "");
  const crisisId = params.get("crisisId") ?? "";

  if (isNaN(lat) || isNaN(lon) || !crisisId) {
    return NextResponse.json(
      { error: "lat, lon, and crisisId are required" },
      { status: 400 },
    );
  }

  // Check cache
  const key = cacheKey(lat, lon, crisisId);
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json(cached.data);
  }

  // Fetch crisis data (from Supabase or mock)
  let crisisAirports: Airport[] = [];
  let crisisLodging: Lodging[] = [];

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const [airportsRes, lodgingRes] = await Promise.all([
      supabase
        .from("nearby_airports")
        .select("*")
        .eq("crisis_id", crisisId)
        .order("distance_km", { ascending: true }),
      supabase
        .from("nearby_lodging")
        .select("*")
        .eq("crisis_id", crisisId)
        .order("distance_km", { ascending: true }),
    ]);

    if (!airportsRes.error && airportsRes.data) {
      crisisAirports = airportsRes.data.map((r) => ({
        id: String(r.id),
        crisisId: String(r.crisis_id),
        airportCode: String(r.airport_code),
        airportName: String(r.airport_name),
        status: r.status as Airport["status"],
        statusLabel: String(r.status_label ?? "Unknown"),
        distanceKm: Number(r.distance_km ?? 0),
        latitude: Number(r.latitude ?? 0),
        longitude: Number(r.longitude ?? 0),
      }));
    }

    if (!lodgingRes.error && lodgingRes.data) {
      crisisLodging = lodgingRes.data.map((r) => ({
        id: String(r.id),
        crisisId: String(r.crisis_id),
        name: String(r.name),
        status: r.status as Lodging["status"],
        statusLabel: r.status_label ? String(r.status_label) : null,
        availableRooms: r.available_rooms != null ? Number(r.available_rooms) : null,
        priceRange: r.price_range ? String(r.price_range) : null,
        distanceKm: Number(r.distance_km ?? 0),
        latitude: Number(r.latitude ?? 0),
        longitude: Number(r.longitude ?? 0),
        notes: r.notes ? String(r.notes) : null,
      }));
    }
  }

  // Fall back to mock data if no DB results
  if (crisisAirports.length === 0) crisisAirports = getMockAirports();
  if (crisisLodging.length === 0) crisisLodging = getMockLodging();

  // Build IATA code set from crisis airports for dedup
  const crisisIataCodes = new Set(crisisAirports.map((a) => a.airportCode));

  // Query Overpass for nearby airports (300km, IATA only)
  const airportQuery = `[out:json][timeout:10];(node["aeroway"="aerodrome"]["iata"](around:300000,${lat},${lon});way["aeroway"="aerodrome"]["iata"](around:300000,${lat},${lon}););out center;`;

  // Query Overpass for nearby lodging (50km, named only)
  const lodgingQuery = `[out:json][timeout:10];node["tourism"~"hotel|hostel|guest_house"]["name"](around:50000,${lat},${lon});out;`;

  const [overpassAirports, overpassLodging] = await Promise.all([
    queryOverpass(airportQuery).catch(() => [] as OverpassElement[]),
    queryOverpass(lodgingQuery).catch(() => [] as OverpassElement[]),
  ]);

  // Merge Overpass airports with crisis airports
  const dynamicAirports: Airport[] = [];

  for (const el of overpassAirports) {
    const coords = getElementCoords(el);
    if (!coords) continue;
    const iata = el.tags?.iata;
    if (!iata) continue;

    // Skip if already in crisis data
    if (crisisIataCodes.has(iata)) continue;

    const dist = Math.round(haversineKm(lat, lon, coords.lat, coords.lon));
    dynamicAirports.push({
      id: `overpass-ap-${el.id}`,
      crisisId,
      airportCode: iata,
      airportName: el.tags?.name ?? iata,
      status: "open",
      statusLabel: "Operational",
      distanceKm: dist,
      latitude: coords.lat,
      longitude: coords.lon,
    });
  }

  // Compute user-distance for crisis airports too
  const allAirports = [
    ...crisisAirports.map((a) => ({
      ...a,
      distanceKm: Math.round(haversineKm(lat, lon, a.latitude, a.longitude)),
    })),
    ...dynamicAirports,
  ]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 15);

  // Merge Overpass lodging with crisis lodging
  const dynamicLodging: Lodging[] = [];

  for (const el of overpassLodging) {
    const coords = getElementCoords(el);
    if (!coords) continue;
    const name = el.tags?.name;
    if (!name) continue;

    const dist = Math.round(haversineKm(lat, lon, coords.lat, coords.lon));
    dynamicLodging.push({
      id: `overpass-lg-${el.id}`,
      crisisId,
      name,
      status: null,
      statusLabel: null,
      availableRooms: null,
      priceRange: null,
      distanceKm: dist,
      latitude: coords.lat,
      longitude: coords.lon,
      notes: el.tags?.tourism ? el.tags.tourism.replace(/_/g, " ") : null,
    });
  }

  const allLodging = [
    ...crisisLodging.map((l) => ({
      ...l,
      distanceKm: Math.round(haversineKm(lat, lon, l.latitude, l.longitude)),
    })),
    ...dynamicLodging,
  ]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);

  const result = { airports: allAirports, lodging: allLodging };

  // Cache result
  cache.set(key, { data: result, expiry: Date.now() + CACHE_TTL_MS });

  return NextResponse.json(result);
}
