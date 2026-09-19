import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

// Fix missing default Leaflet icons in Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

import { MineRecord } from '../types';
import { Layers, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';

interface SurveillanceMapProps {
  mines: MineRecord[];
  selectedMine: MineRecord | null;
  onSelectMine: (mine: MineRecord) => void;
  onInvestigateEvidence: (mine: MineRecord) => void;
  filterState: string;
  filterSubsidiary?: string;
  filterRisk: string;
}

export default function SurveillanceMap({
  mines,
  selectedMine,
  onSelectMine,
  onInvestigateEvidence,
  filterState,
  filterSubsidiary = 'All Subsidiaries',
  filterRisk
}: SurveillanceMapProps) {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const overlaysLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'topo' | 'street'>('satellite');
  const [showBoundaryLayers, setShowBoundaryLayers] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize Leaflet map centered on Central India ([22.5, 82.0], zoom: 5)
  useEffect(() => {
    if (!isMounted) return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered on Central India ([22.9734, 82.6569], zoom: 5) so all nationwide mines are visible
    const map = L.map(mapContainerRef.current, {
      center: [22.9734, 82.6569],
      zoom: 5,
      minZoom: 4,
      zoomControl: false,
      attributionControl: false
    });

    // Base Tile layers
    const satelliteTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      }
    );

    const streetTiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }
    );

    const topoTiles = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 17,
        attribution: 'OpenTopoMap'
      }
    );

    satelliteTiles.addTo(map);
    (map as any)._customTileLayers = { satelliteTiles, streetTiles, topoTiles };
    (map as any)._activeTileLayer = satelliteTiles;

    const markersGroup = L.layerGroup().addTo(map);
    const overlaysGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    overlaysLayerRef.current = overlaysGroup;
    mapInstanceRef.current = map;

    // Force size invalidation so tiles load immediately without gray gaps
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      mapInstanceRef.current = null;
    };
  }, [isMounted]);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !(map as any)._customTileLayers) return;

    const { satelliteTiles, streetTiles, topoTiles } = (map as any)._customTileLayers;
    const currentActive = (map as any)._activeTileLayer;
    if (currentActive) {
      map.removeLayer(currentActive);
    }

    let nextLayer = satelliteTiles;
    if (mapType === 'street') nextLayer = streetTiles;
    if (mapType === 'topo') nextLayer = topoTiles;

    nextLayer.addTo(map);
    (map as any)._activeTileLayer = nextLayer;
  }, [mapType]);

  // Smoothly fly/pan to cluster bounds when State or Subsidiary filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const hasStateFilter = filterState && filterState !== 'All States';
    const hasSubFilter = filterSubsidiary && filterSubsidiary !== 'All Subsidiaries';

    if (hasStateFilter || hasSubFilter) {
      const clusterMines = mines.filter(m => {
        if (hasStateFilter && m.state !== filterState) return false;
        if (hasSubFilter && m.subsidiary !== filterSubsidiary) return false;
        return true;
      });

      if (clusterMines.length > 0) {
        if (clusterMines.length === 1) {
          map.flyTo([clusterMines[0].latitude, clusterMines[0].longitude], 9, {
            duration: 1.2
          });
        } else {
          const bounds = L.latLngBounds(
            clusterMines.map(m => [m.latitude, m.longitude] as [number, number])
          );
          map.flyToBounds(bounds, {
            padding: [50, 50],
            maxZoom: 9,
            duration: 1.2
          });
        }
      }
    } else {
      // Both filters cleared: smoothly fly back to Central India
      map.flyTo([22.9734, 82.6569], 5, { duration: 1.0 });
    }
  }, [filterState, filterSubsidiary, mines]);

  // Update Markers and Overlays based on filters and selectedMine
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const overlaysGroup = overlaysLayerRef.current;
    if (!map || !markersGroup || !overlaysGroup) return;

    markersGroup.clearLayers();
    overlaysGroup.clearLayers();

    // Filter mines based on state, subsidiary, and risk
    const filteredMines = mines.filter(m => {
      if (filterState !== 'All States' && m.state !== filterState) return false;
      if (filterSubsidiary && filterSubsidiary !== 'All Subsidiaries' && m.subsidiary !== filterSubsidiary) return false;
      
      // Filter risk thresholds
      if (filterRisk === 'Critical Only' || filterRisk === 'Critical Breaches (<65%)') {
        if (m.complianceScore >= 65 && m.status !== 'critical') return false;
      } else if (filterRisk === 'Monitor' || filterRisk === 'Needs Monitoring (65-79%)') {
        if (m.complianceScore < 65 || m.complianceScore >= 80) return false;
      } else if (filterRisk === 'Compliant' || filterRisk === 'Compliant (>=80%)') {
        if (m.complianceScore < 80) return false;
      }
      return true;
    });

    filteredMines.forEach(mine => {
      const isSelected = selectedMine?.id === mine.id;
      
      // Color-coded CircleMarkers:
      // Green (#10B981) for COMPLIANT (Score >= 80)
      // Amber (#F59E0B) for NEEDS_MONITORING (Score 65-79)
      // Pulsing Red (#EF4444) for CRITICAL_BREACH (Score < 65: Rajmahal, Jharia, Kaniha)
      const isCritical = mine?.complianceScore < 65 || mine?.status?.toLowerCase() === 'critical';
      const isNeedsMonitoring = !isCritical && mine?.complianceScore >= 65 && mine?.complianceScore < 80;
      const isCompliant = !isCritical && mine?.complianceScore >= 80;

      const markerColor = isCritical ? '#EF4444' : isNeedsMonitoring ? '#F59E0B' : '#10B981';
      const statusLabel = isCritical ? 'CRITICAL_BREACH' : isNeedsMonitoring ? 'NEEDS_MONITORING' : 'COMPLIANT';

      const isRajmahal = mine?.id === 'MIN-4492-R' || mine?.name?.toLowerCase()?.includes('rajmahal');

      // Custom DivIcon styled as a CircleMarker with pulsing ring for critical breach
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
          ${isCritical ? `
            <div class="absolute -inset-2.5 rounded-full bg-red-500/40 animate-ping pointer-events-none"></div>
            <div class="absolute -inset-4 rounded-full bg-red-500/20 animate-pulse pointer-events-none"></div>
          ` : ''}
          <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            isSelected 
              ? 'ring-4 ring-white ring-offset-2 ring-offset-blue-700 scale-125 z-30' 
              : 'hover:scale-115'
          }" style="background-color: ${markerColor}; border: 2px solid #ffffff;">
            <span class="text-[9px] font-black text-white leading-none font-mono">
              ${mine.subsidiary.slice(0, 3)}
            </span>
          </div>
          ${isCritical ? `
            <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-950/95 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500 whitespace-nowrap shadow-md pointer-events-none flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
              ${mine.name.split(' ')[0]} (${mine.complianceScore}%)
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-mine-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([mine?.latitude ?? 23.7, mine?.longitude ?? 86.4], { icon: customIcon });

      const totalWorkers = mine.workforceSplit?.total || mine.activeWorkforce || 412;
      const permWorkers = mine.workforceSplit?.permanent || Math.round(totalWorkers * 0.55);
      const contWorkers = mine.workforceSplit?.contractual || (totalWorkers - permWorkers);

      // Leaflet popup displaying Mine Name, Subsidiary, Compliance Score, Active Workforce, and CTA
      const popupContent = `
        <div style="font-family: inherit; min-width: 250px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${markerColor}; background: ${markerColor}18; padding: 2px 6px; border-radius: 4px; border: 1px solid ${markerColor}40;">
              ${statusLabel.replace('_', ' ')}
            </span>
            <span style="font-size: 10px; font-family: monospace; font-weight: 700; color: #1e293b; background: #e2e8f0; padding: 1px 5px; border-radius: 3px;">
              ${mine.subsidiary}
            </span>
          </div>

          <h4 style="margin: 0 0 3px 0; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.25;">
            ${mine.name}
          </h4>

          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">
            ${mine.basin} &bull; ${mine.region}, ${mine.state}
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8fafc; padding: 7px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
            <div>
              <div style="font-size: 9px; text-transform: uppercase; font-weight: 600; color: #64748b;">Compliance Score</div>
              <div style="font-size: 14px; font-weight: 800; color: ${markerColor};">${mine.complianceScore}%</div>
            </div>
            <div>
              <div style="font-size: 9px; text-transform: uppercase; font-weight: 600; color: #64748b;">Active Workforce</div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${totalWorkers.toLocaleString()}</div>
              <div style="font-size: 9px; color: #64748b;">${permWorkers} Reg / ${contWorkers} Cont</div>
            </div>
          </div>

          ${mine.unauthorizedAreaHa ? `
            <div style="font-size: 10px; background: #fef2f2; color: #991b1b; padding: 5px 7px; border-radius: 4px; border: 1px solid #fecaca; margin-bottom: 8px; font-weight: 600; line-height: 1.3;">
              &bull; Encroachment Alert: ${mine.unauthorizedAreaHa} Ha detected beyond lease boundary
            </div>
          ` : ''}

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; gap: 6px;">
              <button id="popup-select-${mine.id.replace(/[^a-zA-Z0-9]/g, '')}" style="flex: 1; padding: 6px 8px; font-size: 11px; font-weight: 600; background: #0A192F; color: #ffffff; border: none; border-radius: 4px; cursor: pointer;">
                Select Mine
              </button>
              ${isCritical && !isRajmahal ? `
                <button id="popup-investigate-${mine.id.replace(/[^a-zA-Z0-9]/g, '')}" style="flex: 1; padding: 6px 8px; font-size: 11px; font-weight: 600; background: #1E40AF; color: #ffffff; border: none; border-radius: 4px; cursor: pointer;">
                  Evidence
                </button>
              ` : ''}
            </div>

            ${isRajmahal ? `
              <button id="popup-investigate-${mine.id.replace(/[^a-zA-Z0-9]/g, '')}" style="width: 100%; padding: 7px 10px; font-size: 11px; font-weight: 700; background: #EF4444; color: #ffffff; border: none; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                <span>Investigate Anomaly &amp; Telemetry (ENV-082) &rarr;</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 290, className: 'leaflet-custom-popup' });

      marker.on('click', () => {
        onSelectMine(mine);
      });

      marker.on('popupopen', () => {
        const safeId = mine.id.replace(/[^a-zA-Z0-9]/g, '');
        const selBtn = document.getElementById(`popup-select-${safeId}`);
        const invBtn = document.getElementById(`popup-investigate-${safeId}`);

        if (selBtn) {
          selBtn.onclick = () => {
            onSelectMine(mine);
          };
        }
        if (invBtn) {
          invBtn.onclick = () => {
            onInvestigateEvidence(mine);
          };
        }
      });

      markersGroup.addLayer(marker);
    });

    // Add Boundary Overlays for Rajmahal OCP (demonstration benchmark)
    if (showBoundaryLayers) {
      // Approved Statutory Lease Area Polygon (Green boundary)
      const approvedLeasePolygon = L.polygon([
        [25.045, 87.375],
        [25.042, 87.418],
        [25.008, 87.425],
        [25.005, 87.382]
      ], {
        color: '#10b981',
        weight: 2.5,
        fillColor: '#10b981',
        fillOpacity: 0.12,
        dashArray: '5, 5'
      }).bindTooltip('Rajmahal OCP: Approved MoEFCC Lease Boundary (1,248 Ha)', { sticky: true });

      // Encroachment Zone Polygon (Red dashed area: 28 Ha breach)
      const encroachmentPolygon = L.polygon([
        [25.042, 87.418],
        [25.048, 87.438],
        [25.022, 87.442],
        [25.018, 87.423]
      ], {
        color: '#ef4444',
        weight: 3,
        fillColor: '#ef4444',
        fillOpacity: 0.35,
        dashArray: '4, 4'
      }).bindTooltip('SCN-2026-082: Flagged 28 Ha Perimeter Encroachment Zone', { sticky: true });

      overlaysGroup.addLayer(approvedLeasePolygon);
      overlaysGroup.addLayer(encroachmentPolygon);
    }
  }, [isMounted, mines, selectedMine, filterState, filterSubsidiary, filterRisk, showBoundaryLayers]);

  // Pan to selected mine when selectedMine changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedMine) return;

    map.flyTo([selectedMine?.latitude ?? 23.7, selectedMine?.longitude ?? 86.4], Math.max(map.getZoom(), 11), {
      duration: 1.2
    });
  }, [selectedMine]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleReset = () => {
    mapInstanceRef.current?.flyTo([22.9734, 82.6569], 5, { duration: 1.0 });
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-slate-900">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-800">{t('map.title')}</span>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {t('map.subtitle')}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Tile Layer Selector */}
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-1 shadow-md flex items-center gap-1 text-xs">
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                mapType === 'satellite' ? 'bg-[#0A192F] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('topo')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                mapType === 'topo' ? 'bg-[#0A192F] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Topography
            </button>
            <button
              onClick={() => setMapType('street')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                mapType === 'street' ? 'bg-[#0A192F] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Cartographic
            </button>
          </div>

          {/* Boundary Overlay Toggle */}
          <button
            onClick={() => setShowBoundaryLayers(!showBoundaryLayers)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-sm transition-all ${
              showBoundaryLayers 
                ? 'bg-blue-900/90 text-white border-blue-500' 
                : 'bg-white/95 text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle Statutory Lease & Encroachment Overlay Boundaries"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lease Boundary Polygons</span>
          </button>
        </div>
      </div>

      {/* Floating Zoom and Navigation Controls */}
      <div className="absolute top-16 right-3 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-slate-100 border border-slate-300 rounded shadow-md flex items-center justify-center transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-slate-100 border border-slate-300 rounded shadow-md flex items-center justify-center transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-slate-100 border border-slate-300 rounded shadow-md flex items-center justify-center transition-colors cursor-pointer"
          title="Reset View to Central India [22.5, 82.0]"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Status Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm border border-slate-300 rounded-lg p-3 shadow-md">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('map.legend')}</div>
        <div className="flex flex-col gap-1.5 text-xs text-slate-700 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EF4444] border border-white shadow-xs"></span>
            <span>{t('map.criticalBreach')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-white shadow-xs"></span>
            <span>{t('map.needsMonitoring')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10B981] border border-white shadow-xs"></span>
            <span>{t('map.compliant')}</span>
          </div>
          {showBoundaryLayers && (
            <div className="pt-1.5 border-t border-slate-200 flex flex-col gap-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-emerald-500 rounded"></span>
                <span>{t('map.approvedLease')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-red-500 rounded"></span>
                <span>{t('map.encroachmentZone')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explicit Height Map Container as strictly instructed */}
      {isMounted && (
        <div 
          id="surveillance-leaflet-map"
          key="govt-leaflet-map"
          ref={mapContainerRef} 
          style={{ height: '100%', minHeight: '480px', width: '100%' }}
          className="w-full z-0 cursor-grab active:cursor-grabbing"
        />
      )}
    </div>
  );
}
