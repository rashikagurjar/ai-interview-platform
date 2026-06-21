import React from 'react';
import { ProfileTemplate, UserResponse, Telemetry, TelemetryLog } from '@/types/interview';
import { AvatarController } from './interview/AvatarController';

interface InterviewSectionProps {
  parsedProfile: ProfileTemplate | null;
  currentQuestionIndex: number;
  userResponses: UserResponse[];
  userInput: string;
  setUserInput: (input: string) => void;
  isMicActive: boolean;
  onMicToggle: () => void;
  onSubmitResponse: () => void;
  telemetry: Telemetry;
  telemetryLogs: TelemetryLog[];
  chatHistoryRef: React.RefObject<HTMLDivElement | null>;
  telemetryLogsRef: React.RefObject<HTMLDivElement | null>;
  // IDE State & Handlers
  activeLanguage: 'js' | 'py' | 'cpp';
  onLanguageTabClick: (lang: 'js' | 'py' | 'cpp') => void;
  ideCode: string;
  setIdeCode: (code: string) => void;
  ideTerminalStatus: string;
  ideTerminalColor: string;
  ideConsoleOutput: string;
  onIdeReset: () => void;
  onIdeRun: () => void;
  isFetchingNextQuestion: boolean;
  isRunningCode: boolean;
  isEvaluating: boolean;
}

