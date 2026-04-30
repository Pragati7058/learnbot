import { useState, useEffect, useRef } from "react";

const BANK = {
  DSA: [
    { q: "What is the time complexity of quicksort in the best, average, and worst cases?", hint: "Think about pivot selection and partition depth.", diff: "Medium", fb: "Cover O(n log n) avg and O(n²) worst case with reasons.", score: 7 },
    { q: "Explain the difference between a stack and a queue with real-world examples.", hint: "Think about LIFO vs FIFO ordering.", diff: "Easy", fb: "Good if you gave concrete examples like undo history vs print queues.", score: 8 },
  ],
  OS: [
    { q: "Explain the difference between a process and a thread. When would you prefer one over the other?", hint: "Think about memory sharing, context switching overhead, and CPU vs I/O tasks.", diff: "Medium", fb: "Mention IPC overhead for processes. Add Python GIL as a thread limitation example.", score: 8 },
    { q: "What is a deadlock? Describe the four necessary conditions for it to occur.", hint: "Coffman conditions — think resource holding and circular waiting.", diff: "Hard", fb: "All four conditions needed: mutual exclusion, hold-and-wait, no preemption, circular wait.", score: 6 },
  ],
  CN: [
    { q: "What happens when you type a URL in the browser and press Enter?", hint: "DNS → TCP → TLS → HTTP → render pipeline.", diff: "Medium", fb: "Full marks if you covered DNS resolution, TCP handshake, and HTTP response.", score: 9 },
    { q: "Explain TCP vs UDP. When would you choose each?", hint: "Reliability vs speed tradeoff.", diff: "Easy", fb: "Mention streaming/gaming for UDP and file transfer/email for TCP.", score: 7 },
  ],
  DBMS: [
    { q: "What are the ACID properties of a database transaction?", hint: "Atomicity, Consistency, Isolation, Durability — give one example each.", diff: "Easy", fb: "Cover all four with examples. Isolation levels are a bonus.", score: 8 },
    { q: "Explain the difference between clustered and non-clustered indexes.", hint: "Think about physical ordering of data on disk.", diff: "Medium", fb: "Clustered = physical order; non-clustered = pointer-based. Mention 1 per table limit.", score: 7 },
  ],
  "System Design": [
    { q: "Design a URL shortener like bit.ly. Walk through the key components.", hint: "Hash function, DB schema, redirect flow, scale considerations.", diff: "Hard", fb: "Cover hashing, 301 vs 302 redirect, caching with Redis, and DB sharding.", score: 8 },
    { q: "How would you design a rate limiter for an API?", hint: "Token bucket vs leaky bucket vs sliding window.", diff: "Hard", fb: "Token bucket is ideal. Mention Redis atomic ops for distributed rate limiting.", score: 7 },
  ],
};

const TOPICS = Object.keys(BANK);

