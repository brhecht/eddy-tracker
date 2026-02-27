// Run with: node ~/Desktop/eddy/update-eddy.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'EddyTracker.jsx');
let code = fs.readFileSync(file, 'utf8');

// === 1. REPLACE WEEKS (shift to start Mar 2, 5 weeks instead of 7) ===
const oldWeeks = `const WEEKS = [
  { id: 1, l: "W1", d: "Feb 24\\u201328" },
  { id: 2, l: "W2", d: "Mar 2\\u20136" },
  { id: 3, l: "W3", d: "Mar 9\\u201313" },
  { id: 4, l: "W4", d: "Mar 16\\u201320" },
  { id: 5, l: "W5", d: "Mar 23\\u201327" },
  { id: 6, l: "W6", d: "Mar 30\\u2013Apr 3" },
  { id: 7, l: "W7", d: "Apr 6\\u201310" },
];`;

const newWeeks = `const WEEKS = [
  { id: 1, l: "W1", d: "Mar 2\\u20136" },
  { id: 2, l: "W2", d: "Mar 9\\u201313" },
  { id: 3, l: "W3", d: "Mar 16\\u201320" },
  { id: 4, l: "W4", d: "Mar 23\\u201327" },
  { id: 5, l: "W5", d: "Mar 30\\u2013Apr 3" },
];`;

// Try multiple dash encodings
let replaced = false;
for (const dash of ['\u2013', '–', '\\u2013']) {
  const tryOld = oldWeeks.replace(/\\u2013/g, dash);
  if (code.includes(tryOld)) {
    code = code.replace(tryOld, newWeeks.replace(/\\u2013/g, dash));
    replaced = true;
    console.log('✓ WEEKS replaced (dash type: ' + JSON.stringify(dash) + ')');
    break;
  }
}
if (!replaced) {
  // Regex fallback for WEEKS
  const weeksRegex = /const WEEKS\s*=\s*\[[\s\S]*?\];/;
  if (weeksRegex.test(code)) {
    code = code.replace(weeksRegex, `const WEEKS = [
  { id: 1, l: "W1", d: "Mar 2\u20136" },
  { id: 2, l: "W2", d: "Mar 9\u201313" },
  { id: 3, l: "W3", d: "Mar 16\u201320" },
  { id: 4, l: "W4", d: "Mar 23\u201327" },
  { id: 5, l: "W5", d: "Mar 30\u2013Apr 3" },
];`);
    console.log('✓ WEEKS replaced (regex fallback)');
  } else {
    console.log('✗ Could not find WEEKS array!');
  }
}

// === 2. REPLACE MILESTONES ===
// Current: week:5 Course Live, week:7 Full Mktg
// New: week:4 Buffer, week:5 Course Live
const msRegex = /const MILESTONES\s*=\s*\[[\s\S]*?\];/;
if (msRegex.test(code)) {
  code = code.replace(msRegex, `const MILESTONES = [
  { week: 4, label: "Buffer", color: "#8b5cf6" },
  { week: 5, label: "Course Live", color: "#16a34a" },
];`);
  console.log('✓ MILESTONES replaced');
} else {
  console.log('✗ Could not find MILESTONES!');
}

// === 3. REPLACE HEADER STATS (Brian/Nico hours + dates) ===
// Course live Mar 23 → Mar 30
code = code.replace(/Course live.*?Mar 23/g, 'Course live Mar 30');
code = code.replace(/Marketing.*?Apr 6/g, 'Marketing Apr 6');
// Brian: 63h → 48h, Nico: 74h → 50h
code = code.replace(/Brian:\s*63h/g, 'Brian: 48h');
code = code.replace(/Nico:\s*74h/g, 'Nico: 50h');
console.log('✓ Header stats updated');

