import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Home, List, Target, AlertTriangle, Settings, Plus,
  ChevronLeft, ChevronRight, Check, X, Edit3, Trash2,
  TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard,
  Calendar, ArrowDown, ArrowUp, MoreHorizontal, Repeat,
  Download, Upload, RefreshCw, ChevronDown, ChevronUp,
  Sparkles, FileDown, FileUp, RotateCcw, Tag, Folder,
  Search, Filter, ArrowRight, Info, Coins, Receipt,
  LayoutGrid, BarChart3, Bell, Eye, EyeOff
} from 'lucide-react';

// =====================================================
// COLORS — Apple iOS Dark System
// =====================================================
const C = {
  bg: '#000000',
  bgElevated: '#0A0A0A',
  card: '#1C1C1E',
  cardHover: '#252527',
  cardElevated: '#2C2C2E',
  separator: 'rgba(84, 84, 88, 0.32)',
  separatorOpaque: '#38383A',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(235, 235, 245, 0.6)',
  textTertiary: 'rgba(235, 235, 245, 0.3)',
  blue: '#0A84FF',
  blueDim: 'rgba(10, 132, 255, 0.15)',
  green: '#30D158',
  greenDim: 'rgba(48, 209, 88, 0.15)',
  red: '#FF453A',
  redDim: 'rgba(255, 69, 58, 0.15)',
  orange: '#FF9F0A',
  orangeDim: 'rgba(255, 159, 10, 0.15)',
  purple: '#BF5AF2',
};

// =====================================================
// HELPERS
// =====================================================
const fontStack = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif`;

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const parseMonthKey = (k) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1); };
const monthLabel = (d) => {
  const m = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${m[d.getMonth()]} ${d.getFullYear()}`;
};
const monthShort = (d) => {
  const m = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${m[d.getMonth()]} ${d.getFullYear()}`;
};
const formatBRL = (n) => {
  const v = Number(n) || 0;
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
};
const formatBRLShort = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v/1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 10_000) return `R$ ${(v/1000).toFixed(1)}k`;
  return formatBRL(v);
};
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const dayFromDateStr = (s) => Number((s || '').split('-')[2]);
const monthKeyFromDateStr = (s) => (s || '').slice(0, 7);
const isMonthInRange = (mk, start, end) => {
  if (!start) return true;
  if (mk < start) return false;
  if (end && mk > end) return false;
  return true;
};

// =====================================================
// DEFAULT DATA
// =====================================================
// budgetType: 'fixed' = conta obrigatória (valor previsto + pago/pendente)
//             'envelope' = limite de gasto (teto mensal que vai sendo consumido)
const DEFAULT_CATEGORIES = [
  { id: 'cat-salary', name: 'Salário', type: 'income', icon: '💰', subcategories: [] },
  { id: 'cat-other-income', name: 'Outras receitas', type: 'income', icon: '✨', subcategories: [] },
  { id: 'cat-mandatory', name: 'Pagamentos obrigatórios', type: 'expense', budgetType: 'fixed', icon: '📌', subcategories: [
    { id: 'sub-rent', name: 'Aluguel' },
    { id: 'sub-uni', name: 'Universidade' },
    { id: 'sub-loans', name: 'Empréstimos' },
  ]},
  { id: 'cat-home', name: 'Casa', type: 'expense', budgetType: 'envelope', icon: '🏠', subcategories: [
    { id: 'sub-construction', name: 'Construção' },
    { id: 'sub-decor', name: 'Decoração' },
    { id: 'sub-utensils', name: 'Utensílios' },
    { id: 'sub-appliances', name: 'Eletrodomésticos' },
    { id: 'sub-furniture', name: 'Móveis' },
  ]},
  { id: 'cat-food', name: 'Alimentação', type: 'expense', budgetType: 'envelope', icon: '🍽️', subcategories: [] },
  { id: 'cat-transport', name: 'Transporte', type: 'expense', budgetType: 'envelope', icon: '🚗', subcategories: [
    { id: 'sub-uber', name: 'Uber' },
    { id: 'sub-fuel', name: 'Combustível' },
  ]},
  { id: 'cat-shopping', name: 'Compras pessoais', type: 'expense', budgetType: 'envelope', icon: '🛍️', subcategories: [
    { id: 'sub-clothes', name: 'Roupas' },
    { id: 'sub-shoes', name: 'Calçados' },
    { id: 'sub-acc', name: 'Acessórios' },
    { id: 'sub-care', name: 'Cuidados pessoais' },
  ]},
  { id: 'cat-leisure', name: 'Lazer', type: 'expense', budgetType: 'envelope', icon: '🎬', subcategories: [] },
  { id: 'cat-subs', name: 'Assinaturas', type: 'expense', budgetType: 'fixed', icon: '📺', subcategories: [] },
  { id: 'cat-health', name: 'Saúde', type: 'expense', budgetType: 'envelope', icon: '⚕️', subcategories: [] },
  { id: 'cat-growth', name: 'Crescimento', type: 'expense', budgetType: 'envelope', icon: '📚', subcategories: [
    { id: 'sub-courses', name: 'Cursos' },
    { id: 'sub-books', name: 'Livros' },
  ]},
  { id: 'cat-lifestyle', name: 'Estilo de vida', type: 'expense', budgetType: 'envelope', icon: '✨', subcategories: [] },
];

const EMPTY_DATA = () => ({
  version: 1,
  transactions: [],
  recurrences: [],
  recurrenceStatus: {}, // 'recId_2026-05': { status:'paid'|'received', paidDate, paidAmount }
  categories: DEFAULT_CATEGORIES,
  budgets: {}, // { '2026-05': { 'cat-id': 300 } }
  goals: [],
  debts: [],
  monthClosings: {}, // { '2026-04': { surplus, allocation, target?, note } }
  envelopeLinks: {}, // { 'cat-id': { type: 'goal'|'debt', targetId } }
  envelopeLinkApplied: {}, // { 'cat-id_2026-05': true } — prevents duplicate auto-aportes
  settings: {
    currency: 'BRL',
    onboarded: false,
    hideBalances: false,
    initialBalance: 0,
  },
});

const EXAMPLE_DATA = () => {
  const base = EMPTY_DATA();
  const now = new Date();
  const mk = monthKey(now);
  base.settings.onboarded = true;
  base.recurrences = [
    { id: uid(), type: 'income', name: 'Salário', amount: 4500, dayOfMonth: 5, categoryId: 'cat-salary', subcategoryId: null, startMonth: mk, endMonth: null, notes: '' },
    { id: uid(), type: 'expense', name: 'Aluguel', amount: 1200, dayOfMonth: 10, categoryId: 'cat-mandatory', subcategoryId: 'sub-rent', startMonth: mk, endMonth: null, notes: '' },
    { id: uid(), type: 'expense', name: 'Universidade', amount: 600, dayOfMonth: 7, categoryId: 'cat-mandatory', subcategoryId: 'sub-uni', startMonth: mk, endMonth: null, notes: '' },
    { id: uid(), type: 'expense', name: 'Streaming', amount: 55.90, dayOfMonth: 15, categoryId: 'cat-subs', subcategoryId: null, startMonth: mk, endMonth: null, notes: '' },
  ];
  base.budgets[mk] = {
    'cat-food': 500,
    'cat-transport': 300,
    'cat-leisure': 200,
    'cat-shopping': 250,
  };
  base.goals = [
    { id: uid(), name: 'Reserva de emergência', target: 10000, deadline: null, parentId: null, contributions: [{ id: uid(), date: todayKey(), amount: 1500, note: 'Aporte inicial' }] },
    { id: uid(), name: 'Viagem', target: 4000, deadline: null, parentId: null, contributions: [] },
  ];
  base.debts = [
    { id: uid(), name: 'Cartão de crédito', creditor: 'Banco', total: 2400, payments: [{ id: uid(), date: todayKey(), amount: 400, note: 'Parcela 1' }] },
  ];
  return base;
};

// =====================================================
// PERSISTENCE
// =====================================================
const STORAGE_KEY = 'financial-math:data:v1';

async function loadData() {
  try {
    if (typeof window !== 'undefined' && window.storage) {
      const r = await window.storage.get(STORAGE_KEY);
      if (r && r.value) return JSON.parse(r.value);
    }
  } catch (e) {}
  return null;
}
async function saveData(data) {
  try {
    if (typeof window !== 'undefined' && window.storage) {
      await window.storage.set(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {}
}

// =====================================================
// COMPUTATIONS
// =====================================================
function computeMonthOccurrences(data, mk) {
  // Returns synthetic transaction entries derived from recurrences for the given month
  const out = [];
  for (const r of data.recurrences) {
    if (!isMonthInRange(mk, r.startMonth, r.endMonth)) continue;
    const [year, month] = mk.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate(); // last day of that month
    const day = Math.min(Math.max(1, r.dayOfMonth || 1), daysInMonth);
    const dateStr = `${mk}-${String(day).padStart(2,'0')}`;
    const stKey = `${r.id}_${mk}`;
    const st = data.recurrenceStatus[stKey] || {};
    out.push({
      __recurrence: true,
      id: stKey,
      recurrenceId: r.id,
      type: r.type,
      name: r.name,
      amount: st.paidAmount != null ? st.paidAmount : r.amount,
      date: dateStr,
      categoryId: r.categoryId,
      subcategoryId: r.subcategoryId,
      status: st.status || 'pending',
      paidDate: st.paidDate || null,
      notes: r.notes,
      mandatory: r.type === 'expense', // recurrences treated as obligations
    });
  }
  return out;
}

function getMonthEntries(data, mk) {
  const real = data.transactions.filter(t => monthKeyFromDateStr(t.date) === mk);
  const recs = computeMonthOccurrences(data, mk);
  return [...real, ...recs];
}

function getCatBudgetType(data, categoryId) {
  const cat = data.categories.find(c => c.id === categoryId);
  if (!cat) return 'fixed';
  return cat.budgetType || 'fixed';
}

function computeMonthSummary(data, mk) {
  const entries = getMonthEntries(data, mk);
  const budgets = data.budgets[mk] || {};

  let totalIncome = 0, receivedIncome = 0;
  let totalFixed = 0, paidFixed = 0;
  let spentInEnvelopes = 0;

  for (const e of entries) {
    if (e.type === 'income') {
      totalIncome += Number(e.amount) || 0;
      if (e.status === 'paid' || e.status === 'received') receivedIncome += Number(e.amount) || 0;
    } else if (e.type === 'expense') {
      const bType = getCatBudgetType(data, e.categoryId);
      if (bType === 'fixed') {
        totalFixed += Number(e.amount) || 0;
        if (e.status === 'paid') paidFixed += Number(e.amount) || 0;
      } else {
        if (e.status === 'paid') spentInEnvelopes += Number(e.amount) || 0;
      }
    }
  }

  let totalEnvelopeBudgets = 0;
  for (const [catId, amount] of Object.entries(budgets)) {
    if (getCatBudgetType(data, catId) !== 'fixed') {
      totalEnvelopeBudgets += Number(amount) || 0;
    }
  }

  const pendingFixed = totalFixed - paidFixed;
  const totalPlanned = totalFixed + totalEnvelopeBudgets;
  const totalPaidOrSpent = paidFixed + spentInEnvelopes;
  const freeSurplusProjected = totalIncome - totalPlanned;
  const freeSurplusCurrent = receivedIncome - paidFixed - totalEnvelopeBudgets;
  const previousSurplus = computePreviousSurplus(data, mk);

  return {
    totalIncome, receivedIncome, pendingIncome: totalIncome - receivedIncome,
    totalFixed, paidFixed, pendingFixed,
    totalEnvelopeBudgets, spentInEnvelopes,
    envelopeReserved: Math.max(0, totalEnvelopeBudgets - spentInEnvelopes),
    totalPlanned, totalPaidOrSpent, totalPending: pendingFixed,
    freeSurplusProjected, freeSurplusCurrent, previousSurplus,
    // Compatibilidade legada
    totalExpense: totalFixed + spentInEnvelopes,
    paidExpense: totalPaidOrSpent,
    pendingExpense: pendingFixed,
    expectedSurplus: freeSurplusProjected,
    currentSurplus: freeSurplusCurrent,
  };
}

function computePreviousSurplus(data, mk) {
  // Find immediately previous month closing
  const d = parseMonthKey(mk);
  d.setMonth(d.getMonth() - 1);
  const prevMk = monthKey(d);
  const closing = data.monthClosings[prevMk];
  if (closing && closing.allocation === 'next-month') return closing.surplus || 0;
  return 0;
}

function computeBudgetStatus(data, mk) {
  const budgets = data.budgets[mk] || {};
  const entries = getMonthEntries(data, mk).filter(e => e.type === 'expense');
  const result = [];
  for (const [catId, budgetAmount] of Object.entries(budgets)) {
    const cat = data.categories.find(c => c.id === catId);
    if (!cat) continue;
    if (getCatBudgetType(data, catId) === 'fixed') continue; // skip fixed in envelopes
    const spent = entries.filter(e => e.categoryId === catId && e.status === 'paid').reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const remaining = budgetAmount - spent;
    const pct = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
    result.push({ categoryId: catId, category: cat, budget: budgetAmount, spent, remaining, pct });
  }
  return result.sort((a, b) => b.pct - a.pct);
}

function computeFixedBillsStatus(data, mk) {
  // Returns fixed bill entries (from categories with budgetType: 'fixed') for the month
  const entries = getMonthEntries(data, mk).filter(e => e.type === 'expense');
  const result = [];
  for (const e of entries) {
    if (getCatBudgetType(data, e.categoryId) === 'fixed') {
      result.push(e);
    }
  }
  return result.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

function getAlerts(data, mk) {
  const alerts = [];
  const summary = computeMonthSummary(data, mk);
  const budgetStatus = computeBudgetStatus(data, mk);
  const today = new Date();
  const todayStr = todayKey();
  const entries = getMonthEntries(data, mk);

  if (summary.expectedSurplus < 0) {
    alerts.push({ id: 'neg-surplus', kind: 'red', icon: 'red', text: 'Sobra prevista negativa', detail: formatBRL(summary.expectedSurplus) });
  } else if (summary.expectedSurplus < (summary.totalIncome * 0.05) && summary.totalIncome > 0) {
    alerts.push({ id: 'low-surplus', kind: 'orange', icon: 'orange', text: 'Sobra prevista baixa', detail: formatBRL(summary.expectedSurplus) });
  }

  for (const b of budgetStatus) {
    if (b.pct >= 100) {
      alerts.push({ id: `over-${b.categoryId}`, kind: 'red', icon: 'red', text: `${b.category.name} ultrapassou`, detail: `${b.pct.toFixed(0)}% usado` });
    } else if (b.pct >= 85) {
      alerts.push({ id: `near-${b.categoryId}`, kind: 'orange', icon: 'orange', text: `${b.category.name} quase no limite`, detail: `${b.pct.toFixed(0)}% usado` });
    }
  }

  // Overdue and upcoming
  for (const e of entries) {
    if (e.type !== 'expense' || e.status === 'paid') continue;
    if (!e.date) continue;
    if (e.date < todayStr) {
      alerts.push({ id: `overdue-${e.id}`, kind: 'red', icon: 'red', text: `Vencido: ${e.name}`, detail: formatBRL(e.amount) });
    } else {
      const due = new Date(e.date);
      const diff = (due - today) / (1000 * 60 * 60 * 24);
      if (diff <= 3 && diff >= 0) {
        alerts.push({ id: `soon-${e.id}`, kind: 'orange', icon: 'orange', text: `Vence em breve: ${e.name}`, detail: formatBRL(e.amount) });
      }
    }
  }

  return alerts;
}

// =====================================================
// MAIN APP
// =====================================================
export default function App() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('dashboard'); // dashboard | transactions | budgets | goals | settings
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const [modal, setModal] = useState(null); // {type, payload}
  const [toast, setToast] = useState(null);

  // Load
  useEffect(() => {
    (async () => {
      const stored = await loadData();
      if (stored && stored.settings && stored.settings.onboarded) {
        setData(stored);
      } else {
        setData(EMPTY_DATA());
      }
      setLoaded(true);
    })();
  }, []);

  // Save
  useEffect(() => {
    if (!loaded || !data) return;
    saveData(data);
  }, [data, loaded]);

  const showToast = (text, kind = 'default') => {
    setToast({ text, kind, id: uid() });
    setTimeout(() => setToast(null), 2500);
  };

  const updateData = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  }, []);

  if (!loaded || !data) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSecondary, fontFamily: fontStack }}>
        <div style={{ width: 28, height: 28, border: `2px solid ${C.separatorOpaque}`, borderTopColor: C.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data.settings.onboarded) {
    return <Onboarding onChoose={(d) => { setData(d); }} />;
  }

  const mk = monthKey(currentMonth);

  return (
    <div style={{
      background: C.bg, minHeight: '100vh', color: C.textPrimary,
      fontFamily: fontStack, fontFeatureSettings: '"tnum" 1, "ss01" 1',
      WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale',
      paddingBottom: 92,
    }}>
      <GlobalStyles />

      <Header
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        hideBalances={data.settings.hideBalances}
        onToggleHide={() => updateData(d => ({ ...d, settings: { ...d.settings, hideBalances: !d.settings.hideBalances } }))}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>
        {view === 'dashboard' && (
          <Dashboard
            data={data}
            mk={mk}
            currentMonth={currentMonth}
            onSetView={setView}
            onOpenModal={setModal}
            updateData={updateData}
            showToast={showToast}
          />
        )}
        {view === 'transactions' && (
          <TransactionsView
            data={data}
            mk={mk}
            updateData={updateData}
            onOpenModal={setModal}
            showToast={showToast}
          />
        )}
        {view === 'budgets' && (
          <BudgetsView
            data={data}
            mk={mk}
            updateData={updateData}
            showToast={showToast}
          />
        )}
        {view === 'goals' && (
          <GoalsDebtsView
            data={data}
            updateData={updateData}
            onOpenModal={setModal}
            showToast={showToast}
          />
        )}
        {view === 'planning' && (
          <PlanningView
            data={data}
            mk={mk}
            updateData={updateData}
            onOpenModal={setModal}
            showToast={showToast}
          />
        )}
        {view === 'settings' && (
          <SettingsView
            data={data}
            updateData={updateData}
            setData={setData}
            showToast={showToast}
            openModal={setModal}
          />
        )}
      </main>

      <FAB onClick={() => setModal({ type: 'new-transaction-picker' })} />

      <ScrollButtons />

      <BottomNav view={view} setView={setView} />

      {/* Modals */}
      {modal && (
        <ModalRoot
          modal={modal}
          close={() => setModal(null)}
          data={data}
          mk={mk}
          currentMonth={currentMonth}
          updateData={updateData}
          showToast={showToast}
          openModal={setModal}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', left: '50%', transform: 'translateX(-50%)',
          bottom: 110, zIndex: 100, padding: '12px 18px',
          background: toast.kind === 'success' ? C.green : toast.kind === 'error' ? C.red : C.cardElevated,
          color: '#fff', borderRadius: 14, fontWeight: 600, fontSize: 14,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          animation: 'toast-in 0.25s ease-out',
        }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

// =====================================================
// GLOBAL STYLES
// =====================================================
function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      body { margin: 0; background: ${C.bg}; }
      input, button, select, textarea { font-family: inherit; }
      input:focus, select:focus, textarea:focus { outline: none; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-thumb { background: ${C.separatorOpaque}; border-radius: 3px; }
      @keyframes toast-in { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
      @keyframes modal-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes overlay-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      .mf-press:active { transform: scale(0.97); }
      .mf-card { transition: background 0.15s ease, transform 0.15s ease; }
      .mf-button { transition: all 0.15s ease; }
      .mf-button:hover { filter: brightness(1.1); }
      .mf-tab-active { color: ${C.blue} !important; }
    `}</style>
  );
}

