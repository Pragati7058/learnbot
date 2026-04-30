import { useState, useRef, useEffect } from "react";

const INITIAL_MEMBERS = [
  { name: "Priya", tool: "Notes", status: "active", color: "#534AB7", bg: "#EEEDFE", initial: "P" },
  { name: "Arjun", tool: "Quiz", status: "active", color: "#085041", bg: "#E1F5EE", initial: "A" },
  { name: "Sam", tool: null, status: "idle", color: "#633806", bg: "#FAEEDA", initial: "S" },
];

const INITIAL_CHAT = [
  { user: "Priya", text: "Can you explain binary trees?", time: "2m ago", color: "#534AB7" },
  { user: "Arjun", text: "Check the notes I just generated!", time: "1m ago", color: "#085041" },
];

const AUTO_REPLIES = [
  "Good question! Let's look at that together.",
  "I know this one — check the notes I pinned!",
  "Ask Claude about it, I just did and it helped a lot.",
  "Great point! I'll add it to our quiz.",
];

const BADGE_STYLES = {
  Notes: { background: "#EEEDFE", color: "#3C3489" },
  Quiz: { background: "#E1F5EE", color: "#085041" },
  Chat: { background: "#FAEEDA", color: "#633806" },
  Idle: { background: "#F1EFE8", color: "#5F5E5A" },
};

