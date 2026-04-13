import { useState, useMemo } from "react";

const SC = {
  Evaluating: { bg: "#EEF2FC", text: "#2A5BD7", dot: "#2A5BD7" },
  Capture: { bg: "#FFF8ED", text: "#7A4A00", dot: "#B8860B" },
  "RFP Review": { bg: "#F0F9FF", text: "#0369A1", dot: "#0EA5E9" },
  Writing: { bg: "#F0FDF4", text: "#166534", dot: "#22C55E" },
  Submitted: { bg: "#FAF5FF", text: "#6B21A8", dot: "#A855F7" },
  Won: { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  "No-Bid": { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
};

const STAGES = ["Evaluating","Capture","RFP Review","Writing","Submitted","Won","No-Bid"];
const AGENCIES = ["GSA","DHS","HHS","DoD","VA","DoE","DoT","DoJ","State","Other"];
const SA = ["WOSB","SDVOSB","8(a)","HUBZone","SB","Full & Open"];
const NM = {
  "541430": "Graphic Design Services",
  "541511": "Custom Computer Programming",
  "541519": "Other Computer Related Services",
  "541611": "Management Consulting",
  "541810": "Advertising Agencies",
  "541715": "R&D in AI",
  "518210": "Data Processing & Hosting",
  "611430": "Professional Development Training",
};

const INITIAL_BIDS = [
  { id: 1, name: "GSA Design Services IDIQ", agency: "GSA", naics: "541430", setAside: "WOSB", value: 850000, pwin: 0.18, strategic: 1.3, difficulty: 0.9, status: "Capture", dueDate: "2026-06-15", notes: "Strong fit — design + brand services", evalDone: false, naicsSel: null, ggScore: 0, ggDone: false, shredDone: false },
  { id: 2, name: "DHS UX Research Support", agency: "DHS", naics: "541511", setAside: "SB", value: 1200000, pwin: 0.12, strategic: 1.2, difficulty: 1.1, status: "RFP Review", dueDate: "2026-05-01", notes: "Incumbent unknown — research needed", evalDone: false, naicsSel: null, ggScore: 0, ggDone: false, shredDone: false },
  { id: 3, name: "HHS Communication Design", agency: "HHS", naics: "541430", setAside: "WOSB", value: 620000, pwin: 0.22, strategic: 1.0, difficulty: 0.8, status: "Writing", dueDate: "2026-04-20", notes: "Health communication — strong past perf", evalDone: true, naicsSel: "541430", ggScore: 15, ggDone: true, shredDone: false },
  { id: 4, name: "DoD Training Materials", agency: "DoD", naics: "611430", setAside: "Full & Open", value: 3200000, pwin: 0.08, strategic: 1.5, difficulty: 1.4, status: "Evaluating", dueDate: "2026-07-30", notes: "Large — teaming required", evalDone: false, naicsSel: null, ggScore: 0, ggDone: false, shredDone: false },
  { id: 5, name: "VA Brand Identity", agency: "VA", naics: "541430", setAside: "SDVOSB", value: 480000, pwin: 0.15, strategic: 1.1, difficulty: 0.85, status: "No-Bid", dueDate: "2026-04-10", notes: "Set-aside mismatch", evalDone: true, naicsSel: "541430", ggScore: 8, ggDone: true, shredDone: false },
];

const evc = (b) => b.pwin * b.value * 0.15;
const rc = (b) => evc(b) * b.strategic / b.difficulty;
const fmt = (n) => n >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : "$" + (n / 1e3).toFixed(0) + "K";
const fR = (n) => n >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : "$" + (n / 1e3).toFixed(1) + "K";

function oppProgress(b) {
  let done = 0;
  if (b.evalDone) done++;
  if (b.naicsSel) done++;
  if (b.ggDone) done++;
  if (b.shredDone) done++;
  return Math.round((done / 4) * 100);
}

function PwinDial({ pwin }) {
  const pct = pwin * 100, r = 16, c = 2 * Math.PI * r, d = (pct / 100) * c;
  const col = pwin >= 0.2 ? "#22C55E" : pwin >= 0.12 ? "#B8860B" : "#EF4444";
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r={r} fill="none" stroke="#E2E0D8" strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={col} strokeWidth="4"
        strokeDasharray={`${d} ${c}`} strokeLinecap="round" transform="rotate(-90 20 20)" />
      <text x="20" y="24" textAnchor="middle"
        style={{ fontSize: 9, fontWeight: 600, fill: col, fontFamily: "monospace" }}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

const NL = [
  { code: "541430", title: "Graphic Design Services", sector: "Professional Services", wosb: true, sa: ["WOSB","8(a)","SB"], typ: "Brand identity, marketing design, publications", ew: { Technical: 45, PastPerf: 25, Price: 30 }, agencies: ["GSA","HHS","DoD","USDA"], tip: "WOSB set-aside highly active. Your 26-year track record and Figma expertise are strong differentiators." },
  { code: "541511", title: "Custom Computer Programming", sector: "IT & Technology", wosb: true, sa: ["WOSB","8(a)","SB"], typ: "Software, app development, AI tools", ew: { Technical: 40, PastPerf: 30, Price: 30 }, agencies: ["DHS","DoD","VA","GSA"], tip: "Your AI Leadership MBA gives you a credible technical narrative." },
  { code: "541519", title: "Other Computer Related Services", sector: "IT & Technology", wosb: true, sa: ["WOSB","8(a)","SB","HUBZone"], typ: "IT consulting, UX research, digital transformation", ew: { Technical: 35, PastPerf: 35, Price: 30 }, agencies: ["DHS","GSA","VA","HHS"], tip: "Past performance weight 35%. Your 94th percentile SUS score and $1M+ cost avoidance move evaluators." },
  { code: "541611", title: "Management Consulting", sector: "Professional Services", wosb: true, sa: ["WOSB","8(a)","SB","SDVOSB"], typ: "Strategy, process improvement, org design", ew: { Technical: 40, PastPerf: 35, Price: 25 }, agencies: ["GSA","HHS","DoD","OPM"], tip: "Price weight only 25%. Your Benchline Framework and DIIS methodology are genuine discriminators." },
  { code: "541810", title: "Advertising Agencies", sector: "Marketing & Comms", wosb: true, sa: ["WOSB","SB"], typ: "Campaign strategy, digital marketing, social media", ew: { Technical: 40, PastPerf: 30, Price: 30 }, agencies: ["DoD","VA","HHS","USDA"], tip: "Federal advertising skews toward health communications. Your full-scope marketing experience maps well." },
  { code: "541715", title: "R&D in AI", sector: "R&D & AI", wosb: true, sa: ["WOSB","8(a)","SB"], typ: "AI development, ML research, model training", ew: { Technical: 50, PastPerf: 30, Price: 20 }, agencies: ["DARPA","DoD","NIH","DoE"], tip: "Technical weight 50%. DIIS and TDS Research Analysis Suite are legitimate portfolio artifacts." },
  { code: "611430", title: "Professional Development Training", sector: "Education & Training", wosb: true, sa: ["WOSB","8(a)","SB"], typ: "Leadership training, instructional design, e-learning", ew: { Technical: 40, PastPerf: 30, Price: 30 }, agencies: ["OPM","DoD","VA","HHS"], tip: "Your SME Instructor experience at UofA and Toastmasters background are directly relevant past performance." },
];

const GGC = [
  { id: "pp", lbl: "Past Performance", d: "Documented experience directly mirroring the scope.", low: "Little to no relevant past performance.", mid: "Some relevant experience — not a direct mirror.", high: "Strong, documented past performance mapping directly to this solicitation." },
  { id: "cc", lbl: "Core Competencies", d: "Primary services meet 80%+ of technical requirements.", low: "Significant gaps in core requirements.", mid: "Meet most — some stretching required.", high: "Meet 80%+ with documented, deployable capability." },
  { id: "wc", lbl: "Workforce & Capacity", d: "People, tools, bandwidth to deliver without overextending.", low: "Capacity committed or workforce gaps exist.", mid: "Manageable with some workload adjustments.", high: "Clear bandwidth and right team to deliver." },
  { id: "cr", lbl: "Compliance & Reporting", d: "Infrastructure meets administrative and regulatory requirements.", low: "Significant compliance gaps.", mid: "Most requirements met — some gaps.", high: "Current systems meet all requirements." },
  { id: "pg", lbl: "Partnerships & Gaps", d: "Credible teaming partners identified for any gaps.", low: "Gaps with no identified teaming solution.", mid: "Teaming conversations started — not confirmed.", high: "All gaps covered by confirmed partners." },
  { id: "fr", lbl: "Financial Readiness", d: "Can sustain operations through the payment cycle.", low: "Payment cycle creates significant cash flow risk.", mid: "Manageable with careful monitoring.", high: "Fully able to sustain through the payment cycle." },
];
const SL = { 1: "Low", 2: "Partial", 3: "Strong" };
const SC2 = { 1: "#EF4444", 2: "#B8860B", 3: "#22C55E" };

const EF = [
  { id: "scope", name: "Scope of Work Clarity", hint: "Review the full SOW/PWS. Every deliverable and acceptance criterion must be clearly defined.", risk: "Unclear scope is the #1 cause of disqualification.", sev: "high", tip: "Look for specific deliverable formats. Vague language creates scope creep risk.", checklist: ["All deliverables clearly named","Acceptance criteria specified","Performance standards are measurable","Period of performance stated","Place of performance confirmed"] },
  { id: "naics", name: "NAICS Code Alignment", hint: "Confirm the primary NAICS matches your core capability and size standard.", risk: "NAICS mismatch can disqualify before technical review.", sev: "high", tip: "Confirm size standard. WOSB certification must be active in SAM.gov.", checklist: ["Primary NAICS matches capability","SAM.gov profile lists this code","Size standard confirmed","Set-aside certification active","No mismatch risk identified"] },
  { id: "setaside", name: "Set-Aside Designation", hint: "Match certifications to the set-aside. Each designation has different requirements.", risk: "Bidding outside your certification is immediate disqualification.", sev: "high", tip: "WOSB is active in this code. Confirm certification is current.", checklist: ["Set-aside type confirmed","WOSB certification active","SAM.gov registration current","Documentation ready","No certification conflicts"] },
  { id: "deliverables", name: "Deliverables & Timeline", hint: "Map every deliverable to a delivery date. Federal timelines are compressed.", risk: "Unrealistic timelines damage past performance ratings.", sev: "medium", tip: "Confirm revision rounds and approval turnaround are in the timeline.", checklist: ["All due dates mapped","Timeline realistic","Review cycles accounted for","Option periods understood","Key personnel available"] },
  { id: "compliance", name: "Compliance & Reporting", hint: "Review Sections H, I, J. FAR clauses and reporting requirements must all be assessed.", risk: "Non-compliance with reporting is a contract termination risk.", sev: "high", tip: "Rights in data (FAR 52.227-14) — confirm IP ownership strategy.", checklist: ["FAR/DFARS clauses reviewed","Cybersecurity requirements assessed","Reporting frequency confirmed","Section 508 requirements noted","OCI provisions identified"] },
  { id: "budget", name: "Budget Ceiling & CLINs", hint: "Identify every CLIN and option period. Calculate true margin after bid costs.", risk: "Underpriced CLINs and early option execution are the most common post-award losses.", sev: "medium", tip: "Confirm ceiling per task order, not just contract ceiling.", checklist: ["All CLINs identified","Option period risk assessed","Budget ceiling sufficient","Indirect rates accounted for","Cost realism completed"] },
];

export default function GovConReady() {
  const [curTab, setCurTab] = useState("overview");
  const [bids, setBids] = useState(INITIAL_BIDS);
  const [activeOppId, setActiveOppId] = useState(1);
  const [sortBy, setSortBy] = useState("roi");
  const [filterStage, setFilterStage] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [threevDone, setThreevDone] = useState({});
  const [evalState, setEvalStateAll] = useState({});
  const [ggState, setGGStateAll] = useState({});
  const [naicsOpen, setNaicsOpen] = useState(null);
  const [naicsQuery, setNaicsQuery] = useState("");
  const [naicsSector, setNaicsSector] = useState("All");
  const [shredRows, setShredRowsAll] = useState({});
  const [shredAiTxt, setShredAiTxt] = useState("");
  const [shredAiLoad, setShredAiLoad] = useState(false);
  const [toast, setToast] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportOppId, setReportOppId] = useState(1);
  const [reportSecs, setReportSecs] = useState({ summary: true, eval: true, gonogo: true, shred: true, naics: true, math: true });
  const [newBidForm, setNewBidForm] = useState({ name: "", agency: "GSA", naics: "541430", setAside: "WOSB", value: 500000, pwin: 0.15, strategic: 1.0, difficulty: 1.0, status: "Evaluating", dueDate: "", notes: "" });

  const activeOpp = bids.find((b) => b.id === activeOppId) || bids[0];
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const getEvalState = (id) => evalState[id] || { checked: {}, notes: {}, itemChecks: {}, open: null };
  const setEvalState = (id, s) => setEvalStateAll((p) => ({ ...p, [id]: s }));
  const getGGState = (id) => ggState[id] || { scores: {}, gut: false, aiTxt: "", aiLoad: false };
  const setGGState = (id, s) => setGGStateAll((p) => ({ ...p, [id]: s }));
  const getShredRows = (id) => shredRows[id] || [
    { id: 1, section: "Section L", req: "Cover letter 2 pages max", type: "Format", done: false },
    { id: 2, section: "Section C", req: "Design deliverables meet SOW specifications", type: "Technical", done: false },
    { id: 3, section: "Section B", req: "All CLINs priced separately", type: "Pricing", done: false },
    { id: 4, section: "Section L", req: "Past performance references — 3 required", type: "Format", done: false },
    { id: 5, section: "Section H", req: "Rights in data clause acknowledged", type: "Compliance", done: false },
  ];
  const setShredRows = (id, rows) => setShredRowsAll((p) => ({ ...p, [id]: rows }));

  const mxROI = useMemo(() => Math.max(...bids.map(rc), 1), [bids]);
  const mxV = useMemo(() => Math.max(...["Evaluating","Capture","RFP Review","Writing","Submitted"].map((s) => bids.filter((b) => b.status === s).reduce((a, b) => a + b.value, 0)), 1), [bids]);

  const tabs = [
    { id: "overview", label: "⬡ Overview" },
    { id: "eval", label: "① Contract Eval" },
    { id: "naics", label: "② NAICS" },
    { id: "gonogo", label: "③ Go / No-Go" },
    { id: "pipeline", label: "④ Pipeline" },
    { id: "shred", label: "⑤ RFP Shred" },
  ];

  const nb = (active) => ({
    fontFamily: "monospace", fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase",
    background: "#1C1B18", border: "none", borderBottom: active ? "2px solid #2A5BD7" : "2px solid transparent",
    padding: "10px 13px", cursor: "pointer", color: active ? "#fff" : "rgba(255,255,255,0.5)", whiteSpace: "nowrap",
  });

  const card = { background: "#fff", border: "1px solid #E2E0D8", borderRadius: 10, padding: "14px 16px", marginBottom: 10 };
  const inp = { width: "100%", border: "1px solid #C8C5BA", borderRadius: 5, padding: "7px 10px", fontSize: 12, fontFamily: "sans-serif", color: "#1C1B18", background: "#fff" };
  const btnP = { background: "#2A5BD7", color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", cursor: "pointer", fontSize: 12, fontWeight: 500, width: "100%", marginTop: 10 };
  const btnG = { background: "#22C55E", color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", cursor: "pointer", fontSize: 12, fontWeight: 500, marginTop: 10 };
  const btnS = { background: "#fff", border: "1px solid #C8C5BA", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", color: "#5A5850", marginTop: 8 };
  const lbl = { fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", display: "block", marginBottom: 3 };

  const renderOverview = () => {
    const act = bids.filter((b) => b.status !== "No-Bid" && b.status !== "Won");
    const tP = act.reduce((a, b) => a + b.value, 0);
    const tE = act.reduce((a, b) => a + evc(b), 0);
    const won = bids.filter((b) => b.status === "Won");
    const overdue = bids.filter((b) => b.dueDate && new Date(b.dueDate) < new Date() && b.status !== "Won" && b.status !== "No-Bid");
    const prog = oppProgress(activeOpp);
    const progCol = prog === 100 ? "#22C55E" : prog >= 50 ? "#B8860B" : "#EF4444";
    const steps = [
      { lbl: "Contract Eval", done: activeOpp.evalDone, tab: "eval" },
      { lbl: "NAICS", done: !!activeOpp.naicsSel, tab: "naics" },
      { lbl: "Go / No-Go", done: activeOpp.ggDone, tab: "gonogo" },
      { lbl: "RFP Shred", done: activeOpp.shredDone, tab: "shred" },
    ];
    const nextStep = steps.find((s) => !s.done);
    return (
      <div>
        {overdue.length > 0 && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 13, color: "#991B1B", marginBottom: 2 }}>{overdue.length} overdue — action required</div>
              <div style={{ fontSize: 12, color: "#5A5850" }}>{overdue.map((b) => b.name.split(" ").slice(0, 3).join(" ")).join(" · ")}</div>
            </div>
            <button onClick={() => setCurTab("pipeline")} style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 5, padding: "6px 12px", cursor: "pointer", fontSize: 11 }}>Review</button>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
          {[["Active pipeline", fmt(tP), `${act.length} opportunities`, "#1C1B18"], ["Total E[V]", fR(tE), "@ 15% margin", "#2A5BD7"], ["Won", won.length, won.length > 0 ? fmt(won.reduce((a, b) => a + b.value, 0)) : "Keep bidding", "#22C55E"], ["Overdue", overdue.length, overdue.length > 0 ? "Action required" : "All clear", overdue.length > 0 ? "#EF4444" : "#22C55E"]].map(([l, v, s, c]) => (
            <div key={l} style={card}>
              <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 5 }}>{l}</div>
              <div style={{ fontFamily: "serif", fontSize: "1.4rem", fontWeight: 600, lineHeight: 1, color: c }}>{v}</div>
              <div style={{ fontSize: 11, color: "#8C8A82", marginTop: 3 }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 12 }}>Active opportunity progress</div>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15, color: "#1C1B18", marginBottom: 4 }}>{activeOpp.name}</div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#8C8A82" }}>{activeOpp.agency} · NAICS {activeOpp.naics} · {activeOpp.setAside}</div>
            </div>
            <div style={{ fontFamily: "serif", fontSize: "1.1rem", fontWeight: 600, color: progCol }}>{prog}%</div>
          </div>
          <div style={{ height: 7, background: "#E2E0D8", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ width: `${prog}%`, height: "100%", background: progCol, borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {steps.map((step) => (
              <div key={step.tab} onClick={() => setCurTab(step.tab)} style={{ display: "flex", alignItems: "center", gap: 5, background: step.done ? "#F0FDF4" : "#F4F3EF", border: `1px solid ${step.done ? "#BBF7D0" : "#E2E0D8"}`, borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>
                <span style={{ fontSize: 11 }}>{step.done ? "✓" : "○"}</span>
                <span style={{ fontFamily: "monospace", fontSize: 10, color: step.done ? "#166534" : "#5A5850", textTransform: "uppercase" }}>{step.lbl}</span>
              </div>
            ))}
          </div>
          {nextStep ? (
            <button style={btnP} onClick={() => setCurTab(nextStep.tab)}>Continue — {nextStep.lbl} →</button>
          ) : (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 7, padding: "10px 12px", marginTop: 10, fontSize: 13, color: "#166534" }}>✓ All workflow steps complete</div>
          )}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 12, marginTop: 6 }}>Pipeline snapshot</div>
        <div style={card}>
          {["Evaluating","Capture","RFP Review","Writing","Submitted"].map((stage) => {
            const sb = bids.filter((b) => b.status === stage);
            const tot = sb.reduce((a, b) => a + b.value, 0);
            const pct = (tot / mxV) * 100;
            const sc = SC[stage];
            return (
              <div key={stage} style={{ display: "grid", gridTemplateColumns: "90px 1fr 66px", alignItems: "center", gap: 10, marginBottom: 7 }}>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#5A5850", textAlign: "right" }}>{stage}</div>
                <div style={{ background: "#EEECEA", borderRadius: 4, height: 16, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: sc.dot, borderRadius: 4 }} />
                </div>
                <div style={{ fontFamily: "serif", fontSize: 12, fontWeight: 600, color: "#1C1B18" }}>{tot > 0 ? fmt(tot) : "—"}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPipeline = () => {
    const act = bids.filter((b) => b.status !== "No-Bid" && b.status !== "Won");
    const tP = act.reduce((a, b) => a + b.value, 0);
    const tE = act.reduce((a, b) => a + evc(b), 0);
    const top = [...bids].sort((a, b) => rc(b) - rc(a))[0];
    const won = bids.filter((b) => b.status === "Won");
    const cnt = { All: bids.length };
    STAGES.forEach((st) => (cnt[st] = bids.filter((b) => b.status === st).length));
    let list = filterStage === "All" ? [...bids] : bids.filter((b) => b.status === filterStage);
    list.sort((a, b) => {
      if (sortBy === "roi") return rc(b) - rc(a);
      if (sortBy === "ev") return evc(b) - evc(a);
      if (sortBy === "value") return b.value - a.value;
      if (sortBy === "pwin") return b.pwin - a.pwin;
      if (sortBy === "due") return (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : 1;
      return 0;
    });
    return (
      <div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center", ...card, marginBottom: 14 }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82" }}>Sort:</span>
          {[["roi","ROI"],["ev","E[V]"],["value","Value"],["pwin","Pwin"],["due","Due"]].map(([k,l]) => (
            <button key={k} onClick={() => setSortBy(k)} style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", border: `1px solid ${sortBy === k ? "#2A5BD7" : "#C8C5BA"}`, background: sortBy === k ? "#EEF2FC" : "#fff", color: sortBy === k ? "#2A5BD7" : "#5A5850", borderRadius: 5, padding: "4px 9px", cursor: "pointer" }}>{l}</button>
          ))}
          <div style={{ width: 1, height: 16, background: "#E2E0D8", margin: "0 3px" }} />
          <span style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82" }}>Filter:</span>
          {["All",...STAGES].map((st) => {
            const n = cnt[st] || 0;
            if (st !== "All" && n === 0) return null;
            return <button key={st} onClick={() => setFilterStage(st)} style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", border: `1px solid ${filterStage === st ? "#2A5BD7" : "#C8C5BA"}`, background: filterStage === st ? "#EEF2FC" : "#fff", color: filterStage === st ? "#2A5BD7" : "#5A5850", borderRadius: 5, padding: "4px 9px", cursor: "pointer" }}>{st} <span style={{ fontSize: 9, opacity: 0.6 }}>{n}</span></button>;
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
          {[["Active pipeline", fmt(tP), `${act.length} opportunities`, "#1C1B18"], ["Total E[V]", fR(tE), "@ 15% margin", "#2A5BD7"], ["Top ROI", top ? top.name.split(" ").slice(0,3).join(" ") : "—", top ? fR(rc(top)) : "", "#22C55E"], ["Won", won.length, won.length > 0 ? fmt(won.reduce((a, b) => a + b.value, 0)) : "Keep bidding", "#B8860B"]].map(([l, v, s, c]) => (
            <div key={l} style={card}>
              <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 5 }}>{l}</div>
              <div style={{ fontFamily: "serif", fontSize: "1.3rem", fontWeight: 600, lineHeight: 1, color: c }}>{v}</div>
              <div style={{ fontSize: 11, color: "#8C8A82", marginTop: 3 }}>{s}</div>
            </div>
          ))}
        </div>
        {showAdd && (
          <div style={{ background: "#fff", border: "1.5px dashed #2A5BD7", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", color: "#2A5BD7", fontWeight: 500 }}>New opportunity — three v's check first</div>
              <button onClick={() => { setShowAdd(false); setThreevDone({}); }} style={{ background: "#F4F3EF", border: "1px solid #C8C5BA", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 14, color: "#5A5850" }}>✕</button>
            </div>
            <div style={{ background: "#EEF2FC", border: "1px solid #C7D7F8", borderRadius: 8, padding: "11px 13px", marginBottom: 11 }}>
              {[["v1","Valid","Real, funded opportunity?"],["v2","Viable","Meet 80%+ of requirements?"],["v3","Value","E[V] justifies bid cost?"]].map(([id,lbl2,desc]) => (
                <div key={id} style={{ display: "flex", gap: 9, marginBottom: 6, alignItems: "flex-start" }}>
                  <input type="checkbox" checked={!!threevDone[id]} onChange={(e) => setThreevDone((p) => ({ ...p, [id]: e.target.checked }))} style={{ marginTop: 2 }} />
                  <div><div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18" }}>{lbl2}</div><div style={{ fontSize: 12, color: "#5A5850" }}>{desc}</div></div>
                </div>
              ))}
            </div>
            <div style={{ opacity: Object.values(threevDone).filter(Boolean).length === 3 ? 1 : 0.35, pointerEvents: Object.values(threevDone).filter(Boolean).length === 3 ? "auto" : "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: 9, marginBottom: 9 }}>
                {[["name","text","Opportunity Name *"],["agency","select","Agency"],["naics","text","NAICS"],["setAside","select","Set-Aside"],["value","number","Contract Value ($)"],["pwin","number","Pwin (0.01-0.30)"],["status","select","Status"],["dueDate","date","Due Date"]].map(([fid,type,label]) => (
                  <div key={fid}>
                    <label style={lbl}>{label}</label>
                    {type === "select" ? (
                      <select value={newBidForm[fid]} onChange={(e) => setNewBidForm((p) => ({ ...p, [fid]: e.target.value }))} style={inp}>
                        {(fid === "agency" ? AGENCIES : fid === "setAside" ? SA : STAGES).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={newBidForm[fid]} onChange={(e) => setNewBidForm((p) => ({ ...p, [fid]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))} style={inp} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
                <button onClick={() => {
                  if (!newBidForm.name.trim()) { alert("Please add a name."); return; }
                  const nb2 = { ...newBidForm, id: Date.now(), evalDone: false, naicsSel: null, ggScore: 0, ggDone: false, shredDone: false };
                  setBids((p) => [...p, nb2]); setActiveOppId(nb2.id); setShowAdd(false); setThreevDone({});
                  setNewBidForm({ name: "", agency: "GSA", naics: "541430", setAside: "WOSB", value: 500000, pwin: 0.15, strategic: 1.0, difficulty: 1.0, status: "Evaluating", dueDate: "", notes: "" });
                  showToast("Opportunity added");
                }} style={{ background: "#2A5BD7", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>Add to Pipeline</button>
                <button onClick={() => { setShowAdd(false); setThreevDone({}); }} style={{ background: "#fff", border: "1px solid #C8C5BA", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 12, color: "#5A5850" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 12 }}>Opportunities · {list.length} shown</div>
        {list.map((b) => {
          const sc = SC[b.status] || SC.Evaluating;
          const od = b.dueDate && new Date(b.dueDate) < new Date() && b.status !== "Won" && b.status !== "No-Bid";
          const isExp = expandedId === b.id;
          const isActive = b.id === activeOppId;
          const prog = oppProgress(b);
          return (
            <div key={b.id} style={{ background: "#fff", border: `1px solid ${isActive ? "#2A5BD7" : "#E2E0D8"}`, borderLeft: od ? "3px solid #EF4444" : undefined, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
              <div onClick={() => setExpandedId(isExp ? null : b.id)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 15px", cursor: "pointer", flexWrap: "wrap" }}>
                <PwinDial pwin={b.pwin} />
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18", marginBottom: 2 }}>
                    {b.name}
                    {isActive && <span style={{ fontFamily: "monospace", fontSize: 9, background: "#EEF2FC", color: "#2A5BD7", padding: "2px 6px", borderRadius: 3, textTransform: "uppercase", marginLeft: 6 }}>Active</span>}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#8C8A82" }}>{b.agency} · NAICS {b.naics} · {b.setAside}</div>
                  {od && <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 500, color: "#991B1B", marginTop: 4 }}>⚠ Past due</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                    <div style={{ flex: 1, height: 3, background: "#E2E0D8", borderRadius: 2, overflow: "hidden", maxWidth: 80 }}>
                      <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? "#22C55E" : prog >= 50 ? "#B8860B" : "#E2E0D8", borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: 9, color: "#8C8A82" }}>{prog}% ready</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                  <div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 2 }}>Value</div><div style={{ fontFamily: "serif", fontSize: 13, fontWeight: 600 }}>{fmt(b.value)}</div></div>
                  <div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 2 }}>E[V]</div><div style={{ fontFamily: "serif", fontSize: 13, fontWeight: 600, color: "#2A5BD7" }}>{fR(evc(b))}</div></div>
                  <div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 2 }}>ROI</div><div style={{ fontFamily: "serif", fontSize: 13, fontWeight: 600, color: "#22C55E" }}>{fR(rc(b))}</div></div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: sc.bg, color: sc.text }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />{b.status}
                  </span>
                  {b.dueDate && <div style={{ fontFamily: "monospace", fontSize: 10, color: od ? "#EF4444" : "#8C8A82", marginTop: 3 }}>{new Date(b.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>}
                </div>
                <span style={{ fontSize: 10, color: "#8C8A82", transform: isExp ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
              </div>
              {isExp && (
                <div style={{ borderTop: "1px solid #E2E0D8", padding: "13px 15px", background: "#FAFAF8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11, flexWrap: "wrap", gap: 8 }}>
                    <button onClick={() => { setActiveOppId(b.id); showToast("Active opportunity set"); }} style={{ background: isActive ? "#F0FDF4" : "#EEF2FC", color: isActive ? "#166534" : "#2A5BD7", border: `1px solid ${isActive ? "#BBF7D0" : "#C7D7F8"}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>{isActive ? "✓ Active" : "Set as active"}</button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { if (confirm("Remove this opportunity?")) { setBids((p) => p.filter((x) => x.id !== b.id)); setExpandedId(null); showToast("Removed"); } }} style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#991B1B" }}>Remove</button>
                      <button onClick={() => setExpandedId(null)} style={{ background: "#fff", border: "1px solid #C8C5BA", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#5A5850" }}>Close</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#5A5850", lineHeight: 1.6 }}><strong>Notes:</strong> {b.notes || "—"}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderNAICS = () => {
    const sectors = [...new Set(NL.map((n) => n.sector))];
    const list = NL.filter((n) => {
      const q = naicsQuery.toLowerCase();
      const mq = !q || n.code.includes(q) || n.title.toLowerCase().includes(q) || n.typ.toLowerCase().includes(q);
      const ms = naicsSector === "All" || (naicsSector === "WOSB" ? n.wosb : n.sector === naicsSector);
      return mq && ms;
    });
    return (
      <div>
        {activeOpp.naicsSel && (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#166534", marginBottom: 3 }}>Confirmed NAICS</div><div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18" }}>{activeOpp.naicsSel} — {NM[activeOpp.naicsSel]}</div></div>
            <button style={btnG} onClick={() => setCurTab("gonogo")}>Continue to Go/No-Go →</button>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 11, alignItems: "center" }}>
          <input value={naicsQuery} onChange={(e) => setNaicsQuery(e.target.value)} placeholder="Search code, title, keyword..." style={{ flex: 1, border: "1px solid #C8C5BA", borderRadius: 7, padding: "9px 13px", fontSize: 13, color: "#1C1B18", background: "#fff" }} />
          {naicsQuery && <button onClick={() => setNaicsQuery("")} style={{ background: "#fff", border: "1px solid #C8C5BA", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontSize: 12, color: "#5A5850" }}>Clear</button>}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 13 }}>
          {["All",...sectors,"WOSB eligible"].map((sec) => (
            <button key={sec} onClick={() => setNaicsSector(sec === "WOSB eligible" ? "WOSB" : sec)} style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", border: `1px solid ${(naicsSector === "WOSB" && sec === "WOSB eligible") || naicsSector === sec ? "#2A5BD7" : "#C8C5BA"}`, background: (naicsSector === "WOSB" && sec === "WOSB eligible") || naicsSector === sec ? "#EEF2FC" : "#fff", color: (naicsSector === "WOSB" && sec === "WOSB eligible") || naicsSector === sec ? "#2A5BD7" : "#5A5850", borderRadius: 5, padding: "5px 10px", cursor: "pointer" }}>{sec}</button>
          ))}
        </div>
        {list.map((n) => {
          const isOpen = naicsOpen === n.code;
          const isSel = activeOpp.naicsSel === n.code;
          return (
            <div key={n.code} onClick={() => setNaicsOpen(isOpen ? null : n.code)} style={{ background: "#fff", border: isSel ? "1.5px solid #2A5BD7" : "1px solid #E2E0D8", borderRadius: 10, marginBottom: 8, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", flexWrap: "wrap" }}>
                <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500, color: "#2A5BD7", background: "#EEF2FC", borderRadius: 6, padding: "5px 10px", flexShrink: 0, minWidth: 60, textAlign: "center" }}>{n.code}</div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18", marginBottom: 2 }}>{n.title}</div><div style={{ fontSize: 12, color: "#8C8A82" }}>{n.typ}</div></div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  {n.wosb ? <span style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 10, padding: "2px 8px", borderRadius: 20 }}>WOSB</span> : <span style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 10, padding: "2px 8px", borderRadius: 20 }}>No WOSB</span>}
                  {isSel && <span style={{ background: "#1C1B18", color: "#fff", fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>Selected</span>}
                  <span style={{ fontSize: 10, color: "#8C8A82", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
                </div>
              </div>
              {isOpen && (
                <div onClick={(e) => e.stopPropagation()} style={{ borderTop: "1px solid #E2E0D8", padding: "13px 15px", background: "#FAFAF8" }}>
                  <div style={{ background: "#FFF8ED", border: "1px solid #FDE68A", borderRadius: 7, padding: "10px 12px", marginBottom: 11 }}>
                    <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#B8860B", marginBottom: 4 }}>Strategy tip for Eternal Graphx / TDS</div>
                    <div style={{ fontSize: 12, color: "#5A5850", lineHeight: 1.6 }}>{n.tip}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 11, marginBottom: 11 }}>
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 6 }}>Eval weights</div>
                      {Object.entries(n.ew).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, fontSize: 12 }}>
                          <span style={{ width: 65, color: "#5A5850", flexShrink: 0 }}>{k}</span>
                          <div style={{ flex: 1, height: 5, background: "#E2E0D8", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${v}%`, height: "100%", background: k === "Technical" ? "#2A5BD7" : k === "PastPerf" ? "#22C55E" : "#B8860B", borderRadius: 3 }} /></div>
                          <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 500, width: 26, textAlign: "right" }}>{v}%</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 6 }}>Set-asides</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 9 }}>{n.sa.map((sa) => <span key={sa} style={{ background: "#F4F3EF", border: "1px solid #E2E0D8", fontSize: 11, padding: "3px 7px", borderRadius: 4 }}>{sa}</span>)}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 5 }}>Agency buyers</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{n.agencies.map((a) => <span key={a} style={{ background: "#F4F3EF", border: "1px solid #E2E0D8", fontSize: 11, padding: "3px 7px", borderRadius: 4 }}>{a}</span>)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setBids((p) => p.map((b) => b.id === activeOppId ? { ...b, naicsSel: isSel ? null : n.code } : b)); showToast(isSel ? "NAICS deselected" : `NAICS ${n.code} selected`); }} style={{ background: isSel ? "#1C1B18" : "#2A5BD7", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{isSel ? "✓ Selected — deselect" : "Select for this opportunity"}</button>
                    {isSel && <button onClick={() => setCurTab("gonogo")} style={{ background: "#22C55E", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 12 }}>Continue to Go/No-Go →</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderGoNoGo = () => {
    const gs = getGGState(activeOppId);
    const tot = Object.values(gs.scores).reduce((a, b) => a + b, 0);
    const full = Object.keys(gs.scores).length === GGC.length;
    const res = tot >= 15 ? "go" : tot >= 10 ? "closer" : full ? "nogo" : null;
    const pct = Math.round((tot / 18) * 100);
    const pc = pct >= 83 ? "#22C55E" : pct >= 55 ? "#B8860B" : "#EF4444";
    return (
      <div>
        <div style={{ background: "#EEF2FC", border: "1px solid #C7D7F8", borderRadius: 8, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#2A5BD7", marginBottom: 3 }}>Scoring</div><div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18" }}>{activeOpp.name}</div></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontFamily: "serif", fontSize: "1.2rem", fontWeight: 600, color: pc }}>{tot}/18</div>
            {Object.keys(gs.scores).length > 0 && <button onClick={() => setGGState(activeOppId, { scores: {}, gut: false, aiTxt: "", aiLoad: false })} style={{ background: "transparent", border: "none", fontFamily: "monospace", fontSize: 10, color: "#8C8A82", cursor: "pointer", textDecoration: "underline" }}>Reset</button>}
          </div>
        </div>
        <div style={{ height: 7, background: "#E2E0D8", borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pc, borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 9, color: "#8C8A82", marginBottom: 16 }}><span>No-bid (≤9)</span><span>Closer look (10–14)</span><span>Strong go (15–18)</span></div>
        {GGC.map((cat) => {
          const sv = gs.scores[cat.id];
          const bc = sv ? SC2[sv] : "#E2E0D8";
          return (
            <div key={cat.id} style={{ background: "#fff", border: "1px solid #E2E0D8", borderLeft: `3px solid ${bc}`, borderRadius: 10, marginBottom: 8, padding: "12px 15px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18", marginBottom: 2 }}>{cat.lbl}</div>
                  <div style={{ fontSize: 12, color: "#8C8A82", lineHeight: 1.5 }}>{cat.d}</div>
                  {sv && <div style={{ fontSize: 11, color: SC2[sv], marginTop: 5, fontWeight: 500 }}>{sv === 1 ? cat.low : sv === 2 ? cat.mid : cat.high}</div>}
                </div>
                {sv && <div style={{ textAlign: "center", flexShrink: 0 }}><div style={{ fontFamily: "serif", fontSize: "1.4rem", fontWeight: 600, color: SC2[sv], lineHeight: 1 }}>{sv}</div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: SC2[sv], marginTop: 2 }}>{SL[sv]}</div></div>}
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                {[1,2,3].map((v) => (
                  <button key={v} onClick={() => setGGState(activeOppId, { ...gs, scores: { ...gs.scores, [cat.id]: v } })} style={{ flex: 1, padding: 8, borderRadius: 7, border: `1px solid ${sv === v ? SC2[v] : "#E2E0D8"}`, background: sv === v ? (v === 1 ? "#FEF2F2" : v === 2 ? "#FFF8ED" : "#F0FDF4") : "#fff", cursor: "pointer", fontSize: 13, fontFamily: "monospace", color: sv === v ? SC2[v] : "#8C8A82", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{v}</span>
                    <span style={{ fontSize: 9, textTransform: "uppercase" }}>{SL[v]}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {full && (() => {
          const bc = res === "go" ? "#22C55E" : res === "closer" ? "#B8860B" : "#EF4444";
          const bg = res === "go" ? "#F0FDF4" : res === "closer" ? "#FFF8ED" : "#FEF2F2";
          const weak = GGC.filter((c) => gs.scores[c.id] <= 2).sort((a, b) => gs.scores[a.id] - gs.scores[b.id]);
          return (
            <div style={{ borderRadius: 12, padding: "16px 18px", border: `2px solid ${bc}`, background: bg, marginTop: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontFamily: "serif", fontSize: "1.25rem", fontWeight: 600, color: bc }}>{res === "go" ? "Strong go" : res === "closer" ? "Closer look required" : "No-bid recommended"}</div>
                <div style={{ fontFamily: "serif", fontSize: "2rem", fontWeight: 600, color: bc }}>{tot}/18</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 7, marginBottom: 11 }}>
                {GGC.map((c) => { const sv = gs.scores[c.id] || 0; const sc = SC2[sv] || "#E2E0D8"; return <div key={c.id} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 7, padding: "7px 9px" }}><div style={{ fontSize: 11, fontWeight: 500, color: "#1C1B18", marginBottom: 3 }}>{c.lbl.split(" ")[0]}</div><div style={{ height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}><div style={{ width: `${(sv/3)*100}%`, height: "100%", background: sc, borderRadius: 2 }} /></div><div style={{ fontFamily: "monospace", fontSize: 10, color: sc }}>{sv}/3 · {SL[sv] || "—"}</div></div>; })}
              </div>
              {weak.length > 0 && (
                <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 7, padding: "9px 11px", marginBottom: 11 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 5 }}>Categories to strengthen</div>
                  {weak.map((c) => <div key={c.id} style={{ fontSize: 12, color: "#5A5850", marginBottom: 2 }}>· {c.lbl} — {gs.scores[c.id] === 2 ? c.mid : c.low}</div>)}
                </div>
              )}
              <div style={{ background: "#1C1B18", borderRadius: 8, padding: "13px 15px", marginBottom: 11 }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Final gut check</div>
                <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.6, fontStyle: "italic", marginBottom: 9 }}>"Can we deliver on every promise in this proposal without inflating what we know, what we have, and who we are today?"</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <input type="checkbox" checked={gs.gut} onChange={(e) => setGGState(activeOppId, { ...gs, gut: e.target.checked })} style={{ marginTop: 2 }} />
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", cursor: "pointer", lineHeight: 1.5 }}>Yes — we can deliver honestly on everything we propose</label>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {res === "go" && gs.gut && (
                  <button style={btnG} onClick={() => { setBids((p) => p.map((b) => b.id === activeOppId ? { ...b, ggScore: tot, ggDone: true, status: "Capture" } : b)); showToast("Go decision saved — moved to Capture"); setCurTab("pipeline"); }}>Add to Pipeline →</button>
                )}
                <button style={btnS} onClick={async () => {
                  setGGState(activeOppId, { ...gs, aiLoad: true, aiTxt: "" });
                  const weak2 = GGC.filter((c) => gs.scores[c.id] <= 2).map((c) => c.lbl + " (" + gs.scores[c.id] + "/3)").join(", ");
                  try {
                    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: "You are a federal GovCon proposal expert for Eternal Graphx / Team Design Studios, a WOSB founded by Susan Aldridge. She has 26 years UX/design experience, MBA in AI Leadership. Be concise and actionable in 3-4 sentences.", messages: [{ role: "user", content: `Go/No-Go score: ${tot}/18 for NAICS ${activeOpp.naics}. Weakest: ${weak2 || "none"}. Top 2-3 actions to improve Pwin?` }] }) });
                    const data = await r.json();
                    setGGState(activeOppId, { ...gs, aiLoad: false, aiTxt: data.content?.[0]?.text || "Unable to generate guidance." });
                  } catch { setGGState(activeOppId, { ...gs, aiLoad: false, aiTxt: "Unable to connect." }); }
                }}>Get AI Pwin guidance ↗</button>
              </div>
              {gs.aiLoad && <div style={{ background: "#F4F3EF", border: "1px solid #E2E0D8", borderRadius: 8, padding: "11px 13px", marginTop: 10, fontSize: 12, color: "#5A5850" }}>Generating guidance...</div>}
              {gs.aiTxt && <div style={{ background: "#F4F3EF", border: "1px solid #E2E0D8", borderRadius: 8, padding: "11px 13px", marginTop: 10, fontSize: 12, lineHeight: 1.65, color: "#5A5850" }}>{gs.aiTxt}</div>}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderEval = () => {
    const es = getEvalState(activeOppId);
    const prog = Math.round(Object.values(es.checked).filter(Boolean).length / EF.length * 100);
    const pc = prog === 100 ? "#22C55E" : prog >= 50 ? "#B8860B" : "#EF4444";
    const risks = EF.filter((f) => !es.checked[f.id]);
    const allDone = prog === 100;
    return (
      <div>
        <div style={{ background: "#EEF2FC", border: "1px solid #C7D7F8", borderRadius: 8, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#2A5BD7", marginBottom: 3 }}>Evaluating</div><div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18" }}>{activeOpp.name}</div></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: pc, fontWeight: 500 }}>{prog}% complete</div>
            {prog > 0 && <button onClick={() => setEvalState(activeOppId, { checked: {}, notes: {}, itemChecks: {}, open: null })} style={{ background: "transparent", border: "none", fontFamily: "monospace", fontSize: 10, color: "#8C8A82", cursor: "pointer", textDecoration: "underline" }}>Reset</button>}
          </div>
        </div>
        <div style={{ height: 7, background: "#E2E0D8", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ width: `${prog}%`, height: "100%", background: pc, borderRadius: 4 }} />
        </div>
        {EF.map((f) => {
          const isChk = !!es.checked[f.id];
          const isOpen = es.open === f.id;
          const ic = es.itemChecks[f.id] || {};
          const itemsDone = f.checklist.filter((_, i) => ic[i]).length;
          const bc = isChk ? "#22C55E" : f.sev === "high" ? "#EF4444" : "#B8860B";
          return (
            <div key={f.id} style={{ background: "#fff", border: "1px solid #E2E0D8", borderLeft: `3px solid ${bc}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
              <div onClick={() => setEvalState(activeOppId, { ...es, open: es.open === f.id ? null : f.id })} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 15px", cursor: "pointer" }}>
                <input type="checkbox" checked={isChk} onClick={(e) => e.stopPropagation()} onChange={(e) => setEvalState(activeOppId, { ...es, checked: { ...es.checked, [f.id]: e.target.checked } })} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18", marginBottom: 2 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: "#8C8A82", lineHeight: 1.5 }}>{f.hint}</div>
                  <div style={{ fontSize: 11, color: "#2A5BD7", marginTop: 3, fontStyle: "italic" }}>{f.tip}</div>
                  {itemsDone > 0 && <div style={{ fontSize: 11, color: "#2A5BD7", marginTop: 2, fontFamily: "monospace" }}>{itemsDone}/{f.checklist.length} confirmed</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                  <span style={{ background: isChk ? "#F0FDF4" : f.sev === "high" ? "#FEF2F2" : "#FFF8ED", color: isChk ? "#166534" : f.sev === "high" ? "#991B1B" : "#B8860B", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", padding: "3px 8px", borderRadius: 4 }}>{isChk ? "Reviewed" : f.sev === "high" ? "High risk" : "Med risk"}</span>
                  <span style={{ fontSize: 10, color: "#8C8A82", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding: "0 15px 13px", borderTop: "1px solid #F0EFE9" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", margin: "9px 0 5px" }}>Notes</div>
                  <textarea value={es.notes[f.id] || ""} onChange={(e) => setEvalState(activeOppId, { ...es, notes: { ...es.notes, [f.id]: e.target.value } })} style={{ width: "100%", border: "1px solid #C8C5BA", borderRadius: 6, padding: "7px 10px", fontSize: 12, color: "#1C1B18", background: "#fff", resize: "vertical", minHeight: 48 }} placeholder="Document findings..." />
                  <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", margin: "9px 0 6px" }}>Confirmation checklist</div>
                  {f.checklist.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
                      <input type="checkbox" checked={!!ic[idx]} onChange={(e) => {
                        const newIc = { ...ic, [idx]: e.target.checked };
                        const newItemChecks = { ...es.itemChecks, [f.id]: newIc };
                        const newChecked = { ...es.checked };
                        if (f.checklist.every((_, i) => newIc[i])) newChecked[f.id] = true;
                        setEvalState(activeOppId, { ...es, itemChecks: newItemChecks, checked: newChecked });
                      }} style={{ marginTop: 2 }} />
                      <label style={{ fontSize: 12, color: "#5A5850", lineHeight: 1.5 }}>{item}</label>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button onClick={() => setEvalState(activeOppId, { ...es, checked: { ...es.checked, [f.id]: !es.checked[f.id] } })} style={{ background: isChk ? "#F4F3EF" : "#2A5BD7", color: isChk ? "#5A5850" : "#fff", border: `1px solid ${isChk ? "#C8C5BA" : "#2A5BD7"}`, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>{isChk ? "✓ Reviewed — unmark" : "Mark as reviewed"}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {risks.length > 0 && !allDone && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "13px 15px", marginBottom: 12 }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#991B1B", marginBottom: 8 }}>⚠ {risks.length} unreviewed risk factor{risks.length !== 1 ? "s" : ""}</div>
            {risks.map((f) => <div key={f.id} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ background: f.sev === "high" ? "#FEE2E2" : "#FEF3C7", color: f.sev === "high" ? "#991B1B" : "#B8860B", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", padding: "2px 7px", borderRadius: 3, flexShrink: 0 }}>{f.sev}</span><div style={{ fontSize: 12, color: "#5A5850" }}><strong>{f.name}</strong> — {f.risk}</div></div>)}
          </div>
        )}
        {allDone && (
          <div>
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "13px 15px", marginBottom: 12 }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#166534", marginBottom: 4 }}>Evaluation complete</div>
              <div style={{ fontSize: 13, color: "#5A5850" }}>All six factors reviewed. Ready to confirm NAICS code and set-aside strategy.</div>
            </div>
            <button style={btnG} onClick={() => { setBids((p) => p.map((b) => b.id === activeOppId ? { ...b, evalDone: true } : b)); setCurTab("naics"); showToast("Evaluation complete"); }}>Continue to NAICS →</button>
          </div>
        )}
      </div>
    );
  };

  const renderShred = () => {
    const rows = getShredRows(activeOppId);
    const done = rows.filter((r) => r.done).length;
    const allDone = done === rows.length && rows.length > 0;
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
          <div style={{ background: "#EEF2FC", border: "1px solid #C7D7F8", borderRadius: 8, padding: "10px 13px" }}><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#2A5BD7", marginBottom: 4 }}>Shredding</div><div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18" }}>{activeOpp.name.split(" ").slice(0, 3).join(" ")}</div></div>
          <div style={{ background: "#F4F3EF", border: "1px solid #E2E0D8", borderRadius: 8, padding: "10px 13px" }}><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 4 }}>Requirements</div><div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18" }}>{rows.length} documented · {done} addressed</div></div>
          <div style={{ background: allDone ? "#F0FDF4" : "#FFF8ED", border: `1px solid ${allDone ? "#BBF7D0" : "#FDE68A"}`, borderRadius: 8, padding: "10px 13px" }}><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: allDone ? "#166534" : "#B8860B", marginBottom: 4 }}>Status</div><div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18" }}>{allDone ? "Complete" : "In progress"}</div></div>
        </div>
        <div style={{ background: "#1C1B18", borderRadius: 8, padding: "11px 14px", marginBottom: 14 }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>The BLUF</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>You cannot win unless you are compliant with the RFP. You cannot be compliant unless you effectively shred the RFP. Every requirement must have a corresponding response in your proposal.</div>
        </div>
        <div style={{ overflowX: "auto", marginBottom: 11 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 520 }}>
            <thead><tr style={{ borderBottom: "1px solid #E2E0D8" }}>{["#","Section","Requirement","Type","Done"].map((h) => <th key={h} style={{ textAlign: "left", padding: "7px 8px", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82" }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #F0EFE9", background: r.done ? "#FAFFFE" : "#fff" }}>
                  <td style={{ padding: "6px 8px", color: "#8C8A82", fontFamily: "monospace", fontSize: 10 }}>{i + 1}</td>
                  <td style={{ padding: "6px 8px" }}><select value={r.section} onChange={(e) => { const nr = [...rows]; nr[i] = { ...nr[i], section: e.target.value }; setShredRows(activeOppId, nr); }} style={{ border: "1px solid #E2E0D8", borderRadius: 4, padding: "4px 7px", fontSize: 11, color: "#1C1B18", background: "#fff" }}>{["Section B","Section C","Section L","Section H","Q&A","Amendment"].map((s) => <option key={s}>{s}</option>)}</select></td>
                  <td style={{ padding: "6px 8px" }}><input value={r.req} onChange={(e) => { const nr = [...rows]; nr[i] = { ...nr[i], req: e.target.value }; setShredRows(activeOppId, nr); }} placeholder="Enter requirement..." style={{ border: "1px solid #E2E0D8", borderRadius: 4, padding: "4px 7px", fontSize: 11, color: "#1C1B18", background: "#fff", width: "100%", minWidth: 150 }} /></td>
                  <td style={{ padding: "6px 8px" }}><select value={r.type} onChange={(e) => { const nr = [...rows]; nr[i] = { ...nr[i], type: e.target.value }; setShredRows(activeOppId, nr); }} style={{ border: "1px solid #E2E0D8", borderRadius: 4, padding: "4px 7px", fontSize: 11, color: "#1C1B18", background: "#fff" }}>{["Format","Technical","Pricing","Admin","Compliance","SME Required"].map((t) => <option key={t}>{t}</option>)}</select></td>
                  <td style={{ padding: "6px 8px", textAlign: "center" }}><input type="checkbox" checked={r.done} onChange={(e) => { const nr = [...rows]; nr[i] = { ...nr[i], done: e.target.checked }; setShredRows(activeOppId, nr); if (nr.every((x) => x.done)) { setBids((p) => p.map((b) => b.id === activeOppId ? { ...b, shredDone: true } : b)); } }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginBottom: 13 }}>
          <button style={btnS} onClick={() => setShredRows(activeOppId, [...rows, { id: Date.now(), section: "Section C", req: "", type: "Technical", done: false }])}>+ Add row</button>
          <button style={{ ...btnS, marginLeft: 8 }} onClick={async () => {
            setShredAiLoad(true); setShredAiTxt("");
            try {
              const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: "You are a federal GovCon proposal expert for Eternal Graphx / Team Design Studios, a WOSB. Be concise.", messages: [{ role: "user", content: `Shredding RFP for NAICS ${activeOpp.naics} (${NM[activeOpp.naics]}). What are the 3 most commonly missed implied requirements?` }] }) });
              const data = await r.json();
              setShredAiTxt(data.content?.[0]?.text || "Unable to generate.");
            } catch { setShredAiTxt("Unable to connect."); }
            setShredAiLoad(false);
          }}>AI shred assist ↗</button>
        </div>
        {shredAiLoad && <div style={{ background: "#F4F3EF", border: "1px solid #E2E0D8", borderRadius: 8, padding: "11px 13px", marginBottom: 10, fontSize: 12, color: "#5A5850" }}>Analyzing...</div>}
        {shredAiTxt && <div style={{ background: "#F4F3EF", border: "1px solid #E2E0D8", borderRadius: 8, padding: "11px 13px", marginBottom: 10, fontSize: 12, lineHeight: 1.65, color: "#5A5850" }}>{shredAiTxt}</div>}
        <div style={{ background: "#1C1B18", borderRadius: 10, padding: "13px 16px" }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Final gut check</div>
          <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.65, fontStyle: "italic" }}>"Can we deliver on every promise in this proposal without inflating what we know, what we have, and who we are today?"</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <div style={{ background: "#1C1B18", color: "#fff", padding: "16px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>Team Design Studios · Eternal Graphx LLC · Est. 1999</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 600, color: "#fff" }}>GovCon Ready</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Proposal intelligence from evaluation to submission</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button style={{ background: "transparent", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 7, padding: "9px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }} onClick={() => { setReportOppId(activeOppId); setShowReportModal(true); }}>⬇ Download Report</button>
            <button style={{ background: "#2A5BD7", color: "#fff", border: "2px solid #4A7AFF", borderRadius: 7, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', monospace", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(42,91,215,0.4)" }} onClick={() => { setCurTab("pipeline"); setShowAdd((p) => !p); if (!showAdd) setThreevDone({}); }}>+ Add Opportunity</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>Active opportunity:</span>
          <select style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#fff", cursor: "pointer", flex: 1, maxWidth: 320 }} value={activeOppId} onChange={(e) => setActiveOppId(parseInt(e.target.value))}>
            {bids.map((b) => <option key={b.id} value={b.id}>{b.name} · {b.agency}</option>)}
          </select>
          {activeOpp && (() => { const sc = SC[activeOpp.status] || SC.Evaluating; return <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", padding: "3px 9px", borderRadius: 20, background: sc.bg, color: sc.text }}>{activeOpp.status}</span>; })()}
        </div>
        <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 8, overflowX: "auto" }}>
          {tabs.map((tab) => (
            <button key={tab.id} style={nb(curTab === tab.id)} onClick={() => setCurTab(tab.id)}>{tab.label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px 22px", background: "#F4F3EF", minHeight: 600 }}>
        {curTab === "overview" && renderOverview()}
        {curTab === "eval" && renderEval()}
        {curTab === "naics" && renderNAICS()}
        {curTab === "gonogo" && renderGoNoGo()}
        {curTab === "pipeline" && renderPipeline()}
        {curTab === "shred" && renderShred()}
      </div>
      {showReportModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,24,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 600, color: "#1C1B18", marginBottom: 4 }}>Download Proposal Readiness Report</div>
            <div style={{ fontSize: 12, color: "#8C8A82", marginBottom: 20 }}>Select an opportunity and choose which sections to include.</div>
            <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", marginBottom: 8 }}>Select opportunity</div>
            {bids.map((b) => {
              const sc = SC[b.status] || SC.Evaluating;
              const prog = oppProgress(b);
              const progCol = prog === 100 ? "#22C55E" : prog >= 50 ? "#B8860B" : "#EF4444";
              return (
                <div key={b.id} onClick={() => setReportOppId(b.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1px solid ${reportOppId === b.id ? "#2A5BD7" : "#E2E0D8"}`, background: reportOppId === b.id ? "#EEF2FC" : "#fff", borderRadius: 8, marginBottom: 7, cursor: "pointer" }}>
                  <input type="radio" readOnly checked={reportOppId === b.id} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, color: "#1C1B18", marginBottom: 2 }}>{b.name}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 10, color: "#8C8A82" }}>{b.agency} · {b.naics} · <span style={{ background: sc.bg, color: sc.text, padding: "1px 6px", borderRadius: 10, fontSize: 9 }}>{b.status}</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <div style={{ flex: 1, height: 3, background: "#E2E0D8", borderRadius: 2, overflow: "hidden", maxWidth: 60 }}><div style={{ width: `${prog}%`, height: "100%", background: progCol, borderRadius: 2 }} /></div>
                      <span style={{ fontFamily: "monospace", fontSize: 9, color: progCol }}>{prog}% ready</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#8C8A82", margin: "16px 0 8px" }}>Include sections</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 20 }}>
              {[["summary","Opportunity Summary","Agency, NAICS, value, dates"],["eval","Contract Evaluation","Six factors, notes, status"],["gonogo","Go / No-Go Score","Category breakdown, decision"],["shred","RFP Shred Matrix","Requirements, SME flags"],["naics","NAICS Strategy","Code, set-aside, weights"],["math","Pipeline Math","E[V], ROI, Pwin"]].map(([key, lbl2, sub]) => (
                <div key={key} onClick={() => setReportSecs((p) => ({ ...p, [key]: !p[key] }))} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", border: `1px solid ${reportSecs[key] ? "#2A5BD7" : "#E2E0D8"}`, background: reportSecs[key] ? "#EEF2FC" : "#fff", borderRadius: 7, cursor: "pointer" }}>
                  <input type="checkbox" readOnly checked={!!reportSecs[key]} />
                  <div><div style={{ fontSize: 12, color: "#1C1B18", fontWeight: 500 }}>{lbl2}</div><div style={{ fontSize: 11, color: "#8C8A82" }}>{sub}</div></div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid #E2E0D8" }}>
              <button onClick={() => setShowReportModal(false)} style={{ background: "#fff", border: "1px solid #C8C5BA", borderRadius: 7, padding: "10px 16px", cursor: "pointer", fontSize: 13, color: "#5A5850" }}>Cancel</button>
              <button onClick={() => {
                const opp = bids.find((b) => b.id === reportOppId);
                if (!opp) return;
                const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                const evV = evc(opp); const roiV = rc(opp);
                let body = "";
                if (reportSecs.summary) body += `<div class="section"><div class="section-title">Opportunity Summary</div><div class="field-row"><div class="field-label">Opportunity</div><div>${opp.name}</div></div><div class="field-row"><div class="field-label">Agency</div><div>${opp.agency}</div></div><div class="field-row"><div class="field-label">NAICS</div><div>${opp.naics} — ${NM[opp.naics] || ""}</div></div><div class="field-row"><div class="field-label">Set-Aside</div><div>${opp.setAside}</div></div><div class="field-row"><div class="field-label">Value</div><div>${fmt(opp.value)}</div></div><div class="field-row"><div class="field-label">Pwin</div><div>${Math.round(opp.pwin*100)}%</div></div><div class="field-row"><div class="field-label">Status</div><div>${opp.status}</div></div></div>`;
                if (reportSecs.math) body += `<div class="section"><div class="section-title">Pipeline Math</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px"><div style="background:#EEF2FC;border-radius:8px;padding:12px;text-align:center"><div style="font-size:10px;color:#2A5BD7;margin-bottom:5px">E[V]</div><div style="font-size:1.4rem;font-weight:600;color:#2A5BD7">${fR(evV)}</div></div><div style="background:#F0FDF4;border-radius:8px;padding:12px;text-align:center"><div style="font-size:10px;color:#166534;margin-bottom:5px">ROI Index</div><div style="font-size:1.4rem;font-weight:600;color:#166534">${fR(roiV)}</div></div><div style="background:#F4F3EF;border-radius:8px;padding:12px;text-align:center"><div style="font-size:10px;color:#8C8A82;margin-bottom:5px">Pwin</div><div style="font-size:1.4rem;font-weight:600;color:#1C1B18">${Math.round(opp.pwin*100)}%</div></div></div></div>`;
                const w = window.open("", "_blank");
                if (!w) { alert("Allow pop-ups to generate the report."); return; }
                w.document.write(`<!DOCTYPE html><html><head><title>GovCon Ready — ${opp.name}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:sans-serif;background:#fff;color:#1C1B18;padding:40px;max-width:820px;margin:0 auto;font-size:13px}.report-hdr{border-bottom:2px solid #1C1B18;padding-bottom:18px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px}.report-brand{font-size:1.7rem;font-weight:600;margin-bottom:3px}.report-sub{font-size:12px;color:#8C8A82}.report-meta{text-align:right;font-size:10px;color:#8C8A82;line-height:1.7}.section{margin-bottom:28px}.section-title{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8C8A82;border-bottom:1px solid #E2E0D8;padding-bottom:6px;margin-bottom:14px}.field-row{display:grid;grid-template-columns:150px 1fr;gap:10px;margin-bottom:7px}.field-label{font-size:10px;text-transform:uppercase;color:#8C8A82}.confidential{background:#FEF2F2;border:1px solid #FECACA;border-radius:5px;padding:8px 12px;font-size:10px;color:#991B1B;text-transform:uppercase;letter-spacing:.08em;margin-bottom:24px;text-align:center}.footer{margin-top:40px;padding-top:14px;border-top:1px solid #E2E0D8;font-size:9px;color:#8C8A82;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}@media print{body{padding:20px}}</style></head><body><div class="report-hdr"><div><div class="report-brand">GovCon Ready</div><div class="report-sub">Proposal Readiness Report · Team Design Studios · Eternal Graphx LLC · Est. 1999</div></div><div class="report-meta">Generated ${date}<br>Susan E. Aldridge<br>susanaldridge555@icloud.com</div></div><div class="confidential">Confidential — For internal use and authorized reviewers only</div>${body}<div class="footer"><span>GovCon Ready · Team Design Studios · Eternal Graphx LLC · Est. 1999</span><span>github.com/saldridge1</span></div><script>setTimeout(()=>window.print(),500);<\/script></body></html>`);
                w.document.close();
                setShowReportModal(false);
              }} style={{ background: "#2A5BD7", color: "#fff", border: "none", borderRadius: 7, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Generate Report →</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#1C1B18", color: "#fff", borderRadius: 8, padding: "12px 18px", fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
