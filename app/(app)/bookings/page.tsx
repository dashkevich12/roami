'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { ChevronLeft, Plus, Search, Trash2, Send, Sparkles, X, Pin } from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG    = '#17212B';
const CARD  = '#1C2733';
const CARD2 = '#243447';
const BLUE  = '#2EA6FF';
const TEXT  = '#E8F1F8';
const GREY  = '#8899A8';
const DIM   = '#4A5C6A';
const GREEN = '#4ADE80';
const AMBER = '#F59E0B';
const RED   = '#F2585B';

// ─── Types ────────────────────────────────────────────────────────────────────
type ScreenName = 'list' | 'detail';
interface NavScreen { name: ScreenName; budgetId?: string; }

interface BudgetCategory {
  key: string; label: string; emoji: string; color: string;
  plan: number; approximate?: boolean;
}
interface Expense {
  id: string; categoryKey: string; amountOrig: number; currency: string;
  rate: number; amountRub: number; date: string; note?: string;
}
interface TripBudget {
  id: string; tripName: string; country: string; emoji: string;
  coverImage: string; dateFrom: string; dateTo: string;
  status: 'plan' | 'active' | 'done';
  categories: BudgetCategory[]; expenses: Expense[];
  defaultCurrency: string; defaultRate: number; pinned?: boolean;
}
interface ChatMsg { id: string; role: 'user' | 'ai'; text: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const CATDEFS = [
  { key: 'flight',        label: 'Перелёт',    emoji: '✈️',  color: '#2EA6FF' },
  { key: 'hotel',         label: 'Жильё',       emoji: '🏨',  color: '#8B5CF6' },
  { key: 'food',          label: 'Еда',          emoji: '🍜',  color: '#F97316' },
  { key: 'transport',     label: 'Транспорт',   emoji: '🚌',  color: '#4ADE80' },
  { key: 'entertainment', label: 'Развлечения', emoji: '🎭',  color: '#EC4899' },
  { key: 'shopping',      label: 'Шопинг',      emoji: '🛍️', color: '#F59E0B' },
  { key: 'sim',           label: 'Связь',        emoji: '📱',  color: '#06B6D4' },
  { key: 'other',         label: 'Прочее',       emoji: '➕',  color: '#6B7280' },
];

const CURRENCIES = [
  { code: '₽', label: 'RUB', rate: 1 },
  { code: '฿', label: 'THB', rate: 2.6 },
  { code: '$', label: 'USD', rate: 90 },
  { code: '¥', label: 'JPY', rate: 0.60 },
  { code: '€', label: 'EUR', rate: 98 },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const INIT_BUDGETS: TripBudget[] = [
  {
    id: 'b1', tripName: 'Бангкок', country: 'Таиланд', emoji: '🇹🇭',
    coverImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    dateFrom: '2026-07-15', dateTo: '2026-07-22', status: 'active',
    defaultCurrency: '฿', defaultRate: 2.6,
    categories: [
      { key: 'flight',        label: 'Перелёт',    emoji: '✈️',  color: '#2EA6FF', plan: 38000 },
      { key: 'hotel',         label: 'Жильё',       emoji: '🏨',  color: '#8B5CF6', plan: 36400 },
      { key: 'food',          label: 'Еда',          emoji: '🍜',  color: '#F97316', plan: 8000,  approximate: true },
      { key: 'transport',     label: 'Транспорт',   emoji: '🚌',  color: '#4ADE80', plan: 3000,  approximate: true },
      { key: 'entertainment', label: 'Развлечения', emoji: '🎭',  color: '#EC4899', plan: 6000,  approximate: true },
      { key: 'shopping',      label: 'Шопинг',      emoji: '🛍️', color: '#F59E0B', plan: 3600,  approximate: true },
    ],
    expenses: [
      { id: 'e1', categoryKey: 'transport',     amountOrig: 500,   currency: '฿', rate: 2.6, amountRub: 1300,  date: '2026-07-15', note: 'Такси до отеля' },
      { id: 'e2', categoryKey: 'food',          amountOrig: 300,   currency: '฿', rate: 2.6, amountRub: 780,   date: '2026-07-15', note: 'Ужин на рынке' },
      { id: 'e3', categoryKey: 'food',          amountOrig: 150,   currency: '฿', rate: 2.6, amountRub: 390,   date: '2026-07-16', note: 'Завтрак в Roast' },
      { id: 'e4', categoryKey: 'entertainment', amountOrig: 450,   currency: '฿', rate: 2.6, amountRub: 1170,  date: '2026-07-16', note: 'Гранд Палас' },
      { id: 'e5', categoryKey: 'transport',     amountOrig: 80,    currency: '฿', rate: 2.6, amountRub: 208,   date: '2026-07-16', note: 'BTS Skytrain' },
      { id: 'e6', categoryKey: 'entertainment', amountOrig: 1300,  currency: '฿', rate: 2.6, amountRub: 3380,  date: '2026-07-17', note: 'СПА Divana' },
      { id: 'e7', categoryKey: 'food',          amountOrig: 1150,  currency: '฿', rate: 2.6, amountRub: 2990,  date: '2026-07-17', note: 'Ужин в Nahm' },
      { id: 'e8', categoryKey: 'flight',        amountOrig: 38000, currency: '₽', rate: 1,   amountRub: 38000, date: '2026-07-01', note: 'Thai Airways · оплачен ✓' },
      { id: 'e9', categoryKey: 'hotel',         amountOrig: 36400, currency: '₽', rate: 1,   amountRub: 36400, date: '2026-07-10', note: 'Avani+ Riverside · оплачен ✓' },
    ],
  },
];

const INIT_CHAT: ChatMsg[] = [
  { id: 'ai0', role: 'ai', text: 'Привет! Я слежу за бюджетом 🇹🇭 Бангкок. Спросите что угодно — остаток, где перерасход, или могу ли купить что-то.' },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
const ru = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

const getCatFact = (b: TripBudget, key: string) =>
  b.expenses.filter(e => e.categoryKey === key).reduce((s, e) => s + e.amountRub, 0);

const getTotalPlan = (b: TripBudget) => b.categories.reduce((s, c) => s + c.plan, 0);
const getTotalFact = (b: TripBudget) => b.expenses.reduce((s, e) => s + e.amountRub, 0);

const statusColor = (pct: number) => pct > 1 ? RED : pct >= 0.85 ? AMBER : GREEN;
const statusLabel = (pct: number) =>
  pct > 1 ? 'Перерасход' : pct >= 0.85 ? 'Близко к лимиту' : 'В рамках бюджета';

const MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const fmtDate = (d: string) => { const dt = new Date(d); return `${dt.getDate()} ${MONTHS[dt.getMonth()]}`; };

function groupByDay(expenses: Expense[]): [string, Expense[]][] {
  const g: Record<string, Expense[]> = {};
  [...expenses].sort((a, b) => b.date.localeCompare(a.date))
    .forEach(e => { (g[e.date] = g[e.date] || []).push(e); });
  return Object.entries(g).sort(([a], [b]) => b.localeCompare(a));
}

function aiReply(msg: string, budget: TripBudget): string {
  const t = msg.toLowerCase();
  const plan  = getTotalPlan(budget);
  const spent = getTotalFact(budget);
  const left  = plan - spent;
  const pct   = spent / plan;

  if (t.includes('остат') || t.includes('сколько') || t.includes('осталось')) {
    return `Остаток: ${ru(left)} ₽ из ${ru(plan)} ₽ плана. Потрачено ${Math.round(pct * 100)}%. ${statusLabel(pct)}.`;
  }
  if (t.includes('кроссовк') || t.includes('обувь') || t.includes('8000') || t.includes('8 000')) {
    const shopCat  = budget.categories.find(c => c.key === 'shopping');
    const shopLeft = (shopCat?.plan ?? 0) - getCatFact(budget, 'shopping');
    return `Кроссовки за 8 000 ₽ — ${Math.round(8000 / left * 100)}% от остатка. По шопингу свободно ${ru(shopLeft)} ₽. Могу перераспределить: −2 000 ₽ из развлечений и −1 000 ₽ из транспорта. Тогда вписываетесь. Применить?`;
  }
  if (t.includes('применить') || t.includes('да') || t.includes('ок')) {
    return '✅ Бюджет перераспределён. Шопинг +3 000 ₽, развлечения −2 000 ₽, транспорт −1 000 ₽. Наслаждайтесь кроссовками! 👟';
  }
  if (t.includes('перерасх') || t.includes('превыш') || t.includes('лимит')) {
    const over = budget.categories.filter(c => { const f = getCatFact(budget, c.key); return c.plan > 0 && f / c.plan > 0.85; });
    if (over.length === 0) return 'Отлично! Ни одна категория не превышает 85% плана. Всё под контролем 🎉';
    return `Близко к лимиту: ${over.map(c => `${c.emoji} ${c.label}`).join(', ')}. Рекомендую скорректировать расходы.`;
  }
  if (t.includes('план') || t.includes('бюджет') || t.includes('итог')) {
    return `Общий план: ${ru(plan)} ₽. Потрачено: ${ru(spent)} ₽. Осталось на 4 дня: ${ru(left)} ₽ (~${ru(left / 4)} ₽/день).`;
  }
  return 'Попробуйте: «Сколько осталось?», «Могу купить кроссовки за 8000?», «Где перерасход?»';
}

// ─── DonutChart ───────────────────────────────────────────────────────────────
function DonutChart({ budget }: { budget: TripBudget }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 100); return () => clearTimeout(t); }, []);

