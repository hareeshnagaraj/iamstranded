# Crisis Routing Instrument

Mission-critical MVP for stranded travelers, built with Next.js App Router, Tailwind CSS, and Supabase.

## Stack

- Next.js 14
- Tailwind CSS
- Supabase (Postgres + Realtime)
- Lucide React (minimal icons)

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

If env vars are absent, the app falls back to resilient built-in crisis fixture data.

## Supabase Setup

Apply [`supabase/schema.sql`](./supabase/schema.sql) in Supabase SQL editor, then insert operator records in Supabase Studio.

## API Endpoints

- `GET /api/feed`
- `GET /api/status`
- `GET /api/offline-packet`
