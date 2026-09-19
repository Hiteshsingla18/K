import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Download, 
  X, 
  Filter, 
  ArrowRight, 
  ExternalLink,
  Users,
  FileText,
  Layers,
  ChevronRight,
  Sparkles,
  Activity,
  Settings,
  HelpCircle,
  Radio,
  Search,
  Scale,
  LogOut,
  ArrowLeftRight
} from 'lucide-react';

import { MineRecord, ViolationStatus, GovNavType, AuthUser, UserRole, OfflineMutation, WorkforceAttendanceRecord } from './types';
import { MINES_DATA } from './data/mines';
import { INITIAL_ATTENDANCE_ROSTER } from './data/initialAttendance';
import { coalGuardService, type CreateMineInput } from './services/coalGuardService';
import SurveillanceMap from './components/SurveillanceMap';
import MineExplorer from './components/MineExplorer';
import EvidenceChain from './components/EvidenceChain';
import CitizenVigilance from './components/CitizenVigilance';
import RiskPrediction from './components/RiskPrediction';
import RegulatoryCopilot from './components/RegulatoryCopilot';
import AuthGateway from './components/AuthGateway';
import OperatorPortal from './components/OperatorPortal';
import CitizenPortal from './components/CitizenPortal';
import MineOfficerPortal from './components/MineOfficerPortal';
import LabourMobileApp from './components/LabourMobileApp';
import SyncQueueModal from './components/SyncQueueModal';
import GlobalHeaderControls from './components/GlobalHeaderControls';
import StatutoryDossierModal from './components/StatutoryDossierModal';
import MineVirtualView from './components/mineVirtualView/MineVirtualView';
import KhananRakshakLogo from './components/KhananRakshakLogo';
import { ErrorBoundary } from './components/ErrorBoundary';

import { useAuth } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';

const INITIAL_MUTATIONS: OfflineMutation[] = [
  {
    id: 'MUT-001',
    idempotencyKey: 'idem-c892-01',
    type: 'capa_issuance',
    title: 'Issue CAPA-399: High-Visibility Vest Obscured',
    timestamp: 'Today, 07:45 AM',
    origin: 'mine_officer',
    status: 'synced',
    payloadSummary: 'Assigned to Overman Ramesh Yadav for Worker #309 in East Coal Bench #2 (Conf 91.2%).'
  },
  {
    id: 'MUT-002',
    idempotencyKey: 'idem-c892-02',
    type: 'shift_attendance',
    title: 'Shift Attendance: Ramesh Soren (Shift A)',
    timestamp: 'Yesterday, 06:02 AM',
    origin: 'labour_app',
    status: 'synced',
    payloadSummary: 'Punched at 06:02 AM in Pit #2. Geofence Verified. Gov Record: GOV-ATT-8811.'
  }
];

