import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Mic, 
  Square, 
  Camera, 
  Image as ImageIcon, 
  Shield, 
  HardHat, 
  UserCheck, 
  Calendar, 
  PhoneCall, 
  RefreshCw, 
  FileText, 
  HelpCircle, 
  Volume2, 
  ChevronRight, 
  Award, 
  Info,
  Check,
  Languages,
  RotateCcw
} from 'lucide-react';
import { AuthUser, LabourAttendanceRecord, LabourNearMissRecord, OfflineMutation, WorkforceAttendanceRecord } from '../types';
import GlobalHeaderControls from './GlobalHeaderControls';

export interface LabourWorkerProfile {
  id: string;
  name: string;
  category: 'Contractual' | 'Permanent';
  agency?: string;
  designationLabel: string; // e.g., "Contractual (Agency: Apex Mining Logistics)" or "Permanent (Grade II Blaster)"
  roleTitle: string;
  avatarInitials: string;
  gatePassExpiry?: string;
}

export const LABOUR_WORKER_PROFILES: LabourWorkerProfile[] = [
  {
    id: 'WKR-8812',
    name: 'Ramesh Soren',
    category: 'Contractual',
    agency: 'Apex Mining Logistics',
    designationLabel: 'Contractual (Agency: Apex Mining Logistics)',
    roleTitle: 'Drill & Heavy Equipment Operator',
    avatarInitials: 'RS',
    gatePassExpiry: 'Valid (Expires 28 Dec 2026)'
  },
  {
    id: 'WKR-4401',
    name: 'Sunil Verma',
    category: 'Permanent',
    designationLabel: 'Permanent (Grade II Blaster)',
    roleTitle: 'Grade II Statutory Blaster (CIL Roll)',
    avatarInitials: 'SV',
    gatePassExpiry: 'Permanent CIL Smart Card'
  }
];

interface LabourMobileAppProps {
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
  onRecordShiftAttendance?: (record: WorkforceAttendanceRecord) => void;
}

