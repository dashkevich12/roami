'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ChevronLeft, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BG = '#17212B';
const CARD = '#1C2733';
const CARD2 = '#243447';
const BLUE = '#2EA6FF';
const TEXT = '#E8F1F8';
const GREY = '#8899A8';
const DIM = '#506070';
const RED = '#F2585B';

type Screen = 'welcome' | 'phone' | 'name' | 'otp' | 'password' | 'loading' | 'login';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const exitSlide = { opacity: 0, y: -8, transition: { duration: 0.18 } };

function OTPBoxes({ value, onChange, shake }: { value: string; onChange: (v: string) => void; shake: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = (value + '      ').slice(0, 6).split('');

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, '').slice(-1);
    const arr = (value + '      ').slice(0, 6).split('');
    arr[i] = d;
    onChange(arr.join('').trimEnd());
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
      const arr = (value + '      ').slice(0, 6).split('');
      arr[i - 1] = '';
      onChange(arr.join('').trimEnd());
    }
  };

  return (
    <motion.div
      animate={shake ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.35 }}
      style={{ display: 'flex', gap: 10, justifyContent: 'center' }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{
            width: 46,
            height: 54,
            borderRadius: 12,
            backgroundColor: CARD2,
            border: `2px solid ${d.trim() ? BLUE : 'rgba(255,255,255,0.06)'}`,
            color: TEXT,
            fontSize: 22,
            fontWeight: 700,
            textAlign: 'center',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      ))}
    </motion.div>
  );
}

function StrengthBar({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strength = len === 0 ? 0 : len >= 12 && hasUpper && hasNum && hasSpecial ? 4
    : len >= 10 && (hasUpper || hasNum) ? 3
    : len >= 6 ? 2 : 1;
  const labels = ['', 'Слабый', 'Средний', 'Хороший', 'Надёжный'];
  const colors = ['', RED, '#F59E0B', '#4ADE80', '#22C55E'];
  if (!strength) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4].map(n => (
          <motion.div
            key={n}
            animate={{ backgroundColor: n <= strength ? colors[strength] : 'rgba(255,255,255,0.1)' }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, height: 3, borderRadius: 2 }}
          />
        ))}
      </div>
      <p style={{ color: colors[strength], fontSize: 12, marginTop: 5, fontWeight: 500 }}>{labels[strength]}</p>
    </div>
  );
}

const inputBase: React.CSSProperties = {
  width: '100%',
  backgroundColor: CARD2,
  border: '2px solid rgba(255,255,255,0.06)',
  borderRadius: 14,
  padding: '15px 16px',
  color: TEXT,
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement> & { right?: React.ReactNode }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        {...props}
        style={{ ...inputBase, border: `2px solid ${focused ? BLUE : 'rgba(255,255,255,0.06)'}`, paddingRight: props.right ? 48 : 16, ...props.style }}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      />
      {props.right && (
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
          {props.right}
        </div>
      )}
    </div>
  );
}

function BackBtn({ onPress }: { onPress: () => void }) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={onPress}
      style={{ display: 'flex', alignItems: 'center', gap: 4, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 32 }}
    >
      <ChevronLeft size={22} />
      <span style={{ fontSize: 15, fontWeight: 500 }}>Назад</span>
    </motion.button>
  );
}

function PrimaryBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        backgroundColor: disabled ? '#1A3350' : BLUE,
        borderRadius: 14,
        padding: '16px',
        color: disabled ? '#4A6680' : '#FFF',
        fontSize: 16,
        fontWeight: 600,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

