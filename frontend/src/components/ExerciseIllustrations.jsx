import React from "react";

// SVG Illustration component for each exercise with skeleton pose landmarks overlay

export function KneeExtensionSvg() {
  return (
    <svg viewBox="0 0 200 160" width="100%" height="140" style={{ display: "block" }}>
      {/* Background tint */}
      <rect width="200" height="160" rx="12" fill="#F8FAFC" />
      {/* Chair / Bench */}
      <rect x="35" y="95" width="60" height="8" rx="2" fill="#475569" />
      <rect x="42" y="103" width="6" height="40" rx="2" fill="#64748B" />
      <rect x="85" y="103" width="6" height="40" rx="2" fill="#64748B" />
      <path d="M 35 95 L 35 45" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
      
      {/* Human Torso */}
      <path d="M 52 50 L 58 92" stroke="#334155" strokeWidth="14" strokeLinecap="round" />
      {/* Head */}
      <circle cx="50" cy="36" r="11" fill="#334155" />
      {/* Arms resting */}
      <path d="M 52 58 L 68 85" stroke="#475569" strokeWidth="7" strokeLinecap="round" />

      {/* Thigh (horizontal) */}
      <path d="M 58 92 L 105 92" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
      {/* Shin (Extended out) */}
      <path d="M 105 92 L 155 78" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      {/* Foot */}
      <path d="M 155 78 L 165 74" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

      {/* Skeleton Joint Overlay (Green MediaPipe style) */}
      <path d="M 58 92 L 105 92 L 155 78" stroke="#10B981" strokeWidth="3" strokeDasharray="4 2" fill="none" />
      <circle cx="58" cy="92" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="105" cy="92" r="7" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="155" cy="78" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />

      {/* Extension Arc & Arrow */}
      <path d="M 115 105 A 25 25 0 0 0 142 85" stroke="#10B981" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
    </svg>
  );
}

