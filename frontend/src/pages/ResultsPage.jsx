import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#1a6b6b', '#00897B', '#29ABE2', '#E91E8C', '#4CAF50', '#FFC107'];

// SVG Gauge Component
function RiskGauge({ level, confidence, label }) {
  const colorMap = {
    Low: '#4CAF50', Safe: '#4CAF50',
    Medium: '#FFC107', 'At Risk': '#FFC107',
    High: '#F44336', Critical: '#F44336',
  };
  const color = colorMap[level] || '#999';

  // Calculate dash offset for gauge (0-100 mapped to circle)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Background circle */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="10"
        />
        {/* Progress arc */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{
            transition: 'stroke-dashoffset 1.5s ease-out',
            animation: 'gaugeAnimation 1.5s ease-out'
          }}
        />
        {/* Center text */}
        <text x="70" y="62" textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>
          {confidence}%
        </text>
        <text x="70" y="82" textAnchor="middle" fontSize="11" fontWeight="600" fill="#666">
          Confidence
        </text>
      </svg>
      <p style={{ fontWeight: 700, color, fontSize: '1rem', marginTop: '4px' }}>{level}</p>
      <p style={{ fontSize: '0.78rem', color: '#999' }}>{label}</p>
    </div>
  );
}

export default function ResultsPage({ results }) {
  const navigate = useNavigate();

  if (!results) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}></div>
        <h2 style={{ color: '#1a6b6b', marginBottom: '8px' }}>No Predictions Yet</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>Run a prediction first to see results here.</p>
        <button className="btn btn-primary" onClick={() => navigate('/predict')}>
          Go to Predict Page
        </button>
      </div>
    );
  }

  const { backlog, dropout } = results;

  const renderFeatureChart = (contributions, title) => {
    if (!contributions) return null;
    const data = Object.entries(contributions)
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: +(value * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);

    return (
      <div>
        <h4 style={{ fontSize: '0.88rem', color: '#1a6b6b', marginBottom: '8px' }}>{title}</h4>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} layout="vertical" margin={{ left: 100, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const getRiskClass = (level) => {
    if (!level) return '';
    const l = level.toLowerCase();
    if (l === 'low' || l === 'safe') return 'risk-low';
    if (l === 'medium' || l === 'at risk') return 'risk-medium';
    return 'risk-high';
  };

  return (
    <div className="page">
      <h1 className="page-title">Prediction Results</h1>
      <p className="page-subtitle">Your personalized academic risk assessment</p>

      {/* Risk Gauges */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <div className="card animate-bounce-in" style={{ textAlign: 'center', padding: '36px' }}>
          <h3 style={{ fontSize: '1rem', color: '#1a6b6b', marginBottom: '20px', fontWeight: 700 }}>
            Backlog Risk
          </h3>
          {backlog && !backlog.error ? (
            <>
              <RiskGauge
                level={backlog.risk_level}
                confidence={backlog.confidence}
                label="Backlog Prediction"
              />
              <div className={`risk-badge ${getRiskClass(backlog.risk_level)}`} style={{ marginTop: '16px' }}>
                {backlog.risk_level} Risk
              </div>
              {/* Probability breakdown */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {backlog.probabilities && Object.entries(backlog.probabilities).map(([label, pct]) => (
                  <span key={label} className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                    {label}: {pct}%
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#999' }}>{backlog?.error || 'No data'}</p>
          )}
        </div>

        <div className="card animate-bounce-in" style={{ textAlign: 'center', padding: '36px', animationDelay: '0.2s' }}>
          <h3 style={{ fontSize: '1rem', color: '#1a6b6b', marginBottom: '20px', fontWeight: 700 }}>
            Dropout Risk
          </h3>
          {dropout && !dropout.error ? (
            <>
              <RiskGauge
                level={dropout.risk_level}
                confidence={dropout.confidence}
                label="Dropout Prediction"
              />
              <div className={`risk-badge ${getRiskClass(dropout.risk_level)}`} style={{ marginTop: '16px' }}>
                {dropout.risk_level}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {dropout.probabilities && Object.entries(dropout.probabilities).map(([label, pct]) => (
                  <span key={label} className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                    {label}: {pct}%
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#999' }}>{dropout?.error || 'No data'}</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {backlog?.recommendation && (
          <div className="card animate-fade-in-up">
            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>
              Backlog Recommendations
            </h3>
            <div className={`alert alert-${backlog.recommendation.color === 'green' ? 'success' : backlog.recommendation.color === 'orange' ? 'warning' : 'error'}`}>
              {backlog.recommendation.message}
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: '#444', lineHeight: 2 }}>
              {backlog.recommendation.tips?.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {dropout?.recommendation && (
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>
              Dropout Recommendations
            </h3>
            <div className={`alert alert-${dropout.recommendation.color === 'green' ? 'success' : dropout.recommendation.color === 'orange' ? 'warning' : 'error'}`}>
              {dropout.recommendation.message}
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: '#444', lineHeight: 2 }}>
              {dropout.recommendation.tips?.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Feature Contributions */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {backlog?.feature_contributions && (
          <div className="card">
            {renderFeatureChart(backlog.feature_contributions, 'Backlog — Feature Contributions')}
          </div>
        )}
        {dropout?.feature_contributions && (
          <div className="card">
            {renderFeatureChart(dropout.feature_contributions, 'Dropout — Feature Contributions')}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/predict')}>
          New Prediction
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {/* Footer */}
      <p style={{
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#999',
        marginTop: '40px',
        fontStyle: 'italic'
      }}>
        Powered by VNRVJIET CSBS Department — EduSense
      </p>
    </div>
  );
}
