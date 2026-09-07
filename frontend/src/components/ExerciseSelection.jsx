import React from "react";
import {
  KneeExtensionSvg,
  KneeFlexionSvg,
  SquatSvg,
  ShoulderRaiseSvg,
  ElbowFlexionSvg,
  HipAbductionSvg,
} from "./ExerciseIllustrations";

const EXERCISES_DATA = [
  {
    key: "knee_extension",
    name: "Knee Extension",
    target: "Quadriceps",
    reps: 15,
    SvgComponent: KneeExtensionSvg,
  },
  {
    key: "knee_flexion",
    name: "Knee Flexion",
    target: "Hamstrings",
    reps: 15,
    SvgComponent: KneeFlexionSvg,
  },
  {
    key: "squat",
    name: "Squat",
    target: "Quadriceps, Glutes",
    reps: 15,
    SvgComponent: SquatSvg,
  },
  {
    key: "shoulder_raise",
    name: "Shoulder Raise",
    target: "Shoulders",
    reps: 15,
    SvgComponent: ShoulderRaiseSvg,
  },
  {
    key: "elbow_flexion",
    name: "Elbow Flexion",
    target: "Biceps",
    reps: 15,
    SvgComponent: ElbowFlexionSvg,
  },
  {
    key: "hip_abduction",
    name: "Hip Abduction",
    target: "Hip Muscles",
    reps: 15,
    SvgComponent: HipAbductionSvg,
  },
];

export default function ExerciseSelection({ userName = "Demo Patient", onStartExercise, progressPct = 68, todayCount = 3 }) {
  return (
    <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Top Header Navigation matching reference design */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* PhysioWise Green Logo Icon */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            🏃
          </div>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#0F172A", letterSpacing: "-0.5px" }}>
            PhysioWise AI
          </span>
        </div>

        {/* Notifications & Profile Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              position: "relative",
              color: "#64748B",
            }}
            title="Notifications"
          >
            🔔
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "8px",
                height: "8px",
                backgroundColor: "#EF4444",
                borderRadius: "50%",
              }}
            />
          </button>

          {/* User Profile Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "#059669",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "15px",
                border: "2px solid #E2E8F0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              👩‍⚕️
            </div>
          </div>
        </div>
      </header>

      {/* Patient Progress Summary Banner */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Avatar Circle */}
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              backgroundColor: "#1E293B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#FFFFFF",
            }}
          >
            👤
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", margin: 0 }}>
              {userName}
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
              Today's Session: {todayCount} Exercises
            </p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div style={{ minWidth: "220px", flex: "0 1 280px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
            <span style={{ color: "#64748B", fontWeight: "500" }}>Progress</span>
            <span style={{ color: "#0F172A", fontWeight: "700" }}>{progressPct}%</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "10px",
              backgroundColor: "#E2E8F0",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                backgroundColor: "#10B981",
                borderRadius: "999px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0F172A", letterSpacing: "-0.3px" }}>
          Select an Exercise
        </h2>
      </div>

      {/* 6 Exercise Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {EXERCISES_DATA.map((ex) => {
          const { SvgComponent } = ex;
          return (
            <div
              key={ex.key}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              className="exercise-card-hover"
            >
              {/* Top Row: Illustration & Title */}
              <div>
                <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                  <SvgComponent />
                </div>

                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#0F172A",
                    marginBottom: "12px",
                    textAlign: "left",
                  }}
                >
                  {ex.name}
                </h3>

                {/* Exercise Details */}
                <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}>
                  <div>
                    <strong style={{ color: "#1E293B" }}>Target:</strong> {ex.target}
                  </div>
                  <div>
                    <strong style={{ color: "#1E293B" }}>Reps:</strong> {ex.reps}
                  </div>
                </div>
              </div>

              {/* Start Exercise Button */}
              <button
                onClick={() => onStartExercise(ex.key)}
                style={{
                  width: "100%",
                  padding: "12px 18px",
                  backgroundColor: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(5, 150, 105, 0.2)",
                  transition: "background-color 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#047857")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
              >
                Start Exercise
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
