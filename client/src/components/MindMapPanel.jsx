import { useState, useRef, useCallback } from "react";
import { callAI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const BRANCH_COLORS = ["#10b981", "#f59e0b", "#06b6d4", "#ec4899", "#f97316", "#8b5cf6", "#14b8a6", "#ef4444"];

const DEFAULT_NODES = [
  { id: "root", label: "Data Structures", x: 320, y: 220, radius: 52, depth: 0, color: "#6366f1", parent: null, desc: "Organized formats for storing & accessing data efficiently." },
  { id: "tree", label: "Trees", x: 130, y: 105, radius: 36, depth: 1, color: "#10b981", parent: "root", desc: "Hierarchical nodes with a root and child subtrees." },
  { id: "graph", label: "Graphs", x: 510, y: 105, radius: 36, depth: 1, color: "#f59e0b", parent: "root", desc: "Nodes connected by edges — directed or undirected." },
  { id: "linear", label: "Linear", x: 100, y: 345, radius: 36, depth: 1, color: "#06b6d4", parent: "root", desc: "Elements arranged sequentially in memory or links." },
  { id: "hash", label: "Hashing", x: 540, y: 345, radius: 36, depth: 1, color: "#ec4899", parent: "root", desc: "Key-value storage using hash functions for O(1) access." },
  { id: "bst", label: "BST", x: 40, y: 15, radius: 26, depth: 2, color: "#10b981", parent: "tree", desc: "Left < Root < Right. O(log n) search in balanced form." },
  { id: "avl", label: "AVL", x: 155, y: 15, radius: 26, depth: 2, color: "#10b981", parent: "tree", desc: "Self-balancing BST. Height diff ≤1 at every node." },
  { id: "bfs", label: "BFS", x: 455, y: 15, radius: 26, depth: 2, color: "#f59e0b", parent: "graph", desc: "Explores level-by-level using a queue." },
  { id: "dfs", label: "DFS", x: 565, y: 15, radius: 26, depth: 2, color: "#f59e0b", parent: "graph", desc: "Explores as deep as possible before backtracking." },
  { id: "stack", label: "Stack", x: 30, y: 432, radius: 26, depth: 2, color: "#06b6d4", parent: "linear", desc: "LIFO — Last In, First Out. Push and pop from top." },
  { id: "queue", label: "Queue", x: 155, y: 432, radius: 26, depth: 2, color: "#06b6d4", parent: "linear", desc: "FIFO — First In, First Out. Enqueue and dequeue." },
  { id: "map", label: "HashMap", x: 482, y: 432, radius: 26, depth: 2, color: "#ec4899", parent: "hash", desc: "Key→Value pairs. Average O(1) insert, search, delete." },
  { id: "set", label: "HashSet", x: 604, y: 432, radius: 26, depth: 2, color: "#ec4899", parent: "hash", desc: "Unique values only. Built on HashMap internally." },
];

const MINDMAP_PROMPT = `You are a mind map generator. When given a topic, respond ONLY with a valid JSON array of nodes.
Each node must have:
- id: unique string (no spaces, use underscores)
- label: short display name (max 12 chars)
- depth: 0 for root, 1 for branches, 2 for leaves
- parent: null for root, parent node id for others
- desc: one sentence description (max 80 chars)

Rules:
- Exactly 1 root node (depth 0)
- 3 to 5 branch nodes (depth 1), each with parent = root id
- 2 leaf nodes per branch (depth 2)
- Total nodes: 10-16
- Respond ONLY with the JSON array, no markdown, no explanation.`;

function layoutNodes(rawNodes) {
  const root = rawNodes.find(n => n.depth === 0);
  const branches = rawNodes.filter(n => n.depth === 1);
  const leaves = rawNodes.filter(n => n.depth === 2);
  const cx = 320, cy = 230;
  const result = [];
  result.push({ ...root, x: cx, y: cy, radius: 52, color: "#6366f1" });
  branches.forEach((b, i) => {
    const angle = (2 * Math.PI * i) / branches.length - Math.PI / 2;
    const bx = cx + Math.cos(angle) * 185;
    const by = cy + Math.sin(angle) * 155;
    const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
    result.push({ ...b, x: Math.round(bx), y: Math.round(by), radius: 36, color });
    const myLeaves = leaves.filter(l => l.parent === b.id);
    myLeaves.forEach((leaf, j) => {
      const spread = myLeaves.length === 1 ? 0 : (j / (myLeaves.length - 1) - 0.5) * 1.1;
      const lx = bx + Math.cos(angle + spread) * 130;
      const ly = by + Math.sin(angle + spread) * 110;
      result.push({ ...leaf, x: Math.round(lx), y: Math.round(ly), radius: 26, color });
    });
  });
  const minX = Math.min(...result.map(n => n.x - n.radius));
  const minY = Math.min(...result.map(n => n.y - n.radius));
  const shiftX = minX < 30 ? 30 - minX : 0;
  const shiftY = minY < 30 ? 30 - minY : 0;
  return result.map(n => ({ ...n, x: n.x + shiftX, y: n.y + shiftY }));
}

function getCurvedPath(ax, ay, bx, by) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const dx = bx - ax, dy = by - ay;
  return `M${ax},${ay} Q${mx - dy * 0.18},${my + dx * 0.18} ${bx},${by}`;
}

