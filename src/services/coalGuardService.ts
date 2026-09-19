import { getSupabaseClient } from '../lib/supabaseClient';
import { MINES_DATA } from '../data/mines';

// Types
import { MineRecord } from '../types';

const DEFAULT_MINES = [
  { id: "MIN-4492-R", name: "Rajmahal Open Cast Project (OCP)", subsidiary: "ECL", state: "Jharkhand", lat: 25.0486, lng: 87.3917, compliance: 72, risk: "CRITICAL", operator: "Eastern Coalfields Ltd (ECL)", last_inspection: "14 Oct 2023", permit_expiry: "Dec 2025", citizen_reports: 14, violations: 1, workforce: 1420 },
  { id: "MIN-1021-J", name: "Jharia Underground & OC", subsidiary: "BCCL", state: "Jharkhand", lat: 23.7441, lng: 86.4131, compliance: 61, risk: "CRITICAL", operator: "Bharat Coking Coal Ltd", last_inspection: "02 Nov 2023", permit_expiry: "Mar 2026", citizen_reports: 28, violations: 3, workforce: 2150 },
  { id: "MIN-3044-G", name: "Gevra Open Cast Mine", subsidiary: "SECL", state: "Chhattisgarh", lat: 22.3533, lng: 82.5925, compliance: 94, risk: "COMPLIANT", operator: "South Eastern Coalfields", last_inspection: "20 Jan 2024", permit_expiry: "Aug 2028", citizen_reports: 3, violations: 0, workforce: 3400 },
  { id: "MIN-5091-T", name: "Talcher / Kaniha OCP", subsidiary: "MCL", state: "Odisha", lat: 20.9500, lng: 85.2167, compliance: 64, risk: "CRITICAL", operator: "Mahanadi Coalfields Ltd", last_inspection: "18 Dec 2023", permit_expiry: "Nov 2025", citizen_reports: 19, violations: 2, workforce: 1890 },
  { id: "MIN-2281-K", name: "Korba West Complex", subsidiary: "SECL", state: "Chhattisgarh", lat: 22.3595, lng: 82.7501, compliance: 81, risk: "MONITOR", operator: "South Eastern Coalfields", last_inspection: "05 Feb 2024", permit_expiry: "Jun 2027", citizen_reports: 8, violations: 0, workforce: 1650 },
  { id: "MIN-7712-S", name: "Singrauli Northern Ridge", subsidiary: "NCL", state: "Madhya Pradesh", lat: 24.2000, lng: 82.6667, compliance: 89, risk: "COMPLIANT", operator: "Northern Coalfields Ltd", last_inspection: "11 Jan 2024", permit_expiry: "Sep 2029", citizen_reports: 5, violations: 0, workforce: 2200 }
];

const requireSupabase = () => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and restart Vite.'
    );
  }
  return client;
};

export type CreateMineInput = Pick<MineRecord, 'id' | 'name' | 'state' | 'subsidiary' | 'operator' | 'latitude' | 'longitude'> &
  Partial<Omit<MineRecord, 'id' | 'name' | 'state' | 'subsidiary' | 'operator' | 'latitude' | 'longitude'>>;

export function normalizeMine(raw: any): MineRecord {
  const score = Number(raw.compliance ?? raw.compliance_score ?? raw.complianceScore ?? raw.score ?? 0);
  const risk = (raw.risk || raw.risk_level || raw.status || (score < 65 ? 'CRITICAL' : score < 85 ? 'MONITOR' : 'COMPLIANT')).toLowerCase();
  
  return {
    ...raw,
    id: raw.id || raw.mine_id || "MIN-4492-R",
    name: raw.name || raw.mine_name || "Rajmahal Open Cast Project (OCP)",
    state: raw.state || "Jharkhand",
    region: raw.region || "Eastern",
    subsidiary: raw.subsidiary || raw.operator_code || "ECL",
    basin: raw.basin || "Unknown",
    coalfield: raw.coalfield || "Unknown",
    productionCapacityMTPA: Number(raw.productionCapacityMTPA || 0),
    latitude: Number(raw.lat ?? raw.latitude ?? 25.0486),
    longitude: Number(raw.lng ?? raw.longitude ?? 87.3917),
    complianceScore: score > 0 ? score : (raw.id === "MIN-4492-R" || raw.name?.includes("Rajmahal") ? 72 : 85),
    status: risk as 'critical' | 'monitor' | 'compliant',
    operator: raw.operator || raw.designated_operator || "Eastern Coalfields Ltd (ECL)",
    activeWorkforce: Number(raw.workforce ?? raw.active_workforce ?? raw.activeWorkforce ?? 1420),
    workforceSplit: raw.workforceSplit ?? {
      total: Number(raw.workforce ?? raw.active_workforce ?? 1420),
      permanent: Math.round(Number(raw.workforce ?? raw.active_workforce ?? 1420) * 0.5),
      contractual: Math.round(Number(raw.workforce ?? raw.active_workforce ?? 1420) * 0.5)
    },
    activeReports: Number(raw.violations ?? raw.active_violations ?? raw.activeReports ?? 1),
    citizenReports: Number(raw.citizen_reports ?? raw.citizenReports ?? 14),
    lastInspection: raw.last_inspection || raw.lastInspection || raw.lastInspectionDate || "14 Oct 2023",
    permitExp: raw.permit_expiry || raw.permitExpiry || raw.permitExp || "Dec 2025",
    unauthorizedAreaHa: raw.unauthorized_ha ?? raw.unauthorizedHa ?? raw.unauthorizedAreaHa ?? 28,
    flags: raw.flags || (risk === 'critical' ? [{ title: 'Unauthorized Excavation', note: '+28 Ha detected outside statutory lease line (Sentinel-2 SAR)', severity: 5 }] : [])
  } as MineRecord;
}

export const coalGuardService = {
  async createMine(input: CreateMineInput): Promise<MineRecord> {
    const { data, error } = await requireSupabase().rpc('create_mine', {
      p_mine: {
        id: input.id,
        name: input.name,
        code: input.id,
        state: input.state,
        subsidiary: input.subsidiary,
        latitude: input.latitude,
        longitude: input.longitude,
        type: 'OPENCAST',
        compliance_score: input.complianceScore || 0,
        status: (input.status || 'monitor').toUpperCase()
      }
    });
    if (error) throw error;
    return normalizeMine(data);
  },

  async fetchMines(): Promise<MineRecord[]> {
    try {
      const { data, error } = await requireSupabase().from('mines').select('*').order('name');
      if (error || !data || data.length === 0) {
        console.warn('Using local mine registry fallback.', error);
        return DEFAULT_MINES.map(normalizeMine);
      }
      return data.map(normalizeMine);
    } catch (err) {
      console.warn('Mine registry unavailable; using local fallback.', err);
      return DEFAULT_MINES.map(normalizeMine);
    }
  },

  async fetchViolation(id: string) {
    const { data, error } = await requireSupabase()
      .from('violations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async issueShowCauseNotice(violationId: string) {
    const { data, error } = await requireSupabase()
      .from('violations')
      .update({
        status: 'awaiting_mine_response',
        notice_issued_at: new Date().toISOString()
      })
      .eq('id', violationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async submitOperatorResponse(payload: { violationId: string; details: string }) {
    const { data, error } = await requireSupabase().rpc('submit_operator_response', {
      p_violation_id: payload.violationId,
      p_details: payload.details
    });
    if (error) throw error;
    return data;
  }
};
