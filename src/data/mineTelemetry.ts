import Dexie, { type Table } from 'dexie';

export interface MineTelemetryRow {
  id?: number;
  mineId: string;
  recordedAt: string;
  environment: number;
  production: number;
  pollution: number;
  forecast: number;
  dustPpm: number;
  noiseDb: number;
  waterQuality: number;
  status: 'compliant' | 'monitor' | 'critical';
  source: 'synthetic-demo';
}

class MineTelemetryDatabase extends Dexie {
  mineTelemetry!: Table<MineTelemetryRow, number>;

  constructor() {
    super('coalguard-mine-telemetry');
    this.version(1).stores({
      mineTelemetry: '++id, mineId, recordedAt, [mineId+recordedAt]'
    });
    this.version(2).stores({
      mineTelemetry: '++id, mineId, recordedAt, [mineId+recordedAt]'
    });
  }
}

export const mineTelemetryDb = new MineTelemetryDatabase();

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const seededNoise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/**
 * Synthetic/demo data shaped like future sensor and production-reporting
 * integrations. It is intentionally local-only and must be replaced by
 * signed sensor/production feeds in a live deployment.
 */
export const generateSyntheticTelemetry = (mineId: string, rows = 24): MineTelemetryRow[] => {
  const now = Date.now();
  const result: MineTelemetryRow[] = [];
  const seed = Array.from(mineId).reduce((sum, char) => sum + char.charCodeAt(0), 0);

  for (let index = 0; index < rows; index += 1) {
    const recordedAt = new Date(now - (rows - 1 - index) * 4 * 24 * 60 * 60 * 1000).toISOString();
    const drift = index / rows;
    const environment = clamp(62 + seededNoise(seed + index) * 8 + drift * 5, 35, 95);
    const production = clamp(72 + seededNoise(seed + 100 + index) * 10 + drift * 4, 35, 100);
    const pollution = clamp(38 + seededNoise(seed + 200 + index) * 12 + (1 - drift) * 8, 8, 90);
    const forecast = clamp((environment * 0.42) + (production * 0.38) + ((100 - pollution) * 0.2), 0, 100);

    result.push(
      {
        mineId,
        recordedAt,
        environment,
        production,
        pollution,
        forecast,
        dustPpm: clamp(90 + seededNoise(seed + 400 + index) * 18, 20, 180),
        noiseDb: clamp(58 + seededNoise(seed + 600 + index) * 8, 35, 95),
        waterQuality: clamp(82 + seededNoise(seed + 700 + index) * 10, 30, 100),
        status: forecast < 50 ? 'critical' : forecast < 70 ? 'monitor' : 'compliant',
        source: 'synthetic-demo'
      }
    );
  }
  return result;
};

export async function ensureSyntheticTelemetry(mineId: string): Promise<MineTelemetryRow[]> {
  const existing = await mineTelemetryDb.mineTelemetry
    .where('mineId')
    .equals(mineId)
    .sortBy('recordedAt');
  const hasCurrentShape = existing.length >= 20 && existing.every(row =>
    Number.isFinite(row.environment) &&
    Number.isFinite(row.production) &&
    Number.isFinite(row.pollution) &&
    Number.isFinite(row.forecast)
  );
  if (hasCurrentShape) return existing;

  await mineTelemetryDb.mineTelemetry.where('mineId').equals(mineId).delete();
  const generated = generateSyntheticTelemetry(mineId);
  await mineTelemetryDb.mineTelemetry.bulkPut(generated);
  return mineTelemetryDb.mineTelemetry.where('mineId').equals(mineId).sortBy('recordedAt');
}
