import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Paperclip, 
  Send, 
  Check, 
  Shield, 
  Satellite, 
  MapPin, 
  LogOut, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  Download,
  Calendar,
  FileCheck,
  Users
} from 'lucide-react';
import { AuthUser, MineRecord, ViolationStatus, UserRole, WorkforceAttendanceRecord } from '../types';
import RegulatoryCopilot from './RegulatoryCopilot';
import SurveillanceMap from './SurveillanceMap';
import GlobalHeaderControls from './GlobalHeaderControls';
import WorkforceAttendanceRoster from './WorkforceAttendanceRoster';

interface OperatorPortalProps {
  currentUser: AuthUser;
  violationStatus: ViolationStatus;
  mines: MineRecord[];
  onSubmitFormalResponse: () => void;
  onSignOut: () => void;
  onOpenDossierModal: () => void;
  triggerToast: (msg: string) => void;
  isOnline?: boolean;
  isSyncing?: boolean;
  pendingSyncCount?: number;
  onToggleNetwork?: () => void;
  onOpenSyncModal?: () => void;
  onSwitchPortal?: (role: UserRole, route: string) => void;
  attendanceRoster?: WorkforceAttendanceRecord[];
}

type OperatorNavTab = 'notice_response' | 'lease_map' | 'compliance_history' | 'workforce_attendance';

