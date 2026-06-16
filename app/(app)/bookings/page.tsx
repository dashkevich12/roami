'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Plane, Hotel, ExternalLink, Clock } from 'lucide-react';
import type { Booking } from '@/lib/types';

type Filter = 'upcoming' | 'completed' | 'all';

function BookingCard({ b }: { b: Booking }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            b.type === 'flight' ? 'bg-blue-50' : 'bg-violet-50'
          }`}>
            {b.type === 'flight'
              ? <Plane size={18} className="text-blue-600" />
              : <Hotel size={18} className="text-violet-600" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 leading-tight">{b.name}</div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock size={10} />
              {b.dateFrom}{b.dateTo ? ` — ${b.dateTo}` : ''}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono bg-slate-50 px-2 py-0.5 rounded inline-block">
              #{b.confirmationNumber}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            b.status === 'upcoming' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {b.status === 'upcoming' ? 'Предстоит' : 'Завершено'}
          </span>
        </div>
      </div>
      <a
        href={b.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-slate-50 rounded-xl text-sm text-slate-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
      >
        Открыть в {b.type === 'flight' ? 'Aviasales' : 'Booking.com'}
        <ExternalLink size={13} />
      </a>
    </div>
  );
}

export default function BookingsPage() {
  const { bookings } = useApp();
  const [filter, setFilter] = useState<Filter>('upcoming');

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-dvh bg-[#F8FAFC]">
      <div className="bg-white px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Мои бронирования</h1>
        <p className="text-slate-400 text-sm mt-1">{bookings.length} бронирований</p>
      </div>

      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {([['upcoming', 'Предстоящие'], ['completed', 'Прошедшие'], ['all', 'Все']] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`chip flex-shrink-0 ${filter === k ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-500 font-medium">Нет бронирований</p>
            <p className="text-slate-400 text-sm mt-1">Бронирования появятся здесь после перехода по ссылкам из маршрута</p>
          </div>
        ) : (
          filtered.map(b => <BookingCard key={b.id} b={b} />)
        )}
      </div>
    </div>
  );
}
