'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppState, User, GeneratedRoute, Booking, SavedRoute, RouteAuthor } from './types';
import { MOCK_ROUTES, MOCK_BOOKINGS, MOCK_SAVED_ROUTES } from './mockData';

const defaultUser: User = {
  id: '1',
  name: 'Александр Дашкевич',
  email: 'avdash14vich@gmail.com',
  phone: '+7 999 123-45-67',
  status: 'free',
  username: 'sashadash',
  rating: 4.6,
  reviewCount: 128,
  totalSaves: 340,
  coins: 2450,
  level: 7,
  stats: { routesCreated: 2, countriesVisited: 1 },
};

interface AppContextType extends AppState {
  login: (email: string, name: string) => void;
  logout: () => void;
  addRoute: (route: GeneratedRoute) => void;
  saveRoute: (route: GeneratedRoute, author: RouteAuthor) => void;
  publishRoute: (routeId: string) => void;
  upgradeToPermium: () => void;
  decrementAI: () => void;
  decrementGuide: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [routes, setRoutes] = useState<GeneratedRoute[]>(MOCK_ROUTES);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>(MOCK_SAVED_ROUTES);
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
    setRoutes(prev => [{ ...route, isOwnCreation: true }, ...prev]);
  };

  const saveRoute = (route: GeneratedRoute, author: RouteAuthor) => {
    const saved: SavedRoute = {
      ...route,
      id: `s_${route.id}_${Date.now()}`,
      originalAuthor: author,
      savedAt: new Date().toISOString(),
      isModified: false,
      isOwnCreation: false,
      isPublished: false,
    };
    setSavedRoutes(prev => [saved, ...prev]);
  };

  const publishRoute = (routeId: string) => {
    setRoutes(prev =>
      prev.map(r => r.id === routeId ? { ...r, isPublished: true } : r)
    );
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
      user, isAuthenticated, routes, savedRoutes, bookings,
      aiRequestsLeft, guideRequestsLeft,
      login, logout, addRoute, saveRoute, publishRoute,
      upgradeToPermium, decrementAI, decrementGuide,
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
