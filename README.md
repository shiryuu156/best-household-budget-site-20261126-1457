# Nest Egg — Household Budget Planner

A household budget site that runs entirely in the browser from static files:
no build step, no network requests, no account. Open `app/index.html` (or serve
`app/` with any static server) on a desktop or a phone and it works.

## What's inside

Six pages, every one reached by a link in the top navigation, each one working:

- **Dashboard** — the month at a glance: income, spent so far, planned budget,
  savings rate, a spending-breakdown donut chart, upcoming bills, savings-goal
  progress and recent expenses.
- **Budget Planner** — editable monthly income and a spending plan per
  category, with planned vs. spent vs. remaining and a 50/30/20 check. Add or
  remove income sources and categories; totals update instantly.
- **Expense Log** — add, edit and delete expenses, filter by category and
  search descriptions. Every change flows into the planner, charts and reports.
- **Bills & Calendar** — a November 2026 calendar with every bill on its due
  day, a bill list with Paid / Due / Overdue status, mark-paid toggles and an
  add-bill form.
- **Savings Goals** — four goals with progress bars, amounts saved vs. target,
  an estimated finish date at the current monthly savings rate, add-funds
  forms and a create-goal form.
- **Reports** — income vs. spending bar chart (Jul–Nov 2026), planned vs.
  actual per category, biggest single expenses and a month-by-month table.

## The figures

The site ships with a realistic **example household** — the Alvarez family,
November 2026, $6,850/month income — clearly labelled as an example, so every
page shows real numbers on first load. Edit anything and it is saved in the
browser's local storage; the footer has a "Reset example data" button.

## Files

- `app/` — the site: `index.html`, `style.css`, `app.js` (router + wiring),
  `views.js` (the six pages), `data.js` (example data + state), `charts.js`
  (inline-SVG charts). No libraries, no external files.
- `main.ts` — the make.fun entry program (Node 22): copies `app/` and
  `screenshots/` to `/output` and writes `dossier.json` with
  `vendor/makefun-frontend.ts` (copied from the kit, unchanged).
- `serve.ts` — tiny local static server: `node serve.ts`, then open
  http://localhost:8080.
- `screenshots/` — 4 real renders of the site (3 desktop, 1 phone).
  Re-rendered post-opening with `node shots.mjs` (own script: serves `app/`
  via `serve.ts`, captures each route in `shots.json` with Playwright
  Chromium); two runs produce byte-identical files.
- `shots.json` — which view and viewport each screenshot was taken at.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
# or: open app/index.html directly in a browser
```

## License

MIT — see `LICENSE`.
