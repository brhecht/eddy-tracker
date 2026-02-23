import { useState, useMemo, useCallback } from "react";
import { useFirestoreState } from "./useFirestoreState";

/* ── Static Data ────────────────────────────────────────────────── */

const W = [
  { id: 1, l: "W1", d: "Feb 24–28" },
  { id: 2, l: "W2", d: "Mar 2–6" },
  { id: 3, l: "W3", d: "Mar 9–13" },
  { id: 4, l: "W4", d: "Mar 16–20" },
  { id: 5, l: "W5", d: "Mar 23–27" },
  { id: 6, l: "W6", d: "Mar 30–Apr 3" },
  { id: 7, l: "W7", d: "Apr 6–10" },
];

const MS = [
  { week: 5, label: "Course Live", color: "#16a34a" },
  { week: 7, label: "Full Mktg", color: "#d97706" },
];

const ASSIGN_CYCLE = ["B", "N", "Both", ""];
const ASSIGN_COLORS = { B: "#4f46e5", N: "#0d9488", Both: "#d97706", "": "transparent" };
const ASSIGN_LABELS = { B: "Brian", N: "Nico", Both: "Both", "": "" };

const WS = [
  {
    id: "host", name: "Course Hosting", color: "#6366f1", tasks: [
      { id: "h1", name: "Evaluate platforms", s: 1, e: 1, hr: 2, as: "B", notes: "Score: video quality, Stripe, email integration, student UX, analytics, cost. 2 days max.", tools: ["Teachable", "Podia", "Kajabi", "Thinkific", "Stan Store"] },
      { id: "h2", name: "Select & configure", s: 1, e: 1, hr: 2, as: "B", notes: "Account, Stripe, domain, branding. Test purchase flow with dummy product.", dep: "h1" },
      { id: "h3", name: "Upload test lessons", s: 1, e: 2, hr: 2, as: "B", notes: "Upload 2–3 early cuts. Check playback, mobile, drip settings, completion tracking.", dep: "h2" },
      { id: "h4", name: "Upload all final lessons", s: 4, e: 4, hr: 3, as: "N", notes: "Final batch. Lesson order, descriptions, downloadables, pricing.", dep: "h3" },
    ],
  },
  {
    id: "email", name: "Email / Nurture", color: "#ec4899", tasks: [
      { id: "e1", name: "Select email platform", s: 1, e: 1, hr: 1, as: "B", notes: "Kit (ConvertKit) default for creator funnels. Check if course platform built-in is sufficient.", tools: ["Kit (ConvertKit)", "Beehiiv", "Platform built-in"] },
      { id: "e2", name: "Configure domain + warm", s: 1, e: 1, hr: 2, as: "B", notes: "SPF, DKIM, DMARC. Start warming immediately. Claude walks you through.", dep: "e1" },
      { id: "e3", name: "Map sequence architecture", s: 2, e: 2, hr: 2, as: "B", notes: "Quiz → Welcome+Results → Nurture (5-7 emails, 12 days) → Sale. Post-purchase: Onboard → Check-in → Completion." },
      { id: "e4", name: "Write nurture sequence", s: 2, e: 3, hr: 5, as: "B", notes: "HIGHEST-ROI WRITING TASK. Each email: one insight, one story, one CTA. Draft w/ Claude, refine in your voice.", dep: "e3" },
      { id: "e5", name: "Build + test automations", s: 3, e: 3, hr: 2, as: "B", notes: "Triggers, delays, tags, conditional logic by quiz segment. Test every path end-to-end.", dep: "e4" },
    ],
  },
  {
    id: "video", name: "Video Editing", color: "#0d9488", tasks: [
      { id: "v1", name: "Style guide + ref edit", s: 1, e: 1, hr: 3, as: "Both", notes: "YOU define: titles, lower thirds, transitions, music, intro/outro. Edit Lesson 1 together. This is the template." },
      { id: "v2", name: "Test AI editing tools", s: 1, e: 1, hr: 2, as: "N", notes: "Test Descript on Lesson 1 alongside manual edit. Compare quality + time. Try CapCut Pro for captions.", tools: ["Descript", "CapCut Pro", "Riverside"] },
      { id: "v3", name: "Edit Lessons 1–5", s: 1, e: 2, hr: 15, as: "N", notes: "First batch. Brian reviews + gives feedback FAST — calibrate before doing 10 more.", dep: "v1" },
      { id: "v4", name: "Edit Lessons 6–10", s: 2, e: 3, hr: 15, as: "N", notes: "Second batch. Faster now. Brian reviews within 24 hours.", dep: "v3" },
      { id: "v5", name: "Edit Lessons 11–15", s: 3, e: 4, hr: 12, as: "N", notes: "Final batch. Nico in flow.", dep: "v4" },
      { id: "v6", name: "Final QA + export", s: 4, e: 4, hr: 4, as: "N", notes: "Audio consistency, verify titles, export in platform format.", dep: "v5" },
    ],
  },
  {
    id: "quiz", name: "Lead Magnet / Quiz", color: "#ea580c", tasks: [
      { id: "q1", name: "Design quiz structure", s: 2, e: 2, hr: 3, as: "B", notes: "8–12 questions. 3–4 result archetypes. Scoring logic. Each archetype → course purchase angle. Brainstorm w/ Claude." },
      { id: "q2", name: "Build quiz", s: 2, e: 3, hr: 4, as: "B", notes: "Logic branching, email gate before results, mobile-first. If Claude-built: React → Vercel.", tools: ["⚡ Build with Claude → Vercel", "Typeform", "ScoreApp", "Interact", "Tally"], dep: "q1" },
      { id: "q3", name: "Write results pages", s: 3, e: 3, hr: 3, as: "B", notes: "One per archetype. Mini sales page: profile → meaning → gap → course fills it. Heavy CTAs.", dep: "q2" },
      { id: "q4", name: "Connect quiz → email", s: 3, e: 3, hr: 2, as: "B", notes: "Submission → tag by archetype → trigger nurture. If self-built: POST to Kit API or Zapier. Test on mobile.", dep: "q3" },
    ],
  },
  {
    id: "land", name: "Landing Page", color: "#7c3aed", tasks: [
      { id: "l1", name: "Write sales page copy", s: 3, e: 3, hr: 4, as: "B", notes: "Hero → Pain → Solution → What You Learn → Proof → Cred → Pricing → FAQ → CTA. Draft w/ Claude. Informs ad messaging." },
      { id: "l2", name: "Build landing page V1", s: 3, e: 4, hr: 4, as: "B", notes: "Claude-built React → Vercel = free, custom. Or Carrd for speed. Copy > design at this stage.", tools: ["⚡ Build with Claude → Vercel", "Carrd", "Framer", "Unbounce", "Platform built-in"], dep: "l1" },
      { id: "l3", name: "Build A/B variant", s: 4, e: 4, hr: 2, as: "B", notes: "Change ONE variable: headline, hero, or CTA. Not all three. Clean signal.", dep: "l2" },
      { id: "l4", name: "Mobile QA", s: 4, e: 4, hr: 1, as: "Both", notes: "60%+ traffic is mobile. Test on actual phones. Load speed, CTA visibility, form UX.", dep: "l2" },
    ],
  },
  {
    id: "creative", name: "Ad Creative", color: "#dc2626", tasks: [
      { id: "c1", name: "Define messaging angles", s: 3, e: 3, hr: 2, as: "B", notes: "3 angles: pain ('You're losing X'), aspiration ('Imagine Y'), proof ('Founders like you'). Each → multiple creatives." },
      { id: "c2", name: "Script video ads", s: 4, e: 4, hr: 2, as: "B", notes: "3–4 scripts, 15–30s. Hook in 3 seconds. Structure: Hook → Pain → Proof → CTA. Authenticity > production.", dep: "c1" },
      { id: "c3", name: "Record video ads", s: 4, e: 4, hr: 2, as: "Both", notes: "Phone, good light, clean BG. Multiple takes. Nico does light edits. Batch in one session.", dep: "c2" },
      { id: "c4", name: "Create static + carousel", s: 4, e: 5, hr: 3, as: "B", notes: "3 statics (bold text + value prop), 2 carousels. Canva or Claude-built.", tools: ["Canva", "⚡ Build with Claude (HTML/SVG)", "Figma"], dep: "c1" },
      { id: "c5", name: "Weekly creative refresh", s: 6, e: 7, hr: 4, as: "Both", notes: "2–3 new ads/week. Creative fatigue is #1 killer. Remix winning angles w/ new hooks.", dep: "c4" },
    ],
  },
  {
    id: "analytics", name: "Analytics / Tracking", color: "#0284c7", tasks: [
      { id: "t1", name: "Design UTM architecture", s: 2, e: 2, hr: 2, as: "B", notes: "UTM naming convention. Map every touchpoint: ad → landing → quiz → email → purchase.", tools: ["⚡ Build with Claude (doc)", "Google Sheets"] },
      { id: "t2", name: "Install Meta Pixel + CAPI", s: 4, e: 4, hr: 2, as: "B", notes: "Pixel on landing + quiz + course platform. Conversions API if possible. Claude helps w/ code.", dep: "t1" },
      { id: "t3", name: "Set up conversion events", s: 4, e: 4, hr: 1, as: "B", notes: "PageView, Lead, InitiateCheckout, Purchase. Custom: quiz start, email signup. Test w/ Pixel Helper.", dep: "t2" },
      { id: "t4", name: "Build analytics dashboard", s: 4, e: 5, hr: 3, as: "B", notes: "Ad spend, CPL, CPA, email CVR, revenue, ROAS. Sheets to start, Claude dashboard when volume justifies.", tools: ["⚡ Build with Claude → Vercel", "Google Sheets", "Looker Studio"], dep: "t3" },
      { id: "t5", name: "Weekly funnel review", s: 5, e: 7, hr: 3, as: "B", notes: "Where's drop-off worst? Ad→landing, landing→quiz, quiz→email, email→purchase. Fix biggest leak first." },
    ],
  },
  {
    id: "camp", name: "Campaign Mgmt", color: "#b45309", tasks: [
      { id: "a1", name: "Define target audiences", s: 4, e: 4, hr: 2, as: "B", notes: "3–4 segments by founder stage/vertical/pain. Interest targeting first, then lookalikes from quiz data." },
      { id: "a2", name: "Set up Meta Business Mgr", s: 4, e: 4, hr: 2, as: "B", notes: "Business Manager, Ad Account, payment. Don't skip Business Verification.", tools: ["Meta Business Manager"] },
      { id: "a3", name: "Structure campaigns", s: 5, e: 5, hr: 2, as: "B", notes: "Two funnels: (1) Lead magnet — lower CPA, builds pixel + list. (2) Direct purchase — retarget warm. Start ABO.", dep: "a1" },
      { id: "a4", name: "Launch lead magnet ads", s: 5, e: 5, hr: 1, as: "B", notes: "$30–50/day. Same day as course. Build list + pixel data. Wait 3–5 days before evaluating.", dep: "a3" },
      { id: "a5", name: "Launch direct-sale ads", s: 6, e: 6, hr: 2, as: "B", notes: "Retarget quiz takers, page visitors, email openers. Lookalikes. Higher budget on proven creative.", dep: "a4" },
      { id: "a6", name: "Ongoing optimization", s: 5, e: 7, hr: 5, as: "B", notes: "Daily 15min: CTR>1%, CPC, CPL. Kill after $50–100 spend. Weekly: realloc budget. Bi-weekly: full funnel.", dep: "a4" },
    ],
  },
];

