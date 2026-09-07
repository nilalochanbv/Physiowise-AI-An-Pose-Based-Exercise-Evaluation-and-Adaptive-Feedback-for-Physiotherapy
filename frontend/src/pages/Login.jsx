import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === "doctor") {
        navigate("/patients");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="title-fraunces" style={{ fontSize: "28px", textAlign: "center", marginBottom: "8px" }}>
          PhysioWise AI
        </h1>
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted)", marginBottom: "28px" }}>
          Deterministic Rehabilitation Monitoring
        </p>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#FFEBEE",
              border: "1px solid var(--rust-alert)",
              color: "var(--rust-alert)",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              className="pw-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              className="pw-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="pw-btn" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--sage-teal)", fontWeight: "600" }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
