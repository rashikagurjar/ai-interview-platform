import React from 'react';
import { simulationHistory } from '@/types/interview';

interface DashboardSectionProps {
  onEnterBriefingRoom: () => void;
  onQuickSelectTrack: (presetId: string) => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  onEnterBriefingRoom,
  onQuickSelectTrack,
}) => {
  return (
    <>
      {/* Hero Welcome Panel */}
      <div className="hero-banner glass-panel">
        <div className="hero-text">
          <h1>Refine Your Engineering Practice on Simulated AI Agent Core</h1>
          <p>
            Experience the closest high-fidelity simulation of modern technical interviews. 
            AeroAssess tailors behavioral, system architectural, and live code assessments to 
            your exact profile, powered by adaptive vector-cached agent engines.
          </p>
          <button className="btn btn-accent" onClick={onEnterBriefingRoom}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Enter Briefing Room
          </button>
        </div>
        <div className="hero-visual">
          <div className="hologram-sphere">
            <div className="hologram-ring"></div>
          </div>
        </div>
      </div>

      {/* Telemetry Stats Cards */}
      <div className="dashboard-grid">
        <div className="stat-card glass-panel glass-panel-hover">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">4</span>
            <span className="stat-label">Simulations Taken</span>
          </div>
        </div>

        <div className="stat-card glass-panel glass-panel-hover">
          <div className="stat-icon" style={{ color: 'var(--accent-purple)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">82%</span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>

        <div className="stat-card glass-panel glass-panel-hover">
          <div className="stat-icon" style={{ color: 'var(--accent-magenta)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">Frontend System</span>
            <span className="stat-label">Top Competency</span>
          </div>
        </div>

        <div className="stat-card glass-panel glass-panel-hover">
          <div className="stat-icon" style={{ color: 'var(--accent-green)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">$48.70</span>
            <span className="stat-label">Estimated Token Saving</span>
          </div>
        </div>
      </div>

      {/* Dashboard Body Row */}
      <div className="dash-row">
        <div className="recent-interviews glass-panel">
          <div className="row-header">
            <h3 className="row-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Recent Simulation History
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Live Cache Logs Active</span>
          </div>
          <div className="history-list">
            {simulationHistory.map((item, idx) => (
              <div className="history-item" key={idx}>
                <div className="history-details">
                  <div className="history-avatar">{item.role.substring(0, 2).toUpperCase()}</div>
                  <div className="history-meta">
                    <h4>{item.role}</h4>
                    <span>Completed {item.date}</span>
                  </div>
                </div>
                <div className="history-grade">
                  <span className="badge-score">{item.grade}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>{item.scoreClass}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-interviews glass-panel" style={{ minHeight: 'auto' }}>
          <div className="row-header">
            <h3 className="row-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="9" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="15" x2="21" y2="15"></line>
              </svg>
              Pre-Configured Tracks
            </h3>
          </div>
          <div className="interview-roles-grid">
            <div className="role-select-card" onClick={() => onQuickSelectTrack('frontend')}>
              <div className="role-info">
                <h4>Senior React Architect</h4>
                <p>System Design, CSS Engines, Coding assessment</p>
              </div>
              <div className="role-arrow">→</div>
            </div>
            <div className="role-select-card" onClick={() => onQuickSelectTrack('backend')}>
              <div className="role-info">
                <h4>Cloud Database Engineer</h4>
                <p>Distributed locks, SQL schemas, Coding assessment</p>
              </div>
              <div className="role-arrow">→</div>
            </div>
            <div className="role-select-card" onClick={() => onQuickSelectTrack('fullstack')}>
              <div className="role-info">
                <h4>Full-Stack Product Developer</h4>
                <p>Node.js, Postgres, state management, REST/GraphQL design</p>
              </div>
              <div className="role-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
