import { useState, useMemo, useCallback, useRef } from "react";
import { useFirestoreState } from "./useFirestoreState";
import { uploadFile } from "./firebase";

/* ── Static Data ────────────────────────────────────────────────── */

const W = [
  { id: 1, l: "W1", d: "Mar 2–6" },
  { id: 2, l: "W2", d: "Mar 9–13" },
  { id: 3, l: "W3", d: "Mar 16–20" },
  { id: 4, l: "W4", d: "Mar 23–27" },
  { id: 5, l: "W5", d: "Mar 30–Apr 3" },
];

const MS = [
  { week: 4, label: "Buffer", color: "#d97706" },
  { week: 5, label: "Course Live", color: "#16a34a" },
];

const ASSIGN_CYCLE = ["B", "N", "Both", ""];
const ASSIGN_COLORS = { B: "#4f46e5", N: "#0d9488", Both: "#d97706", "": "transparent" };
const ASSIGN_LABELS = { B: "Brian", N: "Nico", Both: "Both", "": "" };

const STATUS_CYCLE = ["todo", "ip", "done"];
const STATUS_META = {
  todo: { label: "To do", icon: "", color: "#ccc", bg: "transparent" },
  ip: { label: "In Progress", icon: "◉", color: "#d97706", bg: "#fffbeb" },
  done: { label: "Done", icon: "✓", color: "#16a34a", bg: "#ecfdf5" },
};

const WS = [
  {
    id: "quiz", name: "Lead Magnet / Quiz", color: "#ea580c", tasks: [
      { id: "q1", name: "Design quiz structure", s: 1, e: 1, hr: 3, as: "B", notes: "8–12 questions. 3–4 result archetypes. Scoring logic. Each archetype → course purchase angle. Brainstorm w/ Claude. This is the core creative work." },
      { id: "q2", name: "Build quiz app", s: 1, e: 2, hr: 3, as: "B", notes: "Claude-built React on Vercel (founder-assessment repo). Logic branching, mobile-first. Integrated with landing page.", tools: ["⚡ Build with Claude → Vercel"], dep: "q1" },
      { id: "q3", name: "Write results pages", s: 2, e: 2, hr: 2, as: "B", notes: "One per archetype. Mini sales page: profile → meaning → gap → course fills it. Heavy CTAs.", dep: "q2" },
      { id: "q4", name: "Connect quiz → Kit form", s: 2, e: 2, hr: 1, as: "N", notes: "Wire quiz submission to Kit form (embed or API POST). Confirm tag 'quiz-lead' applied + UTMs passed through.", dep: ["q2", "e1"] },
    ],
  },
  {
    id: "land", name: "Landing Page", color: "#7c3aed", tasks: [
      { id: "l1", name: "Update LP copy for Eddy", s: 1, e: 1, hr: 2, as: "B", notes: "Existing Maven-style LP at founder-assessment.vercel.app. Update CONFIG object with Eddy course copy: headline, subtitle, callouts, outcomes, modules, FAQs." },
      { id: "l2", name: "Add LP variant support", s: 2, e: 2, hr: 1, as: "B", notes: "Claude adds ?v= URL param reader to swap CONFIG. 2–3 headline/angle variants for A/B testing. Same layout, different copy.", tools: ["⚡ Build with Claude → Vercel"], dep: "l1" },
      { id: "l3", name: "Mobile QA", s: 2, e: 2, hr: 1, as: "Both", notes: "60%+ traffic is mobile. Test on actual phones. Load speed, CTA visibility, form UX.", dep: "l2" },
    ],
  },
  {
    id: "analytics", name: "Analytics / Tracking", color: "#0284c7", tasks: [
      { id: "t1", name: "UTM naming convention + tracking sheet", s: 1, e: 1, hr: 0.5, as: "N", notes: "Google Sheet: Campaign Name, Ad Variant ID, Full URL, Date Launched, Status, Notes. Convention: utm_source=meta, utm_medium=paid, utm_campaign=[name], utm_content=[variant].", tools: ["Google Sheets"] },
      { id: "t2", name: "Install Meta Pixel", s: 1, e: 1, hr: 0.5, as: "N", notes: "Add Pixel base code to <head> of Vercel app. PageView on load, Lead on form submit. Verify w/ Pixel Helper Chrome extension.", dep: "t1" },
      { id: "t3", name: "Set up conversion events + custom audience", s: 1, e: 1, hr: 0.5, as: "N", notes: "Custom Conversion for Lead event. Create test Custom Audience: all visitors last 30 days (for retargeting later).", dep: "t2" },
      { id: "t4", name: "Build analytics dashboard", s: 2, e: 2, hr: 1, as: "N", notes: "Google Sheets: ad spend, CPL, CPA, email CVR. Brian fills in campaign/variant names. Nico maintains formulas.", tools: ["Google Sheets"], dep: "t3" },
    ],
  },
  {
    id: "creative", name: "Ad Creative", color: "#dc2626", tasks: [
      { id: "c1", name: "Define messaging angles", s: 1, e: 1, hr: 1, as: "B", notes: "3 angles: pain, aspiration, proof. Each → multiple creatives. Brainstorm hooks, pain points, transformation promise w/ Claude." },
      { id: "c2", name: "Generate static + carousel ads", s: 1, e: 2, hr: 2, as: "B", notes: "Feed messaging angles + brand assets into AdCreative.ai. Batch generate scored variants. Kill weak ones, keep 5–6 winners.", tools: ["AdCreative.ai"], dep: "c1" },
      { id: "c3", name: "Script + generate AI video ads", s: 2, e: 2, hr: 2, as: "B", notes: "Claude writes 3–4 scripts per angle (15–30s, hook in 3 seconds). Feed into Creatify Batch Mode → 5–10 AI avatar variations per script. No camera needed.", tools: ["Creatify", "Claude (scripts)"], dep: "c1" },
    ],
  },
  {
    id: "camp", name: "Campaign Mgmt", color: "#b45309", tasks: [
      { id: "a1", name: "Define target audiences", s: 1, e: 1, hr: 1, as: "B", notes: "3–4 segments by founder stage/vertical/pain. Interest targeting first, then lookalikes from quiz data." },
      { id: "a2", name: "Set up Meta Business Mgr + Ad Account", s: 1, e: 1, hr: 0.5, as: "N", notes: "Confirm ad account active, payment on file, Pixel connected. Brian grants Nico access.", tools: ["Meta Business Manager"] },
      { id: "a3", name: "Structure + launch campaigns", s: 2, e: 2, hr: 2, as: "B", notes: "Lead magnet funnel first — $30–50/day. Upload creatives from AdCreative.ai + Creatify. Build pixel data + list. Wait 3–5 days before evaluating.", dep: ["a1", "a2", "l2", "q2", "c2"] },
      { id: "a4", name: "Ongoing optimization", s: 3, e: 5, hr: 4, as: "B", notes: "Daily 15min: CTR>1%, CPC, CPL. Kill after $50–100 spend. Weekly: realloc budget. Bi-weekly: full funnel review.", dep: "a3" },
    ],
  },
  {
    id: "email", name: "Email / Nurture", color: "#ec4899", tasks: [
      { id: "e1", name: "Set up Kit account + form", s: 1, e: 1, hr: 1, as: "N", notes: "Brian creates Kit account, adds Nico. Nico: create subscriber form, set up 'quiz-lead' tag, test submit, confirm tag + UTM capture.", tools: ["Kit (free tier)"] },
      { id: "e2", name: "Write autoresponder email", s: 1, e: 1, hr: 1, as: "B", notes: "One email, fires immediately after quiz signup. Short, warm, reinforces why they took the quiz, teases what's coming." },
      { id: "e3", name: "Build autoresponder automation", s: 1, e: 1, hr: 0.5, as: "N", notes: "Kit Visual Automation: trigger on form submit → send Email 1 (copy from Brian) → 1-day delay → send Email 2 (copy from Brian). Test end-to-end.", dep: ["e1", "e2"] },
      { id: "e4", name: "Write nurture sequence (Phase 2)", s: 3, e: 4, hr: 4, as: "B", notes: "Upgrade to Kit Creator ($39/mo) when ready. Each email: one insight, one story, one CTA. Draft w/ Claude.", dep: "e3" },
      { id: "e5", name: "Build purchase drip (Phase 2)", s: 4, e: 4, hr: 2, as: "N", notes: "Teachable webhook → Kit tag → post-purchase drip sequence. Test every path end-to-end.", dep: "e4" },
    ],
  },
  {
    id: "video", name: "Video Editing (Phase 2)", color: "#0d9488", tasks: [
      { id: "v1", name: "Style guide + ref edit", s: 3, e: 3, hr: 3, as: "Both", notes: "Phase 2 — after course is recorded. Define: titles, lower thirds, transitions, music, intro/outro. Edit Lesson 1 together as template." },
      { id: "v2", name: "Test AI editing tools", s: 3, e: 3, hr: 2, as: "N", notes: "Test Descript on Lesson 1 alongside manual edit. Compare quality + time.", tools: ["Descript", "CapCut Pro"] },
      { id: "v3", name: "Edit all lessons", s: 3, e: 4, hr: 12, as: "N", notes: "Batch edit all recorded lessons. Brian reviews within 24 hours per batch.", dep: "v1" },
      { id: "v4", name: "Post-production polish", s: 4, e: 4, hr: 5, as: "N", notes: "Audio consistency, verify titles, export in platform format. Final QA pass.", dep: "v3" },
    ],
  },
  {
    id: "host", name: "Course Hosting (Phase 2)", color: "#6366f1", tasks: [
      { id: "h1", name: "Sign up Teachable Builder", s: 4, e: 4, hr: 1, as: "N", notes: "Brian signs up, Nico configures. Teachable Builder $69/mo. 0% tx fees. Connect Stripe, domain, branding.", tools: ["Teachable Builder"] },
      { id: "h2", name: "Configure checkout + purchase flow", s: 4, e: 4, hr: 2, as: "N", notes: "Pricing, checkout page, abandonment email, order bumps. Test purchase flow with dummy product. Connect Kit via webhook.", dep: "h1" },
      { id: "h3", name: "Upload lessons + go live", s: 4, e: 5, hr: 4, as: "N", notes: "Upload all final lessons. Lesson order, descriptions, downloadables, drip settings, completion tracking.", dep: ["h2", "v4"] },
    ],
  },
  {
    id: "buffer", name: "Buffer / QA", color: "#737373", tasks: [
      { id: "b1", name: "End-to-end funnel QA", s: 2, e: 2, hr: 1, as: "Both", notes: "Walk through entire Phase 1 flow: UTM ad link → landing page → quiz → email captured in Kit w/ tag + UTM data. Fix any broken links." },
      { id: "b2", name: "End-to-end purchase QA (Phase 2)", s: 4, e: 4, hr: 2, as: "Both", notes: "Full flow: ad → landing → quiz → email → course purchase → post-purchase drip. Fix any broken links." },
      { id: "b3", name: "Final launch prep", s: 5, e: 5, hr: 2, as: "Both", notes: "Pricing finalized, launch email drafted, ads scaled up, course access tested." },
    ],
  },
];

