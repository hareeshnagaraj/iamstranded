# Lessons

## 2026-03-14
- **Detailed plans = fast execution.** When the plan specifies exact file, line, and code changes upfront, implementation is a straight shot — read all 4 files, make all edits, build, done. No exploration loops.
- **Thread data through the whole stack.** New UI state (like `suggestedDestinations`) needs to be added at every layer: data source → data fetcher → shell interface → component props. Miss one and TypeScript catches it, but planning for the full chain upfront avoids back-and-forth.
- **Mock data is the fallback contract.** The pattern of "query Supabase, fall back to mock" means any new data shape needs both a mock helper (`getMockDestinations`) AND Supabase query. Always add both in the same pass.
- **Hardcoded defaults become bugs at scale.** The "Al Nahda, Dubai" origin was fine for 1 crisis but broke for 3. When adding multi-entity support (multiple crises, users, etc.), audit all hardcoded values that assume a single entity.
- **Chips > pre-filled inputs for optional fields.** Showing suggestions as clickable chips instead of silently pre-filling gives users agency without friction. Good pattern for any "we have a good guess but shouldn't assume" UX.

## 2026-03-03
- When the user adds caveats mid-flight (for example, required instruction sources like `CLAUDE.md`), incorporate them explicitly into the execution workflow before proceeding with implementation.
- Keep completion-gate requirements visible during implementation so verification criteria are enforced at the end, not retrofitted later.
- Favor mobile-first crisis layouts by default: stack priority panels vertically first, then scale to dense desktop grids only at `lg` breakpoints.
- Avoid oversized hero regions in telemetry tools; allocate vertical space to actionable data and triage controls first.
