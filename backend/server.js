const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/sessions");
const patientRoutes = require("./routes/patients");

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/patients", patientRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/physiowise";

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log("Connected to MongoDB at:", MONGO_URI);
  } catch (err) {
    console.warn("Could not connect to local MongoDB. Launching MongoDB Memory Server fallback...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB Memory Server at:", mongoUri);
    } catch (memErr) {
      console.error("Failed to start MongoDB Memory Server:", memErr);
    }
  }

  app.listen(PORT, () => {
    console.log(`PhysioWise AI Backend running on http://localhost:${PORT}`);
  });
}

startServer();
