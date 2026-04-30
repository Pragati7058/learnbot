import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./ThemeToggle";
import AuthPage from "./pages/AuthPage";
import AppPage from "./pages/AppPage";
import Cursor from "./components/Cursor";
import Bookmarks from "./components/Bookmarks";
import StatsPanel from "./components/StatsPanel";
import StudyPlanner from "./components/StudyPlanner";

function Root() {
  const { user, loading } = useAuth();
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--app-bg)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))", display: "flex", alignItems: "center", justifyContent: "center", animation: "spin 1s linear infinite", boxShadow: "0 0 24px var(--color-accent-glow)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "'Inter',sans-serif" }}>Loading LearnBot…</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Cursor />
      {user ? (
        <AppPage
          onShowBookmarks={() => setShowBookmarks(true)}
          onShowStats={() => setShowStats(true)}
          onShowPlanner={() => setShowPlanner(true)}
        />
      ) : <AuthPage />}
      {showBookmarks && <Bookmarks onClose={() => setShowBookmarks(false)} />}
      {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
      {showPlanner && <StudyPlanner onClose={() => setShowPlanner(false)} />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}