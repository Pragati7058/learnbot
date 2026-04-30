import { useState, useEffect, useRef } from "react";

/* ── data ─────────────────────────────────── */
const BADGES = [
  { ic: "🎯", nm: "First Chat", on: true, tip: "Journey started" },
  { ic: "🔥", nm: "7-Day Streak", on: true, tip: "7 days non-stop" },
  { ic: "🧠", nm: "Quiz Ace", on: true, tip: "Aced every quiz" },
  { ic: "📚", nm: "Note Taker", on: true, tip: "Master note-taker" },
  { ic: "⚡", nm: "Speed Learner", on: false, tip: "5 lessons in 1h" },
  { ic: "🏅", nm: "Top 10", on: false, tip: "Reach global top 10" },
  { ic: "💎", nm: "Diamond", on: false, tip: "100-day streak" },
  { ic: "🌟", nm: "Master", on: false, tip: "Hit level 10" },
];
const DATA = [40, 65, 30, 80, 55, 90, 70];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const AVS = ["⚙️", "🚀", "💫", "🔮", "🎮", "✨", "🦊", "🐉"];

/* ── design tokens ────────────────────────── */
const T = {
  bg: "#07080f", bg2: "#0d0f1a", bg3: "#111425", dim: "#1e2235",
  p: "#a78bfa", p2: "#7c3aed", p3: "#4c1d95",
  cyan: "#06b6d4", green: "#10b981",
  white: "#f1f5f9", muted: "#64748b",
};
const MONO = "'JetBrains Mono', monospace";
const SANS = "'Outfit', sans-serif";

/* ── global styles injected once ─────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
@keyframes orb{from{transform:translate(0,0)}to{transform:translate(80px,60px)}}
@keyframes spin-slow{to{transform:rotate(360deg)}}
@keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)}50%{box-shadow:0 0 0 5px rgba(16,185,129,0)}}
@keyframes sweep{0%{left:-100%}100%{left:200%}}
@keyframes popIn{0%{transform:scale(0.7) rotate(-180deg);opacity:0}60%{transform:scale(1.3) rotate(15deg)}100%{transform:scale(1) rotate(0);opacity:1}}
`;

/* ── helpers ──────────────────────────────── */
function useCountUp(target, delay = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0;
      const step = Math.max(1, Math.ceil(target / 30));
      const iv = setInterval(() => { c = Math.min(c + step, target); setV(c); if (c >= target) clearInterval(iv); }, 45);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return v;
}

/* ── sub-components ───────────────────────── */
function Toast({ msg }) {
  return (
    <div style={{
      position: "absolute", bottom: 16, left: "50%",
      transform: msg ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(14px)",
      opacity: msg ? 1 : 0, transition: "all 0.25s",
      background: "rgba(7,8,15,0.95)", color: "#c4b5fd",
      fontSize: 12, fontWeight: 600, fontFamily: MONO,
      padding: "9px 20px", borderRadius: 24, letterSpacing: "0.3px",
      border: "1px solid rgba(167,139,250,0.3)", whiteSpace: "nowrap",
      pointerEvents: "none", zIndex: 100,
    }}>{msg}</div>
  );
}

function Avatar({ avIdx, onCycle }) {
  const [animKey, setAnimKey] = useState(0);
  const handleClick = () => { setAnimKey(k => k + 1); onCycle(); };
  return (
    <div onClick={handleClick} title="Click to change vibe"
      style={{
        width: 62, height: 62, borderRadius: "50%", padding: 2, flexShrink: 0,
        cursor: "pointer", position: "relative",
        background: `conic-gradient(from 0deg,${T.p},${T.cyan},${T.green},${T.p})`,
        animation: "spin-slow 4s linear infinite",
      }}
      onMouseEnter={e => e.currentTarget.style.animationPlayState = "paused"}
      onMouseLeave={e => e.currentTarget.style.animationPlayState = "running"}>
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: T.bg2, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <span key={animKey} style={{ fontSize: 24, animation: animKey ? "popIn 0.4s ease both" : "none" }}>
          {AVS[avIdx]}
        </span>
        <div style={{
          position: "absolute", bottom: 1, right: 1, width: 13, height: 13,
          borderRadius: "50%", background: T.green,
          border: `2px solid ${T.bg2}`, animation: "pulse-dot 2s infinite",
        }} />
      </div>
    </div>
  );
}

function XPBar({ pct }) {
  const [width, setWidth] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      setWidth(pct);
      let c = 0;
      const iv = setInterval(() => { c = Math.min(c + 2, pct); setDisplayed(c); if (c >= pct) clearInterval(iv); }, 22);
      return () => clearInterval(iv);
    }, 300);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ fontSize: 11, color: T.muted, letterSpacing: "0.5px" }}>Progress to Expert</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: T.p, fontWeight: 700 }}>{displayed}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%", borderRadius: 4, position: "relative", overflow: "hidden",
          background: `linear-gradient(90deg,${T.p2},${T.p},${T.cyan})`,
          width: `${width}%`, transition: "width 1.5s cubic-bezier(.22,1,.36,1)",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%",
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
            animation: "sweep 2.5s 1.8s ease-in-out infinite",
          }} />
        </div>
      </div>
      <div style={{ fontSize: 10, color: T.muted, textAlign: "right", marginTop: 5, fontFamily: MONO }}>
        2,340 / 3,000 XP
      </div>
    </div>
  );
}

