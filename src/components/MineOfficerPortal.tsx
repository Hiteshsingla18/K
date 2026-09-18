import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  Wind, 
  Flame, 
  Users, 
  Truck, 
  ShieldAlert, 
  FileText, 
  RefreshCw, 
  Sparkles, 
  Radio, 
  Sliders, 
  Check, 
  X, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Eye,
  Video,
  Download,
  Filter,
  UserCheck,
  AlertOctagon
} from 'lucide-react';
import { AuthUser, CapaRecord, OfflineMutation, SafetyTelemetry, WorkforceAttendanceRecord } from '../types';
import GlobalHeaderControls from './GlobalHeaderControls';
import WorkforceAttendanceRoster from './WorkforceAttendanceRoster';

interface MineOfficerPortalProps {
  currentUser: AuthUser;
  currentPath: string;
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  onToggleNetwork: () => void;
  onOpenSyncModal: () => void;
  onSwitchPortal: (role: any, route: string) => void;
  onSignOut: () => void;
  onAddOfflineMutation: (mutation: Omit<OfflineMutation, 'id' | 'idempotencyKey' | 'timestamp' | 'status'>) => string;
  triggerToast: (msg: string) => void;
  attendanceRoster?: WorkforceAttendanceRecord[];
}

const INITIAL_CAPAS: CapaRecord[] = [
  {
    id: 'CAPA-399',
    localUuid: 'uuid-c399-7f89',
    workerTag: 'Worker #309',
    workerName: 'Sunil Murmu',
    violationTitle: 'High-Visibility Vest Obscured near Dumper Reversing Path',
    severity: 'Medium',
    zone: 'East Coal Bench #2',
    assignedTo: 'Overman Ramesh Yadav',
    timestamp: 'Today, 07:45 AM',
    aiConfidence: 91.2,
    status: 'Action_Initiated',
    syncStatus: 'synced',
    evidenceFrame: 'CAM-PIT-04',
    actionSummary: 'Safety marshal issued fluorescent harness replacement; toolbox briefing logged.'
  },
  {
    id: 'CAPA-394',
    localUuid: 'uuid-c394-1a22',
    workerTag: 'Equipment #EQ-14',
    workerName: 'Dragline Operator',
    violationTitle: 'Audible Reverse Alarm Inaudible in Loading Sector',
    severity: 'High',
    zone: 'South Dump Face',
    assignedTo: 'Mechanical Foreman B. K. Singh',
    timestamp: 'Yesterday, 04:20 PM',
    aiConfidence: 95.0,
    status: 'Resolved',
    syncStatus: 'synced',
    evidenceFrame: 'CAM-DUMP-01',
    actionSummary: 'Alarm buzzer solenoid replaced and decibel testing verified at 112 dB.'
  }
];

