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
import { AuthUser, UserRole } from '../types';
import KhananRakshakLogo from './KhananRakshakLogo';
import { 
  GOV_OFFICER_USER, 
  OPERATOR_USER, 
  CITIZEN_USER, 
  OFFICER_USER, 
  LABOUR_USER 
} from '../context/AuthContext';

interface AuthGatewayProps {
  onSelectRole: (user: AuthUser, route: string) => void;
}

type ModalType = 'gov' | 'operator' | 'citizen' | 'officer' | 'labour' | null;

export default function AuthGateway({ onSelectRole }: AuthGatewayProps) {
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
  const submitGov = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.username) errors.username = 'Institutional Username is required';
    if (!formData.password) errors.password = 'Security Password is required';
    if (!formData.otp || formData.otp.length < 6) errors.otp = 'Valid 6-digit OTP is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    executeAuthSequence(GOV_OFFICER_USER, '/command', 'Jan Parichay SSO');
  };

  const submitOperator = (e: React.FormEvent) => {
    e.preventDefault();
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
    const errors: Record<string, string> = {};
    if (!formData.userId) errors.userId = 'ID is required';
    if (!formData.secret) errors.secret = 'Secret is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    executeAuthSequence(user, route, protocol);
  };

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
      title: 'Government & Regulator',
      badge: 'DGMS / MoC Command',
      icon: Satellite,
      desc: 'Real-time radar satellite surveillance, boundary AI audits & statutory show-cause notices.',
      persona: 'Dr. A. Sharma · Deputy Director (Surveillance)',
      accentBorder: 'border-cyan-500/30 hover:border-cyan-400 group-hover:shadow-[0_0_24px_rgba(6,182,212,0.22)]',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
      btnBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
    },
    {
      id: 'officer' as ModalType,
      title: 'Mine Officer Portal',
      badge: 'Safety, CV & Inspections',
      icon: HardHat,
      desc: 'Live pit CCTV PPE computer vision, environmental gas telemetry & instant CAPA dispatch.',
      persona: 'Er. V. Sengupta · Senior Safety Officer (First Class)',
      accentBorder: 'border-amber-500/30 hover:border-amber-400 group-hover:shadow-[0_0_24px_rgba(245,158,11,0.22)]',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      badgeBg: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
      btnBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500'
    },
    {
      id: 'labour' as ModalType,
      title: 'Labour Mobile Portal',
      badge: 'Shift Attendance & Near-Miss',
      icon: Smartphone,
      desc: 'Offline subterranean shift check-in, bilingual voice memos & near-miss hazard reports.',
      persona: 'Ramesh Soren · Excavator Operator (WKR-8812)',
      accentBorder: 'border-emerald-500/30 hover:border-emerald-400 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.22)]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
      btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
    },
    {
      id: 'operator' as ModalType,
      title: 'Colliery Operator Desk',
      badge: 'ECL / Compliance & SCN',
      icon: Building2,
      desc: 'Statutory SCN clarification replies, DGPS lease boundary overlays & compliance filings.',
      persona: 'Rajmahal Colliery Office · Eastern Coalfields Ltd',
      accentBorder: 'border-blue-500/30 hover:border-blue-400 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.22)]',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      badgeBg: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
      btnBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
    },
    {
      id: 'citizen' as ModalType,
      title: 'Citizen Vigilance',
      badge: 'Khanan Prahari Complaints',
      icon: Eye,
      desc: 'Geotagged community reporting of unauthorized mining, dust pollution & blasting tremors.',
      persona: 'Citizen Environmental Desk · Aadhaar / Mobile OTP',
      accentBorder: 'border-teal-500/30 hover:border-teal-400 group-hover:shadow-[0_0_24px_rgba(20,184,166,0.22)]',
      iconBg: 'bg-teal-500/10 text-teal-400 border border-teal-500/30',
      badgeBg: 'bg-teal-500/10 text-teal-300 border border-teal-500/30',
      btnBg: 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500'
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
            <div>
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
            </div>
          </div>

          <div className="pt-2">
            <button type="button" onClick={autofillGov} className="text-[11px] text-blue-600 font-bold hover:underline mb-3 block">
              [Auto-Fill: Dr. A. Sharma (DGMS Deputy Director)]
            </button>
            <button type="submit" className="w-full py-2.5 bg-[#0B2545] hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2">
              <span>Verify & Launch Surveillance Command</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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
    <div className="h-screen w-full bg-gradient-to-b from-[#081225] via-[#060D1A] to-[#03060C] text-slate-100 flex flex-col justify-between p-4 md:p-6 overflow-hidden select-none relative">
      {/* Subtle National Tricolor Accent Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 grid grid-cols-3 z-30">
        <div className="bg-[#FF9933]" />
        <div className="bg-[#FFFFFF]" />
        <div className="bg-[#138808]" />
      </div>

      {/* 1. TOP HEADER: Compact official emblem with logo, title & subtle NIC trust banner */}
      <header className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        {/* Left: Emblem, Title & SIH26024 Tag */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <KhananRakshakLogo className="h-10 w-10 md:h-11 md:w-11" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                K | AI-Based Smart Governance &amp; Compliance System
              </h1>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-500/40 shrink-0">
                SIH26024
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium truncate flex items-center gap-2">
              <span>कोयला मंत्रालय &bull; Ministry of Coal</span>
              <span className="text-slate-600">&bull;</span>
              <span>Directorate General of Mines Safety (DGMS)</span>
            </div>
          </div>
        </div>

        {/* Right: Subtle National Informatics Centre / Parichay SSO Trust Banner */}
        <div className="shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">National Informatics Centre (NIC)</span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">Parichay 2.0 SSO Verified &bull; TLS 1.3</span>
        </div>
      </header>

      {/* 2. 5-PORTAL CARD GRID (Single Screen Fit, Zero Scroll) */}
      <main className="flex-1 flex flex-col justify-center my-auto py-2 min-h-0 relative z-10">
        <div className="mb-2.5 text-center md:text-left flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Select Authorized Access Tier
            </h2>
            <p className="text-xs text-slate-400">
              Role-governed single sign-on with cryptographic credentials and digital identity verification.
            </p>
          </div>
          <span className="hidden lg:inline-block text-[11px] text-slate-400 font-mono bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded">
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
                className={`group relative bg-[#0C192E]/90 hover:bg-[#0F213E] border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 shadow-lg ${portal.accentBorder}`}
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
                  <h3 className="text-sm lg:text-base font-bold text-white tracking-tight leading-snug group-hover:text-cyan-200 transition-colors">
                    {portal.title}
                  </h3>

                  {/* 1-Line Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5 line-clamp-3">
                    {portal.desc}
                  </p>
                </div>

                {/* Bottom: Persona preview & CTA button */}
                <div className="pt-2 border-t border-slate-800/70 space-y-2.5">
                  <div className="text-[10px] text-slate-400 bg-slate-900/80 border border-slate-800/90 rounded px-2 py-1 truncate">
                    <span className="text-slate-500 font-mono mr-1">Auth:</span>
                    <span className="text-slate-300 font-medium">{portal.persona}</span>
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
                    <span>Access Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3. MINIMALIST SINGLE-LINE COMPACT FOOTER */}
      <footer className="shrink-0 pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-300 font-medium">
            Ministry of Coal &bull; Directorate General of Mines Safety (DGMS) &bull; SIH26024 Compliance Architecture
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-[10px]">
          <span>GIGW 2.0 &bull; STQC Audited</span>
          <span>&bull;</span>
          <span>&copy; {new Date().getFullYear()} Govt. of India</span>
        </div>
      </footer>

      {/* Interactive Login Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-[#06101E]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#0B2545] rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Top Tricolor Strip */}
            <div className="h-1.5 w-full grid grid-cols-3">
              <div className="bg-[#FF9933]" />
              <div className="bg-[#FFFFFF]" />
              <div className="bg-[#138808]" />
            </div>

            {!isVerifying && (
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors z-10 cursor-pointer bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
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
