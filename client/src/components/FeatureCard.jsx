import { useState } from "react";

// ── Sample data — replace with your own ──────────────────────────────────
export const FEATURES = [
  {
    id: "analytics",
    icon: "📊",
    title: "Smart analytics",
    badge: "Pro",
    badgeBg: "#E6F1FB", badgeColor: "#0C447C",
    accent: "#378ADD",
    desc: "Deep dive into learning patterns with session breakdowns, topic heatmaps, and exam readiness predictions.",
    pills: ["Heatmap", "Trend lines", "Export CSV"],
  },
  {
    id: "flashcards",
    icon: "🃏",
    title: "Spaced repetition",
    badge: "Core",
    badgeBg: "#E1F5EE", badgeColor: "#085041",
    accent: "#1D9E75",
    desc: "Cards surface at optimal intervals using the SM-2 algorithm. The harder you find a card, the sooner it comes back.",
    pills: ["SM-2 algorithm", "Auto-schedule", "Offline sync"],
  },
  {
    id: "interview",
    icon: "🎯",
    title: "Mock interviews",
    badge: "Pro",
    badgeBg: "#E6F1FB", badgeColor: "#0C447C",
    accent: "#534AB7",
    desc: "Timed questions across DSA, OS, CN, DBMS and System Design. AI scores your answers and gives actionable feedback instantly.",
    pills: ["AI scoring", "Timer", "5 topics"],
  },
  {
    id: "notes",
    icon: "📝",
    title: "Smart notes",
    badge: "Beta",
    badgeBg: "#FAEEDA", badgeColor: "#633806",
    accent: "#BA7517",
    desc: "Write, link, and search notes with full-text search. Attach notes to topics and flashcards for rich context.",
    pills: ["Full-text search", "Bi-directional links", "Markdown"],
  },
  {
    id: "goals",
    icon: "🏁",
    title: "Goal tracker",
    badge: "Core",
    badgeBg: "#E1F5EE", badgeColor: "#085041",
    accent: "#1D9E75",
    desc: "Set weekly study targets, track streaks, and get nudged when you're behind pace.",
    pills: ["Weekly targets", "Streaks", "Reminders"],
  },
  {
    id: "collab",
    icon: "👥",
    title: "Study groups",
    badge: "Coming soon",
    badgeBg: "#FCEBEB", badgeColor: "#791F1F",
    accent: "#E24B4A",
    desc: "Share decks, race leaderboards, and hold group mock interviews. Invite teammates via link.",
    pills: ["Shared decks", "Leaderboards", "Group calls"],
  },
];

// ── Single card ───────────────────────────────────────────────────────────
export function FeatureCard({ feature, active, onClick }) {
  const [hov, setHov] = useState(false);
  if (!feature) return null;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#fff",
        border: `0.5px solid ${active || hov ? "rgba(0,0,0,0.16)" : "rgba(0,0,0,0.1)"}`,
        borderRadius: 12,
        padding: 14,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        fontFamily: "inherit",
        transform: hov && !active ? "translateY(-2px)" : "none",
        transition: "transform .15s, border-color .15s",
      }}
    >
      {/* Accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: feature.accent,
        borderRadius: "12px 12px 0 0",
        opacity: active || hov ? 1 : 0,
        transition: "opacity .2s",
      }} />

      {/* Check badge */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        width: 16, height: 16, borderRadius: "50%",
        background: active ? "#185FA5" : "rgba(0,0,0,0.05)",
        border: `0.5px solid ${active ? "#185FA5" : "rgba(0,0,0,0.1)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .15s",
      }}>
        {active && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, marginBottom: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16,
        background: active ? `${feature.accent}18` : "rgba(0,0,0,0.04)",
        border: `0.5px solid ${active ? feature.accent + "50" : "rgba(0,0,0,0.08)"}`,
        transition: "background .15s, border-color .15s",
      }}>
        {feature.icon}
      </div>

      {/* Title */}
      <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {feature.title}
      </div>

      {/* Badge */}
      <span style={{
        display: "inline-block", fontSize: 10, padding: "2px 7px",
        borderRadius: 20, marginTop: 5,
        background: feature.badgeBg, color: feature.badgeColor,
      }}>
        {feature.badge}
      </span>
    </button>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────
function DetailPanel({ feature, onLearnMore }) {
  if (!feature) return null;
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "#fff",
      border: "0.5px solid rgba(0,0,0,0.1)",
      borderRadius: 12, padding: 18,
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: feature.accent, borderRadius: "12px 12px 0 0" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, fontSize: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${feature.accent}18`, border: `0.5px solid ${feature.accent}50`,
        }}>
          {feature.icon}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#0f172a" }}>{feature.title}</div>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: feature.badgeBg, color: feature.badgeColor }}>
            {feature.badge}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 14 }}>{feature.desc}</p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {feature.pills.map(p => (
          <span key={p} style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 20,
            background: "rgba(0,0,0,0.04)", color: "#64748b",
            border: "0.5px solid rgba(0,0,0,0.1)",
          }}>
            {p}
          </span>
        ))}
      </div>

      <button
        onClick={() => onLearnMore?.(feature)}
        style={{
          background: "transparent",
          border: "0.5px solid rgba(0,0,0,0.16)",
          borderRadius: 8, padding: "7px 14px",
          fontSize: 12, color: "#64748b", cursor: "pointer",
          fontFamily: "inherit", transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#0f172a"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
      >
        Learn more ↗
      </button>
    </div>
  );
}

// ── Full panel (grid + detail) ────────────────────────────────────────────
export default function FeaturePanel({ features = FEATURES, onLearnMore }) {
  const [active, setActive] = useState(null);
  const activeFeature = features.find(f => f.id === active) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 11, color: "#94a3b8" }}>
        {active ? "Feature details" : "Select a feature to explore"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {features.map(f => (
          <FeatureCard
            key={f.id}
            feature={f}
            active={active === f.id}
            onClick={() => setActive(a => a === f.id ? null : f.id)}
          />
        ))}
      </div>

      {activeFeature && (
        <DetailPanel feature={activeFeature} onLearnMore={onLearnMore} />
      )}
    </div>
  );
}