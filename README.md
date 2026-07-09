# STG Command Center

Private internal operations dashboard for Spencer Technology Group.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Prisma 6
- Neon PostgreSQL
- Basic Auth middleware

## Current Mode

The app is intentionally read-only. It can inspect and link operational records,
but it does not update statuses, send emails, generate PDFs, resolve tickets,
modify subscriptions, or write database records.

## Live Modules

- Dashboard with summary cards and action queue
- Global search
- Requests inbox and detail pages
- Agreements inbox and detail pages
- Support tickets inbox and detail pages
- Clients list and profile pages based on signed maintenance agreements
- Subscriptions page with active/trialing separation
- Notifications feed
- Settings and database health

## Business Rules

- Real client count comes from signed `MaintenanceAgreement` records.
- `ClientAccount` records are not counted as real clients yet.
- MRR comes from signed agreement monthly rates plus active subscription plan pricing.
- Active subscriptions only count `active`/`ACTIVE`; trialing subscriptions are separate.

## Development

```bash
npm run dev -- -p 3004
```

## Verification

```bash
npm run lint
npm run build
```
