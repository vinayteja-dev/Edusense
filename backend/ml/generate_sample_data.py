"""
Generate synthetic student data for EduSense testing.
Creates 1000 student records with realistic correlations.
"""

import os
import numpy as np
import pandas as pd

np.random.seed(42)

N = 1000

data = {
    "roll_number": [f"21071A{str(i).zfill(4)}" for i in range(1, N + 1)],
    "name": [f"Student_{i}" for i in range(1, N + 1)],
}

# Generate correlated features
attendance = np.clip(np.random.normal(75, 15, N), 20, 100).round(1)
mid1 = np.clip(np.random.normal(18, 5, N), 2, 30).round(1)
mid2 = np.clip(np.random.normal(17, 6, N), 2, 30).round(1)
assignment = np.clip(np.random.normal(7, 2, N), 1, 10).round(1)
gpa = np.clip(np.random.normal(7.0, 1.5, N), 2.0, 10.0).round(2)
backlog_count = np.random.choice([0, 0, 0, 0, 1, 1, 2, 3, 4, 5], N)
fee_status = np.random.choice(["paid", "paid", "paid", "unpaid", "partial"], N)
mentoring = np.random.choice([0, 1, 2, 3, 4, 5, 6], N)
family_income = np.random.choice(["low", "medium", "medium", "high"], N)

data["attendance_pct"] = attendance
data["mid1_marks"] = mid1
data["mid2_marks"] = mid2
data["assignment_score"] = assignment
data["prev_sem_gpa"] = gpa
data["backlog_count"] = backlog_count
data["fee_status"] = fee_status
data["mentoring_sessions"] = mentoring
data["family_income_level"] = family_income

# Generate risk labels with realistic correlations
backlog_risk = []
dropout_risk = []

for i in range(N):
    # Backlog risk based on marks, attendance, gpa
    score = (
        (attendance[i] < 65) * 2
        + (mid1[i] < 12) * 2
        + (mid2[i] < 12) * 2
        + (assignment[i] < 5) * 1
        + (gpa[i] < 5.5) * 2
        + (backlog_count[i] >= 2) * 3
    )
    if score >= 6:
        backlog_risk.append("High")
    elif score >= 3:
        backlog_risk.append("Medium")
    else:
        backlog_risk.append("Low")

    # Dropout risk based on attendance, fees, backlogs, income
    dscore = (
        (attendance[i] < 55) * 3
        + (fee_status[i] == "unpaid") * 3
        + (backlog_count[i] >= 3) * 3
        + (gpa[i] < 4.5) * 2
        + (family_income[i] == "low") * 2
        + (mentoring[i] <= 1) * 1
    )
    if dscore >= 7:
        dropout_risk.append("Critical")
    elif dscore >= 3:
        dropout_risk.append("At Risk")
    else:
        dropout_risk.append("Safe")

data["backlog_risk"] = backlog_risk
data["dropout_risk"] = dropout_risk

# Add some realistic names
first_names = [
    "Aarav", "Aditi", "Aditya", "Akash", "Amara", "Ananya", "Arjun", "Avani",
    "Bhavya", "Chaitanya", "Deepak", "Divya", "Esha", "Gaurav", "Harini",
    "Ishaan", "Jaya", "Kavya", "Kiran", "Lakshmi", "Madhav", "Meera", "Navya",
    "Omkar", "Pranav", "Priya", "Rahul", "Rithika", "Rohan", "Sahithi",
    "Saketh", "Sanjana", "Shreya", "Siddharth", "Sneha", "Surya", "Tanvi",
    "Varun", "Veda", "Vinay", "Vishwa", "Yamini", "Lokesh", "Vashista",
    "Purushottham", "Bhagya", "Rekha", "Suresh", "Ramesh", "Ganesh",
]
last_names = [
    "Reddy", "Sharma", "Kumar", "Patel", "Singh", "Rao", "Gupta", "Verma",
    "Nair", "Iyer", "Joshi", "Das", "Kaur", "Mishra", "Mehta", "Pillai",
    "Chatterjee", "Bose", "Malhotra", "Saxena", "Vardhan", "Teja", "Naidu",
]

full_names = [
    f"{np.random.choice(first_names)} {np.random.choice(last_names)}" for _ in range(N)
]
data["name"] = full_names

df = pd.DataFrame(data)

# Save to backend/data
output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "sample_data.csv")
df.to_csv(output_path, index=False)

print(f"✅ Generated {N} student records → {output_path}")
print(f"\nBacklog Risk Distribution:")
print(df["backlog_risk"].value_counts())
print(f"\nDropout Risk Distribution:")
print(df["dropout_risk"].value_counts())
print(f"\nSample:\n{df.head()}")
