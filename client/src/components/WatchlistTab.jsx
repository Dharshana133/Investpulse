import { useState, useEffect } from "react";
import { watchlistService, priceService } from "../services/api";
import { Card3D } from "./Card3D";
import { ThreeDObject } from "./ThreeDObject";
import {
  Star,
  PlusCircle,
  Lock,
  LineChart,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";

export function WatchlistTab({ user, onRequireAuth, onSelectTicker }) {
  const [watchlist, setWatchlist] = useState([]);
  const [pricesMap, setPricesMap] = useState({});
  const [newTicker, setNewTicker] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState(null);
  const [focusTicker, setFocusTicker] = useState(null);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const items = await watchlistService.getWatchlist();
      setWatchlist(items);
      if (items.length > 0 && !focusTicker) {
        setFocusTicker(items[0].ticker.toUpperCase());
      }

      const tickers = items.map((i) => i.ticker.toUpperCase());
      if (tickers.length > 0) {
        const prices = await priceService.getPricesBatch(tickers);
        setPricesMap(prices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicker = async (e, tickerToAdd = null) => {
    if (e) e.preventDefault();
    const sym = (tickerToAdd || newTicker).trim().toUpperCase();
    if (!sym) return;
    setAdding(true);
    try {
      await watchlistService.addWatchlist(sym);
      setNewTicker("");
      setMsg(`Added ${sym} to Watchlist! ⭐`);
      fetchWatchlist();
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to add to watchlist";
      setMsg(`⚠️ ${detail}`);
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id, ticker) => {
    try {
      await watchlistService.removeWatchlist(id);
      setMsg(`Removed ${ticker} from Watchlist`);
      if (focusTicker === ticker) {
        const remaining = watchlist.filter((w) => w.id !== id);
        setFocusTicker(remaining.length > 0 ? remaining[0].ticker.toUpperCase() : null);
      }
      fetchWatchlist();
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card3D maxTilt={10} depth={20} style={{ padding: "2.5rem 2rem", textAlign: "center", maxWidth: "480px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <Lock size={40} color="var(--primary)" className="icon-glow-primary" />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.4rem", color: "#fff" }}>
            Authentication Required
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Sign in to curate your personal 3D watchlist and monitor live price movements across NSE & Global tickers.
          </p>
          <button onClick={onRequireAuth} className="btn-primary" style={{ padding: "0.55rem 1.4rem", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Lock size={14} />
            <span>Sign In to View Watchlist</span>
          </button>
        </Card3D>
      </div>
    );
  }

  // Watchlist Analytics
  const priceList = watchlist
    .map((w) => ({ ticker: w.ticker.toUpperCase(), ...pricesMap[w.ticker.toUpperCase()] }))
    .filter((p) => p.price);

  const gainers = priceList.filter((p) => (p.change || 0) >= 0);
  const losers = priceList.filter((p) => (p.change || 0) < 0);
  const avgChange = priceList.length > 0
    ? priceList.reduce((acc, curr) => acc + (curr.change_pct || 0), 0) / priceList.length
    : 0;

  const topGainer = priceList.length > 0
    ? [...priceList].sort((a, b) => (b.change_pct || 0) - (a.change_pct || 0))[0]
    : null;
  const topLoser = priceList.length > 0
    ? [...priceList].sort((a, b) => (a.change_pct || 0) - (b.change_pct || 0))[0]
    : null;

  const activeFocusData = focusTicker ? pricesMap[focusTicker] : null;
  const isFocusGain = (activeFocusData?.change || 0) >= 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "0.5rem", minHeight: 0, overflow: "hidden" }}>
      {/* Top Header Ribbon */}
      <div className="glass-card card-3d-emboss" style={{ padding: "0.45rem 1rem", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Star size={16} color="var(--accent-cyan)" className="icon-glow-cyan" />
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0 }}>
              My Watchlist ({watchlist.length})
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginLeft: "0.5rem" }}>
              <span className="badge-gain" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
                ▲ {gainers.length} Up
              </span>
              <span className="badge-loss" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
                ▼ {losers.length} Down
              </span>
            </div>
          </div>

          {/* Quick Suggestions & Add Form */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", overflowX: "auto" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600 }}>Suggested:</span>
              {["INFY", "BHARTIARTL", "TMCV", "SUNPHARMA", "MARUTI"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleAddTicker(null, s)}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "var(--text-muted)",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"; }}
                >
                  +{s}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddTicker} style={{ display: "flex", gap: "0.35rem" }}>
              <input
                type="text"
                required
                className="glass-input"
                style={{ width: "140px", padding: "0.25rem 0.6rem", fontSize: "0.8rem", textTransform: "uppercase" }}
                placeholder="Add Symbol..."
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              />
              <button type="submit" disabled={adding} className="btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.78rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <PlusCircle size={12} />
                <span>{adding ? "..." : "Add"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {msg && (
        <div className="animate-fade-in" style={{
          background: msg.includes("⚠️") ? "rgba(244, 63, 94, 0.15)" : "var(--gain-bg)",
          border: `1px solid ${msg.includes("⚠️") ? "var(--loss-border)" : "var(--gain-border)"}`,
          color: msg.includes("⚠️") ? "#fca5a5" : "var(--gain)",
          padding: "0.3rem 0.75rem",
          borderRadius: "var(--radius-sm)",
          fontWeight: 600,
          fontSize: "0.78rem",
          flexShrink: 0
        }}>
          {msg}
        </div>
      )}

      {/* Main Watchlist Split View (Fills entire screen comfortably) */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "0.55rem", overflow: "hidden" }}>
        {/* Watchlist Stock Cards Grid */}
        <div className="custom-scroll" style={{ flex: "1 1 55%", minHeight: "150px", paddingRight: "0.2rem" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div className="spinner" style={{ width: "32px", height: "32px" }} />
            </div>
          ) : watchlist.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "0.88rem" }}>
              <Star size={36} color="var(--text-dim)" style={{ marginBottom: "0.5rem" }} />
              <p>Your watchlist is currently empty.</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>
                Add a ticker above or click "Watchlist" from the Stock Explorer!
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: "0.5rem"
            }}>
              {watchlist.map((item) => {
                const sym = item.ticker.toUpperCase();
                const priceData = pricesMap[sym];
                const isGain = (priceData?.change || 0) >= 0;
                const isFocused = focusTicker === sym;

                return (
                  <Card3D
                    key={item.id}
                    maxTilt={8}
                    depth={15}
                    onClick={() => setFocusTicker(sym)}
                    glowColor={isGain ? "rgba(16, 185, 129, 0.35)" : "rgba(244, 63, 94, 0.35)"}
                    style={{
                      padding: "0.75rem 0.9rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "135px",
                      border: isFocused ? "1px solid var(--accent-cyan)" : undefined,
                      cursor: "pointer"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                        <div>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#fff", margin: 0 }}>
                            {sym}
                          </h3>
                          <span className="badge-tag" style={{ fontSize: "0.65rem", padding: "0.08rem 0.3rem" }}>yfinance LIVE</span>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemove(item.id, item.ticker); }}
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "none",
                            color: "var(--text-dim)",
                            cursor: "pointer",
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s ease"
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.color = "var(--loss)"; e.currentTarget.style.background = "rgba(244,63,94,0.15)"; }}
                          onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                          title="Remove from watchlist"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div style={{ marginBottom: "0.5rem" }}>
                        <div style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#fff" }}>
                          {priceData?.price ? `₹${priceData.price.toFixed(2)}` : "Loading..."}
                        </div>
                        {priceData && (
                          <div className={isGain ? "badge-gain" : "badge-loss"} style={{ marginTop: "0.2rem", fontSize: "0.72rem", padding: "0.12rem 0.45rem" }}>
                            {isGain ? "▲ +" : "▼ "}
                            {priceData.change?.toFixed(2)} ({priceData.change_pct?.toFixed(2)}%)
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectTicker(sym); }}
                      className="btn-secondary"
                      style={{ width: "100%", justifyContent: "center", padding: "0.3rem 0.5rem", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <LineChart size={11} />
                      <span>Analyze in 3D Explorer</span>
                    </button>
                  </Card3D>
                );
              })}
            </div>
          )}
        </div>

        {/* Watchlist 3D Radar & Market Telemetry Panel (Fills bottom half elegantly) */}
        {watchlist.length > 0 && (
          <div style={{ flex: "1 1 45%", minHeight: "160px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "0.55rem", overflow: "hidden" }}>
            {/* Left Telemetry Card */}
            <Card3D maxTilt={5} depth={12} style={{ padding: "0.85rem 1.1rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Activity size={14} color="var(--accent-cyan)" className="icon-glow-cyan" />
                  <span>Watchlist Market Sentiment</span>
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                  Mean Drift: <strong style={{ color: avgChange >= 0 ? "var(--gain)" : "var(--loss)" }}>{avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%</strong>
                </span>
              </div>

              {/* Top Mover & Dip Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {/* Top Gainer */}
                <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.68rem", color: "var(--gain)", fontWeight: 700 }}>
                    <TrendingUp size={11} />
                    <span>Top Watchlist Gainer</span>
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", marginTop: "0.2rem" }}>
                    {topGainer?.ticker || "N/A"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gain)", fontWeight: 600, marginTop: "0.1rem" }}>
                    {topGainer ? `₹${topGainer.price} (+${topGainer.change_pct}%)` : "—"}
                  </div>
                </div>

                {/* Top Decliner / Dip */}
                <div style={{ background: "rgba(244, 63, 94, 0.05)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.68rem", color: "#f87171", fontWeight: 700 }}>
                    <TrendingDown size={11} />
                    <span>Dip / Pullback</span>
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", marginTop: "0.2rem" }}>
                    {topLoser?.ticker || "N/A"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 600, marginTop: "0.1rem" }}>
                    {topLoser ? `₹${topLoser.price} (${topLoser.change_pct}%)` : "—"}
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.4rem" }}>
                Click any card above to focus the 3D Asset Matrix on that equity.
              </div>
            </Card3D>

            {/* Right 3D Focus Object Card */}
            <Card3D maxTilt={8} depth={20} style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, rgba(18, 24, 38, 0.85) 0%, rgba(30, 41, 65, 0.5) 100%)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: 700, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Layers size={12} />
                  <span>3D ASSET FOCUS</span>
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-mono)" }}>
                  {focusTicker || "NSE"}
                </div>
                {activeFocusData && (
                  <div style={{ fontSize: "0.85rem", color: isFocusGain ? "var(--gain)" : "var(--loss)", fontWeight: 700 }}>
                    ₹{activeFocusData.price} ({isFocusGain ? "+" : ""}{activeFocusData.change_pct}%)
                  </div>
                )}
                {focusTicker && (
                  <button
                    onClick={() => onSelectTicker(focusTicker)}
                    className="btn-primary"
                    style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem", marginTop: "0.4rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <span>Inspect</span>
                    <ArrowRight size={11} />
                  </button>
                )}
              </div>

              {/* 3D Holographic Canvas Object */}
              <ThreeDObject
                ticker={focusTicker || "NSE"}
                theme={isFocusGain ? "gain" : "loss"}
                size={130}
                subtitle="ACTIVE FOCUS"
              />
            </Card3D>
          </div>
        )}
      </div>
    </div>
  );
}
