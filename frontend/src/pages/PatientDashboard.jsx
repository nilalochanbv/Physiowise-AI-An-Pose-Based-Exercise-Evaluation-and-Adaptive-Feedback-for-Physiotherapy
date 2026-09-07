import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import GoniometerGauge from "../components/GoniometerGauge";
import Sidebar from "../components/Sidebar";
import LiveWebcamSession from "../components/LiveWebcamSession";
import ExerciseSelection from "../components/ExerciseSelection";

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

export default function PatientDashboard() {
  const { user, token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState("elbow_flexion");
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSessions();
    }
  }, [token]);

  // Aggregate Stats
  const totalSessions = sessions.length;
  const correctSessions = sessions.filter((s) => s.verdict === 1).length;
  const accuracyPct = totalSessions > 0 ? ((correctSessions / totalSessions) * 100).toFixed(1) : "0.0";
  const avgScore =
    totalSessions > 0 ? (sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions).toFixed(1) : "0.0";

  // Latest readings per exercise
  const latestElbow = sessions.find((s) => s.exercise === "elbow_flexion");
  const latestKnee = sessions.find((s) => s.exercise === "knee_extension");

  // Chart Data preparation (chronological order)
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
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}%`,
        },
      },
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

  const handleStartExercise = (exerciseKey) => {
    setSelectedExercise(exerciseKey);
    setIsCameraActive(true);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {/* Exercise Selection View Matching Design Mockup */}
        <div style={{ marginBottom: "40px" }}>
          <ExerciseSelection
            userName={user?.name || "Demo Patient"}
            progressPct={accuracyPct > 0 ? parseFloat(accuracyPct) : 68}
            todayCount={totalSessions > 0 ? totalSessions : 3}
            onStartExercise={handleStartExercise}
          />
        </div>
        {/* Fraunces header with patient's name */}
        <div style={{ marginBottom: "28px" }}>
          <h1 className="title-fraunces" style={{ fontSize: "32px", color: "var(--ink-navy)" }}>
            Welcome, {user?.name || "Patient"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Patient Rehabilitation Dashboard — Real-time Evaluation & Progress Tracking
          </p>
        </div>

        {/* Summary Stats Cards with IBM Plex Mono Numbers */}
        <div className="stat-grid">
          <div className="stat-item">
            <div className="stat-label">Total Sessions</div>
            <div className="stat-value mono-num">{totalSessions}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Overall Accuracy</div>
            <div className="stat-value mono-num" style={{ color: "var(--sage-teal)" }}>
              {accuracyPct}%
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Average Score</div>
            <div className="stat-value mono-num">{avgScore}</div>
          </div>
        </div>

        {/* Goniometer Arc Gauges Section */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--ink-navy)" }}>
            Latest Goniometer Readings
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

        {/* Start Exercise Section */}
        <div className="pw-card">
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "var(--ink-navy)" }}>
            Start Live Camera Exercise Session
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Select an exercise protocol below and click "Start Live Camera Session" to enable your camera and track form in real time.
          </p>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ minWidth: "260px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                Select Protocol
              </label>
              <select
                className="pw-select"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                <option value="elbow_flexion">Elbow Flexion (Stage 3 Target: 101°-145°)</option>
                <option value="knee_extension">Knee Extension (Stage 3 Target: 171°-180°)</option>
              </select>
            </div>
            <button
              onClick={() => setIsCameraActive(true)}
              className="pw-btn"
              style={{ marginTop: "18px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>📷 Start Live Camera Session</span>
            </button>
          </div>
        </div>

        {/* Live Camera Session Modal */}
        {isCameraActive && (
          <LiveWebcamSession
            exerciseName={selectedExercise}
            stage={3}
            token={token}
            onClose={() => setIsCameraActive(false)}
            onSessionSaved={() => {
              fetchSessions();
            }}
          />
        )}

        {/* Score Trend Line Chart */}
        {sessions.length > 0 && (
          <div className="pw-card">
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--ink-navy)" }}>
              Score Trend Over Time
            </h2>
            <div style={{ maxHeight: "300px" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Full Session History Table */}
        <div className="pw-card">
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--ink-navy)" }}>
            Session History
          </h2>
          {loading ? (
            <div>Loading session history...</div>
          ) : sessions.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No recorded sessions yet.</div>
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
