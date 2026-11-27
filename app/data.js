// Nest Egg — household budget data.
// One clear job: hold the household's figures, persist edits in localStorage,
// and expose small read helpers. No network, no imports from outside app/.

export const HOUSEHOLD = {
  name: 'The Alvarez Household',
  members: ['Rosa', 'Marco', 'Lia', 'Tom'],
  month: 'November 2026',
  currency: 'USD',
};

export const DEFAULT_BUDGETS = [
  { id: 'housing', label: 'Housing & Rent', budget: 1450, color: '#2f6f5e', icon: '⌂' },
  { id: 'groceries', label: 'Groceries', budget: 640, color: '#d98e2b', icon: '◍' },
  { id: 'transport', label: 'Transport', budget: 320, color: '#4a7fb5', icon: '➤' },
  { id: 'utilities', label: 'Utilities', budget: 260, color: '#7a5fb0', icon: '⚡' },
  { id: 'dining', label: 'Eating Out', budget: 240, color: '#c65b7c', icon: '🍽' },
  { id: 'kids', label: 'Kids & School', budget: 380, color: '#3aa88f', icon: '✎' },
  { id: 'health', label: 'Health', budget: 180, color: '#b5543f', icon: '+' },
  { id: 'fun', label: 'Fun & Streaming', budget: 150, color: '#8a9a3b', icon: '♪' },
];

export const DEFAULT_INCOME = [
  { id: 'salary-rosa', label: "Rosa's salary", amount: 3400, day: 1 },
  { id: 'salary-marco', label: "Marco's salary", amount: 2150, day: 15 },
  { id: 'side', label: 'Weekend market stall', amount: 300, day: 22 },
];

export const DEFAULT_BILLS = [
  { id: 'rent', label: 'Rent — Maple Court 4B', amount: 1450, due: 1, paid: true, category: 'housing', recurring: 'Monthly' },
  { id: 'electric', label: 'City Power & Light', amount: 118, due: 5, paid: true, category: 'utilities', recurring: 'Monthly' },
  { id: 'internet', label: 'Northlink Internet 500', amount: 64, due: 8, paid: true, category: 'utilities', recurring: 'Monthly' },
  { id: 'water', label: 'Water & Sewer', amount: 52, due: 10, paid: true, category: 'utilities', recurring: 'Monthly' },
  { id: 'phone', label: 'Family mobile plan', amount: 96, due: 12, paid: true, category: 'utilities', recurring: 'Monthly' },
  { id: 'insurance', label: 'Home & car insurance', amount: 214, due: 15, paid: false, category: 'health', recurring: 'Monthly' },
  { id: 'school', label: 'Lia school fees', amount: 180, due: 18, paid: false, category: 'kids', recurring: 'Monthly' },
  { id: 'gym', label: 'Riverside Gym family', amount: 58, due: 20, paid: false, category: 'health', recurring: 'Monthly' },
  { id: 'streaming', label: 'StreamBox + Music', amount: 27, due: 24, paid: false, category: 'fun', recurring: 'Monthly' },
  { id: 'car', label: 'Car loan — Blue Wagon', amount: 296, due: 27, paid: false, category: 'transport', recurring: 'Monthly' },
];

export const DEFAULT_TRANSACTIONS = [
  { id: 't01', date: '2026-11-26', label: 'GreenMart weekly shop', category: 'groceries', amount: 96.40 },
  { id: 't02', date: '2026-11-25', label: 'Bus passes — Lia & Tom', category: 'transport', amount: 42.00 },
  { id: 't03', date: '2026-11-24', label: 'Pizza night (takeaway)', category: 'dining', amount: 31.50 },
  { id: 't04', date: '2026-11-23', label: 'Pharmacy — Tom cold remedy', category: 'health', amount: 18.75 },
  { id: 't05', date: '2026-11-22', label: 'GreenMart weekly shop', category: 'groceries', amount: 112.30 },
  { id: 't06', date: '2026-11-21', label: 'Fuel — Blue Wagon', category: 'transport', amount: 48.00 },
  { id: 't07', date: '2026-11-20', label: 'Cinema — family Saturday', category: 'fun', amount: 44.00 },
  { id: 't08', date: '2026-11-19', label: 'School art supplies', category: 'kids', amount: 26.90 },
  { id: 't09', date: '2026-11-18', label: 'GreenMart weekly shop', category: 'groceries', amount: 88.15 },
  { id: 't10', date: '2026-11-17', label: 'Lunch out — Rosa & Marco', category: 'dining', amount: 27.80 },
  { id: 't11', date: '2026-11-15', label: "Marco's salary in", category: 'income', amount: -2150.00 },
  { id: 't12', date: '2026-11-14', label: 'Hardware store — tap washer', category: 'housing', amount: 14.60 },
  { id: 't13', date: '2026-11-12', label: 'GreenMart weekly shop', category: 'groceries', amount: 104.55 },
  { id: 't14', date: '2026-11-08', label: 'Birthday gift — Aunt Bea', category: 'fun', amount: 35.00 },
  { id: 't15', date: '2026-11-05', label: 'Dentist check — Lia', category: 'health', amount: 65.00 },
  { id: 't16', date: '2026-11-01', label: "Rosa's salary in", category: 'income', amount: -3400.00 },
];