// =====================================================
// HEADER + MONTH PICKER
// =====================================================
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function MonthPickerModal({ currentMonth, setCurrentMonth, onClose }) {
  const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());
  const currentMk = monthKey(currentMonth);

  const select = (month) => {
    const d = new Date(pickerYear, month, 1);
    setCurrentMonth(d);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'overlay-in 0.2s ease',
    }} onClick={onClose}>
      <div style={{
        background: C.card, borderRadius: 20, padding: 20, width: '100%', maxWidth: 340,
        animation: 'modal-in 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        {/* Year selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => setPickerYear(y => y - 1)} style={{ background: C.cardElevated, border: 'none', color: C.textPrimary, width: 36, height: 36, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{pickerYear}</div>
          <button onClick={() => setPickerYear(y => y + 1)} style={{ background: C.cardElevated, border: 'none', color: C.textPrimary, width: 36, height: 36, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={20} />
          </button>
        </div>
        {/* Month grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {MONTH_SHORT.map((m, i) => {
            const mk = `${pickerYear}-${String(i + 1).padStart(2, '0')}`;
            const isSelected = mk === currentMk;
            const isToday = mk === monthKey(new Date());
            return (
              <button key={i} onClick={() => select(i)} style={{
                padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isSelected ? C.blue : isToday ? C.cardElevated : 'transparent',
                color: isSelected ? '#fff' : isToday ? C.blue : C.textPrimary,
                fontSize: 14, fontWeight: isSelected || isToday ? 700 : 400,
              }}>
                {m}
              </button>
            );
          })}
        </div>
        <button onClick={onClose} style={{
          marginTop: 16, width: '100%', padding: '12px', background: C.cardElevated,
          border: 'none', color: C.textSecondary, borderRadius: 12, fontSize: 15, cursor: 'pointer',
        }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Header({ currentMonth, setCurrentMonth, hideBalances, onToggleHide }) {
  const [showPicker, setShowPicker] = useState(false);
  const goPrev = () => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d); };
  const goNext = () => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d); };

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `0.5px solid ${C.separator}`,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={goPrev} className="mf-button mf-press" style={iconBtn()}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setShowPicker(true)} className="mf-press" style={{
              background: 'transparent', border: 'none', color: C.textPrimary, fontWeight: 700,
              fontSize: 17, padding: '4px 12px', cursor: 'pointer', letterSpacing: '-0.01em',
              minWidth: 150, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {monthLabel(currentMonth)}
              <ChevronDown size={14} color={C.textTertiary} />
            </button>
            <button onClick={goNext} className="mf-button mf-press" style={iconBtn()}>
              <ChevronRight size={20} />
            </button>
          </div>
          <button onClick={onToggleHide} className="mf-button mf-press" style={iconBtn()} aria-label="Esconder valores">
            {hideBalances ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </header>
      {showPicker && (
        <MonthPickerModal
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

const iconBtn = () => ({
  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none', color: C.textPrimary, cursor: 'pointer',
  borderRadius: 10,
});

// =====================================================
// BOTTOM NAV
// =====================================================
function BottomNav({ view, setView }) {
  const tabs = [
    { id: 'dashboard', label: 'Início', Icon: Home },
    { id: 'transactions', label: 'Lançamentos', Icon: List },
    { id: 'budgets', label: 'Orçamentos', Icon: BarChart3 },
    { id: 'goals', label: 'Metas', Icon: Target },
    { id: 'settings', label: 'Mais', Icon: Settings },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: 'rgba(20,20,22,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: `0.5px solid ${C.separator}`,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{
        maxWidth: 720, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '8px 4px',
      }}>
        {tabs.map(({ id, label, Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className="mf-press"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '6px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                color: active ? C.blue : C.textSecondary,
                transition: 'color 0.15s ease',
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '-0.01em' }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// =====================================================
// FAB
// =====================================================
function FAB({ onClick }) {
  return (
    <button onClick={onClick} className="mf-press" style={{
      position: 'fixed', bottom: 92, right: 20, zIndex: 45,
      width: 56, height: 56, borderRadius: 28,
      background: C.blue, border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', boxShadow: '0 8px 24px rgba(10,132,255,0.4)',
    }} aria-label="Novo lançamento">
      <Plus size={26} strokeWidth={2.6} />
    </button>
  );
}

function ScrollButtons() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', left: 16, bottom: 100, zIndex: 44,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mf-press"
        style={{
          width: 36, height: 36, borderRadius: 18,
          background: C.cardElevated, border: `0.5px solid ${C.separator}`,
          color: C.textSecondary, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
        aria-label="Ir ao topo"
      >
        <ChevronUp size={18} />
      </button>
      <button
        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        className="mf-press"
        style={{
          width: 36, height: 36, borderRadius: 18,
          background: C.cardElevated, border: `0.5px solid ${C.separator}`,
          color: C.textSecondary, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
        aria-label="Ir ao final"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );
}

// =====================================================
// ONBOARDING
// =====================================================
function Onboarding({ onChoose }) {
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const startEmpty = () => {
    const d = EMPTY_DATA();
    d.settings.onboarded = true;
    onChoose(d);
  };
  const startExample = () => onChoose(EXAMPLE_DATA());

  const handleImport = (file) => {
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json || typeof json !== 'object') throw new Error();
        json.settings = { ...EMPTY_DATA().settings, ...(json.settings || {}), onboarded: true };
        onChoose(json);
      } catch {
        alert('Arquivo inválido');
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      background: C.bg, minHeight: '100vh', color: C.textPrimary,
      fontFamily: fontStack, display: 'flex', flexDirection: 'column',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <GlobalStyles />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, margin: '0 auto 24px',
            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.purple} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 40px rgba(10,132,255,0.3)',
          }}>
            <Wallet size={36} color="#fff" strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
            Financial Math
          </h1>
          <p style={{ color: C.textSecondary, fontSize: 16, marginTop: 8, letterSpacing: '-0.01em' }}>
            Sua vida financeira, clara e simples.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <OnboardOption
            Icon={Sparkles}
            title="Começar do zero"
            subtitle="Crie sua estrutura do jeito que faz sentido pra você."
            onClick={startEmpty}
            primary
          />
          <OnboardOption
            Icon={LayoutGrid}
            title="Ver como funciona"
            subtitle="Carregue dados de exemplo para explorar o app."
            onClick={startExample}
          />
          <OnboardOption
            Icon={FileUp}
            title="Importar backup"
            subtitle="Restaure seus dados de um arquivo .json."
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef} type="file" accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
        </div>

        <p style={{ color: C.textTertiary, fontSize: 12, textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
          Seus dados ficam salvos apenas neste navegador.<br />
          Nada é enviado para servidores externos.
        </p>
      </div>
    </div>
  );
}

function OnboardOption({ Icon, title, subtitle, onClick, primary }) {
  return (
    <button onClick={onClick} className="mf-card mf-press" style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '18px 18px',
      background: primary ? C.blue : C.card, border: 'none', cursor: 'pointer',
      borderRadius: 16, textAlign: 'left', color: '#fff', width: '100%',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: primary ? 'rgba(255,255,255,0.2)' : C.cardElevated,
      }}>
        <Icon size={20} color="#fff" strokeWidth={2.2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontSize: 13, color: primary ? 'rgba(255,255,255,0.85)' : C.textSecondary, marginTop: 2 }}>{subtitle}</div>
      </div>
      <ChevronRight size={18} color={primary ? '#fff' : C.textTertiary} />
    </button>
  );
}

// =====================================================
// DASHBOARD
// =====================================================
function Dashboard({ data, mk, currentMonth, onSetView, onOpenModal, updateData, showToast }) {
  const summary = useMemo(() => computeMonthSummary(data, mk), [data, mk]);
  const budgetStatus = useMemo(() => computeBudgetStatus(data, mk), [data, mk]);
  const alerts = useMemo(() => getAlerts(data, mk), [data, mk]);
  const entries = useMemo(() => getMonthEntries(data, mk), [data, mk]);
  const hide = data.settings.hideBalances;

  const upcoming = useMemo(() => {
    const todayStr = todayKey();
    return entries
      .filter(e => e.type === 'expense' && e.status !== 'paid' && e.date && e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [entries]);

  const overdue = useMemo(() => {
    const todayStr = todayKey();
    return entries
      .filter(e => e.type === 'expense' && e.status !== 'paid' && e.date && e.date < todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const activeGoals = data.goals.filter(g => !g.parentId).slice(0, 3);
  const activeDebts = data.debts.filter(d => {
    const paid = (d.payments || []).reduce((s, p) => s + (Number(p.amount)||0), 0);
    return paid < d.total;
  }).slice(0, 3);

  return (
    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* HERO: Sobra livre prevista */}
      <div className="mf-card" style={{ background: C.card, borderRadius: 18, padding: '20px 20px' }}>
        <div style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500, letterSpacing: '-0.01em' }}>
          Sobra livre prevista
        </div>
        <div style={{
          fontSize: 38, fontWeight: 700, marginTop: 4, letterSpacing: '-0.03em',
          color: summary.freeSurplusProjected >= 0 ? C.textPrimary : C.red,
        }}>
          {hide ? '••••••' : formatBRL(summary.freeSurplusProjected)}
        </div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
          entradas menos tudo que já tem destino
        </div>

        {/* 6 métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
          <MetricTile label="Entradas" value={hide ? '••' : formatBRLShort(summary.totalIncome)} color={C.green} sub={summary.pendingIncome > 0 ? `${formatBRLShort(summary.pendingIncome)} pendente` : null} />
          <MetricTile label="Destinado" value={hide ? '••' : formatBRLShort(summary.totalPlanned)} color={C.textSecondary} sub={`fixas + envelopes`} />
          <MetricTile label="Pago/Gasto" value={hide ? '••' : formatBRLShort(summary.totalPaidOrSpent)} color={C.blue} sub={null} />
          <MetricTile label="Pendente" value={hide ? '••' : formatBRLShort(summary.totalPending)} color={summary.totalPending > 0 ? C.orange : C.textTertiary} sub="contas fixas" />
          <MetricTile label="Envelopes" value={hide ? '••' : formatBRLShort(summary.envelopeReserved)} color={C.textSecondary} sub="reservado" />
          <MetricTile label="Livre agora" value={hide ? '••' : formatBRLShort(summary.freeSurplusCurrent)} color={summary.freeSurplusCurrent >= 0 ? C.green : C.red} sub="real atual" />
        </div>

        {summary.previousSurplus > 0 && (
          <div style={{
            marginTop: 14, padding: '10px 12px', background: C.cardElevated, borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <PiggyBank size={16} color={C.green} />
            <div style={{ flex: 1, fontSize: 13 }}>
              <span style={{ color: C.textSecondary }}>Saldo livre do mês anterior: </span>
              <span style={{ color: C.green, fontWeight: 600 }}>{hide ? '••••' : formatBRL(summary.previousSurplus)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Cards fixas vs envelopes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SummaryCard
          icon={<Receipt size={16} />}
          color={C.orange}
          label="Contas fixas"
          mainValue={hide ? '••' : formatBRL(summary.paidFixed)}
          subValue={hide ? '' : `de ${formatBRL(summary.totalFixed)}`}
          progress={summary.totalFixed > 0 ? (summary.paidFixed / summary.totalFixed) : 0}
        />
        <SummaryCard
          icon={<Wallet size={16} />}
          color={C.blue}
          label="Envelopes"
          mainValue={hide ? '••' : formatBRL(summary.spentInEnvelopes)}
          subValue={hide ? '' : `de ${formatBRL(summary.totalEnvelopeBudgets)}`}
          progress={summary.totalEnvelopeBudgets > 0 ? (summary.spentInEnvelopes / summary.totalEnvelopeBudgets) : 0}
        />
      </div>

      {/* ALERTAS */}
      {alerts.length > 0 && (
        <Section title="Atenção">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {alerts.slice(0, 4).map((a, i) => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                background: C.card, borderTop: i === 0 ? 'none' : `0.5px solid ${C.separator}`,
                borderRadius: i === 0 ? '14px 14px 0 0' : i === Math.min(alerts.length, 4) - 1 ? '0 0 14px 14px' : 0,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: a.kind === 'red' ? C.redDim : C.orangeDim,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={15} color={a.kind === 'red' ? C.red : C.orange} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{a.text}</div>
                  <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>{a.detail}</div>
                </div>
              </div>
            ))}
            {alerts.length === 1 && <div style={{ height: 0 }} />}
          </div>
        </Section>
      )}

      {/* Vencidos */}
      {overdue.length > 0 && (
        <Section title="Vencidos">
          <div style={{ background: C.card, borderRadius: 14, overflow: 'hidden' }}>
            {overdue.slice(0, 5).map((e, i) => (
              <TransactionRow
                key={e.id}
                entry={e}
                data={data}
                isFirst={i === 0}
                isLast={i === Math.min(overdue.length, 5) - 1}
                onTogglePaid={() => togglePaidStatus(e, data, updateData, showToast)}
                onClick={() => onOpenModal({ type: 'edit-transaction', payload: e })}
                showOverdue
              />
            ))}
          </div>
        </Section>
      )}

      {/* Próximos vencimentos */}
      {upcoming.length > 0 && (
        <Section title="Próximos vencimentos" action={
          <button onClick={() => onSetView('transactions')} style={textBtnStyle}>Ver todos</button>
        }>
          <div style={{ background: C.card, borderRadius: 14, overflow: 'hidden' }}>
            {upcoming.map((e, i) => (
              <TransactionRow
                key={e.id}
                entry={e}
                data={data}
                isFirst={i === 0}
                isLast={i === upcoming.length - 1}
                onTogglePaid={() => togglePaidStatus(e, data, updateData, showToast)}
                onClick={() => onOpenModal({ type: 'edit-transaction', payload: e })}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Orçamentos */}
      {budgetStatus.length > 0 && (
        <Section title="Orçamentos do mês" action={
          <button onClick={() => onSetView('budgets')} style={textBtnStyle}>Gerenciar</button>
        }>
          <div style={{ background: C.card, borderRadius: 14, padding: 4 }}>
            {budgetStatus.slice(0, 4).map((b, i) => (
              <BudgetMiniRow key={b.categoryId} b={b} hide={hide} isLast={i === Math.min(budgetStatus.length, 4) - 1} />
            ))}
          </div>
        </Section>
      )}

      {/* Metas */}
      {activeGoals.length > 0 && (
        <Section title="Metas em andamento" action={
          <button onClick={() => onSetView('goals')} style={textBtnStyle}>Ver todas</button>
        }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeGoals.map(g => <GoalCard key={g.id} goal={g} hide={hide} compact />)}
          </div>
        </Section>
      )}

      {/* Dívidas */}
      {activeDebts.length > 0 && (
        <Section title="Dívidas em andamento" action={
          <button onClick={() => onSetView('goals')} style={textBtnStyle}>Ver todas</button>
        }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeDebts.map(d => <DebtCard key={d.id} debt={d} hide={hide} compact />)}
          </div>
        </Section>
      )}

      {/* Empty state */}
      {summary.totalIncome === 0 && summary.totalExpense === 0 && alerts.length === 0 && (
        <div style={{
          background: C.card, borderRadius: 16, padding: '40px 24px',
          textAlign: 'center', marginTop: 8,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: C.cardElevated,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Plus size={28} color={C.blue} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Comece registrando algo</div>
          <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 4, lineHeight: 1.5 }}>
            Adicione uma receita, despesa ou recorrência<br />para ver seu resumo aqui.
          </div>
          <button
            onClick={() => onOpenModal({ type: 'new-transaction-picker' })}
            style={{
              marginTop: 20, background: C.blue, color: '#fff', border: 'none',
              padding: '11px 22px', borderRadius: 10, fontWeight: 600, fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Novo lançamento
          </button>
        </div>
      )}
    </div>
  );
}

const textBtnStyle = {
  background: 'transparent', border: 'none', color: C.blue, fontSize: 14,
  fontWeight: 500, cursor: 'pointer', padding: 0,
};

function MiniStat({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: C.cardElevated, borderRadius: 10, padding: '10px 10px' }}>
      <div style={{ fontSize: 11, color: C.textSecondary, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function MetricTile({ label, value, color, sub }) {
  return (
    <div style={{ background: C.cardElevated, borderRadius: 10, padding: '10px 10px' }}>
      <div style={{ fontSize: 10, color: C.textSecondary, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 3, letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SummaryCard({ icon, color, label, mainValue, subValue, progress }) {
  return (
    <div className="mf-card" style={{
      background: C.card, borderRadius: 16, padding: '14px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: `${color}26`, color,
        }}>
          {icon}
        </div>
        <div style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>{label}</div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10, letterSpacing: '-0.02em' }}>{mainValue}</div>
      <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 1 }}>{subValue}</div>
      <div style={{
        marginTop: 10, height: 4, borderRadius: 2,
        background: C.cardElevated, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${Math.min(100, (progress || 0) * 100)}%`,
          background: color, borderRadius: 2, transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '8px 4px 10px',
      }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// =====================================================
// TRANSACTION ROW
// =====================================================
function TransactionRow({ entry, data, isFirst, isLast, onTogglePaid, onClick, showOverdue }) {
  const cat = data.categories.find(c => c.id === entry.categoryId);
  const sub = cat?.subcategories?.find(s => s.id === entry.subcategoryId);
  const isIncome = entry.type === 'income';
  const isPaid = entry.status === 'paid' || entry.status === 'received';
  const day = entry.date ? new Date(entry.date + 'T00:00:00').getDate() : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderTop: isFirst ? 'none' : `0.5px solid ${C.separator}`, cursor: 'pointer',
    }} onClick={onClick} className="mf-card">
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
        style={{
          width: 28, height: 28, borderRadius: 14, flexShrink: 0,
          background: isPaid ? (isIncome ? C.green : C.blue) : 'transparent',
          border: `1.5px solid ${isPaid ? (isIncome ? C.green : C.blue) : C.separatorOpaque}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          padding: 0,
        }}
      >
        {isPaid && <Check size={15} color="#fff" strokeWidth={3} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.name}
          </div>
          {entry.__recurrence && <Repeat size={11} color={C.textTertiary} style={{ flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cat?.icon} {cat?.name || 'Sem categoria'}{sub ? ` · ${sub.name}` : ''}{day ? ` · dia ${day}` : ''}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: 15, fontWeight: 600,
          color: isPaid ? (isIncome ? C.green : C.textPrimary) : (showOverdue ? C.red : C.textPrimary),
          whiteSpace: 'nowrap',
        }}>
          {isIncome ? '+ ' : '− '}{formatBRL(entry.amount)}
        </div>
        {!isPaid && showOverdue && (
          <div style={{ fontSize: 11, color: C.red, fontWeight: 500, marginTop: 1 }}>vencido</div>
        )}
      </div>
    </div>
  );
}

function togglePaidStatus(entry, data, updateData, showToast) {
  if (entry.__recurrence) {
    const stKey = entry.id;
    const cur = data.recurrenceStatus[stKey];
    const isPaid = cur && (cur.status === 'paid' || cur.status === 'received');
    const newStatus = isPaid ? null : (entry.type === 'income' ? 'received' : 'paid');
    updateData(d => {
      const ns = { ...d.recurrenceStatus };
      if (newStatus) {
        ns[stKey] = { status: newStatus, paidDate: todayKey(), paidAmount: entry.amount };
      } else {
        delete ns[stKey];
      }
      return { ...d, recurrenceStatus: ns };
    });
    if (newStatus) showToast(entry.type === 'income' ? 'Marcado como recebido' : 'Marcado como pago', 'success');
  } else {
    updateData(d => ({
      ...d,
      transactions: d.transactions.map(t => {
        if (t.id !== entry.id) return t;
        const isPaid = t.status === 'paid' || t.status === 'received';
        return { ...t, status: isPaid ? 'pending' : (t.type === 'income' ? 'received' : 'paid') };
      })
    }));
  }
}

// =====================================================
// BUDGET ROW
// =====================================================
function BudgetMiniRow({ b, hide, isLast }) {
  const pct = Math.min(100, b.pct);
  const color = b.pct >= 100 ? C.red : b.pct >= 85 ? C.orange : C.blue;
  return (
    <div style={{
      padding: '12px 12px',
      borderBottom: isLast ? 'none' : `0.5px solid ${C.separator}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 16 }}>{b.category.icon}</span>
          <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {b.category.name}
          </span>
        </div>
        <div style={{ fontSize: 12, color: C.textSecondary, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {hide ? '••' : formatBRLShort(b.spent)} <span style={{ color: C.textTertiary }}>/ {hide ? '••' : formatBRLShort(b.budget)}</span>
        </div>
      </div>
      <div style={{
        height: 5, borderRadius: 3, background: C.cardElevated, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          transition: 'width 0.3s ease', borderRadius: 3,
        }} />
      </div>
    </div>
  );
}

// =====================================================
// GOAL & DEBT CARDS
// =====================================================
function GoalCard({ goal, hide, compact, onClick }) {
  const saved = (goal.contributions || []).reduce((s, c) => s + (Number(c.amount)||0), 0);
  const pct = goal.target > 0 ? Math.min(100, (saved / goal.target) * 100) : 0;
  return (
    <div onClick={onClick} className={onClick ? 'mf-card mf-press' : ''} style={{
      background: C.card, borderRadius: 14, padding: '14px 14px',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Target size={15} color={C.blue} />
          <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goal.name}</div>
        </div>
        <div style={{ fontSize: 13, color: C.blue, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{pct.toFixed(0)}%</div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: C.cardElevated, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: C.blue, transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
        <span style={{ color: C.textSecondary }}>{hide ? '••' : formatBRL(saved)} <span style={{ color: C.textTertiary }}>de {hide ? '••' : formatBRL(goal.target)}</span></span>
        <span style={{ color: C.textTertiary }}>faltam {hide ? '••' : formatBRL(Math.max(0, goal.target - saved))}</span>
      </div>
    </div>
  );
}

function DebtCard({ debt, hide, compact, onClick }) {
  const paid = (debt.payments || []).reduce((s, p) => s + (Number(p.amount)||0), 0);
  const pct = debt.total > 0 ? Math.min(100, (paid / debt.total) * 100) : 0;
  return (
    <div onClick={onClick} className={onClick ? 'mf-card mf-press' : ''} style={{
      background: C.card, borderRadius: 14, padding: '14px 14px',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <CreditCard size={15} color={C.orange} />
          <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{debt.name}</div>
          {debt.creditor && <span style={{ fontSize: 12, color: C.textTertiary }}>· {debt.creditor}</span>}
        </div>
        <div style={{ fontSize: 13, color: C.orange, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{pct.toFixed(0)}%</div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: C.cardElevated, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: C.orange, transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
        <span style={{ color: C.textSecondary }}>{hide ? '••' : formatBRL(paid)} <span style={{ color: C.textTertiary }}>de {hide ? '••' : formatBRL(debt.total)}</span></span>
        <span style={{ color: C.textTertiary }}>restam {hide ? '••' : formatBRL(Math.max(0, debt.total - paid))}</span>
      </div>
    </div>
  );
}

// =====================================================
// TRANSACTIONS VIEW
// =====================================================
function TransactionsView({ data, mk, updateData, onOpenModal, showToast }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | income | expense | pending | paid
  const entries = useMemo(() => {
    let e = getMonthEntries(data, mk);
    if (filter === 'income') e = e.filter(x => x.type === 'income');
    else if (filter === 'expense') e = e.filter(x => x.type === 'expense');
    else if (filter === 'pending') e = e.filter(x => x.status !== 'paid' && x.status !== 'received');
    else if (filter === 'paid') e = e.filter(x => x.status === 'paid' || x.status === 'received');
    if (search) {
      const q = search.toLowerCase();
      e = e.filter(x => x.name.toLowerCase().includes(q));
    }
    return e.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [data, mk, search, filter]);

  // Group by day
  const groups = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const d = e.date || 'sem-data';
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  return (
    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, borderRadius: 12, padding: '8px 12px' }}>
        <Search size={16} color={C.textTertiary} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar lançamento"
          style={{
            flex: 1, background: 'transparent', border: 'none', color: C.textPrimary,
            fontSize: 15, padding: '4px 0',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'all', label: 'Todos' },
          { id: 'income', label: 'Receitas' },
          { id: 'expense', label: 'Despesas' },
          { id: 'pending', label: 'Pendentes' },
          { id: 'paid', label: 'Pagos' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: filter === f.id ? C.blue : C.card, color: filter === f.id ? '#fff' : C.textPrimary,
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div style={{
          background: C.card, borderRadius: 16, padding: '40px 24px', textAlign: 'center',
        }}>
          <Receipt size={36} color={C.textTertiary} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>Nenhum lançamento</div>
          <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>
            {search ? 'Nenhum resultado para sua busca.' : 'Adicione seu primeiro lançamento.'}
          </div>
        </div>
      ) : (
        groups.map(([date, items]) => (
          <div key={date}>
            <div style={{ fontSize: 12, color: C.textSecondary, fontWeight: 600, padding: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {formatDateLabel(date)}
            </div>
            <div style={{ background: C.card, borderRadius: 14, overflow: 'hidden' }}>
              {items.map((e, i) => (
                <TransactionRow
                  key={e.id}
                  entry={e}
                  data={data}
                  isFirst={i === 0}
                  isLast={i === items.length - 1}
                  onTogglePaid={() => togglePaidStatus(e, data, updateData, showToast)}
                  onClick={() => onOpenModal({ type: 'edit-transaction', payload: e })}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function formatDateLabel(date) {
  if (date === 'sem-data') return 'Sem data';
  const today = todayKey();
  const d = new Date(date + 'T00:00:00');
  const ds = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const ms = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  if (date === today) return 'Hoje';
  return `${ds[d.getDay()]}, ${d.getDate()} ${ms[d.getMonth()]}`;
}

// =====================================================
// BUDGETS VIEW
// =====================================================
function BudgetsView({ data, mk, updateData, showToast }) {
  const [editing, setEditing] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [envelopeInput, setEnvelopeInput] = useState(null);
  const [envelopeLinkFor, setEnvelopeLinkFor] = useState(null); // category object
  const status = useMemo(() => computeBudgetStatus(data, mk), [data, mk]);
  const fixedBills = useMemo(() => computeFixedBillsStatus(data, mk), [data, mk]);
  const expenseCats = data.categories.filter(c => c.type === 'expense' || c.type === 'both');
  const envelopeCats = expenseCats.filter(c => getCatBudgetType(data, c.id) !== 'fixed');
  const budgeted = new Set(status.map(s => s.categoryId));
  const unbudgeted = envelopeCats.filter(c => !budgeted.has(c.id));

  const setBudget = (catId, value) => {
    const v = Number(String(value).replace(',', '.')) || 0;
    updateData(d => ({
      ...d,
      budgets: { ...d.budgets, [mk]: { ...(d.budgets[mk] || {}), [catId]: v } }
    }));
    showToast('Orçamento salvo', 'success');
  };
  const removeBudget = (catId) => {
    updateData(d => {
      const m = { ...(d.budgets[mk] || {}) };
      delete m[catId];
      return { ...d, budgets: { ...d.budgets, [mk]: m } };
    });
    showToast('Orçamento removido');
  };

  const totalEnv = status.reduce((s, b) => s + b.budget, 0);
  const totalEnvSpent = status.reduce((s, b) => s + b.spent, 0);
  const totalFixed = fixedBills.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const paidFixed = fixedBills.filter(e => e.status === 'paid').reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const hide = data.settings.hideBalances;

  return (
    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── CONTAS FIXAS ── */}
      <Section title="Contas fixas">
        {fixedBills.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 14, padding: '20px 16px', textAlign: 'center', color: C.textSecondary, fontSize: 14 }}>
            Nenhuma conta fixa este mês.
          </div>
        ) : (
          <>
            <div style={{ background: C.card, borderRadius: 14, overflow: 'hidden' }}>
              {fixedBills.map((e, i) => {
                const cat = data.categories.find(c => c.id === e.categoryId);
                const isPaid = e.status === 'paid';
                return (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                    borderTop: i === 0 ? 'none' : `0.5px solid ${C.separator}`,
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: 4, flexShrink: 0,
                      background: isPaid ? C.green : C.orange,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                        {cat?.icon} {cat?.name}{e.date ? ` · dia ${new Date(e.date+'T00:00:00').getDate()}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{hide ? '••' : formatBRL(e.amount)}</div>
                      <div style={{ fontSize: 12, color: isPaid ? C.green : C.orange, fontWeight: 500 }}>
                        {isPaid ? 'Pago' : 'Pendente'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', fontSize: 13, color: C.textSecondary }}>
              <span>Pago: <strong style={{ color: C.green }}>{hide ? '••' : formatBRL(paidFixed)}</strong></span>
              <span>Pendente: <strong style={{ color: paidFixed < totalFixed ? C.orange : C.textTertiary }}>{hide ? '••' : formatBRL(totalFixed - paidFixed)}</strong></span>
            </div>
          </>
        )}
      </Section>

      {/* ── ENVELOPES ── */}
      <Section title="Envelopes de gasto">
        {status.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 14, padding: '20px 16px', textAlign: 'center', color: C.textSecondary, fontSize: 14 }}>
            Defina os envelopes do mês abaixo.
          </div>
        ) : (
          <>
            <div style={{ background: C.card, borderRadius: 14, overflow: 'hidden' }}>
              {status.map((b, i) => (
                <div key={b.categoryId} style={{
                  padding: '14px 14px',
                  borderTop: i === 0 ? 'none' : `0.5px solid ${C.separator}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{b.category.icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>{b.category.name}</div>
                        <div style={{ fontSize: 12, color: C.textSecondary }}>
                          {b.remaining >= 0
                            ? `Restam ${hide ? '••' : formatBRL(b.remaining)}`
                            : <span style={{ color: C.red }}>Excedeu {hide ? '••' : formatBRL(-b.remaining)}</span>
                          }
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeBudget(b.categoryId)}
                      style={{ background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer', padding: 4, display: 'flex' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: C.cardElevated, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      height: '100%', width: `${Math.min(100, b.pct)}%`,
                      background: b.pct >= 100 ? C.red : b.pct >= 85 ? C.orange : C.blue,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: C.textSecondary }}>
                      {hide ? '••' : formatBRL(b.spent)} <span style={{ color: C.textTertiary }}>/ {hide ? '••' : formatBRL(b.budget)}</span>
                    </span>
                    {editing === b.categoryId ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          autoFocus type="text" inputMode="decimal"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setBudget(b.categoryId, tempValue); setEditing(null); }}}
                          style={{ width: 90, padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.blue}`, background: C.bg, color: C.textPrimary, fontSize: 13, textAlign: 'right' }}
                        />
                        <button onClick={() => { setBudget(b.categoryId, tempValue); setEditing(null); }}
                          style={{ background: C.blue, color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>OK</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditing(b.categoryId); setTempValue(String(b.budget)); }}
                        style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: 0 }}>
                        Editar limite
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 4, textAlign: 'right' }}>
                    {b.pct.toFixed(0)}% usado · reservado, não é sobra livre
                  </div>
                  {/* Vínculo com meta/dívida */}
                  {(() => {
                    const link = (data.envelopeLinks || {})[b.categoryId];
                    const isApplied = !!(data.envelopeLinkApplied || {})[`${b.categoryId}_${mk}`];
                    if (link && link.type !== 'none' && link.targetId) {
                      const target = link.type === 'goal'
                        ? data.goals.find(g => g.id === link.targetId)
                        : data.debts.find(x => x.id === link.targetId);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, padding: '8px 10px', background: isApplied ? C.greenDim : C.blueDim, borderRadius: 8 }}>
                          <div style={{ fontSize: 12, color: isApplied ? C.green : C.blue }}>
                            {isApplied ? '✓ Aplicado' : '⟶'} {link.type === 'goal' ? '🎯' : '💳'} {target?.name || '—'}
                          </div>
                          <button onClick={() => setEnvelopeLinkFor(b.category)} style={{ background: 'none', border: 'none', color: isApplied ? C.green : C.blue, fontSize: 12, cursor: 'pointer', padding: 0 }}>
                            {isApplied ? 'Ver' : 'Aplicar'}
                          </button>
                        </div>
                      );
                    }
                    return (
                      <button onClick={() => setEnvelopeLinkFor(b.category)} style={{ marginTop: 8, background: 'none', border: 'none', color: C.textTertiary, fontSize: 12, cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                        + Vincular a meta ou dívida
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', fontSize: 13, color: C.textSecondary }}>
              <span>Gasto: <strong style={{ color: C.textPrimary }}>{hide ? '••' : formatBRL(totalEnvSpent)}</strong></span>
              <span>Total reservado: <strong style={{ color: C.blue }}>{hide ? '••' : formatBRL(totalEnv)}</strong></span>
            </div>
          </>
        )}
      </Section>

      {unbudgeted.length > 0 && (
        <Section title="Adicionar envelope">
          <div style={{ background: C.card, borderRadius: 14, overflow: 'hidden' }}>
            {unbudgeted.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setEnvelopeInput(c)}
                className="mf-press"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', width: '100%',
                  background: 'transparent', border: 'none', color: C.textPrimary, cursor: 'pointer', textAlign: 'left',
                  borderTop: i === 0 ? 'none' : `0.5px solid ${C.separator}`,
                }}
              >
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <span style={{ flex: 1, fontSize: 15 }}>{c.name}</span>
                <Plus size={18} color={C.blue} />
              </button>
            ))}
          </div>
        </Section>
      )}

      {envelopeInput && (
        <EnvelopeInputModal
          category={envelopeInput}
          mk={mk}
          onSave={(v) => setBudget(envelopeInput.id, v)}
          onClose={() => setEnvelopeInput(null)}
        />
      )}

      {envelopeLinkFor && (
        <EnvelopeLinkModal
          category={envelopeLinkFor}
          data={data}
          mk={mk}
          updateData={updateData}
          showToast={showToast}
          onClose={() => setEnvelopeLinkFor(null)}
        />
      )}
    </div>
  );
}

