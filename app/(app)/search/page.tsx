'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Send, Plane,
  Star, ExternalLink, Plus, Sparkles, X, Trash2, Bookmark,
} from 'lucide-react';
import { MOCK_ROUTES } from '@/lib/mockData';
import { useApp } from '@/lib/store';
import type { GeneratedRoute } from '@/lib/types';

// Design tokens
const BG = '#17212B';
const CARD = '#1C2733';
const CARD2 = '#243447';
const BLUE = '#2EA6FF';
const TEXT = '#E8F1F8';
const GREY = '#8899A8';
const DIM = '#4A5C6A';
const GOLD = '#F59E0B';
const GREEN = '#4ADE80';
const RED = '#F2585B';

// Navigation types
type ScreenName = 'chat-list' | 'dialog' | 'building' | 'trip-chat' | 'plan' | 'day' | 'place' | 'deep';

interface NavScreen {
  name: ScreenName;
  dayIndex?: number;
  activityIndex?: number;
  deepTitle?: string;
  deepContent?: string;
}

// Dialog step — card-based, Duolingo style
interface DialogOption { emoji: string; label: string; }
interface DialogStep { key: string; question: string; options: DialogOption[]; }

const DIALOG_STEPS: DialogStep[] = [
  {
    key: 'dest', question: 'Куда хотите отправиться?',
    options: [
      { emoji: '🇯🇵', label: 'Япония' },
      { emoji: '🇮🇩', label: 'Бали' },
      { emoji: '🇦🇪', label: 'Дубай' },
      { emoji: '🇹🇭', label: 'Таиланд' },
    ],
  },
  {
    key: 'dates', question: 'Когда планируете поездку?',
    options: [
      { emoji: '☀️', label: 'Июль 2026' },
      { emoji: '🏖️', label: 'Август 2026' },
      { emoji: '🍂', label: 'Осень 2026' },
      { emoji: '❄️', label: 'Зима 2026' },
    ],
  },
  {
    key: 'budget', question: 'Примерный бюджет на поездку?',
    options: [
      { emoji: '💸', label: 'До 50 000 ₽' },
      { emoji: '💳', label: '50–100 000 ₽' },
      { emoji: '💎', label: '100–200 000 ₽' },
      { emoji: '🏆', label: 'Без ограничений' },
    ],
  },
  {
    key: 'rest', question: 'Какой отдых вам ближе?',
    options: [
      { emoji: '🏃', label: 'Активный' },
      { emoji: '🏖️', label: 'Пляжный' },
      { emoji: '🏛️', label: 'Культурный' },
      { emoji: '🌏', label: 'Смешанный' },
    ],
  },
  {
    key: 'people', question: 'Сколько человек едет?',
    options: [
      { emoji: '👤', label: 'Только я' },
      { emoji: '👫', label: 'Двое' },
      { emoji: '👨‍👩‍👧', label: '3–4 человека' },
      { emoji: '👥', label: '5 и более' },
    ],
  },
];

const BUILD_STAGES = [
  'Подбираю авиабилеты...',
  'Ищу лучшие отели...',
  'Составляю маршрут по дням...',
  'Считаю бюджет...',
  'Почти готово ✨',
];

const WAVE_H = [8, 20, 14, 32, 18, 28, 10, 36, 22, 16, 30, 24, 12, 38, 20, 28, 14, 32, 18, 24, 10, 36, 16, 22];
const WAVE_D = [0, 0.2, 0.4, 0.1, 0.3, 0.5, 0.2, 0.4, 0.1, 0.3, 0.5, 0.2, 0.4, 0.1, 0.3, 0.5, 0.2, 0.4, 0.1, 0.3, 0.5, 0.2, 0.4, 0.1];
const WAVE_T = [0.6, 0.8, 0.5, 0.9, 0.7, 0.6, 0.8, 0.5, 0.9, 0.7, 0.6, 0.8, 0.5, 0.9, 0.7, 0.6, 0.8, 0.5, 0.9, 0.7, 0.6, 0.8, 0.5, 0.9];

function getPeriod(time: string): 'morning' | 'day' | 'evening' | 'night' {
  const h = parseInt(time.split(':')[0], 10);
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}
const PERIOD_LABELS = { morning: '☀️ Утро', day: '🌤️ День', evening: '🌆 Вечер', night: '🌙 Ночь' };

interface MockChat {
  id: string;
  destination: string;
  country: string;
  coverImage: string;
  duration: string;
  cost: string;
  date: string;
  pinned?: boolean;
  savedToProfile?: boolean;
  routeData?: GeneratedRoute;
}

