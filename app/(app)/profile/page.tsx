'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Crown, Bookmark, MessageSquare, X,
  Bell, Globe, HelpCircle, LogOut, Trash2,
  ChevronRight, Pencil, Upload, Share2,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { useRouter } from 'next/navigation';
import type { GeneratedRoute, SavedRoute, Review } from '@/lib/types';
import { MOCK_REVIEWS } from '@/lib/mockData';

const DARK = '#17212B';
const CARD = '#1E2C3A';
const CARD2 = '#243447';
const GOLD = '#C79A00';
const BLUE = '#2563EB';
const GREY = '#AAB8C5';
const RED = '#F2585B';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRange(from: string, to: string) {
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const d1 = new Date(from);
  const d2 = new Date(to);
  const days = Math.round((d2.getTime() - d1.getTime()) / 86400000);
  return `${d1.getDate()} ${months[d1.getMonth()]} – ${d2.getDate()} ${months[d2.getMonth()]} · ${days} дн.`;
}

// ─── Animated Stars ──────────────────────────────────────────────────────────

function AnimatedStars({ rating, size = 18 }: { rating: number; size?: number }) {
  const [lit, setLit] = useState(0);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setLit(i);
      if (i >= 5) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <motion.span
          key={n}
          initial={{ scale: 0.7, opacity: 0.2 }}
          animate={n <= lit ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          style={{ fontSize: size, color: n <= Math.round(rating) ? GOLD : '#334155', lineHeight: 1 }}
        >
          ★
        </motion.span>
      ))}
    </span>
  );
}

function StaticStars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ fontSize: size, color: n <= Math.round(rating) ? GOLD : '#334155', lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

// ─── Route Cards ─────────────────────────────────────────────────────────────

function MyRouteCard({ route, index, onPublish }: { route: GeneratedRoute; index: number; onPublish: (id: string) => void }) {
  const days = route.days.length || Math.round((new Date(route.dateTo).getTime() - new Date(route.dateFrom).getTime()) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.25 }}
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: CARD }}
    >
      <div className="relative h-36 overflow-hidden">
        <img src={route.coverImage} alt={route.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <span className="text-white font-bold text-base leading-tight">{route.destination}</span>
          {route.isPublished && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: '#16a34a20', color: '#4ade80', border: '1px solid #4ade8040' }}>
              В ленте
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs mb-2.5" style={{ color: GREY }}>{formatRange(route.dateFrom, route.dateTo)}</div>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: CARD2, color: GREY }}>
            📍 {route.country}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: CARD2, color: GREY }}>
            {days} дн.
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: CARD2, color: GREY }}>
            {route.budget === 'средний' ? '💳' : route.budget === 'эконом' ? '💸' : '💎'} {route.budget}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs flex items-center gap-1" style={{ color: GREY }}>
              <Bookmark size={12} /> {route.publishedSaves ?? 0}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: GREY }}>
              <MessageSquare size={12} /> {route.publishedReviewCount ?? 0}
            </span>
          </div>

          {!route.isPublished && (
            <button
              onClick={() => onPublish(route.id)}
              className="text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 active:scale-95 transition-transform"
              style={{ backgroundColor: BLUE, color: 'white' }}
            >
              <Upload size={11} />
              Выложить
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SavedRouteCard({ route, index }: { route: SavedRoute; index: number }) {
  const days = route.days.length || Math.round((new Date(route.dateTo).getTime() - new Date(route.dateFrom).getTime()) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.25 }}
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: CARD }}
    >
      <div className="relative h-36 overflow-hidden">
        <img src={route.coverImage} alt={route.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <span className="text-white font-bold text-base leading-tight">{route.destination}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: '#2563EB20', color: '#60a5fa', border: '1px solid #2563EB40' }}>
            {route.isModified ? 'Изменено' : 'Сохранено'}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs mb-2.5" style={{ color: GREY }}>{formatRange(route.dateFrom, route.dateTo)}</div>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: CARD2, color: GREY }}>
            📍 {route.country}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: CARD2, color: GREY }}>
            {days} дн.
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: BLUE }}>
              {route.originalAuthor.initial}
            </div>
            <span className="text-xs" style={{ color: GREY }}>{route.originalAuthor.name}</span>
          </div>

          <button
            className="text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 active:scale-95 transition-transform"
            style={{ backgroundColor: '#1E3A5F', color: '#60a5fa' }}
          >
            <Pencil size={11} />
            Изменить
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Reviews Sheet ────────────────────────────────────────────────────────────

