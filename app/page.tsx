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
        router.replace('/feed');
      } else {
        router.replace('/onboarding');
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', backgroundColor: '#17212B' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#2EA6FF', fontSize: 42, fontWeight: 800, letterSpacing: -1.5, marginBottom: 6 }}>ROAMI</div>
        <div style={{ color: '#6D7C8B', fontSize: 13 }}>AI Travel Planner</div>
      </div>
    </div>
  );
}
