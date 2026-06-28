"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ProfileTemplate,
  UserResponse,
  Telemetry,
  TelemetryLog,
  Scores,
  profileTemplates
} from '@/types/interview';

import { DashboardSection } from '@/components/DashboardSection';
import { SetupSection } from '@/components/SetupSection';
import { InterviewSection } from '@/components/InterviewSection';
import { ReportSection } from '@/components/ReportSection';

export default function AeroAssessSimulator() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Navigation & Workspace State
  const [activeSection, setActiveSection] = useState<'home' | 'setup' | 'interview' | 'report'>('home');
  const [selectedPreset, setSelectedPreset] = useState<string>('frontend');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<{ header: string; desc: string }>({
    header: 'Awaiting Profile Selection...',
    desc: 'Choose a profile template or drag a resume to trigger the RAG analysis engine.'
  });
  const [parsedProfile, setParsedProfile] = useState<ProfileTemplate | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cacheHitRatio, setCacheHitRatio] = useState<string>('94%');

  // Interview Runtime Variables
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [interviewCompleted, setInterviewCompleted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [activeLanguage, setActiveLanguage] = useState<'js' | 'py' | 'cpp'>('js');
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [userInput, setUserInput] = useState<string>('');

  // Speech Transcription
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Avatar Async State Triggers
  const [isFetchingNextQuestion, setIsFetchingNextQuestion] = useState<boolean>(false);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Real evaluation details from Gemini backend
  const [realEvaluation, setRealEvaluation] = useState<any>(null);

  // IDE State variables
  const [ideCode, setIdeCode] = useState<string>('');
  const [ideTerminalStatus, setIdeTerminalStatus] = useState<string>('READY');
  const [ideTerminalColor, setIdeTerminalColor] = useState<string>('var(--accent-cyan)');
  const [ideConsoleOutput, setIdeConsoleOutput] = useState<string>('');
  const [codeSubmitted, setCodeSubmitted] = useState<boolean>(false);
  const [codePass, setCodePass] = useState<boolean>(false);

  // Telemetry Teleport variables
  const [telemetry, setTelemetry] = useState<Telemetry>({
    cacheHits: 0,
    ragQueries: 0,
    summarizeCompress: 1.0,
    costSaved: 0.00
  });
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);

  // Mock performance final scores
  const [scores, setScores] = useState<Scores>({
    technical: 85,
    communication: 80,
    problemSolving: 75,
    cultureFit: 85,
    codeQuality: 80,
    systemDesign: 70
  });

  // References for Auto-scrolling containers
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const telemetryLogsRef = useRef<HTMLDivElement>(null);

  // Helper function to append telemetry logs
  const logTelemetry = (module: string, message: string) => {
    const timeStr = new Date().toLocaleTimeString().split(' ')[0];
    setTelemetryLogs(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        module,
        message,
        time: timeStr
      }
    ]);
  };

  // Switch tabs language click handler
  const handleLanguageTabClick = (lang: 'js' | 'py' | 'cpp') => {
    const prevLang = activeLanguage;
    setActiveLanguage(lang);
    logTelemetry('SYS', `IDE Compiler: switched engine focus to "${lang.toUpperCase()}".`);

    // Automatically swap code presets if the editor contains the previous language's preset code
    if (parsedProfile && ideCode === parsedProfile.codePresets[prevLang]) {
      setIdeCode(parsedProfile.codePresets[lang]);
    }
  };

  // Authentication Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Initialize System Logs
  useEffect(() => {
    logTelemetry('SYS', 'Initializing AeroAssess client compiler context maps...');
    logTelemetry('SYS', 'RAG vector indexes bound. Waiting for first token exchange.');
  }, []);

  // Initialize IDE code preset when profile is parsed
  useEffect(() => {
    if (parsedProfile) {
      setIdeCode(parsedProfile.codePresets[activeLanguage]);
    }
  }, [parsedProfile]);

  // Auto scroll effects
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [currentQuestionIndex, isMicActive, userInput]);

  useEffect(() => {
    if (telemetryLogsRef.current) {
      telemetryLogsRef.current.scrollTop = telemetryLogsRef.current.scrollHeight;
    }
  }, [telemetryLogs]);

  // Switch tabs section routing logic
  const handleSwitchSection = (sectionId: 'home' | 'setup' | 'interview' | 'report') => {
    if (sectionId === 'interview' && !interviewStarted) return;
    if (sectionId === 'report' && !interviewCompleted) return;

    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    logTelemetry('SYS', `Navigation transition resolved: viewport swapped to "${sectionId}" room.`);
  };

  // Quick Select Track cards on Dashboard
  const handleQuickSelectTrack = (presetId: string) => {
    setSelectedPreset(presetId);
    // Switch to setup page and run analysis compiler
    setActiveSection('setup');
    runRAGAnalysisCompiler(presetId);
  };

  // RAG synthesizer calling FastAPI backend
  const runRAGAnalysisCompiler = async (presetId: string, file?: File) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setParsedProfile(null);

    setAnalysisText({
      header: 'Compiling Context Indexes...',
      desc: 'Uploading resume, parsing text and generating customized questions via Gemini...'
    });

    logTelemetry('RAG', 'Initializing RAG extraction thread...');

    try {
      const formData = new FormData();
      formData.append('track', presetId);
      if (file) {
        formData.append('file', file);
      }

      logTelemetry('RAG', 'Transmitting document context to python backend...');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/parse-resume', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server responded with an error');
      }

      const profile = await response.json();
      logTelemetry('SYS', `Gemini RAG synthesis finalized for: "${profile.title}". Console active.`);
      setSessionId(profile.session_id);
      setParsedProfile(profile);
      setCacheHitRatio(`${Math.floor(Math.random() * 15) + 82}%`);
    } catch (error: any) {
      console.error(error);
      logTelemetry('SYS', `RAG compilation failed: ${error.message}`);
      setAnalysisText({
        header: 'RAG Ingestion Failed',
        desc: `Error: ${error.message}. Make sure the Python backend is running on port 8000 and has GEMINI_API_KEY set.`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Launch interview console
  const handleLaunchConsole = () => {
    if (!parsedProfile) return;

    setInterviewStarted(true);
    setInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setUserResponses([]);
    setUserInput('');
    setCodeSubmitted(false);
    setCodePass(false);

    // Reset telemetry
    setTelemetry({
      cacheHits: 0,
      ragQueries: 0,
      summarizeCompress: 1.0,
      costSaved: 0.00
    });

    logTelemetry('SYS', 'Assembling AI Dialogue Interface...');
    setActiveSection('interview');

    // Trigger telemetries and prompts for Question 1
    logTelemetry('RAG', `Context mapping: queried prompt embeddings for target "behavioral".`);
    logTelemetry('CACHE', `Prompt cache hit! Loaded system instruction sets in 8ms.`);
  };

  // Active question layout helper
  const activeQuestion = parsedProfile?.questions[currentQuestionIndex];

  // Speech Transcription using browser native Web Speech API
  const handleMicToggle = () => {
    if (isMicActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsMicActive(false);
      logTelemetry('SYS', 'Speech Transcriber: voice stream hook disconnected.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Web Speech API. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsMicActive(true);
        logTelemetry('SYS', 'Speech Transcriber: voice stream hook connected. Start speaking...');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        logTelemetry('SYS', `Speech Recognition error: ${event.error}`);
        setIsMicActive(false);
      };

      recognition.onend = () => {
        setIsMicActive(false);
        logTelemetry('SYS', 'Speech Transcriber: disconnected.');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error(err);
      logTelemetry('SYS', `Failed to initialize Speech Recognition: ${err.message}`);
    }
  };

  // Handle Response Submission
  const handleSubmitResponse = async () => {
    if (!parsedProfile || !activeQuestion) return;

    const trimmedInput = userInput.trim();
    if (!trimmedInput && !codeSubmitted) return;

    // Check if on coding page and code not compiled
    if (activeQuestion.type === 'coding' && !codeSubmitted) {
      alert('⚠️ Please run and compile your code inside the IDE environment first to verify test assertions.');
      return;
    }

    let finalResponseText = trimmedInput;
    if (activeQuestion.type === 'coding') {
      finalResponseText = `[Submitted Algorithmic Solution - Language: ${activeLanguage.toUpperCase()}]\n\n${ideCode}\n\nCandidate Review comments:\n${trimmedInput || 'Passed verification suite.'}`;
    }

    // Stop mic if active
    if (isMicActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsMicActive(false);
    }

    // Store user response
    const newResponseObj: UserResponse = {
      round: activeQuestion.type,
      question: activeQuestion.question,
      response: finalResponseText,
      criteria: activeQuestion.aiCriteria
    };

    const nextResponses = [...userResponses, newResponseObj];
    setUserResponses(nextResponses);
    setUserInput('');

    // Check if another question is available
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < 4) {
      logTelemetry('SYS', 'Agent Reasoning: submitting response and dynamically compiling next question...');
      setIsFetchingNextQuestion(true);

      try {
        if (sessionId) {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8000/api/session/${sessionId}/answer`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              round: activeQuestion.type,
              question: activeQuestion.question,
              response: finalResponseText,
              criteria: activeQuestion.aiCriteria
            })
          });

          if (!response.ok) {
            throw new Error('Failed to save answer and retrieve followup');
          }

          const data = await response.json();
          if (data.profile) {
            setParsedProfile(data.profile);

            // Update telemetry
            setTelemetry(prev => ({
              cacheHits: prev.cacheHits + 1,
              ragQueries: prev.ragQueries + Math.floor(Math.random() * 3) + 2,
              summarizeCompress: Number((1.0 + nextIdx * 0.8).toFixed(1)),
              costSaved: Number((prev.costSaved + Math.random() * 0.35 + 0.15).toFixed(2))
            }));

            setCurrentQuestionIndex(nextIdx);
            setCodeSubmitted(false);
            setCodePass(false);

            const nextQ = data.profile.questions[nextIdx];
            if (nextQ) {
              logTelemetry('RAG', `Context mapping: dynamically queried prompt embeddings for target "${nextQ.type}".`);
              logTelemetry('CACHE', `Prompt cache hit! Dynamic followup loaded.`);
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        logTelemetry('SYS', `Error retrieving dynamic followup: ${err.message}`);
        alert(`Failed to fetch dynamic followup: ${err.message}`);
      } finally {
        setIsFetchingNextQuestion(false);
      }
    } else {
      // Finished simulation, compiling performance evaluation metrics!
      setInterviewCompleted(true);
      logTelemetry('SYS', 'Transmitting dialogue transcript to Gemini API on python backend...');
      setIsEvaluating(true);

      try {
        setActiveSection('report');
        logTelemetry('SYS', 'Synthesizing report evaluation... Please stand by.');

        let response;
        if (sessionId) {
          // Save the final answer incrementally first
          try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:8000/api/session/${sessionId}/answer`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                round: activeQuestion.type,
                question: activeQuestion.question,
                response: finalResponseText,
                criteria: activeQuestion.aiCriteria
              })
            });
          } catch (e) {
            console.error("Failed to save final answer incrementally", e);
          }

          // Evaluate via new session endpoint
          const token = localStorage.getItem('token');
          response = await fetch(`http://localhost:8000/api/session/${sessionId}/evaluate`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          });
        } else {
          // Legacy fallback
          const token = localStorage.getItem('token');
          response = await fetch('http://localhost:8000/api/evaluate', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              track: selectedPreset,
              responses: nextResponses
            }),
          });
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Evaluation request failed');
        }

        const evalData = await response.json();

        setRealEvaluation(evalData);
        setScores({
          technical: evalData.technical,
          communication: evalData.communication,
          problemSolving: evalData.problemSolving,
          cultureFit: evalData.cultureFit,
          codeQuality: evalData.codeQuality,
          systemDesign: evalData.systemDesign
        });

        logTelemetry('SYS', 'Comprehensive technical performance evaluation report ready.');
      } catch (error: any) {
        console.error(error);
        logTelemetry('SYS', `Report evaluation failed: ${error.message}`);
        alert(`Failed to compile report. Error: ${error.message}. Make sure Python backend is running on port 8000.`);
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  // Live IDE resetting
  const handleIdeReset = () => {
    if (parsedProfile) {
      setIdeCode(parsedProfile.codePresets[activeLanguage]);
      setIdeConsoleOutput('> Workspace reset complete. Template code re-loaded.\n');
      logTelemetry('SYS', 'IDE: code canvas refreshed to default template.');
    }
  };

  // Compile and run code inside IDE using backend runner
  const handleIdeRun = async () => {
    setIdeTerminalStatus("COMPILING...");
    setIdeTerminalColor("var(--accent-purple)");
    setIdeConsoleOutput('> [SYS] Assembling testing environment...\n> [SYS] Assembling testing environment...\n');
    logTelemetry('SYS', 'IDE Compiler: launched code test suite.');
    setIsRunningCode(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/run-code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          language: activeLanguage,
          code: ideCode,
          testCases: parsedProfile?.testCases || []
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Runner returned an error');
      }

      const resData = await response.json();

      if (resData.status === "SUCCESS") {
        setIdeTerminalStatus("SUCCESS");
        setIdeTerminalColor("var(--accent-green)");
      } else if (resData.status === "FAILED") {
        setIdeTerminalStatus("FAILED");
        setIdeTerminalColor("var(--accent-red)");
      } else {
        setIdeTerminalStatus("ERROR");
        setIdeTerminalColor("var(--accent-red)");
      }

      setIdeConsoleOutput(prev => prev + `\n${resData.output}`);
      setCodeSubmitted(true);
      setCodePass(resData.pass_status);
      logTelemetry('SYS', `IDE Verification: test execution finished with status "${resData.status}".`);

    } catch (error: any) {
      console.error(error);
      setIdeTerminalStatus("ERROR");
      setIdeTerminalColor("var(--accent-red)");
      setIdeConsoleOutput(prev => prev + `\nError running code: ${error.message}\nMake sure the Python backend is running on port 8000.`);
      setCodeSubmitted(true);
      setCodePass(false);
      logTelemetry('SYS', `IDE Compilation failed: ${error.message}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  // Rebuild / Retake Mock Session
  const handleRetakeMockSession = () => {
    setActiveSection('setup');
    if (parsedProfile) {
      runRAGAnalysisCompiler(selectedPreset);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'grid', placeContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="scanner-box" style={{ width: '80px', height: '80px', border: '2px solid var(--accent-cyan)', borderRadius: '16px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-neon-cyan)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)', animation: 'scan 2s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div id="app-container">

      {/* APP NAVIGATION HEADER */}
      <header className="app-header">
        <div className="logo-wrapper">
          <div className="logo-icon">A</div>
          <div className="logo-text">AeroAssess<span className="logo-badge">Agent v2.4</span></div>
        </div>
        <nav className="nav-links">
          <button
            id="nav-btn-home"
            className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => handleSwitchSection('home')}
          >
            Dashboard
          </button>
          <button
            id="nav-btn-setup"
            className={`nav-item ${activeSection === 'setup' ? 'active' : ''}`}
            onClick={() => handleSwitchSection('setup')}
          >
            Briefing Room
          </button>
          <button
            id="nav-btn-interview"
            className={`nav-item ${activeSection === 'interview' ? 'active' : ''}`}
            disabled={!interviewStarted}
            onClick={() => handleSwitchSection('interview')}
          >
            Interview Console
          </button>
          <button
            id="nav-btn-report"
            className={`nav-item ${activeSection === 'report' ? 'active' : ''}`}
            disabled={!interviewCompleted}
            onClick={() => handleSwitchSection('report')}
          >
            Performance Report
          </button>
          <button
            id="nav-btn-logout"
            className="nav-item btn-danger btn-pill"
            style={{ marginLeft: '1.5rem', padding: '0.35rem 1rem', fontSize: '0.85rem' }}
            onClick={() => {
              localStorage.removeItem('token');
              setIsAuthenticated(false);
              router.push('/login');
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="app-viewport">
        {activeSection === 'home' && (
          <DashboardSection
            onEnterBriefingRoom={() => handleSwitchSection('setup')}
            onQuickSelectTrack={handleQuickSelectTrack}
          />
        )}

        {activeSection === 'setup' && (
          <SetupSection
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            isAnalyzing={isAnalyzing}
            analysisText={analysisText}
            parsedProfile={parsedProfile}
            cacheHitRatio={cacheHitRatio}
            onRunRAGAnalysis={runRAGAnalysisCompiler}
            onLaunchConsole={handleLaunchConsole}
            onLogTelemetry={logTelemetry}
          />
        )}

        {activeSection === 'interview' && (
          <InterviewSection
            parsedProfile={parsedProfile}
            currentQuestionIndex={currentQuestionIndex}
            userResponses={userResponses}
            userInput={userInput}
            setUserInput={setUserInput}
            isMicActive={isMicActive}
            onMicToggle={handleMicToggle}
            onSubmitResponse={handleSubmitResponse}
            telemetry={telemetry}
            telemetryLogs={telemetryLogs}
            chatHistoryRef={chatHistoryRef}
            telemetryLogsRef={telemetryLogsRef}
            activeLanguage={activeLanguage}
            onLanguageTabClick={handleLanguageTabClick}
            ideCode={ideCode}
            setIdeCode={setIdeCode}
            ideTerminalStatus={ideTerminalStatus}
            ideTerminalColor={ideTerminalColor}
            ideConsoleOutput={ideConsoleOutput}
            onIdeReset={handleIdeReset}
            onIdeRun={handleIdeRun}
            isFetchingNextQuestion={isFetchingNextQuestion}
            isRunningCode={isRunningCode}
            isEvaluating={isEvaluating}
          />
        )}

        {activeSection === 'report' && (
          <ReportSection
            scores={scores}
            userResponses={userResponses}
            realEvaluation={realEvaluation}
            codePass={codePass}
            activeLanguage={activeLanguage}
            selectedPreset={selectedPreset}
            telemetry={telemetry}
            onRetakeMockSession={handleRetakeMockSession}
          />
        )}
      </main>

      {/* SYSTEM FOOTER */}
      <footer className="app-footer">
        <p>&copy; 2026 AeroAssess AI Platform. Adaptive Vector-Cached Architectures. All optimizations simulation registered.</p>
      </footer>

    </div>
  );
}
