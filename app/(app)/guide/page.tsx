'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Camera, Info, Clock, Coins, Navigation, Crown } from 'lucide-react';

const DEMO_PLACES = [
  {
    id: '1',
    name: 'Большой театр',
    city: 'Москва',
    emoji: '🎭',
    image: 'https://images.unsplash.com/photo-1539649256986-86e0f9041b04?w=800&q=80',
    history: 'Большой театр основан в 1776 году. Одно из крупнейших театральных зданий мира. Здание в нынешнем виде построено в 1825 году по проекту архитектора Осипа Бове. После реконструкции 2011 года стало ещё более грандиозным.',
    facts: ['Площадь сцены — 800 кв.м', 'Зал вмещает 2153 зрителя', 'Орган насчитывает 6088 труб', 'В труппе более 900 артистов'],
    hours: 'Вт–Вс 11:00–23:00',
    price: '3 000–80 000 ₽',
    nearby: ['Александровский сад', 'Манежная площадь', 'ГУМ'],
  },
  {
    id: '2',
    name: 'Петропавловская крепость',
    city: 'Санкт-Петербург',
    emoji: '🏰',
    image: 'https://images.unsplash.com/photo-1548449112-96a38a643324?w=800&q=80',
    history: 'Заложена Петром I 27 мая 1703 года — эта дата считается днём основания Санкт-Петербурга. Изначально деревянная, в 1706–1740 годах перестроена в камне. Служила политической тюрьмой: здесь сидел цесаревич Алексей, Достоевский и народовольцы.',
    facts: ['Шпиль колокольни — 122.5 м', 'Ежедневно в 12:00 — пушечный выстрел', 'Здесь захоронены все русские императоры с Петра I', 'Нева рядом никогда не замерзает'],
    hours: '06:00–21:00 (территория), музей 10:00–18:00',
    price: 'Территория бесплатно, музей — 650 ₽',
    nearby: ['Эрмитаж', 'Стрелка Васильевского острова', 'Медный всадник'],
  },
  {
    id: '3',
    name: 'Красная площадь',
    city: 'Москва',
    emoji: '🏛️',
    image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&q=80',
    history: 'Площадь возникла в конце XV века после сноса торговых рядов у стен Кремля. Название «Красная» означало «красивая» в старорусском языке. Собор Василия Блаженного построен в 1555–1561 годах по приказу Ивана Грозного в честь взятия Казани.',
    facts: ['Длина — 695 м, ширина — 130 м', 'Внесена в список ЮНЕСКО в 1990 году', 'Ежегодно 9 мая — парад Победы', 'Брусчатка — каждый камень уложен вручную'],
    hours: '24/7 (доступ открыт)',
    price: 'Бесплатно',
    nearby: ['Кремль', 'ГУМ', 'Александровский сад', 'Исторический музей'],
  },
];

type GuideResult = typeof DEMO_PLACES[0] | null;

export default function GuidePage() {
  const { user, guideRequestsLeft, decrementGuide } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GuideResult>(null);
  const [gpsMode, setGpsMode] = useState(false);

  const isPremium = user?.status === 'premium';
  const canUse = isPremium || guideRequestsLeft > 0;

  const handleSearch = async () => {
    if (!query.trim() || !canUse) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));

    const found = DEMO_PLACES.find(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.city.toLowerCase().includes(query.toLowerCase())
    ) || DEMO_PLACES[0];

    decrementGuide();
    setResult(found);
    setLoading(false);
  };

  const handleGPS = async () => {
    if (!canUse) return;
    setGpsMode(true);
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    decrementGuide();
    setResult(DEMO_PLACES[0]);
    setLoading(false);
  };

  return (
    <div className="min-h-dvh bg-[#F8FAFC]">
      <div className="bg-white px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Гид</h1>
        <p className="text-slate-400 text-sm mt-1">История любого места в один тап</p>
        {!isPremium && (
          <div className="mt-2 flex items-center gap-2">
            <div className={`text-xs font-medium ${guideRequestsLeft === 0 ? 'text-red-500' : 'text-slate-500'}`}>
              Запросов сегодня: {guideRequestsLeft}/5
            </div>
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${(guideRequestsLeft / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-3">
        <div className="card p-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9 text-sm border-0 bg-transparent focus:ring-0 p-0 pl-8"
              style={{ border: 'none', outline: 'none', background: 'transparent', padding: '8px 8px 8px 28px' }}
              placeholder="Название места или город..."
              value={query}
              onChange={e => { setQuery(e.target.value); setResult(null); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading || !canUse}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              canUse && query.trim() ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {loading && !gpsMode ? 'Ищу...' : 'Найти'}
          </button>
        </div>

        <button
          onClick={handleGPS}
          disabled={loading || !canUse}
          className="w-full card p-3 flex items-center gap-3 text-left hover:bg-blue-50 transition-colors"
        >
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <Navigation size={18} className="text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">Авто по GPS</div>
            <div className="text-xs text-slate-400">Найти достопримечательности рядом</div>
          </div>
          {loading && gpsMode && (
            <div className="ml-auto generating-dots flex gap-1">
              <span /><span /><span />
            </div>
          )}
        </button>

        <button className="w-full card p-3 flex items-center gap-3 text-left opacity-60">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
            <Camera size={18} className="text-slate-500" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">Камера</div>
            <div className="text-xs text-slate-400">Направь на здание</div>
          </div>
          <span className="ml-auto text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">v1.1</span>
        </button>

        {!canUse && !isPremium && (
          <div className="card p-4 bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} className="text-amber-500" />
              <span className="font-semibold text-amber-800 text-sm">Лимит исчерпан</span>
            </div>
            <p className="text-xs text-amber-700 mb-3">5 запросов в день — лимит Free. Обновится в 00:00 UTC.</p>
            <button
              onClick={() => router.push('/profile')}
              className="btn-primary bg-amber-500 text-sm py-2.5"
              style={{ background: '#f59e0b' }}
            >
              Получить безлимитный Гид
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="fade-in-up space-y-3">
            <div className="card overflow-hidden">
              <img src={result.image} alt={result.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{result.emoji}</span>
                  <h2 className="text-lg font-bold text-slate-900">{result.name}</h2>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                  <MapPin size={11} />{result.city}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{result.history}</p>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
                <Info size={15} className="text-blue-600" />
                Интересные факты
              </div>
              <div className="space-y-2">
                {result.facts.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Clock size={11} /> Режим работы
                </div>
                <div className="text-sm text-slate-700">{result.hours}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Coins size={11} /> Стоимость
                </div>
                <div className="text-sm text-slate-700">{result.price}</div>
              </div>
            </div>

            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-400 mb-2">Рядом</div>
              <div className="flex flex-wrap gap-2">
                {result.nearby.map(n => (
                  <span key={n} className="chip text-xs">{n}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="text-center py-8 text-slate-400">
            <div className="text-4xl mb-3">🗺️</div>
            <div className="text-sm">Попробуй: «Большой театр», «Эрмитаж», «Москва»</div>
          </div>
        )}
      </div>
    </div>
  );
}
