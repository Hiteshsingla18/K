import { supabase } from '../lib/supabaseClient';
import { MineRecord } from '../types';
import { MINES_DATA } from './mines';

const normalizeStatus = (value?: string): 'critical' | 'monitor' | 'compliant' => {
  if (value === 'critical' || value === 'monitor' || value === 'compliant') {
    return value;
  }
  return 'monitor';
};

const normalizeString = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return fallback;
};

const normalizeNumeric = (value: unknown, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toWorkforceSplit = (row: any) => {
  const rawSplit = row?.workforce_split ?? row?.workforceSplit ?? {};
  const permanent = normalizeNumeric(rawSplit.permanent ?? row?.permanent_workers ?? row?.permanent ?? 0, 0);
  const contractual = normalizeNumeric(rawSplit.contractual ?? row?.contractual_workers ?? row?.contractual ?? 0, 0);
  const total = normalizeNumeric(rawSplit.total ?? row?.total_workforce ?? row?.activeWorkforce ?? row?.total ?? permanent + contractual, permanent + contractual);

  return {
    permanent,
    contractual,
    total
  };
};

const normalizeMineRow = (row: any): MineRecord => {
  const workforceSplit = toWorkforceSplit(row);
  const status = normalizeStatus(row?.status ?? row?.mine_status);
  const complianceScore = normalizeNumeric(row?.compliance_score ?? row?.complianceScore ?? 70, 70);

  return {
    id: normalizeString(row?.id, 'MIN-0000'),
    name: normalizeString(row?.name, 'Unknown Mine'),
    region: normalizeString(row?.region, 'Unknown Region'),
    state: normalizeString(row?.state, 'Unknown State'),
    subsidiary: normalizeString(row?.subsidiary, 'ECL'),
    basin: normalizeString(row?.basin, 'Unknown Basin'),
    status,
    complianceScore,
    operator: normalizeString(row?.operator, 'Unknown Operator'),
    lastInspection: normalizeString(row?.last_inspection ?? row?.lastInspection ?? 'N/A', 'N/A'),
    permitExp: normalizeString(row?.permit_exp ?? row?.permitExp ?? 'N/A', 'N/A'),
    activeReports: normalizeNumeric(row?.active_reports ?? row?.activeReports ?? 0, 0),
    coalfield: normalizeString(row?.coalfield, 'Unknown Coalfield'),
    productionCapacityMTPA: normalizeNumeric(row?.production_capacity_mpta ?? row?.productionCapacityMTPA ?? 0, 0),
    latitude: normalizeNumeric(row?.latitude, 22.5),
    longitude: normalizeNumeric(row?.longitude, 82.0),
    workforceSplit,
    activeWorkforce: normalizeNumeric(row?.active_workforce ?? row?.activeWorkforce ?? workforceSplit.total, workforceSplit.total),
    flags: Array.isArray(row?.flags) ? row.flags : []
  };
};

export async function loadMineRegistryData(): Promise<MineRecord[]> {
  if (!supabase) {
    return MINES_DATA;
  }

  try {
    const { data, error } = await supabase.from('mines').select('*');

    if (error) {
      throw error;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return MINES_DATA;
    }

    const normalized = data.map(normalizeMineRow);
    return normalized.length > 0 ? normalized : MINES_DATA;
  } catch (error) {
    console.warn('Supabase mine registry query failed. Falling back to local 25-mine dataset.', error);
    return MINES_DATA;
  }
}
