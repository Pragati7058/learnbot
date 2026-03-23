import { useState } from "react";

export default function Quiz({ questions, onRetry }) {
  const [cur, setCur]         = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone]       = useState(false);

  const score = Object.entries(answers).filter(([i, a]) => questions[+i]?.answer === a).length;
  const pct   = Math.round((score / questions.length) * 100);

  if (done) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20, alignItems: "center", animation: "fadeUp .25s ease" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{pct >= 80 ? "🔥" : pct >= 60 ? "💪" : "📖"}</div>
          <div style={{ fontSize: 30, fontWeight: 800, background: "linear-gradient(135deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {pct}%
          </div>
          <div style={{ fontSize: 16, color: "#94a3b8", marginTop: 6 }}>
            {score} of {questions.length} correct — {pct >= 80 ? "Excellent work!" : pct >= 60 ? "Good effort, keep going." : "Review the material and try again."}
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 10 }}>
          {questions.map((q, i) => {
            const correct = answers[i] === q.answer;
            return (
              <div key={i} style={{ background: correct ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.07)", border: `1px solid ${correct ? "rgba(16,185,129,.22)" : "rgba(239,68,68,.18)"}`, borderRadius: 13, padding: "14px 18px" }}>
                <div style={{ fontSize: 13.5, color: "#e2e8f0", fontWeight: 500, marginBottom: 6, lineHeight: 1.6 }}>{q.q}</div>
                <div style={{ fontSize: 12.5, color: correct ? "#34d399" : "#f87171", fontWeight: 600 }}>
                  {correct ? "✓ Correct" : `✗ Answer: ${q.answer}`}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 5, lineHeight: 1.65 }}>{q.explanation}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => { setCur(0); setAnswers({}); setDone(false); }}
            style={{ padding: "11px 24px", borderRadius: 12, border: "1px solid rgba(99,102,241,.3)", background: "rgba(99,102,241,.1)", color: "#a5b4fc", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Try Again
          </button>
          <button
            onClick={onRetry}
            style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            New Topic
          </button>
        </div>
      </div>
    );
  }

  const q = questions[cur];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .22s ease" }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.07)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: 4, background: "linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)", borderRadius: 4, width: `${((cur + 1) / questions.length) * 100}%`, transition: "width .4s ease" }} />
        </div>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>
          {cur + 1} / {questions.length}
        </span>
      </div>

      {/* Question card */}
      <div style={{ background: "rgba(255,255,255,.04)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 28 }}>
        <div style={{ fontSize: 10.5, color: "#818cf8", fontWeight: 700, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>
          Question {cur + 1}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.7, textAlign: "justify" }}>
          {q.q}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          const letter  = opt[0];
          const picked  = answers[cur] === letter;
          const correct = answers[cur] && letter === q.answer;
          const wrong   = picked && letter !== q.answer;

          return (
            <button
              key={i}
              onClick={() => { if (!answers[cur]) setAnswers(p => ({ ...p, [cur]: letter })); }}
              style={{
                padding: "13px 18px",
                borderRadius: 13,
                border: `1.5px solid ${correct ? "rgba(52,211,153,.5)" : wrong ? "rgba(248,113,113,.4)" : picked ? "rgba(99,102,241,.55)" : "rgba(255,255,255,.07)"}`,
                background: correct ? "rgba(52,211,153,.1)" : wrong ? "rgba(248,113,113,.08)" : picked ? "rgba(99,102,241,.16)" : "rgba(255,255,255,.03)",
                color: correct ? "#34d399" : wrong ? "#f87171" : picked ? "#a5b4fc" : "#94a3b8",
                fontSize: 14,
                textAlign: "left",
                cursor: answers[cur] ? "default" : "pointer",
                fontFamily: "'Inter',sans-serif",
                transition: "all .2s",
                fontWeight: picked ? 600 : 400,
                lineHeight: 1.6,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answers[cur] && (
        <div style={{ background: "rgba(52,211,153,.07)", border: "1px solid rgba(52,211,153,.18)", borderRadius: 12, padding: "13px 17px", fontSize: 13.5, color: "#6ee7b7", lineHeight: 1.75, animation: "fadeUp .2s ease" }}>
          {answers[cur] === q.answer ? "✓ Correct — " : `✗ Answer is ${q.answer} — `}{q.explanation}
        </div>
      )}

      {/* Navigation */}
      {answers[cur] && (
        <div style={{ display: "flex", justifyContent: "flex-end", animation: "fadeUp .2s ease" }}>
          {cur < questions.length - 1 ? (
            <button
              onClick={() => setCur(c => c + 1)}
              style={{ padding: "11px 26px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(99,102,241,.3)" }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => setDone(true)}
              style={{ padding: "11px 26px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(5,150,105,.3)" }}
            >
              See Results
            </button>
          )}
        </div>
      )}
    </div>
  );
}
