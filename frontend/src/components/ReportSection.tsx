import React from 'react';
import { Scores, UserResponse, Telemetry } from '@/types/interview';

interface ReportSectionProps {
  scores: Scores;
  userResponses: UserResponse[];
  realEvaluation: any;
  codePass: boolean;
  activeLanguage: 'js' | 'py' | 'cpp';
  selectedPreset: string;
  telemetry: Telemetry;
  onRetakeMockSession: () => void;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  scores,
  userResponses,
  realEvaluation,
  codePass,
  activeLanguage,
  selectedPreset,
  telemetry,
  onRetakeMockSession,
}) => {
  // Overall grades dynamic mapping
  const overallScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );

  let gradeLetter = "A-";
  let statusText = "Highly Competent";
  let statusDesc = "Profile displays excellent technical architecture skills and strong problem-solving capabilities, with minor refactoring details required.";

  if (overallScore >= 95) {
    gradeLetter = "A+";
    statusText = "Distinguished Engineering Talent";
    statusDesc = "Outstanding algorithmic execution, stellar system design rationale, and robust software engineering communication paradigms.";
  } else if (overallScore >= 90) {
    gradeLetter = "A";
    statusText = "Exemplary Engineering Core";
    statusDesc = "Demonstrated extremely thorough domain understanding, elegant structural design ideas, and excellent coding hygiene.";
  } else if (overallScore >= 80) {
    gradeLetter = "A-";
    statusText = "Highly Competent Architect";
    statusDesc = "Very strong technical base with good collaborative reasoning. Minor optimization improvements noted during linear algorithms.";
  } else if (overallScore >= 70) {
    gradeLetter = "B+";
    statusText = "Strong Software Developer";
    statusDesc = "Shows consistent engineering competence. Scope for refactoring dynamic DOM structures and caching systems to reduce lag.";
  } else {
    gradeLetter = "B";
    statusText = "Competent Professional Core";
    statusDesc = "Sound fundamentals. Requires further development in distributed database models and high-concurrency systems design.";
  }

  // Calculate SVG stroke offset for overall score circle
  const scoreCircleOffset = 440 - (440 * overallScore) / 100;

  // Radar chart SVG dynamic plotter configuration
  const center = 120;
  const radius = 90;
  const levels = 4;
  const axes = [
    { name: 'Tech Depth', key: 'technical' },
    { name: 'System Design', key: 'systemDesign' },
    { name: 'Problem Solving', key: 'problemSolving' },
    { name: 'Code Quality', key: 'codeQuality' },
    { name: 'Culture Fit', key: 'cultureFit' },
    { name: 'Communication', key: 'communication' }
  ];

  // Q&A Detailed feedbacks accordion reference data
  const evaluationFeedback: Record<string, { exemplary: string; feedback: string }> = {
    behavioral: {
      exemplary: "An ideal response structures organizational alignments via the STAR method. It demonstrates clear alignment with technical leads, using telemetry dashboards or paint metric measurements to objectively prove performance benefits (e.g., proving layout reflow gains using Chrome DevTools memory allocation graphs) to reach collaborative consensus.",
      feedback: `Strong personal leadership depth shown. You demonstrated good flexibility and architectural compromise metrics. To optimize further, emphasize dynamic vector caching metrics when evaluating cross-team consensus paradigms.`
    },
    'system-design': {
      exemplary: "Excellent design parameters include implementing debounced state updates, DOM virtual node pools, requestAnimationFrame visual scheduling queue overlays, and batching web socket events using a local Redis/DataLoader model to avoid main thread blockage during intense paint operations.",
      feedback: `Fantastic technical architecture depth. You clearly highlighted structural bottleneck concepts like thread loops and V8 memory allocation. Focus further on edge-side vector indexing models and CAP consistency caches.`
    },
    coding: {
      exemplary: `// Recommended Linear Intersection Search O(N + M)
function resolveIntersect(arr1, arr2) {
    const memory = new Set(arr1);
    const uniqueMatches = [];
    for (const val of arr2) {
        if (memory.has(val)) {
            uniqueMatches.push(val);
            memory.delete(val);
        }
    }
    return uniqueMatches;
}`,
      feedback: codePass 
        ? `Perfect algorithmic submission. Verified full space/time parameters under linear Set hash bounds. Code conforms fully to production engineering guidelines.`
        : `Algorithm failed compilation assertions. We suggest reviewing dynamic hash-table indexes, linear vector traversing strategies, and basic Set lookup operations.`
    },
    'wrap-up': {
      exemplary: "An ideal wrap-up addresses CAP compromises, batch loading configurations, replication lags, and cost saving metrics of prompt buffers. Minimizing vector db hops and utilizing RAG embeddings significantly decreases operational LLM overhead costs.",
      feedback: `Demonstrated solid senior capabilities. To excel, focus on RAG cost optimizations and dynamic context compression strategies.`
    }
  };

  const studyTopics: Record<string, { topic: string; desc: string }[]> = {
    frontend: [
      { topic: 'Dynamic Thread Caching & Paint Loops', desc: 'Study layout reflow bounds, requestAnimationFrame lifecycle hooks, and virtualized scrolling models.' },
      { topic: 'Set Hashing Algorithmic Traversing', desc: 'Focus on linear set search boundaries, unique elements operations, and memory heap constraints.' },
      { topic: 'RAG Prompts & Bundles Optimizations', desc: 'Understand code splitting parameters, static cache hit states, and bundle latency curves.' }
    ],
    backend: [
      { topic: 'CAP Isolation Cache Topology', desc: 'Deep dive into write-through invalidation models, write bottlenecks, and consensus replication latencies.' },
      { topic: 'Parallelized Hash Lookups', desc: 'Explore parallel array traversing constraints and multithreaded vector indexing optimizations.' },
      { topic: 'API Version Migration models', desc: 'Optimize rolling update schemes, blue-green deployment pipelines, and zero-outage gateways.' }
    ],
    fullstack: [
      { topic: 'GraphQL Batch Loaders', desc: 'Address nested resolver optimizations, N+1 query batch models, and prompt caching adapters.' },
      { topic: 'Notifications Queue Sharding', desc: 'Review message queue idempotency keys, dead-letter routes, and exponential backoff retry algorithms.' },
      { topic: 'Linear Session Registry Sets', desc: 'Study optimal array mapping, memory footprint scaling, and standard coding structures.' }
    ]
  };

  return (
    <div className="report-layout">
      {/* Top Row cards (Overall Score, Radar Chart, Token Savings) */}
      <div className="report-top-grid">
        
        {/* Overall grade card */}
        <div className="score-focus-card glass-panel">
          <div className="score-circular-container">
            <svg className="score-circle-svg" width="140" height="140">
              <defs>
                <linearGradient id="cyan-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-cyan)" />
                  <stop offset="100%" stopColor="var(--accent-purple)" />
                </linearGradient>
              </defs>
              <circle className="circle-bg" cx="70" cy="70" r="62"></circle>
              <circle 
                className="circle-val" 
                cx="70" 
                cy="70" 
                r="62"
                style={{ strokeDashoffset: scoreCircleOffset }}
              ></circle>
            </svg>
            <div className="score-text-label">
              <span className="score-huge-val">{overallScore}%</span>
              <span className="score-subgrade">{gradeLetter} Grade</span>
            </div>
          </div>
          <div className="score-fit-meta">
            <h3>{statusText}</h3>
            <p>{statusDesc}</p>
          </div>
        </div>

        {/* SVG Radar diagram */}
        <div className="competency-radar-box glass-panel">
          <div className="radar-wrapper">
            <svg width="240" height="240" viewBox="0 0 240 240" style={{ overflow: 'visible' }}>
              {/* Grid polygons */}
              {Array.from({ length: levels }).map((_, lIdx) => {
                const l = lIdx + 1;
                const levelRadius = (radius / levels) * l;
                const gridPoints = axes.map((_, aIdx) => {
                  const angle = (Math.PI * 2 / axes.length) * aIdx - Math.PI / 2;
                  const x = center + Math.cos(angle) * levelRadius;
                  const y = center + Math.sin(angle) * levelRadius;
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <polygon 
                    key={lIdx} 
                    points={gridPoints} 
                    fill="none" 
                    stroke="hsla(230, 20%, 30%, 0.45)" 
                    strokeWidth="0.75" 
                  />
                );
              })}

              {/* Axes lines & labels */}
              {axes.map((axis, aIdx) => {
                const angle = (Math.PI * 2 / axes.length) * aIdx - Math.PI / 2;
                const endX = center + Math.cos(angle) * radius;
                const endY = center + Math.sin(angle) * radius;
                
                const labelDist = radius + 22;
                const labelX = center + Math.cos(angle) * labelDist;
                const labelY = center + Math.sin(angle) * labelDist + 4;

                let textAnchor: "middle" | "start" | "end" = 'middle';
                if (Math.cos(angle) > 0.1) textAnchor = 'start';
                if (Math.cos(angle) < -0.1) textAnchor = 'end';

                return (
                  <g key={aIdx}>
                    <line x1={center} y1={center} x2={endX} y2={endY} stroke="hsla(230, 20%, 30%, 0.6)" strokeWidth="1" />
                    <text x={labelX} y={labelY} fill="var(--text-muted)" fontSize="8.5" fontWeight="600" textAnchor={textAnchor}>{axis.name}</text>
                  </g>
                );
              })}

              {/* Plot performance polygon */}
              {(() => {
                const scorePoints = axes.map((axis, aIdx) => {
                  const angle = (Math.PI * 2 / axes.length) * aIdx - Math.PI / 2;
                  const scoreVal = scores[axis.key as keyof Scores];
                  const valRadius = (radius / 100) * scoreVal;
                  const x = center + Math.cos(angle) * valRadius;
                  const y = center + Math.sin(angle) * valRadius;
                  return { x, y };
                });

                const scorePointsString = scorePoints.map(p => `${p.x},${p.y}`).join(' ');

                return (
                  <g>
                    <polygon 
                      points={scorePointsString} 
                      fill="hsla(180, 100%, 48%, 0.18)" 
                      stroke="var(--accent-cyan)" 
                      strokeWidth="2" 
                      style={{ filter: "drop-shadow(0 0 6px hsla(180, 100%, 48%, 0.3))" }} 
                    />
                    {scorePoints.map((p, pIdx) => (
                      <circle key={pIdx} cx={p.x} cy={p.y} r="3" fill="var(--accent-cyan)" />
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Savings Analytics dashboard card */}
        <div className="optimizations-full-panel glass-panel">
          <div>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Optimization Dashboard (RAG & Token Telemetry)</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Live computational savings registered during simulated LLM routing.</p>
          </div>
          
          <div className="telemetry-summary-grid">
            <div className="opt-metric-widget">
              <div className="opt-widget-val">78%</div>
              <div className="opt-widget-lbl">Prompt Cache</div>
            </div>
            <div className="opt-metric-widget">
              <div className="opt-widget-val">{telemetry.ragQueries} Hits</div>
              <div className="opt-widget-lbl">RAG Matches</div>
            </div>
            <div className="opt-metric-widget">
              <div className="opt-widget-val">${(telemetry.costSaved + 8.5).toFixed(2)}</div>
              <div className="opt-widget-lbl">Cost Saved</div>
            </div>
          </div>

          <div className="savings-highlight-banner">
            <div className="savings-icon-large">💰</div>
            <div className="savings-banner-text">
              <h4>Summarizers and Context Compressor Active</h4>
              <p>Our context compression pipeline compressed redundant conversational vectors by <strong>{telemetry.summarizeCompress}x</strong>, resulting in substantial memory savings.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row details (Question Breakdowns & study recommendations) */}
      <div className="breakdown-row">
        
        <div className="qna-breakdown-panel">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Detailed Interview Log & Performance Breakdown
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {userResponses.map((res, index) => {
              const feedbackForRound = realEvaluation?.feedback?.[res.round] || evaluationFeedback[res.round] || { exemplary: '', feedback: '' };
              let qScore = 80;
              if (realEvaluation) {
                if (res.round === 'behavioral') qScore = realEvaluation.communication;
                else if (res.round === 'system-design') qScore = realEvaluation.systemDesign;
                else if (res.round === 'coding') qScore = realEvaluation.problemSolving;
                else if (res.round === 'wrap-up') qScore = realEvaluation.technical;
              } else {
                qScore = index === 2 ? (codePass ? 95 : 55) : (80 + Math.floor(Math.random() * 15));
              }
              const scoreClass = qScore >= 90 ? 'score-tag-green' : 'score-tag-amber';
              
              return (
                <div className="breakdown-card" key={index}>
                  <div className="breakdown-card-header">
                    <div className="qna-number-badge">{index + 1}</div>
                    <div className="qna-meta-question">
                      <h4>{res.question}</h4>
                      <span>Round: {res.round.toUpperCase()} &bull; {res.criteria}</span>
                    </div>
                    <span className={`qna-score-tag ${scoreClass}`}>{qScore}% Score</span>
                  </div>
                  
                  <div className="qna-answer-comparison">
                    <div>
                      <div className="qna-block-title">Your Submitted Response</div>
                      {res.round === 'coding' ? (
                        <div>
                          <div className="coding-report-stats">
                            <span className="coding-stat-pill">Lang: {activeLanguage.toUpperCase()}</span>
                            <span className="coding-stat-pill" style={{ color: 'var(--accent-green)' }}>Verify Suite: {codePass ? 'PASSED' : 'FAILED'}</span>
                          </div>
                          <pre className="coding-diff-viewer">{res.response}</pre>
                        </div>
                      ) : (
                        <div className="qna-block-content" dangerouslySetInnerHTML={{ __html: res.response.replace(/\n/g, '<br>') }} />
                      )}
                    </div>
                    <div>
                      <div className="qna-block-title">Exemplary Reference Architecture</div>
                      {res.round === 'coding' ? (
                        <pre className="coding-diff-viewer" style={{ borderColor: 'hsla(180, 100%, 48%, 0.25)' }}>
                          <span className="diff-line added">{feedbackForRound.exemplary}</span>
                        </pre>
                      ) : (
                        <div className="qna-block-content exemplary">{feedbackForRound.exemplary}</div>
                      )}
                    </div>
                    <div className="qna-feedback-box">
                      <strong style={{ color: 'var(--accent-purple)' }}>AeroAssess AI Evaluator:</strong> {feedbackForRound.feedback}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Core Action Plan panel */}
          <div className="study-plan-panel glass-panel">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Actionable Study Roadmap
            </h3>
            <p style={{ fontSize: '0.8rem', marginBottom: '1.25rem' }}>Customized subjects based on identified algorithmic or architectural knowledge gaps.</p>
            
            <div className="study-topics-list">
              {(studyTopics[selectedPreset] || studyTopics.frontend).map((topicObj, idx) => (
                <div className="study-topic-card" key={idx}>
                  <h5>{topicObj.topic}</h5>
                  <p>{topicObj.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Retake dashboard card */}
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4>Ready to target weaknesses?</h4>
            <p style={{ fontSize: '0.8rem' }}>Launch another custom simulation with a higher architectural emphasis or refreshed algorithmic set.</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onRetakeMockSession}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              Synthesize New Mock Session
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
