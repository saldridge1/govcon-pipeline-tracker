import { useState } from "react";

const TABS = [
  { id: "overview", icon: "⬡", label: "Overview" },
  { id: "eval", num: "①", label: "Contract Eval" },
  { id: "naics", num: "②", label: "NAICS" },
  { id: "partner", num: "③", label: "Partner Intel" },
  { id: "gonogo", num: "④", label: "Go / No-Go" },
  { id: "pipeline", num: "⑤", label: "Pipeline" },
  { id: "shred", num: "⑥", label: "RFP Shred" },
];

const INITIAL_BIDS = [
  { id: 1, name: "GSA Design Services IDIQ", agency: "GSA", naics: "541430", setAside: "WOSB", value: 850000, pwin: 0.18, status: "Capture", dueDate: "2026-06-15", strategyType: "Tactical", incumbent: "Unknown", incumbentDiff: "", certActive: true, teamingPartner: "", writeBeforeSAM: false, partnerGap: true },
  { id: 2, name: "DHS UX Research Support", agency: "DHS", naics: "541511", setAside: "SB", value: 1200000, pwin: 0.12, status: "RFP Review", dueDate: "2026-05-01", strategyType: "Volume", incumbent: "Yes", incumbentDiff: "", certActive: false, teamingPartner: "", writeBeforeSAM: false, partnerGap: true },
  { id: 3, name: "HHS Communication Design", agency: "HHS", naics: "541430", setAside: "WOSB", value: 620000, pwin: 0.22, status: "Writing", dueDate: "2026-04-20", strategyType: "Strategic", incumbent: "No", incumbentDiff: "Health communication specialization and WOSB pricing advantage", certActive: true, teamingPartner: "", writeBeforeSAM: true, partnerGap: true },
];

const SC = {
  Evaluating: { bg: "#EEF2FC", color: "#185FA5" },
  Capture: { bg: "#FFF8ED", color: "#7A4A00" },
  "RFP Review": { bg: "#F0F9FF", color: "#0369A1" },
  Writing: { bg: "#F0FDF4", color: "#166634" },
  Won: { bg: "#ECFDF5", color: "#065F46" },
  "No-Bid": { bg: "#FEF2F2", color: "#A32D2D" },
};

const ST = {
  Tactical: { bg: "#EEF2FC", color: "#185FA5", lbl: "Tactical" },
  Volume: { bg: "#FAEEDA", color: "#854F0B", lbl: "Volume" },
  Strategic: { bg: "#EAF3DE", color: "#3B6D11", lbl: "Strategic (GWAC)" },
};

const PDIMS = [
  { id: "pp", lbl: "Past performance", hint: "Documented federal contracts" },
  { id: "tech", lbl: "Technical capability", hint: "Core competencies matching scope" },
  { id: "cert", lbl: "Certifications", hint: "Set-aside certs in SAM.gov" },
  { id: "cap", lbl: "Capacity", hint: "Bandwidth without overextension" },
  { id: "rel", lbl: "Agency relationships", hint: "Relationships at target agency" },
  { id: "price", lbl: "Price competitiveness", hint: "Ability to price competitively" },
];

const GGC = [
  { id: "pp", lbl: "Past Performance", d: "Documented experience directly mirroring scope.", low: "Little relevant past perf.", mid: "Some relevant — not direct mirror.", high: "Strong past perf mapping this solicitation." },
  { id: "cc", lbl: "Core Competencies", d: "Primary services meet 80%+ of requirements.", low: "Significant gaps.", mid: "Meet most — some stretching.", high: "Meet 80%+ with deployable capability." },
  { id: "wc", lbl: "Workforce & Capacity", d: "People and bandwidth to deliver.", low: "Capacity gaps exist.", mid: "Manageable with adjustments.", high: "Clear bandwidth to deliver." },
  { id: "cr", lbl: "Compliance & Reporting", d: "Infrastructure meets requirements.", low: "Significant compliance gaps.", mid: "Most met — some gaps.", high: "All requirements met." },
  { id: "pg", lbl: "Partnerships & Gaps", d: "Teaming partners identified for gaps.", low: "No teaming solution.", mid: "Conversations started — not confirmed.", high: "All gaps covered by confirmed partners." },
  { id: "fr", lbl: "Financial Readiness", d: "Can sustain through payment cycle.", low: "Cash flow risk.", mid: "Manageable with monitoring.", high: "Fully able to sustain." },
  { id: "tr", lbl: "Teaming Readiness", d: "Partner confirmed and covers your past performance gaps.", low: "No partner identified.", mid: "Partner identified — not confirmed.", high: "Partner confirmed with documented past perf in scope." },
];

