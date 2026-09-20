import React, { useState, useRef, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ChevronDown, 
  Shield, 
  Building2, 
  HardHat, 
  Smartphone, 
  Users, 
  LogOut, 
  Layers,
  Database,
  ArrowRight,
  Sparkles,
  Radio
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';

interface GlobalHeaderControlsProps {
  currentUser: AuthUser;
  currentPath: string;
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  onToggleNetwork: () => void;
  onOpenSyncModal: () => void;
  onSwitchPortal: (targetRole: UserRole, targetRoute: string) => void;
  onSignOut: () => void;
  theme?: 'dark' | 'light';
  sessionRemainingSeconds?: number | null;
}

export default function GlobalHeaderControls({
  currentUser,
  currentPath,
  isOnline,
  isSyncing,
  pendingSyncCount,
  onToggleNetwork,
  onOpenSyncModal,
  onSwitchPortal,
  onSignOut,
  theme = 'light',
  sessionRemainingSeconds = null
}: GlobalHeaderControlsProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const portals = [
    {
      role: 'gov' as UserRole,
      route: '/command',
      title: 'Directorate Surveillance Official',
      subtitle: 'DGMS / Ministry of Coal Command',
      icon: Shield,
      accent: 'text-blue-500',
      badge: 'Tier-1'
    },
    {
      role: 'operator' as UserRole,
      route: '/operator',
      title: 'Colliery Lease Operator',
      subtitle: 'ECL Corporate Compliance Desk',
      icon: Building2,
      accent: 'text-amber-500',
      badge: 'SCN Desk'
    },
    {
      role: 'officer' as UserRole,
      route: '/officer',
      title: 'Mine Safety Officer',
      subtitle: 'Rajmahal Field Operations & CAPA',
      icon: HardHat,
      accent: 'text-orange-500',
      badge: 'CCTV & PPE'
    },
    {
      role: 'labour' as UserRole,
      route: '/labour',
      title: 'Colliery Labour / Worker App',
      subtitle: 'Multilingual Mobile App & Shift Check-In',
      icon: Smartphone,
      accent: 'text-emerald-500',
      badge: 'Mobile Sim'
    },
    {
      role: 'citizen' as UserRole,
      route: '/citizen',
      title: 'Citizen Public Vigilance',
      subtitle: 'Khanan Prahari Geotagged Grievance',
      icon: Users,
      accent: 'text-teal-500',
      badge: 'Public'
    }
  ];

  const isDark = theme === 'dark';
  const sessionMinutes = sessionRemainingSeconds === null ? null : Math.floor(sessionRemainingSeconds / 60);
  const sessionSeconds = sessionRemainingSeconds === null ? null : sessionRemainingSeconds % 60;
  const sessionWarning = sessionRemainingSeconds !== null && sessionRemainingSeconds <= 120;

  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      {/* 1. GLOBAL OFFLINE-FIRST SIMULATION TOGGLE */}
      <div 
        className={`flex items-center rounded-lg p-1 border transition-all text-xs ${
          isDark 
            ? 'bg-slate-900/90 border-slate-700' 
            : 'bg-white border-slate-300 shadow-2xs'
        }`}
      >
        <button
          type="button"
          onClick={onToggleNetwork}
          title={isOnline ? 'Click to simulate Subterranean Offline Mode' : 'Click to reconnect Central Cloud'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-500 text-slate-950 font-bold shadow-xs hover:bg-amber-400'
          }`}
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          ) : isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-slate-950" />
          )}

          <span className="hidden sm:inline">Network:</span>
          <span>{isOnline ? 'Online' : 'Offline Sim'}</span>
        </button>

        {/* Sync Queue Inspector Button */}
        <button
          type="button"
          onClick={onOpenSyncModal}
          className={`ml-1 px-2 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
            pendingSyncCount > 0
              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 animate-pulse'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Inspect Local Mutation Queue"
        >
          <Database className="w-3 h-3" />
          {pendingSyncCount > 0 ? (
            <span>⏳ {pendingSyncCount} Queued</span>
          ) : (
            <span className="hidden md:inline text-[10px]">Queue (0)</span>
          )}
        </button>
      </div>

      {/* 1.5. ACTIVE USER IDENTITY BADGE */}
      <div className={`hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg border text-left ${
        isDark 
          ? 'bg-slate-800/80 border-slate-700' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm ${
          currentUser.role === 'gov' ? 'bg-[#1E40AF]' :
          currentUser.role === 'operator' ? 'bg-amber-600' :
          currentUser.role === 'officer' ? 'bg-orange-600' :
          currentUser.role === 'labour' ? 'bg-emerald-600' : 'bg-teal-600'
        }`}>
          {currentUser.avatarInitials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`font-bold text-[11px] leading-none truncate max-w-[130px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {currentUser.name}
          </span>
          <span className={`text-[9px] leading-tight truncate max-w-[130px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {currentUser.designation}
          </span>
        </div>
      </div>

      {sessionRemainingSeconds !== null && (
        <div
          className={`hidden md:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-bold ${
            sessionWarning
              ? 'border-red-300 bg-red-50 text-red-700 animate-pulse'
              : isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200'
                : 'border-slate-300 bg-white text-slate-700'
          }`}
          title="Automatic Supabase session expiry countdown"
          aria-label={`Session expires in ${sessionMinutes} minutes and ${sessionSeconds} seconds`}
        >
          <span className="text-[10px] font-sans font-semibold text-slate-400">Session</span>
          <span>{String(sessionMinutes).padStart(2, '0')}:{String(sessionSeconds).padStart(2, '0')}</span>
        </div>
      )}

      {/* 2. UNIVERSAL 5-PORTAL ROLE SWITCHER DROPDOWN */}
      <div className="relative" ref={dropdownRef}>
        <button
          id="btn-universal-role-switcher"
          type="button"
          onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'bg-[#1E3A2F] hover:bg-[#162B22] text-white border-[#152D22]'
              : 'bg-white hover:bg-[#FAF8F4] text-[#1A2810] border-[#DDD8CF] shadow-sm'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-[#1B7A46] animate-pulse" />
          <span className={`hidden md:inline text-[11px] ${isDark ? 'text-[#A8C4B0]' : 'text-[#5C6B57]'}`}>Portal:</span>
          <span className="font-bold truncate max-w-[120px] sm:max-w-[180px]">
            {currentUser.role === 'gov' && 'DGMS Surveillance'}
            {currentUser.role === 'operator' && 'Colliery Operator'}
            {currentUser.role === 'officer' && 'Mine Safety Officer'}
            {currentUser.role === 'labour' && 'Labour Mobile App'}
            {currentUser.role === 'citizen' && 'Citizen Vigilance'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDark ? 'text-[#7DAA8C]' : 'text-[#5C6B57]'} ${roleDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {roleDropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-[#DDD8CF] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="px-3.5 py-2 border-b border-[#EDE9E2] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1A2810] block text-xs">Switch Operational Portal</span>
                <span className="text-[10px] text-[#5C6B57]">SIH 5-Tier Unified Architecture</span>
              </div>
              <span className="text-[10px] bg-[#E6F2EC] text-[#2A5C45] font-bold px-1.5 py-0.5 rounded border border-[#B5D4C5]">
                Single Sign-On
              </span>
            </div>

            <div className="p-1 space-y-0.5">
              {portals.map((p) => {
                const Icon = p.icon;
                const isActive = currentPath === p.route;
                return (
                  <button
                    key={p.route}
                    onClick={() => {
                      onSwitchPortal(p.role, p.route);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#E6F2EC] text-[#1E3A2F] font-bold' 
                        : 'hover:bg-[#FAF8F4] text-[#1A2810]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#2A5C45] text-white shadow-sm' : 'bg-[#FAF8F4] text-[#5C6B57]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate text-[#1A2810]">{p.title}</span>
                        <span className="text-[9px] uppercase font-bold text-[#5C6B57] bg-[#EDE9E2] px-1 py-0.5 rounded">
                          {p.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8FA08A] block truncate">{p.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1 mt-1 border-t border-[#EDE9E2] px-2">
              <button
                onClick={() => {
                  onSignOut();
                  setRoleDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-[#9B2335] hover:bg-[#FEF0F2] flex items-center gap-2 transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Return to MeriPehchaan Auth Gateway</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. SIGN OUT ICON BUTTON */}
      <button
        onClick={onSignOut}
        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
          isDark 
            ? 'border-[#152D22] hover:bg-[#162B22] text-[#A8C4B0] hover:text-white' 
            : 'border-[#DDD8CF] hover:bg-[#FAF8F4] text-[#5C6B57] hover:text-[#1A2810]'
        }`}
        title="Sign Out / Back to Auth Gateway"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
