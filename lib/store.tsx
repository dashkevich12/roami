'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppState, User, GeneratedRoute, Booking } from './types';
import { MOCK_ROUTES, MOCK_BOOKINGS } from './mockData';

const defaultUser: User = {
  id: '1',
  name: 'Александр Дашкевич',
  email: 'avdash14vich@gmail.com',
  phone: '+7 999 123-45-67',
  status: 'free',
  stats: { routesCreated: 2, countriesVisited: 1 },
};

interface AppContextType extends AppState {
  login: (email: string, name: string) => void;
  logout: () => void;
  addRoute: (route: GeneratedRoute) => void;
  upgradeToPermium: () => void;
  decrementAI: () => void;
  decrementGuide: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [routes, setRoutes] = useState<GeneratedRoute[]>(MOCK_ROUTES);
  const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [aiRequestsLeft, setAiRequestsLeft] = useState(3);
  const [guideRequestsLeft, setGuideRequestsLeft] = useState(5);

  useEffect(() => {
    const stored = localStorage.getItem('roami_auth');
    if (stored) {
      const data = JSON.parse(stored);
      setUser(data.user);
      setIsAuthenticated(true);
      setAiRequestsLeft(data.aiRequestsLeft ?? 3);
      setGuideRequestsLeft(data.guideRequestsLeft ?? 5);
    }
  }, []);

  const save = (u: User, ai: number, guide: number) => {
    localStorage.setItem('roami_auth', JSON.stringify({ user: u, aiRequestsLeft: ai, guideRequestsLeft: guide }));
  };

  const login = (email: string, name: string) => {
    const u = { ...defaultUser, email, name };
    setUser(u);
    setIsAuthenticated(true);
    save(u, aiRequestsLeft, guideRequestsLeft);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('roami_auth');
  };

  const addRoute = (route: GeneratedRoute) => {
    setRoutes(prev => [route, ...prev]);
  };

  const upgradeToPermium = () => {
    if (!user) return;
    const u = { ...user, status: 'premium' as const };
    setUser(u);
    save(u, 999, 999);
    setAiRequestsLeft(999);
    setGuideRequestsLeft(999);
  };

  const decrementAI = () => {
    const next = Math.max(0, aiRequestsLeft - 1);
    setAiRequestsLeft(next);
    if (user) save(user, next, guideRequestsLeft);
  };

  const decrementGuide = () => {
    const next = Math.max(0, guideRequestsLeft - 1);
    setGuideRequestsLeft(next);
    if (user) save(user, aiRequestsLeft, next);
  };

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, routes, bookings,
      aiRequestsLeft, guideRequestsLeft,
      login, logout, addRoute, upgradeToPermium,
      decrementAI, decrementGuide,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
