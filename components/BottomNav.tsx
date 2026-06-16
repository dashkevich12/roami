'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, Calendar, Search, User, Compass } from 'lucide-react';

const tabs = [
  { href: '/history', icon: History, label: 'История' },
  { href: '/bookings', icon: Calendar, label: 'Брони' },
  { href: '/search', icon: Search, label: 'Поиск', center: true },
  { href: '/profile', icon: User, label: 'Профиль' },
  { href: '/guide', icon: Compass, label: 'Гид' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav bg-white border-t border-slate-100 shadow-lg">
      <div className="flex items-center justify-around px-2 h-[60px]">
        {tabs.map(({ href, icon: Icon, label, center }) => {
          const active = pathname === href;

          if (center) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center -mt-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
                  active
                    ? 'bg-blue-700 scale-105'
                    : 'bg-blue-600'
                }`}>
                  <Icon size={24} className="text-white" />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 py-1 px-3">
              <Icon
                size={22}
                className={`transition-colors ${active ? 'text-blue-600' : 'text-slate-400'}`}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
}
