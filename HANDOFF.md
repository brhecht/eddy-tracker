# HANDOFF — Eddy Course Launch Tracker
*Last updated: March 1, 2026 ~10:00 PM EST*

## Project Overview
Eddy is a course launch tracker — a React web app used by Brian and Nico to coordinate launching a course on pitching/fundraising for founders (brand: Humble Conviction). The app has a Gantt-style timeline, tool decision matrix, and budget overview. It syncs state in real-time between users via Firebase Firestore.

The broader Eddy project is a validation funnel: Meta Ads → Landing Page → Quiz/Assessment → Email Capture + Autoresponder. Course hosting and content creation are Phase 2 — the immediate goal is to test demand and learn fast.

## Tech Stack
- **Frontend:** React 19 + Vite 6, single-page app
- **State sync:** Firebase Firestore (real-time, debounced writes via `useFirestoreState` hook)
- **Auth:** Firebase Google Auth, restricted to two emails (brhnyc1970@gmail.com, nico@humbleconviction.com)
- **Storage:** Firebase Storage (for asset uploads in task cards)
- **Hosting:** Vercel (auto-deploys from `main` branch of `brhecht/eddy-tracker`)
- **Live URL:** https://eddy-tracker.vercel.app

## Folder Structure
```
~/Desktop/B-Suite/eddy/
├── src/
│   ├── EddyTracker.jsx   # Main component — ALL static data + UI in one file (~1300 lines)
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

Also relevant:
- **Founder Assessment LP:** `~/Dropbox/@ Humble Conviction/Github Local Repo/founder_assessment/` — existing landing page (single `index.html`, Maven-style, CONFIG-driven, deployed at founder-assessment.vercel.app)
- **Nico handoff doc:** `~/Desktop/B-Suite/eddy/Nico-W1-Setup-Brief.docx` — Word doc with Nico's 6 W1 config tasks

## Current Status
**Phase: Pre-launch — W1 setup week (Mar 2-6)**

The tracker app is fully functional with:
- Gantt timeline with drag-to-move, drag-to-resize bars
- Task card side panel (week, assignee, status, dates, assets, notes)
- Three-state task status: todo / in progress / done (click to cycle)
- Status filter pills above Gantt (All / To do / In Progress / Done) with counts
- Status icons on Gantt bars (amber dot for IP, green check for done)
- Progress bar shows green (done) + amber (in progress) segments
- Tool decision matrix with 8 categories, all locked in
- Dynamic budget table
- Custom task creation, reordering, renaming
- Real-time sync between Brian and Nico via Firestore

**Tool selections are finalized:**
- Hosting: Teachable Builder ($69/mo, Phase 2)
- Email: Kit free tier ($0, upgrades to $39/mo for Phase 2 drip)
- Quiz: Build with Claude on Vercel ($0)
- Landing Page: Build with Claude on Vercel ($0) — existing LP at founder-assessment.vercel.app
- Video Editing: Descript (Nico's domain, Phase 2)
- Analytics: Google Sheets ($0)
- Ad Creative (Static): AdCreative.ai ($29-39/mo)
- Ad Creative (Video): Creatify ($19-49/mo)

## Recent Changes (This Session)
1. **Gantt overhaul** — Completely rewrote all workstream tasks with correct Brian/Nico assignments, realistic timing, and Phase 1 vs Phase 2 separation
2. **Three-state task status** — Replaced binary done/not-done checkbox with todo/ip/done cycle. Stored in Firestore as `taskStatus` map, backward-compatible with legacy `done` boolean
3. **Status filter pills** — Added filter bar above Gantt: All (33) / To do / In Progress / Done, with live counts
4. **Status in card panel** — Clickable status selector buttons (To do / In Progress / Done) in the task properties sidebar
5. **Status icons on bars** — Amber dot for in-progress, green check for done, on right edge of Gantt bars
6. **Progress bar update** — Now shows green (done) + amber (in progress) segments
7. **Nico handoff doc** — Created Nico-W1-Setup-Brief.docx with 6 setup tasks, context, sequencing, and TBDs list
8. **Landing page discovery** — Found existing Maven-style LP at founder-assessment.vercel.app — single HTML file driven by CONFIG object. Perfect for variant testing via URL params.

## Known Bugs / Issues
- **Firestore state persistence** — Old `assigns` and `positions` data from previous sessions may override new static defaults. Tasks may show wrong assignee badges or week positions until manually corrected in the UI. Could add a "reset to defaults" button.
- **HANDOFF.md deadlock** — The original HANDOFF.md file has a persistent resource deadlock from a previous session. This file is saved as HANDOFF2.md instead. Brian should delete the old HANDOFF.md and rename this one: `rm ~/Desktop/B-Suite/eddy/HANDOFF.md && mv ~/Desktop/B-Suite/eddy/HANDOFF2.md ~/Desktop/B-Suite/eddy/HANDOFF.md`
- **Vite build fails locally** in the Cowork sandbox (Rollup native module issue) — builds fine on Vercel via git push. Not a real bug, just a dev environment limitation.
- **Git lock files** — The .git/index.lock file gets stuck when commits fail. Need to `rm -f .git/index.lock` before retrying.

## Planned Features / Backlog
1. **LP variant support** — Add `?v=` URL param reader to founder-assessment LP to swap CONFIG for A/B testing. Queued for W1. Simple code change.
2. **Quiz app** — Brian designs quiz structure (questions, scoring, archetypes), then Claude builds it as React app on Vercel. Core W1 creative work.
3. **Firestore state reset** — Optional "reset to defaults" button to clear stale overrides from previous sessions.
4. **Circle cancellation** — Brian is paying for Circle but has migrated content off. Can cancel once Teachable is verified (Phase 2).

## Design Decisions & Constraints
- **Single-file architecture** — All static data (workstreams, tools, budget) and UI lives in EddyTracker.jsx. Intentional for a 2-person tool.
- **Brian = creative, Nico = config** — Brian handles quiz design, ad creatives, copy, messaging. Nico handles all third-party tool setup (Kit, Pixel, UTM, Meta BM, form connections).
- **Phase 1 = validation funnel only** — No course hosting, no purchase flow, no drip campaigns yet. Just: Ad -> LP -> Quiz -> Email capture + autoresponder.
- **Existing LP as foundation** — founder-assessment.vercel.app has a Maven-style layout driven by a CONFIG object. Just update copy and add variant support.
- **Kit over alternatives** — Free tier: 10K subs, unlimited emails, 1 automation, landing pages included.
- **AdCreative.ai + Creatify combo** — AI-scored static ads + AI avatar video ads. Automation over manual creation.

## Environment & Config
- **Firebase project:** Referenced in `src/firebase.js`
- **Vercel:** Auto-deploys from `brhecht/eddy-tracker` main branch
- **Founder Assessment:** Separate repo at `~/Dropbox/@ Humble Conviction/Github Local Repo/founder_assessment/`, deployed at founder-assessment.vercel.app
- **Git:** Push from `~/Desktop/B-Suite/eddy` to `github.com/brhecht/eddy-tracker.git`
- **Firestore keys:** `done`, `taskStatus`, `assigns`, `tStat`, `sel`, `positions`, `customTasks`, `taskOrder`, `taskProps`, `nameOverrides`

## Open Questions / Decisions Pending
- **Circle cancellation timing** — Brian is paying but eager to cancel. Confirm Teachable viability first (Phase 2).
- **Quiz content** — Brian needs to design the actual quiz. Tomorrow's primary creative task.
- **Autoresponder email copy** — Brian writes 2 emails, sends copy to Nico for Kit automation.
- **Meta Pixel ID** — Brian sends to Nico for Pixel installation.
- **Access grants** — Brian confirms/grants Nico access to: Kit, Vercel project, Meta Business Manager.

## Brian's Tomorrow Plan (W1 Day 1)
1. Create Kit account (2 min) + send Nico the W1 doc + credentials + access confirmations (15 min admin)
2. Design the quiz with Claude (core creative work — questions, scoring, archetypes)
3. Generate static ad creatives in AdCreative.ai
4. Generate AI video ads in Creatify
5. Write autoresponder email copy, send to Nico
