// Household Ledger — page views. Each view is a function of the state that
// returns HTML; app.js renders it and wires up the controls.

import {
  totalIncome, totalPlanned, totalSpent, spentByCategory, categoryColor,
  monthLabel, shortMonthLabel, money, money0, CATEGORY_COLORS,
} from './data.js';
import { donutChart, barChart, progressRows, legend } from './charts.js';

function statCard(label, value, sub, tone = '') {
  return `<div class="stat ${tone}"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-sub">${sub}</div></div>`;
}

function expenseRow(expense, editable = true) {
  return `<tr data-id="${expense.id}">
    <td>${expense.date}</td>
    <td>${escapeHtml(expense.description)}</td>
    <td><span class="chip" style="--chip:${categoryColor(expense.category)}">${expense.category}</span></td>
    <td class="num">${money(expense.amount)}</td>
    ${editable ? `<td class="actions"><button class="btn small" data-action="edit-expense" data-id="${expense.id}">Edit</button>
    <button class="btn small danger" data-action="delete-expense" data-id="${expense.id}">Delete</button></td>` : ''}
  </tr>`;
}

export function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

// ---- Dashboard -------------------------------------------------------------

export function renderDashboard(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const planned = totalPlanned(state);
  const left = income - spent;
  const savingsPlanned = state.budget.find((b) => b.category === 'Savings')?.planned || 0;
  const savingsRate = income > 0 ? Math.round((savingsPlanned / income) * 100) : 0;
  const byCat = spentByCategory(state);
  const slices = Object.entries(byCat)
    .map(([label, value]) => ({ label, value, color: categoryColor(label) }))
    .sort((a, b) => b.value - a.value);
  const upcoming = [...state.bills]
    .filter((bill) => !bill.paid)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 3);
  const recent = [...state.expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return `
  <section class="hero">
    <div>
      <p class="eyebrow">Example household · ${monthLabel(state.month)}</p>
      <h1>Good evening, ${escapeHtml(state.householdName)}.</h1>
      <p class="lede">You have <strong>${money(left)}</strong> left to spend in November, and your savings are on track at <strong>${savingsRate}%</strong> of income.</p>
    </div>
    <div class="hero-card">
      <div class="hero-card-label">Left to spend</div>
      <div class="hero-card-value">${money(left)}</div>
      <div class="hero-card-sub">of ${money(income)} income · ${money(spent)} spent so far</div>
      <a class="btn primary" href="#/expenses">Log an expense</a>
    </div>
  </section>

  <section class="stats">
    ${statCard('Monthly income', money0(income), state.income.length + ' sources', 'good')}
    ${statCard('Spent so far', money0(spent), `${state.expenses.length} expenses logged`)}
    ${statCard('Planned budget', money0(planned), 'across ' + state.budget.length + ' categories')}
    ${statCard('Savings rate', savingsRate + '%', money0(savingsPlanned) + ' set aside monthly', 'good')}
  </section>

  <section class="grid two">
    <div class="card">
      <h2>Where November's money went</h2>
      <p class="muted">Spending by category, ${monthLabel(state.month)} to date.</p>
      <div class="donut-wrap">${donutChart(slices, 'spent', money0(spent))}${legend(slices, money0)}</div>
      <a class="link-more" href="#/reports">See the full breakdown →</a>
    </div>
    <div class="card">
      <h2>Upcoming bills</h2>
      <p class="muted">The next bills due in November.</p>
      ${upcoming.length ? `<ul class="bill-list">${upcoming.map((bill) => `
        <li>
          <div><strong>${escapeHtml(bill.name)}</strong><span class="muted"> · due Nov ${bill.dueDay}</span></div>
          <div class="bill-right"><span>${money(bill.amount)}</span>
          <button class="btn small" data-action="toggle-bill" data-id="${bill.id}">Mark paid</button></div>
        </li>`).join('')}</ul>` : '<p class="muted">All bills paid — nicely done.</p>'}
      <a class="link-more" href="#/bills">All bills &amp; calendar →</a>
      <h2 class="subhead">Savings goals</h2>
      ${state.goals.map((goal) => {
        const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
        return `<div class="goal-mini"><span>${escapeHtml(goal.name)}</span><span>${money0(goal.saved)} of ${money0(goal.target)} · ${pct}%</span></div>
        <div class="prog-track slim"><div class="prog-fill" style="width:${pct}%;background:#059669"></div></div>`;
      }).join('')}
      <a class="link-more" href="#/savings">Manage savings goals →</a>
    </div>
  </section>

  <section class="card">
    <h2>Recent expenses</h2>
    <table class="table">
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th></tr></thead>
      <tbody>${recent.map((e) => expenseRow(e, false)).join('')}</tbody>
    </table>
    <a class="link-more" href="#/expenses">See all ${state.expenses.length} expenses →</a>
  </section>`;
}

