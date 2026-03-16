import { NextRequest, NextResponse } from "next/server";
import { getCachedRoutes, cacheRoutes, getCrisisContext } from "@/lib/crisis-data";
import { generateRoutes } from "@/lib/generate-routes";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const crisisId = String(body.crisisId ?? "");
  const origin = String(body.origin ?? "").trim();
  const destination = String(body.destination ?? "").trim();

  if (!crisisId || !origin || !destination) {
    return NextResponse.json(
      { error: "crisisId, origin, and destination are required" },
      { status: 400 },
    );
  }

  // 1. Check cache (fresh routes for this origin/dest pair)
  const cached = await getCachedRoutes(crisisId, origin, destination);
  if (cached && cached.length > 0) {
    return NextResponse.json(
      { routes: cached, generatedAt: new Date().toISOString(), cached: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  // 2. Cache miss — fetch crisis context and generate routes via Claude API
  const { crisis, airports, feed } = await getCrisisContext(crisisId);
  const { routes, fallback } = await generateRoutes(crisis, airports, feed, origin, destination);

  // 3. Store in cache (fire-and-forget — don't block response)
  cacheRoutes(crisisId, origin, destination, routes).catch(() => {});

  return NextResponse.json(
    { routes, generatedAt: new Date().toISOString(), cached: false, fallback },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
