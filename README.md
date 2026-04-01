# 🎓 EduSense — Student Dropout & Backlog Predictor

> **Sensing academic trouble before it hits**

EduSense is an intelligent academic early-warning system built for **VNRVJIET, CSE Department**. It uses Machine Learning to predict student **dropout risk** and **backlog risk** from academic and behavioural data, and surfaces personalized, actionable recommendations.

---

## 📸 Screenshots

| Login | Dashboard | Predict | Results | Admin |
|-------|-----------|---------|---------|-------|
| Student & Admin login | Stats at a glance | Slider-based form | Gauge charts + recs | Upload CSV & train |

---

## 🚀 Features

| Feature | Details |
|---------|---------|
| 🔐 Role-based Login | Student (roll number) + Admin |
| 📁 CSV Upload | Drag-and-drop student data upload with preview |
| 🤖 ML Models | Random Forest (backlogs) + XGBoost (dropout) |
| 📊 Model Analytics | Accuracy, F1, confusion matrix, feature importance |
| 🔮 Risk Prediction | Real-time prediction with confidence gauge |
| 💡 Recommendations | Personalised tips per risk level |
| 📈 Recharts Visuals | Bar charts for feature contributions |
| 🎨 VNRVJIET Branded | Teal/lavender theme matching college colours |

---

## 🛠️ Tech Stack

### Backend
- **Python 3.10+** / Flask 3.1
- **scikit-learn** — Random Forest classifier (backlog)
- **XGBoost** — Gradient Boosted Trees (dropout)
- **pandas / numpy** — data wrangling
- **joblib** — model persistence
- **flask-cors** — cross-origin support

### Frontend
- **React 18** + **Vite**
- **Recharts** — interactive bar & gauge charts
- **Axios** — HTTP client
- **React Router v6** — SPA navigation
- **Vanilla CSS** — custom design system (no Tailwind)

---

## 📁 Project Structure

```
Edusense/
├── backend/
│   ├── app.py                  # Flask API server
│   ├── requirements.txt
│   ├── data/                   # Uploaded CSVs & trained models (git-ignored)
│   │   └── .gitkeep
│   └── ml/
│       ├── __init__.py
│       ├── generate_sample_data.py   # Generate synthetic student dataset
│       ├── trainer.py                # Train RF + XGBoost models
│       └── predictor.py              # Inference & recommendations
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx             # Router, Navbar, Footer
        ├── api.js              # Axios API layer
        ├── index.css           # Full design system
        └── pages/
            ├── LoginPage.jsx
            ├── Dashboard.jsx
            ├── PredictPage.jsx
            ├── ResultsPage.jsx
            ├── AdminPanel.jsx
            └── AboutPage.jsx
```

---

## ⚡ Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/vinayteja-dev/Edusense.git
cd Edusense
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py          # Starts on http://localhost:5000
```

### 3. Generate sample data (optional)
```bash
python ml/generate_sample_data.py
# Creates backend/data/sample_students.csv (1000 rows)
```

### 4. Frontend setup
```bash
cd frontend
npm install
npm run dev            # Starts on http://localhost:5173
```

---

## 🔑 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Student | Any roll number | `edusense123` |

---

## 📊 Expected CSV Columns

| Column | Type | Description |
|--------|------|-------------|
| `roll_number` | string | Unique student ID |
| `name` | string | Student name |
| `attendance_pct` | float | Attendance % (0–100) |
| `mid1_marks` | float | Mid-1 marks (0–30) |
| `mid2_marks` | float | Mid-2 marks (0–30) |
| `assignment_score` | float | Assignment score (0–10) |
| `prev_sem_gpa` | float | Previous semester GPA (0–10) |
| `backlog_count` | int | Number of existing backlogs |
| `fee_status` | string | `paid` / `partial` / `unpaid` |
| `mentoring_sessions` | int | Mentoring sessions attended |
| `family_income_level` | string | `low` / `medium` / `high` |
| `backlog_risk` | string | Label: `low` / `medium` / `high` |
| `dropout_risk` | string | Label: `low` / `at risk` / `critical` |

---

## 🧠 ML Models

### Backlog Predictor — Random Forest
- **Features**: attendance, mid marks, assignments, GPA, backlog count
- **Target**: `backlog_risk` (Low / Medium / High)
- **Hyperparams**: 150 estimators, max depth 10, balanced class weights

### Dropout Predictor — XGBoost
- **Features**: attendance, fee status, backlogs, GPA, family income, mentoring
- **Target**: `dropout_risk` (Safe / At Risk / Critical)
- **Hyperparams**: 150 estimators, max depth 6, learning rate 0.1
- **Fallback**: GradientBoostingClassifier if XGBoost not installed

---

## 👥 Team

| Name |
|------|
| Lokesh Vardhan |
| Vashista |
| Vinay Teja |
| Veda N |
| Purushottham |

**Guide**: Mrs. K. Bhagya Rekha, CSE Department, VNRVJIET

---

## 📄 License

This project is built for academic purposes at VNRVJIET. All rights reserved.

---

<p align="center">✨ <strong>EduSense</strong> — Sensing academic trouble before it hits ✨</p>