const TOOLS = [
  {
    id: "hosting", name: "Course Hosting", by: "Feb 26", opts: [
      { n: "Teachable", p: "$39–119/mo", pro: "Purpose-built, clean UX, Stripe", con: "Tx fees on lower plan", f: "high" },
      { n: "Podia", p: "$39–75/mo", pro: "Simple, includes email+pages, no tx fees", con: "Less robust analytics", f: "high" },
      { n: "Kajabi", p: "$149/mo", pro: "All-in-one, reduces tool count", con: "Expensive, more than needed", f: "medium" },
      { n: "Thinkific", p: "$49–99/mo", pro: "Flexible, free tier to test", con: "Can feel clunky", f: "medium" },
      { n: "Stan Store", p: "$29/mo", pro: "Lightweight, mobile-first", con: "Limited course features", f: "medium" },
      { n: "Circle.so", p: "$89–219/mo", pro: "You know it", con: "Paying for community you don't need", f: "low" },
    ],
  },
  {
    id: "email", name: "Email Platform", by: "Feb 26", opts: [
      { n: "Kit (ConvertKit)", p: "$29–59/mo", pro: "Best creator automation, visual flows", con: "Basic email editor", f: "high" },
      { n: "Beehiiv", p: "$0–99/mo", pro: "Great deliverability, newsletter option", con: "Automation less mature", f: "medium" },
      { n: "Platform built-in", p: "$0", pro: "No extra tool, integrated", con: "Limited automation, less portable", f: "medium" },
    ],
  },
  {
    id: "quiz", name: "Quiz / Lead Magnet", by: "Mar 6", opts: [
      { n: "⚡ Build with Claude → Vercel", p: "$0", pro: "Fully custom, no monthly cost, own it, API to email", con: "Iterate w/ Claude, you maintain", f: "high" },
      { n: "Typeform", p: "$25–50/mo", pro: "Beautiful UX, logic branching, integrations", con: "Response limits on lower tiers", f: "high" },
      { n: "ScoreApp", p: "$29–99/mo", pro: "Built for scored quiz funnels", con: "Pricey, less known", f: "medium" },
      { n: "Interact", p: "$27–53/mo", pro: "Quiz-specific, good templates", con: "Smaller ecosystem", f: "medium" },
      { n: "Tally", p: "$0–29/mo", pro: "Free tier, simple", con: "Limited scoring", f: "low" },
    ],
  },
  {
    id: "landing", name: "Landing Page", by: "Mar 11", opts: [
      { n: "⚡ Build with Claude → Vercel", p: "$0", pro: "Fully custom, free, embed quiz, custom A/B", con: "You maintain, no visual editor", f: "high" },
      { n: "Carrd", p: "$19/yr", pro: "Extremely fast, cheap, clean", con: "Limited A/B testing", f: "high" },
      { n: "Framer", p: "$5–15/mo", pro: "Modern, AI-assisted", con: "Less conversion-focused", f: "medium" },
      { n: "Unbounce", p: "$99/mo", pro: "Best A/B testing", con: "Expensive early", f: "medium" },
    ],
  },
  {
    id: "editing", name: "AI Video Editing", by: "Feb 28", opts: [
      { n: "Descript", p: "$24–33/mo", pro: "Transcript editing, filler removal, Studio Sound", con: "Learning curve", f: "high" },
      { n: "CapCut Pro", p: "$8–10/mo", pro: "Auto-captions, templates, cheap", con: "Consumer-oriented", f: "medium" },
      { n: "Manual (Premiere/DaVinci)", p: "$0–23/mo", pro: "Full control, Nico knows it", con: "No AI assist", f: "medium" },
    ],
  },
  {
    id: "analytics", name: "Analytics Dashboard", by: "Mar 18", opts: [
      { n: "⚡ Build with Claude → Vercel", p: "$0", pro: "Custom metrics, live updating", con: "API setup complexity", f: "high" },
      { n: "Google Sheets", p: "$0", pro: "Simple, shareable, good enough early", con: "Manual entry", f: "high" },
      { n: "Looker Studio", p: "$0", pro: "Connects data sources, visual", con: "Setup time", f: "medium" },
    ],
  },
  {
    id: "adtools", name: "Ad Creative Tools", by: "Mar 18", opts: [
      { n: "Phone + natural light", p: "$0", pro: "UGC-style outperforms polished", con: "On camera", f: "high" },
      { n: "Canva Pro", p: "$13/mo", pro: "Fast statics + carousels", con: "Can look generic", f: "high" },
      { n: "⚡ Build with Claude (SVG)", p: "$0", pro: "Unique designs, export as images", con: "Slower", f: "medium" },
    ],
  },
];

