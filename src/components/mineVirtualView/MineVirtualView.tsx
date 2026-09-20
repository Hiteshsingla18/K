import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, Factory, MapPin, Pause, Play, Radio,
  Shield, Thermometer, TrendingUp, Wind, X
} from 'lucide-react';
import type { MineRecord } from '../../types';
import { ensureSyntheticTelemetry, type MineTelemetryRow } from '../../data/mineTelemetry';
import { calculateProductionForecast } from '../../services/productionForecast';

type RingId = 'area' | 'environment' | 'production' | 'forecast' | 'pollution';
type RingConfig = { label: string; color: string; radius: number };

const RINGS: Record<RingId, RingConfig> = {
  area: { label: 'Area Coverage', color: '#f59e0b', radius: 48 },
  environment: { label: 'Environmental / Temperature', color: '#22d3ee', radius: 72 },
  production: { label: 'Production (Current)', color: '#3b82f6', radius: 96 },
  forecast: { label: 'Projected Year-End Production', color: '#a78bfa', radius: 120 },
  pollution: { label: 'Ring 5: Emissions & CAAQMS', color: '#f43f5e', radius: 144 }
};

const RING_ORDER = Object.keys(RINGS) as RingId[];
const circumference = (radius: number) => 2 * Math.PI * radius;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function GenericGraph({ values, color, title, legendLabel, limitValue }: { values: number[]; color: string; title?: string; legendLabel: string; limitValue?: number }) {
  const width = 320;
  const height = 140;
  const paddingX = 10;
  const paddingY = 25;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;
  
  const minV = Math.min(...values);
  const maxV = Math.max(...values, limitValue || minV);
  const range = maxV - minV || 1;
  const yMin = Math.max(0, minV - range * 0.2);
  const yMax = maxV + range * 0.2;
  const yRange = yMax - yMin;
  
  const points = values.map((val, i) => {
    const x = paddingX + (i / (values.length - 1)) * graphWidth;
    const y = height - paddingY - ((val - yMin) / yRange) * graphHeight;
    return `${x},${y}`;
  }).join(' ');

  const limitY = limitValue ? height - paddingY - ((limitValue - yMin) / yRange) * graphHeight : null;

  return (
    <div className="mt-4 rounded border border-[#F4F1EB]/20 bg-[#F4F1EB]/5 p-3">
      <div className="mb-4 flex items-start justify-between">
        <h4 className="w-2/3 text-[10px] font-bold leading-tight text-[#F4F1EB]">
          {title || "90-Day Trend History"}
        </h4>
        <div className="flex flex-col items-end gap-1 text-[8px] font-bold uppercase tracking-wider text-[#A8C4B0]">
           <span className="rounded bg-[#1A2810] px-1.5 py-0.5 text-center">Telemetry</span>
           <div className="mt-1 flex items-center gap-2">
             <span className="flex items-center gap-1"><span className="h-0.5 w-2" style={{ backgroundColor: color }}></span> {legendLabel}</span>
           </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {limitY && (
          <>
            <line x1={paddingX} y1={limitY} x2={width - paddingX} y2={limitY} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
            <text x={width - paddingX + 2} y={limitY + 2} fontSize="5" fill="#ef4444" opacity="0.8">{Math.round(limitValue!)}</text>
            <text x={width - paddingX + 2} y={limitY + 8} fontSize="5" fill="#ef4444" opacity="0.8">Target</text>
          </>
        )}
 
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        
        <text x={paddingX} y={height - 5} fontSize="6" fill="#A8C4B0">T-90d</text>
        <text x={width / 2} y={height - 5} fontSize="6" fill="#A8C4B0" textAnchor="middle">T-45d</text>
        <text x={width - paddingX} y={height - 5} fontSize="6" fill="#A8C4B0" textAnchor="end">Today</text>
      </svg>
    </div>
  );
}

