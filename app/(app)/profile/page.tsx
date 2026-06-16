'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Globe, CreditCard, FileText, Bell, Moon,
  DollarSign, LogOut, ChevronRight, Crown, Check, Trash2
} from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">{title}</div>
      <div className="card mx-4 divide-y divide-slate-50">{children}</div>
    </div>
  );
}

function Row({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-50 transition-colors">
      <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800">{label}</div>
        {value && <div className="text-xs text-slate-400 mt-0.5 truncate">{value}</div>}
      </div>
      <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />
    </button>
  );
}

export default function ProfilePage() {
  const { user, logout, upgradeToPermium, aiRequestsLeft } = useApp();
  const router = useRouter();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    await new Promise(r => setTimeout(r, 1500));
    upgradeToPermium();
    setUpgrading(false);
    setUpgraded(true);
    setTimeout(() => { setShowPremiumModal(false); setUpgraded(false); }, 1500);
  };

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-[#F8FAFC]">
      <div className="bg-white px-5 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{user.name.charAt(0)}</span>
          </div>
          <div>
            <div className="font-bold text-lg text-slate-900">{user.name}</div>
            <div className="text-slate-400 text-sm">{user.email}</div>
            <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              user.status === 'premium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {user.status === 'premium' ? <><Crown size={10} /> Premium</> : 'Free'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{user.stats.routesCreated}</div>
            <div className="text-xs text-slate-500 mt-0.5">маршрутов создано</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{user.stats.countriesVisited}</div>
            <div className="text-xs text-slate-500 mt-0.5">стран посещено</div>
          </div>
        </div>
      </div>

      {user.status === 'free' && (
        <div className="mx-4 mt-4 mb-2">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={16} className="text-amber-300" />
              <span className="font-bold">Roami Premium</span>
            </div>
            <p className="text-white/80 text-xs mb-3">
              Безлимитные маршруты, Гид без ограничений, PDF-экспорт и шаринг
            </p>
            <div className="text-xs text-white/60 mb-3">
              Осталось запросов: {aiRequestsLeft}/3
            </div>
            <button
              onClick={() => setShowPremiumModal(true)}
              className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm"
            >
              Оформить за 799 ₽/месяц
            </button>
          </div>
        </div>
      )}

      <div className="pt-3 pb-20">
        <Section title="Личные данные">
          <Row icon={<User size={14} />} label="Имя" value={user.name} />
          <Row icon={<Mail size={14} />} label="Email" value={user.email} />
          <Row icon={<Phone size={14} />} label="Телефон" value={user.phone} />
          <Row icon={<Globe size={14} />} label="Язык" value="Русский" />
        </Section>

        <Section title="Документы">
          <Row icon={<FileText size={14} />} label="Загранпаспорт" value={user.passport ? `Истекает ${user.passport.expiry}` : 'Не добавлен'} />
          <Row icon={<CreditCard size={14} />} label="Банковская карта" value="•••• 4242" />
        </Section>

        <Section title="Настройки">
          <Row icon={<Bell size={14} />} label="Push-уведомления" value="Включены" />
          <Row icon={<Moon size={14} />} label="Тема" value="Светлая" />
          <Row icon={<DollarSign size={14} />} label="Валюта" value="₽ Рубль" />
        </Section>

        <div className="mx-4 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full card p-3 flex items-center justify-center gap-2 text-slate-500 text-sm font-medium"
          >
            <LogOut size={15} />
            Выйти из аккаунта
          </button>
          <button className="w-full p-3 flex items-center justify-center gap-2 text-red-400 text-sm font-medium">
            <Trash2 size={15} />
            Удалить аккаунт
          </button>
        </div>
      </div>

      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" style={{ maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}>
          <div className="bg-white w-full rounded-t-3xl p-6">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">👑</div>
              <h2 className="text-xl font-bold text-slate-900">Roami Premium</h2>
              <p className="text-slate-400 text-sm mt-1">799 ₽ / месяц</p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                'Безлимитные AI-маршруты',
                'Детальная разбивка по часам',
                'Безлимитный Гид',
                'PDF-экспорт маршрутов',
                'Шаринг маршрутов по ссылке',
                'Автозаполнение из профиля',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-blue-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              className="btn-primary mb-3"
              disabled={upgrading || upgraded}
            >
              {upgraded ? '✓ Premium активирован!' : upgrading ? 'Обрабатываем...' : 'Оформить Premium — 799 ₽/мес'}
            </button>
            <button
              onClick={() => setShowPremiumModal(false)}
              className="w-full text-center text-slate-400 text-sm py-2"
            >
              Отмена
            </button>
            <p className="text-center text-xs text-slate-300 mt-2">Демо-режим: реальная оплата не производится</p>
          </div>
        </div>
      )}
    </div>
  );
}
