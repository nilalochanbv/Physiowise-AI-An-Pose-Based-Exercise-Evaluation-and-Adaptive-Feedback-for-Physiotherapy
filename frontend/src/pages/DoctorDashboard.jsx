import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

export default function DoctorDashboard() {
  const { user, token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patients", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch patients");
      })
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: "28px" }}>
          <h1 className="title-fraunces" style={{ fontSize: "32px", color: "var(--ink-navy)" }}>
            Clinician Directory
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Patient Monitoring Overview — Select a patient to inspect goniometer angle histories and progress charts.
          </p>
        </div>

        <div className="pw-card">
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--ink-navy)" }}>
            Registered Patients
          </h2>

          {loading ? (
            <div>Loading patients directory...</div>
          ) : patients.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No patient records found in database.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="pw-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Email Address</th>
                    <th>Total Sessions</th>
                    <th>Accuracy Rate</th>
                    <th>Avg Score</th>
                    <th>Last Active</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p._id}>
                      <td className="title-fraunces" style={{ fontSize: "16px" }}>
                        {p.name}
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{p.email}</td>
                      <td className="mono-num">{p.totalSessions}</td>
                      <td className="mono-num" style={{ color: "var(--sage-teal)", fontWeight: "600" }}>
                        {p.accuracyPct}%
                      </td>
                      <td className="mono-num">{p.avgScore}</td>
                      <td className="mono-num" style={{ fontSize: "13px" }}>
                        {p.lastSessionDate ? new Date(p.lastSessionDate).toLocaleDateString() : "Never"}
                      </td>
                      <td>
                        <Link to={`/patients/${p._id}`} className="pw-btn pw-btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
