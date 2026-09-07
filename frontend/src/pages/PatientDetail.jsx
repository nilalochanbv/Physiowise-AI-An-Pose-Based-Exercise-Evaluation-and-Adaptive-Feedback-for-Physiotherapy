import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoniometerGauge from "../components/GoniometerGauge";
import Sidebar from "../components/Sidebar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function PatientDetail() {
  const { patientId } = useParams();
  const { token } = useAuth();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch patient data");
      })
      .then((data) => {
        setPatient(data.patient);
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [patientId, token]);

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <div>Loading patient record...</div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <div>Patient record not found.</div>
          <Link to="/patients" className="pw-btn pw-btn-secondary" style={{ marginTop: "12px" }}>
            Return to Directory
          </Link>
        </main>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const correctSessions = sessions.filter((s) => s.verdict === 1).length;
  const accuracyPct = totalSessions > 0 ? ((correctSessions / totalSessions) * 100).toFixed(1) : "0.0";
  const avgScore =
    totalSessions > 0 ? (sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions).toFixed(1) : "0.0";

  const latestElbow = sessions.find((s) => s.exercise === "elbow_flexion");
  const latestKnee = sessions.find((s) => s.exercise === "knee_extension");

  const sortedChrono = [...sessions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const chartLabels = sortedChrono.map((s) =>
    new Date(s.timestamp).toLocaleTimeString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  );
  const chartScores = sortedChrono.map((s) => s.score);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Evaluation Score (%)",
        data: chartScores,
        borderColor: "#4C7A73",
        backgroundColor: "#4C7A73",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: "#E5E7EB" },
        ticks: { font: { family: "IBM Plex Mono" } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: "IBM Plex Mono", size: 11 } },
      },
    },
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {/* Patient Name in Fraunces */}
            <h1 className="title-fraunces" style={{ fontSize: "32px", color: "var(--ink-navy)" }}>
              {patient.name}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Patient ID: <span className="mono-num">{patient._id}</span> | Email: {patient.email}
            </p>
          </div>
          <Link to="/patients" className="pw-btn pw-btn-secondary">
            Back to Directory
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stat-grid">
          <div className="stat-item">
            <div className="stat-label">Total Sessions</div>
            <div className="stat-value mono-num">{totalSessions}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Accuracy Rate</div>
            <div className="stat-value mono-num" style={{ color: "var(--sage-teal)" }}>
              {accuracyPct}%
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Average Score</div>
            <div className="stat-value mono-num">{avgScore}</div>
          </div>
        </div>

        {/* Gauges */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--ink-navy)" }}>
            Recent Goniometer Readings
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {latestElbow ? (
              <GoniometerGauge
                exerciseTitle="Elbow Flexion"
                measuredAngle={latestElbow.measuredAngle}
                targetRange={latestElbow.targetRange}
                verdict={latestElbow.verdict}
                score={latestElbow.score}
                stage={latestElbow.stage}
              />
            ) : (
              <div className="pw-card" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                No recent Elbow Flexion sessions recorded.
              </div>
            )}

            {latestKnee ? (
              <GoniometerGauge
                exerciseTitle="Knee Extension"
                measuredAngle={latestKnee.measuredAngle}
                targetRange={latestKnee.targetRange}
                verdict={latestKnee.verdict}
                score={latestKnee.score}
                stage={latestKnee.stage}
              />
            ) : (
              <div className="pw-card" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                No recent Knee Extension sessions recorded.
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        {sessions.length > 0 && (
          <div className="pw-card">
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--ink-navy)" }}>
              Rehabilitation Trend Chart
            </h2>
            <div style={{ maxHeight: "300px" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="pw-card">
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--ink-navy)" }}>
            Complete Session History
          </h2>
          {sessions.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No recorded sessions for this patient.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="pw-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Exercise</th>
                    <th>Stage</th>
                    <th>Angle Readout</th>
                    <th>Target Range</th>
                    <th>Score</th>
                    <th>Verdict</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s._id || Math.random()}>
                      <td className="mono-num" style={{ fontSize: "13px" }}>
                        {new Date(s.timestamp).toLocaleString()}
                      </td>
                      <td style={{ textTransform: "capitalize", fontWeight: "500" }}>
                        {s.exercise.replace("_", " ")}
                      </td>
                      <td className="mono-num">{s.stage}</td>
                      <td className="mono-num" style={{ fontWeight: "600" }}>
                        {s.measuredAngle}°
                      </td>
                      <td className="mono-num" style={{ color: "var(--muted-gold)" }}>
                        {s.targetRange ? `${s.targetRange[0]}° - ${s.targetRange[1]}°` : "N/A"}
                      </td>
                      <td className="mono-num">{s.score}%</td>
                      <td>
                        <span className={`badge ${s.verdict === 1 ? "badge-correct" : "badge-incorrect"}`}>
                          {s.verdict === 1 ? "CORRECT" : "ADJUST"}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>{s.feedback}</td>
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
