import { NextRequest, NextResponse } from "next/server";
import { buildOfflinePacket } from "@/lib/crisis-data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const region = params.get("region") ?? undefined;
  const location = params.get("location") ?? undefined;
  const nationality = params.get("nationality") ?? undefined;

  const latRaw = params.get("lat");
  const lngRaw = params.get("lng");
  const lat = latRaw ? Number(latRaw) : undefined;
  const lng = lngRaw ? Number(lngRaw) : undefined;

  const packet = await buildOfflinePacket({
    region,
    location,
    nationality,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  });

  return NextResponse.json(packet, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Disposition": `attachment; filename=offline-packet-${packet.region.slug}.json`,
    },
  });
}
