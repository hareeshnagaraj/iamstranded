import Anthropic from "@anthropic-ai/sdk";
import type {
  Airport,
  CrisisEvent,
  IntelFeedItem,
  Route,
  RouteLeg,
} from "@/types/crisis";
import { getMockRoutes } from "@/lib/mock-data";

interface GeneratedLeg {
  legOrder: number;
  airportCode: string;
  airportStatus: "open" | "warning" | "closed";
  flightCode: string | null;
  departureTime: string | null;
}

interface GeneratedRoute {
  rank: number;
  title: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  timeEstimate: string;
  costRange: string;
  warningText: string | null;
  detail: string | null;
  legs: GeneratedLeg[];
}

function buildSystemPrompt(
  crisis: CrisisEvent,
  airports: Airport[],
  feed: IntelFeedItem[],
): string {
  const airportTable = airports
    .map(
      (a) =>
        `  ${a.airportCode} | ${a.airportName} | ${a.status.toUpperCase()} | ${a.distanceKm}km`,
    )
    .join("\n");

  const feedItems = feed
    .slice(0, 10)
    .map((f) => `  [${f.category.toUpperCase()}] ${f.message} (${f.source})`)
    .join("\n");

  return `You are a crisis travel route planner for stranded travelers. You generate realistic, actionable escape routes based on real-world airport data and crisis intelligence.

CRISIS CONTEXT:
  Title: ${crisis.title}
  Location: ${crisis.location}
  Severity: ${crisis.severity.toUpperCase()}
  Description: ${crisis.description}

NEARBY AIRPORTS (sorted by distance from crisis location):
  CODE | NAME | STATUS | DISTANCE
${airportTable}

LATEST INTEL:
${feedItems}

INSTRUCTIONS:
- Generate exactly 3 ranked escape routes from the user's origin to their destination.
- Routes should be realistic given the airport statuses and crisis situation.
- Rank 1 = highest confidence / most recommended. Rank 3 = fallback / riskiest.
- Each route must have legs — the airports the traveler passes through (including origin and final destination airports).
- Include realistic flight codes (airline code + 3 digits), departure times, and cost estimates.
- warningText should flag visa issues, availability concerns, or safety risks. Use null if none.
- detail should be 2-3 sentences explaining the route strategy.
- For closed airports, you may include a "wait for reopening" route as rank 3.

RESPOND WITH ONLY a JSON array (no markdown fences, no explanation) matching this schema:
[
  {
    "rank": 1,
    "title": "string — short route description",
    "confidence": "HIGH" | "MEDIUM" | "LOW",
    "timeEstimate": "string — e.g. ~18h",
    "costRange": "string — e.g. $450-800",
    "warningText": "string | null",
    "detail": "string | null — 2-3 sentence explanation",
    "legs": [
      {
        "legOrder": 1,
        "airportCode": "string — IATA code",
        "airportStatus": "open" | "warning" | "closed",
        "flightCode": "string | null — e.g. TK 773",
        "departureTime": "string | null — e.g. 22:40"
      }
    ]
  }
]`;
}

function extractJSON(text: string): string {
  // Strip markdown code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  // Try to find a JSON array directly
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];

  return text.trim();
}

function isValidRoute(obj: unknown): obj is GeneratedRoute {
  if (!obj || typeof obj !== "object") return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.rank === "number" &&
    typeof r.title === "string" &&
    ["HIGH", "MEDIUM", "LOW"].includes(r.confidence as string) &&
    typeof r.timeEstimate === "string" &&
    typeof r.costRange === "string" &&
    Array.isArray(r.legs) &&
    r.legs.length > 0
  );
}

export async function generateRoutes(
  crisis: CrisisEvent,
  airports: Airport[],
  feed: IntelFeedItem[],
  origin: string,
  destination: string,
): Promise<Route[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallbackMockRoutes(crisis.id, origin, destination);
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: buildSystemPrompt(crisis, airports, feed),
      messages: [
        {
          role: "user",
          content: `Find 3 ranked routes from ${origin} to ${destination}.`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return fallbackMockRoutes(crisis.id, origin, destination);
    }

    const jsonStr = extractJSON(textBlock.text);
    const parsed: unknown = JSON.parse(jsonStr);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallbackMockRoutes(crisis.id, origin, destination);
    }

    // Validate each route
    const validRoutes = parsed.filter(isValidRoute);
    if (validRoutes.length === 0) {
      return fallbackMockRoutes(crisis.id, origin, destination);
    }

    // Map into Route[] with generated IDs
    return validRoutes.map((gr) => {
      const routeId = crypto.randomUUID();
      const legs: RouteLeg[] = gr.legs.map((gl) => ({
        id: crypto.randomUUID(),
        routeId,
        legOrder: gl.legOrder,
        airportCode: gl.airportCode,
        airportStatus: gl.airportStatus,
        flightCode: gl.flightCode ?? null,
        departureTime: gl.departureTime ?? null,
      }));

      return {
        id: routeId,
        crisisId: crisis.id,
        rank: gr.rank,
        title: gr.title,
        confidence: gr.confidence,
        timeEstimate: gr.timeEstimate,
        costRange: gr.costRange,
        warningText: gr.warningText ?? null,
        detail: gr.detail ?? null,
        origin,
        destination,
        legs,
      };
    });
  } catch {
    return fallbackMockRoutes(crisis.id, origin, destination);
  }
}

function fallbackMockRoutes(
  crisisId: string,
  origin: string,
  destination: string,
): Route[] {
  return getMockRoutes().map((r) => ({
    ...r,
    crisisId,
    origin,
    destination,
  }));
}
