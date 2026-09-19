import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AuthUser, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const SESSION_DURATION_MS = 15 * 60 * 1000;

const toUserRole = (role: string): UserRole => {
  const roles: Record<string, UserRole> = {
    GOVT: 'gov',
    MINE_OFFICER: 'officer',
    LABOUR: 'labour',
    OPERATOR: 'operator',
    CITIZEN: 'citizen'
  };
  return roles[role] || 'citizen';
};

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loginAs: (user: AuthUser) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => void;
  sessionMessage: string | null;
  clearSessionMessage: () => void;
  sessionRemainingSeconds: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const GOV_OFFICER_USER: AuthUser = {
  role: 'gov',
  name: 'Dr. A. Sharma',
  designation: 'Deputy Director (Surveillance)',
  agency: 'DGMS / Ministry of Coal',
  badgeText: 'Restricted Officer Access (Tier-1)',
  avatarInitials: 'AS'
};

export const OPERATOR_USER: AuthUser = {
  role: 'operator',
  name: 'Eastern Coalfields Ltd (ECL)',
  designation: 'Rajmahal Area Colliery Office',
  agency: 'Eastern Coalfields Limited (CIL)',
  badgeText: 'Regulated Industry Portal (Coal India / Captive)',
  avatarInitials: 'EC'
};

export const CITIZEN_USER: AuthUser = {
  role: 'citizen',
  name: 'Citizen Observer',
  designation: 'Khanan Prahari Integrated Citizen Desk',
  agency: 'Public Environmental Vigilance',
  badgeText: 'Citizen Public Grievance',
  avatarInitials: 'KP'
};

export const OFFICER_USER: AuthUser = {
  role: 'officer',
  name: 'Er. Vikram Sengupta',
  designation: 'Senior Safety Officer (First Class Mgr #9041)',
  agency: 'DGMS / ECL Rajmahal Field Station',
  badgeText: 'Colliery Field Safety & CAPA Station',
  avatarInitials: 'VS',
  colliery: 'Rajmahal OCP'
};

export const LABOUR_USER: AuthUser = {
  role: 'labour',
  name: 'Ramesh Soren',
  designation: 'Drill & Heavy Equipment Operator',
  agency: 'Rajmahal Area Colliery Worker Desk',
  badgeText: 'Labour Mobile App & Offline Geofence',
  avatarInitials: 'RS',
  workerId: 'WKR-8812',
  colliery: 'Rajmahal OCP'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const explicitSignOut = useRef(false);
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionCountdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoaded(true);
      return;
    }

    let active = true;
    const clearSessionTimer = () => {
      if (sessionTimer.current) {
        clearTimeout(sessionTimer.current);
        sessionTimer.current = null;
      }
      if (sessionCountdownTimer.current) {
        clearInterval(sessionCountdownTimer.current);
        sessionCountdownTimer.current = null;
      }
      setSessionRemainingSeconds(null);
    };
    const startSessionTimer = () => {
      clearSessionTimer();
      const expiresAt = Date.now() + SESSION_DURATION_MS;
      const updateCountdown = () => {
        setSessionRemainingSeconds(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
      };
      updateCountdown();
      sessionCountdownTimer.current = setInterval(updateCountdown, 1000);
      sessionTimer.current = setTimeout(() => {
        setSessionRemainingSeconds(0);
        setSessionMessage('Your session has expired. Please sign in again.');
        void supabase.auth.signOut().catch(error => {
          console.error('Unable to end the expired Supabase session.', error);
        });
      }, SESSION_DURATION_MS);
    };
    const loadProfile = async (nextSession: Session) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, organization')
        .eq('id', nextSession.user.id)
        .single();
      if (error) throw error;
      if (active) {
        const displayName = data.full_name;
        setUser({
          role: toUserRole(data.role),
          name: displayName,
          designation: data.role,
          agency: data.organization || 'CoalGuard',
          badgeText: 'Authenticated Supabase session',
          avatarInitials: displayName.slice(0, 2).toUpperCase(),
        });
        setSession(nextSession);
      }
    };

    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          startSessionTimer();
          return loadProfile(data.session);
        }
        return undefined;
      })
      .catch(error => console.error('Unable to load Supabase profile.', error))
      .finally(() => active && setIsLoaded(true));

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!nextSession) {
        clearSessionTimer();
        setUser(null);
        setSession(null);
        if (!explicitSignOut.current) {
          setSessionMessage('Your session has expired. Please sign in again.');
        }
        explicitSignOut.current = false;
        return;
      }
      if (event === 'SIGNED_IN') {
        startSessionTimer();
        void loadProfile(nextSession).catch(error => {
          console.error('Unable to load Supabase profile after auth change.', error);
        });
      } else if (event === 'TOKEN_REFRESHED') {
        void loadProfile(nextSession).catch(error => {
          console.error('Unable to load Supabase profile after token refresh.', error);
        });
      }
    });

    return () => {
      active = false;
      clearSessionTimer();
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginAs = (newUser: AuthUser) => {
    setUser(newUser);
  };

  const logout = () => {
    if (sessionTimer.current) {
      clearTimeout(sessionTimer.current);
      sessionTimer.current = null;
    }
    if (sessionCountdownTimer.current) {
      clearInterval(sessionCountdownTimer.current);
      sessionCountdownTimer.current = null;
    }
    setSessionRemainingSeconds(null);
    setUser(null);
    setSession(null);
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    explicitSignOut.current = true;
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    logout();
  };

  const clearSessionMessage = () => setSessionMessage(null);

  if (!isLoaded) return null; // Prevent flash of unauthenticated state

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      isAuthenticated: !!user,
      loginAs,
      signIn,
      signOut,
      logout,
      sessionMessage,
      clearSessionMessage,
      sessionRemainingSeconds
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
