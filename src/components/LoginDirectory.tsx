import { ArrowRight, Building2, Eye, HardHat, Satellite, Smartphone } from 'lucide-react';

interface LoginDirectoryProps {
  onOpen: (path: string) => void;
}

const portals = [
  { path: '/login/gov', title: 'Government Parichay SSO', subtitle: 'DGMS / Ministry of Coal command', icon: Satellite, color: 'cyan' },
  { path: '/login/officer', title: 'Mine Officer Service Desk', subtitle: 'DGMS Rule 29 field operations', icon: HardHat, color: 'amber' },
  { path: '/login/labour', title: 'Khanan Shramik Portal', subtitle: 'Mobile attendance and safety', icon: Smartphone, color: 'emerald' },
  { path: '/login/operator', title: 'Colliery Corporate Compliance', subtitle: 'ECL lease and SCN resolution', icon: Building2, color: 'blue' },
  { path: '/login/citizen', title: 'Khanan Prahari Vigilance', subtitle: 'Public environmental reporting', icon: Eye, color: 'teal' }
];

export default function LoginDirectory({ onOpen }: LoginDirectoryProps) {
  return (
    <main className="min-h-screen bg-[#071324] text-white flex items-center justify-center p-5">
      <section className="w-full max-w-5xl">
        <div className="max-w-2xl mb-8">
          <div className="text-cyan-300 text-[11px] font-bold uppercase tracking-[0.22em] mb-3">KhananRakshak AI · National Access Directory</div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">Choose your statutory access pathway.</h1>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">Every portal has a dedicated security layout and role-bound session. Select the identity route issued to you.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {portals.map(({ path, title, subtitle, icon: Icon }) => (
            <button key={path} type="button" onClick={() => onOpen(path)} className="text-left rounded-2xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800 hover:border-cyan-400/50 p-5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 flex items-center justify-center mb-5"><Icon className="w-5 h-5" /></div>
              <div className="font-bold text-base">{title}</div>
              <div className="text-xs text-slate-400 mt-1 min-h-8">{subtitle}</div>
              <div className="mt-5 text-xs font-bold text-cyan-300 flex items-center gap-2">Open secure login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