// =====================================================
// GOALS & DEBTS VIEW
// =====================================================
function GoalsDebtsView({ data, updateData, onOpenModal, showToast }) {
  const [tab, setTab] = useState('goals');
  const hide = data.settings.hideBalances;

  return (
    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 4, background: C.card, borderRadius: 10, padding: 4 }}>
        {[{ id: 'goals', label: 'Metas' }, { id: 'debts', label: 'Dívidas' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px 0', borderRadius: 7, fontSize: 14, fontWeight: 600,
            background: tab === t.id ? C.cardElevated : 'transparent',
            color: tab === t.id ? C.textPrimary : C.textSecondary,
            border: 'none', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'goals' && (
        <>
          {data.goals.filter(g => !g.parentId).length === 0 ? (
            <EmptyState
              icon={<Target size={32} color={C.blue} />}
              title="Nenhuma meta ainda"
              text="Crie metas para acompanhar progresso."
              actionLabel="Nova meta"
              onAction={() => onOpenModal({ type: 'edit-goal', payload: null })}
            />
          ) : (
            <>
              {data.goals.filter(g => !g.parentId).map(g => {
                const subs = data.goals.filter(x => x.parentId === g.id);
                return (
                  <div key={g.id}>
                    <GoalCard goal={g} hide={hide} onClick={() => onOpenModal({ type: 'edit-goal', payload: g })} />
                    {subs.length > 0 && (
                      <div style={{ marginLeft: 16, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {subs.map(s => <GoalCard key={s.id} goal={s} hide={hide} onClick={() => onOpenModal({ type: 'edit-goal', payload: s })} />)}
                      </div>
                    )}
                  </div>
                );
              })}
              <button
                onClick={() => onOpenModal({ type: 'edit-goal', payload: null })}
                className="mf-press"
                style={addBtnStyle}
              >
                <Plus size={18} /> Nova meta
              </button>
            </>
          )}
        </>
      )}

      {tab === 'debts' && (
        <>
          {data.debts.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={32} color={C.orange} />}
              title="Sem dívidas registradas"
              text="Cadastre dívidas para acompanhar quitação."
              actionLabel="Nova dívida"
              onAction={() => onOpenModal({ type: 'edit-debt', payload: null })}
            />
          ) : (
            <>
              {data.debts.map(d => (
                <DebtCard key={d.id} debt={d} hide={hide} onClick={() => onOpenModal({ type: 'edit-debt', payload: d })} />
              ))}
              <button
                onClick={() => onOpenModal({ type: 'edit-debt', payload: null })}
                className="mf-press"
                style={addBtnStyle}
              >
                <Plus size={18} /> Nova dívida
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

const addBtnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '14px 16px', borderRadius: 14, background: C.card, color: C.blue,
  border: `1px dashed ${C.separatorOpaque}`, cursor: 'pointer', fontSize: 15, fontWeight: 600,
  width: '100%',
};

function EmptyState({ icon, title, text, actionLabel, onAction }) {
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: C.cardElevated,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 4, lineHeight: 1.5 }}>{text}</div>
      {actionLabel && (
        <button onClick={onAction} style={{
          marginTop: 18, background: C.blue, color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>{actionLabel}</button>
      )}
    </div>
  );
}

// =====================================================
// PLANNING VIEW (acessível via Settings/Mais → Planejamento)
// =====================================================
function PlanningView({ data, mk, updateData, onOpenModal, showToast }) {
  const entries = getMonthEntries(data, mk);
  const incomes = entries.filter(e => e.type === 'income').sort((a,b) => (a.date||'').localeCompare(b.date||''));
  const expenses = entries.filter(e => e.type === 'expense');
  const summary = computeMonthSummary(data, mk);
  const hide = data.settings.hideBalances;

  return (
    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="mf-card" style={{ background: C.card, borderRadius: 16, padding: '16px 16px' }}>
        <div style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>Planejamento do mês</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 2, letterSpacing: '-0.02em', color: summary.expectedSurplus >= 0 ? C.textPrimary : C.red }}>
          {hide ? '••••' : formatBRL(summary.expectedSurplus)}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, fontSize: 12 }}>
          <span style={{ color: C.textSecondary }}>Receitas: <strong style={{ color: C.green }}>{hide ? '••' : formatBRL(summary.totalIncome)}</strong></span>
          <span style={{ color: C.textSecondary }}>Despesas: <strong style={{ color: C.red }}>{hide ? '••' : formatBRL(summary.totalExpense)}</strong></span>
        </div>
      </div>

      <Section title="Entradas do mês">
        {incomes.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 14, padding: 20, textAlign: 'center', color: C.textSecondary, fontSize: 14 }}>
            Nenhuma receita prevista neste mês.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {incomes.map(inc => {
              // commitment: simplified — split obligations equally? Just show the income card with total income amount
              const day = inc.date ? new Date(inc.date+'T00:00:00').getDate() : null;
              return (
                <div key={inc.id} style={{ background: C.card, borderRadius: 14, padding: '14px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{inc.name}</div>
                      <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
                        {day ? `Dia ${day}` : 'Sem data'} · {(inc.status === 'received' || inc.status === 'paid') ? 'Recebido' : 'A receber'}
                      </div>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: C.green }}>
                      {hide ? '••' : formatBRL(inc.amount)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Pagamentos obrigatórios (recorrências)">
        {(() => {
          const recOccurrences = entries.filter(e => e.__recurrence && e.type === 'expense');
          if (recOccurrences.length === 0) {
            return <div style={{ background: C.card, borderRadius: 14, padding: 20, textAlign: 'center', color: C.textSecondary, fontSize: 14 }}>Nenhum pagamento recorrente.</div>;
          }
          return (
            <div style={{ background: C.card, borderRadius: 14, overflow: 'hidden' }}>
              {recOccurrences.map((e, i) => (
                <TransactionRow
                  key={e.id} entry={e} data={data}
                  isFirst={i === 0} isLast={i === recOccurrences.length - 1}
                  onTogglePaid={() => togglePaidStatus(e, data, updateData, showToast)}
                  onClick={() => onOpenModal({ type: 'edit-transaction', payload: e })}
                />
              ))}
            </div>
          );
        })()}
      </Section>

      <Section title="Sobra do mês anterior">
        <PreviousMonthClosing data={data} mk={mk} updateData={updateData} showToast={showToast} />
      </Section>
    </div>
  );
}

function PreviousMonthClosing({ data, mk, updateData, showToast }) {
  const d = parseMonthKey(mk);
  d.setMonth(d.getMonth() - 1);
  const prevMk = monthKey(d);
  const prevSummary = computeMonthSummary(data, prevMk);
  const closing = data.monthClosings[prevMk];
  const hide = data.settings.hideBalances;

  const setAllocation = (allocation) => {
    updateData(dt => ({
      ...dt,
      monthClosings: {
        ...dt.monthClosings,
        [prevMk]: { surplus: prevSummary.currentSurplus, allocation }
      }
    }));
    showToast('Sobra alocada', 'success');
  };

  return (
    <div style={{ background: C.card, borderRadius: 14, padding: '16px 16px' }}>
      <div style={{ fontSize: 13, color: C.textSecondary }}>{monthLabel(d)}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em', color: prevSummary.currentSurplus >= 0 ? C.green : C.red }}>
        {hide ? '••••' : formatBRL(prevSummary.currentSurplus)}
      </div>
      <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>
        Sobra atual baseada em recebido − pago.
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AllocationOption
          label="Trazer para o mês atual" active={closing?.allocation === 'next-month'}
          onClick={() => setAllocation('next-month')}
        />
        <AllocationOption
          label="Manter separada" active={!closing || closing.allocation === 'separate'}
          onClick={() => setAllocation('separate')}
        />
      </div>
    </div>
  );
}

function AllocationOption({ label, active, onClick }) {
  return (
    <button onClick={onClick} className="mf-press" style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
      background: active ? C.blueDim : C.cardElevated,
      border: `1px solid ${active ? C.blue : 'transparent'}`,
      borderRadius: 10, color: C.textPrimary, cursor: 'pointer',
      fontSize: 14, fontWeight: 500, width: '100%', textAlign: 'left',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 9, border: `1.5px solid ${active ? C.blue : C.textTertiary}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <div style={{ width: 8, height: 8, borderRadius: 4, background: C.blue }} />}
      </div>
      {label}
    </button>
  );
}

// =====================================================
// SETTINGS VIEW
// =====================================================
function SettingsView({ data, updateData, setData, showToast, openModal }) {
  const [showPlanning, setShowPlanning] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showRecurrences, setShowRecurrences] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmExample, setConfirmExample] = useState(false);
  const fileInputRef = useRef(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `financial-math-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado', 'success');
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json || typeof json !== 'object') throw new Error();
        json.settings = { ...EMPTY_DATA().settings, ...(json.settings || {}), onboarded: true };
        setData(json);
        showToast('Backup importado', 'success');
      } catch {
        showToast('Arquivo inválido', 'error');
      }
    };
    reader.readAsText(file);
  };

  const doReset = () => {
    const e = EMPTY_DATA(); e.settings.onboarded = true;
    setData(e);
    showToast('Todos os dados apagados');
  };

  const doLoadExample = () => {
    setData(EXAMPLE_DATA());
    showToast('Dados de exemplo carregados', 'success');
  };

  if (showPlanning) {
    return <>
      <BackHeader title="Planejamento mensal" onBack={() => setShowPlanning(false)} />
      <PlanningSubView data={data} updateData={updateData} showToast={showToast} />
    </>;
  }
  if (showCategories) {
    return <>
      <BackHeader title="Categorias" onBack={() => setShowCategories(false)} />
      <CategoriesEditor data={data} updateData={updateData} showToast={showToast} />
    </>;
  }
  if (showRecurrences) {
    return <>
      <BackHeader title="Recorrências" onBack={() => setShowRecurrences(false)} />
      <RecurrencesEditor data={data} updateData={updateData} showToast={showToast} openModal={openModal} />
    </>;
  }

  return (
    <>
      <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Section title="Gestão">
          <div style={{ background: C.card, borderRadius: 14, overflow: 'hidden' }}>
            <SettingRow Icon={Calendar} label="Planejamento mensal" onClick={() => setShowPlanning(true)} />
            <SettingRow Icon={Tag} label="Categorias e subcategorias" onClick={() => setShowCategories(true)} />
            <SettingRow Icon={Repeat} label="Recorrências" onClick={() => setShowRecurrences(true)} isLast />
          </div>
        </Section>

        <Section title="Dados">
          <div style={{ background: C.card, borderRadius: 14, overflow: 'hidden' }}>
            <SettingRow Icon={FileDown} label="Exportar backup" onClick={exportData} />
            <SettingRow Icon={FileUp} label="Importar backup" onClick={() => fileInputRef.current?.click()} />
            <SettingRow Icon={Sparkles} label="Carregar dados de exemplo" onClick={() => setConfirmExample(true)} />
            <SettingRow Icon={RotateCcw} label="Apagar todos os dados" onClick={() => setConfirmReset(true)} danger isLast />
          </div>
          <input
            ref={fileInputRef} type="file" accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
          />
        </Section>

        <div style={{ textAlign: 'center', color: C.textTertiary, fontSize: 12, padding: '8px 20px 24px', lineHeight: 1.8 }}>
          Financial Math · Rian Queiroz
        </div>
      </div>

      {confirmReset && (
        <ConfirmModal
          title="Apagar todos os dados"
          message="Essa ação apaga tudo permanentemente e não pode ser desfeita: lançamentos, recorrências, envelopes, metas, dívidas e configurações."
          confirmLabel="Apagar tudo"
          danger
          onConfirm={doReset}
          onClose={() => setConfirmReset(false)}
        />
      )}

      {confirmExample && (
        <ConfirmModal
          title="Carregar dados de exemplo"
          message="Seus dados atuais serão substituídos pelos dados de exemplo."
          confirmLabel="Carregar exemplo"
          onConfirm={doLoadExample}
          onClose={() => setConfirmExample(false)}
        />
      )}
    </>
  );
}

function SettingRow({ Icon, label, onClick, danger, isLast }) {
  return (
    <button onClick={onClick} className="mf-press" style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', width: '100%',
      background: 'transparent', border: 'none', color: danger ? C.red : C.textPrimary,
      cursor: 'pointer', textAlign: 'left',
      borderTop: isLast === undefined ? `0.5px solid ${C.separator}` : (isLast ? `0.5px solid ${C.separator}` : `0.5px solid ${C.separator}`),
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: danger ? C.redDim : C.cardElevated,
        color: danger ? C.red : C.textPrimary,
      }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, fontSize: 15 }}>{label}</div>
      <ChevronRight size={16} color={C.textTertiary} />
    </button>
  );
}

