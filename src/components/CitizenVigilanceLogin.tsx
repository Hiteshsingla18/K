import { Eye, Smartphone } from 'lucide-react';
import RoleLoginShell from './RoleLoginShell';
import { ActiveRole } from '../types';

export default function CitizenVigilanceLogin({ onAuthenticate, onBack }: { onAuthenticate: (role: ActiveRole) => void; onBack: () => void }) {
  return <RoleLoginShell
    role="citizen"
    eyebrow="Khanan Prahari · Public Environmental Vigilance"
    title="Report, verify, and protect your community."
    subtitle="A civic access point for geotagged environmental reports, unauthorized mining concerns, and public evidence."
    fields={[{ name: 'mobile', label: 'Mobile Number (optional for OTP)', placeholder: 'Enter mobile number', inputMode: 'numeric' }]}
    demoLabel="Continue Anonymously as Citizen Whistleblower"
    theme="mobile"
    onAuthenticate={onAuthenticate}
    onBack={onBack}
    footer={
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button type="button" onClick={() => onAuthenticate('citizen')} className="rounded-lg border border-emerald-200 p-3 text-[11px] font-bold text-emerald-800 hover:bg-emerald-50">
          <Smartphone className="w-4 h-4 mx-auto mb-1" /> Verify via Mobile OTP
        </button>
        <div className="rounded-lg border border-slate-200 p-3 text-[11px] font-bold text-slate-600 text-center">
          <Eye className="w-4 h-4 mx-auto mb-1" /> Public access enabled
        </div>
      </div>
    }
  />;
}
