// Nest Egg — main.
// One clear job: route between views, wire the controls, keep state saved.
// Views render HTML; this file owns every click, submit and input.

import { loadState, resetState, saveState } from './data.js';
import { billsView, dashboardView, goalsView, plannerView, spendingView, tipsView } from './views.js';

let state = loadState();

const ROUTES = [
  { hash: '#/', label: 'Dashboard', render: () => dashboardView(state) },
  { hash: '#/planner', label: 'Budget Planner', render: () => plannerView(state) },
  { hash: '#/bills', label: 'Bills Calendar', render: () => billsView(state) },
  { hash: '#/spending', label: 'Spending', render: () => spendingView(state, 'all') },
  { hash: '#/goals', label: 'Savings Goals', render: () => goalsView(state) },
  { hash: '#/guides', label: 'Money Guides', render: () => tipsView() },
];

function currentRoute() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/spending/')) {
    const filter = hash.slice('#/spending/'.length) || 'all';
    return { hash, label: 'Spending', render: () => spendingView(state, filter) };
  }
  return ROUTES.find((route) => route.hash === hash) || ROUTES[0];
}

function render() {
  const route = currentRoute();
  const app = document.getElementById('app');
  app.innerHTML = route.render();
  document.querySelectorAll('nav a').forEach((link) => {
    const on = route.hash === link.getAttribute('href') ||
      (route.hash.startsWith('#/spending') && link.getAttribute('href') === '#/spending');
    link.classList.toggle('active', on);
    if (on) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = 'Nest Egg — ' + route.label;
  wire(app);
}

function rerender() {
  saveState(state);
  render();
}

function wire(app) {
  // Budget limits save as you type.
  app.querySelectorAll('input[data-budget]').forEach((input) => {
    input.addEventListener('change', () => {
      const row = state.budgets.find((b) => b.id === input.dataset.budget);
      if (!row) return;
      const value = Math.max(0, Math.round(Number(input.value) || 0));
      row.budget = value;
      rerender();
    });
  });

  // Mark a bill paid.
  app.querySelectorAll('button[data-pay]').forEach((button) => {
    button.addEventListener('click', () => {
      const bill = state.bills.find((b) => b.id === button.dataset.pay);
      if (!bill) return;
      bill.paid = true;
      rerender();
    });
  });

  // Delete a transaction.
  app.querySelectorAll('button[data-del-tx]').forEach((button) => {
    button.addEventListener('click', () => {
      state.transactions = state.transactions.filter((tx) => tx.id !== button.dataset.delTx);
      rerender();
    });
  });

  // Add a purchase.
  const txForm = app.querySelector('#add-tx');
  if (txForm) {
    txForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(txForm);
      const amount = Number(data.get('amount'));
      if (!amount || amount <= 0) return;
      state.transactions.unshift({
        id: 'tx-' + Date.now(),
        date: String(data.get('date') || '2026-11-27'),
        label: String(data.get('label') || 'Purchase').trim() || 'Purchase',
        category: String(data.get('category') || 'groceries'),
        amount: Math.round(amount * 100) / 100,
      });
      rerender();
      location.hash = '#/spending';
    });
  }

  // Add a bill.
  const billForm = app.querySelector('#add-bill');
  if (billForm) {
    billForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(billForm);
      const amount = Number(data.get('amount'));
      const due = Math.min(30, Math.max(1, Number(data.get('due')) || 1));
      if (!amount || amount <= 0) return;
      state.bills.push({
        id: 'bill-' + Date.now(),
        label: String(data.get('label') || 'Bill').trim() || 'Bill',
        amount: Math.round(amount * 100) / 100,
        due,
        paid: false,
        category: 'utilities',
        recurring: 'Monthly',
      });
      rerender();
    });
  }

  // Add money to a goal.
  app.querySelectorAll('form[data-goal]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const goal = state.goals.find((g) => g.id === form.dataset.goal);
      if (!goal) return;
      const amount = Number(new FormData(form).get('amount'));
      if (!amount || amount <= 0) return;
      goal.saved = Math.round((goal.saved + amount) * 100) / 100;
      rerender();
    });
  });

  // Create a goal.
  const goalForm = app.querySelector('#add-goal');
  if (goalForm) {
    goalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(goalForm);
      const target = Number(data.get('target'));
      if (!target || target <= 0) return;
      state.goals.push({
        id: 'goal-' + Date.now(),
        label: String(data.get('label') || 'New goal').trim() || 'New goal',
        target: Math.round(target),
        saved: 0,
        note: String(data.get('note') || '').trim() || 'Started November 2026',
      });
      rerender();
    });
  }
}

document.getElementById('reset-demo').addEventListener('click', () => {
  state = resetState();
  rerender();
});

window.addEventListener('hashchange', render);
render();