export default function App() {
  const {
    user: currentUser,
    loginAs,
    signIn,
    signOut,
    role,
    sessionMessage,
    clearSessionMessage,
    sessionRemainingSeconds
  } = useAuth();

  // Path-based routing: '/', '/command', '/operator', '/citizen', '/officer', '/labour'
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/command' || p === '/operator' || p === '/citizen' || p === '/officer' || p === '/labour') {
        return p;
      }
    }
    return '/';
  });

  // Offline-First Simulation State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [mutationQueue, setMutationQueue] = useState<OfflineMutation[]>(INITIAL_MUTATIONS);

  // Colliery Workforce Attendance Roster State (Synchronized across Labour, Officer, and Operator portals)
  const [attendanceRoster, setAttendanceRoster] = useState<WorkforceAttendanceRecord[]>(INITIAL_ATTENDANCE_ROSTER);

  const handleRecordShiftAttendance = (newRecord: WorkforceAttendanceRecord) => {
    setAttendanceRoster(prev => [newRecord, ...prev]);
  };

  const pendingSyncCount = mutationQueue.filter(m => m.status === 'pending').length;

  const handleToggleNetwork = () => {
    if (isOnline) {
      setIsOnline(false);
      triggerToast('Subterranean Offline Mode engaged. Actions will write to local mutation queue with UUIDs.');
    } else {
      setIsOnline(true);
      setIsSyncing(true);
      triggerToast('Reconnecting to Central Server... Uploading Queued Mutations with Idempotency Key...');
      setTimeout(() => {
        setMutationQueue(prev => prev.map(m => m.status === 'pending' ? { ...m, status: 'synced' } : m));
        setIsSyncing(false);
        triggerToast('✓ Central Sync Complete: All local mutations uploaded and acknowledged by Central Server.');
      }, 2000);
    }
  };

  const handleAddOfflineMutation = (mutation: Omit<OfflineMutation, 'id' | 'idempotencyKey' | 'timestamp' | 'status'>): string => {
    const nextId = `MUT-${String(mutationQueue.length + 1).padStart(3, '0')}`;
    const localUuid = `uuid-${Math.random().toString(36).substring(2, 9)}`;
    const idemKey = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMut: OfflineMutation = {
      ...mutation,
      id: nextId,
      idempotencyKey: idemKey,
      timestamp: 'Just now',
      status: isOnline ? 'synced' : 'pending'
    };
    setMutationQueue(prev => [newMut, ...prev]);
    return localUuid;
  };

  const handleClearSyncedMutations = () => {
    setMutationQueue(prev => prev.filter(m => m.status === 'pending'));
    triggerToast('Cleared synced audit logs from local cache.');
  };

  const handleForceSync = () => {
    if (pendingSyncCount === 0) {
      triggerToast('All mutations already in sync with Central Server.');
      return;
    }
    setIsSyncing(true);
    triggerToast('Uploading queued mutations to central server...');
    setTimeout(() => {
      setMutationQueue(prev => prev.map(m => ({ ...m, status: 'synced' })));
      setIsSyncing(false);
      triggerToast('✓ Central server acknowledged all mutations.');
    }, 1500);
  };

  // Browser history sync
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      const normalized = (p === '/command' || p === '/operator' || p === '/citizen' || p === '/officer' || p === '/labour') ? p : '/';
      setCurrentPath(normalized);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    setCurrentPath(newPath);
  };

  const handleSwitchPortal = (targetRole: UserRole, targetRoute: string) => {
    // We don't set userObj directly here anymore, we just navigate.
    // AuthGuard will handle role enforcement.
    navigate(targetRoute);
  };

  // DGMS Officer Command Center navigation: overview, explorer, evidence, citizen, risk
  const [officerNav, setOfficerNav] = useState<GovNavType>('overview');

  // Mine selection and investigation state
  const [mines, setMines] = useState<MineRecord[]>(MINES_DATA);
  const [selectedMine, setSelectedMine] = useState<MineRecord | null>(MINES_DATA[0]); // Default to Rajmahal OCP
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [virtualViewOpen, setVirtualViewOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const liveMines = await coalGuardService.fetchMines();
      setMines(liveMines);
      if (liveMines.length > 0) {
        setSelectedMine(liveMines[0]);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Filters for Overview Map & Registry
  const [filterState, setFilterState] = useState<string>('All States');
  const [filterSubsidiary, setFilterSubsidiary] = useState<string>('All Subsidiaries');
  const [filterRisk, setFilterRisk] = useState<string>('All Risks');

  // Dynamic statistics calculated from the nationwide registry
  const totalMinesCount = mines.length;
  
  const totalActiveWorkforce = mines.reduce(
    (acc, m) => acc + (Number(m.workforceSplit?.total) || Number(m.activeWorkforce) || 0),
    0
  );
  
  const totalPermanentWorkforce = mines.reduce(
    (acc, m) => acc + (Number(m.workforceSplit?.permanent) || Math.round(Number(m.activeWorkforce || 0) * 0.5)),
    0
  );
  
  const totalContractualWorkforce = mines.reduce(
    (acc, m) => acc + (Number(m.workforceSplit?.contractual) || Math.round(Number(m.activeWorkforce || 0) * 0.5)),
    0
  );
  
  const criticalBreaches = mines.filter(
    (m) => (Number(m.complianceScore) || 0) < 65 || (m.status || '')?.toUpperCase() === 'CRITICAL'
  );
  const criticalBreachesCount = criticalBreaches.length;
  
  const avgComplianceRating = mines.length > 0 
    ? Math.round(mines.reduce((acc, m) => acc + (Number(m.complianceScore) || 0), 0) / mines.length).toString()
    : "84";

  // Violation status workflow across government and operator
  const [violationStatus, setViolationStatus] = useState<ViolationStatus>('pending_review');
  
  // Modals & Drawers
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  useEffect(() => {
    if (!sessionMessage) return;
    navigate('/');
    triggerToast(sessionMessage);
    clearSessionMessage();
  }, [sessionMessage, clearSessionMessage]);

  const handleSelectRole = (user: AuthUser, route: string) => {
    loginAs(user);
    navigate(route);
    triggerToast(`Logged into ${
      route === '/command' ? 'DGMS Surveillance Command' :
      route === '/operator' ? 'Colliery Operator Desk' :
      route === '/officer' ? 'Mine Safety Officer Portal' :
      route === '/labour' ? 'Colliery Labour Mobile App' :
      'Citizen Environmental Vigilance Portal'
    }.`);
  };

  const handleSupabaseSignIn = async (email: string, password: string, route: string) => {
    await signIn(email, password);
    navigate(route);
    triggerToast('Authenticated with Supabase. Government permissions loaded.');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Unable to sign out from Supabase.', error);
    }
    navigate('/');
    triggerToast('Signed out. Returned to National Login Gateway.');
  };

  const handleSelectMine = (mine: MineRecord) => {
    setSelectedMine(mine);
    setDrawerOpen(true);
    triggerToast(`Active surveillance focused on: ${mine.name}`);
  };

  const handleCreateMine = async (input: CreateMineInput) => {
    const createdMine = await coalGuardService.createMine(input);
    setMines(current => [...current, createdMine]);
    setSelectedMine(createdMine);
    setDrawerOpen(true);
    triggerToast(`${createdMine.name} was added to the live mine registry.`);
  };

  const handleInvestigateEvidence = (mine?: MineRecord) => {
    if (mine) {
      setSelectedMine(mine);
    }
    setOfficerNav('evidence');
    triggerToast(`Evidence investigation loaded for ${mine?.name || selectedMine?.name || 'Rajmahal OCP'}`);
  };

  const handleIssueShowCauseNotice = async () => {
    try {
      await coalGuardService.issueShowCauseNotice('ENV-082');
      setViolationStatus('awaiting_mine_response');
      triggerToast('Statutory Show-Cause Notice SCN-2026-082 dispatched to ECL Operator Desk (48h countdown active).');
      handleSwitchPortal('operator', '/operator');
    } catch (error) {
      console.error('Unable to issue show-cause notice.', error);
      triggerToast('Show-cause notice could not be saved. Check your Supabase connection and permissions.');
    }
  };

  const handleSubmitFormalResponse = async () => {
    try {
      await coalGuardService.submitOperatorResponse({ violationId: 'ENV-082', details: 'Operator response submitted' });
      setViolationStatus('response_submitted_awaiting_verification');
      triggerToast('Formal clarification received from ECL Operator Desk. Government vigilance notified.');
      handleSwitchPortal('gov', '/command');
    } catch (error) {
      console.error('Unable to submit operator response.', error);
      triggerToast('Operator response could not be saved. Check your Supabase connection and permissions.');
    }
  };

  // =========================================================================
  // ROUTE 1: '/' -> Official National Role-Based Login Gateway
  // =========================================================================
  if (currentPath === '/' || !currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#0A192F] text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0"></div>
            <p className="flex-1 font-medium">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <AuthGateway
          onSelectRole={handleSelectRole}
          onSupabaseSignIn={handleSupabaseSignIn}
        />
      </>
    );
  }

  // =========================================================================
  // ROUTE 2: '/citizen' -> Citizen Environmental Vigilance Portal
  // (Lighter, warmer, simpler public grievance portal, mobile-first)
  // =========================================================================
  if (currentPath === '/citizen') {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-emerald-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
            <p className="flex-1 font-medium">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <AuthGuard requiredRole="citizen">
          <CitizenPortal
            currentUser={currentUser!}
            mines={mines}
            onSignOut={handleSignOut}
            triggerToast={triggerToast}
            isOnline={isOnline}
            isSyncing={isSyncing}
            pendingSyncCount={pendingSyncCount}
            onToggleNetwork={handleToggleNetwork}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onSwitchPortal={handleSwitchPortal}
          />
        </AuthGuard>
        <SyncQueueModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          isOnline={isOnline}
          isSyncing={isSyncing}
          mutations={mutationQueue}
          onTriggerSync={handleForceSync}
          onClearSynced={handleClearSyncedMutations}
        />
      </>
    );
  }

  // =========================================================================
  // ROUTE 3: '/operator' -> Colliery Operator Desk (ECL)
  // (Dark navy/gold theme with operator-only actions)
  // =========================================================================
  if (currentPath === '/operator') {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#0A192F] text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-amber-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></div>
            <p className="flex-1 font-medium">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <AuthGuard requiredRole="operator">
          <OperatorPortal
            currentUser={currentUser!}
            violationStatus={violationStatus}
            mines={mines}
            onSubmitFormalResponse={handleSubmitFormalResponse}
            onSignOut={handleSignOut}
            onOpenDossierModal={() => setShowDossierModal(true)}
            triggerToast={triggerToast}
            isOnline={isOnline}
            isSyncing={isSyncing}
            pendingSyncCount={pendingSyncCount}
            onToggleNetwork={handleToggleNetwork}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onSwitchPortal={handleSwitchPortal}
            attendanceRoster={attendanceRoster}
          />
        </AuthGuard>
        <SyncQueueModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          isOnline={isOnline}
          isSyncing={isSyncing}
          mutations={mutationQueue}
          onTriggerSync={handleForceSync}
          onClearSynced={handleClearSyncedMutations}
        />

        {/* Official Inspection Dossier Modal for Operator */}
        {showDossierModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 bg-[#0A192F] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-sm">Ministry Inspection Dossier #ENV-082</span>
                </div>
                <button 
                  onClick={() => setShowDossierModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 font-serif text-slate-900 text-xs">
                <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                  <div className="flex justify-center mb-1">
                    <img 
                      src="/src/assets/logo.png" 
                      alt="K Logo" 
                      className="h-10 w-10 object-contain rounded-full shadow-xs" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('w-10', 'h-10', 'rounded-full', 'bg-[#0A192F]', 'border', 'border-cyan-400', 'flex', 'items-center', 'justify-center', 'text-cyan-300', 'font-mono', 'font-black', 'text-sm');
                        e.currentTarget.parentElement?.appendChild(document.createTextNode('K'));
                      }}
                    />
                  </div>
                  <div className="font-bold text-sm tracking-wide uppercase font-sans">Government of India &bull; Ministry of Coal</div>
                  <div className="text-[11px] font-sans text-slate-600">KhananRakshak AI (K-AI) &bull; DGMS Environmental Oversight</div>
                  <div className="font-bold text-xs mt-1 text-red-700 font-sans">STATUTORY INSPECTION &amp; SHOW-CAUSE DOSSIER #ENV-082</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] font-sans bg-slate-50 p-3 rounded border border-slate-200">
                  <div><strong>Subject Mine:</strong> Rajmahal Open Cast Project (OCP)</div>
                  <div><strong>Operator:</strong> Eastern Coalfields Limited (ECL)</div>
                  <div><strong>Clearance Ref:</strong> MoEFCC Rule 14(b) - Statutory Boundary Adherence</div>
                  <div><strong>Assessed Area:</strong> 1,276 Ha (Permitted: 1,248 Ha)</div>
                </div>

                <div className="space-y-2 text-justify leading-relaxed">
                  <p>
                    <strong>1. Geospatial Breach Finding:</strong> Automated multi-spectral satellite comparison (Sentinel-2 and Cartosat-3) confirmed active coal winning and heavy earthmoving over 28.42 hectares outside the gazetted lease boundary of Rajmahal OCP, Godda district, Jharkhand.
                  </p>
                  <p>
                    <strong>2. Community Corroboration:</strong> 14 citizen geotagged reports from Simlong and Taljhari village clusters independently verify dust drift and perimeter tree clearing.
                  </p>
                  <p>
                    <strong>3. Statutory Enforcement Directive:</strong> ECL is directed to submit a formal engineering explanation and differential GPS survey within 48 hours under Regulation 109 of Coal Mines Regulations 2017.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-300 flex justify-between items-end font-sans text-[11px]">
                  <div>
                    <span className="font-bold block">Status:</span>
                    <span className="text-amber-700 font-semibold">{violationStatus.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">Authorized Inspecting Officer</div>
                    <div className="text-slate-500">Directorate General of Mines Vigilance</div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => {
                    triggerToast('Official Dossier certified PDF downloaded.');
                    setShowDossierModal(false);
                  }}
                  className="px-4 py-1.5 bg-[#1E40AF] hover:bg-blue-800 text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Certified PDF</span>
                </button>
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // =========================================================================
  // ROUTE 4: '/officer' -> Mine Safety Officer Portal (Field Operations & CAPA)
  // =========================================================================
  if (currentPath === '/officer') {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#0A192F] text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0"></div>
            <p className="flex-1 font-medium">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <AuthGuard requiredRole="officer">
          <MineOfficerPortal
            currentUser={currentUser!}
            currentPath="/officer"
            isOnline={isOnline}
            isSyncing={isSyncing}
            pendingSyncCount={pendingSyncCount}
            onToggleNetwork={handleToggleNetwork}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onSwitchPortal={handleSwitchPortal}
            onSignOut={handleSignOut}
            triggerToast={triggerToast}
            onAddOfflineMutation={handleAddOfflineMutation}
            attendanceRoster={attendanceRoster}
          />
        </AuthGuard>
        <SyncQueueModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          isOnline={isOnline}
          isSyncing={isSyncing}
          mutations={mutationQueue}
          onTriggerSync={handleForceSync}
          onClearSynced={handleClearSyncedMutations}
        />
      </>
    );
  }

  // =========================================================================
  // ROUTE 5: '/labour' -> Colliery Labour Mobile App (Mobile Phone Bezel View)
  // =========================================================================
  if (currentPath === '/labour') {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#0A192F] text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-amber-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></div>
            <p className="flex-1 font-medium">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <AuthGuard requiredRole="labour">
          <LabourMobileApp
            currentUser={currentUser!}
            currentPath="/labour"
            isOnline={isOnline}
            isSyncing={isSyncing}
            pendingSyncCount={pendingSyncCount}
            onToggleNetwork={handleToggleNetwork}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onSwitchPortal={handleSwitchPortal}
            onSignOut={handleSignOut}
            triggerToast={triggerToast}
            onAddOfflineMutation={handleAddOfflineMutation}
            onRecordShiftAttendance={handleRecordShiftAttendance}
          />
        </AuthGuard>
        <SyncQueueModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          isOnline={isOnline}
          isSyncing={isSyncing}
          mutations={mutationQueue}
          onTriggerSync={handleForceSync}
          onClearSynced={handleClearSyncedMutations}
        />
      </>
    );
  }

  // =========================================================================
  // ROUTE 4: '/command' -> Directorate General of Mines Surveillance Command
  // (Full Command, Satellite Radar, SCN Issuance, AI Copilot, dark navy/gold)
  // =========================================================================
  return (
    <AuthGuard requiredRole="gov">
      <ErrorBoundary>
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0A192F] text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0"></div>
          <p className="flex-1 font-medium">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DGMS SURVEILLANCE SIDEBAR (Width: 260px, Background: #0A192F)          */}
      {/* ========================================================================= */}
      <aside 
        id="command-sidebar"
        className="w-[260px] bg-[#0A192F] text-white flex flex-col shrink-0 min-h-screen border-r border-slate-800 sticky top-0 h-screen z-30 select-none shadow-xl"
      >
        {/* Branding & Active Role Profile at Top */}
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
                <span className="bg-blue-600/30 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30 font-mono">
                  K-AI
                </span>
              </div>
              <div className="text-[11px] text-slate-400 leading-tight truncate mt-0.5">
                AI Smart Governance
              </div>
            </div>
          </div>

          {/* Active Officer Identity Card */}
          <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="text-[9px] uppercase font-bold text-blue-400 tracking-wider truncate">
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

        {/* Navigation Items (Officer Role-Specific ONLY - No Operator Desk) */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Surveillance Command
          </div>

          {/* 1. Overview & Radar */}
          <button
            id="sidebar-nav-overview"
            onClick={() => setOfficerNav('overview')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              officerNav === 'overview'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${officerNav === 'overview' ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">Overview &amp; Radar</span>
          </button>

          {/* 2. Mine Explorer */}
          <button
            id="sidebar-nav-telemetry"
            onClick={() => setOfficerNav('telemetry')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              officerNav === 'telemetry'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Radio className={`w-4 h-4 ${officerNav === 'telemetry' ? 'text-white' : 'text-cyan-400'}`} />
            <span className="truncate">Virtual Telemetry Center</span>
          </button>

          {/* 3. Mine Explorer */}
          <button
            id="sidebar-nav-explorer"
            onClick={() => setOfficerNav('explorer')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              officerNav === 'explorer'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <MapPin className={`w-4 h-4 ${officerNav === 'explorer' ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">Mine Explorer</span>
          </button>

          {/* 4. Evidence Center */}
          <button
            id="sidebar-nav-evidence"
            onClick={() => setOfficerNav('evidence')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              officerNav === 'evidence'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle className={`w-4 h-4 ${officerNav === 'evidence' ? 'text-white' : 'text-red-400'}`} />
              <span className="truncate">Evidence Center</span>
            </div>
            <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded font-mono animate-pulse shrink-0">
              1 Active
            </span>
          </button>

          {/* 5. Citizen Reports (Field corroboration review) */}
          <button
            id="sidebar-nav-citizen"
            onClick={() => setOfficerNav('citizen')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              officerNav === 'citizen'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Users className={`w-4 h-4 ${officerNav === 'citizen' ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">Citizen Reports</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-900/90 text-blue-200 px-1.5 py-0.5 rounded font-mono border border-blue-700/50 shrink-0">
              43
            </span>
          </button>

          {/* 6. Risk & Prediction (Q4 Forecast) */}
          <button
            id="sidebar-nav-risk"
            onClick={() => setOfficerNav('risk')}
            className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
              officerNav === 'risk'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Activity className={`w-4 h-4 ${officerNav === 'risk' ? 'text-white' : 'text-purple-400'}`} />
              <span className="truncate">Risk &amp; Prediction</span>
            </div>
            <span className="text-[10px] font-bold bg-purple-900/60 text-purple-200 px-1.5 py-0.5 rounded font-mono border border-purple-600/40 shrink-0">
              AI Q4
            </span>
          </button>
        </div>

        {/* Bottom of Sidebar: AI Regulatory Copilot, Telemetry, and Help */}
        <div className="p-3 space-y-2.5 border-t border-slate-800 bg-[#071324] shrink-0">
          <button
            id="btn-sidebar-copilot"
            onClick={() => setIsCopilotOpen(true)}
            className="w-full bg-gradient-to-r from-blue-900/60 to-indigo-950/80 hover:from-blue-800/80 hover:to-indigo-900/95 border border-blue-500/40 text-white rounded-lg p-2.5 flex items-center justify-between shadow-xs transition-all text-xs font-semibold cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#1E40AF] flex items-center justify-center text-blue-200 group-hover:scale-105 transition-transform shadow-2xs">
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-none text-white">AI Regulatory Copilot</div>
                <div className="text-[10px] text-blue-300/80 mt-0.5">MoEFCC &amp; DGMS Rules</div>
              </div>
            </div>
            <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded border border-blue-400/30 font-mono">
              Ask &rarr;
            </span>
          </button>

          {/* Satellite Telemetry Status */}
          <div className="p-2 bg-slate-900/80 rounded-md border border-slate-800/80 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Sentinel-2 Constellation</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold">10m Multispec</span>
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>Next Satellite Overpass:</span>
              <span className="font-mono text-slate-300">T-04:18:22</span>
            </div>
          </div>

          {/* Quick Support & Protocol links */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <button 
              id="btn-sidebar-settings"
              onClick={() => setShowSettingsModal(true)}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Sensors</span>
            </button>
            <button 
              id="btn-sidebar-help"
              onClick={() => setShowHelpModal(true)}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Protocols</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. OFFICER WORKSPACE CONTAINER                                            */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP STATUS & COMMAND HEADER */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shrink-0 shadow-2xs">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            {/* Breadcrumb & Global Header K Emblem */}
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                Surveillance Command
              </span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-xs text-slate-700 truncate hidden md:inline">
                {officerNav === 'overview' && 'Overview & Real-Time Radar'}
                {officerNav === 'telemetry' && 'Virtual Telemetry Center'}
                {officerNav === 'explorer' && 'National Mine Explorer Table'}
                {officerNav === 'evidence' && 'Evidence Chain Investigation (ENV-082)'}
                {officerNav === 'citizen' && 'Citizen Environmental Vigilance Feed'}
                {officerNav === 'risk' && 'Q4 Breach Risk Analytics Forecast'}
              </span>
            </div>

            {/* Officer Header Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-xs shrink-0">
              {/* Satellite Sync Indicator */}
              <div className="hidden xl:flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-slate-600 font-mono text-[11px]">
                  Satellite Sync: <strong className="text-slate-900">Sentinel-2 (T-2h)</strong>
                </span>
              </div>

              {/* Legal Dossier Button */}
              <button
                id="btn-top-view-dossier"
                onClick={() => setShowDossierModal(true)}
                className="hidden md:flex text-xs text-[#1E40AF] hover:bg-blue-50 px-2.5 py-1.5 rounded border border-blue-200 font-semibold items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Legal Dossier</span>
              </button>

              {/* Universal 5-Role Switcher & Offline Simulator */}
              <GlobalHeaderControls
                currentUser={currentUser!}
                currentPath="/command"
                isOnline={isOnline}
                isSyncing={isSyncing}
                pendingSyncCount={pendingSyncCount}
                onToggleNetwork={handleToggleNetwork}
                onOpenSyncModal={() => setIsSyncModalOpen(true)}
                onSwitchPortal={handleSwitchPortal}
                onSignOut={handleSignOut}
                sessionRemainingSeconds={sessionRemainingSeconds}
                theme="light"
              />
            </div>
          </div>
        </header>

        {/* OFFICER MAIN WORKSPACE */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          {/* ===================================================================== */}
          {/* VIEW 1: OVERVIEW & RADAR                                               */}
          {/* ===================================================================== */}
          {officerNav === 'overview' && (
            <div className="space-y-6">
              {/* Telemetry Response Alert Banner */}
              {violationStatus === 'response_submitted_awaiting_verification' && (
                <div className="bg-emerald-50 border-l-4 border-emerald-600 border-y border-r border-emerald-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-800 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-sm">
                        ECL Operator Response Submitted - Awaiting Official Verification
                      </h3>
                      <p className="text-xs text-emerald-800">
                        Technical clarification and DGPS storm-water diversion embankment annexures received for Rajmahal OCP (Notice SCN-2026-082).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInvestigateEvidence()}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    Verify Evidence Chain
                  </button>
                </div>
              )}

              {/* KPI Telemetry Header - Dynamically Computed Across 25 Nationwide Mines */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Total Mines Monitored</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{totalMinesCount} Facilities</div>
                  <div className="text-xs text-slate-500 mt-0.5">7 Coal States &bull; 8 CIL/SCCL Subsidiaries</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Active Workforce</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{totalActiveWorkforce.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {totalPermanentWorkforce.toLocaleString()} Regular &bull; {totalContractualWorkforce.toLocaleString()} Contractual
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Critical Breaches</div>
                  <div className="text-2xl font-bold text-red-600 mt-1 flex items-center gap-2">
                    <span>{criticalBreachesCount} Active</span>
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase">
                      SCN Triggered
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate" title={criticalBreaches.map(m => m.name.split(' ')[0]).join(', ')}>
                    {criticalBreaches.map(m => m.name.split(' ')[0]).join(', ')}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Average Compliance Rating</div>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">{avgComplianceRating}%</div>
                  <div className="text-xs text-emerald-600 mt-0.5">Nationwide Sentinel-2 Real-Time</div>
                </div>
              </div>

              {/* Map Filters & Controls Bar */}
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 mr-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span>Surveillance Filter:</span>
                  </div>

                  {/* State Filter - 7 Indian States */}
                  <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All States">All Coal States (7)</option>
                    <option value="Jharkhand">Jharkhand (5)</option>
                    <option value="Chhattisgarh">Chhattisgarh (5)</option>
                    <option value="Odisha">Odisha (4)</option>
                    <option value="West Bengal">West Bengal (3)</option>
                    <option value="Madhya Pradesh">Madhya Pradesh (3)</option>
                    <option value="Maharashtra">Maharashtra (3)</option>
                    <option value="Telangana">Telangana (2)</option>
                  </select>

                  {/* Subsidiary Filter - 8 Major Coal Subsidiaries */}
                  <select
                    value={filterSubsidiary}
                    onChange={(e) => setFilterSubsidiary(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All Subsidiaries">All Subsidiaries (8)</option>
                    <option value="ECL">ECL (Eastern Coalfields)</option>
                    <option value="BCCL">BCCL (Bharat Coking Coal)</option>
                    <option value="CCL">CCL (Central Coalfields)</option>
                    <option value="SECL">SECL (South Eastern Coalfields)</option>
                    <option value="MCL">MCL (Mahanadi Coalfields)</option>
                    <option value="NCL">NCL (Northern Coalfields)</option>
                    <option value="WCL">WCL (Western Coalfields)</option>
                    <option value="SCCL">SCCL (Singareni Collieries)</option>
                  </select>

                  {/* Risk Filter - Score Thresholds */}
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All Risks">All Compliance Statuses</option>
                    <option value="Critical Only">Critical Breaches (&lt;65%)</option>
                    <option value="Monitor">Needs Monitoring (65-79%)</option>
                    <option value="Compliant">Compliant (&ge;80%)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 hidden sm:inline">Active Telemetry Target:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {selectedMine ? selectedMine.name : 'No Mine Selected'}
                  </span>
                </div>
              </div>

              {/* Leaflet Satellite Map & Slide-out Inspection Drawer */}
              <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-900 h-[640px] min-h-[400px]">
                {isLoading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800 animate-pulse">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-600 border-t-blue-500 animate-spin mb-4"></div>
                    <p className="font-semibold">Syncing Live Geospatial Data from Supabase...</p>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <SurveillanceMap
                      key={`map-${currentPath}`}
                      mines={mines}
                      selectedMine={selectedMine}
                      onSelectMine={handleSelectMine}
                      onInvestigateEvidence={handleInvestigateEvidence}
                      filterState={filterState}
                      filterSubsidiary={filterSubsidiary}
                      filterRisk={filterRisk}
                    />
                  </div>
                )}

                {/* SLIDE-OUT INSPECTION DRAWER */}
                {selectedMine && drawerOpen && (
                  <div className="absolute top-0 right-0 h-full w-80 sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-[1000] flex flex-col justify-between animate-in slide-in-from-right duration-200">
                    <div className="p-4 border-b border-slate-200 bg-[#0A192F] text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                          Mine Surveillance Inspection
                        </span>
                      </div>
                      <button
                        onClick={() => setDrawerOpen(false)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Close Inspector Drawer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 overflow-y-auto space-y-4 text-slate-800">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-slate-400 font-semibold">{selectedMine?.id}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            selectedMine?.status === 'critical' ? 'bg-red-100 text-red-700' :
                            selectedMine?.status === 'monitor' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {selectedMine?.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-950 mt-1">{selectedMine?.name}</h3>
                        <p className="text-xs text-slate-500">{selectedMine?.region}, {selectedMine?.state}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-semibold text-slate-700">DGMS Compliance Score</span>
                          <span className={`font-mono font-bold ${
                            (selectedMine?.complianceScore ?? 0) < 80 ? 'text-red-600' :
                            (selectedMine?.complianceScore ?? 0) < 90 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {selectedMine?.complianceScore ?? 0}/100
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (selectedMine?.complianceScore ?? 0) < 80 ? 'bg-red-600' :
                              (selectedMine?.complianceScore ?? 0) < 90 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${selectedMine?.complianceScore ?? 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">
                          Surveillance Flags &amp; InSAR Telemetry
                        </div>
                        {(selectedMine?.flags?.length || 0) > 0 ? (
                          <div className="space-y-2">
                            {selectedMine?.flags?.map((flag, idx) => (
                              <div key={idx} className="p-2.5 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-bold text-red-950">{flag.title}</div>
                                  <div className="text-slate-600 text-[11px] mt-0.5">{flag.note}</div>
                                </div>
                                <span className="font-mono text-[10px] font-bold bg-red-200/60 text-red-900 px-1.5 py-0.5 rounded">
                                  Sev: {flag.severity}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-xs">
                            No active perimeter or slope violations detected.
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <div className="text-[10px] uppercase text-slate-500 font-semibold">Operator</div>
                          <div className="font-semibold text-slate-800 truncate">{selectedMine?.operator}</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <div className="text-[10px] uppercase text-slate-500 font-semibold">Last Inspection</div>
                          <div className="font-semibold text-slate-800">{selectedMine?.lastInspection}</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <div className="text-[10px] uppercase text-slate-500 font-semibold">Permit Expiry</div>
                          <div className="font-semibold text-slate-800">{selectedMine?.permitExp}</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <div className="text-[10px] uppercase text-slate-500 font-semibold">Citizen Reports</div>
                          <div className="font-semibold text-slate-800">{selectedMine.activeReports} Active</div>
                        </div>
                      </div>

                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                      <button
                        id="btn-open-virtual-view-drawer"
                        onClick={() => setVirtualViewOpen(true)}
                        className="mb-2 w-full border border-cyan-700 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-semibold py-2.5 px-4 rounded-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                      >
                        <Radio className="w-4 h-4" />
                        <span>Virtual View</span>
                      </button>
                      <button
                        id="btn-investigate-evidence-drawer"
                        onClick={() => handleInvestigateEvidence(selectedMine)}
                        className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                      >
                        <span>Investigate Evidence Chain</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                {selectedMine && virtualViewOpen && (
                  <MineVirtualView
                    mine={selectedMine}
                    onClose={() => setVirtualViewOpen(false)}
                  />
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW 2: VIRTUAL TELEMETRY CENTER                                       */}
          {/* ===================================================================== */}
          {officerNav === 'telemetry' && (
            <div className="space-y-4">
              {!selectedMine && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">Select a mine for virtual telemetry</h2>
                  <p className="mt-1 text-xs text-slate-500">Choose a facility to load its offline synthetic trend records.</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {mines.slice(0, 12).map(mine => (
                      <button
                        key={mine.id}
                        onClick={() => handleSelectMine(mine)}
                        className="rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
                      >
                        <div className="text-xs font-bold text-slate-900">{mine.name}</div>
                        <div className="mt-1 text-[10px] text-slate-500">{mine.state} · {mine.subsidiary}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {selectedMine && <MineVirtualView mine={selectedMine} />}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW 3: MINE EXPLORER                                                  */}
          {/* ===================================================================== */}
          {officerNav === 'explorer' && (
            <MineExplorer
              mines={mines}
              onSelectMine={handleSelectMine}
              onInvestigateEvidence={handleInvestigateEvidence}
              onNavigateToOverview={() => setOfficerNav('overview')}
              onCreateMine={role === 'gov' ? handleCreateMine : undefined}
            />
          )}

          {/* ===================================================================== */}
          {/* VIEW 3: EVIDENCE CHAIN INVESTIGATION (ENV-082)                         */}
          {/* ===================================================================== */}
          {officerNav === 'evidence' && (
            <EvidenceChain
              mine={selectedMine || mines[0]}
              violationStatus={violationStatus}
              onIssueShowCauseNotice={handleIssueShowCauseNotice}
              onOpenDossierModal={() => setShowDossierModal(true)}
              onBackToOverview={() => setOfficerNav('overview')}
            />
          )}

          {/* ===================================================================== */}
          {/* VIEW 4: CITIZEN REPORTS (Officer Vigilance Corroboration Review)        */}
          {/* ===================================================================== */}
          {officerNav === 'citizen' && (
            <CitizenVigilance
              mines={mines}
              onNavigateToGovCommand={() => setOfficerNav('overview')}
              onReportSubmittedToast={() => triggerToast('Verified field observation received.')}
            />
          )}

          {/* ===================================================================== */}
          {/* VIEW 5: RISK & PREDICTION                                              */}
          {/* ===================================================================== */}
          {officerNav === 'risk' && (
            <RiskPrediction
              mines={mines}
              onInvestigateEvidence={handleInvestigateEvidence}
            />
          )}
        </main>
      </div>

      {/* AI REGULATORY COPILOT SLIDE-OUT DRAWER */}
      <RegulatoryCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedMine={selectedMine}
        onNavigateToEvidence={() => {
          setOfficerNav('evidence');
          setIsCopilotOpen(false);
        }}
      />

      {/* MODALS (Settings, Help, Legal Dossier) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Settings className="w-5 h-5 text-[#1E40AF]" />
                <span>Surveillance Sensor Configuration</span>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">Satellite Cadence Pipeline</div>
                <div className="text-slate-500">Sentinel-2 constellation automated 5-day cycle. Ground resolution: 10m multispectral.</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">InSAR Surface Displacement Threshold</div>
                <div className="text-slate-500">Sentinel-1 SAR deformation alerts trigger automatically when bench displacement &gt; 2.5 cm/week.</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">Gazetted Lease Boundary Layer</div>
                <div className="text-slate-500">Synchronized with Survey of India &amp; Ministry of Coal cadastre shapefiles.</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  triggerToast('Surveillance telemetry parameters verified & active.');
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 bg-[#1E40AF] hover:bg-blue-800 text-white font-semibold text-xs rounded cursor-pointer"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <HelpCircle className="w-5 h-5 text-[#1E40AF]" />
                <span>Statutory Mining Vigilance Protocols</span>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-950">
                <strong>Standard Operating Procedure for Boundary Breaches:</strong>
                <ol className="list-decimal pl-4 mt-1.5 space-y-1 text-slate-700">
                  <li>Automated satellite multi-temporal delta detects unauthorized excavation (&gt;1.0 Ha).</li>
                  <li>Evidence Dossier generated with Cartosat-3 and Sentinel-2 NDVI overlay.</li>
                  <li>Statutory Show-Cause Notice issued under Regulation 109 of Coal Mines Regulations 2017 with 48-hour deadline.</li>
                  <li>Operator submits DGPS survey and slope explanation via Operator Desk.</li>
                </ol>
              </div>

              <div className="text-slate-500 text-[11px]">
                Direct technical queries to Directorate General of Mines Safety (DGMS), Dhanbad, Jharkhand.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded border border-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statutory SCN Dossier Modal (Printable & Exportable with SHA-256 Signature) */}
      <StatutoryDossierModal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        violationStatus={violationStatus}
        triggerToast={triggerToast}
      />

      {/* REAL-TIME OFFLINE MUTATION DRAWER (Bottom Corner Indicator) */}
      {!isOnline && (
        <button
          id="btn-sync-engine-bottom-corner"
          onClick={() => setIsSyncModalOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-extrabold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border-2 border-slate-900 cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Click to view local offline mutation queue with UUIDs and timestamps"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span>Sync Engine: {mutationQueue.filter(m => m.status === 'pending').length} Mutations Cached</span>
        </button>
      )}

      {/* Offline Sync Queue Inspector Modal */}
      <SyncQueueModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isOnline={isOnline}
        isSyncing={isSyncing}
        mutations={mutationQueue}
        onTriggerSync={handleForceSync}
        onClearSynced={handleClearSyncedMutations}
      />
    </div>
    </ErrorBoundary>
    </AuthGuard>
  );
}
