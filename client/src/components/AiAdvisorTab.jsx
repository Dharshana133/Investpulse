import { useState } from "react";
import { aiService, watchlistService } from "../services/api";
import { Card3D } from "./Card3D";
import { ThreeDObject } from "./ThreeDObject";
import {
  Bot,
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  LineChart,
  Star,
  BrainCircuit,
  Lightbulb,
} from "lucide-react";

export function AiAdvisorTab({ onSelectTicker, user, onRequireAuth }) {
  const [tickerInput, setTickerInput] = useState("RELIANCE");
  const [queryInput, setQueryInput] = useState("Shall I buy this stock?");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [savedWatchlist, setSavedWatchlist] = useState(false);

  const samplePrompts = [
    { ticker: "RELIANCE", query: "Shall I buy RELIANCE share?" },
    { ticker: "TATAMOTORS", query: "Is TATAMOTORS a good buy for growth?" },
    { ticker: "TCS", query: "Should I buy TCS at current price?" },
    { ticker: "AAPL", query: "Analyze Apple stock valuation" },
    { ticker: "NVDA", query: "Is NVIDIA overvalued right now?" },
    { ticker: "INFY", query: "Evaluate Infosys dividend & risk profile" },
  ];

  const handleRunAnalysis = async (ticker, query) => {
    const t = (typeof ticker === "string" ? ticker : tickerInput) || "";
    const q = (typeof query === "string" ? query : queryInput) || "";
    if (!t.trim()) {
      setError("Please enter a ticker symbol.");
      return;
    }
    setLoading(true);
    setError(null);
    setSavedWatchlist(false);

    try {
      console.log("Running AI Analysis for:", t, q);
      const res = await aiService.analyzeStock(t.trim(), (q || "Shall I buy this stock?").trim());
      console.log("AI Analysis response received:", res);
      setAnalysis(res);
    } catch (err) {
      console.error("AI Analysis error:", err);
      let msg = "Failed to analyze stock. Please verify the ticker symbol.";
      if (typeof err.response?.data?.detail === "string") {
        msg = err.response.data.detail;
      } else if (Array.isArray(err.response?.data?.detail)) {
        msg = err.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
      } else if (err.message?.includes("Network Error") || err.code === "ERR_NETWORK") {
        msg = "Connecting to the server... The backend may still be waking up. Please retry in a few seconds.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (item) => {
    setTickerInput(item.ticker);
    setQueryInput(item.query);
    handleRunAnalysis(item.ticker, item.query);
  };

  const handleAddWatchlist = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!analysis?.ticker) return;
    try {
      await watchlistService.addWatchlist(analysis.ticker);
      setSavedWatchlist(true);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add to watchlist");
    }
  };

  return (
    <div style={{
      height: "100%",
      display: "grid",
      gridTemplateColumns: "380px 1fr",
      gap: "0.6rem",
      minHeight: 0,
      overflow: "hidden"
    }}>
      {/* Left Column: AI Query Control Center & 3D Brain */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", minHeight: 0, height: "100%", overflow: "hidden" }}>
        {/* Form Card */}
        <div className="glass-card card-3d-emboss" style={{ padding: "0.85rem 1rem", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(99, 102, 241, 0.4)",
              flexShrink: 0,
              color: "#fff"
            }}>
              <Bot size={18} className="icon-glow-cyan" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                AI Stock Analyst
              </h2>
              <div style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Sparkles size={10} />
                <span>NEURAL VALUATION ENGINE</span>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAnalysis();
            }}
            style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                Ticker Symbol (NSE / US)
              </label>
              <input
                type="text"
                className="glass-input"
                style={{ width: "100%", padding: "0.35rem 0.65rem", fontSize: "0.85rem", textTransform: "uppercase" }}
                placeholder="e.g. RELIANCE, TCS, AAPL"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                Analysis Question
              </label>
              <input
                type="text"
                className="glass-input"
                style={{ width: "100%", padding: "0.35rem 0.65rem", fontSize: "0.82rem" }}
                placeholder="Shall I buy? Is it good for long term?"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                required
              />
            </div>

            <button
              type="button"
              className="btn-primary"
              disabled={loading}
              onClick={() => handleRunAnalysis()}
              style={{
                padding: "0.45rem 1rem",
                fontSize: "0.85rem",
                marginTop: "0.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: "16px", height: "16px" }} />
                  <span>Analysing...</span>
                </>
              ) : (
                <>
                  <Cpu size={14} className="icon-glow-cyan" />
                  <span>Run Analyser</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 3D Holographic AI Brain Object */}
        <Card3D maxTilt={8} depth={20} style={{ padding: "0.5rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(18, 24, 38, 0.8) 0%, rgba(30, 41, 65, 0.5) 100%)" }}>
          <ThreeDObject
            ticker={tickerInput || "AI"}
            theme="cyan"
            size={120}
            subtitle="NEURAL MODEL"
          />
        </Card3D>

        {/* Quick Suggestion Prompts Card (Scrollable internally) */}
        <Card3D maxTilt={4} depth={10} style={{ padding: "0.75rem", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--accent-cyan)", fontWeight: 700, marginBottom: "0.4rem", flexShrink: 0, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Lightbulb size={12} color="var(--accent-cyan)" />
            <span>QUICK PRESET PROMPTS</span>
          </div>
          <div className="custom-scroll" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "0.35rem", paddingRight: "0.2rem" }}>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(p)}
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.35rem 0.6rem",
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "rgba(99, 102, 241, 0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                }}
              >
                <Sparkles size={11} color="var(--accent-cyan)" />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.query}</span>
              </button>
            ))}
          </div>
        </Card3D>
      </div>

      {/* Right Column: AI Insights & Recommendation Output */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%", overflow: "hidden" }}>
        {error && (
          <div style={{
            padding: "0.5rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            fontSize: "0.82rem",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            flexShrink: 0
          }}>
            <AlertTriangle size={14} color="#f87171" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <Card3D maxTilt={6} depth={20} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <ThreeDObject ticker={tickerInput} theme="primary" size={160} subtitle="SYNTHESIZING..." />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1rem", color: "#fff" }}>
              Evaluating Multi-Factor Valuation Metrics...
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", maxWidth: "420px", textAlign: "center", marginTop: "0.3rem" }}>
              Synthesizing 52-week price channels, P/E multiples, industry peer benchmarks, and momentum trajectory for {tickerInput}.
            </p>
          </Card3D>
        ) : !analysis ? (
          <Card3D maxTilt={5} depth={15} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
            <BrainCircuit size={48} color="var(--primary)" className="icon-glow-primary" style={{ marginBottom: "0.5rem" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "0.5rem", color: "#fff" }}>
              Ready for Stock Intelligence Query
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "460px", marginTop: "0.3rem", lineHeight: 1.5 }}>
              Choose a prompt from the left panel or type any equity ticker (e.g. RELIANCE, TCS, INFY, AAPL, NVDA) to receive actionable valuation models and risk analysis.
            </p>
          </Card3D>
        ) : (
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "0.55rem", overflow: "hidden" }}>
            {/* Top Verdict Hero Card */}
            {(() => {
              const vColor = (analysis.verdict_color && analysis.verdict_color.startsWith("#")) ? analysis.verdict_color : "#10b981";
              return (
                <Card3D maxTilt={5} depth={15} style={{ padding: "0.85rem 1.25rem", flexShrink: 0, border: `1px solid ${vColor}66` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                          {analysis.company_name}
                        </h2>
                        <span className="badge-tag" style={{ color: "var(--accent-cyan)", fontWeight: 700, fontSize: "0.75rem" }}>
                          {analysis.ticker}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          ({analysis.sector})
                        </span>
                      </div>

                      <div style={{ marginTop: "0.3rem", fontSize: "1.2rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-mono)" }}>
                        {analysis.currency || "INR"} {(analysis.price != null ? Number(analysis.price) : 0).toLocaleString()}
                        <span style={{
                          marginLeft: "0.6rem",
                          fontSize: "0.85rem",
                          color: (analysis.change_pct || 0) >= 0 ? "var(--gain)" : "var(--loss)",
                          fontWeight: 700
                        }}>
                          {(analysis.change_pct || 0) >= 0 ? "▲ +" : "▼ "}{analysis.change_pct || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Verdict Badge & Confidence Dial */}
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                      <div style={{
                        background: vColor,
                        color: "#000",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                        padding: "0.35rem 0.9rem",
                        borderRadius: "999px",
                        letterSpacing: "0.03em",
                        boxShadow: `0 0 15px ${vColor}88`
                      }}>
                        {analysis.verdict}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        AI Confidence: <strong style={{ color: "#fff" }}>{analysis.confidence_score}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Summary Bar */}
                  <div style={{
                    background: "rgba(99, 102, 241, 0.08)",
                    borderLeft: `3px solid ${vColor}`,
                    padding: "0.45rem 0.75rem",
                    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                    marginTop: "0.5rem",
                    fontSize: "0.82rem",
                    color: "#e2e8f0",
                    lineHeight: 1.45
                  }}>
                    <strong>Recommendation:</strong> {analysis.recommendation_summary}
                  </div>
                </Card3D>
              );
            })()}

            {/* Key Metrics Row */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Object.keys(analysis.key_metrics || {}).length || 4}, 1fr)`, gap: "0.45rem", flexShrink: 0 }}>
              {Object.entries(analysis.key_metrics || {}).map(([key, val]) => (
                <div key={key} className="glass-card card-3d-emboss" style={{ padding: "0.35rem 0.5rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {key}
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginTop: "0.1rem", fontFamily: "var(--font-mono)" }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>

            {/* Pros, Cons & Narrative (Occupies remaining height with internal scroll) */}
            <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem", overflow: "hidden" }}>
              {/* Pros & Drivers */}
              <Card3D maxTilt={4} depth={10} style={{ padding: "0.7rem", display: "flex", flexDirection: "column", minHeight: 0, background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <div style={{ fontWeight: 700, color: "var(--gain)", fontSize: "0.78rem", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                  <CheckCircle2 size={14} color="var(--gain)" className="icon-glow-gain" />
                  <span>Bullish Drivers & Catalysts</span>
                </div>
                <div className="custom-scroll" style={{ flex: 1, minHeight: 0, paddingRight: "0.2rem" }}>
                  <ul style={{ margin: 0, paddingLeft: "1rem", color: "var(--text-muted)", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "0.3rem", lineHeight: 1.45 }}>
                    {analysis.pros?.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              </Card3D>

              {/* Risks & Considerations */}
              <Card3D maxTilt={4} depth={10} style={{ padding: "0.7rem", display: "flex", flexDirection: "column", minHeight: 0, background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <div style={{ fontWeight: 700, color: "#f87171", fontSize: "0.78rem", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                  <AlertTriangle size={14} color="#f87171" className="icon-glow-loss" />
                  <span>Risks & Warning Signals</span>
                </div>
                <div className="custom-scroll" style={{ flex: 1, minHeight: 0, paddingRight: "0.2rem" }}>
                  <ul style={{ margin: 0, paddingLeft: "1rem", color: "var(--text-muted)", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "0.3rem", lineHeight: 1.45 }}>
                    {analysis.cons?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </Card3D>
            </div>

            {/* Bottom Action Ribbon */}
            <div className="glass-card card-3d-emboss" style={{ padding: "0.45rem 0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => onSelectTicker(analysis.ticker)}
                  className="btn-primary"
                  style={{ padding: "0.35rem 0.85rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <LineChart size={13} />
                  <span>Open in Stock Explorer</span>
                </button>
                <button
                  onClick={handleAddWatchlist}
                  className="btn-secondary"
                  disabled={savedWatchlist}
                  style={{ padding: "0.35rem 0.85rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Star size={13} color="var(--accent-cyan)" />
                  <span>{savedWatchlist ? "Saved" : "Add to Watchlist"}</span>
                </button>
              </div>

              <span style={{ fontSize: "0.68rem", color: "var(--text-dim)", maxWidth: "380px", textAlign: "right" }}>
                {analysis.disclaimer}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
