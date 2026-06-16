'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Search, MapPin, Calendar, Users, ChevronRight, Send, Plane, X, Minus, Plus } from 'lucide-react';
import { generateMockRoute, type TripParams } from '@/lib/mockAI';
import { POPULAR_DESTINATIONS } from '@/lib/mockData';

type Tab = 'destination' | 'dates' | 'prefs';

type InterestChip = { id: string; label: string; emoji: string };
const INTERESTS: InterestChip[] = [
  { id: 'beach', label: 'Пляж', emoji: '🏖️' },
  { id: 'mountains', label: 'Горы', emoji: '🏔️' },
  { id: 'food', label: 'Еда', emoji: '🍜' },
  { id: 'culture', label: 'Культура', emoji: '🏛️' },
  { id: 'activities', label: 'Активности', emoji: '🧗' },
  { id: 'shopping', label: 'Шопинг', emoji: '🛍️' },
  { id: 'nightlife', label: 'Ночная жизнь', emoji: '🎵' },
  { id: 'nature', label: 'Природа', emoji: '🌿' },
];

type ChatMessage = { role: 'ai' | 'user'; text: string };

const AI_QUESTIONS = [
  {
    text: 'Какой отдых предпочитаешь — активный (экскурсии, треккинг) или пассивный (пляж, СПА)?',
    key: 'restType',
    options: ['Активный', 'Пассивный', 'Смешанный'],
  },
  {
    text: 'Какой тип отеля предпочитаешь?',
    key: 'hotelType',
    options: ['Хостел', 'Стандарт 3★', 'Комфорт 4★', 'Бизнес 5★'],
  },
  {
    text: 'Есть ли ограничения по питанию или особые пожелания?',
    key: 'dietary',
    options: ['Нет особых', 'Вегетарианское', 'Халяль', 'Без глютена'],
  },
  {
    text: 'Хочешь включить ночную жизнь, рестораны и бары в маршрут?',
    key: 'nightlife',
    options: ['Да, обязательно', 'Немного', 'Нет'],
  },
];