const FC = { high: "#16a34a", medium: "#d97706", low: "#dc2626" };
const SO = ["not started", "researching", "decided", "set up"];

const BUDGET = [
  { c: "Course Platform", lo: 39, hi: 149, n: "Podia/Teachable vs Kajabi" },
  { c: "Email Platform", lo: 0, hi: 59, n: "$0 if built-in, Kit ~$29–59" },
  { c: "Quiz Tool", lo: 0, hi: 50, n: "$0 with Claude, Typeform $25–50" },
  { c: "Landing Page", lo: 0, hi: 99, n: "$0 with Claude, Carrd $2/mo, Unbounce $99" },
  { c: "Video Editing", lo: 0, hi: 33, n: "Descript if adopted" },
  { c: "Ad Creative", lo: 0, hi: 13, n: "Phone + Canva. $0 with Claude" },
  { c: "Analytics", lo: 0, hi: 0, n: "Sheets or Claude-built. Free." },
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

/* ── Main Component ──────────────────────────────────────────────── */

export default function EddyTracker() {
  const [tab, setTab] = useState("gantt");
  const [openTask, setOpenTask] = useState(null);
  const [openCat, setOpenCat] = useState(null);

  // Shared Firestore state
  const [done, setDone] = useFirestoreState("done", {});
  const [assigns, setAssigns] = useFirestoreState("assigns", initAssigns());
  const [tStat, setTStat] = useFirestoreState("tStat", initToolStatus());
  const [sel, setSel] = useFirestoreState("sel", {});

  const tog = useCallback((id) => setDone((p) => ({ ...p, [id]: !p[id] })), [setDone]);

  const cycleAssign = useCallback((taskId, e) => {
    e.stopPropagation();
    setAssigns((prev) => {
      const cur = prev[taskId] || "";
      const idx = ASSIGN_CYCLE.indexOf(cur);
      const next = ASSIGN_CYCLE[(idx + 1) % ASSIGN_CYCLE.length];
      return { ...prev, [taskId]: next };
    });
  }, [setAssigns]);

  const st = useMemo(() => {
    let bh = 0, nh = 0, tot = 0, dn = 0;
    WS.forEach((ws) =>
      ws.tasks.forEach((t) => {
        tot++;
        if (done[t.id]) dn++;
        const a = assigns[t.id] || "";
        if (a === "N") nh += t.hr;
        else if (a === "Both") { bh += Math.ceil(t.hr * 0.5); nh += Math.ceil(t.hr * 0.5); }
        else bh += t.hr;
      })
    );
    return { bh, nh, tot, dn, pct: tot ? Math.round((dn / tot) * 100) : 0 };
  }, [done, assigns]);

  const isCl = (s) => s && s.includes("⚡");

  return (
    <div style={{ fontFamily: "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", background: "#f8f7f4", color: "#1a1a1a", minHeight: "100vh", padding: "24px 28px" }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Eddy</h1>
          <span style={{ fontSize: 12, color: "#999", fontWeight: 500, letterSpacing: 0.5 }}>Course Launch Tracker</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 6, background: "#e8e6e1", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${st.pct}%`, height: "100%", background: "linear-gradient(90deg,#6366f1,#16a34a)", borderRadius: 3, transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap", fontWeight: 500 }}>{st.dn}/{st.tot} · {st.pct}%</span>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#777" }}>
          <span>Course live <b style={{ color: "#16a34a" }}>Mar 23</b></span>
          <span>Marketing <b style={{ color: "#d97706" }}>Apr 6</b></span>
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
        <div style={{ overflowX: "auto" }}>
          <div style={{ fontSize: 10, color: "#bbb", marginBottom: 8 }}>
            Click bars to assign: <span style={{ color: "#4f46e5", fontWeight: 600 }}>Brian</span> → <span style={{ color: "#0d9488", fontWeight: 600 }}>Nico</span> → <span style={{ color: "#d97706", fontWeight: 600 }}>Both</span> → blank
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "200px repeat(7,1fr)", marginBottom: 4 }}>
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
          {WS.map((ws) => (
            <div key={ws.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "200px repeat(7,1fr)", marginBottom: 2 }}>
                <div style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, color: ws.color, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: ws.color, flexShrink: 0 }} />
                  {ws.name}
                </div>
                {W.map((w) => <div key={w.id} style={{ borderLeft: "1px solid #f0eee9" }} />)}
              </div>
              {ws.tasks.map((t) => {
                const d = done[t.id], op = openTask === t.id, asgn = assigns[t.id] || "";
                return (
                  <div key={t.id}>
                    <div
                      onClick={() => setOpenTask(op ? null : t.id)}
                      style={{
                        display: "grid", gridTemplateColumns: "200px repeat(7,1fr)",
                        cursor: "pointer", background: op ? "#fff" : "transparent",
                        borderRadius: op ? 6 : 0, opacity: d ? 0.45 : 1, transition: "all 0.12s",
                        boxShadow: op ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                      }}
                      onMouseEnter={(e) => { if (!op) e.currentTarget.style.background = "#faf9f6"; }}
                      onMouseLeave={(e) => { if (!op) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ padding: "5px 8px 5px 22px", fontSize: 12, color: d ? "#bbb" : "#444", display: "flex", alignItems: "center", gap: 7, overflow: "hidden" }}>
                        <CBox on={d} toggle={() => tog(t.id)} color={ws.color} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: d ? "line-through" : "none" }}>{t.name}</span>
                        <span style={{ fontSize: 10, color: "#bbb", flexShrink: 0, fontWeight: 500 }}>{t.hr}h</span>
                      </div>
                      {W.map((w) => {
                        const inR = w.id >= t.s && w.id <= t.e, isS = w.id === t.s, isE = w.id === t.e;
                        const barColor = asgn ? ASSIGN_COLORS[asgn] : ws.color;
                        return (
                          <div key={w.id} style={{ borderLeft: "1px solid #f0eee9", padding: "4px 3px", display: "flex", alignItems: "center" }}>
                            {inR && (
                              <div
                                onClick={(e) => cycleAssign(t.id, e)}
                                title="Click to change assignee"
                                style={{
                                  height: 22, width: "100%", cursor: "pointer",
                                  background: d ? "#e8e6e1" : `${barColor}18`,
                                  border: `1.5px solid ${d ? "#ccc" : barColor + "55"}`,
                                  borderRadius: isS && isE ? 5 : isS ? "5px 0 0 5px" : isE ? "0 5px 5px 0" : 0,
                                  borderRight: isE ? undefined : "none",
                                  borderLeft: isS ? undefined : "none",
                                  display: "flex", alignItems: "center", justifyContent: isS ? "flex-start" : "center",
                                  paddingLeft: isS ? 4 : 0, transition: "all 0.15s",
                                }}
                              >
                                {isS && asgn && <AssignBadge value={asgn} />}
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
                          <p style={{ fontSize: 12, color: "#666", lineHeight: 1.7, margin: "0 0 8px" }}>{t.notes}</p>
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
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
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
              <div style={{ padding: "0 8px", fontSize: 13, color: "#1a1a1a", textAlign: "right", fontWeight: 700 }}>~$939</div>
              <div style={{ padding: "0 8px", fontSize: 13, color: "#1a1a1a", textAlign: "right", fontWeight: 700 }}>~$3,403</div>
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
    </div>
  );
}
