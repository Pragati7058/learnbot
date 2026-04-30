import { useState, useEffect } from "react";

const TOPICS = [
  { name: "Data Structures", pct: 82, trend: "+5%" },
  { name: "Algorithms", pct: 67, trend: "+12%" },
  { name: "OS Concepts", pct: 45, trend: "-3%" },
  { name: "Computer Networks", pct: 30, trend: "+8%" },
  { name: "Database Systems", pct: 58, trend: "+2%" },
];

const HEAT_DATA = [
  0.9, 0.1, 0.7, 0.5, 0.3, 0.8, 0.6, 0.2, 0.9, 0.4, 0.1, 0.7, 0.5, 0.8, 0.3, 0.6, 0.9,
  0.2, 0.4, 0.7, 0.1, 0.8, 0.5, 0.3, 0.9, 0.6, 0.2, 0.7, 0.4, 0.8, 0.1, 0.5, 0.9, 0.3, 0.6,
];

const FILTERS = [
  { key: "all", label: "All", dot: null },
  { key: "strong", label: "Strong", dot: "#1D9E75" },
  { key: "mid", label: "Medium", dot: "#378ADD" },
  { key: "weak", label: "Needs work", dot: "#E24B4A" },
];

function heatColor(v) {
  if (v > 0.75) return "#378ADD";
  if (v > 0.5) return "#85B7EB";
  if (v > 0.2) return "#B5D4F4";
  return "rgba(0,0,0,0.06)";
}

function barColor(pct) {
  if (pct >= 70) return "#1D9E75";
  if (pct >= 50) return "#378ADD";
  return "#E24B4A";
}

function StatCard({ value, label, sub, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", overflow: "hidden",
        background: "#fff",
        border: `0.5px solid ${hov ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.1)"}`,
        borderRadius: 12, padding: "16px 12px", textAlign: "center",
        cursor: "default",
        transform: hov ? "translateY(-3px)" : "none",
        transition: "transform .18s, border-color .18s",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: "12px 12px 0 0" }} />
      <div style={{ fontSize: 26, fontWeight: 500, color: accent, lineHeight: 1, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function HeatCell({ val, index }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", aspectRatio: "1" }}>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          width: "100%", height: "100%", borderRadius: 4,
          background: heatColor(val), cursor: "pointer",
          transform: show ? "scale(1.35)" : "scale(1)",
          transition: "transform .1s",
          position: "relative", zIndex: show ? 5 : 1,
        }}
      />
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 7px)", left: "50%",
          transform: "translateX(-50%)",
          background: "#1e293b", color: "#f1f5f9",
          fontSize: 10, padding: "4px 8px", borderRadius: 6,
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 20,
        }}>
          Day {index + 1} · {Math.round(val * 8)}h
        </div>
      )}
    </div>
  );
}

function TopicRow({ topic, onStudy }) {
  const [mounted, setMounted] = useState(false);
  const [hov, setHov] = useState(false);
  const color = barColor(topic.pct);
  const trendUp = topic.trend.startsWith("+");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          onClick={() => onStudy?.(topic)}
          style={{ fontSize: 12, color: hov ? "#0f172a" : "#64748b", cursor: "pointer", transition: "color .15s" }}
        >
          {topic.name}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color }}>{topic.pct}%</span>
          <span style={{ fontSize: 10, color: trendUp ? "#1D9E75" : "#E24B4A" }}>{topic.trend}</span>
        </span>
      </div>
      <div
        onClick={() => onStudy?.(topic)}
        style={{ height: 7, borderRadius: 4, background: "rgba(0,0,0,0.07)", overflow: "hidden", cursor: "pointer" }}
      >
        <div style={{
          height: "100%", borderRadius: 4, background: color,
          width: mounted ? `${topic.pct}%` : "0%",
          transition: "width .7s cubic-bezier(.34,1.2,.64,1)",
        }} />
      </div>
    </div>
  );
}

export default function AnalyticsPanel({ onStudyTopic }) {
  const [filter, setFilter] = useState("all");

  const filtered = TOPICS.filter(t =>
    filter === "strong" ? t.pct >= 70 :
      filter === "mid" ? t.pct >= 50 && t.pct < 70 :
        filter === "weak" ? t.pct < 50 : true
  );

  const sCard = { background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "16px 18px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        <StatCard value="42h" label="Study hours" sub="this month" accent="#378ADD" />
        <StatCard value="318" label="Cards done" sub="this month" accent="#1D9E75" />
        <StatCard value="74%" label="Exam ready" sub="predicted score" accent="#BA7517" />
      </div>

      <div style={sCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase" }}>Activity — last 35 days</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(0,0,0,0.04)", color: "#94a3b8", border: "0.5px solid rgba(0,0,0,0.08)" }}>5 weeks</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 12 }}>
          {HEAT_DATA.map((v, i) => <HeatCell key={i} val={v} index={i} />)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>Less</span>
          {[0.05, 0.3, 0.6, 1].map((o, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: 2, background: heatColor(o), border: o === 0.05 ? "0.5px solid rgba(0,0,0,0.1)" : "none" }} />
          ))}
          <span style={{ fontSize: 10, color: "#94a3b8" }}>More</span>
        </div>
      </div>

      <div style={sCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase" }}>Topic mastery</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(0,0,0,0.04)", color: "#94a3b8", border: "0.5px solid rgba(0,0,0,0.08)" }}>
            {filtered.length} topic{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: filter === f.key ? "rgba(0,0,0,0.05)" : "transparent",
                border: `0.5px solid ${filter === f.key ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.1)"}`,
                borderRadius: 20, padding: "4px 12px", fontSize: 11,
                color: filter === f.key ? "#0f172a" : "#64748b",
                cursor: "pointer", transition: "all .15s",
              }}
            >
              {f.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.dot, flexShrink: 0 }} />}
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0
          ? <div style={{ fontSize: 12, color: "#94a3b8", padding: "8px 0" }}>No topics in this range</div>
          : filtered.map(t => <TopicRow key={t.name} topic={t} onStudy={onStudyTopic} />)
        }

        <button
          onClick={() => onStudyTopic?.({ name: "recommendation" })}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#0f172a"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          style={{
            marginTop: 14, width: "100%", background: "transparent",
            border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 8,
            padding: "8px 14px", fontSize: 12, color: "#64748b",
            cursor: "pointer", transition: "all .15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          Which topic should I prioritise? ↗
        </button>
      </div>
    </div>
  );
}