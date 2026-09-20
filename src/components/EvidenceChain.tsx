import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Send, 
  Download, 
  Layers, 
  Satellite, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  FileText,
  Eye,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Hash,
  Copy,
  Lock,
  Scale,
  Database,
  Activity,
  ShieldCheck,
  Check
} from 'lucide-react';
import { MineRecord, ViolationStatus, AuditTrailEntry } from '../types';

interface EvidenceChainProps {
  mine: MineRecord;
  violationStatus: ViolationStatus;
  onIssueShowCauseNotice: () => void;
  onOpenDossierModal: () => void;
  onBackToOverview: () => void;
}

const AUDIT_TRAIL_DATA: AuditTrailEntry[] = [
  {
    id: 'TX-10492',
    blockNumber: 10492,
    eventType: 'SCN_DISPATCH',
    eventLabel: 'Show-Cause Notice SCN-2026-082 Dispatched',
    author: 'Dr. A. Sharma',
    role: 'Chief Vigilance Officer',
    agency: 'Directorate General of Mines Safety (DGMS)',
    utcTimestamp: '2026-08-26 09:41:22 UTC',
    hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    prevHashSha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    verificationStatus: 'verified',
    details: 'Formal statutory show-cause notice issued to Eastern Coalfields Limited for 28.42 Ha boundary encroachment under MoEFCC Rule 14(b) & CMR 2017 Regulation 109.',
    coordinates: '25.0486° N, 87.3917° E'
  },
  {
    id: 'TX-10491',
    blockNumber: 10491,
    eventType: 'OPERATOR_DEFENSE',
    eventLabel: 'Notice Acknowledgment by Operator Desk',
    author: 'S. Mukherjee',
    role: 'General Manager / Colliery Agent',
    agency: 'Eastern Coalfields Limited (ECL)',
    utcTimestamp: '2026-08-26 11:05:14 UTC',
    hashSha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    prevHashSha256: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7',
    verificationStatus: 'verified',
    details: 'Operator acknowledged SCN-2026-082. Submitted provisional topsoil dump stabilization defense docket #ECL-DGPS-2026-881.',
    coordinates: '25.0486° N, 87.3917° E'
  },
  {
    id: 'TX-10490',
    blockNumber: 10490,
    eventType: 'AI_CONFIDENCE_RUN',
    eventLabel: 'Multimodal AI Decision Inference #RUN-882',
    author: 'KhananRakshak AI Engine',
    role: 'Automated Multi-Sensor Pipeline',
    agency: 'DGMS Cloud AI Orchestrator',
    utcTimestamp: '2026-08-26 06:12:45 UTC',
    hashSha256: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7',
    prevHashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    verificationStatus: 'verified',
    details: 'Ensemble model computed 89.4% confidence match. Factor decomposition: NDVI Loss (38%), SAR Surface Disturbance (32%), Citizen Reports (19.4%). Exceeded 75% threshold.',
    coordinates: '25.0486° N, 87.3917° E'
  },
  {
    id: 'TX-10489',
    blockNumber: 10489,
    eventType: 'SATELLITE_SYNC',
    eventLabel: 'Sentinel-2 MSI Level-2A Ortho Pass Ingestion',
    author: 'Copernicus Hub / NRSC',
    role: 'Earth Observation Relay Node',
    agency: 'ISRO & European Space Agency',
    utcTimestamp: '2026-08-25 18:30:00 UTC',
    hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    prevHashSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    verificationStatus: 'verified',
    details: 'Ingested 10m surface reflectance tile T45Q. Delta analysis verified -71.8% green biomass loss on Rajmahal eastern boundary ridge.',
    coordinates: '25.0486° N, 87.3917° E'
  },
  {
    id: 'TX-10488',
    blockNumber: 10488,
    eventType: 'COMMUNITY_CORROBORATION',
    eventLabel: 'Community Grievance Spatial Cluster Ingested',
    author: 'Khanan Prahari Gateway',
    role: 'Citizen Vigilance System',
    agency: 'Ministry of Coal Citizen Node',
    utcTimestamp: '2026-08-25 16:45:10 UTC',
    hashSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    prevHashSha256: '2c624232cdd221771294dfbb310aca000a0df6ec8b66027e193e009e3f9122f0',
    verificationStatus: 'verified',
    details: '14 citizen geotagged reports corroborated within 120m of detected perimeter anomaly. Noise and dust disturbance confirmed.',
    coordinates: '25.0210° N, 87.3980° E'
  },
  {
    id: 'TX-10487',
    blockNumber: 10487,
    eventType: 'FIELD_VERIFICATION',
    eventLabel: 'Baseline Ground Truth Boundary Calibration',
    author: 'Er. Vikram Sengupta',
    role: 'Senior Safety Officer (First Class Mgr)',
    agency: 'DGMS Field Station / ECL Desk',
    utcTimestamp: '2026-08-20 10:15:33 UTC',
    hashSha256: '2c624232cdd221771294dfbb310aca000a0df6ec8b66027e193e009e3f9122f0',
    prevHashSha256: '0000000000000000000000000000000000000000000000000000000000000000',
    verificationStatus: 'verified',
    details: 'Pillar markers P-14 to P-19 calibrated via Differential GPS survey. Genesis block established for ENV-082 audit chain.',
    coordinates: '25.0180° N, 87.3950° E'
  }
];

