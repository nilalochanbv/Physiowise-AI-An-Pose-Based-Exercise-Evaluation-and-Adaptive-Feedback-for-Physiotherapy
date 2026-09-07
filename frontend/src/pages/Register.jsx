import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register(name, email, password, role);
      if (user.role === "doctor") {
        navigate("/patients");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="title-fraunces" style={{ fontSize: "28px", textAlign: "center", marginBottom: "8px" }}>
          Create Account
        </h1>
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
          Register for PhysioWise AI
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
              Full Name
            </label>
            <input
              type="text"
              className="pw-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Dr. Sarah Connor or Jane Doe"
            />
          </div>

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

          <div style={{ marginBottom: "16px" }}>
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

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              Account Role
            </label>
            <select className="pw-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">Patient (Rehabilitation Tracking)</option>
              <option value="doctor">Doctor / Clinician (Patient Directory)</option>
            </select>
          </div>

          <button type="submit" className="pw-btn" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "var(--sage-teal)", fontWeight: "600" }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