// === 4. REPLACE DEFAULT_CATEGORIES (complete task overhaul) ===
const catRegex = /const DEFAULT_CATEGORIES\s*=\s*\[[\s\S]*?\n\];/;
if (catRegex.test(code)) {
  code = code.replace(catRegex, `const DEFAULT_CATEGORIES = [
  {
    id: "quiz", name: "Lead Magnet / Quiz", color: "#f59e0b", tasks: [
      { id: "q1", name: "Design quiz structure", s: 1, e: 1, hr: 2, as: "B", notes: "Define scoring logic, outcome buckets, and question flow. Claude can help structure." },
      { id: "q2", name: "Build quiz (Claude)", s: 1, e: 1, hr: 2, as: "B", notes: "Build with Claude on Vercel. Typeform if faster. Needs to capture email at end." },
      { id: "q3", name: "Write results pages", s: 1, e: 1, hr: 1, as: "B", notes: "One page per outcome. Clear CTA to waitlist/email signup." },
      { id: "q4", name: "Connect quiz → email", s: 3, e: 3, hr: 1, as: "B", notes: "Wire quiz completion to email platform. Can defer to Week 3 if using simple DB initially.", dep: "q2" },
    ],
  },
  {
    id: "land", name: "Landing Page", color: "#3b82f6", tasks: [
      { id: "l1", name: "Write waitlist page copy", s: 1, e: 1, hr: 2, as: "B", notes: "Waitlist framing — not selling course yet. Capture email, set expectations." },
      { id: "l2", name: "Build landing page V1", s: 1, e: 1, hr: 2, as: "B", notes: "Claude-built on Vercel or Carrd. Simple: headline, quiz CTA, email capture, thank you page." },
      { id: "l3", name: "Mobile QA", s: 1, e: 1, hr: 1, as: "Both", notes: "Test on iPhone + Android. Check quiz flow end to end.", dep: "l2" },
      { id: "l4", name: "Landing page V2 (data-informed)", s: 4, e: 4, hr: 2, as: "B", notes: "Rewrite based on 2-3 weeks of ad data. Which angles converted? Update copy accordingly.", dep: "l2" },
    ],
  },
  {
    id: "analytics", name: "Analytics / Tracking", color: "#0284c7", tasks: [
      { id: "t1", name: "Design UTM architecture", s: 1, e: 1, hr: 1, as: "B", notes: "UTM naming convention. Map every touchpoint: ad → landing → quiz → email → purchase." },
      { id: "t2", name: "Install Meta Pixel + CAPI", s: 1, e: 1, hr: 1, as: "N", notes: "Pixel on landing + quiz + course platform. Conversions API if possible. Claude helps w/ code.", dep: "t1" },
      { id: "t3", name: "Set up conversion events", s: 1, e: 1, hr: 1, as: "B", notes: "PageView, Lead, InitiateCheckout, Purchase. Custom: quiz start, email signup. Test w/ Pixel Helper.", dep: "t2" },
      { id: "t4", name: "Build analytics dashboard", s: 2, e: 2, hr: 2, as: "B", notes: "Ad spend, CPL, CPA, email CVR, revenue, ROAS. Sheets to start, Claude dashboard when volume justifies.", dep: "t3" },
    ],
  },
  {
    id: "creative", name: "Ad Creative", color: "#dc2626", tasks: [
      { id: "c1", name: "Define messaging angles", s: 1, e: 1, hr: 1, as: "B", notes: "3-4 angles: pain point, aspiration, social proof, curiosity. Test each." },
      { id: "c2", name: "Generate creative (adcreative.ai + Claude)", s: 1, e: 1, hr: 2, as: "B", notes: "Use adcreative.ai for static/carousel variants. Claude for copy iterations." },
      { id: "c3", name: "Record video ads", s: 2, e: 2, hr: 2, as: "B", notes: "Phone + NeueHouse. 30-60sec talking head. 2-3 variants per angle." },
      { id: "c4", name: "Weekly creative refresh", s: 4, e: 5, hr: 2, as: "Both", notes: "Refresh top performers. Kill fatigue. New angles from quiz/funnel data." },
    ],
  },
  {
    id: "camp", name: "Campaign Mgmt", color: "#b45309", tasks: [
      { id: "a1", name: "Define target audiences", s: 1, e: 1, hr: 1, as: "B", notes: "3-4 segments by founder stage/vertical/pain. Interest targeting first, then lookalikes from quiz data." },
      { id: "a2", name: "Set up Meta Business Suite", s: 1, e: 1, hr: 1, as: "Both", notes: "Business Manager, Ad Account, payment. Don't skip Business Verification." },
      { id: "a3", name: "Launch waitlist campaign", s: 2, e: 2, hr: 1, as: "B", notes: "Lead magnet — lower CPA, builds pixel + list. Start ABO. $30-50/day.", dep: "a1" },
      { id: "a4", name: "Weekly funnel review", s: 3, e: 5, hr: 2, as: "B", notes: "Where's drop-off worst? Ad→landing, landing→quiz, quiz→email, email→purchase. Fix biggest leak first." },
      { id: "a5", name: "Launch direct-sale ads", s: 5, e: 5, hr: 2, as: "B", notes: "Retarget quiz takers, page visitors, email openers. Lookalikes. Higher budget on proven creative.", dep: "a3" },
    ],
  },
  {
    id: "video", name: "Video Editing", color: "#16a34a", tasks: [
      { id: "v1", name: "Style guide + ref edit", s: 1, e: 1, hr: 3, as: "Both", notes: "Establish look/feel, transitions, lower thirds, intro/outro. Reference for all lessons." },
      { id: "v2", name: "Test AI editing tools", s: 1, e: 1, hr: 2, as: "N", notes: "Descript or similar. See if AI can speed up rough cuts." },
      { id: "v3", name: "Edit lessons 1–3", s: 1, e: 1, hr: 6, as: "N", notes: "Batch 1. Brian records off-hours, hands off to Nico. ~2h per lesson." },
      { id: "v4", name: "Edit lessons 4–6", s: 1, e: 1, hr: 6, as: "N", notes: "Batch 2. Same week as batch 1 if recording pace allows." },
      { id: "v5", name: "Edit lessons 7–9", s: 2, e: 2, hr: 6, as: "N", notes: "Batch 3. Nico should be in rhythm by now." },
      { id: "v6", name: "Edit lessons 10–12", s: 2, e: 2, hr: 6, as: "N", notes: "Batch 4. All recording done by end of Week 2." },
      { id: "v7", name: "Post-production polish", s: 3, e: 3, hr: 5, as: "N", notes: "Color grade, audio normalize, consistency pass across all 12 lessons." },
    ],
  },
  {
    id: "email", name: "Email / Nurture", color: "#dc2626", tasks: [
      { id: "e1", name: "Select email platform", s: 2, e: 2, hr: 1, as: "B", notes: "SendGrid free tier likely fine for volume. Only need transactional + simple drip." },
      { id: "e2", name: "Configure domain + setup", s: 2, e: 2, hr: 2, as: "B", notes: "DNS records, sender verification. Simple.", dep: "e1" },
      { id: "e3", name: "Write nurture sequence", s: 3, e: 3, hr: 3, as: "B", notes: "3-5 emails. Only build if funnel data warrants it. Claude can draft.", dep: "e2" },
      { id: "e4", name: "Build + test automations", s: 3, e: 3, hr: 2, as: "B", notes: "Quiz complete → welcome email → drip. Test end to end.", dep: "e3" },
    ],
  },
  {
    id: "host", name: "Course Hosting", color: "#6366f1", tasks: [
      { id: "h1", name: "Evaluate platforms", s: 2, e: 2, hr: 2, as: "B", notes: "Podia vs Teachable vs Stan Store. Factor in email, payments, simplicity." },
      { id: "h2", name: "Select & configure", s: 2, e: 2, hr: 2, as: "B", notes: "Set up account, branding, payment processing.", dep: "h1" },
      { id: "h3", name: "Upload test lessons", s: 3, e: 3, hr: 2, as: "Both", notes: "Upload 2-3 edited lessons. Test playback, drip settings, student experience.", dep: "h2" },
      { id: "h4", name: "Upload all final lessons", s: 5, e: 5, hr: 3, as: "B", notes: "All 12 lessons, descriptions, thumbnails, drip schedule. Final QA.", dep: "h3" },
    ],
  },
  {
    id: "buffer", name: "Buffer / Retakes", color: "#8b5cf6", tasks: [
      { id: "b1", name: "Retakes as needed", s: 4, e: 4, hr: 4, as: "B", notes: "Re-record any lessons that didn't land. Review with Nico first." },
      { id: "b2", name: "Re-edit retakes", s: 4, e: 4, hr: 4, as: "N", notes: "Edit any retakes. Same style guide.", dep: "b1" },
      { id: "b3", name: "Final QA + export", s: 4, e: 4, hr: 3, as: "N", notes: "Final pass on all 12 lessons. Export in correct format for hosting platform." },
    ],
  },
];`);
  console.log('✓ DEFAULT_CATEGORIES replaced (new 5-week plan)');
} else {
  console.log('✗ Could not find DEFAULT_CATEGORIES!');
}

// === 5. UPDATE TOOLS due dates ===
code = code.replace(/by: "Feb 26"/g, 'by: "Mar 6"');
code = code.replace(/by: "Mar 6"/g, 'by: "Mar 13"');
code = code.replace(/by: "Mar 11"/g, 'by: "Mar 20"');
code = code.replace(/by: "Mar 18"/g, 'by: "Mar 27"');
console.log('✓ Tool decision dates shifted');

// === WRITE ===
fs.writeFileSync(file, code, 'utf8');
console.log('\n✅ EddyTracker.jsx updated. Run: cd ~/Desktop/eddy && git add -A && git commit -m "5-week plan: funnel-first, compressed timeline" && git push');
