import { GoogleGenerativeAI } from "@google/generative-ai";
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

function buildPrompt(
  crisis: CrisisEvent,
  airports: Airport[],
  feed: IntelFeedItem[],
  origin: string,
  destination: string,
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

TASK: Generate 3 ranked escape routes from "${origin}" to "${destination}".

RULES:
- Route 1 = highest confidence / most recommended. Route 3 = fallback / riskiest.
- Each route has legs — the airports the traveler passes through (including origin departure and final destination airports).
- Use realistic flight codes (airline code + 3 digits), departure times, and cost estimates.
- warningText: flag visa issues, availability concerns, or safety risks. null if none.
- detail: 2-3 sentences explaining the route strategy.
- For closed airports, you may include a "wait for reopening" route as route 3.
- Keep titles SHORT (under 60 chars). Keep detail to 2-3 sentences max.

RESPOND WITH ONLY a valid JSON array — no markdown fences, no explanation, no text before or after:
[
  {
    "rank": 1,
    "title": "short route description",
    "confidence": "HIGH",
    "timeEstimate": "~18h",
    "costRange": "$450-800",
    "warningText": "string or null",
    "detail": "2-3 sentence explanation",
    "legs": [
      {
        "legOrder": 1,
        "airportCode": "XXX",
        "airportStatus": "open",
        "flightCode": "TK 773",
        "departureTime": "22:40"
      }
    ]
  }
]`;
}

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
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
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return fallbackMockRoutes(crisis.slug, origin, destination);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = buildPrompt(crisis, airports, feed, origin, destination);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonStr = extractJSON(text);
    const parsed: unknown = JSON.parse(jsonStr);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallbackMockRoutes(crisis.slug, origin, destination);
    }

    const validRoutes = parsed.filter(isValidRoute);
    if (validRoutes.length === 0) {
      return fallbackMockRoutes(crisis.slug, origin, destination);
    }

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
    return fallbackMockRoutes(crisis.slug, origin, destination);
  }
}

function fallbackMockRoutes(
  crisisSlug: string,
  origin: string,
  destination: string,
): Route[] {
  return getMockRoutes(crisisSlug).map((r) => ({
    ...r,
    crisisId: crisisSlug,
    origin,
    destination,
  }));
}
