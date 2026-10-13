import { Card3D } from "./Card3D";
import {
  TrendingUp,
  BrainCircuit,
  Wallet,
  ArrowRight,
  Activity,
  Sparkles,
} from "lucide-react";

export function HomeTab({ onNavigate, user, onRequireAuth }) {
  const cards = [
    {
      id: "explorer",
      title: "Explore Markets",
      tagline: "Live NSE Equities & Analytics",
      description:
        "Deep-dive into 842+ NSE stocks with real-time price feeds, interactive charts, 52-week ranges, and valuation multiples.",
      icon: TrendingUp,
      accentColor: "#06b6d4",
      glowColor: "rgba(6, 182, 212, 0.35)",
      bgGradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.03) 100%)",
      badge: "LIVE DATA",
    },
    {
      id: "ai_advisor",
      title: "AI Stock Analyst",
      tagline: "Algorithmic Decision Engine",
      description:
        "Instant multi-factor synthesis answering 'Shall I buy this stock?'. Computes risk-reward ratings, catalysts, and warnings.",
      icon: BrainCircuit,
      accentColor: "#818cf8",
      glowColor: "rgba(129, 140, 248, 0.35)",
      bgGradient: "linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(129, 140, 248, 0.03) 100%)",
      badge: "AI ENGINE",
    },
    {
      id: "portfolio",
      title: "My Portfolio",
      tagline: "15s Live Auto-Refresh",
      description:
        "Log buy & sell trades, track overall net P&L with continuous background price sync, and review your holdings allocation.",
      icon: Wallet,
      accentColor: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.35)",
      bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.03) 100%)",
      badge: "AUTO-SYNC",
    },
  ];

  return (
    <div
      className="custom-scroll"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem 1rem 2.5rem 1rem",
        position: "relative",
        overflowY: "auto",
        minHeight: "100%",
      }}
    >
      {/* Ambient background glow orbs for depth */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "20%",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1050px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* 1. Welcoming Pill Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.3rem 0.9rem",
            borderRadius: "999px",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.35)",
            fontSize: "0.78rem",
            color: "var(--accent-cyan)",
            fontWeight: 700,
            letterSpacing: "0.06em",
            marginBottom: "1.1rem",
            backdropFilter: "blur(8px)",
          }}
        >
          <Sparkles size={13} color="var(--accent-cyan)" />
          <span>REAL-TIME NSE MARKET INTELLIGENCE</span>
        </div>

        {/* 2. Headline with Clean Typography */}
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            margin: "0 0 0.85rem 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <span>Welcome to</span>
          <span
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            InvestPulse
            <Activity size={32} color="#38bdf8" style={{ filter: "drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))" }} />
          </span>
        </h1>

        {/* 3. Single Subtitle */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.68)",
            fontSize: "clamp(0.92rem, 1.5vw, 1.05rem)",
            lineHeight: 1.6,
            maxWidth: "620px",
            margin: "0 0 1.6rem 0",
            fontWeight: 400,
          }}
        >
          Navigate the market with intelligent insights, multi-factor algorithmic stock analysis,
          and continuous 15-second portfolio valuation.
        </p>

        {/* 4. Two Sleek Pill CTA Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.85rem",
            flexWrap: "wrap",
            marginBottom: "2.8rem",
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate("explorer")}
            className="btn-primary"
            style={{
              padding: "0.65rem 1.6rem",
              fontSize: "0.92rem",
              fontWeight: 700,
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
            }}
          >
            <span>Explore Stocks</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate("portfolio")}
            style={{
              padding: "0.65rem 1.6rem",
              fontSize: "0.92rem",
              fontWeight: 600,
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backdropFilter: "blur(10px)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--gain)";
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
              e.currentTarget.style.color = "#10b981";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#ffffff";
            }}
          >
            <Wallet size={15} />
            <span>Open Portfolio</span>
          </button>
        </div>

        {/* 5. Three Big Glassmorphic Action Tiles */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "1.4rem",
            alignItems: "stretch",
          }}
        >
          {cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card3D
                key={card.id}
                maxTilt={8}
                depth={16}
                glowColor={card.glowColor}
                onClick={() => onNavigate(card.id)}
                style={{
                  cursor: "pointer",
                  padding: "1.8rem 1.6rem",
                  borderRadius: "var(--radius-lg)",
                  background: card.bgGradient,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "space-between",
                  minHeight: "280px",
                  backdropFilter: "blur(16px)",
                  transition: "border-color 0.25s ease, transform 0.2s ease",
                }}
              >
                {/* Top Badge */}
                <div
                  style={{
                    alignSelf: "flex-end",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    color: card.accentColor,
                    background: `${card.accentColor}18`,
                    border: `1px solid ${card.accentColor}44`,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "999px",
                  }}
                >
                  {card.badge}
                </div>

                {/* Big Glowing Center Icon */}
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "20px",
                    background: `linear-gradient(135deg, ${card.accentColor}28 0%, ${card.accentColor}08 100%)`,
                    border: `1.5px solid ${card.accentColor}66`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0.6rem 0 1rem 0",
                    boxShadow: `0 0 25px ${card.accentColor}33`,
                  }}
                >
                  <IconComponent
                    size={34}
                    color={card.accentColor}
                    style={{ filter: `drop-shadow(0 0 8px ${card.accentColor})` }}
                  />
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#ffffff",
                      margin: "0 0 0.3rem 0",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {card.title}
                  </h3>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: card.accentColor,
                      fontWeight: 600,
                      marginBottom: "0.7rem",
                    }}
                  >
                    {card.tagline}
                  </div>
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.62)",
                      fontSize: "0.84rem",
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {card.description}
                  </p>
                </div>

                {/* Bottom Subtle Action Pill */}
                <div
                  style={{
                    marginTop: "1.4rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: card.accentColor,
                  }}
                >
                  <span>Launch</span>
                  <ArrowRight size={14} />
                </div>
              </Card3D>
            );
          })}
        </div>
      </div>
    </div>
  );
}