function PollutionGraph({ rows }: { rows: MineTelemetryRow[] }) {
  const width = 320;
  const height = 140;
  const paddingX = 10;
  const paddingY = 25;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;
  
  const maxY = 200;
  
  const pointsPM10 = rows.map((row, i) => {
    const x = paddingX + (i / (rows.length - 1)) * graphWidth;
    const y = height - paddingY - (Math.min(row.dustPpm, maxY) / maxY) * graphHeight;
    return `${x},${y}`;
  }).join(' ');

  const pointsPM25 = rows.map((row, i) => {
    const pm25 = row.dustPpm * 0.45;
    const x = paddingX + (i / (rows.length - 1)) * graphWidth;
    const y = height - paddingY - (Math.min(pm25, maxY) / maxY) * graphHeight;
    return `${x},${y}`;
  }).join(' ');

  const limit100Y = height - paddingY - (100 / maxY) * graphHeight;
  const limit60Y = height - paddingY - (60 / maxY) * graphHeight;

  return (
    <div className="mt-4 rounded border border-[#F4F1EB]/20 bg-[#F4F1EB]/5 p-3">
      <div className="mb-4 flex items-start justify-between">
        <h4 className="w-2/3 text-[10px] font-bold leading-tight text-[#F4F1EB]">
          90-Day Ambient Particulate History vs National Air Quality Standards
        </h4>
        <div className="flex flex-col items-end gap-1 text-[8px] font-bold uppercase tracking-wider text-[#A8C4B0]">
           <span className="rounded bg-[#1A2810] px-1.5 py-0.5 text-center">CAAQMS<br/>Telemetry</span>
           <div className="mt-1 flex items-center gap-2">
             <span className="flex items-center gap-1"><span className="h-0.5 w-2 bg-[#f43f5e]"></span> PM10</span>
             <span className="flex items-center gap-1"><span className="h-0.5 w-2 bg-[#eab308]"></span> PM2.5</span>
           </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Background grid lines */}
        <line x1={paddingX} y1={limit100Y} x2={width - paddingX} y2={limit100Y} stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
        <text x={width - paddingX + 2} y={limit100Y + 2} fontSize="5" fill="#f43f5e" opacity="0.8">100/60</text>
        <text x={width - paddingX + 2} y={limit100Y + 8} fontSize="5" fill="#f43f5e" opacity="0.8">Limits</text>
        
        <line x1={paddingX} y1={limit60Y} x2={width - paddingX} y2={limit60Y} stroke="#eab308" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
 
        {/* Data Lines */}
        <polyline points={pointsPM25} fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinejoin="round" />
        <polyline points={pointsPM10} fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinejoin="round" />
        
        {/* X Axis labels */}
        <text x={paddingX} y={height - 5} fontSize="6" fill="#A8C4B0">06-22 (T-90d)</text>
        <text x={width / 2} y={height - 5} fontSize="6" fill="#A8C4B0" textAnchor="middle">08-05 (T-45d)</text>
        <text x={width - paddingX} y={height - 5} fontSize="6" fill="#A8C4B0" textAnchor="end">09-18 (Today)</text>
      </svg>
    </div>
  )
}

