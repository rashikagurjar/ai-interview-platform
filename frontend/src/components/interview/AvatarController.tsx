import React, { useState, useEffect, useRef } from 'react';
import { InterviewerAvatar } from './InterviewerAvatar';
import { AvatarSpeechBubble } from './AvatarSpeechBubble';
import { AvatarStatus } from './AvatarStatus';
import { ProfileTemplate, Question } from '@/types/interview';

interface AvatarControllerProps {
  parsedProfile: ProfileTemplate | null;
  currentQuestionIndex: number;
  isMicActive: boolean;
  isFetchingNextQuestion: boolean;
  isRunningCode: boolean;
  isEvaluating: boolean;
  ideTerminalStatus: string;
}

export const AvatarController: React.FC<AvatarControllerProps> = ({
  parsedProfile,
  currentQuestionIndex,
  isMicActive,
  isFetchingNextQuestion,
  isRunningCode,
  isEvaluating,
  ideTerminalStatus,
}) => {
  const [state, setState] = useState<'idle' | 'speaking' | 'listening' | 'processing' | 'evaluating'>('idle');
  const [speechText, setSpeechText] = useState<string>('Welcome to AeroAssess. Press "Launch Immersive Interview Console" to begin your evaluation.');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const activeQuestion = parsedProfile?.questions[currentQuestionIndex];
  
  // Track previous variables to detect changes
  const prevQuestionIndexRef = useRef<number>(-1);
  const prevTerminalStatusRef = useRef<string>('READY');
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stop any active TTS utterance
  const cancelSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  };

  // Perform TTS speech
  const speakText = (textToSpeak: string) => {
    cancelSpeech();
    setSpeechText(textToSpeak);

    if (isMuted) {
      // If muted, simulate speaking state briefly, then transition to listening
      setState('speaking');
      const readingDuration = Math.min(6000, textToSpeak.length * 40); // 40ms per char, max 6s
      speechTimeoutRef.current = setTimeout(() => {
        setState('listening');
      }, readingDuration);
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setState('speaking');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Select a clean English voice if available
      const voices = window.speechSynthesis.getVoices();
      const defaultVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.startsWith('en-')) || 
                           voices[0];
      if (defaultVoice) {
        utterance.voice = defaultVoice;
      }
      
      utterance.rate = 0.98; // Natural speaking rate
      
      utterance.onend = () => {
        setState('listening');
      };
      
      utterance.onerror = () => {
        setState('listening');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback if browser doesn't support TTS
      setState('listening');
    }
  };

  // Handle Mute / Unmute Toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nextMute) {
      // If muting during speaking, cancel speech and move directly to listening
      cancelSpeech();
      setState('listening');
    } else {
      // If unmuting, read the current speech text
      if (state === 'speaking' || state === 'listening') {
        speakText(speechText);
      }
    }
  };

  // Handle Skip Speech Button click
  const handleSkipSpeech = () => {
    cancelSpeech();
    setState('listening');
  };

  // 1. Detect interview loading & round transitions
  useEffect(() => {
    if (!parsedProfile || !activeQuestion) return;

    const prevIndex = prevQuestionIndexRef.current;
    
    // Welcome & Question 1 greeting
    if (currentQuestionIndex === 0 && prevIndex !== 0) {
      const greeting = `Hello! I am your AI interviewer today. I will guide you through your candidate assessment. Let's start with our first round: Behavioral Core. Here is my question: ${activeQuestion.question}`;
      speakText(greeting);
      prevQuestionIndexRef.current = 0;
    } 
    // Handle round transition / next question
    else if (currentQuestionIndex > 0 && currentQuestionIndex !== prevIndex) {
      let speech = '';
      
      if (activeQuestion.type === 'system-design') {
        speech = `Thanks for that response. Let's move to Round 2: System Architectural Design. Here is my question: ${activeQuestion.question}`;
      } else if (activeQuestion.type === 'coding') {
        speech = `For our third round, we will focus on coding. Please look at the IDE on the right. ${activeQuestion.question}`;
      } else if (activeQuestion.type === 'wrap-up') {
        speech = `Excellent solution. Let's conclude with Round 4, our Technical Wrap-up. My closing question is: ${activeQuestion.question}`;
      } else {
        speech = `Let's move to the next question: ${activeQuestion.question}`;
      }

      speakText(speech);
      prevQuestionIndexRef.current = currentQuestionIndex;
    }
  }, [currentQuestionIndex, parsedProfile, activeQuestion]);

  // 2. Handle IDE terminal compilation results
  useEffect(() => {
    if (!parsedProfile || !activeQuestion || activeQuestion.type !== 'coding') return;
    
    const prevStatus = prevTerminalStatusRef.current;
    if (ideTerminalStatus !== prevStatus) {
      if (ideTerminalStatus === 'SUCCESS') {
        speakText("Excellent, the verification suite passed successfully. Please write a brief explanation of your complexity bounds in the answer box and click submit.");
      } else if (ideTerminalStatus === 'FAILED') {
        speakText("It looks like some test cases failed. Please review the execution output in the terminal and refine your code.");
      } else if (ideTerminalStatus === 'ERROR') {
        speakText("There was a compilation or syntax error inside your code. Please check the compiler output and adjust your solution.");
      }
      prevTerminalStatusRef.current = ideTerminalStatus;
    }
  }, [ideTerminalStatus, parsedProfile, activeQuestion]);

  // 3. Handle asynchronous loading states (processing and evaluating)
  useEffect(() => {
    if (isEvaluating) {
      cancelSpeech();
      setState('evaluating');
      setStatusMessage('Compiling final report...');
      setSpeechText("Thank you for completing the interview. I am compiling your performance evaluation report now. This will analyze your architectural depth and algorithmic efficiency...");
    } else if (isFetchingNextQuestion) {
      cancelSpeech();
      setState('processing');
      setStatusMessage('Analyzing response...');
      setSpeechText("Analyzing your response and synthesizing the next question... Please stand by.");
    } else if (isRunningCode) {
      cancelSpeech();
      setState('processing');
      setStatusMessage('Executing test cases...');
      setSpeechText("Compiling your solution and executing test suites in our container sandbox...");
    }
  }, [isFetchingNextQuestion, isRunningCode, isEvaluating]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  // Determine round title & progress label
  const getRoundLabel = () => {
    if (!activeQuestion) return { name: '', progress: '' };
    const progress = `Round ${currentQuestionIndex + 1}/4`;
    switch (activeQuestion.type) {
      case 'behavioral':
        return { name: 'Behavioral Core', progress };
      case 'system-design':
        return { name: 'System Architectural Design', progress };
      case 'coding':
        return { name: 'Algorithmic IDE Assessment', progress };
      case 'wrap-up':
        return { name: 'Technical Wrap-up', progress };
      default:
        return { name: '', progress };
    }
  };

  const { name: roundName, progress: roundProgress } = getRoundLabel();

  return (
    <div className="avatar-controller-layout glass-panel">
      <div className="avatar-row-container">
        {/* Left: Avatar Face Visuals */}
        <InterviewerAvatar state={state} />

        {/* Right: Info Badge & Waveform Status */}
        <div className="avatar-meta-column">
          <h4 className="avatar-name-title">AeroAssess Recruiter Agent (Sarah)</h4>
          <AvatarStatus 
            state={state} 
            isMicActive={isMicActive} 
            statusMessage={statusMessage} 
          />
        </div>
      </div>

      {/* Bottom: Speech bubble beside/underneath */}
      <AvatarSpeechBubble
        text={speechText}
        roundName={roundName}
        roundProgress={roundProgress}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onSkipSpeech={handleSkipSpeech}
        canSkip={state === 'speaking'}
      />
    </div>
  );
};
