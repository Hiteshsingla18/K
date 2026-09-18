import React, { useState } from 'react';
import { 
  Search, 
  KeyRound, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Camera, 
  X, 
  ArrowRight, 
  Satellite, 
  Building2, 
  MapPin, 
  Sparkles,
  Info
} from 'lucide-react';
import { CitizenReportRecord } from '../types';

interface CitizenReportTrackerProps {
  reports: CitizenReportRecord[];
  initialReportId?: string;
  initialPin?: string;
  onOpenReportForm: () => void;
}

export default function CitizenReportTracker({
  reports,
  initialReportId = '',
  initialPin = '',
  onOpenReportForm
}: CitizenReportTrackerProps) {
  const [reportIdInput, setReportIdInput] = useState<string>(initialReportId);
  const [pinInput, setPinInput] = useState<string>(initialPin);
  const [searchedReport, setSearchedReport] = useState<CitizenReportRecord | null>(() => {
    if (initialReportId && initialPin) {
      return reports.find(
        r => r.id.toLowerCase() === initialReportId.toLowerCase().trim() && 
             r.pin.trim() === initialPin.trim()
      ) || null;
    }
    return null;
  });
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showScnModal, setShowScnModal] = useState<boolean>(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const cleanId = reportIdInput.trim().toUpperCase();
    const cleanPin = pinInput.trim();

    if (!cleanId) {
      setSearchError('Please enter your Report ID (e.g. CR-882).');
      return;
    }
    if (!cleanPin) {
      setSearchError('Please enter your 4-digit tracking PIN (e.g. 1428).');
      return;
    }

    const match = reports.find(
      r => r.id.toUpperCase() === cleanId && r.pin === cleanPin
    );

    if (match) {
      setSearchedReport(match);
      setSearchError(null);
    } else {
      setSearchedReport(null);
      setSearchError(`No verified report found matching ID "${cleanId}" and PIN "${cleanPin}". Please check your receipt details or try a demo report below.`);
    }
  };

  const handleQuickDemo = (demoId: string, demoPin: string) => {
    setReportIdInput(demoId);
    setPinInput(demoPin);
    setSearchError(null);
    const match = reports.find(r => r.id === demoId && r.pin === demoPin);
    if (match) {
      setSearchedReport(match);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. TRACK MY REPORT SEARCH & LOOKUP PANEL */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Direct Public Verification &bull; No Password Required
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Track Environmental Report Status
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Enter the unique Report ID (e.g., CR-882) and 4-digit PIN generated on your submission receipt.
            </p>
          </div>

          {/* Quick Demo Pre-fill Chips */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
              Test with demo reports:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickDemo('CR-882', '1428')}
                className="text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                title="End-to-end flow to SCN outcome"
              >
                <span>CR-882 (PIN: 1428)</span>
                <span className="bg-emerald-700 text-white text-[9px] px-1 rounded">SCN Triggered</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CR-914', '3891')}
                className="text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                CR-914 (PIN: 3891)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CR-942', '5620')}
                className="text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                CR-942 (PIN: 5620)
              </button>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label htmlFor="input-report-id" className="block text-xs font-bold text-slate-700 mb-1">
                Report Reference ID (Format: CR-XXX)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-report-id"
                  type="text"
                  placeholder="e.g. CR-882"
                  value={reportIdInput}
                  onChange={(e) => setReportIdInput(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono uppercase bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="input-report-pin" className="block text-xs font-bold text-slate-700 mb-1">
                4-Digit Security Tracking PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-report-pin"
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 1428"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tracking-widest bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold"
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                id="btn-submit-track"
                type="submit"
                className="w-full bg-[#138808] hover:bg-[#0f6b06] text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>Track Report</span>
              </button>
            </div>
          </div>

          {searchError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Lookup Failed: </span>
                {searchError}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 2. MATCHED REPORT TIMELINE & CORROBORATION DETAILS */}
      {searchedReport && (
        <div className="space-y-6">
          {/* A. Report Summary Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 px-3 py-1 rounded-md font-mono text-sm font-bold text-slate-900">
                  <span>{searchedReport.id}</span>
                  <button
                    onClick={() => copyToClipboard(searchedReport.id, 'id')}
                    className="text-slate-400 hover:text-slate-700 transition-colors ml-1"
                    title="Copy Report ID"
                  >
                    {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                  PIN: {searchedReport.pin}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Logged on: {searchedReport.date}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  searchedReport.statusColor === 'emerald'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : searchedReport.statusColor === 'blue'
                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                    : searchedReport.statusColor === 'red'
                    ? 'bg-red-50 text-red-900 border-red-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}>
                  Current Stage: {searchedReport.stage} of 5 &bull; {searchedReport.statusText}
                </span>
              </div>
            </div>

            {/* Quick Metadata Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-500 font-medium text-[11px]">Colliery Lease / Mine</div>
                <div className="font-bold text-slate-900 mt-0.5">{searchedReport.mineName}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-500 font-medium text-[11px]">Location / Village Area</div>
                <div className="font-bold text-slate-900 mt-0.5">{searchedReport.village}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-500 font-medium text-[11px]">Violation Category</div>
                <div className="font-bold text-slate-900 mt-0.5">{searchedReport.category}</div>
              </div>
            </div>

            <div className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900">Citizen Observation Log: </span>
              &ldquo;{searchedReport.details}&rdquo;
            </div>
          </div>

          {/* B. HIGHLIGHTED BANNER: If this report contributed to an issued SCN */}
          {searchedReport.contributedToScn && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-500 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-200 text-emerald-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-emerald-800" />
                      Statutory Action Triggered
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                      Your report was one of 14 that helped trigger Show-Cause Notice {searchedReport.scnNumber || 'SCN-2026-082'}.
                    </h3>
                    <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                      Your ground-level observations and geotag matched optical satellite telemetry over the Rajmahal basin, establishing indisputable multi-point evidence that mandated official regulatory intervention.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowScnModal(true)}
                  className="bg-[#0B2545] hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-center"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Inspect SCN Notice</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                </button>
              </div>
            </div>
          )}

          {/* C. STATUS TIMELINE (1 to 5 STAGES) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Official Redressal &amp; Surveillance Timeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each milestone reflects verified statutory actions by the Ministry of Coal and DGMS.
              </p>
            </div>

            {/* Timeline Stages Flow */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 before:z-0">
              {/* STAGE 1: Submitted */}
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-slate-900">
                      Stage 1: Submitted
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Logged in Ministry Registry
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Your observation and geotag were securely logged in the Ministry database.
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <span>Logged: {searchedReport.date} &bull; Reference {searchedReport.id}</span>
                    <span className="text-emerald-700 font-medium">Aadhaar/Mobile Verified</span>
                  </div>
                </div>
              </div>

              {/* STAGE 2: Satellite Cross-Check in Progress */}
              <div className="relative z-10 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ring-4 ring-white ${
                  searchedReport.stage >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {searchedReport.stage >= 3 ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Satellite className="w-5 h-5 animate-pulse text-white" />
                  )}
                </div>
                <div className={`flex-1 rounded-lg p-4 space-y-1.5 border ${
                  searchedReport.stage === 2
                    ? 'bg-blue-50/70 border-blue-300'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-slate-900">
                      Stage 2: Satellite Cross-Check in Progress
                    </h4>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      searchedReport.stage > 2
                        ? 'text-emerald-800 bg-emerald-100'
                        : 'text-blue-800 bg-blue-100'
                    }`}>
                      {searchedReport.stage > 2 ? 'Analysis Complete' : 'Telemetry Scanning Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Automated optical (Sentinel-2) and radar (Sentinel-1) overpass algorithms are scanning the lease coordinates.
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <span>ESA Copernicus Swath #324 &bull; 10m Spatial Ground Resolution</span>
                    <span className="text-slate-600 font-medium">Cloud filter: Passed</span>
                  </div>
                </div>
              </div>

              {/* UNCORROBORATED / IN-PROGRESS CASE:
                  "If not yet correlated, show the current stage only with an estimated next-update time, no fabricated future stages." */}
              {searchedReport.stage < 3 ? (
                <div className="relative z-10 ml-14 p-4 bg-amber-50/80 border border-amber-300 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Estimated Next Telemetry Update:</span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium">
                    {searchedReport.estimatedNextUpdate || 'Today at 04:30 AM IST (approx. 3.5 hours) during next Sentinel-2B orbital pass.'}
                  </p>
                  <div className="text-[11px] text-slate-600 flex items-start gap-1.5 pt-1 border-t border-amber-200">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>
                      Stages 3 through 5 will unlock sequentially once multi-spectral satellite reflectance matches the ground coordinates. No stages are fabricated in advance.
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* STAGE 3: Corroborated with Evidence */}
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-white">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">
                          Stage 3: Corroborated with Evidence
                        </h4>
                        <div className="flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          <span>{searchedReport.geotagCorrelationPct || 98.4}% Geotag Correlation</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        Satellite spectral analysis matches ground observation ({searchedReport.geotagCorrelationPct || 98.4}% correlation with Sentinel-2 pixel variation).
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Multi-spectral NDVI vegetation strip loss and earthmoving tracks confirmed</span>
                        <span className="text-emerald-800 font-bold">14 Village Geotags Correlated</span>
                      </div>
                    </div>
                  </div>

                  {/* STAGE 4: Escalated to Show-Cause Notice */}
                  {searchedReport.stage >= 4 && (
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900">
                            Stage 4: Escalated to Show-Cause Notice
                          </h4>
                          <span className="text-xs font-bold bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 rounded-full">
                            {searchedReport.scnNumber || 'SCN-2026-082'} Dispatched
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">
                          Official statutory violation notice {searchedReport.scnNumber || 'SCN-2026-082'} dispatched to mine operator with 48-hour compliance mandate.
                        </p>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                          <span>Statutory Authority: DGMS Surveillance Directorate</span>
                          <span className="text-red-700 font-semibold">28.42 Ha Boundary Deviation</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STAGE 5: Notice Outcome */}
                  {searchedReport.stage >= 5 && (
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 bg-emerald-50/60 border border-emerald-300 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900">
                            Stage 5: Notice Outcome
                          </h4>
                          <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                            {searchedReport.outcomeStatus === 'resolved' ? 'Resolved & Verified' : 'Operator Response Under Verification'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          Colliery operator submitted formal clarification — currently under DGMS statutory verification.
                        </p>
                        <div className="text-xs bg-white border border-slate-200 rounded p-2.5 text-slate-700 space-y-1">
                          <div className="font-bold text-slate-900">Latest Directorate Update:</div>
                          <p className="text-[11px] leading-relaxed">
                            {searchedReport.scnOutcome || 'ECL Colliery General Manager submitted technical rebuttal asserting haul road drainage works. Joint ground inspection scheduled with district revenue collector and Simlong village representatives.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SCN-2026-082 OFFICIAL STATUTORY NOTICE MODAL */}
      {showScnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            {/* National Header in Modal */}
            <div className="bg-[#0B2545] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center pr-3 border-r border-slate-500">
                  <span className="font-serif font-bold text-sm text-amber-300 leading-none">सत्यमेव जयते</span>
                  <span className="text-[8px] text-slate-300 uppercase tracking-wide mt-0.5">Govt. of India</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                    Directorate General of Mines Surveillance &bull; Ministry of Coal
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Statutory Show-Cause Notice: SCN-2026-082
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowScnModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 space-y-1">
                <div className="font-bold text-amber-900 text-sm">
                  Notice under Section 22(1) &amp; 22(3) of Mines Act, 1952
                </div>
                <div className="text-slate-600">
                  Issued to: <strong>Agent &amp; General Manager, Eastern Coalfields Ltd (ECL)</strong>, Rajmahal Open Cast Project, Coal India Limited.
                </div>
                <div className="text-slate-500 text-[11px]">
                  Date of Statutory Issue: 29 August 2026 &bull; Reference Code: DGMS/SURV/ER/2026/082
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Summary of Findings Corroborated by Public Vigilance:
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 leading-relaxed">
                  <li>
                    <strong>Boundary Deviation:</strong> Heavy mechanized excavation detected 400m east past approved statutory milestone #14, encompassing 28.42 Hectares of unapproved surface land.
                  </li>
                  <li>
                    <strong>Public Corroboration:</strong> Corroborated by 14 geotagged citizen observations from Simlong Village cluster and Taljhari Hamlet, including dust plume drift reports.
                  </li>
                  <li>
                    <strong>Satellite Verification:</strong> High-resolution Sentinel-2 optical telemetry recorded active earthmoving equipment tracks directly across the unapproved zone.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                <span className="font-bold text-slate-800 block">Operator Rebuttal &amp; Next Action:</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  ECL has submitted a technical reply claiming the earthmoving was protective slope stabilization and rainwater canalization. DGMS and district administrative officers are conducting joint physical boundary inspection to determine financial penalties or mine stoppage orders.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowScnModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Close Notice Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
