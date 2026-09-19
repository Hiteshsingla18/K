import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Info, 
  HeartHandshake, 
  Shield, 
  Sparkles, 
  X, 
  RefreshCw,
  Award,
  ChevronRight,
  Search,
  Building2,
  Lock
} from 'lucide-react';
import { GovernmentBenefitScheme, GovernmentBenefitEnrollment, AuthUser } from '../types';
import { coalGuardService } from '../services/coalGuardService';

interface LabourGovernmentBenefitsProps {
  currentUser: AuthUser;
  activeWorkerId?: string;
  triggerToast: (msg: string) => void;
}

export default function LabourGovernmentBenefits({
  currentUser,
  activeWorkerId,
  triggerToast
}: LabourGovernmentBenefitsProps) {
  const workerId = activeWorkerId || currentUser.workerId || 'WKR-8812';

  const [schemes, setSchemes] = useState<GovernmentBenefitScheme[]>([]);
  const [enrollments, setEnrollments] = useState<GovernmentBenefitEnrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Category filter: 'all' | 'health' | 'life_accident'
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'health' | 'life_accident'>('all');

  // Modal State for Scheme Details
  const [selectedScheme, setSelectedScheme] = useState<GovernmentBenefitScheme | null>(null);

  const loadBenefitData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedSchemes, fetchedEnrollments] = await Promise.all([
        coalGuardService.fetchGovernmentBenefitSchemes(),
        coalGuardService.fetchWorkerBenefitEnrollments(workerId)
      ]);
      setSchemes(fetchedSchemes);
      setEnrollments(fetchedEnrollments);
    } catch (err: any) {
      console.error('Failed to load government benefit data:', err);
      setError('Unable to fetch official government benefit catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenefitData();
  }, [workerId]);

  const healthSchemes = schemes.filter(s => s.category === 'Health Insurance');
  const lifeAccidentSchemes = schemes.filter(s => s.category === 'Life & Accident Insurance');

  const filteredSchemes = categoryFilter === 'health' 
    ? healthSchemes 
    : categoryFilter === 'life_accident' 
    ? lifeAccidentSchemes 
    : schemes;

  const getEnrollmentForScheme = (schemeCode: string): GovernmentBenefitEnrollment | undefined => {
    return enrollments.find(e => e.schemeCode === schemeCode);
  };

  return (
    <div className="space-y-4 font-sans text-slate-900">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133A6B] text-white rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-tight">
                My Government Benefits
              </h2>
              <p className="text-[10px] text-slate-300">
                Statutory Social Security &amp; Insurance Schemes (Govt. of India)
              </p>
            </div>
          </div>
          <button
            onClick={loadBenefitData}
            disabled={loading}
            className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-slate-200 transition-colors cursor-pointer"
            title="Refresh Scheme Catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Real Data Disclaimer Box */}
        <div className="bg-blue-950/70 border border-blue-800/80 rounded-xl p-2.5 text-[11px] text-blue-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-white">Official Verification Rule: </span>
            This portal displays authentic Government of India schemes. Personal enrollment status requires official verification via your employer or government Aadhaar/UAN portal. Unverified claims or fake policies are strictly excluded.
          </div>
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] ${
            categoryFilter === 'all'
              ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Schemes ({schemes.length})
        </button>
        <button
          onClick={() => setCategoryFilter('health')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] ${
            categoryFilter === 'health'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Health Insurance ({healthSchemes.length})
        </button>
        <button
          onClick={() => setCategoryFilter('life_accident')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px] ${
            categoryFilter === 'life_accident'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Life &amp; Accident ({lifeAccidentSchemes.length})
        </button>
      </div>

      {/* 3. Loading & Error States */}
      {loading && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
          <div className="text-xs font-bold text-slate-700">Loading Official Government Schemes...</div>
          <div className="text-[10px] text-slate-500">Querying Ministry of Labour &amp; National Health Authority Catalog</div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-5 h-5 text-red-600 mx-auto" />
          <div className="text-xs font-bold text-red-900">{error}</div>
          <button
            onClick={loadBenefitData}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 4. Main Scheme Cards List */}
      {!loading && !error && (
        <div className="space-y-4">
          {/* CATEGORY A: HEALTH INSURANCE */}
          {(categoryFilter === 'all' || categoryFilter === 'health') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  A. Health Insurance &amp; Medical Care
                </h3>
              </div>

              {healthSchemes.map((scheme) => {
                const enrollment = getEnrollmentForScheme(scheme.schemeCode);
                return (
                  <SchemeCard 
                    key={scheme.id} 
                    scheme={scheme} 
                    enrollment={enrollment} 
                    onOpenDetails={() => setSelectedScheme(scheme)}
                    triggerToast={triggerToast}
                  />
                );
              })}
            </div>
          )}

          {/* CATEGORY B: LIFE & ACCIDENT INSURANCE */}
          {(categoryFilter === 'all' || categoryFilter === 'life_accident') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 px-1">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  B. Life &amp; Accident Insurance
                </h3>
              </div>

              {lifeAccidentSchemes.map((scheme) => {
                const enrollment = getEnrollmentForScheme(scheme.schemeCode);
                return (
                  <SchemeCard 
                    key={scheme.id} 
                    scheme={scheme} 
                    enrollment={enrollment} 
                    onOpenDetails={() => setSelectedScheme(scheme)}
                    triggerToast={triggerToast}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Detailed Statutory Scheme Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#0B2545] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-white truncate">
                    {selectedScheme.schemeName}
                  </h3>
                  <div className="text-[10px] text-slate-300 font-mono">
                    Code: {selectedScheme.schemeCode} &bull; {selectedScheme.category}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800">
              {/* Provider Body */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Administering Authority</span>
                <span className="font-semibold text-slate-900">{selectedScheme.providerBody}</span>
              </div>

              {/* Description & Intended For */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Official Scheme Purpose</h4>
                <p className="text-slate-600 leading-relaxed text-[11px] bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                  {selectedScheme.description}
                </p>
                <div className="text-[11px] text-slate-700">
                  <strong>Target Beneficiaries:</strong> {selectedScheme.intendedFor}
                </div>
              </div>

              {/* Official Coverage Amount */}
              {selectedScheme.coverageAmount && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Statutory Benefit Amount</span>
                  <span className="text-sm font-extrabold text-emerald-950">{selectedScheme.coverageAmount}</span>
                </div>
              )}

              {/* Key Benefits List */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs">Documented Statutory Benefits</h4>
                <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedScheme.keyBenefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Eligibility Notes */}
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-xs">Eligibility Rules</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                  {selectedScheme.eligibilityNotes}
                </p>
              </div>

              {/* Status Verification Note */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 space-y-1">
                <div className="font-bold text-[#0B2545] text-[11px] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-700" />
                  <span>Personal Eligibility Verification</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal">
                  Enrollment in this Government scheme is verified through official employer registration or UAN / e-Shram portal integration.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <a
                href={selectedScheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <span>Official Government Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: Individual Scheme Card
interface SchemeCardProps {
  scheme: GovernmentBenefitScheme;
  enrollment?: GovernmentBenefitEnrollment;
  onOpenDetails: () => void;
  triggerToast: (msg: string) => void;
}

function SchemeCard({ scheme, enrollment, onOpenDetails, triggerToast }: SchemeCardProps) {
  const isEnrolled = enrollment?.enrollmentStatus === 'enrolled';
  const isUnverified = !enrollment || enrollment.enrollmentStatus === 'verification_required';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 transition-all space-y-3">
      {/* Top Row: Title & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-sm text-slate-900 leading-snug">
              {scheme.schemeName}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {scheme.providerBody}
          </div>
        </div>

        {/* Verification Status Badge */}
        {isEnrolled ? (
          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Enrolled / Active</span>
          </span>
        ) : (
          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Verification Required</span>
          </span>
        )}
      </div>

      {/* Description & Intended For */}
      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
        {scheme.description}
      </p>

      {/* Coverage Highlight if defined */}
      {scheme.coverageAmount && (
        <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] flex items-center justify-between">
          <span className="text-slate-500 font-medium">Statutory Coverage:</span>
          <span className="font-extrabold text-emerald-700">{scheme.coverageAmount}</span>
        </div>
      )}

      {/* Status Note */}
      <div className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
        isEnrolled 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
          : 'bg-amber-50/70 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-center gap-1.5">
          <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${isEnrolled ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span>
            {isEnrolled 
              ? `Verified Record: Ref #${enrollment?.referenceNumber || 'GOI-REG-OK'}`
              : 'Government scheme available • Personal eligibility verification required'}
          </span>
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100 text-xs">
        <button
          onClick={onOpenDetails}
          className="text-[#0B2545] font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View Scheme Details &amp; Benefits</span>
          <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
        </button>

        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => triggerToast(`Opening official portal: ${scheme.officialUrl}`)}
          className="text-slate-500 hover:text-slate-800 text-[10px] font-semibold flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <span>Govt. Site</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </div>
  );
}