const SL = { 1: "Low", 2: "Partial", 3: "Strong" };
const SC2 = { 1: "#E24B4A", 2: "#BA7517", 3: "#639922" };

const fmt = (n) => n >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : "$" + (n / 1e3).toFixed(0) + "K";
const evc = (b) => b.pwin * b.value * 0.15;

const navBtn = (isOn) => ({
  all: "unset",
  fontFamily: "monospace",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "10px 13px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: 3,
  borderBottom: isOn ? "2px solid #2A5BD7" : "2px solid transparent",
  position: "relative",
  overflow: "hidden",
  background: isOn ? "#252420" : "#1C1B18",
});

const tag = (bg, color) => ({
  display: "inline-flex", alignItems: "center", gap: 3,
  fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 20,
  background: bg, color,
});

const card = {
  background: "var(--color-background-primary, #fff)",
  border: "0.5px solid var(--color-border-tertiary, #e2e0d8)",
  borderRadius: 12, padding: "14px 16px", marginBottom: 10,
};

const inp = {
  width: "100%", border: "0.5px solid var(--color-border-tertiary, #e2e0d8)",
  borderRadius: 8, padding: "7px 10px", fontSize: 12,
  color: "var(--color-text-primary, #1c1b18)",
  background: "var(--color-background-primary, #fff)",
};

const alertStyle = (type) => {
  const map = {
    w: { background: "#FFF8ED", border: "0.5px solid #FAC775", color: "#854F0B" },
    g: { background: "#EAF3DE", border: "0.5px solid #C0DD97", color: "#3B6D11" },
    b: { background: "#E6F1FB", border: "0.5px solid #B5D4F4", color: "#185FA5" },
  };
  return { ...map[type], borderRadius: 8, padding: "9px 12px", fontSize: 12, lineHeight: 1.55, marginBottom: 8 };
};