export default function LabourMobileApp({
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
  onRecordShiftAttendance
}: LabourMobileAppProps) {
  // Bilingual state: 'en' | 'hi'
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Active Worker Profile (Supports switching between Ramesh Soren & Sunil Verma)
  const [activeProfileId, setActiveProfileId] = useState<string>('WKR-8812');
  const activeWorker = LABOUR_WORKER_PROFILES.find(p => p.id === activeProfileId) || LABOUR_WORKER_PROFILES[0];

  // Phone Bezel Frame Mode (true for authentic smartphone bezel, false for full screen)
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(true);

  // Active Bottom Nav Tab inside Mobile App
  const [mobileTab, setMobileTab] = useState<'attendance' | 'near_miss' | 'safety_vault'>('attendance');

  // Attendance State
  const [attendanceRecords, setAttendanceRecords] = useState<LabourAttendanceRecord[]>([
    {
      id: 'ATT-8811',
      localUuid: 'uuid-att-9812',
      workerId: 'WKR-8812',
      workerName: 'Ramesh Soren',
      shift: 'Shift A',
      checkInTime: '06:02 AM',
      date: 'Yesterday (02 Sep 2026)',
      geofenceStatus: 'Verified Inside Pit #2',
      syncStatus: 'synced',
      govRecordNumber: 'GOV-ATT-8811'
    }
  ]);
  const [isPunchingShift, setIsPunchingShift] = useState<boolean>(false);
  const [latestShiftPunched, setLatestShiftPunched] = useState<LabourAttendanceRecord | null>(null);

  // Near-Miss Voice/Photo Grievance State
  const [nearMissCategory, setNearMissCategory] = useState<LabourNearMissRecord['category']>('Unstable Bench / Overburden Crack');
  const [nearMissNote, setNearMissNote] = useState<string>('');
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [audioRecorded, setAudioRecorded] = useState<boolean>(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [photoAttached, setPhotoAttached] = useState<boolean>(false);
  const [submittedNearMiss, setSubmittedNearMiss] = useState<LabourNearMissRecord | null>(null);

  // Audio recording timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingAudio) {
      timer = setInterval(() => {
        setAudioDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingAudio]);

  // Bilingual Dictionary
  const t = {
    en: {
      appName: 'KhananRakshak (K-AI) Shramik Companion',
      ministry: 'Ministry of Coal &bull; DGMS Field Desk',
      workerName: 'Ramesh Soren',
      designation: 'Drill & Excavation Operator',
      mineLabel: 'Rajmahal OCP (Pit-2 Highwall Sector)',
      empId: 'Emp ID: WKR-8812',
      tabAttendance: 'Attendance',
      tabNearMiss: 'Near-Miss Report',
      tabVault: 'Safety Vault',
      punchHeader: 'Subterranean Shift Punch',
      punchSub: 'Offline Geofence & QR Check-in',
      tapToPunch: 'TAP TO PUNCH SHIFT QR / GEOFENCE',
      punching: 'Validating GPS Geofence...',
      shiftMarkedGov: 'Shift Marked Successfully (Gov Record #8812)',
      pendingSyncBadge: '⏳ Pending Sync (Local UUID Generated)',
      syncedBadge: '✓ Synced to Central Server',
      recentPunches: 'Recent Shift Attendance Records',
      nearMissTitle: 'Safety & Near-Miss Voice/Photo Grievance',
      nearMissSub: 'Instant hazard reporting directly to Colliery Safety Officer.',
      selectCategory: 'Select Hazard Category',
      catGas: 'Gas Smell',
      catPpe: 'Missing PPE',
      catBench: 'Unstable Bench / Overburden Crack',
      catMachinery: 'Machinery Fault',
      voiceReport: 'Voice Memo Simulation',
      startRecord: 'Tap to Record Voice Hazard Note',
      stopRecord: 'Stop Recording',
      recordedMemo: 'Voice memo recorded (8 sec &bull; WAV audio)',
      photoSlot: 'Attach Pit Photo / Inspection Frame',
      photoAttached: 'Photo Attached: pit_bench_crack_sector2.jpg',
      attachPhotoBtn: 'Snap Photo / Select Evidence',
      optionalDesc: 'Brief Observation Note (Optional)',
      submitReport: 'Submit Hazard Grievance',
      receiptTitle: 'Grievance Registered',
      receiptId: 'Report ID Generated Locally: WKR-7031',
      vaultTitle: 'Personal Safety & Compliance Vault',
      refresherTitle: 'Next Refresher Safety Training',
      refresherDate: '12 Oct 2026 (Mine Gas Safety)',
      ppeTitle: 'Assigned Statutory PPE Kit',
      ppeDate: 'Checked 02 Aug 2026',
      sosBtn: 'Emergency SOS &bull; Call Pit Rescue'
    },
    hi: {
      appName: 'खननरक्षक (K-AI) श्रमिक साथी',
      ministry: 'कोयला मंत्रालय &bull; खान सुरक्षा महानिदेशालय',
      workerName: 'रमेश सोरेन',
      designation: 'ड्रिल एवं उत्खनन ऑपरेटर',
      mineLabel: 'राजमहल ओसीपी (पिट-2 हाईवाल क्षेत्र)',
      empId: 'श्रमिक आईडी: WKR-8812',
      tabAttendance: 'उपस्थिति दर्ज',
      tabNearMiss: 'सुरक्षा शिकायत',
      tabVault: 'सुरक्षा तिजोरी',
      punchHeader: 'भूमिगत / खदान शिफ्ट उपस्थिति',
      punchSub: 'ऑफ़लाइन जियोफेंस एवं क्यूआर पंच',
      tapToPunch: 'शिफ्ट पंच करें (QR / जियोफेंस)',
      punching: 'जीपीएस जियोफेंस जांच हो रही है...',
      shiftMarkedGov: 'शिफ्ट सफलतापूर्वक दर्ज (सरकारी रिकॉर्ड #8812)',
      pendingSyncBadge: '⏳ सिंक लंबित (लोकल UUID जनरेटेड)',
      syncedBadge: '✓ केंद्रीय सर्वर से सिंक हो गया',
      recentPunches: 'हाल की उपस्थिति का विवरण',
      nearMissTitle: 'सुरक्षा एवं नियर-मिस आवाज/फोटो शिकायत',
      nearMissSub: 'सीधे खदान सुरक्षा अधिकारी को तत्काल रिपोर्ट भेजें।',
      selectCategory: 'खतरे की श्रेणी चुनें',
      catGas: 'गैस की गंध',
      catPpe: 'पीपीई किट की कमी',
      catBench: 'अस्थिर बेंच / दरार',
      catMachinery: 'मशीनरी खराबी',
      voiceReport: 'आवाज संदेश (वॉयस मेमो)',
      startRecord: 'आवाज में खतरा रिकॉर्ड करने के लिए दबाएं',
      stopRecord: 'रिकॉर्डिंग बंद करें',
      recordedMemo: 'आवाज संदेश रिकॉर्ड हुआ (8 सेकंड &bull; ऑडियो)',
      photoSlot: 'खदान की फोटो / साक्ष्य जोड़ें',
      photoAttached: 'फोटो संलग्न: pit_bench_crack_sector2.jpg',
      attachPhotoBtn: 'फोटो खींचे / साक्ष्य चुनें',
      optionalDesc: 'संक्षिप्त विवरण (वैकल्पिक)',
      submitReport: 'सुरक्षा शिकायत दर्ज करें',
      receiptTitle: 'शिकायत सफलतापूर्वक दर्ज',
      receiptId: 'लोकल रिपोर्ट आईडी: WKR-7031',
      vaultTitle: 'व्यक्तिगत सुरक्षा एवं प्रशिक्षण विवरण',
      refresherTitle: 'अगला सुरक्षा पुनश्चर्या प्रशिक्षण',
      refresherDate: '12 अक्टूबर 2026 (खदान गैस सुरक्षा)',
      ppeTitle: 'आबंटित पीपीई सुरक्षा किट',
      ppeDate: 'सत्यापित 02 अगस्त 2026',
      sosBtn: 'आपातकालीन एसओएस &bull; बचाव दल को कॉल करें'
    }
  }[lang];

  // Shift Punch Action
  const handlePunchShift = () => {
    setIsPunchingShift(true);
    setTimeout(() => {
      setIsPunchingShift(false);
      const localUuid = `uuid-att-${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newRecord: LabourAttendanceRecord = {
        id: `ATT-${8812 + attendanceRecords.length}`,
        localUuid,
        workerId: activeWorker.id,
        workerName: activeWorker.name,
        employmentCategory: activeWorker.category,
        contractorAgency: activeWorker.agency,
        designation: activeWorker.roleTitle,
        shift: 'Shift B',
        checkInTime: timeStr,
        date: 'Today (03 Sep 2026)',
        geofenceStatus: 'Verified Inside Pit #2',
        syncStatus: isOnline ? 'synced' : 'pending',
        govRecordNumber: isOnline ? `GOV-ATT-${activeWorker.id.slice(-4)}` : undefined
      };

      setAttendanceRecords(prev => [newRecord, ...prev]);
      setLatestShiftPunched(newRecord);

      // Add to offline queue if offline
      const uuid = onAddOfflineMutation({
        type: 'shift_attendance',
        title: `Shift Attendance: ${activeWorker.name} (${activeWorker.designationLabel})`,
        origin: 'labour_app',
        payloadSummary: `Punched at ${timeStr} in Pit #2. Geofence Verified. Category: ${activeWorker.category}. Local UUID: ${localUuid}`
      });

      // Synchronize immediately to Mine Officer & Operator Roster
      if (onRecordShiftAttendance) {
        const globalRecord: WorkforceAttendanceRecord = {
          id: `ATT-LIVE-${activeWorker.id}-${Date.now().toString().slice(-4)}`,
          localUuid,
          workerId: activeWorker.id,
          workerName: activeWorker.name,
          designation: activeWorker.roleTitle,
          employmentCategory: activeWorker.category,
          contractorAgency: activeWorker.agency,
          shift: 'Shift B',
          checkInTime: 'Just now',
          date: 'Today (03 Sep 2026)',
          geofenceGate: 'Pit #2 Gate Alpha (Geofence Verified)',
          fitnessStatus: activeWorker.category === 'Contractual' ? 'Fit (Form-O Valid)' : 'Fit (DGMS Valid)',
          syncStatus: isOnline ? 'synced' : 'pending',
          govRecordNumber: isOnline ? `GOV-MUSTER-${activeWorker.id.slice(-4)}` : undefined,
          avatarInitials: activeWorker.avatarInitials
        };
        onRecordShiftAttendance(globalRecord);
      }

      triggerToast(
        isOnline 
          ? `Shift attendance marked for ${activeWorker.name} (${activeWorker.category}) & synced to Mine Officer roster.` 
          : `Shift logged locally for ${activeWorker.name} (UUID: ${uuid.slice(0, 8)}). Queued for sync.`
      );
    }, 750);
  };

  // Submit Near Miss Action
  const handleSubmitNearMiss = (e: React.FormEvent) => {
    e.preventDefault();
    const localUuid = `uuid-wkr-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: LabourNearMissRecord = {
      id: 'WKR-7031',
      localUuid,
      category: nearMissCategory,
      categoryHindi: 
        nearMissCategory === 'Gas Smell' ? 'गैस की गंध' :
        nearMissCategory === 'Missing PPE' ? 'पीपीई किट की कमी' :
        nearMissCategory === 'Unstable Bench / Overburden Crack' ? 'अस्थिर बेंच / दरार' : 'मशीनरी खराबी',
      description: nearMissNote || (nearMissCategory + ' observed in Pit Bench 3 loading section.'),
      photoAttached,
      audioRecorded,
      audioDurationSec: audioDuration || 8,
      timestamp: timeStr,
      date: 'Today, 03 Sep 2026',
      syncStatus: isOnline ? 'synced' : 'pending',
      status: 'Assigned to Safety Officer'
    };

    setSubmittedNearMiss(newRecord);

    // Add to offline mutation queue
    const uuid = onAddOfflineMutation({
      type: 'near_miss_report',
      title: `Near-Miss [${nearMissCategory}]`,
      origin: 'labour_app',
      payloadSummary: `Filed by Ramesh Soren. Audio: ${audioRecorded ? 'Yes' : 'No'}, Photo: ${photoAttached ? 'Yes' : 'No'}. Local UUID: ${localUuid}`
    });

    triggerToast(
      isOnline 
        ? 'Near-miss complaint received by Rajmahal Colliery Safety Desk.' 
        : `Grievance saved locally in Subterranean queue (UUID: ${uuid.slice(0, 8)}).`
    );
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
      {/* 1. TOP GLOBAL STATUS BAR (Outside the phone bezel) */}
      <header className="bg-[#0B1528] text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl w-full mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative inline-flex items-center justify-center shrink-0">
              <img 
                src="/src/assets/logo.png" 
                alt="K Logo" 
                className="h-8 w-8 object-contain rounded-full" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('w-8', 'h-8', 'rounded-full', 'bg-[#0A192F]', 'border', 'border-cyan-400', 'flex', 'items-center', 'justify-center', 'text-cyan-300', 'font-mono', 'font-black', 'text-xs');
                  e.currentTarget.parentElement?.appendChild(document.createTextNode('K'));
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white">
                  KhananRakshak AI &bull; Labour Desk
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                  Mobile Sim
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:block">
                Authentic Smartphone Bezel &bull; Bilingual &bull; Offline Subterranean Sync (SIH26024)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle: Frame vs Full */}
            <button
              onClick={() => setPhoneFrameMode(!phoneFrameMode)}
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Toggle Phone Frame Bezel View"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{phoneFrameMode ? 'Full Screen View' : 'Phone Bezel View'}</span>
            </button>

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
        </div>
      </header>

      {/* 2. MAIN WORKSPACE WITH SMARTPHONE BEZEL SIMULATOR */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex items-center justify-center">
        {/* Smartphone Chassis Container */}
        <div className={`w-full transition-all duration-300 ${
          phoneFrameMode 
            ? 'max-w-[420px] rounded-[42px] border-[10px] border-slate-800 bg-slate-900 shadow-2xl p-2.5 ring-1 ring-slate-700' 
            : 'max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-4'
        }`}>
          {/* Inner Phone Screen */}
          <div className="bg-[#F8FAFC] text-slate-900 rounded-[32px] overflow-hidden flex flex-col min-h-[720px] max-h-[820px] shadow-inner relative border border-slate-200">
            
            {/* Smartphone Top Notch & Status Bar */}
            <div className="bg-[#0B2545] text-white px-5 pt-2.5 pb-2 flex items-center justify-between text-[11px] font-mono select-none">
              <span>09:41</span>
              {/* Speaker / Camera Notch */}
              <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 ring-1 ring-slate-700"></div>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wifi className="w-3 h-3" />
                    <span>5G</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <WifiOff className="w-3 h-3" />
                    <span>OFFLINE</span>
                  </span>
                )}
                <span>94%</span>
              </div>
            </div>

            {/* Mobile App Top Brand Bar with Bilingual Toggle */}
            <div className="bg-[#0B2545] text-white px-4 py-3 border-b border-blue-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ring-2 ${
                    activeWorker.category === 'Contractual' 
                      ? 'bg-amber-600 ring-amber-400/50 text-white' 
                      : 'bg-indigo-600 ring-indigo-400/50 text-white'
                  }`}>
                    {activeWorker.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                      <span>{activeWorker.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        activeWorker.category === 'Contractual'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                      }`}>
                        {activeWorker.category}
                      </span>
                    </div>
                    {/* Explicit Designation Requirement: e.g. "Ramesh Soren · Contractual (Agency: Apex Mining Logistics)" or "Sunil Verma · Permanent (Grade II Blaster)" */}
                    <div className="text-[10px] text-slate-300 truncate font-medium">
                      {activeWorker.designationLabel}
                    </div>
                  </div>
                </div>

                {/* Bilingual Language Switcher Button */}
                <button
                  type="button"
                  onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                  title="Switch between English and हिन्दी"
                >
                  <Languages className="w-3 h-3 text-amber-400" />
                  <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
                </button>
              </div>

              {/* Explicit Worker Persona Switcher & Colliery Badge */}
              <div className="mt-2.5 flex flex-col gap-1.5">
                <div className="bg-black/35 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400">Worker ID:</span>
                    <strong className="font-mono text-white">{activeWorker.id}</strong>
                    <span>&bull;</span>
                    <span className="truncate">{t.mineLabel}</span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                    isOnline ? 'bg-emerald-400/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300'
                  }`}>
                    {isOnline ? '● Online' : '○ Offline'}
                  </span>
                </div>

                {/* Quick Persona Toggle Banner */}
                <div className="bg-blue-950/80 border border-blue-800/60 rounded-md px-2 py-1 text-[10px] flex items-center justify-between">
                  <span className="text-blue-300 font-medium">Switch Test Persona:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveProfileId('WKR-8812')}
                      className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        activeProfileId === 'WKR-8812'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Ramesh (Contractual)
                    </button>
                    <span className="text-slate-500">|</span>
                    <button
                      onClick={() => setActiveProfileId('WKR-4401')}
                      className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        activeProfileId === 'WKR-4401'
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Sunil (Permanent)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Mobile Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* ========================================================================= */}
              {/* TAB 1: OFFLINE SHIFT ATTENDANCE                                           */}
              {/* ========================================================================= */}
              {mobileTab === 'attendance' && (
                <div className="space-y-4">
                  {/* Attendance Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-center space-y-3.5">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-sm text-slate-900">
                        {t.punchHeader}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {t.punchSub}
                      </p>
                    </div>

                    {/* LARGE INTERACTIVE PUNCH BUTTON */}
                    <button
                      id="btn-punch-shift-qr"
                      onClick={handlePunchShift}
                      disabled={isPunchingShift}
                      className={`w-full py-5 px-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                        isPunchingShift
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-gradient-to-b from-[#138808] to-[#0f6b06] hover:from-[#169d0a] hover:to-[#138808] text-white active:scale-98'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-inner">
                        {isPunchingShift ? (
                          <RefreshCw className="w-7 h-7 text-white animate-spin" />
                        ) : (
                          <QrCode className="w-7 h-7 text-white" />
                        )}
                      </div>
                      <span className="text-sm tracking-wide">
                        {isPunchingShift ? t.punching : t.tapToPunch}
                      </span>
                      <span className="text-[10px] text-emerald-100 font-normal">
                        DGMS Section 48 &bull; Subterranean Geofence Authenticated
                      </span>
                    </button>

                    {/* Latest Punch Feedback Pill */}
                    {latestShiftPunched && (
                      <div className={`p-3 rounded-xl border text-xs text-left space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                        latestShiftPunched.syncStatus === 'pending'
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between">
                          <strong className="text-xs">
                            {isOnline ? t.shiftMarkedGov : 'Shift Marked (Local Storage)'}
                          </strong>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            latestShiftPunched.syncStatus === 'pending'
                              ? 'bg-amber-200 text-amber-950'
                              : 'bg-emerald-200 text-emerald-950'
                          }`}>
                            {latestShiftPunched.syncStatus === 'pending' ? t.pendingSyncBadge : t.syncedBadge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          Time: {latestShiftPunched.checkInTime} &bull; UUID: {latestShiftPunched.localUuid}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendance Log History */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{t.recentPunches}</span>
                      <span className="text-[10px] text-slate-400">Shift Log</span>
                    </div>

                    <div className="space-y-2">
                      {attendanceRecords.map((att) => (
                        <div key={att.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-800">{att.shift} &bull; {att.checkInTime}</div>
                            <div className="text-[10px] text-slate-500">{att.date} &bull; {att.geofenceStatus}</div>
                          </div>
                          <div className="text-right">
                            {att.syncStatus === 'pending' ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                ⏳ Pending Sync
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                                ✓ Synced
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: SAFETY & NEAR-MISS VOICE/PHOTO GRIEVANCE                           */}
              {/* ========================================================================= */}
              {mobileTab === 'near_miss' && (
                <div className="space-y-3.5">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-sm text-slate-900">
                        {t.nearMissTitle}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {t.nearMissSub}
                      </p>
                    </div>

                    {/* Submission Success Receipt Card */}
                    {submittedNearMiss ? (
                      <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl space-y-2.5 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-emerald-950">
                            {t.receiptTitle}
                          </h4>
                          <div className="font-mono text-sm font-extrabold text-emerald-800 bg-emerald-100/70 border border-emerald-300 py-1 px-3 rounded-lg inline-block my-1">
                            {t.receiptId}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-700 text-left bg-white p-2.5 rounded-lg border border-emerald-200 space-y-1">
                          <div><strong>Category:</strong> {submittedNearMiss.category}</div>
                          <div><strong>Status:</strong> {submittedNearMiss.status}</div>
                          <div className="font-mono text-[10px] text-slate-500">
                            Sync Status: {submittedNearMiss.syncStatus === 'pending' ? t.pendingSyncBadge : t.syncedBadge}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSubmittedNearMiss(null);
                            setNearMissNote('');
                            setAudioRecorded(false);
                            setPhotoAttached(false);
                          }}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Submit Another Near-Miss
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitNearMiss} className="space-y-3">
                        {/* 1. Category Picker */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            {t.selectCategory}
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            {[
                              { key: 'Gas Smell', en: t.catGas, hi: 'गैस की गंध' },
                              { key: 'Missing PPE', en: t.catPpe, hi: 'पीपीई किट की कमी' },
                              { key: 'Unstable Bench / Overburden Crack', en: t.catBench, hi: 'अस्थिर बेंच / दरार' },
                              { key: 'Machinery Fault', en: t.catMachinery, hi: 'मशीनरी खराबी' }
                            ].map((item) => (
                              <button
                                key={item.key}
                                type="button"
                                onClick={() => setNearMissCategory(item.key as any)}
                                className={`p-2 rounded-xl text-left border text-[11px] font-semibold transition-all cursor-pointer ${
                                  nearMissCategory === item.key
                                    ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {lang === 'hi' ? item.hi : item.en}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Audio Memo Simulator */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              <Mic className="w-3.5 h-3.5 text-blue-600" />
                              <span>{t.voiceReport}</span>
                            </span>
                            {audioRecorded && (
                              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Recorded</span>
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (isRecordingAudio) {
                                setIsRecordingAudio(false);
                                setAudioRecorded(true);
                              } else {
                                setIsRecordingAudio(true);
                                setAudioRecorded(false);
                                setAudioDuration(0);
                              }
                            }}
                            className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              isRecordingAudio
                                ? 'bg-red-600 text-white animate-pulse'
                                : audioRecorded
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                            }`}
                          >
                            {isRecordingAudio ? (
                              <>
                                <Square className="w-3.5 h-3.5" />
                                <span>{t.stopRecord} ({audioDuration}s)</span>
                              </>
                            ) : audioRecorded ? (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{t.recordedMemo}</span>
                              </>
                            ) : (
                              <>
                                <Mic className="w-3.5 h-3.5 text-slate-600" />
                                <span>{t.startRecord}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* 3. Photo Attachment Slot */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t.photoSlot}</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPhotoAttached(!photoAttached)}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              photoAttached
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{photoAttached ? t.photoAttached : t.attachPhotoBtn}</span>
                          </button>
                        </div>

                        {/* 4. Optional Text Description */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 block">
                            {t.optionalDesc}
                          </label>
                          <textarea
                            rows={2}
                            value={nearMissNote}
                            onChange={(e) => setNearMissNote(e.target.value)}
                            placeholder={lang === 'hi' ? 'बेंच पर दरार या खतरे का विवरण लिखें...' : 'Describe crack location, equipment number or hazard...'}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-[#0B2545] hover:bg-[#133A6B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          {t.submitReport}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: PERSONAL SAFETY VAULT                                              */}
              {/* ========================================================================= */}
              {mobileTab === 'safety_vault' && (
                <div className="space-y-3.5">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <h3 className="font-bold text-sm text-slate-900">
                      {t.vaultTitle}
                    </h3>

                    {/* Next Refresher Training */}
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-1 text-xs">
                      <div className="font-bold text-blue-950 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-700" />
                        <span>{t.refresherTitle}</span>
                      </div>
                      <div className="text-sm font-extrabold text-blue-900">
                        {t.refresherDate}
                      </div>
                      <p className="text-[11px] text-blue-700">
                        DGMS VTC Godda &bull; Mandatory Subterranean Gas &amp; InSAR Safety module.
                      </p>
                    </div>

                    {/* Assigned PPE Kit */}
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-xs">
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <HardHat className="w-4 h-4 text-emerald-700" />
                        <span>{t.ppeTitle}</span>
                      </div>
                      <div className="text-xs font-bold text-emerald-900">
                        {t.ppeDate}
                      </div>
                      <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5 pt-1">
                        <li>Hardhat Class-E (Yellow) &bull; Insp Tag #8892</li>
                        <li>FFP3 Anti-Dust Respirator Mask</li>
                        <li>Steel-Toe Metatarsal Work Boots (Size 9)</li>
                        <li>Reflective Harness Grade-2</li>
                      </ul>
                    </div>

                    {/* Emergency SOS Button */}
                    <button
                      onClick={() => triggerToast('Emergency SOS Signal sent to Colliery Control Room & Rescue Room.')}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 animate-bounce" />
                      <span>{t.sosBtn}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation Bar inside Phone Screen */}
            <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around text-xs shrink-0 select-none">
              <button
                onClick={() => setMobileTab('attendance')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  mobileTab === 'attendance' ? 'text-[#0B2545] font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-[10px]">{t.tabAttendance}</span>
              </button>

              <button
                onClick={() => setMobileTab('near_miss')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  mobileTab === 'near_miss' ? 'text-[#0B2545] font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="text-[10px]">{t.tabNearMiss}</span>
              </button>

              <button
                onClick={() => setMobileTab('safety_vault')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  mobileTab === 'safety_vault' ? 'text-[#0B2545] font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-[10px]">{t.tabVault}</span>
              </button>
            </div>

            {/* Smartphone Bottom Home Bar */}
            <div className="bg-white py-1 flex justify-center">
              <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
