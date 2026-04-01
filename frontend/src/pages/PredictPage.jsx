import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent, predictCombined } from '../api';

export default function PredictPage({ user, setResults }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    attendance_pct: 75,
    mid1_marks: 18,
    mid2_marks: 18,
    assignment_score: 7,
    prev_sem_gpa: 7.0,
    backlog_count: 0,
    fee_status: 'paid',
    mentoring_sessions: 3,
    family_income_level: 'medium',
  });

  // Try to auto-fill from student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await getStudent(user.roll_number || user.username);
        if (res.data.success) {
          const s = res.data.student;
          setForm({
            attendance_pct: parseFloat(s.attendance_pct) || 75,
            mid1_marks: parseFloat(s.mid1_marks) || 18,
            mid2_marks: parseFloat(s.mid2_marks) || 18,
            assignment_score: parseFloat(s.assignment_score) || 7,
            prev_sem_gpa: parseFloat(s.prev_sem_gpa) || 7.0,
            backlog_count: parseInt(s.backlog_count) || 0,
            fee_status: s.fee_status || 'paid',
            mentoring_sessions: parseInt(s.mentoring_sessions) || 3,
            family_income_level: s.family_income_level || 'medium',
          });
        }
      } catch {
        // Use default values
      }
    };
    fetchStudent();
  }, [user]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await predictCombined(form);
      if (res.data.success) {
        setResults(res.data.results);
        navigate('/results');
      } else {
        setError(res.data.message || 'Prediction failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Make sure models are trained.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">🔮 Risk Prediction</h1>
      <p className="page-subtitle">Enter your academic details to check backlog & dropout risk</p>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          {/* Academic Performance */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">📚 Academic Performance</h2>
              <div className="card-icon" style={{ background: '#e3f2fd', color: '#1565c0' }}>📝</div>
            </div>

            {/* Attendance Slider */}
            <div className="form-group">
              <label className="form-label">Attendance Percentage</label>
              <div className="slider-container">
                <span className="slider-value">{form.attendance_pct}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={form.attendance_pct}
                  onChange={(e) => handleChange('attendance_pct', parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Mid Marks */}
            <div className="grid-2" style={{ gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Mid-1 Marks (0–30)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="30"
                  step="0.5"
                  value={form.mid1_marks}
                  onChange={(e) => handleChange('mid1_marks', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mid-2 Marks (0–30)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="30"
                  step="0.5"
                  value={form.mid2_marks}
                  onChange={(e) => handleChange('mid2_marks', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Assignment & GPA */}
            <div className="grid-2" style={{ gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Assignment Score (0–10)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="10"
                  step="0.5"
                  value={form.assignment_score}
                  onChange={(e) => handleChange('assignment_score', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Previous Sem GPA (0–10)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="10"
                  step="0.1"
                  value={form.prev_sem_gpa}
                  onChange={(e) => handleChange('prev_sem_gpa', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Existing Backlog Count</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="20"
                value={form.backlog_count}
                onChange={(e) => handleChange('backlog_count', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Personal & Support */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">👤 Personal & Support</h2>
              <div className="card-icon" style={{ background: '#f3e5f5', color: '#7b1fa2' }}>🤝</div>
            </div>

            <div className="form-group">
              <label className="form-label">Fee Status</label>
              <select
                className="form-select"
                value={form.fee_status}
                onChange={(e) => handleChange('fee_status', e.target.value)}
              >
                <option value="paid">✅ Paid</option>
                <option value="partial">⚠️ Partially Paid</option>
                <option value="unpaid">❌ Unpaid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mentoring Sessions Attended</label>
              <div className="slider-container">
                <span className="slider-value">{form.mentoring_sessions}</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={form.mentoring_sessions}
                  onChange={(e) => handleChange('mentoring_sessions', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Family Income Level</label>
              <select
                className="form-select"
                value={form.family_income_level}
                onChange={(e) => handleChange('family_income_level', e.target.value)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Summary Preview */}
            <div style={{
              background: 'var(--bg-mint)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '12px'
            }}>
              <h4 style={{ fontSize: '0.82rem', color: '#1a6b6b', marginBottom: '8px' }}>Input Summary</h4>
              <div style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.8 }}>
                <div>📊 Attendance: <strong>{form.attendance_pct}%</strong></div>
                <div>📝 Avg Mids: <strong>{((form.mid1_marks + form.mid2_marks) / 2).toFixed(1)}/30</strong></div>
                <div>🎓 GPA: <strong>{form.prev_sem_gpa}</strong></div>
                <div>📋 Backlogs: <strong>{form.backlog_count}</strong></div>
                <div>💰 Fees: <strong>{form.fee_status}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Predict Button */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ minWidth: '280px', fontSize: '1.05rem' }}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm"></span>
                Analyzing...
              </>
            ) : (
              '🔮 Predict Now'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
