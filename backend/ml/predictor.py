"""
EduSense ML Predictor
Loads trained models and returns predictions with confidence and recommendations.
"""

import os
import numpy as np
import joblib

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

BACKLOG_LABELS = {0: "Low", 1: "Medium", 2: "High"}
DROPOUT_LABELS = {0: "Safe", 1: "At Risk", 2: "Critical"}

BACKLOG_RECOMMENDATIONS = {
    "Low": {
        "message": "Great performance! Keep it up. 🎉",
        "tips": [
            "Continue maintaining your current study habits.",
            "Consider helping classmates who may be struggling.",
            "Explore advanced topics or competitive exams.",
        ],
        "color": "green",
    },
    "Medium": {
        "message": "Consider attending remedial classes. ⚠️",
        "tips": [
            "Focus on improving mid-semester marks — aim for 15+ in each.",
            "Attend all remaining classes to boost attendance above 80%.",
            "Complete all pending assignments on time.",
            "Visit your faculty mentor for subject-specific guidance.",
        ],
        "color": "orange",
    },
    "High": {
        "message": "Immediately meet your mentor and counselor. 🚨",
        "tips": [
            "Schedule an urgent meeting with your academic mentor.",
            "Attend remedial/tutorial sessions without fail.",
            "Form a study group with high-performing peers.",
            "Consider reducing extracurricular load this semester.",
            "Reach out to the counseling center for support.",
        ],
        "color": "red",
    },
}

DROPOUT_RECOMMENDATIONS = {
    "Safe": {
        "message": "You're on a good track. Keep going! 🌟",
        "tips": [
            "Your academic journey looks stable.",
            "Continue attending mentoring sessions regularly.",
            "Maintain consistent attendance and fee payments.",
        ],
        "color": "green",
    },
    "At Risk": {
        "message": "Some concerns detected. Let's address them. ⚠️",
        "tips": [
            "Ensure your fees are up to date — contact the finance office if needed.",
            "Attend mentoring sessions consistently.",
            "Talk to your HOD about any academic or personal difficulties.",
            "Explore scholarship options if finances are a concern.",
        ],
        "color": "orange",
    },
    "Critical": {
        "message": "Urgent intervention needed. Please seek help immediately. 🚨",
        "tips": [
            "Contact your mentor and the Head of Department immediately.",
            "Visit the college counseling center.",
            "Apply for fee concession or emergency financial aid.",
            "Connect with student welfare committees.",
            "Your college wants you to succeed — reach out for support.",
        ],
        "color": "red",
    },
}


def _load_model(model_name):
    """Load a saved model from disk."""
    model_path = os.path.join(DATA_DIR, f"{model_name}.pkl")
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return None


def predict_backlog(features_dict):
    """
    Predict backlog risk.
    features_dict: {attendance_pct, mid1_marks, mid2_marks, assignment_score, prev_sem_gpa, backlog_count}
    """
    model_data = _load_model("backlog_model")
    if model_data is None:
        return {"error": "Backlog model not trained yet. Please upload data and train first."}

    model = model_data["model"]
    feature_names = model_data["features"]

    # Build feature vector in correct order
    X = np.array([[features_dict.get(f, 0) for f in feature_names]])

    prediction = int(model.predict(X)[0])
    probabilities = model.predict_proba(X)[0]
    confidence = round(float(max(probabilities)) * 100, 1)

    label = BACKLOG_LABELS.get(prediction, "Unknown")
    recommendation = BACKLOG_RECOMMENDATIONS.get(label, {})

    return {
        "risk_level": label,
        "risk_code": prediction,
        "confidence": confidence,
        "probabilities": {
            BACKLOG_LABELS[i]: round(float(p) * 100, 1)
            for i, p in enumerate(probabilities)
            if i in BACKLOG_LABELS
        },
        "recommendation": recommendation,
        "feature_contributions": {
            f: round(float(v), 4)
            for f, v in zip(feature_names, model.feature_importances_)
        },
    }


def predict_dropout(features_dict):
    """
    Predict dropout risk.
    features_dict: {attendance_pct, fee_status, backlog_count, prev_sem_gpa, family_income_level, mentoring_sessions}
    """
    model_data = _load_model("dropout_model")
    if model_data is None:
        return {"error": "Dropout model not trained yet. Please upload data and train first."}

    model = model_data["model"]
    feature_names = model_data["features"]

    # Encode categoricals
    processed = dict(features_dict)
    if "fee_status" in processed:
        fee_map = {"paid": 1, "unpaid": 0, "partial": 0.5}
        if isinstance(processed["fee_status"], str):
            processed["fee_status"] = fee_map.get(processed["fee_status"].lower(), 0)

    if "family_income_level" in processed:
        income_map = {"low": 0, "medium": 1, "high": 2}
        if isinstance(processed["family_income_level"], str):
            processed["family_income_level"] = income_map.get(
                processed["family_income_level"].lower(), 1
            )

    X = np.array([[processed.get(f, 0) for f in feature_names]])

    prediction = int(model.predict(X)[0])

    # Handle predict_proba
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(X)[0]
    else:
        probabilities = np.zeros(3)
        probabilities[prediction] = 1.0

    confidence = round(float(max(probabilities)) * 100, 1)
    label = DROPOUT_LABELS.get(prediction, "Unknown")
    recommendation = DROPOUT_RECOMMENDATIONS.get(label, {})

    return {
        "risk_level": label,
        "risk_code": prediction,
        "confidence": confidence,
        "probabilities": {
            DROPOUT_LABELS[i]: round(float(p) * 100, 1)
            for i, p in enumerate(probabilities)
            if i in DROPOUT_LABELS
        },
        "recommendation": recommendation,
        "feature_contributions": {
            f: round(float(v), 4)
            for f, v in zip(feature_names, model.feature_importances_)
        },
    }


def predict_combined(features_dict):
    """Run both backlog and dropout predictions."""
    backlog_result = predict_backlog(features_dict)
    dropout_result = predict_dropout(features_dict)

    return {
        "backlog": backlog_result,
        "dropout": dropout_result,
    }
