import React, { useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Satellite, 
  Shield, 
  Eye, 
  FileCheck, 
  Check, 
  Send, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Download,
  Building2,
  Paperclip
} from 'lucide-react';
import { ViolationStatus } from '../types';

interface OperatorDeskProps {
  violationStatus: ViolationStatus;
  onSubmitFormalResponse: () => void;
  onNavigateToGovCommand: () => void;
}

export default function OperatorDesk({
  violationStatus,
  onSubmitFormalResponse,
  onNavigateToGovCommand
}: OperatorDeskProps) {
  const [operatorExplanation, setOperatorExplanation] = useState<string>(
    'Regarding the flagged 28-hectare perimeter in Rajmahal OCP Section 4: Extraction equipment was temporarily shifted eastward to construct an emergency earthen storm-water diversion embankment as mandated by Monsoon Safety Circular 2026. No commercial coal winning took place beyond benchmark 14.'
  );

  const [attachedFiles, setAttachedFiles] = useState<string[]>([
    'ECL_Rajmahal_Monsoon_Embankment_Approval_2026.pdf',
    'DGPS_Boundary_Pillar_Differential_Survey_Aug2026.dwg'
  ]);

  const [authorizedOfficer, setAuthorizedOfficer] = useState<string>(
    'Chief Mine Surveyor - ECL Rajmahal Area'
  );

  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(
    violationStatus === 'response_submitted_awaiting_verification'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFormalResponse();
    setSubmissionSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Urgent SCN Notice Alert Banner */}
      <div className="bg-white border border-red-200 border-l-4 border-l-red-600 rounded-lg p-5 lg:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                48 Hours Statutory Notice
              </span>
              <span className="font-mono text-xs text-slate-500 font-semibold">SCN-2026-082</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-xs text-slate-500">Issued: 26 Aug 2026</span>
            </div>

            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
              Mine Operator Clarification Desk: Show-Cause Notice ENV-082
            </h1>
            <p className="text-xs text-slate-600">
              Authority: Directorate General of Mines Vigilance, Ministry of Coal, Govt. of India.
            </p>
          </div>

          <div className="shrink-0">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border ${
              violationStatus === 'response_submitted_awaiting_verification'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {violationStatus === 'response_submitted_awaiting_verification'
                ? 'Response Submitted (Under Verification)'
                : 'Awaiting Operator Response (Active Notice)'}
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Government Allegation Dossier */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 lg:p-6 space-y-5 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <FileText className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Government Allegation Dossier</h2>
          </div>

          <ul className="space-y-3.5 text-xs">
            <li className="flex gap-3">
              <div className="p-1.5 bg-red-50 text-red-600 rounded shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Discrepancy detected:</p>
                <p className="text-slate-600 font-mono mt-0.5">28 Hectares active extraction outside approved lease line</p>
              </div>
            </li>

            <li className="flex gap-3">
              <div className="p-1.5 bg-blue-50 text-[#1E40AF] rounded shrink-0">
                <Satellite className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Evidence attached by Ministry:</p>
                <p className="text-slate-600 mt-0.5">Optical/Radar Sentinel-2 satellite scan + 14 corroborating citizen geotagged reports</p>
              </div>
            </li>

            <li className="flex gap-3">
              <div className="p-1.5 bg-slate-100 text-slate-700 rounded shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Regulatory violation cited:</p>
                <p className="text-slate-600 font-mono mt-0.5">MoEFCC Clearance Rule 14(b) - Statutory Boundary Adherence</p>
              </div>
            </li>
          </ul>

          {/* Geospatial Scan Visual */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-950 relative">
            <div className="h-56 relative flex items-center justify-center">
              <svg viewBox="0 0 500 280" className="w-full h-full">
                <rect width="500" height="280" fill="#0f172a" />
                <circle cx="240" cy="140" r="110" fill="#1e293b" />
                <circle cx="240" cy="140" r="80" fill="#334155" />
                <circle cx="240" cy="140" r="50" fill="#020617" />
                
                {/* Approved boundary */}
                <polygon points="120,60 360,70 380,220 150,210" fill="none" stroke="#10b981" strokeWidth="2.5" />
                
                {/* Encroachment zone */}
                <polygon points="360,70 440,90 440,190 380,220" fill="#ef4444" fillOpacity="0.5" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 3" />
                
                {/* Geotag pins */}
                <circle cx="390" cy="100" r="4" fill="#facc15" />
                <circle cx="410" cy="130" r="4" fill="#facc15" />
                <circle cx="400" cy="170" r="4" fill="#facc15" />
              </svg>

              <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                Incident Report #ENV-082 | 25°01'18"N 87°23'42"E
              </div>
            </div>

            <div className="p-2.5 bg-slate-100 text-slate-600 text-xs flex justify-between items-center border-t border-slate-200">
              <span className="font-mono text-[11px]">Geospatial Intelligence Scan - 24 Aug 2026</span>
              <span className="text-red-700 text-xs font-semibold">28 Ha Deviation Highlighted</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Operator Response Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 lg:p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-5">
              <FileCheck className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">Submit Formal Clarification & Corrective Evidence</h2>
            </div>

            {submissionSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 text-center space-y-3 my-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <div className="font-bold text-emerald-950 text-base">Formal Clarification Dispatched to Ministry</div>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Your official technical justification and DGPS survey annexures have been transmitted to the Directorate General of Mines Vigilance. The Government Command Center has been alerted.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onNavigateToGovCommand}
                    className="px-4 py-2 bg-[#1E40AF] hover:bg-blue-800 text-white rounded-md text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>View in Government Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Operator Technical Clarification
                  </label>
                  <textarea
                    value={operatorExplanation}
                    onChange={(e) => setOperatorExplanation(e.target.value)}
                    className="w-full border border-slate-300 rounded-md shadow-2xs focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF] text-xs p-3 h-32 bg-white text-slate-800 outline-hidden font-normal leading-relaxed"
                    placeholder="Provide clear technical, statutory, and survey reasons for the flagged boundary deviation..."
                    required
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Statutory declaration under Regulation 109 of Coal Mines Regulations 2017.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Supporting Documentation & Survey Evidence
                  </label>
                  
                  <div className="space-y-2">
                    {attachedFiles.map((filename, i) => (
                      <div key={i} className="border border-slate-200 rounded-md p-3 bg-slate-50 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#1E40AF]" />
                          <div>
                            <p className="font-semibold text-xs text-slate-800">{filename}</p>
                            <p className="text-[10px] text-slate-500">Verified by Certified Mine Surveyor (DGMS Reg: S-4190)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-700 text-[10px] font-bold bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Attached</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const name = `ECL_Survey_Audit_Addendum_${Date.now().toString().slice(-4)}.pdf`;
                      setAttachedFiles([...attachedFiles, name]);
                    }}
                    className="text-xs text-[#1E40AF] hover:underline font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>+ Attach Additional Survey Map or Gazette Clearance</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Authorized Sign-Off
                  </label>
                  <select
                    value={authorizedOfficer}
                    onChange={(e) => setAuthorizedOfficer(e.target.value)}
                    className="w-full border border-slate-300 rounded-md shadow-2xs focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF] text-xs p-2.5 bg-white text-slate-800 outline-hidden font-medium"
                  >
                    <option value="Chief Mine Surveyor - ECL Rajmahal Area">Chief Mine Surveyor - ECL Rajmahal Area</option>
                    <option value="Agent & General Manager - Rajmahal OCP">Agent & General Manager - Rajmahal OCP</option>
                    <option value="Director (Technical Operations) - Eastern Coalfields Ltd">Director (Technical Operations) - Eastern Coalfields Ltd</option>
                  </select>
                </div>

                <div className="border-t border-slate-200 pt-5 mt-6 space-y-3">
                  <button
                    id="btn-submit-formal-response"
                    type="submit"
                    className="w-full bg-[#1E40AF] hover:bg-blue-800 active:bg-blue-900 text-white py-3 px-4 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Submit Formal Response to Ministry</span>
                    <Send className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Transfers state to 'Awaiting Official Verification' on the Government Command Center.</span>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