export default function MindMapPanel({ onClose }) {
  const { apiKey } = useAuth();
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [topic, setTopic] = useState("Data Structures");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const svgRef = useRef(null);

  const getSVGCoords = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom };
  }, [pan, zoom]);

  const generate = async () => {
    const q = topic.trim();
    if (!q) return;
    if (!apiKey) { setError("Set your Groq API key first (click 'Set API Key' in header)."); return; }
    setLoading(true); setError(""); setSelected(null);
    try {
      const raw = await callAI(apiKey, [{ role: "user", content: `Generate a mind map for: ${q}` }], MINDMAP_PROMPT);
      const clean = raw.replace(/```json|```/gi, "").trim();
      let arr;
      try { arr = JSON.parse(clean); }
      catch { const m = clean.match(/\[[\s\S]*\]/); if (m) arr = JSON.parse(m[0]); else throw new Error("Bad JSON"); }
      if (!Array.isArray(arr) || arr.length === 0) throw new Error("Empty");
      setNodes(layoutNodes(arr));
      setPan({ x: 0, y: 0 }); setZoom(1);
    } catch { setError("Generation failed — check API key or try again."); }
    setLoading(false);
  };

  const onNodeMouseDown = useCallback((e, id) => {
    e.stopPropagation();
    const { x, y } = getSVGCoords(e);
    const node = nodes.find(n => n.id === id);
    setDragging(id); setSelected(id);
    setDragOffset({ x: x - node.x, y: y - node.y });
  }, [nodes, getSVGCoords]);

  const onSVGMouseDown = useCallback((e) => {
    if (dragging) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setSelected(null);
  }, [dragging, pan]);

  const onMouseMove = useCallback((e) => {
    if (dragging) {
      const { x, y } = getSVGCoords(e);
      setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: x - dragOffset.x, y: y - dragOffset.y } : n));
    } else if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [dragging, dragOffset, getSVGCoords, isPanning, panStart]);

  const onMouseUp = useCallback(() => { setDragging(null); setIsPanning(false); }, []);

  const nm = Object.fromEntries(nodes.map(n => [n.id, n]));
  const edges = nodes.filter(n => n.parent).map(n => ({ from: n.parent, to: n.id }));
  const selNode = selected ? nm[selected] : null;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={topic} onChange={e => { setTopic(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && !loading && generate()}
          placeholder="Enter any topic…" disabled={loading}
          style={{ flex: 1, background: "var(--glass-bg,rgba(255,255,255,0.05))", border: "1px solid var(--glass-border,rgba(255,255,255,0.1))", borderRadius: 10, padding: "8px 13px", color: "var(--text-primary,#f1f5f9)", fontSize: 13, outline: "none", fontFamily: "inherit", opacity: loading ? 0.6 : 1 }}
          onFocus={e => e.target.style.borderColor = "#6366f1"}
          onBlur={e => e.target.style.borderColor = "var(--glass-border,rgba(255,255,255,0.1))"}
        />
        <button onClick={generate} disabled={loading || !topic.trim()}
          style={{ padding: "8px 16px", borderRadius: 10, background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, minWidth: 116 }}>
          {loading
            ? <><span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />Generating…</>
            : "⚡ Generate"}
        </button>
        {[["zi", "+", "Zoom in", () => setZoom(z => Math.min(z + .15, 2.5))], ["zo", "−", "Zoom out", () => setZoom(z => Math.max(z - .15, .35))], ["zr", "↺", "Reset", () => { setZoom(1); setPan({ x: 0, y: 0 }); }]].map(([id, lbl, title, fn]) => (
          <button key={id} onClick={fn} title={title} style={{ width: 32, height: 32, borderRadius: 8, background: "var(--glass-bg,rgba(255,255,255,0.05))", border: "1px solid var(--glass-border,rgba(255,255,255,0.1))", color: "#94a3b8", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>{lbl}</button>
        ))}
      </div>

      {error && (
        <div style={{ fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px" }}>⚠ {error}</div>
      )}

      {/* Canvas + Sidebar */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1, background: "rgba(0,0,0,0.28)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", position: "relative" }}>
          <svg width="100%" height="480" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .15 }}>
            <defs><pattern id="mmDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#6366f1" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#mmDots)" />
          </svg>
          {loading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", borderRadius: 16, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Building map for <strong style={{ color: "#a5b4fc" }}>{topic}</strong>…</div>
            </div>
          )}
          <svg ref={svgRef} width="100%" height="480" style={{ display: "block", cursor: isPanning ? "grabbing" : "grab" }}
            onMouseDown={onSVGMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onWheel={e => { e.preventDefault(); setZoom(z => Math.max(.35, Math.min(2.5, z - e.deltaY * .001))); }}
          >
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {edges.map(({ from, to }) => {
                const a = nm[from], b = nm[to]; if (!a || !b) return null;
                const hi = selected === from || selected === to;
                return <path key={`${from}-${to}`} d={getCurvedPath(a.x, a.y, b.x, b.y)} fill="none" stroke={hi ? nm[to].color : "rgba(255,255,255,0.1)"} strokeWidth={hi ? 2 : 1.2} strokeDasharray={nm[to].depth === 2 ? "5,4" : "none"} style={{ transition: "stroke .25s" }} />;
              })}
              {nodes.map(n => {
                const isSel = selected === n.id, isHov = hovered === n.id;
                const parentSel = n.parent && selected === n.parent;
                const dim = selected && !isSel && !parentSel;
                return (
                  <g key={n.id} onMouseDown={e => onNodeMouseDown(e, n.id)} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer", opacity: dim ? .25 : 1, transition: "opacity .2s" }}>
                    {isSel && <circle cx={n.x} cy={n.y} r={n.radius + 12} fill="none" stroke={n.color} strokeWidth="1" opacity="0.3" />}
                    {isHov && !isSel && <circle cx={n.x} cy={n.y} r={n.radius + 8} fill="none" stroke={n.color} strokeWidth="1" opacity="0.2" />}
                    <circle cx={n.x} cy={n.y} r={n.radius} fill={isSel ? n.color + "40" : isHov ? n.color + "28" : n.color + (n.depth === 0 ? "2a" : "18")} stroke={isSel || isHov ? n.color : n.color + "55"} strokeWidth={isSel ? 2.5 : n.depth === 0 ? 2 : 1.2} style={{ transition: "all .2s" }} />
                    {n.depth === 0 && <circle cx={n.x} cy={n.y} r={n.radius + 9} fill="none" stroke={n.color + "22"} strokeWidth="1.5" />}
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fill={isSel ? n.color : n.depth === 0 ? "#f1f5f9" : "#cbd5e1"} fontSize={n.depth === 0 ? 11 : n.depth === 1 ? 10 : 9} fontWeight={n.depth === 0 ? 700 : 600} fontFamily="Inter,sans-serif" style={{ pointerEvents: "none", userSelect: "none" }}>{n.label}</text>
                  </g>
                );
              })}
            </g>
          </svg>
          <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, color: "rgba(255,255,255,0.22)", fontFamily: "monospace" }}>{Math.round(zoom * 100)}% · drag · scroll</div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 176, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 14, border: `1px solid ${selNode ? selNode.color + "44" : "rgba(255,255,255,0.07)"}`, padding: "14px", minHeight: 120, transition: "border-color .25s" }}>
            {selNode ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: selNode.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3 }}>{selNode.label}</div>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.65 }}>{selNode.desc || "—"}</div>
                <div style={{ marginTop: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {["Depth " + selNode.depth, selNode.depth === 0 ? "Root" : selNode.depth === 1 ? "Branch" : "Leaf"].map(t => (
                    <span key={t} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: selNode.color + "22", color: selNode.color, border: `0.5px solid ${selNode.color}40`, fontWeight: 700 }}>{t}</span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 6, paddingTop: 16 }}>
                <div style={{ fontSize: 24, opacity: .15 }}>◎</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.5 }}>Click a node<br />to inspect</div>
              </div>
            )}
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "12px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>Stats</div>
            {[["Nodes", nodes.length], ["Edges", edges.length], ["Topic", topic.slice(0, 14)]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748b" }}>{l}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(99,102,241,0.06)", borderRadius: 12, border: "1px solid rgba(99,102,241,0.15)", padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#818cf8", lineHeight: 1.6 }}>💡 Type any topic + click <strong>Generate</strong> to build a new AI map</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {[["Export PNG", "↓", "#6366f1"], ["Export SVG", "↓", "#8b5cf6"], ["Link Cards", "⊞", "#10b981"], ["Share", "↗", "#06b6d4"]].map(([l, i, c]) => (
          <button key={l} style={{ flex: 1, padding: "8px 6px", borderRadius: 10, fontSize: 10.5, fontWeight: 600, cursor: "pointer", background: c + "14", border: `1px solid ${c}30`, color: c, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "inherit", transition: "all .18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = c + "28"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = c + "14"; e.currentTarget.style.transform = "none"; }}>
            <span style={{ fontSize: 12 }}>{i}</span>{l}
          </button>
        ))}
      </div>
    </div>
  );
}