function RingDetail({
  ring, rows, mine, forecast
}: {
  ring: RingId;
  rows: MineTelemetryRow[];
  mine: MineRecord;
  forecast: ReturnType<typeof calculateProductionForecast>;
}) {
  const latest = rows[rows.length - 1];
  const values = ring === 'area'
    ? rows.map(row => row.environment)
    : rows.map(row => row[ring]);
  const config = RINGS[ring];
  const areaCurrent = 1150 + (latest?.environment ?? 0) * 3;
  const pollutionBand = (latest?.pollution ?? 0) > 75 ? 'Critical' : (latest?.pollution ?? 0) > 55 ? 'Poor' : (latest?.pollution ?? 0) > 35 ? 'Moderate' : 'Safe';
  const summary = {
    area: [`Approved: 1,250 Ha`, `Current Footprint: ${Math.round(areaCurrent)} Ha`],
    environment: [`Zone A: ${Math.round(27 + (latest?.environment ?? 0) / 10)}°C`, `Humidity: ${Math.round(58 + (latest?.environment ?? 0) / 5)}%`],
    production: [`Current: ${forecast.currentMonthlyTons.toLocaleString()} tons/month`, `Target: ${forecast.targetYearEndTons.toLocaleString()} tons/year`],
    forecast: [`Projected EOY: ${forecast.projectedYearEndTons.toLocaleString()} tons`, `${forecast.variancePercent >= 0 ? '▲' : '▼'} ${Math.abs(forecast.variancePercent).toFixed(1)}% vs target`],
    pollution: [`Composite index: ${Math.round(latest?.pollution ?? 0)}`, `Band: ${pollutionBand}`]
  }[ring];

  return (
    <aside className="border-l border-[#F4F1EB]/20 bg-[#1E3A2F] p-5 lg:w-[360px]" aria-label={`${config.label} details`}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold" style={{ color: config.color }}>
            <span className="h-4 w-1 rounded-full" style={{ backgroundColor: config.color }} />
            {ring === 'pollution' ? 'Ring 5: Emissions & CAAQMS Air Quality Telemetry' : config.label}
          </div>
          <div className="text-[10px] text-[#A8C4B0]">
            {ring === 'pollution' ? 'Continuous particulate matter, gaseous dispersion & acoustic noise contours' : 'Synthetic telemetry · last 30 days'}
          </div>
        </div>
        {ring === 'pollution' && (
          <div className="rounded-full px-2 py-1 text-[9px] font-bold uppercase text-rose-300 border border-rose-900 bg-rose-950/50">
            NAAQS PM10 EXCEEDANCE
          </div>
        )}
        {ring !== 'pollution' && (
          <div className="rounded-full px-2 py-1 text-[9px] font-bold uppercase" style={{ color: config.color, backgroundColor: `${config.color}22` }}>Detail</div>
        )}
      </div>

      {ring === 'pollution' ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded border border-[#F4F1EB]/20 bg-[#F4F1EB]/5 p-2">
              <div className="text-[10px] text-[#A8C4B0] mb-1">Ambient PM10 (24-hr)</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#f43f5e]">{Math.round(latest?.dustPpm ?? 0)}</span>
                <span className="text-[10px] text-[#A8C4B0]">µg/m³</span>
              </div>
              <div className="text-[8px] text-[#A8C4B0] mt-1">NAAQS Cap: 100 µg/m³</div>
            </div>
            <div className="rounded border border-[#F4F1EB]/20 bg-[#F4F1EB]/5 p-2">
              <div className="text-[10px] text-[#A8C4B0] mb-1">Fine Dust PM2.5</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#eab308]">{Math.round((latest?.dustPpm ?? 0) * 0.45)}</span>
                <span className="text-[10px] text-[#A8C4B0]">µg/m³</span>
              </div>
              <div className="text-[8px] text-[#A8C4B0] mt-1">NAAQS Cap: 60 µg/m³</div>
            </div>
            <div className="rounded border border-[#F4F1EB]/20 bg-[#F4F1EB]/5 p-2">
              <div className="text-[10px] text-[#A8C4B0] mb-1">Gaseous SO2 / NOx</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-[#F4F1EB]">{Math.round((latest?.pollution ?? 0) * 0.5)}</span> <span className="text-[10px] text-[#A8C4B0] mr-1">SO2</span>
                <span className="text-[#A8C4B0]">/</span>
                <span className="text-lg font-bold text-[#F4F1EB] ml-1">{Math.round((latest?.pollution ?? 0) * 0.6)}</span> <span className="text-[10px] text-[#A8C4B0]">NOx</span>
              </div>
              <div className="text-[8px] text-[#A8C4B0] mt-1">Standard: 80 µg/m³ safe</div>
            </div>
            <div className="rounded border border-[#F4F1EB]/20 bg-[#F4F1EB]/5 p-2">
              <div className="text-[10px] text-[#A8C4B0] mb-1">Mist Cannons & Noise</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-[#eab308]">{Math.round((latest?.waterQuality ?? 0) / 2)}%</span>
                <span className="text-[10px] text-[#A8C4B0]">Eff.</span>
              </div>
              <div className="text-[8px] text-[#A8C4B0] mt-1">Noise: {latest?.noiseDb?.toFixed(1)} dB(A)</div>
            </div>
          </div>
          
          <PollutionGraph rows={rows} />
          
          <div className="mt-4 flex items-start gap-2">
             <div className="mt-1"><AlertTriangle className="h-4 w-4 text-rose-400" /></div>
             <div className="rounded border border-rose-900/50 bg-rose-950/30 p-3 text-[10px] leading-relaxed text-[#F4F1EB]">
               <span className="text-rose-400 font-bold">Central Pollution Control Board (CPCB) CAAQMS Telemetry Diagnostic</span><br/>
               Online CAAQMS Station #1 (Haul Road Alpha) records 24-hr PM10 at <b className="text-[#f43f5e]">{Math.round(latest?.dustPpm ?? 0)} µg/m³</b> (limit 100).
               <span className="text-rose-400"> Fugitive dust plume detected during heavy hauler movement.</span> High-pressure fogging cannons at Coal Handling Plant (CHP) operating at {Math.round((latest?.waterQuality ?? 0) / 2)}% efficiency; automated nozzle descaling recommended.
             </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2 text-xs text-[#F4F1EB]">
            {summary.map(item => <div key={item} className="rounded border border-[#F4F1EB]/20 bg-[#F4F1EB]/5 p-2">{item}</div>)}
          </div>
          {ring === 'environment' && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-[#A8C4B0]">
              {['N · 34°C', 'E · 31°C', 'S · 33°C', 'W · 30°C'].map(zone => <div key={zone} className="rounded bg-[#1A2810] p-2">{zone}</div>)}
            </div>
          )}
          <GenericGraph 
             values={values} 
             color={config.color} 
             title={`90-Day ${config.label} Trend`} 
             legendLabel={config.label.split(' ')[0]} 
             limitValue={ring === 'production' ? forecast.targetYearEndTons / 12 : undefined} 
          />
          <div className="mt-3 text-[10px] text-[#A8C4B0]">Last updated {new Date(latest.recordedAt).toLocaleString()}</div>
          <div className="mt-4 text-[10px] leading-relaxed text-[#A8C4B0]">
            {mine.name} · Data is synthetic/demo shaped for future sensor and production integrations.
          </div>
        </>
      )}
    </aside>
  );
}

export default function MineVirtualView({ mine, onClose }: { mine: MineRecord; onClose?: () => void }) {
  const [rows, setRows] = useState<MineTelemetryRow[]>([]);
  const [selectedRing, setSelectedRing] = useState<RingId>('pollution');
  const [hoveredRing, setHoveredRing] = useState<RingId | null>(null);
  const [visible, setVisible] = useState<Record<RingId, boolean>>({
    area: true, environment: true, production: true, forecast: true, pollution: true
  });
  const [paused, setPaused] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    void ensureSyntheticTelemetry(mine.id).then(data => { if (mounted) setRows(data); });
    return () => { mounted = false; };
  }, [mine.id]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setSweepKey(value => value + 1), 10000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const forecast = calculateProductionForecast(rows);
  const latest = rows[rows.length - 1];
  const riskColor = mine.status === 'critical' ? '#ef4444' : mine.status === 'monitor' ? '#f59e0b' : '#10b981';
  const pollution = latest?.pollution ?? 0;
  const areaCurrent = 1150 + (latest?.environment ?? 0) * 3;
  const mineNameLines = mine.name.length > 20
    ? [mine.name.slice(0, 20), mine.name.slice(20, 38)]
    : [mine.name];

  const openRing = (ring: RingId) => {
    setSelectedRing(ring);
    setVisible(value => ({ ...value, [ring]: true }));
  };

  const ringSummary = useMemo(() => ({
    area: `Approved 1,250 Ha · Current ${Math.round(areaCurrent)} Ha`,
    environment: `Temperature and humidity · ${Math.round(latest?.environment ?? 0)} index`,
    production: `${forecast.currentMonthlyTons.toLocaleString()} tons/month current output`,
    forecast: `${forecast.projectedYearEndTons.toLocaleString()} tons projected EOY`,
    pollution: `${Math.round(pollution)} composite harm index`
  }), [areaCurrent, forecast, latest, pollution]);

  if (rows.length === 0) return <div className="rounded-xl border border-[#F4F1EB]/20 bg-[#1A2810] p-6 text-sm text-[#A8C4B0]">Loading mine digital twin telemetry…</div>;
 
  return (
    <section className={`${onClose ? 'fixed inset-0 z-[2000] min-h-screen w-screen overflow-y-auto' : 'relative'} bg-[#1A2810] text-[#F4F1EB]`} role="dialog" aria-modal={Boolean(onClose)} aria-label="Mine Virtual View">
      <div className={`${onClose ? 'min-h-screen w-full p-3 sm:p-6' : 'relative overflow-hidden rounded-xl border border-[#F4F1EB]/20 p-3'}`}>
        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1800px] flex-col">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F4F1EB]/20 pb-3">
            <div>
              {onClose && <button onClick={onClose} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-[#A8C4B0] hover:text-[#F4F1EB]"><ArrowLeft className="h-3.5 w-3.5" /> Back to Mine Details</button>}
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#A8C4B0]">CoalGuard AI · Mine Virtual View</div>
              <h1 className="mt-1 text-xl font-bold">{mine.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#A8C4B0]"><MapPin className="h-3.5 w-3.5" /> {mine.subsidiary} · {mine.state} <span className="rounded px-2 py-0.5 font-bold uppercase" style={{ color: riskColor, backgroundColor: `${riskColor}22` }}>{mine.status} risk</span><span>Lease status: {mine.status === 'critical' ? 'Review required' : 'Active'}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPaused(value => !value)} className="rounded border border-[#F4F1EB]/20 p-2 text-[#A8C4B0] hover:text-[#F4F1EB]" aria-label={paused ? 'Resume radar sweep' : 'Pause radar sweep'}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
              {onClose && <button onClick={onClose} className="rounded border border-[#F4F1EB]/20 p-2 text-[#A8C4B0] hover:text-[#F4F1EB]" aria-label="Close virtual view"><X className="h-4 w-4" /></button>}
              <span className="rounded border border-emerald-700 bg-emerald-950/40 px-2 py-1 font-mono text-[10px] text-emerald-300">Offline telemetry · {rows.length} records</span>
            </div>
          </header>              <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <main className="min-w-0 flex-1">
              <div className="grid gap-4 p-3 lg:grid-cols-[minmax(420px,1fr)_minmax(280px,0.8fr)] lg:p-6">
                <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-xl border border-[#F4F1EB]/20 bg-[#1E3A2F]">
                  <div className="pointer-events-none absolute inset-0 opacity-10 [background:linear-gradient(90deg,transparent_49.8%,#A8C4B0_50%,transparent_50.2%),linear-gradient(0deg,transparent_49.8%,#A8C4B0_50%,transparent_50.2%)]" />
                  <svg viewBox="0 0 340 340" className="h-[min(78vw,440px)] w-[min(78vw,440px)]" role="img" aria-label="Radial mine digital twin">
                    <defs>
                      <linearGradient id="environmentHeat" x1="0" x2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="55%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#ef4444" /></linearGradient>
                      <linearGradient id="pollutionHeat" x1="0" x2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="45%" stopColor="#f59e0b" /><stop offset="75%" stopColor="#f97316" /><stop offset="100%" stopColor="#dc2626" /></linearGradient>
                    </defs>
                    {RING_ORDER.map((ring, index) => {
                      const config = RINGS[ring];
                      const dimmed = hoveredRing !== null && hoveredRing !== ring;
                      const ringColor = ring === 'environment' ? 'url(#environmentHeat)' : ring === 'pollution' ? 'url(#pollutionHeat)' : config.color;
                      const progress = ring === 'area' ? clamp(areaCurrent / 1250, 0, 1.15) : ring === 'production' ? clamp(forecast.current / 100, 0, 1) : ring === 'forecast' ? clamp(forecast.projected / 100, 0, 1) : ring === 'pollution' ? clamp(pollution / 100, 0, 1) : clamp((latest.environment ?? 0) / 100, 0, 1);
                      const dash = circumference(config.radius);
                      return (
                        <g
                          key={ring}
                          role="button"
                          tabIndex={visible[ring] ? 0 : -1}
                          aria-label={`${config.label}: ${ringSummary[ring]}`}
                          className="cursor-pointer outline-none"
                          onClick={() => openRing(ring)}
                          onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              openRing(ring);
                            }
                          }}
                          onMouseEnter={() => setHoveredRing(ring)}
                          onMouseLeave={() => setHoveredRing(null)}
                          onFocus={() => setHoveredRing(ring)}
                          onBlur={() => setHoveredRing(null)}
                          style={{ opacity: visible[ring] ? (dimmed ? 0.18 : 1) : 0, transition: 'opacity 180ms' }}
                        >
                          <circle cx="170" cy="170" r={config.radius} fill="none" stroke="#A8C4B0" strokeWidth="10" strokeOpacity="0.2" />
                          <circle cx="170" cy="170" r={config.radius} fill="none" stroke={ringColor} strokeWidth={selectedRing === ring ? 4 : 2} strokeDasharray={ring === 'forecast' ? '3 6' : dash} strokeDashoffset={ring === 'forecast' ? 0 : dash * (1 - progress)} transform="rotate(-90 170 170)" style={{ transition: ring === 'production' ? 'stroke-dashoffset 1400ms ease-out' : 'stroke-width 180ms' }} />
                          {ring === 'area' && <circle cx="170" cy="170" r="42" fill="none" stroke="#10b981" strokeDasharray="2 5" strokeWidth="2" />}
                          <title>{`${RINGS[ring].label}: ${ringSummary[ring]}. Click to inspect.`}</title>
                        </g>
                      );
                    })}
                    {pollution > 75 && <g aria-label="Critical pollution warning"><circle cx="300" cy="72" r="8" fill="#dc2626" className="animate-pulse" /><foreignObject x="290" y="62" width="20" height="20"><AlertTriangle className="h-4 w-4 text-[#F4F1EB]" /></foreignObject></g>}
                    <circle cx="170" cy="170" r="34" fill="#1A2810" stroke={riskColor} strokeWidth="3" className={mine.status === 'critical' ? 'animate-pulse' : ''} />
                    <circle cx="170" cy="170" r="43" fill="none" stroke={riskColor} strokeOpacity="0.35" strokeDasharray="3 5" />
                    <text x="170" y="158" textAnchor="middle" fill="#F4F1EB" fontSize={mineNameLines.length > 1 ? '8' : '10'} fontWeight="bold">
                      {mineNameLines.map((line, index) => <tspan key={line} x="170" dy={index === 0 ? 0 : 10}>{line}</tspan>)}
                    </text>
                    <text x="170" y={mineNameLines.length > 1 ? '184' : '176'} textAnchor="middle" fill="#A8C4B0" fontSize="7">{mine.subsidiary} · {mine.status.toUpperCase()}</text>
                    <line key={sweepKey} x1="170" y1="170" x2="170" y2="12" stroke="#B5601B" strokeWidth="2" opacity="0.8" style={{ transformOrigin: '170px 170px', animation: paused ? 'none' : 'spin 10s linear 1' }} />
                  </svg>
                  <div className="absolute bottom-2 left-0 right-0 text-center font-mono text-[9px] uppercase text-[#A8C4B0]">SVG radial digital twin · click or focus a ring for details</div>
                </div>
 
                <div className="rounded-xl border border-[#F4F1EB]/20 bg-[#1E3A2F] p-4">
                  <div className="mb-3 text-xs font-bold text-[#F4F1EB]">Layer summary</div>
                  <div className="space-y-2">{RING_ORDER.map(ring => <button key={ring} onClick={() => openRing(ring)} className={`flex w-full items-center justify-between rounded border p-2 text-left text-[10px] ${selectedRing === ring ? 'border-[#B5601B] bg-[#B5601B]/20' : 'border-[#F4F1EB]/20 bg-[#F4F1EB]/5'}`}><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: RINGS[ring].color }} />{RINGS[ring].label}</span><span className="text-[#A8C4B0]">{ringSummary[ring]}</span></button>)}</div>
                  <div className="mt-4 rounded border border-[#F4F1EB]/20 bg-[#F4F1EB]/5 p-3 text-[10px] leading-relaxed text-[#A8C4B0]"><Shield className="mb-1 h-4 w-4 text-emerald-400" /> All values are synthetic/demo telemetry stored offline. Real deployment can plug in validated IoT, DGMS, CPCB, and inspection feeds.</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-[#F4F1EB]/20 px-3 py-3 text-[10px] text-[#A8C4B0] lg:px-6">
                <Radio className="h-3.5 w-3.5 text-[#B5601B]" /> Legend:
                {RING_ORDER.map(ring => <label key={ring} className="flex cursor-pointer items-center gap-1 rounded bg-[#1A2810] px-2 py-1"><input type="checkbox" checked={visible[ring]} onChange={() => setVisible(value => ({ ...value, [ring]: !value[ring] }))} />{RINGS[ring].label}</label>)}
              </div>
            </main>
            <RingDetail ring={selectedRing} rows={rows} mine={mine} forecast={forecast} />
          </div>
        </div>
      </div>
    </section>
  );
}
