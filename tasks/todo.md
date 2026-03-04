# iamstranded — Full Rebuild

## Phase 1: Schema
- [x] Rewrite `supabase/schema.sql` with 6 new tables
- [x] Create `supabase/seed.sql` with UAE airspace closure scenario

## Phase 2: Types & Data Layer
- [x] Rewrite `types/crisis.ts` with new interfaces
- [x] Rewrite `lib/mock-data.ts` with new mock data shapes
- [x] Rewrite `lib/crisis-data.ts` with new Supabase queries
- [x] Update `lib/region-resolver.ts` for new types

## Phase 3: Design System
- [x] Rewrite `tailwind.config.ts` with waypoint.jsx color tokens
- [x] Update `app/globals.css` base styles
- [x] Update `app/layout.tsx` — drop Playfair, rebrand to iamstranded

## Phase 4: Components
- [x] `components/ui/badge.tsx` — status badge
- [x] `components/ui/filter-chips.tsx` — category filters
- [x] `components/header.tsx` — brand + LIVE indicator
- [x] `components/footer.tsx` — disclaimer
- [x] `components/crisis-banner.tsx` — crisis info + search form
- [x] `components/loading-shimmer.tsx` — skeleton cards
- [x] `components/route-card.tsx` — ranked route with legs
- [x] `components/route-list.tsx` — route card container
- [x] `components/airport-table.tsx` — airport status board
- [x] `components/live-intel-feed.tsx` — categorized feed with filters
- [x] `components/emergency-contacts.tsx` — contact cards
- [x] `components/crisis-page-shell.tsx` — main client boundary

## Phase 5: Pages & APIs
- [x] Rewrite `app/crisis/[id]/page.tsx`
- [x] Create `app/api/routes/route.ts`
- [x] Update `app/api/feed/route.ts`
- [x] Update `app/api/status/route.ts`
- [x] Update `app/api/offline-packet/route.ts`
- [x] Update `app/page.tsx` redirect

## Phase 6: Cleanup & Verification
- [x] Delete 7 old components
- [x] `npm run lint` — passed
- [x] `npm run build` — passed
- [ ] Manual visual verification at 375px/414px mobile + desktop

## Phase 7: Route Cache + Realtime + Overflow Fix
- [x] `supabase/schema.sql` — add origin/dest columns to routes, add service_role write policies
- [x] `supabase/seed.sql` — add origin/dest values to route inserts
- [x] `types/crisis.ts` — add origin/destination to Route interface
- [x] `lib/mock-data.ts` — add origin/destination to mock routes
- [x] `lib/crisis-data.ts` — add getCachedRoutes(), cacheRoutes(), remove routes from main payload
- [x] `app/api/routes/route.ts` — cache-first logic (check Supabase → fallback to mock → store in cache)
- [x] `components/live-intel-feed.tsx` — Supabase realtime subscription on intel_feed INSERT
- [x] `components/crisis-page-shell.tsx` — pass crisisId prop to LiveIntelFeed
- [x] `components/emergency-contacts.tsx` — overflow-hidden + truncate fix
- [x] Lint: 0 warnings, 0 errors
- [x] Build: compiles successfully

## Review
- All build steps completed
- Lint: 0 warnings, 0 errors
- Build: compiles successfully, all routes render
- Mock data fallback works when Supabase env vars are missing
- User action required: run updated schema.sql + seed.sql against Supabase
