import React, { useEffect, useRef, useState } from "react";
import GoniometerGauge from "./GoniometerGauge";
import { evaluate, calculateAngle } from "../utils/ruleEngine";

// Landmark Indices
const RIGHT_SHOULDER = 12;
const RIGHT_ELBOW = 14;
const RIGHT_WRIST = 16;
const RIGHT_HIP = 24;
const RIGHT_KNEE = 26;
const RIGHT_ANKLE = 28;

const LANDMARK_MAP = {
  elbow_flexion: [RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST],
  knee_extension: [RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE],
  knee_flexion: [RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE],
  squat: [RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE],
  shoulder_raise: [RIGHT_HIP, RIGHT_SHOULDER, RIGHT_ELBOW],
  hip_abduction: [RIGHT_SHOULDER, RIGHT_HIP, RIGHT_KNEE],
};

const FEEDBACK_TEMPLATES = {
  elbow_flexion: {
    1: "Good, your elbow flexion is within the target range.",
    0: "Adjust your elbow angle to bring it closer to the target range.",
  },
  knee_extension: {
    1: "Nice work, your knee extension looks correct.",
    0: "Try to straighten your knee more to reach the target angle.",
  },
  knee_flexion: {
    1: "Great knee flexion depth achieved.",
    0: "Flex your knee back further to hit target angle.",
  },
  squat: {
    1: "Excellent squat posture and depth!",
    0: "Lower your hips deeper into a full squat position.",
  },
  shoulder_raise: {
    1: "Arms raised correctly to target elevation.",
    0: "Raise your arms higher to reach full range.",
  },
  hip_abduction: {
    1: "Good hip abduction angle and leg position.",
    0: "Lift your leg further outward to target hip muscles.",
  },
};

