import { useState, useMemo } from "react";

// ── SAMPLE DATA ────────────────────────────────────────────────────────────
const INITIAL_BIDS = [
  {
    id: 1, name: "GSA Design Services IDIQ", agency: "GSA", naics: "541430",
    setAside: "WOSB", value: 850000, pwin: 0.18, strategic: 1.3, difficulty: 0.9,
    status: "Capture", dueDate: "2026-06-15", notes: "Strong fit — design + brand services"
  },
  {
    id: 2, name: "DHS UX Research Support", agency: "DHS", naics: "541511",
    setAside: "SB", value: 1200000, pwin: 0.12, strategic: 1.2, difficulty: 1.1,
    status: "RFP Review", dueDate: "2026-05-01", notes: "Incumbent unknown — research needed"
  },
  {
    id: 3, name: "HHS Communication Design", agency: "HHS", naics: "541430",
    setAside: "WOSB", value: 620000, pwin: 0.22, strategic: 1.0, difficulty: 0.8,
    status: "Writing", dueDate: "2026-04-20", notes: "Health communication — strong past perf angle"
  },
  {
    id: 4, name: "DoD Training Materials", agency: "DoD", naics: "611430",
    setAside: "Full & Open", value: 3200000, pwin: 0.08, strategic: 1.5, difficulty: 1.4,
    status: "Evaluating", dueDate: "2026-07-30", notes: "Large — teaming partner required"
  },
  {
    id: 5, name: "VA Brand Identity System", agency: "VA", naics: "541430",
    setAside: "SDVOSB", value: 480000, pwin: 0.15, strategic: 1.1, difficulty: 0.85,
    status: "No-Bid", dueDate: "2026-04-10", notes: "Set-aside mismatch — SDVOSB required"
  },
];

const STATUS_ORDER = ["Evaluating", "Capture", "RFP Review", "Writing", "Submitted", "Won", "No-Bid"];
const STATUS_COLORS = {
  "Evaluating":  { bg: "#EEF2FC", text: "#2A5BD7", dot: "#2A5BD7" },
  "Capture":     { bg: "#FFF8ED", text: "#7A4A00", dot: "#B8860B" },
  "RFP Review":  { bg: "#F0F9FF", text: "#0369A1", dot: "#0EA5E9" },
  "Writing":     { bg: "#F0FDF4", text: "#166534", dot: "#22C55E" },
  "Submitted":   { bg: "#FAF5FF", text: "#6B21A8", dot: "#A855F7" },
  "Won":         { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  "No-Bid":      { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
};

const SET_ASIDE_OPTIONS = ["WOSB","SDVOSB","8(a)","HUBZone","SB","Full & Open"];
const AGENCY_OPTIONS = ["GSA","DHS","HHS","DoD","VA","DoE","DoT","DoJ","State","Other"];

// ── MATH ──────────────────────────────────────────────────────────────────
const calcEV     = (b) => b.pwin * b.value * 0.15; // 15% profit margin
const calcROI    = (b) => calcEV(b) * b.strategic / b.difficulty;
const fmtCurrency = (n) => n >= 1000000
  ? `$${(n/1000000).toFixed(2)}M`
  : `$${(n/1000).toFixed(0)}K`;
const fmtROI = (n) => n >= 1000000
  ? `$${(n/1000000).toFixed(2)}M`
  : `$${(n/1000).toFixed(1)}K`;

// ── MINI BAR ──────────────────────────────────────────────────────────────
function MiniBar({ value, max, color = "#2A5BD7" }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{
        flex: 1, height: 6, background: "#E2E0D8",
        borderRadius: 3, overflow: "hidden"
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color, borderRadius: 3,
          transition: "width 0.5s ease"
        }} />
      </div>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = "#2A5BD7" }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E0D8",
      borderRadius: 10, padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 4
    }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "#8C8A82", marginBottom: 2
      }}>{label}</div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "2rem", fontWeight: 600, color: accent, lineHeight: 1
      }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#8C8A82", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── PWIN DIAL ─────────────────────────────────────────────────────────────
function PwinDial({ pwin }) {
  const pct = pwin * 100;
  const color = pwin >= 0.2 ? "#22C55E" : pwin >= 0.12 ? "#B8860B" : "#EF4444";
  const r = 18; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <circle cx={24} cy={24} r={r} fill="none" stroke="#E2E0D8" strokeWidth={4} />
      <circle cx={24} cy={24} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 24 24)" style={{ transition: "stroke-dasharray 0.5s ease" }} />
      <text x={24} y={28} textAnchor="middle"
        style={{ fontSize: 11, fontWeight: 600, fill: color, fontFamily: "'DM Mono', monospace" }}>
        {pct.toFixed(0)}%
      </text>
    </svg>
  );
}

