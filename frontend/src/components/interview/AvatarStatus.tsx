import React from 'react';
import { motion } from 'framer-motion';

interface AvatarStatusProps {
  state: 'idle' | 'speaking' | 'listening' | 'processing' | 'evaluating';
  isMicActive: boolean;
  statusMessage?: string;
}

export const AvatarStatus: React.FC<AvatarStatusProps> = ({ state, isMicActive, statusMessage }) => {
  // Get corresponding badge styles and text based on state
  const getStatusConfig = () => {
    switch (state) {
      case 'speaking':
        return {
          text: 'Agent Speaking',
          color: 'var(--accent-cyan)',
          bg: 'hsla(180, 100%, 48%, 0.1)',
          glow: 'glow-cyan'
        };
      case 'listening':
        return {
          text: isMicActive ? 'Listening: Mic Active' : 'Awaiting Response',
          color: 'var(--accent-green)',
          bg: 'hsla(145, 80%, 45%, 0.1)',
          glow: 'glow-green'
        };
      case 'processing':
        return {
          text: statusMessage || 'Agent Thinking...',
          color: 'var(--accent-purple)',
          bg: 'hsla(270, 90%, 65%, 0.1)',
          glow: 'glow-purple'
        };
      case 'evaluating':
        return {
          text: 'Compiling Final Report...',
          color: 'var(--accent-magenta)',
          bg: 'hsla(315, 95%, 60%, 0.1)',
          glow: 'glow-magenta'
        };
      case 'idle':
      default:
        return {
          text: 'Ready to Begin',
          color: 'var(--text-muted)',
          bg: 'hsla(230, 20%, 30%, 0.15)',
          glow: ''
        };
    }
  };

  const config = getStatusConfig();

  // Array of heights for the speaking voice waveform
  const waveHeights = [14, 28, 18, 36, 24, 40, 16, 30, 20, 12];

  return (
    <div className="avatar-status-panel">
      {/* Glow Status Pill */}
      <div 
        className="avatar-status-pill"
        style={{ 
          borderColor: config.color,
          backgroundColor: config.bg,
          color: config.color
        }}
      >
        <span 
          className="avatar-status-dot" 
          style={{ backgroundColor: config.color }} 
        />
        <span className="avatar-status-text">{config.text}</span>
      </div>

      {/* Dynamic Waveform Visualizers */}
      <div className="avatar-wave-visualizer">
        {state === 'speaking' && (
          <div className="speech-wave-bars">
            {waveHeights.map((h, i) => (
              <motion.span
                key={i}
                className="voice-bar-anim"
                style={{ backgroundColor: 'var(--accent-cyan)' }}
                animate={{
                  height: [h * 0.25, h, h * 0.25]
                }}
                transition={{
                  duration: 0.6 + (i % 3) * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}

        {state === 'listening' && (
          <div className="listening-pulse-container">
            <motion.div
              className="listening-pulse-ring"
              style={{ borderColor: 'var(--accent-green)' }}
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="listening-pulse-ring delay"
              style={{ borderColor: 'var(--accent-green)' }}
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.9 }}
            />
            <span className="listening-subtext">
              {isMicActive ? 'Speech input active...' : 'Awaiting keyboard entry...'}
            </span>
          </div>
        )}

        {(state === 'processing' || state === 'evaluating') && (
          <div className="processing-loader-wrapper">
            <svg className="processing-circle-spinner" viewBox="0 0 50 50">
              <circle
                className="path"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
                stroke={state === 'evaluating' ? 'var(--accent-magenta)' : 'var(--accent-purple)'}
              />
            </svg>
            <span 
              className="processing-subtext"
              style={{ color: state === 'evaluating' ? 'var(--accent-magenta)' : 'var(--accent-purple)' }}
            >
              Synchronizing vector cache...
            </span>
          </div>
        )}

        {state === 'idle' && (
          <div className="idle-wave-flat">
            <span className="flat-bar" />
            <span className="flat-bar" />
            <span className="flat-bar" />
            <span className="flat-bar" />
          </div>
        )}
      </div>
    </div>
  );
};
