import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { callAI, api } from "../utils/api";
import { TOOLS, PROMPTS, QUICK_PROMPTS } from "../utils/prompts";
import { fixSvg } from "../utils/svgFixer";
import Markdown from "../components/Markdown";
import Icon from "../components/Icon";
import Flashcards from "../components/Flashcards";
import Quiz from "../components/Quiz";

/* ── tiny reusable button ─────────────────────────────────── */
function Btn({ onClick, children, variant = "ghost", style = {}, disabled = false, title = "" }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 14px", borderRadius: 10, border: "1px solid",
    fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Inter',sans-serif", transition: "all .2s",
    opacity: disabled ? .4 : 1, ...style,
  };
  const variants = {
    ghost:   { background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.09)", color: "#64748b" },
    primary: { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderColor: "transparent", color: "#fff", boxShadow: "0 3px 14px rgba(99,102,241,.3)" },
    green:   { background: "rgba(16,185,129,.1)", borderColor: "rgba(16,185,129,.25)", color: "#34d399" },
    amber:   { background: "rgba(245,158,11,.1)", borderColor: "rgba(245,158,11,.25)", color: "#fbbf24" },
    danger:  { background: "rgba(239,68,68,.08)", borderColor: "rgba(239,68,68,.2)",  color: "#f87171" },
    indigo:  { background: "rgba(99,102,241,.1)", borderColor: "rgba(99,102,241,.25)", color: "#a5b4fc" },
  };
  return (
    <button title={title} disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = "brightness(1.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
    >
      {children}
    </button>
  );
}

/* ── typing indicator ─────────────────────────────────────── */
function Typing() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "4px 0", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: ["#6366f1", "#8b5cf6", "#ec4899"][i],
          animation: `pulse-dot 1.2s ease-in-out ${i * .18}s infinite`,
          boxShadow: `0 0 6px ${["rgba(99,102,241,.5)","rgba(139,92,246,.5)","rgba(236,72,153,.5)"][i]}`,
        }} />
      ))}
    </div>
  );
}

