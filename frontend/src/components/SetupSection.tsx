import React, { useState, useRef } from 'react';
import { ProfileTemplate } from '@/types/interview';

interface SetupSectionProps {
  selectedPreset: string;
  setSelectedPreset: (preset: string) => void;
  isAnalyzing: boolean;
  analysisText: { header: string; desc: string };
  parsedProfile: ProfileTemplate | null;
  cacheHitRatio: string;
  onRunRAGAnalysis: (presetId: string, file?: File) => void;
  onLaunchConsole: () => void;
  onLogTelemetry: (module: string, message: string) => void;
}

export const SetupSection: React.FC<SetupSectionProps> = ({
  selectedPreset,
  setSelectedPreset,
  isAnalyzing,
  analysisText,
  parsedProfile,
  cacheHitRatio,
  onRunRAGAnalysis,
  onLaunchConsole,
  onLogTelemetry,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUploadedResume(files[0]);
    }
  };

  const triggerUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadedResume(files[0]);
    }
  };

  const handleUploadedResume = (file: File) => {
    onLogTelemetry('RAG', `Analyzing file stream: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
    onRunRAGAnalysis(selectedPreset, file);
  };

  return (
    <div className="setup-layout">
      <div className="setup-panel glass-panel">
        <div className="section-intro">
          <h2>Candidate Briefing Room</h2>
          <p>
            Tailor your interview focus. Upload your CV/resume or select one of our curated 
            high-profile engineering templates to feed the vector agent RAG compiler.
          </p>
        </div>

        {/* Upload CV Drag & Drop Area */}
        <div 
          className={`upload-area ${isDragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerUploadClick}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="file-input-hidden" 
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
          />
          <div className="upload-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <p>Drag and drop your engineering resume here</p>
          <span>Supports PDF, DOCX, TXT (Max 5MB)</span>
        </div>

        <div className="or-divider">Or Select Simulation Profile</div>

        {/* Preset Profiles */}
        <div className="preset-container">
          <div 
            className={`preset-card ${selectedPreset === 'frontend' ? 'selected' : ''}`}
            onClick={() => { 
              setSelectedPreset('frontend'); 
              onLogTelemetry('SYS', 'Synthesizer target updated: profile changed to "frontend".'); 
            }}
          >
            <div className="preset-badge">JS</div>
            <div className="preset-info">
              <h5>Senior Frontend UI Architect</h5>
              <p>React/Next.js core, design systems, CSS architecture, browser reflow optimizations</p>
            </div>
          </div>

          <div 
            className={`preset-card ${selectedPreset === 'backend' ? 'selected' : ''}`}
            onClick={() => { 
              setSelectedPreset('backend'); 
              onLogTelemetry('SYS', 'Synthesizer target updated: profile changed to "backend".'); 
            }}
          >
            <div className="preset-badge">PY</div>
            <div className="preset-info">
              <h5>Distributed Systems Backend Engineer</h5>
              <p>Python/Go, microservices, dynamic scaling, key-value stores, database partitioning</p>
            </div>
          </div>

          <div 
            className={`preset-card ${selectedPreset === 'fullstack' ? 'selected' : ''}`}
            onClick={() => { 
              setSelectedPreset('fullstack'); 
              onLogTelemetry('SYS', 'Synthesizer target updated: profile changed to "fullstack".'); 
            }}
          >
            <div className="preset-badge">TS</div>
            <div className="preset-info">
              <h5>Full-Stack Product Developer</h5>
              <p>Node.js, Postgres, state management, REST/GraphQL design, API caching</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => onRunRAGAnalysis(selectedPreset)}>
            Analyze and Synthesize
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Right Analysis Panel */}
      <div className="profile-room glass-panel">
        {/* Default Loading Room Spinner */}
        {(!parsedProfile || isAnalyzing) && (
          <div className="analysis-loader">
            <div className="scanner-box"></div>
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>{analysisText.header}</h3>
              <p>{analysisText.desc}</p>
            </div>
          </div>
        )}

        {/* Profile Summary (revealed post analysis) */}
        {parsedProfile && !isAnalyzing && (
          <div className="profile-summary-view visible">
            <div className="profile-header">
              <div className="profile-avatar-large">{parsedProfile.char}</div>
              <div className="profile-meta-title">
                <h3>{parsedProfile.title}</h3>
                <span>{parsedProfile.level}</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Identified Core Competencies</h4>
              <div className="tag-cloud">
                {parsedProfile.skills.map((skill, idx) => (
                  <span className="skill-tag" key={idx}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="syllabus-box">
              <h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Custom Synthesis Syllabus
              </h4>
              <div className="syllabus-list">
                {parsedProfile.syllabus.map((item, idx) => (
                  <div className="syllabus-item" key={idx}>{item}</div>
                ))}
              </div>
            </div>

            {/* Optimization telemetry widget */}
            <div className="optimization-mini-panel">
              <div className="opt-details">
                <div className="opt-title">Vector Database Indexing</div>
                <div className="opt-desc">Simulated RAG chunking and context node extraction complete</div>
              </div>
              <div className="opt-stat">
                <div className="opt-stat-val">{cacheHitRatio}</div>
                <div className="opt-stat-lbl">Cache Hit Rate</div>
              </div>
            </div>

            <button className="btn btn-accent" style={{ width: '100%' }} onClick={onLaunchConsole}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
              </svg>
              Launch Immersive Interview Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
