import { useState } from "react";
import {
  Zap,
  LineChart,
  BrainCircuit,
  Compass,
  Wallet,
  Star,
  Search,
  User,
  LogOut,
  Lock,
} from "lucide-react";

export function Navbar({ activeTab, setActiveTab, user, onOpenAuth, onLogout, onSearchStock }) {
  const [navSearch, setNavSearch] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      onSearchStock(navSearch.trim());
      setNavSearch("");
    }
  };

  const navTabs = [
    { id: "explorer", label: "Stock Explorer", Icon: LineChart },
    { id: "ai_advisor", label: "AI Advisor", Icon: BrainCircuit },
    { id: "nse_catalog", label: "NSE 840+ Catalog", Icon: Compass },
    { id: "portfolio", label: "Portfolio", Icon: Wallet },
    { id: "watchlist", label: "Watchlist", Icon: Star },
  ];

  return (
    <header className="glass-card card-3d-emboss" style={{
      position: "relative",
      zIndex: 100,
      margin: "0.5rem auto 0.4rem auto",
      maxWidth: "1440px",
      width: "calc(100% - 1.5rem)",
      padding: "0.45rem 1.25rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      borderRadius: "var(--radius-md)",
      flexShrink: 0
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setActiveTab("explorer")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem" }}
      >
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius-sm)",
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
          color: "#fff",
        }}>
          <Zap size={18} className="icon-glow-cyan" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{
            fontSize: "1.15rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            InvestPulse
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--accent-cyan)", fontWeight: 700, letterSpacing: "0.06em" }}>
            NSE 842+ & YFINANCE 3D
          </div>
        </div>
      </div>

      {/* Tabs with modern icons */}
      <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", overflowX: "auto" }}>
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.38rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: isActive ? "linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.2) 100%)" : "transparent",
                color: isActive ? "#ffffff" : "var(--text-muted)",
                border: isActive ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid transparent",
                boxShadow: isActive ? "0 0 12px rgba(99, 102, 241, 0.25)" : "none",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              <TabIcon size={14} className={isActive ? "icon-glow-primary" : ""} color={isActive ? "var(--accent-cyan)" : "currentColor"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Search Input & Auth Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        <form onSubmit={handleSearchSubmit} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={13} color="var(--text-dim)" style={{ position: "absolute", left: "0.6rem", pointerEvents: "none" }} />
          <input
            type="text"
            className="glass-input"
            style={{ width: "170px", padding: "0.35rem 0.65rem 0.35rem 1.8rem", fontSize: "0.8rem" }}
            placeholder="Search stock..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
          />
        </form>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid var(--bg-card-border)",
              padding: "0.35rem 0.65rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.78rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}>
              <User size={12} color="var(--gain)" className="icon-glow-gain" />
              <span>{user.email.split("@")[0]}</span>
            </div>
            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{ padding: "0.35rem 0.6rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
              title="Sign Out"
            >
              <LogOut size={12} />
              <span>Exit</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{ padding: "0.38rem 0.85rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Lock size={12} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
