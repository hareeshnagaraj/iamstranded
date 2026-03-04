import { NextRequest, NextResponse } from "next/server";
import { getSystemStatus } from "@/lib/crisis-data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const slug = params.get("crisis") ?? "uae-airspace-closure";

  const status = await getSystemStatus(slug);

  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
