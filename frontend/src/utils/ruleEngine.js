export const PROTOCOL_LIBRARY = {
  elbow_flexion: {
    stage_1: { min: 30, max: 60 },
    stage_2: { min: 61, max: 100 },
    stage_3: { min: 101, max: 145 },
  },
  knee_extension: {
    stage_1: { min: 150, max: 160 },
    stage_2: { min: 161, max: 170 },
    stage_3: { min: 171, max: 180 },
  },
  knee_flexion: {
    stage_1: { min: 90, max: 120 },
    stage_2: { min: 60, max: 89 },
    stage_3: { min: 35, max: 59 },
  },
  squat: {
    stage_1: { min: 140, max: 170 },
    stage_2: { min: 111, max: 139 },
    stage_3: { min: 80, max: 110 },
  },
  shoulder_raise: {
    stage_1: { min: 60, max: 95 },
    stage_2: { min: 96, max: 139 },
    stage_3: { min: 140, max: 180 },
  },
  hip_abduction: {
    stage_1: { min: 160, max: 175 },
    stage_2: { min: 145, max: 159 },
    stage_3: { min: 125, max: 144 },
  },
};

export function evaluate(exerciseName, stage, measuredAngle) {
  const exercise = PROTOCOL_LIBRARY[exerciseName];
  if (!exercise) {
    throw new Error(`Unknown exercise: ${exerciseName}`);
  }

  const stageKey = `stage_${stage}`;
  const target = exercise[stageKey];
  if (!target) {
    throw new Error(`Unknown stage '${stage}' for exercise '${exerciseName}'`);
  }

  const thetaMin = target.min;
  const thetaMax = target.max;

  const verdict = measuredAngle >= thetaMin && measuredAngle <= thetaMax ? 1 : 0;

  const thetaR = (thetaMin + thetaMax) / 2;
  const thetaM = measuredAngle;
  let score = 100 - (Math.abs(thetaR - thetaM) / thetaR) * 100;
  score = Math.max(0, Math.min(100, score));

  return {
    verdict,
    score: Math.round(score * 10) / 10,
    targetRange: [thetaMin, thetaMax],
    measuredAngle: Math.round(measuredAngle * 10) / 10,
  };
}

export function calculateAngle(a, b, c) {
  if (!a || !b || !c) return null;
  const ba = [a[0] - b[0], a[1] - b[1]];
  const bc = [c[0] - b[0], c[1] - b[1]];

  const normBa = Math.hypot(ba[0], ba[1]);
  const normBc = Math.hypot(bc[0], bc[1]);

  if (normBa === 0 || normBc === 0) return null;

  let dot = (ba[0] * bc[0] + ba[1] * bc[1]) / (normBa * normBc);
  dot = Math.max(-1.0, Math.min(1.0, dot));
  const rad = Math.acos(dot);
  return (rad * 180) / Math.PI;
}