const TOOLS = [
  {
    id: "hosting", name: "Course Hosting", by: "Phase 2", opts: [
      { n: "Teachable Builder ✓", p: "$69/mo", pro: "0% tx fees, Stripe checkout, abandonment recovery, order bumps, drip content, integrates w/ Kit", con: "No built-in marketing email — use Kit", f: "high" },
      { n: "Podia Mover", p: "$39/mo", pro: "0% tx fees, built-in email+pages, Stripe+PayPal+Apple Pay", con: "Less course depth (no quizzes, certs, weaker analytics)", f: "medium" },
      { n: "Stan Store", p: "$29–99/mo", pro: "1-click checkout, mobile-first", con: "Email only on $99 Pro plan, limited course features", f: "low" },
    ],
  },
  {
    id: "email", name: "Email Platform", by: "Mar 6", opts: [
      { n: "Kit Free ✓", p: "$0 → $39/mo", pro: "10K subs, unlimited emails, 1 automation (autoresponder), landing pages. Upgrade to Creator for drip sequences", con: "Free tier: 1 automation only", f: "high" },
      { n: "SendGrid Free", p: "$0", pro: "Good deliverability, simple API", con: "No visual automation builder", f: "medium" },
      { n: "Beehiiv", p: "$0–99/mo", pro: "Great deliverability, newsletter option", con: "Automation less mature", f: "low" },
    ],
  },
  {
    id: "quiz", name: "Quiz / Lead Magnet", by: "Mar 6", opts: [
      { n: "⚡ Build with Claude → Vercel ✓", p: "$0", pro: "Same app as landing page, full Pixel/CAPI control, custom scoring, A/B test quiz vs direct capture", con: "You maintain with Claude", f: "high" },
      { n: "Typeform", p: "$25–50/mo", pro: "Beautiful UX, logic branching, integrations", con: "Response limits, separate tracking domain", f: "medium" },
      { n: "Tally", p: "$0–29/mo", pro: "Free tier, simple", con: "Limited scoring", f: "low" },
    ],
  },
  {
    id: "landing", name: "Landing Page", by: "Mar 6", opts: [
      { n: "⚡ Build with Claude → Vercel ✓", p: "$0", pro: "Fully custom, embed quiz, A/B testing, full Pixel/CAPI control, UTM capture", con: "You maintain with Claude", f: "high" },
      { n: "Carrd", p: "$19/yr", pro: "Extremely fast, cheap, clean", con: "Limited A/B testing, no quiz embed", f: "medium" },
      { n: "Kit Landing Pages", p: "$0", pro: "Included in free tier, connects to email", con: "Template-based, less custom", f: "medium" },
    ],
  },
  {
    id: "editing", name: "AI Video Editing", by: "Mar 6", opts: [
      { n: "Descript", p: "$24–33/mo", pro: "Transcript editing, filler removal, Studio Sound", con: "Learning curve", f: "high" },
      { n: "CapCut Pro", p: "$8–10/mo", pro: "Auto-captions, templates, cheap", con: "Consumer-oriented", f: "medium" },
      { n: "Manual (Premiere/DaVinci)", p: "$0–23/mo", pro: "Full control, Nico knows it", con: "No AI assist", f: "medium" },
    ],
  },
  {
    id: "analytics", name: "Analytics Dashboard", by: "Mar 13", opts: [
      { n: "Google Sheets ✓", p: "$0", pro: "Simple, shareable, fast to set up. UTMs → Kit tags → weekly pull", con: "Manual entry", f: "high" },
      { n: "⚡ Build with Claude → Vercel", p: "$0", pro: "Custom metrics, live updating", con: "Premature until volume justifies", f: "medium" },
      { n: "Looker Studio", p: "$0", pro: "Connects data sources, visual", con: "Setup time", f: "low" },
    ],
  },
  {
    id: "adcreative", name: "Ad Creative (Static)", by: "Mar 6", opts: [
      { n: "AdCreative.ai ✓", p: "$29–39/mo", pro: "AI-scored creatives from 100M+ ads, batch generation, direct Meta deploy, headlines+images+copy", con: "Credit-based (10 downloads/mo on Starter)", f: "high" },
      { n: "Canva Pro", p: "$13/mo", pro: "Templates, manual but flexible", con: "Manual creation, no performance scoring", f: "medium" },
      { n: "Predis.ai", p: "$0–32/mo", pro: "Free tier, organic+paid content", con: "Less conversion-focused", f: "medium" },
    ],
  },
  {
    id: "advideo", name: "Ad Creative (Video)", by: "Mar 6", opts: [
      { n: "Creatify ✓", p: "$19–49/mo", pro: "1000+ AI avatars, batch 5-10 video variations in one click, UGC-style without camera, direct Meta deploy", con: "AI avatars not as good as real UGC (yet)", f: "high" },
      { n: "Phone + natural light", p: "$0", pro: "Authentic UGC, highest trust", con: "You're on camera, time-intensive", f: "medium" },
      { n: "⚡ Claude scripts only", p: "$0", pro: "Claude writes hooks/scripts, you record or use Creatify", con: "Still need a production tool", f: "medium" },
    ],
  },
];

const FC = { high: "#16a34a", medium: "#d97706", low: "#dc2626" };
const SO = ["not started", "researching", "decided", "set up"];

const BUDGET = [
  { c: "Course Platform", lo: 0, hi: 69, n: "Teachable Builder $69/mo — Phase 2 only. $0 now." },
  { c: "Email Platform", lo: 0, hi: 39, n: "Kit Free now → Kit Creator $39/mo for drip (Phase 2)" },
  { c: "Quiz + Landing Page", lo: 0, hi: 0, n: "Claude-built → Vercel. Free." },
  { c: "Video Editing", lo: 0, hi: 33, n: "Descript if adopted (Nico)" },
  { c: "Ad Creative (Static)", lo: 29, hi: 39, n: "AdCreative.ai Starter" },
  { c: "Ad Creative (Video)", lo: 19, hi: 49, n: "Creatify Starter–Pro" },
  { c: "Analytics", lo: 0, hi: 0, n: "Google Sheets. Free." },
  { c: "Ad Spend", lo: 900, hi: 3000, n: "$30–100/day. Start low, scale winners." },
];

/* ── Helpers ─────────────────────────────────────────────────────── */

