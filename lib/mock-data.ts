import type {
  Airport,
  CrisisEvent,
  CrisisPayload,
  EmergencyContact,
  IntelFeedItem,
  Lodging,
  Route,
  RouteLeg,
} from "@/types/crisis";

function isoMinutesAgo(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

// ─── UAE Airspace Closure ────────────────────────────────────────────────────

const UAE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const uaeCrisis: CrisisEvent = {
  id: UAE_ID,
  slug: "uae-airspace-closure",
  title: "UAE & Middle East Airspace Closures",
  location: "Dubai, UAE",
  description:
    "Iran strikes — 12+ airports closed across UAE, Qatar, Bahrain, Israel. ~90,000 passengers/day affected.",
  severity: "critical",
  isActive: true,
  updatedAt: isoMinutesAgo(4),
};

const uaeRouteLegs: Record<string, RouteLeg[]> = {
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

const uaeRoutes: Route[] = [
  {
    id: "route-1",
    crisisId: UAE_ID,
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
    legs: uaeRouteLegs["route-1"],
  },
  {
    id: "route-2",
    crisisId: UAE_ID,
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
    legs: uaeRouteLegs["route-2"],
  },
  {
    id: "route-3",
    crisisId: UAE_ID,
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
    legs: uaeRouteLegs["route-3"],
  },
];

const uaeAirports: Airport[] = [
  { id: "ap-1", crisisId: UAE_ID, airportCode: "DXB", airportName: "Dubai International", status: "closed", statusLabel: "Closed", distanceKm: 15, latitude: 25.2532, longitude: 55.3657 },
  { id: "ap-2", crisisId: UAE_ID, airportCode: "SHJ", airportName: "Sharjah International", status: "closed", statusLabel: "Closed", distanceKm: 22, latitude: 25.3285, longitude: 55.5172 },
  { id: "ap-3", crisisId: UAE_ID, airportCode: "AUH", airportName: "Abu Dhabi Zayed Intl", status: "closed", statusLabel: "Closed", distanceKm: 140, latitude: 24.4431, longitude: 54.6511 },
  { id: "ap-4", crisisId: UAE_ID, airportCode: "MCT", airportName: "Muscat International", status: "open", statusLabel: "Open", distanceKm: 450, latitude: 23.5933, longitude: 58.2844 },
  { id: "ap-5", crisisId: UAE_ID, airportCode: "SLL", airportName: "Salalah", status: "open", statusLabel: "Open", distanceKm: 1100, latitude: 17.0387, longitude: 54.0914 },
  { id: "ap-6", crisisId: UAE_ID, airportCode: "BAH", airportName: "Bahrain International", status: "warning", statusLabel: "Partial", distanceKm: 530, latitude: 26.2708, longitude: 50.6336 },
  { id: "ap-7", crisisId: UAE_ID, airportCode: "DOH", airportName: "Hamad International", status: "closed", statusLabel: "Closed", distanceKm: 490, latitude: 25.2731, longitude: 51.6081 },
];

const uaeLodging: Lodging[] = [
  { id: "lg-1", crisisId: UAE_ID, name: "JW Marriott Deira", status: "full", statusLabel: "Full", availableRooms: 0, priceRange: "$200-280/night", distanceKm: 8, latitude: 25.2716, longitude: 55.3280, notes: "Standby list only" },
  { id: "lg-2", crisisId: UAE_ID, name: "Arabian Court Hotel", status: "limited", statusLabel: "Limited", availableRooms: 3, priceRange: "$120-180/night", distanceKm: 12, latitude: 25.2230, longitude: 55.2990, notes: "Gov't subsidy for expat workers" },
  { id: "lg-3", crisisId: UAE_ID, name: "Deira Twin Towers", status: "available", statusLabel: "Available", availableRooms: 45, priceRange: "$140-220/night", distanceKm: 14, latitude: 25.2680, longitude: 55.3350, notes: "Accepting new bookings" },
  { id: "lg-4", crisisId: UAE_ID, name: "Al Manara Emergency Shelter", status: "shelter", statusLabel: "Shelter", availableRooms: 25, priceRange: "Free", distanceKm: 18, latitude: 25.2500, longitude: 55.3100, notes: "UAE cabinet — register with passport" },
  { id: "lg-5", crisisId: UAE_ID, name: "Sharjah Rotana", status: "available", statusLabel: "Available", availableRooms: 60, priceRange: "$95-150/night", distanceKm: 28, latitude: 25.3380, longitude: 55.3900, notes: "Budget option, full amenities" },
  { id: "lg-6", crisisId: UAE_ID, name: "RAK Beach Resort", status: "available", statusLabel: "Available", availableRooms: 120, priceRange: "$80-140/night", distanceKm: 140, latitude: 25.7890, longitude: 55.9430, notes: "Remote, cheapest, 2.5h drive" },
];

const uaeFeed: IntelFeedItem[] = [
  { id: "f-1", crisisId: UAE_ID, category: "flight", message: "Emirates confirms DXB suspension extended to Tuesday 4 Mar afternoon. Rebooking waivers active through March 18.", source: "Emirates official, AP", sourceUrl: "https://www.emirates.com/notices", createdAt: isoMinutesAgo(12) },
  { id: "f-2", crisisId: UAE_ID, category: "ground", message: "Travelers reporting 3-4h drive to Muscat from Dubai via Hatta. Al Ain border less congested. Car rental limited — book now.", source: "X/Twitter aggregated (12 reports)", sourceUrl: null, createdAt: isoMinutesAgo(28) },
  { id: "f-3", crisisId: UAE_ID, category: "accommodation", message: "UAE government confirms hotel costs covered for stranded travelers. Contact hotel front desk to extend stay.", source: "CNN, The National", sourceUrl: "https://www.cnn.com/middleeast", createdAt: isoMinutesAgo(45) },
  { id: "f-4", crisisId: UAE_ID, category: "embassy", message: "US Embassy advises shelter in place. Register with STEP program for evacuation updates. Consular services limited hours.", source: "US State Department", sourceUrl: "https://travel.state.gov/uae", createdAt: isoMinutesAgo(60) },
  { id: "f-5", crisisId: UAE_ID, category: "safety", message: "Missile debris in industrial areas east of Sharjah. Avoid Al Nahda industrial zone after dark.", source: "UAE Civil Defense", sourceUrl: null, createdAt: isoMinutesAgo(120) },
];

const uaeContacts: EmergencyContact[] = [
  { id: "ec-1", crisisId: UAE_ID, name: "US Embassy UAE", phone: "+971-4-309-4000", url: null },
  { id: "ec-2", crisisId: UAE_ID, name: "UK FCO", phone: "+44-20-7008-5000", url: null },
  { id: "ec-3", crisisId: UAE_ID, name: "India Embassy", phone: "+971-4-397-1222", url: null },
  { id: "ec-4", crisisId: UAE_ID, name: "Emirates Rebooking", phone: null, url: "https://emirates.com/rebook" },
];

// ─── Turkey Earthquake ──────────────────────────────────────────────────────

const TURKEY_ID = "c2d3e4f5-a6b7-8901-cdef-234567890abc";

const turkeyCrisis: CrisisEvent = {
  id: TURKEY_ID,
  slug: "turkey-earthquake",
  title: "Turkey Earthquake (M7.8)",
  location: "Gaziantep, Turkey",
  description:
    "M7.8 earthquake in southeastern Turkey — infrastructure damage, airport closures, aftershocks ongoing. ~50,000 travelers affected.",
  severity: "critical",
  isActive: true,
  updatedAt: isoMinutesAgo(8),
};

const turkeyRouteLegs: Record<string, RouteLeg[]> = {
  "tr-route-1": [
    { id: "tr-leg-1a", routeId: "tr-route-1", legOrder: 1, airportCode: "ADA", airportStatus: "warning", flightCode: "TK 2038", departureTime: "14:20" },
    { id: "tr-leg-1b", routeId: "tr-route-1", legOrder: 2, airportCode: "IST", airportStatus: "open", flightCode: null, departureTime: null },
  ],
  "tr-route-2": [
    { id: "tr-leg-2a", routeId: "tr-route-2", legOrder: 1, airportCode: "AYT", airportStatus: "open", flightCode: "PC 1245", departureTime: "09:30" },
    { id: "tr-leg-2b", routeId: "tr-route-2", legOrder: 2, airportCode: "IST", airportStatus: "open", flightCode: "TK 1838", departureTime: "15:45" },
    { id: "tr-leg-2c", routeId: "tr-route-2", legOrder: 3, airportCode: "LHR", airportStatus: "open", flightCode: null, departureTime: null },
  ],
  "tr-route-3": [
    { id: "tr-leg-3a", routeId: "tr-route-3", legOrder: 1, airportCode: "GZT", airportStatus: "closed", flightCode: "TK 2066", departureTime: "TBD" },
    { id: "tr-leg-3b", routeId: "tr-route-3", legOrder: 2, airportCode: "IST", airportStatus: "open", flightCode: null, departureTime: null },
  ],
};

const turkeyRoutes: Route[] = [
  {
    id: "tr-route-1",
    crisisId: TURKEY_ID,
    rank: 1,
    title: "Drive to Adana, fly to Istanbul",
    confidence: "HIGH",
    timeEstimate: "~8h",
    costRange: "$150-350",
    warningText: "Road damage near Osmaniye — use D400 coastal route",
    detail:
      "Drive west on D400 to Adana (3h). Adana airport partially operational — domestic flights running with delays. Turkish Airlines to Istanbul, then connect internationally. Most reliable exit path.",
    origin: "Gaziantep, Turkey",
    destination: "Istanbul, Turkey",
    legs: turkeyRouteLegs["tr-route-1"],
  },
  {
    id: "tr-route-2",
    crisisId: TURKEY_ID,
    rank: 2,
    title: "Drive to Antalya, fly via Istanbul to London",
    confidence: "MEDIUM",
    timeEstimate: "~14h",
    costRange: "$300-700",
    warningText: "8h drive through mountain roads — check conditions",
    detail:
      "Long drive west to Antalya (8h via Mersin). Antalya airport fully operational, unaffected by quake. Pegasus to Istanbul, then Turkish Airlines to London. Longer but fully operational route.",
    origin: "Gaziantep, Turkey",
    destination: "London, UK",
    legs: turkeyRouteLegs["tr-route-2"],
  },
  {
    id: "tr-route-3",
    crisisId: TURKEY_ID,
    rank: 3,
    title: "Wait for Gaziantep airport reopening",
    confidence: "LOW",
    timeEstimate: "72h+ wait",
    costRange: "$100-250",
    warningText: "Runway damage — no confirmed reopening date",
    detail:
      "Gaziantep Oguzeli Airport (GZT) runway has structural cracks from M7.8 main shock. Engineers assessing — earliest realistic reopening 5-7 days. Stay sheltered, register with embassy.",
    origin: "Gaziantep, Turkey",
    destination: "Istanbul, Turkey",
    legs: turkeyRouteLegs["tr-route-3"],
  },
];

const turkeyAirports: Airport[] = [
  { id: "tr-ap-1", crisisId: TURKEY_ID, airportCode: "GZT", airportName: "Gaziantep Oguzeli", status: "closed", statusLabel: "Closed", distanceKm: 20, latitude: 36.9472, longitude: 37.4787 },
  { id: "tr-ap-2", crisisId: TURKEY_ID, airportCode: "ADA", airportName: "Adana Sakirpasa", status: "warning", statusLabel: "Delays", distanceKm: 220, latitude: 36.9822, longitude: 35.2804 },
  { id: "tr-ap-3", crisisId: TURKEY_ID, airportCode: "AYT", airportName: "Antalya Airport", status: "open", statusLabel: "Open", distanceKm: 560, latitude: 36.8987, longitude: 30.8005 },
  { id: "tr-ap-4", crisisId: TURKEY_ID, airportCode: "IST", airportName: "Istanbul Airport", status: "open", statusLabel: "Open", distanceKm: 850, latitude: 41.2753, longitude: 28.7519 },
  { id: "tr-ap-5", crisisId: TURKEY_ID, airportCode: "ESB", airportName: "Ankara Esenboga", status: "open", statusLabel: "Open", distanceKm: 580, latitude: 40.1281, longitude: 32.9951 },
  { id: "tr-ap-6", crisisId: TURKEY_ID, airportCode: "HTY", airportName: "Hatay Airport", status: "closed", statusLabel: "Destroyed", distanceKm: 120, latitude: 36.3628, longitude: 36.2822 },
];

const turkeyLodging: Lodging[] = [
  { id: "tr-lg-1", crisisId: TURKEY_ID, name: "AFAD Emergency Camp", status: "shelter", statusLabel: "Shelter", availableRooms: 200, priceRange: "Free", distanceKm: 5, latitude: 37.0660, longitude: 37.3781, notes: "Government emergency shelter — bring ID" },
  { id: "tr-lg-2", crisisId: TURKEY_ID, name: "Hilton Garden Inn Gaziantep", status: "limited", statusLabel: "Limited", availableRooms: 8, priceRange: "$60-100/night", distanceKm: 3, latitude: 37.0594, longitude: 37.3825, notes: "Structural inspection passed — limited capacity" },
  { id: "tr-lg-3", crisisId: TURKEY_ID, name: "Divan Gaziantep", status: "closed", statusLabel: "Closed", availableRooms: 0, priceRange: null, distanceKm: 4, latitude: 37.0612, longitude: 37.3750, notes: "Structural damage — evacuated" },
  { id: "tr-lg-4", crisisId: TURKEY_ID, name: "Adana HiltonSA", status: "available", statusLabel: "Available", availableRooms: 80, priceRange: "$70-130/night", distanceKm: 220, latitude: 36.9912, longitude: 35.3250, notes: "Fully operational, accepting crisis evacuees" },
  { id: "tr-lg-5", crisisId: TURKEY_ID, name: "Red Crescent Tent City", status: "shelter", statusLabel: "Shelter", availableRooms: 500, priceRange: "Free", distanceKm: 8, latitude: 37.0800, longitude: 37.4000, notes: "Turkish Red Crescent — families prioritized" },
];

const turkeyFeed: IntelFeedItem[] = [
  { id: "tr-f-1", crisisId: TURKEY_ID, category: "safety", message: "M5.2 aftershock reported 15km NE of Gaziantep. Stay away from damaged structures. More aftershocks expected.", source: "USGS, AFAD", sourceUrl: "https://earthquake.usgs.gov", createdAt: isoMinutesAgo(5) },
  { id: "tr-f-2", crisisId: TURKEY_ID, category: "ground", message: "D400 highway to Adana open but single lane near Osmaniye due to bridge damage. Expect 2h delays.", source: "Turkey Highways Authority", sourceUrl: null, createdAt: isoMinutesAgo(20) },
  { id: "tr-f-3", crisisId: TURKEY_ID, category: "flight", message: "Turkish Airlines offering free rebooking for all southeastern Turkey departures through next week.", source: "Turkish Airlines", sourceUrl: "https://www.turkishairlines.com", createdAt: isoMinutesAgo(35) },
  { id: "tr-f-4", crisisId: TURKEY_ID, category: "embassy", message: "US Consulate Adana operating on emergency hours. All non-essential staff evacuated. Register via STEP.", source: "US State Department", sourceUrl: "https://travel.state.gov", createdAt: isoMinutesAgo(50) },
  { id: "tr-f-5", crisisId: TURKEY_ID, category: "accommodation", message: "AFAD deploying 10,000 additional tents to Gaziantep region. Registration at any government building.", source: "AFAD Turkey", sourceUrl: null, createdAt: isoMinutesAgo(75) },
];

const turkeyContacts: EmergencyContact[] = [
  { id: "tr-ec-1", crisisId: TURKEY_ID, name: "AFAD Emergency", phone: "122", url: null },
  { id: "tr-ec-2", crisisId: TURKEY_ID, name: "US Consulate Adana", phone: "+90-322-346-6262", url: null },
  { id: "tr-ec-3", crisisId: TURKEY_ID, name: "UK Embassy Ankara", phone: "+90-312-455-3344", url: null },
  { id: "tr-ec-4", crisisId: TURKEY_ID, name: "Turkish Airlines Crisis", phone: "+90-212-444-0849", url: "https://www.turkishairlines.com" },
];

// ─── Kenya Protests ─────────────────────────────────────────────────────────

const KENYA_ID = "d3e4f5a6-b7c8-9012-defa-345678901bcd";

const kenyaCrisis: CrisisEvent = {
  id: KENYA_ID,
  slug: "kenya-unrest",
  title: "Kenya Civil Unrest & Protests",
  location: "Nairobi, Kenya",
  description:
    "Widespread protests across Nairobi over tax bill — road blockades, tear gas, airport disruptions. ~15,000 travelers affected.",
  severity: "high",
  isActive: true,
  updatedAt: isoMinutesAgo(15),
};

const kenyaRouteLegs: Record<string, RouteLeg[]> = {
  "ke-route-1": [
    { id: "ke-leg-1a", routeId: "ke-route-1", legOrder: 1, airportCode: "NBO", airportStatus: "warning", flightCode: "KQ 100", departureTime: "23:55" },
    { id: "ke-leg-1b", routeId: "ke-route-1", legOrder: 2, airportCode: "LHR", airportStatus: "open", flightCode: null, departureTime: null },
  ],
  "ke-route-2": [
    { id: "ke-leg-2a", routeId: "ke-route-2", legOrder: 1, airportCode: "MBA", airportStatus: "open", flightCode: "WY 352", departureTime: "03:10" },
    { id: "ke-leg-2b", routeId: "ke-route-2", legOrder: 2, airportCode: "MCT", airportStatus: "open", flightCode: "WY 101", departureTime: "10:30" },
    { id: "ke-leg-2c", routeId: "ke-route-2", legOrder: 3, airportCode: "LHR", airportStatus: "open", flightCode: null, departureTime: null },
  ],
  "ke-route-3": [
    { id: "ke-leg-3a", routeId: "ke-route-3", legOrder: 1, airportCode: "NBO", airportStatus: "warning", flightCode: "BA 065", departureTime: "TBD" },
    { id: "ke-leg-3b", routeId: "ke-route-3", legOrder: 2, airportCode: "LHR", airportStatus: "open", flightCode: null, departureTime: null },
  ],
};

const kenyaRoutes: Route[] = [
  {
    id: "ke-route-1",
    crisisId: KENYA_ID,
    rank: 1,
    title: "Fly NBO during overnight window to London",
    confidence: "HIGH",
    timeEstimate: "~9h",
    costRange: "$400-800",
    warningText: "Protests subside after dark — arrive airport by 9PM",
    detail:
      "JKIA operating with disruptions during daytime but overnight flights largely unaffected. Kenya Airways red-eye to London departs 23:55. Reach airport via Southern Bypass (avoids CBD). Best window: after 8PM when protests wind down.",
    origin: "Nairobi, Kenya",
    destination: "London, UK",
    legs: kenyaRouteLegs["ke-route-1"],
  },
  {
    id: "ke-route-2",
    crisisId: KENYA_ID,
    rank: 2,
    title: "Drive to Mombasa, fly via Muscat to London",
    confidence: "MEDIUM",
    timeEstimate: "~20h",
    costRange: "$500-1000",
    warningText: "6h drive on A109 — check road conditions",
    detail:
      "Drive to Mombasa via A109 Mombasa Road (6h, generally clear of protests). Moi International Airport (MBA) fully operational. Oman Air via Muscat to London. Longer but avoids all Nairobi disruption.",
    origin: "Nairobi, Kenya",
    destination: "London, UK",
    legs: kenyaRouteLegs["ke-route-2"],
  },
  {
    id: "ke-route-3",
    crisisId: KENYA_ID,
    rank: 3,
    title: "Wait for NBO normalization, fly direct BA",
    confidence: "LOW",
    timeEstimate: "24-48h wait",
    costRange: "$350-650",
    warningText: "Protest timeline unpredictable",
    detail:
      "British Airways has suspended daytime departures but maintaining standby schedule. If protests de-escalate, flights resume within 24h. Lowest cost but highest uncertainty. Stay near airport — avoid CBD entirely.",
    origin: "Nairobi, Kenya",
    destination: "London, UK",
    legs: kenyaRouteLegs["ke-route-3"],
  },
];

const kenyaAirports: Airport[] = [
  { id: "ke-ap-1", crisisId: KENYA_ID, airportCode: "NBO", airportName: "Jomo Kenyatta Intl", status: "warning", statusLabel: "Disrupted", distanceKm: 18, latitude: -1.3192, longitude: 36.9278 },
  { id: "ke-ap-2", crisisId: KENYA_ID, airportCode: "WIL", airportName: "Wilson Airport", status: "closed", statusLabel: "Closed", distanceKm: 6, latitude: -1.3214, longitude: 36.8148 },
  { id: "ke-ap-3", crisisId: KENYA_ID, airportCode: "MBA", airportName: "Moi International", status: "open", statusLabel: "Open", distanceKm: 480, latitude: -4.0348, longitude: 39.5942 },
  { id: "ke-ap-4", crisisId: KENYA_ID, airportCode: "KIS", airportName: "Kisumu Airport", status: "open", statusLabel: "Open", distanceKm: 340, latitude: -0.0862, longitude: 34.7289 },
  { id: "ke-ap-5", crisisId: KENYA_ID, airportCode: "DAR", airportName: "Julius Nyerere Intl", status: "open", statusLabel: "Open", distanceKm: 660, latitude: -6.8781, longitude: 39.2026 },
];

const kenyaLodging: Lodging[] = [
  { id: "ke-lg-1", crisisId: KENYA_ID, name: "Hilton Nairobi", status: "limited", statusLabel: "Limited", availableRooms: 12, priceRange: "$120-200/night", distanceKm: 2, latitude: -1.2864, longitude: 36.8236, notes: "CBD location — access may be restricted during protests" },
  { id: "ke-lg-2", crisisId: KENYA_ID, name: "Ole Sereni Hotel", status: "available", statusLabel: "Available", availableRooms: 40, priceRange: "$100-180/night", distanceKm: 10, latitude: -1.3375, longitude: 36.8489, notes: "Near JKIA, away from protest zones" },
  { id: "ke-lg-3", crisisId: KENYA_ID, name: "Crowne Plaza Nairobi", status: "available", statusLabel: "Available", availableRooms: 55, priceRange: "$90-160/night", distanceKm: 8, latitude: -1.3090, longitude: 36.8142, notes: "Upper Hill — generally calm area" },
  { id: "ke-lg-4", crisisId: KENYA_ID, name: "JKIA Transit Hotel", status: "available", statusLabel: "Available", availableRooms: 20, priceRange: "$60-90/night", distanceKm: 18, latitude: -1.3200, longitude: 36.9260, notes: "Inside airport perimeter — safest option for early flights" },
];

const kenyaFeed: IntelFeedItem[] = [
  { id: "ke-f-1", crisisId: KENYA_ID, category: "safety", message: "Tear gas deployed on Moi Avenue and Kenyatta Avenue. Avoid Nairobi CBD entirely. Use Southern Bypass for airport access.", source: "Kenya Police, Reuters", sourceUrl: "https://www.reuters.com", createdAt: isoMinutesAgo(10) },
  { id: "ke-f-2", crisisId: KENYA_ID, category: "flight", message: "Kenya Airways cancels 8 daytime departures. Red-eye flights (after 10PM) still operating. Check rebooking portal.", source: "Kenya Airways", sourceUrl: "https://www.kenya-airways.com", createdAt: isoMinutesAgo(25) },
  { id: "ke-f-3", crisisId: KENYA_ID, category: "ground", message: "Uber and Bolt suspended in Nairobi CBD. Services available in Westlands, Kilimani, and airport area.", source: "Uber Kenya, local reports", sourceUrl: null, createdAt: isoMinutesAgo(40) },
  { id: "ke-f-4", crisisId: KENYA_ID, category: "embassy", message: "US Embassy Nairobi closed to public. Emergency services via phone only. Avoid Gigiri area after 2PM.", source: "US Embassy Nairobi", sourceUrl: "https://ke.usembassy.gov", createdAt: isoMinutesAgo(55) },
  { id: "ke-f-5", crisisId: KENYA_ID, category: "accommodation", message: "Hotels near JKIA offering crisis rates for stranded travelers. Ole Sereni and JKIA Transit best positioned.", source: "Local hotel associations", sourceUrl: null, createdAt: isoMinutesAgo(90) },
];

const kenyaContacts: EmergencyContact[] = [
  { id: "ke-ec-1", crisisId: KENYA_ID, name: "Kenya Emergency", phone: "999", url: null },
  { id: "ke-ec-2", crisisId: KENYA_ID, name: "US Embassy Nairobi", phone: "+254-20-363-6000", url: null },
  { id: "ke-ec-3", crisisId: KENYA_ID, name: "UK High Commission", phone: "+254-20-287-3000", url: null },
  { id: "ke-ec-4", crisisId: KENYA_ID, name: "Kenya Airways Support", phone: "+254-20-327-4747", url: "https://www.kenya-airways.com" },
];

// ─── Payload builders ────────────────────────────────────────────────────────

interface MockPayloadMap {
  [slug: string]: {
    crisis: CrisisEvent;
    routes: Route[];
    airports: Airport[];
    lodging: Lodging[];
    feed: IntelFeedItem[];
    contacts: EmergencyContact[];
  };
}

const payloads: MockPayloadMap = {
  "uae-airspace-closure": {
    crisis: uaeCrisis,
    routes: uaeRoutes,
    airports: uaeAirports,
    lodging: uaeLodging,
    feed: uaeFeed,
    contacts: uaeContacts,
  },
  "turkey-earthquake": {
    crisis: turkeyCrisis,
    routes: turkeyRoutes,
    airports: turkeyAirports,
    lodging: turkeyLodging,
    feed: turkeyFeed,
    contacts: turkeyContacts,
  },
  "kenya-unrest": {
    crisis: kenyaCrisis,
    routes: kenyaRoutes,
    airports: kenyaAirports,
    lodging: kenyaLodging,
    feed: kenyaFeed,
    contacts: kenyaContacts,
  },
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export function getMockCrisis(slug?: string): CrisisEvent | null {
  if (!slug) return uaeCrisis;
  // Support legacy "gulf-corridor" alias
  if (slug === "gulf-corridor") return uaeCrisis;
  const p = payloads[slug];
  return p ? p.crisis : null;
}

export function getMockRoutes(slug?: string): Route[] {
  return (payloads[slug ?? "uae-airspace-closure"] ?? payloads["uae-airspace-closure"]).routes;
}

export function getMockAirports(slug?: string): Airport[] {
  return (payloads[slug ?? "uae-airspace-closure"] ?? payloads["uae-airspace-closure"]).airports;
}

export function getMockFeed(slug?: string): IntelFeedItem[] {
  return (payloads[slug ?? "uae-airspace-closure"] ?? payloads["uae-airspace-closure"]).feed;
}

export function getMockContacts(slug?: string): EmergencyContact[] {
  return (payloads[slug ?? "uae-airspace-closure"] ?? payloads["uae-airspace-closure"]).contacts;
}

export function getMockLodging(slug?: string): Lodging[] {
  return (payloads[slug ?? "uae-airspace-closure"] ?? payloads["uae-airspace-closure"]).lodging;
}

export function getMockPayload(slug?: string): CrisisPayload {
  const key = slug && payloads[slug] ? slug : "uae-airspace-closure";
  return payloads[key];
}

export function getMockDestinations(slug?: string): string[] {
  const routes = (payloads[slug ?? "uae-airspace-closure"] ?? payloads["uae-airspace-closure"]).routes;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const r of routes) {
    if (r.destination && !seen.has(r.destination)) {
      seen.add(r.destination);
      result.push(r.destination);
    }
  }
  return result;
}

export function getAllMockCrises(): CrisisEvent[] {
  return [uaeCrisis, turkeyCrisis, kenyaCrisis];
}