export default function AuthPage() {
  const { login } = useApp();
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>('welcome');
  const [history, setHistory] = useState<Screen[]>([]);
  const [form, setForm] = useState({ phone: '', name: '', otp: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [otpShake, setOtpShake] = useState(false);

  const go = (s: Screen) => {
    setHistory(h => [...h, screen]);
    setScreen(s);
    setError('');
  };

  const back = () => {
    const prev = [...history];
    const last = prev.pop() ?? 'welcome';
    setHistory(prev);
    setScreen(last);
    setError('');
  };

  const set = (k: keyof typeof form) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setError('');
  };

  const handleSocial = (provider: string) => {
    go('loading');
    setTimeout(() => {
      login(`user@${provider}.com`, provider === 'apple' ? 'Apple User' : 'Google User');
      router.replace('/feed');
    }, 1600);
  };

  const handlePhoneNext = () => {
    const v = form.phone.trim();
    if (!v) { setError('Введите номер телефона или email'); return; }
    const ok = v.includes('@') || /^\+?\d{7,}$/.test(v.replace(/[\s\-()+]/g, ''));
    if (!ok) { setError('Некорректный номер или email'); return; }
    go('name');
  };

  const handleNameNext = () => {
    if (form.name.trim().length < 2) { setError('Введите ваше имя'); return; }
    go('otp');
  };

  const handleOTPNext = () => {
    const otp = form.otp.replace(/\s/g, '');
    if (otp.length < 6) {
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 400);
      return;
    }
    go('password');
  };

  const handleCreateAccount = () => {
    if (form.password.length < 6) { setError('Минимум 6 символов'); return; }
    go('loading');
    setTimeout(() => {
      login(form.phone, form.name);
      router.replace('/feed');
    }, 2000);
  };

  const handleLogin = () => {
    if (!form.phone || !form.password) { setError('Заполните все поля'); return; }
    go('loading');
    setTimeout(() => {
      login(form.phone, 'Пользователь');
      router.replace('/feed');
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto' }}>
      <AnimatePresence mode="wait" initial={false}>

        {/* A1 — Welcome */}
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={exitSlide}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', paddingTop: 80, paddingBottom: 44 }}
          >
            <div style={{ flex: 1 }}>
              <motion.div variants={fadeUp}>
                <div style={{ color: BLUE, fontSize: 38, fontWeight: 800, letterSpacing: -1.5, marginBottom: 14 }}>ROAMI</div>
              </motion.div>
              <motion.h1 variants={fadeUp} style={{ color: TEXT, fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
                Умный помощник<br />в путешествиях
              </motion.h1>
              <motion.p variants={fadeUp} style={{ color: GREY, fontSize: 15, lineHeight: 1.6, marginBottom: 0 }}>
                AI строит маршрут за 15 секунд.<br />От идеи до посадочного — в одном месте.
              </motion.p>
            </div>

            <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <motion.button
                variants={fadeUp}
                onClick={() => handleSocial('apple')}
                style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: '#000', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 20 }}></span>
                Войти через Apple
              </motion.button>

              <motion.button
                variants={fadeUp}
                onClick={() => go('phone')}
                style={{ backgroundColor: CARD2, borderRadius: 14, padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: TEXT, border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 20 }}>✉️</span>
                Войти по Email
              </motion.button>

              <motion.button
                variants={fadeUp}
                onClick={() => go('phone')}
                style={{ backgroundColor: BLUE, borderRadius: 14, padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: '#FFF', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 20 }}>📱</span>
                Войти по номеру телефона
              </motion.button>

              <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: 4 }}>
                <span style={{ color: GREY, fontSize: 14 }}>
                  Уже есть аккаунт?{' '}
                  <button onClick={() => go('login')} style={{ color: BLUE, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                    Войти
                  </button>
                </span>
              </motion.div>
            </motion.div>

            <motion.p variants={fadeUp} style={{ color: DIM, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 1.7 }}>
              Нажимая «Войти», вы принимаете{' '}
              <span style={{ color: GREY }}>Условия использования</span> и{' '}
              <span style={{ color: GREY }}>Политику конфиденциальности</span>
            </motion.p>
          </motion.div>
        )}

        {/* A2 — Phone / Email */}
        {screen === 'phone' && (
          <motion.div
            key="phone"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={exitSlide}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', paddingTop: 60, paddingBottom: 44 }}
          >
            <BackBtn onPress={back} />

            <motion.h2 variants={fadeUp} style={{ color: TEXT, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Ваш телефон или Email</motion.h2>
            <motion.p variants={fadeUp} style={{ color: GREY, fontSize: 14, marginBottom: 28 }}>Мы отправим код подтверждения</motion.p>

            <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
              {/* Phone row with country selector */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ backgroundColor: CARD2, borderRadius: 14, padding: '15px 14px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <span style={{ fontSize: 20 }}>🇷🇺</span>
                  <span style={{ color: TEXT, fontSize: 15, fontWeight: 500 }}>+7</span>
                  <ChevronDown size={14} color={GREY} />
                </div>
                <DarkInput
                  type="tel"
                  placeholder="999 000-00-00"
                  value={form.phone.startsWith('+7') || form.phone.includes('@') ? '' : form.phone}
                  onChange={e => set('phone')(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 12px' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
                <span style={{ color: DIM, fontSize: 12 }}>или</span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
              </div>
              <DarkInput
                type="email"
                placeholder="email@example.com"
                value={form.phone.includes('@') ? form.phone : ''}
                onChange={e => set('phone')(e.target.value)}
              />
            </motion.div>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: RED, fontSize: 13, marginBottom: 12 }}>{error}</motion.p>}

            <motion.div variants={fadeUp}>
              <PrimaryBtn label="Продолжить" onClick={handlePhoneNext} />
            </motion.div>
          </motion.div>
        )}

        {/* A3 — Name */}
        {screen === 'name' && (
          <motion.div
            key="name"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={exitSlide}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', paddingTop: 60, paddingBottom: 44 }}
          >
            <BackBtn onPress={back} />

            <motion.h2 variants={fadeUp} style={{ color: TEXT, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Как вас зовут?</motion.h2>
            <motion.p variants={fadeUp} style={{ color: GREY, fontSize: 14, marginBottom: 28 }}>Имя отобразится в профиле</motion.p>

            <motion.div variants={fadeUp} style={{ position: 'relative', marginBottom: 20 }}>
              <DarkInput
                type="text"
                placeholder="Ваше имя"
                value={form.name}
                onChange={e => set('name')(e.target.value)}
                maxLength={30}
                autoFocus
                right={
                  <span style={{ color: DIM, fontSize: 12, pointerEvents: 'none' }}>{form.name.length}/30</span>
                }
              />
            </motion.div>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: RED, fontSize: 13, marginBottom: 12 }}>{error}</motion.p>}

            <motion.div variants={fadeUp}>
              <PrimaryBtn label="Далее" onClick={handleNameNext} />
            </motion.div>
          </motion.div>
        )}

        {/* A5 — OTP */}
        {screen === 'otp' && (
          <motion.div
            key="otp"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={exitSlide}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', paddingTop: 60, paddingBottom: 44 }}
          >
            <BackBtn onPress={back} />

            <motion.h2 variants={fadeUp} style={{ color: TEXT, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Введите код</motion.h2>
            <motion.p variants={fadeUp} style={{ color: GREY, fontSize: 14, marginBottom: 32 }}>
              Код отправлен на <span style={{ color: TEXT, fontWeight: 500 }}>{form.phone || 'ваш номер'}</span>
            </motion.p>

            <motion.div variants={fadeUp} style={{ marginBottom: 14 }}>
              <OTPBoxes value={form.otp} onChange={set('otp')} shake={otpShake} />
            </motion.div>

            <motion.p variants={fadeUp} style={{ color: GREY, fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
              Для демо: введите{' '}
              <span style={{ color: BLUE, fontWeight: 600 }}>любые 6 цифр</span>
            </motion.p>

            <motion.div variants={fadeUp} style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PrimaryBtn label="Подтвердить" onClick={handleOTPNext} />
              <button
                onClick={() => go('phone')}
                style={{ backgroundColor: 'transparent', borderRadius: 14, padding: '13px', color: BLUE, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', width: '100%' }}
              >
                Отправить снова
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* A6 — Password */}
        {screen === 'password' && (
          <motion.div
            key="password"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={exitSlide}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', paddingTop: 60, paddingBottom: 44 }}
          >
            <BackBtn onPress={back} />

            <motion.h2 variants={fadeUp} style={{ color: TEXT, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Придумайте пароль</motion.h2>
            <motion.p variants={fadeUp} style={{ color: GREY, fontSize: 14, marginBottom: 28 }}>Минимум 6 символов, лучше длиннее</motion.p>

            <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
              <DarkInput
                type={showPass ? 'text' : 'password'}
                placeholder="Пароль"
                value={form.password}
                onChange={e => set('password')(e.target.value)}
                autoFocus
                right={
                  <button
                    onClick={() => setShowPass(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: GREY, display: 'flex' }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <StrengthBar password={form.password} />
            </motion.div>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: RED, fontSize: 13, marginBottom: 12 }}>{error}</motion.p>}

            <motion.div variants={fadeUp} style={{ marginTop: 'auto' }}>
              <PrimaryBtn label="Создать аккаунт" onClick={handleCreateAccount} />
            </motion.div>
          </motion.div>
        )}

        {/* Login */}
        {screen === 'login' && (
          <motion.div
            key="login"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={exitSlide}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', paddingTop: 60, paddingBottom: 44 }}
          >
            <BackBtn onPress={back} />

            <motion.h2 variants={fadeUp} style={{ color: TEXT, fontSize: 24, fontWeight: 700, marginBottom: 6 }}>С возвращением</motion.h2>
            <motion.p variants={fadeUp} style={{ color: GREY, fontSize: 14, marginBottom: 28 }}>Войдите в свой аккаунт</motion.p>

            <motion.div variants={fadeUp} style={{ marginBottom: 12 }}>
              <DarkInput
                type="text"
                placeholder="Телефон или Email"
                value={form.phone}
                onChange={e => set('phone')(e.target.value)}
                autoFocus
              />
            </motion.div>

            <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
              <DarkInput
                type={showPass ? 'text' : 'password'}
                placeholder="Пароль"
                value={form.password}
                onChange={e => set('password')(e.target.value)}
                right={
                  <button
                    onClick={() => setShowPass(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: GREY, display: 'flex' }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </motion.div>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: RED, fontSize: 13, marginBottom: 12 }}>{error}</motion.p>}

            <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <PrimaryBtn label="Войти" onClick={handleLogin} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
                <span style={{ color: DIM, fontSize: 12 }}>или</span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
              </div>

              <button
                onClick={() => handleSocial('apple')}
                style={{ backgroundColor: '#FFF', borderRadius: 14, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: '#000', border: 'none', cursor: 'pointer', width: '100%' }}
              >
                <span style={{ fontSize: 20 }}></span>
                Войти через Apple
              </button>

              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <span style={{ color: GREY, fontSize: 14 }}>
                  Нет аккаунта?{' '}
                  <button onClick={() => { setHistory([]); setScreen('welcome'); }} style={{ color: BLUE, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                    Зарегистрироваться
                  </button>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* A7 — Loading */}
        {screen === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              style={{ color: BLUE, fontSize: 40, fontWeight: 800, letterSpacing: -1.5 }}
            >
              ROAMI
            </motion.div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18, ease: 'easeInOut' }}
                  style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: BLUE }}
                />
              ))}
            </div>
            <p style={{ color: GREY, fontSize: 14 }}>Входим в аккаунт...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
