"""
EduSense Flask Backend
API server for student dropout & backlog prediction.
"""

import os
import json
import threading
import pandas as pd
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from ml.trainer import train_models, get_training_state, get_model_stats, DEFAULT_COLUMN_MAP
from ml.predictor import predict_combined, predict_backlog, predict_dropout

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Store column mapping in memory
current_column_map = dict(DEFAULT_COLUMN_MAP)

# ── Mock Users ──
MOCK_USERS = {
    "admin": {"password": "admin123", "role": "admin", "name": "Admin User"},
}


# ─────────────────────────── Routes ───────────────────────────


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "EduSense API is running"})


@app.route("/api/login", methods=["POST"])
def login():
    """Mock authentication."""
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    role = data.get("role", "student")

    if role == "admin":
        user = MOCK_USERS.get(username)
        if user and user["password"] == password:
            return jsonify({
                "success": True,
                "user": {"username": username, "name": user["name"], "role": "admin"},
            })
        return jsonify({"success": False, "message": "Invalid admin credentials"}), 401

    # Student login — check if roll number exists in uploaded data
    csv_path = os.path.join(DATA_DIR, "uploaded_data.csv")
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        roll_col = current_column_map.get("roll_number", "roll_number")
        if roll_col in df.columns:
            student = df[df[roll_col].astype(str).str.lower() == username.lower()]
            if not student.empty:
                name_col = current_column_map.get("name", "name")
                student_name = str(student.iloc[0].get(name_col, username))
                return jsonify({
                    "success": True,
                    "user": {
                        "username": username,
                        "name": student_name,
                        "role": "student",
                        "roll_number": username,
                    },
                })

    # Allow any login with password "edusense123" as fallback
    if password == "edusense123":
        return jsonify({
            "success": True,
            "user": {"username": username, "name": username, "role": "student", "roll_number": username},
        })

    return jsonify({"success": False, "message": "Invalid credentials. Use your roll number and password 'edusense123'"}), 401


@app.route("/api/upload-data", methods=["POST"])
def upload_data():
    """Upload CSV, validate, preview, and save."""
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"success": False, "message": "Only CSV files are allowed"}), 400

    try:
        df = pd.read_csv(file)

        if df.empty:
            return jsonify({"success": False, "message": "CSV file is empty"}), 400

        if len(df.columns) < 3:
            return jsonify({"success": False, "message": "CSV must have at least 3 columns"}), 400

        # Save to disk
        csv_path = os.path.join(DATA_DIR, "uploaded_data.csv")
        df.to_csv(csv_path, index=False)

        # Check column mapping
        expected_cols = list(DEFAULT_COLUMN_MAP.keys())
        actual_cols = list(df.columns)
        matched = [c for c in expected_cols if c in actual_cols]
        unmatched = [c for c in expected_cols if c not in actual_cols]

        # Preview
        preview = df.head(10).to_dict(orient="records")
        col_info = []
        for col in df.columns:
            col_info.append({
                "name": col,
                "dtype": str(df[col].dtype),
                "null_count": int(df[col].isnull().sum()),
                "unique_count": int(df[col].nunique()),
                "sample": str(df[col].iloc[0]) if len(df) > 0 else "",
            })

        return jsonify({
            "success": True,
            "message": f"Uploaded {len(df)} records with {len(df.columns)} columns",
            "rows": len(df),
            "columns": actual_cols,
            "preview": preview,
            "column_info": col_info,
            "matched_columns": matched,
            "unmatched_columns": unmatched,
            "needs_mapping": len(unmatched) > 2,
        })

    except Exception as e:
        return jsonify({"success": False, "message": f"Error reading CSV: {str(e)}"}), 400


@app.route("/api/column-mapping", methods=["POST"])
def update_column_mapping():
    """Update column mapping for CSV columns."""
    global current_column_map
    data = request.get_json()
    mapping = data.get("mapping", {})
    current_column_map.update(mapping)
    return jsonify({"success": True, "mapping": current_column_map})


