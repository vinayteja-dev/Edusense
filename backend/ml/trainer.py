"""
EduSense ML Trainer
Trains Random Forest (backlog) and XGBoost (dropout) models on uploaded CSV data.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import joblib

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

# Default expected column mapping
DEFAULT_COLUMN_MAP = {
    "roll_number": "roll_number",
    "name": "name",
    "attendance_pct": "attendance_pct",
    "mid1_marks": "mid1_marks",
    "mid2_marks": "mid2_marks",
    "assignment_score": "assignment_score",
    "prev_sem_gpa": "prev_sem_gpa",
    "backlog_count": "backlog_count",
    "fee_status": "fee_status",
    "mentoring_sessions": "mentoring_sessions",
    "family_income_level": "family_income_level",
    "backlog_risk": "backlog_risk",
    "dropout_risk": "dropout_risk",
}

BACKLOG_FEATURES = [
    "attendance_pct",
    "mid1_marks",
    "mid2_marks",
    "assignment_score",
    "prev_sem_gpa",
    "backlog_count",
]

DROPOUT_FEATURES = [
    "attendance_pct",
    "fee_status",
    "backlog_count",
    "prev_sem_gpa",
    "family_income_level",
    "mentoring_sessions",
]

# Global training state
training_state = {
    "status": "idle",  # idle, training, complete, error
    "progress": 0,
    "message": "",
    "results": None,
}


def _encode_categorical(df, column):
    """Encode categorical columns to numeric."""
    le = LabelEncoder()
    df[column] = le.fit_transform(df[column].astype(str))
    return le


def _prepare_data(df, column_map):
    """Prepare dataframe using column mapping, encode categoricals."""
    mapped_df = pd.DataFrame()

    for expected_col, actual_col in column_map.items():
        if actual_col in df.columns:
            mapped_df[expected_col] = df[actual_col]

    encoders = {}

    # Encode fee_status (paid/unpaid -> 1/0)
    if "fee_status" in mapped_df.columns:
        fee_map = {"paid": 1, "unpaid": 0, "partial": 0.5}
        mapped_df["fee_status"] = (
            mapped_df["fee_status"]
            .astype(str)
            .str.lower()
            .map(fee_map)
            .fillna(0)
        )

    # Encode family_income_level (low/medium/high -> 0/1/2)
    if "family_income_level" in mapped_df.columns:
        income_map = {"low": 0, "medium": 1, "high": 2}
        mapped_df["family_income_level"] = (
            mapped_df["family_income_level"]
            .astype(str)
            .str.lower()
            .map(income_map)
            .fillna(1)
        )

    # Encode risk labels
    risk_map = {"low": 0, "medium": 1, "high": 2, "safe": 0, "at risk": 1, "critical": 2}
    if "backlog_risk" in mapped_df.columns:
        mapped_df["backlog_risk"] = (
            mapped_df["backlog_risk"]
            .astype(str)
            .str.lower()
            .str.strip()
            .map(risk_map)
            .fillna(0)
            .astype(int)
        )
    if "dropout_risk" in mapped_df.columns:
        mapped_df["dropout_risk"] = (
            mapped_df["dropout_risk"]
            .astype(str)
            .str.lower()
            .str.strip()
            .map(risk_map)
            .fillna(0)
            .astype(int)
        )

    # Fill any remaining NaN with 0
    mapped_df = mapped_df.fillna(0)

    # Convert all feature columns to numeric
    for col in BACKLOG_FEATURES + DROPOUT_FEATURES:
        if col in mapped_df.columns:
            mapped_df[col] = pd.to_numeric(mapped_df[col], errors="coerce").fillna(0)

    return mapped_df, encoders


def train_models(column_map=None):
    """Train both backlog and dropout models on uploaded CSV data."""
    global training_state

    csv_path = os.path.join(DATA_DIR, "uploaded_data.csv")
    if not os.path.exists(csv_path):
        training_state = {
            "status": "error",
            "progress": 0,
            "message": "No data file found. Please upload a CSV first.",
            "results": None,
        }
        return training_state

    try:
        training_state = {
            "status": "training",
            "progress": 10,
            "message": "Loading data...",
            "results": None,
        }

        df = pd.read_csv(csv_path)

        if column_map is None:
            column_map = DEFAULT_COLUMN_MAP

        training_state["progress"] = 20
        training_state["message"] = "Preparing data..."

        mapped_df, encoders = _prepare_data(df, column_map)

        results = {}

        # ── Train Backlog Model (Random Forest) ──
        training_state["progress"] = 30
        training_state["message"] = "Training Backlog Predictor (Random Forest)..."

        backlog_feature_cols = [c for c in BACKLOG_FEATURES if c in mapped_df.columns]
        if "backlog_risk" in mapped_df.columns and len(backlog_feature_cols) >= 3:
            X_backlog = mapped_df[backlog_feature_cols].values
            y_backlog = mapped_df["backlog_risk"].values

            X_train, X_test, y_train, y_test = train_test_split(
                X_backlog, y_backlog, test_size=0.2, random_state=42, stratify=y_backlog
            )

            rf_model = RandomForestClassifier(
                n_estimators=150,
                max_depth=10,
                random_state=42,
                class_weight="balanced",
            )
            rf_model.fit(X_train, y_train)
            y_pred = rf_model.predict(X_test)

            backlog_accuracy = round(accuracy_score(y_test, y_pred) * 100, 2)
            backlog_f1 = round(f1_score(y_test, y_pred, average="weighted") * 100, 2)
            backlog_cm = confusion_matrix(y_test, y_pred).tolist()
            backlog_importance = dict(
                zip(backlog_feature_cols, [round(float(v), 4) for v in rf_model.feature_importances_])
            )

            # Save model
            joblib.dump(
                {"model": rf_model, "features": backlog_feature_cols},
                os.path.join(DATA_DIR, "backlog_model.pkl"),
            )

            results["backlog"] = {
                "accuracy": backlog_accuracy,
                "f1_score": backlog_f1,
                "confusion_matrix": backlog_cm,
                "feature_importance": backlog_importance,
                "labels": ["Low", "Medium", "High"],
            }
        else:
            results["backlog"] = {"error": "Insufficient columns for backlog model"}

        training_state["progress"] = 60
        training_state["message"] = "Training Dropout Predictor (Gradient Boosting)..."

        # ── Train Dropout Model (Gradient Boosting / XGBoost) ──
        dropout_feature_cols = [c for c in DROPOUT_FEATURES if c in mapped_df.columns]
        if "dropout_risk" in mapped_df.columns and len(dropout_feature_cols) >= 3:
            X_dropout = mapped_df[dropout_feature_cols].values
            y_dropout = mapped_df["dropout_risk"].values

            X_train, X_test, y_train, y_test = train_test_split(
                X_dropout, y_dropout, test_size=0.2, random_state=42, stratify=y_dropout
            )

            try:
                from xgboost import XGBClassifier

                gb_model = XGBClassifier(
                    n_estimators=150,
                    max_depth=6,
                    learning_rate=0.1,
                    random_state=42,
                    eval_metric="mlogloss",
                    use_label_encoder=False,
                )
            except ImportError:
                gb_model = GradientBoostingClassifier(
                    n_estimators=150,
                    max_depth=6,
                    learning_rate=0.1,
                    random_state=42,
                )

            gb_model.fit(X_train, y_train)
            y_pred = gb_model.predict(X_test)

            dropout_accuracy = round(accuracy_score(y_test, y_pred) * 100, 2)
            dropout_f1 = round(f1_score(y_test, y_pred, average="weighted") * 100, 2)
            dropout_cm = confusion_matrix(y_test, y_pred).tolist()
            dropout_importance = dict(
                zip(dropout_feature_cols, [round(float(v), 4) for v in gb_model.feature_importances_])
            )

            # Save model
            joblib.dump(
                {"model": gb_model, "features": dropout_feature_cols},
                os.path.join(DATA_DIR, "dropout_model.pkl"),
            )

            results["dropout"] = {
                "accuracy": dropout_accuracy,
                "f1_score": dropout_f1,
                "confusion_matrix": dropout_cm,
                "feature_importance": dropout_importance,
                "labels": ["Safe", "At Risk", "Critical"],
            }
        else:
            results["dropout"] = {"error": "Insufficient columns for dropout model"}

        training_state = {
            "status": "complete",
            "progress": 100,
            "message": "Training complete!",
            "results": results,
        }

        # Save results to disk
        with open(os.path.join(DATA_DIR, "training_results.json"), "w") as f:
            json.dump(results, f, indent=2)

        return training_state

    except Exception as e:
        training_state = {
            "status": "error",
            "progress": 0,
            "message": f"Training failed: {str(e)}",
            "results": None,
        }
        return training_state


def get_training_state():
    """Return current training state."""
    return training_state


def get_model_stats():
    """Return saved training results from disk."""
    results_path = os.path.join(DATA_DIR, "training_results.json")
    if os.path.exists(results_path):
        with open(results_path, "r") as f:
            return json.load(f)
    return None
