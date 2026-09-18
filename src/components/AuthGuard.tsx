import React from 'react';
import { useAuth, GOV_OFFICER_USER, OPERATOR_USER, CITIZEN_USER, OFFICER_USER, LABOUR_USER } from '../context/AuthContext';
import { UserRole, AuthUser } from '../types';
import { Lock, ArrowRight, Home } from 'lucide-react';
import KhananRakshakLogo from './KhananRakshakLogo';

interface AuthGuardProps {
  requiredRole?: UserRole | UserRole[];
  children: React.ReactNode;
}

export default function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const { user, isAuthenticated, loginAs } = useAuth();

  const isAuthorized = () => {
    if (!isAuthenticated || !user) return false;
    if (!requiredRole) return true; // No specific role required, just auth
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  };

  if (isAuthorized()) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#081225] via-[#060D1A] to-[#03060C] flex flex-col items-center justify-center p-4">
      {/* Subtle National Tricolor Accent Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 grid grid-cols-3 z-30">
        <div className="bg-[#FF9933]" />
        <div className="bg-[#FFFFFF]" />
        <div className="bg-[#138808]" />
      </div>

      <div className="bg-white border-2 border-red-900/20 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-center animate-in zoom-in-95 duration-200">
        <div className="h-1.5 w-full bg-red-600" />
        
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border-4 border-red-100 mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            
            <h3 className="text-xl font-black text-[#0B2545] tracking-tight">
              Access Restricted
            </h3>
            <div className="text-xs font-semibold text-red-600 mt-1">
              Institutional Authentication Required
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm text-slate-700 leading-relaxed">
              You must be authenticated with a valid <strong className="text-[#0B2545]">Parichay 2.0 Identity</strong> or <strong className="text-[#0B2545]">MeriPehchaan</strong> credential with the appropriate role (<span className="font-mono text-xs bg-slate-200 px-1 py-0.5 rounded text-slate-800">{Array.isArray(requiredRole) ? requiredRole.join(' | ') : requiredRole || 'Any'}</span>) to access this secure portal.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                const routeRole = Array.isArray(requiredRole) ? requiredRole[0] : (requiredRole || 'gov');
                window.location.href = `/?login=${routeRole}`;
              }}
              className="w-full py-2.5 bg-[#0B2545] hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Official Credentials</span>
              <Lock className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to Gateway Home</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 opacity-50">
        <KhananRakshakLogo className="w-6 h-6 grayscale" />
        <span className="text-xs font-semibold tracking-widest uppercase text-slate-300">NIC &bull; MeitY &bull; DGMS</span>
      </div>
    </div>
  );
}
