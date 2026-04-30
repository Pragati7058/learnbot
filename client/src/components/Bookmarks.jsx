import { useState, useEffect } from "react";
import { api } from "../utils/api";
import Icon from "./Icon";

const TOOL_COLORS = {
  chat: "#6366f1", notes: "#0891b2", summary: "#059669",
  flashcards: "#d97706", diagram: "#7c3aed", flowchart: "#be185d",
  code: "#0f766e", formula: "#b45309", quiz: "#7c3aed",
};

function Tag({ label, onRemove }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 6, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)", fontSize: 10, color: "#a5b4fc", fontWeight: 600 }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#818cf8", fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
      )}
    </span>
  );
}

function BookmarkCard({ bm, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const color = TOOL_COLORS[bm.tool] || "#6366f1";
  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--panel-border)", borderRadius: 14, padding: "14px 16px", cursor: "pointer" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color + "40"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--panel-border)"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 5, boxShadow: `0 0 8px ${color}` }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bm.title}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{bm.tool} · {new Date(bm.createdAt).toLocaleDateString()}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--panel-border)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{expanded ? "▲" : "▼"}</button>
          <button onClick={() => onDelete(bm._id)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", cursor: "pointer", color: "#f87171", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      </div>
      {bm.tags?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {bm.tags.map(t => <Tag key={t} label={t} />)}
        </div>
      )}
      {bm.note && (
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontStyle: "italic", marginBottom: 6, padding: "6px 10px", background: "var(--card-bg)", borderRadius: 6, borderLeft: `2px solid ${color}40` }}>{bm.note}</div>
      )}
      {expanded && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--card-bg-deep)", borderRadius: 8, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, maxHeight: 200, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {bm.contentType === "svg" ? <div dangerouslySetInnerHTML={{ __html: bm.content.slice(0, 2000) }} /> : bm.content.slice(0, 800) + (bm.content.length > 800 ? "…" : "")}
        </div>
      )}
    </div>
  );
}

export default function Bookmarks({ onClose }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api.getBookmarks().then(d => setBookmarks(d.bookmarks || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await api.deleteBookmark(id).catch(() => {});
    setBookmarks(b => b.filter(x => x._id !== id));
  };

  const filtered = bookmarks.filter(bm => {
    const matchTool = filter === "all" || bm.tool === filter;
    const matchSearch = !search || bm.title.toLowerCase().includes(search.toLowerCase()) || bm.note?.toLowerCase().includes(search.toLowerCase());
    return matchTool && matchSearch;
  });

  const tools = ["all", ...new Set(bookmarks.map(b => b.tool))];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 400, height: "100vh", background: "var(--panel-bg)", borderLeft: "1px solid var(--panel-border)", display: "flex", flexDirection: "column", animation: "slideInRight 0.25s ease" }}>
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--panel-border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="star" size={16} style={{ color: "#fbbf24" }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Bookmarks</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{bookmarks.length} saved</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: "var(--card-bg)", border: "1px solid var(--panel-border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 15 }}>✕</button>
        </div>
        <div style={{ padding: "12px 16px 8px" }}>
          <input placeholder="Search bookmarks…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 9, background: "var(--input-bg)", border: "1px solid var(--panel-border)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ padding: "0 16px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tools.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${filter === t ? "#6366f1" : "var(--panel-border)"}`, background: filter === t ? "rgba(99,102,241,0.15)" : "transparent", color: filter === t ? "#a5b4fc" : "var(--text-muted)", fontSize: 11, cursor: "pointer", fontWeight: 600, textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          {loading && <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 40 }}>Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 60, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔖</div>
              <div style={{ fontSize: 13 }}>No bookmarks yet</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>Save AI responses to review them later</div>
            </div>
          )}
          {filtered.map(bm => <BookmarkCard key={bm._id} bm={bm} onDelete={handleDelete} />)}
        </div>
        {bookmarks.length > 0 && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--panel-border)" }}>
            <button onClick={async () => { await api.clearBookmarks().catch(() => {}); setBookmarks([]); }} style={{ width: "100%", padding: "9px", borderRadius: 9, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Clear All Bookmarks</button>
          </div>
        )}
      </div>
    </div>
  );
}