function BackHeader({ title, onBack }) {
  return (
    <div style={{ paddingTop: 16, marginBottom: 8 }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 4, background: 'transparent',
        border: 'none', color: C.blue, fontSize: 16, cursor: 'pointer', padding: '4px 0',
      }}>
        <ChevronLeft size={20} /> Voltar
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0 0', letterSpacing: '-0.02em' }}>{title}</h1>
    </div>
  );
}

function PlanningSubView({ data, updateData, showToast }) {
  const [mk, setMk] = useState(monthKey(new Date()));
  const onOpenModal = () => {};
  return <PlanningView data={data} mk={mk} updateData={updateData} onOpenModal={onOpenModal} showToast={showToast} />;
}

// =====================================================
// ENVELOPE LINK MODAL
// =====================================================
function EnvelopeLinkModal({ category, data, mk, onClose, updateData, showToast }) {
  const link = (data.envelopeLinks || {})[category.id];
  const [type, setType] = useState(link?.type || 'none');
  const [targetId, setTargetId] = useState(link?.targetId || '');

  const goals = data.goals.filter(g => !g.parentId);
  const debts = data.debts;

  const save = () => {
    updateData(d => ({
      ...d,
      envelopeLinks: {
        ...(d.envelopeLinks || {}),
        [category.id]: type === 'none' ? null : { type, targetId },
      }
    }));
    showToast(type === 'none' ? 'Vínculo removido' : 'Vínculo salvo', 'success');
    onClose();
  };

  const applyNow = () => {
    const applyKey = `${category.id}_${mk}`;
    if ((data.envelopeLinkApplied || {})[applyKey]) {
      showToast('Já aplicado neste mês', 'error');
      onClose();
      return;
    }
    const amount = (data.budgets[mk] || {})[category.id] || 0;
    if (amount <= 0) { showToast('Defina um valor para o envelope primeiro', 'error'); return; }

    updateData(d => {
      let newData = { ...d, envelopeLinkApplied: { ...(d.envelopeLinkApplied || {}), [applyKey]: true } };
      if (type === 'goal' && targetId) {
        newData = { ...newData, goals: newData.goals.map(g => g.id === targetId ? {
          ...g, contributions: [...(g.contributions || []), { id: uid(), date: todayKey(), amount, note: `Envelope ${category.name} — ${monthShort(parseMonthKey(mk))}` }]
        } : g) };
      } else if (type === 'debt' && targetId) {
        newData = { ...newData, debts: newData.debts.map(x => x.id === targetId ? {
          ...x, payments: [...(x.payments || []), { id: uid(), date: todayKey(), amount, note: `Envelope ${category.name} — ${monthShort(parseMonthKey(mk))}` }]
        } : x) };
      }
      return newData;
    });
    showToast(`${formatBRL(amount)} aplicado com sucesso`, 'success');
    onClose();
  };

  const currentLink = (data.envelopeLinks || {})[category.id];
  const isApplied = !!(data.envelopeLinkApplied || {})[`${category.id}_${mk}`];

  return (
    <ActionSheet title={`Vincular — ${category.name}`} onClose={onClose}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.textTertiary, fontWeight: 600, marginBottom: 8 }}>VINCULAR A</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { id: 'none', label: 'Nenhum vínculo' },
            { id: 'goal', label: '🎯 Meta' },
            { id: 'debt', label: '💳 Dívida' },
          ].map(opt => (
            <button key={opt.id} onClick={() => { setType(opt.id); setTargetId(''); }} style={{
              padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
              background: type === opt.id ? C.blueDim : C.cardElevated,
              color: type === opt.id ? C.blue : C.textPrimary,
              fontSize: 15, fontWeight: type === opt.id ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${type === opt.id ? C.blue : C.textTertiary}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {type === opt.id && <div style={{ width: 8, height: 8, borderRadius: 4, background: C.blue }} />}
              </div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {type === 'goal' && goals.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.textTertiary, fontWeight: 600, marginBottom: 8 }}>QUAL META</div>
          <select value={targetId} onChange={e => setTargetId(e.target.value)} style={{ width: '100%', background: C.bg, color: C.textPrimary, border: `1px solid ${C.separator}`, borderRadius: 10, padding: '12px 14px', fontSize: 15 }}>
            <option value="">Selecione uma meta</option>
            {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}

      {type === 'debt' && debts.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.textTertiary, fontWeight: 600, marginBottom: 8 }}>QUAL DÍVIDA</div>
          <select value={targetId} onChange={e => setTargetId(e.target.value)} style={{ width: '100%', background: C.bg, color: C.textPrimary, border: `1px solid ${C.separator}`, borderRadius: 10, padding: '12px 14px', fontSize: 15 }}>
            <option value="">Selecione uma dívida</option>
            {debts.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
      )}

      <button onClick={save} style={{ width: '100%', padding: '15px', background: C.blue, border: 'none', color: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
        Salvar vínculo
      </button>

      {/* Apply now button — only shows when there's an active link and not yet applied this month */}
      {currentLink && currentLink.type !== 'none' && currentLink.targetId && !isApplied && (
        <button onClick={applyNow} style={{
          width: '100%', padding: '13px', background: C.greenDim, border: 'none',
          color: C.green, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10,
        }}>
          ✓ Aplicar ao {currentLink.type === 'goal' ? 'meta' : 'dívida'} agora ({monthShort(parseMonthKey(mk))})
        </button>
      )}
      {currentLink && currentLink.type !== 'none' && currentLink.targetId && isApplied && (
        <div style={{ textAlign: 'center', fontSize: 13, color: C.green, padding: '8px 0' }}>
          ✓ Já aplicado em {monthShort(parseMonthKey(mk))}
        </div>
      )}

      <button onClick={onClose} style={{ width: '100%', padding: '13px', background: 'transparent', border: 'none', color: C.textSecondary, fontSize: 15, cursor: 'pointer' }}>
        Cancelar
      </button>
    </ActionSheet>
  );
}

// =====================================================
// ACTION SHEET (mobile-safe overlay from bottom)
// =====================================================
function ActionSheet({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'overlay-in 0.2s ease',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 540,
        background: C.card, borderRadius: '20px 20px 0 0',
        padding: '12px 20px 40px',
        animation: 'modal-in 0.25s ease-out',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 36, height: 4, background: C.separatorOpaque, borderRadius: 2 }} />
        </div>
        {title && (
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textTertiary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16, textAlign: 'center' }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function ActionSheetButton({ label, icon, color, onClick, separator }) {
  return (
    <>
      {separator && <div style={{ height: 0.5, background: C.separator, margin: '4px 0' }} />}
      <button onClick={onClick} style={{
        width: '100%', textAlign: 'left', padding: '15px 16px',
        background: C.cardElevated, border: 'none',
        color: color || C.textPrimary, fontSize: 16,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
        borderRadius: 12, marginBottom: 8,
      }}>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        {label}
      </button>
    </>
  );
}

// =====================================================
// ENVELOPE INPUT MODAL
// =====================================================
function EnvelopeInputModal({ category, mk, onSave, onClose }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const submit = () => {
    const v = Number(String(value).replace(',', '.'));
    if (!v || v <= 0) return;
    onSave(v);
    onClose();
  };

  return (
    <ActionSheet title={`Envelope — ${category.name}`} onClose={onClose}>
      <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 12 }}>
        Define o limite de gasto para {monthShort(parseMonthKey(mk))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.bg, borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
        <span style={{ fontSize: 18, color: C.textSecondary, fontWeight: 700 }}>R$</span>
        <input
          ref={inputRef}
          type="number" inputMode="decimal" placeholder="0,00"
          value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: C.textPrimary, fontSize: 26, fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        />
      </div>
      <button onClick={submit} style={{
        width: '100%', padding: '16px', background: C.blue, border: 'none',
        color: '#fff', borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: 'pointer',
      }}>
        Salvar envelope
      </button>
      <button onClick={onClose} style={{
        width: '100%', padding: '13px', background: 'transparent', border: 'none',
        color: C.textSecondary, fontSize: 15, cursor: 'pointer', marginTop: 8,
      }}>
        Cancelar
      </button>
    </ActionSheet>
  );
}

// =====================================================
// SUBCATEGORY INPUT MODAL
// =====================================================
function SubcategoryInputModal({ catName, onSave, onClose }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  return (
    <ActionSheet title={`Nova subcategoria — ${catName}`} onClose={onClose}>
      <input
        ref={inputRef} type="text" placeholder="Nome da subcategoria"
        value={value} onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value.trim() && (onSave(value.trim()), onClose())}
        style={{
          width: '100%', background: C.bg, border: 'none', borderRadius: 12,
          color: C.textPrimary, fontSize: 17, padding: '14px 16px', marginBottom: 16,
          boxSizing: 'border-box',
        }}
      />
      <button onClick={() => { if (value.trim()) { onSave(value.trim()); onClose(); } }} style={{
        width: '100%', padding: '16px', background: C.blue, border: 'none',
        color: '#fff', borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: 'pointer',
      }}>
        Adicionar
      </button>
      <button onClick={onClose} style={{
        width: '100%', padding: '13px', background: 'transparent', border: 'none',
        color: C.textSecondary, fontSize: 15, cursor: 'pointer', marginTop: 8,
      }}>
        Cancelar
      </button>
    </ActionSheet>
  );
}

