import { useState, useEffect } from "react";

const CARDS = [
  { q: "What is Big O notation?", a: "Mathematical notation describing algorithm complexity as input grows. O(1) = constant, O(n) = linear, O(n²) = quadratic.", due: "Now", tag: "CS" },
  { q: "Explain Dijkstra's algorithm", a: "Greedy shortest-path algorithm. Uses priority queue. Time: O((V+E) log V). Finds min cost from source to all nodes.", due: "Now", tag: "Algo" },
  { q: "KVL formula", a: "Kirchhoff's Voltage Law: Sum of all voltages around any closed loop = 0. ΣV = 0.", due: "3h", tag: "ECE" },
  { q: "Binary search steps", a: "1) Mid = (lo+hi)/2  2) Compare target  3) Narrow half  4) Repeat. O(log n) time.", due: "Tomorrow", tag: "Algo" },
  { q: "Fourier Transform", a: "Decomposes signal into frequency components. F(ω) = ∫f(t)e^(-iωt)dt. Time→Frequency domain.", due: "3 days", tag: "Math" },
  { q: "TCP vs UDP", a: "TCP: reliable, ordered, connection-oriented. UDP: fast, no guarantee, connectionless. Use TCP for data, UDP for streaming.", due: "Now", tag: "Net" },
];

const QUEUE = [CARDS[0], CARDS[1], CARDS[5]]; // due now

const dueColor = (due) => {
  if (due === "Now") return "#ff6b6b";
  if (due === "3h") return "#ffd93d";
  if (due === "Tomorrow") return "#6bcb77";
  return "#4d96ff";
};

const tagColor = (tag) => {
  const map = { CS: "#a78bfa", Algo: "#f97316", ECE: "#38bdf8", Math: "#fb7185", Net: "#34d399" };
  return map[tag] || "#94a3b8";
};

