const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  exercise: {
    type: String,
    required: true,
  },
  stage: {
    type: Number,
    required: true,
  },
  verdict: {
    type: Number,
    enum: [0, 1],
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  measuredAngle: {
    type: Number,
    required: true,
  },
  targetRange: {
    type: [Number],
    required: true,
  },
  feedback: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Session", SessionSchema);
