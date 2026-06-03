"use client";

import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface Question {
  type: 'behavioral' | 'system-design' | 'coding' | 'wrap-up';
  question: string;
  aiCriteria: string;
}

interface CodePresets {
  js: string;
  py: string;
  cpp: string;
}

interface TestCase {
  input_args: string[];
  expected_output: string;
}

interface ProfileTemplate {
  char: string;
  title: string;
  level: string;
  skills: string[];
  syllabus: string[];
  questions: Question[];
  codePresets: CodePresets;
  testCases: TestCase[];
}

interface UserResponse {
  round: string;
  question: string;
  response: string;
  criteria: string;
}

interface Telemetry {
  cacheHits: number;
  ragQueries: number;
  summarizeCompress: number;
  costSaved: number;
}

interface Scores {
  technical: number;
  communication: number;
  problemSolving: number;
  cultureFit: number;
  codeQuality: number;
  systemDesign: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  type: 'bot' | 'candidate' | 'system';
}

interface TelemetryLog {
  id: string;
  module: string;
  message: string;
  time: string;
}

// ==========================================
// STATIC PRESET DATA
// ==========================================
const profileTemplates: Record<string, ProfileTemplate> = {
  frontend: {
    char: 'JS',
    title: 'Senior Frontend UI Architect',
    level: 'Senior Staff Specialist (L6)',
    skills: ['React/Next.js Core', 'CSS Reflow Engines', 'AST Compilers', 'V8 V-List Opts', 'Zustand/Redux State', 'TypeScript Typings', 'Web Performance audit'],
    syllabus: [
      'Design conflict strategies (CSS-in-JS vs Vanilla HSL tokens)',
      'Browser critical rendering path optimizations & Layout Thrashing prevention',
      'Algorithmic unique intersect sets filtering (Linear time execution)',
      'Dynamic code-splitting bundle trade-offs with RAG vector cache engines'
    ],
    questions: [
      {
        type: 'behavioral',
        question: "Describe a scenario where you faced a critical design disagreement with a Lead Architect regarding structural layout paradigms (e.g. standard Tailwind vs CSS HSL Custom Variables). How did you present your metrics, resolve the deadlock, and what was the outcome?",
        aiCriteria: "Assesses architectural collaboration, metrics-driven decision making, and leadership maturity in design system governance."
      },
      {
        type: 'system-design',
        question: "You are building a high-frequency trading dashboard displaying hundreds of real-time nodes. Users report heavy rendering lag, high frame drops, and periodic layout thrashing. How do you audit, pinpoint, and structure your React/V8 component reflow thread optimizations?",
        aiCriteria: "Assesses browser event loop knowledge, requestAnimationFrame strategies, DOM virtualization, and performance profiling."
      },
      {
        type: 'coding',
        question: "You need to create an optimized helper `resolveIntersect(arr1, arr2)` which finds the unique intersection between two numerical arrays. Complete the code inside the live IDE and execute the verification suite. Explain your time and space complexity bounds.",
        aiCriteria: "Assesses algorithm analysis, linear time-complexity optimizations, and code robustness."
      },
      {
        type: 'wrap-up',
        question: "Excellent synthesis. As a closing architectural question, what are the primary engineering trade-offs of deploying dynamic bundle code-splitting when integrated with standard edge-side prompt caching and RAG context layouts?",
        aiCriteria: "Assesses understanding of resource loader mechanisms, bundle sizes, and dynamic caching overlaps."
      }
    ],
    codePresets: {
      js: `// Implement in linear O(N + M) time complexity
function resolveIntersect(arr1, arr2) {
    const registry = new Set(arr1);
    const result = [];
    
    for (const value of arr2) {
        if (registry.has(value)) {
            result.push(value);
            registry.delete(value); // Keep result unique
        }
    }
    
    return result;
}`,
      py: `# Implement in linear O(N + M) time complexity
def resolve_intersect(arr1, arr2):
    registry = set(arr1)
    result = []
    
    for value in arr2:
        if value in registry:
            result.append(value)
            registry.remove(value) # Keep result unique
            
    return result`,
      cpp: `// Implement in linear O(N + M) time complexity
#include <vector>
#include <unordered_set>

std::vector<int> resolveIntersect(const std::vector<int>& arr1, const std::vector<int>& arr2) {
    std::unordered_set<int> registry(arr1.begin(), arr1.end());
    std::vector<int> result;
    
    for (int value : arr2) {
        if (registry.count(value)) {
            result.push_back(value);
            registry.erase(value); // Keep result unique
        }
    }
    
    return result;
}`
    }
  },
  backend: {
    char: 'PY',
    title: 'Distributed Systems Backend Engineer',
    level: 'Lead Staff Architect (L6)',
    skills: ['Python/Go-Routine', 'Distributed Locking', 'Kafka PubSub', 'PostgreSQL Clusters', 'System Partitioning', 'Consensus (Raft/Paxos)', 'gRPC API Gateway'],
    syllabus: [
      'Deprecating high-traffic core APIs with zero transactional downtime',
      'Highly consistent distributed transaction caches & caching topology models',
      'Linear-time data intersection set calculations in memory-constrained devices',
      'Consensus latency reduction with prompt caching & embedding storage structures'
    ],
    questions: [
      {
        type: 'behavioral',
        question: "How do you coordinate with multiple cross-discipline engineering squads to deprecate a critical microservice API that handles thousands of requests per second? How do you guarantee absolute zero outage transitions?",
        aiCriteria: "Assesses cross-team leadership, API versioning strategies, fail-safe migration design, and risk mitigation."
      },
      {
        type: 'system-design',
        question: "Your transactional cluster is facing heavy locking issues under peak loads. You are asked to implement a distributed cache layer with strict data-consistency guarantees. Walk me through your cache topology, invalidation tactics, and race-condition handling.",
        aiCriteria: "Assesses caching patterns (write-through, cache-aside), cache stampede protections, transaction isolation, and cluster replication."
      },
      {
        type: 'coding',
        question: "Complete the optimized helper `resolveIntersect(arr1, arr2)` which calculates the unique overlap of two large unsorted numeric datasets. Ensure space efficiency is optimized for parallel threads.",
        aiCriteria: "Assesses parallelizable data-structures, hashing lookups, and minimal memory foot-print."
      },
      {
        type: 'wrap-up',
        question: "Let's conclude: How would you configure database replication models to minimize read lag without introducing massive node failover inconsistencies?",
        aiCriteria: "Assesses replication patterns, CAP theorem applications, and network partition resiliency."
      }
    ],
    codePresets: {
      js: `// Implement in linear O(N + M) time complexity
function resolveIntersect(arr1, arr2) {
    const registry = new Set(arr1);
    const result = [];
    for (const num of arr2) {
        if (registry.has(num)) {
            result.push(num);
            registry.delete(num);
        }
    }
    return result;
}`,
      py: `# Implement in linear O(N + M) time complexity
def resolve_intersect(arr1, arr2):
    registry = set(arr1)
    result = []
    for num in arr2:
        if num in registry:
            result.append(num)
            registry.remove(num)
    return result`,
      cpp: `// Implement in linear O(N + M) time complexity
#include <vector>
#include <unordered_set>

std::vector<int> resolveIntersect(const std::vector<int>& arr1, const std::vector<int>& arr2) {
    std::unordered_set<int> registry(arr1.begin(), arr1.end());
    std::vector<int> result;
    for (int num : arr2) {
        if (registry.count(num)) {
            result.push_back(num);
            registry.erase(num);
        }
    }
    return result;
}`
    }
  },
  fullstack: {
    char: 'TS',
    title: 'Full-Stack Product Developer',
    level: 'Mid-Senior Specialist (L5)',
    skills: ['Node.js/Express', 'PostgreSQL core', 'Zustand state', 'React Hook logic', 'GraphQL Resolvers', 'Redis Invalidation', 'Docker containerized'],
    syllabus: [
      'Tight deadlines vs. technical debt mitigation during product ship phases',
      'Notification dispatch architecture design with failure retry patterns',
      'Algorithm intersect arrays utility for optimized browser-to-server arrays data exchange',
      'Optimizing slow GraphQL query resolvers using batch loaders and prompt caches'
    ],
    questions: [
      {
        type: 'behavioral',
        question: "Tell me about a time you had to deliver a major product feature under tight deadlines but had to knowingly introduce technical debt. How did you structure the code, document trade-offs, and pay down that debt later?",
        aiCriteria: "Assesses pragmatism, code documentation hygiene, product sense, and engineering craftsmanship."
      },
      {
        type: 'system-design',
        question: "We need a scalable notification engine that dispatches SMS and email events. How do you design it to avoid double-sends under high concurrency, manage third-party API outages, and handle automated client retries?",
        aiCriteria: "Assesses queue processors, idempotency keys, dead-letter queues, exponential backoff, and circuit breaker patterns."
      },
      {
        type: 'coding',
        question: "Write an optimal utility `resolveIntersect(arr1, arr2)` to find the intersection of two arrays representing active client session IDs. Keep code clean and production-grade.",
        aiCriteria: "Assesses code clean-liness, naming conventions, and correctness under various test edge-cases."
      },
      {
        type: 'wrap-up',
        question: "Finally, how do you diagnose and resolve the N+1 database querying issue commonly experienced in deep nested GraphQL query loaders?",
        aiCriteria: "Assesses batch loaders, data-loaders libraries, SQL join patterns, and query performance audits."
      }
    ],
    codePresets: {
      js: `// Implement in linear O(N + M) time complexity
function resolveIntersect(arr1, arr2) {
    const lookup = new Set(arr1);
    const intersect = [];
    for (const val of arr2) {
        if (lookup.has(val)) {
            intersect.push(val);
            lookup.delete(val);
        }
    }
    return intersect;
}`,
      py: `# Implement in linear O(N + M) time complexity
def resolve_intersect(arr1, arr2):
    lookup = set(arr1)
    intersect = []
    for val in arr2:
        if val in lookup:
            intersect.append(val)
            lookup.remove(val)
    return intersect`,
      cpp: `// Implement in linear O(N + M) time complexity
#include <vector>
#include <unordered_set>

std::vector<int> resolveIntersect(const std::vector<int>& arr1, const std::vector<int>& arr2) {
    std::unordered_set<int> lookup(arr1.begin(), arr1.end());
    std::vector<int> intersect;
    for (int val : arr2) {
      if (lookup.count(val)) {
          intersect.push_back(val);
          lookup.erase(val);
      }
    }
    return intersect;
}`
    }
  }
};

