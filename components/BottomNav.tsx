'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, CalendarCheck, Sparkles, Newspaper, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BG = '#1C2733';
const BORDER = '#0F1620';
const ACTIVE = '#2EA6FF';
const INACTIVE = '#6D7C8B';

const tabs = [
  { href: '/history', icon: Map, label: 'Карта' },
  { href: '/bookings', icon: CalendarCheck, label: 'Трекер' },
  { href: '/search', icon: Sparkles, label: 'ИИ', center: true },
  { href: '/feed', icon: Newspaper, label: 'Лента' },
  { href: '/profile', icon: User, label: 'Профиль' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav"
      style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 60, paddingLeft: 8, paddingRight: 8 }}>
        {tabs.map(({ href, icon: Icon, label, center }) => {
          const active = pathname === href;

          if (center) {
            return (
              <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -20, textDecoration: 'none', position: 'relative' }}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: active ? '#1A80CC' : ACTIVE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 20px rgba(46,166,255,0.4)`,
                  }}
                >
                  <Icon size={24} color="#FFF" />
                </motion.div>
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? ACTIVE : INACTIVE, marginTop: 4, letterSpacing: 0.2 }}>
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 12px', textDecoration: 'none', position: 'relative' }}>
              {active && (
                <motion.div
                  layoutId="nav-dot"
                  style={{ position: 'absolute', top: 2, width: 4, height: 4, borderRadius: 2, backgroundColor: ACTIVE }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                />
              )}
              <Icon
                size={22}
                color={active ? ACTIVE : INACTIVE}
                strokeWidth={active ? 2.2 : 1.7}
              />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? ACTIVE : INACTIVE, letterSpacing: 0.2 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
