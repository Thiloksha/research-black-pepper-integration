import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import json
import sys
import warnings
import traceback

import numpy as np
import tensorflow as tf
from PIL import Image

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

DISEASE_MODEL_PATH = os.path.join(MODEL_DIR, "effnet_disease.keras")
LEAF_DETECTOR_PATH = os.path.join(MODEL_DIR, "leaf_detector_new.keras")

IMG_SIZE = (224, 224)
MODEL_NAME = "EfficientNetB0"

# Thresholds
LEAF_THRESHOLD = 0.75
DISEASE_THRESHOLD = 55.0
LOW_CONFIDENCE_THRESHOLD = 40.0

# Your new 3-class leaf model order from Colab:
# ['betel leaves', 'non pepper', 'pepper']
LEAF_CLASS_NAMES = [
    "betel leaves",
    "non pepper",
    "pepper"
]

BLACK_PEPPER_CLASS = "pepper"

# Disease model classes
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


def build_leaf_probabilities(preds: np.ndarray) -> dict:
    return {
        LEAF_CLASS_NAMES[i]: round(float(preds[i]) * 100, 2)
        for i in range(len(LEAF_CLASS_NAMES))
    }


def build_disease_probabilities(preds: np.ndarray) -> dict:
    return {
        DISPLAY_NAMES.get(CLASS_NAMES[i], CLASS_NAMES[i]): round(float(preds[i]) * 100, 2)
        for i in range(len(CLASS_NAMES))
    }


def predict_image(image_path: str) -> dict:
    if disease_model is None or leaf_detector is None:
        raise RuntimeError("Models are not loaded.")

    img_array = load_image(image_path)

    # =========================
    # STAGE 1: Leaf verification
    # betel leaves / non pepper / pepper
    # =========================
    leaf_preds = leaf_detector.predict(img_array, verbose=0)[0]

    leaf_pred_idx = int(np.argmax(leaf_preds))
    leaf_prediction = LEAF_CLASS_NAMES[leaf_pred_idx]
    leaf_confidence = float(leaf_preds[leaf_pred_idx]) * 100

    pepper_idx = LEAF_CLASS_NAMES.index(BLACK_PEPPER_CLASS)
    pepper_score = float(leaf_preds[pepper_idx]) * 100

    leaf_probabilities = build_leaf_probabilities(leaf_preds)

    print(json.dumps({
        "DEBUG_STAGE_1": True,
        "leaf_preds_raw": leaf_preds.tolist(),
        "class_order": LEAF_CLASS_NAMES,
        "leaf_prediction": leaf_prediction,
        "pepper_score": round(pepper_score, 2)
    }), file=sys.stderr)

    if leaf_prediction != BLACK_PEPPER_CLASS or pepper_score < (LEAF_THRESHOLD * 100):
        if leaf_prediction == "betel leaves":
            reason = f"Rejected. This appears to be a betel leaf. Pepper score: {pepper_score:.1f}%."
        elif leaf_prediction == "non pepper":
            reason = f"Rejected. This is not a black pepper leaf. Pepper score: {pepper_score:.1f}%."
        else:
            reason = f"Rejected. Image is not reliable as black pepper leaf. Pepper score: {pepper_score:.1f}%."

        return {
            "rejected": True,
            "low_confidence": False,
            "reject_reason": reason,
            "prediction": None,
            "confidence": round(pepper_score, 2),
            "leaf_prediction": leaf_prediction,
            "leaf_confidence": round(leaf_confidence, 2),
            "pepper_score": round(pepper_score, 2),
            "leaf_probabilities": leaf_probabilities,
            "all_probabilities": {},
            "model_name": "leaf_detector",
            "description": None,
            "advice": "Please upload a clear black pepper leaf image with good lighting and a simple background."
        }

    # =========================
    # STAGE 2: Disease classifier
    # =========================
    preds = disease_model.predict(img_array, verbose=0)[0]

    pred_idx = int(np.argmax(preds))
    pred_label = CLASS_NAMES[pred_idx]
    conf_pct = float(preds[pred_idx]) * 100

    all_probs = build_disease_probabilities(preds)

    if conf_pct >= DISEASE_THRESHOLD:
        info = DISEASE_INFO.get(pred_label, {
            "description": "Unknown prediction.",
            "advice": "Consult an agricultural expert."
        })

        return {
            "rejected": False,
            "low_confidence": False,
            "reject_reason": None,
            "prediction": DISPLAY_NAMES.get(pred_label, pred_label),
            "confidence": round(conf_pct, 2),
            "leaf_prediction": leaf_prediction,
            "leaf_confidence": round(leaf_confidence, 2),
            "pepper_score": round(pepper_score, 2),
            "leaf_probabilities": leaf_probabilities,
            "all_probabilities": all_probs,
            "model_name": MODEL_NAME,
            "description": info["description"],
            "advice": info["advice"]
        }

    if conf_pct >= LOW_CONFIDENCE_THRESHOLD:
        if pred_label == "healthy":
            prediction_text = "Possibly Healthy"
            description_text = "The leaf appears mostly healthy, but the model confidence is low."
            advice_text = "Monitor the leaf over time and upload a clearer close-up image if symptoms increase."
        else:
            possible_label = DISPLAY_NAMES.get(pred_label, pred_label)
            prediction_text = f"Possible Early {possible_label}"
            description_text = f"The leaf may show early signs of {possible_label}, but the confidence is low."
            advice_text = "This may be a mild or early-stage infection. Capture a closer image in good lighting and monitor symptom progression."

        return {
            "rejected": False,
            "low_confidence": True,
            "reject_reason": None,
            "prediction": prediction_text,
            "confidence": round(conf_pct, 2),
            "leaf_prediction": leaf_prediction,
            "leaf_confidence": round(leaf_confidence, 2),
            "pepper_score": round(pepper_score, 2),
            "leaf_probabilities": leaf_probabilities,
            "all_probabilities": all_probs,
            "model_name": MODEL_NAME,
            "description": description_text,
            "advice": advice_text
        }

    return {
        "rejected": True,
        "low_confidence": False,
        "reject_reason": f"Image is unclear or not reliable for disease detection. Top disease confidence: {conf_pct:.1f}%.",
        "prediction": None,
        "confidence": round(conf_pct, 2),
        "leaf_prediction": leaf_prediction,
        "leaf_confidence": round(leaf_confidence, 2),
        "pepper_score": round(pepper_score, 2),
        "leaf_probabilities": leaf_probabilities,
        "all_probabilities": all_probs,
        "model_name": MODEL_NAME,
        "description": None,
        "advice": "Please upload a clearer black pepper leaf image with good lighting and a simple background."
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