interface ChatMsg { role: 'ai' | 'user'; text: string; }

// ───────────────────────────────────────────
// Shared components
// ───────────────────────────────────────────

function BackBtn({ onPress, icon = 'chevron' }: { onPress: () => void; icon?: 'chevron' | 'x' }) {
  return (
    <button onClick={onPress} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
      {icon === 'x' ? <X size={22} color={GREY} /> : <ChevronLeft size={22} color={TEXT} />}
    </button>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px', backgroundColor: CARD2, borderRadius: '18px 18px 18px 4px' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GREY }} />
      ))}
    </div>
  );
}

function AIAvatar() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Sparkles size={13} color="#FFF" />
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
      {msg.role === 'ai' && <AIAvatar />}
      <div style={{ maxWidth: '75%', padding: '10px 14px', fontSize: 14, lineHeight: 1.5, color: TEXT, whiteSpace: 'pre-wrap', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: msg.role === 'user' ? BLUE : CARD2 }}>
        {msg.text}
      </div>
    </motion.div>
  );
}

// ───────────────────────────────────────────
// Swipeable chat card
// ───────────────────────────────────────────

function SwipeableChatCard({ chat, onOpen, onDelete, onPin, onSaveToProfile }: {
  chat: MockChat; onOpen: () => void; onDelete: () => void; onPin: () => void; onSaveToProfile: () => void;
}) {
  const x = useMotionValue(0);
  const ACTION_W = 190;
  const actionOpacity = useTransform(x, [-ACTION_W, -20], [1, 0]);
  const cardScale = useTransform(x, [-ACTION_W, 0], [0.97, 1]);

  const handleDragEnd = () => {
    const curr = x.get();
    if (curr < -(ACTION_W / 2)) {
      animate(x, -ACTION_W, { type: 'spring', stiffness: 420, damping: 38 });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 420, damping: 38 });
    }
  };

  const close = () => animate(x, 0, { type: 'spring', stiffness: 420, damping: 38 });

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Action buttons */}
      <motion.div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: ACTION_W, display: 'flex', opacity: actionOpacity }}>
        <button onClick={() => { onSaveToProfile(); close(); }}
          style={{ flex: 1, backgroundColor: chat.savedToProfile ? DIM : GREEN, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', gap: 4 }}>
          <Bookmark size={18} color="#FFF" fill={chat.savedToProfile ? '#FFF' : 'none'} />
          <span style={{ color: '#FFF', fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{chat.savedToProfile ? 'В профиле' : 'В профиль'}</span>
        </button>
        <button onClick={() => { onPin(); close(); }}
          style={{ flex: 1, backgroundColor: GOLD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', gap: 4 }}>
          <Star size={18} color="#FFF" fill={chat.pinned ? '#FFF' : 'none'} />
          <span style={{ color: '#FFF', fontSize: 9, fontWeight: 600 }}>{chat.pinned ? 'Откреп.' : 'Закрепить'}</span>
        </button>
        <button onClick={() => { onDelete(); close(); }}
          style={{ flex: 1, backgroundColor: RED, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', gap: 4 }}>
          <Trash2 size={18} color="#FFF" />
          <span style={{ color: '#FFF', fontSize: 9, fontWeight: 600 }}>Удалить</span>
        </button>
      </motion.div>

      {/* Card */}
      <motion.div
        style={{ x, scale: cardScale, position: 'relative', zIndex: 1, touchAction: 'pan-y', cursor: 'pointer' }}
        drag="x"
        dragConstraints={{ left: -ACTION_W, right: 0 }}
        dragElastic={{ left: 0.08, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={onOpen}
      >
        <div style={{ margin: '0 16px 12px', borderRadius: 18, overflow: 'hidden', position: 'relative', height: 150 }}>
          <img src={chat.coverImage} alt={chat.destination} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(23,33,43,0.2) 0%, rgba(23,33,43,0.75) 100%)' }} />

          {chat.pinned && (
            <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: GOLD, borderRadius: 10, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Bookmark size={11} color="#FFF" fill="#FFF" />
              <span style={{ color: '#FFF', fontSize: 10, fontWeight: 700 }}>Закреплено</span>
            </div>
          )}

          <div style={{ position: 'absolute', inset: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(46,166,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
                <Plane size={13} color={BLUE} />
              </div>
              <span style={{ color: '#A8D8FF', fontSize: 11, fontWeight: 600 }}>AI маршрут</span>
            </div>
            <div>
              <div style={{ color: '#FFF', fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>{chat.destination}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{chat.country}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{chat.duration}</span>
                </div>
                <span style={{ color: BLUE, fontSize: 13, fontWeight: 700 }}>{chat.cost}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 1, backgroundColor: '#0F1620', margin: '0 0 4px' }} />
      </motion.div>
    </div>
  );
}

// ───────────────────────────────────────────
// AI-0 Chat list
// ───────────────────────────────────────────

function ChatListScreen({ chats, onNew, onOpen, onDelete, onPin, onSaveToProfile }: {
  chats: MockChat[];
  onNew: () => void;
  onOpen: (chat: MockChat) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onSaveToProfile: (id: string) => void;
}) {
  const pinned = chats.filter(c => c.pinned);
  const regular = chats.filter(c => !c.pinned);
  const sorted = [...pinned, ...regular];

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ color: TEXT, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>ИИ-планировщик</div>
            <div style={{ color: GREY, fontSize: 13, marginTop: 2 }}>
              {chats.length === 0 ? 'Создайте первый маршрут' : `${chats.length} ${chats.length === 1 ? 'маршрут' : 'маршрутов'}`}
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, ${BLUE} 0%, #1A80CC 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#FFF" />
          </div>
        </div>

        {/* Create plan button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNew}
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: 18,
            background: `linear-gradient(135deg, ${BLUE} 0%, #1A80CC 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(46,166,255,0.35)',
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={16} color="#FFF" />
          </div>
          <span style={{ color: '#FFF', fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>Создать новый план</span>
          <Sparkles size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
        </motion.button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {chats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 32px' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>✈️</div>
              <div style={{ color: TEXT, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Пока нет маршрутов</div>
              <div style={{ color: GREY, fontSize: 14, lineHeight: 1.6 }}>
                Нажмите «Создать новый план»,{'\n'}чтобы AI составил идеальное путешествие
              </div>
            </motion.div>
          </div>
        ) : (
          <div style={{ paddingTop: 8 }}>
            {pinned.length > 0 && (
              <div style={{ padding: '0 16px 8px', color: GREY, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Закреплённые
              </div>
            )}
            <AnimatePresence>
              {sorted.map((chat, i) => (
                <motion.div key={chat.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scaleY: 0.8, height: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}>
                  {i === pinned.length && pinned.length > 0 && (
                    <div style={{ padding: '8px 16px 8px', color: GREY, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Все маршруты
                    </div>
                  )}
                  <SwipeableChatCard
                    chat={chat}
                    onOpen={() => onOpen(chat)}
                    onDelete={() => onDelete(chat.id)}
                    onPin={() => onPin(chat.id)}
                    onSaveToProfile={() => onSaveToProfile(chat.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// AI-1 Dialog — Duolingo-style card UI
// ───────────────────────────────────────────

function DialogScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void; }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const step = DIALOG_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / DIALOG_STEPS.length) * 100;

  const confirm = () => {
    if (!selected) return;
    const next = stepIndex + 1;
    if (next < DIALOG_STEPS.length) {
      setStepIndex(next);
      setSelected(null);
    } else {
      onDoneRef.current();
    }
  };

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '48px 20px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <BackBtn onPress={onBack} icon="x" />
        <div style={{ flex: 1, height: 10, backgroundColor: CARD2, borderRadius: 5, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${BLUE} 0%, #1AF0FF 100%)`, borderRadius: 5 }} />
        </div>
      </div>

      {/* Mascot + speech bubble */}
      <div style={{ padding: '28px 24px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: `linear-gradient(135deg, ${BLUE} 0%, #1A80CC 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(46,166,255,0.4)' }}>
            <Sparkles size={26} color="#FFF" />
          </div>
          <div style={{ textAlign: 'center', color: BLUE, fontSize: 10, fontWeight: 700, marginTop: 4, letterSpacing: 0.3 }}>ROAMI</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={stepIndex}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ flex: 1, backgroundColor: CARD2, borderRadius: '4px 20px 20px 20px', padding: '14px 18px', position: 'relative' }}>
            <div style={{ color: TEXT, fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{step.question}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Options */}
      <div style={{ flex: 1, padding: '0 20px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={stepIndex}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {step.options.map((opt, i) => {
              const isSelected = selected === opt.label;
              return (
                <motion.button key={opt.label}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelected(opt.label)}
                  style={{
                    width: '100%', padding: '16px 18px', borderRadius: 18,
                    backgroundColor: isSelected ? 'rgba(46,166,255,0.12)' : CARD,
                    border: `2px solid ${isSelected ? BLUE : 'transparent'}`,
                    display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background-color 0.15s, border-color 0.15s',
                  }}>
                  <span style={{ fontSize: 30, width: 40, textAlign: 'center', flexShrink: 0 }}>{opt.emoji}</span>
                  <span style={{ flex: 1, color: TEXT, fontSize: 16, fontWeight: 600 }}>{opt.label}</span>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    backgroundColor: isSelected ? BLUE : 'transparent',
                    border: `2.5px solid ${isSelected ? BLUE : DIM}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background-color 0.15s, border-color 0.15s',
                  }}>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.15 }}
                        style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#FFF' }} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ДАЛЕЕ button */}
      <div style={{ padding: '20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>
        <motion.button whileTap={selected ? { scale: 0.97 } : {}} onClick={confirm}
          style={{
            width: '100%', padding: '17px',
            borderRadius: 16,
            backgroundColor: selected ? BLUE : CARD2,
            color: selected ? '#FFF' : GREY,
            fontSize: 16, fontWeight: 800,
            border: 'none', cursor: selected ? 'pointer' : 'default',
            letterSpacing: 1,
            transition: 'background-color 0.2s, color 0.2s',
            boxShadow: selected ? '0 6px 20px rgba(46,166,255,0.35)' : 'none',
          }}>
          ДАЛЕЕ
        </motion.button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// AI-3 Building animation
// ───────────────────────────────────────────

function BuildingScreen({ onDone }: { onDone: () => void }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    BUILD_STAGES.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setStageIndex(i);
        setProgress(Math.round(((i + 1) / BUILD_STAGES.length) * 100));
        if (i === BUILD_STAGES.length - 1) {
          timers.push(setTimeout(() => onDoneRef.current(), 1200));
        }
      }, i * 850));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 320, height: 110, marginBottom: 52, overflow: 'hidden' }}>
        <motion.div animate={{ x: ['0%', '80%', '0%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>
          <motion.div animate={{ rotate: [0, 6, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div style={{ filter: `drop-shadow(0 0 14px ${BLUE})` }}>
              <Plane size={52} color={BLUE} />
            </div>
          </motion.div>
        </motion.div>
        {[0.25, 0.5, 0.72].map((pos, i) => (
          <motion.div key={i} animate={{ opacity: [0, 0.6, 0] }} transition={{ duration: 1.6, delay: pos, repeat: Infinity }}
            style={{ position: 'absolute', top: '50%', left: `${pos * 100}%`, width: 6, height: 6, borderRadius: 3, backgroundColor: BLUE, transform: 'translateY(-50%)' }} />
        ))}
      </div>

      <div style={{ textAlign: 'center', width: '100%', maxWidth: 280 }}>
        <AnimatePresence mode="wait">
          <motion.div key={stageIndex}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ color: TEXT, fontSize: 18, fontWeight: 700, marginBottom: 32, minHeight: 28 }}>
            {BUILD_STAGES[stageIndex]}
          </motion.div>
        </AnimatePresence>
        <div style={{ height: 6, backgroundColor: CARD2, borderRadius: 3, overflow: 'hidden', width: '100%' }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.85, ease: 'easeOut' }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${BLUE} 0%, #1AF0FF 100%)`, borderRadius: 3 }} />
        </div>
        <div style={{ color: GREY, fontSize: 12, marginTop: 10 }}>{progress}%</div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// AI-4 Trip chat
// ───────────────────────────────────────────

function TripChatScreen({ route, onViewPlan, onBack }: { route: GeneratedRoute; onViewPlan: () => void; onBack: () => void; }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMessages([{
      role: 'ai',
      text: `Готово! 🎉 Я составил маршрут в ${route.destination} на ${route.days.length} дней. Нажмите кнопку ниже, чтобы посмотреть детали.`,
    }]), 450);
    return () => clearTimeout(t);
  }, [route]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, showTyping]);

  const send = (text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputText('');
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: 'Понял! Вношу правки... Нажмите «Посмотреть маршрут» чтобы увидеть обновлённый вариант.' }]);
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '52px 16px 12px', borderBottom: `1px solid #0F1620`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackBtn onPress={onBack} />
        <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plane size={18} color="#FFF" />
        </div>
        <div>
          <div style={{ color: TEXT, fontSize: 15, fontWeight: 600 }}>{route.destination}</div>
          <div style={{ color: GREY, fontSize: 12 }}>{route.days.length} дней · {route.totalCost}</div>
        </div>
      </div>

      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 100 }}>
        <AnimatePresence>
          {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
        </AnimatePresence>
        {showTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <AIAvatar /><TypingDots />
          </motion.div>
        )}
        {messages.length > 0 && !showTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: 8 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onViewPlan}
              style={{ width: '100%', padding: 14, borderRadius: 16, background: `linear-gradient(135deg, ${BLUE} 0%, #1A80CC 100%)`, color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(46,166,255,0.35)' }}>
              <Plane size={18} />
              Посмотреть маршрут
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, backgroundColor: BG, borderTop: `1px solid #0F1620`, padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={inputText} onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && inputText.trim()) send(inputText.trim()); }}
            placeholder="Изменить маршрут..."
            style={{ flex: 1, height: 42, borderRadius: 21, backgroundColor: CARD2, border: `1px solid ${DIM}`, color: TEXT, padding: '0 16px', fontSize: 14, outline: 'none' }} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { if (inputText.trim()) send(inputText.trim()); }}
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, border: 'none' }}>
            <Send size={16} color="#FFF" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// AI-5 Plan overview
