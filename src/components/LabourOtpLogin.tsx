import RoleLoginShell from './RoleLoginShell';
import { ActiveRole } from '../types';

export default function LabourOtpLogin({ onAuthenticate, onBack }: { onAuthenticate: (role: ActiveRole) => void; onBack: () => void }) {
  return <RoleLoginShell
    role="labour"
    eyebrow="e-Shramik · श्रमिक पहचान सत्यापन"
    title="खनन श्रमिक उपस्थिति एवं सुरक्षा पोर्टल"
    subtitle="Khanan Shramik Portal · Check in for your shift, report near misses, and stay connected even in offline mode."
    fields={[
      { name: 'mobile', label: 'Registered 10-digit Mobile Number', placeholder: '98765 43210', inputMode: 'numeric' },
      { name: 'otp', label: '4-digit OTP', placeholder: 'Enter OTP', inputMode: 'numeric' }
    ]}
    demoLabel="Quick Fill Worker (Ramesh Soren)"
    theme="mobile"
    onAuthenticate={onAuthenticate}
    onBack={onBack}
    footer={<button type="button" className="w-full mt-4 text-xs font-bold text-emerald-700 hover:underline">Resend OTP <span className="opacity-60">(00:24)</span></button>}
  />;
}