export default function OperatorPortal({
  currentUser,
  violationStatus,
  mines,
  onSubmitFormalResponse,
  onSignOut,
  onOpenDossierModal,
  triggerToast,
  isOnline = true,
  isSyncing = false,
  pendingSyncCount = 0,
  onToggleNetwork = () => {},
  onOpenSyncModal = () => {},
  onSwitchPortal = () => {},
  attendanceRoster
}: OperatorPortalProps) {
  const [activeTab, setActiveTab] = useState<OperatorNavTab>('notice_response');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Form State for SCN Response
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
    triggerToast('Formal clarification submitted to Ministry of Coal Vigilance. State set to Awaiting Official Verification.');
  };

  const rajmahalMine = mines.find(m => m.id === 'MIN-4492-R') || mines[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased overflow-x-hidden">
      {/* 1. OPERATOR PERSISTENT DARK SIDEBAR (Width: 260px, Background: #0A192F) */}
      <aside 
        id="operator-sidebar"
        className="w-[260px] bg-[#0A192F] text-white flex flex-col shrink-0 min-h-screen border-r border-slate-800 sticky top-0 h-screen z-30 select-none shadow-xl"
      >
        {/* Branding & Active Profile */}
        <div className="p-4 border-b border-slate-800/80 shrink-0 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center justify-center shrink-0">
              <img 
                src="/src/assets/logo.png" 
                alt="K Logo" 
                className="h-9 w-9 object-contain rounded-full" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('w-9', 'h-9', 'rounded-full', 'bg-[#0A192F]', 'border-2', 'border-cyan-400', 'flex', 'items-center', 'justify-center', 'text-cyan-300', 'font-mono', 'font-black', 'text-sm', 'shadow-[0_0_12px_rgba(6,182,212,0.5)]');
                  e.currentTarget.parentElement?.appendChild(document.createTextNode('K'));
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white truncate">KhananRakshak AI</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">
                  K-AI
                </span>
              </div>
              <div className="text-[11px] text-slate-400 leading-tight truncate mt-0.5">
                Operator Desk &bull; SIH26024
              </div>
            </div>
          </div>

          {/* Active Operator Profile Card */}
          <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="text-[9px] uppercase font-bold text-amber-400 tracking-wider truncate">
              {currentUser.badgeText}
            </div>
            <div className="font-semibold text-white truncate text-[11px]">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {currentUser.designation}
            </div>
          </div>
        </div>

        {/* Operator Navigation Items (Role-Specific ONLY) */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Operator Action Desk
          </div>

          {/* 1. SCN Response Desk */}
          <button
            id="operator-nav-notice"
            onClick={() => setActiveTab('notice_response')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'notice_response'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className={`w-4 h-4 ${activeTab === 'notice_response' ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">Notice SCN-2026-082 Desk</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${
              violationStatus === 'response_submitted_awaiting_verification'
                ? 'bg-emerald-800 text-emerald-100'
                : 'bg-red-600 text-white animate-pulse'
            }`}>
              {violationStatus === 'response_submitted_awaiting_verification' ? 'Filed' : '48h'}
            </span>
          </button>

          {/* 2. Lease Radar & Satellite Map */}
          <button
            id="operator-nav-map"
            onClick={() => setActiveTab('lease_map')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'lease_map'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Satellite className={`w-4 h-4 ${activeTab === 'lease_map' ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">Lease Boundary &amp; Radar</span>
          </button>

          {/* 3. Statutory Clearances & EC/FC History */}
          <button
            id="operator-nav-history"
            onClick={() => setActiveTab('compliance_history')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'compliance_history'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <FileCheck className={`w-4 h-4 ${activeTab === 'compliance_history' ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">Statutory Clearances Log</span>
          </button>

          {/* 4. Labour Attendance & Workforce Composition */}
          <button
            id="operator-nav-workforce"
            onClick={() => setActiveTab('workforce_attendance')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'workforce_attendance'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Users className={`w-4 h-4 ${activeTab === 'workforce_attendance' ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">Workforce &amp; Attendance</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 bg-amber-900/60 text-amber-200 border border-amber-600/40">
              412
            </span>
          </button>
        </div>

        {/* Bottom Sidebar: AI Regulatory Copilot & Sign Out */}
        <div className="p-3 space-y-2.5 border-t border-slate-800 bg-[#071324] shrink-0">
          <button
            id="btn-operator-copilot"
            onClick={() => setIsCopilotOpen(true)}
            className="w-full bg-gradient-to-r from-amber-900/40 to-slate-900 border border-amber-500/30 text-white rounded-lg p-2.5 flex items-center justify-between shadow-xs transition-all text-xs font-semibold cursor-pointer group hover:border-amber-400/50"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-amber-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-none text-white">Regulatory Copilot</div>
                <div className="text-[10px] text-amber-300/80 mt-0.5">CMR 2017 &amp; EC Rules</div>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded border border-amber-400/30 font-mono">
              Open &rarr;
            </span>
          </button>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-[10px] text-slate-500">ECL Node Synced</span>
            <button
              onClick={onSignOut}
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN OPERATOR WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP STATUS HEADER */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shrink-0 shadow-2xs">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            {/* Breadcrumb & K Logo in Header */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative inline-flex items-center justify-center shrink-0">
                <img 
                  src="/src/assets/logo.png" 
                  alt="K Logo" 
                  className="h-7 w-7 object-contain rounded-full" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('w-7', 'h-7', 'rounded-full', 'bg-[#0A192F]', 'border', 'border-cyan-400', 'flex', 'items-center', 'justify-center', 'text-cyan-300', 'font-mono', 'font-black', 'text-xs');
                    e.currentTarget.parentElement?.appendChild(document.createTextNode('K'));
                  }}
                />
              </div>
              <span className="font-bold text-sm text-slate-900 truncate">KhananRakshak AI</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider truncate">
                Colliery Operator Desk
              </span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-xs text-slate-700 truncate hidden md:inline">
                {activeTab === 'notice_response' && 'Show-Cause Notice SCN-2026-082 Clarification'}
                {activeTab === 'lease_map' && 'Rajmahal OCP Lease Boundary & Sentinel Radar'}
                {activeTab === 'compliance_history' && 'Statutory Clearances & Audit History'}
              </span>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 text-xs shrink-0">
              {/* Notice Countdown Badge */}
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md text-amber-900 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {violationStatus === 'response_submitted_awaiting_verification'
                    ? 'Response Lodged (Under Verification)'
                    : '48h Statutory SCN Active'}
                </span>
              </div>

              {/* View Legal Dossier Modal */}
              <button
                id="btn-operator-view-dossier"
                onClick={onOpenDossierModal}
                className="hidden md:flex text-xs text-amber-800 hover:bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200 font-semibold items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span>Ministry Dossier</span>
              </button>

              {/* Global Offline-First Simulator & Universal 5-Role Switcher */}
              <GlobalHeaderControls
                currentUser={currentUser}
                currentPath="/operator"
                isOnline={isOnline}
                isSyncing={isSyncing}
                pendingSyncCount={pendingSyncCount}
                onToggleNetwork={onToggleNetwork}
                onOpenSyncModal={onOpenSyncModal}
                onSwitchPortal={onSwitchPortal}
                onSignOut={onSignOut}
                theme="light"
              />
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SCN NOTICE CLARIFICATION DESK */}
          {activeTab === 'notice_response' && (
            <div className="space-y-6">
              {/* Urgent Notice Alert Banner */}
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
                      Colliery Operator Clarification Desk: Show-Cause Notice ENV-082
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
                      <span>Coordinates: 25.021°N, 87.398°E</span>
                      <button
                        onClick={onOpenDossierModal}
                        className="text-blue-700 hover:underline font-semibold text-[11px] cursor-pointer"
                      >
                        Inspect Full Dossier &rarr;
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Operator Formal Clarification Form */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 lg:p-6 shadow-2xs space-y-5">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Operator Clarification Filing</h2>
                      <p className="text-xs text-slate-500">File technical rebuttal and surveyor attachments to Ministry of Coal.</p>
                    </div>
                  </div>

                  {submissionSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 text-center space-y-3 my-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <div className="font-bold text-emerald-950 text-base">Formal Clarification Lodged</div>
                      <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                        Your submission has been securely transmitted to the Directorate General of Mines Vigilance. The notice state is now updated to <strong>Awaiting Official Verification</strong>.
                      </p>
                      <div className="p-3 bg-white/80 rounded border border-emerald-200 text-xs text-emerald-900 font-mono">
                        Ack Ref: ECL-RAJ-2026-SCN-082-SUBMITTED
                      </div>
                      <button
                        onClick={() => setSubmissionSuccess(false)}
                        className="text-xs text-emerald-900 font-bold underline cursor-pointer mt-2"
                      >
                        Edit or Append Additional Addendum
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                          Technical Explanation &amp; Rebuttal Statement
                        </label>
                        <textarea
                          value={operatorExplanation}
                          onChange={(e) => setOperatorExplanation(e.target.value)}
                          className="w-full border border-slate-300 rounded-md shadow-2xs focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-xs p-3 h-32 bg-white text-slate-800 outline-hidden font-normal leading-relaxed"
                          placeholder="Provide clear technical, statutory, and survey reasons for the flagged boundary deviation..."
                          required
                        />
                        <span className="text-[10px] text-slate-400 block">
                          Statutory declaration under Regulation 109 of Coal Mines Regulations 2017.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                          Supporting Documentation &amp; Survey Evidence
                        </label>
                        
                        <div className="space-y-2">
                          {attachedFiles.map((filename, i) => (
                            <div key={i} className="border border-slate-200 rounded-md p-3 bg-slate-50 flex items-center justify-between shadow-2xs">
                              <div className="flex items-center gap-2.5">
                                <FileText className="w-4 h-4 text-amber-700" />
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
                          className="text-xs text-amber-800 hover:underline font-semibold flex items-center gap-1 mt-1 cursor-pointer"
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
                          className="w-full border border-slate-300 rounded-md shadow-2xs focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-xs p-2.5 bg-white text-slate-800 outline-hidden font-medium"
                        >
                          <option value="Chief Mine Surveyor - ECL Rajmahal Area">Chief Mine Surveyor - ECL Rajmahal Area</option>
                          <option value="Agent & General Manager - Rajmahal OCP">Agent & General Manager - Rajmahal OCP</option>
                          <option value="Director (Technical Operations) - Eastern Coalfields Ltd">Director (Technical Operations) - Eastern Coalfields Ltd</option>
                        </select>
                      </div>

                      <div className="border-t border-slate-200 pt-4 mt-4 space-y-2">
                        <button
                          id="btn-submit-formal-response"
                          type="submit"
                          className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3 px-4 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <span>Submit Formal Response to Ministry</span>
                          <Send className="w-4 h-4" />
                        </button>
                        <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Transfers status to 'Awaiting Official Verification' on the Government Command Center.</span>
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEASE RADAR & SATELLITE MAP */}
          {activeTab === 'lease_map' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">
                      Operator Lease Radar
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      Rajmahal OCP Lease Geometry &bull; DGPS Embankment Overlay
                    </h2>
                  </div>
                  <span className="text-xs bg-slate-100 px-3 py-1 rounded border border-slate-200 text-slate-700">
                    Cadence: Sentinel-2 5-Day Loop
                  </span>
                </div>

                <div className="h-[480px] rounded-lg overflow-hidden border border-slate-300">
                  <SurveillanceMap
                    mines={mines}
                    selectedMine={rajmahalMine}
                    onSelectMine={() => {}}
                    onInvestigateEvidence={() => {}}
                    filterState="All States"
                    filterRisk="All Risks"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATUTORY CLEARANCES & EC/FC HISTORY */}
          {activeTab === 'compliance_history' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">
                  Compliance Archive
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Eastern Coalfields Ltd &bull; Statutory Clearances &amp; Approvals
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological record of Environmental Clearance (EC), Forest Clearance (FC), and DGMS Safety Approvals for Rajmahal OCP.
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">MoEFCC Environmental Clearance (EC) Extension</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Sanction No: J-11015/28/2006-IA.II(M) for peak 17.0 MTPA capacity across 890 Hectares lease area.
                    </p>
                    <div className="text-[10px] text-slate-400">Granted: 14 Jan 2021 &bull; Valid Until: 31 Mar 2031</div>
                  </div>
                  <button className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF (2.4 MB)</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">Monsoon Safety Circular Embankment Approval</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">Cited in Rebuttal</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      DGMS Circular No. 04/2026: Mandatory construction of earthen diversion dykes prior to July heavy precipitation.
                    </p>
                    <div className="text-[10px] text-slate-400">Approved: 02 May 2026 &bull; Status: Executed on East Ridge</div>
                  </div>
                  <button className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF (890 KB)</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">DGPS Perimeter Benchmark Calibration Log</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Survey Complete</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Survey of India differential GPS benchmarker calibration points 1 to 24 along Rajmahal periphery.
                    </p>
                    <div className="text-[10px] text-slate-400">Surveyed: 18 Aug 2026 &bull; Lead Surveyor: S-4190</div>
                  </div>
                  <button className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    <span>DWG/PDF (6.1 MB)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. LABOUR ATTENDANCE & WORKFORCE COMPOSITION */}
          {activeTab === 'workforce_attendance' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                      Colliery Labour Attendance &amp; Contractor Workforce Composition
                    </h1>
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded border border-amber-300">
                      ECL Rajmahal Area
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Statutory oversight of direct Coal India Limited roll personnel and 4 third-party contractor agencies under Mines Act 1952.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-slate-700">
                    Mines Act 1952 &bull; Sec 48 Muster Roll
                  </span>
                </div>
              </div>

              <WorkforceAttendanceRoster
                roster={attendanceRoster}
                triggerToast={triggerToast}
                roleContext="operator"
              />
            </div>
          )}
        </main>
      </div>

      {/* Operator Copilot Drawer */}
      <RegulatoryCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedMine={rajmahalMine}
        onNavigateToEvidence={() => {
          setActiveTab('notice_response');
          setIsCopilotOpen(false);
        }}
      />
    </div>
  );
}
