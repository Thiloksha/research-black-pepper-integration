import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import json
import sys
import warnings
import traceback

import numpy as np  # type: ignore
import tensorflow as tf  # type: ignore
from PIL import Image  # type: ignore

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

DISEASE_MODEL_PATH = os.path.join(MODEL_DIR, "effnet_disease.keras")
LEAF_DETECTOR_PATH = os.path.join(MODEL_DIR, "leaf_detector.keras")

IMG_SIZE = (224, 224)
MODEL_NAME = "EfficientNetB0"

# Based on your detector training notebook:
# score close to 1.0 = pepper leaf
PEPPER_IDX = 1
LEAF_THRESHOLD = 0.5

# Must match disease training order exactly
CLASS_NAMES = ["healthy", "leaf_blight", "slow_wilt"]

DISPLAY_NAMES = {
    "healthy": "Healthy",
    "leaf_blight": "Leaf Blight",
    "slow_wilt": "Slow Wilt"
}

DISEASE_INFO = {
    "healthy": {
        "description": "No disease detected. The leaf appears healthy.",
        "advice": "Maintain regular watering, balanced fertilization, and monitor plants regularly."
    },
    "leaf_blight": {
        "description": "Leaf Blight detected.",
        "advice": "Remove infected leaves, improve air circulation, avoid prolonged leaf wetness, and follow local guidance for copper-based fungicide use."
    },
    "slow_wilt": {
        "description": "Slow Wilt detected.",
        "advice": "Improve soil drainage, avoid waterlogging, prune affected parts, and follow local agricultural guidance for treatment."
    },
}

disease_model = None
leaf_detector = None


def load_models():
    global disease_model, leaf_detector

    if not os.path.exists(DISEASE_MODEL_PATH):
        raise FileNotFoundError(f"Disease model not found: {DISEASE_MODEL_PATH}")

    if not os.path.exists(LEAF_DETECTOR_PATH):
        raise FileNotFoundError(f"Leaf detector model not found: {LEAF_DETECTOR_PATH}")

    disease_model = tf.keras.models.load_model(DISEASE_MODEL_PATH)
    leaf_detector = tf.keras.models.load_model(LEAF_DETECTOR_PATH)


def load_image(image_path: str) -> np.ndarray:
    with Image.open(image_path) as img:
        img = img.convert("RGB").resize(IMG_SIZE)
        img_array = np.array(img, dtype="float32")
        img_array = np.expand_dims(img_array, axis=0)
        return img_array


def predict_image(image_path: str) -> dict:
    if disease_model is None or leaf_detector is None:
        raise RuntimeError("Models are not loaded.")

    img_array = load_image(image_path)

    # Detector model already contains preprocess_input inside the model
    raw_score = float(leaf_detector.predict(img_array, verbose=0)[0][0])

    # PEPPER_IDX = 1 means score itself is pepper probability
    pepper_score = raw_score if PEPPER_IDX == 1 else (1.0 - raw_score)

    if pepper_score < LEAF_THRESHOLD:
        return {
            "rejected": True,
            "reject_reason": f"Not a black pepper leaf (score: {pepper_score * 100:.1f}%).",
            "prediction": None,
            "confidence": round(pepper_score * 100, 2),
            "raw_detector_score": round(raw_score * 100, 2),
            "threshold": round(LEAF_THRESHOLD * 100, 2),
            "all_probabilities": {},
            "model_name": "leaf_detector",
            "description": None,
            "advice": None
        }

    # Disease model also already contains preprocess_input inside the model
    preds = disease_model.predict(img_array, verbose=0)[0]

    pred_idx = int(np.argmax(preds))
    pred_label = CLASS_NAMES[pred_idx]
    conf_pct = float(preds[pred_idx]) * 100

    all_probs = {
        DISPLAY_NAMES.get(CLASS_NAMES[i], CLASS_NAMES[i]): round(float(preds[i]) * 100, 2)
        for i in range(len(CLASS_NAMES))
    }

    info = DISEASE_INFO.get(pred_label, {
        "description": "Unknown prediction.",
        "advice": "Consult an agricultural expert."
    })

    return {
        "rejected": False,
        "reject_reason": None,
        "prediction": DISPLAY_NAMES.get(pred_label, pred_label),
        "confidence": round(conf_pct, 2),
        "raw_detector_score": round(raw_score * 100, 2),
        "pepper_score": round(pepper_score * 100, 2),
        "all_probabilities": all_probs,
        "model_name": MODEL_NAME,
        "description": info["description"],
        "advice": info["advice"]
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)

    try:
        load_models()
        result = predict_image(image_path)
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({
            "error": f"Prediction failed: {str(e)}",
            "trace": traceback.format_exc()
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()