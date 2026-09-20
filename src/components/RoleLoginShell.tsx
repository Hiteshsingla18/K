import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { ActiveRole } from '../types';
import KhananRakshakLogo from './KhananRakshakLogo';

export interface RoleLoginField {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  value?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

interface RoleLoginShellProps {
  role: ActiveRole;
  eyebrow: string;
  title: string;
  subtitle: string;
  fields: RoleLoginField[];
  demoLabel: string;
  theme: 'command' | 'coal' | 'mobile' | 'corporate';
  onAuthenticate: (role: ActiveRole) => void;
  onBack: () => void;
  footer?: React.ReactNode;
}

const themeClasses = {
  command: { page: 'bg-[#050B16] text-white', panel: 'bg-[#0B1728] border-cyan-500/30', accent: 'text-cyan-300', button: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' },
  coal: { page: 'bg-[#17120B] text-white', panel: 'bg-[#241A0D] border-amber-500/30', accent: 'text-amber-300', button: 'bg-amber-400 hover:bg-amber-300 text-slate-950' },
  mobile: { page: 'bg-emerald-50 text-slate-900', panel: 'bg-white border-emerald-200', accent: 'text-emerald-700', button: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  corporate: { page: 'bg-slate-100 text-slate-900', panel: 'bg-white border-blue-200', accent: 'text-blue-700', button: 'bg-blue-700 hover:bg-blue-800 text-white' }
};

export default function RoleLoginShell({
  role, eyebrow, title, subtitle, fields, demoLabel, theme, onAuthenticate, onBack, footer
}: RoleLoginShellProps) {
  const styles = themeClasses[theme];
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(field => [field.name, field.value ?? '']))
  );

  const updateValue = (name: string, value: string) => {
    setValues(current => ({ ...current, [name]: value }));
  };

  return (
    <main className={`min-h-screen ${styles.page} flex items-center justify-center p-4`}>
      <section className={`w-full max-w-5xl grid lg:grid-cols-[1fr_430px] gap-8 items-center`}>
        <div className="space-y-6">
          <button type="button" onClick={onBack} className={`text-xs font-semibold ${styles.accent} hover:underline`}>
            ← National Portal Directory
          </button>
          <KhananRakshakLogo />
          <div className="space-y-3">
            <p className={`text-[11px] uppercase tracking-[0.22em] font-bold ${styles.accent}`}>{eyebrow}</p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl">{title}</h1>
            <p className="text-sm opacity-70 max-w-xl leading-relaxed">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider opacity-70">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Role-bound session</span>
            <span className="inline-flex items-center gap-1.5"><LockKeyhole className="w-3.5 h-3.5" /> Encrypted gateway</span>
          </div>
        </div>

        <div className={`rounded-2xl border shadow-2xl p-6 sm:p-8 ${styles.panel}`}>
          <div className="mb-6">
            <div className={`text-[10px] uppercase tracking-widest font-bold ${styles.accent}`}>Authorized sign-in</div>
            <div className="text-xs opacity-60 mt-1">Access is restricted to the selected statutory role.</div>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onAuthenticate(role);
            }}
          >
            {fields.map(field => (
              <label key={field.name} className="block space-y-1.5">
                <span className="text-xs font-bold">{field.label}</span>
                <input
                  required
                  type={field.type ?? 'text'}
                  inputMode={field.inputMode}
                  value={values[field.name]}
                  onChange={event => updateValue(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-current/15 bg-black/10 px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-current/30"
                />
              </label>
            ))}
            <button type="submit" className={`w-full rounded-lg px-4 py-3 text-sm font-black transition-colors ${styles.button}`}>
              Enter {role === 'gov' ? 'Government Command' : role === 'officer' ? 'Officer Desk' : role === 'labour' ? 'Worker Portal' : 'Compliance Portal'}
              <ArrowRight className="inline-block w-4 h-4 ml-2" />
            </button>
          </form>
          <button
            type="button"
            onClick={() => onAuthenticate(role)}
            className="w-full mt-3 rounded-lg border border-current/20 px-4 py-2.5 text-xs font-bold hover:bg-black/10 transition-colors"
          >
            {demoLabel}
          </button>
          {footer}
          <div className="mt-6 pt-4 border-t border-current/10 flex items-center gap-2 text-[10px] opacity-60">
            <CheckCircle2 className="w-3.5 h-3.5" /> Demo mode remains available during connectivity interruptions.
          </div>
        </div>
      </section>
    </main>
  );
}