function StatCard({ ic, val, lbl, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.bg2, border: `1px solid ${hov ? "rgba(167,139,250,0.35)" : T.dim}`,
        borderRadius: 14, padding: "14px 8px", textAlign: "center",
        cursor: "pointer", transition: "all 0.25s", position: "relative", overflow: "hidden",
        transform: hov ? "translateY(-4px)" : "none",
      }}>
      {hov && <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,${T.p2},${T.p})`
      }} />}
      <span style={{ fontSize: 18, marginBottom: 6, display: "block" }}>{ic}</span>
      <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: T.white, lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 9, color: T.muted, marginTop: 5, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>{lbl}</div>
    </div>
  );
}

function BadgeGrid({ onToast }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
      {BADGES.map(b => <BadgeItem key={b.nm} b={b} onToast={onToast} />)}
    </div>
  );
}

function BadgeItem({ b, onToast }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => {
        onToast(b.on ? `${b.ic} ${b.nm} unlocked!` : `🔒 ${b.nm}: ${b.tip}`);
      }}
      style={{
        borderRadius: 14, cursor: "pointer", transition: "all 0.22s",
        border: `1px solid ${b.on && hov ? "rgba(167,139,250,0.6)" : b.on ? "rgba(167,139,250,0.3)" : T.dim}`,
        background: b.on ? "linear-gradient(145deg,#13102a,#0f0d1f)" : T.bg2,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 5, padding: "13px 4px",
        filter: b.on ? "none" : "grayscale(1) brightness(0.4)",
        opacity: b.on ? 1 : 0.25,
        transform: b.on && hov ? "translateY(-5px) scale(1.06)" : "scale(1)",
        position: "relative", overflow: "hidden",
        boxShadow: b.on && hov ? "0 12px 32px rgba(124,58,237,0.3)" : "none",
      }}>
      {/* inner glow */}
      {b.on && hov && <div style={{
        position: "absolute", inset: 0, borderRadius: 14,
        background: "radial-gradient(circle at 50% 50%,rgba(167,139,250,0.15),transparent 70%)"
      }} />}
      {/* tooltip */}
      {hov && <div style={{
        position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
        background: "#0a0b14", color: "#c4b5fd", fontSize: 10, fontWeight: 600,
        padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(167,139,250,0.25)",
        whiteSpace: "nowrap", zIndex: 30, fontFamily: SANS,
      }}>{b.tip}</div>}
      <span style={{
        fontSize: 22, lineHeight: 1, display: "block",
        transform: b.on && hov ? "scale(1.3) rotate(-12deg)" : "scale(1)",
        transition: "transform 0.25s"
      }}>{b.ic}</span>
      <div style={{
        fontSize: "7.5px", color: b.on ? "#a78bfa" : T.muted,
        textAlign: "center", lineHeight: 1.3, fontWeight: 600, letterSpacing: "0.3px"
      }}>{b.nm}</div>
    </div>
  );
}

function BarChart({ onToast }) {
  const [selDay, setSelDay] = useState(6);
  const [heights, setHeights] = useState(DATA.map(() => 0));
  const [wxp, setWxp] = useState(0);

  useEffect(() => {
    DATA.forEach((h, i) => {
      setTimeout(() => {
        setHeights(prev => { const n = [...prev]; n[i] = Math.round(h / 100 * 64); return n; });
      }, 280 + i * 70);
    });
    const tot = DATA.reduce((a, v) => a + v * 4, 0);
    let wx = 0;
    const wi = setInterval(() => { wx = Math.min(wx + Math.ceil(tot / 20), tot); setWxp(wx); if (wx >= tot) clearInterval(wi); }, 36);
    return () => clearInterval(wi);
  }, []);

  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.dim}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: T.white }}>+{wxp} XP</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 3, letterSpacing: "0.3px" }}>earned this week</div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 600, padding: "5px 11px", borderRadius: 20,
          background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
          color: "#34d399", letterSpacing: "0.3px"
        }}>↑ 18% vs last week</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 64, marginBottom: 8 }}>
        {DATA.map((h, i) => {
          const active = selDay === i;
          return (
            <div key={i} onClick={() => { setSelDay(i); onToast(`${DAYS[i]}: +${h * 4} XP`); }}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                cursor: "pointer", position: "relative"
              }}>
              {active && <div style={{
                position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                fontFamily: MONO, fontSize: 9, color: T.p, whiteSpace: "nowrap", fontWeight: 700
              }}>+{h * 4}</div>}
              <div style={{
                width: "100%", borderRadius: "4px 4px 0 0", minHeight: 2, height: heights[i],
                transition: "height 0.8s cubic-bezier(.22,1,.36,1), background 0.22s",
                background: active ? `linear-gradient(180deg,${T.p},${T.p2})` : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.06)"}`,
                boxShadow: active ? "0 4px 16px rgba(124,58,237,0.4)" : "none",
              }} />
              <span style={{
                fontSize: 9, color: active ? T.p : T.muted,
                fontWeight: 600, letterSpacing: "0.5px"
              }}>{DAYS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityCard({ ic, val, lbl, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, background: T.bg2, border: `1px solid ${hov ? "rgba(167,139,250,0.3)" : T.dim}`,
        borderRadius: 14, padding: "14px 10px", cursor: "pointer",
        transition: "all 0.22s", display: "flex", flexDirection: "column", gap: 4,
        transform: hov ? "translateY(-3px)" : "none", position: "relative", overflow: "hidden",
      }}>
      {hov && <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,${T.p2},${T.p})`
      }} />}
      <span style={{ fontSize: 18, display: "block" }}>{ic}</span>
      <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: T.white }}>{val}</div>
      <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{lbl}</div>
    </div>
  );
}

/* ── main component ───────────────────────── */
export default function GamificationPanel() {
  const [avIdx, setAvIdx] = useState(0);
  const [toast, setToast] = useState("");
  const toastRef = useRef(null);

  const streak = useCountUp(7, 200);
  const quizzes = useCountUp(24, 350);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2500);
  };

  const cycleAv = () => {
    const next = (avIdx + 1) % AVS.length;
    setAvIdx(next);
    showToast("New vibe: " + AVS[next]);
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        fontFamily: SANS, background: T.bg, padding: 18, maxWidth: 420,
        margin: "0 auto", display: "flex", flexDirection: "column", gap: 14,
        position: "relative", minHeight: "100vh"
      }}>

        {/* animated grid bg */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(rgba(167,139,250,0.04) 1px,transparent 1px),
              linear-gradient(90deg,rgba(167,139,250,0.04) 1px,transparent 1px)`,
            backgroundSize: "32px 32px",
          }} />
          <div style={{
            position: "absolute", top: -200, left: -100, width: 400, height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 65%)",
            animation: "orb 8s ease-in-out infinite alternate",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Hero */}
          <div style={{
            borderRadius: 16, padding: 20, position: "relative", overflow: "hidden",
            border: "1px solid rgba(167,139,250,0.2)",
            background: "linear-gradient(135deg,#0d0f1a 0%,#111425 100%)",
          }}>
            <div style={{
              position: "absolute", top: -60, right: -60, width: 180, height: 180,
              borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.18),transparent 70%)", pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute", bottom: -40, left: -30, width: 120, height: 120,
              borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.1),transparent 70%)", pointerEvents: "none"
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <Avatar avIdx={avIdx} onCycle={cycleAv} />
              <div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, color: T.white, letterSpacing: "-0.5px" }}>Alex Engineer</div>
                <div style={{ fontSize: 12, color: T.p, marginTop: 2, letterSpacing: "0.5px" }}>Software Engineer · Engineer Tier</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>Member since Jan 2024</div>
              </div>
              <div style={{
                marginLeft: "auto", textAlign: "center", borderRadius: 12,
                padding: "10px 14px", background: "rgba(167,139,250,0.08)",
                border: "1px solid rgba(167,139,250,0.25)"
              }}>
                <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: T.p, lineHeight: 1 }}>03</div>
                <div style={{ fontSize: 9, color: T.muted, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 2 }}>Level</div>
              </div>
            </div>
            <XPBar pct={78} />
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            <StatCard ic="🔥" val={streak} lbl="Streak" onClick={() => showToast("🔥 On a 7-day roll!")} />
            <StatCard ic="🧠" val={quizzes} lbl="Quizzes" onClick={() => showToast("🧠 Quiz machine!")} />
            <StatCard ic="🏅" val="#42" lbl="Rank" onClick={() => showToast("🏅 Almost top 10!")} />
          </div>

          {/* Badges */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: T.muted, letterSpacing: "1.5px", textTransform: "uppercase" }}>Achievements</div>
              <span onClick={() => showToast("📋 Full gallery soon!")}
                style={{ fontSize: 11, color: T.p, cursor: "pointer" }}>View all →</span>
            </div>
            <BadgeGrid onToast={showToast} />
          </div>

          {/* Chart */}
          <BarChart onToast={showToast} />

          {/* Activity */}
          <div style={{ display: "flex", gap: 8 }}>
            <ActivityCard ic="📖" val={12} lbl="Lessons" onClick={() => showToast("📖 Last: Binary Trees")} />
            <ActivityCard ic="⏱" val="3.2h" lbl="Study time" onClick={() => showToast("⏱ Avg: 24 min/session")} />
            <ActivityCard ic="💡" val="91%" lbl="Accuracy" onClick={() => showToast("💡 Top 5% accuracy!")} />
          </div>

        </div>
        <Toast msg={toast} />
      </div>
    </>
  );
}