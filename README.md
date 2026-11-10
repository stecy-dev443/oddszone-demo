# SharpBets — virtual-credit sportsbook

SharpBets is a free-to-play sportsbook-style platform. Real-money wagering, deposits, withdrawals, payment processing and cash-value balances are intentionally disabled.

## Stack
- Next.js 15 App Router + React 19
- Better Auth email/password sessions and password-reset flow
- Neon Postgres + Drizzle ORM
- Server-side virtual wallet ledger and transactional bet placement
- The Odds API adapter for provider-backed fixtures, odds and available scores
- Admin-only fixture/result management and bet settlement
- Persistent responsible-play limits, cool-off and self-exclusion

## Required Vercel environment
- `DATABASE_URL` — Neon pooled connection string (created by the Vercel Marketplace integration)
- `BETTER_AUTH_SECRET` — generated secret (already configured in Vercel)
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` — production app URL (already configured for production)
- `ADMIN_EMAIL` — email address that receives the initial admin role on signup
- `ODDS_API_KEY` — The Odds API key, server-side only
- `RESEND_API_KEY` and `EMAIL_FROM` — verified sender for password recovery emails

## Setup
Connect Neon Postgres from Vercel Marketplace and select this project for production, preview and development. Then add the provider and mail environment variables above. Locally, copy .env.example to .env.local and run:
```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

## API
- GET /api/health — readiness and missing configuration
- /api/auth/* — Better Auth registration, login, logout and password reset
- GET /api/sports — provider-backed fixtures, h2h odds and available live scores
- GET /api/wallet — authenticated virtual wallet and ledger
- POST /api/wallet — claim daily free virtual credits
- GET /api/bets — account bet history
- POST /api/bets — transactional virtual bet placement with daily stake/cool-off checks
- GET/PATCH /api/admin/fixtures — admin fixture management
- POST /api/admin/settle — admin settlement and virtual-credit payouts
- GET/PUT /api/responsible-play — account-level limits and exclusions
- /api/payments — intentionally disabled (HTTP 410)

The starter sports-data quota is limited; tune `SPORTS_CACHE_SECONDS` and `NEXT_PUBLIC_SPORTS_REFRESH_MS` to match the provider plan. The 15-minute default is designed around a paid 20,000-credit tier, not the very small free quota.\n\n## Current setup status
The code and preview deployment are in place. The Vercel project still needs Neon Postgres and the sports-provider API key before account storage, betting and live markets can operate. Password-reset emails need a verified sender through Resend. Configure `ADMIN_EMAIL` before creating the first administrator.

## Safety boundary
Virtual credits have no monetary value and cannot be purchased, withdrawn, transferred or redeemed. This is not a real-money bookmaker.
