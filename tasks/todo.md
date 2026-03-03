# Crisis Instrument MVP Todo

## Plan
- [x] Replace default Next.js template with strict brutalist design system and layout shell
- [x] Implement SSR-first dashboard with hero triage, feed, extraction, consular, and offline packet sections
- [x] Add Supabase-backed data access with resilient fallback data path
- [x] Implement APIs: feed, status, offline packet
- [x] Add realtime feed client with 60s fallback polling
- [x] Add Supabase schema SQL for operators
- [x] Run lint and production build verification
- [ ] Validate completion gate and capture review

## Review
- `npm run lint` passed.
- `npm run build` passed (required network access for Google font fetch).
- Full route visual verification is pending manual run in your local environment.