// =====================================================
// CONFIRM MODAL
// =====================================================
function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose, danger }) {
  return (
    <ActionSheet title={title} onClose={onClose}>
      {message && <div style={{ fontSize: 15, color: C.textSecondary, marginBottom: 20, textAlign: 'center', lineHeight: 1.5 }}>{message}</div>}
      <button onClick={() => { onConfirm(); onClose(); }} style={{
        width: '100%', padding: '16px', background: danger ? C.red : C.blue, border: 'none',
        color: '#fff', borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: 'pointer', marginBottom: 10,
      }}>
        {confirmLabel || 'Confirmar'}
      </button>
      <button onClick={onClose} style={{
        width: '100%', padding: '13px', background: C.cardElevated, border: 'none',
        color: C.textSecondary, fontSize: 15, cursor: 'pointer', borderRadius: 12,
      }}>
        Cancelar
      </button>
    </ActionSheet>
  );
}

// =====================================================
// NEW CATEGORY FORM (inline, no prompt)
// =====================================================
function NewCategoryForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [budgetType, setBudgetType] = useState('envelope');
  const [icon, setIcon] = useState('📂');

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), type, budgetType, icon);
    setName(''); setIcon('📂'); setType('expense'); setBudgetType('envelope');
    setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mf-press" style={addBtnStyle}>
        <Plus size={18} /> Nova categoria
      </button>
    );
  }

  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nova categoria</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text" value={icon} onChange={e => setIcon(e.target.value.slice(0,2))}
          maxLength={2}
          style={{ width: 44, textAlign: 'center', background: C.cardElevated, border: 'none', borderRadius: 8, fontSize: 20, padding: '8px 4px', color: '#fff' }}
        />
        <input
          autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="Nome da categoria"
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ flex: 1, background: C.cardElevated, border: 'none', borderRadius: 8, padding: '8px 12px', color: C.textPrimary, fontSize: 15 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <select value={type} onChange={e => setType(e.target.value)} style={{ flex: 1, background: C.cardElevated, color: C.textSecondary, border: 'none', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}>
          <option value="expense">Saída</option>
          <option value="income">Entrada</option>
          <option value="both">Ambos</option>
        </select>
        {(type === 'expense' || type === 'both') && (
          <select value={budgetType} onChange={e => setBudgetType(e.target.value)} style={{ flex: 1, background: C.cardElevated, color: C.textSecondary, border: 'none', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}>
            <option value="envelope">Envelope</option>
            <option value="fixed">Fixa</option>
          </select>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '10px', background: C.cardElevated, border: 'none', color: C.textSecondary, borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
        <button onClick={submit} style={{ flex: 1, padding: '10px', background: C.blue, border: 'none', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Criar</button>
      </div>
    </div>
  );
}

// =====================================================
// CATEGORIES EDITOR
// =====================================================
function CategoriesEditor({ data, updateData, showToast }) {
  const [expanded, setExpanded] = useState({});
  const [catSheet, setCatSheet] = useState(null); // category object
  const [subInputFor, setSubInputFor] = useState(null); // category object
  const [confirmDelete, setConfirmDelete] = useState(null); // category id

  const addCategory = (name, type, budgetType, icon) => {
    if (!name.trim()) return;
    const id = `cat-${uid()}`;
    updateData(d => ({ ...d, categories: [...d.categories, { id, name: name.trim(), type, budgetType: budgetType || (type === 'expense' ? 'envelope' : undefined), icon: icon || '📂', subcategories: [] }] }));
    showToast('Categoria criada', 'success');
  };
  const updateCategory = (id, patch) => {
    updateData(d => ({ ...d, categories: d.categories.map(c => c.id === id ? { ...c, ...patch } : c) }));
  };
  const removeCategory = (id) => {
    updateData(d => ({ ...d, categories: d.categories.filter(c => c.id !== id) }));
    showToast('Categoria removida');
    setCatSheet(null);
  };
  const addSub = (catId, name) => {
    if (!name.trim()) return;
    const sid = `sub-${uid()}`;
    updateData(d => ({
      ...d,
      categories: d.categories.map(c => c.id === catId ? { ...c, subcategories: [...(c.subcategories||[]), { id: sid, name: name.trim() }] } : c)
    }));
  };
  const updateSub = (catId, subId, name) => {
    updateData(d => ({
      ...d,
      categories: d.categories.map(c => c.id === catId ? {
        ...c, subcategories: c.subcategories.map(s => s.id === subId ? { ...s, name } : s)
      } : c)
    }));
  };
  const removeSub = (catId, subId) => {
    updateData(d => ({
      ...d,
      categories: d.categories.map(c => c.id === catId ? {
        ...c, subcategories: c.subcategories.filter(s => s.id !== subId)
      } : c)
    }));
  };

  return (
    <>
      <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.categories.map(c => {
          const isExpanded = expanded[c.id];
          return (
            <div key={c.id} style={{ background: C.card, borderRadius: 14 }}>
              {/* ── Row principal ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                <input
                  type="text" value={c.icon || ''}
                  onChange={(e) => updateCategory(c.id, { icon: e.target.value.slice(0, 2) })}
                  maxLength={2}
                  style={{ width: 38, height: 38, padding: 0, textAlign: 'center', background: C.cardElevated, border: 'none', borderRadius: 8, fontSize: 20, color: '#fff', flexShrink: 0 }}
                />
                <input
                  type="text" value={c.name}
                  onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                  style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', color: C.textPrimary, fontSize: 15, fontWeight: 500 }}
                />
                <button
                  onClick={() => setExpanded(s => ({ ...s, [c.id]: !s[c.id] }))}
                  style={{ background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer', padding: 6, display: 'flex', flexShrink: 0 }}
                >
                  {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18} />}
                </button>
                <button
                  onClick={() => setCatSheet(c)}
                  style={{ background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer', padding: 6, display: 'flex', flexShrink: 0 }}
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Tags */}
              <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: c.type === 'income' ? C.greenDim : C.blueDim, color: c.type === 'income' ? C.green : C.blue }}>
                  {c.type === 'income' ? 'Entrada' : c.type === 'both' ? 'Entrada/Saída' : 'Saída'}
                </span>
                {(c.type === 'expense' || c.type === 'both') && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: C.cardElevated, color: C.textSecondary }}>
                    {c.budgetType === 'fixed' ? 'Fixa' : 'Envelope'}
                  </span>
                )}
              </div>

              {/* Subcategorias */}
              {isExpanded && (
                <div style={{ padding: '0 14px 14px', borderTop: `0.5px solid ${C.separator}` }}>
                  <div style={{ fontSize: 12, color: C.textSecondary, fontWeight: 600, padding: '10px 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Subcategorias
                  </div>
                  {(c.subcategories || []).map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                      <input
                        type="text" value={s.name}
                        onChange={(e) => updateSub(c.id, s.id, e.target.value)}
                        style={{ flex: 1, background: C.cardElevated, border: 'none', color: C.textPrimary, fontSize: 14, padding: '8px 10px', borderRadius: 8 }}
                      />
                      <button onClick={() => removeSub(c.id, s.id)} style={{ background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer', padding: 6, display: 'flex' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSubInputFor(c)}
                    style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: C.blue, cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '6px 0' }}
                  >
                    <Plus size={14} /> Nova subcategoria
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <NewCategoryForm onAdd={addCategory} />
      </div>

      {/* ActionSheet do ⋯ */}
      {catSheet && (
        <ActionSheet title={catSheet.name} onClose={() => setCatSheet(null)}>
          {/* Tipo */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: C.textTertiary, marginBottom: 6, fontWeight: 600 }}>TIPO</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['expense', 'income', 'both'].map(t => (
                <button key={t} onClick={() => updateCategory(catSheet.id, { type: t })} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: catSheet.type === t ? C.blue : C.cardElevated,
                  color: catSheet.type === t ? '#fff' : C.textSecondary,
                }}>
                  {t === 'expense' ? 'Saída' : t === 'income' ? 'Entrada' : 'Ambos'}
                </button>
              ))}
            </div>
          </div>
          {/* Orçamento */}
          {(catSheet.type === 'expense' || catSheet.type === 'both') && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.textTertiary, marginBottom: 6, fontWeight: 600 }}>ORÇAMENTO</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['envelope', 'fixed'].map(bt => (
                  <button key={bt} onClick={() => updateCategory(catSheet.id, { budgetType: bt })} style={{
                    flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: (catSheet.budgetType || 'envelope') === bt ? C.blue : C.cardElevated,
                    color: (catSheet.budgetType || 'envelope') === bt ? '#fff' : C.textSecondary,
                  }}>
                    {bt === 'envelope' ? 'Envelope' : 'Fixa'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ height: 0.5, background: C.separator, margin: '4px 0 12px' }} />
          <button onClick={() => { setConfirmDelete(catSheet.id); setCatSheet(null); }} style={{
            width: '100%', padding: '15px', background: C.redDim, border: 'none',
            color: C.red, borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Trash2 size={16} /> Excluir categoria
          </button>
          <button onClick={() => setCatSheet(null)} style={{
            width: '100%', padding: '13px', background: 'transparent', border: 'none',
            color: C.textSecondary, fontSize: 15, cursor: 'pointer', marginTop: 8,
          }}>
            Fechar
          </button>
        </ActionSheet>
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <ConfirmModal
          title="Excluir categoria"
          message="Lançamentos com essa categoria ficarão sem categoria."
          confirmLabel="Excluir"
          danger
          onConfirm={() => removeCategory(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {/* Nova subcategoria */}
      {subInputFor && (
        <SubcategoryInputModal
          catName={subInputFor.name}
          onSave={(name) => addSub(subInputFor.id, name)}
          onClose={() => setSubInputFor(null)}
        />
      )}
    </>
  );
}

// =====================================================
// RECURRENCES EDITOR
// =====================================================
function RecurrencesEditor({ data, updateData, showToast, openModal }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <>
      <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.recurrences.length === 0 ? (
          <EmptyState
            icon={<Repeat size={32} color={C.blue} />}
            title="Nenhuma recorrência"
            text="Crie recorrências em 'Novo lançamento' → 'Recorrência'."
          />
        ) : data.recurrences.map(r => {
          const cat = data.categories.find(c => c.id === r.categoryId);
          return (
            <div key={r.id} style={{ background: C.card, borderRadius: 14, padding: '14px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Repeat size={14} color={r.type === 'income' ? C.green : C.blue} />
                  <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: r.type === 'income' ? C.green : C.textPrimary, whiteSpace: 'nowrap' }}>
                  {formatBRL(r.amount)}
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>
                Dia {r.dayOfMonth} · {cat?.name || '—'} · {monthShort(parseMonthKey(r.startMonth))} {r.endMonth ? `→ ${monthShort(parseMonthKey(r.endMonth))}` : '→ sem fim'}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => openModal({ type: 'edit-recurrence', payload: r })}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: C.cardElevated, color: C.textPrimary, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  Editar
                </button>
                <button
                  onClick={() => setConfirmDelete(r.id)}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: C.redDim, color: C.red, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {confirmDelete && (
        <ConfirmModal
          title="Excluir recorrência"
          message="Ocorrências passadas marcadas como pagas serão mantidas."
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            updateData(d => ({ ...d, recurrences: d.recurrences.filter(x => x.id !== confirmDelete) }));
            showToast('Recorrência excluída');
          }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}

// =====================================================
// MODAL ROOT
// =====================================================
function ModalRoot({ modal, close, data, mk, currentMonth, updateData, showToast, openModal }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', animation: 'overlay-in 0.2s ease',
    }} onClick={close}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 540, background: C.bgElevated, borderRadius: '20px 20px 0 0',
        maxHeight: '92vh', overflowY: 'auto',
        animation: 'modal-in 0.25s ease-out',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'center', padding: '8px 0 4px',
        }}>
          <div style={{ width: 36, height: 4, background: C.separatorOpaque, borderRadius: 2 }} />
        </div>
        <ModalContent
          modal={modal} close={close} data={data} mk={mk} currentMonth={currentMonth}
          updateData={updateData} showToast={showToast} openModal={openModal}
        />
      </div>
    </div>
  );
}

function ModalContent({ modal, close, data, mk, currentMonth, updateData, showToast, openModal }) {
  if (modal.type === 'new-transaction-picker') {
    return (
      <div style={{ padding: '8px 20px 24px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, padding: '12px 0 18px', letterSpacing: '-0.02em' }}>Novo lançamento</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PickerOption
            color={C.green} Icon={ArrowDown} title="Receita" subtitle="Algo que você recebeu ou vai receber"
            onClick={() => openModal({ type: 'edit-transaction', payload: { type: 'income' } })}
          />
          <PickerOption
            color={C.blue} Icon={ArrowUp} title="Despesa" subtitle="Algo que você pagou ou vai pagar"
            onClick={() => openModal({ type: 'edit-transaction', payload: { type: 'expense' } })}
          />
          <PickerOption
            color={C.purple} Icon={Repeat} title="Recorrência" subtitle="Algo que se repete todo mês"
            onClick={() => openModal({ type: 'edit-recurrence', payload: null })}
          />
        </div>
      </div>
    );
  }
  if (modal.type === 'edit-transaction') {
    return <TransactionForm
      transaction={modal.payload} data={data} mk={mk} currentMonth={currentMonth}
      updateData={updateData} showToast={showToast} close={close}
    />;
  }
  if (modal.type === 'edit-recurrence') {
    return <RecurrenceForm
      recurrence={modal.payload} data={data} mk={mk}
      updateData={updateData} showToast={showToast} close={close}
    />;
  }
  if (modal.type === 'edit-goal') {
    return <GoalForm
      goal={modal.payload} data={data}
      updateData={updateData} showToast={showToast} close={close}
    />;
  }
  if (modal.type === 'edit-debt') {
    return <DebtForm
      debt={modal.payload} data={data}
      updateData={updateData} showToast={showToast} close={close}
    />;
  }
  return null;
}

function PickerOption({ color, Icon, title, subtitle, onClick }) {
  return (
    <button onClick={onClick} className="mf-press" style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 16px',
      background: C.card, border: 'none', borderRadius: 14, color: '#fff',
      cursor: 'pointer', textAlign: 'left', width: '100%',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: `${color}26`, color,
      }}>
        <Icon size={20} strokeWidth={2.4} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>{subtitle}</div>
      </div>
      <ChevronRight size={18} color={C.textTertiary} />
    </button>
  );
}

// =====================================================
// TRANSACTION FORM
// =====================================================
function TransactionForm({ transaction, data, mk, currentMonth, updateData, showToast, close }) {
  const isEdit = transaction && transaction.id && !transaction.__recurrence;
  const isRecurrenceOccurrence = transaction && transaction.__recurrence;
  const initialDate = transaction?.date || `${mk}-${String(new Date().getDate()).padStart(2,'0')}`;

  const [type, setType] = useState(transaction?.type || 'expense');
  const [name, setName] = useState(transaction?.name || '');
  const [amount, setAmount] = useState(transaction?.amount != null ? String(transaction.amount) : '');
  const [date, setDate] = useState(initialDate);
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || '');
  const [subcategoryId, setSubcategoryId] = useState(transaction?.subcategoryId || '');
  const [status, setStatus] = useState(transaction?.status || 'pending');
  const [notes, setNotes] = useState(transaction?.notes || '');
  const [showImpact, setShowImpact] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const cats = data.categories.filter(c => c.type === type || c.type === 'both');
  const cat = data.categories.find(c => c.id === categoryId);
  const subs = cat?.subcategories || [];

  const numericAmount = Number(String(amount).replace(',', '.')) || 0;

  // simulate impact
  const summary = useMemo(() => computeMonthSummary(data, mk), [data, mk]);
  const budgetForCat = (data.budgets[mk] || {})[categoryId] || 0;
  const currentSpentInCat = useMemo(() => {
    const entries = getMonthEntries(data, mk).filter(e => e.type === 'expense' && e.categoryId === categoryId);
    let s = entries.reduce((acc, e) => acc + (Number(e.amount)||0), 0);
    if (isEdit && transaction.type === 'expense' && transaction.categoryId === categoryId) {
      s -= Number(transaction.amount) || 0;
    }
    return s;
  }, [data, mk, categoryId]);

  const newExpectedSurplus = type === 'expense'
    ? summary.expectedSurplus - numericAmount + (isEdit && transaction.type === 'expense' ? Number(transaction.amount)||0 : 0)
    : summary.expectedSurplus + numericAmount - (isEdit && transaction.type === 'income' ? Number(transaction.amount)||0 : 0);

  const newBudgetUsage = type === 'expense' && budgetForCat > 0
    ? ((currentSpentInCat + numericAmount) / budgetForCat) * 100
    : null;

  const save = () => {
    if (!name.trim()) { showToast('Informe um nome', 'error'); return; }
    if (numericAmount <= 0) { showToast('Informe um valor', 'error'); return; }

    if (isRecurrenceOccurrence) {
      // Edit a single occurrence: store as override in recurrenceStatus
      updateData(d => ({
        ...d,
        recurrenceStatus: {
          ...d.recurrenceStatus,
          [transaction.id]: {
            ...(d.recurrenceStatus[transaction.id] || {}),
            paidAmount: numericAmount,
            status: status === 'paid' || status === 'received' ? (type === 'income' ? 'received' : 'paid') : null,
            paidDate: status === 'paid' || status === 'received' ? todayKey() : null,
          }
        }
      }));
      showToast('Ocorrência atualizada', 'success');
      close();
      return;
    }

    const payload = {
      id: transaction?.id || uid(),
      type, name: name.trim(), amount: numericAmount, date, categoryId, subcategoryId: subcategoryId || null,
      status: status === 'pending' ? 'pending' : (type === 'income' ? 'received' : 'paid'),
      notes,
    };
    updateData(d => {
      if (isEdit) return { ...d, transactions: d.transactions.map(t => t.id === payload.id ? payload : t) };
      return { ...d, transactions: [...d.transactions, payload] };
    });
    showToast(isEdit ? 'Lançamento atualizado' : 'Lançamento salvo', 'success');
    close();
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const remove = () => {
    if (isRecurrenceOccurrence) {
      showToast('Use a tela de Recorrências para excluir.', 'error');
      return;
    }
    if (!isEdit) return;
    setConfirmDelete(true);
  };

  const doRemove = () => {
    updateData(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== transaction.id) }));
    showToast('Lançamento excluído');
    close();
  };

  // amount focus impact
  useEffect(() => {
    if (type === 'expense' && numericAmount > 0 && categoryId) setShowImpact(true);
    else setShowImpact(false);
  }, [numericAmount, categoryId, type]);

  return (
    <div style={{ padding: '8px 20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 12px' }}>
        <button onClick={close} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 16, cursor: 'pointer', padding: 0 }}>Cancelar</button>
        <div style={{ fontSize: 17, fontWeight: 600 }}>{isEdit ? 'Editar' : isRecurrenceOccurrence ? 'Ocorrência' : 'Novo'}</div>
        <button onClick={save} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 16, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Salvar</button>
      </div>

      {!isRecurrenceOccurrence && (
        <div style={{ display: 'flex', background: C.card, borderRadius: 10, padding: 4, marginBottom: 16 }}>
          {[{ id: 'expense', label: 'Despesa', color: C.blue }, { id: 'income', label: 'Receita', color: C.green }].map(t => (
            <button key={t.id} onClick={() => { setType(t.id); setCategoryId(''); setSubcategoryId(''); }} style={{
              flex: 1, padding: '8px 0', borderRadius: 7, fontSize: 14, fontWeight: 600,
              background: type === t.id ? t.color : 'transparent',
              color: type === t.id ? '#fff' : C.textSecondary, border: 'none', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}>{t.label}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Nome">
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Mercado, Salário..."
            style={inputStyle()}
          />
        </Field>
        <Field label="Valor">
          <input
            type="text" inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
            placeholder="0,00"
            style={{ ...inputStyle(), fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
          />
        </Field>
        <Field label="Data">
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={inputStyle()}
          />
        </Field>
        <Field label="Categoria">
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(''); }} style={inputStyle()}>
            <option value="">Selecione</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </Field>
        {subs.length > 0 && (
          <Field label="Subcategoria">
            <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} style={inputStyle()}>
              <option value="">Nenhuma</option>
              {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'pending', label: type === 'income' ? 'A receber' : 'A pagar' },
            { id: 'paid', label: type === 'income' ? 'Recebido' : 'Pago' },
          ].map(s => (
            <button key={s.id} onClick={() => setStatus(s.id)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              background: status === s.id ? (type === 'income' ? C.green : C.blue) : C.card,
              color: status === s.id ? '#fff' : C.textSecondary,
              border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>{s.label}</button>
          ))}
        </div>

        {/* Impact simulation */}
        {showImpact && type === 'expense' && (
          <div style={{ background: C.card, borderRadius: 12, padding: '14px 14px', borderLeft: `3px solid ${C.blue}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 8 }}>
              <Info size={13} /> IMPACTO
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: C.textSecondary }}>Sobra prevista</span>
              <span style={{ color: C.textPrimary, fontWeight: 500 }}>
                {formatBRL(summary.expectedSurplus)} <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle', color: C.textTertiary }}/> <span style={{ color: newExpectedSurplus < 0 ? C.red : newExpectedSurplus < summary.expectedSurplus * 0.5 ? C.orange : C.green, fontWeight: 600 }}>{formatBRL(newExpectedSurplus)}</span>
              </span>
            </div>
            {budgetForCat > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: C.textSecondary }}>{cat?.name}</span>
                <span style={{ color: C.textPrimary, fontWeight: 500 }}>
                  {((currentSpentInCat / budgetForCat) * 100).toFixed(0)}% <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle', color: C.textTertiary }}/> <span style={{ color: newBudgetUsage > 100 ? C.red : newBudgetUsage > 85 ? C.orange : C.green, fontWeight: 600 }}>{newBudgetUsage.toFixed(0)}%</span>
                </span>
              </div>
            )}
          </div>
        )}

        {!showMore ? (
          <button onClick={() => setShowMore(true)} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '6px 0', textAlign: 'left' }}>
            Mais opções
          </button>
        ) : (
          <Field label="Observação">
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional"
              rows={2}
              style={{ ...inputStyle(), resize: 'vertical', minHeight: 60 }}
            />
          </Field>
        )}

        {(isEdit || isRecurrenceOccurrence) && !isRecurrenceOccurrence && (
          <button onClick={remove} style={{
            marginTop: 8, padding: '12px 16px', background: C.redDim, color: C.red,
            border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Excluir lançamento
          </button>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir lançamento"
          message="O lançamento será removido permanentemente."
          confirmLabel="Excluir"
          danger
          onConfirm={doRemove}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

const inputStyle = () => ({
  width: '100%', background: C.card, color: C.textPrimary, border: 'none',
  borderRadius: 10, padding: '12px 14px', fontSize: 16,
  fontFamily: fontStack,
});

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: C.textSecondary, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}

// =====================================================
// RECURRENCE FORM
// =====================================================
function RecurrenceForm({ recurrence, data, mk, updateData, showToast, close }) {
  const isEdit = !!recurrence;
  const [type, setType] = useState(recurrence?.type || 'expense');
  const [name, setName] = useState(recurrence?.name || '');
  const [amount, setAmount] = useState(recurrence?.amount != null ? String(recurrence.amount) : '');
  const [day, setDay] = useState(recurrence?.dayOfMonth || 1);
  const [categoryId, setCategoryId] = useState(recurrence?.categoryId || '');
  const [subcategoryId, setSubcategoryId] = useState(recurrence?.subcategoryId || '');
  const [startMonth, setStartMonth] = useState(recurrence?.startMonth || mk);
  const [endMonth, setEndMonth] = useState(recurrence?.endMonth || '');
  const [hasEnd, setHasEnd] = useState(!!recurrence?.endMonth);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cats = data.categories.filter(c => c.type === type || c.type === 'both');
  const cat = data.categories.find(c => c.id === categoryId);
  const subs = cat?.subcategories || [];

  const save = () => {
    if (!name.trim()) { showToast('Informe um nome', 'error'); return; }
    const numericAmount = Number(String(amount).replace(',', '.')) || 0;
    if (numericAmount <= 0) { showToast('Informe um valor', 'error'); return; }
    if (!categoryId) { showToast('Escolha uma categoria', 'error'); return; }
    const payload = {
      id: recurrence?.id || uid(),
      type, name: name.trim(), amount: numericAmount, dayOfMonth: Number(day) || 1,
      categoryId, subcategoryId: subcategoryId || null,
      startMonth, endMonth: hasEnd ? endMonth : null, notes: '',
    };
    updateData(d => {
      if (isEdit) return { ...d, recurrences: d.recurrences.map(r => r.id === payload.id ? payload : r) };
      return { ...d, recurrences: [...d.recurrences, payload] };
    });
    showToast(isEdit ? 'Recorrência atualizada' : 'Recorrência criada', 'success');
    close();
  };

  return (
    <div style={{ padding: '8px 20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 12px' }}>
        <button onClick={close} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 16, cursor: 'pointer', padding: 0 }}>Cancelar</button>
        <div style={{ fontSize: 17, fontWeight: 600 }}>{isEdit ? 'Editar recorrência' : 'Nova recorrência'}</div>
        <button onClick={save} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 16, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Salvar</button>
      </div>

      <div style={{ display: 'flex', background: C.card, borderRadius: 10, padding: 4, marginBottom: 16 }}>
        {[{ id: 'expense', label: 'Despesa', color: C.blue }, { id: 'income', label: 'Receita', color: C.green }].map(t => (
          <button key={t.id} onClick={() => { setType(t.id); setCategoryId(''); setSubcategoryId(''); }} style={{
            flex: 1, padding: '8px 0', borderRadius: 7, fontSize: 14, fontWeight: 600,
            background: type === t.id ? t.color : 'transparent',
            color: type === t.id ? '#fff' : C.textSecondary, border: 'none', cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Nome">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Aluguel, Salário..." style={inputStyle()} />
        </Field>
        <Field label="Valor">
          <input
            type="text" inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
            placeholder="0,00"
            style={{ ...inputStyle(), fontSize: 22, fontWeight: 700 }}
          />
        </Field>
        <Field label="Dia do mês (1-31)">
          <input
            type="number" min={1} max={31} value={day}
            onChange={(e) => setDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
            style={inputStyle()}
          />
        </Field>
        <Field label="Categoria">
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(''); }} style={inputStyle()}>
            <option value="">Selecione</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </Field>
        {subs.length > 0 && (
          <Field label="Subcategoria">
            <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} style={inputStyle()}>
              <option value="">Nenhuma</option>
              {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="Mês inicial">
          <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} style={inputStyle()} />
        </Field>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.textPrimary, cursor: 'pointer' }}>
            <input type="checkbox" checked={hasEnd} onChange={(e) => setHasEnd(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.blue }} />
            Tem mês final
          </label>
          {hasEnd && (
            <input type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} style={{ ...inputStyle(), marginTop: 8 }} />
          )}
        </div>

        {isEdit && (
          <button onClick={() => setConfirmDelete(true)} style={{
            marginTop: 8, padding: '12px 16px', background: C.redDim, color: C.red,
            border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Excluir recorrência
          </button>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir recorrência"
          message="Ocorrências futuras deixarão de aparecer. Histórico de pagamentos mantido."
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            updateData(d => ({ ...d, recurrences: d.recurrences.filter(r => r.id !== recurrence.id) }));
            showToast('Recorrência excluída');
            close();
          }}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

// =====================================================
// GOAL FORM
// =====================================================
function GoalForm({ goal, data, updateData, showToast, close }) {
  const isEdit = !!goal;
  const [name, setName] = useState(goal?.name || '');
  const [target, setTarget] = useState(goal?.target ? String(goal.target) : '');
  const [parentId, setParentId] = useState(goal?.parentId || '');
  const [contribAmount, setContribAmount] = useState('');
  const [showAddContrib, setShowAddContrib] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const parentOptions = data.goals.filter(g => !g.parentId && (!isEdit || g.id !== goal.id));

  // Always read from live data to reflect contributions added in this session
  const liveGoal = isEdit ? (data.goals.find(g => g.id === goal.id) || goal) : null;
  const contributions = liveGoal?.contributions || [];
  const saved = contributions.reduce((s, c) => s + (Number(c.amount)||0), 0);
  const liveTarget = Number(String(target).replace(',', '.')) || liveGoal?.target || 0;
  const pct = liveTarget > 0 ? Math.min(100, (saved / liveTarget) * 100) : 0;

  const save = () => {
    if (!name.trim()) { showToast('Informe um nome', 'error'); return; }
    const t = Number(String(target).replace(',', '.')) || 0;
    if (t <= 0) { showToast('Informe um valor alvo', 'error'); return; }
    const payload = {
      id: goal?.id || uid(),
      name: name.trim(), target: t, parentId: parentId || null,
      contributions: liveGoal?.contributions || [],
      deadline: goal?.deadline || null,
    };
    updateData(d => {
      if (isEdit) return { ...d, goals: d.goals.map(g => g.id === payload.id ? payload : g) };
      return { ...d, goals: [...d.goals, payload] };
    });
    showToast(isEdit ? 'Meta atualizada' : 'Meta criada', 'success');
    close();
  };

  const addContribution = () => {
    const v = Number(String(contribAmount).replace(',','.')) || 0;
    if (v <= 0) return;
    updateData(d => ({
      ...d,
      goals: d.goals.map(g => g.id === goal.id ? {
        ...g,
        contributions: [...(g.contributions || []), { id: uid(), date: todayKey(), amount: v, note: '' }]
      } : g)
    }));
    setContribAmount('');
    setShowAddContrib(false);
    showToast('Aporte registrado', 'success');
  };

  return (
    <>
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 12px' }}>
          <button onClick={close} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 16, cursor: 'pointer', padding: 0 }}>Cancelar</button>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{isEdit ? 'Editar meta' : 'Nova meta'}</div>
          <button onClick={save} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 16, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Salvar</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nome">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Reserva, Viagem..." style={inputStyle()} />
          </Field>
          <Field label="Valor alvo">
            <input
              type="text" inputMode="decimal" value={target}
              onChange={(e) => setTarget(e.target.value.replace(/[^0-9.,]/g, ''))}
              placeholder="0,00"
              style={{ ...inputStyle(), fontSize: 22, fontWeight: 700 }}
            />
          </Field>
          {parentOptions.length > 0 && (
            <Field label="Submeta de (opcional)">
              <select value={parentId} onChange={(e) => setParentId(e.target.value)} style={inputStyle()}>
                <option value="">Nenhuma — meta independente</option>
                {parentOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          )}

          {isEdit && (
            <>
              {/* Progresso — sempre lê do estado vivo */}
              <div style={{ background: C.card, borderRadius: 12, padding: '14px 14px' }}>
                <div style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>Progresso</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>
                  {formatBRL(saved)} <span style={{ fontSize: 14, color: C.textTertiary, fontWeight: 500 }}>de {formatBRL(liveTarget)}</span>
                </div>
                <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: C.cardElevated, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? C.green : C.blue, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 6 }}>
                  {pct.toFixed(1)}% · Faltam {formatBRL(Math.max(0, liveTarget - saved))}
                </div>
              </div>

              <Field label="Aportes">
                <div style={{ background: C.card, borderRadius: 12, padding: 4 }}>
                  {contributions.length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', color: C.textSecondary, fontSize: 13 }}>
                      Sem aportes ainda
                    </div>
                  ) : (
                    contributions.slice().reverse().map((c, i) => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderTop: i === 0 ? 'none' : `0.5px solid ${C.separator}` }}>
                        <div style={{ fontSize: 13, color: C.textSecondary }}>{formatDateLabel(c.date)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>+{formatBRL(c.amount)}</div>
                          <button onClick={() => {
                            updateData(d => ({
                              ...d, goals: d.goals.map(g => g.id === goal.id ? { ...g, contributions: g.contributions.filter(x => x.id !== c.id) } : g)
                            }));
                          }} style={{ background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer', display: 'flex', padding: 2 }}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {showAddContrib ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <input
                      autoFocus type="text" inputMode="decimal" value={contribAmount}
                      onChange={(e) => setContribAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder="Valor do aporte"
                      onKeyDown={(e) => { if (e.key === 'Enter') addContribution(); }}
                      style={{ ...inputStyle(), flex: 1 }}
                    />
                    <button onClick={addContribution} style={{ padding: '0 16px', background: C.blue, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>OK</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAddContrib(true)} style={{ marginTop: 10, padding: '10px 14px', background: C.cardElevated, color: C.blue, border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Plus size={16} /> Registrar aporte
                  </button>
                )}
              </Field>

              <button onClick={() => setConfirmDelete(true)} style={{
                marginTop: 4, padding: '12px 16px', background: C.redDim, color: C.red,
                border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Excluir meta</button>
            </>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir meta"
          message="Submetas vinculadas serão desvinculadas."
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            updateData(d => ({
              ...d,
              goals: d.goals.filter(g => g.id !== goal.id).map(g => g.parentId === goal.id ? { ...g, parentId: null } : g)
            }));
            showToast('Meta excluída'); close();
          }}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

// =====================================================
// DEBT FORM
// =====================================================
function DebtForm({ debt, data, updateData, showToast, close }) {
  const isEdit = !!debt;
  const [name, setName] = useState(debt?.name || '');
  const [creditor, setCreditor] = useState(debt?.creditor || '');
  const [total, setTotal] = useState(debt?.total ? String(debt.total) : '');
  const [payAmount, setPayAmount] = useState('');
  const [showAddPay, setShowAddPay] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Always read from live data to reflect payments added in this session
  const liveDebt = isEdit ? (data.debts.find(x => x.id === debt.id) || debt) : null;
  const payments = liveDebt?.payments || [];
  const paid = payments.reduce((s, p) => s + (Number(p.amount)||0), 0);
  const liveTotal = Number(String(total).replace(',', '.')) || liveDebt?.total || 0;
  const pct = liveTotal > 0 ? Math.min(100, (paid / liveTotal) * 100) : 0;

  const save = () => {
    if (!name.trim()) { showToast('Informe um nome', 'error'); return; }
    const t = Number(String(total).replace(',', '.')) || 0;
    if (t <= 0) { showToast('Informe o valor total', 'error'); return; }
    const payload = {
      id: debt?.id || uid(), name: name.trim(), creditor: creditor.trim(), total: t,
      payments: liveDebt?.payments || [],
    };
    updateData(d => {
      if (isEdit) return { ...d, debts: d.debts.map(x => x.id === payload.id ? payload : x) };
      return { ...d, debts: [...d.debts, payload] };
    });
    showToast(isEdit ? 'Dívida atualizada' : 'Dívida criada', 'success');
    close();
  };

  const addPayment = () => {
    const v = Number(String(payAmount).replace(',','.')) || 0;
    if (v <= 0) return;
    updateData(d => ({
      ...d,
      debts: d.debts.map(x => x.id === debt.id ? {
        ...x,
        payments: [...(x.payments || []), { id: uid(), date: todayKey(), amount: v, note: '' }]
      } : x)
    }));
    setPayAmount(''); setShowAddPay(false);
    showToast('Pagamento registrado', 'success');
  };

  return (
    <>
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 12px' }}>
          <button onClick={close} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 16, cursor: 'pointer', padding: 0 }}>Cancelar</button>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{isEdit ? 'Editar dívida' : 'Nova dívida'}</div>
          <button onClick={save} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 16, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Salvar</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nome">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cartão, Empréstimo..." style={inputStyle()} />
          </Field>
          <Field label="Credor">
            <input type="text" value={creditor} onChange={(e) => setCreditor(e.target.value)} placeholder="Ex: Banco, pessoa..." style={inputStyle()} />
          </Field>
          <Field label="Valor total">
            <input
              type="text" inputMode="decimal" value={total}
              onChange={(e) => setTotal(e.target.value.replace(/[^0-9.,]/g, ''))}
              placeholder="0,00"
              style={{ ...inputStyle(), fontSize: 22, fontWeight: 700 }}
            />
          </Field>

          {isEdit && (
            <>
              {/* Progresso — sempre lê do estado vivo */}
              <div style={{ background: C.card, borderRadius: 12, padding: '14px 14px' }}>
                <div style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>Pago</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>
                  {formatBRL(paid)} <span style={{ fontSize: 14, color: C.textTertiary, fontWeight: 500 }}>de {formatBRL(liveTotal)}</span>
                </div>
                <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: C.cardElevated, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: C.orange, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 6 }}>
                  {pct.toFixed(1)}% pago · Restam {formatBRL(Math.max(0, liveTotal - paid))}
                </div>
              </div>

              <Field label="Pagamentos">
                <div style={{ background: C.card, borderRadius: 12, padding: 4 }}>
                  {payments.length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', color: C.textSecondary, fontSize: 13 }}>Sem pagamentos ainda</div>
                  ) : payments.slice().reverse().map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderTop: i === 0 ? 'none' : `0.5px solid ${C.separator}` }}>
                      <div style={{ fontSize: 13, color: C.textSecondary }}>{formatDateLabel(p.date)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>{formatBRL(p.amount)}</div>
                        <button onClick={() => {
                          updateData(d => ({ ...d, debts: d.debts.map(x => x.id === debt.id ? { ...x, payments: x.payments.filter(y => y.id !== p.id) } : x) }));
                        }} style={{ background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer', display: 'flex', padding: 2 }}><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                {showAddPay ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <input autoFocus type="text" inputMode="decimal" value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder="Valor pago"
                      onKeyDown={(e) => { if (e.key === 'Enter') addPayment(); }}
                      style={{ ...inputStyle(), flex: 1 }} />
                    <button onClick={addPayment} style={{ padding: '0 16px', background: C.blue, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>OK</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAddPay(true)} style={{ marginTop: 10, padding: '10px 14px', background: C.cardElevated, color: C.blue, border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Plus size={16} /> Registrar pagamento
                  </button>
                )}
              </Field>

              <button onClick={() => setConfirmDelete(true)} style={{
                marginTop: 4, padding: '12px 16px', background: C.redDim, color: C.red,
                border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Excluir dívida</button>
            </>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir dívida"
          message="O histórico de pagamentos será perdido."
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            updateData(d => ({ ...d, debts: d.debts.filter(x => x.id !== debt.id) }));
            showToast('Dívida excluída'); close();
          }}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
