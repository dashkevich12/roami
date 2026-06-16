'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, MapPin, Sparkles, Compass } from 'lucide-react';

const slides = [
  {
    icon: <Sparkles size={48} className="text-blue-600" />,
    title: 'AI планирует за тебя',
    desc: 'Укажи направление, даты и бюджет — получи готовый маршрут за 15 секунд. Без 10 открытых вкладок.',
    bg: 'from-blue-50 to-white',
  },
  {
    icon: <MapPin size={48} className="text-blue-600" />,
    title: 'От двери до отеля',
    desc: 'Такси → аэропорт → рейс → размещение → экскурсии. Всё в одном месте с реальными ссылками на бронирование.',
    bg: 'from-violet-50 to-white',
  },
  {
    icon: <Compass size={48} className="text-blue-600" />,
    title: 'Гид прямо на улице',
    desc: 'Направь камеру на здание или найди любое место — AI расскажет историю и интересные факты.',
    bg: 'from-emerald-50 to-white',
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

  const skip = () => router.push('/auth');

  const slide = slides[current];

  return (
    <div className={`min-h-dvh flex flex-col bg-gradient-to-b ${slide.bg} transition-all duration-500`}>
      <div className="flex justify-between items-center px-5 pt-12">
        <div className="text-xl font-bold text-blue-600">ROAMI</div>
        <button onClick={skip} className="text-slate-400 text-sm font-medium">
          Пропустить
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm">
          {slide.icon}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
          {slide.title}
        </h1>
        <p className="text-slate-500 text-base leading-relaxed">
          {slide.desc}
        </p>
      </div>

      <div className="px-5 pb-10">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <button onClick={next} className="btn-primary">
          {current < slides.length - 1 ? 'Далее' : 'Начать'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