// ───────────────────────────────────────────

function PlanScreen({ route, onDay, onBack }: { route: GeneratedRoute; onDay: (i: number) => void; onBack: () => void; }) {
  const totalDays = Math.round((new Date(route.dateTo).getTime() - new Date(route.dateFrom).getTime()) / 86400000);

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, overflowY: 'auto', paddingBottom: 40 }}>
      <div style={{ position: 'relative', height: 220 }}>
        <img src={route.coverImage} alt={route.destination} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(23,33,43,0.45) 0%, rgba(23,33,43,0.95) 100%)' }} />
        <div style={{ position: 'absolute', top: 52, left: 16 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(23,33,43,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
            <ChevronLeft size={20} color={TEXT} />
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
          <div style={{ color: TEXT, fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>{route.destination}</div>
          <div style={{ color: GREY, fontSize: 13, marginTop: 3 }}>{route.country} · {totalDays} дней · {route.totalCost}</div>
          {route.weather && <div style={{ color: '#A8D8FF', fontSize: 12, marginTop: 5 }}>{route.weather}</div>}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Transfer */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.35 }}
          style={{ backgroundColor: CARD, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🚗</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: GREY, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Трансфер</div>
            <div style={{ color: TEXT, fontSize: 13 }}>{route.transfer.toAirport}</div>
          </div>
          <div style={{ color: BLUE, fontSize: 13, fontWeight: 600 }}>{route.transfer.cost}</div>
        </motion.div>

        {/* Flight */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.35 }}
          style={{ backgroundColor: CARD, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ color: GREY, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Авиарейс</div>
            <div style={{ color: BLUE, fontSize: 13, fontWeight: 600 }}>{route.flight.price}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: TEXT, fontSize: 20, fontWeight: 700 }}>{route.flight.departure}</div>
              <div style={{ color: GREY, fontSize: 11 }}>{route.flight.from.split(' ')[0]}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Plane size={16} color={BLUE} />
              <div style={{ width: '100%', height: 1, backgroundColor: DIM }} />
              <div style={{ color: GREY, fontSize: 10 }}>{route.flight.airline}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: TEXT, fontSize: 20, fontWeight: 700 }}>{route.flight.arrival}</div>
              <div style={{ color: GREY, fontSize: 11 }}>{route.flight.to.split(' ')[0]}</div>
            </div>
          </div>
          <a href={route.flight.aviasalesUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 12, backgroundColor: CARD2, color: BLUE, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Найти билет на Aviasales →
          </a>
        </motion.div>

        {/* Hotel */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.35 }}
          style={{ backgroundColor: CARD, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ color: GREY, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Отель</div>
              <div style={{ color: TEXT, fontSize: 15, fontWeight: 600 }}>{route.hotel.name}</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 5 }}>
                {Array.from({ length: route.hotel.stars }).map((_, i) => <Star key={i} size={11} color={GOLD} fill={GOLD} />)}
              </div>
            </div>
            <div style={{ color: BLUE, fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{route.hotel.price}</div>
          </div>
          <div style={{ color: GREY, fontSize: 12, marginBottom: 12 }}>{route.hotel.address}</div>
          <a href={route.hotel.bookingUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 12, backgroundColor: CARD2, color: BLUE, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Забронировать на Booking.com →
          </a>
        </motion.div>

        {/* Days */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.35 }}>
          <div style={{ color: TEXT, fontSize: 16, fontWeight: 700, marginBottom: 10 }}>По дням</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {route.days.map((day, i) => (
              <motion.button key={day.date} whileTap={{ scale: 0.97 }} onClick={() => onDay(i)}
                style={{ width: '100%', backgroundColor: CARD, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: BLUE, fontSize: 17, fontWeight: 700 }}>{day.dayNumber}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>
                    {new Date(day.date).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
                  </div>
                  <div style={{ color: GREY, fontSize: 12, marginTop: 2 }}>{day.activities.length} активностей</div>
                </div>
                <ChevronRight size={18} color={DIM} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Budget */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.35 }}
          style={{ backgroundColor: CARD, borderRadius: 16, padding: 16 }}>
          <div style={{ color: TEXT, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Бюджет</div>
          {[
            { label: 'Авиабилеты', value: route.flight.price },
            { label: `Отель × ${totalDays}н`, value: route.hotel.price },
            { label: 'Трансфер', value: route.transfer.cost },
            { label: 'Активности', value: '~15 000 ₽' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: GREY, fontSize: 13 }}>{label}</span>
              <span style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
          <div style={{ height: 1, backgroundColor: DIM, margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>Итого</span>
            <span style={{ color: BLUE, fontSize: 15, fontWeight: 700 }}>{route.totalCost}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// AI-6 Day screen
// ───────────────────────────────────────────

function DayScreen({ route, dayIndex, onActivity, onBack }: {
  route: GeneratedRoute; dayIndex: number; onActivity: (i: number) => void; onBack: () => void;
}) {
  const day = route.days[dayIndex];
  type Period = 'morning' | 'day' | 'evening' | 'night';
  const grouped = day.activities.reduce<Record<Period, typeof day.activities>>((acc, act) => {
    const p = getPeriod(act.time) as Period;
    (acc[p] = acc[p] || []).push(act);
    return acc;
  }, {} as Record<Period, typeof day.activities>);

  const TYPE_COLOR: Record<string, string> = { hotel: BLUE, attraction: GOLD, food: GREEN, flight: BLUE, transport: GREY };

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, overflowY: 'auto', paddingBottom: 40 }}>
      <div style={{ padding: '52px 16px 16px', borderBottom: `1px solid #0F1620`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackBtn onPress={onBack} />
        <div>
          <div style={{ color: TEXT, fontSize: 18, fontWeight: 700 }}>День {day.dayNumber}</div>
          <div style={{ color: GREY, fontSize: 13 }}>{new Date(day.date).toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        {(['morning', 'day', 'evening', 'night'] as Period[]).map(period => {
          const acts = grouped[period];
          if (!acts?.length) return null;
          return (
            <div key={period} style={{ marginBottom: 24 }}>
              <div style={{ color: GREY, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>{PERIOD_LABELS[period]}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {acts.map(act => {
                  const color = TYPE_COLOR[act.type] || GREY;
                  return (
                    <motion.button key={`${act.time}-${act.title}`} whileTap={{ scale: 0.97 }} onClick={() => onActivity(day.activities.indexOf(act))}
                      style={{ width: '100%', backgroundColor: CARD, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, paddingTop: 1 }}>
                        <div style={{ color, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{act.time}</div>
                        <div style={{ width: 2, height: 20, backgroundColor: DIM, borderRadius: 1 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: TEXT, fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{act.title}</div>
                        <div style={{ color: GREY, fontSize: 12, lineHeight: 1.4 }}>{act.description}</div>
                        {act.price && <div style={{ color, fontSize: 12, fontWeight: 600, marginTop: 6 }}>{act.price}</div>}
                      </div>
                      <ChevronRight size={16} color={DIM} style={{ flexShrink: 0, marginTop: 2 }} />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// AI-7 Place detail
// ───────────────────────────────────────────

function PlaceScreen({ route, dayIndex, activityIndex, onDeep, onBack }: {
  route: GeneratedRoute; dayIndex: number; activityIndex: number;
  onDeep: (title: string, content: string) => void; onBack: () => void;
}) {
  const act = route.days[dayIndex].activities[activityIndex];
  const TYPE_EMOJI: Record<string, string> = { hotel: '🏨', attraction: '🏛️', food: '🍜', flight: '✈️', transport: '🚌' };
  const TYPE_LABEL: Record<string, string> = { hotel: 'Отель', attraction: 'Достопримечательность', food: 'Еда', flight: 'Перелёт', transport: 'Транспорт' };

  const transport = [
    { icon: '🚶', label: 'Пешком', detail: '10–15 мин', action: null as string | null, title: '', body: '' },
    { icon: '🚕', label: 'Такси', detail: '5 мин · ~250 ₽', action: 'Яндекс Go', title: 'Яндекс Go', body: `Маршрут до: ${act.title}\n\nОжидаемое время: 5 мин\nПримерная цена: 200–300 ₽` },
    { icon: '🚇', label: 'Метро', detail: '2 остановки · 60 ₽', action: 'Маршрут', title: 'Маршрут на метро', body: `До: ${act.title}\n\nПересадки: 0\nВремя: 12–15 мин\nСтоимость: 60 ₽` },
  ];

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, overflowY: 'auto', paddingBottom: 48 }}>
      <div style={{ position: 'relative', height: 200 }}>
        <img src={route.coverImage} alt={act.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(23,33,43,0.4) 0%, rgba(23,33,43,0.95) 100%)' }} />
        <div style={{ position: 'absolute', top: 52, left: 16 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(23,33,43,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
            <ChevronLeft size={20} color={TEXT} />
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(28,39,51,0.8)', padding: '3px 10px', borderRadius: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 14 }}>{TYPE_EMOJI[act.type] || '📍'}</span>
            <span style={{ color: GREY, fontSize: 12 }}>{act.time} · {TYPE_LABEL[act.type] || act.type}</span>
          </div>
          <div style={{ color: TEXT, fontSize: 20, fontWeight: 700 }}>{act.title}</div>
        </div>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ backgroundColor: CARD, borderRadius: 16, padding: 16 }}>
          <div style={{ color: TEXT, fontSize: 13, lineHeight: 1.7 }}>
            {act.description}. Одно из лучших мест в этом районе. Рекомендуем прийти пораньше, чтобы избежать очередей.
          </div>
        </div>
        {act.price && (
          <div style={{ backgroundColor: CARD, borderRadius: 16, padding: 16 }}>
            <div style={{ color: GREY, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Стоимость</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: TEXT, fontSize: 18, fontWeight: 700 }}>{act.price}</div>
              <motion.button whileTap={{ scale: 0.94 }}
                onClick={() => onDeep('Актуальные цены', `${act.title}\n\nБазовая цена: ${act.price}\n\nЦены могут меняться. Проверьте на официальном сайте.\n\nСкидки: студентам −50%, дети до 12 лет бесплатно.`)}
                style={{ backgroundColor: CARD2, borderRadius: 10, padding: '8px 14px', color: BLUE, fontSize: 13, fontWeight: 600, border: `1px solid ${DIM}`, cursor: 'pointer' }}>
                Найти точную цену
              </motion.button>
            </div>
          </div>
        )}
        <div style={{ backgroundColor: CARD, borderRadius: 16, padding: 16 }}>
          <div style={{ color: GREY, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Как добраться</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transport.map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>{opt.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{opt.label}</div>
                  <div style={{ color: GREY, fontSize: 12 }}>{opt.detail}</div>
                </div>
                {opt.action && (
                  <motion.button whileTap={{ scale: 0.94 }} onClick={() => onDeep(opt.title, opt.body)}
                    style={{ backgroundColor: CARD2, borderRadius: 10, padding: '6px 12px', color: BLUE, fontSize: 12, fontWeight: 600, border: `1px solid ${DIM}`, cursor: 'pointer', flexShrink: 0 }}>
                    {opt.action}
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => onDeep('Открыть в картах', `${act.title}\n\nАдрес: ${act.description}\n\nДоступно в:\n• Яндекс Карты\n• Google Maps\n• Apple Maps`)}
          style={{ width: '100%', padding: 14, borderRadius: 16, backgroundColor: CARD, color: BLUE, fontSize: 15, fontWeight: 600, border: `1px solid ${DIM}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ExternalLink size={18} />
          Открыть в картах
        </motion.button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// AI-8+ Deep screen
// ───────────────────────────────────────────

function DeepScreen({ title, content, onDeep, onBack }: {
  title: string; content: string;
  onDeep: (title: string, content: string) => void; onBack: () => void;
}) {
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, overflowY: 'auto', paddingBottom: 40 }}>
      <div style={{ padding: '52px 16px 16px', borderBottom: `1px solid #0F1620`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackBtn onPress={onBack} />
        <div style={{ color: TEXT, fontSize: 17, fontWeight: 600 }}>{title}</div>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ backgroundColor: CARD, borderRadius: 16, padding: 16 }}>
          <div style={{ color: TEXT, fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{content}</div>
        </div>
        {[
          { label: 'Расписание работы', desc: 'Часы работы и выходные', t: 'Расписание', b: 'Пн–Пт: 09:00–21:00\nСб–Вс: 10:00–22:00\nПраздники: уточняйте на сайте.' },
          { label: 'Отзывы посетителей', desc: 'Что говорят путешественники', t: 'Отзывы', b: '⭐⭐⭐⭐⭐ Мария К.\n"Потрясающее место!"\n\n⭐⭐⭐⭐ Алексей В.\n"Хорошо, но много туристов."' },
        ].map(item => (
          <motion.button key={item.label} whileTap={{ scale: 0.97 }} onClick={() => onDeep(item.t, item.b)}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 14, backgroundColor: CARD, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
            <div>
              <div style={{ color: TEXT, fontSize: 14, fontWeight: 500 }}>{item.label}</div>
              <div style={{ color: GREY, fontSize: 12, marginTop: 2 }}>{item.desc}</div>
            </div>
            <ChevronRight size={16} color={DIM} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// Root page
// ───────────────────────────────────────────

export default function SearchPage() {
  const { addRoute } = useApp();
  const [stack, setStack] = useState<NavScreen[]>([{ name: 'chat-list' }]);
  const [chats, setChats] = useState<MockChat[]>([]);
  const [generatedRoute, setGeneratedRoute] = useState<GeneratedRoute>(MOCK_ROUTES[0]);

  const push = (s: NavScreen) => setStack(prev => [...prev, s]);
  const pop = () => setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  const current = stack[stack.length - 1];

  const makeNewRoute = (): GeneratedRoute => ({
    ...MOCK_ROUTES[0],
    id: `ai_${Date.now()}`,
    isOwnCreation: true,
    isPublished: false,
    publishedSaves: 0,
    publishedReviewCount: 0,
    createdAt: new Date().toISOString(),
  });

  const addChat = (route: GeneratedRoute) => {
    const newChat: MockChat = {
      id: Date.now().toString(),
      destination: route.destination,
      country: route.country,
      coverImage: route.coverImage,
      duration: `${route.days.length} дней`,
      cost: route.totalCost ?? '',
      date: 'только что',
      pinned: false,
      savedToProfile: false,
      routeData: route,
    };
    setChats(prev => [newChat, ...prev]);
  };

  const deleteChat = (id: string) => setChats(prev => prev.filter(c => c.id !== id));
  const pinChat = (id: string) => setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));

  const saveToProfile = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (chat?.routeData && !chat.savedToProfile) {
      addRoute(chat.routeData);
      setChats(prev => prev.map(c => c.id === id ? { ...c, savedToProfile: true } : c));
    }
  };

  const handleOpenChat = (chat: MockChat) => {
    if (chat.routeData) setGeneratedRoute(chat.routeData);
    push({ name: 'trip-chat' });
  };

  const screenKey = `${current.name}-${stack.length}-${current.dayIndex ?? ''}-${current.activityIndex ?? ''}-${current.deepTitle ?? ''}`;

  const renderScreen = () => {
    switch (current.name) {
      case 'chat-list':
        return (
          <ChatListScreen
            chats={chats}
            onNew={() => push({ name: 'dialog' })}
            onOpen={handleOpenChat}
            onDelete={deleteChat}
            onPin={pinChat}
            onSaveToProfile={saveToProfile}
          />
        );

      case 'dialog':
        return (
          <DialogScreen
            onBack={pop}
            onDone={() => {
              setStack(prev => {
                const base = prev.filter(s => s.name === 'chat-list');
                return [...base, { name: 'building' }];
              });
            }}
          />
        );

      case 'building':
        return (
          <BuildingScreen
            onDone={() => {
              const newRoute = makeNewRoute();
              setGeneratedRoute(newRoute);
              addChat(newRoute);
              setStack(prev => {
                const base = prev.filter(s => s.name === 'chat-list');
                return [...base, { name: 'trip-chat' }];
              });
            }}
          />
        );

      case 'trip-chat':
        return <TripChatScreen route={generatedRoute} onViewPlan={() => push({ name: 'plan' })} onBack={pop} />;

      case 'plan':
        return <PlanScreen route={generatedRoute} onDay={(i) => push({ name: 'day', dayIndex: i })} onBack={pop} />;

      case 'day':
        return (
          <DayScreen
            route={generatedRoute}
            dayIndex={current.dayIndex ?? 0}
            onActivity={(i) => push({ name: 'place', dayIndex: current.dayIndex ?? 0, activityIndex: i })}
            onBack={pop}
          />
        );

      case 'place':
        return (
          <PlaceScreen
            route={generatedRoute}
            dayIndex={current.dayIndex ?? 0}
            activityIndex={current.activityIndex ?? 0}
            onDeep={(title, content) => push({ name: 'deep', deepTitle: title, deepContent: content })}
            onBack={pop}
          />
        );

      case 'deep':
        return (
          <DeepScreen
            title={current.deepTitle ?? 'Детали'}
            content={current.deepContent ?? ''}
            onDeep={(title, content) => push({ name: 'deep', deepTitle: title, deepContent: content })}
            onBack={pop}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', position: 'relative', minHeight: '100dvh', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screenKey}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