export default function LiveWebcamSession({
  exerciseName = "elbow_flexion",
  stage = 3,
  token,
  onClose,
  onSessionSaved,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [measuredAngle, setMeasuredAngle] = useState(0);
  const [latestResult, setLatestResult] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const lastEvalTimeRef = useRef(0);
  const lastSpokenVerdictRef = useRef(null);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    let active = true;

    async function startCameraSession() {
      try {
        // 1. Start Native Web Camera Stream
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
            audio: false,
          });
        } catch (fallbackErr) {
          console.warn("Ideal video constraint failed, attempting basic constraint fallback:", fallbackErr);
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsInitializing(false);

        // 2. Initialize MediaPipe Pose Engine if available
        if (window.Pose) {
          const pose = new window.Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
          });

          pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          pose.onResults((results) => {
            if (!active || !canvasRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            const w = canvas.width;
            const h = canvas.height;

            ctx.save();
            ctx.clearRect(0, 0, w, h);

            // Draw video frame mirrored
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(results.image, 0, 0, w, h);
            ctx.restore();

            if (results.poseLandmarks) {
              const landmarks = results.poseLandmarks;
              const [aId, bId, cId] = LANDMARK_MAP[exerciseName] || LANDMARK_MAP.elbow_flexion;

              // Mirrored X coordinates to match display
              const ptA = [(1 - landmarks[aId].x) * w, landmarks[aId].y * h];
              const ptB = [(1 - landmarks[bId].x) * w, landmarks[bId].y * h];
              const ptC = [(1 - landmarks[cId].x) * w, landmarks[cId].y * h];

              // Draw Skeleton Lines
              ctx.beginPath();
              ctx.moveTo(ptA[0], ptA[1]);
              ctx.lineTo(ptB[0], ptB[1]);
              ctx.lineTo(ptC[0], ptC[1]);
              ctx.lineWidth = 5;
              ctx.strokeStyle = "#C9A227";
              ctx.stroke();

              // Draw Joint Points
              [ptA, ptB, ptC].forEach((pt, idx) => {
                ctx.beginPath();
                ctx.arc(pt[0], pt[1], idx === 1 ? 10 : 7, 0, 2 * Math.PI);
                ctx.fillStyle = idx === 1 ? "#4C7A73" : "#B34B3C";
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = "#FFFFFF";
                ctx.stroke();
              });

              // Compute Joint Angle (unmirrored calculation)
              const rawPtA = [landmarks[aId].x * w, landmarks[aId].y * h];
              const rawPtB = [landmarks[bId].x * w, landmarks[bId].y * h];
              const rawPtC = [landmarks[cId].x * w, landmarks[cId].y * h];
              const angle = calculateAngle(rawPtA, rawPtB, rawPtC);

              if (angle !== null) {
                const roundedAngle = Math.round(angle * 10) / 10;
                setMeasuredAngle(roundedAngle);

                const now = Date.now();
                if (now - lastEvalTimeRef.current >= 500) {
                  lastEvalTimeRef.current = now;
                  const evalRes = evaluate(exerciseName, stage, angle);
                  const feedbackText =
                    FEEDBACK_TEMPLATES[exerciseName]?.[evalRes.verdict] ||
                    (evalRes.verdict === 1 ? "Good form." : "Adjust angle.");

                  const newLogEntry = {
                    timestamp: new Date().toISOString(),
                    exercise: exerciseName,
                    stage,
                    feedback: feedbackText,
                    ...evalRes,
                  };

                  setLatestResult(evalRes);
                  setSessionLogs((prev) => [...prev, newLogEntry]);

                  if (evalRes.verdict !== lastSpokenVerdictRef.current) {
                    lastSpokenVerdictRef.current = evalRes.verdict;
                    speakText(feedbackText);
                  }
                }
              }
            }
          });

          poseRef.current = pose;

          // Process Video Frames
          const sendFrameLoop = async () => {
            if (!active) return;
            if (videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
              try {
                await poseRef.current.send({ image: videoRef.current });
              } catch (e) {}
            }
            animFrameRef.current = requestAnimationFrame(sendFrameLoop);
          };
          sendFrameLoop();
        } else {
          // Fallback camera loop without MediaPipe
          const renderLoop = () => {
            if (!active) return;
            if (canvasRef.current && videoRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              const w = canvasRef.current.width;
              const h = canvasRef.current.height;
              ctx.save();
              ctx.translate(w, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(videoRef.current, 0, 0, w, h);
              ctx.restore();
            }
            animFrameRef.current = requestAnimationFrame(renderLoop);
          };
          renderLoop();
        }
      } catch (err) {
        console.error("Webcam Error:", err);
        if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setErrorMsg("Camera is currently being used by another application (such as python demo_runner). Please close the Python window/terminal and try again.");
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMsg("Camera access was blocked by your browser. Please allow camera permissions in Chrome site settings.");
        } else {
          setErrorMsg(`Could not access camera (${err.name || "Error"}). Please verify your camera is plugged in and allowed.`);
        }
        setIsInitializing(false);
      }
    }

    startCameraSession();

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [exerciseName, stage]);

  const handleStopAndSave = async () => {
    if (sessionLogs.length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/sessions/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessions: sessionLogs }),
      });

      if (res.ok) {
        if (onSessionSaved) onSessionSaved();
      }
    } catch (err) {
      console.error("Error saving live session:", err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const exerciseTitle = exerciseName.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const targetRange = latestResult ? latestResult.targetRange : [0, 180];
  const verdict = latestResult ? latestResult.verdict : 1;
  const score = latestResult ? latestResult.score : 100;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0F172A",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        color: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Hidden Video Feed for Stream Capture */}
      <video ref={videoRef} playsInline muted style={{ display: "none" }} />

      {/* Full Screen Top Navigation / Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 28px",
          backgroundColor: "#1E293B",
          borderBottom: "1px solid #334155",
        }}
      >
        <div>
          <h1 className="title-fraunces" style={{ fontSize: "22px", color: "#FFFFFF", marginBottom: "2px" }}>
            PhysioWise AI — Fullscreen Live Evaluation
          </h1>
          <p style={{ fontSize: "13px", color: "#94A3B8" }}>
            Protocol: <strong>{exerciseTitle}</strong> (Stage {stage}) | Clinical Target Range:{" "}
            <span className="mono-num" style={{ color: "#FACC15" }}>
              {targetRange[0]}° - {targetRange[1]}°
            </span>
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={handleStopAndSave}
            disabled={isSaving}
            className="pw-btn"
            style={{
              backgroundColor: "var(--sage-teal)",
              borderColor: "var(--sage-teal)",
              padding: "10px 20px",
              fontSize: "14px",
            }}
          >
            {isSaving ? "Saving Session..." : "Finish & Save Session"}
          </button>
          <button
            onClick={onClose}
            className="pw-btn pw-btn-secondary"
            style={{ padding: "10px 16px", backgroundColor: "#334155", borderColor: "#475569", color: "#FFFFFF" }}
          >
            ✕ Exit
          </button>
        </div>
      </header>

      {/* Main Full Screen Camera Viewport */}
      <div style={{ flex: 1, position: "relative", backgroundColor: "#000000", overflow: "hidden" }}>
        {/* Fullscreen Video Canvas */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />

        {/* Loading Overlay */}
        {isInitializing && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              color: "#FFFFFF",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>Opening Web Camera Feed...</div>
            <div style={{ fontSize: "14px", color: "#94A3B8" }}>Please allow camera permissions if prompted.</div>
          </div>
        )}

        {/* Error Overlay */}
        {errorMsg && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              color: "var(--rust-alert)",
              padding: "20px",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: "480px" }}>
              <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Camera Access Required</h3>
              <p style={{ fontSize: "14px", color: "#E2E8F0", marginBottom: "16px" }}>{errorMsg}</p>
              <button onClick={onClose} className="pw-btn" style={{ backgroundColor: "var(--rust-alert)" }}>
                Close Window
              </button>
            </div>
          </div>
        )}

        {/* Real-time Status Overlay HUD Banner (Top Floating) */}
        {!isInitializing && !errorMsg && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "28px",
              right: "340px",
              padding: "16px 24px",
              backgroundColor: verdict === 1 ? "rgba(76, 122, 115, 0.92)" : "rgba(179, 75, 60, 0.92)",
              color: "#FFFFFF",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div>
              <div style={{ fontWeight: "700", fontSize: "20px", letterSpacing: "0.5px" }}>
                {verdict === 1 ? "✓ CORRECT FORM" : "⚠ ADJUST FORM"}
              </div>
              <div style={{ fontSize: "13px", opacity: 0.9 }}>
                {latestResult?.feedback || "Position yourself in frame to start evaluation"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono-num" style={{ fontSize: "26px", fontWeight: "700" }}>
                {measuredAngle}°
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                Target: {targetRange[0]}° - {targetRange[1]}°
              </div>
            </div>
          </div>
        )}

        {/* Floating Side Panel: Real-time Dynamic Goniometer Gauge (Top-Right Floating) */}
        {!isInitializing && !errorMsg && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "28px",
              width: "300px",
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
            }}
          >
            <GoniometerGauge
              exerciseTitle={exerciseTitle}
              measuredAngle={measuredAngle}
              targetRange={targetRange}
              verdict={verdict}
              score={score}
              stage={stage}
            />

            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #334155", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#94A3B8" }}>Evaluations:</span>
                <span className="mono-num" style={{ color: "#FFFFFF" }}>
                  {sessionLogs.length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#94A3B8" }}>Correct Form:</span>
                <span className="mono-num" style={{ color: "var(--sage-teal)", fontWeight: "600" }}>
                  {sessionLogs.filter((s) => s.verdict === 1).length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94A3B8" }}>Overall Score:</span>
                <span className="mono-num" style={{ color: "#FACC15", fontWeight: "600" }}>
                  {score}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
