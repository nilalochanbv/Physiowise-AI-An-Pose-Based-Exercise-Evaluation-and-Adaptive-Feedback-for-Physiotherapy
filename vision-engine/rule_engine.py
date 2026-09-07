import json
import os

PROTOCOL_PATH = os.path.join(os.path.dirname(__file__), "protocol_library.json")

with open(PROTOCOL_PATH, "r") as f:
    PROTOCOL_LIBRARY = json.load(f)


def evaluate(exercise_name, stage, measured_angle):
    if exercise_name not in PROTOCOL_LIBRARY:
        raise ValueError(f"Unknown exercise: {exercise_name}")

    stage_key = f"stage_{stage}"
    if stage_key not in PROTOCOL_LIBRARY[exercise_name]:
        raise ValueError(f"Unknown stage '{stage}' for exercise '{exercise_name}'")

    target = PROTOCOL_LIBRARY[exercise_name][stage_key]
    theta_min = target["min"]
    theta_max = target["max"]

    verdict = 1 if theta_min <= measured_angle <= theta_max else 0

    theta_r = (theta_min + theta_max) / 2
    theta_m = measured_angle
    score = 100 - (abs(theta_r - theta_m) / theta_r * 100)
    score = max(0, min(100, score))

    return {
        "verdict": verdict,
        "score": round(score, 1),
        "target_range": [theta_min, theta_max],
        "measured_angle": round(measured_angle, 1),
    }


if __name__ == "__main__":
    print(evaluate("elbow_flexion", 3, 120))
    print(evaluate("elbow_flexion", 3, 90))
    print(evaluate("knee_extension", 3, 175))
