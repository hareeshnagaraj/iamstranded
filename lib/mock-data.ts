import type {
  Airport,
  CrisisEvent,
  EmergencyContact,
  IntelFeedItem,
  Route,
  RouteLeg,
} from "@/types/crisis";

function isoMinutesAgo(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

const CRISIS_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const crisisEvent: CrisisEvent = {
  id: CRISIS_ID,
  slug: "uae-airspace-closure",
  title: "UAE & Middle East Airspace Closures",
  location: "Dubai, UAE",
  description:
    "Iran strikes — 12+ airports closed across UAE, Qatar, Bahrain, Israel. ~90,000 passengers/day affected.",
  severity: "critical",
  isActive: true,
  updatedAt: isoMinutesAgo(4),
};

const routeLegs: Record<string, RouteLeg[]> = {
  "route-1": [
    { id: "leg-1a", routeId: "route-1", legOrder: 1, airportCode: "MCT", airportStatus: "open", flightCode: "TK 773", departureTime: "22:40" },
    { id: "leg-1b", routeId: "route-1", legOrder: 2, airportCode: "IST", airportStatus: "open", flightCode: "A3 991", departureTime: "06:15+1" },
    { id: "leg-1c", routeId: "route-1", legOrder: 3, airportCode: "ATH", airportStatus: "open", flightCode: null, departureTime: null },
  ],
  "route-2": [
    { id: "leg-2a", routeId: "route-2", legOrder: 1, airportCode: "MCT", airportStatus: "open", flightCode: "OA 264", departureTime: "01:30" },
    { id: "leg-2b", routeId: "route-2", legOrder: 2, airportCode: "ATH", airportStatus: "open", flightCode: null, departureTime: null },
  ],
  "route-3": [
    { id: "leg-3a", routeId: "route-3", legOrder: 1, airportCode: "DXB", airportStatus: "closed", flightCode: "EK 209", departureTime: "TBD" },
    { id: "leg-3b", routeId: "route-3", legOrder: 2, airportCode: "ATH", airportStatus: "open", flightCode: null, departureTime: null },
  ],
};

const routes: Route[] = [
  {
    id: "route-1",
    crisisId: CRISIS_ID,
    rank: 1,
    title: "Drive to Muscat, fly via Istanbul to Athens",
    confidence: "HIGH",
    timeEstimate: "~18h",
    costRange: "$450-800",
    warningText: "Check Oman visa for Indian passport",
    detail:
      "Drive Al Nahda to Muscat via Hatta border (4h, less congested than Al Ain). Muscat fully operational. Turkish Airlines to Istanbul, 3h layover, Aegean morning flight to Athens. Highest-confidence: all segments operating, avoids closed airspace.",
    origin: "Al Nahda, Dubai",
    destination: "Athens, Greece",
    legs: routeLegs["route-1"],
  },
  {
    id: "route-2",
    crisisId: CRISIS_ID,
    rank: 2,
    title: "Drive to Muscat, direct to Athens",
    confidence: "MEDIUM",
    timeEstimate: "~12h",
    costRange: "$600-1100",
    warningText: "Limited seats — sells out fast",
    detail:
      "Same Muscat drive, connecting to Olympic Air direct service. Faster but limited availability. Check immediately — selling out within hours during crisis.",
    origin: "Al Nahda, Dubai",
    destination: "Athens, Greece",
    legs: routeLegs["route-2"],
  },
  {
    id: "route-3",
    crisisId: CRISIS_ID,
    rank: 3,
    title: "Wait for DXB reopening, direct Emirates",
    confidence: "LOW",
    timeEstimate: "48-72h wait",
    costRange: "$300-500",
    warningText: "No confirmed reopening date",
    detail:
      "Emirates suspended until at least Tue afternoon. Earliest realistic reopening ~Mar 5 per NOTAM data. Rebooking waivers active through Mar 18, no change fees. Lowest effort, highest uncertainty.",
    origin: "Al Nahda, Dubai",
    destination: "Athens, Greece",
    legs: routeLegs["route-3"],
  },
];

const airports: Airport[] = [
  { id: "ap-1", crisisId: CRISIS_ID, airportCode: "DXB", airportName: "Dubai International", status: "closed", statusLabel: "Closed", distanceKm: 15, latitude: 25.2532, longitude: 55.3657 },
  { id: "ap-2", crisisId: CRISIS_ID, airportCode: "SHJ", airportName: "Sharjah International", status: "closed", statusLabel: "Closed", distanceKm: 22, latitude: 25.3285, longitude: 55.5172 },
  { id: "ap-3", crisisId: CRISIS_ID, airportCode: "AUH", airportName: "Abu Dhabi Zayed Intl", status: "closed", statusLabel: "Closed", distanceKm: 140, latitude: 24.4431, longitude: 54.6511 },
  { id: "ap-4", crisisId: CRISIS_ID, airportCode: "MCT", airportName: "Muscat International", status: "open", statusLabel: "Open", distanceKm: 450, latitude: 23.5933, longitude: 58.2844 },
  { id: "ap-5", crisisId: CRISIS_ID, airportCode: "SLL", airportName: "Salalah", status: "open", statusLabel: "Open", distanceKm: 1100, latitude: 17.0387, longitude: 54.0914 },
  { id: "ap-6", crisisId: CRISIS_ID, airportCode: "BAH", airportName: "Bahrain International", status: "warning", statusLabel: "Partial", distanceKm: 530, latitude: 26.2708, longitude: 50.6336 },
  { id: "ap-7", crisisId: CRISIS_ID, airportCode: "DOH", airportName: "Hamad International", status: "closed", statusLabel: "Closed", distanceKm: 490, latitude: 25.2731, longitude: 51.6081 },
];

const feed: IntelFeedItem[] = [
  { id: "f-1", crisisId: CRISIS_ID, category: "flight", message: "Emirates confirms DXB suspension extended to Tuesday 4 Mar afternoon. Rebooking waivers active through March 18.", source: "Emirates official, AP", sourceUrl: "https://www.emirates.com/notices", createdAt: isoMinutesAgo(12) },
  { id: "f-2", crisisId: CRISIS_ID, category: "ground", message: "Travelers reporting 3-4h drive to Muscat from Dubai via Hatta. Al Ain border less congested. Car rental limited — book now.", source: "X/Twitter aggregated (12 reports)", sourceUrl: null, createdAt: isoMinutesAgo(28) },
  { id: "f-3", crisisId: CRISIS_ID, category: "accommodation", message: "UAE government confirms hotel costs covered for stranded travelers. Contact hotel front desk to extend stay.", source: "CNN, The National", sourceUrl: "https://www.cnn.com/middleeast", createdAt: isoMinutesAgo(45) },
  { id: "f-4", crisisId: CRISIS_ID, category: "embassy", message: "US Embassy advises shelter in place. Register with STEP program for evacuation updates. Consular services limited hours.", source: "US State Department", sourceUrl: "https://travel.state.gov/uae", createdAt: isoMinutesAgo(60) },
  { id: "f-5", crisisId: CRISIS_ID, category: "safety", message: "Missile debris in industrial areas east of Sharjah. Avoid Al Nahda industrial zone after dark.", source: "UAE Civil Defense", sourceUrl: null, createdAt: isoMinutesAgo(120) },
];

const contacts: EmergencyContact[] = [
  { id: "ec-1", crisisId: CRISIS_ID, name: "US Embassy UAE", phone: "+971-4-309-4000", url: null },
  { id: "ec-2", crisisId: CRISIS_ID, name: "UK FCO", phone: "+44-20-7008-5000", url: null },
  { id: "ec-3", crisisId: CRISIS_ID, name: "India Embassy", phone: "+971-4-397-1222", url: null },
  { id: "ec-4", crisisId: CRISIS_ID, name: "Emirates Rebooking", phone: null, url: "https://emirates.com/rebook" },
];

export function getMockCrisis(slug?: string): CrisisEvent | null {
  if (!slug || slug === crisisEvent.slug || slug === "gulf-corridor") {
    return crisisEvent;
  }
  return null;
}

export function getMockRoutes(): Route[] {
  return routes;
}

export function getMockAirports(): Airport[] {
  return airports;
}

export function getMockFeed(): IntelFeedItem[] {
  return feed;
}

export function getMockContacts(): EmergencyContact[] {
  return contacts;
}

export function getMockPayload(): {
  crisis: CrisisEvent;
  routes: Route[];
  airports: Airport[];
  feed: IntelFeedItem[];
  contacts: EmergencyContact[];
} {
  return {
    crisis: crisisEvent,
    routes,
    airports,
    feed,
    contacts,
  };
}