export const InterviewSection: React.FC<InterviewSectionProps> = ({
  parsedProfile,
  currentQuestionIndex,
  userResponses,
  userInput,
  setUserInput,
  isMicActive,
  onMicToggle,
  onSubmitResponse,
  telemetry,
  telemetryLogs,
  chatHistoryRef,
  telemetryLogsRef,
  activeLanguage,
  onLanguageTabClick,
  ideCode,
  setIdeCode,
  ideTerminalStatus,
  ideTerminalColor,
  ideConsoleOutput,
  onIdeReset,
  onIdeRun,
  isFetchingNextQuestion,
  isRunningCode,
  isEvaluating,
}) => {
  const activeQuestion = parsedProfile?.questions[currentQuestionIndex];

  return (
    <div className={`interview-layout ${activeQuestion?.type === 'coding' ? 'split-mode' : ''}`}>
      
      {/* Column A: AI Stage & Conversation Dialogue */}
      <div className="stage-column">
        
        {/* Holographic AI Interviewer Avatar */}
        <AvatarController
          parsedProfile={parsedProfile}
          currentQuestionIndex={currentQuestionIndex}
          isMicActive={isMicActive}
          isFetchingNextQuestion={isFetchingNextQuestion}
          isRunningCode={isRunningCode}
          isEvaluating={isEvaluating}
          ideTerminalStatus={ideTerminalStatus}
        />

        {/* Live Dialog Window */}
        <div className="dialogue-panel glass-panel">
          <div className="dialogue-history" ref={chatHistoryRef}>
            {parsedProfile && parsedProfile.questions.slice(0, currentQuestionIndex + 1).map((q, idx) => {
              const candidateRes = userResponses[idx];
              return (
                <React.Fragment key={idx}>
                  <div className="msg-wrapper bot">
                    <span className="msg-header">AeroAssess Agent</span>
                    <div className="msg-body">{q.question}</div>
                  </div>
                  {candidateRes && (
                    <div className="msg-wrapper candidate">
                      <span className="msg-header">Candidate</span>
                      <div className="msg-body" dangerouslySetInnerHTML={{ __html: candidateRes.response.replace(/\n/g, '<br>') }}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="dialogue-input-area">
            <div className="input-box-wrapper">
              <textarea 
                className="input-textarea" 
                placeholder={activeQuestion?.type === 'coding' ? "Explain your algorithmic bounds or click the arrow button to submit standard code output..." : "Type your engineering rationale or answer here..."}
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  e.target.style.height = '48px';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmitResponse();
                  }
                }}
              />
              
              <button 
                className={`speech-toggle-btn ${isMicActive ? 'active' : ''}`} 
                title="Simulate speech-to-text input"
                onClick={onMicToggle}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>
              
              <button className="send-btn" onClick={onSubmitResponse}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>

            <div className="input-meta-indicator">
              <div className="indicator-left">
                <span className="indicator-bullet"></span>
                <span>{isMicActive ? 'Listening: speak clearly...' : 'Keyboard mode active'}</span>
              </div>
              <span>
                {currentQuestionIndex === 0 && 'Round 1/4 (Behavioral Core)'}
                {currentQuestionIndex === 1 && 'Round 2/4 (System Architectural Design)'}
                {currentQuestionIndex === 2 && 'Round 3/4 (Algorithmic IDE assessment)'}
                {currentQuestionIndex === 3 && 'Round 4/4 (Technical Wrap-up)'}
              </span>
            </div>
          </div>
        </div>

        {/* Optimization Telemetry Feed */}
        <div className="telemetry-board glass-panel">
          <div className="telemetry-header">
            <span>Optimization Engine Logs</span>
            <span style={{ color: 'var(--accent-cyan)' }}>TOKEN SAVER: ACTIVE</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="telemetry-row">
              <span className="telemetry-label">Prompt Cache Hits:</span>
              <span className="telemetry-value success">{telemetry.cacheHits}</span>
            </div>
            <div className="telemetry-row">
              <span className="telemetry-label">Context Summarizer:</span>
              <span className="telemetry-value alert">{telemetry.summarizeCompress}x</span>
            </div>
            <div className="telemetry-row">
              <span className="telemetry-label">RAG Vector Queries:</span>
              <span className="telemetry-value">{telemetry.ragQueries}</span>
            </div>
            <div className="telemetry-row">
              <span className="telemetry-label">Saved Overhead API:</span>
              <span className="telemetry-value success">${telemetry.costSaved.toFixed(2)}</span>
            </div>
          </div>

          {/* Terminal style logs scroll */}
          <div className="telemetry-logs-scroll" ref={telemetryLogsRef}>
            {telemetryLogs.map((log) => (
              <span 
                style={{ 
                  color: log.module === 'RAG' 
                    ? 'var(--accent-cyan)' 
                    : (log.module === 'CACHE' ? 'var(--accent-purple)' : 'var(--text-dim)') 
                }} 
                key={log.id}
              >
                [{log.time}] [{log.module}] {log.message}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Column B: Code IDE Workspace (hidden by default, shows in Coding assessing) */}
      <div className="code-workspace-panel glass-panel">
        <div className="editor-header">
          <div className="editor-title">
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>&lt;/&gt;</span>
            <span>Coding Task: Array Intersect Optimizer</span>
          </div>
          <div className="editor-tabs">
            <button 
              className={`editor-tab-btn ${activeLanguage === 'js' ? 'active' : ''}`}
              onClick={() => onLanguageTabClick('js')}
            >
              JavaScript
            </button>
            <button 
              className={`editor-tab-btn ${activeLanguage === 'py' ? 'active' : ''}`}
              onClick={() => onLanguageTabClick('py')}
            >
              Python
            </button>
            <button 
              className={`editor-tab-btn ${activeLanguage === 'cpp' ? 'active' : ''}`}
              onClick={() => onLanguageTabClick('cpp')}
            >
              C++
            </button>
          </div>
        </div>

        {/* Custom Code Editor Core */}
        <div className="editor-body">
          <div className="editor-line-numbers">
            {Array.from({ length: ideCode.split('\n').length || 1 }).map((_, idx) => (
              <React.Fragment key={idx}>{idx + 1}<br /></React.Fragment>
            ))}
          </div>
          <textarea 
            className="editor-textarea" 
            spellCheck="false"
            value={ideCode}
            onChange={(e) => setIdeCode(e.target.value)}
          />
        </div>

        {/* Terminal output window */}
        <div className="terminal-panel">
          <div className="terminal-header">
            <span>Execution Output Terminal</span>
            <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', color: ideTerminalColor }}>{ideTerminalStatus}</span>
          </div>
          <div 
            className="terminal-console-output"
            dangerouslySetInnerHTML={{ __html: ideConsoleOutput.replace(/\n/g, '<br>') }}
          />
          <div className="terminal-footer">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Verification logs active</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-pill" style={{ padding: '0.35rem 1rem', fontSize: '0.8rem' }} onClick={onIdeReset}>Reset Code</button>
              <button className="btn btn-accent btn-pill" style={{ padding: '0.35rem 1.25rem', fontSize: '0.8rem' }} onClick={onIdeRun}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Run Code & Verify
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
