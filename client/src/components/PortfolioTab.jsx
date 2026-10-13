import { useState, useEffect } from "react";
import { transactionService, priceService } from "../services/api";
import { Card3D } from "./Card3D";
import {
  Lock,
  PlusCircle,
  PieChart,
  LineChart,
  History,
  Trash2,
  Briefcase,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

export function PortfolioTab({ user, onRequireAuth, onSelectTicker }) {
  const [transactions, setTransactions] = useState([]);
  const [pricesMap, setPricesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // New Transaction Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [tickerInput, setTickerInput] = useState("RELIANCE");
  const [txType, setTxType] = useState("BUY");
  const [sharesInput, setSharesInput] = useState(10);
  const [priceInput, setPriceInput] = useState(2500);

  const refreshPortfolioPrices = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsRefreshing(true);

    try {
      const txs = await transactionService.getTransactions();
      setTransactions(txs);

      // Unique tickers
      const tickers = Array.from(new Set(txs.map((t) => t.ticker.toUpperCase())));
      if (tickers.length > 0) {
        // Fetch batch prices
        const priceData = await priceService.getPricesBatch(tickers);
        setPricesMap(priceData);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Portfolio refresh error:", err);
    } finally {
      if (isInitial) setLoading(false);
      else setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    refreshPortfolioPrices(true);

    // Auto-refresh live stock prices every 15 seconds
    const intervalId = setInterval(() => {
      refreshPortfolioPrices(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleAddTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await transactionService.addTransaction({
        ticker: tickerInput.trim().toUpperCase(),
        type: txType,
        quantity: parseFloat(sharesInput),
        shares: parseFloat(sharesInput),
        price: parseFloat(priceInput),
      });
      setShowAddModal(false);
      refreshPortfolioPrices(false);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Failed to add transaction.";
      alert(`Failed to add transaction: ${typeof detail === "object" ? JSON.stringify(detail) : detail}`);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction record?")) {
      try {
        await transactionService.deleteTransaction(id);
        refreshPortfolioPrices(false);
      } catch (err) {
        console.error(err);
      }
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
            Sign in to track real-time portfolio holdings, profit/loss telemetry, and execute trades across 842+ NSE equities.
          </p>
          <button onClick={onRequireAuth} className="btn-primary" style={{ padding: "0.55rem 1.4rem", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Lock size={14} />
            <span>Sign In to View Portfolio</span>
          </button>
        </Card3D>
      </div>
    );
  }

  // Calculate aggregated holdings per ticker
  const holdingsMap = {};
  transactions.forEach((tx) => {
    const sym = tx.ticker.toUpperCase();
    const q = tx.quantity !== undefined ? tx.quantity : (tx.shares || 0);
    if (!holdingsMap[sym]) {
      holdingsMap[sym] = { totalShares: 0, totalCost: 0 };
    }
    if (tx.type.toUpperCase() === "BUY") {
      holdingsMap[sym].totalShares += q;
      holdingsMap[sym].totalCost += q * tx.price;
    } else if (tx.type.toUpperCase() === "SELL") {
      holdingsMap[sym].totalShares -= q;
      holdingsMap[sym].totalCost -= q * tx.price;
    }
  });

  const holdingsList = Object.keys(holdingsMap)
    .filter((sym) => holdingsMap[sym].totalShares > 0)
    .map((sym) => {
      const h = holdingsMap[sym];
      const avgPrice = h.totalShares > 0 ? h.totalCost / h.totalShares : 0;
      const currentPrice = pricesMap[sym]?.price || avgPrice;
      const currentValue = h.totalShares * currentPrice;
      const pnl = currentValue - h.totalCost;
      const pnlPct = h.totalCost > 0 ? (pnl / h.totalCost) * 100 : 0;
      return {
        ticker: sym,
        shares: h.totalShares,
        totalCost: h.totalCost,
        avgPrice: avgPrice,
        currentPrice: currentPrice,
        currentValue: currentValue,
        pnl: pnl,
        pnlPct: pnlPct,
      };
    });

  const totalInvested = holdingsList.reduce((acc, item) => acc + item.totalCost, 0);
  const totalCurrentValue = holdingsList.reduce((acc, item) => acc + item.currentValue, 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "0.55rem", minHeight: 0, overflow: "hidden" }}>
      {/* Top 4 KPI Metrics in 3D Tilt Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.55rem", flexShrink: 0 }}>
        {/* Total Invested */}
        <Card3D maxTilt={6} depth={15} style={{ padding: "0.65rem 0.95rem" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Invested</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "#fff", marginTop: "0.2rem" }}>
            ₹{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>Cost basis</div>
        </Card3D>

        {/* Current Market Value */}
        <Card3D maxTilt={6} depth={15} style={{ padding: "0.65rem 0.95rem" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Current Market Value</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", marginTop: "0.2rem" }}>
            ₹{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>Live yfinance valuation</div>
        </Card3D>

        {/* Total Profit/Loss */}
        <Card3D maxTilt={6} depth={15} glowColor={totalPnl >= 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)"} style={{ padding: "0.65rem 0.95rem" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Net P&L</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: totalPnl >= 0 ? "var(--gain)" : "var(--loss)", marginTop: "0.2rem" }}>
            {totalPnl >= 0 ? "▲ +" : "▼ "}₹{Math.abs(totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.7rem", color: totalPnl >= 0 ? "var(--gain)" : "var(--loss)", fontWeight: 600, marginTop: "0.15rem" }}>
            {totalPnl >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}% return
          </div>
        </Card3D>

        {/* Holdings Count & Action */}
        <Card3D maxTilt={6} depth={15} style={{ padding: "0.65rem 0.95rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Holdings & Trades</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", marginTop: "0.2rem" }}>
              {holdingsList.length} Stocks • {transactions.length} Trades
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: "0.35rem 0.8rem", fontSize: "0.78rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <PlusCircle size={13} />
            <span>Add Trade</span>
          </button>
        </Card3D>
      </div>

      {/* Bottom Split Pane: Active Holdings & Transaction Logs */}
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "0.55rem", overflow: "hidden" }}>
        {/* Active Holdings Table Card */}
        <Card3D maxTilt={4} depth={10} style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h3 style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <PieChart size={15} color="var(--accent-cyan)" className="icon-glow-cyan" />
                <span>Active Holdings ({holdingsList.length})</span>
              </h3>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.15rem 0.45rem",
                borderRadius: "999px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontSize: "0.68rem",
                color: "var(--gain)",
                fontWeight: 600,
                letterSpacing: "0.02em"
              }}>
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--gain)",
                  display: "inline-block",
                  boxShadow: "0 0 6px var(--gain)"
                }} />
                <span>LIVE (15s)</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {lastUpdated && (
                <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                  Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
              <button
                type="button"
                onClick={() => refreshPortfolioPrices(false)}
                disabled={isRefreshing || loading}
                title="Refresh live prices now"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--bg-card-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.2rem 0.5rem",
                  color: "var(--text-muted)",
                  cursor: isRefreshing ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.72rem",
                  transition: "all 0.15s ease"
                }}
              >
                <RefreshCw size={11} style={{ animation: isRefreshing ? "spin 0.8s linear infinite" : "none" }} />
                <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          <div className="custom-scroll" style={{ flex: 1, minHeight: 0, overflowX: "auto" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <div className="spinner" style={{ width: "24px", height: "24px" }} />
              </div>
            ) : holdingsList.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-dim)", fontSize: "0.82rem" }}>
                <span>No holdings currently active.</span>
                <span style={{ fontSize: "0.75rem", marginTop: "0.2rem" }}>Log a BUY trade to populate your portfolio.</span>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--bg-card-border)", color: "var(--text-dim)", fontSize: "0.7rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Ticker</th>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Shares</th>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Avg / Live</th>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Cur Value</th>
                    <th style={{ padding: "0.4rem 0.5rem" }}>P&L</th>
                    <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsList.map((item) => (
                    <tr key={item.ticker} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "0.45rem 0.5rem", fontWeight: 700, color: "#fff" }}>
                        <span onClick={() => onSelectTicker(item.ticker)} style={{ cursor: "pointer", color: "var(--accent-cyan)", textDecoration: "underline" }}>
                          {item.ticker}
                        </span>
                      </td>
                      <td style={{ padding: "0.45rem 0.5rem", fontFamily: "var(--font-mono)" }}>
                        {item.shares}
                      </td>
                      <td style={{ padding: "0.45rem 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.76rem" }}>
                        ₹{item.avgPrice.toFixed(1)} / <strong style={{ color: "#fff" }}>₹{item.currentPrice.toFixed(1)}</strong>
                      </td>
                      <td style={{ padding: "0.45rem 0.5rem", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        ₹{item.currentValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td style={{ padding: "0.45rem 0.5rem" }}>
                        <span className={item.pnl >= 0 ? "badge-gain" : "badge-loss"} style={{ fontSize: "0.72rem", padding: "0.15rem 0.45rem" }}>
                          {item.pnl >= 0 ? "+" : ""}₹{item.pnl.toFixed(0)} ({item.pnlPct.toFixed(1)}%)
                        </span>
                      </td>
                      <td style={{ padding: "0.45rem 0.5rem", textAlign: "right" }}>
                        <button onClick={() => onSelectTicker(item.ticker)} className="btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <LineChart size={11} />
                          <span>Chart</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card3D>

        {/* Transaction History Logs Table Card */}
        <Card3D maxTilt={4} depth={10} style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexShrink: 0 }}>
            <h3 style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <History size={15} color="var(--accent-cyan)" className="icon-glow-cyan" />
              <span>Transaction Log ({transactions.length})</span>
            </h3>
            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Execution Audit</span>
          </div>

          <div className="custom-scroll" style={{ flex: 1, minHeight: 0, overflowX: "auto" }}>
            {transactions.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-dim)", fontSize: "0.82rem" }}>
                No recorded transaction history.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--bg-card-border)", color: "var(--text-dim)", fontSize: "0.7rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Date</th>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Type</th>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Ticker</th>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Shares</th>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Price</th>
                    <th style={{ padding: "0.4rem 0.5rem" }}>Total</th>
                    <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>Del</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                      <td style={{ padding: "0.4rem 0.5rem", color: "var(--text-dim)", fontSize: "0.74rem" }}>
                        {tx.date ? new Date(tx.date).toLocaleDateString() : "Today"}
                      </td>
                      <td style={{ padding: "0.4rem 0.5rem", fontWeight: 700, color: tx.type === "BUY" ? "var(--gain)" : "var(--loss)" }}>
                        {tx.type}
                      </td>
                      <td style={{ padding: "0.4rem 0.5rem", fontWeight: 700 }}>{tx.ticker}</td>
                      <td style={{ padding: "0.4rem 0.5rem" }}>{tx.quantity ?? tx.shares}</td>
                      <td style={{ padding: "0.4rem 0.5rem" }}>₹{tx.price}</td>
                      <td style={{ padding: "0.4rem 0.5rem", fontWeight: 600 }}>₹{((tx.quantity ?? tx.shares ?? 0) * tx.price).toFixed(1)}</td>
                      <td style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>
                        <button onClick={() => handleDeleteTransaction(tx.id)} className="btn-danger" style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", display: "inline-flex", alignItems: "center" }}>
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card3D>
      </div>

      {/* Add Transaction Dialog */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
        }}>
          <div className="glass-card card-3d-emboss" style={{ width: "100%", maxWidth: "420px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Briefcase size={18} color="var(--primary)" />
              <span>Add Portfolio Transaction</span>
            </h3>
            <form onSubmit={handleAddTransactionSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Stock Symbol / Ticker</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  style={{ width: "100%", padding: "0.5rem 0.8rem", textTransform: "uppercase" }}
                  placeholder="e.g. RELIANCE, TCS, AAPL"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Transaction Type</label>
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
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Number of Shares</label>
                <input
                  type="number"
                  step="any"
                  required
                  min="0.01"
                  className="glass-input"
                  style={{ width: "100%", padding: "0.5rem 0.8rem" }}
                  value={sharesInput}
                  onChange={(e) => setSharesInput(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Purchase Price per Share (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="glass-input"
                  style={{ width: "100%", padding: "0.5rem 0.8rem" }}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem" }}>
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