/* ── welcome screen ───────────────────────────────────────── */
function Welcome({ tool, onSend, busy }) {
  const tc = TOOLS.find(t => t.id === tool);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: "40px 28px", textAlign: "center", animation: "fadeUp .3s ease" }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", background: tc?.color + "20", border: `1px solid ${tc?.color}38`, boxShadow: `0 0 32px ${tc?.glow}`, color: tc?.color }}>
        <Icon name={tc?.icon} size={34} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#a5b4fc,#c4b5fd,#f0abfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>
          {tc?.label}
        </div>
        <div style={{ fontSize: 14, color: "#475569", maxWidth: 380, lineHeight: 1.9 }}>
          {
            tool === "chat"       ? "Ask any engineering question — CS, ECE, Mechanical, Civil, or Math. Get precise, well-structured answers." :
            tool === "notes"      ? "Enter any engineering topic and get comprehensive, structured study notes with formulas and real-world applications." :
            tool === "summary"    ? "Name a topic or paste content and get a crisp, well-formatted engineering summary." :
            tool === "flashcards" ? "Enter a topic and get 8 study flashcards. Tap each card to reveal the answer." :
            tool === "diagram"    ? "Describe any engineering concept and LearnBot will draw a clean, labeled concept diagram." :
            tool === "flowchart"  ? "Describe any process or algorithm and get a clear, properly-spaced flowchart." :
            tool === "code"       ? "Share code to debug, explain, or optimize. Supports C, C++, Python, Java, MATLAB, Verilog and more." :
            tool === "formula"    ? "Ask about any engineering formula or equation — get a full breakdown with derivation, units, and examples." :
            tool === "quiz"       ? "Enter a topic and test your knowledge with 5 multiple-choice questions and instant feedback." : ""
          }
        </div>
      </div>
      {busy ? (
        <Typing />
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 540 }}>
          {(QUICK_PROMPTS[tool] || []).map((q, i) => (
            <button
              key={i}
              onClick={() => onSend(q)}
              style={{ fontSize: 13, padding: "8px 16px", borderRadius: 10, cursor: "pointer", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "#64748b", transition: "all .2s", fontFamily: "inherit", fontWeight: 500 }}
              onMouseEnter={e => { e.currentTarget.style.background = tc?.color + "18"; e.currentTarget.style.borderColor = tc?.color + "40"; e.currentTarget.style.color = tc?.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.transform = "none"; }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── API key modal ────────────────────────────────────────── */
function ApiKeyModal({ onClose, onSave, current }) {
  const [val, setVal] = useState(current || "");
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(16px)", animation: "fadeIn .2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 440, padding: 32, borderRadius: 22, background: "rgba(10,12,24,.97)", border: "1px solid rgba(99,102,241,.25)", boxShadow: "0 0 60px rgba(99,102,241,.14),0 32px 80px rgba(0,0,0,.6)", animation: "scaleIn .22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Icon name="key" size={18} style={{ color: "#818cf8" }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Groq API Key</div>
        </div>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 20, lineHeight: 1.8 }}>
          Get a <strong style={{ color: "#a5b4fc" }}>free</strong> key at{" "}
          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: "#818cf8", fontWeight: 600 }}>console.groq.com/keys</a>
          {" "}— no credit card needed. Your key is stored in session memory only and never sent to our server.
        </p>
        <input
          type="password"
          placeholder="gsk_…"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && val.trim() && onSave(val.trim())}
          autoFocus
          style={{ width: "100%", padding: "12px 14px", borderRadius: 11, background: "rgba(99,102,241,.07)", border: "1.5px solid rgba(99,102,241,.2)", color: "#e2e8f0", fontSize: 14, outline: "none", marginBottom: 18, fontFamily: "'JetBrains Mono',monospace", letterSpacing: .5, transition: "all .2s" }}
          onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,.55)"; e.target.style.background = "rgba(99,102,241,.1)"; }}
          onBlur={e  => { e.target.style.borderColor = "rgba(99,102,241,.2)"; e.target.style.background = "rgba(99,102,241,.07)"; }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => val.trim() && onSave(val.trim())} variant="primary">
            <Icon name="key" size={14} /> Connect
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function AppPage() {
  const { user, logout, apiKey, setApiKey } = useAuth();
  const [tool, setTool]           = useState("chat");
  const [msgs, setMsgs]           = useState([]);
  const [inp,  setInp]            = useState("");
  const [busy, setBusy]           = useState(false);
  const [cards, setCards]         = useState([]);
  const [svg,  setSvg]            = useState("");
  const [quizData, setQuizData]   = useState(null);
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const endRef = useRef(null);
  const taRef  = useRef(null);

  /* load history on mount */
  useEffect(() => {
    api.getHistory({ limit: 40 }).then(d => setHistory(d.sessions || [])).catch(() => {});
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  /* auto-resize textarea */
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "24px";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 130) + "px";
    }
  }, [inp]);

  const switchTool = useCallback((t) => {
    setTool(t); setMsgs([]); setCards([]); setSvg(""); setQuizData(null); setInp(""); setSessionId(null);
  }, []);

  const refreshHistory = () => {
    api.getHistory({ limit: 40 }).then(d => setHistory(d.sessions || [])).catch(() => {});
  };

  const downloadChat = () => {
    const text = msgs.map(m => `[${m.r === "ai" ? "LearnBot" : user?.name || "You"}]\n${m.t}\n`).join("\n---\n\n");
    const blob  = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `learnbot-${tool}-${Date.now()}.txt`;
    a.click();
  };

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `learnbot-${tool}-${Date.now()}.svg`;
    a.click();
  };

  /* save session to DB */
  const saveSession = async (title, messages, extra = {}) => {
    try {
      const d = await api.createSession({ tool, title, messages, ...extra });
      setSessionId(d.session._id);
      refreshHistory();
    } catch {}
  };

  /* main send handler */
  const send = useCallback(async (prompt = inp) => {
    const q = (typeof prompt === "string" ? prompt : inp).trim();
    if (!q) return;
    if (!apiKey) { setShowKeyModal(true); return; }
    setInp("");

    /* FLASHCARDS */
    if (tool === "flashcards") {
      setBusy(true);
      try {
        const raw   = await callAI(apiKey, [{ role: "user", content: `Generate 8 engineering flashcards about: ${q}` }], PROMPTS.flashcards);
        const clean = raw.replace(/```json|```/gi, "").trim();
        let arr = [];
        try { arr = JSON.parse(clean); } catch { const m = clean.match(/\[[\s\S]*\]/); if (m) arr = JSON.parse(m[0]); }
        if (Array.isArray(arr) && arr.length > 0) {
          setCards(arr);
          saveSession(q, [], { flashcards: arr });
        } else {
          setMsgs(p => [...p, { r: "ai", t: "Couldn't parse flashcards — please try rephrasing the topic." }]);
        }
      } catch (e) {
        setMsgs(p => [...p, { r: "ai", t: `Error: ${e.message}` }]);
      }
      setBusy(false); return;
    }

    /* DIAGRAM / FLOWCHART */
    if (tool === "diagram" || tool === "flowchart") {
      setBusy(true); setSvg("");
      try {
        const raw = await callAI(apiKey, [{ role: "user", content: `Create a ${tool} for: ${q}` }], PROMPTS[tool]);
        const m   = raw.match(/<svg[\s\S]*?<\/svg>/i);
        if (m) {
          const fixed = fixSvg(m[0], tool);
          setSvg(fixed);
          saveSession(q, [], { svgData: fixed });
        } else {
          setMsgs(p => [...p, { r: "ai", t: "Could not render the SVG. Please try a more specific or simpler topic." }]);
        }
      } catch (e) {
        setMsgs(p => [...p, { r: "ai", t: `Error: ${e.message}` }]);
      }
      setBusy(false); return;
    }

    /* QUIZ */
    if (tool === "quiz") {
      setBusy(true); setQuizData(null);
      try {
        const raw   = await callAI(apiKey, [{ role: "user", content: `Generate 5 quiz questions about: ${q}` }], PROMPTS.quiz);
        const clean = raw.replace(/```json|```/gi, "").trim();
        let arr = [];
        try { arr = JSON.parse(clean); } catch { const m = clean.match(/\[[\s\S]*\]/); if (m) arr = JSON.parse(m[0]); }
        if (Array.isArray(arr) && arr.length > 0) {
          setQuizData(arr);
          saveSession(q, [], { quizData: arr });
        } else {
          setMsgs(p => [...p, { r: "ai", t: "Couldn't generate quiz. Please try again." }]);
        }
      } catch (e) {
        setMsgs(p => [...p, { r: "ai", t: `Error: ${e.message}` }]);
      }
      setBusy(false); return;
    }

    /* CHAT / NOTES / SUMMARY / CODE / FORMULA */
    const userMsg = { role: "user", content: q };
    setMsgs(p => [...p, { r: "u", t: q }]);
    setBusy(true);
    try {
      const histMsgs = msgs.slice(-12).map(m => ({ role: m.r === "ai" ? "assistant" : "user", content: m.t }));
      const res = await callAI(apiKey, [...histMsgs, userMsg], PROMPTS[tool] || PROMPTS.chat);
      const aiMsg = { r: "ai", t: res };
      setMsgs(p => {
        const next = [...p, aiMsg];
        // Save/update session
        const allMsgs = next.map(m => ({ role: m.r === "ai" ? "assistant" : "user", content: m.t }));
        if (!sessionId) {
          api.createSession({ tool, title: q.slice(0, 80), messages: allMsgs })
            .then(d => { setSessionId(d.session._id); refreshHistory(); })
            .catch(() => {});
        } else {
          api.updateSession(sessionId, { messages: allMsgs }).catch(() => {});
        }
        return next;
      });
    } catch (e) {
      setMsgs(p => [...p, { r: "ai", t: `Error: ${e.message}` }]);
    }
    setBusy(false);
  }, [inp, tool, apiKey, msgs, sessionId]);

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";
  const tc = TOOLS.find(t => t.id === tool);
  const isChatLike = ["chat", "notes", "summary", "code", "formula"].includes(tool);
  const glassBg = "rgba(255,255,255,.04)";
  const border   = "rgba(255,255,255,.07)";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "256px 1fr", gridTemplateRows: "62px 1fr", height: "100vh", background: "radial-gradient(ellipse 70% 50% at 15% 25%,rgba(99,102,241,.1) 0%,transparent 50%),radial-gradient(ellipse 60% 50% at 85% 75%,rgba(139,92,246,.08) 0%,transparent 50%),#07090f" }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", background: "rgba(7,9,15,.88)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${border}`, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,.4)" }}>
            <Icon name="logo" size={20} />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, background: "linear-gradient(135deg,#a5b4fc,#c4b5fd,#f0abfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.15 }}>LearnBot</div>
            <div style={{ fontSize: 10, color: "rgba(165,180,252,.4)", letterSpacing: 1 }}>for engineers</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isChatLike && msgs.length > 0 && (
            <Btn onClick={downloadChat}><Icon name="download" size={13} /> Download</Btn>
          )}
          <Btn onClick={() => setShowHistory(s => !s)} variant={showHistory ? "indigo" : "ghost"}>
            <Icon name="history" size={13} /> History
          </Btn>
          <Btn onClick={() => setShowKeyModal(true)} variant={apiKey ? "green" : "amber"}>
            <Icon name="key" size={13} /> {apiKey ? "Groq Live" : "Set API Key"}
          </Btn>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", cursor: "default", boxShadow: "0 0 14px rgba(99,102,241,.3)", userSelect: "none" }} title={user?.name}>
            {initials}
          </div>
          <Btn onClick={logout}><Icon name="logout" size={13} /> Logout</Btn>
        </div>
      </header>

      {/* ── SIDEBAR ────────────────────────────────────────────── */}
      <aside style={{ background: "rgba(7,9,15,.75)", backdropFilter: "blur(20px)", borderRight: `1px solid ${border}`, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(99,102,241,.45)", padding: "10px 10px 6px" }}>Tools</div>

        {TOOLS.map(t => {
          const on = tool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => switchTool(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 12, cursor: "pointer", border: `1px solid ${on ? t.color + "48" : "transparent"}`, color: on ? t.color : "rgba(148,163,184,.65)", background: on ? t.color + "16" : "transparent", width: "100%", textAlign: "left", transition: "all .18s", fontFamily: "'Inter',sans-serif", boxShadow: on ? `0 0 18px ${t.glow}` : "none" }}
              onMouseEnter={e => { if (!on) { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "rgba(255,255,255,.85)"; } }}
              onMouseLeave={e => { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(148,163,184,.65)"; } }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: on ? t.color + "28" : "rgba(255,255,255,.05)", border: `1px solid ${on ? t.color + "38" : "rgba(255,255,255,.07)"}`, transition: "all .2s", color: on ? t.color : "rgba(148,163,184,.65)" }}>
                <Icon name={t.icon} size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</div>
                <div style={{ fontSize: 10, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{t.desc}</div>
              </div>
            </button>
          );
        })}

        {/* History panel */}
        {showHistory && (
          <>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(99,102,241,.45)", padding: "14px 10px 6px", marginTop: 6, borderTop: `1px solid ${border}` }}>History</div>
            {history.length === 0 && <div style={{ fontSize: 12, color: "#334155", padding: "6px 10px" }}>No history yet</div>}
            {history.map((h, i) => (
              <div
                key={h._id || i}
                style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11.5, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "all .18s", border: "1px solid transparent", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,.08)"; e.currentTarget.style.color = "#818cf8"; e.currentTarget.style.borderColor = "rgba(99,102,241,.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "transparent"; }}
                onClick={() => {
                  const t = TOOLS.find(t => t.id === h.tool);
                  if (t) switchTool(h.tool);
                  setShowHistory(false);
                }}
                title={h.title}
              >
                <span style={{ fontSize: 11 }}>{TOOLS.find(t => t.id === h.tool)?.icon ? "" : "•"}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{h.title}</span>
              </div>
            ))}
            {history.length > 0 && (
              <Btn onClick={async () => { await api.clearHistory(); setHistory([]); }} variant="danger" style={{ margin: "6px 10px", width: "calc(100% - 20px)" }}>
                <Icon name="trash" size={12} /> Clear All
              </Btn>
            )}
          </>
        )}
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Tool header bar */}
        <div style={{ padding: "12px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "rgba(7,9,15,.6)", backdropFilter: "blur(16px)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: tc?.color + "22", border: `1px solid ${tc?.color}38`, boxShadow: `0 0 18px ${tc?.glow}`, color: tc?.color, flexShrink: 0 }}>
            <Icon name={tc?.icon} size={19} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{tc?.label}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{tc?.desc}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            {tool === "flashcards" && cards.length > 0 && (
              <Btn variant="amber">{cards.length} cards</Btn>
            )}
            {(tool === "diagram" || tool === "flowchart") && svg && (
              <Btn onClick={downloadSvg} variant="indigo"><Icon name="download" size={12} /> SVG</Btn>
            )}
            {busy && <Btn variant="ghost" disabled>Generating…</Btn>}
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────── */}

        {/* FLASHCARDS */}
        {tool === "flashcards" && cards.length > 0 ? (
          <Flashcards cards={cards} onNewTopic={(t) => send(t)} busy={busy} />

        /* DIAGRAM / FLOWCHART */
        ) : (tool === "diagram" || tool === "flowchart") ? (
          <>
            {svg ? (
              <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
                <div style={{ background: glassBg, backdropFilter: "blur(16px)", border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,.3)", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
                  <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: svg.replace(/<svg/, '<svg style="width:100%;height:100%;display:block;" preserveAspectRatio="xMidYMid meet"') }} />
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <Btn onClick={() => { setSvg(""); setMsgs([]); }} variant="indigo">↺ Regenerate</Btn>
                  <Btn onClick={downloadSvg} variant="ghost"><Icon name="download" size={12} /> Download SVG</Btn>
                </div>
              </div>
            ) : (
              <Welcome tool={tool} onSend={send} busy={busy} />
            )}
            {/* Input */}
            <div style={{ padding: "12px 24px 18px", borderTop: `1px solid ${border}`, background: "rgba(7,9,15,.6)", backdropFilter: "blur(16px)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 14, padding: "10px 14px", transition: "border-color .2s" }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(99,102,241,.45)"}
                onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,.09)"}
              >
                <textarea ref={taRef} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e2e8f0", fontSize: 14, fontFamily: "'Inter',sans-serif", resize: "none", lineHeight: 1.7, minHeight: 24, maxHeight: 130 }}
                  rows={1} placeholder="Describe concept to visualize…" value={inp}
                  onChange={e => setInp(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
                <button onClick={send} disabled={busy || !inp.trim()}
                  style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", cursor: "pointer", color: "#fff", fontSize: 17, flexShrink: 0, opacity: busy || !inp.trim() ? .3 : 1, transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 16px rgba(99,102,241,.4)" }}>
                  <Icon name="send" size={15} />
                </button>
              </div>
            </div>
          </>

        /* QUIZ */
        ) : tool === "quiz" && quizData ? (
          <Quiz questions={quizData} onRetry={() => { setQuizData(null); setMsgs([]); }} />

        /* CHAT / NOTES / SUMMARY / CODE / FORMULA */
        ) : (
          <>
            {msgs.length === 0 && !busy ? (
              <Welcome tool={tool} onSend={send} busy={busy} />
            ) : (
              <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: m.r === "u" ? "row-reverse" : "row", animation: "fadeUp .22s ease" }}>
                    {/* Avatar */}
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, boxShadow: "0 3px 12px rgba(0,0,0,.25)", background: m.r === "ai" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", fontSize: m.r === "ai" ? 0 : 12 }}>
                      {m.r === "ai" ? <Icon name="logo" size={17} /> : initials}
                    </div>
                    {/* Bubble */}
                    {m.r === "ai" ? (
                      <div style={{ maxWidth: "82%", background: glassBg, backdropFilter: "blur(20px)", border: `1px solid ${border}`, borderRadius: 18, borderBottomLeftRadius: 4, padding: "16px 20px", boxShadow: "0 4px 24px rgba(0,0,0,.2)" }}>
                        <Markdown text={m.t} />
                      </div>
                    ) : (
                      <div style={{ maxWidth: "72%", background: "linear-gradient(135deg,rgba(99,102,241,.28),rgba(139,92,246,.22))", backdropFilter: "blur(16px)", border: "1px solid rgba(99,102,241,.32)", borderRadius: 18, borderBottomRightRadius: 4, padding: "12px 17px", color: "#e0e7ff", fontSize: 14, lineHeight: 1.8, boxShadow: "0 4px 20px rgba(99,102,241,.18)", textAlign: "justify" }}>
                        {m.t}
                      </div>
                    )}
                  </div>
                ))}
                {busy && (
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      <Icon name="logo" size={17} />
                    </div>
                    <div style={{ background: glassBg, backdropFilter: "blur(16px)", border: `1px solid ${border}`, borderRadius: 18, borderBottomLeftRadius: 4, padding: "14px 18px" }}>
                      <Typing />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}

            {/* Input bar */}
            <div style={{ padding: "12px 28px 20px", borderTop: `1px solid ${border}`, background: "rgba(7,9,15,.7)", backdropFilter: "blur(20px)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 16, padding: "11px 15px", transition: "border-color .2s, box-shadow .2s" }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,.45)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99,102,241,.07)"; }}
                onBlurCapture={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,.09)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <textarea
                  ref={taRef}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e2e8f0", fontSize: 14, fontFamily: "'Inter',sans-serif", resize: "none", lineHeight: 1.75, minHeight: 24, maxHeight: 130 }}
                  rows={1}
                  placeholder={
                    tool === "chat"    ? "Ask any engineering question… (Enter to send)" :
                    tool === "code"    ? "Paste code or describe the problem…" :
                    tool === "quiz"    ? "Enter a topic to quiz yourself on…" :
                    tool === "formula" ? "Ask about any formula or equation…" :
                    `Enter topic for ${tc?.label?.toLowerCase()}…`
                  }
                  value={inp}
                  onChange={e => setInp(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {msgs.length > 0 && (
                    <button onClick={() => { setMsgs([]); setSessionId(null); }} title="Clear chat"
                      style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", cursor: "pointer", color: "#475569", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.1)"; e.currentTarget.style.color = "#f87171"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "#475569"; }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                  <button
                    onClick={send} disabled={busy || !inp.trim()}
                    style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", cursor: "pointer", color: "#fff", flexShrink: 0, opacity: busy || !inp.trim() ? .3 : 1, transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 16px rgba(99,102,241,.4)" }}
                    onMouseEnter={e => { if (!busy && inp.trim()) { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(99,102,241,.55)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 3px 16px rgba(99,102,241,.4)"; }}
                  >
                    <Icon name="send" size={15} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#1e293b", textAlign: "center", marginTop: 8 }}>
                Shift+Enter for new line · Enter to send
              </div>
            </div>
          </>
        )}
      </main>

      {/* API Key Modal */}
      {showKeyModal && (
        <ApiKeyModal
          current={apiKey}
          onClose={() => setShowKeyModal(false)}
          onSave={(k) => { setApiKey(k); setShowKeyModal(false); }}
        />
      )}
    </div>
  );
}
