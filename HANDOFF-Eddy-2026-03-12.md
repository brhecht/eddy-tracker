# HANDOFF — Eddy Tracker
*Last updated: March 12, 2026 ~9:30 PM ET*

## Project Overview
Eddy Tracker is a collaborative course launch project manager for Humble Conviction. Features a Gantt timeline, tool decision matrix, budget tracker, and task management. Used by Brian and Nico to plan and execute a course launch on pitching/fundraising. Part of B-Suite.

## Tech Stack
- **Frontend:** React 19, Vite 6
- **Backend:** Firebase Firestore (real-time via useFirestoreState hook), Firebase Storage, Firebase Auth
- **Hosting:** Vercel (auto-deploys from main)
- **Repo:** github.com/brhecht/eddy-tracker
- **Local path:** `~/Developer/B-Suite/eddy`

## Folder Structure
```
eddy/
├── src/
│   ├── EddyTracker.jsx       — Main component (~1500 lines) with ALL static data + UI
│   ├── Auth.jsx               — Google Auth with email allowlist
│   ├── firebase.js            — Firebase config + Storage upload
│   ├── useFirestoreState.js   — Debounced Firestore sync hook (300ms)
│   ├── AppSwitcher.jsx        — B Suite app navigation
│   ├── main.jsx               — React entry
│   └── index.css              — Reset + spin animation
├── api/
│   ├── create-task.js         — Proxy: Eddy → B Things add-task API
│   └── projects.js            — Proxy: Fetch B Things project list
└── package.json
```

## Current Status

### Working
- Gantt timeline with drag-to-move, drag-to-resize across 5-week span
- Three-state task status (todo / in-progress / done) with cycle-on-click
- Status filter pills with live counts
- Progress bar (green=done, amber=in-progress)
- Task card side panel: week, assignee, status, dates, assets, notes
- Custom task creation, renaming, deletion, reordering
- Tool decision matrix (8 categories)
- Dynamic budget table with Phase 1 vs Phase 2 totals
- Real-time Firebase sync (debounced 300ms)
- **Cross-app B Things task creation** — modal with title, project selector (defaults to "Eddy"), bucket dropdown, notes. Creates tasks via /api/create-task proxy

### Workstreams
Quiz/Lead Magnet (7 tasks), Landing Page (3), Analytics/Tracking (4), Ad Creative (3), Campaign Management (4), Email/Nurture (5), Video Editing Phase 2 (4), Course Hosting Phase 2 (3), Buffer/QA (3)

## Recent Changes (March 8–10, 2026)

### 1. Cross-App B Things Task Creation (March 10)
- Added "Create B Things Task" button in task card side panel
- New /api/create-task proxy → B Things /api/add-task (keeps BTHINGS_API_KEY server-side)
- New /api/projects proxy → B Things /api/projects (for project dropdown)
- Modal: title, project selector (defaults to "Eddy"), bucket (inbox/today/tomorrow/soon/someday/waiting), notes
- Error feedback: red banner on API failures, surfaces BTHINGS_API_KEY misconfiguration
- Success state: green checkmark, auto-dismisses after 1.2s

### 2. AppSwitcher Update (March 10)
- Removed HC Funnel (now sub-tool under Marketing)

## Known Bugs / Issues
- Old Firestore assigns/positions data may override new defaults
- Vite build fails locally in Cowork sandbox (Rollup native module issue) — works on Vercel
- .git/index.lock can get stuck

## Planned Features / Backlog
- None explicitly queued

## Design Decisions & Constraints
- EddyTracker.jsx is a single ~1500-line component with all static data inline (workstreams, tasks, tools, budget)
- useFirestoreState hook provides debounced bidirectional Firestore sync
- B Things API proxied through Vercel serverless to keep API key server-side
- Auth restricted to 2 emails (Brian + Nico)

## Environment & Config
- **Production URL:** https://eddy-tracker.vercel.app
- **GitHub:** github.com/brhecht/eddy-tracker
- **Firebase project:** b-things (or eddy-tracker-82486 for some shared resources)
- **Env vars:** VITE_FIREBASE_*, BTHINGS_API_KEY (for cross-app task creation)

## Open Questions / Decisions Pending
- None
