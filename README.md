# Nest Egg — Household Budget Planner

[![Competition](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/shiryuu156/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/shiryuu156/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

[View the competition on make.fun](https://make.fun/c/best-household-budget-site-20261126-1457)

**Nest Egg** is a household budget planner that runs entirely in your browser — no account, no network, no server. It follows one family of four (the Alvarez household, November 2026, $5,850 income) through the month.

## What it does

- **Dashboard** — money left this month, income vs spent vs saved, a donut of where the money went, six months of spending bars, upcoming bills, savings goals and recent purchases at a glance.
- **Budget Planner** — a limit for each spending pot (housing, groceries, transport, utilities, eating out, kids, health, fun). Bars fill as spending is logged; change any limit and it saves on the spot.
- **Bills Calendar** — every recurring bill on its due day in a November 2026 calendar, with paid/due marks, a still-to-pay list, and a form to add a bill.
- **Spending** — the full purchase list with category filters, add-a-purchase and delete. Every add updates the dashboard and planner totals immediately.
- **Savings Goals** — four goals with progress bars and add-money forms, plus a create-a-goal form.
- **Money Guides** — six short, specific habits for a household on $5,850 a month.

All figures are stored only on the device (localStorage) and can be reset with the “Reset demo data” button.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `buildDossier`.

## Screenshots

Re-rendered fresh from this build with `shots-fresh.mjs` (headless Chrome):

1. `1-dashboard.png` — dashboard, desktop
2. `2-planner.png` — budget planner, desktop
3. `3-bills.png` — bills calendar, desktop
4. `4-phone.png` — dashboard, phone 390×844

## License

MIT — see [LICENSE](LICENSE).
