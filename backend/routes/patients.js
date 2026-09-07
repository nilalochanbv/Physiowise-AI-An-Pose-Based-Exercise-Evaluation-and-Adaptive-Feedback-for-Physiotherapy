const express = require("express");
const User = require("../models/User");
const Session = require("../models/Session");
const { auth, doctorOnly } = require("../middleware/auth");

const router = express.Router();

// GET /api/patients — doctor-only, list all patient-role users with calculated stats
router.get("/", auth, doctorOnly, async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password").sort({ createdAt: -1 });

    const patientStats = await Promise.all(
      patients.map(async (patient) => {
        const sessions = await Session.find({ patientId: patient._id }).sort({ timestamp: -1 });

        const totalSessions = sessions.length;
        const correctCount = sessions.filter((s) => s.verdict === 1).length;
        const accuracyPct = totalSessions > 0 ? (correctCount / totalSessions) * 100 : 0;
        const totalScore = sessions.reduce((acc, s) => acc + (s.score || 0), 0);
        const avgScore = totalSessions > 0 ? totalScore / totalSessions : 0;
        const lastSessionDate = totalSessions > 0 ? sessions[0].timestamp : null;

        return {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          createdAt: patient.createdAt,
          totalSessions,
          accuracyPct: Number(accuracyPct.toFixed(1)),
          avgScore: Number(avgScore.toFixed(1)),
          lastSessionDate,
        };
      })
    );

    return res.json(patientStats);
  } catch (err) {
    console.error("Get Patients Error:", err);
    return res.status(500).json({ message: "Server error fetching patients list" });
  }
});

module.exports = router;
