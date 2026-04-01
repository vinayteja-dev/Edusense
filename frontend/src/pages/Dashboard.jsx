import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent } from '../api';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await getStudent(user.roll_number || user.username);
        if (res.data.success) {
          setStudentData(res.data.student);
        }
      } catch {
        // Student might not be in uploaded data
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [user]);

  const getRiskBadgeClass = (risk) => {
    if (!risk) return 'badge badge-blue';
    const r = risk.toLowerCase();
    if (r === 'low' || r === 'safe') return 'risk-badge risk-low';
    if (r === 'medium' || r === 'at risk') return 'risk-badge risk-medium';
    return 'risk-badge risk-high';
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const attendance = studentData?.attendance_pct || 0;
  const gpa = studentData?.prev_sem_gpa || 0;
  const backlogs = studentData?.backlog_count || 0;
  const mid1 = studentData?.mid1_marks || 0;
  const mid2 = studentData?.mid2_marks || 0;

  return (
    <div className="page">
      {/* Welcome Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1a6b6b 0%, #00897B 60%, #C8A8E9 100%)',
        color: 'white',
        marginBottom: '28px',
        padding: '36px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px',
          background: 'rgba(255,255,255,0.08)', borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute', bottom: '-50px', right: '60px', width: '200px', height: '200px',
          background: 'rgba(200,168,233,0.1)', borderRadius: '50%'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Welcome back,</p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>
            {user.name || user.username}
          </h1>
          <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
            Roll No: {user.roll_number || user.username} • VNRVJIET CSE
          </p>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-tile stat-tile-blue animate-fade-in-up" style={{ animationDelay: '0s' }}>
          <div className="stat-tile-label">Attendance</div>
          <div className="stat-tile-value">{attendance}%</div>
          <div className="stat-tile-sub">{attendance >= 75 ? '✅ Above threshold' : '⚠️ Below 75%'}</div>
        </div>
        <div className="stat-tile stat-tile-teal animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="stat-tile-label">Current GPA</div>
          <div className="stat-tile-value">{gpa}</div>
          <div className="stat-tile-sub">Previous Semester</div>
        </div>
        <div className="stat-tile stat-tile-orange animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="stat-tile-label">Backlogs</div>
          <div className="stat-tile-value">{backlogs}</div>
          <div className="stat-tile-sub">{backlogs === 0 ? '🎉 No backlogs!' : `${backlogs} subject${backlogs > 1 ? 's' : ''}`}</div>
        </div>
        <div className="stat-tile stat-tile-pink animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="stat-tile-label">Avg Mid Marks</div>
          <div className="stat-tile-value">{((parseFloat(mid1) + parseFloat(mid2)) / 2).toFixed(1)}</div>
          <div className="stat-tile-sub">Out of 30</div>
        </div>
      </div>

      {/* Risk Badges Row */}
      {studentData && (
        <div className="grid-2" style={{ marginBottom: '28px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px', fontWeight: 600 }}>
              📚 Backlog Risk
            </h3>
            <div className={getRiskBadgeClass(studentData?.backlog_risk)}>
              {studentData?.backlog_risk || 'N/A'}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px', fontWeight: 600 }}>
              🚪 Dropout Risk
            </h3>
            <div className={getRiskBadgeClass(studentData?.dropout_risk)}>
              {studentData?.dropout_risk || 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">⚡ Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-blue" onClick={() => navigate('/predict')}>
            🔮 Get Prediction
          </button>
          <button className="btn btn-pink" onClick={() => navigate('/about')}>
            ℹ️ About EduSense
          </button>
        </div>
      </div>

      {!studentData && (
        <div className="alert alert-warning" style={{ marginTop: '20px' }}>
          ⚠️ Your data wasn't found in the uploaded dataset. You can still use the Predict page to get manual predictions.
        </div>
      )}
    </div>
  );
}
