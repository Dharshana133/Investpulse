import { useState, useEffect } from "react";
import { authService } from "./services/api";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { HomeTab } from "./components/HomeTab";
import { StockExplorer } from "./components/StockExplorer";
import { NseCatalogTab } from "./components/NseCatalogTab";
import { PortfolioTab } from "./components/PortfolioTab";
import { WatchlistTab } from "./components/WatchlistTab";
import { AiAdvisorTab } from "./components/AiAdvisorTab";
import { ThreeDBackground } from "./components/ThreeDBackground";
import { Activity, Boxes } from "lucide-react";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedTicker, setSelectedTicker] = useState("RELIANCE");
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const uData = await authService.getCurrentUser();
          setUser(uData);
        } catch (err) {
          console.error("Stored token invalid or expired", err);
          localStorage.removeItem("token");
        }
      }
    } catch (e) {
      console.error("Session check error", e);
    } finally {
      setInitializing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleSelectTicker = (ticker) => {
    setSelectedTicker(ticker);
    setActiveTab("explorer");
  };

  if (initializing) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "1rem", color: "var(--text-muted)"
      }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
        <p style={{ fontWeight: 600 }}>Initializing InvestPulse 3D Studio...</p>
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh",
      maxHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* 3D Ambient Spatial Background */}
      <ThreeDBackground />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onSearchStock={handleSelectTicker}
      />

      {/* Main Single-Page Tab Body Container */}
      <main style={{
        maxWidth: "1440px",
        width: "calc(100% - 1.5rem)",
        margin: "0 auto",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
        paddingBottom: "0.35rem"
      }}>
        {activeTab === "home" && (
          <HomeTab
            onNavigate={(tab, sym) => {
              if (sym) setSelectedTicker(sym);
              setActiveTab(tab);
            }}
            user={user}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === "explorer" && (
          <StockExplorer
            initialTicker={selectedTicker}
            user={user}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === "ai_advisor" && (
          <AiAdvisorTab
            onSelectTicker={handleSelectTicker}
            user={user}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === "nse_catalog" && (
          <NseCatalogTab
            onSelectTicker={handleSelectTicker}
            user={user}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === "portfolio" && (
          <PortfolioTab
            user={user}
            onRequireAuth={() => setAuthModalOpen(true)}
            onSelectTicker={handleSelectTicker}
          />
        )}

        {activeTab === "watchlist" && (
          <WatchlistTab
            user={user}
            onRequireAuth={() => setAuthModalOpen(true)}
            onSelectTicker={handleSelectTicker}
          />
        )}
      </main>

      {/* Sleek 3D Bottom Status Bar */}
      <footer style={{
        flexShrink: 0,
        height: "28px",
        borderTop: "1px solid var(--bg-card-border)",
        background: "rgba(9, 13, 22, 0.85)",
        backdropFilter: "blur(12px)",
        padding: "0 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "var(--text-dim)",
        fontSize: "0.74rem",
        zIndex: 50,
        userSelect: "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--gain)" }}>
            <Activity size={12} color="var(--gain)" className="icon-glow-gain" />
            <span style={{ fontWeight: 600 }}>LIVE MARKET FEED</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <span style={{ color: "var(--accent-cyan)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Boxes size={12} color="var(--accent-cyan)" className="icon-glow-cyan" />
            <span>3D OBJECT ENGINE ACTIVE</span>
          </span>
          <span>•</span>
          <span>InvestPulse Cockpit</span>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