// ---- Budget planner --------------------------------------------------------

export function renderBudget(state) {
  const income = totalIncome(state);
  const planned = totalPlanned(state);
  const byCat = spentByCategory(state);
  const remaining = income - planned;
  const needsCats = ['Housing', 'Groceries', 'Transport', 'Utilities', 'Health & Fitness', 'Kids & School'];
  const wantsCats = ['Dining Out', 'Entertainment', 'Subscriptions', 'Household & Misc'];
  const sumCats = (cats) => state.budget.filter((b) => cats.includes(b.category)).reduce((s, b) => s + Number(b.planned), 0);
  const needs = sumCats(needsCats);
  const wants = sumCats(wantsCats);
  const savings = sumCats(['Savings']);
  const pct = (v) => income > 0 ? Math.round((v / income) * 100) : 0;

  return `
  <section class="page-head">
    <h1>Monthly budget planner</h1>
    <p class="lede">Plan November's money before you spend it. Edit any figure — totals update instantly and are saved in this browser.</p>
  </section>

  <section class="grid two">
    <div class="card">
      <h2>Income</h2>
      <p class="muted">Money coming in each month.</p>
      <table class="table plain">
        <tbody>${state.income.map((item) => `<tr>
          <td><input class="input inline" data-field="income-source" data-id="${item.id}" value="${escapeHtml(item.source)}" aria-label="Income source"></td>
          <td class="num"><span class="currency">$</span><input class="input inline num" type="number" min="0" step="0.01" data-field="income-amount" data-id="${item.id}" value="${item.amount}" aria-label="Income amount"></td>
          <td class="actions"><button class="btn small danger" data-action="delete-income" data-id="${item.id}">Remove</button></td>
        </tr>`).join('')}</tbody>
      </table>
      <form class="inline-form" data-form="add-income">
        <input class="input" name="source" placeholder="New income source" required>
        <input class="input num" type="number" name="amount" min="0" step="0.01" placeholder="Amount" required>
        <button class="btn" type="submit">Add income</button>
      </form>
      <div class="total-row"><span>Total monthly income</span><strong>${money(income)}</strong></div>
    </div>

    <div class="card">
      <h2>The 50 / 30 / 20 check</h2>
      <p class="muted">A classic rule of thumb: 50% needs, 30% wants, 20% savings. Here's how this plan compares.</p>
      ${progressRows([
        { label: 'Needs', value: needs, max: income, color: '#2563eb', right: `${money0(needs)} · ${pct(needs)}% (aim 50%)` },
        { label: 'Wants', value: wants, max: income, color: '#db2777', right: `${money0(wants)} · ${pct(wants)}% (aim 30%)` },
        { label: 'Savings', value: savings, max: income, color: '#059669', right: `${money0(savings)} · ${pct(savings)}% (aim 20%)` },
      ])}
      <p class="tip">Needs are running a little high at ${pct(needs)}% — mostly the ${money0(state.budget.find((b) => b.category === 'Housing')?.planned || 0)} rent. Every $100 moved from wants to savings shortens the emergency-fund goal by about a month.</p>
    </div>
  </section>

  <section class="card">
    <h2>Spending plan by category</h2>
    <p class="muted">“Planned” is what you set aside; “Spent” is what the expense log shows so far. The bar turns red when a category goes over plan.</p>
    <table class="table budget-table">
      <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Spent</th><th class="num">Remaining</th><th>Progress</th><th></th></tr></thead>
      <tbody>
        ${state.budget.map((item) => {
          const spent = byCat[item.category] || 0;
          const leftCat = item.planned - spent;
          const usePct = item.planned > 0 ? Math.min(100, (spent / item.planned) * 100) : 0;
          return `<tr>
            <td><span class="dot" style="background:${categoryColor(item.category)}"></span> ${item.category}</td>
            <td class="num"><span class="currency">$</span><input class="input inline num" type="number" min="0" step="0.01" data-field="budget-planned" data-id="${item.id}" value="${item.planned}" aria-label="Planned amount for ${item.category}"></td>
            <td class="num">${money(spent)}</td>
            <td class="num ${leftCat < 0 ? 'over' : ''}">${money(leftCat)}</td>
            <td><div class="prog-track"><div class="prog-fill${spent > item.planned ? ' over' : ''}" style="width:${usePct.toFixed(1)}%;background:${categoryColor(item.category)}"></div></div></td>
            <td class="actions">${item.category !== 'Savings' ? `<button class="btn small danger" data-action="delete-category" data-id="${item.id}">Remove</button>` : ''}</td>
          </tr>`;
        }).join('')}
      </tbody>
      <tfoot><tr><td><strong>Total</strong></td><td class="num"><strong>${money(planned)}</strong></td><td class="num"><strong>${money(totalSpent(state))}</strong></td><td class="num"><strong>${money(income - totalSpent(state))}</strong></td><td></td><td></td></tr></tfoot>
    </table>
    <form class="inline-form" data-form="add-category">
      <input class="input" name="category" placeholder="New category name" required>
      <input class="input num" type="number" name="planned" min="0" step="0.01" placeholder="Planned amount" required>
      <button class="btn" type="submit">Add category</button>
    </form>
    <div class="total-row ${remaining < 0 ? 'over' : ''}"><span>Unallocated income (income − planned)</span><strong>${money(remaining)}</strong></div>
    ${remaining < 0 ? '<p class="warning">Your plan spends more than you earn. Lower a category or raise income before the month runs away with you.</p>' : '<p class="tip">Every dollar has a job — including the unallocated ones. Send them to a savings goal and the month is fully planned.</p>'}
  </section>`;
}