export default function RevisionPanel({ color = "#6366f1" }) {
  const [flipped, setFlipped] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const [rated, setRated] = useState(null);
  const [streak, setStreak] = useState(7);
  const [completedToday, setCompletedToday] = useState(3);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState(1);

  const current = QUEUE[cardIdx % QUEUE.length];

  const handleRate = (rating) => {
    setRated(rating);
    setSlideDir(1);
    setAnimating(true);
    setTimeout(() => {
      setFlipped(false);
      setRated(null);
      setCardIdx((i) => i + 1);
      setCompletedToday((c) => c + 1);
      setAnimating(false);
    }, 400);
  };

  const handleFlip = () => {
    if (!flipped) setFlipped(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .rp-root * { box-sizing: border-box; }

        .rp-root {
          font-family: 'Syne', sans-serif;
          background: #080c14;
          color: #e2e8f0;
          padding: 20px;
          min-height: 100vh;
          max-width: 420px;
          margin: 0 auto;
        }

        /* Header */
        .rp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .rp-title {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #f1f5f9;
        }
        .rp-streak {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,165,0,0.1);
          border: 1px solid rgba(255,165,0,0.25);
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #fbbf24;
        }

        /* Stats row */
        .rp-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 18px;
        }
        .rp-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px 10px;
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .rp-stat::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: var(--sc);
          opacity: 0.6;
        }
        .rp-stat:hover { border-color: rgba(255,255,255,0.15); }
        .rp-stat-val {
          font-size: 24px;
          font-weight: 800;
          color: var(--sc);
          line-height: 1;
        }
        .rp-stat-label {
          font-size: 9px;
          color: #475569;
          margin-top: 4px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* Progress bar */
        .rp-progress-wrap {
          margin-bottom: 18px;
        }
        .rp-progress-meta {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #475569;
          margin-bottom: 5px;
          font-weight: 600;
        }
        .rp-progress-track {
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
        }
        .rp-progress-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, ${color}, #818cf8);
          transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }

        /* Flashcard */
        .rp-card-scene {
          perspective: 900px;
          margin-bottom: 14px;
          cursor: pointer;
        }
        .rp-card-inner {
          position: relative;
          width: 100%;
          min-height: 160px;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.34,1.2,0.64,1),
                      opacity 0.3s ease,
                      translate 0.35s ease;
        }
        .rp-card-inner.flipped { transform: rotateY(180deg); }
        .rp-card-inner.slide-out { opacity: 0; translate: -30px 0; }

        .rp-card-face {
          position: absolute;
          width: 100%;
          min-height: 160px;
          backface-visibility: hidden;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .rp-card-front {
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04));
          border: 1px solid rgba(99,102,241,0.3);
        }
        .rp-card-back {
          background: linear-gradient(135deg, rgba(52,211,153,0.1), rgba(52,211,153,0.03));
          border: 1px solid rgba(52,211,153,0.25);
          transform: rotateY(180deg);
        }

        .rp-card-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--tc);
          background: color-mix(in srgb, var(--tc) 15%, transparent);
          border-radius: 4px;
          padding: 2px 7px;
          display: inline-block;
          margin-bottom: 10px;
          width: fit-content;
        }
        .rp-card-q {
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1.5;
          flex: 1;
        }
        .rp-card-hint {
          font-size: 10px;
          color: #334155;
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rp-card-num {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #334155;
        }
        .rp-card-a {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.6;
          font-family: 'DM Mono', monospace;
        }
        .rp-card-a-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #34d399;
          margin-bottom: 8px;
        }

        /* Rating buttons */
        .rp-rates {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 6px;
          margin-bottom: 18px;
          transition: opacity 0.3s;
        }
        .rp-rates.hidden { opacity: 0; pointer-events: none; }
        .rp-rate-btn {
          padding: 8px 4px;
          border-radius: 10px;
          border: 1px solid var(--bc);
          background: var(--bb);
          color: var(--bc);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          text-align: center;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .rp-rate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--bs);
        }
        .rp-rate-btn:active { transform: scale(0.96); }
        .rp-rate-emoji { display: block; font-size: 14px; margin-bottom: 2px; }

        /* Skip/reveal row */
        .rp-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
        }
        .rp-action-btn {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.5px;
          transition: all 0.15s;
        }
        .rp-action-btn.primary {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.4);
          color: #818cf8;
        }
        .rp-action-btn:hover { border-color: rgba(255,255,255,0.15); color: #94a3b8; }
        .rp-action-btn.primary:hover { background: rgba(99,102,241,0.25); }

        /* Section label */
        .rp-section-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #1e293b;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        /* Card list */
        .rp-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .rp-list-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s, border-color 0.15s;
          cursor: pointer;
        }
        .rp-list-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }
        .rp-list-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--dc);
          flex-shrink: 0;
          box-shadow: 0 0 6px var(--dc);
        }
        .rp-list-q {
          flex: 1;
          font-size: 11px;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rp-list-tag {
          font-size: 8px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
          color: var(--ltc);
          background: color-mix(in srgb, var(--ltc) 12%, transparent);
          flex-shrink: 0;
        }
        .rp-list-due {
          font-size: 9px;
          color: #1e293b;
          font-family: 'DM Mono', monospace;
          flex-shrink: 0;
          min-width: 48px;
          text-align: right;
        }
      `}</style>

      <div className="rp-root">
        {/* Header */}
        <div className="rp-header">
          <div className="rp-title">📚 Flashcards</div>
          <div className="rp-streak">🔥 {streak} day streak</div>
        </div>

        {/* Stats */}
        <div className="rp-stats">
          {[
            { label: "Due Now", val: 3, c: "#ff6b6b" },
            { label: "Today", val: completedToday + 2, c: color },
            { label: "This Week", val: 12, c: "#34d399" },
          ].map((s) => (
            <div className="rp-stat" key={s.label} style={{ "--sc": s.c }}>
              <div className="rp-stat-val">{s.val}</div>
              <div className="rp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="rp-progress-wrap">
          <div className="rp-progress-meta">
            <span>TODAY'S PROGRESS</span>
            <span>{completedToday} / 10 done</span>
          </div>
          <div className="rp-progress-track">
            <div className="rp-progress-fill" style={{ width: `${(completedToday / 10) * 100}%` }} />
          </div>
        </div>

        {/* Flashcard */}
        <div
          className="rp-card-scene"
          onClick={handleFlip}
        >
          <div
            className={`rp-card-inner ${flipped ? "flipped" : ""} ${animating ? "slide-out" : ""}`}
          >
            {/* Front */}
            <div
              className="rp-card-face rp-card-front"
              style={{ "--tc": tagColor(current.tag) }}
            >
              <div>
                <div className="rp-card-tag">{current.tag}</div>
                <div className="rp-card-q">{current.q}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="rp-card-hint">
                  <span>👆</span> tap to reveal
                </div>
                <div className="rp-card-num">{(cardIdx % QUEUE.length) + 1}/{QUEUE.length}</div>
              </div>
            </div>

            {/* Back */}
            <div className="rp-card-face rp-card-back">
              <div>
                <div className="rp-card-a-label">ANSWER</div>
                <div className="rp-card-a">{current.a}</div>
              </div>
              <div style={{ fontSize: 10, color: "#1e293b", marginTop: 10 }}>
                How well did you know this?
              </div>
            </div>
          </div>
        </div>

        {/* Rate buttons */}
        <div className={`rp-rates ${!flipped ? "hidden" : ""}`}>
          {[
            { l: "Again", e: "😓", c: "#ff6b6b", bg: "rgba(239,68,68,0.1)", s: "rgba(239,68,68,0.3)" },
            { l: "Hard", e: "🤔", c: "#fbbf24", bg: "rgba(245,158,11,0.1)", s: "rgba(245,158,11,0.3)" },
            { l: "Good", e: "👍", c: "#818cf8", bg: "rgba(99,102,241,0.1)", s: "rgba(99,102,241,0.3)" },
            { l: "Easy", e: "🚀", c: "#34d399", bg: "rgba(52,211,153,0.1)", s: "rgba(52,211,153,0.3)" },
          ].map((b) => (
            <button
              key={b.l}
              className="rp-rate-btn"
              style={{ "--bc": b.c, "--bb": b.bg, "--bs": b.s }}
              onClick={(e) => { e.stopPropagation(); handleRate(b.l); }}
            >
              <span className="rp-rate-emoji">{b.e}</span>
              {b.l}
            </button>
          ))}
        </div>

        {/* Skip / Reveal actions */}
        {!flipped && (
          <div className="rp-actions">
            <button className="rp-action-btn" onClick={() => { setSlideDir(1); setAnimating(true); setTimeout(() => { setCardIdx(i => i + 1); setAnimating(false); }, 350); }}>
              SKIP →
            </button>
            <button className="rp-action-btn primary" onClick={handleFlip}>
              REVEAL ANSWER
            </button>
          </div>
        )}

        {/* Queue list */}
        <div className="rp-section-label">ALL CARDS</div>
        <div className="rp-list">
          {CARDS.map((c, i) => (
            <div
              className="rp-list-item"
              key={i}
              style={{ "--dc": dueColor(c.due), "--ltc": tagColor(c.tag) }}
            >
              <div className="rp-list-dot" />
              <div className="rp-list-q">{c.q}</div>
              <div className="rp-list-tag">{c.tag}</div>
              <div className="rp-list-due">{c.due}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}