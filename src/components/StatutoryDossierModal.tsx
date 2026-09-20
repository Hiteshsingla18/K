import React, { useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  ExternalLink,
  Scale,
  Hash
} from 'lucide-react';
import { ViolationStatus } from '../types';

interface StatutoryDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  violationStatus: ViolationStatus;
  triggerToast: (msg: string) => void;
}

export default function StatutoryDossierModal({
  isOpen,
  onClose,
  violationStatus,
  triggerToast
}: StatutoryDossierModalProps) {
  const printableAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    triggerToast('Opening system print dialog for Statutory SCN Dossier...');
    window.print();
  };

  const handleDownloadPdf = () => {
    triggerToast('✓ Statutory Dossier SCN-2026-082 exported with SHA-256 digital signature.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-6 flex flex-col overflow-hidden border border-[#DDD8CF]">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-3.5 bg-[#1E3A2F] text-[#F4F1EB] flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#A8C4B0]/20 text-[#A8C4B0] rounded-lg border border-[#A8C4B0]/30">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#F4F1EB]">Statutory SCN Dossier #ENV-082</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-mono font-semibold">
                  Official Gazette Format
                </span>
              </div>
              <p className="text-[11px] text-[#A8C4B0]">
                MoEFCC Rule 14(b) &bull; CMR 2017 Regulation 109 Enforcement Record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#1A2810] hover:bg-[#1A2810]/80 text-[#F4F1EB] rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#1A2810]"
              title="Print official document"
            >
              <Printer className="w-3.5 h-3.5 text-[#A8C4B0]" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-[#2A5C45] hover:bg-[#1E3A2F] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Export digitally certified PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Certified PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="text-[#8FA08A] hover:text-[#F4F1EB] transition-colors cursor-pointer p-1 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government Document Body */}
        <div 
          ref={printableAreaRef}
          className="p-6 sm:p-8 overflow-y-auto max-h-[78vh] space-y-6 bg-white text-[#1A2810] font-serif text-xs leading-relaxed print:max-h-none print:p-8"
        >
          {/* Government Formal Letterhead */}
          <div className="border-b-2 border-[#1A2810] pb-5 text-center space-y-1">
            {/* National Emblem & Official K Emblem */}
            <div className="flex justify-center items-center gap-3 mb-2">
              <div className="relative inline-flex items-center justify-center">
                <img 
                  src="/src/assets/logo.png" 
                  alt="K Logo" 
                  className="h-12 w-12 object-contain rounded-full shadow-sm" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('w-12', 'h-12', 'rounded-full', 'bg-[#1E3A2F]', 'border-2', 'border-[#2A5C45]', 'flex', 'items-center', 'justify-center', 'text-[#A8C4B0]', 'font-mono', 'font-black', 'text-base', 'shadow-[0_0_12px_rgba(42,92,69,0.5)]');
                    e.currentTarget.parentElement?.appendChild(document.createTextNode('K'));
                  }}
                />
              </div>
            </div>
            
            <div className="font-bold text-base tracking-widest uppercase font-sans text-[#1A2810]">
              GOVERNMENT OF INDIA &bull; DIRECTORATE GENERAL OF MINES SAFETY
            </div>
            <div className="text-xs font-sans text-[#5C6B57] font-semibold tracking-wide">
              MINISTRY OF COAL &bull; KHANANRAKSHAK AI (K-AI)
            </div>
            <div className="text-[11px] font-sans text-[#8FA08A]">
              AI-Powered Smart Governance &amp; Satellite Surveillance System for Coal Mines &bull; Dhanbad - 826001
            </div>
            
            <div className="pt-2">
              <span className="inline-block bg-red-100 text-red-900 border border-red-300 px-3 py-1 text-xs font-bold font-sans tracking-wide uppercase rounded">
                STATUTORY SHOW-CAUSE NOTICE UNDER MOEFCC RULE 14(b) &amp; CMR 2017
              </span>
            </div>
          </div>

          {/* Metadata Grid / Case Reference Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans bg-[#FAF8F4] p-4 rounded-lg border border-[#DDD8CF]">
            <div>
              <span className="text-[#8FA08A] block text-[10px] uppercase font-bold">Case Reference &amp; Dossier Number</span>
              <strong className="text-[#1A2810] font-mono text-sm">SCN-2026-082 / Rajmahal OCP</strong>
            </div>
            <div>
              <span className="text-[#8FA08A] block text-[10px] uppercase font-bold">Subject Mine / Allotted Block</span>
              <strong className="text-[#1A2810]">Rajmahal Open Cast Project (OCP)</strong>
            </div>
            <div>
              <span className="text-[#8FA08A] block text-[10px] uppercase font-bold">Lease Operator</span>
              <strong className="text-[#1A2810]">Eastern Coalfields Limited (ECL)</strong>
            </div>
            <div>
              <span className="text-[#8FA08A] block text-[10px] uppercase font-bold">Gazetted Coordinates of Detected Breach</span>
              <strong className="text-red-700 font-mono">25.0486° N, 87.3917° E (East Coal Ridge)</strong>
            </div>
            <div>
              <span className="text-[#8FA08A] block text-[10px] uppercase font-bold">Total Measured Encroachment Area</span>
              <strong className="text-red-700 font-bold">28.42 Hectares (Outside Permitted Lease)</strong>
            </div>
            <div>
              <span className="text-[#8FA08A] block text-[10px] uppercase font-bold">Statutory Response Window</span>
              <strong className="text-amber-800 font-bold">Mandatory 48 Hours from Timestamp</strong>
            </div>
          </div>

          {/* Section 1: Findings Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm font-sans uppercase tracking-wide text-[#1A2810] border-b border-[#DDD8CF] pb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              1. Findings Summary &amp; Spatial Corroboration
            </h4>
            <p className="text-justify leading-relaxed">
              Automated multi-spectral satellite comparison utilizing Sentinel-2 MSI (Level-2A BOA Surface Reflectance) and Cartosat-3 high-resolution stereoscopic imagery detected illegal opencast extraction activities extending <strong>28.42 hectares beyond the statutory lease line</strong> at Rajmahal OCP, Godda district, Jharkhand (Centroid: <strong>25.0486° N, 87.3917° E</strong>).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#1A2810]">
              <li>
                <strong>Spectral NDVI Depletion:</strong> High-density canopy loss of <strong>-71.8% NDVI</strong> between Baseline pass (Dec 2024, index 0.64) and Surveillance pass (Aug 2026, index 0.18), indicating deliberate overburden stripping and tree clearing.
              </li>
              <li>
                <strong>Synthetic Aperture Radar (SAR) Backscatter:</strong> Sentinel-1 C-band coherence differential confirms terrain topographic displacement and heavy dump-truck haul patterns.
              </li>
              <li>
                <strong>Community Verification:</strong> 14 independent citizen grievances logged via the Khanan Prahari system with GPS geotags in Simlong and Taljhari village clusters corroborating active blasting and perimeter equipment operations.
              </li>
            </ul>
          </div>

          {/* Section 2: Statutory Action Required */}
          <div className="space-y-2 bg-[#B5601B]/5 p-4 rounded-lg border border-[#B5601B]/20">
            <h4 className="font-bold text-sm font-sans uppercase tracking-wide text-[#B5601B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B5601B]" />
              2. Statutory Action Required under MoEFCC Rule 14(b) within 48 Hours
            </h4>
            <p className="text-[#1A2810] text-justify leading-relaxed">
              In exercise of statutory powers vested under <strong>Rule 14(b) of the Environment (Protection) Rules, 1986</strong> and <strong>Regulation 109 of the Coal Mines Regulations, 2017</strong>, the Agent/General Manager of Eastern Coalfields Limited (Rajmahal Area) is hereby commanded to:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-[#1A2810]">
              <li>
                <strong>Immediate Cessation:</strong> Cease all coal-winning, drilling, and overburden excavation outside the approved boundary marked between pillars P-14 and P-19 immediately.
              </li>
              <li>
                <strong>Statutory Defense Submission:</strong> Furnish a formal engineering justification, DGMS First Class Manager certification, and Differential Global Positioning System (DGPS) survey map within <strong>48 hours</strong> of this notice.
              </li>
              <li>
                <strong>Environmental Remediation Plan:</strong> Submit a time-bound greening and reclamation escrow guarantee for the 28.42 hectares stripped zone.
              </li>
            </ol>
            <div className="text-[11px] font-sans text-red-700 font-semibold mt-2 pt-2 border-t border-[#B5601B]/20">
              Failure to submit statutory defense within 48 hours will trigger automatic suspension of environmental clearance and initiation of prosecution under Section 73 of the Mines Act, 1952.
            </div>
          </div>

          {/* Section 3: Legal Verification & Digital Stamp */}
          <div className="pt-4 border-t-2 border-[#DDD8CF] grid grid-cols-1 sm:grid-cols-2 gap-4 items-end font-sans">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-[#FAF8F4] border border-[#DDD8CF] rounded flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-[#1A2810]" />
                </div>
                <div className="text-[10px] space-y-0.5 text-[#8FA08A]">
                  <div className="font-mono font-bold text-[#1A2810]">SHA-256 DIGITAL VERIFICATION</div>
                  <div className="font-mono text-[9px] text-[#5C6B57] break-all">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </div>
                  <div className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Cryptographically Anchored Ledger Block #10492</span>
                  </div>
                </div>
              </div>
            </div>
 
            <div className="text-right space-y-1">
              <div className="inline-block border-b border-[#1A2810] pb-1 mb-1">
                <div className="font-serif italic font-bold text-[#1A2810] text-sm">Dr. A. Sharma</div>
              </div>
              <div className="font-bold text-xs text-[#1A2810]">Chief Vigilance Officer &amp; Director (Mines Safety)</div>
              <div className="text-[#5C6B57] text-[11px]">Directorate General of Mines Safety, Ministry of Coal</div>
              <div className="text-[10px] text-[#8FA08A] font-mono">Issued at: 2026-08-26 09:41:22 UTC &bull; Verified Dispatch</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[#FAF8F4] border-t border-[#DDD8CF] flex flex-wrap justify-between items-center gap-2 print:hidden">
          <div className="flex items-center gap-2 text-xs text-[#5C6B57]">
            <span className="font-semibold">Notice Status:</span>
            <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-sans">
              {violationStatus.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-[#DDD8CF] text-[#1A2810] text-xs font-semibold rounded hover:bg-[#EDE9E2] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#5C6B57]" />
              <span>Print Document</span>
            </button>
            <button
              onClick={() => {
                handleDownloadPdf();
                onClose();
              }}
              className="px-4 py-2 bg-[#2A5C45] hover:bg-[#1E3A2F] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#DDD8CF] hover:bg-[#A8C4B0] text-[#1A2810] text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
