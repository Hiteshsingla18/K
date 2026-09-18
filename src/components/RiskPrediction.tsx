import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Brain, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Activity, 
  Sliders, 
  FileSpreadsheet,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import { MineRecord } from '../types';

interface RiskPredictionProps {
  mines: MineRecord[];
  onInvestigateEvidence: (mine: MineRecord) => void;
}

export default function RiskPrediction({ mines, onInvestigateEvidence }: RiskPredictionProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<'Q4-2026' | 'Q1-2027'>('Q4-2026');
  const [thresholdLevel, setThresholdLevel] = useState<number>(75);

  const forecastData = [
    {
      id: 'MIN-4492-R',
      mineName: 'Rajmahal Open Cast Project',
      operator: 'Eastern Coalfields Limited (ECL)',
      state: 'Jharkhand',
      riskScore: 94,
      riskTier: 'Immediate Danger (Active)',
      primaryThreat: 'Statutory Lease Line Breach (+28 Ha)',
      projectedDisplacement: '+42 Ha by Nov 2026 without intervention',
      confidence: 96.8,
      keyDriver: 'High production run-rate (114% of annual quota) pushing shovel capacity into eastern reserve buffer.',
      status: 'critical'
    },
    {
      id: 'MIN-5521-R',
      mineName: 'Raniganj Deep Coalfield (Sripur)',
      operator: 'Eastern Coalfields Limited (ECL)',
      state: 'West Bengal',
      riskScore: 82,
      riskTier: 'High Predictive Likelihood',
      primaryThreat: 'InSAR Overburden Slope Displacement (3.2cm/wk)',
      projectedDisplacement: 'Potential rockfall risk along pit perimeter during pre-monsoon squalls',
      confidence: 89.2,
      keyDriver: 'Continuous steepening of western dump bench combined with localized water accumulation.',
      status: 'critical'
    },
    {
      id: 'MIN-8834-K',
      mineName: 'Korba Open Cast Mine (Gevra)',
      operator: 'South Eastern Coalfields Limited (SECL)',
      state: 'Chhattisgarh',
      riskScore: 68,
      riskTier: 'Elevated Environmental Risk',
      primaryThreat: 'Haul Road PM10 Plume Spikes (>350 µg/m³)',
      projectedDisplacement: 'Projected 4-fold increase in village dust complaints by dry winter season',
      confidence: 84.5,
      keyDriver: 'Insufficient mist cannon coverage during nocturnal heavy dumper shifts.',
      status: 'monitor'
    },
    {
      id: 'MIN-6284-S',
      mineName: 'Singrauli Coal Basin (Jayant)',
      operator: 'Northern Coalfields Limited (NCL)',
      state: 'Madhya Pradesh',
      riskScore: 61,
      riskTier: 'Moderate Caution',
      primaryThreat: 'Water Inundation Runoff towards Rihand Reservoir',
      projectedDisplacement: 'Marginal boundary expansion near northern silt trap',
      confidence: 78.9,
      keyDriver: 'Silt basin storage capacity operating at 88% threshold.',
      status: 'monitor'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Risk Forecast Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-purple-600" />
                AI Predictive Geospatial Model
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-mono">Ensemble Random Forest + InSAR Velocimetry</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
              Q4 2026 Coalfield Breach Risk &amp; Encroachment Analytics Forecast
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Predictive risk simulation correlating Sentinel-1 SAR deformation velocities, historical boundary clearances, satellite biomass degradation, and real-time production quotas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs">
              <button
                onClick={() => setSelectedQuarter('Q4-2026')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  selectedQuarter === 'Q4-2026' ? 'bg-[#0A192F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Q4 2026 (Immediate)
              </button>
              <button
                onClick={() => setSelectedQuarter('Q1-2027')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  selectedQuarter === 'Q1-2027' ? 'bg-[#0A192F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Q1 2027 (Outlook)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Model Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-500">Predicted High-Risk Blocks</div>
          <div className="text-2xl font-bold text-red-600 mt-1 flex items-center gap-2">
            <span>2 Colleries</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Risk &gt; 80%</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Preemptive audit required</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-500">Model Predictive Accuracy</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">94.3%</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Validated against 2024-2025 ground surveys</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-500">Early Warning Trigger Lead Time</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">38 Days</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Before permanent forest biomass loss</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-500">Preemptive Notices Dispatched</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">1 Dispatched</div>
          <div className="text-[11px] text-slate-500 mt-0.5">SCN-2026-082 (Rajmahal OCP)</div>
        </div>
      </div>

      {/* Forecast Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">National Priority Risk Matrix ({selectedQuarter})</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Ranked by Composite Threat Score</span>
        </div>

        <div className="divide-y divide-slate-100">
          {forecastData.map((item) => (
            <div key={item.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{item.id}</span>
                    <span className="font-bold text-slate-900 text-sm">{item.mineName}</span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs text-slate-600">{item.operator} ({item.state})</span>
                  </div>
                  <div className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>{item.primaryThreat}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Predictive Risk Score</div>
                    <div className="text-lg font-black font-mono text-red-600">{item.riskScore} / 100</div>
                  </div>

                  {item.id === 'MIN-4492-R' ? (
                    <button
                      onClick={() => {
                        const targetMine = mines.find(m => m.id === item.id) || mines[0];
                        onInvestigateEvidence(targetMine);
                      }}
                      className="px-3.5 py-1.5 bg-[#1E40AF] hover:bg-blue-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>Investigate Evidence</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-xs font-semibold cursor-not-allowed"
                    >
                      Continuous Telemetry Active
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs bg-slate-50/70 p-3 rounded-md border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">AI Root Cause Driver:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{item.keyDriver}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Quarterly Projection:</span>
                  <p className="text-slate-700 mt-0.5 font-medium">{item.projectedDisplacement}</p>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">Model Confidence: {item.confidence}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
