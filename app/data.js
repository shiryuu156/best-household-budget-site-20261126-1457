// Household Ledger — example data and state.
// The figures below are a realistic EXAMPLE household ("The Alvarez Family"),
// pre-filled so every page shows real numbers on first load. The household can
// edit, add or delete anything; changes are saved in the browser's localStorage
// and a "Reset example data" button in Settings restores this starting point.

export const EXAMPLE_MONTH = '2026-11';
export const STORAGE_KEY = 'household-ledger-v1';

export const CATEGORY_COLORS = {
  'Housing': '#2563eb',
  'Groceries': '#16a34a',
  'Transport': '#d97706',
  'Utilities': '#0891b2',
  'Dining Out': '#db2777',
  'Entertainment': '#7c3aed',
  'Health & Fitness': '#dc2626',
  'Kids & School': '#4f46e5',
  'Subscriptions': '#64748b',
  'Household & Misc': '#a16207',
  'Savings': '#059669',
};

export function exampleState() {
  return {
    householdName: 'The Alvarez Family',
    month: EXAMPLE_MONTH,
    note: 'Example household — edit any figure to make it yours.',
    income: [
      { id: 'inc-1', source: 'Maya Alvarez — salary (teacher)', amount: 4200 },
      { id: 'inc-2', source: 'Jordan Alvarez — salary (electrician)', amount: 2650 },
    ],
    budget: [
      { id: 'bud-1', category: 'Housing', planned: 1850 },
      { id: 'bud-2', category: 'Groceries', planned: 720 },
      { id: 'bud-3', category: 'Transport', planned: 410 },
      { id: 'bud-4', category: 'Utilities', planned: 260 },
      { id: 'bud-5', category: 'Dining Out', planned: 320 },
      { id: 'bud-6', category: 'Entertainment', planned: 180 },
      { id: 'bud-7', category: 'Health & Fitness', planned: 240 },
      { id: 'bud-8', category: 'Kids & School', planned: 380 },
      { id: 'bud-9', category: 'Subscriptions', planned: 65 },
      { id: 'bud-10', category: 'Household & Misc', planned: 150 },
      { id: 'bud-11', category: 'Savings', planned: 1200 },
    ],
    expenses: [
      { id: 'exp-1', date: '2026-11-01', description: 'Monthly rent', category: 'Housing', amount: 1850 },
      { id: 'exp-2', date: '2026-11-02', description: 'Weekly shop — FreshMart', category: 'Groceries', amount: 148.2 },
      { id: 'exp-3', date: '2026-11-03', description: 'Bus pass (Maya)', category: 'Transport', amount: 72 },
      { id: 'exp-4', date: '2026-11-04', description: 'Streaming bundle', category: 'Subscriptions', amount: 24.99 },
      { id: 'exp-5', date: '2026-11-05', description: 'Pizza night', category: 'Dining Out', amount: 38.5 },
      { id: 'exp-6', date: '2026-11-06', description: 'Pharmacy — vitamins', category: 'Health & Fitness', amount: 27.4 },
      { id: 'exp-7', date: '2026-11-07', description: 'Petrol — Shell', category: 'Transport', amount: 54.3 },
      { id: 'exp-8', date: '2026-11-08', description: 'Weekly shop — FreshMart', category: 'Groceries', amount: 162.75 },
      { id: 'exp-9', date: '2026-11-09', description: 'School lunch money (2 kids)', category: 'Kids & School', amount: 60 },
      { id: 'exp-10', date: '2026-11-10', description: 'Electric bill', category: 'Utilities', amount: 118.6 },
      { id: 'exp-11', date: '2026-11-11', description: 'Cinema — family film', category: 'Entertainment', amount: 42 },
      { id: 'exp-12', date: '2026-11-12', description: 'Internet bill', category: 'Utilities', amount: 79 },
      { id: 'exp-13', date: '2026-11-13', description: 'Takeaway Thai', category: 'Dining Out', amount: 46.8 },
      { id: 'exp-14', date: '2026-11-14', description: 'Weekly shop — FreshMart', category: 'Groceries', amount: 139.9 },
      { id: 'exp-15', date: '2026-11-15', description: 'Gym membership (Maya)', category: 'Health & Fitness', amount: 38 },
      { id: 'exp-16', date: '2026-11-16', description: 'Kids — football boots', category: 'Kids & School', amount: 84.99 },
      { id: 'exp-17', date: '2026-11-17', description: 'Mobile plan (2 lines)', category: 'Utilities', amount: 112 },
      { id: 'exp-19', date: '2026-11-18', description: 'Water bill', category: 'Utilities', amount: 46.2 },
      { id: 'exp-20', date: '2026-11-19', description: 'Dentist check-up (Leo)', category: 'Health & Fitness', amount: 85 },
      { id: 'exp-21', date: '2026-11-20', description: 'Credit card minimum', category: 'Household & Misc', amount: 120 },
      { id: 'exp-22', date: '2026-11-21', description: 'Weekly shop — FreshMart', category: 'Groceries', amount: 171.4 },
      { id: 'exp-23', date: '2026-11-22', description: 'Birthday gift — Grandma', category: 'Household & Misc', amount: 35 },
      { id: 'exp-24', date: '2026-11-23', description: 'Lunch out with friends', category: 'Dining Out', amount: 28.75 },
      { id: 'exp-25', date: '2026-11-24', description: 'Petrol — Shell', category: 'Transport', amount: 48.9 },
      { id: 'exp-26', date: '2026-11-25', description: 'School trip — science museum', category: 'Kids & School', amount: 96 },
      { id: 'exp-27', date: '2026-11-25', description: 'Board game night snacks', category: 'Entertainment', amount: 22.6 },
      { id: 'exp-28', date: '2026-11-26', description: 'Weekly shop — FreshMart', category: 'Groceries', amount: 118.55 },
    ],
    bills: [
      { id: 'bill-1', name: 'Rent', amount: 1850, dueDay: 1, category: 'Housing', paid: true, autopay: true },
      { id: 'bill-2', name: 'Streaming bundle', amount: 24.99, dueDay: 5, category: 'Subscriptions', paid: true, autopay: true },
      { id: 'bill-3', name: 'Electric bill', amount: 118.6, dueDay: 12, category: 'Utilities', paid: true, autopay: false },
      { id: 'bill-4', name: 'Internet', amount: 79, dueDay: 15, category: 'Utilities', paid: true, autopay: true },
      { id: 'bill-5', name: 'Water bill', amount: 46.2, dueDay: 18, category: 'Utilities', paid: true, autopay: false },
      { id: 'bill-6', name: 'Credit card', amount: 420, dueDay: 20, category: 'Household & Misc', paid: true, autopay: false },
      { id: 'bill-7', name: 'Mobile plan (2 lines)', amount: 112, dueDay: 22, category: 'Utilities', paid: true, autopay: true },
      { id: 'bill-8', name: 'Car insurance', amount: 164, dueDay: 27, category: 'Transport', paid: false, autopay: false },
      { id: 'bill-9', name: 'Gym membership', amount: 38, dueDay: 28, category: 'Health & Fitness', paid: false, autopay: true },
      { id: 'bill-10', name: 'Home insurance', amount: 96, dueDay: 30, category: 'Housing', paid: false, autopay: false },
    ],
    goals: [
      { id: 'goal-1', name: 'Emergency fund', target: 10000, saved: 6250, targetDate: '2027-06-30', note: '6 months of essential spending' },
      { id: 'goal-2', name: 'Family vacation — coast trip', target: 2400, saved: 1080, targetDate: '2027-07-15', note: 'Flights + a week by the sea' },
      { id: 'goal-3', name: 'New car down payment', target: 8000, saved: 1450, targetDate: '2028-01-31', note: 'Replace the 2012 hatchback' },
      { id: 'goal-4', name: 'Kids’ college fund', target: 15000, saved: 3200, targetDate: '2030-09-01', note: 'Small monthly top-ups add up' },
    ],
    history: [
      { month: '2026-07', income: 6850, spent: 5620 },
      { month: '2026-08', income: 6850, spent: 5890 },
      { month: '2026-09', income: 7010, spent: 5745 },
      { month: '2026-10', income: 6850, spent: 6015 },
      { month: '2026-11', income: 6850, spent: 0 }, // November "spent" is computed live below
    ],
  };
}