export default function MineOfficerPortal({
  currentUser,
  currentPath,
  isOnline,
  isSyncing,
  pendingSyncCount,
  onToggleNetwork,
  onOpenSyncModal,
  onSwitchPortal,
  onSignOut,
  onAddOfflineMutation,
  triggerToast,
  attendanceRoster
}: MineOfficerPortalProps) {
  // Telemetry state
  const [telemetry, setTelemetry] = useState<SafetyTelemetry>({
    methaneCh4Pct: 0.28,
    methaneStatus: 'Safe',
    coPpm: 12,
    coStatus: 'Safe',
    pm10DustUgm3: 148,
    pm10Status: 'Alert',
    workersOnDuty: 412,
    equipmentUnitsActive: 18,
    activeShift: 'Shift B'
  });

  // CCTV Feed Simulation State
  const [selectedCamera, setSelectedCamera] = useState<'CAM-PIT-04' | 'CAM-CONV-02' | 'CAM-DUMP-01'>('CAM-PIT-04');
  const [cctvStreaming, setCctvStreaming] = useState<boolean>(true);
  const [activeAlertReviewed, setActiveAlertReviewed] = useState<boolean>(false);
  const [activeReviewDecision, setActiveReviewDecision] = useState<'confirmed' | 'dismissed' | null>(null);

  // CAPA records
  const [capaList, setCapaList] = useState<CapaRecord[]>(INITIAL_CAPAS);
  const [capaFilter, setCapaFilter] = useState<'all' | 'Open' | 'Action_Initiated' | 'Resolved'>('all');
  const [activeTab, setActiveTab] = useState<'cctv_safety' | 'capa_registry' | 'gas_telemetry' | 'workforce_attendance'>('cctv_safety');

  // Simulated CCTV Time Clock
  const [cctvTimestamp, setCctvTimestamp] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCctvTimestamp(now.toLocaleTimeString('en-GB', { hour12: false }) + '.' + Math.floor(now.getMilliseconds() / 100));
    };
    updateTime();
    const interval = setInterval(updateTime, 200);
    return () => clearInterval(interval);
  }, []);

  // Handle Confirm Violation & Issue CAPA
  const handleConfirmViolation = () => {
    const nextId = `CAPA-${402 + (capaList.length - 2)}`;
    const localUuid = `uuid-${Math.random().toString(36).substring(2, 10)}`;

    const newCapa: CapaRecord = {
      id: nextId,
      localUuid,
      workerTag: 'Worker #218',
      workerName: 'Contractor Crew (B-Shift Excavation)',
      violationTitle: 'Missing Hardhat in Heavy Haul Zone',
      severity: 'High',
      zone: 'Rajmahal Highwall Sector & Haul Pit #4',
      assignedTo: 'Overman Ramesh Yadav',
      timestamp: 'Just now',
      aiConfidence: 88.4,
      status: 'Open',
      syncStatus: isOnline ? 'synced' : 'pending',
      evidenceFrame: selectedCamera,
      actionSummary: 'Assigned to Overman Ramesh Yadav for immediate PPE enforcement and toolbox stop-work check.'
    };

    setCapaList(prev => [newCapa, ...prev]);
    setActiveAlertReviewed(true);
    setActiveReviewDecision('confirmed');

    // Register into Offline Mutation Queue if offline (or log sync if online)
    const uuid = onAddOfflineMutation({
      type: 'capa_issuance',
      title: `Issue ${nextId}: Missing Hardhat Violation`,
      origin: 'mine_officer',
      payloadSummary: `Assigned to Overman Ramesh Yadav for Worker #218 in Pit #4 (Conf 88%). Local UUID: ${localUuid}`
    });

    triggerToast(
      isOnline 
        ? `CAPA ${nextId} issued and synced to Central DGMS Safety Registry.` 
        : `CAPA ${nextId} recorded locally (UUID: ${uuid.slice(0, 8)}). Queued for server sync.`
    );
  };

  const handleDismissAlert = () => {
    setActiveAlertReviewed(true);
    setActiveReviewDecision('dismissed');
    triggerToast('Inference dismissed as false positive. Model feedback logged for DGMS CV fine-tuning.');
  };

  const handleResetInference = () => {
    setActiveAlertReviewed(false);
    setActiveReviewDecision(null);
  };

  const filteredCapas = capaList.filter(c => {
    if (capaFilter === 'all') return true;
    return c.status === capaFilter;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex flex-col font-sans">
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <header className="bg-[#0B2545] text-white border-b border-blue-950 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Brand & Colliery Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <HardHat className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                  Mine Safety Officer Station
                </span>
                <span className="text-[10px] bg-orange-500/30 text-orange-300 font-bold px-1.5 py-0.5 rounded border border-orange-400/40 uppercase tracking-wider">
                  Field Ops &bull; Rajmahal OCP
                </span>
              </div>
              <span className="text-[11px] text-slate-300 hidden sm:block truncate">
                Regulation 109 Safety Oversight &bull; Real-Time Computer Vision &bull; CAPA Dispatch
              </span>
            </div>
          </div>

          {/* Global Header Controls (Offline Simulator & Universal Role Switcher) */}
          <GlobalHeaderControls
            currentUser={currentUser}
            currentPath={currentPath}
            isOnline={isOnline}
            isSyncing={isSyncing}
            pendingSyncCount={pendingSyncCount}
            onToggleNetwork={onToggleNetwork}
            onOpenSyncModal={onOpenSyncModal}
            onSwitchPortal={onSwitchPortal}
            onSignOut={onSignOut}
            theme="dark"
          />
        </div>

        {/* Operational Navigation Tabs */}
        <div className="bg-[#071930] border-t border-slate-800 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('cctv_safety')}
              className={`px-3.5 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'cctv_safety'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Computer Vision PPE Inference</span>
              {!activeAlertReviewed && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('capa_registry')}
              className={`px-3.5 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'capa_registry'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CAPA Incident Registry</span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {capaList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('gas_telemetry')}
              className={`px-3.5 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'gas_telemetry'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Gas &amp; Dust Telemetry Tele-Log</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                PM10 Alert
              </span>
            </button>

            <button
              id="mine-officer-nav-workforce"
              onClick={() => setActiveTab('workforce_attendance')}
              className={`px-3.5 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'workforce_attendance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Labour Attendance &amp; Workforce</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                412 On-Shift
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. SHIFT OPERATIONS & TELEMETRY DASHBOARD STRIP */}
      <section className="bg-white border-b border-slate-200 shadow-2xs py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Shift & Workforce Metric */}
          <div 
            onClick={() => setActiveTab('workforce_attendance')}
            className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-colors rounded-xl p-3.5 flex items-center justify-between cursor-pointer group"
            title="Click to view Labour Attendance & Workforce Composition Roster"
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Active Shift &amp; Workforce</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {telemetry.workersOnDuty} <span className="text-xs font-medium text-slate-500">On-Duty Workers</span>
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <strong className="text-slate-800">{telemetry.activeShift}</strong> &bull; 248 CIL / 164 Cont.
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
              412
            </div>
          </div>

          {/* Environmental Methane Gas Gauge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-600" />
                <span>Methane (CH4) Telemetry</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1.5">
                <span>{telemetry.methaneCh4Pct}%</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                  Safe (&lt; 0.75%)
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Statutory threshold: 1.25% (DGMS Reg. 133)
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
              CH4
            </div>
          </div>

          {/* Environmental Carbon Monoxide Gauge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-blue-600" />
                <span>Carbon Monoxide (CO)</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1.5">
                <span>{telemetry.coPpm} ppm</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                  Safe (&lt; 25 ppm)
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Electrochemical Sensor #S-09 Active
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
              CO
            </div>
          </div>

          {/* Ambient PM10 Dust Gauge (Alert State) */}
          <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Ambient PM10 Dust Sensor</span>
              </div>
              <div className="text-xl font-extrabold text-amber-950 mt-1 flex items-baseline gap-1.5">
                <span>{telemetry.pm10DustUgm3} µg/m³</span>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded border border-amber-400">
                  Alert (&gt; 100)
                </span>
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Water mist cannon trigger deployed in Sector 4
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-200 text-amber-900 border border-amber-400 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
              PM10
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ========================================================================= */}
        {/* VIEW 1: COMPUTER VISION SAFETY INFERENCE FEED (Simulated CCTV Frame)      */}
        {/* ========================================================================= */}
        {activeTab === 'cctv_safety' && (
          <div className="space-y-6">
            {/* Header & Camera Channel Selectors */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Live Optical AI Inference Feed &bull; Opencast PPE Auditing
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full border border-red-200 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                    Live 25 FPS Stream
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Edge computer vision running YOLO-v9 safety PPE weights on highwall CCTV RTSP streams.
                </p>
              </div>

              {/* Camera Channel Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                {(['CAM-PIT-04', 'CAM-CONV-02', 'CAM-DUMP-01'] as const).map((cam) => (
                  <button
                    key={cam}
                    onClick={() => {
                      setSelectedCamera(cam);
                      handleResetInference();
                    }}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                      selectedCamera === cam
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cam === 'CAM-PIT-04' && 'Pit #4 Haul Road'}
                    {cam === 'CAM-CONV-02' && 'Crusher Incline'}
                    {cam === 'CAM-DUMP-01' && 'North Waste Dump'}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated High-Resolution CCTV Viewport Frame */}
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-xl aspect-[16/9] max-h-[560px]">
              {/* Opencast Mining Canvas / Background Representation */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332] via-[#2c241b] to-[#14120e] opacity-95">
                {/* Background Terraced Pit Contours & Heavy Haul Road Graphic */}
                <svg className="w-full h-full opacity-35" preserveAspectRatio="none" viewBox="0 0 800 450">
                  <path d="M0,80 L250,90 L500,75 L800,95 L800,160 L520,150 L200,165 L0,150 Z" fill="#3E342B" />
                  <path d="M0,150 L200,165 L520,150 L800,160 L800,240 L450,230 L150,250 L0,230 Z" fill="#2E261F" />
                  <path d="M0,230 L150,250 L450,230 L800,240 L800,340 L350,330 L0,345 Z" fill="#1F1A15" />
                  {/* Haul Road Path */}
                  <polygon points="120,450 340,330 460,330 650,450" fill="#4B3D30" opacity="0.6" />
                  {/* Dumper Outline Graphic in distance */}
                  <rect x="360" y="280" width="70" height="42" fill="#E5A93C" rx="3" opacity="0.8" />
                  <circle cx="375" cy="322" r="9" fill="#111" />
                  <circle cx="415" cy="322" r="9" fill="#111" />
                  {/* Highwall Conveyor Trestle */}
                  <line x1="0" y1="90" x2="800" y2="70" stroke="#718096" strokeWidth="3" strokeDasharray="6 4" />
                </svg>
              </div>

              {/* CCTV Camera HUD Overlays */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-emerald-400 select-none pointer-events-none z-10">
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded border border-emerald-500/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                  <span className="font-bold tracking-wider text-white">REC [{selectedCamera}]</span>
                  <span className="text-slate-400">RAJMAHAL OCP PIT BENCH 4</span>
                  <span className="text-emerald-400 font-bold">1080p @ 25fps</span>
                </div>

                <div className="bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded border border-emerald-500/30 text-white font-mono font-bold">
                  2026-09-03 {cctvTimestamp} IST
                </div>
              </div>

              {/* =============================================================== */}
              {/* OVERLAID AI BOUNDING BOX 1: GREEN (Worker #104 · Compliant)    */}
              {/* =============================================================== */}
              <div 
                className="absolute top-[38%] left-[22%] w-[110px] sm:w-[130px] h-[190px] sm:h-[220px] border-2 border-emerald-400 bg-emerald-500/10 rounded-xs flex flex-col justify-between p-1 shadow-lg transition-all animate-in fade-in duration-300"
              >
                {/* Detection Label Badge */}
                <div className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs leading-tight shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span>Worker #104</span>
                </div>

                {/* Body Silhouette Placeholder */}
                <div className="flex-1 flex flex-col items-center justify-center text-emerald-300 opacity-60">
                  <div className="w-7 h-7 rounded-full border-2 border-emerald-400 flex items-center justify-center bg-yellow-400/30">
                    <span className="text-[9px] font-bold text-yellow-300">HELM</span>
                  </div>
                  <div className="w-12 h-20 border border-emerald-400 mt-1 rounded bg-emerald-400/20 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-emerald-200">VEST OK</span>
                  </div>
                </div>

                {/* Bottom Metadata */}
                <div className="bg-black/80 text-[9px] text-emerald-300 font-mono px-1 py-0.5 rounded-xs leading-tight">
                  Helmet: OK &bull; Vest: OK <br />
                  <span className="text-white font-bold">Conf: 94.2%</span>
                </div>
              </div>

              {/* =============================================================== */}
              {/* OVERLAID AI BOUNDING BOX 2: RED (Worker #218 · VIOLATION ALERT) */}
              {/* =============================================================== */}
              <div 
                className={`absolute top-[33%] left-[54%] sm:left-[50%] w-[120px] sm:w-[145px] h-[205px] sm:h-[235px] border-2 rounded-xs flex flex-col justify-between p-1.5 shadow-2xl transition-all ${
                  activeReviewDecision === 'confirmed'
                    ? 'border-orange-500 bg-orange-500/20'
                    : activeReviewDecision === 'dismissed'
                    ? 'border-slate-500 bg-slate-800/40 opacity-50'
                    : 'border-red-500 bg-red-500/15 ring-4 ring-red-500/30 animate-pulse'
                }`}
              >
                {/* Detection Label Badge */}
                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs leading-tight shadow-md flex items-center justify-between text-white ${
                  activeReviewDecision === 'confirmed' ? 'bg-orange-600' : activeReviewDecision === 'dismissed' ? 'bg-slate-700' : 'bg-red-600'
                }`}>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-white" />
                    <span>Worker #218</span>
                  </div>
                  <span className="text-[9px] font-mono">88%</span>
                </div>

                {/* Silhouette with Missing Helmet Alert Marker */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  {/* Missing Hardhat Cross Marker */}
                  <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-red-900/60 flex items-center justify-center relative">
                    <X className="w-5 h-5 text-red-400 font-bold" />
                    <span className="absolute -top-3 text-[8px] bg-red-600 text-white font-bold px-1 rounded">
                      NO HELMET
                    </span>
                  </div>
                  <div className="w-12 h-20 border border-red-400 mt-1 rounded bg-red-500/10 flex items-center justify-center">
                    <span className="text-[8px] text-red-200 font-bold">HAUL ZONE</span>
                  </div>
                </div>

                {/* Bottom Metadata Alert */}
                <div className="bg-black/90 text-[9px] text-red-300 font-mono px-1 py-0.5 rounded-xs leading-tight border-t border-red-500/40">
                  <span className="text-red-400 font-bold">MISSING HARDHAT</span>
                  <div className="text-white text-[8px]">Heavy Haul Road Sector 4</div>
                </div>
              </div>

              {/* Bottom In-Frame Status Strip */}
              <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300 bg-black/75 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">● 10 Detections / Frame</span>
                  <span>&bull;</span>
                  <span className="text-red-400 font-bold">1 Active Statutory PPE Flag</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Inference Engine: YOLO-v9-MineEdge</span>
                  <span>&bull;</span>
                  <span>Latency: 18ms</span>
                </div>
              </div>
            </div>

            {/* HUMAN-IN-THE-LOOP (HITL) REVIEW CONTROLS CARD */}
            <div className={`rounded-xl p-5 border shadow-sm transition-all ${
              activeAlertReviewed
                ? 'bg-slate-50 border-slate-300'
                : 'bg-white border-red-200 ring-2 ring-red-500/20'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      Human-in-the-Loop Safety Officer Verification
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded uppercase">
                      Target: Worker #218 &bull; Heavy Haul Road
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    AI detected <strong>Worker #218 without statutory Hardhat Class-E</strong> within 15 meters of an active 60-tonne haul truck corridor. DGMS Coal Mines Regulation 109 mandates immediate Overman dispatch.
                  </p>

                  {activeReviewDecision === 'confirmed' && (
                    <div className="mt-2 bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-xs text-emerald-900 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong>Violation Confirmed &bull; Digital CAPA-402 Dispatched</strong>
                          <div className="text-[11px] text-emerald-800">
                            Assigned to Overman Ramesh Yadav. {isOnline ? 'Synced to Central DGMS' : '⏳ Queued locally in Offline Storage.'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleResetInference}
                        className="text-[11px] text-emerald-700 underline font-semibold hover:text-emerald-900 cursor-pointer"
                      >
                        Reset Demo
                      </button>
                    </div>
                  )}

                  {activeReviewDecision === 'dismissed' && (
                    <div className="mt-2 bg-slate-100 border border-slate-300 rounded-lg p-3 text-xs text-slate-700 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>Flag marked as false positive by Officer. No CAPA issued.</span>
                      </div>
                      <button
                        onClick={handleResetInference}
                        className="text-[11px] text-slate-700 underline font-semibold hover:text-slate-900 cursor-pointer"
                      >
                        Reset Demo
                      </button>
                    </div>
                  )}
                </div>

                {/* HITL Action Buttons */}
                {!activeAlertReviewed && (
                  <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                    <button
                      id="btn-dismiss-cv-alert"
                      onClick={handleDismissAlert}
                      className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Dismiss as False Positive</span>
                    </button>

                    <button
                      id="btn-confirm-cv-capa"
                      onClick={handleConfirmViolation}
                      className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Confirm Violation &amp; Issue CAPA</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CAPA INCIDENT AUDIT REGISTRY                                      */}
        {/* ========================================================================= */}
        {activeTab === 'capa_registry' && (
          <div className="space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Corrective and Preventive Action (CAPA) Safety Registry
                </h2>
                <p className="text-xs text-slate-500">
                  Official statutory compliance logs under Regulation 109 of Coal Mines Regulations 2017.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'Open', 'Action_Initiated', 'Resolved'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCapaFilter(filter)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      capaFilter === filter
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'all' ? 'All Records' : filter.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* CAPA Cards List */}
            <div className="space-y-3">
              {filteredCapas.map((capa) => (
                <div 
                  key={capa.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded">
                        {capa.id}
                      </span>
                      <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        {capa.workerTag}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-xs text-slate-600 font-medium">
                        {capa.zone}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-xs text-slate-400">
                        {capa.timestamp}
                      </span>
                    </div>

                    {/* Sync Status Badge (Highlights Offline First Simulation) */}
                    <div className="flex items-center gap-2">
                      {capa.syncStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>⏳ Pending Sync ({capa.localUuid.slice(0, 8)})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>✓ Synced to Central Server</span>
                        </span>
                      )}

                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        capa.status === 'Open'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : capa.status === 'Action_Initiated'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {capa.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-800 font-medium">
                    {capa.violationTitle}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-700">Assigned Overman:</strong> {capa.assignedTo}
                      {capa.actionSummary && (
                        <p className="mt-1 text-slate-600">{capa.actionSummary}</p>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                      Camera: {capa.evidenceFrame} &bull; AI Conf: {capa.aiConfidence}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: GAS & DUST TELEMETRY TELE-LOG                                     */}
        {/* ========================================================================= */}
        {activeTab === 'gas_telemetry' && (
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Subterranean &amp; Surface Environmental Sensor Tele-Log
              </h2>
              <p className="text-xs text-slate-500">
                Live telemetry feed from DGMS approved intrinsically safe continuous monitors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  <span>Pit 4 Methane (CH4) Sensor</span>
                </span>
                <div className="text-2xl font-black text-slate-900">0.28%</div>
                <div className="text-[11px] text-emerald-800">
                  Permissible limit: 1.25%. No coalbed gas drainage anomalies detected.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/50 space-y-2">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-blue-600" />
                  <span>Carbon Monoxide (CO) Multi-Gas</span>
                </span>
                <div className="text-2xl font-black text-slate-900">12 ppm</div>
                <div className="text-[11px] text-blue-800">
                  Permissible limit: 50 ppm. Spontaneous heating index Graham's Ratio: 0.18 (Normal).
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Particulate PM10 Dust Concentration</span>
                </span>
                <div className="text-2xl font-black text-amber-950">148 µg/m³</div>
                <div className="text-[11px] text-amber-800">
                  Statutory warning: Exceeds 100 µg/m³ 24h average. Water sprinklers auto-engaged.
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-800">DGMS Automated Safety Threshold Protocol:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>If CH4 exceeds 0.75%, electrical power to Pit 4 machinery automatically trips via telemetry relay.</li>
                <li>If PM10 exceeds 120 µg/m³, mist cannons along the main haulage corridor trigger 10-minute continuous suppression cycles.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: LABOUR ATTENDANCE & WORKFORCE COMPOSITION MONITORING             */}
        {/* ========================================================================= */}
        {activeTab === 'workforce_attendance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Labour Attendance &amp; Workforce Composition Monitoring
                  </h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300 uppercase">
                    Statutory Form-D Muster Roll
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Real-time colliery muster roll complying with Mines Act 1952 &amp; DGMS directives. Seamless sync with Subterranean Mobile Check-ins.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">
                  Current Shift: <strong className="text-slate-800">{telemetry.activeShift}</strong>
                </span>
              </div>
            </div>

            <WorkforceAttendanceRoster
              roster={attendanceRoster}
              triggerToast={triggerToast}
              roleContext="officer"
            />
          </div>
        )}
      </main>
    </div>
  );
}