const diffStyles = {
  Easy: { background: "#EAF3DE", color: "#3B6D11", border: "0.5px solid #97C459" },
  Medium: { background: "#FAEEDA", color: "#854F0B", border: "0.5px solid #EF9F27" },
  Hard: { background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #F09595" },
};

function useTimer(running) {
  const [sec, setSec] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    setSec(0);
    if (!running) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => setSec(s => s + 1), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function InterviewPanel({ onIdeaAnswer }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState([]);
  const [streak, setStreak] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const questions = BANK[topic];
  const q = questions[qIdx % questions.length];
  const timer = useTimer(!submitted);

  const totalDone = scores.length;
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;

  function changeTopic(t) {
    setTopic(t); setQIdx(0); setAnswer(""); setShowHint(false);
    setSubmitted(false); setScores([]); setStreak(0); setTimerKey(k => k + 1);
  }

  function submit() {
    if (!answer.trim()) return;
    const sc = q.score;
    setScores(s => [...s, sc]);
    setStreak(s => sc >= 7 ? s + 1 : 0);
    setSubmitted(true);
  }

  function next() {
    setQIdx(i => i + 1);
    setAnswer(""); setShowHint(false); setSubmitted(false);
    setTimerKey(k => k + 1);
  }

  const card = {
    background: "#fff",
    border: "0.5px solid rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: "18px",
    position: "relative",
    overflow: "hidden",
  };

  const btn = (extra = {}) => ({
    padding: "8px 14px", borderRadius: 8, fontSize: 12,
    cursor: "pointer", fontFamily: "inherit", transition: "all .15s", ...extra,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Topic tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TOPICS.map(t => (
          <button
            key={t}
            onClick={() => changeTopic(t)}
            style={btn({
              background: topic === t ? "#E6F1FB" : "transparent",
              border: `0.5px solid ${topic === t ? "#85B7EB" : "rgba(0,0,0,0.1)"}`,
              color: topic === t ? "#0C447C" : "#64748b",
              borderRadius: 20,
            })}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div style={card}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#378ADD", borderRadius: "12px 12px 0 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#185FA5", fontWeight: 500 }}>
            Question {(qIdx % questions.length) + 1} of {questions.length}
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#BA7517", background: "#FAEEDA", border: "0.5px solid #EF9F27", borderRadius: 6, padding: "3px 9px", fontWeight: 500 }}>
              {timer}
            </span>
            <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 6, fontWeight: 500, ...diffStyles[q.diff] }}>
              {q.diff}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 2, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ height: "100%", borderRadius: 2, background: "#378ADD", width: `${((qIdx % questions.length) + 1) / questions.length * 100}%`, transition: "width .4s ease" }} />
        </div>

        <p style={{ fontSize: 14, color: "#0f172a", fontWeight: 500, lineHeight: 1.65, marginBottom: 16 }}>
          {q.q}
        </p>

        {showHint && (
          <div style={{ background: "#FAEEDA", border: "0.5px solid #EF9F27", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#854F0B", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Hint</div>
            <div style={{ fontSize: 12, color: "#633806", lineHeight: 1.6 }}>{q.hint}</div>
          </div>
        )}

        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={submitted}
          placeholder="Type your answer here…"
          style={{
            width: "100%", minHeight: 88,
            border: "0.5px solid rgba(0,0,0,0.12)",
            borderRadius: 8, padding: "10px 12px",
            fontSize: 12, color: "#0f172a",
            background: submitted ? "rgba(0,0,0,0.03)" : "#f8fafc",
            lineHeight: 1.6, outline: "none", resize: "vertical",
            fontFamily: "inherit", transition: "border-color .15s",
          }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowHint(h => !h)}
            style={btn({ background: "#FAEEDA", border: "0.5px solid #EF9F27", color: "#854F0B" })}
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>
          {!submitted ? (
            <button
              onClick={submit}
              disabled={!answer.trim()}
              style={btn({
                flex: 1, minWidth: 120,
                background: answer.trim() ? "#185FA5" : "rgba(0,0,0,0.05)",
                border: "none",
                color: answer.trim() ? "#E6F1FB" : "#94a3b8",
                cursor: answer.trim() ? "pointer" : "default",
              })}
            >
              Submit answer
            </button>
          ) : (
            <button onClick={next} style={btn({ flex: 1, minWidth: 120, background: "#185FA5", border: "none", color: "#E6F1FB" })}>
              Next question →
            </button>
          )}
        </div>
      </div>

      {/* Score feedback */}
      {submitted && (
        <div style={{ background: "#E1F5EE", border: "0.5px solid #5DCAA5", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "#085041", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>AI feedback</span>
            <span style={{ fontSize: 28, fontWeight: 500, color: "#0F6E56" }}>{q.score}/10</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "#9FE1CB", overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", borderRadius: 3, background: "#0F6E56", width: `${q.score * 10}%`, transition: "width .8s cubic-bezier(.34,1.2,.64,1)" }} />
          </div>
          <p style={{ fontSize: 12, color: "#085041", lineHeight: 1.65, marginBottom: 12 }}>{q.fb}</p>
          <button
            onClick={() => onIdeaAnswer?.(q.q)}
            style={btn({ background: "transparent", border: "0.5px solid #5DCAA5", color: "#085041" })}
          >
            See ideal answer ↗
          </button>
        </div>
      )}

      {/* Session stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
        {[
          { label: "Avg score", value: avgScore ? `${avgScore}/10` : "—", color: "#0F6E56" },
          { label: "Completed", value: `${totalDone}/10`, color: "#185FA5" },
          { label: "Streak", value: streak, color: "#854F0B" },
          { label: "Topic", value: topic, color: "#534AB7" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

    </div>
  );
}