function initAssigns() {
  const init = {};
  WS.forEach((ws) => ws.tasks.forEach((t) => { init[t.id] = t.as || ""; }));
  return init;
}

function initToolStatus() {
  return Object.fromEntries(TOOLS.map((c) => [c.id, "not started"]));
}

/* ── Micro Components ────────────────────────────────────────────── */

function CBox({ on, toggle, color }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      style={{
        width: 15, height: 15, borderRadius: 4, flexShrink: 0, cursor: "pointer",
        border: on ? `2px solid ${color}` : "2px solid #ccc",
        background: on ? color : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", boxShadow: on ? "none" : "0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      {on && <span style={{ fontSize: 9, color: "#fff", fontWeight: 800 }}>✓</span>}
    </div>
  );
}

function AssignBadge({ value }) {
  if (!value) return null;
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, letterSpacing: 0.3,
      padding: "1px 4px", borderRadius: 3, color: "#fff", lineHeight: 1.3,
      background: ASSIGN_COLORS[value], whiteSpace: "nowrap",
    }}>
      {ASSIGN_LABELS[value]}
    </span>
  );
}

function AssetInput({ onValue }) {
  const [mode, setMode] = useState("link");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handlePaste = () => {
    if (url.trim()) { onValue(url.trim()); setUrl(""); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(file);
      onValue(result);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  };

  return (
    <div style={{ border: "1px dashed #d4d3cf", borderRadius: 4, padding: "4px 6px" }}>
      <div style={{ display: "flex", gap: 0, marginBottom: 4 }}>
        {["link", "upload"].map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontSize: 9, padding: "2px 8px", background: mode === m ? "#f0eee9" : "transparent",
            border: "none", borderRadius: 3, color: mode === m ? "#333" : "#aaa",
            cursor: "pointer", fontWeight: mode === m ? 600 : 400, textTransform: "capitalize",
          }}>{m}</button>
        ))}
      </div>
      {mode === "link" ? (
        <div style={{ display: "flex", gap: 4 }}>
          <input
            value={url} onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handlePaste(); }}
            placeholder="Paste URL…"
            style={{ flex: 1, fontSize: 10, border: "1px solid #e8e6e1", borderRadius: 3, padding: "3px 5px", outline: "none", fontFamily: "inherit" }}
          />
          <button onClick={handlePaste} style={{
            fontSize: 9, padding: "3px 8px", background: "#f0eee9", border: "1px solid #e0ded8",
            borderRadius: 3, cursor: "pointer", color: "#666",
          }}>Add</button>
        </div>
      ) : (
        <>
          <input ref={fileRef} type="file" hidden onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              width: "100%", fontSize: 10, padding: "4px 0", background: "transparent",
              border: "none", color: uploading ? "#bbb" : "#4f46e5", cursor: uploading ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >{uploading ? "Uploading…" : "Choose file…"}</button>
        </>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */

export default function EddyTracker() {
  const [tab, setTab] = useState("gantt");
  const [openTask, setOpenTask] = useState(null);
  const [openCat, setOpenCat] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "todo" | "ip" | "done"

  // Shared Firestore state
  const [done, setDone] = useFirestoreState("done", {});
  const [assigns, setAssigns] = useFirestoreState("assigns", initAssigns());
  const [tStat, setTStat] = useFirestoreState("tStat", initToolStatus());
  const [sel, setSel] = useFirestoreState("sel", {});
  const [positions, setPositions] = useFirestoreState("positions", {});
  const [customTasks, setCustomTasks] = useFirestoreState("customTasks", {}); // { wsId: [task, ...] }
  const [taskOrder, setTaskOrder] = useFirestoreState("taskOrder", {}); // { wsId: [id, id, ...] }
  const [taskProps, setTaskProps] = useFirestoreState("taskProps", {}); // { taskId: { startDate, endDate, assets, notes } }
  const [nameOverrides, setNameOverrides] = useFirestoreState("nameOverrides", {}); // { taskId_or_wsId: "new name" }
  const [taskStatus, setTaskStatus] = useFirestoreState("taskStatus", {}); // { taskId: "todo"|"ip"|"done" }

  // Status helpers — reads from taskStatus first, falls back to legacy done
  const getStatus = useCallback((taskId) => {
    if (taskStatus[taskId]) return taskStatus[taskId];
    if (done[taskId]) return "done";
    return "todo";
  }, [taskStatus, done]);

  const cycleStatus = useCallback((taskId, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setTaskStatus((prev) => {
      const cur = prev[taskId] || (done[taskId] ? "done" : "todo");
      const idx = STATUS_CYCLE.indexOf(cur);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      return { ...prev, [taskId]: next };
    });
    // Also sync legacy done for backward compat
    setDone((prev) => {
      const cur = taskStatus[taskId] || (done[taskId] ? "done" : "todo");
      const idx = STATUS_CYCLE.indexOf(cur);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      return { ...prev, [taskId]: next === "done" };
    });
  }, [taskStatus, done, setTaskStatus, setDone]);

  const setStatusDirect = useCallback((taskId, status) => {
    setTaskStatus((prev) => ({ ...prev, [taskId]: status }));
    setDone((prev) => ({ ...prev, [taskId]: status === "done" }));
  }, [setTaskStatus, setDone]);

  // Editing state for inline new-task name
  const [editingTask, setEditingTask] = useState(null); // taskId currently being renamed
  // Card panel state
  const [cardOpen, setCardOpen] = useState(null); // { taskId, wsId }
  // B Things task creation modal
  const [btModal, setBtModal] = useState(null); // null or { prefill } when open
  const [btProjects, setBtProjects] = useState(null); // cached project list
  const [btSending, setBtSending] = useState(false);
  const [btSuccess, setBtSuccess] = useState(false);
  const [btError, setBtError] = useState(null);

  // Drag state (local only, not persisted until drop)
  const dragRef = useRef(null);
  const didDragRef = useRef(false); // Suppress click after drag
  const [dragPreview, setDragPreview] = useState(null); // { taskId, s, e }

  const getTaskPos = useCallback((t) => {
    if (dragPreview && dragPreview.taskId === t.id) return { s: dragPreview.s, e: dragPreview.e };
    if (positions[t.id]) return { s: positions[t.id].s, e: positions[t.id].e };
    return { s: t.s, e: t.e };
  }, [positions, dragPreview]);

  // Unified drag handler: mode = "move" | "resize-left" | "resize-right"
  const handleBarMouseDown = useCallback((taskId, wsId, defaultS, defaultE, mode, e) => {
    e.preventDefault();
    e.stopPropagation();
    didDragRef.current = false;
    const startX = e.clientX;
    const pos = positions[taskId] || { s: defaultS, e: defaultE };
    const duration = pos.e - pos.s;
    const gridEl = e.currentTarget.closest('[data-gantt-row]');
    if (!gridEl) return;
    const cells = gridEl.querySelectorAll('[data-week-cell]');
    if (!cells.length) return;
    const cellWidth = cells[0].getBoundingClientRect().width;

    dragRef.current = { taskId, startX, origS: pos.s, origE: pos.e, duration, cellWidth, mode };

    const onMove = (ev) => {
      const dr = dragRef.current;
      if (!dr) return;
      const dx = ev.clientX - dr.startX;
      const weekShift = Math.round(dx / dr.cellWidth);
      let newS, newE;

      if (dr.mode === "move") {
        newS = dr.origS + weekShift;
        newE = newS + dr.duration;
        if (newS < 1) { newS = 1; newE = 1 + dr.duration; }
        if (newE > W.length) { newE = W.length; newS = W.length - dr.duration; }
      } else if (dr.mode === "resize-left") {
        newS = dr.origS + weekShift;
        newE = dr.origE;
        if (newS < 1) newS = 1;
        if (newS > newE) newS = newE;
      } else if (dr.mode === "resize-right") {
        newS = dr.origS;
        newE = dr.origE + weekShift;
        if (newE > W.length) newE = W.length;
        if (newE < newS) newE = newS;
      }

      didDragRef.current = true;
      setDragPreview({ taskId: dr.taskId, s: newS, e: newE });
    };

    const onUp = () => {
      const dr = dragRef.current;
      if (dr) {
        setDragPreview((prev) => {
          if (prev && prev.taskId === dr.taskId) {
            setPositions((p) => ({
              ...p,
              [dr.taskId]: { s: prev.s, e: prev.e, weekOf: W.find((w) => w.id === prev.s)?.d || "" },
            }));
          }
          return null;
        });
      }
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [positions, setPositions]);

  const tog = useCallback((id) => cycleStatus(id), [cycleStatus]);

  const cycleAssign = useCallback((taskId, e) => {
    e.stopPropagation();
    setAssigns((prev) => {
      const cur = prev[taskId] || "";
      const idx = ASSIGN_CYCLE.indexOf(cur);
      const next = ASSIGN_CYCLE[(idx + 1) % ASSIGN_CYCLE.length];
      return { ...prev, [taskId]: next };
    });
  }, [setAssigns]);

  // Merge static + custom tasks for a workstream, in taskOrder
  const getOrderedTasks = useCallback((ws) => {
    const staticTasks = ws.tasks;
    const custom = customTasks[ws.id] || [];
    const all = [...staticTasks, ...custom];
    const order = taskOrder[ws.id];
    if (!order) return all;
    const byId = Object.fromEntries(all.map((t) => [t.id, t]));
    const ordered = order.filter((id) => byId[id]).map((id) => byId[id]);
    // Append any tasks not in the order (newly added static tasks etc)
    all.forEach((t) => { if (!order.includes(t.id)) ordered.push(t); });
    return ordered;
  }, [customTasks, taskOrder]);

  // Add a new task to a workstream
  const addTask = useCallback((wsId) => {
    const id = `custom_${wsId}_${Date.now()}`;
    const newTask = { id, name: "New task", s: 1, e: 1, hr: 1, as: "", notes: "", custom: true };
    setCustomTasks((prev) => ({
      ...prev,
      [wsId]: [...(prev[wsId] || []), newTask],
    }));
    // Add to end of task order
    const ws = WS.find((w) => w.id === wsId);
    const staticIds = ws ? ws.tasks.map((t) => t.id) : [];
    const existingCustomIds = (customTasks[wsId] || []).map((t) => t.id);
    const currentOrder = taskOrder[wsId] || [...staticIds, ...existingCustomIds];
    setTaskOrder((prev) => ({
      ...prev,
      [wsId]: [...currentOrder, id],
    }));
    setEditingTask(id);
    return id;
  }, [customTasks, taskOrder, setCustomTasks, setTaskOrder]);

  // Update a custom task field
  const updateCustomTask = useCallback((wsId, taskId, updates) => {
    setCustomTasks((prev) => ({
      ...prev,
      [wsId]: (prev[wsId] || []).map((t) => t.id === taskId ? { ...t, ...updates } : t),
    }));
  }, [setCustomTasks]);

  // Update task properties (card fields)
  const updateTaskProp = useCallback((taskId, updates) => {
    setTaskProps((prev) => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), ...updates },
    }));
  }, [setTaskProps]);

  // Get props for a task (merged with defaults)
  const getTaskPropsMerged = useCallback((taskId) => {
    const defaults = { startDate: "", endDate: "", assets: [null, null, null], notes: "" };
    return { ...defaults, ...(taskProps[taskId] || {}) };
  }, [taskProps]);

  // Get display name with override support
  const getName = useCallback((id, fallback) => nameOverrides[id] || fallback, [nameOverrides]);
  const setName = useCallback((id, name) => {
    setNameOverrides((prev) => ({ ...prev, [id]: name }));
  }, [setNameOverrides]);

  // All weeks are available — each task has its own row so no collision
  const getAvailableWeeks = useCallback(() => {
    return W.map((w) => w.id);
  }, []);

  // ── B Things task creation ──────────────────────
  const openBtModal = useCallback((taskName) => {
    setBtModal({ title: taskName || "", notes: "", projectId: "", bucket: "today" });
    setBtSuccess(false);
    setBtError(null);
    if (!btProjects) {
      fetch("/api/projects").then(r => r.json()).then(d => {
        if (d.ok) setBtProjects(d.projects);
        else setBtError("Could not load projects — check BTHINGS_API_KEY env var");
      }).catch(() => setBtError("Could not reach B Things API"));
    }
  }, [btProjects]);

  const submitBtTask = useCallback(async (form) => {
    setBtSending(true);
    setBtError(null);
    try {
      const resp = await fetch("/api/create-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          projectId: form.projectId || undefined,
          bucket: form.bucket || "today",
          notes: form.notes || undefined,
        }),
      });
      const data = await resp.json();
      if (data.ok) {
        setBtSuccess(true);
        setTimeout(() => { setBtModal(null); setBtSuccess(false); }, 1200);
      } else {
        setBtError(data.error || "Task creation failed — check BTHINGS_API_KEY env var");
      }
    } catch (e) {
      setBtError("Network error — could not reach API");
    }
    setBtSending(false);
  }, []);

  // Move task to a new single-week position from card panel
  const moveTaskToWeek = useCallback((taskId, wsId, newWeek) => {
    if (newWeek < 1 || newWeek > W.length) return false;
    setPositions((p) => ({
      ...p,
      [taskId]: { s: newWeek, e: newWeek, weekOf: W.find((w) => w.id === newWeek)?.d || "" },
    }));
    return true;
  }, [setPositions]);

  // Delete a custom task
  const deleteCustomTask = useCallback((wsId, taskId) => {
    setCustomTasks((prev) => ({
      ...prev,
      [wsId]: (prev[wsId] || []).filter((t) => t.id !== taskId),
    }));
    setTaskOrder((prev) => ({
      ...prev,
      [wsId]: (prev[wsId] || []).filter((id) => id !== taskId),
    }));
    // Clean up related state
    setDone((p) => { const n = { ...p }; delete n[taskId]; return n; });
    setTaskStatus((p) => { const n = { ...p }; delete n[taskId]; return n; });
    setAssigns((p) => { const n = { ...p }; delete n[taskId]; return n; });
    setPositions((p) => { const n = { ...p }; delete n[taskId]; return n; });
    setTaskProps((p) => { const n = { ...p }; delete n[taskId]; return n; });
    if (cardOpen && cardOpen.taskId === taskId) setCardOpen(null);
  }, [setCustomTasks, setTaskOrder, setDone, setAssigns, setPositions, setTaskProps, cardOpen]);

  // Reorder tasks within a workstream via drag
  const reorderDragRef = useRef(null);
  const [reorderOver, setReorderOver] = useState(null); // { wsId, overTaskId }

  const handleReorderDragStart = useCallback((wsId, taskId, e) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    reorderDragRef.current = { wsId, taskId };
  }, []);

  const handleReorderDragOver = useCallback((wsId, overTaskId, e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setReorderOver({ wsId, overTaskId });
  }, []);

  const handleReorderDrop = useCallback((wsId, overTaskId, e) => {
    e.preventDefault();
    setReorderOver(null);
    const dr = reorderDragRef.current;
    if (!dr || dr.wsId !== wsId || dr.taskId === overTaskId) return;

    const ws = WS.find((w) => w.id === wsId);
    const staticIds = ws ? ws.tasks.map((t) => t.id) : [];
    const customIds = (customTasks[wsId] || []).map((t) => t.id);
    const currentOrder = taskOrder[wsId] || [...staticIds, ...customIds];

    const fromIdx = currentOrder.indexOf(dr.taskId);
    const toIdx = currentOrder.indexOf(overTaskId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newOrder = [...currentOrder];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dr.taskId);

    setTaskOrder((prev) => ({ ...prev, [wsId]: newOrder }));
    reorderDragRef.current = null;
  }, [customTasks, taskOrder, setTaskOrder]);

  const handleReorderDragEnd = useCallback(() => {
    setReorderOver(null);
    reorderDragRef.current = null;
  }, []);

  const st = useMemo(() => {
    let bh = 0, nh = 0, tot = 0, dn = 0, ip = 0, td = 0;
    WS.forEach((ws) => {
      const allTasks = [...ws.tasks, ...(customTasks[ws.id] || [])];
      allTasks.forEach((t) => {
        tot++;
        const s = getStatus(t.id);
        if (s === "done") dn++;
        else if (s === "ip") ip++;
        else td++;
        const a = assigns[t.id] || "";
        if (a === "N") nh += t.hr;
        else if (a === "Both") { bh += Math.ceil(t.hr * 0.5); nh += Math.ceil(t.hr * 0.5); }
        else bh += t.hr;
      });
    });
    return { bh, nh, tot, dn, ip, td, pct: tot ? Math.round((dn / tot) * 100) : 0 };
  }, [done, assigns, customTasks, getStatus]);

  const isCl = (s) => s && s.includes("⚡");

  // Find task object by id across all workstreams
  const findTask = useCallback((taskId, wsId) => {
    const ws = WS.find((w) => w.id === wsId);
    if (!ws) return null;
    const inStatic = ws.tasks.find((t) => t.id === taskId);
    if (inStatic) return inStatic;
    return (customTasks[wsId] || []).find((t) => t.id === taskId) || null;
  }, [customTasks]);

  // Asset field helper — get url/name from value
  const getAssetUrl = (val) => (typeof val === "object" && val?.url ? val.url : val);
  const getAssetName = (val) => {
    if (typeof val === "object" && val?.name) return val.name;
    const url = typeof val === "string" ? val : "";
    try { const u = new URL(url); const parts = u.pathname.split("/").filter(Boolean); return decodeURIComponent(parts[parts.length - 1] || u.hostname); } catch { return url; }
  };
  const triggerAssetDownload = (val) => {
    const url = getAssetUrl(val); const name = getAssetName(val);
    const a = document.createElement("a"); a.href = url; a.download = name; a.target = "_blank"; a.rel = "noopener noreferrer";
    document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 100);
  };

  return (
    <div style={{ fontFamily: "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#f8f7f4", color: "#1a1a1a", minHeight: "100vh", padding: "24px 28px" }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Eddy</h1>
          <span style={{ fontSize: 12, color: "#999", fontWeight: 500, letterSpacing: 0.5 }}>Course Launch Tracker</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 6, background: "#e8e6e1", borderRadius: 3, overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${st.pct}%`, height: "100%", background: "linear-gradient(90deg,#6366f1,#16a34a)", transition: "width 0.3s" }} />
            {st.ip > 0 && <div style={{ width: `${Math.round((st.ip / st.tot) * 100)}%`, height: "100%", background: "#fbbf24", transition: "width 0.3s" }} />}
          </div>
          <span style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap", fontWeight: 500 }}>{st.dn}/{st.tot} · {st.pct}%</span>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#777" }}>
          <span>Course live <b>Mar 30</b></span>
          <span>Marketing <b>Apr 6</b></span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "#4f46e5", display: "inline-block" }} /> Brian: <b style={{ color: "#1a1a1a" }}>{st.bh}h</b>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "#0d9488", display: "inline-block" }} /> Nico: <b style={{ color: "#1a1a1a" }}>{st.nh}h</b>
          </span>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #e8e6e1" }}>
        {[{ id: "gantt", l: "Timeline" }, { id: "tools", l: "Tool Decisions" }, { id: "budget", l: "Budget" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 20px", fontSize: 13, fontFamily: "inherit", fontWeight: tab === t.id ? 600 : 400,
            background: "transparent", color: tab === t.id ? "#1a1a1a" : "#999",
            border: "none", borderBottom: tab === t.id ? "2px solid #1a1a1a" : "2px solid transparent",
            cursor: "pointer", marginBottom: -2, transition: "all 0.15s",
          }}>{t.l}</button>
        ))}
      </div>

      {/* ── Timeline Tab ────────────────────────────────── */}
      {tab === "gantt" && (
        <div style={{ display: "flex", gap: 0 }}>
        <div style={{ overflowX: "auto", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "#bbb" }}>
              Click bars to open properties · Drag to move · Drag edges to resize
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { id: "all", label: "All", count: st.tot },
                { id: "todo", label: "To do", count: st.td, color: "#999" },
                { id: "ip", label: "In Progress", count: st.ip, color: "#d97706" },
                { id: "done", label: "Done", count: st.dn, color: "#16a34a" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    fontSize: 10, padding: "3px 8px", borderRadius: 4, cursor: "pointer",
                    fontFamily: "inherit", fontWeight: statusFilter === f.id ? 600 : 400,
                    background: statusFilter === f.id ? (f.color ? f.color + "14" : "#f0eee9") : "transparent",
                    border: `1px solid ${statusFilter === f.id ? (f.color || "#ccc") : "#e8e6e1"}`,
                    color: statusFilter === f.id ? (f.color || "#333") : "#aaa",
                    transition: "all 0.12s",
                  }}
                >{f.label} <span style={{ fontSize: 9, opacity: 0.7 }}>{f.count}</span></button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "200px repeat(5,1fr)", marginBottom: 4 }}>
            <div />
            {W.map((w) => {
              const m = MS.find((x) => x.week === w.id);
              return (
                <div key={w.id} style={{ borderLeft: "1px solid #e8e6e1", textAlign: "center", padding: "6px 2px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#555" }}>{w.l}</div>
                  <div style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>{w.d}</div>
                  {m && <div style={{ fontSize: 9, fontWeight: 700, color: m.color, marginTop: 3 }}>▲ {m.label}</div>}
                </div>
              );
            })}
          </div>
          {WS.map((ws) => {
            const orderedTasks = getOrderedTasks(ws);
            return (
            <div key={ws.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "200px repeat(5,1fr)", marginBottom: 2 }}>
                <div style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, color: ws.color, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: ws.color, flexShrink: 0 }} />
                  {getName(ws.id, ws.name)}
                  <button
                    onClick={(e) => { e.stopPropagation(); addTask(ws.id); }}
                    title="Add task"
                    style={{
                      width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${ws.color}44`,
                      background: "transparent", color: ws.color, fontSize: 13, lineHeight: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", opacity: 0.5, transition: "opacity 0.15s", flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; }}
                  >+</button>
                </div>
                {W.map((w) => <div key={w.id} style={{ borderLeft: "1px solid #f0eee9" }} />)}
              </div>
              {orderedTasks.filter((t) => statusFilter === "all" || getStatus(t.id) === statusFilter).map((t) => {
                const tSt = getStatus(t.id), d = tSt === "done", op = openTask === t.id, asgn = assigns[t.id] || "";
                const pos = getTaskPos(t);
                const isDragging = dragPreview && dragPreview.taskId === t.id;
                const isCustom = !!t.custom;
                const isReorderTarget = reorderOver && reorderOver.wsId === ws.id && reorderOver.overTaskId === t.id;
                return (
                  <div
                    key={t.id}
                    onDragOver={(e) => handleReorderDragOver(ws.id, t.id, e)}
                    onDrop={(e) => handleReorderDrop(ws.id, t.id, e)}
                    onDragEnd={handleReorderDragEnd}
                    style={{ borderTop: isReorderTarget ? `2px solid ${ws.color}` : "2px solid transparent" }}
                  >
                    <div
                      data-gantt-row
                      onClick={() => { if (!isDragging) setOpenTask(op ? null : t.id); }}
                      style={{
                        display: "grid", gridTemplateColumns: "200px repeat(5,1fr)",
                        cursor: "pointer", background: op ? "#fff" : "transparent",
                        borderRadius: op ? 6 : 0, opacity: d ? 0.45 : 1, transition: "all 0.12s",
                        boxShadow: op ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                      }}
                      onMouseEnter={(e) => { if (!op) e.currentTarget.style.background = "#faf9f6"; }}
                      onMouseLeave={(e) => { if (!op) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ padding: "5px 8px 5px 12px", fontSize: 12, color: d ? "#bbb" : "#444", display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                        {/* Drag grip */}
                        <span
                          draggable
                          onDragStart={(e) => handleReorderDragStart(ws.id, t.id, e)}
                          style={{ cursor: "grab", color: "#ccc", fontSize: 10, flexShrink: 0, lineHeight: 1, letterSpacing: 1 }}
                          title="Drag to reorder"
                        >⋮⋮</span>
                        <div
                          onClick={(e) => { e.stopPropagation(); cycleStatus(t.id, e); }}
                          title={`Status: ${STATUS_META[tSt].label} — click to cycle`}
                          style={{
                            width: 15, height: 15, borderRadius: 4, flexShrink: 0, cursor: "pointer",
                            border: tSt === "done" ? `2px solid #16a34a` : tSt === "ip" ? `2px solid #d97706` : "2px solid #ccc",
                            background: tSt === "done" ? "#16a34a" : tSt === "ip" ? "#fffbeb" : "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s", boxShadow: tSt === "todo" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                          }}
                        >
                          {tSt === "done" && <span style={{ fontSize: 9, color: "#fff", fontWeight: 800 }}>✓</span>}
                          {tSt === "ip" && <span style={{ fontSize: 8, color: "#d97706", fontWeight: 800 }}>●</span>}
                        </div>
                        {editingTask === t.id && isCustom ? (
                          <input
                            autoFocus
                            defaultValue={t.name}
                            onBlur={(e) => { updateCustomTask(ws.id, t.id, { name: e.target.value || "New task" }); setEditingTask(null); }}
                            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { setEditingTask(null); } }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: 12, border: "none", borderBottom: "1px solid #ccc", outline: "none",
                              background: "transparent", padding: "0 2px", flex: 1, minWidth: 0, fontFamily: "inherit",
                            }}
                          />
                        ) : (
                          <span
                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: d ? "line-through" : "none", flex: 1 }}
                            onDoubleClick={(e) => { if (isCustom) { e.stopPropagation(); setEditingTask(t.id); } }}
                          >{getName(t.id, t.name)}</span>
                        )}
                        <span style={{ fontSize: 10, color: "#bbb", flexShrink: 0, fontWeight: 500 }}>{t.hr}h</span>
                        {isCustom && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteCustomTask(ws.id, t.id); }}
                            title="Delete task"
                            style={{
                              fontSize: 11, color: "#ccc", background: "transparent", border: "none",
                              cursor: "pointer", padding: "0 2px", flexShrink: 0, lineHeight: 1,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#ccc"; }}
                          >×</button>
                        )}
                      </div>
                      {W.map((w) => {
                        const inR = w.id >= pos.s && w.id <= pos.e, isS = w.id === pos.s, isE = w.id === pos.e;
                        const barColor = asgn ? ASSIGN_COLORS[asgn] : ws.color;
                        return (
                          <div key={w.id} data-week-cell style={{ borderLeft: "1px solid #f0eee9", padding: "4px 3px", display: "flex", alignItems: "center" }}>
                            {inR && (
                              <div
                                onClick={(e) => { e.stopPropagation(); if (didDragRef.current) { didDragRef.current = false; return; } setCardOpen(cardOpen && cardOpen.taskId === t.id ? null : { taskId: t.id, wsId: ws.id }); }}
                                onMouseDown={(e) => handleBarMouseDown(t.id, ws.id, t.s, t.e, "move", e)}
                                title="Click to open properties · Drag to move"
                                style={{
                                  height: 22, width: "100%", cursor: isDragging ? "grabbing" : "grab",
                                  background: d ? "#e8e6e1" : isDragging ? `${barColor}30` : `${barColor}18`,
                                  border: `1.5px solid ${d ? "#ccc" : barColor + "55"}`,
                                  borderRadius: isS && isE ? 5 : isS ? "5px 0 0 5px" : isE ? "0 5px 5px 0" : 0,
                                  borderRight: isE ? undefined : "none",
                                  borderLeft: isS ? undefined : "none",
                                  display: "flex", alignItems: "center", justifyContent: isS ? "flex-start" : "center",
                                  paddingLeft: isS ? 4 : 0, transition: isDragging ? "none" : "all 0.15s",
                                  userSelect: "none", position: "relative",
                                }}
                              >
                                {/* Left resize handle */}
                                {isS && (
                                  <div
                                    onMouseDown={(e) => { e.stopPropagation(); handleBarMouseDown(t.id, ws.id, t.s, t.e, "resize-left", e); }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute", left: 0, top: 0, bottom: 0, width: 6,
                                      cursor: "ew-resize", borderRadius: "5px 0 0 5px", zIndex: 2,
                                    }}
                                    title="Drag to resize"
                                  />
                                )}
                                {/* Right resize handle */}
                                {isE && (
                                  <div
                                    onMouseDown={(e) => { e.stopPropagation(); handleBarMouseDown(t.id, ws.id, t.s, t.e, "resize-right", e); }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute", right: 0, top: 0, bottom: 0, width: 6,
                                      cursor: "ew-resize", borderRadius: "0 5px 5px 0", zIndex: 2,
                                    }}
                                    title="Drag to resize"
                                  />
                                )}
                                {isS && asgn && <AssignBadge value={asgn} />}
                                {isE && tSt !== "todo" && (
                                  <span
                                    onClick={(e) => { e.stopPropagation(); cycleStatus(t.id, e); }}
                                    style={{
                                      position: "absolute", right: 3, top: "50%", transform: "translateY(-50%)",
                                      fontSize: tSt === "done" ? 10 : 9, fontWeight: 800, lineHeight: 1,
                                      color: STATUS_META[tSt].color, cursor: "pointer", zIndex: 3,
                                    }}
                                    title={`Status: ${STATUS_META[tSt].label}`}
                                  >{STATUS_META[tSt].icon}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {op && (
                      <div style={{ background: "#fff", padding: "12px 22px 16px 50px", borderRadius: "0 0 6px 6px", marginBottom: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                        <div style={{ maxWidth: 560 }}>
                          <div style={{ fontSize: 11, color: "#999", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                            Assigned to: {asgn ? <AssignBadge value={asgn} /> : <span style={{ color: "#ccc" }}>unassigned</span>}
                            <span style={{ fontSize: 10, color: "#ccc" }}>· click bar to change</span>
                          </div>
                          {isCustom ? (
                            <textarea
                              defaultValue={t.notes}
                              placeholder="Add notes…"
                              onBlur={(e) => updateCustomTask(ws.id, t.id, { notes: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: 12, color: "#666", lineHeight: 1.7, margin: "0 0 8px", width: "100%",
                                border: "1px solid #e8e6e1", borderRadius: 4, padding: "6px 8px",
                                fontFamily: "inherit", resize: "vertical", minHeight: 40, outline: "none",
                                background: "#faf9f6",
                              }}
                            />
                          ) : (
                            <p style={{ fontSize: 12, color: "#666", lineHeight: 1.7, margin: "0 0 8px" }}>{t.notes}</p>
                          )}
                          {t.dep && <div style={{ fontSize: 10, color: "#bbb", marginTop: 4 }}>Blocked by: {Array.isArray(t.dep) ? t.dep.join(", ") : t.dep}</div>}
                          {t.tools && (
                            <div style={{ marginTop: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
                              {t.tools.map((x) => {
                                const ic = x.includes("⚡");
                                return (
                                  <span key={x} style={{
                                    fontSize: 10, padding: "3px 9px",
                                    background: ic ? "#eef2ff" : "#f5f4f0",
                                    border: `1px solid ${ic ? "#c7d2fe" : "#e0ded8"}`,
                                    borderRadius: 4, color: ic ? "#4f46e5" : "#777", fontWeight: ic ? 600 : 400,
                                  }}>{x}</span>
                                );
                              })}
                            </div>
                          )}
                          {isCustom && (
                            <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                              <label style={{ fontSize: 10, color: "#999" }}>Hours:</label>
                              <input
                                type="number" min="0" step="0.5"
                                defaultValue={t.hr}
                                onBlur={(e) => updateCustomTask(ws.id, t.id, { hr: parseFloat(e.target.value) || 1 })}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  width: 50, fontSize: 11, border: "1px solid #e8e6e1", borderRadius: 4,
                                  padding: "3px 6px", fontFamily: "inherit", outline: "none", background: "#faf9f6",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            );
          })}
        </div>
        {/* ── Task Card Panel ──────────────────────────── */}
        {cardOpen && (() => {
          const ct = findTask(cardOpen.taskId, cardOpen.wsId);
          if (!ct) return null;
          const pos = getTaskPos(ct);
          const asgn = assigns[cardOpen.taskId] || "";
          const props = getTaskPropsMerged(cardOpen.taskId);
          const availWeeks = getAvailableWeeks(cardOpen.taskId, cardOpen.wsId);
          const ws = WS.find((w) => w.id === cardOpen.wsId);
          const wsColor = ws ? ws.color : "#666";

          return (
            <div style={{
              width: 320, flexShrink: 0, background: "#fff", borderLeft: "1px solid #e8e6e1",
              borderRadius: "0 8px 8px 0", boxShadow: "-2px 0 12px rgba(0,0,0,0.06)",
              padding: "20px 18px", overflowY: "auto", maxHeight: "calc(100vh - 120px)",
              position: "sticky", top: 0,
            }}>
              {/* Header — editable names */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    key={`ws-${cardOpen.wsId}`}
                    defaultValue={getName(cardOpen.wsId, ws?.name)}
                    onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== ws?.name) setName(cardOpen.wsId, v); }}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: wsColor,
                      marginBottom: 4, display: "block", width: "100%", border: "none", borderBottom: "1px solid transparent",
                      background: "transparent", padding: "0 0 1px", outline: "none", fontFamily: "inherit",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = wsColor; }}
                    onBlurCapture={(e) => { e.currentTarget.style.borderBottomColor = "transparent"; }}
                  />
                  <input
                    key={`task-${cardOpen.taskId}`}
                    defaultValue={getName(cardOpen.taskId, ct.name)}
                    onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== ct.name) setName(cardOpen.taskId, v); }}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: 14, fontWeight: 600, color: "#1a1a1a", width: "100%", border: "none",
                      borderBottom: "1px solid transparent", background: "transparent", padding: "0 0 1px",
                      outline: "none", fontFamily: "inherit",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#ccc"; }}
                    onBlurCapture={(e) => { e.currentTarget.style.borderBottomColor = "transparent"; }}
                  />
                </div>
                <button onClick={() => setCardOpen(null)} style={{
                  background: "transparent", border: "none", fontSize: 18, color: "#bbb", cursor: "pointer",
                  padding: "0 4px", lineHeight: 1, flexShrink: 0,
                }} onMouseEnter={(e) => { e.currentTarget.style.color = "#666"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#bbb"; }}>×</button>
              </div>

              {/* Week Position */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Week</label>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {W.map((w) => {
                    const isCurrent = w.id >= pos.s && w.id <= pos.e;
                    const isAvail = availWeeks.includes(w.id) || isCurrent;
                    return (
                      <button
                        key={w.id}
                        onClick={() => { if (isAvail && !isCurrent) moveTaskToWeek(cardOpen.taskId, cardOpen.wsId, w.id); }}
                        style={{
                          padding: "4px 8px", fontSize: 10, fontWeight: isCurrent ? 700 : 500,
                          background: isCurrent ? wsColor + "18" : "transparent",
                          border: `1.5px solid ${isCurrent ? wsColor : isAvail ? "#e0ded8" : "#f0eee9"}`,
                          borderRadius: 4, cursor: isAvail ? "pointer" : "not-allowed",
                          color: isCurrent ? wsColor : isAvail ? "#666" : "#ddd",
                          opacity: isAvail ? 1 : 0.4, transition: "all 0.12s",
                        }}
                      >{w.l}</button>
                    );
                  })}
                </div>
              </div>

              {/* Assigned To */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Assigned to</label>
                <div style={{ display: "flex", gap: 5 }}>
                  {ASSIGN_CYCLE.map((a) => {
                    const isActive = asgn === a;
                    const label = a === "" ? "None" : ASSIGN_LABELS[a];
                    const color = a === "" ? "#999" : ASSIGN_COLORS[a];
                    return (
                      <button
                        key={a}
                        onClick={() => setAssigns((prev) => ({ ...prev, [cardOpen.taskId]: a }))}
                        style={{
                          padding: "4px 10px", fontSize: 10, fontWeight: isActive ? 700 : 500,
                          background: isActive ? color + "18" : "transparent",
                          border: `1.5px solid ${isActive ? color : "#e0ded8"}`,
                          borderRadius: 4, cursor: "pointer", color: isActive ? color : "#888",
                          transition: "all 0.12s",
                        }}
                      >{label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Status</label>
                <div style={{ display: "flex", gap: 5 }}>
                  {STATUS_CYCLE.map((s) => {
                    const meta = STATUS_META[s];
                    const isActive = getStatus(cardOpen.taskId) === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setStatusDirect(cardOpen.taskId, s)}
                        style={{
                          padding: "4px 10px", fontSize: 10, fontWeight: isActive ? 700 : 500,
                          background: isActive ? meta.bg : "transparent",
                          border: `1.5px solid ${isActive ? meta.color : "#e0ded8"}`,
                          borderRadius: 4, cursor: "pointer", color: isActive ? meta.color : "#888",
                          transition: "all 0.12s", display: "flex", alignItems: "center", gap: 4,
                        }}
                      >{meta.icon && <span style={{ fontSize: s === "done" ? 10 : 8 }}>{meta.icon}</span>}{meta.label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Start Date / End Date */}
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Start date</label>
                  <input
                    type="date"
                    value={props.startDate}
                    onChange={(e) => updateTaskProp(cardOpen.taskId, { startDate: e.target.value })}
                    style={{
                      width: "100%", fontSize: 11, padding: "5px 6px", border: "1px solid #e8e6e1",
                      borderRadius: 4, fontFamily: "inherit", outline: "none", background: "#faf9f6", color: "#444",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>End date</label>
                  <input
                    type="date"
                    value={props.endDate}
                    onChange={(e) => updateTaskProp(cardOpen.taskId, { endDate: e.target.value })}
                    style={{
                      width: "100%", fontSize: 11, padding: "5px 6px", border: "1px solid #e8e6e1",
                      borderRadius: 4, fontFamily: "inherit", outline: "none", background: "#faf9f6", color: "#444",
                    }}
                  />
                </div>
              </div>

              {/* Assets (up to 3) */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Assets</label>
                {[0, 1, 2].map((idx) => {
                  const asset = props.assets?.[idx] || null;
                  return (
                    <div key={idx} style={{ marginBottom: 6 }}>
                      {asset ? (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "5px 8px",
                          background: "#f5f4f0", borderRadius: 4, border: "1px solid #e8e6e1",
                        }}>
                          <span
                            onClick={() => triggerAssetDownload(asset)}
                            style={{ fontSize: 11, color: "#4f46e5", cursor: "pointer", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            title={getAssetUrl(asset)}
                          >{getAssetName(asset)}</span>
                          <button
                            onClick={() => {
                              const newAssets = [...(props.assets || [null, null, null])];
                              newAssets[idx] = null;
                              updateTaskProp(cardOpen.taskId, { assets: newAssets });
                            }}
                            style={{ background: "transparent", border: "none", fontSize: 13, color: "#ccc", cursor: "pointer", padding: 0, lineHeight: 1 }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#ccc"; }}
                          >×</button>
                        </div>
                      ) : (
                        <AssetInput
                          onValue={(val) => {
                            const newAssets = [...(props.assets || [null, null, null])];
                            newAssets[idx] = val;
                            updateTaskProp(cardOpen.taskId, { assets: newAssets });
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Notes</label>
                <textarea
                  defaultValue={props.notes}
                  placeholder="Add notes…"
                  onBlur={(e) => updateTaskProp(cardOpen.taskId, { notes: e.target.value })}
                  style={{
                    width: "100%", fontSize: 11, lineHeight: 1.6, border: "1px solid #e8e6e1",
                    borderRadius: 4, padding: "6px 8px", fontFamily: "inherit", resize: "vertical",
                    minHeight: 60, outline: "none", background: "#faf9f6", color: "#444",
                  }}
                />
              </div>

              {/* Create B Things Task */}
              <button
                onClick={() => openBtModal(getName(cardOpen.taskId, ct.name))}
                style={{
                  width: "100%", padding: "8px 0", fontSize: 11, fontWeight: 600,
                  background: "#3ABD82", color: "#fff", border: "none", borderRadius: 5,
                  cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6, transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#2fa873"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#3ABD82"; }}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>＋</span> Create B Things Task
              </button>

              {/* Static task info (readonly) */}
              {ct.dep && <div style={{ fontSize: 10, color: "#bbb", marginBottom: 6 }}>Blocked by: {Array.isArray(ct.dep) ? ct.dep.join(", ") : ct.dep}</div>}
              {ct.tools && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {ct.tools.map((x) => {
                    const ic = x.includes("⚡");
                    return (
                      <span key={x} style={{
                        fontSize: 9, padding: "2px 7px",
                        background: ic ? "#eef2ff" : "#f5f4f0",
                        border: `1px solid ${ic ? "#c7d2fe" : "#e0ded8"}`,
                        borderRadius: 3, color: ic ? "#4f46e5" : "#888", fontWeight: ic ? 600 : 400,
                      }}>{x}</span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
        </div>
      )}

      {/* ── Tools Tab ───────────────────────────────────── */}
      {tab === "tools" && (
        <div>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 16 }}>
            Click to select · <span style={{ color: "#4f46e5", fontWeight: 600 }}>⚡ = build with Claude ($0)</span> · Update status as you go
          </div>
          {TOOLS.map((cat) => {
            const op = openCat === cat.id;
            return (
              <div key={cat.id} style={{ marginBottom: 10 }}>
                <div
                  onClick={() => setOpenCat(op ? null : cat.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", background: "#fff", border: "1px solid #e8e6e1",
                    borderRadius: op ? "8px 8px 0 0" : 8, cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#bbb", fontSize: 11, transition: "transform 0.15s", transform: op ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{cat.name}</span>
                    {sel[cat.id] && (
                      <span style={{
                        fontSize: 11, padding: "2px 9px", borderRadius: 4, fontWeight: 500,
                        background: isCl(sel[cat.id]) ? "#eef2ff" : "#ecfdf5",
                        border: `1px solid ${isCl(sel[cat.id]) ? "#c7d2fe" : "#bbf7d0"}`,
                        color: isCl(sel[cat.id]) ? "#4f46e5" : "#16a34a",
                      }}>{sel[cat.id]}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "#bbb" }}>by {cat.by}</span>
                    <select
                      value={tStat[cat.id]}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setTStat({ ...tStat, [cat.id]: e.target.value })}
                      style={{
                        fontSize: 11, padding: "3px 8px", background: "#f8f7f4", fontFamily: "inherit", cursor: "pointer",
                        color: tStat[cat.id] === "set up" ? "#16a34a" : tStat[cat.id] === "decided" ? "#4f46e5" : tStat[cat.id] === "researching" ? "#d97706" : "#aaa",
                        border: "1px solid #e0ded8", borderRadius: 4, fontWeight: 500,
                      }}
                    >
                      {SO.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {op && (
                  <div style={{ border: "1px solid #e8e6e1", borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "170px 90px 1fr 1fr 55px", background: "#faf9f6", padding: "8px 0", fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      <div style={{ padding: "0 12px" }}>Tool</div>
                      <div style={{ padding: "0 8px" }}>Price</div>
                      <div style={{ padding: "0 8px" }}>Pros</div>
                      <div style={{ padding: "0 8px" }}>Cons</div>
                      <div style={{ padding: "0 8px", textAlign: "center" }}>Fit</div>
                    </div>
                    {cat.opts.map((o) => {
                      const iS = sel[cat.id] === o.n, ic = o.n.includes("⚡");
                      return (
                        <div
                          key={o.n}
                          onClick={() => setSel({ ...sel, [cat.id]: iS ? null : o.n })}
                          style={{
                            display: "grid", gridTemplateColumns: "170px 90px 1fr 1fr 55px",
                            padding: "10px 0", borderTop: "1px solid #f0eee9", cursor: "pointer",
                            background: iS ? (ic ? "#eef2ff" : "#ecfdf5") : "transparent", transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) => { if (!iS) e.currentTarget.style.background = "#faf9f6"; }}
                          onMouseLeave={(e) => { if (!iS) e.currentTarget.style.background = "transparent"; }}
                        >
                          <div style={{ padding: "0 12px", fontSize: 12, fontWeight: 600, color: iS ? (ic ? "#4f46e5" : "#16a34a") : ic ? "#4f46e5" : "#333", display: "flex", alignItems: "flex-start", gap: 5 }}>
                            {iS && <span>✓</span>}{o.n}
                          </div>
                          <div style={{ padding: "0 8px", fontSize: 11, color: o.p === "$0" ? "#16a34a" : "#888" }}>{o.p}</div>
                          <div style={{ padding: "0 8px", fontSize: 11, color: "#666", lineHeight: 1.5 }}>{o.pro}</div>
                          <div style={{ padding: "0 8px", fontSize: 11, color: "#999", lineHeight: 1.5 }}>{o.con}</div>
                          <div style={{ padding: "0 6px", textAlign: "center", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                            <span style={{
                              fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 500,
                              background: o.f === "high" ? "#ecfdf5" : o.f === "medium" ? "#fffbeb" : "#fef2f2",
                              color: FC[o.f], border: `1px solid ${o.f === "high" ? "#bbf7d0" : o.f === "medium" ? "#fde68a" : "#fecaca"}`,
                            }}>{o.f}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Budget Tab ──────────────────────────────────── */}
      {tab === "budget" && (
        <div>
          <div style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "155px 95px 95px 1fr", background: "#faf9f6", padding: "10px 0", fontSize: 10, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
              <div style={{ padding: "0 16px" }}>Category</div>
              <div style={{ padding: "0 8px", textAlign: "right" }}>Low</div>
              <div style={{ padding: "0 8px", textAlign: "right" }}>High</div>
              <div style={{ padding: "0 16px" }}>Notes</div>
            </div>
            {BUDGET.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "155px 95px 95px 1fr", padding: "10px 0", borderTop: "1px solid #f0eee9" }}>
                <div style={{ padding: "0 16px", fontSize: 12, color: "#333", fontWeight: 500 }}>{r.c}</div>
                <div style={{ padding: "0 8px", fontSize: 12, color: "#888", textAlign: "right" }}>${r.lo}/mo</div>
                <div style={{ padding: "0 8px", fontSize: 12, color: "#888", textAlign: "right" }}>${r.hi}/mo</div>
                <div style={{ padding: "0 16px", fontSize: 11, color: "#aaa" }}>{r.n}</div>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "155px 95px 95px 1fr", padding: "12px 0", borderTop: "2px solid #e8e6e1", background: "#faf9f6" }}>
              <div style={{ padding: "0 16px", fontSize: 13, color: "#1a1a1a", fontWeight: 700 }}>Monthly Total</div>
              <div style={{ padding: "0 8px", fontSize: 13, color: "#1a1a1a", textAlign: "right", fontWeight: 700 }}>~${BUDGET.reduce((s, r) => s + r.lo, 0).toLocaleString()}</div>
              <div style={{ padding: "0 8px", fontSize: 13, color: "#1a1a1a", textAlign: "right", fontWeight: 700 }}>~${BUDGET.reduce((s, r) => s + r.hi, 0).toLocaleString()}</div>
              <div style={{ padding: "0 16px", fontSize: 11, color: "#aaa" }}>Excl. Nico</div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ padding: 16, background: "#fff", border: "1px solid #e8e6e1", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#d97706", marginBottom: 10 }}>Unit Economics Targets</div>
              <div style={{ fontSize: 11, color: "#777", lineHeight: 1.9 }}>
                Cost per lead (quiz): $3–8<br />Email → purchase: 2–5%<br />Landing page CVR: 3–8% (warm)<br />Payback period: {"<"}30 days
              </div>
            </div>
            <div style={{ padding: 16, background: "#fff", border: "1px solid #e8e6e1", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#4f46e5", marginBottom: 10 }}>⚡ Claude-Built Savings</div>
              <div style={{ fontSize: 11, color: "#777", lineHeight: 1.9 }}>
                Quiz: saves $25–99/mo<br />Landing page: saves $2–99/mo<br />Dashboard: saves $0–100+/mo<br /><b style={{ color: "#333" }}>Potential: $27–298/mo</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── B Things Create Task Modal ────────────────── */}
      {btModal && (
        <div
          onClick={() => setBtModal(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 10, width: 380, padding: "24px 22px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)", position: "relative",
            }}
          >
            {btSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#3ABD82" }}>Task created in B Things</div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 5, background: "#3ABD82",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif",
                    }}>T</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>Create B Things Task</span>
                  </div>
                  <button
                    onClick={() => setBtModal(null)}
                    style={{ background: "transparent", border: "none", fontSize: 18, color: "#bbb", cursor: "pointer", padding: "0 4px" }}
                  >×</button>
                </div>

                {/* Title */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Title</label>
                  <input
                    autoFocus
                    value={btModal.title}
                    onChange={(e) => setBtModal((m) => ({ ...m, title: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter" && btModal.title.trim()) submitBtTask(btModal); }}
                    style={{
                      width: "100%", fontSize: 13, padding: "8px 10px", border: "1px solid #e8e6e1",
                      borderRadius: 5, fontFamily: "inherit", outline: "none", background: "#faf9f6", color: "#333",
                    }}
                  />
                </div>

                {/* Project + Bucket row */}
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Project</label>
                    <select
                      value={btModal.projectId}
                      onChange={(e) => setBtModal((m) => ({ ...m, projectId: e.target.value }))}
                      style={{
                        width: "100%", fontSize: 11, padding: "7px 8px", border: "1px solid #e8e6e1",
                        borderRadius: 5, fontFamily: "inherit", outline: "none", background: "#faf9f6", color: "#444",
                      }}
                    >
                      <option value="">Inbox (no project)</option>
                      {(btProjects || []).map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>When</label>
                    <select
                      value={btModal.bucket}
                      onChange={(e) => setBtModal((m) => ({ ...m, bucket: e.target.value }))}
                      style={{
                        width: "100%", fontSize: 11, padding: "7px 8px", border: "1px solid #e8e6e1",
                        borderRadius: 5, fontFamily: "inherit", outline: "none", background: "#faf9f6", color: "#444",
                      }}
                    >
                      <option value="inbox">Inbox</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="soon">This Week</option>
                      <option value="someday">Later</option>
                      <option value="waiting">Waiting / Delegated</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Notes</label>
                  <textarea
                    value={btModal.notes}
                    onChange={(e) => setBtModal((m) => ({ ...m, notes: e.target.value }))}
                    placeholder="Optional notes…"
                    rows={3}
                    style={{
                      width: "100%", fontSize: 11, lineHeight: 1.6, border: "1px solid #e8e6e1",
                      borderRadius: 5, padding: "7px 10px", fontFamily: "inherit", resize: "vertical",
                      outline: "none", background: "#faf9f6", color: "#444",
                    }}
                  />
                </div>

                {/* Error message */}
                {btError && (
                  <div style={{
                    marginBottom: 10, padding: "8px 10px", fontSize: 11, color: "#b91c1c",
                    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5,
                  }}>{btError}</div>
                )}

                {/* Submit */}
                <button
                  disabled={btSending || !btModal.title.trim()}
                  onClick={() => submitBtTask(btModal)}
                  style={{
                    width: "100%", padding: "10px 0", fontSize: 13, fontWeight: 700,
                    background: btSending || !btModal.title.trim() ? "#ccc" : "#3ABD82",
                    color: "#fff", border: "none", borderRadius: 6, cursor: btSending ? "wait" : "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  {btSending ? "Creating…" : "Create Task"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
