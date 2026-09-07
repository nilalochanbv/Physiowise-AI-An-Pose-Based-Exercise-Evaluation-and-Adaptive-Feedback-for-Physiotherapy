const fs = require("fs");
const path = require("path");
const http = require("http");

async function main() {
  const args = process.argv.slice(2);
  let patientTarget = args[0];
  let jsonPath = args[1];

  if (!patientTarget) {
    console.log("Usage: node import_log.js <patientId_or_email> [json_file_path]");
    console.log("Example: node import_log.js 60d5ec49f1b2c80015f8e123");
    console.log("Example: node import_log.js patient@example.com ../vision-engine/demo_session_log.json");
    process.exit(1);
  }

  if (!jsonPath) {
    const candidatePaths = [
      path.join(__dirname, "demo_session_log.json"),
      path.join(__dirname, "..", "vision-engine", "demo_session_log.json"),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        jsonPath = p;
        break;
      }
    }
  }

  if (!jsonPath || !fs.existsSync(jsonPath)) {
    console.error(`Error: Could not find demo_session_log.json at path: ${jsonPath || "default paths"}`);
    process.exit(1);
  }

  console.log(`Reading session log from: ${jsonPath}`);
  const rawData = fs.readFileSync(jsonPath, "utf8");
  const sessions = JSON.parse(rawData);

  console.log(`Loaded ${sessions.length} sessions from JSON log.`);

  const API_BASE = process.env.API_URL || "http://localhost:5000";

  // Login or Register a temp import agent or user to acquire token if patientId is Mongo ID or email
  let token = "";
  let patientId = patientTarget;

  // Attempt login/register to get auth token
  const authRes = await makeRequest(`${API_BASE}/api/auth/register`, "POST", {
    name: "Log Importer",
    email: `importer_${Date.now()}@physiowise.ai`,
    password: "Password123!",
    role: "doctor",
  });

  if (authRes.status === 201 || authRes.status === 200) {
    token = authRes.body.token;
  } else {
    // Try login as default doctor
    const loginRes = await makeRequest(`${API_BASE}/api/auth/login`, "POST", {
      email: `importer_${Date.now()}@physiowise.ai`,
      password: "Password123!",
    });
    if (loginRes.body && loginRes.body.token) {
      token = loginRes.body.token;
    }
  }

  // If patientTarget looks like an email, lookup or register patient to get patientId
  if (patientTarget.includes("@")) {
    const pReg = await makeRequest(`${API_BASE}/api/auth/register`, "POST", {
      name: "Imported Patient",
      email: patientTarget,
      password: "PatientPassword123!",
      role: "patient",
    });

    if (pReg.body && pReg.body.user) {
      patientId = pReg.body.user.id;
    } else {
      // Try login
      const pLog = await makeRequest(`${API_BASE}/api/auth/login`, "POST", {
        email: patientTarget,
        password: "PatientPassword123!",
      });
      if (pLog.body && pLog.body.user) {
        patientId = pLog.body.user.id;
      }
    }
  }

  console.log(`Importing logs for Patient ID: ${patientId}...`);

  const bulkRes = await makeRequest(
    `${API_BASE}/api/sessions/bulk`,
    "POST",
    {
      patientId,
      sessions,
    },
    token
  );

  if (bulkRes.status === 201 || bulkRes.status === 200) {
    console.log("Import Successful!");
    console.log(bulkRes.body);
  } else {
    console.error(`Import Failed with status ${bulkRes.status}:`, bulkRes.body);
  }
}

function makeRequest(urlStr, method, data, token = "") {
  return new Promise((resolve) => {
    const u = new URL(urlStr);
    const postData = JSON.stringify(data || {});

    const options = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on("error", (err) => {
      resolve({ status: 500, body: { error: err.message } });
    });

    req.write(postData);
    req.end();
  });
}

main().catch(console.error);
