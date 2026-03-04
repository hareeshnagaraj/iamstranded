import { NextRequest, NextResponse } from "next/server";
import { getIntelFeed } from "@/lib/crisis-data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const slug = params.get("crisis") ?? "uae-airspace-closure";

  const { crisis, feed } = await getIntelFeed(slug);

  return NextResponse.json(
    {
      crisis,
      feed,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
