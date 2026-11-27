// Nest Egg — views.
// One clear job: turn state into HTML for each hash route. Views never mutate
// state directly; they call the handlers main.js wires up after render.

import {
  HOUSEHOLD, MONTH_HISTORY, billsDueTotal, categoryColor, categoryLabel,
  money, money0, pct, recentTransactions, spentByCategory, totalBudget,
  totalIncome, totalSpent, upcomingBills,
} from './data.js';
import { barChart, donutChart, legend, progressBar } from './charts.js';

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function statCard(label, value, sub, tone) {
  return '<div class="stat ' + (tone || '') + '"><span class="stat-label">' + label +
    '</span><strong class="stat-value">' + value + '</strong><span class="stat-sub">' + sub + '</span></div>';
}

function txRow(state, tx) {
  const neg = tx.amount < 0;
  return '<li class="tx"><span class="tx-ic" style="background:' +
    categoryColor(state, tx.category) + '22;color:' + categoryColor(state, tx.category) + '">' +
    (neg ? '↓' : '↑') + '</span><span class="tx-main"><b>' + esc(tx.label) + '</b><small>' +
    esc(tx.date) + ' · ' + esc(categoryLabel(state, tx.category)) + '</small></span><span class="tx-amt ' +
    (neg ? 'in' : 'out') + '">' + (neg ? '+' : '−') + money(Math.abs(tx.amount)) + '</span></li>';
}

