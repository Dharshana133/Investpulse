import { useState } from "react";
import { authService } from "../services/api";
import {
  Zap,
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        const data = await authService.login(email, password);
        localStorage.setItem("token", data.access_token);
        const user = await authService.getCurrentUser();
        onAuthSuccess(user);
        onClose();
      } else {
        await authService.signup(email, password);
        setSuccessMsg("Account created successfully! Logging you in...");
        const data = await authService.login(email, password);
        localStorage.setItem("token", data.access_token);
        const user = await authService.getCurrentUser();
        onAuthSuccess(user);
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Authentication failed. Please check credentials.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.78)",
      backdropFilter: "blur(10px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }} className="animate-fade-in">
      <div className="glass-card card-3d-emboss" style={{
        width: "100%",
        maxWidth: "420px",
        padding: "2rem",
        position: "relative",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.2rem",
            right: "1.2rem",
            background: "none",
            border: "none",
            color: "var(--text-dim)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            transition: "all 0.15s ease"
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "none"; }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.4rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.4rem"
          }}>
            <Zap size={22} color="var(--primary)" className="icon-glow-primary" />
            <span>InvestPulse Secure</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
            {isLogin ? "Sign in to access your 3D watchlists & portfolio" : "Create an account to start tracking equities"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.4rem",
          background: "rgba(15, 23, 42, 0.6)",
          padding: "0.25rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.25rem"
        }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
            style={{
              padding: "0.45rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: isLogin ? "var(--primary)" : "transparent",
              color: isLogin ? "#fff" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
            style={{
              padding: "0.45rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: !isLogin ? "var(--primary)" : "transparent",
              color: !isLogin ? "#fff" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid var(--loss-border)",
            color: "#fca5a5",
            padding: "0.6rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.82rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}>
            <AlertCircle size={14} color="#fca5a5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: "var(--gain-bg)",
            border: "1px solid var(--gain-border)",
            color: "var(--gain)",
            padding: "0.6rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.82rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}>
            <CheckCircle2 size={14} color="var(--gain)" className="icon-glow-gain" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.3rem" }}>
              Email Address
            </label>
            <input
              type="email"
              required
              className="glass-input"
              style={{ width: "100%", padding: "0.5rem 0.8rem" }}
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.3rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={4}
                className="glass-input"
                style={{ width: "100%", padding: "0.5rem 2.4rem 0.5rem 0.8rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", marginTop: "0.4rem", padding: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            {loading ? (
              <div className="spinner" style={{ width: "18px", height: "18px" }} />
            ) : (
              <>
                <Lock size={14} />
                <span>{isLogin ? "Sign In" : "Register Account"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
