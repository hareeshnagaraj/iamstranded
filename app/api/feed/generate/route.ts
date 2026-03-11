import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCrisisContext } from "@/lib/crisis-data";

const VALID_CATEGORIES = ["flight", "ground", "accommodation", "embassy", "safety"];
const STALENESS_MS = 5 * 60 * 1000; // 5 minutes
const MAX_MESSAGE_LENGTH = 280; // Twitter-length cap for concise updates

// In-memory lock to prevent concurrent generation for the same crisis
const generatingAt = new Map<string, number>();

function sanitizeUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {}
  return null;
}

// Strip [CATEGORY], [CRITICAL], [URGENT] etc. prefixes that Gemini sometimes adds
function cleanMessage(msg: string): string {
  return msg
    .replace(/^\[[\w/]+\]\s*/gi, "") // strip leading [TAG]
    .replace(/^\[[\w/]+\]\s*/gi, "") // strip second [TAG] if doubled
    .trim();
}

interface GeneratedItem {
  category: string;
  message: string;
  source: string;
  sourceUrl: string | null;
}

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];
  return text.trim();
}

function isValidItem(obj: unknown): obj is GeneratedItem {
  if (!obj || typeof obj !== "object") return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.category === "string" &&
    VALID_CATEGORIES.includes(r.category) &&
    typeof r.message === "string" &&
    r.message.length > 10 &&
    typeof r.source === "string" &&
    r.source.length > 0
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const crisisId = body.crisisId as string | undefined;

    if (!crisisId) {
      return NextResponse.json({ generated: 0, reason: "missing crisisId" });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ generated: 0, reason: "no api key" });
    }

    // Prevent concurrent generation for the same crisis
    const lastGen = generatingAt.get(crisisId) ?? 0;
    if (Date.now() - lastGen < STALENESS_MS) {
      return NextResponse.json({ generated: 0, reason: "generation in progress or recent" });
    }
    generatingAt.set(crisisId, Date.now());

    const supabase = getSupabaseServerClient();

    // Check staleness — if newest feed item is <5 min old, skip generation
    if (supabase) {
      const { data: latest } = await supabase
        .from("intel_feed")
        .select("created_at")
        .eq("crisis_id", crisisId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (latest && latest.length > 0) {
        const newestAt = new Date(String(latest[0].created_at)).getTime();
        if (Date.now() - newestAt < STALENESS_MS) {
          return NextResponse.json({ generated: 0, reason: "fresh" });
        }
      }
    }

    // Fetch crisis context for prompt
    const { crisis, airports, feed: recentFeed } = await getCrisisContext(crisisId);

    const airportTable = airports
      .map((a) => `  ${a.airportCode} | ${a.airportName} | ${a.status.toUpperCase()} | ${a.distanceKm}km`)
      .join("\n");

    const feedContext = recentFeed
      .slice(0, 15)
      .map((f) => `  [${f.category.toUpperCase()}] ${f.message} (${f.source})`)
      .join("\n");

    const prompt = `You generate short, urgent intel updates for a live crisis travel dashboard ticker.

CRISIS: ${crisis.title} — ${crisis.location} — ${crisis.severity.toUpperCase()}
${crisis.description}

AIRPORTS:
${airportTable}

RECENT ITEMS (do NOT repeat these):
${feedContext || "  (none yet)"}

Generate 1-2 NEW items as a JSON array. STRICT RULES:
- Each message MUST be 1-2 sentences, MAX 250 characters. Be terse and specific.
- Do NOT prefix messages with category tags like [FLIGHT] or [CRITICAL].
- category field must be one of: flight, ground, accommodation, embassy, safety
- source: short name (e.g. "Reuters", "UAE Civil Defense", "Emirates official")
- sourceUrl: a plausible https URL or null

Return ONLY valid JSON — no markdown, no explanation:
[{"category":"flight","message":"Short update here.","source":"Source Name","sourceUrl":null}]`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = extractJSON(text);
    const parsed: unknown = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ generated: 0, reason: "invalid response" });
    }

    const validItems = parsed.filter(isValidItem);

    if (validItems.length === 0) {
      return NextResponse.json({ generated: 0, reason: "no valid items" });
    }

    // Post-process: clean prefixes and enforce length cap
    const cleanedItems = validItems.map((item) => ({
      ...item,
      message: cleanMessage(item.message).slice(0, MAX_MESSAGE_LENGTH),
    }));

    // Insert into Supabase if available
    let inserted = 0;
    if (supabase) {
      for (const item of cleanedItems) {
        const { error } = await supabase.from("intel_feed").insert({
          crisis_id: crisisId,
          category: item.category,
          message: item.message,
          source: item.source,
          source_url: sanitizeUrl(item.sourceUrl),
        });
        if (!error) inserted++;
      }
    }

    return NextResponse.json({ generated: inserted });
  } catch {
    return NextResponse.json({ generated: 0, reason: "error" });
  }
}
