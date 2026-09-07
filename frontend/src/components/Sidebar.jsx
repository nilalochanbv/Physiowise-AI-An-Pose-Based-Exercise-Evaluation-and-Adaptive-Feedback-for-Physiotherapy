import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isPatient = user.role === "patient";

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: "36px" }}>
        <h1
          className="title-fraunces"
          style={{ fontSize: "22px", color: "#FFFFFF", letterSpacing: "-0.5px", marginBottom: "4px" }}
        >
          PhysioWise AI
        </h1>
        <p style={{ fontSize: "12px", color: "var(--muted-gold)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Rehab Analytics
        </p>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        {isPatient ? (
          <Link
            to="/dashboard"
            style={{
              display: "block",
              padding: "12px 16px",
              borderRadius: "6px",
              color: location.pathname === "/dashboard" ? "#FFFFFF" : "#A0AEC0",
              backgroundColor: location.pathname === "/dashboard" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: location.pathname === "/dashboard" ? "600" : "400",
            }}
          >
            My Dashboard
          </Link>
        ) : (
          <Link
            to="/patients"
            style={{
              display: "block",
              padding: "12px 16px",
              borderRadius: "6px",
              color: location.pathname.startsWith("/patients") ? "#FFFFFF" : "#A0AEC0",
              backgroundColor: location.pathname.startsWith("/patients") ? "rgba(255, 255, 255, 0.1)" : "transparent",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: location.pathname.startsWith("/patients") ? "600" : "400",
            }}
          >
            Patients Directory
          </Link>
        )}
      </nav>

      <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#FFFFFF" }}>{user.name}</div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", textTransform: "capitalize" }}>
            Role: <span className="mono-num">{user.role}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="pw-btn pw-btn-secondary"
          style={{ width: "100%", color: "#FFFFFF", borderColor: "#4A5568", backgroundColor: "transparent" }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