export function dashboardView(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const saved = income - spent;
  const budget = totalBudget(state);
  const spentMap = spentByCategory(state);
  const donutRows = state.budgets
    .map((row) => ({ label: row.label, value: Math.round(spentMap[row.id] || 0), color: row.color }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);
  const donutData = donutRows.map((row) => ({ ...row, valueText: money0(row.value) }));
  const bills = upcomingBills(state, 27);
  const recent = recentTransactions(state, 6);
  const goalsTotal = state.goals.reduce((s, g) => s + g.saved, 0);
  const goalsTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const dueTotal = billsDueTotal(state);
  const dueText = dueTotal === 0 ? 'no bills' : money(dueTotal) + ' of bills';

  return '' +
    '<section class="hero"><div><p class="eyebrow">November 2026 · ' + esc(HOUSEHOLD.members.join(', ')) + '</p>' +
    '<h1>Good evening, ' + esc(HOUSEHOLD.name) + '</h1>' +
    '<p class="lede">You have <b>' + money(income - spent) + '</b> left to spend this month, and ' +
    '<b>' + dueText + '</b> still to pay. ' +
    'You are ' + pct(spent, budget) + '% through the plan — right on track.</p>' +
    '<p class="hero-actions"><a class="btn primary" href="#/planner">Adjust the plan</a> ' +
    '<a class="btn" href="#/bills">Pay a bill</a></p></div>' +
    '<div class="hero-card"><span class="stat-label">Money left this month</span>' +
    '<strong class="big-money">' + money(income - spent) + '</strong>' +
    '<span class="stat-sub">of ' + money(income) + ' coming in · ' + money(spent) + ' spent</span>' +
    progressBar(pct(spent, budget), '#2f6f5e') +
    '<span class="stat-sub">' + pct(spent, budget) + '% of the ' + money0(budget) + ' plan used</span></div></section>' +

    '<section class="stats">' +
    statCard('Income', money(income), '3 paydays this month', 'good') +
    statCard('Spent so far', money(spent), money0(budget) + ' planned', '') +
    statCard('Saved this month', money(saved), pct(saved, income) + '% of income kept', 'good') +
    statCard('Bills still due', money(billsDueTotal(state)), state.bills.filter((b) => !b.paid).length + ' bills unpaid', 'warn') +
    '</section>' +

    '<section class="grid-2">' +
    '<div class="card"><h2>Where the money went</h2><div class="donut-wrap">' +
    donutChart(donutRows, 168) + legend(donutData) + '</div>' +
    '<p class="hint">' + donutRows[0].label + ' is the biggest slice at ' + money0(donutRows[0].value) +
    ' — rent plus a $14.60 tap repair this month.</p></div>' +
    '<div class="card"><h2>Spending, last 6 months</h2>' +
    barChart(MONTH_HISTORY.map((m) => ({ label: m.month, value: m.spent })), 520, 220) +
    '<p class="hint">November is the cheapest month so far: $1,025 less than September, the dearest.</p></div>' +
    '</section>' +

    '<section class="grid-2">' +
    '<div class="card"><h2>Coming up <a class="more" href="#/bills">All bills →</a></h2>' +
    (bills.length ? '<ul class="bills-mini">' + bills.map((b) =>
      '<li><span><b>' + esc(b.label) + '</b><small>Due Nov ' + b.due + ' · ' + esc(b.recurring) + '</small></span>' +
      '<b>' + money(b.amount) + '</b></li>').join('') + '</ul>'
      : '<p class="hint">Nothing left due this month. Nicely done.</p>') +
    '<h2 class="sub">Savings goals</h2><p class="hint">' + money0(goalsTotal) + ' saved toward ' + money0(goalsTarget) +
    ' across ' + state.goals.length + ' goals.</p>' +
    state.goals.slice(0, 2).map((g) =>
      '<div class="goal-mini"><span><b>' + esc(g.label) + '</b><small>' + money0(g.saved) + ' of ' + money0(g.target) + '</small></span>' +
      progressBar(pct(g.saved, g.target), '#d98e2b') + '</div>').join('') +
    '<p><a class="more" href="#/goals">All goals →</a></p></div>' +
    '<div class="card"><h2>Recent spending <a class="more" href="#/spending">All spending →</a></h2>' +
    '<ul class="tx-list">' + recent.map((tx) => txRow(state, tx)).join('') + '</ul></div>' +
    '</section>';
}

export function plannerView(state) {
  const spentMap = spentByCategory(state);
  const budget = totalBudget(state);
  const spent = totalSpent(state);
  const rows = state.budgets.map((row) => {
    const used = spentMap[row.id] || 0;
    const left = row.budget - used;
    const over = used > row.budget;
    return '<article class="plan-row"><span class="plan-ic" style="background:' + row.color + '22;color:' + row.color + '">' +
      row.icon + '</span><div class="plan-main"><div class="plan-top"><b>' + esc(row.label) + '</b>' +
      '<span>' + money(used) + ' of ' + money0(row.budget) + '</span></div>' +
      progressBar(pct(used, row.budget), over ? '#b5543f' : row.color) +
      '<small class="' + (over ? 'over' : 'left') + '">' + (over ? 'Over by ' + money(used - row.budget) + ' — move money or trim this week' : money(left) + ' left') + '</small></div>' +
      '<label class="plan-edit">Monthly limit $<input type="number" min="0" step="10" value="' + row.budget +
      '" data-budget="' + row.id + '" aria-label="Monthly limit for ' + esc(row.label) + '"></label></article>';
  }).join('');

  return '' +
    '<section class="page-head"><div><p class="eyebrow">Budget planner · November 2026</p>' +
    '<h1>Plan the month, then live inside it</h1>' +
    '<p class="lede">Set a limit for each pot. Spending is counted from your transactions, so the bars move as you spend. ' +
    'Limits save automatically when you change a number.</p></div>' +
    '<div class="hero-card"><span class="stat-label">Planned vs spent</span>' +
    '<strong class="big-money">' + money(spent) + ' <small>/ ' + money0(budget) + '</small></strong>' +
    progressBar(pct(spent, budget), '#2f6f5e') +
    '<span class="stat-sub">' + money(budget - spent) + ' still unspent · ' + pct(spent, budget) + '% used</span></div></section>' +
    '<section class="card"><h2>Your pots</h2>' + rows + '</section>' +
    '<section class="grid-2"><div class="card"><h2>How the plan is built</h2>' +
    '<p>Income this month is <b>' + money(totalIncome(state)) + '</b>. The plan keeps <b>' +
    money(totalIncome(state) - budget) + '</b> unassigned — that is the safety cushion, and it becomes savings on the 30th.</p>' +
    '<p>Rule of thumb the family uses: housing under 30% of income, food under 15%, and at least 10% straight to savings before anything else.</p></div>' +
    '<div class="card"><h2>Income this month</h2><ul class="bills-mini">' +
    state.income.map((row) => '<li><span><b>' + esc(row.label) + '</b><small>Paid on the ' + row.day + 'th</small></span><b>' + money(row.amount) + '</b></li>').join('') +
    '</ul><p class="hint">Total ' + money(totalIncome(state)) + ' · next payday: market stall, Nov 22.</p></div></section>';
}

export function billsView(state) {
  const year = 2026;
  const month = 10; // November, 0-based
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = 30;
  const byDay = {};
  for (const bill of state.bills) {
    (byDay[bill.due] = byDay[bill.due] || []).push(bill);
  }
  let cells = '';
  for (let i = 0; i < firstWeekday; i++) cells += '<td class="cal-blank"></td>';
  for (let day = 1; day <= daysInMonth; day++) {
    const list = byDay[day] || [];
    const today = day === 27;
    cells += '<td class="' + (today ? 'cal-today' : '') + '"><span class="cal-day">' + day + '</span>' +
      list.map((b) => '<span class="cal-bill ' + (b.paid ? 'paid' : 'due') + '" title="' + esc(b.label) + ' — ' + money(b.amount) + '">' +
        (b.paid ? '✓ ' : '• ') + esc(b.label.split(' — ')[0]) + ' ' + money0(b.amount) + '</span>').join('') + '</td>';
    if ((firstWeekday + day) % 7 === 0) cells += '</tr><tr>';
  }
  const rows = '<tr>' + cells + '</tr>';
  const unpaid = state.bills.filter((b) => !b.paid);
  const paid = state.bills.filter((b) => b.paid);

  return '' +
    '<section class="page-head"><div><p class="eyebrow">Bills calendar · November 2026</p>' +
    '<h1>Every bill, on the day it lands</h1>' +
    '<p class="lede"><b>' + unpaid.length + ' bills</b> still to pay (' + money(billsDueTotal(state)) + '). ' +
    paid.length + ' already paid. Tick a bill off the moment it leaves the account.</p></div>' +
    '<div class="hero-card"><span class="stat-label">Due before Dec 1</span>' +
    '<strong class="big-money">' + money(billsDueTotal(state)) + '</strong>' +
    '<span class="stat-sub">Next: ' + (unpaid.length ? esc(unpaid.slice().sort((a, b) => a.due - b.due)[0].label) + ' — Nov ' + unpaid.slice().sort((a, b) => a.due - b.due)[0].due : 'nothing') + '</span></div></section>' +
    '<section class="card"><h2>November 2026</h2>' +
    '<table class="calendar"><thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody>' + rows + '</tbody></table>' +
    '<p class="hint">✓ = paid &nbsp;• = still due &nbsp;·&nbsp; Today is Nov 27 (highlighted).</p></section>' +
    '<section class="grid-2"><div class="card"><h2>Still to pay</h2><ul class="bills-mini">' +
    unpaid.map((b) => '<li><span><b>' + esc(b.label) + '</b><small>Due Nov ' + b.due + ' · ' + esc(b.recurring) + '</small></span>' +
      '<span class="bill-right"><b>' + money(b.amount) + '</b><button class="btn small" data-pay="' + b.id + '">Mark paid</button></span></li>').join('') +
    '</ul></div>' +
    '<div class="card"><h2>Already paid</h2><ul class="bills-mini">' +
    paid.map((b) => '<li><span><b>' + esc(b.label) + '</b><small>Paid · Nov ' + b.due + '</small></span><b>' + money(b.amount) + '</b></li>').join('') +
    '</ul>' +
    '<form id="add-bill" class="mini-form"><h3>Add a bill</h3>' +
    '<label>Bill name <input name="label" required maxlength="60" placeholder="e.g. Piano lessons"></label>' +
    '<label>Amount $ <input name="amount" type="number" min="1" step="0.01" required placeholder="45"></label>' +
    '<label>Due day <input name="due" type="number" min="1" max="30" required placeholder="14"></label>' +
    '<button class="btn primary" type="submit">Add bill</button></form></div></section>';
}

export function spendingView(state, filter) {
  const spentMap = spentByCategory(state);
  const cats = [{ id: 'all', label: 'All spending' }].concat(state.budgets);
  const list = [...state.transactions]
    .filter((tx) => tx.amount > 0)
    .filter((tx) => filter === 'all' || tx.category === filter)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const shownTotal = list.reduce((s, tx) => s + tx.amount, 0);
  const biggest = Object.entries(spentMap).sort((a, b) => b[1] - a[1])[0] || ['groceries', 0];

  return '' +
    '<section class="page-head"><div><p class="eyebrow">Spending · November 2026</p>' +
    '<h1>Every dollar out, in one list</h1>' +
    '<p class="lede">Showing <b>' + list.length + ' purchases</b> totalling <b>' + money(shownTotal) + '</b>. ' +
    'Add a purchase below and the dashboard, planner and totals update at once.</p></div>' +
    '<div class="hero-card"><span class="stat-label">Biggest pot so far</span>' +
    '<strong class="big-money">' + money0(biggest[1]) + '</strong>' +
    '<span class="stat-sub">' + esc(categoryLabel(state, biggest[0])) + ' leads the month — see the planner to rebalance.</span></div></section>' +
    '<section class="card"><div class="filters">' +
    cats.map((c) => '<a class="chip' + (filter === c.id ? ' on' : '') + '" href="#/spending/' + c.id + '">' + esc(c.label) + '</a>').join('') +
    '</div><ul class="tx-list big">' + list.map((tx) =>
      '<li class="tx"><span class="tx-ic" style="background:' + categoryColor(state, tx.category) + '22;color:' + categoryColor(state, tx.category) + '">↑</span>' +
      '<span class="tx-main"><b>' + esc(tx.label) + '</b><small>' + esc(tx.date) + ' · ' + esc(categoryLabel(state, tx.category)) + '</small></span>' +
      '<span class="tx-amt out">−' + money(tx.amount) + '</span>' +
      '<button class="btn small ghost" data-del-tx="' + tx.id + '" aria-label="Delete ' + esc(tx.label) + '">Delete</button></li>').join('') +
    '</ul></section>' +
    '<section class="card"><form id="add-tx" class="form-grid"><h2>Add a purchase</h2>' +
    '<label>What was it? <input name="label" required maxlength="60" placeholder="e.g. GreenMart weekly shop"></label>' +
    '<label>Amount $ <input name="amount" type="number" min="0.01" step="0.01" required placeholder="42.50"></label>' +
    '<label>Category <select name="category">' + state.budgets.map((b) => '<option value="' + b.id + '">' + esc(b.label) + '</option>').join('') + '</select></label>' +
    '<label>Date <input name="date" type="date" value="2026-11-27" required></label>' +
    '<button class="btn primary" type="submit">Add purchase</button></form></section>';
}

export function goalsView(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return '' +
    '<section class="page-head"><div><p class="eyebrow">Savings goals</p>' +
    '<h1>What the family is saving for</h1>' +
    '<p class="lede"><b>' + money0(totalSaved) + '</b> saved toward <b>' + money0(totalTarget) + '</b> — ' +
    pct(totalSaved, totalTarget) + '% of the way there. Add money to a goal and the bar moves straight away.</p></div>' +
    '<div class="hero-card"><span class="stat-label">Saved this month</span>' +
    '<strong class="big-money">' + money(totalIncome(state) - totalSpent(state)) + '</strong>' +
    '<span class="stat-sub">Unspent income lands here on the 30th unless you move it sooner.</span></div></section>' +
    '<section class="goals">' + state.goals.map((g) =>
      '<article class="card goal"><h2>' + esc(g.label) + '</h2><p class="hint">' + esc(g.note) + '</p>' +
      '<strong class="big-money">' + money0(g.saved) + ' <small>/ ' + money0(g.target) + '</small></strong>' +
      progressBar(pct(g.saved, g.target), '#d98e2b') +
      '<span class="stat-sub">' + pct(g.saved, g.target) + '% · ' + money(g.target - g.saved) + ' to go</span>' +
      '<form class="add-save" data-goal="' + g.id + '"><label>Add $ <input type="number" min="1" step="1" required placeholder="25"></label>' +
      '<button class="btn primary small" type="submit">Add to goal</button></form></article>').join('') + '</section>' +
    '<section class="card"><form id="add-goal" class="form-grid"><h2>Start a new goal</h2>' +
    '<label>Goal name <input name="label" required maxlength="50" placeholder="e.g. Christmas gifts"></label>' +
    '<label>Target $ <input name="target" type="number" min="1" step="10" required placeholder="500"></label>' +
    '<label>Note <input name="note" maxlength="80" placeholder="Why this matters"></label>' +
    '<button class="btn primary" type="submit">Create goal</button></form></section>';
}

export function tipsView() {
  return '' +
    '<section class="page-head"><div><p class="eyebrow">Money guides</p>' +
    '<h1>Small habits that keep a household ahead</h1>' +
    '<p class="lede">Written for a family of four on $5,850 a month — no jargon, just what works.</p></div></section>' +
    '<section class="grid-2">' +
    '<article class="card"><h2>1 · Pay yourself first</h2><p>Move savings on payday, before spending starts. This household moves $150 to the emergency fund on the 1st and 15th — it is already at $4,210 of $6,000.</p></article>' +
    '<article class="card"><h2>2 · One weekly shop</h2><p>Groceries are the biggest flexible pot. One planned shop a week, with a list, beats five small trips. November shops so far: $96.40, $112.30, $88.15, $104.55.</p></article>' +
    '<article class="card"><h2>3 · Bills on the calendar</h2><p>Every recurring bill gets a due day on the bills calendar. Nothing is “due soon” — it is due Nov 15, or Nov 27, and the tick box proves it was paid.</p></article>' +
    '<article class="card"><h2>4 · A 24-hour rule</h2><p>Any non-essential buy over $50 waits a day. Most of them never happen — and the ones that do are the ones the family actually wanted.</p></article>' +
    '<article class="card"><h2>5 · Review on the 30th</h2><p>Ten minutes at month end: which pot went over, and why? October went over on dining by $38 — November’s dining pot is $240, and it is holding.</p></article>' +
    '<article class="card"><h2>6 · Keep a cushion</h2><p>The plan leaves $2,230 unassigned each month. That cushion is what turns a broken washing machine into an annoyance instead of a crisis.</p></article>' +
    '</section>';
}