  const R = 52, SW = 20, CX = 80, CY = 80;
  const C  = 2 * Math.PI * R;
  const segs = budget.categories.map(c => ({ ...c, value: getCatFact(budget, c.key) })).filter(s => s.value > 0);
  const total = segs.reduce((s, d) => s + d.value, 0) || 1;
  let cum = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={CARD2} strokeWidth={SW} />
          {segs.map((s, i) => {
            const len = (s.value / total) * C;
            const off = cum; cum += len;
            return (
              <circle key={s.key} cx={CX} cy={CY} r={R} fill="none"
                stroke={s.color} strokeWidth={SW}
                strokeDashoffset={-off}
                transform={`rotate(-90,${CX},${CY})`}
                style={{
                  strokeDasharray: on ? `${len} ${C}` : `0 ${C}`,
                  transition: `stroke-dasharray 0.55s cubic-bezier(.4,0,.2,1) ${i * 0.09}s`,
                }}
              />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: TEXT, fontSize: 15, fontWeight: 800, lineHeight: 1 }}>{ru(getTotalFact(budget))} ₽</div>
          <div style={{ color: GREY, fontSize: 10, marginTop: 3, letterSpacing: 0.3 }}>потрачено</div>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', justifyContent: 'center', paddingInline: 8 }}>
        {segs.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ color: GREY, fontSize: 11 }}>{s.emoji} {ru(s.value)} ₽</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CategoryRow ──────────────────────────────────────────────────────────────
function CategoryRow({ cat, budget }: { cat: BudgetCategory; budget: TripBudget }) {
  const fact = getCatFact(budget, cat.key);
  const pct  = cat.plan > 0 ? fact / cat.plan : 0;
  const sc   = statusColor(pct);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${CARD2}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: cat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
        {cat.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
          <span style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>
            {cat.label}
            {cat.approximate && <span style={{ color: GREY, fontSize: 10 }}> ~</span>}
          </span>
          <span style={{ color: GREY, fontSize: 11 }}>
            <span style={{ color: fact > 0 ? sc : GREY, fontWeight: 600 }}>{ru(fact)} ₽</span>
            {' / '}{ru(cat.plan)} ₽
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: CARD2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 1) * 100}%` }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            style={{ height: '100%', borderRadius: 2, background: sc }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── ExpenseItem ──────────────────────────────────────────────────────────────
function ExpenseItem({ expense }: { expense: Expense }) {
  const cat = CATDEFS.find(c => c.key === expense.categoryKey);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: (cat?.color ?? '#6B7280') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
        {cat?.emoji ?? '➕'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: TEXT, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {expense.note ?? cat?.label ?? 'Расход'}
        </div>
        {expense.currency !== '₽' && (
          <div style={{ color: GREY, fontSize: 10, marginTop: 1 }}>
            {expense.currency} {ru(expense.amountOrig)}
          </div>
        )}
      </div>
      <div style={{ color: TEXT, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{ru(expense.amountRub)} ₽</div>
    </div>
  );
}

// ─── AddExpenseSheet ──────────────────────────────────────────────────────────
function AddExpenseSheet({ budget, onClose, onAdd }: {
  budget: TripBudget; onClose: () => void; onAdd: (e: Expense) => void;
}) {
  const [amount, setAmount] = useState('');
  const [currIdx, setCurrIdx] = useState(() => Math.max(0, CURRENCIES.findIndex(c => c.code === budget.defaultCurrency)));
  const [catKey, setCatKey] = useState('food');
  const [note, setNote]     = useState('');
  const [date, setDate]     = useState(budget.dateFrom);

  const cur = CURRENCIES[currIdx];
  const num = parseFloat(amount.replace(',', '.')) || 0;
  const rub = Math.round(num * cur.rate);

  const handleAdd = () => {
    if (num <= 0) return;
    onAdd({ id: `e_${Date.now()}`, categoryKey: catKey, amountOrig: num, currency: cur.code, rate: cur.rate, amountRub: rub, date, note: note.trim() || undefined });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', background: CARD, borderRadius: '20px 20px 0 0', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: DIM }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 16px' }}>
          <span style={{ color: TEXT, fontSize: 17, fontWeight: 700 }}>Новый расход</span>
          <button onClick={onClose} style={{ background: CARD2, border: 'none', borderRadius: 10, padding: 6, cursor: 'pointer', color: GREY, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Amount row */}
          <div style={{ background: CARD2, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus
              style={{ flex: 1, background: 'none', border: 'none', color: TEXT, fontSize: 28, fontWeight: 800, outline: 'none', minWidth: 0 }} />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {CURRENCIES.map((c, i) => (
                <button key={c.code} onClick={() => setCurrIdx(i)}
                  style={{ background: i === currIdx ? BLUE : CARD, border: 'none', borderRadius: 8, padding: '4px 8px', color: i === currIdx ? '#FFF' : GREY, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {c.code}
                </button>
              ))}
            </div>
          </div>
          {cur.code !== '₽' && num > 0 && (
            <div style={{ color: GREY, fontSize: 12, textAlign: 'center', marginTop: -6 }}>≈ {ru(rub)} ₽</div>
          )}

          {/* Category grid */}
          <div>
            <div style={{ color: GREY, fontSize: 11, fontWeight: 600, letterSpacing: 0.8, marginBottom: 8 }}>КАТЕГОРИЯ</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
              {CATDEFS.map(c => (
                <button key={c.key} onClick={() => setCatKey(c.key)}
                  style={{ background: catKey === c.key ? c.color + '33' : CARD2, border: `1.5px solid ${catKey === c.key ? c.color : 'transparent'}`, borderRadius: 12, padding: '9px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 17 }}>{c.emoji}</span>
                  <span style={{ color: catKey === c.key ? TEXT : GREY, fontSize: 9, fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date + note */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: GREY, fontSize: 11, fontWeight: 600, letterSpacing: 0.8, marginBottom: 6 }}>ДАТА</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ width: '100%', background: CARD2, border: 'none', borderRadius: 10, padding: '10px 12px', color: TEXT, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 2 }}>
              <div style={{ color: GREY, fontSize: 11, fontWeight: 600, letterSpacing: 0.8, marginBottom: 6 }}>ЗАМЕТКА</div>
              <input placeholder="Что это?" value={note} onChange={e => setNote(e.target.value)}
                style={{ width: '100%', background: CARD2, border: 'none', borderRadius: 10, padding: '10px 12px', color: TEXT, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Add button */}
          <button onClick={handleAdd} disabled={num <= 0}
            style={{ width: '100%', borderRadius: 14, padding: '15px', background: num > 0 ? `linear-gradient(90deg, ${BLUE}, #5B9CF6)` : DIM, border: 'none', color: '#FFF', fontSize: 16, fontWeight: 700, cursor: num > 0 ? 'pointer' : 'default', marginTop: 2 }}>
            Добавить расход
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── BudgetChatTab ────────────────────────────────────────────────────────────
function BudgetChatTab({ budget }: { budget: TripBudget }) {
  const [msgs, setMsgs]   = useState<ChatMsg[]>(INIT_CHAT);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const send = (txt?: string) => {
    const text = (txt ?? input).trim();
    if (!text) return;
    setMsgs(p => [...p, { id: `u${Date.now()}`, role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(p => [...p, { id: `ai${Date.now()}`, role: 'ai', text: aiReply(text, budget) }]);
    }, 1000);
  };

  const CHIPS = ['Сколько осталось?', 'Где перерасход?', 'Могу купить кроссовки за 8000?'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
            {m.role === 'ai' && (
              <div style={{ width: 28, height: 28, borderRadius: 9, background: `linear-gradient(135deg,${BLUE},#5B9CF6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                <Sparkles size={13} color="#FFF" />
              </div>
            )}
            <div style={{ maxWidth: '75%', padding: '10px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? BLUE : CARD2, color: TEXT, fontSize: 14, lineHeight: 1.5 }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: `linear-gradient(135deg,${BLUE},#5B9CF6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={13} color="#FFF" />
            </div>
            <div style={{ background: CARD2, borderRadius: '16px 16px 16px 4px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 6, height: 6, borderRadius: 3, background: GREY }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {msgs.length <= 1 && (
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CHIPS.map(c => (
            <button key={c} onClick={() => send(c)}
              style={{ background: CARD2, border: `1px solid ${DIM}`, borderRadius: 20, padding: '7px 14px', color: TEXT, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: '8px 16px 16px', display: 'flex', gap: 8, borderTop: `1px solid ${CARD2}` }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Спросите о бюджете..."
          style={{ flex: 1, background: CARD2, border: 'none', borderRadius: 12, padding: '11px 14px', color: TEXT, fontSize: 14, outline: 'none' }} />
        <button onClick={() => send()}
          style={{ width: 44, height: 44, borderRadius: 12, background: BLUE, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Send size={17} color="#FFF" />
        </button>
      </div>
    </div>
  );
}

// ─── BudgetDetailScreen (T1) ──────────────────────────────────────────────────
function BudgetDetailScreen({ budget, onBack, onAddExpense }: {
  budget: TripBudget; onBack: () => void; onAddExpense: () => void;
}) {
  const [tab, setTab] = useState<'budget' | 'chat'>('budget');
  const plan  = getTotalPlan(budget);
  const spent = getTotalFact(budget);
  const left  = plan - spent;
  const pct   = plan > 0 ? spent / plan : 0;
  const sc    = statusColor(pct);
  const days  = groupByDay(budget.expenses);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 0', background: CARD, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GREY, padding: '4px 4px 4px 0', display: 'flex' }}>
            <ChevronLeft size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>{budget.emoji}</span>
              <span style={{ color: TEXT, fontSize: 18, fontWeight: 700 }}>{budget.tripName}</span>
            </div>
            <div style={{ color: GREY, fontSize: 11, marginTop: 1 }}>
              {fmtDate(budget.dateFrom)} — {fmtDate(budget.dateTo)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', marginInline: -20 }}>
          {(['budget', 'chat'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '11px', border: 'none', background: 'none', cursor: 'pointer', color: tab === t ? BLUE : GREY, fontSize: 14, fontWeight: tab === t ? 700 : 500, borderBottom: `2px solid ${tab === t ? BLUE : 'transparent'}` }}>
              {t === 'budget' ? 'Бюджет' : '🤖 Чат с ИИ'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {tab === 'budget' ? (
          <div style={{ paddingBottom: 100 }}>
            {/* Summary */}
            <div style={{ background: CARD, padding: '16px 20px 14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginBottom: 14 }}>
                {([['ПЛАН', plan, GREY], ['ПОТРАЧЕНО', spent, sc], ['ОСТАЛОСЬ', left, left >= 0 ? GREEN : RED]] as [string, number, string][]).map(([lbl, val, col]) => (
                  <div key={lbl} style={{ textAlign: 'center' }}>
                    <div style={{ color: GREY, fontSize: 9, fontWeight: 600, letterSpacing: 0.8, marginBottom: 3 }}>{lbl}</div>
                    <div style={{ color: col, fontSize: 14, fontWeight: 800 }}>{ru(val)} ₽</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 6, borderRadius: 3, background: CARD2, overflow: 'hidden', marginBottom: 7 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 1) * 100}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg,${BLUE},${sc})` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: sc, fontSize: 12, fontWeight: 600 }}>{statusLabel(pct)}</span>
                <span style={{ color: GREY, fontSize: 12 }}>{Math.round(pct * 100)}%</span>
              </div>
            </div>

            {/* Donut */}
            <div style={{ background: CARD, padding: '20px', marginTop: 8, display: 'flex', justifyContent: 'center' }}>
              <DonutChart budget={budget} />
            </div>

            {/* Categories */}
            <div style={{ background: CARD, padding: '14px 20px', marginTop: 8 }}>
              <div style={{ color: GREY, fontSize: 11, fontWeight: 600, letterSpacing: 0.8, marginBottom: 4 }}>КАТЕГОРИИ</div>
              {budget.categories.map(cat => <CategoryRow key={cat.key} cat={cat} budget={budget} />)}
            </div>

            {/* Expense log */}
            {days.length > 0 && (
              <div style={{ background: CARD, padding: '14px 20px', marginTop: 8 }}>
                <div style={{ color: GREY, fontSize: 11, fontWeight: 600, letterSpacing: 0.8, marginBottom: 10 }}>ОПЕРАЦИИ</div>
                {days.map(([date, exps]) => (
                  <div key={date} style={{ marginBottom: 10 }}>
                    <div style={{ color: GREY, fontSize: 11, fontWeight: 600, marginBottom: 4, paddingBottom: 4, borderBottom: `1px solid ${CARD2}` }}>
                      {fmtDate(date)}
                    </div>
                    {exps.map(e => <ExpenseItem key={e.id} expense={e} />)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <BudgetChatTab budget={budget} />
        )}
      </div>

      {/* FAB */}
      {tab === 'budget' && (
        <motion.button whileTap={{ scale: 0.88 }} onClick={onAddExpense}
          style={{ position: 'fixed', right: 20, bottom: 90, width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg,${BLUE},#5B9CF6)`, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(46,166,255,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={24} color="#FFF" />
        </motion.button>
      )}
    </div>
  );
}

// ─── SwipeableBudgetRow ───────────────────────────────────────────────────────
const ACT_W = 70;

function SwipeableBudgetRow({ budget, onOpen, onDelete, onPin }: {
  budget: TripBudget; onOpen: () => void; onDelete: () => void; onPin: () => void;
}) {
  const x       = useMotionValue(0);
  const delOp   = useTransform(x, [-ACT_W, -ACT_W * 0.4], [1, 0]);
  const pinOp   = useTransform(x, [-ACT_W * 2, -ACT_W * 1.4], [1, 0]);
  const plan    = getTotalPlan(budget);
  const spent   = getTotalFact(budget);
  const pct     = plan > 0 ? spent / plan : 0;
  const sc      = statusColor(pct);

  const snapClose = () => animate(x, 0,        { type: 'spring', stiffness: 420, damping: 38 });
  const snapOpen  = () => animate(x, -ACT_W*2, { type: 'spring', stiffness: 420, damping: 38 });
  const onDragEnd = () => { x.get() < -ACT_W ? snapOpen() : snapClose(); };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, marginBottom: 8 }}>
      {/* Action buttons */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex' }}>
        <motion.button style={{ width: ACT_W, background: '#1A56A0', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: pinOp }}
          onClick={() => { snapClose(); onPin(); }}>
          <Pin size={17} color="#FFF" />
          <span style={{ color: '#FFF', fontSize: 10 }}>Закрепить</span>
        </motion.button>
        <motion.button style={{ width: ACT_W, background: RED, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: delOp, borderRadius: '0 16px 16px 0' }}
          onClick={() => { snapClose(); onDelete(); }}>
          <Trash2 size={17} color="#FFF" />
          <span style={{ color: '#FFF', fontSize: 10 }}>Удалить</span>
        </motion.button>
      </div>

      <motion.div drag="x" dragConstraints={{ left: -ACT_W * 2, right: 0 }} dragElastic={0.12}
        onDragEnd={onDragEnd} style={{ x, background: CARD, borderRadius: 16, cursor: 'grab', userSelect: 'none' }}>
        <button onClick={() => { if (Math.abs(x.get()) < 5) onOpen(); }}
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Cover */}
          <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
            <img src={budget.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {budget.emoji}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ color: TEXT, fontSize: 15, fontWeight: 700 }}>
                  {budget.pinned ? '📌 ' : ''}{budget.tripName}
                </div>
                <div style={{ color: GREY, fontSize: 11, marginTop: 1 }}>{fmtDate(budget.dateFrom)} — {fmtDate(budget.dateTo)}</div>
              </div>
              <div style={{ background: sc + '22', color: sc, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
                {budget.status === 'active' ? 'Идёт' : budget.status === 'done' ? 'Завершена' : 'Планируется'}
              </div>
            </div>
            <div style={{ color: GREY, fontSize: 11, marginBottom: 6 }}>
              {ru(plan)} ₽ план ·{' '}
              <span style={{ color: sc, fontWeight: 600 }}>{ru(spent)} ₽ потрачено</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: CARD2, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: sc, width: `${Math.min(pct, 1) * 100}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ color: GREY, fontSize: 10 }}>
                Осталось:{' '}
                <span style={{ color: plan - spent >= 0 ? GREEN : RED, fontWeight: 600 }}>{ru(plan - spent)} ₽</span>
              </span>
              <span style={{ color: GREY, fontSize: 10 }}>{Math.round(pct * 100)}%</span>
            </div>
          </div>
        </button>
      </motion.div>
    </div>
  );
}

// ─── BudgetListScreen (T0) ────────────────────────────────────────────────────
function BudgetListScreen({ budgets, onOpen, onDelete, onPin, onCreateNew }: {
  budgets: TripBudget[]; onOpen: (id: string) => void;
  onDelete: (id: string) => void; onPin: (id: string) => void; onCreateNew: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = [...budgets]
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    .filter(b => b.tripName.toLowerCase().includes(query.toLowerCase()) || b.country.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG }}>
      <div style={{ padding: '52px 20px 16px', background: CARD, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ color: TEXT, fontSize: 22, fontWeight: 800 }}>Трекер</div>
            <div style={{ color: GREY, fontSize: 12, marginTop: 1 }}>Деньги по поездкам</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💰</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: CARD2, borderRadius: 12, padding: '10px 14px' }}>
          <Search size={15} color={GREY} />
          <input placeholder="Поиск по поездкам..." value={query} onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', color: TEXT, fontSize: 14, outline: 'none' }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 90px' }}>
        <button onClick={onCreateNew}
          style={{ width: '100%', borderRadius: 14, padding: '14px', background: `linear-gradient(90deg,${BLUE},#5B9CF6)`, border: 'none', color: '#FFF', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <Plus size={18} /> Создать бюджет
        </button>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>💸</div>
            <div style={{ color: TEXT, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Нет бюджетов</div>
            <div style={{ color: GREY, fontSize: 13, lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
              Создайте маршрут в ИИ — и бюджет появится автоматически. Или нажмите «Создать бюджет».
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map(b => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }}>
                <SwipeableBudgetRow budget={b} onOpen={() => onOpen(b.id)} onDelete={() => onDelete(b.id)} onPin={() => onPin(b.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
          style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: CARD2, color: TEXT, padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 500, zIndex: 300, whiteSpace: 'nowrap', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [budgets, setBudgets] = useState<TripBudget[]>(INIT_BUDGETS);
  const [stack, setStack]     = useState<NavScreen[]>([{ name: 'list' }]);
  const [addSheet, setAddSheet] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVis, setToastVis] = useState(false);

  const screen = stack[stack.length - 1];
  const currentBudget = screen.budgetId ? budgets.find(b => b.id === screen.budgetId) : undefined;

  const push = (s: NavScreen) => setStack(p => [...p, s]);
  const pop  = () => setStack(p => p.length > 1 ? p.slice(0, -1) : p);

  const showToast = (msg: string) => {
    setToastMsg(msg); setToastVis(true);
    setTimeout(() => setToastVis(false), 2400);
  };

  const handleAddExpense = (expense: Expense) => {
    if (!currentBudget) return;
    setBudgets(p => p.map(b => b.id === currentBudget.id ? { ...b, expenses: [expense, ...b.expenses] } : b));
    showToast('Расход добавлен ✓');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {screen.name === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
            <BudgetListScreen
              budgets={budgets}
              onOpen={id => push({ name: 'detail', budgetId: id })}
              onDelete={id => { setBudgets(p => p.filter(b => b.id !== id)); showToast('Бюджет удалён'); }}
              onPin={id => setBudgets(p => p.map(b => b.id === id ? { ...b, pinned: !b.pinned } : b))}
              onCreateNew={() => showToast('Скоро — создание нового бюджета 🚀')}
            />
          </motion.div>
        ) : currentBudget ? (
          <motion.div key="detail" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }} style={{ height: '100%' }}>
            <BudgetDetailScreen budget={currentBudget} onBack={pop} onAddExpense={() => setAddSheet(true)} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {addSheet && currentBudget && (
          <AddExpenseSheet budget={currentBudget} onClose={() => setAddSheet(false)} onAdd={handleAddExpense} />
        )}
      </AnimatePresence>

      <Toast msg={toastMsg} visible={toastVis} />
    </div>
  );
}
