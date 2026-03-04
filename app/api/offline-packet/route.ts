import { NextRequest, NextResponse } from "next/server";
import { getCrisisPayload } from "@/lib/crisis-data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const slug = params.get("crisis") ?? "uae-airspace-closure";

  const payload = await getCrisisPayload(slug);

  const packet = {
    generatedAt: new Date().toISOString(),
    crisis: payload.crisis,
    routes: payload.routes,
    airports: payload.airports,
    lodging: payload.lodging,
    feed: payload.feed,
    contacts: payload.contacts,
  };

  return NextResponse.json(packet, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Disposition": `attachment; filename=offline-packet-${payload.crisis.slug}.json`,
    },
  });
}
