import { useState, useEffect, useRef } from "react";

const MODES = {
  focus:  { s: 25 * 60, label: "Focus session", color: "#534AB7", track: "#EEEDFE" },
  break:  { s:  5 * 60, label: "Short break",   color: "#1D9E75", track: "#E1F5EE" },
  long:   { s: 15 * 60, label: "Long break",    color: "#BA7517", track: "#FAEEDA" },
};

export default function Pomodoro({ onClose }) {
  const [mode, setMode]       = useState("focus");
  const [left, setLeft]       = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [focusMins, setFocusMins] = useState(0);
  const [topic, setTopic]     = useState("");
  const [dots, setDots]       = useState([]);
  const ivRef = useRef(null);
  const total = MODES[mode].s;

  useEffect(() => {
    if (!running) return;
    ivRef.current = setInterval(() => {
      setLeft(l => {
        if (l <= 1) { clearInterval(ivRef.current); onComplete(); return 0; }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(ivRef.current);
  }, [running, mode]);

  const onComplete = () => {
    setRunning(false);
    if (mode === "focus") {
      setSessions(s => s + 1);
      setFocusMins(m => m + Math.round(total / 60));
      setDots(d => [...d, { type: "focus", topic: topic || "General" }]);
      switchMode(sessions % 3 === 2 ? "long" : "break");
    } else {
      setDots(d => [...d, { type: "break" }]);
      switchMode("focus");
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setLeft(MODES[m].s);
    setRunning(false);
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const pct = left / total;
  const circ = 2 * Math.PI * 68;
  const cfg = MODES[mode];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#0a0c14", border:"1px solid rgba(255,255,255,0.08)", borderRadius:18, padding:28, width:320, textAlign:"center" }}>

        {/* Mode tabs */}
        <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:20 }}>
          {Object.entries(MODES).map(([k, v]) => (
            <button key={k} onClick={() => switchMode(k)}
              style={{ padding:"4px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer",
                background: mode===k ? cfg.track : "transparent",
                color: mode===k ? cfg.color : "#475569",
                border: `1px solid ${mode===k ? cfg.color+"66" : "rgba(255,255,255,0.07)"}` }}>
              {k==="focus"?"Focus":k==="break"?"Break":"Long break"}
            </button>
          ))}
        </div>

        {/* Ring */}
        <div style={{ position:"relative", width:160, height:160, margin:"0 auto 20px" }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="68" fill="none" strokeWidth="8" stroke={cfg.track} />
            <circle cx="80" cy="80" r="68" fill="none" strokeWidth="8" stroke={cfg.color}
              strokeLinecap="round" strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              transform="rotate(-90 80 80)" style={{ transition:"stroke-dashoffset 0.5s" }} />
          </svg>
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
            <div style={{ fontSize:32, fontWeight:700, color:"#f1f5f9" }}>{fmt(left)}</div>
            <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>{cfg.label}</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:14 }}>
          <button onClick={() => { setLeft(total); setRunning(false); }}
            style={{ padding:"8px 16px", borderRadius:8, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#64748b", fontSize:12, cursor:"pointer" }}>
            Reset
          </button>
          <button onClick={() => setRunning(r => !r)}
            style={{ padding:"8px 22px", borderRadius:8, background:cfg.track, border:`1px solid ${cfg.color}66`, color:cfg.color, fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {running ? "Pause" : left === total ? "Start" : "Resume"}
          </button>
        </div>

        {/* Topic input */}
        <input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="Topic (e.g. Data Structures)"
          style={{ width:"100%", padding:"7px 10px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", color:"#94a3b8", fontSize:12, outline:"none", marginBottom:16 }} />

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
          {[["Sessions", sessions], ["Focus", focusMins+"m"], ["Streak", sessions]].map(([l,v]) => (
            <div key={l} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"8px 4px" }}>
              <div style={{ fontSize:18, fontWeight:700, color:"#e2e8f0" }}>{v}</div>
              <div style={{ fontSize:10, color:"#475569" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Session dots */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center" }}>
          {dots.map((d, i) => (
            <div key={i} title={d.type==="focus" ? d.topic : "Break"}
              style={{ width:18, height:18, borderRadius:4,
                background: d.type==="focus" ? cfg.color : "#1D9E75" }} />
          ))}
        </div>
      </div>
    </div>
  );
}