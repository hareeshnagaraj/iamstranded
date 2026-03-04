# iamstranded

I started this after getting stranded in Dubai on the way to Athens during an international conflict.
Everything was noisy, conflicting, and changing every hour. I wanted one place to check what matters and decide the next move.

This app is that attempt.

## What it does

- Shows a live intel feed for a crisis slug
- Lists nearby airports with status
- Shows emergency contacts
- Returns route options from an origin to a destination
- Falls back to mock data if Supabase is not configured

The landing page redirects to:

- `/crisis/uae-airspace-closure`

## API endpoints

- `GET /api/feed?slug=...`
- `GET /api/status?slug=...`
- `GET /api/offline-packet?slug=...`
- `GET /api/routes?slug=...&origin=...&destination=...`

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Env vars

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

If these are missing, the app still works with built-in fixture data.

## Supabase

1. Run the SQL in [`supabase/schema.sql`](./supabase/schema.sql).
2. Seed data using [`supabase/seed.sql`](./supabase/seed.sql).

## Stack

- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Supabase
- Lucide React

## Note

This is a decision-support tool, not official travel or government guidance.
If you are in real danger, follow local authorities, embassy instructions, and emergency services first.
