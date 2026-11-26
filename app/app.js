// Household Ledger — router and wiring. One page, six views reached by links
// (#/, #/budget, #/expenses, #/bills, #/savings, #/reports). Every control on
// every view works: edits save to localStorage and the whole site re-renders
// from the same state, so the numbers always agree with each other.

import { loadState, saveState, resetState, newId, CATEGORY_COLORS } from './data.js';
import {
  renderDashboard, renderBudget, renderExpenses, renderBills, renderSavings, renderReports,
} from './views.js';

let state = loadState();
let expenseFilter = { category: '', search: '', editingId: null };

const view = document.getElementById('view');
const navLinks = [...document.querySelectorAll('[data-nav]')];

const ROUTES = {
  '': renderDashboard,
  '/': renderDashboard,
  '/budget': renderBudget,
  '/expenses': (s) => renderExpenses(s, expenseFilter),
  '/bills': renderBills,
  '/savings': renderSavings,
  '/reports': renderReports,
};

function currentRoute() {
  return (location.hash || '#/').replace(/^#/, '');
}

function render() {
  const route = currentRoute();
  const renderFn = ROUTES[route] || renderDashboard;
  view.innerHTML = renderFn(state);
  for (const link of navLinks) {
    const href = link.getAttribute('href').replace(/^#/, '');
    link.classList.toggle('active', href === route || (href === '/' && (route === '' || route === '/')));
    if (href === route || (href === '/' && (route === '' || route === '/'))) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  window.scrollTo({ top: 0 });
}

function rerenderKeepingSearchFocus() {
  const search = document.getElementById('filter-search');
  const hadFocus = search && document.activeElement === search;
  const caret = search ? search.selectionStart : 0;
  render();
  if (hadFocus) {
    const next = document.getElementById('filter-search');
    if (next) {
      next.focus();
      next.setSelectionRange(caret, caret);
    }
  }
}

function persist() {
  saveState(state);
}

// ---- click actions (event delegation) -------------------------------------

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === 'toggle-bill') {
    const bill = state.bills.find((b) => b.id === id);
    if (bill) { bill.paid = !bill.paid; persist(); render(); }
  }
  if (action === 'delete-bill') {
    state.bills = state.bills.filter((b) => b.id !== id);
    persist(); render();
  }
  if (action === 'delete-expense') {
    state.expenses = state.expenses.filter((e) => e.id !== id);
    persist(); render();
  }
  if (action === 'edit-expense') {
    expenseFilter.editingId = id;
    render();
  }
  if (action === 'cancel-edit') {
    expenseFilter.editingId = null;
    render();
  }
  if (action === 'save-expense') {
    const row = button.closest('tr');
    const expense = state.expenses.find((e) => e.id === id);
    if (row && expense) {
      const date = row.querySelector('[data-edit="date"]').value;
      const description = row.querySelector('[data-edit="description"]').value.trim();
      const category = row.querySelector('[data-edit="category"]').value;
      const amount = Number(row.querySelector('[data-edit="amount"]').value);
      if (date && description && category && Number.isFinite(amount) && amount >= 0) {
        expense.date = date;
        expense.description = description;
        expense.category = category;
        expense.amount = Math.round(amount * 100) / 100;
        expenseFilter.editingId = null;
        persist(); render();
      }
    }
  }
  if (action === 'delete-income') {
    if (state.income.length > 1) {
      state.income = state.income.filter((item) => item.id !== id);
      persist(); render();
    } else {
      alert('A household needs at least one income source.');
    }
  }
  if (action === 'delete-category') {
    state.budget = state.budget.filter((b) => b.id !== id);
    persist(); render();
  }
  if (action === 'delete-goal') {
    state.goals = state.goals.filter((g) => g.id !== id);
    persist(); render();
  }
  if (action === 'reset-data') {
    if (confirm('Reset everything back to the example household? Your edits will be lost.')) {
      state = resetState();
      expenseFilter = { category: '', search: '', editingId: null };
      render();
    }
  }
});

// ---- inline edits (change event: fires on blur / Enter, so typing is safe) -

document.addEventListener('change', (event) => {
  const input = event.target.closest('[data-field]');
  if (input) {
    const field = input.dataset.field;
    const id = input.dataset.id;
    if (field === 'income-source') {
      const item = state.income.find((i) => i.id === id);
      if (item) item.source = input.value.trim() || item.source;
    }
    if (field === 'income-amount') {
      const item = state.income.find((i) => i.id === id);
      if (item) item.amount = Math.max(0, Number(input.value) || 0);
    }
    if (field === 'budget-planned') {
      const item = state.budget.find((b) => b.id === id);
      if (item) item.planned = Math.max(0, Number(input.value) || 0);
    }
    persist();
    render();
    return;
  }
  if (event.target.id === 'filter-category') {
    expenseFilter.category = event.target.value;
    expenseFilter.editingId = null;
    render();
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'filter-search') {
    expenseFilter.search = event.target.value;
    expenseFilter.editingId = null;
    rerenderKeepingSearchFocus();
  }
});

// ---- forms -----------------------------------------------------------------

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  const kind = form.dataset.form;

  if (kind === 'add-income') {
    state.income.push({
      id: newId('inc'), source: String(data.get('source')).trim(),
      amount: Math.round(Number(data.get('amount')) * 100) / 100,
    });
  }
  if (kind === 'add-category') {
    const category = String(data.get('category')).trim();
    if (!state.budget.some((b) => b.category.toLowerCase() === category.toLowerCase())) {
      state.budget.push({
        id: newId('bud'), category,
        planned: Math.round(Number(data.get('planned')) * 100) / 100,
      });
      CATEGORY_COLORS[category] = '#64748b';
    }
  }
  if (kind === 'add-expense') {
    state.expenses.push({
      id: newId('exp'),
      date: String(data.get('date')),
      description: String(data.get('description')).trim(),
      category: String(data.get('category')),
      amount: Math.round(Number(data.get('amount')) * 100) / 100,
    });
    expenseFilter.editingId = null;
  }
  if (kind === 'add-bill') {
    const dueDay = Math.min(31, Math.max(1, Number(data.get('dueDay')) || 1));
    state.bills.push({
      id: newId('bill'),
      name: String(data.get('name')).trim(),
      amount: Math.round(Number(data.get('amount')) * 100) / 100,
      dueDay, category: String(data.get('category')),
      paid: false, autopay: false,
    });
  }
  if (kind === 'add-goal') {
    state.goals.push({
      id: newId('goal'),
      name: String(data.get('name')).trim(),
      target: Math.round(Number(data.get('target')) * 100) / 100,
      saved: Math.round(Number(data.get('saved') || 0) * 100) / 100,
      targetDate: String(data.get('targetDate') || ''),
      note: String(data.get('note') || '').trim(),
    });
  }
  if (kind === 'add-funds') {
    const goal = state.goals.find((g) => g.id === form.dataset.id);
    if (goal) goal.saved = Math.round((goal.saved + Number(data.get('amount'))) * 100) / 100;
  }
  persist();
  form.reset();
  render();
});

window.addEventListener('hashchange', render);
render();
