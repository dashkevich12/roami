'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const BG = '#17212B';
const CARD = '#1C2733';
const BLUE = '#2EA6FF';
const TEXT = '#E8F1F8';
const GREY = '#8899A8';
const DIM = '#3A4D5C';

const slides = [
  {
    emoji: '✨',
    title: 'AI планирует за тебя',
    desc: 'Укажи направление, даты и бюджет — получи готовый маршрут за 15 секунд. Без 10 открытых вкладок.',
  },
  {
    emoji: '📍',
    title: 'От двери до отеля',
    desc: 'Такси → аэропорт → рейс → размещение → экскурсии. Всё в одном месте с реальными ссылками на бронирование.',
  },
  {
    emoji: '🧭',
    title: 'Гид прямо на улице',
    desc: 'Направь камеру на здание или найди любое место — AI расскажет историю и интересные факты.',
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      router.push('/auth');
    }
  };

  const slide = slides[current];

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: BG }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '52px 24px 0' }}>
        <div style={{ color: BLUE, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>ROAMI</div>
        <button onClick={() => router.push('/auth')} style={{ color: GREY, fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
          Пропустить
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 44 }}>
              {slide.emoji}
            </div>
            <h1 style={{ color: TEXT, fontSize: 26, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
              {slide.title}
            </h1>
            <p style={{ color: GREY, fontSize: 15, lineHeight: 1.65 }}>
              {slide.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ padding: '0 24px 44px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {slides.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === current ? 24 : 8, backgroundColor: i === current ? BLUE : DIM }}
              transition={{ duration: 0.3 }}
              style={{ height: 8, borderRadius: 4 }}
            />
          ))}
        </div>
        <button
          onClick={next}
          style={{ width: '100%', backgroundColor: BLUE, borderRadius: 16, padding: '17px', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          {current < slides.length - 1 ? 'Далее' : 'Начать'}
        </button>
      </div>
    </div>
  );
}
