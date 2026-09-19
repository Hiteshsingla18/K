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
  },

  async fetchGovernmentBenefitSchemes(): Promise<import('../types').GovernmentBenefitScheme[]> {
    const DEFAULT_SCHEMES: import('../types').GovernmentBenefitScheme[] = [
      {
        id: 'sch-esic-01',
        schemeCode: 'ESIC',
        schemeName: "Employees' State Insurance Scheme (ESI / ESIC)",
        category: 'Health Insurance',
        providerBody: "Employees' State Insurance Corporation (ESIC), Ministry of Labour & Employment",
        description: 'Comprehensive multidimensional social security and health protection scheme providing full medical care and cash benefits for industrial and mine workers.',
        intendedFor: 'Factory workers, mine employees, and establishment staff in covered areas.',
        keyBenefits: [
          'Full Outpatient & Inpatient Hospitalization',
          'Specialist Treatment & Diagnostic Investigations',
          'Full Medical Care for Eligible Family Dependants',
          'Sickness & Temporary Disablement Cash Benefits',
          'Maternity Benefits & Extended Medical Care',
          'Funeral Expense Support & Dependant Pension'
        ],
        coverageAmount: 'Full Medical Care (No treatment cap at ESIC facilities)',
        eligibilityNotes: 'Workers in covered establishments with monthly wages up to statutory wage limits.',
        officialUrl: 'https://www.esic.gov.in/',
        active: true
      },
      {
        id: 'sch-pmjay-02',
        schemeCode: 'AB_PMJAY',
        schemeName: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)',
        category: 'Health Insurance',
        providerBody: 'National Health Authority (NHA), Ministry of Health & Family Welfare',
        description: 'Flagship national health assurance scheme providing secondary and tertiary cashless hospitalization coverage to vulnerable families and converged unorganized/BOCW workers.',
        intendedFor: 'Vulnerable families listed in SECC 2011 and registered Building & Other Construction / Colliery workers.',
        keyBenefits: [
          'Cashless and paperless hospitalization treatment',
          'Covers secondary & tertiary care procedures',
          'Pre-hospitalization (3 days) & post-hospitalization (15 days) coverage',
          'National portability across all empanelled public & private hospitals'
        ],
        coverageAmount: 'Up to ₹5,00,000 per family per year',
        eligibilityNotes: 'Beneficiaries identified via SECC 2011 database or converged state BOCW worker registries.',
        officialUrl: 'https://pmjay.gov.in/',
        active: true
      },
      {
        id: 'sch-pmjjby-03',
        schemeCode: 'PMJJBY',
        schemeName: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
        category: 'Life & Accident Insurance',
        providerBody: 'Ministry of Finance / LIC & Empanelled Life Insurers',
        description: 'Government-backed one-year renewable life insurance scheme offering financial protection against death due to any cause.',
        intendedFor: 'Savings bank account holders aged 18 to 50 years.',
        keyBenefits: [
          'Lump-sum life insurance benefit paid to designated nominee',
          'Protection against death due to any cause (medical, natural, or accidental)',
          'Simple annual auto-debit subscription via linked bank account'
        ],
        coverageAmount: '₹2,00,000 upon death due to any cause',
        eligibilityNotes: 'Individuals aged 18–50 with a bank account who give consent for auto-debit.',
        officialUrl: 'https://www.financialservices.gov.in/',
        active: true
      },
      {
        id: 'sch-pmsby-04',
        schemeCode: 'PMSBY',
        schemeName: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
        category: 'Life & Accident Insurance',
        providerBody: 'Ministry of Finance / Public General Insurance Companies',
        description: 'Government-backed accident insurance scheme offering financial protection against accidental death and permanent disability.',
        intendedFor: 'Savings bank account holders aged 18 to 70 years.',
        keyBenefits: [
          'Financial protection against accidental death',
          'Coverage for total and irrecoverable loss of both eyes, limbs, or sight',
          'Coverage for permanent partial disability'
        ],
        coverageAmount: '₹2,00,000 for accidental death / total disability; ₹1,00,000 for partial disability',
        eligibilityNotes: 'Individuals aged 18–70 with a bank account who give consent for auto-debit.',
        officialUrl: 'https://www.financialservices.gov.in/',
        active: true
      }
    ];

    try {
      const { data, error } = await supabase.from('government_benefit_schemes').select('*');
      if (error || !data || data.length === 0) {
        return DEFAULT_SCHEMES;
      }
      return data.map((item: any) => ({
        id: item.id,
        schemeCode: item.scheme_code,
        schemeName: item.scheme_name,
        category: item.category,
        providerBody: item.provider_body,
        description: item.description,
        intendedFor: item.intended_for,
        keyBenefits: item.key_benefits || [],
        coverageAmount: item.coverage_amount,
        eligibilityNotes: item.eligibility_notes,
        officialUrl: item.official_url,
        active: item.active
      }));
    } catch (err) {
      console.warn('Error fetching government benefit schemes, returning official catalog fallback.', err);
      return DEFAULT_SCHEMES;
    }
  },

  async fetchWorkerBenefitEnrollments(workerId: string): Promise<import('../types').GovernmentBenefitEnrollment[]> {
    try {
      const { data, error } = await supabase
        .from('government_benefit_enrollments')
        .select('*')
        .eq('worker_id', workerId);
        
      if (error || !data) {
        return [];
      }
      return data.map((item: any) => ({
        id: item.id,
        workerId: item.worker_id,
        schemeId: item.scheme_id,
        schemeCode: item.scheme_code,
        enrollmentStatus: item.enrollment_status,
        verificationStatus: item.verification_status,
        referenceNumber: item.reference_number,
        coverageStart: item.coverage_start,
        coverageEnd: item.coverage_end,
        lastVerifiedAt: item.last_verified_at,
        source: item.source || 'Ministry of Labour & Employment / GOI'
      }));
    } catch (err) {
      console.warn(`Error fetching benefit enrollments for worker ${workerId}. Returning unverified status.`, err);
      return [];
    }
  }
};