export const DEFAULT_GOALS = [
  { id: 'g1', label: 'Emergency fund', target: 6000, saved: 4210, note: '$150 a month, auto-move on payday' },
  { id: 'g2', label: 'Summer road trip', target: 1800, saved: 965, note: 'July 2027 — coast drive with the kids' },
  { id: 'g3', label: 'New washing machine', target: 750, saved: 520, note: 'Current one is 11 years old' },
  { id: 'g4', label: "Tom's bike fund", target: 320, saved: 210, note: 'Tom chips in $10 a week' },
];

export const MONTH_HISTORY = [
  { month: 'Jun', spent: 3280 },
  { month: 'Jul', spent: 3415 },
  { month: 'Aug', spent: 3190 },
  { month: 'Sep', spent: 3560 },
  { month: 'Oct', spent: 3395 },
  { month: 'Nov', spent: 2535 },
];

const KEY = 'nest-egg-v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function defaultState() {
  return {
    budgets: clone(DEFAULT_BUDGETS),
    income: clone(DEFAULT_INCOME),
    bills: clone(DEFAULT_BILLS),
    transactions: clone(DEFAULT_TRANSACTIONS),
    goals: clone(DEFAULT_GOALS),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : base.budgets,
      income: Array.isArray(parsed.income) ? parsed.income : base.income,
      bills: Array.isArray(parsed.bills) ? parsed.bills : base.bills,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : base.transactions,
      goals: Array.isArray(parsed.goals) ? parsed.goals : base.goals,
    };
  } catch (err) {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    // Private mode or hosting without storage: keep working in memory.
  }
}

export function resetState() {
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    // Ignore: in-memory state is reset by the caller.
  }
  return defaultState();
}

// ---- Read helpers: every figure the views show comes through here. ----

export function totalIncome(state) {
  return state.income.reduce((sum, row) => sum + row.amount, 0);
}

export function spentByCategory(state) {
  const spent = {};
  for (const tx of state.transactions) {
    if (tx.amount > 0 && tx.category !== 'income') {
      spent[tx.category] = (spent[tx.category] || 0) + tx.amount;
    }
  }
  // Paid bills count as spending too — rent is the housing pot's biggest item.
  for (const bill of state.bills) {
    if (bill.paid) {
      spent[bill.category] = (spent[bill.category] || 0) + bill.amount;
    }
  }
  return spent;
}

export function totalSpent(state) {
  return Object.values(spentByCategory(state)).reduce((a, b) => a + b, 0);
}

export function totalBudget(state) {
  return state.budgets.reduce((sum, row) => sum + row.budget, 0);
}

export function billsDue(state) {
  return state.bills.filter((bill) => !bill.paid);
}

export function billsDueTotal(state) {
  return billsDue(state).reduce((sum, bill) => sum + bill.amount, 0);
}

export function upcomingBills(state, fromDay) {
  return state.bills
    .filter((bill) => !bill.paid && bill.due >= fromDay)
    .sort((a, b) => a.due - b.due)
    .slice(0, 5);
}

export function recentTransactions(state, count) {
  return [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, count);
}

export function categoryLabel(state, id) {
  const found = state.budgets.find((row) => row.id === id);
  return found ? found.label : id;
}

export function categoryColor(state, id) {
  const found = state.budgets.find((row) => row.id === id);
  return found ? found.color : '#888888';
}

export function money(amount) {
  const sign = amount < 0 ? '−' : '';
  return sign + '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function money0(amount) {
  return '$' + Math.round(amount).toLocaleString('en-US');
}

export function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