// ---- Expense log -----------------------------------------------------------

export function renderExpenses(state, filter = {}) {
  const categories = [...new Set([...state.budget.map((b) => b.category), ...state.expenses.map((e) => e.category)])].sort();
  let list = [...state.expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  if (filter.category) list = list.filter((e) => e.category === filter.category);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter((e) => e.description.toLowerCase().includes(q));
  }
  const shownTotal = list.reduce((s, e) => s + Number(e.amount || 0), 0);
  const editingId = filter.editingId || null;

  return `
  <section class="page-head">
    <h1>Expense log</h1>
    <p class="lede">Every dollar out, in one list. Add, edit or delete — the budget planner and the charts update with it.</p>
  </section>

  <section class="card">
    <h2>Add an expense</h2>
    <form class="form-grid" data-form="add-expense">
      <label>Date <input class="input" type="date" name="date" value="2026-11-26" required></label>
      <label>Description <input class="input" name="description" placeholder="e.g. Weekly shop — FreshMart" required></label>
      <label>Category
        <select class="input" name="category">${categories.map((c) => `<option>${c}</option>`).join('')}</select>
      </label>
      <label>Amount ($) <input class="input num" type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <button class="btn primary" type="submit">Add expense</button>
    </form>
  </section>

  <section class="card">
    <div class="card-head">
      <h2>${list.length} expense${list.length === 1 ? '' : 's'} · ${money(shownTotal)}</h2>
      <div class="filters">
        <select class="input" id="filter-category" aria-label="Filter by category">
          <option value="">All categories</option>
          ${categories.map((c) => `<option ${filter.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <input class="input" id="filter-search" type="search" placeholder="Search descriptions…" value="${escapeHtml(filter.search || '')}" aria-label="Search expenses">
      </div>
    </div>
    ${list.length ? `<table class="table">
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>
        ${list.map((expense) => {
          if (editingId === expense.id) {
            return `<tr class="editing" data-id="${expense.id}">
              <td><input class="input inline" type="date" data-edit="date" value="${expense.date}"></td>
              <td><input class="input inline" data-edit="description" value="${escapeHtml(expense.description)}"></td>
              <td><select class="input inline" data-edit="category">${categories.map((c) => `<option ${c === expense.category ? 'selected' : ''}>${c}</option>`).join('')}</select></td>
              <td class="num"><input class="input inline num" type="number" min="0" step="0.01" data-edit="amount" value="${expense.amount}"></td>
              <td class="actions"><button class="btn small primary" data-action="save-expense" data-id="${expense.id}">Save</button>
              <button class="btn small" data-action="cancel-edit">Cancel</button></td>
            </tr>`;
          }
          return expenseRow(expense, true);
        }).join('')}
      </tbody>
    </table>` : '<p class="muted">No expenses match this filter. Clear the search or add one above.</p>'}
  </section>`;
}

// ---- Bills & calendar ------------------------------------------------------

export function renderBills(state) {
  const [year, month] = state.month.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  const today = 26;
  const billsByDay = {};
  for (const bill of state.bills) (billsByDay[bill.dueDay] ||= []).push(bill);
  const paidTotal = state.bills.filter((b) => b.paid).reduce((s, b) => s + Number(b.amount), 0);
  const dueTotal = state.bills.filter((b) => !b.paid).reduce((s, b) => s + Number(b.amount), 0);

  let cells = '';
  for (let i = 0; i < firstWeekday; i++) cells += '<div class="cal-cell empty"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const dayBills = billsByDay[day] || [];
    const isToday = day === today;
    cells += `<div class="cal-cell${isToday ? ' today' : ''}">
      <span class="cal-day">${day}</span>
      ${dayBills.map((bill) => `<span class="cal-bill${bill.paid ? ' paid' : ''}" title="${escapeHtml(bill.name)} — ${money(bill.amount)}${bill.paid ? ' (paid)' : ''}">${escapeHtml(bill.name)} · ${money0(bill.amount)}</span>`).join('')}
    </div>`;
  }

  const sorted = [...state.bills].sort((a, b) => a.dueDay - b.dueDay);
  return `
  <section class="page-head">
    <h1>Bills &amp; reminders</h1>
    <p class="lede">Never miss a due date. The calendar shows every bill for ${monthLabel(state.month)} — mark one paid and it counts everywhere else on the site.</p>
  </section>

  <section class="stats">
    ${`<div class="stat"><div class="stat-label">Bills this month</div><div class="stat-value">${money0(paidTotal + dueTotal)}</div><div class="stat-sub">${state.bills.length} bills scheduled</div></div>`}
    ${`<div class="stat good"><div class="stat-label">Already paid</div><div class="stat-value">${money0(paidTotal)}</div><div class="stat-sub">${state.bills.filter((b) => b.paid).length} of ${state.bills.length} bills</div></div>`}
    ${`<div class="stat"><div class="stat-label">Still to pay</div><div class="stat-value">${money0(dueTotal)}</div><div class="stat-sub">${state.bills.filter((b) => !b.paid).length} bills left in November</div></div>`}
  </section>

  <section class="card">
    <h2>${monthLabel(state.month)} calendar</h2>
    <div class="calendar" role="grid" aria-label="Bill calendar for ${monthLabel(state.month)}">
      ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="cal-head">${d}</div>`).join('')}
      ${cells}
    </div>
    <p class="muted">Struck-through bills are paid. Today is highlighted — Nov 26.</p>
  </section>

  <section class="card">
    <h2>All bills</h2>
    <table class="table">
      <thead><tr><th>Bill</th><th>Category</th><th class="num">Amount</th><th>Due</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${sorted.map((bill) => {
          const status = bill.paid ? 'Paid' : (bill.dueDay < today ? 'Overdue' : bill.dueDay === today ? 'Due today' : `Due in ${bill.dueDay - today} day${bill.dueDay - today === 1 ? '' : 's'}`);
          return `<tr>
            <td><strong>${escapeHtml(bill.name)}</strong>${bill.autopay ? ' <span class="tag">autopay</span>' : ''}</td>
            <td><span class="chip" style="--chip:${categoryColor(bill.category)}">${bill.category}</span></td>
            <td class="num">${money(bill.amount)}</td>
            <td>Nov ${bill.dueDay}</td>
            <td><span class="status ${bill.paid ? 'paid' : bill.dueDay < today ? 'overdue' : 'due'}">${status}</span></td>
            <td class="actions">
              <button class="btn small" data-action="toggle-bill" data-id="${bill.id}">${bill.paid ? 'Mark unpaid' : 'Mark paid'}</button>
              <button class="btn small danger" data-action="delete-bill" data-id="${bill.id}">Delete</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <form class="form-grid" data-form="add-bill">
      <label>Bill name <input class="input" name="name" placeholder="e.g. Car insurance" required></label>
      <label>Amount ($) <input class="input num" type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <label>Due day <input class="input num" type="number" name="dueDay" min="1" max="31" value="1" required></label>
      <label>Category
        <select class="input" name="category">${Object.keys(CATEGORY_COLORS).map((c) => `<option>${c}</option>`).join('')}</select>
      </label>
      <button class="btn primary" type="submit">Add bill</button>
    </form>
  </section>`;
}

// ---- Savings goals --------------------------------------------------------

export function renderSavings(state) {
  const savingsPlanned = state.budget.find((b) => b.category === 'Savings')?.planned || 0;
  const incomplete = state.goals.filter((g) => g.saved < g.target);
  const monthlyShare = incomplete.length ? savingsPlanned / incomplete.length : 0;
  const totalSaved = state.goals.reduce((s, g) => s + Number(g.saved), 0);
  const totalTarget = state.goals.reduce((s, g) => s + Number(g.target), 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return `
  <section class="page-head">
    <h1>Savings goals</h1>
    <p class="lede">Four goals, ${money0(totalSaved)} saved of ${money0(totalTarget)} (${overallPct}%). The plan sets aside ${money0(savingsPlanned)} a month — split across the goals still open, that's ${money0(monthlyShare)} each.</p>
  </section>

  <section class="grid two goals-grid">
    ${state.goals.map((goal) => {
      const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
      const remaining = Math.max(0, goal.target - goal.saved);
      const monthsLeft = goal.saved >= goal.target ? 0 : Math.ceil(remaining / Math.max(1, monthlyShare));
      return `<div class="card goal-card">
        <div class="goal-head"><h2>${escapeHtml(goal.name)}</h2><span class="goal-pct">${pct}%</span></div>
        <p class="muted">${escapeHtml(goal.note || '')}</p>
        <div class="prog-track tall"><div class="prog-fill" style="width:${pct}%;background:#059669"></div></div>
        <div class="goal-numbers"><span><strong>${money0(goal.saved)}</strong> saved</span><span>Target <strong>${money0(goal.target)}</strong></span></div>
        <p class="muted">${goal.saved >= goal.target
          ? 'Goal reached — time to celebrate, then set the next one.'
          : `${money0(remaining)} to go · about ${monthsLeft} month${monthsLeft === 1 ? '' : 's'} at ${money0(monthlyShare)}/month · target date ${goal.targetDate}`}</p>
        <form class="inline-form" data-form="add-funds" data-id="${goal.id}">
          <input class="input num" type="number" name="amount" min="0.01" step="0.01" placeholder="Add $…" required aria-label="Amount to add to ${escapeHtml(goal.name)}">
          <button class="btn" type="submit">Add funds</button>
        </form>
        <button class="btn small danger" data-action="delete-goal" data-id="${goal.id}">Delete goal</button>
      </div>`;
    }).join('')}
  </section>

  <section class="card">
    <h2>Start a new goal</h2>
    <form class="form-grid" data-form="add-goal">
      <label>Goal name <input class="input" name="name" placeholder="e.g. New laptop" required></label>
      <label>Target amount ($) <input class="input num" type="number" name="target" min="1" step="0.01" placeholder="0.00" required></label>
      <label>Already saved ($) <input class="input num" type="number" name="saved" min="0" step="0.01" value="0"></label>
      <label>Target date <input class="input" type="date" name="targetDate" value="2027-12-31"></label>
      <label>Note <input class="input" name="note" placeholder="What is it for?"></label>
      <button class="btn primary" type="submit">Create goal</button>
    </form>
  </section>`;
}

// ---- Reports ---------------------------------------------------------------

export function renderReports(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const history = state.history.map((row) => row.month === state.month
    ? { ...row, spent }
    : row);
  const byCat = spentByCategory(state);
  const biggest = [...state.expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const avgSpent = history.reduce((s, r) => s + r.spent, 0) / history.length;
  const avgSaved = history.reduce((s, r) => s + (r.income - r.spent), 0) / history.length;

  const comparison = state.budget.map((item) => ({
    label: item.category,
    planned: Number(item.planned),
    actual: byCat[item.category] || 0,
  }));

  return `
  <section class="page-head">
    <h1>Reports</h1>
    <p class="lede">Five months at a glance. November's spending is live — it grows as expenses are logged.</p>
  </section>

  <section class="stats">
    ${`<div class="stat"><div class="stat-label">Average monthly spend</div><div class="stat-value">${money0(avgSpent)}</div><div class="stat-sub">Jul – Nov 2026</div></div>`}
    ${`<div class="stat good"><div class="stat-label">Average monthly saved</div><div class="stat-value">${money0(avgSaved)}</div><div class="stat-sub">${income > 0 ? Math.round((avgSaved / income) * 100) : 0}% of income</div></div>`}
    ${`<div class="stat"><div class="stat-label">Biggest month</div><div class="stat-value">${money0(Math.max(...history.map((r) => r.spent)))}</div><div class="stat-sub">${shortMonthLabel(history.reduce((a, b) => (a.spent > b.spent ? a : b)).month)} 2026</div></div>`}
  </section>

  <section class="card">
    <h2>Income vs spending, Jul – Nov 2026</h2>
    <p class="muted">Blue bars are income, green bars are what was spent. November is still in progress.</p>
    ${barChart(history.flatMap((row) => [
      { label: shortMonthLabel(row.month), value: row.income, color: '#2563eb' },
      { label: '', value: row.spent, color: '#059669' },
    ]).map((b, i) => ({ ...b, label: i % 2 === 0 ? b.label : '' })), { height: 240 })}
    <p class="muted">Blue = income · Green = spending. Each month shows income first, then spending.</p>
  </section>

  <section class="grid two">
    <div class="card">
      <h2>Planned vs actual — November</h2>
      <p class="muted">Green is inside plan; red is over.</p>
      ${comparison.map((row) => {
        const over = row.actual > row.planned;
        return `<div class="compare-row">
          <div class="compare-head"><span>${row.label}</span><span>${money0(row.actual)} / ${money0(row.planned)}</span></div>
          <div class="prog-track"><div class="prog-fill${over ? ' over' : ''}" style="width:${row.planned > 0 ? Math.min(100, (row.actual / row.planned) * 100).toFixed(1) : 0}%;background:${over ? '#dc2626' : categoryColor(row.label)}"></div></div>
        </div>`;
      }).join('')}
    </div>
    <div class="card">
      <h2>Biggest single expenses</h2>
      <p class="muted">November's largest outgoings.</p>
      <ol class="ranked">
        ${biggest.map((e) => `<li><span>${escapeHtml(e.description)} <span class="muted">· ${e.date} · ${e.category}</span></span><strong>${money(e.amount)}</strong></li>`).join('')}
      </ol>
      <h2 class="subhead">Month by month</h2>
      <table class="table plain">
        <thead><tr><th>Month</th><th class="num">Income</th><th class="num">Spent</th><th class="num">Saved</th></tr></thead>
        <tbody>${history.map((row) => `<tr><td>${monthLabel(row.month)}</td><td class="num">${money(row.income)}</td><td class="num">${money(row.spent)}</td><td class="num">${money(row.income - row.spent)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  </section>`;
}