// ---- persistence -----------------------------------------------------------

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.expenses) && Array.isArray(parsed.budget)) return parsed;
    }
  } catch { /* fall through to the example data */ }
  const fresh = exampleState();
  saveState(fresh);
  return fresh;
}

export function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable: keep in-memory */ }
}

export function resetState() {
  const fresh = exampleState();
  saveState(fresh);
  return fresh;
}

// ---- derived figures -------------------------------------------------------

export function totalIncome(state) {
  return state.income.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

export function totalPlanned(state) {
  return state.budget.reduce((sum, item) => sum + Number(item.planned || 0), 0);
}

export function spentByCategory(state) {
  const spent = {};
  for (const expense of state.expenses) {
    spent[expense.category] = (spent[expense.category] || 0) + Number(expense.amount || 0);
  }
  return spent;
}

export function totalSpent(state) {
  return state.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

export function categoryColor(category) {
  return CATEGORY_COLORS[category] || '#64748b';
}

export function monthLabel(isoMonth) {
  const [year, month] = isoMonth.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function shortMonthLabel(isoMonth) {
  const [year, month] = isoMonth.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

export function money(amount) {
  return Number(amount || 0).toLocaleString('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

export function money0(amount) {
  return Number(amount || 0).toLocaleString('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0,
  });
}

export function newId(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}