@app.route("/api/train", methods=["POST"])
def train():
    """Train/retrain models on uploaded CSV."""
    data = request.get_json() or {}
    column_map = data.get("column_map", current_column_map)

    # Run training in a background thread
    def run_training():
        train_models(column_map)

    thread = threading.Thread(target=run_training)
    thread.start()
    thread.join()  # Wait for completion (models train fast on 1000 rows)

    state = get_training_state()
    return jsonify(state)


@app.route("/api/training-status", methods=["GET"])
def training_status():
    """Poll training progress."""
    return jsonify(get_training_state())


@app.route("/api/model-stats", methods=["GET"])
def model_stats():
    """Return saved model statistics."""
    stats = get_model_stats()
    if stats:
        return jsonify({"success": True, "stats": stats})
    return jsonify({"success": False, "message": "No trained models found. Train models first."})


@app.route("/api/predict/combined", methods=["POST"])
def predict():
    """Run both backlog + dropout predictions."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No input data provided"}), 400

    features = {
        "attendance_pct": float(data.get("attendance_pct", 0)),
        "mid1_marks": float(data.get("mid1_marks", 0)),
        "mid2_marks": float(data.get("mid2_marks", 0)),
        "assignment_score": float(data.get("assignment_score", 0)),
        "prev_sem_gpa": float(data.get("prev_sem_gpa", 0)),
        "backlog_count": int(data.get("backlog_count", 0)),
        "fee_status": data.get("fee_status", "paid"),
        "mentoring_sessions": int(data.get("mentoring_sessions", 0)),
        "family_income_level": data.get("family_income_level", "medium"),
    }

    result = predict_combined(features)

    # Check for errors
    if "error" in result.get("backlog", {}) or "error" in result.get("dropout", {}):
        return jsonify({"success": False, "results": result, "message": "Some models are not trained yet"}), 400

    return jsonify({"success": True, "results": result})


@app.route("/api/student/<rollno>", methods=["GET"])
def get_student(rollno):
    """Fetch student data from uploaded CSV by roll number."""
    csv_path = os.path.join(DATA_DIR, "uploaded_data.csv")
    if not os.path.exists(csv_path):
        return jsonify({"success": False, "message": "No data uploaded yet"}), 404

    df = pd.read_csv(csv_path)
    roll_col = current_column_map.get("roll_number", "roll_number")

    if roll_col not in df.columns:
        return jsonify({"success": False, "message": f"Column '{roll_col}' not found in data"}), 404

    student = df[df[roll_col].astype(str).str.lower() == rollno.lower()]

    if student.empty:
        return jsonify({"success": False, "message": f"Student {rollno} not found"}), 404

    record = student.iloc[0].to_dict()
    # Convert numpy types to Python types
    clean_record = {}
    for k, v in record.items():
        if pd.isna(v):
            clean_record[k] = None
        elif isinstance(v, (int, float, str, bool)):
            clean_record[k] = v
        else:
            clean_record[k] = str(v)

    return jsonify({"success": True, "student": clean_record})


@app.route("/api/students", methods=["GET"])
def list_students():
    """List all students (for admin view)."""
    csv_path = os.path.join(DATA_DIR, "uploaded_data.csv")
    if not os.path.exists(csv_path):
        return jsonify({"success": False, "message": "No data uploaded yet"}), 404

    df = pd.read_csv(csv_path)
    roll_col = current_column_map.get("roll_number", "roll_number")
    name_col = current_column_map.get("name", "name")

    students = []
    for _, row in df.iterrows():
        students.append({
            "roll_number": str(row.get(roll_col, "")),
            "name": str(row.get(name_col, "")),
        })

    return jsonify({"success": True, "students": students[:100]})  # Limit to 100


@app.route("/api/download-data", methods=["GET"])
def download_data():
    """Download the uploaded/processed CSV."""
    csv_path = os.path.join(DATA_DIR, "uploaded_data.csv")
    if os.path.exists(csv_path):
        return send_file(csv_path, as_attachment=True, download_name="edusense_data.csv")
    return jsonify({"success": False, "message": "No data file found"}), 404


if __name__ == "__main__":
    app.run(debug=True, port=5000)
