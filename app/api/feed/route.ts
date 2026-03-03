import { NextRequest, NextResponse } from "next/server";
import { getGroundTruthFeed } from "@/lib/crisis-data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const region = params.get("region") ?? undefined;
  const location = params.get("location") ?? undefined;
  const nationality = params.get("nationality") ?? undefined;

  const latRaw = params.get("lat");
  const lngRaw = params.get("lng");
  const lat = latRaw ? Number(latRaw) : undefined;
  const lng = lngRaw ? Number(lngRaw) : undefined;

  const feed = await getGroundTruthFeed({
    region,
    location,
    nationality,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  });

  return NextResponse.json(
    {
      region: feed.region,
      updates: feed.updates,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
