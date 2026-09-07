const express = require("express");
const Session = require("../models/Session");
const User = require("../models/User");
const { auth, doctorOnly } = require("../middleware/auth");

const router = express.Router();

// POST /api/sessions — save single evaluation
router.post("/", auth, async (req, res) => {
  try {
    const { exercise, stage, verdict, score, measuredAngle, target_range, targetRange, feedback, timestamp, patientId } = req.body;

    const targetPatientId = patientId || req.user.id;
    const targetArray = targetRange || target_range;

    if (!exercise || stage === undefined || verdict === undefined || score === undefined || measuredAngle === undefined || !targetArray) {
      return res.status(400).json({ message: "Missing required session fields" });
    }

    const session = new Session({
      patientId: targetPatientId,
      exercise,
      stage,
      verdict,
      score,
      measuredAngle,
      targetRange: targetArray,
      feedback: feedback || "",
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    await session.save();
    return res.status(201).json(session);
  } catch (err) {
    console.error("Create Session Error:", err);
    return res.status(500).json({ message: "Server error saving session" });
  }
});

// POST /api/sessions/bulk — import array of evaluations
router.post("/bulk", auth, async (req, res) => {
  try {
    const { patientId, sessions } = req.body;
    const targetPatientId = patientId || req.user.id;

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return res.status(400).json({ message: "sessions array is required and must not be empty" });
    }

    const patientExists = await User.findById(targetPatientId);
    if (!patientExists) {
      return res.status(404).json({ message: `Patient with ID ${targetPatientId} not found` });
    }

    const docsToInsert = sessions.map((s) => ({
      patientId: targetPatientId,
      exercise: s.exercise,
      stage: s.stage,
      verdict: s.verdict,
      score: s.score,
      measuredAngle: s.measuredAngle !== undefined ? s.measuredAngle : s.measured_angle,
      targetRange: s.targetRange || s.target_range,
      feedback: s.feedback || "",
      timestamp: s.timestamp ? new Date(s.timestamp) : new Date(),
    }));

    const savedSessions = await Session.insertMany(docsToInsert);
    return res.status(201).json({
      message: `Successfully imported ${savedSessions.length} session records`,
      count: savedSessions.length,
      patientId: targetPatientId,
    });
  } catch (err) {
    console.error("Bulk Import Error:", err);
    return res.status(500).json({ message: "Server error during bulk import" });
  }
});

// GET /api/sessions/mine — logged-in patient's own sessions
router.get("/mine", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ patientId: req.user.id }).sort({ timestamp: -1 });
    return res.json(sessions);
  } catch (err) {
    console.error("Get Mine Sessions Error:", err);
    return res.status(500).json({ message: "Server error fetching sessions" });
  }
});

// GET /api/sessions/patient/:patientId — doctor-only
router.get("/patient/:patientId", auth, doctorOnly, async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await User.findById(patientId).select("-password");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const sessions = await Session.find({ patientId }).sort({ timestamp: -1 });
    return res.json({
      patient,
      sessions,
    });
  } catch (err) {
    console.error("Get Patient Sessions Error:", err);
    return res.status(500).json({ message: "Server error fetching patient sessions" });
  }
});

module.exports = router;