export function KneeFlexionSvg() {
  return (
    <svg viewBox="0 0 200 160" width="100%" height="140" style={{ display: "block" }}>
      <rect width="200" height="160" rx="12" fill="#F8FAFC" />
      {/* Stand stool */}
      <rect x="25" y="85" width="20" height="55" rx="3" fill="#475569" />
      <rect x="20" y="80" width="30" height="7" rx="2" fill="#334155" />

      {/* Human Torso */}
      <path d="M 80 50 L 82 92" stroke="#334155" strokeWidth="14" strokeLinecap="round" />
      {/* Head */}
      <circle cx="80" cy="36" r="11" fill="#334155" />

      {/* Thigh (sitting) */}
      <path d="M 82 92 L 128 92" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
      {/* Shin (Flexed down/back) */}
      <path d="M 128 92 L 140 135" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      {/* Foot */}
      <path d="M 140 135 L 152 140" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

      {/* Skeleton Overlay */}
      <path d="M 82 92 L 128 92 L 140 135" stroke="#10B981" strokeWidth="3" strokeDasharray="4 2" fill="none" />
      <circle cx="82" cy="92" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="128" cy="92" r="7" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="140" cy="135" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

export function SquatSvg() {
  return (
    <svg viewBox="0 0 200 160" width="100%" height="140" style={{ display: "block" }}>
      <rect width="200" height="160" rx="12" fill="#F8FAFC" />

      {/* Head */}
      <circle cx="85" cy="45" r="11" fill="#334155" />
      {/* Torso tilted in squat */}
      <path d="M 85 55 L 75 90" stroke="#334155" strokeWidth="14" strokeLinecap="round" />
      {/* Arms extended out */}
      <path d="M 85 62 L 135 62" stroke="#475569" strokeWidth="7" strokeLinecap="round" />

      {/* Thigh (angled back/down) */}
      <path d="M 75 90 L 115 105" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
      {/* Shin (angled down to foot) */}
      <path d="M 115 105 L 95 138" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      {/* Foot */}
      <path d="M 95 138 L 115 138" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

      {/* Skeleton Overlay */}
      <path d="M 75 90 L 115 105 L 95 138" stroke="#10B981" strokeWidth="3" strokeDasharray="4 2" fill="none" />
      <circle cx="75" cy="90" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="115" cy="105" r="7" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="95" cy="138" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

export function ShoulderRaiseSvg() {
  return (
    <svg viewBox="0 0 200 160" width="100%" height="140" style={{ display: "block" }}>
      <rect width="200" height="160" rx="12" fill="#F8FAFC" />

      {/* Head */}
      <circle cx="100" cy="36" r="11" fill="#334155" />
      {/* Standing Torso */}
      <path d="M 100 48 L 100 95" stroke="#334155" strokeWidth="14" strokeLinecap="round" />

      {/* Left Raised Arm */}
      <path d="M 100 55 L 68 32 L 62 18" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
      {/* Right Raised Arm */}
      <path d="M 100 55 L 132 32 L 138 18" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
      {/* Dumbbells */}
      <rect x="54" y="12" width="16" height="8" rx="2" fill="#1E293B" />
      <rect x="130" y="12" width="16" height="8" rx="2" fill="#1E293B" />

      {/* Legs */}
      <path d="M 100 95 L 90 142" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      <path d="M 100 95 L 110 142" stroke="#334155" strokeWidth="10" strokeLinecap="round" />

      {/* Skeleton Overlay for Shoulder Joint */}
      <path d="M 100 95 L 100 55 L 132 32" stroke="#10B981" strokeWidth="3" strokeDasharray="4 2" fill="none" />
      <circle cx="100" cy="95" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="100" cy="55" r="7" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="132" cy="32" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

export function ElbowFlexionSvg() {
  return (
    <svg viewBox="0 0 200 160" width="100%" height="140" style={{ display: "block" }}>
      <rect width="200" height="160" rx="12" fill="#F8FAFC" />

      {/* Head */}
      <circle cx="85" cy="36" r="11" fill="#334155" />
      {/* Torso */}
      <path d="M 85 48 L 85 98" stroke="#334155" strokeWidth="14" strokeLinecap="round" />

      {/* Upper Arm (vertical) */}
      <path d="M 85 55 L 85 82" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
      {/* Forearm (curled up) */}
      <path d="M 85 82 L 112 62" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
      {/* Hand holding weight */}
      <circle cx="115" cy="58" r="7" fill="#10B981" />

      {/* Legs */}
      <path d="M 85 98 L 78 142" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      <path d="M 85 98 L 92 142" stroke="#334155" strokeWidth="10" strokeLinecap="round" />

      {/* Skeleton Overlay */}
      <path d="M 85 55 L 85 82 L 112 62" stroke="#10B981" strokeWidth="3" strokeDasharray="4 2" fill="none" />
      <circle cx="85" cy="55" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="85" cy="82" r="7" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="112" cy="62" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

export function HipAbductionSvg() {
  return (
    <svg viewBox="0 0 200 160" width="100%" height="140" style={{ display: "block" }}>
      <rect width="200" height="160" rx="12" fill="#F8FAFC" />

      {/* Head */}
      <circle cx="95" cy="36" r="11" fill="#334155" />
      {/* Torso */}
      <path d="M 95 48 L 95 95" stroke="#334155" strokeWidth="14" strokeLinecap="round" />

      {/* Standing Leg */}
      <path d="M 95 95 L 95 142" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      {/* Abducted Leg (lifted out) */}
      <path d="M 95 95 L 140 120" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      {/* Foot */}
      <path d="M 140 120 L 148 128" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

      {/* Skeleton Overlay */}
      <path d="M 95 50 L 95 95 L 140 120" stroke="#10B981" strokeWidth="3" strokeDasharray="4 2" fill="none" />
      <circle cx="95" cy="50" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="95" cy="95" r="7" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="140" cy="120" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}
