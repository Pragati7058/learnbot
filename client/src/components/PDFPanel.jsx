import { useState, useRef } from "react";

const css = `
  @keyframes float-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.6); }
    50% { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes progress-fill {
    from { width: 0%; }
    to { width: 100%; }
  }
  @keyframes bar-grow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }
  .pdf-drop-zone {
    border-radius: 20px; padding: 40px 24px; text-align: center;
    background: rgba(255,255,255,0.02);
    border: 2px dashed rgba(255,255,255,0.08);
    cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden;
  }
  .pdf-drop-zone:hover, .pdf-drop-zone.drag-over {
    background: rgba(99,102,241,0.06);
    border-color: rgba(99,102,241,0.4);
    transform: scale(1.01);
  }
  .pdf-drop-zone:hover .upload-icon {
    transform: translateY(-4px) scale(1.1);
  }
  .upload-icon { transition: transform 0.3s ease; display: block; margin: 0 auto 12px; }
  .action-btn {
    padding: 8px 16px; border-radius: 10px; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.2s ease; letter-spacing: 0.3px;
    position: relative; overflow: hidden;
  }
  .action-btn:hover { transform: translateY(-2px); filter: brightness(1.15); }
  .action-btn:active { transform: translateY(0); }
  .action-btn.active {
    transform: translateY(-1px);
    filter: brightness(1.2);
  }
  .card-animate { animation: float-in 0.35s ease forwards; }
  .result-section { animation: float-in 0.4s ease forwards; }
  .page-bar {
    transform-origin: bottom;
    animation: bar-grow 0.6s ease forwards;
  }
`;

const ACTIONS = [
  { id: "summarize", label: "Summarize", icon: "📋", desc: "Key points & overview" },
  { id: "notes", label: "Generate Notes", icon: "📝", desc: "Structured study notes" },
  { id: "flashcards", label: "Flashcards", icon: "🃏", desc: "Q&A memory cards" },
  { id: "quiz", label: "Create Quiz", icon: "🧠", desc: "Test your knowledge" },
];

const MOCK_RESULTS = {
  summarize: `Chapter 4 covers Tree Data Structures — one of the most fundamental topics in CS.\n\n• Binary Trees: Each node has ≤2 children. Used in expression parsing & file systems.\n• BST (Binary Search Tree): Left < Root < Right. Enables O(log n) search.\n• AVL Trees: Self-balancing BST. Maintains height balance via rotations.\n• Heaps: Complete binary tree. Min-heap / Max-heap used in priority queues.\n\nKey complexity: Insert O(log n) · Search O(log n) · Delete O(log n)`,
  notes: `## Chapter 4 — Tree Data Structures\n\n### 4.1 Binary Tree\n- Max 2 children per node\n- Types: Full, Complete, Perfect, Degenerate\n\n### 4.2 Binary Search Tree\n- Property: left.val < node.val < right.val\n- Operations: insert, search, inorder traversal\n\n### 4.3 AVL Tree\n- Height-balanced BST\n- Balance factor = height(left) - height(right) ∈ {-1, 0, 1}\n- Rotations: LL, RR, LR, RL\n\n### 4.4 Heap\n- Always a complete binary tree\n- Heapify: O(n), Extract-min: O(log n)`,
  flashcards: `🃏 Card 1\nQ: What is the time complexity of BST search?\nA: O(log n) average, O(n) worst case (skewed tree)\n\n🃏 Card 2\nQ: What is the balance factor in AVL trees?\nA: height(left subtree) − height(right subtree) ∈ {-1, 0, 1}\n\n🃏 Card 3\nQ: What makes a heap different from a BST?\nA: Heap only guarantees parent > child (max-heap), not ordering between siblings\n\n🃏 Card 4\nQ: Name the 4 AVL rotation types\nA: LL (Right), RR (Left), LR (Left-Right), RL (Right-Left)`,
  quiz: `📝 Quiz — Chapter 4\n\nQ1. Which traversal of a BST gives sorted output?\na) Preorder  b) Inorder ✓  c) Postorder  d) Level-order\n\nQ2. An AVL tree with 7 nodes has a minimum height of:\na) 2  b) 3 ✓  c) 4  d) 7\n\nQ3. In a max-heap, the root contains:\na) Smallest element  b) Median  c) Largest element ✓  d) Last inserted\n\nQ4. Which rotation fixes an LR imbalance in AVL?\na) Single right  b) Single left  c) Left then Right ✓  d) Right then Left`,
};

