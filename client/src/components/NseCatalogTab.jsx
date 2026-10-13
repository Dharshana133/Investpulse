import { useState, useEffect } from "react";
import { priceService, watchlistService } from "../services/api";
import { Card3D } from "./Card3D";
import {
  Compass,
  Star,
  LineChart,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export function NseCatalogTab({ onSelectTicker, user, onRequireAuth }) {
  const [catalog, setCatalog] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const limit = 30;

  useEffect(() => {
    fetchCatalog(query, selectedSector, page);
  }, [query, selectedSector, page]);

  const fetchCatalog = async (qStr, secStr, pageNum) => {
    setLoading(true);
    try {
      const data = await priceService.getNseCatalog(qStr, secStr === "All" ? "" : secStr, limit, pageNum * limit);
      setCatalog(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWatchlist = async (e, ticker) => {
    e.stopPropagation();
    if (!user) {
      onRequireAuth();
      return;
    }
    try {
      await watchlistService.addWatchlist(ticker);
      setMsg(`Added ${ticker} to Watchlist! ⭐`);
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      const detail = err.response?.data?.detail || "Already on watchlist";
      setMsg(`⚠️ ${detail}`);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "0.55rem", minHeight: 0, overflow: "hidden" }}>
      {/* Top Search & Filter Header Ribbon */}
      <div className="glass-card card-3d-emboss" style={{ padding: "0.5rem 1rem", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Compass size={17} color="var(--accent-cyan)" className="icon-glow-cyan" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: 0 }}>
              NSE Stock Directory
            </h2>
            <span className="badge-tag" style={{ background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}>
              Total: {catalog?.total || 842} Stocks
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Text Search */}
            <input
              type="text"
              className="glass-input"
              style={{ width: "220px", padding: "0.3rem 0.65rem", fontSize: "0.82rem" }}
              placeholder="Filter symbol or company..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            />

            {/* Sector Filter Dropdown */}
            <select
              className="glass-input"
              style={{ width: "170px", padding: "0.3rem 0.65rem", fontSize: "0.82rem" }}
              value={selectedSector}
              onChange={(e) => { setSelectedSector(e.target.value); setPage(0); }}
            >
              <option value="All" style={{ background: "#0f172a" }}>All Sectors ({catalog?.sectors?.length || 0})</option>
              {catalog?.sectors?.map((sec) => (
                <option key={sec} value={sec} style={{ background: "#0f172a" }}>
                  {sec}
                </option>
              ))}
            </select>
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

      {/* Main Catalog Table (Fills remaining height with internal scroll) */}
      <Card3D maxTilt={2} depth={6} interactive={false} style={{ flex: 1, minHeight: 0, padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="custom-scroll" style={{ flex: 1, minHeight: 0, overflowX: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "0.5rem" }}>
              <div className="spinner" style={{ width: "32px", height: "32px" }} />
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Querying NSE stock catalog...</p>
            </div>
          ) : catalog?.items?.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No matching NSE stocks found for "{query}".
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead style={{ position: "sticky", top: 0, background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(8px)", zIndex: 10 }}>
                <tr style={{ borderBottom: "1px solid var(--bg-card-border)", color: "var(--text-dim)", fontSize: "0.72rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "0.6rem 0.85rem" }}>Symbol</th>
                  <th style={{ padding: "0.6rem 0.85rem" }}>Company Name</th>
                  <th style={{ padding: "0.6rem 0.85rem" }}>Sector</th>
                  <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {catalog?.items?.map((item) => (
                  <tr
                    key={item.ticker}
                    onClick={() => onSelectTicker(item.ticker)}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={{ padding: "0.55rem 0.85rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                      <span style={{ color: "var(--accent-cyan)" }}>{item.ticker}</span>
                      <span style={{ color: "var(--text-dim)", fontSize: "0.7rem", marginLeft: "0.25rem" }}>.NS</span>
                    </td>
                    <td style={{ padding: "0.55rem 0.85rem", fontWeight: 500, color: "var(--text-main)" }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "0.55rem 0.85rem" }}>
                      <span className="badge-tag" style={{ fontSize: "0.72rem" }}>
                        {item.sector}
                      </span>
                    </td>
                    <td style={{ padding: "0.55rem 0.85rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        <button
                          onClick={(e) => handleAddWatchlist(e, item.ticker)}
                          className="btn-secondary"
                          style={{ padding: "0.25rem 0.55rem", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                        >
                          <Star size={11} color="var(--accent-cyan)" />
                          <span>Watch</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectTicker(item.ticker); }}
                          className="btn-primary"
                          style={{ padding: "0.25rem 0.65rem", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                        >
                          <LineChart size={11} />
                          <span>3D Intel</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Compact Pagination Bar */}
        {catalog && catalog.total > limit && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.45rem 1rem",
            borderTop: "1px solid var(--bg-card-border)",
            background: "rgba(10, 15, 26, 0.7)",
            flexShrink: 0
          }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Showing {page * limit + 1} - {Math.min((page + 1) * limit, catalog.total)} of {catalog.total} stocks
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="btn-secondary"
                style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", opacity: page === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: "0.2rem" }}
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff", padding: "0 0.35rem" }}>
                Page {page + 1} of {Math.ceil(catalog.total / limit)}
              </span>
              <button
                disabled={(page + 1) * limit >= catalog.total}
                onClick={() => setPage(page + 1)}
                className="btn-secondary"
                style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", opacity: (page + 1) * limit >= catalog.total ? 0.4 : 1, display: "flex", alignItems: "center", gap: "0.2rem" }}
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </Card3D>
    </div>
  );
}
