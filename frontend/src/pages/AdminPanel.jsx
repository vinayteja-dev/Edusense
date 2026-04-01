import { useState, useRef } from 'react';
import { uploadData, trainModels, getModelStats } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#1a6b6b', '#00897B', '#29ABE2', '#E91E8C', '#4CAF50', '#FFC107'];

export default function AdminPanel() {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }
    setError('');
    setUploadResult(null);
    setTrainResult(null);

    try {
      const res = await uploadData(file);
      if (res.data.success) {
        setUploadResult(res.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleTrain = async () => {
    setTraining(true);
    setError('');
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 8, 90));
    }, 300);

    try {
      const res = await trainModels();
      clearInterval(progressInterval);
      setProgress(100);

      if (res.data.status === 'complete') {
        setTrainResult(res.data.results);
      } else if (res.data.status === 'error') {
        setError(res.data.message);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.response?.data?.message || 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  const renderConfusionMatrix = (matrix, labels, title) => {
    if (!matrix || !labels) return null;
    return (
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#1a6b6b' }}>{title}</h4>
        <table className="data-table" style={{ maxWidth: '360px' }}>
          <thead>
            <tr>
              <th>Actual \ Predicted</th>
              {labels.map(l => <th key={l}>{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{labels[i]}</td>
                {row.map((val, j) => (
                  <td key={j} style={{
                    background: i === j
                      ? 'rgba(76, 175, 80, 0.15)'
                      : val > 0 ? 'rgba(244, 67, 54, 0.08)' : 'transparent',
                    fontWeight: i === j ? 700 : 400,
                    textAlign: 'center'
                  }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFeatureImportance = (importance, title) => {
    if (!importance) return null;
    const data = Object.entries(importance)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value: +(value * 100).toFixed(1) }))
      .sort((a, b) => b.value - a.value);

    return (
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#1a6b6b' }}>{title}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
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

  return (
    <div className="page">
      <h1 className="page-title">📊 Admin Panel</h1>
      <p className="page-subtitle">Upload student data and train prediction models</p>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Upload Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2 className="card-title">📁 Upload Student Data (CSV)</h2>
        </div>

        <div
          className={`upload-area ${dragOver ? 'dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <div className="upload-icon">📄</div>
          <p className="upload-text">Drag & drop your CSV file here</p>
          <p className="upload-hint">or click to browse • Accepts .csv files</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {uploadResult && (
          <div className="animate-fade-in-up" style={{ marginTop: '24px' }}>
            <div className="alert alert-success">
              ✅ {uploadResult.message}
            </div>

            {/* Column match status */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span className="badge badge-green">
                ✓ {uploadResult.matched_columns?.length || 0} columns matched
              </span>
              {uploadResult.unmatched_columns?.length > 0 && (
                <span className="badge badge-orange">
                  ⚠ {uploadResult.unmatched_columns.length} unmapped: {uploadResult.unmatched_columns.join(', ')}
                </span>
              )}
            </div>

            {/* Data Preview */}
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#1a6b6b' }}>
              Data Preview (First 10 rows)
            </h3>
            <div style={{ overflowX: 'auto', borderRadius: '8px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {uploadResult.columns?.map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadResult.preview?.map((row, i) => (
                    <tr key={i}>
                      {uploadResult.columns?.map(col => (
                        <td key={col}>{String(row[col] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Column Info */}
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '20px 0 12px', color: '#1a6b6b' }}>
              Column Summary
            </h3>
            <div style={{ overflowX: 'auto', borderRadius: '8px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Nulls</th>
                    <th>Unique</th>
                    <th>Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResult.column_info?.map((col, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{col.name}</td>
                      <td><span className="badge badge-blue">{col.dtype}</span></td>
                      <td>{col.null_count}</td>
                      <td>{col.unique_count}</td>
                      <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.sample}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Train Button */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                className="btn btn-green btn-lg"
                onClick={handleTrain}
                disabled={training}
                style={{ minWidth: '240px' }}
              >
                {training ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    Training Models...
                  </>
                ) : (
                  '🚀 Train Models Now'
                )}
              </button>
            </div>

            {training && (
              <div style={{ marginTop: '16px' }}>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#666' }}>
                  Training in progress... {progress}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Training Results */}
      {trainResult && (
        <div className="animate-fade-in-up">
          <div className="alert alert-success" style={{ marginBottom: '24px' }}>
            🎉 Models trained successfully!
          </div>

          <div className="grid-2">
            {/* Backlog Model */}
            {trainResult.backlog && !trainResult.backlog.error && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">🎯 Backlog Predictor</h3>
                  <span className="badge badge-blue">Random Forest</span>
                </div>
                <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
                  <div className="stat-tile stat-tile-green" style={{ padding: '16px' }}>
                    <div className="stat-tile-label">Accuracy</div>
                    <div className="stat-tile-value" style={{ fontSize: '1.5rem' }}>
                      {trainResult.backlog.accuracy}%
                    </div>
                  </div>
                  <div className="stat-tile stat-tile-blue" style={{ padding: '16px' }}>
                    <div className="stat-tile-label">F1 Score</div>
                    <div className="stat-tile-value" style={{ fontSize: '1.5rem' }}>
                      {trainResult.backlog.f1_score}%
                    </div>
                  </div>
                </div>
                {renderConfusionMatrix(
                  trainResult.backlog.confusion_matrix,
                  trainResult.backlog.labels,
                  'Confusion Matrix'
                )}
                {renderFeatureImportance(
                  trainResult.backlog.feature_importance,
                  'Feature Importance'
                )}
              </div>
            )}

            {/* Dropout Model */}
            {trainResult.dropout && !trainResult.dropout.error && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">🚪 Dropout Predictor</h3>
                  <span className="badge badge-purple">XGBoost</span>
                </div>
                <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
                  <div className="stat-tile stat-tile-green" style={{ padding: '16px' }}>
                    <div className="stat-tile-label">Accuracy</div>
                    <div className="stat-tile-value" style={{ fontSize: '1.5rem' }}>
                      {trainResult.dropout.accuracy}%
                    </div>
                  </div>
                  <div className="stat-tile stat-tile-blue" style={{ padding: '16px' }}>
                    <div className="stat-tile-label">F1 Score</div>
                    <div className="stat-tile-value" style={{ fontSize: '1.5rem' }}>
                      {trainResult.dropout.f1_score}%
                    </div>
                  </div>
                </div>
                {renderConfusionMatrix(
                  trainResult.dropout.confusion_matrix,
                  trainResult.dropout.labels,
                  'Confusion Matrix'
                )}
                {renderFeatureImportance(
                  trainResult.dropout.feature_importance,
                  'Feature Importance'
                )}
              </div>
            )}
          </div>

          {/* Download Button */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <a
              href="http://localhost:5000/api/download-data"
              className="btn btn-outline"
              download
            >
              📥 Download Processed Dataset
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