const simulationHistory = [
  { role: 'Backend Data Architect', date: '2 days ago', grade: '86%', scoreClass: 'A-' },
  { role: 'Senior React Engineer', date: '1 week ago', grade: '92%', scoreClass: 'A' },
  { role: 'Infrastructure SRE', date: '2 weeks ago', grade: '74%', scoreClass: 'B' },
  { role: 'Full-Stack Developer', date: '3 weeks ago', grade: '80%', scoreClass: 'B+' }
];

const simulatedSpeechPhrases = [
  "Regarding this architectural paradigm, I prefer configuring linear sets using custom variables rather than inline tools because it decreases paint loops...",
  "To handle layout thrashing at scale, I'd implement virtual DOM scrolling and decouple DOM updates using requestAnimationFrame cycles...",
  "For database caching topology, I would suggest a write-through model with Redis, utilizing strict cluster synchronization to avoid stale values...",
  "To solve N+1 problems in our GraphQL architecture, I typically deploy DataLoader patterns to batch and cache query requests efficiently..."
];

// ==========================================
// MAIN COMPONENT ENTRY POINT
// ==========================================
export default function AeroAssessSimulator() {
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
  
  // Drag over upload indicators
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // References for Auto-scrolling containers
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const telemetryLogsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Initialize System Logs
  useEffect(() => {
    logTelemetry('SYS', 'Initializing AeroAssess client compiler context maps...');
    logTelemetry('SYS', 'RAG vector indexes bound. Waiting for first token exchange.');
  }, []);

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
    logTelemetry('RAG', `Analyzing file stream: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
    runRAGAnalysisCompiler(selectedPreset, file);
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
      const response = await fetch('http://localhost:8000/api/parse-resume', {
        method: 'POST',
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
    if (nextIdx < parsedProfile.questions.length) {
      logTelemetry('SYS', 'Agent Reasoning: compiling next index context maps...');
      
      // Save intermediate response incrementally in the background
      if (sessionId) {
        fetch(`http://localhost:8000/api/session/${sessionId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            round: activeQuestion.type,
            question: activeQuestion.question,
            response: finalResponseText,
            criteria: activeQuestion.aiCriteria
          })
        }).catch(err => console.error("Incremental autosave failed:", err));
      }

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

      const nextQ = parsedProfile.questions[nextIdx];
      logTelemetry('RAG', `Context mapping: queried prompt embeddings for target "${nextQ.type}".`);
      logTelemetry('CACHE', `Prompt cache hit! Loaded system instruction sets in 8ms.`);
    } else {
      // Finished simulation, compiling performance evaluation metrics!
      setInterviewCompleted(true);
      logTelemetry('SYS', 'Transmitting dialogue transcript to Gemini API on python backend...');
      
      try {
        setActiveSection('report');
        logTelemetry('SYS', 'Synthesizing report evaluation... Please stand by.');
        
        let response;
        if (sessionId) {
          // Save the final answer incrementally first
          try {
            await fetch(`http://localhost:8000/api/session/${sessionId}/answer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
          response = await fetch(`http://localhost:8000/api/session/${sessionId}/evaluate`, {
            method: 'POST',
          });
        } else {
          // Legacy fallback
          response = await fetch('http://localhost:8000/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    setIdeConsoleOutput('> [SYS] Launching virtualization runner...\n> [SYS] Assembling testing environment...\n');
    logTelemetry('SYS', 'IDE Compiler: launched code test suite.');

    try {
      const response = await fetch('http://localhost:8000/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    }
  };

  // Rebuild / Retake Mock Session
  const handleRetakeMockSession = () => {
    setActiveSection('setup');
    if (parsedProfile) {
      runRAGAnalysisCompiler(selectedPreset);
    }
  };

  // Overall grades dynamic mapping
  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
  
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
        </nav>
      </header>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="app-viewport">

        {/* ============================================== */}
        {/* SECTION 1: LANDING DASHBOARD                   */}
        {/* ============================================== */}
        <section id="section-home" className={`app-section ${activeSection === 'home' ? 'active' : ''}`}>
          
          {/* Hero Welcome Panel */}
          <div className="hero-banner glass-panel">
            <div className="hero-text">
              <h1>Refine Your Engineering Practice on Simulated AI Agent Core</h1>
              <p>Experience the closest high-fidelity simulation of modern technical interviews. AeroAssess tailors behavioral, system architectural, and live code assessments to your exact profile, powered by adaptive vector-cached agent engines.</p>
              <button className="btn btn-accent" onClick={() => handleSwitchSection('setup')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">4</span>
                <span className="stat-label">Simulations Taken</span>
              </div>
            </div>

            <div className="stat-card glass-panel glass-panel-hover">
              <div className="stat-icon" style={{ color: 'var(--accent-purple)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">82%</span>
                <span className="stat-label">Average Score</span>
              </div>
            </div>

            <div className="stat-card glass-panel glass-panel-hover">
              <div className="stat-icon" style={{ color: 'var(--accent-magenta)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">Frontend System</span>
                <span className="stat-label">Top Competency</span>
              </div>
            </div>

            <div className="stat-card glass-panel glass-panel-hover">
              <div className="stat-icon" style={{ color: 'var(--accent-green)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="9" y1="9" x2="21" y2="9"></line><line x1="9" y1="15" x2="21" y2="15"></line></svg>
                  Pre-Configured Tracks
                </h3>
              </div>
              <div className="interview-roles-grid">
                <div className="role-select-card" onClick={() => handleQuickSelectTrack('frontend')}>
                  <div className="role-info">
                    <h4>Senior React Architect</h4>
                    <p>System Design, CSS Engines, Coding assessment</p>
                  </div>
                  <div className="role-arrow">→</div>
                </div>
                <div className="role-select-card" onClick={() => handleQuickSelectTrack('backend')}>
                  <div className="role-info">
                    <h4>Cloud Database Engineer</h4>
                    <p>Distributed locks, SQL schemas, Coding assessment</p>
                  </div>
                  <div className="role-arrow">→</div>
                </div>
                <div className="role-select-card" onClick={() => handleQuickSelectTrack('product')}>
                  <div className="role-info">
                    <h4>Technical Product Manager</h4>
                    <p>Behavioral metrics, prioritization, RAG scenarios</p>
                  </div>
                  <div className="role-arrow">→</div>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* ============================================== */}
        {/* SECTION 2: SETUP & RESUME BRIEFING             */}
        {/* ============================================== */}
        <section id="section-setup" className={`app-section ${activeSection === 'setup' ? 'active' : ''}`}>
          
          <div className="setup-layout">
            
            <div className="setup-panel glass-panel">
              <div className="section-intro">
                <h2>Candidate Briefing Room</h2>
                <p>Tailor your interview focus. Upload your CV/resume or select one of our curated high-profile engineering templates to feed the vector agent RAG compiler.</p>
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
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <p>Drag and drop your engineering resume here</p>
                <span>Supports PDF, DOCX, TXT (Max 5MB)</span>
              </div>

              <div className="or-divider">Or Select Simulation Profile</div>

              {/* Preset Profiles */}
              <div className="preset-container">
                
                <div 
                  className={`preset-card ${selectedPreset === 'frontend' ? 'selected' : ''}`}
                  onClick={() => { setSelectedPreset('frontend'); logTelemetry('SYS', 'Synthesizer target updated: profile changed to "frontend".'); }}
                >
                  <div className="preset-badge">JS</div>
                  <div className="preset-info">
                    <h5>Senior Frontend UI Architect</h5>
                    <p>React/Next.js core, design systems, CSS architecture, browser reflow optimizations</p>
                  </div>
                </div>

                <div 
                  className={`preset-card ${selectedPreset === 'backend' ? 'selected' : ''}`}
                  onClick={() => { setSelectedPreset('backend'); logTelemetry('SYS', 'Synthesizer target updated: profile changed to "backend".'); }}
                >
                  <div className="preset-badge">PY</div>
                  <div className="preset-info">
                    <h5>Distributed Systems Backend Engineer</h5>
                    <p>Python/Go, microservices, dynamic scaling, key-value stores, database partitioning</p>
                  </div>
                </div>

                <div 
                  className={`preset-card ${selectedPreset === 'fullstack' ? 'selected' : ''}`}
                  onClick={() => { setSelectedPreset('fullstack'); logTelemetry('SYS', 'Synthesizer target updated: profile changed to "fullstack".'); }}
                >
                  <div className="preset-badge">TS</div>
                  <div className="preset-info">
                    <h5>Full-Stack Product Developer</h5>
                    <p>Node.js, Postgres, state management, REST/GraphQL design, API caching</p>
                  </div>
                </div>

              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => runRAGAnalysisCompiler(selectedPreset)}>
                  Analyze and Synthesize
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
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

                  <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleLaunchConsole}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>
                    Launch Immersive Interview Console
                  </button>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* ============================================== */}
        {/* SECTION 3: LIVE INTERVIEW BOOTH               */}
        {/* ============================================== */}
        <section id="section-interview" className={`app-section ${activeSection === 'interview' ? 'active' : ''}`}>
          
          {/* Main dynamic container. Gets "split-mode" class when coding assessment starts */}
          <div className={`interview-layout ${activeQuestion?.type === 'coding' ? 'split-mode' : ''}`}>
            
            {/* Column A: AI Stage & Conversation Dialogue */}
            <div className="stage-column">
              
              {/* Holographic Avatar View */}
              <div className={`hologram-stage glass-panel ${!activeQuestion ? 'waiting' : (isMicActive ? 'listening' : '')}`}>
                
                <div className="avatar-pulsar">
                  <div className="avatar-ring-outer"></div>
                  <div className="avatar-ring-inner"></div>
                  <div className="avatar-img">
                    <span>🤖</span>
                    <div className="avatar-glow-effect"></div>
                  </div>
                </div>

                <div className="stage-meta">
                  <span className="stage-status">
                    {!activeQuestion ? 'Agent Compiling...' : (isMicActive ? 'Awaiting Candidate Response' : 'Agent Speaking')}
                  </span>
                  <h4 className="stage-title">AeroAssess Agent (Interviewer AI)</h4>
                  
                  {/* Pulsing dynamic wave container */}
                  <div className="voice-wave-container">
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                  </div>
                </div>

              </div>

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
                          handleSubmitResponse();
                        }
                      }}
                    />
                    
                    <button 
                      className={`speech-toggle-btn ${isMicActive ? 'active' : ''}`} 
                      title="Simulate speech-to-text input"
                      onClick={handleMicToggle}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    </button>
                    
                    <button className="send-btn" onClick={handleSubmitResponse}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
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
                    <span style={{ color: log.module === 'RAG' ? 'var(--accent-cyan)' : (log.module === 'CACHE' ? 'var(--accent-purple)' : 'var(--text-dim)') }} key={log.id}>
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
                    onClick={() => { setActiveLanguage('js'); logTelemetry('SYS', 'IDE Compiler: switched engine focus to "JS".'); }}
                  >
                    JavaScript
                  </button>
                  <button 
                    className={`editor-tab-btn ${activeLanguage === 'py' ? 'active' : ''}`}
                    onClick={() => { setActiveLanguage('py'); logTelemetry('SYS', 'IDE Compiler: switched engine focus to "PYTHON".'); }}
                  >
                    Python
                  </button>
                  <button 
                    className={`editor-tab-btn ${activeLanguage === 'cpp' ? 'active' : ''}`}
                    onClick={() => { setActiveLanguage('cpp'); logTelemetry('SYS', 'IDE Compiler: switched engine focus to "C++".'); }}
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
                    <button className="btn btn-secondary btn-pill" style={{ padding: '0.35rem 1rem', fontSize: '0.8rem' }} onClick={handleIdeReset}>Reset Code</button>
                    <button className="btn btn-accent btn-pill" style={{ padding: '0.35rem 1.25rem', fontSize: '0.8rem' }} onClick={handleIdeRun}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Run Code & Verify
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </section>

      {/* ============================================== */}
      {/* SECTION 4: EVALUATION & GRAPH REPORT          */}
      {/* ============================================== */}
      <section id="section-report" className={`app-section ${activeSection === 'report' ? 'active' : ''}`}>
        
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
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
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRetakeMockSession}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                  Synthesize New Mock Session
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>

    {/* SYSTEM FOOTER */}
    <footer className="app-footer">
      <p>&copy; 2026 AeroAssess AI Platform. Adaptive Vector-Cached Architectures. All optimizations simulation registered.</p>
    </footer>

  </div>
  );
}
