// iamstranded — core types

export type CrisisSeverity = "critical" | "high" | "medium" | "low";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type AirportStatus = "open" | "warning" | "closed";
export type FeedCategory = "flight" | "ground" | "accommodation" | "embassy" | "safety";

export interface CrisisEvent {
  id: string;
  slug: string;
  title: string;
  location: string;
  description: string;
  severity: CrisisSeverity;
  isActive: boolean;
  updatedAt: string;
}

export interface RouteLeg {
  id: string;
  routeId: string;
  legOrder: number;
  airportCode: string;
  airportStatus: AirportStatus;
  flightCode: string | null;
  departureTime: string | null;
}

export interface Route {
  id: string;
  crisisId: string;
  rank: number;
  title: string;
  confidence: Confidence;
  timeEstimate: string;
  costRange: string;
  warningText: string | null;
  detail: string | null;
  origin: string;
  destination: string;
  legs: RouteLeg[];
}

export interface Airport {
  id: string;
  crisisId: string;
  airportCode: string;
  airportName: string;
  status: AirportStatus;
  statusLabel: string;
  distanceKm: number;
}

export interface IntelFeedItem {
  id: string;
  crisisId: string;
  category: FeedCategory;
  message: string;
  source: string;
  sourceUrl: string | null;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  crisisId: string;
  name: string;
  phone: string | null;
  url: string | null;
}

export interface CrisisPayload {
  crisis: CrisisEvent;
  routes: Route[];
  airports: Airport[];
  feed: IntelFeedItem[];
  contacts: EmergencyContact[];
}
