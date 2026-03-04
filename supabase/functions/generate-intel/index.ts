import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Crisis {
  id: string;
  slug: string;
  title: string;
  location: string;
  description: string;
  severity: string;
}

interface Airport {
  airport_code: string;
  airport_name: string;
  status: string;
  distance_km: number;
}

interface FeedRow {
  category: string;
  message: string;
  source: string;
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

const VALID_CATEGORIES = ["flight", "ground", "accommodation", "embassy", "safety"];

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    // Fetch all active crises
    const { data: crises, error: crisisErr } = await supabase
      .from("crisis_events")
      .select("id, slug, title, location, description, severity")
      .eq("is_active", true);

    if (crisisErr || !crises || crises.length === 0) {
      return new Response(
        JSON.stringify({ generated: 0, crises: [], note: "No active crises" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let totalGenerated = 0;
    const processedCrises: string[] = [];

    for (const crisis of crises as Crisis[]) {
      // Fetch airports + last 15 feed items for context
      const [airportsRes, feedRes] = await Promise.all([
        supabase
          .from("nearby_airports")
          .select("airport_code, airport_name, status, distance_km")
          .eq("crisis_id", crisis.id)
          .order("distance_km", { ascending: true }),
        supabase
          .from("intel_feed")
          .select("category, message, source")
          .eq("crisis_id", crisis.id)
          .order("created_at", { ascending: false })
          .limit(15),
      ]);

      const airports = (airportsRes.data ?? []) as Airport[];
      const recentFeed = (feedRes.data ?? []) as FeedRow[];

      const airportTable = airports
        .map((a) => `  ${a.airport_code} | ${a.airport_name} | ${a.status.toUpperCase()} | ${a.distance_km}km`)
        .join("\n");

      const feedContext = recentFeed
        .map((f) => `  [${f.category.toUpperCase()}] ${f.message} (${f.source})`)
        .join("\n");

      const systemPrompt = `You are a crisis intelligence feed writer for a real-time travel crisis dashboard. You generate realistic, urgent intel updates that would appear in a live news ticker during a crisis.

CRISIS CONTEXT:
  Title: ${crisis.title}
  Location: ${crisis.location}
  Severity: ${crisis.severity.toUpperCase()}
  Description: ${crisis.description}

NEARBY AIRPORTS:
  CODE | NAME | STATUS | DISTANCE
${airportTable}

RECENT FEED ITEMS (avoid duplicating these):
${feedContext || "  (none yet)"}

INSTRUCTIONS:
- Generate 1-2 NEW intel items that are different from the recent feed items above.
- Vary the categories: flight, ground, accommodation, embassy, safety.
- Each item should feel urgent, specific, and actionable — like a real crisis update.
- Include realistic sources (news agencies, government bodies, airlines, social media reports).
- sourceUrl should be a plausible URL for the source, or null if the source is informal (e.g. social media aggregated).
- Messages should be 1-2 sentences, concise and factual.
- Do NOT repeat or rephrase existing feed items.

RESPOND WITH ONLY a JSON array (no markdown fences, no explanation):
[
  {
    "category": "flight" | "ground" | "accommodation" | "embassy" | "safety",
    "message": "string — 1-2 sentence update",
    "source": "string — source name",
    "sourceUrl": "string | null — URL if available"
  }
]`;

      try {
        const message = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `Generate 1-2 new intel feed items for the ${crisis.title} crisis. Current time: ${new Date().toISOString()}.`,
            },
          ],
        });

        const textBlock = message.content.find((b: { type: string }) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") continue;

        const jsonStr = extractJSON(textBlock.text);
        const parsed: unknown = JSON.parse(jsonStr);

        if (!Array.isArray(parsed)) continue;

        const validItems = parsed.filter(isValidItem);

        for (const item of validItems) {
          const { error: insertErr } = await supabase.from("intel_feed").insert({
            crisis_id: crisis.id,
            category: item.category,
            message: item.message,
            source: item.source,
            source_url: item.sourceUrl || null,
          });

          if (!insertErr) totalGenerated++;
        }

        processedCrises.push(crisis.slug);
      } catch {
        // Skip this crisis on AI error, continue with others
        continue;
      }
    }

    return new Response(
      JSON.stringify({ generated: totalGenerated, crises: processedCrises }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
