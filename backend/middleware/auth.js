const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization token provided" });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(401).json({ message: "Invalid authorization header format" });
  }

  try {
    const secret = process.env.JWT_SECRET || "physiowise_super_secret_key_2026";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};

const doctorOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "doctor") {
    return res.status(403).json({ message: "Access denied. Doctor role required." });
  }
  next();
};

module.exports = { auth, doctorOnly };
