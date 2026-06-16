'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Mail, Phone, Lock, User, ChevronLeft, Eye, EyeOff } from 'lucide-react';

type Step = 'register' | 'otp' | 'password' | 'login';

export default function AuthPage() {
  const { login } = useApp();
  const router = useRouter();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState<Step>('register');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    otp: '',
    password: '',
    passwordConfirm: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [k]: e.target.value }));
    setError('');
  };

  const handleGetCode = async () => {
    if (!form.name || !form.email || !form.phone) {
      setError('Заполните все поля');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Введите корректный email');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    if (form.otp.length < 4) {
      setError('Введите код из письма');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStep('password');
  };

  const handleCreateAccount = async () => {
    if (form.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    login(form.email, form.name);
    router.replace('/search');
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Введите email и пароль');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    login(form.email, form.name || 'Пользователь');
    router.replace('/search');
  };

  const handleSocial = (provider: string) => {
    login(`user@${provider}.com`, provider === 'apple' ? 'Apple User' : 'Google User');
    router.replace('/search');
  };

  return (
    <div className="min-h-dvh bg-[#F8FAFC] flex flex-col">
      <div className="px-5 pt-12 pb-4">
        {step !== 'register' && mode === 'register' ? (
          <button
            onClick={() => setStep(step === 'otp' ? 'register' : 'otp')}
            className="flex items-center text-slate-500 mb-4"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Назад</span>
          </button>
        ) : null}
        <div className="text-2xl font-bold text-blue-600 mb-1">ROAMI</div>
        <h1 className="text-xl font-bold text-slate-900">
          {mode === 'register'
            ? step === 'register' ? 'Создать аккаунт' : step === 'otp' ? 'Введи код' : 'Придумай пароль'
            : 'Войти в аккаунт'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {mode === 'register'
            ? step === 'otp' ? `Код отправлен на ${form.email}` : 'Планируй путешествия с AI'
            : 'С возвращением!'}
        </p>
      </div>

      <div className="flex-1 px-5">
        {mode === 'register' && step === 'register' && (
          <div className="space-y-3 fade-in-up">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input-field pl-9" placeholder="Имя" value={form.name} onChange={set('name')} />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input-field pl-9" type="email" placeholder="Email" value={form.email} onChange={set('email')} />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input-field pl-9" type="tel" placeholder="+7 999 000-00-00" value={form.phone} onChange={set('phone')} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button className="btn-primary mt-2" onClick={handleGetCode} disabled={loading}>
              {loading ? 'Отправляем код...' : 'Получить код'}
            </button>
          </div>
        )}

        {mode === 'register' && step === 'otp' && (
          <div className="space-y-4 fade-in-up">
            <input
              className="input-field text-center text-2xl tracking-[0.5em] font-bold"
              placeholder="000000"
              maxLength={6}
              value={form.otp}
              onChange={set('otp')}
              inputMode="numeric"
            />
            <p className="text-center text-sm text-slate-500">
              Используй <span className="font-semibold text-blue-600">любой код</span> для демо
            </p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button className="btn-primary" onClick={handleVerifyOTP} disabled={loading}>
              {loading ? 'Проверяем...' : 'Подтвердить'}
            </button>
            <button className="w-full text-center text-sm text-blue-600 py-2" onClick={() => setStep('register')}>
              Отправить снова
            </button>
          </div>
        )}

        {mode === 'register' && step === 'password' && (
          <div className="space-y-3 fade-in-up">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input-field pl-9 pr-10"
                type={showPass ? 'text' : 'password'}
                placeholder="Придумайте пароль (мин. 8 симв.)"
                value={form.password}
                onChange={set('password')}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input-field pl-9"
                type="password"
                placeholder="Повторите пароль"
                value={form.passwordConfirm}
                onChange={set('passwordConfirm')}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button className="btn-primary mt-2" onClick={handleCreateAccount} disabled={loading}>
              {loading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
            </button>
          </div>
        )}

        {mode === 'login' && (
          <div className="space-y-3 fade-in-up">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input-field pl-9" type="email" placeholder="Email" value={form.email} onChange={set('email')} />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input-field pl-9 pr-10"
                type={showPass ? 'text' : 'password'}
                placeholder="Пароль"
                value={form.password}
                onChange={set('password')}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button className="btn-primary" onClick={handleLogin} disabled={loading}>
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs">или</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleSocial('apple')}
              className="w-full py-3 rounded-14 border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm font-medium text-slate-700 rounded-xl"
            >
              <span className="text-lg"></span> Войти через Apple ID
            </button>
            <button
              onClick={() => handleSocial('google')}
              className="w-full py-3 border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm font-medium text-slate-700 rounded-xl"
            >
              <span className="text-lg">🌐</span> Войти через Google
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 pt-4 text-center">
        {mode === 'register' ? (
          <p className="text-slate-500 text-sm">
            Уже есть аккаунт?{' '}
            <button onClick={() => { setMode('login'); setStep('login'); }} className="text-blue-600 font-medium">
              Войти
            </button>
          </p>
        ) : (
          <p className="text-slate-500 text-sm">
            Нет аккаунта?{' '}
            <button onClick={() => { setMode('register'); setStep('register'); }} className="text-blue-600 font-medium">
              Зарегистрироваться
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
