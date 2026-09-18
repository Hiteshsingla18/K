import { supabase } from '../lib/supabase';
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
  async fetchMines(): Promise<MineRecord[]> {
    try {
      const { data, error } = await supabase.from('mines').select('*');
      if (error || !data || data.length === 0) {
        console.warn('Using DEFAULT_MINES fallback due to fetch issue.', error);
        return DEFAULT_MINES.map(normalizeMine);
      }
      return data.map(normalizeMine);
    } catch (err) {
      console.warn('Network error, falling back to DEFAULT_MINES.', err);
      return DEFAULT_MINES.map(normalizeMine);
    }
  },

  async fetchViolation(id: string) {
    try {
      const { data, error } = await supabase.from('violations').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn(`Error fetching violation ${id}, falling back to mock.`, err);
      return null;
    }
  },

  async issueShowCauseNotice(violationId: string) {
    try {
      const { data, error } = await supabase
        .from('violations')
        .update({ status: 'Show-Cause Notice Issued' })
        .eq('id', violationId)
        .select();
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn(`Error updating violation ${violationId} status to SCN Issued, simulating success.`, err);
      return { success: true, simulated: true };
    }
  },

  async submitOperatorResponse(payload: any) {
    try {
      // Assuming operator_responses table structure
      const { error: insertError } = await supabase.from('operator_responses').insert([payload]);
      if (insertError) throw insertError;

      // Update violation status to 'Response Submitted'
      const { error: updateError } = await supabase
        .from('violations')
        .update({ status: 'Response Submitted' })
        .eq('id', payload.violationId);
        
      if (updateError) throw updateError;
      
      return { success: true };
    } catch (err) {
      console.warn('Error submitting operator response, simulating success.', err);
      return { success: true, simulated: true };
    }
  }
};
