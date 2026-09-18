import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Briefcase, 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Shield, 
  HardHat, 
  Building2, 
  FileText,
  UserCheck,
  ChevronDown,
  X,
  AlertOctagon,
  Calendar
} from 'lucide-react';
import { WorkforceAttendanceRecord } from '../types';

interface WorkforceAttendanceRosterProps {
  roster: WorkforceAttendanceRecord[];
  onRefreshRoster?: () => void;
  triggerToast: (msg: string) => void;
  roleContext?: 'officer' | 'operator';
}

export default function WorkforceAttendanceRoster({
  roster,
  onRefreshRoster,
  triggerToast,
  roleContext = 'officer'
}: WorkforceAttendanceRosterProps) {
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Permanent' | 'Contractual'>('all');
  const [agencyFilter, setAgencyFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWorker, setSelectedWorker] = useState<WorkforceAttendanceRecord | null>(null);

  // Derive Agencies for dropdown
  const availableAgencies = useMemo(() => {
    const agencies = new Set<string>();
    roster.forEach(r => {
      if (r.contractorAgency) {
        agencies.add(r.contractorAgency);
      }
    });
    return Array.from(agencies);
  }, [roster]);

  // Aggregate Calculations
  // Base fixed numbers from user specification: 412 total, 248 permanent, 164 contractual, 92% index
  // Any dynamically added workers through the Labour App reflect dynamically on top
  const baseTotal = 412;
  const basePermanent = 248;
  const baseContractual = 164;
  
  // Count how many dynamic punches have been added
  const dynamicPunches = useMemo(() => {
    return roster.filter(r => r.date.includes('Today') && (r.checkInTime.includes('Just now') || r.checkInTime.includes(':')));
  }, [roster]);

  // Total count
  const dynamicContractualCount = dynamicPunches.filter(r => r.employmentCategory === 'Contractual').length;
  const dynamicPermanentCount = dynamicPunches.filter(r => r.employmentCategory === 'Permanent').length;

  const totalAttendance = baseTotal + Math.max(0, dynamicPunches.length - 2);
  const permanentCount = basePermanent + Math.max(0, dynamicPermanentCount - 1);
  const contractualCount = baseContractual + Math.max(0, dynamicContractualCount - 1);
  const complianceIndex = 92; // 92% per user specification

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return roster.filter(worker => {
      // Category filter
      if (categoryFilter !== 'all' && worker.employmentCategory !== categoryFilter) {
        return false;
      }
      // Agency filter
      if (agencyFilter !== 'all') {
        if (agencyFilter === 'CIL Roll (Direct)') {
          if (worker.employmentCategory !== 'Permanent') return false;
        } else if (worker.contractorAgency !== agencyFilter) {
          return false;
        }
      }
      // Shift filter
      if (shiftFilter !== 'all' && worker.shift !== shiftFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = worker.workerName.toLowerCase().includes(q);
        const matchId = worker.workerId.toLowerCase().includes(q);
        const matchDesig = worker.designation.toLowerCase().includes(q);
        const matchGate = worker.geofenceGate.toLowerCase().includes(q);
        const matchAgency = worker.contractorAgency?.toLowerCase().includes(q) || false;
        if (!matchName && !matchId && !matchDesig && !matchGate && !matchAgency) {
          return false;
        }
      }
      return true;
    });
  }, [roster, categoryFilter, agencyFilter, shiftFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. WORKFORCE KPI SUMMARY STRIP (Top-Level Metrics Strip)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total On-Shift Attendance */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Total On-Shift Attendance</span>
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                <span>{totalAttendance}</span>
                <span className="text-xs font-semibold text-slate-500">Workers</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift B (Day Pit Ops)</span>
            </span>
            <span className="text-emerald-700 font-bold font-mono">100% Geofenced</span>
          </div>
        </div>

        {/* KPI 2: Permanent Employees */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Permanent Employees</span>
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                <span>{permanentCount}</span>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  CIL Roll
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-sm shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>60.2% of Total Crew</span>
            <span className="text-slate-500 font-medium">Form-A Statutory</span>
          </div>
        </div>

        {/* KPI 3: Contractual Workers */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                <span>Contractual Workers</span>
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                <span>{contractualCount}</span>
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Third-Party Roster
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-sm shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>39.8% of Total Crew</span>
            <span className="text-amber-700 font-bold">4 Certified Agencies</span>
          </div>
        </div>

        {/* KPI 4: Contractor Compliance Index */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contractor Compliance Index</span>
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1 flex items-baseline gap-2">
                <span>{complianceIndex}%</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                  13 Watch Flags
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="text-amber-700 font-medium truncate" title="Flags expired gate passes or overdue safety training">
              8 Pass Expiry &bull; 5 Safety Due
            </span>
            <span className="text-slate-500 font-mono">MVTR 1966</span>
          </div>
        </div>
      </div>

      {/* COMPLIANCE ALERT STRIP */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-start gap-2.5">
          <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-950">Statutory Labour Compliance Advisory (DGMS Form-D &amp; CMR 2017):</span>{' '}
            <span>
              13 third-party contractor personnel currently flagged for upcoming gate pass expirations (Apex Mining: 8, Adhikar Earthmovers: 5) or pending 6-month Vocational Refresher Training.
            </span>
          </div>
        </div>
        <button
          onClick={() => triggerToast('Statutory Contractor Compliance Audit Report generated (PDF).')}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Audit Export</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. ATTENDANCE MONITORING ROSTER (Interactive Table & Filter Toolbar)       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E40AF]" />
                <span>Real-Time Attendance Monitoring Roster</span>
                <span className="text-xs font-normal text-slate-500">
                  ({filteredRoster.length} of {roster.length} visible records)
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Subterranean RFID gate biometric records, mobile geofence punches, and statutory contractor roster reconciliation.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              {onRefreshRoster && (
                <button
                  onClick={onRefreshRoster}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Refresh Live Geofence Feed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              )}
              <button
                onClick={() => triggerToast('Official Form-D Shift Muster Roll exported for DGMS compliance.')}
                className="px-3 py-1.5 bg-[#1E40AF] hover:bg-blue-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Form-D Muster</span>
              </button>
            </div>
          </div>

          {/* Filter Bar: Buttons + Dropdowns + Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {/* Category Segmented Buttons */}
            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`flex-1 py-1.5 px-2 rounded-md font-bold transition-all text-center cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({roster.length})
              </button>
              <button
                onClick={() => setCategoryFilter('Permanent')}
                className={`flex-1 py-1.5 px-2 rounded-md font-bold transition-all text-center cursor-pointer ${
                  categoryFilter === 'Permanent'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Permanent ({roster.filter(r => r.employmentCategory === 'Permanent').length})
              </button>
              <button
                onClick={() => setCategoryFilter('Contractual')}
                className={`flex-1 py-1.5 px-2 rounded-md font-bold transition-all text-center cursor-pointer ${
                  categoryFilter === 'Contractual'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Contractual ({roster.filter(r => r.employmentCategory === 'Contractual').length})
              </button>
            </div>

            {/* Contractor Agency Dropdown */}
            <div className="relative">
              <select
                aria-label="Filter by contractor agency"
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-3 pr-8 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Contractor Agencies</option>
                <option value="CIL Roll (Direct)">Coal India Direct (CIL Roll)</option>
                {availableAgencies.map(agency => (
                  <option key={agency} value={agency}>
                    {agency}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Shift Filter Dropdown */}
            <div className="relative">
              <select
                aria-label="Filter by work shift"
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-3 pr-8 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Shifts (A / B / C)</option>
                <option value="Shift A">Shift A (06:00 - 14:00)</option>
                <option value="Shift B">Shift B (14:00 - 22:00) [Current]</option>
                <option value="Shift C">Shift C (22:00 - 06:00)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, worker ID, gate..."
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px] select-none">
                <th className="py-3 px-3.5">Worker Name &amp; ID</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Contractor Agency</th>
                <th className="py-3 px-2.5 text-center">Shift</th>
                <th className="py-3 px-3">Entry Time</th>
                <th className="py-3 px-3">Geofence Gate Location</th>
                <th className="py-3 px-3">Fitness &amp; Safety Status</th>
                <th className="py-3 px-3 text-center">Sync Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No personnel match current filters</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting the category or agency selection.</p>
                  </td>
                </tr>
              ) : (
                filteredRoster.map((worker) => {
                  const isContractual = worker.employmentCategory === 'Contractual';
                  const isNewlyPunched = worker.checkInTime === 'Just now' || worker.id.includes('LIVE');
                  
                  return (
                    <tr 
                      key={worker.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isNewlyPunched ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Column 1: Worker Name & ID */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isContractual 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          }`}>
                            {worker.avatarInitials || worker.workerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{worker.workerName}</span>
                              {isNewlyPunched && (
                                <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded font-mono uppercase">
                                  Live Punch
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-slate-600 font-semibold">{worker.workerId}</span>
                              <span>&bull;</span>
                              <span className="truncate max-w-[140px]">{worker.designation}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Employment Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isContractual ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                            <Briefcase className="w-3 h-3 text-amber-600" />
                            <span>Contractual</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-300">
                            <Building2 className="w-3 h-3 text-indigo-600" />
                            <span>Permanent (CIL Roll)</span>
                          </span>
                        )}
                      </td>

                      {/* Column 3: Contractor Agency Name */}
                      <td className="py-3 px-3">
                        {isContractual && worker.contractorAgency ? (
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded border border-slate-300 text-[11px] max-w-[180px] truncate" title={worker.contractorAgency}>
                            <HardHat className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{worker.contractorAgency}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            Coal India Direct
                          </span>
                        )}
                      </td>

                      {/* Column 4: Shift */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap">
                        <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono">
                          {worker.shift}
                        </span>
                      </td>

                      {/* Column 5: Entry Timestamp */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{worker.checkInTime}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {worker.date}
                        </div>
                      </td>

                      {/* Column 6: Geofence Gate Location */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-slate-800 text-[11px] font-medium">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate max-w-[160px]" title={worker.geofenceGate}>
                            {worker.geofenceGate}
                          </span>
                        </div>
                        <span className="text-[9px] text-emerald-700 font-mono font-bold block mt-0.5">
                          ✓ Subterranean GPS Lock
                        </span>
                      </td>

                      {/* Column 7: Medical/Safety Fitness Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {worker.fitnessStatus === 'Fit (Form-O Valid)' || worker.fitnessStatus === 'Fit (DGMS Valid)' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{worker.fitnessStatus}</span>
                          </span>
                        ) : worker.fitnessStatus === 'Gate Pass Expiring' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            <span>Pass Expiring (48h)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-900 bg-orange-100 px-2 py-0.5 rounded border border-orange-300">
                            <AlertOctagon className="w-3 h-3 text-orange-700" />
                            <span>Safety Due (MVTR)</span>
                          </span>
                        )}
                      </td>

                      {/* Column 8: Sync Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {worker.syncStatus === 'synced' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Synced</span>
                          </span>
                        ) : (
                          <span 
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-mono"
                            title={`Local UUID: ${worker.localUuid}`}
                          >
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>Pending Sync</span>
                          </span>
                        )}
                      </td>

                      {/* Column 9: Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedWorker(worker)}
                          className="px-2 py-1 text-[11px] font-semibold text-[#1E40AF] hover:bg-blue-50 rounded border border-blue-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Displaying <strong>{filteredRoster.length}</strong> personnel out of <strong>{roster.length}</strong> total muster records.
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>CIL Permanent: <strong>{permanentCount}</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Contractor Roster: <strong>{contractualCount}</strong></span>
            </span>
            <span className="font-mono text-slate-600">
              DGMS Form-D Compliant
            </span>
          </div>
        </div>
      </div>

      {/* WORKER DETAIL MODAL */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-[#0B2545] text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">Personnel Statutory Dossier</div>
                  <div className="text-[10px] text-slate-300">Form-A Service &amp; Form-O Medical Record</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWorker(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-800">
              {/* Profile Bar */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  selectedWorker.employmentCategory === 'Contractual'
                    ? 'bg-amber-100 text-amber-900 border-2 border-amber-300'
                    : 'bg-indigo-100 text-indigo-900 border-2 border-indigo-300'
                }`}>
                  {selectedWorker.avatarInitials || selectedWorker.workerName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedWorker.workerName}</h4>
                  <div className="text-slate-500 font-medium">{selectedWorker.designation}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded">
                      {selectedWorker.workerId}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      selectedWorker.employmentCategory === 'Contractual'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                    }`}>
                      {selectedWorker.employmentCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 uppercase font-bold text-[9px] block">Contractor / Employer</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {selectedWorker.contractorAgency || 'Eastern Coalfields Limited (CIL Roll)'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 uppercase font-bold text-[9px] block">Current Shift &amp; Punch</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {selectedWorker.shift} &bull; {selectedWorker.checkInTime}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 uppercase font-bold text-[9px] block">Geofence Gate Location</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {selectedWorker.geofenceGate}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 uppercase font-bold text-[9px] block">Statutory Fitness Status</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">
                    {selectedWorker.fitnessStatus}
                  </span>
                </div>
              </div>

              {/* Local UUID & Sync Diagnostic */}
              <div className="p-3 bg-slate-900 text-slate-300 rounded-lg font-mono text-[10px] space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[9px]">Cryptographic Record Hash &amp; Sync Diagnostic:</div>
                <div className="text-slate-200">Local UUID: <span className="text-amber-400">{selectedWorker.localUuid}</span></div>
                <div>Status: <span className={selectedWorker.syncStatus === 'synced' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{selectedWorker.syncStatus.toUpperCase()}</span></div>
                <div>Form-D Muster Ledger Ref: <span className="text-blue-300">{selectedWorker.govRecordNumber || 'GOV-MUSTER-2026-RAJMAHAL'}</span></div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  triggerToast(`Form-A Statutory Card generated for ${selectedWorker.workerName}`);
                  setSelectedWorker(null);
                }}
                className="px-3.5 py-1.5 bg-[#1E40AF] hover:bg-blue-800 text-white font-semibold text-xs rounded shadow-xs cursor-pointer"
              >
                Download Form-A Card
              </button>
              <button
                onClick={() => setSelectedWorker(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded cursor-pointer"
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
