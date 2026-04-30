import { useState } from "react";

export default function Flashcards({ cards, onNewTopic, busy }) {
  const [flipped, setFlipped]   = useState({});
  const [inp, setInp]           = useState("");
  const revealed = Object.values(flipped).filter(Boolean).length;

  if (!cards.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Progress */}
      <div style={{ padding: "12px 24px 0", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.06)", borderRadius: 4 }}>
          <div style={{
            height: 3,
            background: "linear-gradient(90deg,#d97706,#f59e0b,#fbbf24)",
            borderRadius: 4,
            width: `${(revealed / cards.length) * 100}%`,
            transition: "width .4s ease",
          }} />
        </div>
        <span style={{ fontSize: 12, color: "#d97706", fontWeight: 700, whiteSpace: "nowrap" }}>
          {revealed} / {cards.length} revealed
        </span>
        <button
          onClick={() => setFlipped({})}
          style={{ fontSize: 11, padding: "3px 10px", borderRadius: 7, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", color: "#64748b", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
        >
          Reset
        </button>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 18,
        padding: "18px 24px",
        overflowY: "auto",
        alignContent: "start",
        flex: 1,
      }}>
        {cards.map((card, i) => {
          const isFlipped = !!flipped[i];
          return (
            <div
              key={i}
              onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))}
              style={{ height: 188, cursor: "pointer", perspective: "1200px" }}
            >
              <div style={{
                position: "relative",
                width: "100%",
                height: "100%",
                transformStyle: "preserve-3d",
                transition: "transform .55s cubic-bezier(.4,0,.2,1)",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}>
                {/* FRONT */}
                <div style={{
                  position: "absolute", inset: 0,
                  borderRadius: 18,
                  padding: 22,
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  background: "rgba(255,255,255,.04)",
                  backdropFilter: "blur(16px)",
                  border: "1.5px solid rgba(217,119,6,.25)",
                  boxShadow: "0 8px 32px rgba(0,0,0,.2)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: "rgba(217,119,6,.15)", color: "#fbbf24", letterSpacing: .5 }}>
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>Question</span>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8px 0", fontSize: 14, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.65 }}>
                    {card.front}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, color: "#334155", fontWeight: 500 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Tap to reveal
                  </div>
                </div>

                {/* BACK */}
                <div style={{
                  position: "absolute", inset: 0,
                  borderRadius: 18,
                  padding: 22,
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: "linear-gradient(135deg,rgba(99,102,241,.28),rgba(139,92,246,.22))",
                  backdropFilter: "blur(16px)",
                  border: "1.5px solid rgba(99,102,241,.4)",
                  boxShadow: "0 8px 32px rgba(99,102,241,.18)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: "rgba(255,255,255,.15)", color: "rgba(255,255,255,.8)", letterSpacing: .5 }}>
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: 1 }}>Answer</span>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8px 0", fontSize: 13.5, fontWeight: 500, color: "#fff", lineHeight: 1.7 }}>
                    {card.back}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 500 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Got it
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ padding: "12px 24px 18px", borderTop: "1px solid rgba(255,255,255,.07)", background: "rgba(7,9,15,.6)", backdropFilter: "blur(16px)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 14, padding: "10px 14px" }}>
          <textarea
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e2e8f0", fontSize: 14, fontFamily: "'Inter',sans-serif", resize: "none", maxHeight: 100, lineHeight: 1.7, minHeight: 24 }}
            rows={1}
            placeholder="Enter a new topic for flashcards…"
            value={inp}
            onChange={e => setInp(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (inp.trim()) { onNewTopic(inp.trim()); setInp(""); } } }}
          />
          <button
            onClick={() => { if (inp.trim()) { onNewTopic(inp.trim()); setInp(""); } }}
            disabled={busy || !inp.trim()}
            style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", cursor: "pointer", color: "#fff", fontSize: 17, flexShrink: 0, opacity: busy || !inp.trim() ? .3 : 1, transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 14px rgba(99,102,241,.35)" }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
