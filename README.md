# SharpBets — virtual-credit sportsbook

SharpBets is a free-to-play sportsbook-style platform. Real-money wagering, deposits, withdrawals, payment processing and cash-value balances are intentionally disabled.

## Stack
- Next.js 15 App Router + React 19
- Better Auth email/password sessions
- Neon Postgres + Drizzle ORM
- Server-side virtual wallet ledger and transactional bet placement
- The Odds API provider adapter (requires an API key)
- Admin-only fixture management

## Required Vercel environment
- DATABASE_URL — Neon pooled connection string
- BETTER_AUTH_SECRET — random secret of at least 32 bytes
- BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL — deployed app URL
- ADMIN_EMAIL — initial admin account email
- ODDS_API_KEY — The Odds API key, server-side only

## Setup
Connect Neon Postgres from Vercel Marketplace, then add the variables above. Locally, copy .env.example to .env.local and run:
```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

## API
- GET /api/health — readiness checks
- /api/auth/* — Better Auth registration and login
- GET /api/sports — provider-backed fixtures and h2h odds
- GET /api/wallet — authenticated wallet and ledger
- POST /api/wallet — claim daily free virtual credits
- GET /api/bets — account bet history
- POST /api/bets — transactional virtual bet placement
- GET/PATCH /api/admin/fixtures — admin fixture management
- /api/payments — intentionally disabled (HTTP 410)

## Current setup status
At the time this backend foundation was added, the Vercel project had no connected database integration and no environment variables. The health endpoint reports missing setup rather than silently using fake data. Password-reset email delivery requires a mail provider before that feature can be enabled.

## Safety boundary
Virtual credits have no monetary value and cannot be purchased, withdrawn, transferred or redeemed. This is not a real-money bookmaker.
