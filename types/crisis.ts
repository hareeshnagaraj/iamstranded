export type Severity = "info" | "warning" | "critical";

export type ExtractionMode = "bus" | "train" | "border" | "air";

export type ExtractionStatus = "operational" | "limited" | "closed";

export type ConnectivityState = "stable" | "degraded" | "offline";

export interface CrisisRegion {
  id: string;
  slug: string;
  name: string;
  countryCode: string;
  isActive: boolean;
  priority: number;
}

export interface GroundTruthUpdate {
  id: string;
  regionId: string;
  timestampUtc: string;
  message: string;
  severity: Severity;
  sourceLabel: string;
}

export interface ExtractionOption {
  id: string;
  regionId: string;
  mode: ExtractionMode;
  distanceKm: number;
  status: ExtractionStatus;
  note: string;
  updatedAt: string;
}

export interface ConsularContact {
  id: string;
  regionId: string;
  country: string;
  primaryPhone: string;
  secondaryPhone?: string;
  hoursUtc: string;
}

export interface SafeRouteCache {
  id: string;
  regionId: string;
  snapshotJson: Record<string, unknown>;
  generatedAt: string;
}

export interface DashboardPayload {
  region: CrisisRegion;
  groundTruth: GroundTruthUpdate[];
  extractionOptions: ExtractionOption[];
  consularContacts: ConsularContact[];
  safeRouteCache: SafeRouteCache | null;
  connectivityStatus: ConnectivityState;
  cacheAvailable: boolean;
}

export interface DashboardQuery {
  region?: string;
  location?: string;
  nationality?: string;
  lat?: number;
  lng?: number;
}

export interface OfflinePacket {
  generatedAt: string;
  region: CrisisRegion;
  nationality: string;
  locationInput: string;
  connectivityStatus: ConnectivityState;
  groundTruth: GroundTruthUpdate[];
  extractionOptions: ExtractionOption[];
  consularContacts: ConsularContact[];
  safeRouteSnapshot: Record<string, unknown> | null;
}
