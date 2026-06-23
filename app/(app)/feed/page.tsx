'use client';

import { useState } from 'react';
import { Search, Bookmark, BookmarkCheck, Star, MapPin, Flame, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import type { GeneratedRoute, RouteAuthor } from '@/lib/types';

const BG = '#17212B';
const CARD = '#1C2733';
const CARD2 = '#243447';
const BLUE = '#2EA6FF';
const TEXT = '#E8F1F8';
const GREY = '#8899A8';
const DIM = '#4A5C6A';
const GOLD = '#F59E0B';

// --- Mock feed data (not from store, simulates public content) ---

const HOT_DEALS = [
  { id: 'h1', city: 'Дубай', emoji: '🇦🇪', price: '28 900 ₽', oldPrice: '52 000 ₽', days: 7, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
  { id: 'h2', city: 'Стамбул', emoji: '🇹🇷', price: '14 200 ₽', oldPrice: '22 000 ₽', days: 5, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80' },
  { id: 'h3', city: 'Бали', emoji: '🇮🇩', price: '42 500 ₽', oldPrice: '68 000 ₽', days: 10, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
  { id: 'h4', city: 'Токио', emoji: '🇯🇵', price: '55 000 ₽', oldPrice: '82 000 ₽', days: 8, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
];

const WEEKEND_SPOTS = [
  { id: 'w1', city: 'Калининград', emoji: '🇷🇺', temp: '+18°', tag: 'Пляж' },
  { id: 'w2', city: 'Сочи', emoji: '🌊', temp: '+26°', tag: 'Море' },
  { id: 'w3', city: 'Казань', emoji: '🕌', temp: '+22°', tag: 'Культура' },
  { id: 'w4', city: 'Питер', emoji: '🌉', temp: '+20°', tag: 'Архит.' },
  { id: 'w5', city: 'Алматы', emoji: '⛰️', temp: '+24°', tag: 'Горы' },
];

const EVENTS = [
  { id: 'e1', title: 'Белые ночи', city: 'Санкт-Петербург', dates: '21–27 июля', emoji: '🌃', color: '#1A3350' },
  { id: 'e2', title: 'Виноградный фестиваль', city: 'Кахетия, Грузия', dates: '10–12 авг', emoji: '🍇', color: '#2D1F40' },
  { id: 'e3', title: 'Фестиваль фонарей', city: 'Чиангмай, Таиланд', dates: '5 нояб', emoji: '🏮', color: '#2B1E10' },
];

const PUBLIC_ROUTES: (GeneratedRoute & { authorName: string; authorInitial: string; authorRating: number; saves: number; reviews: number })[] = [
  {
    id: 'p1',
    destination: 'Стамбул',
    country: 'Турция',
    coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    dateFrom: '2026-08-10',
    dateTo: '2026-08-17',
    status: 'upcoming',
    budget: 'средний',
    totalCost: '65 000 ₽',
    transfer: { toAirport: 'Аэроэкспресс', cost: '500 ₽' },
    flight: { from: 'Москва (SVO)', to: 'Стамбул (IST)', airline: 'Turkish Airlines', departure: '07:30', arrival: '10:45', price: '18 000 ₽', aviasalesUrl: '#' },
    hotel: { name: 'Four Seasons Bosphorus', stars: 5, address: 'Beşiktaş, Стамбул', price: '8 500 ₽/ночь', bookingUrl: '#' },
    days: [],
    createdAt: '2026-06-01T00:00:00Z',
    authorName: 'Максим К.',
    authorInitial: 'М',
    authorRating: 4.8,
    saves: 312,
    reviews: 24,
  },
  {
    id: 'p2',
    destination: 'Бали',
    country: 'Индонезия',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    dateFrom: '2026-09-05',
    dateTo: '2026-09-15',
    status: 'upcoming',
    budget: 'бизнес',
    totalCost: '180 000 ₽',
    transfer: { toAirport: 'Такси', cost: '1 200 ₽' },
    flight: { from: 'Москва (SVO)', to: 'Денпасар (DPS)', airline: 'Singapore Air', departure: '22:10', arrival: '18:00 +1', price: '72 000 ₽', aviasalesUrl: '#' },
    hotel: { name: 'Komaneka at Bisma', stars: 5, address: 'Убуд, Бали', price: '14 000 ₽/ночь', bookingUrl: '#' },
    days: [],
    createdAt: '2026-05-20T00:00:00Z',
    authorName: 'Анна П.',
    authorInitial: 'А',
    authorRating: 4.9,
    saves: 489,
    reviews: 41,
  },
  {
    id: 'p3',
    destination: 'Прага',
    country: 'Чехия',
    coverImage: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80',
    dateFrom: '2026-10-01',
    dateTo: '2026-10-07',
    status: 'upcoming',
    budget: 'эконом',
    totalCost: '45 000 ₽',
    transfer: { toAirport: 'Метро', cost: '55 ₽' },
    flight: { from: 'Москва (SVO)', to: 'Прага (PRG)', airline: 'Czech Airlines', departure: '11:00', arrival: '12:30', price: '15 000 ₽', aviasalesUrl: '#' },
    hotel: { name: 'Augustine Hotel', stars: 4, address: 'Staré Město, Прага', price: '5 000 ₽/ночь', bookingUrl: '#' },
    days: [],
    createdAt: '2026-06-05T00:00:00Z',
    authorName: 'Сергей В.',
    authorInitial: 'С',
    authorRating: 4.6,
    saves: 178,
    reviews: 15,
  },
  {
    id: 'p4',
    destination: 'Мальдивы',
    country: 'Мальдивы',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    dateFrom: '2026-11-20',
    dateTo: '2026-11-30',
    status: 'upcoming',
    budget: 'бизнес',
    totalCost: '320 000 ₽',
    transfer: { toAirport: 'Такси', cost: '1 500 ₽' },
    flight: { from: 'Москва (SVO)', to: 'Мале (MLE)', airline: 'Emirates', departure: '10:00', arrival: '20:30', price: '95 000 ₽', aviasalesUrl: '#' },
    hotel: { name: 'Gili Lankanfushi', stars: 5, address: 'Северный атолл Мале', price: '45 000 ₽/ночь', bookingUrl: '#' },
    days: [],
    createdAt: '2026-06-10T00:00:00Z',
    authorName: 'Ольга Р.',
    authorInitial: 'О',
    authorRating: 4.7,
    saves: 621,
    reviews: 52,
  },
];

const BUDGET_COLOR: Record<string, string> = {
  'эконом': '#4ADE80',
  'средний': BLUE,
  'бизнес': GOLD,
};

function formatDateRange(from: string, to: string) {
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const a = new Date(from), b = new Date(to);
  const days = Math.round((b.getTime() - a.getTime()) / 86400000);
  return `${a.getDate()} ${months[a.getMonth()]} – ${b.getDate()} ${months[b.getMonth()]} · ${days} дн.`;
}

// --- Subcomponents ---

function HotDealCard({ deal }: { deal: typeof HOT_DEALS[0] }) {
  const discount = Math.round((1 - parseInt(deal.price.replace(/\D/g, '')) / parseInt(deal.oldPrice.replace(/\D/g, ''))) * 100);
  return (
    <div style={{ flexShrink: 0, width: 160, borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
      <img src={deal.img} alt={deal.city} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 60%, transparent)' }} />
      <div style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#F2585B', borderRadius: 8, padding: '3px 8px' }}>
        <span style={{ color: '#FFF', fontSize: 11, fontWeight: 700 }}>-{discount}%</span>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px' }}>
        <div style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>{deal.emoji} {deal.city}</div>
        <div style={{ color: GREY, fontSize: 11, marginTop: 2 }}>{deal.days} дней</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
          <span style={{ color: '#4ADE80', fontSize: 14, fontWeight: 700 }}>{deal.price}</span>
          <span style={{ color: DIM, fontSize: 11, textDecoration: 'line-through' }}>{deal.oldPrice}</span>
        </div>
      </div>
    </div>
  );
}

function WeekendChip({ spot }: { spot: typeof WEEKEND_SPOTS[0] }) {
  return (
    <div style={{ flexShrink: 0, backgroundColor: CARD2, borderRadius: 14, padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', minWidth: 80 }}>
      <span style={{ fontSize: 24 }}>{spot.emoji}</span>
      <span style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{spot.city}</span>
      <span style={{ color: GREY, fontSize: 11 }}>{spot.temp}</span>
      <div style={{ backgroundColor: 'rgba(46,166,255,0.15)', borderRadius: 6, padding: '2px 8px' }}>
        <span style={{ color: BLUE, fontSize: 10, fontWeight: 600 }}>{spot.tag}</span>
      </div>
    </div>
  );
}

function EventCard({ ev }: { ev: typeof EVENTS[0] }) {
  return (
    <div style={{ backgroundColor: ev.color, borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: 32, flexShrink: 0 }}>{ev.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: TEXT, fontSize: 15, fontWeight: 600 }}>{ev.title}</div>
        <div style={{ color: GREY, fontSize: 13, marginTop: 2 }}>{ev.city}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 10px' }}>
          <span style={{ color: GREY, fontSize: 11, fontWeight: 500 }}>{ev.dates}</span>
        </div>
      </div>
    </div>
  );
}

function PublicRouteCard({ route, onSave, isSaved }: {
  route: typeof PUBLIC_ROUTES[0];
  onSave: () => void;
  isSaved: boolean;
}) {
  return (
    <motion.div
      layout
      style={{ backgroundColor: CARD, borderRadius: 18, overflow: 'hidden', marginBottom: 12 }}
    >
      <div style={{ position: 'relative' }}>
        <img src={route.coverImage} alt={route.destination} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 40%, transparent)' }} />

        <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{route.budget}</span>
          <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: BUDGET_COLOR[route.budget] ?? GREY }} />
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onSave}
          style={{ position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: 12, backgroundColor: isSaved ? BLUE : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
        >
          {isSaved
            ? <BookmarkCheck size={18} color="#FFF" />
            : <Bookmark size={18} color="#FFF" />
          }
        </motion.button>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
          <div style={{ color: TEXT, fontSize: 20, fontWeight: 700 }}>{route.destination}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{route.country} · {formatDateRange(route.dateFrom, route.dateTo)}</div>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#FFF', fontSize: 13, fontWeight: 700 }}>{route.authorInitial}</span>
            </div>
            <div>
              <div style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{route.authorName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star size={10} fill={GOLD} color={GOLD} />
                <span style={{ color: GREY, fontSize: 11 }}>{route.authorRating}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: TEXT, fontSize: 16, fontWeight: 700 }}>{route.totalCost}</div>
            <div style={{ color: GREY, fontSize: 11 }}>весь тур</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Bookmark size={13} color={GREY} />
            <span style={{ color: GREY, fontSize: 12 }}>{route.saves} сохранений</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Star size={13} color={GREY} />
            <span style={{ color: GREY, fontSize: 12 }}>{route.reviews} отзывов</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Page ---

export default function FeedPage() {
  const { saveRoute } = useApp();
  const [activeTab, setActiveTab] = useState<'recs' | 'routes'>('recs');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSave = (route: typeof PUBLIC_ROUTES[0]) => {
    if (savedIds.has(route.id)) return;
    setSavedIds(prev => new Set([...prev, route.id]));
    const author: RouteAuthor = { id: `u_${route.id}`, name: route.authorName, initial: route.authorInitial, rating: route.authorRating };
    saveRoute(route, author);
  };

  const filtered = PUBLIC_ROUTES.filter(r =>
    !searchQuery || r.destination.toLowerCase().includes(searchQuery.toLowerCase()) || r.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: BG, minHeight: '100dvh', paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ padding: '56px 20px 16px', backgroundColor: BG, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ color: BLUE, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Лента</div>
          <div style={{ backgroundColor: 'rgba(46,166,255,0.12)', borderRadius: 10, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} color={BLUE} />
            <span style={{ color: BLUE, fontSize: 13, fontWeight: 600 }}>ИИ-подборка</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={16} color={searchFocused ? BLUE : GREY} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }} />
          <input
            type="text"
            placeholder="Поиск маршрутов..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
              backgroundColor: CARD,
              border: `1.5px solid ${searchFocused ? BLUE : 'transparent'}`,
              borderRadius: 14,
              padding: '12px 16px 12px 40px',
              color: TEXT,
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, backgroundColor: CARD, borderRadius: 14, padding: 4, position: 'relative' }}>
          {(['recs', 'routes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ flex: 1, position: 'relative', padding: '9px 0', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 11, overflow: 'hidden' }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="feed-tab-bg"
                  style={{ position: 'absolute', inset: 0, backgroundColor: CARD2, borderRadius: 11 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                />
              )}
              <span style={{ position: 'relative', color: activeTab === tab ? TEXT : GREY, fontSize: 14, fontWeight: activeTab === tab ? 600 : 400, transition: 'color 0.2s' }}>
                {tab === 'recs' ? '✨ Рекомендации' : '🗺 Маршруты'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait" initial={false}>

        {/* Рекомендации */}
        {activeTab === 'recs' && (
          <motion.div
            key="recs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{ padding: '0 0 8px' }}
          >
            {/* Hot deals */}
            <div style={{ padding: '20px 0 4px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Flame size={18} color="#F2585B" />
                <span style={{ color: TEXT, fontSize: 17, fontWeight: 700 }}>Горящие предложения</span>
              </div>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingRight: 20, scrollbarWidth: 'none' }}>
                {HOT_DEALS.map(deal => <HotDealCard key={deal.id} deal={deal} />)}
              </div>
            </div>

            {/* Weekend */}
            <div style={{ padding: '20px 0 4px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color={BLUE} />
                  <span style={{ color: TEXT, fontSize: 17, fontWeight: 700 }}>Куда улететь на выходных</span>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: BLUE }}>
                  <ChevronRight size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingRight: 20, scrollbarWidth: 'none' }}>
                {WEEKEND_SPOTS.map(spot => <WeekendChip key={spot.id} spot={spot} />)}
              </div>
            </div>

            {/* Events */}
            <div style={{ padding: '20px 20px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Calendar size={18} color={GOLD} />
                <span style={{ color: TEXT, fontSize: 17, fontWeight: 700 }}>События мира</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {EVENTS.map(ev => <EventCard key={ev.id} ev={ev} />)}
              </div>
            </div>

            {/* AI banner */}
            <div style={{ margin: '20px 20px 4px', background: 'linear-gradient(135deg, #1A3550 0%, #0F2340 100%)', borderRadius: 18, padding: '20px', border: '1px solid rgba(46,166,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Sparkles size={20} color={BLUE} />
                <span style={{ color: BLUE, fontSize: 14, fontWeight: 600 }}>ИИ-планировщик</span>
              </div>
              <div style={{ color: TEXT, fontSize: 16, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>
                Опиши мечту — получи маршрут
              </div>
              <div style={{ color: GREY, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                Скажи куда хочешь, когда и с каким бюджетом — AI составит полный план за 15 секунд
              </div>
              <button style={{ backgroundColor: BLUE, borderRadius: 12, padding: '12px 20px', color: '#FFF', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                onClick={() => window.location.href = '/search'}
              >
                Попробовать →
              </button>
            </div>
          </motion.div>
        )}

        {/* Маршруты */}
        {activeTab === 'routes' && (
          <motion.div
            key="routes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{ padding: '12px 20px 0' }}
          >
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ color: TEXT, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Ничего не найдено</div>
                <div style={{ color: GREY, fontSize: 14 }}>Попробуйте другой запрос</div>
              </div>
            ) : (
              filtered.map(route => (
                <PublicRouteCard
                  key={route.id}
                  route={route}
                  isSaved={savedIds.has(route.id)}
                  onSave={() => handleSave(route)}
                />
              ))
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
