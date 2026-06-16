'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

export default function RootPage() {
  const { isAuthenticated } = useApp();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/search');
      } else {
        router.replace('/onboarding');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-dvh bg-[#F8FAFC]">
      <div className="text-center fade-in-up">
        <div className="text-5xl font-bold text-blue-600 tracking-tight mb-2">ROAMI</div>
        <div className="text-slate-400 text-sm">AI Travel Planner</div>
      </div>
    </div>
  );
}
