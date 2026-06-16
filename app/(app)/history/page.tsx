'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Plus, Calendar, ChevronRight, Plane, Hotel, Clock, Star, ExternalLink, X } from 'lucide-react';
import type { GeneratedRoute } from '@/lib/types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Предстоит', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Завершён', color: 'bg-emerald-100 text-emerald-700' },
  draft: { label: 'Черновик', color: 'bg-slate-100 text-slate-600' },
};

const TYPE_ICON: Record<string, string> = {
  food: '🍽️',
  attraction: '📍',
  transport: '🚕',
  hotel: '🏨',
  flight: '✈️',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

function RouteCard({ route, onClick, highlighted }: { route: GeneratedRoute; onClick: () => void; highlighted: boolean }) {
  const st = STATUS_LABELS[route.status];
  return (
    <div
      onClick={onClick}
      className={`card overflow-hidden cursor-pointer transition-all ${highlighted ? 'ring-2 ring-blue-600 scale-[1.01]' : ''}`}
    >
      <div className="h-36 relative">
        <img src={route.coverImage} alt={route.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-white font-bold text-lg leading-tight">{route.destination}</div>
            <div className="text-white/80 text-xs">{route.country}</div>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${st.color}`}>{st.label}</span>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(route.dateFrom)} — {formatDate(route.dateTo)}</span>
          {route.totalCost && <span className="font-semibold text-slate-700">≈ {route.totalCost}</span>}
        </div>
        <ChevronRight size={16} className="text-slate-300" />
      </div>
    </div>
  );
}

function RouteDetail({ route, onClose }: { route: GeneratedRoute; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-40 overflow-y-auto" style={{ maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}>
      <div className="relative h-52">
        <img src={route.coverImage} alt={route.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button onClick={onClose} className="absolute top-12 left-4 w-8 h-8 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
          <X size={16} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-4">
          <div className="text-white text-2xl font-bold">{route.destination}</div>
          <div className="text-white/80 text-sm">{route.dateFrom} — {route.dateTo} · {route.totalCost}</div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {route.weather && (
          <div className="card p-3 text-sm text-slate-600">{route.weather}</div>
        )}

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🚕</span>
            <div>
              <div className="text-xs text-slate-400">До аэропорта</div>
              <div className="text-sm font-medium text-slate-800">{route.transfer.toAirport}</div>
              <div className="text-xs text-blue-600">{route.transfer.cost}</div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plane size={16} className="text-blue-600" />
              <div>
                <div className="text-xs text-slate-400">{route.flight.from} → {route.flight.to}</div>
                <div className="text-sm font-semibold text-slate-800">{route.flight.airline}</div>
                <div className="text-xs text-slate-500">{route.flight.departure} — {route.flight.arrival}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-blue-600 font-bold text-sm">{route.flight.price}</div>
              <a href={route.flight.aviasalesUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                Aviasales <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hotel size={16} className="text-blue-600" />
              <div>
                <div className="text-sm font-semibold text-slate-800">{route.hotel.name}</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: route.hotel.stars }).map((_, i) => (
                    <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-slate-500">{route.hotel.address}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-blue-600 font-bold text-sm">{route.hotel.price}</div>
              <a href={route.hotel.bookingUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                Booking <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        {route.days.map(day => (
          <div key={day.dayNumber} className="card overflow-hidden">
            <div className="bg-blue-600 px-4 py-2">
              <div className="text-white font-semibold text-sm">День {day.dayNumber}</div>
              <div className="text-blue-200 text-xs">{new Date(day.date).toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
            <div className="divide-y divide-slate-50">
              {day.activities.map((act, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="text-xs text-slate-400 w-12 pt-0.5 flex-shrink-0 flex items-center gap-1">
                    <Clock size={10} />{act.time}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span>{TYPE_ICON[act.type]}</span>
                      <span className="text-sm font-medium text-slate-800">{act.title}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{act.description}</div>
                    {act.price && <div className="text-xs text-blue-600 font-medium mt-0.5">{act.price}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryContent() {
  const { routes } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightId = searchParams.get('highlight');

  const [selected, setSelected] = useState<GeneratedRoute | null>(null);

  useEffect(() => {
    if (highlightId) {
      const found = routes.find(r => r.id === highlightId);
      if (found) {
        setTimeout(() => setSelected(found), 400);
      }
    }
  }, [highlightId, routes]);

  return (
    <div className="min-h-dvh bg-[#F8FAFC]">
      <div className="bg-white px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">История маршрутов</h1>
        <p className="text-slate-400 text-sm mt-1">{routes.length} {routes.length === 1 ? 'маршрут' : 'маршрута'}</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {routes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✈️</div>
            <p className="text-slate-500 font-medium">Пока нет маршрутов</p>
            <p className="text-slate-400 text-sm mt-1">Создай первый в разделе Поиск</p>
            <button
              onClick={() => router.push('/search')}
              className="btn-primary mt-4"
              style={{ maxWidth: 200, margin: '16px auto 0' }}
            >
              <Plus size={16} /> Создать маршрут
            </button>
          </div>
        ) : (
          routes.map(r => (
            <RouteCard
              key={r.id}
              route={r}
              highlighted={r.id === highlightId}
              onClick={() => setSelected(r)}
            />
          ))
        )}
      </div>

      {selected && <RouteDetail route={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F8FAFC] flex items-center justify-center"><div className="text-slate-400">Загрузка...</div></div>}>
      <HistoryContent />
    </Suspense>
  );
}
