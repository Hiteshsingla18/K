import React, { useState } from 'react';
import { 
  Users, 
  AlertTriangle, 
  MapPin, 
  CheckCircle2, 
  Send, 
  Shield, 
  ArrowRight,
  Wind,
  FileText
} from 'lucide-react';
import { MineRecord } from '../types';

interface CitizenVigilanceProps {
  mines: MineRecord[];
  onNavigateToGovCommand: () => void;
  onReportSubmittedToast: () => void;
}

export default function CitizenVigilance({
  mines,
  onNavigateToGovCommand,
  onReportSubmittedToast
}: CitizenVigilanceProps) {
  const [selectedMineId, setSelectedMineId] = useState<string>('MIN-4492-R');
  const [violationCategory, setViolationCategory] = useState<string>('boundary_encroachment');
  const [observationText, setObservationText] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);
  const [generatedRefId, setGeneratedRefId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim()) return;

    const ref = `CIT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedRefId(ref);
    setReportSubmitted(true);
    onReportSubmittedToast();
  };

  return (
    <div className="space-y-6">
      {/* Citizen Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 text-white rounded-xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-300" />
            National Coalfield Transparency & Citizen Oversight
          </span>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
            Citizen Environmental Vigilance Portal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Real-time public transparency for coal mining leases, air quality indexes (AQI), blasting vibration boundaries, and community grievance verification under Ministry of Coal guidelines.
          </p>
        </div>
      </div>

      {/* Grid: Public Transparency Status & Citizen Report Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Public Transparency Feed for Active Mine */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Investigation Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-red-600 tracking-wider">Active Public Investigation</span>
                <h2 className="text-base font-bold text-slate-900">Rajmahal Open Cast Project (Godda, Jharkhand)</h2>
              </div>
              <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded border border-red-200">
                Show-Cause Notice SCN-2026-082 Active
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The Ministry of Coal has flagged an alleged 28-hectare perimeter encroachment beyond the statutory lease line.
              14 citizen reports from Simlong and Taljhari village clusters have been correlated with high-resolution Sentinel satellite optical scans.
            </p>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg text-center">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Ambient PM10</div>
                <div className="text-base font-bold text-amber-600">168 µg/m³</div>
                <div className="text-[10px] text-slate-400">Moderate/Alert</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Verified Reports</div>
                <div className="text-base font-bold text-slate-900">14 Active</div>
                <div className="text-[10px] text-emerald-600">Under Review</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Audit Stage</div>
                <div className="text-base font-bold text-blue-700">Level-2 Audit</div>
                <div className="text-[10px] text-slate-400">DGMS Vigilance</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded p-3 text-xs bg-white">
              <div className="font-semibold text-slate-800 mb-1">Recent Citizen Corroboration Feed:</div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                <li>Report #CR-882: Heavy dust plume drift onto Simlong primary school area (Corroborated by satellite).</li>
                <li>Report #CR-914: Unscheduled evening blast vibration exceeding permissible peak particle velocity (PPV).</li>
                <li>Report #CR-942: Earthmoving bulldozers observed flattening outer ridge trees past milestone 14.</li>
              </ul>
            </div>
          </div>

          {/* Quick Switch CTA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-blue-950 text-xs">Are you an authorized Directorate Inspector?</div>
              <div className="text-[11px] text-blue-800">Switch to the Government Command Center to examine raw satellite telemetry.</div>
            </div>
            <button
              onClick={onNavigateToGovCommand}
              className="bg-[#1E40AF] hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              Go to Command Center
            </button>
          </div>
        </div>

        {/* Right Column: File Geotagged Environmental Report Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>File Geotagged Community Report</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Submissions are verified directly against AI satellite correlation models.
              </p>
            </div>

            {reportSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-center space-y-2.5 my-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-emerald-950 text-sm">Report Successfully Lodged</div>
                <p className="text-xs text-emerald-800">
                  Incident reference <strong className="font-mono">{generatedRefId}</strong> created.
                  Your report has been geotagged to the mine buffer perimeter and queued for Sentinel satellite correlation.
                </p>
                <button
                  onClick={() => {
                    setReportSubmitted(false);
                    setObservationText('');
                  }}
                  className="mt-2 text-xs font-semibold text-emerald-900 underline cursor-pointer"
                >
                  Submit another report
                </button>
              </div>
            ) : (
              <form className="space-y-3.5 text-xs" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Mine / Colliery Name</label>
                  <select 
                    value={selectedMineId}
                    onChange={(e) => setSelectedMineId(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-blue-500"
                  >
                    {mines.map(m => (
                      <option key={m.id} value={m.id}>{m.name} - {m.state}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Violation Category</label>
                  <select 
                    value={violationCategory}
                    onChange={(e) => setViolationCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="boundary_encroachment">Illegal Land Boundary Encroachment</option>
                    <option value="dust_air_pollution">Heavy Dust / PM10 Air Pollution Drift</option>
                    <option value="blasting_vibration">Excessive Nocturnal Blasting & Vibration</option>
                    <option value="water_contamination">Slurry Runoff in Village Water Stream</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Specific Field Observations</label>
                  <textarea
                    required
                    rows={4}
                    value={observationText}
                    onChange={(e) => setObservationText(e.target.value)}
                    placeholder="Describe time of occurrence, proximity to village landmark, tree clearing, or dust intensity..."
                    className="w-full border border-slate-300 rounded p-2.5 text-xs bg-white text-slate-800 outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>Simulated GPS Geotag: 25.021°N, 87.398°E</span>
                  </div>
                  <p>Your coordinates assist KhananRakshak AI in pinpointing distance from the legal boundary.</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Verified Citizen Report</span>
                </button>
              </form>
            )}
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-3 border-t border-slate-100">
            Protected under National Environmental Transparency Framework 2026.
          </div>
        </div>
      </div>
    </div>
  );
}
