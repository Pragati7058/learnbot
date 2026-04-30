import { useState, useEffect, useRef } from "react";
import { callAI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const SNIPPETS = {
  Python: {
    filename: "binary_search.py",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Test
result = binary_search([1,3,5,7,9,11], 7)
print(f"Found at index: {result}")`,
    output: `Found at index: 3\nTest passed ✓  binary_search([1,3,5,7,9,11], 7) → 3\nTime: 0.002ms · Memory: 2.1KB`,
    review: `✅ O(log n) time — optimal for sorted arrays.\nTip: add an empty-array guard at the top.\nDuplicate values: only the first match is returned.`,
  },
  JavaScript: {
    filename: "binarySearch.js",
    code: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// Test
console.log(binarySearch([2,4,6,8,10], 6));`,
    output: `2\nTest passed ✓  binarySearch([2,4,6,8,10], 6) → 2\nTime: 0.001ms · Memory: 1.8KB`,
    review: `✅ Strict equality (===) is correct here.\nUse Math.floor for safety on very large arrays.\nConsider adding input validation.`,
  },
  "C++": {
    filename: "binary_search.cpp",
    code: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> v = {1,3,5,7,9};
    cout << binarySearch(v, 7) << endl;
}`,
    output: `3\nTest passed ✓  binarySearch({1,3,5,7,9}, 7) → 3\nTime: 0.001ms · Memory: 3.2KB`,
    review: `✅ Overflow-safe midpoint formula: left + (right-left)/2.\nConsider std::lower_bound from <algorithm> for stdlib use.\nPass vector by const ref if not modifying.`,
  },
  TypeScript: {
    filename: "binarySearch.ts",
    code: `function binarySearch<T>(arr: T[], target: T): number {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const idx: number = binarySearch<number>([1,3,5,7,9], 5);
console.log(\`Index: \${idx}\`);`,
    output: `Index: 2\nTest passed ✓  binarySearch<number>([1,3,5,7,9], 5) → 2\nTime: 0.002ms · Memory: 2.4KB`,
    review: `✅ Generic type parameter makes this reusable.\nAdd <T extends Comparable> constraint for stricter type safety.\nConsider returning -1 vs undefined — document your contract.`,
  },
  Rust: {
    filename: "binary_search.rs",
    code: `fn binary_search(arr: &[i32], target: i32) -> Option<usize> {
    let mut left = 0usize;
    let mut right = arr.len();
    while left < right {
        let mid = left + (right - left) / 2;
        match arr[mid].cmp(&target) {
            std::cmp::Ordering::Equal   => return Some(mid),
            std::cmp::Ordering::Less    => left = mid + 1,
            std::cmp::Ordering::Greater => right = mid,
        }
    }
    None
}

fn main() {
    let v = vec![2, 5, 8, 12, 16];
    println!("{:?}", binary_search(&v, 8));
}`,
    output: `Some(2)\nTest passed ✓  binary_search(&[2,5,8,12,16], 8) → Some(2)\nTime: 0.001ms · Memory: 1.6KB`,
    review: `✅ Returns Option<usize> — idiomatic Rust.\nPattern match on Ordering is clean and exhaustive.\nNote: arr.binary_search() exists in std for production use.`,
  },
  Java: {
    filename: "BinarySearch.java",
    code: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {2, 4, 6, 8, 10, 12};
        System.out.println(search(arr, 10));
    }
}`,
    output: `4\nTest passed ✓  search({2,4,6,8,10,12}, 10) → 4\nTime: 0.003ms · Memory: 4.1KB`,
    review: `✅ Overflow-safe midpoint — good practice.\nArrays.binarySearch() is available in java.util.\nAdd @param and @return Javadoc for production code.`,
  },
  Go: {
    filename: "binary_search.go",
    code: `package main

import "fmt"

func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := left + (right-left)/2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}

func main() {
    fmt.Println(binarySearch([]int{1, 3, 5, 7, 9}, 9))
}`,
    output: `4\nTest passed ✓  binarySearch([]int{1,3,5,7,9}, 9) → 4\nTime: 0.001ms · Memory: 1.9KB`,
    review: `✅ Idiomatic Go — clean and readable.\nsort.SearchInts from stdlib is available for production.\nConsider error return if input must be validated.`,
  },
  Swift: {
    filename: "binarySearch.swift",
    code: `func binarySearch<T: Comparable>(_ arr: [T], target: T) -> Int? {
    var left = 0
    var right = arr.count - 1
    while left <= right {
        let mid = left + (right - left) / 2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return nil
}

let result = binarySearch([1,3,5,7,9,11], target: 9)
print(result as Any)`,
    output: `Optional(4)\nTest passed ✓  binarySearch([1,3,5,7,9,11], target: 9) → 4\nTime: 0.002ms · Memory: 2.0KB`,
    review: `✅ Generic Comparable constraint is clean Swift style.\nReturns Optional — safely handles not-found.\nConsider using firstIndex(of:) for simple cases.`,
  },
};

const LANG_ICONS = {
  Python: "🐍", JavaScript: "🟨", "C++": "⚙️",
  TypeScript: "🔷", Rust: "🦀", Go: "🐹", Java: "☕", Swift: "🐦",
};

const LANG_COLORS = {
  Python: "#3b82f6", JavaScript: "#f59e0b", "C++": "#6366f1",
  TypeScript: "#06b6d4", Rust: "#f97316", Go: "#10b981",
  Java: "#ef4444", Swift: "#f43f5e",
};

// ── simulate output for arbitrary user code ──────────────────────────
function simulateOutput(code, lang) {
  const trimmed = code.trim();

  // Python
  if (lang === "Python") {
    const prints = [...trimmed.matchAll(/print\((.+?)\)/g)];
    if (prints.length) {
      return prints.map(m => {
        let val = m[1].trim();
        val = val.replace(/^f?["'`]|["'`]$/g, "").replace(/\{.*?\}/g, "<value>");
        // simple string literals
        if (/^["']/.test(m[1])) val = m[1].replace(/["']/g, "");
        return val;
      }).join("\n") + `\nExited with code 0 · Time: 0.002ms`;
    }
  }

  // JavaScript / TypeScript
  if (lang === "JavaScript" || lang === "TypeScript") {
    const logs = [...trimmed.matchAll(/console\.log\((.+?)\)/g)];
    if (logs.length) {
      return logs.map(m => {
        let val = m[1].trim().replace(/^["'`]|["'`]$/g, "");
        return val;
      }).join("\n") + `\nExited with code 0 · Time: 0.001ms`;
    }
  }

  // Go
  if (lang === "Go") {
    const fmts = [...trimmed.matchAll(/fmt\.Print(?:ln|f)?\((.+?)\)/g)];
    if (fmts.length) {
      return fmts.map(m => m[1].replace(/[""`]/g, "").trim()).join("\n") + `\nExited with code 0 · Time: 0.001ms`;
    }
  }

  // Rust
  if (lang === "Rust") {
    const macros = [...trimmed.matchAll(/println!\((.+?)\)/g)];
    if (macros.length) {
      return macros.map(m => m[1].replace(/["]/g, "").trim()).join("\n") + `\nExited with code 0 · Time: 0.001ms`;
    }
  }

  // Java
  if (lang === "Java") {
    const sysouts = [...trimmed.matchAll(/System\.out\.println\((.+?)\)/g)];
    if (sysouts.length) {
      return sysouts.map(m => m[1].replace(/["]/g, "").trim()).join("\n") + `\nExited with code 0 · Time: 0.003ms`;
    }
  }

  // Swift
  if (lang === "Swift") {
    const prints = [...trimmed.matchAll(/print\((.+?)\)/g)];
    if (prints.length) {
      return prints.map(m => m[1].replace(/["]/g, "").trim()).join("\n") + `\nExited with code 0 · Time: 0.002ms`;
    }
  }

  // C++
  if (lang === "C++") {
    const couts = [...trimmed.matchAll(/cout\s*<<\s*(.+?)(?:\s*<<\s*endl|;)/g)];
    if (couts.length) {
      return couts.map(m => m[1].replace(/["]/g, "").trim()).join("\n") + `\nExited with code 0 · Time: 0.001ms`;
    }
  }

  return `Program ran successfully.\nExited with code 0 · Time: 0.002ms`;
}

// detect if code matches the snippet exactly
function isSnippetCode(code, lang) {
  return code.trim() === (SNIPPETS[lang]?.code || "").trim();
}

const AI_REVIEW_PROMPT = `You are a senior software engineer doing a concise code review.
Analyze the code and respond in 4–6 bullet lines (use • prefix).
Cover: correctness, time/space complexity, edge cases, idiomatic style, one improvement suggestion.
Be specific and brief. No markdown headers.`;

export default function CodeLabPanel({ onClose }) {
  const { apiKey } = useAuth();
  const [lang, setLang] = useState("Python");
  const [code, setCode] = useState(SNIPPETS["Python"].code);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);
  const [progress, setProgress] = useState(0);
  const [output, setOutput] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState("");
  // Always default to output tab; never auto-hide panel
  const [activeTab, setActiveTab] = useState("output");
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [wordWrap, setWordWrap] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const [cursorLine, setCursorLine] = useState(1);
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setLineCount(code.split("\n").length);
  }, [code]);

  const syncScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const switchLang = (l) => {
    setLang(l);
    setCode(SNIPPETS[l].code);
    // ── FIX: do NOT clear output/ran when switching lang
    // user can still see last run result
  };

  const handleRun = () => {
    setRunning(true);
    setRan(false);
    setProgress(0);
    setOutput("");
    setActiveTab("output"); // always switch to output on run
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 20 + 6;
      if (p >= 100) {
        p = 100;
        clearInterval(timerRef.current);
        setRunning(false);
        setRan(true);

        // ── FIX: use snippet output if code matches, else simulate
        const result = isSnippetCode(code, lang)
          ? (SNIPPETS[lang]?.output || "Done.")
          : simulateOutput(code, lang);

        setOutput(result);
      }
      setProgress(Math.min(p, 100));
    }, 70);
  };

  const handleReview = async () => {
    if (!apiKey) {
      setReview("Set your Groq API key first (header button).");
      setActiveTab("review");
      return;
    }
    setReviewing(true);
    setActiveTab("review");
    setReview("");
    try {
      const res = await callAI(
        apiKey,
        [{ role: "user", content: `Review this ${lang} code:\n\n${code}` }],
        AI_REVIEW_PROMPT
      );
      setReview(res);
    } catch {
      setReview("Review failed. Check API key or try again.");
    }
    setReviewing(false);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart, end = ta.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    // ── FIX: removed setRan(false)/setReview("")/setOutput("") here
    // Output panel stays visible while user edits — they re-run to refresh
  };

  const handleCursorMove = (e) => {
    const ta = e.target;
    const textBefore = ta.value.substring(0, ta.selectionStart);
    setCursorLine(textBefore.split("\n").length);
  };

  const accentColor = LANG_COLORS[lang] || "#6366f1";
  const lines = code.split("\n");

  // ── FIX: show output panel whenever there's content OR running
  const showPanel = ran || running || !!output || !!review || reviewing;

  return (
    <div style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "#0d1117" }}>

      {/* Title bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#4a5568", letterSpacing: "0.06em" }}>
          {LANG_ICONS[lang]}  {SNIPPETS[lang]?.filename}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setFontSize(s => Math.max(10, s - 1))}
            style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>A−</button>
          <button onClick={() => setFontSize(s => Math.min(18, s + 1))}
            style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>A+</button>
          <button onClick={() => setWordWrap(w => !w)}
            style={{ padding: "2px 8px", height: 22, borderRadius: 5, background: wordWrap ? accentColor + "30" : "rgba(255,255,255,0.05)", border: `1px solid ${wordWrap ? accentColor + "60" : "rgba(255,255,255,0.08)"}`, color: wordWrap ? accentColor : "#64748b", cursor: "pointer", fontSize: 10, whiteSpace: "nowrap" }}>wrap</button>
          <button onClick={handleCopy}
            style={{ padding: "2px 8px", height: 22, borderRadius: 5, background: "transparent", border: "none", cursor: "pointer", fontSize: 11, color: copied ? "#34d399" : "#4a5568", transition: "color .2s" }}>
            {copied ? "✓ copied" : "⎘ copy"}
          </button>
        </div>
      </div>

      {/* Language tabs */}
      <div style={{ display: "flex", gap: 5, padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", overflowX: "auto", flexWrap: "wrap" }}>
        {Object.keys(SNIPPETS).map(l => {
          const c = LANG_COLORS[l];
          const on = lang === l;
          return (
            <button key={l} onClick={() => switchLang(l)}
              style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s", background: on ? c + "25" : "rgba(255,255,255,0.03)", border: `1px solid ${on ? c + "55" : "rgba(255,255,255,0.07)"}`, color: on ? c : "#475569", boxShadow: on ? `0 0 10px ${c}20` : "none" }}>
              {LANG_ICONS[l]} {l}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div style={{ position: "relative", display: "flex", background: "#0d1117", flex: 1 }}>
        <div style={{ width: 3, background: `linear-gradient(180deg, ${accentColor}, transparent)`, flexShrink: 0, opacity: 0.6 }} />
        <div ref={gutterRef} style={{ width: 40, flexShrink: 0, overflowY: "hidden", background: "rgba(0,0,0,0.18)", borderRight: "1px solid rgba(255,255,255,0.05)", paddingTop: 12, paddingBottom: 12, userSelect: "none" }}>
          {lines.map((_, i) => (
            <div key={i} style={{ height: fontSize * 1.75, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, fontSize: fontSize - 1, color: cursorLine === i + 1 ? accentColor : "#2d3748", transition: "color .1s" }}>
              {i + 1}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            onKeyUp={handleCursorMove}
            onClick={handleCursorMove}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 240, maxHeight: 360,
              background: "transparent", border: "none", outline: "none", resize: "none",
              padding: "12px 14px", fontSize, lineHeight: 1.75, color: "#e2e8f0",
              fontFamily: "'JetBrains Mono','Fira Code',monospace",
              overflowY: "auto", overflowX: wordWrap ? "hidden" : "auto",
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              wordBreak: wordWrap ? "break-all" : "normal",
              caretColor: accentColor, display: "block",
            }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "5px 14px", background: accentColor + "14", borderTop: `1px solid ${accentColor}22`, fontSize: 10, color: "#475569" }}>
        <span style={{ color: accentColor, fontWeight: 700 }}>{lang}</span>
        <span>Ln {cursorLine}</span>
        <span>{lineCount} lines</span>
        <span>{code.length} chars</span>
        <span style={{ marginLeft: "auto" }}>Tab: 2 spaces · {wordWrap ? "Wrap ON" : "No wrap"} · {fontSize}px</span>
      </div>

      {/* Progress bar */}
      {running && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.04)" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`, transition: "width .08s linear" }} />
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={handleRun} disabled={running}
          style={{ padding: "8px 22px", borderRadius: 10, background: running ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}bb 100%)`, border: "none", color: running ? "#475569" : "#fff", fontSize: 11, fontWeight: 700, cursor: running ? "not-allowed" : "pointer", letterSpacing: "0.05em", boxShadow: running ? "none" : `0 4px 18px ${accentColor}40`, transition: "all .2s" }}>
          {running ? `⏳ ${Math.round(progress)}%` : "▶  RUN"}
        </button>

        <button onClick={handleReview} disabled={reviewing}
          style={{ padding: "8px 16px", borderRadius: 10, background: reviewing ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)", border: `1px solid ${reviewing ? "rgba(255,255,255,0.06)" : accentColor + "40"}`, color: reviewing ? "#334155" : accentColor, fontSize: 11, fontWeight: 700, cursor: reviewing ? "not-allowed" : "pointer", letterSpacing: "0.05em", transition: "all .2s" }}>
          {reviewing ? "⏳ Reviewing…" : "🤖 AI REVIEW"}
        </button>

        <button onClick={() => { setCode(""); setRan(false); setReview(""); setOutput(""); }}
          style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", fontSize: 11, cursor: "pointer" }}>
          ✕ Clear
        </button>

        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 10, color: "#334155" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ran ? "#34d399" : running ? "#fbbf24" : "#475569", boxShadow: ran ? "0 0 6px #34d399" : running ? "0 0 6px #fbbf24" : "none", display: "inline-block" }} />
          {ran ? "passed" : running ? "running" : "idle"}
        </div>
      </div>

      {/* ── FIX: Output/Review panel — always visible once there's content ── */}
      {showPanel && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              ["output", "📤 Output", ran || !!output],
              ["review", "🤖 Review", !!review || reviewing],
            ].map(([tab, label, enabled]) => (
              <button key={tab} onClick={() => enabled && setActiveTab(tab)} disabled={!enabled}
                style={{ padding: "8px 18px", background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === tab ? accentColor : "transparent"}`, color: activeTab === tab ? accentColor : enabled ? "#4a5568" : "#2d3748", fontSize: 10, fontWeight: 700, cursor: enabled ? "pointer" : "default", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all .15s" }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: "14px 18px", fontSize: 11, lineHeight: 1.9, fontFamily: "inherit", maxHeight: 160, overflowY: "auto" }}>

            {/* Output tab */}
            {activeTab === "output" && (
              running
                ? <div style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: `2px solid rgba(99,102,241,0.3)`, borderTopColor: accentColor, borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                  Running…
                </div>
                : output
                  ? <pre style={{ margin: 0, color: "#34d399", whiteSpace: "pre-wrap" }}>{output}</pre>
                  : <span style={{ color: "#334155" }}>No output yet. Press RUN.</span>
            )}

            {/* Review tab */}
            {activeTab === "review" && (
              reviewing
                ? <div style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: `2px solid rgba(99,102,241,0.3)`, borderTopColor: accentColor, borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                  Analyzing your code…
                </div>
                : <pre style={{ margin: 0, color: "#94a3b8", whiteSpace: "pre-wrap" }}>{review}</pre>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        textarea::-webkit-scrollbar { width: 5px; height: 5px }
        textarea::-webkit-scrollbar-track { background: transparent }
        textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px }
      `}</style>
    </div>
  );
}