function ReviewsSheet({ reviews, avgRating, reviewCount, onClose }: {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  onClose: () => void;
}) {
  const distribution = [
    { stars: 5, count: 72 },
    { stars: 4, count: 38 },
    { stars: 3, count: 12 },
    { stars: 2, count: 4 },
    { stars: 1, count: 2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="rounded-t-3xl flex flex-col"
        style={{ backgroundColor: DARK, maxHeight: '88dvh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#334155' }} />
        </div>

        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <h2 className="text-white font-bold text-lg">Отзывы об авторе</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: CARD }}>
            <X size={16} style={{ color: GREY }} />
          </button>
        </div>

        {/* Average */}
        <div className="px-4 mb-4 flex-shrink-0">
          <div className="rounded-2xl p-4 flex items-center gap-5" style={{ backgroundColor: CARD }}>
            <div className="flex-shrink-0">
              <div className="text-5xl font-bold text-white">{avgRating}</div>
              <StaticStars rating={avgRating} size={18} />
              <div className="text-xs mt-1" style={{ color: GREY }}>{reviewCount} отзывов</div>
            </div>
            <div className="flex-1 space-y-1.5">
              {distribution.map(d => (
                <div key={d.stars} className="flex items-center gap-2">
                  <span className="text-xs w-3 text-right" style={{ color: GREY }}>{d.stars}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: DARK }}>
                    <div className="h-1.5 rounded-full" style={{
                      width: `${(d.count / reviewCount) * 100}%`,
                      backgroundColor: GOLD,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 pb-8 space-y-3 scrollbar-none">
          {reviews.map(review => (
            <div key={review.id} className="rounded-2xl p-4" style={{ backgroundColor: CARD }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: BLUE }}>
                  {review.authorInitial}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{review.authorName}</div>
                  <div className="flex items-center gap-2">
                    <StaticStars rating={review.rating} size={12} />
                    <span className="text-xs" style={{ color: GREY }}>{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: GREY }}>{review.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Settings Sheet ───────────────────────────────────────────────────────────

function SettingsSheet({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [accentColor, setAccentColor] = useState(BLUE);
  const [showLogout, setShowLogout] = useState(false);

  const accents = ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="rounded-t-3xl overflow-y-auto"
        style={{ backgroundColor: DARK, maxHeight: '92dvh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#334155' }} />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-white font-bold text-lg">Настройки</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: CARD }}>
            <X size={16} style={{ color: GREY }} />
          </button>
        </div>

        <div className="px-4 pb-10 space-y-4">

          {/* Appearance */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: GREY }}>
              Оформление
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: CARD }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${CARD2}` }}>
                <div className="text-sm text-white mb-2.5">Тема</div>
                <div className="flex gap-2">
                  {(['dark', 'light', 'system'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        backgroundColor: theme === t ? BLUE : DARK,
                        color: theme === t ? 'white' : GREY,
                      }}
                    >
                      {t === 'dark' ? 'Тёмная' : t === 'light' ? 'Светлая' : 'Авто'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-3">
                <div className="text-sm text-white mb-2.5">Акцентный цвет</div>
                <div className="flex gap-3">
                  {accents.map(c => (
                    <button
                      key={c}
                      onClick={() => setAccentColor(c)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
                      style={{
                        backgroundColor: c,
                        outline: accentColor === c ? `2.5px solid white` : '2.5px solid transparent',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: GREY }}>
              Аккаунт
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: CARD }}>
              {[
                { label: 'Изменить имя', emoji: '✏️' },
                { label: 'Сменить аватар', emoji: '🖼️' },
                { label: 'Изменить контакт', emoji: '📱' },
                { label: 'Сменить пароль', emoji: '🔑' },
              ].map((item, i, arr) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/5 transition-colors"
                  style={{ borderBottom: i < arr.length - 1 ? `1px solid ${CARD2}` : 'none' }}
                >
                  <span className="text-base w-6">{item.emoji}</span>
                  <span className="text-sm text-white flex-1">{item.label}</span>
                  <ChevronRight size={15} style={{ color: GREY }} />
                </button>
              ))}
            </div>
          </div>

          {/* Other */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: GREY }}>
              Прочее
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: CARD }}>
              {[
                { label: 'Уведомления', icon: <Bell size={15} /> },
                { label: 'Язык', icon: <Globe size={15} />, value: 'Русский' },
                { label: 'Помощь / Поддержка', icon: <HelpCircle size={15} /> },
              ].map((item, i, arr) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/5 transition-colors"
                  style={{ borderBottom: i < arr.length - 1 ? `1px solid ${CARD2}` : 'none' }}
                >
                  <span style={{ color: GREY }}>{item.icon}</span>
                  <span className="text-sm text-white flex-1">{item.label}</span>
                  {item.value && <span className="text-xs mr-1" style={{ color: GREY }}>{item.value}</span>}
                  <ChevronRight size={15} style={{ color: GREY }} />
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogout(true)}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-sm active:scale-98 transition-transform"
            style={{ backgroundColor: CARD, color: RED }}
          >
            <LogOut size={16} />
            Выйти из аккаунта
          </button>

          <button className="w-full text-center text-xs py-2" style={{ color: '#475569' }}>
            <span className="flex items-center justify-center gap-1.5">
              <Trash2 size={12} />
              Удалить аккаунт
            </span>
          </button>
        </div>
      </motion.div>

      {/* Logout confirm overlay */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col justify-end"
            style={{ background: 'rgba(0,0,0,0.5)', maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}
            onClick={() => setShowLogout(false)}
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              transition={{ type: 'spring', damping: 22, stiffness: 380 }}
              className="rounded-t-3xl p-5"
              style={{ backgroundColor: CARD2 }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-white font-bold text-center text-base mb-1">Точно выйти?</p>
              <p className="text-center text-sm mb-5" style={{ color: GREY }}>Потребуется войти снова</p>
              <button
                onClick={onLogout}
                className="w-full py-3.5 rounded-2xl font-bold text-white mb-2.5 active:scale-98 transition-transform"
                style={{ backgroundColor: RED }}
              >
                Выйти
              </button>
              <button
                onClick={() => setShowLogout(false)}
                className="w-full py-3 text-sm font-medium"
                style={{ color: GREY }}
              >
                Отмена
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Publish Confirm ──────────────────────────────────────────────────────────

function PublishSheet({ routeName, onConfirm, onClose }: {
  routeName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="rounded-t-3xl p-5"
        style={{ backgroundColor: DARK }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#334155' }} />
        </div>

        <div className="text-center mb-1">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="text-white font-bold text-lg mb-1">Выложить в ленту?</h3>
          <p className="text-sm mb-1" style={{ color: GREY }}>«{routeName}»</p>
          <p className="text-xs" style={{ color: GREY }}>
            Маршрут увидят все пользователи — они смогут сохранять его и оставлять отзывы
          </p>
        </div>

        <div className="rounded-2xl p-3 mt-4 mb-5 flex items-start gap-3" style={{ backgroundColor: CARD }}>
          <span className="text-base">💡</span>
          <p className="text-xs leading-relaxed" style={{ color: GREY }}>
            После публикации ты будешь получать койны за каждое сохранение и хороший отзыв
          </p>
        </div>

        <button
          onClick={onConfirm}
          className="w-full py-3.5 rounded-2xl font-bold text-white mb-2.5"
          style={{ backgroundColor: BLUE }}
        >
          Опубликовать
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 text-sm font-medium"
          style={{ color: GREY }}
        >
          Отмена
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout, routes, savedRoutes, publishRoute } = useApp();
  const router = useRouter();

  const [tab, setTab] = useState<'my' | 'saved'>('my');
  const [showSettings, setShowSettings] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [publishTarget, setPublishTarget] = useState<GeneratedRoute | null>(null);

  const rating = user?.rating ?? 4.6;
  const reviewCount = user?.reviewCount ?? 128;
  const totalSaves = user?.totalSaves ?? 340;
  const coins = user?.coins ?? 2450;
  const level = user?.level ?? 7;

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  const handlePublishConfirm = () => {
    if (publishTarget) {
      publishRoute(publishTarget.id);
      setPublishTarget(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-dvh pb-20" style={{ backgroundColor: DARK }}>

      {/* ── Header ── */}
      <div className="px-4 pt-12 pb-5">

        {/* Top bar: gear + PRO */}
        <div className="flex justify-end items-center gap-2 mb-7">
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ backgroundColor: CARD }}
          >
            <Settings size={16} style={{ color: GREY }} />
          </button>

          <button
            className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
            style={{ backgroundColor: user.status === 'premium' ? GOLD : CARD, color: user.status === 'premium' ? DARK : GOLD }}
          >
            {user.status === 'premium' && <Crown size={11} />}
            PRO
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="rounded-full flex items-center justify-center mb-3"
            style={{
              width: 88, height: 88,
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            }}
          >
            <span className="text-3xl font-bold text-white">{user.name.charAt(0)}</span>
          </motion.div>

          <h1 className="text-xl font-bold text-white mb-0.5">{user.name}</h1>
          <div className="text-sm mb-2.5" style={{ color: GREY }}>@{user.username}</div>

          {/* Rating (tappable → reviews) */}
          <button
            className="flex items-center gap-2 mb-2 active:opacity-80 transition-opacity"
            onClick={() => setShowReviews(true)}
          >
            <AnimatedStars rating={rating} size={19} />
            <span className="text-white font-semibold text-sm">{rating}</span>
            <span className="text-sm" style={{ color: GREY }}>({reviewCount} отзывов)</span>
          </button>

          <div className="text-sm" style={{ color: GREY }}>{user.email}</div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="mx-4 mb-4 rounded-2xl px-3 py-3.5" style={{ backgroundColor: CARD }}>
        <div className="flex items-center">
          {[
            { value: routes.length, label: 'маршрутов' },
            { value: totalSaves, label: 'сохранений' },
            { value: reviewCount, label: 'отзывов' },
            { value: `🪙 ${coins}`, label: `уровень ${level}` },
          ].map((s, i, arr) => (
            <div key={i} className="flex-1 flex flex-col items-center"
              style={{ borderRight: i < arr.length - 1 ? `1px solid ${CARD2}` : 'none' }}>
              <div className="text-white font-bold text-base leading-tight">{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: GREY }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Action button ── */}
      <div className="mx-4 mb-5 flex gap-2">
        <button
          className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-98 transition-transform"
          style={{ backgroundColor: CARD, color: GREY }}
        >
          <Pencil size={14} />
          Изменить профиль
        </button>
        <button
          className="w-11 h-11 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          style={{ backgroundColor: CARD }}
        >
          <Share2 size={16} style={{ color: GREY }} />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="px-4 mb-4">
        <div className="flex border-b" style={{ borderColor: CARD }}>
          {[
            { key: 'my', label: 'Мои маршруты', count: routes.length },
            { key: 'saved', label: 'Сохранённые', count: savedRoutes.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as 'my' | 'saved')}
              className="flex-1 pb-2.5 text-sm font-semibold relative flex items-center justify-center gap-1.5"
              style={{ color: tab === t.key ? BLUE : GREY }}
            >
              {t.label}
              {t.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: tab === t.key ? `${BLUE}30` : CARD, color: tab === t.key ? '#60a5fa' : GREY }}>
                  {t.count}
                </span>
              )}
              {tab === t.key && (
                <motion.div
                  layoutId="profile-tab-line"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: BLUE }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Route list ── */}
      <div className="px-4 space-y-3">
        <AnimatePresence mode="wait">
          {tab === 'my' ? (
            <motion.div
              key="my"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {routes.length === 0 ? (
                <div className="text-center py-14">
                  <div className="text-5xl mb-3">🗺️</div>
                  <div className="text-sm font-medium text-white mb-1">Маршрутов пока нет</div>
                  <div className="text-xs" style={{ color: GREY }}>Создай первый через ИИ</div>
                </div>
              ) : (
                routes.map((route, i) => (
                  <MyRouteCard
                    key={route.id}
                    route={route}
                    index={i}
                    onPublish={id => {
                      const r = routes.find(x => x.id === id);
                      if (r) setPublishTarget(r);
                    }}
                  />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {savedRoutes.length === 0 ? (
                <div className="text-center py-14">
                  <div className="text-5xl mb-3">🔖</div>
                  <div className="text-sm font-medium text-white mb-1">Сохранённых нет</div>
                  <div className="text-xs" style={{ color: GREY }}>Сохраняй маршруты из ленты</div>
                </div>
              ) : (
                savedRoutes.map((route, i) => (
                  <SavedRouteCard key={route.id} route={route} index={i} />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sheets ── */}
      <AnimatePresence>
        {showSettings && (
          <SettingsSheet
            key="settings"
            onClose={() => setShowSettings(false)}
            onLogout={handleLogout}
          />
        )}
        {showReviews && (
          <ReviewsSheet
            key="reviews"
            reviews={MOCK_REVIEWS}
            avgRating={rating}
            reviewCount={reviewCount}
            onClose={() => setShowReviews(false)}
          />
        )}
        {publishTarget && (
          <PublishSheet
            key="publish"
            routeName={publishTarget.destination}
            onConfirm={handlePublishConfirm}
            onClose={() => setPublishTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
