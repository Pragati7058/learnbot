import { useState, useRef, useEffect } from "react";
import { callAI } from "../utils/api";

const VOICE_SYSTEM_PROMPT = "You are a helpful AI study assistant. Give clear, concise answers suitable for spoken output. Avoid markdown formatting, bullet points, or special characters in your responses.";

const styles = `
  @keyframes pulse-ring {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0.6); }
    70% { transform: scale(1); box-shadow: 0 0 0 18px rgba(99,102,241,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0); }
  }
  @keyframes pulse-red {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 18px rgba(239,68,68,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  }
  @keyframes ping {
    0% { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes blink {
    0%,80%,100% { opacity: 0.2; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1.2); }
  }
  @keyframes wave {
    0% { transform: scaleY(0.4); }
    100% { transform: scaleY(1.6); }
  }
  @keyframes rotate-ring {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .mic-btn {
    width: 100px; height: 100px; border-radius: 50%; border: none;
    cursor: pointer; font-size: 38px;
    display: flex; align-items: center; justify-content: center;
    position: relative; transition: transform 0.15s ease;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 0 0 0 rgba(99,102,241,0.6), 0 8px 32px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
    animation: pulse-ring 2s infinite;
  }
  .mic-btn:hover { transform: scale(1.08); }
  .mic-btn:active { transform: scale(0.95); }
  .mic-btn.recording {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 0 0 0 rgba(239,68,68,0.7), 0 8px 32px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
    animation: pulse-red 1.2s infinite;
  }
  .mic-outer-ring {
    position: absolute; inset: -16px; border-radius: 50%;
    border: 2px solid rgba(99,102,241,0.25);
    animation: rotate-ring 4s linear infinite;
    background: conic-gradient(from 0deg, transparent 70%, rgba(99,102,241,0.5) 100%);
  }
  .mic-outer-ring.recording {
    border-color: rgba(239,68,68,0.3);
    background: conic-gradient(from 0deg, transparent 70%, rgba(239,68,68,0.6) 100%);
  }
`;

