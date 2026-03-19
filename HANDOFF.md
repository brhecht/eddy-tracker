# HANDOFF — Eddy Course Launch Tracker
*Last updated: March 19, 2026 ~afternoon ET*

## Project Overview
Eddy is a course launch tracker — a React web app used by Brian and Nico to coordinate launching a pitching/fundraising course for founders (brand: Humble Conviction). The app has a Gantt-style timeline, tool decision matrix, and budget overview. It syncs state in real-time between users via Firebase Firestore.

The broader Eddy project is a validation funnel: Meta Ads → Landing Page → Quiz/Assessment → Email Capture + Autoresponder → Course Purchase. Course live date: April 1, 2026.

## Tech Stack
- **Frontend:** React 19 + Vite 6, single-page app
- **State sync:** Firebase Firestore (real-time, debounced writes via `useFirestoreState` hook)
- **Auth:** Firebase Google Auth, restricted to two emails (brhnyc1970@gmail.com, nico@humbleconviction.com)
- **Storage:** Firebase Storage (for asset uploads in task cards)
- **Hosting:** Vercel (auto-deploys from `main` branch of `brhecht/eddy-tracker`)
- **Live URL:** https://eddy-tracker.vercel.app

## Folder Structure
```
~/Developer/B-Suite/eddy/
├── src/
│   ├── EddyTracker.jsx   # Main component — ALL static data + UI in one file (~1400 lines)
│   ├── Auth.jsx           # Google Auth with email allowlist
│   ├── firebase.js        # Firebase config + Storage upload helper
│   ├── useFirestoreState.js # Debounced Firestore sync hook (core state engine)
│   ├── main.jsx           # React root render
│   └── index.css          # Minimal reset + spin animation
├── firestore.rules        # Email-restricted Firestore access rules
├── SETUP.md               # Firebase + Vercel setup guide
├── package.json           # React 19, Vite 6, Firebase 11
├── vite.config.js
└── HANDOFF.md             # This file
```

## Current Status
**Phase: Active launch prep — W3 (Mar 16–20). Course live target: April 1.**

The tracker app is fully functional with:
- **8-week Gantt timeline** (W1 Mar 2 through W8 Apr 24), extended from original 5 weeks
- **10 workstreams, 35 tasks** — all rewritten March 19 to align with HC-PHASE1-DISCOVERY.md business memo
- Milestones: "Ads Live" (W4) and "Course Live" (W5)
- Task card side panel with week toggle, assignee, status, dates, assets, notes
- **Week toggle** — sidebar week buttons toggle on/off to add/remove weeks from a task's Gantt bar span (not just move to a single week)
- **Hide any task** — X on hover for every task row (static tasks get hidden/restorable, custom tasks get deleted). "Show N hidden" pill appears in filter bar when tasks are hidden
- Three-state task status: todo / in progress / done (click to cycle)
- Status filter pills above Gantt (All / To do / In Progress / Done) with counts
- Progress bar shows green (done) + amber (in progress) segments
- Tool decision matrix with 8 categories, all locked in
- Dynamic budget table
- Custom task creation, reordering, renaming
- Real-time sync between Brian and Nico via Firestore

**Current workstreams (as of March 19):**
1. Lead Magnet / Quiz — 5 tasks, all done (quiz app live at hc-funnel.vercel.app)
2. Landing Page — 1 task, done
3. Email / Results Delivery — 4 tasks (email results logic in progress, wiring + drip pending)
4. Ad Creative — 3 tasks (first drafts done, revisions in progress, production pending)
5. Analytics / Tracking — 4 tasks (Meta Pixel, conversion events, UTMs, dashboard — all Nico)
6. Campaign Mgmt — 4 tasks (audiences done, Meta BM setup + campaign launch + optimization pending)
7. Course Recording — 4 tasks (W4, 4 batches of 3 lessons every other day, Brian)
8. Video Editing + Staging — 4 tasks (W4-W5, Nico edits rolling as batches arrive, offset from recording)
9. Course Hosting — 3 tasks (Teachable setup W4, staging W4-W5, checkout W5)
10. Launch / QA — 3 tasks (funnel QA W4, purchase QA W5, course live W5)

