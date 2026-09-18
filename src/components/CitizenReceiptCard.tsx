import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Camera, 
  ArrowRight, 
  KeyRound, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  FileText, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { CitizenReportRecord } from '../types';

interface CitizenReceiptCardProps {
  report: CitizenReportRecord;
  onTrackNow: (reportId: string, pin: string) => void;
  onSubmitAnother: () => void;
}

export default function CitizenReceiptCard({
  report,
  onTrackNow,
  onSubmitAnother
}: CitizenReceiptCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyFullReceipt = () => {
    const text = `--- GOVT OF INDIA • KHANAN PRAHARI CITIZEN RECEIPT ---
Report ID: ${report.id}
Tracking PIN: ${report.pin}
Mine / Colliery: ${report.mineName}
Location: ${report.village}
Category: ${report.category}
Date Logged: ${report.date} (${report.timestamp})
Status: ${report.statusText}
Track at: Citizen Environmental Vigilance Portal
-------------------------------------------------------`;
    copyText(text, 'full');
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Official Government Receipt Container */}
      <div 
        id="citizen-report-receipt"
        className="bg-white border-2 border-slate-300 rounded-2xl shadow-xl overflow-hidden relative"
      >
        {/* Decorative Top Stamp Stripe */}
        <div className="h-2 w-full grid grid-cols-3">
          <div className="bg-[#FF9933]" />
          <div className="bg-[#FFFFFF] border-y border-slate-200" />
          <div className="bg-[#138808]" />
        </div>

        {/* Receipt Header */}
        <div className="bg-[#0B2545] text-white p-5 sm:p-6 text-center space-y-2 relative">
          <div className="flex items-center justify-center gap-2">
            <span className="font-serif font-bold text-amber-300 text-sm">सत्यमेव जयते</span>
            <span className="text-slate-400 text-xs">|</span>
            <span className="text-[11px] font-sans text-slate-200 uppercase tracking-wider font-semibold">
              Ministry of Coal &bull; Govt. of India
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Official Vigilance Filing Receipt
          </h2>
          <p className="text-[11px] text-slate-300 max-w-sm mx-auto">
            Khanan Prahari Environmental Surveillance Network &bull; Statutory Submission Slip
          </p>

          <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 text-emerald-200 border border-emerald-500/40 text-[11px] font-semibold px-3 py-1 rounded-full mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographically Logged &amp; Verified</span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Prominent Screenshot Notice Banner */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-3 text-amber-900">
            <Camera className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <strong className="block font-bold text-sm">
                Save this to check your report&apos;s status later.
              </strong>
              <p className="text-amber-800 text-[11px]">
                Take a screenshot or write down your <strong>Report ID</strong> and <strong>4-digit PIN</strong>. You will need both to track statutory investigation progress without logging in.
              </p>
            </div>
          </div>

          {/* Primary Key Credentials Display (ID + PIN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Report ID Box */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center space-y-1 relative group">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Public Report Reference ID
              </span>
              <div className="font-mono text-2xl font-black text-slate-900 tracking-wider">
                {report.id}
              </div>
              <button
                type="button"
                onClick={() => copyText(report.id, 'id')}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 mt-1 cursor-pointer"
              >
                {copiedField === 'id' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Tracking PIN Box */}
            <div className="bg-emerald-50/70 border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center space-y-1 relative group">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>Private Tracking PIN</span>
              </div>
              <div className="font-mono text-2xl font-black text-emerald-950 tracking-widest">
                {report.pin}
              </div>
              <button
                type="button"
                onClick={() => copyText(report.pin, 'pin')}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 mt-1 cursor-pointer"
              >
                {copiedField === 'pin' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy PIN</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs bg-slate-50/40">
            <div className="p-3 flex justify-between gap-2">
              <span className="text-slate-500 font-medium">Mine / Colliery Name:</span>
              <span className="font-bold text-slate-900 text-right">{report.mineName}</span>
            </div>
            <div className="p-3 flex justify-between gap-2">
              <span className="text-slate-500 font-medium">Village / Community Location:</span>
              <span className="font-bold text-slate-900 text-right">{report.village}</span>
            </div>
            <div className="p-3 flex justify-between gap-2">
              <span className="text-slate-500 font-medium">Violation Category:</span>
              <span className="font-bold text-slate-900 text-right">{report.category}</span>
            </div>
            <div className="p-3 flex justify-between gap-2">
              <span className="text-slate-500 font-medium">Date &amp; Time Logged:</span>
              <span className="font-semibold text-slate-700 text-right">{report.date} &bull; {report.timestamp}</span>
            </div>
            <div className="p-3 flex justify-between gap-2">
              <span className="text-slate-500 font-medium">Initial Surveillance Stage:</span>
              <span className="font-bold text-emerald-800 text-right">
                Stage 2: Satellite Cross-Check in Progress
              </span>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Surveillance Verification Workflow:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>
                Sentinel-2 optical &amp; Sentinel-1 InSAR radar satellite orbits scan your GPS coordinates.
              </li>
              <li>
                Estimated telemetry overpass cycle: <strong>Today within ~3.5 hours</strong>.
              </li>
              <li>
                If a breach is confirmed, an official Show-Cause Notice is issued to the mine operator.
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              id="btn-receipt-track-now"
              type="button"
              onClick={() => onTrackNow(report.id, report.pin)}
              className="w-full bg-[#138808] hover:bg-[#0f6b06] text-white font-bold text-sm py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              <span>Track This Report Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copyFullReceipt}
                className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedField === 'full' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Receipt Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Full Receipt</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onSubmitAnother}
                className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Submit Another Concern</span>
              </button>
            </div>
          </div>
        </div>

        {/* Receipt Bottom Cutout Effect */}
        <div className="bg-slate-100 p-3 text-center border-t border-slate-200">
          <span className="text-[10px] text-slate-500 font-mono tracking-wide">
            VERIFIED SECURE BY NATIONAL INFORMATICS CENTRE (NIC) &bull; GOVT OF INDIA
          </span>
        </div>
      </div>
    </div>
  );
}
