# SharpBets — Free Play Sports Arena

A mobile-first React + Tailwind sports betting **UI prototype** built with Next.js and mock data. SharpBets is strictly free-to-play: it has no payment processing, deposits, withdrawals, cash-value balances, or real-money betting.

## Features

- Responsive sports dashboard with Live Now, Football, Basketball, Tennis, Baseball, Esports and Upcoming filters
- Twelve mock fixtures with simulated scores/clocks and odds that update every 3.5 seconds
- Green/red odds movement feedback and live match badges
- Featured match with a statistics strip and a Bet Builder shortcut
- Desktop right-rail bet slip and mobile slide-up bet slip
- Virtual balance, quick stake chips, potential payout and local demo bet history
- My Bets views for Open, Settled and Cash Out
- Local demo credit top-up (no payment provider)
- Dark/light theme toggle
- Responsible-play settings, session reminders and support resource link
- Local browser storage only; no shared accounts or server-side wallet

## Run locally

Requirements: Node.js 18.17+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm start
```

## Important prototype boundaries

- Match data, odds, scores and game clocks are mock/simulated. They are not a live sports data feed.
- Virtual credits have no monetary value and cannot be purchased, withdrawn, transferred or redeemed.
- The “Add demo credits” action only increases a local virtual balance.
- Demo bets are stored in the visitor's browser and are not synchronized across devices or users.
- Profile and responsible-play settings are local UI preferences, not a verified account or regulated responsible-gambling system.
- The support link points to Gambling Therapy; this demo does not operate a helpline.

## Stack

- Next.js 14 App Router (React)
- TypeScript
- Tailwind CSS 3
- lucide-react icons
- Mock fixture data and browser localStorage

## License

This repository contains a UI prototype. Add your own chosen open-source or proprietary licence before redistributing.