## Recent Changes (March 19, 2026)
1. **Complete task rewrite** — All 10 workstreams and 35 tasks rewritten to match HC-PHASE1-DISCOVERY.md business memo. Old placeholder tasks from March 1 replaced with actual project state.
2. **Timeline extended W1–W8** (was W1–W5). Added 3 weeks through Apr 24 for post-launch optimization.
3. **Milestones updated** — "Buffer" → "Ads Live" (W4), "Course Live" stays at W5.
4. **Course production backward-planned from April 1** — Recording in 4 batches of 3 lessons (every other day, W4). Editing offset: Nico edits in parallel as batches arrive (W4–W5). Teachable staging rolling.
5. **Week toggle in sidebar** — Replaced single-week-move with toggle behavior. Click highlighted week to shrink bar, click unhighlighted week to extend bar. Minimum 1 week enforced.
6. **Hide any task** — Added `hiddenTasks` Firestore state. X appears on hover for every task row. Static tasks hidden (restorable via "Show N hidden" pill), custom tasks deleted. Filter bar shows hidden count.
7. **Dynamic grid columns** — Gantt grid now uses `W.length` instead of hardcoded 5 columns.
8. **Hours field removed** — Dropped `hr` from all task data per Brian's instruction ("no hour constraints"). UI handles missing hours gracefully.
9. **Edit task offset fix** — v1 (Edit Lessons 1–3) and v2 (Edit Lessons 4–6) now span W4–W5 to properly show editing pipeline offset from recording.

## Known Bugs / Issues
- **Firestore state persistence** — Old `assigns` and `positions` data from previous sessions may override new static defaults. Tasks may show wrong assignee badges or week positions until manually corrected in the UI.
- **Vite build fails locally** in the Cowork sandbox (Rollup native module / permission issue with dist cleanup) — builds fine in /tmp or on Vercel via git push. Workaround: build from /tmp, push via fresh clone to /tmp.
- **Git lock files** — The mounted folder's .git gets lock files stuck when commits fail. Workaround: push via fresh clone to /tmp (`git clone → copy file → commit → push`).

## Planned Features / Backlog
- **Firestore state reset** — Optional "reset to defaults" button to clear stale position/assignee overrides from previous sessions.

## Design Decisions & Constraints
- **Single-file architecture** — All static data (workstreams, tools, budget) and UI lives in EddyTracker.jsx. Intentional for a 2-person tool.
- **Brian = creative, Nico = backend/config** — Brian handles quiz design, ad creatives, copy, messaging, course recording. Nico handles all backend wiring, tool setup, editing, staging, tracking.
- **No hour constraints** — Brian explicitly does not want hour estimates on tasks. Weekly granularity is sufficient.
- **Week toggle vs. single-move** — Sidebar week buttons toggle weeks on/off for multi-week spans. Previous behavior (click = move to that single week) was replaced because users need to shrink/extend bars, not just relocate them.
- **Hidden tasks stored in Firestore** — `hiddenTasks` map allows hiding any task (static or custom) without deleting static data. Reversible via "Show N hidden" button.

## Environment & Config
- **Firebase project:** `eddy-tracker-82486` (shared with hc-funnel and b-marketing)
- **Vercel:** Auto-deploys from `brhecht/eddy-tracker` main branch
- **Live URL:** https://eddy-tracker.vercel.app
- **Git push method:** Fresh clone to /tmp due to mounted folder lock file issues. Token in `~/Developer/B-Suite/.git-token`.
- **Firestore keys:** `done`, `taskStatus`, `hiddenTasks`, `assigns`, `tStat`, `sel`, `positions`, `customTasks`, `taskOrder`, `taskProps`, `nameOverrides`

## Open Questions / Decisions Pending
None — tracker is up to date with current project state. Next session will likely involve marking tasks done as work progresses and adjusting timelines as needed.
