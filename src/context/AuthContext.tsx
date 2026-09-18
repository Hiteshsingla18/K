import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loginAs: (user: AuthUser) => void;
  logout: () => void;
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load session on initial mount
    const savedSession = localStorage.getItem('coalguard_session');
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const loginAs = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem('coalguard_session', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coalguard_session');
  };

  if (!isLoaded) return null; // Prevent flash of unauthenticated state

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      isAuthenticated: !!user,
      loginAs,
      logout
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
