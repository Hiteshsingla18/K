import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Building2, 
  Eye, 
  ArrowRight, 
  Lock, 
  Smartphone, 
  HardHat, 
  Satellite,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { ShieldAlert, Cpu, FileBadge, Factory, Bot } from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import KhananRakshakLogo from './KhananRakshakLogo';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import { 
  GOV_OFFICER_USER, 
  OPERATOR_USER, 
  CITIZEN_USER, 
  OFFICER_USER, 
  LABOUR_USER 
} from '../context/AuthContext';

interface AuthGatewayProps {
  onSelectRole: (user: AuthUser, route: string) => void;
  onSupabaseSignIn?: (email: string, password: string, route: string) => Promise<void>;
}

type ModalType = 'gov' | 'operator' | 'citizen' | 'officer' | 'labour' | null;

export default function AuthGateway({ onSelectRole, onSupabaseSignIn }: AuthGatewayProps) {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // Form state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Simulation states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState('');
  const [otpTimer, setOtpTimer] = useState(28);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const loginParam = params.get('login') as ModalType;
      if (loginParam && ['gov', 'operator', 'citizen', 'officer', 'labour'].includes(loginParam)) {
        setActiveModal(loginParam);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    let timer: any;
    if (activeModal === 'citizen' && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeModal, otpTimer]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const executeAuthSequence = (user: AuthUser, route: string, protocol: string) => {
    setIsVerifying(true);
    setVerifyStep(`Authenticating token with ${protocol}...`);

    setTimeout(() => {
      setVerifyStep('Verifying X.509 Digital Signature & Role Credentials...');
    }, 600);

    setTimeout(() => {
      setVerifyStep('Session Authorized. Launching secure console...');
    }, 1100);

    setTimeout(() => {
      setIsVerifying(false);
      onSelectRole(user, route);
    }, 1500);
  };

  // -------------------------------------------------------------
  // Form Submission Handlers
  // -------------------------------------------------------------
  const submitGov = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (onSupabaseSignIn) {
      if (!formData.email) errors.email = 'Email is required';
      if (!formData.password) errors.password = 'Password is required';
    } else {
      if (!formData.username) errors.username = 'Institutional Username is required';
      if (!formData.password) errors.password = 'Security Password is required';
    }
    if (!onSupabaseSignIn && (!formData.otp || formData.otp.length < 6)) {
      errors.otp = 'Valid 6-digit OTP is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (onSupabaseSignIn) {
      setIsVerifying(true);
      setVerifyStep('Authenticating with Supabase Auth...');
      try {
        await onSupabaseSignIn(formData.email, formData.password, '/command');
      } catch (error) {
        setIsVerifying(false);
        setFormErrors({
          auth: error instanceof Error ? error.message : 'Supabase authentication failed.'
        });
      }
      return;
    }

    executeAuthSequence(GOV_OFFICER_USER, '/command', 'Jan Parichay SSO');
  };

  const submitOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSupabaseSignIn) {
      void submitSupabaseCredentials(e, '/operator');
      return;
    }
    const errors: Record<string, string> = {};
    if (!formData.leaseCode) errors.leaseCode = 'Mine Lease Code is required';
    if (!formData.dscKey) errors.dscKey = 'Operator DSC Key is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    executeAuthSequence(OPERATOR_USER, '/operator', 'MeriPehchaan Industry Gateway');
  };

  const submitCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSupabaseSignIn) {
      void submitSupabaseCredentials(e, '/citizen');
      return;
    }
    const errors: Record<string, string> = {};
    if (!formData.mobile || formData.mobile.length < 10) errors.mobile = 'Valid 10-digit mobile number required';
    if (!formData.smsOtp || formData.smsOtp.length < 4) errors.smsOtp = 'Valid 4-digit OTP is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    executeAuthSequence(CITIZEN_USER, '/citizen', 'e-Pramaan Mobile Auth');
  };

  const submitGeneric = (e: React.FormEvent, user: AuthUser, route: string, protocol: string) => {
    e.preventDefault();
    if (onSupabaseSignIn) {
      void submitSupabaseCredentials(e, route);
      return;
    }
    const errors: Record<string, string> = {};
    if (!formData.userId) errors.userId = 'ID is required';
    if (!formData.secret) errors.secret = 'Secret is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    executeAuthSequence(user, route, protocol);
  };

  const submitSupabaseCredentials = async (e: React.FormEvent, route: string) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsVerifying(true);
    setVerifyStep('Authenticating portal account with Supabase Auth...');
    try {
      await onSupabaseSignIn?.(formData.email, formData.password, route);
    } catch (error) {
      setIsVerifying(false);
      setFormErrors({ auth: error instanceof Error ? error.message : 'Supabase authentication failed.' });
    }
  };

  const renderSupabaseCredentials = () => onSupabaseSignIn ? (
    <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wide text-blue-800">Supabase portal account</div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
        <input
          type="email"
          autoComplete="username"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? 'border-red-500' : 'border-slate-300'}`}
        />
        {formErrors.email && <p className="text-[10px] text-red-600 mt-1">{formErrors.email}</p>}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={formData.password || ''}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.password ? 'border-red-500' : 'border-slate-300'}`}
        />
        {formErrors.password && <p className="text-[10px] text-red-600 mt-1">{formErrors.password}</p>}
      </div>
      {formErrors.auth && <p className="text-xs text-red-600">{formErrors.auth}</p>}
    </div>
  ) : null;

  // -------------------------------------------------------------
  // Quick-Fill Handlers
  // -------------------------------------------------------------
  const autofillGov = () => {
    setFormData({ username: 'a.sharma@dgms.gov.in', password: '••••••••••••', otp: '482910' });
    setFormErrors({});
  };
  const autofillOperator = () => {
    setFormData({ leaseCode: 'ECL-RAJ-4492', dscKey: '••••••••••••••••' });
    setFormErrors({});
  };
  const autofillCitizen = () => {
    setFormData({ mobile: '9876543210', smsOtp: '4021' });
    setFormErrors({});
  };
  const autofillOfficer = () => {
    setFormData({ userId: 'VS-9041', secret: '••••••••' });
    setFormErrors({});
  };
  const autofillLabour = () => {
    setFormData({ userId: 'WKR-8812', secret: '••••' });
    setFormErrors({});
  };

  const portals = [
    {
      id: 'gov' as ModalType,
      title: t('auth.govRegulator'),
      badge: 'DGMS / MoC Command',
      icon: Satellite,
      desc: t('auth.govDesc'),
      persona: 'Dr. A. Sharma · Deputy Director (Surveillance)',
      accentBorder: 'border-[#B5D4C5] hover:border-[#2A5C45] group-hover:shadow-md',
      iconBg: 'bg-[#E6F2EC] text-[#2A5C45] border border-[#B5D4C5]',
      badgeBg: 'bg-[#E6F2EC] text-[#1B7A46] border border-[#B5D4C5]',
      btnBg: 'bg-[#2A5C45] hover:bg-[#1F4433]'
    },
    {
      id: 'officer' as ModalType,
      title: t('auth.mineOfficer'),
      badge: 'Safety, CV & Inspections',
      icon: HardHat,
      desc: t('auth.mineOfficerDesc'),
      persona: 'Er. V. Sengupta · Senior Safety Officer (First Class)',
      accentBorder: 'border-[#E5D2A8] hover:border-[#8B5E00] group-hover:shadow-md',
      iconBg: 'bg-[#FFF8E7] text-[#8B5E00] border border-[#E5D2A8]',
      badgeBg: 'bg-[#FFF8E7] text-[#8B5E00] border border-[#E5D2A8]',
      btnBg: 'bg-[#8B5E00] hover:bg-[#6B4800]'
    },
    {
      id: 'labour' as ModalType,
      title: t('auth.labourMobile'),
      badge: 'Shift Attendance & Near-Miss',
      icon: Smartphone,
      desc: t('auth.labourMobileDesc'),
      persona: 'Ramesh Soren · Excavator Operator (WKR-8812)',
      accentBorder: 'border-[#A3E0B5] hover:border-[#1B7A46] group-hover:shadow-md',
      iconBg: 'bg-[#EAFAF1] text-[#1B7A46] border border-[#A3E0B5]',
      badgeBg: 'bg-[#EAFAF1] text-[#1B7A46] border border-[#A3E0B5]',
      btnBg: 'bg-[#1B7A46] hover:bg-[#125B34]'
    },
    {
      id: 'operator' as ModalType,
      title: t('auth.operatorDesk'),
      badge: 'ECL / Compliance & SCN',
      icon: Building2,
      desc: t('auth.operatorDeskDesc'),
      persona: 'Rajmahal Colliery Office · Eastern Coalfields Ltd',
      accentBorder: 'border-[#E0BFA3] hover:border-[#B5601B] group-hover:shadow-md',
      iconBg: 'bg-[#FFF3E6] text-[#B5601B] border border-[#E0BFA3]',
      badgeBg: 'bg-[#FFF3E6] text-[#B5601B] border border-[#E0BFA3]',
      btnBg: 'bg-[#B5601B] hover:bg-[#8F4A13]'
    },
    {
      id: 'citizen' as ModalType,
      title: t('auth.citizenVigilance'),
      badge: 'Khanan Prahari Connect',
      icon: Eye,
      desc: t('auth.citizenDesc'),
      persona: 'Citizen Environmental Desk · Aadhaar / Mobile',
      accentBorder: 'border-[#A8C4B0] hover:border-[#3B7A5E] group-hover:shadow-md',
      iconBg: 'bg-[#F0F7F2] text-[#3B7A5E] border border-[#A8C4B0]',
      badgeBg: 'bg-[#F0F7F2] text-[#3B7A5E] border border-[#A8C4B0]',
      btnBg: 'bg-[#3B7A5E] hover:bg-[#2A5C45]'
    }
  ];

  const renderModalContent = () => {
    if (isVerifying) {
      return (
        <div className="p-8 flex flex-col items-center justify-center space-y-6">
          <div className="relative inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-emerald-400 shadow-[0_0_24px_rgba(6,182,212,0.4)] animate-pulse">
            <div className="bg-[#0A192F] p-2 rounded-full">
              <KhananRakshakLogo className="h-14 w-14" />
            </div>
          </div>
          <h3 className="text-lg font-black text-[#0B2545] tracking-tight">Authorizing Identity</h3>
          <div className="w-full space-y-2 text-left">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
                <span className="font-medium text-slate-700">{verifyStep}</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 animate-pulse rounded-full w-full" />
            </div>
          </div>
        </div>
      );
    }

    if (activeModal === 'gov') {
      return (
        <form onSubmit={submitGov} className="p-6 sm:p-8 space-y-5 text-left">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-black text-[#0B2545] tracking-tight">Jan Parichay SSO</h3>
              <div className="text-xs font-semibold text-blue-700">Directorate Surveillance Official</div>
            </div>
            <Lock className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
          
          <div className="space-y-4">
            {renderSupabaseCredentials()}
            {!onSupabaseSignIn && <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Username / Email</label>
              <input 
                type="text" 
                placeholder="officer.name@nic.in"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.username ? 'border-red-500' : 'border-slate-300'}`}
              />
              {formErrors.username && <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{formErrors.username}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Security Password</label>
              <input 
                type="password" 
                placeholder="••••••••••••"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.password ? 'border-red-500' : 'border-slate-300'}`}
              />
              {formErrors.password && <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{formErrors.password}</p>}
            </div>
            {!onSupabaseSignIn && <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">6-digit 2FA OTP / DSC PIN</label>
              <input 
                type="text" 
                placeholder="000000"
                maxLength={6}
                value={formData.otp || ''}
                onChange={(e) => handleInputChange('otp', e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.otp ? 'border-red-500' : 'border-slate-300'}`}
              />
              {formErrors.otp && <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{formErrors.otp}</p>}
            </div>}
            </>}
          </div>

          <div className="pt-2">
            <button type="button" onClick={autofillGov} className="text-[11px] text-blue-600 font-bold hover:underline mb-3 block">
              [Auto-Fill: Dr. A. Sharma (DGMS Deputy Director)]
            </button>
            <button type="submit" className="w-full py-2.5 bg-[#0B2545] hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2">
              <span>Verify & Launch Surveillance Command</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {formErrors.auth && <p className="text-xs text-red-600 mt-2">{formErrors.auth}</p>}
          </div>
        </form>
      );
    }

    if (activeModal === 'operator') {
      return (
        <form onSubmit={submitOperator} className="p-6 sm:p-8 space-y-5 text-left">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-black text-[#0B2545] tracking-tight">SPV Enterprise Login</h3>
              <div className="text-xs font-semibold text-blue-700">Colliery Lease Operator Desk</div>
            </div>
            <Building2 className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
          
          <div className="space-y-4">
            {renderSupabaseCredentials()}
            {!onSupabaseSignIn && <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mine Lease Code / Colliery ID</label>
              <input 
                type="text" 
                placeholder="ECL-RAJ-XXXX"
                value={formData.leaseCode || ''}
                onChange={(e) => handleInputChange('leaseCode', e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.leaseCode ? 'border-red-500' : 'border-slate-300'}`}
              />
              {formErrors.leaseCode && <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{formErrors.leaseCode}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Operator DSC Key / Password</label>
              <input 
                type="password" 
                placeholder="••••••••••••••••"
                value={formData.dscKey || ''}
                onChange={(e) => handleInputChange('dscKey', e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.dscKey ? 'border-red-500' : 'border-slate-300'}`}
              />
              {formErrors.dscKey && <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{formErrors.dscKey}</p>}
            </div>
            </>}
          </div>

          <div className="pt-2">
            <button type="button" onClick={autofillOperator} className="text-[11px] text-blue-600 font-bold hover:underline mb-3 block">
              [Auto-Fill: Er. K. Murmu (Rajmahal Area GM)]
            </button>
            <button type="submit" className="w-full py-2.5 bg-[#0B2545] hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2">
              <span>Verify Digital Token & Access Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      );
    }

    if (activeModal === 'citizen') {
      return (
        <form onSubmit={submitCitizen} className="p-6 sm:p-8 space-y-5 text-left">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-black text-[#0B2545] tracking-tight">e-Pramaan Mobile Auth</h3>
              <div className="text-xs font-semibold text-blue-700">Citizen Environmental Vigilance</div>
            </div>
            <Eye className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
          
          <div className="space-y-4">
            {renderSupabaseCredentials()}
            {!onSupabaseSignIn && <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
              <div className="flex relative">
                <span className="absolute left-3 top-2 text-sm text-slate-500">+91</span>
                <input 
                  type="text" 
                  placeholder="98765 43210"
                  maxLength={10}
                  value={formData.mobile || ''}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.mobile ? 'border-red-500' : 'border-slate-300'}`}
                />
              </div>
              {formErrors.mobile && <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{formErrors.mobile}</p>}
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-bold text-slate-700">4-digit SMS OTP</label>
                <span className={`text-[10px] font-medium ${otpTimer > 0 ? 'text-slate-400' : 'text-blue-600 hover:underline cursor-pointer'}`}>
                  {otpTimer > 0 ? `Resend OTP (${otpTimer}s)` : 'Resend OTP now'}
                </span>
              </div>
              <input 
                type="text" 
                placeholder="0000"
                maxLength={4}
                value={formData.smsOtp || ''}
                onChange={(e) => handleInputChange('smsOtp', e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.smsOtp ? 'border-red-500' : 'border-slate-300'}`}
              />
              {formErrors.smsOtp && <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{formErrors.smsOtp}</p>}
            </div>
            </>}
          </div>

          <div className="pt-2">
            <button type="button" onClick={autofillCitizen} className="text-[11px] text-blue-600 font-bold hover:underline mb-3 block">
              [Auto-Fill Demo Resident: +91 98765 43210]
            </button>
            <button type="submit" className="w-full py-2.5 bg-[#0B2545] hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2">
              <span>Verify Mobile Identity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      );
    }

    // Generic fallback for Officer/Labour (to maintain complete functionality)
    return (
      <form onSubmit={(e) => submitGeneric(e, activeModal === 'officer' ? OFFICER_USER : LABOUR_USER, `/${activeModal}`, 'Standard Auth')} className="p-6 sm:p-8 space-y-5 text-left">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-black text-[#0B2545] tracking-tight capitalize">{activeModal} Login</h3>
            <div className="text-xs font-semibold text-blue-700">Internal Auth Portal</div>
          </div>
        </div>
        <div className="space-y-4">
          {renderSupabaseCredentials()}
          {!onSupabaseSignIn && <>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ID</label>
            <input 
              type="text" 
              value={formData.userId || ''}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.userId ? 'border-red-500' : 'border-slate-300'}`}
            />
            {formErrors.userId && <p className="text-[10px] text-red-600 mt-1">{formErrors.userId}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Secret PIN</label>
            <input 
              type="password" 
              value={formData.secret || ''}
              onChange={(e) => handleInputChange('secret', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.secret ? 'border-red-500' : 'border-slate-300'}`}
            />
            {formErrors.secret && <p className="text-[10px] text-red-600 mt-1">{formErrors.secret}</p>}
          </div>
          </>}
        </div>
        <div className="pt-2">
          <button type="button" onClick={activeModal === 'officer' ? autofillOfficer : autofillLabour} className="text-[11px] text-blue-600 font-bold hover:underline mb-3 block">
            [Auto-Fill Demo]
          </button>
          <button type="submit" className="w-full py-2.5 bg-[#0B2545] hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2">
            <span>Authenticate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="h-screen w-full bg-[#F4F1EB] text-[#1A2810] flex flex-col justify-between p-4 md:p-6 overflow-hidden select-none relative" style={{fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"}}>
      {/* Subtle National Tricolor Accent Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 grid grid-cols-3 z-30">
        <div className="bg-[#FF9933]" />
        <div className="bg-[#FFFFFF]" />
        <div className="bg-[#138808]" />
      </div>

      {/* 1. TOP HEADER: Compact official emblem with logo, title & subtle NIC trust banner */}
      <header className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-[#DDD8CF]">
        {/* Left: Emblem & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <KhananRakshakLogo className="h-10 w-10 md:h-11 md:w-11" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[#1A2810] truncate">
                {t('auth.title')}
              </h1>
            </div>
            <div className="text-xs text-[#5C6B57] font-medium truncate flex items-center gap-2">
              <span>{t('auth.ministry')}</span>
              <span className="text-[#8FA08A]">&bull;</span>
              <span>{t('auth.dgms')}</span>
            </div>
          </div>
        </div>

        {/* Right: Subtle National Informatics Centre / Parichay SSO Trust Banner */}
        <div className="shrink-0 flex items-center gap-3">
          <LanguageToggle />
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white border border-[#DDD8CF] shadow-sm text-xs text-[#5C6B57]">
            <div className="w-2 h-2 rounded-full bg-[#1B7A46] animate-pulse" />
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#2A5C45]" />
              <span className="font-semibold text-[#1A2810]">National Informatics Centre (NIC)</span>
            </div>
            <span className="text-[#DDD8CF] hidden md:inline">|</span>
            <span className="hidden md:inline">Parichay 2.0 SSO Verified &bull; TLS 1.3</span>
          </div>
        </div>
      </header>

      {/* 2. 5-PORTAL CARD GRID (Single Screen Fit, Zero Scroll) */}
      <main className="flex-1 flex flex-col justify-center my-auto py-2 min-h-0 relative z-10">
        <div className="mb-2.5 text-center md:text-left flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1A2810] tracking-tight">
              {t('auth.selectTier')}
            </h2>
            <p className="text-xs text-[#5C6B57]">
              {t('auth.ssoDesc')}
            </p>
          </div>
          <span className="hidden lg:inline-block text-[11px] text-[#5C6B57] font-mono bg-white border border-[#DDD8CF] shadow-sm px-2.5 py-1 rounded">
            Node: NIC-DEL-CLUST-04 &bull; MeghRaj Cloud
          </span>
        </div>

        {/* 5-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 lg:gap-3.5 h-[62vh] max-h-[460px] min-h-[320px]">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                className={`group relative bg-white border-[#DDD8CF] border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 shadow-sm ${portal.accentBorder}`}
              >
                {/* Top: Icon & Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${portal.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider truncate max-w-[135px] ${portal.badgeBg}`}>
                      {portal.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm lg:text-base font-bold text-[#1A2810] tracking-tight leading-snug group-hover:text-[#2A5C45] transition-colors">
                    {portal.title}
                  </h3>

                  {/* 1-Line Description */}
                  <p className="text-xs text-[#5C6B57] leading-relaxed mt-1.5 line-clamp-3">
                    {portal.desc}
                  </p>
                </div>

                {/* Bottom: Persona preview & CTA button */}
                <div className="pt-2 border-t border-[#EDE9E2] space-y-2.5">
                  <div className="text-[10px] text-[#5C6B57] bg-[#FAF8F4] border border-[#DDD8CF] rounded px-2 py-1 truncate">
                    <span className="text-[#8FA08A] font-mono mr-1">Auth:</span>
                    <span className="font-medium text-[#1A2810]">{portal.persona}</span>
                  </div>

                  <button
                    id={portal.id === 'gov' ? 'btn-login-gov' : undefined}
                    onClick={() => {
                      setFormData({});
                      setFormErrors({});
                      setOtpTimer(28);
                      setActiveModal(portal.id);
                    }}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${portal.btnBg}`}
                  >
                    <span>{t('auth.accessPortal')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3. MINIMALIST SINGLE-LINE COMPACT FOOTER */}
      <footer className="shrink-0 pt-2.5 border-t border-[#DDD8CF] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#5C6B57] relative z-10">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2A5C45] shrink-0" />
          <span className="text-[#1A2810] font-medium">
            Ministry of Coal &bull; Directorate General of Mines Safety (DGMS) &bull; Compliance Architecture
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#5C6B57] text-[10px]">
          <span>GIGW 2.0 &bull; STQC Audited</span>
          <span>&bull;</span>
          <span>&copy; {new Date().getFullYear()} Govt. of India</span>
        </div>
      </footer>

      {/* Interactive Login Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#DDD8CF] rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Top Tricolor Strip */}
            <div className="h-1.5 w-full grid grid-cols-3">
              <div className="bg-[#FF9933]" />
              <div className="bg-[#FFFFFF]" />
              <div className="bg-[#138808]" />
            </div>

            {!isVerifying && (
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-[#8FA08A] hover:text-[#1A2810] transition-colors z-10 cursor-pointer bg-[#FAF8F4] hover:bg-[#EDE9E2] p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
}
