"""
PhysioWise AI - Live Demo Runner
-----------------------------------------------------------------
Combines MediaPipe Pose tracking, joint angle calculation, the rule-based
evaluation engine, offline TTS feedback, and a live FPS counter.

Supports MediaPipe Tasks (Python 3.13+) and legacy MediaPipe Solutions.

HOW TO RUN:
    python demo_runner.py elbow_flexion 3
    python demo_runner.py knee_extension 3

Controls: press 'q' to quit and save the session log.
"""

import sys
import json
import time
import os
import threading
from datetime import datetime

import cv2
import mediapipe as mp
import numpy as np
import pyttsx3

from rule_engine import evaluate

# Landmark ID definitions (ISO standard indices)
RIGHT_SHOULDER = 12
RIGHT_ELBOW = 14
RIGHT_WRIST = 16
RIGHT_HIP = 24
RIGHT_KNEE = 26
RIGHT_ANKLE = 28

EXERCISE_LANDMARKS = {
    "elbow_flexion": (RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST),
    "knee_extension": (RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE),
    "knee_flexion": (RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE),
    "squat": (RIGHT_HIP, RIGHT_KNEE, RIGHT_ANKLE),
    "shoulder_raise": (RIGHT_HIP, RIGHT_SHOULDER, RIGHT_ELBOW),
    "hip_abduction": (RIGHT_SHOULDER, RIGHT_HIP, RIGHT_KNEE),
}

FEEDBACK_TEMPLATES = {
    "elbow_flexion": {
        1: "Good, your elbow flexion is within the target range.",
        0: "Adjust your elbow angle to bring it closer to the target range.",
    },
    "knee_extension": {
        1: "Nice work, your knee extension looks correct.",
        0: "Try to straighten your knee more to reach the target angle.",
    },
    "knee_flexion": {
        1: "Great knee flexion depth achieved.",
        0: "Flex your knee back further to hit target angle.",
    },
    "squat": {
        1: "Excellent squat posture and depth!",
        0: "Lower your hips deeper into a full squat position.",
    },
    "shoulder_raise": {
        1: "Arms raised correctly to target elevation.",
        0: "Raise your arms higher to reach full range.",
    },
    "hip_abduction": {
        1: "Good hip abduction angle and leg position.",
        0: "Lift your leg further outward to target hip muscles.",
    },
}

_tts_engine = pyttsx3.init()
_tts_engine.setProperty("rate", 165)


def generate_feedback(exercise_name, verdict):
    return FEEDBACK_TEMPLATES.get(exercise_name, {}).get(
        verdict, "Keep going." if verdict == 1 else "Adjust your form."
    )


def speak_async(text):
    def _run():
        try:
            _tts_engine.say(text)
            _tts_engine.runAndWait()
        except Exception:
            pass
    threading.Thread(target=_run, daemon=True).start()


def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)
    if norm_ba == 0 or norm_bc == 0:
        return None
    cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    return np.degrees(np.arccos(cosine_angle))