export default function PDFPanel({ color = "#6366f1" }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeAction, setActiveAction] = useState(null);
  const [result, setResult] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const inputRef = useRef(null);

  // inject styles
  if (!document.getElementById("pdf-panel-css")) {
    const s = document.createElement("style");
    s.id = "pdf-panel-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setProcessing(true);
    setProgress(0);
    setActiveAction(null);
    setResult("");
    // simulate processing
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setProcessing(false), 300); }
      setProgress(Math.min(p, 100));
    }, 120);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleAction = (id) => {
    setLoadingAction(id);
    setActiveAction(id);
    setResult("");
    setTimeout(() => {
      setResult(MOCK_RESULTS[id]);
      setLoadingAction(null);
    }, 900);
  };

  const mockFileName = file?.name || "Data_Structures_Ch4.pdf";
  const mockSize = file ? (file.size / 1024 / 1024).toFixed(1) + " MB" : "2.4 MB";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Drop Zone ── */}
      {!file && !processing && (
        <div
          className={`pdf-drop-zone${dragging ? " drag-over" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {/* bg gradient blob */}
          <div style={{
            position: "absolute", inset: 0, opacity: dragging ? 0.12 : 0.05,
            background: `radial-gradient(ellipse at 50% 50%, ${color}, transparent 70%)`,
            transition: "opacity 0.3s",
          }} />

          <input
            ref={inputRef} type="file" accept=".pdf"
            style={{ display: "none" }}
            onChange={e => handleFile(e.target.files?.[0])}
          />

          {/* animated upload icon */}
          <div className="upload-icon" style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${color}25, ${color}10)`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            📄
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
            Drop your PDF here
          </div>
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>
            or click to browse files
          </div>

          {/* format badges */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {["Textbooks", "Notes", "Research Papers", "Slides"].map(t => (
              <span key={t} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Processing Bar ── */}
      {processing && (
        <div className="card-animate" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</div>
            <div>
              <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{mockFileName}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>Extracting & analyzing…</div>
            </div>
            <div style={{ marginLeft: "auto", width: 18, height: 18, border: `2px solid ${color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
          {/* progress bar */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, height: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 8, width: `${progress}%`, transition: "width 0.15s ease",
              background: `linear-gradient(90deg, ${color}, #8b5cf6)`,
              boxShadow: `0 0 8px ${color}80`,
            }} />
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 6, textAlign: "right" }}>{Math.round(progress)}%</div>
        </div>
      )}

      {/* ── File Card ── */}
      {file && !processing && (
        <div className="card-animate" style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📘</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mockFileName}</div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{mockSize} · 48 pages · 12,400 words extracted</div>
              {/* mini page distribution chart */}
              <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14, marginTop: 6 }}>
                {[6, 9, 12, 8, 14, 10, 7, 11, 9, 13].map((h, i) => (
                  <div key={i} className="page-bar" style={{
                    width: 4, borderRadius: 2, height: h,
                    background: `${color}${50 + i * 5 > 99 ? 99 : 50 + i * 5}`,
                    animationDelay: `${i * 0.04}s`,
                  }} />
                ))}
                <span style={{ fontSize: 9, color: "#334155", marginLeft: 4, marginBottom: 1 }}>content density</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", animation: "pulse-dot 2s infinite" }} />
              <button onClick={() => { setFile(null); setResult(""); setActiveAction(null); }}
                style={{ fontSize: 9, padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#475569", cursor: "pointer" }}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      {file && !processing && (
        <div className="card-animate" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {ACTIONS.map(({ id, label, icon, desc }) => (
            <button
              key={id}
              className={`action-btn${activeAction === id ? " active" : ""}`}
              onClick={() => handleAction(id)}
              style={{
                background: activeAction === id ? `linear-gradient(135deg, ${color}30, ${color}18)` : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeAction === id ? color + "50" : "rgba(255,255,255,0.08)"}`,
                color: activeAction === id ? color : "#94a3b8",
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
                padding: "10px 12px", textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
                {loadingAction === id && (
                  <div style={{ marginLeft: "auto", width: 12, height: 12, border: `2px solid ${color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                )}
              </div>
              <span style={{ fontSize: 9, color: "#334155", fontWeight: 400 }}>{desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="result-section" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: 1 }}>
              {ACTIONS.find(a => a.id === activeAction)?.icon} {ACTIONS.find(a => a.id === activeAction)?.label.toUpperCase()}
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(result)}
              style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: `${color}15`, border: `1px solid ${color}25`, color, cursor: "pointer", fontWeight: 600 }}
            >
              Copy
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result}</div>
        </div>
      )}

      {/* ── Empty prompt if no file ── */}
      {!file && !processing && (
        <div style={{ textAlign: "center", fontSize: 11, color: "#1e293b", padding: "4px 0" }}>
          Supports up to 50MB · Encrypted in transit
        </div>
      )}
    </div>
  );
}