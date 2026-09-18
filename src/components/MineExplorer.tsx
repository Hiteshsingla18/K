import React, { useState, useMemo } from 'react';
import { MineRecord } from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  MapPin,
  ChevronUp,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  Users
} from 'lucide-react';

interface MineExplorerProps {
  mines: MineRecord[];
  onSelectMine: (mine: MineRecord) => void;
  onInvestigateEvidence: (mine: MineRecord) => void;
  onNavigateToOverview: () => void;
}

export default function MineExplorer({
  mines,
  onSelectMine,
  onInvestigateEvidence,
  onNavigateToOverview
}: MineExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedSubsidiary, setSelectedSubsidiary] = useState('All Subsidiaries');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortField, setSortField] = useState<keyof MineRecord>('complianceScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and sort mines
  const filteredMines = useMemo(() => {
    return mines
      .filter(mine => {
        const matchesSearch = 
          mine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mine.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mine.subsidiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mine.coalfield.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mine.basin.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesState = selectedState === 'All States' || mine.state === selectedState;
        const matchesSubsidiary = selectedSubsidiary === 'All Subsidiaries' || mine.subsidiary === selectedSubsidiary;
        
        let matchesStatus = true;
        if (selectedStatus === 'critical') matchesStatus = mine.complianceScore < 65 || mine.status === 'critical';
        else if (selectedStatus === 'monitor') matchesStatus = mine.complianceScore >= 65 && mine.complianceScore < 80;
        else if (selectedStatus === 'compliant') matchesStatus = mine.complianceScore >= 80;

        return matchesSearch && matchesState && matchesSubsidiary && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc' 
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [mines, searchTerm, selectedState, selectedSubsidiary, selectedStatus, sortField, sortDirection]);

  const handleSort = (field: keyof MineRecord) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Subsidiary', 'Operator', 'State', 'Basin', 'Status', 'Compliance Score', 'Total Workforce', 'Permanent', 'Contractual', 'Capacity MTPA'];
    const rows = filteredMines.map(m => [
      m.id,
      `"${m.name}"`,
      m.subsidiary,
      `"${m.operator}"`,
      m.state,
      `"${m.basin}"`,
      m.status,
      m.complianceScore,
      m.workforceSplit?.total || m.activeWorkforce || 0,
      m.workforceSplit?.permanent || 0,
      m.workforceSplit?.contractual || 0,
      m.productionCapacityMTPA
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `National_25_Mine_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Explorer Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>DGMS National Coal Portal</span>
            <span>&bull;</span>
            <span className="text-blue-700 font-semibold">Comprehensive Geospatial Registry</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">National 25-Mine Coalfield Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance surveillance, workforce strength, and satellite audit tracking across India's 7 major coal-producing states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Registry (.CSV)</span>
          </button>
          <button
            onClick={onNavigateToOverview}
            className="px-3.5 py-2 bg-[#0A192F] hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Nationwide Map</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search mine, ID, subsidiary, basin..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Filter:</span>
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-hidden font-medium"
          >
            <option value="All States">All States (7)</option>
            <option value="Jharkhand">Jharkhand (5)</option>
            <option value="Chhattisgarh">Chhattisgarh (5)</option>
            <option value="Odisha">Odisha (4)</option>
            <option value="West Bengal">West Bengal (3)</option>
            <option value="Madhya Pradesh">Madhya Pradesh (3)</option>
            <option value="Maharashtra">Maharashtra (3)</option>
            <option value="Telangana">Telangana (2)</option>
          </select>

          <select
            value={selectedSubsidiary}
            onChange={(e) => setSelectedSubsidiary(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-hidden font-medium"
          >
            <option value="All Subsidiaries">All Subsidiaries (8)</option>
            <option value="ECL">ECL</option>
            <option value="BCCL">BCCL</option>
            <option value="CCL">CCL</option>
            <option value="SECL">SECL</option>
            <option value="MCL">MCL</option>
            <option value="NCL">NCL</option>
            <option value="WCL">WCL</option>
            <option value="SCCL">SCCL</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-hidden font-medium"
          >
            <option value="All Statuses">All Risk Tiers</option>
            <option value="critical">Critical Breach (&lt;65%)</option>
            <option value="monitor">Needs Monitoring (65-79%)</option>
            <option value="compliant">Compliant (&ge;80%)</option>
          </select>

          <span className="text-xs text-slate-500 font-mono ml-auto md:ml-2">
            Showing <strong className="text-slate-800">{filteredMines.length}</strong> of {mines.length}
          </span>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1">
                    <span>Mine ID</span>
                    {sortField === 'id' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Colliery &amp; Subsidiary</span>
                    {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4">Basin &amp; State</th>
                <th className="py-3 px-4">Workforce Strength</th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('complianceScore')}>
                  <div className="flex items-center gap-1">
                    <span>Compliance</span>
                    {sortField === 'complianceScore' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMines.map((mine) => {
                const isCritical = mine.complianceScore < 65 || mine.status === 'critical';
                const isMonitor = !isCritical && mine.complianceScore >= 65 && mine.complianceScore < 80;
                const totalWorkforce = mine.workforceSplit?.total || mine.activeWorkforce || 0;

                return (
                  <tr 
                    key={mine.id}
                    className={`hover:bg-slate-50/80 transition-colors ${isCritical ? 'bg-red-50/25' : ''}`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {mine.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{mine.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {mine.subsidiary}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <span>{mine.coalfield}</span>
                        {mine.unauthorizedAreaHa && (
                          <span className="text-red-700 bg-red-100 font-semibold px-1.5 py-0.2 rounded text-[10px]">
                            +{mine.unauthorizedAreaHa} Ha Encroachment
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{mine.basin}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{mine.region}, {mine.state}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{totalWorkforce.toLocaleString()} On-Duty</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {mine.workforceSplit?.permanent || 0} Reg / {mine.workforceSplit?.contractual || 0} Cont
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isCritical ? 'bg-red-50 text-red-700 border-red-200' :
                        isMonitor ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isCritical ? 'bg-red-600 animate-pulse' :
                          isMonitor ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}></span>
                        {isCritical ? 'Critical Breach' : isMonitor ? 'Needs Monitor' : 'Compliant'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              mine.complianceScore < 65 ? 'bg-red-600' :
                              mine.complianceScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${mine.complianceScore}%` }}
                          />
                        </div>
                        <span className={`font-mono font-bold ${
                          mine.complianceScore < 65 ? 'text-red-600' :
                          mine.complianceScore < 80 ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {mine.complianceScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onSelectMine(mine);
                            onNavigateToOverview();
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="View on Map"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Map</span>
                        </button>
                        {isCritical ? (
                          <button
                            onClick={() => onInvestigateEvidence(mine)}
                            className="px-3 py-1 bg-[#1E40AF] hover:bg-blue-800 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <span>Investigate</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectMine(mine)}
                            className="px-2.5 py-1 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Audit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