export default function SearchPage() {
  const { user, aiRequestsLeft, decrementAI, addRoute } = useApp();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('destination');
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [budget, setBudget] = useState<'economy' | 'medium' | 'business'>('medium');
  const [interests, setInterests] = useState<string[]>([]);

  const [phase, setPhase] = useState<'form' | 'chat' | 'generating' | 'done'>('form');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [inputText, setInputText] = useState('');
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectDestination = (name: string, c: string) => {
    setDestination(name);
    setCountry(c);
    setTab('dates');
  };

  const handleSearch = () => {
    if (!destination) { setTab('destination'); return; }
    if (!dateFrom || !dateTo) { setTab('dates'); return; }
    if (aiRequestsLeft <= 0) return;

    setPhase('chat');
    setTimeout(() => {
      setMessages([{ role: 'ai', text: `Отлично! Планирую поездку в ${destination}. Уточню пару деталей.\n\n${AI_QUESTIONS[0].text}` }]);
    }, 600);
  };

  const sendAnswer = (answer: string) => {
    const q = AI_QUESTIONS[currentQ];
    const newPrefs = { ...prefs, [q.key]: answer };
    setPrefs(newPrefs);
    setMessages(prev => [...prev, { role: 'user', text: answer }]);
    setInputText('');

    const nextQ = currentQ + 1;
    if (nextQ < AI_QUESTIONS.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: AI_QUESTIONS[nextQ].text }]);
        setCurrentQ(nextQ);
      }, 600);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `Собрал всё необходимое! Генерирую маршрут в ${destination} на ${getDays()} дней. Это займёт ~15 секунд...`,
        }]);
        setPhase('generating');
        generateRoute(newPrefs);
      }, 600);
    }
  };

  const getDays = () => {
    if (!dateFrom || !dateTo) return '?';
    const d = Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000);
    return d;
  };

  const generateRoute = async (finalPrefs: Record<string, string>) => {
    const params: TripParams = {
      destination,
      country,
      dateFrom,
      dateTo,
      adults,
      children,
      budget,
      interests,
      preferences: {
        restType: finalPrefs.restType === 'Активный' ? 'active' : 'passive',
        hotelType: finalPrefs.hotelType,
        dietary: finalPrefs.dietary,
        nightlife: finalPrefs.nightlife === 'Да, обязательно',
      },
    };

    try {
      const route = await generateMockRoute(params);
      decrementAI();
      addRoute(route);
      router.push(`/history?highlight=${route.id}`);
    } catch {
      setPhase('form');
    }
  };

  const resetSearch = () => {
    setPhase('form');
    setMessages([]);
    setCurrentQ(0);
    setPrefs({});
    setInputText('');
  };

  if (phase === 'generating') {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] flex flex-col items-center justify-center px-5">
        <div className="text-center fade-in-up">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plane size={36} className="text-blue-600 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Собираю маршрут...</h2>
          <p className="text-slate-500 text-sm mb-6">AI подбирает лучшие варианты для тебя</p>
          <div className="bg-white rounded-2xl p-4 card w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600">Анализирую направление</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
              <span className="text-sm text-slate-600">Подбираю рейсы на Aviasales</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
              <span className="text-sm text-slate-600">Ищу отели на Booking.com</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} />
              <span className="text-sm text-slate-600">Составляю расписание по дням</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'chat') {
    const currentQuestion = AI_QUESTIONS[currentQ];
    const isAnswered = currentQ >= AI_QUESTIONS.length;

    return (
      <div className="min-h-dvh bg-[#F8FAFC] flex flex-col">
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <button onClick={resetSearch} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
          <div>
            <div className="font-semibold text-slate-900 text-sm">AI Планировщик</div>
            <div className="text-xs text-slate-400">{destination} · {getDays()} дней</div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">онлайн</span>
          </div>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none" style={{ paddingBottom: 120 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in-up`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
              )}
              <div className={msg.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}
                style={{ whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {!isAnswered && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-4 py-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {currentQuestion.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => sendAnswer(opt)}
                  className="chip hover:bg-blue-50 hover:border-blue-300 text-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input-field flex-1 text-sm"
                placeholder="Или напиши свой ответ..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && inputText.trim()) sendAnswer(inputText.trim()); }}
              />
              <button
                onClick={() => inputText.trim() && sendAnswer(inputText.trim())}
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC]">
      <div className="bg-white px-5 pt-12 pb-4">
        <div className="text-xs text-slate-400 font-medium mb-1">Привет, {user?.name?.split(' ')[0]} 👋</div>
        <h1 className="text-2xl font-bold text-slate-900">Куда летим?</h1>
        {user?.status === 'free' && (
          <div className="mt-2 text-xs text-slate-400">
            Маршрутов осталось: <span className={`font-semibold ${aiRequestsLeft === 0 ? 'text-red-500' : 'text-blue-600'}`}>{aiRequestsLeft}/3</span>
          </div>
        )}
      </div>

      <div className="px-5 py-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
          {(['destination', 'dates', 'prefs'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'
              }`}
            >
              {t === 'destination' ? '🌍 Куда' : t === 'dates' ? '📅 Даты' : '⚙️ Настройки'}
            </button>
          ))}
        </div>

        {tab === 'destination' && (
          <div className="fade-in-up space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input-field pl-9"
                placeholder="Город или страна..."
                value={destination}
                onChange={e => { setDestination(e.target.value); setCountry(''); }}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Популярные</p>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_DESTINATIONS.map(d => (
                  <button
                    key={d.name}
                    onClick={() => selectDestination(d.name, d.country)}
                    className={`card p-3 text-left transition-all ${destination === d.name ? 'ring-2 ring-blue-600' : ''}`}
                  >
                    <div className="text-xl mb-1">{d.emoji}</div>
                    <div className="text-xs font-semibold text-slate-800">{d.name}</div>
                    <div className="text-xs text-slate-400">{d.temp}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'dates' && (
          <div className="fade-in-up space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Дата вылета</label>
              <input
                className="input-field"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Дата возврата</label>
              <input
                className="input-field"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                min={dateFrom || new Date().toISOString().split('T')[0]}
              />
            </div>
            {dateFrom && dateTo && (
              <div className="card p-3 flex items-center gap-2 bg-blue-50 border border-blue-100">
                <Calendar size={16} className="text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">
                  {Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000)} дней
                </span>
              </div>
            )}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-500 mb-3 block flex items-center gap-1">
                <Users size={13} /> Состав группы
              </label>
              <div className="flex items-center justify-between card p-3 mb-2">
                <span className="text-sm text-slate-700">Взрослые</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Minus size={14} className="text-slate-600" />
                  </button>
                  <span className="w-4 text-center font-semibold">{adults}</span>
                  <button onClick={() => setAdults(adults + 1)} className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Plus size={14} className="text-blue-600" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between card p-3">
                <span className="text-sm text-slate-700">Дети</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Minus size={14} className="text-slate-600" />
                  </button>
                  <span className="w-4 text-center font-semibold">{children}</span>
                  <button onClick={() => setChildren(children + 1)} className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Plus size={14} className="text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'prefs' && (
          <div className="fade-in-up space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Бюджет</label>
              <div className="grid grid-cols-3 gap-2">
                {([['economy', 'Эконом', '💸'], ['medium', 'Средний', '💳'], ['business', 'Бизнес', '💎']] as const).map(([k, label, emoji]) => (
                  <button
                    key={k}
                    onClick={() => setBudget(k)}
                    className={`card p-3 text-center transition-all ${budget === k ? 'ring-2 ring-blue-600 bg-blue-50' : ''}`}
                  >
                    <div className="text-xl mb-1">{emoji}</div>
                    <div className="text-xs font-semibold text-slate-700">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Интересы</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(i => (
                  <button
                    key={i.id}
                    onClick={() => toggleInterest(i.id)}
                    className={`chip ${interests.includes(i.id) ? 'active' : ''}`}
                  >
                    {i.emoji} {i.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-4">
        {aiRequestsLeft === 0 && user?.status === 'free' ? (
          <div className="card p-4 mb-3 bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800 font-medium mb-2">Лимит Free исчерпан (3/3)</p>
            <p className="text-xs text-amber-600 mb-3">Оформи Premium для безлимитных маршрутов</p>
            <button
              onClick={() => router.push('/profile')}
              className="btn-primary bg-amber-500"
              style={{ background: '#f59e0b' }}
            >
              Оформить Premium — 799 ₽/мес
            </button>
          </div>
        ) : (
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={!destination || !dateFrom || !dateTo}
          >
            <Search size={18} />
            Найти маршрут
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
