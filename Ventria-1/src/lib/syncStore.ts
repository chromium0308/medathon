/**
 * In-memory store for CardioGuard Apple Watch sync payloads.
 * Keyed by deviceId; optionally by syncCode once paired.
 * For production, replace with a database (e.g. PostgreSQL, Redis).
 */

export interface ProfilePayload {
  heartFailureType: string;
  medicationIds: string[];
  baselineRestingHR?: number;
  baselineWeightKg?: number;
  activityLevel: string;
  age?: number;
  hasCKD: boolean;
  hasDiabetes: boolean;
  hasHypertension: boolean;
}

export interface MetricPayload {
  date: string;
  metricType: string;
  value: number;
  unit?: string;
}

export interface SymptomPayload {
  date: string;
  shortnessOfBreath: string;
  fatigueLevel: number;
  ankleSwelling: boolean;
  dizzinessOrPalpitations: boolean;
  sleepQuality: string;
}

export interface AlertPayload {
  date: string;
  kind: string;
  title: string;
  message: string;
  wasRedRisk: boolean;
}

export interface SyncPayload {
  deviceId: string;
  syncCode?: string | null;
  profile?: ProfilePayload | null;
  metrics?: MetricPayload[] | null;
  symptoms?: SymptomPayload[] | null;
  alerts?: AlertPayload[] | null;
  liveHR?: number | null;
  liveHRV?: number | null;
  riskScore?: number | null;
  riskLevel?: string | null;
}

export interface StoredSync {
  payload: SyncPayload;
  lastSyncedAt: string; // ISO
}

const store = new Map<string, StoredSync>();
const syncCodeToDeviceId = new Map<string, string>();

export function upsertSync(payload: SyncPayload): StoredSync {
  const entry: StoredSync = {
    payload: { ...payload },
    lastSyncedAt: new Date().toISOString(),
  };
  store.set(payload.deviceId, entry);
  if (payload.syncCode && payload.syncCode.trim()) {
    syncCodeToDeviceId.set(payload.syncCode.trim(), payload.deviceId);
  }
  return entry;
}

export function getSyncByDeviceId(deviceId: string): StoredSync | undefined {
  return store.get(deviceId);
}

export function getSyncBySyncCode(syncCode: string): StoredSync | undefined {
  const deviceId = syncCodeToDeviceId.get(syncCode.trim());
  return deviceId ? store.get(deviceId) : undefined;
}

export function getLatestSync(): StoredSync | undefined {
  let latest: StoredSync | undefined;
  for (const v of store.values()) {
    if (!latest || v.lastSyncedAt > latest.lastSyncedAt) latest = v;
  }
  return latest;
}