async function transcribeAudio(apiKey, audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "json");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey.trim()}` },
    body: formData,
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || "Whisper API error " + res.status);
  }
  const data = await res.json();
  return data.text || "";
}

export default function VoicePanel({ color = "#6366f1", apiKey }) {
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Click the mic or type a question below.");
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("vp-styles")) {
      const s = document.createElement("style");
      s.id = "vp-styles";
      s.textContent = styles;
      document.head.appendChild(s);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startRecording = async () => {
    if (!apiKey) {
      setError("No Groq API key set. Click the key icon in the top bar to add one.");
      return;
    }
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
        setRecordingTime(0);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) { setError("Recording too short. Try again."); return; }
        setTranscribing(true);
        try {
          const text = await transcribeAudio(apiKey, blob);
          if (!text.trim()) { setError("Could not hear speech. Please try again."); setTranscribing(false); return; }
          setTranscript(text);
          setTranscribing(false);
          await askQuestion(text);
        } catch (e) {
          setError("Transcription error: " + e.message);
          setTranscribing(false);
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (e) {
      setError("Mic access denied: " + e.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const toggleMic = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const askQuestion = async (question) => {
    const q = question || transcript.trim();
    if (!q) return;
    if (!apiKey) { setError("No Groq API key set."); return; }
    setError("");
    setLoading(true);
    try {
      const text = await callAI(apiKey, [{ role: "user", content: q }], VOICE_SYSTEM_PROMPT);
      setResponse(text);
    } catch (e) {
      setError("AI error: " + e.message);
    }
    setLoading(false);
  };

  const handleSpeak = () => {
    if (speaking) { synthRef.current.cancel(); setSpeaking(false); return; }
    if (!response) return;
    const utt = new SpeechSynthesisUtterance(response);
    utt.rate = 0.95;
    utt.onend = () => setSpeaking(false);
    setSpeaking(true);
    synthRef.current.speak(utt);
  };

  const isProcessing = transcribing || loading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {!apiKey && (
        <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#fbbf24" }}>
          ⚠️ Set your Groq API key (top bar → key icon) to enable voice AI.
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Mic */}
      <div style={{ textAlign: "center", padding: "36px 0 24px" }}>
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <div className={`mic-outer-ring${recording ? " recording" : ""}`} />
          {recording && [1, 2].map(i => (
            <div key={i} style={{
              position: "absolute", inset: -(i * 20), borderRadius: "50%",
              background: "rgba(239,68,68,0.08)",
              animation: `ping ${0.9 + i * 0.4}s ease-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
          {!recording && (
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
          )}
          <button
            className={`mic-btn${recording ? " recording" : ""}`}
            onClick={toggleMic}
            disabled={isProcessing}
            style={{ opacity: isProcessing ? 0.6 : 1 }}
          >
            {recording ? "⏹" : "🎤"}
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 13, fontWeight: 500, color: recording ? "#f87171" : isProcessing ? color : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {recording ? (
            <><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "blink 1s infinite" }} />
              Listening… {recordingTime}s — tap ⏹ to stop</>
          ) : transcribing ? "✨ Transcribing audio…"
          : loading ? "🤖 Thinking…"
          : "Tap mic to speak"}
        </div>

        {recording && (
          <div style={{ display: "flex", gap: 3, justifyContent: "center", alignItems: "flex-end", height: 24, marginTop: 12 }}>
            {[5, 12, 18, 24, 16, 10, 20, 14, 8].map((h, i) => (
              <div key={i} style={{ width: 4, borderRadius: 3, background: "linear-gradient(to top, #ef4444, #f87171)", height: h, animation: `wave ${0.4 + (i % 4) * 0.15}s ease-in-out infinite alternate`, animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
        )}
      </div>

      {/* Transcript */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>TRANSCRIBED</div>
        <div style={{ fontSize: 13, color: transcript ? "#e2e8f0" : "#475569", fontStyle: transcript ? "normal" : "italic", minHeight: 20 }}>
          {transcribing ? "Transcribing…" : transcript || "Your speech will appear here…"}
        </div>
        {transcript && (
          <button onClick={() => setTranscript("")}
            style={{ marginTop: 8, fontSize: 10, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#475569", cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      {/* Response */}
      <div style={{ background: `${color}0d`, borderRadius: 12, padding: "12px 14px", border: `1px solid ${color}25` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, color, fontWeight: 600, letterSpacing: 1 }}>AI RESPONSE</div>
          <button onClick={handleSpeak} disabled={!response || loading}
            style={{ padding: "4px 10px", borderRadius: 6, background: speaking ? `${color}30` : "transparent", border: `1px solid ${color}40`, color, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            {speaking ? "⏸ Pause" : "▶ Read Aloud"}
          </button>
        </div>
        {loading ? (
          <div style={{ display: "flex", gap: 4, alignItems: "center", color, fontSize: 12 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: color, animation: `blink 1s ${i * 0.2}s infinite` }} />)}
            <span style={{ marginLeft: 4 }}>Thinking…</span>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.7, minHeight: 20, whiteSpace: "pre-wrap" }}>{response}</div>
        )}
        {speaking && (
          <div style={{ display: "flex", gap: 3, marginTop: 10, alignItems: "flex-end", height: 20 }}>
            {[4, 8, 12, 16, 10, 6, 14, 8, 12].map((h, i) => (
              <div key={i} style={{ width: 3, borderRadius: 2, background: color, height: h, animation: `wave ${0.5 + (i % 3) * 0.2}s ease-in-out infinite alternate` }} />
            ))}
            <div style={{ fontSize: 10, color, marginLeft: 8, marginBottom: 2 }}>Speaking…</div>
          </div>
        )}
      </div>

      {/* Text input fallback */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Or type your question here and press Enter…"
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          onKeyDown={e => e.key === "Enter" && askQuestion()}
          disabled={isProcessing}
          style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30`, borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, outline: "none" }}
        />
        <button onClick={() => askQuestion()} disabled={isProcessing}
          style={{ padding: "8px 16px", borderRadius: 8, background: `linear-gradient(135deg,${color},${color}cc)`, border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          Ask
        </button>
      </div>
    </div>
  );
}
