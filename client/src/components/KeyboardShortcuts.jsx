import { useEffect } from "react";

export default function KeyboardShortcuts({ onAction }) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onAction?.("quickactions");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAction]);

  return null;
}