export default function EvidenceChain({
  mine,
  violationStatus,
  onIssueShowCauseNotice,
  onOpenDossierModal,
  onBackToOverview
}: EvidenceChainProps) {
  const [activeTab, setActiveTab] = useState<'comparison' | 'ndvi' | 'telemetry' | 'audit_trail'>('comparison');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [overlayLease, setOverlayLease] = useState<boolean>(true);
  const [overlayBuffer, setOverlayBuffer] = useState<boolean>(true);
  const [xaiExpanded, setXaiExpanded] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Evidence Investigation Header */}
      <div className="bg-white border border-[#DDD8CF] rounded-lg p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                Critical Boundary Violation
              </span>
              <span className="font-mono text-xs text-slate-500 font-semibold">Incident Ref: ENV-082</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-xs text-slate-500">Notice ID: SCN-2026-082</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1A2810]">
              {mine?.name}: Statutory Lease Line Encroachment
            </h1>
            <p className="text-xs text-[#5C6B57] mt-1">
              Operator: <strong className="text-[#1A2810]">{mine?.operator}</strong> &bull; Region: {mine?.region}, {mine?.state} &bull; Clearance Standard: MoEFCC Rule 14(b)
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={onOpenDossierModal}
              className="px-3.5 py-2 bg-white border border-[#DDD8CF] hover:bg-[#FAF8F4] text-[#5C6B57] rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#5C6B57]" />
              <span>Inspection Dossier (PDF)</span>
            </button>
            <button
              id="btn-issue-show-cause-top"
              onClick={onIssueShowCauseNotice}
              className="px-4 py-2 bg-[#2A5C45] hover:bg-[#1E3A2F] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Issue Show-Cause Notice</span>
            </button>
          </div>
        </div>

        {/* Status Indicator Bar with AI Match & Expandable XAI Button */}
        <div className="mt-4 pt-3 border-t border-[#EDE9E2] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#5C6B57] font-medium">Investigation State:</span>
            {violationStatus === 'pending_review' && (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                Official Review Pending (Awaiting Directorate Notice)
              </span>
            )}
            {violationStatus === 'awaiting_mine_response' && (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Notice Dispatched - Awaiting Mine Response (48h Clock)
              </span>
            )}
            {violationStatus === 'response_submitted_awaiting_verification' && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Operator Response Submitted - Awaiting Official Verification
              </span>
            )}
          </div>

          {/* 89.4% AI Match Badge & XAI Confidence Decomposition Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-xs font-mono">89.4% AI Match</span>
            </div>

            <button
              onClick={() => setXaiExpanded(!xaiExpanded)}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                xaiExpanded 
                  ? 'bg-[#1A2810] text-white border-[#152D22] shadow-xs' 
                  : 'bg-white border-[#DDD8CF] text-[#5C6B57] hover:bg-[#FAF8F4] shadow-sm'
              }`}
              title="View Explainable AI factor contribution breakdown"
            >
              <Activity className={`w-3.5 h-3.5 ${xaiExpanded ? 'text-blue-300' : 'text-blue-600'}`} />
              <span>Confidence Decomposition</span>
              {xaiExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* EXPANDABLE EXPLAINABLE AI (XAI) FACTOR DECOMPOSITION CARD (SIH Section 8) */}
        {xaiExpanded && (
          <div className="mt-4 p-4.5 bg-[#1A2810] text-[#F4F1EB] rounded-lg border border-[#152D22] shadow-md animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#152D22] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white font-sans">
                    Explainable AI (XAI) Confidence Decomposition
                  </h4>
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                    SHAP Model Attribution
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Multi-modal mathematical decomposition explaining the 89.4% encroachment classification confidence.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Ensemble Decision</span>
                <span className="text-base font-bold text-emerald-400 font-mono">89.4% Match (Statutory Threshold: 75.0%)</span>
              </div>
            </div>

            {/* Stacked Contribution Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[#A8C4B0] font-mono">
                <span>Ensemble Feature Weighting (100% Normalized Scale)</span>
                <span>Cumulative Confidence: 89.4%</span>
              </div>
              <div className="h-3 w-full bg-[#152D22] rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-[#2A5C45]/50">
                {/* NDVI Loss: 38% */}
                <div 
                  style={{ width: '38%' }} 
                  className="bg-emerald-500 rounded-l-full relative group cursor-pointer transition-all hover:brightness-110"
                  title="NDVI Vegetation Loss: 38% contribution"
                />
                {/* SAR Disturbance: 32% */}
                <div 
                  style={{ width: '32%' }} 
                  className="bg-blue-500 relative group cursor-pointer transition-all hover:brightness-110"
                  title="SAR Surface Disturbance: 32% contribution"
                />
                {/* Citizen Factor: 19.4% */}
                <div 
                  style={{ width: '19.4%' }} 
                  className="bg-amber-500 rounded-r-full relative group cursor-pointer transition-all hover:brightness-110"
                  title="Citizen Corroboration Factor: 19.4% contribution"
                />
                {/* Remaining 10.6% Uncertainty margin */}
                <div style={{ width: '10.6%' }} className="bg-slate-700/60 rounded-r-full" title="Model uncertainty delta: 10.6%" />
              </div>
            </div>

            {/* 3 Explicit Factor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Factor 1: NDVI Vegetation Loss */}
              <div className="p-3.5 bg-[#2A5C45]/80 border border-[#A8C4B0]/30 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                    NDVI Vegetation Loss
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    38% contribution
                  </span>
                </div>
                <p className="text-[11px] text-[#F4F1EB] leading-relaxed">
                  Sentinel-2 MSI Red/NIR spectral analysis proves severe canopy depletion of <strong>-71.8% NDVI</strong> over 28.42 Ha outside the gazetted boundary.
                </p>
                <div className="text-[10px] font-mono text-emerald-400/90 pt-1 border-t border-[#152D22] flex justify-between">
                  <span>Baseline: 0.64 &rarr; Current: 0.18</span>
                  <span>p &lt; 0.001</span>
                </div>
              </div>

              {/* Factor 2: SAR Surface Disturbance */}
              <div className="p-3.5 bg-[#2A5C45]/80 border border-[#A8C4B0]/30 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-blue-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    SAR Surface Disturbance
                  </span>
                  <span className="text-sm font-extrabold text-blue-400 font-mono bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                    32% contribution
                  </span>
                </div>
                <p className="text-[11px] text-[#F4F1EB] leading-relaxed">
                  Sentinel-1 C-band synthetic aperture radar backscatter differential confirms heavy machinery earthmoving benches and active pit topography shifts.
                </p>
                <div className="text-[10px] font-mono text-blue-400/90 pt-1 border-t border-[#152D22] flex justify-between">
                  <span>VV/VH Polarimetric Delta</span>
                  <span>Displacement: &gt;1.2m</span>
                </div>
              </div>

              {/* Factor 3: Citizen Corroboration Factor */}
              <div className="p-3.5 bg-[#2A5C45]/80 border border-[#A8C4B0]/30 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Citizen Corroboration Factor
                  </span>
                  <span className="text-sm font-extrabold text-amber-400 font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                    19.4% contribution
                  </span>
                </div>
                <p className="text-[11px] text-[#F4F1EB] leading-relaxed">
                  14 independent community grievances logged via Khanan Prahari with GPS geotags in Simlong/Taljhari directly intersect within 120m of the violation perimeter.
                </p>
                <div className="text-[10px] font-mono text-amber-400/90 pt-1 border-t border-[#152D22] flex justify-between">
                  <span>GPS Intersections: 14</span>
                  <span>Confidence: +19.4%</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-[#152D22] rounded text-[11px] text-[#A8C4B0] flex items-center justify-between mt-4">
              <span>Formula: C = (w₁ · Δ_NDVI) + (w₂ · Δ_SAR) + (w₃ · Ω_Citizen) = 38% + 32% + 19.4% = <strong className="text-white">89.4%</strong></span>
              <span className="text-emerald-400 font-semibold font-mono">Judicial Proof Admissible &bull; CMR 2017</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Satellite Comparison & Evidence Chamber */}
      <div className="bg-white border border-[#DDD8CF] rounded-lg shadow-sm overflow-hidden">
        {/* Chamber Subheader & Controls */}
        <div className="p-4 border-b border-[#DDD8CF] bg-[#FAF8F4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'comparison' ? 'bg-[#1A2810] text-white shadow-xs' : 'text-[#5C6B57] hover:bg-[#EDE9E2]/70'
              }`}
            >
              Satellite Multi-Temporal Delta
            </button>
            <button
              onClick={() => setActiveTab('ndvi')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'ndvi' ? 'bg-[#1A2810] text-white shadow-xs' : 'text-[#5C6B57] hover:bg-[#EDE9E2]/70'
              }`}
            >
              NDVI Vegetation Depletion
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'telemetry' ? 'bg-[#1A2810] text-white shadow-xs' : 'text-[#5C6B57] hover:bg-[#EDE9E2]/70'
              }`}
            >
              Corroborating Citizen Reports (14)
            </button>
            <button
              onClick={() => setActiveTab('audit_trail')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'audit_trail' 
                  ? 'bg-[#2A5C45] text-white shadow-xs' 
                  : 'text-[#5C6B57] hover:bg-[#EDE9E2]/70'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Immutable Audit Trail (Section 6 &amp; 7)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-[#5C6B57]">
              <input
                type="checkbox"
                checked={overlayLease}
                onChange={(e) => setOverlayLease(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-medium">Gazetted Lease Line</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#5C6B57]">
              <input
                type="checkbox"
                checked={overlayBuffer}
                onChange={(e) => setOverlayBuffer(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-medium">500m Eco-Buffer Zone</span>
            </label>
          </div>
        </div>

        {/* Chamber Content Body */}
        {activeTab === 'comparison' && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baseline Imagery */}
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-950 flex flex-col">
                <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs text-white">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5 text-blue-400" />
                    Baseline Satellite Pass (Dec 2024)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Cartosat-3 High-Res</span>
                </div>
                <div className="relative h-72 bg-[#121c2b] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 500 300" className="w-full h-full">
                    <rect width="500" height="300" fill="#152132" />
                    <path d="M 300 40 Q 420 80 460 220 T 360 290" fill="#1e3a29" opacity="0.6" />
                    <ellipse cx="220" cy="150" rx="140" ry="90" fill="#2d3748" stroke="#4a5568" strokeWidth="2" />
                    <ellipse cx="220" cy="150" rx="100" ry="60" fill="#1a202c" />
                    <ellipse cx="220" cy="150" rx="60" ry="30" fill="#0f172a" />
                    {overlayLease && (
                      <polygon points="60,40 380,45 390,260 70,250" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 4" />
                    )}
                  </svg>
                  <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    Permitted Active Area: 1,248 Hectares
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/90 text-slate-300 text-[11px] flex justify-between">
                  <span>Vegetation Cover Index: 0.64 (Intact)</span>
                  <span className="text-emerald-400 font-semibold">&bull; Compliant</span>
                </div>
              </div>

              {/* Current Imagery with Encroachment */}
              <div className="border-2 border-red-500 rounded-lg overflow-hidden bg-slate-950 flex flex-col relative shadow-md">
                <div className="p-2.5 bg-red-950 border-b border-red-900 flex justify-between items-center text-xs text-white">
                  <span className="font-semibold flex items-center gap-1.5 text-red-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Current Surveillance Scan (26 Aug 2026)
                  </span>
                  <span className="text-[10px] font-mono text-red-300 bg-red-900/60 px-2 py-0.5 rounded">
                    Sentinel-2 MSI Delta Breach
                  </span>
                </div>
                <div className="relative h-72 bg-[#121c2b] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 500 300" className="w-full h-full">
                    <rect width="500" height="300" fill="#152132" />
                    <path d="M 300 40 Q 420 80 460 220 T 360 290" fill="#2d3748" opacity="0.8" />
                    <ellipse cx="235" cy="150" rx="160" ry="100" fill="#2d3748" stroke="#4a5568" strokeWidth="2" />
                    <ellipse cx="240" cy="150" rx="120" ry="70" fill="#1a202c" />
                    
                    {overlayLease && (
                      <polygon points="60,40 380,45 390,260 70,250" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 4" />
                    )}

                    <polygon points="380,45 470,60 480,240 390,260" fill="#ef4444" fillOpacity="0.45" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="4 2" />
                    
                    <circle cx="430" cy="90" r="5" fill="#facc15" stroke="#000" strokeWidth="1" />
                    <circle cx="445" cy="140" r="5" fill="#facc15" stroke="#000" strokeWidth="1" />
                    <circle cx="435" cy="195" r="5" fill="#facc15" stroke="#000" strokeWidth="1" />
                  </svg>
                  
                  <div className="absolute top-3 right-3 bg-red-600 text-white font-mono text-xs font-bold px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>+28 Ha Outside Lease Line</span>
                  </div>

                  <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    Detected Footprint: 1,276 Hectares
                  </div>
                </div>
                <div className="p-2.5 bg-red-950/90 text-red-200 text-[11px] flex justify-between">
                  <span>Vegetation Cover Index: 0.18 (Severe Drop)</span>
                  <span className="text-red-400 font-bold">&bull; 3 Yellow Pins: Citizen Geotags</span>
                </div>
              </div>
            </div>

            {/* Analytical Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#FAF8F4] border border-[#DDD8CF] rounded-lg">
                <div className="text-[10px] uppercase font-bold text-[#5C6B57]">Total Encroached Area</div>
                <div className="text-xl font-bold text-red-600 mt-0.5">28.42 Hectares</div>
                <div className="text-[10px] text-[#5C6B57]">Coordinates: 25°01'18"N, 87°23'42"E</div>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#DDD8CF] rounded-lg">
                <div className="text-[10px] uppercase font-bold text-[#5C6B57]">Deforestation Biomass Loss</div>
                <div className="text-xl font-bold text-amber-600 mt-0.5">-71.8% NDVI</div>
                <div className="text-[10px] text-[#5C6B57]">18.2 hectares dense Sal forest cleared</div>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#DDD8CF] rounded-lg">
                <div className="text-[10px] uppercase font-bold text-[#5C6B57]">Corroborating Evidence</div>
                <div className="text-xl font-bold text-[#1A2810] mt-0.5">14 Citizen Reports</div>
                <div className="text-[10px] text-emerald-600 font-medium">100% Geotag spatial correlation</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: NDVI Vegetation Depletion Curve */}
        {activeTab === 'ndvi' && (
          <div className="p-5 space-y-4">
            <div className="bg-[#FAF8F4] p-4 rounded-lg border border-[#DDD8CF]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#1A2810] text-sm">NDVI (Normalized Difference Vegetation Index) Time Series</h3>
                <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded">
                  Significant Anomaly Detected (p &lt; 0.001)
                </span>
              </div>
              <p className="text-xs text-[#5C6B57] leading-relaxed mb-4">
                Automated spectral analysis demonstrates sharp loss of green biomass along the eastern ridge between February 2026 and August 2026, consistent with heavy machinery earthmoving and tree felling rather than seasonal dry variation.
              </p>

              <div className="h-56 w-full relative bg-white border border-slate-200 rounded p-3">
                <svg viewBox="0 0 600 180" className="w-full h-full">
                  <line x1="50" y1="20" x2="570" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="60" x2="570" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="100" x2="570" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="140" x2="570" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                  <rect x="50" y="40" width="520" height="45" fill="#10b981" fillOpacity="0.1" />
                  <text x="55" y="55" fill="#059669" fontSize="10" fontWeight="bold">Healthy Baseline Canopy Range</text>

                  <polyline
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3"
                    points="60,45 140,48 220,52 300,65 380,115 460,145 540,152"
                  />

                  <circle cx="60" cy="45" r="4" fill="#10b981" />
                  <circle cx="140" cy="48" r="4" fill="#10b981" />
                  <circle cx="220" cy="52" r="4" fill="#10b981" />
                  <circle cx="300" cy="65" r="4" fill="#d97706" />
                  <circle cx="380" cy="115" r="4" fill="#dc2626" />
                  <circle cx="460" cy="145" r="4" fill="#dc2626" />
                  <circle cx="540" cy="152" r="5" fill="#dc2626" />

                  <text x="50" y="170" fill="#64748b" fontSize="10">Jan '25</text>
                  <text x="130" y="170" fill="#64748b" fontSize="10">May '25</text>
                  <text x="210" y="170" fill="#64748b" fontSize="10">Sep '25</text>
                  <text x="290" y="170" fill="#64748b" fontSize="10">Jan '26</text>
                  <text x="370" y="170" fill="#64748b" fontSize="10">Apr '26</text>
                  <text x="450" y="170" fill="#64748b" fontSize="10">Jun '26</text>
                  <text x="520" y="170" fill="#dc2626" fontSize="10" fontWeight="bold">Aug '26</text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Corroborating Citizen Reports */}
        {activeTab === 'telemetry' && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#DDD8CF] pb-2">
              <span className="text-xs font-bold text-[#1A2810]">14 Verified Community Grievances (Simlong &amp; Taljhari)</span>
              <span className="text-xs text-[#5C6B57] font-mono">Geotag Spatial Correlation: 98.4%</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#FAF8F4] border border-[#DDD8CF] rounded-lg flex items-start gap-3">
                <div className="p-1.5 bg-red-100 text-red-700 rounded mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1A2810]">Report #CIT-2026-882 &bull; Simlong Village Ward 3</span>
                    <span className="text-[10px] text-[#5C6B57] font-mono">24 Aug 2026, 16:40 IST</span>
                  </div>
                  <p className="text-[#5C6B57] mt-1">
                    Heavy earthmovers and dumpers began stripping trees beyond boundary milestone 14 yesterday morning. High dust plume drifted directly onto primary school.
                  </p>
                  <div className="mt-1.5 text-[10px] text-blue-700 font-mono">GPS: 25.021°N, 87.398°E (120m from violation boundary)</div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#DDD8CF] rounded-lg flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 text-amber-800 rounded mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1A2810]">Report #CIT-2026-914 &bull; Taljhari Panchayat</span>
                    <span className="text-[10px] text-[#5C6B57] font-mono">25 Aug 2026, 19:15 IST</span>
                  </div>
                  <p className="text-[#5C6B57] mt-1">
                    Unscheduled blasting vibration exceeded safe limit; cracks noticed in roadside masonry water tank.
                  </p>
                  <div className="mt-1.5 text-[10px] text-blue-700 font-mono">GPS: 25.034°N, 87.412°E (Verified)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: IMMUTABLE AUDIT TRAIL */}
        {activeTab === 'audit_trail' && (
          <div className="p-5 space-y-4">
            {/* Ledger Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#FAF8F4] border border-[#DDD8CF] rounded-lg">
                <span className="text-[10px] uppercase font-bold text-[#5C6B57] block">Ledger State</span>
                <span className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Append-Only (Verified)
                </span>
                <span className="text-[10px] text-[#5C6B57] font-mono">Immutable Ledger</span>
              </div>
              <div className="p-3 bg-[#FAF8F4] border border-[#DDD8CF] rounded-lg">
                <span className="text-[10px] uppercase font-bold text-[#5C6B57] block">Total Blocks</span>
                <span className="text-sm font-bold text-[#1A2810] font-mono mt-0.5">6 Blocks Sealed</span>
                <span className="text-[10px] text-[#5C6B57]">Genesis Block: #10487</span>
              </div>
              <div className="p-3 bg-[#FAF8F4] border border-[#DDD8CF] rounded-lg">
                <span className="text-[10px] uppercase font-bold text-[#5C6B57] block">Hashing Algorithm</span>
                <span className="text-sm font-bold text-blue-700 font-mono mt-0.5">SHA-256 Merkle</span>
                <span className="text-[10px] text-[#5C6B57]">256-bit Cryptographic Proof</span>
              </div>
              <div className="p-3 bg-[#FAF8F4] border border-[#DDD8CF] rounded-lg">
                <span className="text-[10px] uppercase font-bold text-[#5C6B57] block">Tamper Check</span>
                <span className="text-sm font-bold text-emerald-700 mt-0.5">0 Alterations</span>
                <span className="text-[10px] text-emerald-600 font-medium">100% Chain Integrity</span>
              </div>
            </div>

            {/* Append-Only Timeline Table */}
            <div className="border border-[#DDD8CF] rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-3 bg-[#1A2810] text-[#F4F1EB] flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="font-bold">Cryptographic Incident Ledger: ENV-082</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">
                    Append-Only Chain
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  Current Merkle Root: <span className="text-amber-400">e3b0c442...b855</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F4] border-b border-[#DDD8CF] text-[#5C6B57] font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Block # &amp; Event Type</th>
                      <th className="py-2.5 px-3">Author &amp; Role</th>
                      <th className="py-2.5 px-3">UTC Timestamp</th>
                      <th className="py-2.5 px-3">Cryptographic Hash (SHA-256)</th>
                      <th className="py-2.5 px-3">Integrity Proof</th>
                      <th className="py-2.5 px-3">Payload Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {AUDIT_TRAIL_DATA.map((entry) => {
                      const isSelected = copiedHash === entry.hashSha256;
                      const hashPreview = `${entry.hashSha256.substring(0, 8)}...${entry.hashSha256.substring(entry.hashSha256.length - 6)}`;
                      const prevHashPreview = entry.prevHashSha256 === '0000000000000000000000000000000000000000000000000000000000000000' 
                        ? 'GENESIS_BLOCK' 
                        : `${entry.prevHashSha256.substring(0, 6)}...`;

                      return (
                        <tr key={entry.id} className="hover:bg-[#FAF8F4]/80 transition-colors">
                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] bg-[#2A5C45] text-white px-1.5 py-0.5 rounded font-bold">
                                #{entry.blockNumber}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                entry.eventType === 'SCN_DISPATCH' ? 'bg-red-100 text-red-800 border border-red-200' :
                                entry.eventType === 'OPERATOR_DEFENSE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                entry.eventType === 'AI_CONFIDENCE_RUN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                entry.eventType === 'SATELLITE_SYNC' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                entry.eventType === 'COMMUNITY_CORROBORATION' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                                'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {entry.eventType.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="font-semibold text-[#1A2810] mt-1 text-[11px]">
                              {entry.eventLabel}
                            </div>
                          </td>

                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <div className="font-bold text-[#1A2810] text-xs">{entry.author}</div>
                            <div className="text-[10px] text-[#5C6B57]">{entry.role}</div>
                            <div className="text-[10px] text-blue-700 font-semibold">{entry.agency}</div>
                          </td>

                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <div className="font-mono text-[11px] text-[#5C6B57] font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{entry.utcTimestamp}</span>
                            </div>
                            {entry.coordinates && (
                              <div className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                <span>{entry.coordinates}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 align-top">
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                              <span 
                                className="bg-[#FAF8F4] hover:bg-[#EDE9E2] text-[#1A2810] font-bold px-2 py-1 rounded border border-[#DDD8CF] cursor-pointer"
                                title={`Full SHA-256: ${entry.hashSha256}\nClick to copy`}
                                onClick={() => handleCopyHash(entry.hashSha256)}
                              >
                                {hashPreview}
                              </span>
                              <button
                                onClick={() => handleCopyHash(entry.hashSha256)}
                                className="text-[#8FA08A] hover:text-[#5C6B57] p-1 cursor-pointer transition-colors"
                                title="Copy full SHA-256 hash"
                              >
                                {isSelected ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                              Prev: {prevHashPreview}
                            </div>
                          </td>

                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded text-[10px] font-bold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Block</span>
                            </span>
                          </td>

                          <td className="py-3 px-3 align-top text-[#5C6B57] text-[11px] max-w-xs leading-relaxed">
                            {entry.details}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#FAF8F4] border-t border-[#DDD8CF] text-xs text-[#5C6B57] flex flex-wrap justify-between items-center gap-2">
                <span>
                  &bull; All events anchored to Ministry of Coal statutory immutable ledger. Compliant with Evidence Act Section 65B.
                </span>
                <span className="font-mono text-[11px] text-blue-700 font-semibold">
                  Chain Status: Continuous (Valid Proof-of-Authority)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Regulatory Dispatch Action Bar */}
      <div className="bg-white border border-[#DDD8CF] rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#5C6B57]">Statutory Notice Action</div>
          <div className="text-sm font-bold text-[#1A2810]">
            Dispatch Formal Show-Cause Notice SCN-2026-082 to ECL Operator Desk
          </div>
          <div className="text-xs text-[#5C6B57] mt-0.5">
            Transitions status to <strong className="text-amber-700">"Awaiting Mine Response"</strong> with mandatory 48-hour compliance window.
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onBackToOverview}
            className="px-4 py-2 border border-[#DDD8CF] text-[#1A2810] hover:bg-[#FAF8F4] rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            Back to Overview
          </button>
          <button
            id="btn-issue-show-cause-bottom"
            onClick={onIssueShowCauseNotice}
            className="px-5 py-2.5 bg-[#2A5C45] hover:bg-[#1E3A2F] text-white rounded-md text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Issue Show-Cause Notice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
