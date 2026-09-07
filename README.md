# PhysioWise AI — AI-Powered Physiotherapy Rehabilitation Monitoring

PhysioWise AI is a deterministic rehabilitation evaluation and monitoring application. The evaluation engine computes joint angles from computer vision pose estimation and evaluates them strictly against clinically defined protocol ranges.

## Repository Structure

```
physiowise-ai/
├── vision-engine/     # Python MediaPipe pose tracking & TTS feedback engine
├── backend/           # Node.js / Express / MongoDB REST API & Auth
├── frontend/          # React / Vite SPA with custom SVG Goniometer Arc Gauges
└── README.md
```

## Quick Start

### 1. Vision Engine (Python)

```bash
cd vision-engine
pip install -r requirements.txt

# Run live vision camera evaluation (press 'q' to quit & save demo_session_log.json)
python demo_runner.py elbow_flexion 3
python demo_runner.py knee_extension 3
```

### 2. Backend API (Node / Express)

```bash
cd backend
npm install

# Start backend server on http://localhost:5000
npm start
```

### 3. Frontend App (React / Vite)

```bash
cd frontend
npm install

# Start frontend dev server on http://localhost:3000
npm run dev
```

### 4. Importing Live Camera Session Logs

To import session evaluation logs saved from `demo_runner.py` into the backend:

```bash
cd backend
node import_log.js <patient_email_or_id> ../vision-engine/demo_session_log.json
```

## Core Architecture Principles

1. **Rule-Based Engine Primacy**: The deterministic evaluation engine (`rule_engine.py`) determines exercise correctness — NEVER an LLM/AI model.
2. **Signature Goniometer Arc Gauge**: Visualized using SVG semicircular dials showing exact measured joint angles, target range bands, and verdict color coding (`#4C7A73` for correct, `#B34B3C` for incorrect).
