import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix missing default Leaflet icons in Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

import { 
  Users, 
  AlertTriangle, 
  MapPin, 
  CheckCircle2, 
  Send, 
  Wind, 
  FileText, 
  LogOut, 
  Search, 
  Info, 
  ShieldCheck, 
  HelpCircle, 
  TreePine, 
  Volume2, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Droplets,
  Layers,
  ZoomIn,
  ZoomOut,
  KeyRound,
  Camera,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MineRecord, AuthUser, CitizenReportRecord, UserRole } from '../types';
import CitizenReportTracker from './CitizenReportTracker';
import CitizenReceiptCard from './CitizenReceiptCard';
import GlobalHeaderControls from './GlobalHeaderControls';

interface CitizenPortalProps {
  currentUser: AuthUser;
  mines: MineRecord[];
  onSignOut: () => void;
  triggerToast: (msg: string) => void;
  isOnline?: boolean;
  isSyncing?: boolean;
  pendingSyncCount?: number;
  onToggleNetwork?: () => void;
  onOpenSyncModal?: () => void;
  onSwitchPortal?: (role: UserRole, route: string) => void;
}

type CitizenTab = 'track_my_report' | 'file_concern' | 'public_map' | 'track_reports' | 'environmental_health';

const CATEGORY_NAMES: Record<string, string> = {
  boundary_encroachment: 'Boundary Encroachment',
  dust_air_pollution: 'Heavy Dust Plumes',
  blasting_vibration: 'Night Blasting Shock',
  water_contamination: 'Water Stream Runoff'
};

const INITIAL_CITIZEN_REPORTS: CitizenReportRecord[] = [
  {
    id: 'CR-882',
    pin: '1428',
    mineId: 'MIN-4492-R',
    mineName: 'Rajmahal Open Cast Project (OCP)',
    village: 'Simlong Village Cluster',
    category: 'Dust Plume Drift & Boundary Encroachment',
    categoryKey: 'dust_air_pollution',
    date: '28 Aug 2026',
    timestamp: '09:15 AM IST',
    details: 'Heavy earthmoving bulldozers active outside milestone #14 and severe dust drift covering Simlong primary school premises and mustard fields.',
    stage: 5,
    statusText: 'Operator Response Under Verification',
    statusColor: 'emerald',
    geotagCorrelationPct: 98.4,
    contributedToScn: true,
    scnNumber: 'SCN-2026-082',
    scnNoticeDate: '29 Aug 2026',
    scnOutcome: 'Eastern Coalfields Ltd (ECL) filed technical rebuttal citing perimeter haul road drainage; joint inspection scheduled with District Collector and village elders.',
    outcomeStatus: 'pending'
  },
  {
    id: 'CR-914',
    pin: '3891',
    mineId: 'MIN-4492-R',
    mineName: 'Rajmahal Open Cast Project (OCP)',
    village: 'Taljhari Hamlet',
    category: 'Blasting Vibration & Structural Shock',
    categoryKey: 'blasting_vibration',
    date: '25 Aug 2026',
    timestamp: '06:40 PM IST',
    details: 'Unscheduled evening blast vibration shook residential brick walls and water storage tanks beyond allowable PPV limit (5.0 mm/s).',
    stage: 4,
    statusText: 'Show-Cause Notice SCN-2026-082 Dispatched',
    statusColor: 'blue',
    geotagCorrelationPct: 94.2,
    contributedToScn: true,
    scnNumber: 'SCN-2026-082',
    scnNoticeDate: '29 Aug 2026',
    scnOutcome: 'Statutory 48-Hour Compliance Notice Active',
    outcomeStatus: 'active_notice'
  },
  {
    id: 'CR-942',
    pin: '5620',
    mineId: 'MIN-4492-R',
    mineName: 'Rajmahal Open Cast Project (OCP)',
    village: 'Simlong North Ridge',
    category: 'Boundary Encroachment',
    categoryKey: 'boundary_encroachment',
    date: '21 Aug 2026',
    timestamp: '11:30 AM IST',
    details: 'Earthmoving bulldozers observed clearing slope trees 400m past statutory boundary milestone #14.',
    stage: 3,
    statusText: 'Flagged by Satellite (28 Ha)',
    statusColor: 'amber',
    geotagCorrelationPct: 96.8,
    contributedToScn: false,
    outcomeStatus: 'pending'
  },
  {
    id: 'CR-799',
    pin: '2104',
    mineId: 'MIN-4492-R',
    mineName: 'Rajmahal Open Cast Project (OCP)',
    village: 'Bara Bhuin Stream',
    category: 'Water Stream Runoff',
    categoryKey: 'water_contamination',
    date: '16 Aug 2026',
    timestamp: '03:10 PM IST',
    details: 'Monsoon muddy slurry discharged directly into seasonal village irrigation nala without settling pond treatment.',
    stage: 3,
    statusText: 'Corroborated with Satellite Runoff Imagery',
    statusColor: 'amber',
    geotagCorrelationPct: 89.1,
    contributedToScn: false,
    outcomeStatus: 'pending'
  },
  {
    id: 'CR-745',
    pin: '4412',
    mineId: 'MIN-1082-G',
    mineName: 'Gevra Open Cast Project',
    village: 'Pipra Village',
    category: 'Heavy Dust Plumes',
    categoryKey: 'dust_air_pollution',
    date: '12 Aug 2026',
    timestamp: '10:00 AM IST',
    details: 'Coal hauling trucks traversing village access road without required tarpaulin covers and water sprinkling.',
    stage: 5,
    statusText: 'Water Sprinklers Deployed & Verified',
    statusColor: 'emerald',
    geotagCorrelationPct: 92.5,
    contributedToScn: false,
    scnOutcome: 'Operator deployed 4 permanent high-pressure mist cannons along the village corridor. Ground verification completed.',
    outcomeStatus: 'resolved'
  }
];