export default function GovConReady() {
  const [curTab, setCurTab] = useState("overview");
  const [bids, setBids] = useState(INITIAL_BIDS);
  const [activeId, setActiveId] = useState(1);
  const [ggScores, setGGScores] = useState({});
  const [partnerScores, setPartnerScores] = useState({});

  const activeOpp = bids.find((b) => b.id === activeId) || bids[0];
  const getOpp = () => activeOpp;

  const updateBid = (id, updates) => setBids((prev) => prev.map((b) => b.id === id ? { ...b, ...updates } : b));

  const getGG = (id) => ggScores[id] || {};
  const setGG = (id, scores) => setGGScores((p) => ({ ...p, [id]: scores }));

  const getPS = (id) => partnerScores[id] || { you: {}, partner: {} };
  const setPS = (id, s) => setPartnerScores((p) => ({ ...p, [id]: s }));

  const navStyles = `
    .gcr-nb { position: relative; overflow: hidden; transition: background 0.2s; }
    .gcr-nb::before, .gcr-nb::after { content: ''; position: absolute; width: 0; height: 2px; background: #EF9F27; transition: width 0.25s ease; }
    .gcr-nb::before { top: 0; left: 0; }
    .gcr-nb::after { top: 0; right: 0; }
    .gcr-nb:hover { background: #2A2925 !important; }
    .gcr-nb:hover::before, .gcr-nb:hover::after { width: 45%; }
    .gcr-sb { flex: 1; padding: 6px; border-radius: 6px; border: 0.5px solid #e2e0d8; background: #fff; cursor: pointer; font-size: 11px; font-family: monospace; color: #888; display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .gcr-sb.s1 { border-color: #E24B4A; background: #FCEBEB; color: #A32D2D; }
    .gcr-sb.s2 { border-color: #BA7517; background: #FAEEDA; color: #854F0B; }
    .gcr-sb.s3 { border-color: #639922; background: #EAF3DE; color: #3B6D11; }
  `;

  const renderOverview = () => {
    const act = bids.filter((b) => b.status !== "No-Bid" && b.status !== "Won");
    const tP = act.reduce((a, b) => a + b.value, 0);
    const tE = act.reduce((a, b) => a + evc(b), 0);
    const tactical = bids.filter((b) => b.strategyType === "Tactical").length;
    const volume = bids.filter((b) => b.strategyType === "Volume").length;
    const strategic = bids.filter((b) => b.strategyType === "Strategic").length;
    const noP = bids.filter((b) => b.partnerGap && b.status !== "No-Bid").length;
    const opp = getOpp();
    return (
      <div>
        {noP > 0 && <div style={alertStyle("w")}><strong>Partner gap alert</strong> — {noP} active opportunit{noP !== 1 ? "ies" : "y"} without a confirmed teaming partner. Go ugly early — identify your partner before the RFP drops.</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 14 }}>
          {[["Active pipeline", fmt(tP), "#1C1B18"], ["Total E[V]", fmt(tE), "#185FA5"], ["Partner gaps", noP, noP > 0 ? "#A32D2D" : "#3B6D11"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "var(--color-background-secondary, #f4f3ef)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: "serif", fontSize: "1.3rem", fontWeight: 500, color: c }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10 }}>Strategy portfolio balance</div>
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10, lineHeight: 1.6 }}>Volume bidding builds pipeline. Strategic bidding — GWAC — builds wealth. Everything adds up to strategic bidding.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 80, background: "#EEF2FC", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}><div style={{ fontFamily: "serif", fontSize: "1.5rem", fontWeight: 500, color: "#185FA5" }}>{tactical}</div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#185FA5", marginTop: 2 }}>Tactical</div></div>
            <div style={{ flex: 1, minWidth: 80, background: "#FAEEDA", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}><div style={{ fontFamily: "serif", fontSize: "1.5rem", fontWeight: 500, color: "#854F0B" }}>{volume}</div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#854F0B", marginTop: 2 }}>Volume</div></div>
            <div style={{ flex: 1, minWidth: 80, background: "#EAF3DE", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}><div style={{ fontFamily: "serif", fontSize: "1.5rem", fontWeight: 500, color: "#3B6D11" }}>{strategic}</div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "#3B6D11", marginTop: 2 }}>Strategic</div></div>
          </div>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10 }}>Active opportunity</div>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-primary, #1c1b18)", marginBottom: 3 }}>{opp.name}</div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--color-text-secondary, #8c8a82)" }}>{opp.agency} · NAICS {opp.naics} · {opp.setAside}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={tag(SC[opp.status]?.bg, SC[opp.status]?.color)}>{opp.status}</span>
              <span style={tag(ST[opp.strategyType]?.bg, ST[opp.strategyType]?.color)}>{ST[opp.strategyType]?.lbl}</span>
              {opp.incumbent === "Yes" ? <span style={tag("#FCEBEB", "#A32D2D")}>Incumbent exists</span> : opp.incumbent === "No" ? <span style={tag("#EAF3DE", "#3B6D11")}>No incumbent</span> : <span style={tag("#FAEEDA", "#854F0B")}>Incumbent unknown</span>}
            </div>
          </div>
          {opp.teamingPartner ? <div style={alertStyle("g")}>Partner confirmed: <strong>{opp.teamingPartner}</strong></div> : opp.partnerGap ? <div style={alertStyle("w")}>No teaming partner — go to Partner Intel to evaluate candidates.</div> : null}
          {opp.writeBeforeSAM && <div style={alertStyle("b")}>Capture plan started before SAM.gov release — strong competitive position.</div>}
          <button onClick={() => setCurTab("eval")} style={{ background: "#2A5BD7", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 500, width: "100%", marginTop: 8 }}>Continue workflow →</button>
        </div>
      </div>
    );
  };

  const renderEval = () => {
    const opp = getOpp();
    return (
      <div>
        <div style={alertStyle("b")}><strong>Evaluating:</strong> {opp.name} · {opp.agency} · {opp.setAside}</div>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10 }}>Incumbent strategy — new in v2.1</div>
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>Incumbent status</label>
              <select style={inp} value={opp.incumbent} onChange={(e) => updateBid(opp.id, { incumbent: e.target.value })}>
                {["Unknown", "Yes", "No"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>Write before SAM.gov?</label>
              <select style={inp} value={opp.writeBeforeSAM ? "Yes" : "No"} onChange={(e) => updateBid(opp.id, { writeBeforeSAM: e.target.value === "Yes" })}>
                <option>No</option><option>Yes</option>
              </select>
            </div>
          </div>
          {opp.incumbent === "Yes" && (
            <div>
              <label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>How are you different from the incumbent?</label>
              <textarea style={{ ...inp, resize: "vertical", minHeight: 48 }} placeholder="What makes you lower risk?" value={opp.incumbentDiff || ""} onChange={(e) => updateBid(opp.id, { incumbentDiff: e.target.value })} />
              <div style={{ fontSize: 11, color: "var(--color-text-secondary, #8c8a82)", marginTop: 4, lineHeight: 1.5 }}>As a small business you are inherently low risk. Incumbents get comfortable. Lead with energy, specialization, and WOSB pricing advantage.</div>
            </div>
          )}
          {opp.incumbent === "Unknown" && <div style={{ ...alertStyle("w"), marginTop: 8 }}>Research the incumbent before Go/No-Go. Check USASpending.gov.</div>}
          {opp.writeBeforeSAM ? <div style={{ ...alertStyle("g"), marginTop: 8 }}>Capture plan active — strongest competitive position.</div> : <div style={{ ...alertStyle("w"), marginTop: 8 }}>Best practice: write the proposal before SAM.gov releases. Win before you bid.</div>}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10, marginTop: 4 }}>Standard evaluation factors</div>
        {["Scope of Work Clarity", "NAICS Code Alignment", "Set-Aside Designation", "Deliverables & Timeline", "Compliance & Reporting", "Budget Ceiling & CLINs"].map((f, i) => (
          <div key={f} style={{ ...card, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 7 }}>
            <input type="checkbox" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 13, color: "var(--color-text-primary, #1c1b18)" }}>{f}</div>
            <span style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", padding: "2px 7px", borderRadius: 3, background: i === 3 || i === 5 ? "#FEF3C7" : "#FCEBEB", color: i === 3 || i === 5 ? "#854F0B" : "#A32D2D" }}>{i === 3 || i === 5 ? "Med" : "High"} risk</span>
          </div>
        ))}
        <button onClick={() => setCurTab("naics")} style={{ background: "#22C55E", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 12, marginTop: 8, width: "100%" }}>Continue to NAICS →</button>
      </div>
    );
  };

  const renderNAICS = () => {
    const opp = getOpp();
    return (
      <div>
        <div style={alertStyle("b")}><strong>NAICS strategy for:</strong> {opp.name}</div>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10 }}>Set-aside + strategy type — new in v2.1</div>
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>Strategy type</label>
              <select style={inp} value={opp.strategyType} onChange={(e) => updateBid(opp.id, { strategyType: e.target.value })}>
                {["Tactical", "Volume", "Strategic"].map((v) => <option key={v}>{v}</option>)}
              </select>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary, #8c8a82)", marginTop: 5, lineHeight: 1.5 }}>{opp.strategyType === "Strategic" ? "GWAC bidding builds wealth." : opp.strategyType === "Volume" ? "Volume builds pipeline." : "Tactical — small vehicle, fast win."}</div>
            </div>
            <div>
              <label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>WOSB cert active in SAM?</label>
              <select style={inp} value={opp.certActive ? "Yes" : "No"} onChange={(e) => updateBid(opp.id, { certActive: e.target.value === "Yes" })}>
                <option>Yes</option><option>No</option>
              </select>
              {!opp.certActive ? <div style={{ fontSize: 11, color: "#A32D2D", marginTop: 5 }}>Cert gap — identify a partner who holds it.</div> : <div style={{ fontSize: 11, color: "#3B6D11", marginTop: 5 }}>Certified and eligible to prime.</div>}
            </div>
            <div>
              <label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>Go ugly early?</label>
              <select style={inp}><option>No</option><option>Yes — small vehicle</option><option>Yes — Gwide</option></select>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary, #8c8a82)", marginTop: 5, lineHeight: 1.5 }}>Gwide contracts still require a teaming partner.</div>
            </div>
          </div>
          <div style={{ height: "0.5px", background: "var(--color-border-tertiary, #e2e0d8)", margin: "12px 0" }} />
          <div>
            <label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>Teaming partner — confirm before Go/No-Go</label>
            <input style={inp} value={opp.teamingPartner || ""} placeholder="Partner name and certification held..." onChange={(e) => updateBid(opp.id, { teamingPartner: e.target.value, partnerGap: !e.target.value })} />
            {!opp.teamingPartner ? <div style={{ fontSize: 11, color: "#854F0B", marginTop: 4 }}>No partner confirmed. Go to Partner Intel to evaluate candidates.</div> : <div style={{ fontSize: 11, color: "#3B6D11", marginTop: 4 }}>Partner confirmed. Document coverage in Partner Intel.</div>}
          </div>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10, marginTop: 4 }}>Confirmed NAICS</div>
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500, color: "#185FA5", background: "#E6F1FB", borderRadius: 6, padding: "5px 10px", flexShrink: 0 }}>{opp.naics}</div>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 500, fontSize: 13, color: "var(--color-text-primary, #1c1b18)" }}>Graphic Design Services</div><div style={{ fontSize: 12, color: "var(--color-text-secondary, #8c8a82)" }}>Brand identity, marketing design, publications</div></div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={tag("#EAF3DE", "#3B6D11")}>WOSB</span>
            <span style={tag("#EEF2FC", "#185FA5")}>8(a)</span>
            <span style={tag("#F4F3EF", "#5A5850")}>SB</span>
          </div>
        </div>
        <button onClick={() => setCurTab("partner")} style={{ background: "#22C55E", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 12, marginTop: 8, width: "100%" }}>Continue to Partner Intel →</button>
      </div>
    );
  };

  const renderPartner = () => {
    const opp = getOpp();
    const ps = getPS(opp.id);
    return (
      <div>
        <div style={alertStyle("b")}>Partner Intelligence for: {opp.name} · Partner for past performance. Once you have your partner, ask — how are we different?</div>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10 }}>Meatball chart — self-evaluation vs partner</div>
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>Your organization</label><div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary, #1c1b18)" }}>Team Design Studios / Eternal Graphx LLC</div></div>
            <div><label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>Teaming partner</label><input style={inp} placeholder="Partner name..." value={opp.teamingPartner || ""} onChange={(e) => updateBid(opp.id, { teamingPartner: e.target.value, partnerGap: !e.target.value })} /></div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 440 }}>
              <thead><tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary, #e2e0d8)" }}>
                {["Dimension", "You · 1–3", "Partner · 1–3", "Assessment"].map((h, i) => <th key={h} style={{ textAlign: i === 0 || i === 3 ? "left" : "center", padding: "6px 8px", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: i === 1 ? "#185FA5" : i === 2 ? "#854F0B" : "var(--color-text-secondary, #8c8a82)" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {PDIMS.map((d) => {
                  const ys = ps.you[d.id] || 0, ts = ps.partner[d.id] || 0;
                  const covered = ys < 3 && ts >= 3, gap = ys < 2 && ts < 2 && ys > 0 && ts > 0;
                  return (
                    <tr key={d.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary, #e2e0d8)" }}>
                      <td style={{ padding: "7px 8px" }}><div style={{ fontWeight: 500, fontSize: 12, color: "var(--color-text-primary, #1c1b18)" }}>{d.lbl}</div><div style={{ fontSize: 11, color: "var(--color-text-secondary, #8c8a82)" }}>{d.hint}</div></td>
                      <td style={{ padding: "7px 8px", textAlign: "center" }}><div style={{ display: "flex", gap: 3, justifyContent: "center" }}>{[1, 2, 3].map((v) => <button key={v} onClick={() => setPS(opp.id, { ...ps, you: { ...ps.you, [d.id]: v } })} style={{ width: 26, height: 26, borderRadius: 4, border: `0.5px solid ${ys === v ? "#185FA5" : "#e2e0d8"}`, background: ys === v ? "#E6F1FB" : "#fff", cursor: "pointer", fontSize: 11, fontWeight: ys === v ? 500 : 400, color: ys === v ? "#185FA5" : "#888" }}>{v}</button>)}</div></td>
                      <td style={{ padding: "7px 8px", textAlign: "center" }}><div style={{ display: "flex", gap: 3, justifyContent: "center" }}>{[1, 2, 3].map((v) => <button key={v} onClick={() => setPS(opp.id, { ...ps, partner: { ...ps.partner, [d.id]: v } })} style={{ width: 26, height: 26, borderRadius: 4, border: `0.5px solid ${ts === v ? "#BA7517" : "#e2e0d8"}`, background: ts === v ? "#FAEEDA" : "#fff", cursor: "pointer", fontSize: 11, fontWeight: ts === v ? 500 : 400, color: ts === v ? "#854F0B" : "#888" }}>{v}</button>)}</div></td>
                      <td style={{ padding: "7px 8px" }}>
                        {covered ? <span style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", background: "#EAF3DE", color: "#3B6D11", padding: "2px 7px", borderRadius: 3 }}>Gap covered</span>
                          : gap ? <span style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", background: "#FCEBEB", color: "#A32D2D", padding: "2px 7px", borderRadius: 3 }}>Gap remains</span>
                          : ys >= 3 ? <span style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", background: "#EEF2FC", color: "#185FA5", padding: "2px 7px", borderRadius: 3 }}>You are strong</span>
                          : <span style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", background: "#F4F3EF", color: "#8c8a82", padding: "2px 7px", borderRadius: 3 }}>Score to assess</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10 }}>How are we different?</div>
        <div style={card}>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary, #8c8a82)", marginBottom: 12, lineHeight: 1.6 }}>Once you have your partner, look at your combined team and ask — how are we different from majors, mid-majors, and other small businesses?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>vs Large primes / majors</label><textarea style={{ ...inp, resize: "vertical", minHeight: 48 }} placeholder="Lower overhead, faster response, direct access to principals..." /></div>
            <div><label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>vs Mid-majors</label><textarea style={{ ...inp, resize: "vertical", minHeight: 48 }} placeholder="More specialized, WOSB pricing advantage, leaner delivery..." /></div>
          </div>
          <div style={{ marginBottom: 10 }}><label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>vs Other small businesses</label><textarea style={{ ...inp, resize: "vertical", minHeight: 48 }} placeholder="26-year track record, AI integration, proven federal delivery..." /></div>
          <div style={{ height: "0.5px", background: "var(--color-border-tertiary, #e2e0d8)", margin: "12px 0" }} />
          <div><label style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", display: "block", marginBottom: 3 }}>Combined team differentiator narrative — for proposal</label><textarea style={{ ...inp, resize: "vertical", minHeight: 60 }} placeholder="Together our team brings... we are uniquely positioned because..." /></div>
        </div>
        <button onClick={() => setCurTab("gonogo")} style={{ background: "#22C55E", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 12, marginTop: 8, width: "100%" }}>Continue to Go / No-Go →</button>
      </div>
    );
  };

  const renderGoNoGo = () => {
    const opp = getOpp();
    const gs = getGG(opp.id);
    const tot = Object.values(gs).reduce((a, b) => a + b, 0);
    const full = Object.keys(gs).length === GGC.length;
    const pct = Math.round((tot / 21) * 100);
    const pc = pct >= 80 ? "#639922" : pct >= 55 ? "#BA7517" : "#E24B4A";
    return (
      <div>
        <div style={alertStyle("b")}>Scoring: {opp.name} · Teaming Readiness added as 7th category — max score 21</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)" }}>Score {tot}/21</div>
          <div style={{ fontFamily: "serif", fontSize: "1.1rem", fontWeight: 500, color: pc }}>{pct}%</div>
        </div>
        <div style={{ height: 6, background: "var(--color-border-tertiary, #e2e0d8)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}><div style={{ width: `${pct}%`, height: "100%", background: pc, borderRadius: 3 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 9, color: "var(--color-text-secondary, #8c8a82)", marginBottom: 14 }}><span>No-bid</span><span>Closer look</span><span>Strong go</span></div>
        {GGC.map((cat) => {
          const sv = gs[cat.id], bc = sv ? SC2[sv] : "var(--color-border-tertiary, #e2e0d8)", isNew = cat.id === "tr";
          return (
            <div key={cat.id} style={{ ...card, borderLeft: `3px solid ${bc}`, background: isNew ? "#FAFFFE" : undefined, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: "var(--color-text-primary, #1c1b18)", marginBottom: 2 }}>
                    {cat.lbl}
                    {isNew && <span style={{ fontFamily: "monospace", fontSize: 9, background: "#EAF3DE", color: "#3B6D11", padding: "1px 6px", borderRadius: 3, textTransform: "uppercase", marginLeft: 4 }}>New v2.1</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary, #8c8a82)", lineHeight: 1.5 }}>{cat.d}</div>
                  {sv && <div style={{ fontSize: 11, color: SC2[sv], marginTop: 4, fontWeight: 500 }}>{sv === 1 ? cat.low : sv === 2 ? cat.mid : cat.high}</div>}
                </div>
                {sv && <div style={{ textAlign: "center", flexShrink: 0 }}><div style={{ fontFamily: "serif", fontSize: "1.3rem", fontWeight: 500, color: SC2[sv] }}>{sv}</div><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: SC2[sv] }}>{SL[sv]}</div></div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3].map((v) => (
                  <button key={v} className={`gcr-sb${sv === v ? " s" + v : ""}`} onClick={() => setGG(opp.id, { ...gs, [cat.id]: v })}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
                    <span style={{ fontSize: 9, textTransform: "uppercase" }}>{SL[v]}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {full && (() => {
          const res = tot >= 18 ? "go" : tot >= 12 ? "closer" : "nogo";
          const bc = res === "go" ? "#639922" : res === "closer" ? "#BA7517" : "#E24B4A";
          const bg = res === "go" ? "#EAF3DE" : res === "closer" ? "#FAEEDA" : "#FCEBEB";
          return (
            <div style={{ borderRadius: 10, padding: "14px 16px", border: `2px solid ${bc}`, background: bg, marginTop: 10 }}>
              <div style={{ fontFamily: "serif", fontSize: "1.2rem", fontWeight: 500, color: bc, marginBottom: 6 }}>{res === "go" ? "Strong go" : res === "closer" ? "Closer look required" : "No-bid recommended"} · {tot}/21</div>
              {gs["tr"] <= 2 && <div style={{ fontSize: 12, color: "var(--color-text-secondary, #8c8a82)", marginBottom: 8, lineHeight: 1.55 }}>Teaming Readiness is weak. Confirm your partner in Partner Intel before advancing.</div>}
              {res === "go" && <button onClick={() => setCurTab("pipeline")} style={{ background: "#22C55E", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 12 }}>Add to Pipeline →</button>}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderPipeline = () => (
    <div>
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 10 }}>Strategy type, incumbent flag, partner status — new in v2.1</div>
      {bids.map((b) => {
        const sc = SC[b.status] || SC.Capture, st = ST[b.strategyType] || ST.Tactical;
        const od = b.dueDate && new Date(b.dueDate) < new Date() && b.status !== "Won" && b.status !== "No-Bid";
        return (
          <div key={b.id} style={{ ...card, borderLeft: b.id === activeId ? "3px solid #2A5BD7" : undefined }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 500, fontSize: 13, color: "var(--color-text-primary, #1c1b18)", marginBottom: 3 }}>
                  {b.name}
                  {b.id === activeId && <span style={{ fontFamily: "monospace", fontSize: 9, background: "#EEF2FC", color: "#185FA5", padding: "1px 6px", borderRadius: 3, marginLeft: 4 }}>Active</span>}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--color-text-secondary, #8c8a82)", marginBottom: 7 }}>{b.agency} · NAICS {b.naics} · {b.setAside}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <span style={tag(sc.bg, sc.color)}>{b.status}</span>
                  <span style={tag(st.bg, st.color)}>{st.lbl}</span>
                  {b.incumbent === "Yes" ? <span style={tag("#FCEBEB", "#A32D2D")}>Incumbent exists</span> : b.incumbent === "No" ? <span style={tag("#EAF3DE", "#3B6D11")}>No incumbent</span> : <span style={tag("#FAEEDA", "#854F0B")}>Incumbent unknown</span>}
                  {b.teamingPartner ? <span style={tag("#EAF3DE", "#3B6D11")}>Partner confirmed</span> : <span style={tag("#FCEBEB", "#A32D2D")}>No partner</span>}
                  {od && <span style={tag("#FCEBEB", "#A32D2D")}>Past due</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                {[["Value", fmt(b.value), "var(--color-text-primary, #1c1b18)"], ["E[V]", fmt(evc(b)), "#185FA5"], ["Pwin", Math.round(b.pwin * 100) + "%", "var(--color-text-primary, #1c1b18)"]].map(([l, v, c]) => (
                  <div key={l}><div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginBottom: 2 }}>{l}</div><div style={{ fontFamily: "serif", fontSize: 13, fontWeight: 500, color: c }}>{v}</div></div>
                ))}
              </div>
            </div>
            {b.incumbentDiff && <div style={{ fontSize: 12, color: "var(--color-text-secondary, #8c8a82)", marginTop: 8, fontStyle: "italic", borderTop: "0.5px solid var(--color-border-tertiary, #e2e0d8)", paddingTop: 8 }}>Differentiation: {b.incumbentDiff}</div>}
          </div>
        );
      })}
    </div>
  );

  const renderShred = () => {
    const opp = getOpp();
    const rows = [["Section L", "Cover letter 2 pages max", "Format"], ["Section C", "Design deliverables meet SOW", "Technical"], ["Section B", "All CLINs priced separately", "Pricing"], ["Section L", "Past performance — 3 refs required", "Format"], ["Section H", "Rights in data clause acknowledged", "Compliance"], ["Section C", "Technical approach narrative", "SME Required"]];
    return (
      <div>
        <div style={alertStyle("b")}><strong>Shredding:</strong> {opp.name}</div>
        <div style={{ background: "#1C1B18", borderRadius: 8, padding: "11px 14px", marginBottom: 14 }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>The BLUF</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>You cannot win unless you are compliant. You cannot be compliant unless you shred the RFP. Every requirement must have a corresponding response in your proposal.</div>
        </div>
        <div style={card}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
              <thead><tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary, #e2e0d8)" }}>
                {["#", "Section", "Requirement", "Type", "Done"].map((h) => <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary, #e2e0d8)" }}>
                    <td style={{ padding: "6px 8px", color: "var(--color-text-secondary, #8c8a82)", fontFamily: "monospace", fontSize: 10 }}>{i + 1}</td>
                    <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 10 }}>{r[0]}</td>
                    <td style={{ padding: "6px 8px" }}>{r[1]}</td>
                    <td style={{ padding: "6px 8px" }}><span style={{ background: r[2] === "SME Required" ? "#FFF8ED" : r[2] === "Technical" ? "#EEF2FC" : "#F4F3EF", color: r[2] === "SME Required" ? "#854F0B" : r[2] === "Technical" ? "#185FA5" : "#8c8a82", fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", padding: "2px 7px", borderRadius: 3 }}>{r[2]}</span></td>
                    <td style={{ padding: "6px 8px", textAlign: "center" }}><input type="checkbox" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <button style={{ background: "var(--color-background-primary, #fff)", border: "0.5px solid var(--color-border-tertiary, #e2e0d8)", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", color: "var(--color-text-secondary, #8c8a82)", marginTop: 8 }}>+ Add row</button>
      </div>
    );
  };

  const activeStatus = SC[activeOpp.status] || SC.Capture;

  return (
    <div style={{ fontFamily: "var(--font-sans, sans-serif)" }}>
      <style>{navStyles}</style>
      <div style={{ background: "#1C1B18", padding: "14px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>Team Design Studios · Eternal Graphx LLC · Est. 1999</div>
            <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: "1.3rem", fontWeight: 500, color: "#fff" }}>GovCon Ready <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>v2.1</span></div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2, marginBottom: 10 }}>Proposal intelligence · Strategy layer</div>
          </div>
          <button style={{ background: "#2A5BD7", color: "#fff", border: "2px solid #4A7AFF", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>+ Add Opportunity</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingBottom: 10 }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Active:</span>
          <select style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 9px", fontSize: 12, color: "#fff", cursor: "pointer", flex: 1, maxWidth: 300 }} value={activeId} onChange={(e) => setActiveId(parseInt(e.target.value))}>
            {bids.map((b) => <option key={b.id} value={b.id}>{b.name} · {b.agency}</option>)}
          </select>
          <span style={{ background: activeStatus.bg, color: activeStatus.color, fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 20 }}>{activeOpp.status}</span>
        </div>
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.15)", overflowX: "auto", gap: 0 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`gcr-nb${curTab === t.id ? " on" : ""}`} style={navBtn(curTab === t.id)} onClick={() => setCurTab(t.id)}>
              {t.icon ? <span style={{ color: "#fff", fontSize: 8 }}>{t.icon}</span> : <span style={{ color: "#EF9F27", fontSize: 8, fontWeight: 600 }}>{t.num}</span>}
              <span style={{ color: "#fff" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "18px 20px", background: "var(--color-background-tertiary, #f4f3ef)", minHeight: 500 }}>
        {curTab === "overview" && renderOverview()}
        {curTab === "eval" && renderEval()}
        {curTab === "naics" && renderNAICS()}
        {curTab === "partner" && renderPartner()}
        {curTab === "gonogo" && renderGoNoGo()}
        {curTab === "pipeline" && renderPipeline()}
        {curTab === "shred" && renderShred()}
      </div>
    </div>
  );
}