export default function CollabPanel({ color = "#7F77DD" }) {
  const [members] = useState(INITIAL_MEMBERS);
  const [selected, setSelected] = useState(null);
  const [chat, setChat] = useState(INITIAL_CHAT);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typer, setTyper] = useState("");
  const chatRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    clearTimeout(typingTimer.current);
    setIsTyping(true);
    setTyper("You");
    typingTimer.current = setTimeout(() => setIsTyping(false), 1200);
  };

  const sendMsg = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setIsTyping(false);
    setChat((prev) => [...prev, { user: "You", text, time: "Just now", color }]);

    const responder = INITIAL_MEMBERS[Math.floor(Math.random() * 2)];
    setTimeout(() => {
      setIsTyping(true);
      setTyper(responder.name);
    }, 600);
    setTimeout(() => {
      setIsTyping(false);
      setChat((prev) => [
        ...prev,
        {
          user: responder.name,
          text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
          time: "Just now",
          color: responder.color,
        },
      ]);
    }, 2200);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMsg();
  };

  const activeCount = members.filter((m) => m.status === "active").length;

  return (
    <div style={styles.panel}>
      {/* Room row */}
      <div style={styles.roomRow}>
        <div style={styles.roomCard}>
          <div style={styles.shimmerBar} />
          <div style={styles.chip}>Room code</div>
          <div style={styles.roomCode}>LB-4829</div>
        </div>
        <div style={styles.onlineCard}>
          <div style={styles.chip}>Online</div>
          <div style={styles.onlineNum}>{activeCount}</div>
          <span style={styles.pulseDot}>
            <span style={styles.pulseRing} />
          </span>
        </div>
      </div>

      {/* Members */}
      <div>
        <div style={styles.sectionLabel}>Members</div>
        {members.map((m) => (
          <div
            key={m.name}
            style={{
              ...styles.memberItem,
              ...(selected === m.name ? styles.memberSelected : {}),
            }}
            onClick={() => setSelected(selected === m.name ? null : m.name)}
          >
            <div style={{ ...styles.avatar, background: m.bg, color: m.color }}>
              {m.initial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={styles.memberName}>{m.name}</div>
              <div style={styles.memberSub}>{m.tool ? `Using: ${m.tool}` : "Idle"}</div>
            </div>
            <span style={{ ...styles.badge, ...BADGE_STYLES[m.tool || "Idle"] }}>
              {m.tool || "Idle"}
            </span>
            <span
              style={{
                ...styles.statusDot,
                background: m.status === "active" ? "#1D9E75" : "#888780",
                boxShadow: m.status === "active" ? "0 0 0 3px rgba(29,158,117,0.2)" : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Chat */}
      <div style={styles.chatBox}>
        <div style={styles.chatHeader}>
          <span style={{ ...styles.statusDot, background: "#1D9E75", boxShadow: "0 0 0 3px rgba(29,158,117,0.2)" }} />
          <div style={styles.sectionLabel}>Live chat</div>
        </div>

        <div style={styles.chatMessages} ref={chatRef}>
          {chat.map((c, i) => (
            <div key={i} style={styles.msg}>
              <div style={{ ...styles.msgUser, color: c.color }}>{c.user}</div>
              <div style={styles.msgBubble}>{c.text}</div>
              <div style={styles.msgTime}>{c.time}</div>
            </div>
          ))}
          {isTyping && (
            <div style={styles.msg}>
              <div style={{ ...styles.msgUser, color: "#888780" }}>{typer}</div>
              <div style={styles.typingBubble}>
                <span style={{ ...styles.typingDot, animationDelay: "0s" }} />
                <span style={{ ...styles.typingDot, animationDelay: "0.15s" }} />
                <span style={{ ...styles.typingDot, animationDelay: "0.3s" }} />
              </div>
            </div>
          )}
        </div>

        <div style={styles.inputRow}>
          <input
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKey}
            placeholder="Message room…"
            style={styles.chatInput}
          />
          <button onClick={sendMsg} style={styles.sendBtn}>Send</button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&family=Sora:wght@400;600;700&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulseRing { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2.2);opacity:0} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const styles = {
  panel: {
    fontFamily: "'Sora', sans-serif",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
  },
  chip: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#888780",
    marginBottom: 4,
  },
  roomRow: { display: "grid", gridTemplateColumns: "1fr auto", gap: 10 },
  roomCard: {
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "12px 14px",
    position: "relative",
    overflow: "hidden",
  },
  shimmerBar: {
    position: "absolute", top: 0, left: 0, right: 0, height: 2,
    background: "linear-gradient(90deg,#7F77DD,#1D9E75,#7F77DD)",
    backgroundSize: "200% 100%",
    animation: "shimmer 3s linear infinite",
  },
  roomCode: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 5,
    color: "#f1f5f9",
  },
  onlineCard: {
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "12px 14px",
    textAlign: "center",
  },
  onlineNum: { fontSize: 26, fontWeight: 700, color: "#1D9E75", lineHeight: 1 },
  pulseDot: {
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: "#1D9E75", position: "relative", marginTop: 6,
  },
  pulseRing: {
    position: "absolute", top: -3, left: -3, width: 14, height: 14,
    borderRadius: "50%", border: "1.5px solid #1D9E75",
    animation: "pulseRing 1.4s ease-out infinite",
  },
  sectionLabel: {
    fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
    textTransform: "uppercase", color: "#475569", marginBottom: 8,
  },
  memberItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 8, marginBottom: 6,
    background: "rgba(255,255,255,0.02)",
    border: "0.5px solid rgba(255,255,255,0.07)",
    cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
  },
  memberSelected: {
    borderColor: "#7F77DD",
    background: "rgba(127,119,221,0.08)",
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  memberName: { fontSize: 13, fontWeight: 600, color: "#e2e8f0" },
  memberSub: { fontSize: 11, color: "#475569" },
  badge: {
    fontSize: 10, padding: "2px 8px", borderRadius: 20,
    fontWeight: 600, marginRight: 4,
  },
  statusDot: {
    width: 7, height: 7, borderRadius: "50%",
    flexShrink: 0, transition: "background 0.3s",
  },
  chatBox: {
    background: "rgba(255,255,255,0.02)",
    border: "0.5px solid rgba(255,255,255,0.08)",
    borderRadius: 12, overflow: "hidden",
  },
  chatHeader: {
    padding: "10px 14px",
    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
    display: "flex", alignItems: "center", gap: 8,
  },
  chatMessages: {
    padding: "10px 12px",
    display: "flex", flexDirection: "column", gap: 8,
    maxHeight: 180, overflowY: "auto",
  },
  msg: { animation: "fadeUp 0.3s ease" },
  msgUser: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  msgBubble: {
    fontSize: 12, color: "#94a3b8", lineHeight: 1.5,
    background: "rgba(255,255,255,0.04)",
    padding: "6px 10px",
    borderRadius: "0 8px 8px 8px",
    display: "inline-block",
  },
  msgTime: { fontSize: 10, color: "#334155", marginTop: 2 },
  typingBubble: {
    background: "rgba(255,255,255,0.04)",
    padding: "8px 12px", borderRadius: "0 8px 8px 8px",
    display: "inline-flex", gap: 4, alignItems: "center",
  },
  typingDot: {
    display: "inline-block", width: 5, height: 5,
    borderRadius: "50%", background: "#475569",
    animation: "bounce 1s infinite",
  },
  inputRow: {
    padding: "10px 12px",
    borderTop: "0.5px solid rgba(255,255,255,0.06)",
    display: "flex", gap: 8, alignItems: "center",
  },
  chatInput: {
    flex: 1, background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "7px 11px",
    color: "#e2e8f0", fontSize: 12,
    fontFamily: "'Sora', sans-serif", outline: "none",
  },
  sendBtn: {
    padding: "7px 14px", borderRadius: 8,
    background: "#7F77DD", border: "none",
    color: "#fff", fontSize: 12, fontWeight: 700,
    cursor: "pointer", fontFamily: "'Sora', sans-serif",
  },
};