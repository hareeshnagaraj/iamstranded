export interface GlobalSignals {
  earthquakeCount: number;
  earthquakes: { mag: number; place: string; alert: string | null }[];
  advisoryCount: number;
  fetchedAt: string;
}

const EMPTY_SIGNALS: GlobalSignals = {
  earthquakeCount: 0,
  earthquakes: [],
  advisoryCount: 0,
  fetchedAt: new Date().toISOString(),
};

async function fetchUSGSEarthquakes(): Promise<{
  count: number;
  quakes: { mag: number; place: string; alert: string | null }[];
}> {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson",
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return { count: 0, quakes: [] };

    const data = await res.json();
    const features = data?.features;
    if (!Array.isArray(features)) return { count: 0, quakes: [] };

    const quakes = features.slice(0, 10).map(
      (f: { properties: { mag: number; place: string; alert: string | null } }) => ({
        mag: Number(f.properties?.mag ?? 0),
        place: String(f.properties?.place ?? "Unknown"),
        alert: f.properties?.alert ? String(f.properties.alert) : null,
      }),
    );

    return { count: features.length, quakes };
  } catch {
    return { count: 0, quakes: [] };
  }
}

async function fetchFCOAdvisories(): Promise<number> {
  try {
    const res = await fetch(
      "https://www.gov.uk/api/content/foreign-travel-advice",
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return 0;

    const data = await res.json();
    const links = data?.links?.children;
    if (!Array.isArray(links)) return 0;

    // Count countries with recent updates (last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = links.filter((c: { public_updated_at?: string }) => {
      if (!c.public_updated_at) return false;
      return new Date(c.public_updated_at).getTime() > weekAgo;
    });

    return recent.length;
  } catch {
    return 0;
  }
}

export async function getGlobalSignals(): Promise<GlobalSignals> {
  try {
    const [usgs, fco] = await Promise.all([
      fetchUSGSEarthquakes(),
      fetchFCOAdvisories(),
    ]);

    return {
      earthquakeCount: usgs.count,
      earthquakes: usgs.quakes,
      advisoryCount: fco,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return EMPTY_SIGNALS;
  }
}