// ── BID ROW ───────────────────────────────────────────────────────────────
function BidRow({ bid, maxROI, onEdit, onDelete }) {
  const ev  = calcEV(bid);
  const roi = calcROI(bid);
  const sc  = STATUS_COLORS[bid.status] || STATUS_COLORS["Evaluating"];
  const overdue = bid.dueDate && new Date(bid.dueDate) < new Date() && bid.status !== "Won" && bid.status !== "No-Bid";

  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E0D8",
      borderRadius: 10, padding: "18px 20px",
      display: "grid",
      gridTemplateColumns: "48px 1fr 90px 100px 110px 110px 80px",
      alignItems: "center", gap: 16,
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <PwinDial pwin={bid.pwin} />

      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#1C1B18", marginBottom: 2 }}>{bid.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#8C8A82" }}>{bid.agency}</span>
          <span style={{
            fontFamily: "'DM Mono',monospace", fontSize: 9,
            background: "#EEECEA", color: "#5A5850",
            padding: "2px 6px", borderRadius: 3
          }}>{bid.setAside}</span>
          {overdue && <span style={{ fontSize: 10, color: "#EF4444", fontWeight: 500 }}>⚠ Past due</span>}
        </div>
        {bid.notes && <div style={{ fontSize: 12, color: "#8C8A82", marginTop: 4 }}>{bid.notes}</div>}
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 15, fontWeight: 600 }}>{fmtCurrency(bid.value)}</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize: 10, color: "#8C8A82" }}>contract</div>
      </div>

      <div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 14, fontWeight: 600, color: "#2A5BD7" }}>{fmtROI(ev)}</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize: 10, color: "#8C8A82", marginBottom: 4 }}>E[V]</div>
        <MiniBar value={ev} max={50000} color="#2A5BD7" />
      </div>

      <div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 14, fontWeight: 600, color: "#22C55E" }}>{fmtROI(roi)}</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize: 10, color: "#8C8A82", marginBottom: 4 }}>ROI</div>
        <MiniBar value={roi} max={maxROI} color="#22C55E" />
      </div>

      <div style={{ textAlign: "center" }}>
        <span style={{
          background: sc.bg, color: sc.text,
          fontSize: 11, fontWeight: 500,
          padding: "4px 10px", borderRadius: 20,
          display: "inline-flex", alignItems: "center", gap: 5
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
          {bid.status}
        </span>
        {bid.dueDate && (
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize: 10, color: overdue ? "#EF4444" : "#8C8A82", marginTop: 4 }}>
            {new Date(bid.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <button onClick={() => onEdit(bid)} style={{
          background: "none", border: "1px solid #E2E0D8",
          borderRadius: 6, padding: "5px 10px", cursor: "pointer",
          fontSize: 11, color: "#5A5850", fontFamily: "'DM Sans',sans-serif"
        }}>Edit</button>
        <button onClick={() => onDelete(bid.id)} style={{
          background: "none", border: "1px solid #E2E0D8",
          borderRadius: 6, padding: "5px 8px", cursor: "pointer",
          fontSize: 11, color: "#EF4444"
        }}>×</button>
      </div>
    </div>
  );
}

// ── BID FORM MODAL ────────────────────────────────────────────────────────
function BidModal({ bid, onSave, onClose }) {
  const [form, setForm] = useState(bid || {
    name:"", agency:"GSA", naics:"541430", setAside:"WOSB",
    value:500000, pwin:0.15, strategic:1.0, difficulty:1.0,
    status:"Evaluating", dueDate:"", notes:""
  });
  const set = (k,v) => setForm(f => ({...f, [k]: v}));

  const inputStyle = {
    fontFamily: "'DM Sans',sans-serif", fontSize: 13,
    border: "1px solid #C8C5BA", borderRadius: 6,
    padding: "8px 12px", width: "100%", outline: "none",
    color: "#1C1B18", background: "#fff"
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 500, color: "#5A5850",
    fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em",
    textTransform:"uppercase", marginBottom: 4, display:"block"
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(28,27,24,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 24
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: 32,
        width: "100%", maxWidth: 560, maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 8px 40px rgba(0,0,0,0.2)"
      }}>
        <div style={{
          fontFamily: "'Playfair Display',serif", fontSize: "1.4rem",
          fontWeight: 600, marginBottom: 24, color: "#1C1B18"
        }}>{bid ? "Edit Bid Opportunity" : "Add Bid Opportunity"}</div>

        <div style={{ display: "grid", gap: 16 }}>
          <div><label style={labelStyle}>Opportunity Name *</label>
            <input style={inputStyle} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. GSA Design Services IDIQ" /></div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={labelStyle}>Agency</label>
              <select style={inputStyle} value={form.agency} onChange={e=>set("agency",e.target.value)}>
                {AGENCY_OPTIONS.map(a=><option key={a}>{a}</option>)}
              </select></div>
            <div><label style={labelStyle}>Set-Aside</label>
              <select style={inputStyle} value={form.setAside} onChange={e=>set("setAside",e.target.value)}>
                {SET_ASIDE_OPTIONS.map(s=><option key={s}>{s}</option>)}
              </select></div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={labelStyle}>Contract Value ($)</label>
              <input style={inputStyle} type="number" value={form.value} onChange={e=>set("value",+e.target.value)} /></div>
            <div><label style={labelStyle}>Pwin (0.01 – 0.30)</label>
              <input style={inputStyle} type="number" step="0.01" min="0.01" max="0.30" value={form.pwin} onChange={e=>set("pwin",+e.target.value)} /></div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={labelStyle}>Strategic Multiplier (0.8–2.0)</label>
              <input style={inputStyle} type="number" step="0.1" min="0.8" max="2.0" value={form.strategic} onChange={e=>set("strategic",+e.target.value)} /></div>
            <div><label style={labelStyle}>Difficulty Scalar (0.7–1.5)</label>
              <input style={inputStyle} type="number" step="0.05" min="0.7" max="1.5" value={form.difficulty} onChange={e=>set("difficulty",+e.target.value)} /></div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e=>set("status",e.target.value)}>
                {STATUS_ORDER.map(s=><option key={s}>{s}</option>)}
              </select></div>
            <div><label style={labelStyle}>Due Date</label>
              <input style={inputStyle} type="date" value={form.dueDate} onChange={e=>set("dueDate",e.target.value)} /></div>
          </div>

          <div><label style={labelStyle}>NAICS Code</label>
            <input style={inputStyle} value={form.naics} onChange={e=>set("naics",e.target.value)} placeholder="e.g. 541430" /></div>

          <div><label style={labelStyle}>Notes</label>
            <textarea style={{...inputStyle, resize:"vertical", minHeight:64}} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Capture intelligence, teaming notes, risks..." /></div>
        </div>

        {/* Live ROI Preview */}
        <div style={{
          background: "#F4F3EF", border: "1px solid #E2E0D8",
          borderRadius: 8, padding: "14px 16px", marginTop: 20,
          display: "grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12
        }}>
          {[
            ["E[V]", fmtROI(form.pwin * form.value * 0.15 * form.strategic)],
            ["ROI Index", fmtROI((form.pwin * form.value * 0.15 * form.strategic) / form.difficulty)],
            ["Pwin", `${(form.pwin*100).toFixed(0)}%`],
          ].map(([l,v])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"#8C8A82" }}>{l}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:600, color:"#2A5BD7" }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:24 }}>
          <button onClick={onClose} style={{
            background:"#fff", border:"1px solid #C8C5BA", borderRadius:6,
            padding:"10px 20px", cursor:"pointer", fontSize:13,
            fontFamily:"'DM Sans',sans-serif", color:"#5A5850"
          }}>Cancel</button>
          <button onClick={() => { if(!form.name.trim()){alert("Please add a name.");return;} onSave(form); }} style={{
            background:"#2A5BD7", color:"#fff", border:"none",
            borderRadius:6, padding:"10px 24px", cursor:"pointer",
            fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif"
          }}>Save Opportunity</button>
        </div>
      </div>
    </div>
  );
}

