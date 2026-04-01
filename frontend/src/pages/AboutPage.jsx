export default function AboutPage() {
  return (
    <div className="page">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Hero */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #1a6b6b 0%, #00897B 60%, #C8A8E9 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '48px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '180px', height: '180px',
            background: 'rgba(255,255,255,0.06)', borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px', fontWeight: 900,
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              ES
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>EduSense</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, fontStyle: 'italic' }}>
              Sensing academic trouble before it hits
            </p>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '8px' }}>
              VNRVJIET • CSBS Department • Mini Project
            </p>
          </div>
        </div>

        {/* About */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>📖 About the Project</h2>
          <p style={{ color: '#444', lineHeight: 1.8, fontSize: '0.92rem' }}>
            <strong>EduSense</strong> is an intelligent academic early-warning system designed for
            <strong> VNRVJIET</strong> that uses Machine Learning to predict student dropout risk
            and academic backlogs. The system analyzes academic performance metrics, attendance
            patterns, financial status, and mentoring engagement to provide personalized risk
            assessments and actionable recommendations.
          </p>
          <br />
          <p style={{ color: '#444', lineHeight: 1.8, fontSize: '0.92rem' }}>
            By identifying at-risk students early, institutions can intervene proactively — through
            mentoring, remedial classes, financial aid, or counseling — to improve student retention
            and academic outcomes.
          </p>
        </div>

        {/* Features */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>✨ Key Features</h2>
          <div className="grid-2" style={{ gap: '16px' }}>
            {[
              { icon: '📊', title: 'Data Upload', desc: 'Upload custom CSV data and train models instantly' },
              { icon: '🎯', title: 'Backlog Prediction', desc: 'Random Forest classifier for academic backlog risk' },
              { icon: '🚪', title: 'Dropout Prediction', desc: 'XGBoost/Gradient Boosting for dropout risk' },
              { icon: '💡', title: 'Smart Recommendations', desc: 'Personalized tips based on risk assessment' },
              { icon: '📈', title: 'Model Analytics', desc: 'Accuracy, F1 score, confusion matrix, feature importance' },
              { icon: '🎨', title: 'VNRVJIET Branded', desc: 'College-branded UI matching the official portal' },
            ].map((f, i) => (
              <div key={i} style={{
                padding: '16px',
                background: 'var(--bg-mint)',
                borderRadius: '12px',
                display: 'flex',
                gap: '12px'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a6b6b' }}>{f.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>🛠️ Technology Stack</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { name: 'React.js', color: '#61dafb' },
              { name: 'Vite', color: '#646cff' },
              { name: 'Python Flask', color: '#00897B' },
              { name: 'scikit-learn', color: '#f7931e' },
              { name: 'XGBoost', color: '#e91e8c' },
              { name: 'Pandas', color: '#150458' },
              { name: 'Recharts', color: '#29ABE2' },
            ].map((tech, i) => (
              <span key={i} style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: `${tech.color}15`,
                color: tech.color,
                border: `1.5px solid ${tech.color}40`,
              }}>
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>👥 Team Members</h2>
          <div className="grid-2" style={{ gap: '12px' }}>
            {[
              'Lokesh Vardhan',
              'Vashista',
              'Vinay Teja',
              'Veda N',
              'Purushottham',
            ].map((name, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--bg-mint)',
                borderRadius: '10px'
              }}>
                <div style={{
                  width: '38px', height: '38px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${COLORS[i]}, ${COLORS[(i + 1) % COLORS.length]})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.85rem', fontWeight: 700,
                }}>
                  {name.charAt(0)}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guide */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>🎓 Project Guide</h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, rgba(26,107,107,0.05), rgba(200,168,233,0.1))',
            borderRadius: '12px',
            border: '1px solid rgba(26,107,107,0.1)'
          }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a6b6b, #C8A8E9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.2rem', fontWeight: 700
            }}>
              K
            </div>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a6b6b' }}>
                Mrs. K. Bhagya Rekha
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#666' }}>CSBS Department, VNRVJIET</p>
            </div>
          </div>
        </div>

        {/* Footer tagline */}
        <p style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '0.85rem',
          color: '#999',
          fontStyle: 'italic',
        }}>
          ✨ EduSense — Sensing academic trouble before it hits ✨
        </p>
      </div>
    </div>
  );
}

const COLORS = ['#1a6b6b', '#00897B', '#29ABE2', '#E91E8C', '#C8A8E9'];
