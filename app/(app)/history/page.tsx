'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Plus, Minus, X, ChevronLeft, ExternalLink, MapPin } from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG    = '#17212B';
const CARD  = '#1C2733';
const CARD2 = '#243447';
const BLUE  = '#2EA6FF';
const TEXT  = '#E8F1F8';
const GREY  = '#8899A8';
const DIM   = '#4A5C6A';
const AMBER = '#F59E0B';
const GREEN = '#4ADE80';

// ─── Types ────────────────────────────────────────────────────────────────────
type PointType = 'hotel' | 'food' | 'attraction' | 'transport';

interface MapPoint {
  id: string;
  title: string;
  description: string;
  type: PointType;
  day: number;   // 0 = permanent (hotel), 1/2/3 = specific day
  x: number;    // % from left
  y: number;    // % from top
  time?: string;
  price?: string;
  photo?: string;
}

// ─── Bangkok map points ───────────────────────────────────────────────────────
const POINTS: MapPoint[] = [
  { id: 'hotel',    title: 'Avani+ Riverside',  description: '5★ · Riverside, Бангкок',         type: 'hotel',      day: 0, x: 30, y: 57, time: '14:00',
    photo: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80' },

  { id: 'watpho',   title: 'Ват Пхо',           description: 'Храм лежащего Будды · 10 мин пешком', type: 'attraction', day: 1, x: 37, y: 50, time: '16:00', price: '300 ₽',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { id: 'market1',  title: 'Рынок Ор Тор Кор',  description: 'Лучший фуд-маркет Бангкока',      type: 'food',       day: 1, x: 28, y: 72, time: '19:00', price: '800 ₽',
    photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80' },

  { id: 'khaosan',  title: 'Khao San Road',     description: 'Завтрак в Mango Tango',           type: 'food',       day: 2, x: 42, y: 44, time: '08:00', price: '400 ₽',
    photo: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=600&q=80' },
  { id: 'palace',   title: 'Гранд Палас',       description: 'Главная достопримечательность',   type: 'attraction', day: 2, x: 35, y: 47, time: '10:00', price: '1 200 ₽',
    photo: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80' },
  { id: 'chatuchak',title: 'Чатучак',           description: 'Крупнейший рынок в мире',         type: 'attraction', day: 2, x: 58, y: 22, time: '14:00',
    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
  { id: 'vertigo',  title: 'Vertigo 61',        description: 'Ужин на 61 этаже с видом',        type: 'food',       day: 2, x: 53, y: 54, time: '20:00', price: '4 000 ₽',
    photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },

  { id: 'divana',   title: 'СПА Divana',        description: 'Тайский массаж 2 часа',           type: 'attraction', day: 3, x: 60, y: 43, time: '09:00', price: '3 500 ₽',
    photo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80' },
  { id: 'nahm',     title: 'Nahm',              description: 'Тайская кухня Michelin',           type: 'food',       day: 3, x: 55, y: 57, time: '13:00', price: '3 000 ₽',
    photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
  { id: 'siam',     title: 'Siam Paragon',      description: 'Шопинг и аквариум',               type: 'attraction', day: 3, x: 63, y: 42, time: '16:00',
    photo: 'https://images.unsplash.com/photo-1567449303183-ae0d6ed1498e?w=600&q=80' },
  { id: 'khaosanN', title: 'Khao San Ночь',     description: 'Ночная жизнь и бары',             type: 'attraction', day: 3, x: 44, y: 43, time: '21:00',
    photo: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=600&q=80' },
];

const DAY_ROUTES: Record<number, string[]> = {
  1: ['hotel', 'watpho', 'market1'],
  2: ['hotel', 'khaosan', 'palace', 'chatuchak', 'vertigo'],
  3: ['hotel', 'divana', 'nahm', 'siam', 'khaosanN'],
};

const TYPE_CFG: Record<PointType, { emoji: string; color: string; big?: boolean }> = {
  hotel:      { emoji: '🏨', color: BLUE,    big: true },
  attraction: { emoji: '📍', color: AMBER },
  food:       { emoji: '🍜', color: '#F97316' },
  transport:  { emoji: '🚕', color: GREEN },
};

// ─── MapMarker ─────────────────────────────────────────────────────────────────
function MapMarker({ point, active, selected, onTap }: {
  point: MapPoint; active: boolean; selected: boolean; onTap: () => void;
}) {
  const cfg   = TYPE_CFG[point.type];
  const size  = cfg.big ? 46 : 36;
  const pulse = point.type === 'hotel';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: -10 }}
      animate={{ scale: active ? 1 : 0.5, opacity: active ? 1 : 0.3, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        position: 'absolute',
        left: `${point.x}%`,
        top: `${point.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: selected ? 30 : point.type === 'hotel' ? 20 : 10,
        cursor: 'pointer',
      }}
      onClick={e => { e.stopPropagation(); if (active) onTap(); }}
    >
      {/* Pulse ring for hotel */}
      {pulse && active && (
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${cfg.color}`, pointerEvents: 'none' }}
        />
      )}

      {/* Marker body */}
      <motion.div
        animate={{ scale: selected ? 1.18 : 1 }}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: selected ? cfg.color : cfg.color + 'CC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.44,
          boxShadow: `0 3px 12px ${cfg.color}66, 0 1px 4px rgba(0,0,0,0.5)`,
          border: `2px solid ${selected ? '#FFF' : cfg.color + '80'}`,
        }}
      >
        {cfg.emoji}
      </motion.div>

      {/* Label */}
      {(selected || point.type === 'hotel') && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)',
            background: CARD, color: TEXT, fontSize: 11, fontWeight: 600,
            padding: '3px 8px', borderRadius: 8, whiteSpace: 'nowrap',
            marginBottom: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {point.title}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── RouteLines SVG ───────────────────────────────────────────────────────────
function RouteLines({ day, w, h }: { day: number; w: number; h: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { setDrawn(false); const t = setTimeout(() => setDrawn(true), 200); return () => clearTimeout(t); }, [day]);

  const daysToShow = day === 0 ? [1, 2, 3] : [day];

  const pointMap = Object.fromEntries(POINTS.map(p => [p.id, p]));

  const allSegments: { x1: number; y1: number; x2: number; y2: number; color: string; i: number }[] = [];

  daysToShow.forEach(d => {
    const ids   = DAY_ROUTES[d] || [];
    const color = d === 1 ? '#4ADE80' : d === 2 ? BLUE : AMBER;
    ids.forEach((id, idx) => {
      if (idx === 0) return;
      const a = pointMap[ids[idx - 1]];
      const b = pointMap[id];
      if (!a || !b) return;
      allSegments.push({ x1: (a.x / 100) * w, y1: (a.y / 100) * h, x2: (b.x / 100) * w, y2: (b.y / 100) * h, color, i: allSegments.length });
    });
  });

  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={w} height={h}>
      {allSegments.map(s => {
        const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
        return (
          <line key={s.i}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={s.color} strokeWidth={2.5} strokeOpacity={0.85}
            strokeDasharray={`8 5`}
            strokeLinecap="round"
            style={{
              strokeDashoffset: drawn ? 0 : len,
              transition: `stroke-dashoffset 0.6s ease ${s.i * 0.12}s`,
            }}
          />
        );
      })}
    </svg>
  );
}

// ─── DayFilter ────────────────────────────────────────────────────────────────
function DayFilter({ day, onChange }: { day: number; onChange: (d: number) => void }) {
  const days = [{ label: 'Весь маршрут', d: 0 }, { label: 'День 1', d: 1 }, { label: 'День 2', d: 2 }, { label: 'День 3', d: 3 }];
  return (
    <div style={{
      position: 'absolute', top: 'env(safe-area-inset-top, 44px)', left: 0, right: 0,
      paddingTop: 8, zIndex: 50,
    }}>
      <div style={{ overflowX: 'auto', paddingInline: 16, display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {days.map(({ label, d }) => (
          <button key={d} onClick={() => onChange(d)}
            style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: day === d ? BLUE : 'rgba(23,33,43,0.82)',
              backdropFilter: 'blur(12px)',
              color: day === d ? '#FFF' : TEXT,
              fontSize: 13, fontWeight: day === d ? 700 : 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MarkerCard (bottom sheet) ────────────────────────────────────────────────
function MarkerCard({ point, onClose, onDirections }: {
  point: MapPoint; onClose: () => void; onDirections: () => void;
}) {
  const cfg = TYPE_CFG[point.type];
  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      style={{
        position: 'absolute', bottom: 64, left: 12, right: 12,
        background: CARD, borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 60,
      }}
    >
      {/* Photo */}
      {point.photo && (
        <div style={{ position: 'relative', height: 130 }}>
          <img src={point.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(23,33,43,0.9))' }} />
          <div style={{ position: 'absolute', bottom: 10, left: 14, right: 44 }}>
            <span style={{ background: cfg.color + '22', color: cfg.color, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 8 }}>
              {cfg.emoji} {point.type === 'hotel' ? 'Отель' : point.type === 'food' ? 'Еда' : 'Достопримечательность'}
            </span>
          </div>
          <button onClick={onClose}
            style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <X size={15} />
          </button>
        </div>
      )}

      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ color: TEXT, fontSize: 16, fontWeight: 700 }}>{point.title}</div>
            <div style={{ color: GREY, fontSize: 12, marginTop: 2 }}>{point.description}</div>
          </div>
          {!point.photo && (
            <button onClick={onClose} style={{ background: CARD2, border: 'none', borderRadius: 10, padding: 6, cursor: 'pointer', color: GREY }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {point.time && (
            <span style={{ color: GREY, fontSize: 12 }}>🕐 {point.time}</span>
          )}
          {point.price && (
            <span style={{ color: GREY, fontSize: 12 }}>💰 {point.price}</span>
          )}
          {point.day > 0 && (
            <span style={{ color: GREY, fontSize: 12 }}>📅 День {point.day}</span>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onDirections}
            style={{ flex: 1, padding: '12px', borderRadius: 12, background: BLUE, border: 'none', color: '#FFF', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            🗺️ Как добраться
          </button>
          <button style={{ flex: 1, padding: '12px', borderRadius: 12, background: CARD2, border: 'none', color: TEXT, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Подробнее →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── DirectionsPanel ──────────────────────────────────────────────────────────
function DirectionsPanel({ point, onClose }: { point: MapPoint; onClose: () => void }) {
  const [mode, setMode] = useState<'walk' | 'transit' | 'taxi'>('walk');
  const times = { walk: '18 мин', transit: '9 мин', taxi: '5 мин' };

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      style={{
        position: 'absolute', bottom: 64, left: 12, right: 12,
        background: CARD, borderRadius: 20, padding: '16px 16px 18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 60,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ color: TEXT, fontSize: 15, fontWeight: 700 }}>Маршрут до {point.title}</div>
          <div style={{ color: GREY, fontSize: 12, marginTop: 2 }}>от Avani+ Riverside (ваш отель)</div>
        </div>
        <button onClick={onClose}
          style={{ background: CARD2, border: 'none', borderRadius: 10, padding: 6, cursor: 'pointer', color: GREY, display: 'flex' }}>
          <X size={16} />
        </button>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {([['walk', '🚶', '‍Пешком'], ['transit', '🚌', 'Автобус'], ['taxi', '🚕', 'Такси']] as const).map(([m, icon, label]) => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: '10px 4px', borderRadius: 12, border: 'none', cursor: 'pointer', background: mode === m ? BLUE : CARD2, color: mode === m ? '#FFF' : GREY, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{times[m]}</span>
            <span style={{ fontSize: 9, opacity: 0.8 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* AI tip */}
      <div style={{ background: CARD2, borderRadius: 12, padding: '10px 12px', marginBottom: 14 }}>
        <div style={{ color: BLUE, fontSize: 11, fontWeight: 600, marginBottom: 3 }}>🤖 Совет ИИ</div>
        <div style={{ color: GREY, fontSize: 12, lineHeight: 1.5 }}>
          {mode === 'walk' ? 'Приятная прогулка вдоль набережной Чао Прайя. Выходите у ворот Та Тьен.' :
           mode === 'transit' ? 'Сядьте на паром от пристани Tawang Wongwian (2 мин ходьбы), выйдите на N9.' :
           'Попросите водителя тук-тука до Wat Pho. Договоритесь заранее — не больше 80 ₿.'}
        </div>
      </div>

      {/* Open in Google Maps */}
      <button
        onClick={() => window.open(`https://maps.google.com/?daddr=${encodeURIComponent(point.title + ' Bangkok')}`, '_blank')}
        style={{ width: '100%', padding: '12px', borderRadius: 12, background: CARD2, border: `1px solid ${DIM}`, color: TEXT, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <ExternalLink size={15} /> Открыть в Google Maps
      </button>
    </motion.div>
  );
}

// ─── MapContent ───────────────────────────────────────────────────────────────
function MapContent() {
  const searchParams = useSearchParams();
  const [day, setDay]                 = useState(0);
  const [selected, setSelected]       = useState<MapPoint | null>(null);
  const [showDirs, setShowDirs]       = useState(false);
  const [mapSize, setMapSize]         = useState({ w: 375, h: 700 });
  const [zoom, setZoom]               = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = searchParams.get('day');
    if (d) setDay(parseInt(d));
  }, [searchParams]);

  useEffect(() => {
    const update = () => {
      if (mapRef.current) {
        setMapSize({ w: mapRef.current.offsetWidth, h: mapRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const visiblePoints = POINTS.filter(p => day === 0 || p.day === 0 || p.day === day);

  const handleMapTap = () => {
    setSelected(null);
    setShowDirs(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, overflow: 'hidden' }}>
      {/* Map background */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} onClick={handleMapTap}>
        {/* Satellite image */}
        <img
          src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1400&q=80"
          alt="Bangkok map"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'brightness(0.55) saturate(0.5) hue-rotate(180deg)',
            transform: `scale(${zoom})`, transformOrigin: 'center',
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Route lines */}
        <RouteLines day={day} w={mapSize.w} h={mapSize.h} />

        {/* Markers */}
        {POINTS.map((p, i) => {
          const active = day === 0 || p.day === 0 || p.day === day;
          return (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: -20, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 22 }}>
              <MapMarker
                point={p}
                active={active}
                selected={selected?.id === p.id}
                onTap={() => { setSelected(p); setShowDirs(false); }}
              />
            </motion.div>
          );
        })}

        {/* Fake grid overlay for map feel */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(46,166,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(46,166,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      </div>

      {/* Day filter */}
      <DayFilter day={day} onChange={d => { setDay(d); setSelected(null); setShowDirs(false); }} />

      {/* Zoom controls */}
      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 50 }}>
        {[
          { icon: <Plus size={16} />, action: () => setZoom(z => Math.min(z + 0.2, 2.2)) },
          { icon: <Minus size={16} />, action: () => setZoom(z => Math.max(z - 0.2, 0.6)) },
        ].map((b, i) => (
          <button key={i} onClick={b.action}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(28,39,51,0.88)', backdropFilter: 'blur(10px)', border: `1px solid ${DIM}`, color: TEXT, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {b.icon}
          </button>
        ))}
      </div>

      {/* Geolocation button */}
      <button
        style={{ position: 'absolute', right: 14, bottom: 80, width: 44, height: 44, borderRadius: 12, background: 'rgba(28,39,51,0.88)', backdropFilter: 'blur(10px)', border: `1px solid ${DIM}`, color: BLUE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <Navigation size={18} />
      </button>

      {/* Stats overlay */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{
          position: 'absolute', bottom: 80, left: 14,
          background: 'rgba(28,39,51,0.88)', backdropFilter: 'blur(12px)',
          borderRadius: 14, padding: '10px 14px', zIndex: 50,
          border: `1px solid ${DIM}`,
        }}>
        <div style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}>🇹🇭 Бангкок</div>
        <div style={{ color: GREY, fontSize: 11, marginTop: 2 }}>
          {visiblePoints.length} точек · {day === 0 ? '3 дня' : `День ${day}`}
        </div>
      </motion.div>

      {/* Bottom card */}
      <AnimatePresence>
        {selected && !showDirs && (
          <MarkerCard key="card" point={selected} onClose={() => setSelected(null)} onDirections={() => setShowDirs(true)} />
        )}
        {showDirs && selected && (
          <DirectionsPanel key="dirs" point={selected} onClose={() => { setShowDirs(false); setSelected(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  return (
    <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: BG }} />}>
      <MapContent />
    </Suspense>
  );
}