// ── PIPELINE CHART ────────────────────────────────────────────────────────
function PipelineChart({ bids }) {
  const stages = STATUS_ORDER.filter(s => s !== "No-Bid" && s !== "Won");
  const maxVal = Math.max(...stages.map(s => bids.filter(b=>b.status===s).reduce((a,b)=>a+b.value,0)), 1);

  return (
    <div style={{
      background:"#fff", border:"1px solid #E2E0D8",
      borderRadius:10, padding:"24px 28px"
    }}>
      <div style={{
        fontFamily:"'DM Mono',monospace", fontSize:10,
        letterSpacing:"0.14em", textTransform:"uppercase",
        color:"#8C8A82", marginBottom:20
      }}>Pipeline by Stage — Total Contract Value</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {stages.map(stage => {
          const stageBids = bids.filter(b=>b.status===stage);
          const total = stageBids.reduce((a,b)=>a+b.value,0);
          const pct = (total/maxVal)*100;
          const sc = STATUS_COLORS[stage];
          return (
            <div key={stage} style={{ display:"grid", gridTemplateColumns:"100px 1fr 80px", alignItems:"center", gap:12 }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#5A5850", textAlign:"right" }}>{stage}</div>
              <div style={{ background:"#F4F3EF", borderRadius:4, height:24, overflow:"hidden", position:"relative" }}>
                <div style={{
                  width:`${pct}%`, height:"100%",
                  background: sc.dot, borderRadius:4,
                  transition:"width 0.6s ease",
                  display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:8
                }}>
                  {pct > 15 && <span style={{ fontSize:10, color:"#fff", fontWeight:600 }}>{stageBids.length}</span>}
                </div>
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:600, color:"#1C1B18" }}>
                {total > 0 ? fmtCurrency(total) : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────
export default function GovConPipeline() {
  const [bids, setBids] = useState(INITIAL_BIDS);
  const [modal, setModal] = useState(null); // null | "add" | bid object
  const [sortBy, setSortBy] = useState("roi");
  const [filterStatus, setFilterStatus] = useState("All");
  const [nextId, setNextId] = useState(INITIAL_BIDS.length + 1);

  const maxROI = useMemo(() => Math.max(...bids.map(calcROI), 1), [bids]);

  const sorted = useMemo(() => {
    let list = filterStatus === "All" ? bids : bids.filter(b => b.status === filterStatus);
    return [...list].sort((a,b) => {
      if (sortBy === "roi")   return calcROI(b) - calcROI(a);
      if (sortBy === "ev")    return calcEV(b) - calcEV(a);
      if (sortBy === "value") return b.value - a.value;
      if (sortBy === "pwin")  return b.pwin - a.pwin;
      if (sortBy === "due")   return (a.dueDate||"9999") < (b.dueDate||"9999") ? -1 : 1;
      return 0;
    });
  }, [bids, sortBy, filterStatus]);

  const activeBids  = bids.filter(b => b.status !== "No-Bid" && b.status !== "Won");
  const totalPipeline = activeBids.reduce((a,b) => a+b.value, 0);
  const totalEV     = activeBids.reduce((a,b) => a+calcEV(b), 0);
  const topROI      = [...bids].sort((a,b)=>calcROI(b)-calcROI(a))[0];
  const wonBids     = bids.filter(b=>b.status==="Won");

  const handleSave = (form) => {
    if (modal === "add") {
      setBids(bs => [...bs, { ...form, id: nextId }]);
      setNextId(n => n+1);
    } else {
      setBids(bs => bs.map(b => b.id === modal.id ? { ...form, id: modal.id } : b));
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (confirm("Remove this bid opportunity?")) setBids(bs => bs.filter(b=>b.id!==id));
  };

  const btnStyle = (active) => ({
    fontFamily: "'DM Mono',monospace", fontSize:10,
    letterSpacing:"0.08em", textTransform:"uppercase",
    border: `1px solid ${active ? "#2A5BD7" : "#C8C5BA"}`,
    background: active ? "#EEF2FC" : "#fff",
    color: active ? "#2A5BD7" : "#5A5850",
    borderRadius:6, padding:"6px 12px", cursor:"pointer"
  });

  return (
    <div style={{
      minHeight:"100vh", background:"#F4F3EF",
      fontFamily:"'DM Sans',sans-serif",
      padding:"0 0 60px"
    }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* HEADER */}
      <div style={{
        background:"#1C1B18", color:"#fff",
        padding:"28px 40px 24px"
      }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{
            fontFamily:"'DM Mono',monospace", fontSize:10,
            letterSpacing:"0.16em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.4)", marginBottom:8
          }}>Team Design Studios · Eternal Graphx LLC</div>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={{
                fontFamily:"'Playfair Display',serif",
                fontSize:"clamp(1.6rem,4vw,2.4rem)",
                fontWeight:600, lineHeight:1.1,
                margin:"0 0 6px"
              }}>GovCon Pipeline Tracker</h1>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>
                Visualize bid opportunities · Pwin · ROI · Pipeline value
              </div>
            </div>
            <button onClick={() => setModal("add")} style={{
              background:"#2A5BD7", color:"#fff",
              border:"none", borderRadius:8,
              padding:"12px 24px", cursor:"pointer",
              fontSize:13, fontWeight:500,
              fontFamily:"'DM Sans',sans-serif",
              whiteSpace:"nowrap"
            }}>+ Add Opportunity</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px 0" }}>

        {/* STAT CARDS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:24 }}>
          <StatCard label="Active Pipeline" value={fmtCurrency(totalPipeline)} sub={`${activeBids.length} opportunities`} accent="#1C1B18" />
          <StatCard label="Total E[V]" value={fmtROI(totalEV)} sub="Expected value @ 15% margin" accent="#2A5BD7" />
          <StatCard label="Top ROI Bid" value={topROI ? topROI.name.split(" ").slice(0,2).join(" ") : "—"} sub={topROI ? fmtROI(calcROI(topROI)) : ""} accent="#22C55E" />
          <StatCard label="Won" value={wonBids.length} sub={wonBids.length > 0 ? fmtCurrency(wonBids.reduce((a,b)=>a+b.value,0)) : "Keep bidding"} accent="#B8860B" />
        </div>

        {/* PIPELINE CHART */}
        <div style={{ marginBottom:24 }}>
          <PipelineChart bids={bids} />
        </div>

        {/* CONTROLS */}
        <div style={{
          display:"flex", gap:12, alignItems:"center",
          flexWrap:"wrap", marginBottom:16
        }}>
          <div style={{
            fontFamily:"'DM Mono',monospace", fontSize:10,
            letterSpacing:"0.1em", textTransform:"uppercase",
            color:"#8C8A82", marginRight:4
          }}>Sort:</div>
          {[["roi","ROI"],["ev","E[V]"],["value","Value"],["pwin","Pwin"],["due","Due"]].map(([k,l])=>(
            <button key={k} style={btnStyle(sortBy===k)} onClick={()=>setSortBy(k)}>{l}</button>
          ))}
          <div style={{ flex:1 }} />
          <div style={{
            fontFamily:"'DM Mono',monospace", fontSize:10,
            letterSpacing:"0.1em", textTransform:"uppercase",
            color:"#8C8A82", marginRight:4
          }}>Filter:</div>
          {["All",...STATUS_ORDER].map(s=>(
            <button key={s} style={btnStyle(filterStatus===s)} onClick={()=>setFilterStatus(s)}>{s}</button>
          ))}
        </div>

        {/* BID LIST */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* Column headers */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"48px 1fr 90px 100px 110px 110px 80px",
            gap:16, padding:"0 20px",
          }}>
            {["Pwin","Opportunity","Value","E[V]","ROI","Status",""].map((h,i)=>(
              <div key={i} style={{
                fontFamily:"'DM Mono',monospace", fontSize:9,
                letterSpacing:"0.12em", textTransform:"uppercase",
                color:"#8C8A82", textAlign: i>=2 ? "left":"left"
              }}>{h}</div>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div style={{
              background:"#fff", border:"1px solid #E2E0D8",
              borderRadius:10, padding:"40px", textAlign:"center",
              color:"#8C8A82", fontSize:14
            }}>No opportunities match this filter. Add one above.</div>
          ) : sorted.map(bid => (
            <BidRow
              key={bid.id} bid={bid}
              maxROI={maxROI}
              onEdit={b => setModal(b)}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* MATH LEGEND */}
        <div style={{
          marginTop:32, background:"#fff",
          border:"1px solid #E2E0D8", borderRadius:10,
          padding:"20px 24px"
        }}>
          <div style={{
            fontFamily:"'DM Mono',monospace", fontSize:10,
            letterSpacing:"0.14em", textTransform:"uppercase",
            color:"#8C8A82", marginBottom:12
          }}>How the Math Works</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
            {[
              ["E[V] — Expected Value", "Pwin × Contract Value × 15% margin. The revenue you can expect to earn from this bid, weighted by your probability of winning."],
              ["ROI Index", "E[V] × Strategic Multiplier ÷ Difficulty Scalar. Accounts for the real cost and strategic value of pursuing each bid. Higher is better."],
              ["Strategic Multiplier", "1.0 = standard return. Apply 1.1–1.5 for bids that open new agencies, build past performance, or unlock future opportunities."],
              ["Difficulty Scalar", "1.0 = typical bid effort. Reduce to 0.8 for easy re-competes. Increase to 1.4+ for new agencies, complex volumes, or large teams required."],
            ].map(([t,d])=>(
              <div key={t}>
                <div style={{ fontWeight:500, fontSize:12, color:"#1C1B18", marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:12, color:"#8C8A82", lineHeight:1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL */}
      {modal && <BidModal bid={modal === "add" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  );
}
