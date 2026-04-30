import { useState, useEffect } from "react";

export default function Cursor() {
  const [pos, setPos]     = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState([]);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setTrail(t => [...t.slice(-6), { x: e.clientX, y: e.clientY, id: Date.now() + Math.random() }]);
    };
    const onDown = () => setClicked(true);
    const onUp   = () => setClicked(false);
    const onOver = (e) => {
      const el = e.target.closest("button,a,[role='button'],[data-hover]");
      setHovered(!!el);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {trail.map((t, i) => (
        <div
          key={t.id}
          style={{
            position: "absolute",
            left: t.x,
            top:  t.y,
            width:  6,
            height: 6,
            borderRadius: "50%",
            background: `rgba(99,102,241,${((i + 1) / trail.length) * 0.35})`,
            transform: "translate(-50%,-50%)",
            transition: "opacity .3s",
          }}
        />
      ))}
      {/* outer ring */}
      <div
        style={{
          position: "absolute",
          left: pos.x,
          top:  pos.y,
          width:  hovered ? 36 : clicked ? 20 : 26,
          height: hovered ? 36 : clicked ? 20 : 26,
          borderRadius: "50%",
          border: `1.5px solid rgba(99,102,241,${hovered ? 0.9 : 0.6})`,
          transform: "translate(-50%,-50%)",
          transition: "width .15s,height .15s,border-color .15s",
          boxShadow: hovered
            ? "0 0 18px rgba(99,102,241,.5)"
            : clicked
            ? "0 0 24px rgba(99,102,241,.7)"
            : "0 0 8px rgba(99,102,241,.25)",
        }}
      />
      {/* inner dot */}
      <div
        style={{
          position: "absolute",
          left: pos.x,
          top:  pos.y,
          width:  4,
          height: 4,
          borderRadius: "50%",
          background: "#818cf8",
          transform: "translate(-50%,-50%)",
          boxShadow: "0 0 6px #818cf8",
        }}
      />
    </div>
  );
}