export default function CitizenPortal({
  currentUser,
  mines,
  onSignOut,
  triggerToast,
  isOnline = true,
  isSyncing = false,
  pendingSyncCount = 0,
  onToggleNetwork = () => {},
  onOpenSyncModal = () => {},
  onSwitchPortal = () => {}
}: CitizenPortalProps) {
  const [activeTab, setActiveTab] = useState<CitizenTab>('file_concern');
  
  // Reports Dataset State (login-free persistence for this session)
  const [allReports, setAllReports] = useState<CitizenReportRecord[]>(INITIAL_CITIZEN_REPORTS);
  const [activeTrackId, setActiveTrackId] = useState<string>('CR-882');
  const [activeTrackPin, setActiveTrackPin] = useState<string>('1428');
  const [lastSubmittedReport, setLastSubmittedReport] = useState<CitizenReportRecord | null>(null);

  // Quick Tracking Search Bar State
  const [quickSearchId, setQuickSearchId] = useState<string>('');
  const [quickSearchPin, setQuickSearchPin] = useState<string>('');

  // Form State
  const [selectedMineId, setSelectedMineId] = useState<string>('MIN-4492-R');
  const [violationCategory, setViolationCategory] = useState<string>('boundary_encroachment');
  const [observationText, setObservationText] = useState<string>('');
  const [villageName, setVillageName] = useState<string>('Simlong Village');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);
  const [generatedRefId, setGeneratedRefId] = useState<string>('');

  // Grievance Search & Filter State
  const [reportSearch, setReportSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Interactive Citizen Map Ref
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim()) return;

    // Generate Report ID (format CR-XXX, continuing existing numbering like CR-882, CR-914, CR-942)
    const existingNums = allReports
      .map(r => {
        const match = r.id.match(/^CR-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 942;
    const nextNum = maxNum >= 942 ? maxNum + 11 : 953; // Continues sequence e.g., CR-953
    const newReportId = `CR-${nextNum}`;

    // Generate 4-digit tracking PIN
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();

    const selectedMine = mines.find(m => m.id === selectedMineId) || mines[0];
    const categoryName = CATEGORY_NAMES[violationCategory] || 'Environmental Observation';

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

    const newReportRecord: CitizenReportRecord = {
      id: newReportId,
      pin: newPin,
      mineId: selectedMine.id,
      mineName: selectedMine.name,
      village: villageName.trim() || 'Simlong Village',
      category: categoryName,
      categoryKey: violationCategory,
      date: formattedDate,
      timestamp: formattedTime,
      details: observationText.trim(),
      stage: 2, // 2. Satellite Cross-Check in Progress (no fabricated future stages)
      statusText: 'Satellite Cross-Check in Progress',
      statusColor: 'blue',
      contributedToScn: false,
      estimatedNextUpdate: 'Today at 04:30 AM IST (approx. 3.5 hours) after Sentinel-2B polar orbital overpass.'
    };

    setAllReports(prev => [newReportRecord, ...prev]);
    setLastSubmittedReport(newReportRecord);
    setGeneratedRefId(newReportId);
    setReportSubmitted(true);
    setActiveTrackId(newReportId);
    setActiveTrackPin(newPin);

    triggerToast(`Grievance ${newReportId} registered with PIN ${newPin}. Geotag linked to Sentinel-2 correlation queue.`);
  };

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchId.trim()) return;
    setActiveTrackId(quickSearchId.trim().toUpperCase());
    setActiveTrackPin(quickSearchPin.trim());
    setActiveTab('track_my_report');
  };

  // Initialize Citizen Public Map when public_map tab is opened
  useEffect(() => {
    if (activeTab !== 'public_map') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const rajmahalMine = mines.find(m => m.id === 'MIN-4492-R') || mines[0];
    const centerLat = rajmahalMine.latitude;
    const centerLng = rajmahalMine.longitude;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18 }
    ).addTo(map);

    // Legal gazetted lease boundary (Green)
    const approvedBoundary = [
      [25.035, 87.385],
      [25.038, 87.415],
      [25.015, 87.420],
      [25.010, 87.390]
    ];
    L.polygon(approvedBoundary as L.LatLngExpression[], {
      color: '#10B981',
      weight: 3,
      fillColor: '#10B981',
      fillOpacity: 0.12,
      dashArray: '5, 5'
    }).addTo(map).bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #065f46; font-size: 13px;">Statutory Approved Lease Boundary</strong>
        <div style="font-size: 11px; color: #4b5563; margin-top: 4px;">
          Approved area under Ministry of Coal Gazette. Mining permitted within this boundary only.
        </div>
      </div>
    `);

    // Flagged 28 Ha Zone (Red)
    const flaggedZone = [
      [25.038, 87.415],
      [25.042, 87.432],
      [25.022, 87.435],
      [25.015, 87.420]
    ];
    L.polygon(flaggedZone as L.LatLngExpression[], {
      color: '#EF4444',
      weight: 3,
      fillColor: '#EF4444',
      fillOpacity: 0.35,
      dashArray: '3, 4'
    }).addTo(map).bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #991b1b; font-size: 13px;">Flagged 28.42 Ha Zone (Under SCN-082)</strong>
        <div style="font-size: 11px; color: #4b5563; margin-top: 4px;">
          Activity detected beyond approved lease line. Corroborated by 14 village reports and Sentinel-2 optical telemetry.
        </div>
      </div>
    `);

    // Village settlement markers
    const villages = [
      { name: 'Simlong Village (Primary School)', coords: [25.043, 87.428], note: '14 citizen reports filed' },
      { name: 'Taljhari Cluster', coords: [25.020, 87.440], note: 'Dust plume monitoring buffer' },
      { name: 'Bara Bhuin Hamlet', coords: [25.010, 87.410], note: 'Blasting vibration seismograph point' }
    ];

    villages.forEach(v => {
      const icon = L.divIcon({
        className: 'custom-village-icon',
        html: `<div style="background-color: #F59E0B; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      L.marker(v.coords as L.LatLngExpression, { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #92400e; font-size: 13px;">${v.name}</strong>
            <div style="font-size: 11px; color: #4b5563; margin-top: 3px;">${v.note}</div>
          </div>
        `);
    });

    mapInstanceRef.current = map;
  }, [activeTab, mines]);

  const filteredReports = allReports.filter(r => {
    const matchesSearch = r.village.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          r.details.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          r.id.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          (r.mineName && r.mineName.toLowerCase().includes(reportSearch.toLowerCase()));
    const matchesCat = filterCategory === 'all' || 
                       (filterCategory === 'encroachment' && (r.categoryKey === 'boundary_encroachment' || r.category.includes('Boundary'))) ||
                       (filterCategory === 'dust' && (r.categoryKey === 'dust_air_pollution' || r.category.includes('Dust'))) ||
                       (filterCategory === 'blasting' && (r.categoryKey === 'blasting_vibration' || r.category.includes('Blasting'))) ||
                       (filterCategory === 'water' && (r.categoryKey === 'water_contamination' || r.category.includes('Water')));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* 1. TOP NATIONAL TRICOLOR BAR */}
      <div className="h-1 w-full grid grid-cols-3">
        <div className="bg-[#FF9933]" />
        <div className="bg-[#FFFFFF] border-y border-slate-100" />
        <div className="bg-[#138808]" />
      </div>

      {/* 2. CITIZEN ACCESSIBILITY & OFFICIAL HEADER */}
      <header className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Official Emblem & Portal Title */}
          <div className="flex items-center gap-3.5">
            <div className="flex flex-col items-center justify-center pr-3.5 border-r border-slate-200">
              <span className="font-serif font-bold text-[#0B2545] text-base leading-none">सत्यमेव जयते</span>
              <span className="text-[9px] text-slate-500 font-sans tracking-wide uppercase mt-0.5">Govt. of India</span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#0B2545] uppercase tracking-wider">
                Ministry of Coal &bull; Khanan Prahari Network
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Citizen Environmental Vigilance Portal
              </h1>
            </div>
          </div>

          {/* Citizen Identity & Switch Role / Sign Out */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center">
                KP
              </div>
              <div className="text-left leading-tight">
                <span className="font-bold text-emerald-950 block text-[11px]">
                  Verified Citizen Observer
                </span>
                <span className="text-[10px] text-emerald-700 block">
                  Aadhaar / Mobile OTP Verified
                </span>
              </div>
            </div>

            {/* Global Offline-First Simulator & Universal 5-Role Switcher */}
            <GlobalHeaderControls
              currentUser={currentUser}
              currentPath="/citizen"
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

        {/* 3. CITIZEN NAVIGATION TABS (Light, warm, touch-friendly, mobile-first) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 border-t border-slate-100 flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          <button
            id="tab-track-my-report"
            onClick={() => setActiveTab('track_my_report')}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'track_my_report'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Track My Report</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              activeTab === 'track_my_report' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              PIN Lookup
            </span>
          </button>

          <button
            id="tab-file-concern"
            onClick={() => setActiveTab('file_concern')}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'file_concern'
                ? 'bg-[#138808] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report an Environmental Concern</span>
          </button>

          <button
            id="tab-public-map"
            onClick={() => setActiveTab('public_map')}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'public_map'
                ? 'bg-[#138808] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Public Mine &amp; Village Map</span>
          </button>

          <button
            id="tab-track-reports"
            onClick={() => setActiveTab('track_reports')}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'track_reports'
                ? 'bg-[#138808] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Community Grievance Tracker</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'track_reports' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {allReports.length}
            </span>
          </button>

          <button
            id="tab-environmental-health"
            onClick={() => setActiveTab('environmental_health')}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'environmental_health'
                ? 'bg-[#138808] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Village Air &amp; Blasting Health</span>
          </button>
        </div>
      </header>

      {/* 4. MAIN CITIZEN WORKSPACE */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* PROMINENT QUICK-TRACK ENTRY POINT (Visible on other tabs for effortless access) */}
        {activeTab !== 'track_my_report' && (
          <div className="bg-gradient-to-r from-[#0B2545] via-[#103460] to-[#0B2545] text-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Track My Report (No Login Required)
                  </h3>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Instant PIN Lookup
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Enter your Report ID &amp; 4-digit PIN to check satellite cross-check, evidence corroboration, and Show-Cause Notices.
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickTrackSubmit} className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
              <input
                type="text"
                value={quickSearchId}
                onChange={(e) => setQuickSearchId(e.target.value)}
                placeholder="Report ID (e.g. CR-882)"
                className="bg-slate-900/90 border border-slate-600 focus:border-amber-400 text-white placeholder:text-slate-400 px-3 py-2 rounded-lg text-xs font-mono uppercase focus:outline-none w-full sm:w-44"
              />
              <input
                type="text"
                maxLength={4}
                value={quickSearchPin}
                onChange={(e) => setQuickSearchPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit PIN"
                className="bg-slate-900/90 border border-slate-600 focus:border-amber-400 text-white placeholder:text-slate-400 px-3 py-2 rounded-lg text-xs font-mono tracking-widest text-center focus:outline-none w-full sm:w-28"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs w-full sm:w-auto"
              >
                <span>Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 0: TRACK MY REPORT (Login-Free PIN Lookup & 5-Stage Live Timeline)    */}
        {/* ========================================================================= */}
        {activeTab === 'track_my_report' && (
          <CitizenReportTracker
            reports={allReports}
            initialReportId={activeTrackId}
            initialPin={activeTrackPin}
            onOpenReportForm={() => setActiveTab('file_concern')}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 1: FILE AN ENVIRONMENTAL CONCERN (Simple, warm, accessible form)      */}
        {/* ========================================================================= */}
        {activeTab === 'file_concern' && (
          <div className="space-y-6">
            {/* Friendly Introductory Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl p-5 sm:p-6 shadow-2xs">
              <div className="max-w-2xl space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Statutory Public Vigilance &bull; Khanan Prahari
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Protect Your Community and Local Environment
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Have you observed heavy machinery operating past legal boundary pillars, severe dust drifting toward schools, or nighttime blasting shaking homes? Report your observations directly to the Ministry of Coal. All submissions are automatically correlated against Sentinel satellite scans.
                </p>
              </div>
            </div>

            {/* Submission Status: Official Receipt Card or Interactive Form */}
            {reportSubmitted && lastSubmittedReport ? (
              <CitizenReceiptCard
                report={lastSubmittedReport}
                onTrackNow={(id, pin) => {
                  setActiveTrackId(id);
                  setActiveTrackPin(pin);
                  setActiveTab('track_my_report');
                  setReportSubmitted(false);
                }}
                onSubmitAnother={() => {
                  setReportSubmitted(false);
                  setObservationText('');
                  setLastSubmittedReport(null);
                }}
              />
            ) : (
              <form onSubmit={handleSubmitReport} className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    1. Select Violation Type
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the concern category that best matches what you witnessed on the ground.
                  </p>

                  {/* 4 Accessible Category Selection Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    <div
                      onClick={() => setViolationCategory('boundary_encroachment')}
                      className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                        violationCategory === 'boundary_encroachment'
                          ? 'border-[#138808] bg-emerald-50/50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                        <TreePine className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">Boundary Encroachment</div>
                      <div className="text-[11px] text-slate-500 mt-1">Bulldozers or clearing past statutory lease pillars</div>
                    </div>

                    <div
                      onClick={() => setViolationCategory('dust_air_pollution')}
                      className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                        violationCategory === 'dust_air_pollution'
                          ? 'border-[#138808] bg-emerald-50/50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">Heavy Dust Plumes</div>
                      <div className="text-[11px] text-slate-500 mt-1">Unsuppressed dust drift over homes, schools, or crops</div>
                    </div>

                    <div
                      onClick={() => setViolationCategory('blasting_vibration')}
                      className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                        violationCategory === 'blasting_vibration'
                          ? 'border-[#138808] bg-emerald-50/50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center mb-2">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">Night Blasting Shock</div>
                      <div className="text-[11px] text-slate-500 mt-1">Severe vibration shaking houses outside approved timings</div>
                    </div>

                    <div
                      onClick={() => setViolationCategory('water_contamination')}
                      className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                        violationCategory === 'water_contamination'
                          ? 'border-[#138808] bg-emerald-50/50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">Water Stream Runoff</div>
                      <div className="text-[11px] text-slate-500 mt-1">Coal slurry discharge into village ponds or nalas</div>
                    </div>
                  </div>
                </div>

                {/* 2. Mine & Village Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Mine / Colliery Name
                    </label>
                    <select
                      value={selectedMineId}
                      onChange={(e) => setSelectedMineId(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-3 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
                    >
                      {mines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.region}, {m.state})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Nearest Village, School, or Landmark
                    </label>
                    <input
                      type="text"
                      value={villageName}
                      onChange={(e) => setVillageName(e.target.value)}
                      placeholder="e.g., Simlong Village, Boundary Milestone #14, Taljhari"
                      className="w-full border border-slate-300 rounded-lg p-3 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
                      required
                    />
                  </div>
                </div>

                {/* 3. Detailed Field Observation */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Specific Field Observations &amp; Date/Time
                  </label>
                  <textarea
                    rows={4}
                    value={observationText}
                    onChange={(e) => setObservationText(e.target.value)}
                    placeholder="Describe what you observed: e.g., On Monday evening, heavy bulldozers cleared green trees outside boundary marker 14; or high dust cloud drifted into the village school between 2 PM and 4 PM..."
                    className="w-full border border-slate-300 rounded-lg p-3 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs leading-relaxed"
                    required
                  />
                </div>

                {/* Simulated GPS Geotag info pill */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-start gap-3 text-xs text-emerald-900">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Verified Geotag Position: 25.0214° N, 87.3982° E</span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Your location coordinates are securely tied to this report, enabling the Ministry's automated GIS engine to pinpoint the exact distance from statutory boundary pillars.
                    </p>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#138808] hover:bg-emerald-800 text-white font-bold text-sm py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Verified Concern to Ministry of Coal</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    Submissions are protected under the National Environmental Transparency Framework 2026.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PUBLIC MINE & VILLAGE MAP (Clear, accessible satellite boundaries)  */}
        {/* ========================================================================= */}
        {activeTab === 'public_map' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                    Official Satellite Boundary Explorer
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Rajmahal Open Cast Project &bull; Village Buffer Zone
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-md text-slate-700 font-medium">
                    Imagery: Sentinel-2 / Cartosat
                  </span>
                </div>
              </div>

              {/* Map Container */}
              <div className="relative rounded-lg overflow-hidden border border-slate-300 h-[460px] bg-slate-900 shadow-inner">
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* Floating Citizen Legend */}
                <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg p-3 text-xs shadow-md space-y-1.5 max-w-xs">
                  <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                    Map Guide for Citizens
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-700">
                    <span className="w-4 h-1.5 bg-emerald-500 rounded-xs"></span>
                    <span>Approved Legal Mining Boundary</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-700">
                    <span className="w-4 h-1.5 bg-red-500 rounded-xs"></span>
                    <span>28 Ha Area Under Ministry Review</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></span>
                    <span>Village Settlements &amp; School Clusters</span>
                  </div>
                </div>
              </div>

              {/* Educational Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-slate-800">What are Boundary Pillars?</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Under Coal Mines Regulations 2017 (Regulation 109), every colliery must erect concrete boundary pillars along the legal lease perimeter. Any excavation past these pillars is prohibited.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-slate-800">Why the Red Area is Flagged</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    The Ministry of Coal detected 28 Hectares of active earthmoving extending east toward Simlong village outside the approved line. A formal Show-Cause Notice (SCN-082) was issued to ECL.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-slate-800">Your Role as a Citizen</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Citizen reports from Simlong and Taljhari provided the crucial ground truth that corroborated Sentinel-2 satellite data. Your continued vigilance ensures compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COMMUNITY GRIEVANCE TRACKER (Public Transparency Feed)             */}
        {/* ========================================================================= */}
        {activeTab === 'track_reports' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                    Community Transparency Board
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Public Grievances &amp; Official Redressal Status
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Displaying 43 verified observations submitted by residents across Godda and Rajmahal basin.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search village or report ID..."
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-slate-300 rounded-lg py-1.5 px-3 text-xs bg-white text-slate-800"
                  >
                    <option value="all">All Categories</option>
                    <option value="encroachment">Boundary Encroachment</option>
                    <option value="dust">Dust &amp; Air Pollution</option>
                    <option value="blasting">Blasting &amp; Vibration</option>
                    <option value="water">Water Runoff</option>
                  </select>
                </div>
              </div>

              {/* Grievance Cards List */}
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div key={report.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:border-emerald-300 transition-colors shadow-2xs space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          #{report.id}
                        </span>
                        <span className="font-bold text-xs text-slate-900">
                          {report.village}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {report.mineName}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">
                          {report.date}
                        </span>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                        report.statusColor === 'emerald'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : report.statusColor === 'blue'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : report.statusColor === 'red'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {report.statusText}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {report.details}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 gap-2">
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {report.geotagCorrelationPct 
                          ? `Corroborated: ${report.geotagCorrelationPct}% satellite geotag match`
                          : 'Verified via Sentinel satellite correlation pipeline'}
                      </span>
                      
                      <button
                        onClick={() => {
                          setActiveTrackId(report.id);
                          setActiveTrackPin(report.pin);
                          setActiveTab('track_my_report');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2545] hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>Track Status &amp; Timeline</span>
                        <span className="text-[10px] text-slate-500 font-mono">(PIN: {report.pin})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: VILLAGE ENVIRONMENTAL HEALTH & AQI                                 */}
        {/* ========================================================================= */}
        {activeTab === 'environmental_health' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                  Community Health &amp; Ambient Monitoring
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Godda &bull; Rajmahal Basin Environmental Meters
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time air quality, peak particle velocity (PPV) ground vibration, and green barrier buffer compliance.
                </p>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Dust Pollution (PM10)</span>
                    <Wind className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="text-2xl font-black text-amber-950">168 µg/m³</div>
                  <div className="text-[11px] text-amber-800">
                    Status: <strong>Moderate / Alert</strong> (Wind direction Eastward toward Simlong Village).
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-amber-200/60 pt-1.5">
                    Permissible limit: 100 µg/m³ (CPCB standard)
                  </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">Blasting Vibration (PPV)</span>
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-black text-emerald-950">4.2 mm/s</div>
                  <div className="text-[11px] text-emerald-800">
                    Status: <strong>Within Safe Limits</strong> (Monitored at Taljhari Seismograph Station).
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-emerald-200/60 pt-1.5">
                    Statutory threshold: 5.0 mm/s for village domestic buildings
                  </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">Green Barrier Belt</span>
                    <TreePine className="w-4 h-4 text-blue-700" />
                  </div>
                  <div className="text-2xl font-black text-blue-950">62% Complete</div>
                  <div className="text-[11px] text-blue-800">
                    Status: <strong>Mandated Plantation</strong> (12,400 saplings planted along village buffer).
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-blue-200/60 pt-1.5">
                    MoEFCC target: 100% 3-tier tree green belt by Dec 2026
                  </div>
                </div>
              </div>

              {/* Health Advisory for Villagers */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-700" />
                  <span>Public Health Recommendations for Residents near Mining Perimeter:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  During dry afternoons with winds blowing from the west (quarry face to village), dust suppression water tankers are required to spray haul roads every 45 minutes. If dust concentrations remain high, report via the <strong>Report an Environmental Concern</strong> tab to trigger automated CPCB water cannon compliance.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. OFFICIAL CITIZEN FOOTER */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-600 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-bold text-slate-800">
                Ministry of Coal &bull; Khanan Prahari National Environmental Vigilance
              </p>
              <p className="text-[11px] text-slate-500">
                Integrated with CPGRAMS &bull; Hosted on NIC MeghRaj Cloud &bull; Government of India
              </p>
            </div>
            <div className="text-center sm:text-right">
              <span className="font-bold text-emerald-800 block text-xs">
                Toll-Free Vigilance Helpline: 1800-11-2026
              </span>
              <span className="text-[10px] text-slate-400">
                Mon - Sat: 9:00 AM to 6:00 PM IST
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} Ministry of Coal, Government of India. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span className="hover:underline cursor-pointer">Citizen Charter</span>
              <span>&bull;</span>
              <span className="hover:underline cursor-pointer">Privacy &amp; Data Security</span>
              <span>&bull;</span>
              <span className="hover:underline cursor-pointer">Accessibility Statement</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
