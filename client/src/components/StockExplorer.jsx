import { useState, useEffect } from "react";
import { priceService, watchlistService, transactionService } from "../services/api";
import { Card3D } from "./Card3D";
import { ThreeDObject } from "./ThreeDObject";
import {
  Search,
  Star,
  PlusCircle,
  TrendingUp,
  BarChart3,
  Building2,
  Boxes,
  AlertCircle,
  ArrowRightLeft,
  Calendar,
  Layers,
} from "lucide-react";

export function StockExplorer({ initialTicker = "RELIANCE", user, onRequireAuth }) {
  const [ticker, setTicker] = useState(initialTicker);
  const [inputSymbol, setInputSymbol] = useState(initialTicker);
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState(null);
  const [period, setPeriod] = useState("1m");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  // Quick transaction modal state inside explorer
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState("BUY");
  const [txShares, setTxShares] = useState(10);
  const [txPrice, setTxPrice] = useState(0);

  useEffect(() => {
    fetchStockData(ticker, period);
  }, [ticker]);

  useEffect(() => {
    if (ticker) {
      fetchChartHistory(ticker, period);
    }
  }, [period]);

  const fetchStockData = async (symbolToFetch, chartPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const data = await priceService.getDetails(symbolToFetch);
      setDetails(data);
      setTxPrice(data.price || 0);
      await fetchChartHistory(symbolToFetch, chartPeriod);
    } catch (err) {
      console.error(err);
      setError(`Unable to fetch live stock data for "${symbolToFetch}". Please check symbol.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartHistory = async (symbolToFetch, chartPeriod) => {
    setChartLoading(true);
    try {
      const histData = await priceService.getHistory(symbolToFetch, chartPeriod);
      setHistory(histData.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputSymbol.trim()) {
      setTicker(inputSymbol.trim().toUpperCase());
    }
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    try {
      await watchlistService.addWatchlist(ticker);
      setMsg(`Added ${ticker} to your watchlist! ⭐`);
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to add to watchlist";
      setMsg(`⚠️ ${detail}`);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    try {
      await transactionService.addTransaction({
        ticker: ticker,
        type: txType,
        quantity: parseFloat(txShares),
        shares: parseFloat(txShares),
        price: parseFloat(txPrice),
      });
      setMsg(`Recorded ${txType} transaction for ${txShares} shares of ${ticker}! 💼`);
      setShowAddTx(false);
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Failed to save transaction.";
      alert(`Failed to add transaction: ${typeof detail === "object" ? JSON.stringify(detail) : detail}`);
    }
  };

  // Helper to format market cap
  const formatNum = (num) => {
    if (!num) return "N/A";
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)} Cr`;
    if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)} L`;
    return `₹${num.toLocaleString()}`;
  };

  // Calculate percentage within range
  const calcRangePct = (val, low, high) => {
    if (!val || !low || !high || high <= low) return 50;
    const pct = ((val - low) / (high - low)) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  // SVG Chart rendering
  const renderSvgChart = () => {
    if (!history || history.length === 0) {
      return (
        <div style={{ height: "100%", minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "0.85rem" }}>
          No chart historical points available for this period.
        </div>
      );
    }

    const prices = history.map((h) => h.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    const width = 800;
    const height = 180;
    const padding = 15;

    const points = history.map((h, index) => {
      const x = padding + (index / (history.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - ((h.close - minPrice) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(" ");

    const isPositive = prices[prices.length - 1] >= prices[0];
    const strokeColor = isPositive ? "var(--gain)" : "var(--loss)";
    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="chart3dGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#chart3dGrad)" />
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-dim)", fontSize: "0.72rem", paddingTop: "0.25rem" }}>
          <span>{history[0]?.date}</span>
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Low: ₹{minPrice.toFixed(1)} — High: ₹{maxPrice.toFixed(1)}</span>
          <span>{history[history.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  const isGain = details ? (details.change >= 0) : true;
  const range52wPct = details ? calcRangePct(details.price, details.fifty_two_week_low, details.fifty_two_week_high) : 50;
  const rangeDayPct = details ? calcRangePct(details.price, details.day_low, details.day_high) : 50;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", gap: "0.45rem" }}>
      {/* Top Search & Chips Ribbon */}
      <div className="glass-card card-3d-emboss" style={{ padding: "0.45rem 0.9rem", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: "1 1 240px", maxWidth: "420px" }}>
            <input
              type="text"
              className="glass-input"
              style={{ flex: 1, padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
              placeholder="Search symbol (e.g. RELIANCE, TCS, AAPL)..."
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: "0.35rem 0.85rem", fontSize: "0.82rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Search size={13} />
              <span>Search</span>
            </button>
          </form>

          {/* Quick Tickers Chips */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", overflowX: "auto" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600, marginRight: "0.2rem" }}>Quick:</span>
            {["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS", "AAPL", "NVDA"].map((sym) => (
              <button
                key={sym}
                onClick={() => { setTicker(sym); setInputSymbol(sym); }}
                style={{
                  background: ticker === sym ? "var(--primary-glow)" : "rgba(255, 255, 255, 0.05)",
                  border: ticker === sym ? "1px solid var(--primary)" : "1px solid var(--bg-card-border)",
                  color: ticker === sym ? "#fff" : "var(--text-muted)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease"
                }}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      {msg && (
        <div className="animate-fade-in" style={{
          background: msg.includes("⚠️") ? "rgba(244, 63, 94, 0.15)" : "var(--gain-bg)",
          border: `1px solid ${msg.includes("⚠️") ? "var(--loss-border)" : "var(--gain-border)"}`,
          color: msg.includes("⚠️") ? "#fca5a5" : "var(--gain)",
          padding: "0.35rem 0.75rem",
          borderRadius: "var(--radius-sm)",
          fontWeight: 600,
          fontSize: "0.8rem",
          flexShrink: 0
        }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
          <div className="spinner" style={{ width: "36px", height: "36px", marginBottom: "0.75rem" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading real-time 3D telemetry for {ticker}...</p>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", minHeight: 0 }}>
          <AlertCircle size={32} color="#fca5a5" style={{ marginBottom: "0.5rem" }} />
          <h3 style={{ color: "#fca5a5", fontSize: "1.1rem", marginBottom: "0.4rem" }}>Stock Lookup Error</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
          <button onClick={() => { setTicker("RELIANCE"); setInputSymbol("RELIANCE"); }} className="btn-secondary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
            Reset to RELIANCE
          </button>
        </div>
      ) : details && (
        /* Main Cockpit Split Grid: Fits 100% of height without scrolling */
        <div style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1.3fr 0.9fr",
          gap: "0.6rem",
          overflow: "hidden"
        }}>
          {/* Left Column: Hero Price Card + Chart + Key Metrics */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", minHeight: 0, height: "100%", overflow: "hidden" }}>
            {/* Hero Price 3D Card */}
            <Card3D maxTilt={6} depth={15} style={{ padding: "0.85rem 1.15rem", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h1 style={{ fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", margin: 0, lineHeight: 1.2 }}>
                      {details.company_name}
                    </h1>
                    <span className="badge-tag" style={{ fontSize: "0.75rem", padding: "0.15rem 0.45rem", fontWeight: 700 }}>
                      {details.ticker}
                    </span>
                    <span className="badge-tag" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", fontSize: "0.72rem" }}>
                      {details.sector}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                    {details.industry} • Currency: <strong style={{ color: "#fff" }}>{details.currency}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button onClick={handleAddToWatchlist} className="btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Star size={13} color="var(--accent-cyan)" />
                    <span>Watchlist</span>
                  </button>
                  <button onClick={() => setShowAddTx(true)} className="btn-primary" style={{ padding: "0.35rem 0.85rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <PlusCircle size={13} />
                    <span>Trade</span>
                  </button>
                </div>
              </div>

              {/* Price & Day Change */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.9rem", marginTop: "0.6rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.03em" }}>
                  {details.currency === "INR" ? "₹" : "$"}{details.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className={isGain ? "badge-gain" : "badge-loss"} style={{ fontSize: "0.9rem", padding: "0.2rem 0.6rem" }}>
                  {isGain ? "▲ +" : "▼ "}
                  {details.change?.toFixed(2)} ({details.change_pct?.toFixed(2)}%)
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginLeft: "auto" }}>
                  Prev Close: {details.currency === "INR" ? "₹" : "$"}{details.previous_close || "N/A"}
                </div>
              </div>
            </Card3D>

            {/* Interactive Price Chart (Flex 1 to occupy middle height) */}
            <Card3D maxTilt={4} depth={12} style={{ padding: "0.75rem 1rem", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem", flexShrink: 0 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem", color: "#fff" }}>
                  <TrendingUp size={15} color="var(--accent-cyan)" className="icon-glow-cyan" />
                  <span>Interactive Price Trends</span>
                </span>

                {/* Period Pills */}
                <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.6)", padding: "0.15rem", borderRadius: "var(--radius-sm)", gap: "0.15rem" }}>
                  {["1d", "5d", "1m", "6m", "1y"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setPeriod(t)}
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        border: "none",
                        background: period === t ? "var(--primary)" : "transparent",
                        color: period === t ? "#fff" : "var(--text-muted)",
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        textTransform: "uppercase"
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                {chartLoading ? (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="spinner" style={{ width: "24px", height: "24px" }} />
                  </div>
                ) : (
                  renderSvgChart()
                )}
              </div>
            </Card3D>

            {/* Key Statistics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.45rem", flexShrink: 0 }}>
              {[
                { label: "Market Cap", val: formatNum(details.market_cap) },
                { label: "P/E Ratio", val: details.pe_ratio || "N/A" },
                { label: "52W High", val: `₹${details.fifty_two_week_high || "N/A"}` },
                { label: "52W Low", val: `₹${details.fifty_two_week_low || "N/A"}` },
                { label: "Volume", val: details.volume ? (details.volume > 1e6 ? `${(details.volume / 1e6).toFixed(1)}M` : details.volume.toLocaleString()) : "N/A" },
                { label: "Div Yield", val: details.dividend_yield ? `${details.dividend_yield}%` : "N/A" },
              ].map((st, i) => (
                <div key={i} className="glass-card card-3d-emboss" style={{ padding: "0.4rem 0.5rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.66rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{st.label}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#fff", marginTop: "0.15rem" }}>{st.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: 3D Holographic Object + 3D Range Bars + Scrollable Bio */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", minHeight: 0, height: "100%", overflow: "hidden" }}>
            {/* 3D Holographic Object Showcase Card */}
            <Card3D maxTilt={10} depth={25} style={{ padding: "0.75rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "linear-gradient(135deg, rgba(18, 24, 38, 0.85) 0%, rgba(30, 41, 65, 0.6) 100%)" }}>
              <div style={{ position: "absolute", top: "0.5rem", left: "0.75rem", fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: 700, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Boxes size={12} color="var(--accent-cyan)" className="icon-glow-cyan" />
                <span>3D ASSET MATRIX</span>
              </div>
              <ThreeDObject
                ticker={details.ticker}
                theme={isGain ? "gain" : "loss"}
                size={140}
                subtitle={`${details.currency} LIVE`}
              />
            </Card3D>

            {/* 3D Range Position Bars Card */}
            <Card3D maxTilt={5} depth={10} style={{ padding: "0.75rem 1rem", flexShrink: 0 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <BarChart3 size={13} color="var(--accent-cyan)" />
                <span>3D DEPTH RANGE METRICS</span>
              </div>

              {/* Day Range Bar */}
              <div style={{ marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: "0.2rem" }}>
                  <span>Day Range: ₹{details.day_low || "N/A"}</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>₹{details.day_high || "N/A"}</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${rangeDayPct}%`,
                    background: "linear-gradient(90deg, #6366f1, #06b6d4)",
                    borderRadius: "999px",
                    boxShadow: "0 0 8px rgba(6, 182, 212, 0.6)"
                  }} />
                </div>
              </div>

              {/* 52W Range Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: "0.2rem" }}>
                  <span>52W Range: ₹{details.fifty_two_week_low || "N/A"}</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>₹{details.fifty_two_week_high || "N/A"}</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${range52wPct}%`,
                    background: isGain ? "linear-gradient(90deg, #6366f1, #10b981)" : "linear-gradient(90deg, #6366f1, #f43f5e)",
                    borderRadius: "999px",
                    boxShadow: isGain ? "0 0 8px rgba(16, 185, 129, 0.6)" : "0 0 8px rgba(244, 63, 94, 0.6)"
                  }} />
                </div>
              </div>
            </Card3D>

            {/* Scrollable About Company Card (Takes remaining vertical height) */}
            <Card3D maxTilt={4} depth={10} style={{ padding: "0.85rem 1rem", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Building2 size={13} color="var(--accent-cyan)" />
                <span>Company Profile</span>
              </h3>
              <div className="custom-scroll" style={{ flex: 1, minHeight: 0, paddingRight: "0.3rem" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: 1.55 }}>
                  {details.summary || "No company business description available for this ticker."}
                </p>
              </div>
            </Card3D>
          </div>
        </div>
      )}

      {/* Record Trade Dialog */}
      {showAddTx && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
        }}>
          <div className="glass-card card-3d-emboss" style={{ width: "100%", maxWidth: "420px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowRightLeft size={18} color="var(--primary)" />
              <span>Record {ticker} Trade</span>
            </h3>
            <form onSubmit={handleCreateTransaction} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Action</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="glass-input"
                  style={{ width: "100%", padding: "0.5rem 0.8rem" }}
                >
                  <option value="BUY" style={{ background: "#0f172a" }}>BUY</option>
                  <option value="SELL" style={{ background: "#0f172a" }}>SELL</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Quantity (Shares)</label>
                <input
                  type="number"
                  step="any"
                  required
                  min="0.01"
                  className="glass-input"
                  style={{ width: "100%", padding: "0.5rem 0.8rem" }}
                  value={txShares}
                  onChange={(e) => setTxShares(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Price per Share (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="glass-input"
                  style={{ width: "100%", padding: "0.5rem 0.8rem" }}
                  value={txPrice}
                  onChange={(e) => setTxPrice(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowAddTx(false)} className="btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem" }}>
                  Save Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
