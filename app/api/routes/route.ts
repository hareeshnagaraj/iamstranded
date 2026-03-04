import { NextRequest, NextResponse } from "next/server";
import { getCachedRoutes, cacheRoutes } from "@/lib/crisis-data";
import { getMockRoutes } from "@/lib/mock-data";

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

  // 2. Cache miss — generate routes (v0: mock data with origin/dest attached)
  const mockRoutes = getMockRoutes().map((r) => ({
    ...r,
    origin,
    destination,
  }));

  // 3. Store in cache (fire-and-forget — don't block response)
  cacheRoutes(crisisId, origin, destination, mockRoutes).catch(() => {});

  return NextResponse.json(
    { routes: mockRoutes, generatedAt: new Date().toISOString(), cached: false },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
