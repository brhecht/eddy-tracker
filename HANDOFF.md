# HANDOFF — Eddy Course Launch Tracker
*Last updated: March 23, 2026 ~afternoon ET*

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
~/Developer/B-Suite/eddy/
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
- **Nico handoff doc:** `~/Developer/B-Suite/eddy/Nico-W1-Setup-Brief.docx` — Word doc with Nico's 6 W1 config tasks

## Current Status
**Phase: Pre-launch — quiz and email pipeline complete, ad campaign pending**

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

## Recent Changes (March 23, 2026)

No changes to the Eddy tracker app this session. Significant progress on the broader Eddy launch pipeline via HC Funnel:

- **Action plan email pipeline complete** — AI-generated personalized emails now go through a 3-layer self-eval audit (recipient simulation, course flow audit, parity check) before sending via Resend. Six prompt fixes for content quality + contrast closer content guardrails. Three commits pushed to hc-funnel.
- **GA4 tracking added** to hc-funnel
- **Brian headshot updated** on hc-funnel
- **Meta Pixel audit** completed on hc-funnel

### Previous Sessions
- **March 16:** Ad creatives package (4 Instagram feed concepts with reference images, creative brief for Nico), waitlist email drip strategy researched, "Expert" Cowork skill created
- **March 15:** Complete quiz rewrite — 8 scenario-based questions, new scoring engine (Monte Carlo validated), new design system, full rebuild deployed at hc-funnel.vercel.app

## Known Bugs / Issues
- **Firestore state persistence** — Old `assigns` and `positions` data from previous sessions may override new static defaults. Could add a "reset to defaults" button.
- **Vite build fails locally** in the Cowork sandbox (Rollup native module issue) — builds fine on Vercel via git push.
- **Git lock files** — The .git/index.lock file gets stuck when commits fail. Need to `rm -f .git/index.lock` before retrying.

## Planned Features / Backlog
1. **Email drip sequence** — 5-email nurture strategy is designed (see hc-funnel research memo), actual copy not yet written. Email 1 (action plan) is now complete.
2. **Kit automation** — wire email content to Kit autoresponder sequences
3. **Meta ad campaign launch** — depends on Nico building final ads in AdCreative.ai + email content ready
4. **LP variant support** — Add `?v=` URL param reader to founder-assessment LP for A/B testing
5. **Firestore state reset** — Optional "reset to defaults" button to clear stale overrides
6. **Circle cancellation** — Brian is paying for Circle but has migrated content off. Cancel once Teachable is verified (Phase 2).
7. **Video ads (Creatify)** — TBD, static ads first

## Design Decisions & Constraints
- **Single-file architecture** — All static data (workstreams, tools, budget) and UI lives in EddyTracker.jsx. Intentional for a 2-person tool.
- **Brian = creative, Nico = config** — Brian handles quiz design, ad creatives, copy, messaging. Nico handles all third-party tool setup (Kit, Pixel, UTM, Meta BM, form connections).
- **Phase 1 = validation funnel only** — No course hosting, no purchase flow, no drip campaigns yet. Just: Ad -> LP -> Quiz -> Email capture + autoresponder.
- **Existing LP as foundation** — founder-assessment.vercel.app has a Maven-style layout driven by a CONFIG object.
- **Kit over alternatives** — Free tier: 10K subs, unlimited emails, 1 automation, landing pages included.
- **AdCreative.ai + Creatify combo** — AI-scored static ads + AI avatar video ads.

## Environment & Config
- **Firebase project:** Referenced in `src/firebase.js` — `eddy-tracker-82486` (shared with hc-funnel)
- **Vercel:** Auto-deploys from `brhecht/eddy-tracker` main branch
- **Founder Assessment:** Separate repo at `~/Dropbox/@ Humble Conviction/Github Local Repo/founder_assessment/`, deployed at founder-assessment.vercel.app
- **Git:** Push from `~/Developer/B-Suite/eddy` to `github.com/brhecht/eddy-tracker.git`
- **Firestore keys:** `done`, `taskStatus`, `assigns`, `tStat`, `sel`, `positions`, `customTasks`, `taskOrder`, `taskProps`, `nameOverrides`

## Open Questions / Decisions Pending
- **Circle cancellation timing** — Brian is paying but eager to cancel. Confirm Teachable viability first (Phase 2).
- **Email drip copy** — Strategy done, copy not written. Emails 2-5 still needed.
- **Meta ad campaign timing** — Depends on Nico's final ads + email content ready
- **Demand validation** — Email 4's "Want early access?" CTA is the go/no-go signal for building the course
- **results@humbleconviction.com** — Nico pinged to set up routing for action plan email replies