def main():
    if len(sys.argv) != 3:
        print("Usage: python demo_runner.py <exercise_name> <stage>")
        return

    exercise_name = sys.argv[1]
    stage = int(sys.argv[2])

    if exercise_name not in EXERCISE_LANDMARKS:
        print(f"Unknown exercise '{exercise_name}'. Choose from: {list(EXERCISE_LANDMARKS.keys())}")
        return

    a_id, b_id, c_id = EXERCISE_LANDMARKS[exercise_name]

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Could not open webcam.")
        return

    # Check which MediaPipe API to use (Tasks vs Solutions)
    use_tasks_api = not hasattr(mp, 'solutions') or not hasattr(mp.solutions, 'pose')

    pose_detector = None
    if use_tasks_api:
        from mediapipe.tasks.python import vision
        from mediapipe.tasks.python.core.base_options import BaseOptions

        task_path = os.path.join(os.path.dirname(__file__), "pose_landmarker_lite.task")
        if not os.path.exists(task_path):
            print("Downloading MediaPipe Pose model...")
            import urllib.request
            model_url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
            urllib.request.urlretrieve(model_url, task_path)

        base_options = BaseOptions(model_asset_path=task_path)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
        )
        pose_detector = vision.PoseLandmarker.create_from_options(options)
    else:
        mp_pose = mp.solutions.pose
        mp_drawing = mp.solutions.drawing_utils
        mp_drawing_styles = mp.solutions.drawing_styles
        pose_detector = mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            model_complexity=1,
        )

    session_log = []
    last_eval_time = 0
    last_spoken_verdict = None
    EVAL_INTERVAL = 0.5

    fps_frame_count = 0
    fps_start_time = time.time()
    current_fps = 0

    print(f"PhysioWise AI Live Demo running: {exercise_name}, stage {stage}. Press 'q' to quit.\n")

    try:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                continue

            h, w, _ = frame.shape

            fps_frame_count += 1
            elapsed = time.time() - fps_start_time
            if elapsed >= 1.0:
                current_fps = fps_frame_count / elapsed
                fps_frame_count = 0
                fps_start_time = time.time()

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_bgr = frame.copy()

            landmarks_list = None

            if use_tasks_api:
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
                detection_result = pose_detector.detect(mp_image)
                if detection_result.pose_landmarks and len(detection_result.pose_landmarks) > 0:
                    landmarks_list = detection_result.pose_landmarks[0]
            else:
                results = pose_detector.process(frame_rgb)
                if results.pose_landmarks:
                    landmarks_list = results.pose_landmarks.landmark
                    mp_drawing.draw_landmarks(
                        frame_bgr, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                        landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style(),
                    )

            if landmarks_list and len(landmarks_list) > max(a_id, b_id, c_id):
                pt_a = [landmarks_list[a_id].x * w, landmarks_list[a_id].y * h]
                pt_b = [landmarks_list[b_id].x * w, landmarks_list[b_id].y * h]
                pt_c = [landmarks_list[c_id].x * w, landmarks_list[c_id].y * h]

                # Draw joint points and lines
                cv2.line(frame_bgr, (int(pt_a[0]), int(pt_a[1])), (int(pt_b[0]), int(pt_b[1])), (255, 255, 0), 3)
                cv2.line(frame_bgr, (int(pt_b[0]), int(pt_b[1])), (int(pt_c[0]), int(pt_c[1])), (255, 255, 0), 3)
                cv2.circle(frame_bgr, (int(pt_a[0]), int(pt_a[1])), 8, (0, 0, 255), -1)
                cv2.circle(frame_bgr, (int(pt_b[0]), int(pt_b[1])), 8, (0, 255, 0), -1)
                cv2.circle(frame_bgr, (int(pt_c[0]), int(pt_c[1])), 8, (0, 0, 255), -1)

                angle = calculate_angle(pt_a, pt_b, pt_c)

                if angle is not None:
                    now = time.time()
                    if now - last_eval_time >= EVAL_INTERVAL:
                        last_eval_time = now
                        result = evaluate(exercise_name, stage, angle)
                        feedback_text = generate_feedback(exercise_name, result["verdict"])
                        session_log.append({
                            "timestamp": datetime.now().isoformat(),
                            "exercise": exercise_name,
                            "stage": stage,
                            "feedback": feedback_text,
                            **result,
                        })

                        if result["verdict"] != last_spoken_verdict:
                            last_spoken_verdict = result["verdict"]
                            speak_async(feedback_text)

                    if session_log:
                        r = session_log[-1]
                        is_correct = r["verdict"] == 1
                        color = (0, 200, 0) if is_correct else (0, 0, 255)
                        label = "CORRECT" if is_correct else "INCORRECT - ADJUST FORM"

                        cv2.rectangle(frame_bgr, (0, 0), (w, 80), color, -1)
                        cv2.putText(frame_bgr, label, (20, 55),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3)
                        cv2.putText(
                            frame_bgr,
                            f"Angle: {r['measured_angle']} deg | Target: {r['target_range'][0]}-{r['target_range'][1]} deg | Score: {r['score']}%",
                            (20, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2,
                        )

            fps_text = f"FPS: {current_fps:.1f}"
            (text_w, _), _ = cv2.getTextSize(fps_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.putText(frame_bgr, fps_text, (w - text_w - 15, h - 45),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

            cv2.imshow("PhysioWise AI - Live Demo (press q to quit)", frame_bgr)

            if cv2.waitKey(5) & 0xFF == ord("q"):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()
        if not use_tasks_api and pose_detector:
            pose_detector.close()

    log_path = os.path.join(os.path.dirname(__file__), "demo_session_log.json")
    with open(log_path, "w") as f:
        json.dump(session_log, f, indent=2)

    correct_count = sum(1 for e in session_log if e["verdict"] == 1)
    total = len(session_log)
    pct = (correct_count / total * 100) if total else 0
    print(f"\nSession saved to {log_path}: {total} evaluations, {correct_count} correct ({pct:.1f}%)")


if __name__ == "__main__":
    main()
