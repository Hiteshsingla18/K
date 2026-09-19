-- Migration: 20260919000000_create_government_benefits.sql
-- Real Government of India Social Security & Health Insurance Schemes

-- 1. Workers Identity Mapping Table (Supports future Supabase Auth integration)
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id VARCHAR(64) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Official Government Benefit Schemes Catalog Table
CREATE TABLE IF NOT EXISTS public.government_benefit_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_code VARCHAR(64) UNIQUE NOT NULL, -- 'ESIC', 'AB_PMJAY', 'PMJJBY', 'PMSBY'
  scheme_name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL, -- 'Health Insurance' OR 'Life & Accident Insurance'
  provider_body VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  intended_for TEXT NOT NULL,
  key_benefits TEXT[] NOT NULL,
  coverage_amount VARCHAR(128),
  eligibility_notes TEXT NOT NULL,
  official_url VARCHAR(512) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Verified Government Benefit Enrollments Table
CREATE TABLE IF NOT EXISTS public.government_benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id VARCHAR(64) NOT NULL,
  scheme_id UUID REFERENCES public.government_benefit_schemes(id) ON DELETE CASCADE,
  enrollment_status VARCHAR(64) NOT NULL DEFAULT 'verification_required', -- 'enrolled', 'not_enrolled', 'verification_required'
  verification_status VARCHAR(64) NOT NULL DEFAULT 'unverified', -- 'verified', 'unverified', 'pending_documents'
  reference_number VARCHAR(128), -- ONLY when legitimately issued by GOI portal
  coverage_start DATE,
  coverage_end DATE,
  last_verified_at TIMESTAMPTZ,
  source VARCHAR(128) DEFAULT 'Ministry of Labour & Employment / GOI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_worker_scheme UNIQUE(worker_id, scheme_id)
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.government_benefit_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Public Policy: Anyone can read active Government Benefit Schemes
CREATE POLICY "Public read active government benefit schemes"
  ON public.government_benefit_schemes
  FOR SELECT
  USING (active = true);

-- Strict RLS Policy: Workers can ONLY read their own benefit enrollments
CREATE POLICY "Workers can only view own enrollments"
  ON public.government_benefit_enrollments
  FOR SELECT
  USING (
    worker_id IN (
      SELECT worker_id FROM public.workers WHERE user_id = auth.uid()
    )
  );


-- =========================================================================
-- SEED DATA: OFFICIAL GOVERNMENT OF INDIA SCHEMES ONLY
-- =========================================================================

INSERT INTO public.government_benefit_schemes 
(scheme_code, scheme_name, category, provider_body, description, intended_for, key_benefits, coverage_amount, eligibility_notes, official_url)
VALUES
(
  'ESIC',
  'Employees'' State Insurance Scheme (ESI / ESIC)',
  'Health Insurance',
  'Employees'' State Insurance Corporation (ESIC), Ministry of Labour & Employment',
  'Comprehensive multidimensional social security and health protection scheme providing full medical care and cash benefits for industrial and mine workers.',
  'Factory workers, mine employees, and establishment staff in covered areas.',
  ARRAY[
    'Full Outpatient & Inpatient Hospitalization',
    'Specialist Treatment & Diagnostic Investigations',
    'Full Medical Care for Eligible Family Dependants',
    'Sickness & Temporary Disablement Cash Benefits',
    'Maternity Benefits & Extended Medical Care',
    'Funeral Expense Support & Dependant Pension'
  ],
  'Full Medical Care (No treatment cap at ESIC hospitals)',
  'Workers in covered establishments with monthly wages up to statutory wage limits.',
  'https://www.esic.gov.in/'
),
(
  'AB_PMJAY',
  'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)',
  'Health Insurance',
  'National Health Authority (NHA), Ministry of Health & Family Welfare',
  'Flagship national health assurance scheme providing secondary and tertiary cashless hospitalization coverage to vulnerable families and converged unorganized/BOCW workers.',
  'Vulnerable families listed in SECC 2011 and registered Building & Other Construction / Colliery workers.',
  ARRAY[
    'Cashless and paperless hospitalization treatment',
    'Covers secondary & tertiary care procedures',
    'Pre-hospitalization (3 days) & post-hospitalization (15 days) coverage',
    'National portability across all empanelled public & private hospitals'
  ],
  'Up to ₹5,00,000 per family per year',
  'Beneficiaries identified via SECC 2011 database or converged state BOCW worker registries.',
  'https://pmjay.gov.in/'
),
(
  'PMJJBY',
  'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
  'Life & Accident Insurance',
  'Ministry of Finance / LIC & Empanelled Life Insurers',
  'Government-backed one-year renewable life insurance scheme offering financial protection against death due to any cause.',
  'Savings bank account holders aged 18 to 50 years.',
  ARRAY[
    'Lump-sum life insurance benefit paid to designated nominee',
    'Protection against death due to any cause (medical, natural, or accidental)',
    'Simple annual auto-debit subscription via linked bank account'
  ],
  '₹2,00,000 upon death due to any cause',
  'Individuals aged 18–50 with a bank account who give consent for auto-debit.',
  'https://www.financialservices.gov.in/'
),
(
  'PMSBY',
  'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
  'Life & Accident Insurance',
  'Ministry of Finance / Public General Insurance Companies',
  'Government-backed accident insurance scheme offering financial protection against accidental death and permanent disability.',
  'Savings bank account holders aged 18 to 70 years.',
  ARRAY[
    'Financial protection against accidental death',
    'Coverage for total and irrecoverable loss of both eyes, limbs, or sight',
    'Coverage for permanent partial disability'
  ],
  '₹2,00,000 for accidental death / total disability; ₹1,00,000 for partial disability',
  'Individuals aged 18–70 with a bank account who give consent for auto-debit.',
  'https://www.financialservices.gov.in/'
)
ON CONFLICT (scheme_code) DO NOTHING;
