import React from 'react';
import { motion } from 'framer-motion';

interface InterviewerAvatarProps {
  state: 'idle' | 'speaking' | 'listening' | 'processing' | 'evaluating';
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({ state }) => {
  // Define animation states based on avatar state
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isProcessing = state === 'processing' || state === 'evaluating';

  // Blinking animation for the eyes (runs periodically)
  const eyeBlinkTransition = {
    repeat: Infinity,
    repeatType: 'reverse' as const,
    duration: 0.15,
    repeatDelay: 3.5,
  };

  return (
    <div className="avatar-canvas-container">
      {/* Holographic Background Grid & Orbitals */}
      <svg className="avatar-grid-overlay" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Ring */}
        <motion.circle
          cx="100"
          cy="95"
          r="80"
          stroke="var(--accent-purple)"
          strokeWidth="0.75"
          strokeDasharray="4 6"
          opacity={0.3}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner Ring */}
        <motion.circle
          cx="100"
          cy="95"
          r="70"
          stroke="var(--accent-cyan)"
          strokeWidth="0.5"
          strokeDasharray="8 4"
          opacity={0.4}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Radar Scanning Line (Only in processing / evaluating state) */}
        {isProcessing && (
          <motion.line
            x1="20"
            y1="20"
            x2="180"
            y2="20"
            stroke="var(--accent-cyan)"
            strokeWidth="1.5"
            opacity={0.8}
            style={{ filter: 'drop-shadow(0 0 4px var(--accent-cyan))' }}
            animate={{ y: [0, 150, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </svg>

      {/* Recruiter SVG Portrait */}
      <motion.div
        className={`avatar-portrait-wrapper ${state}`}
        animate={
          isSpeaking
            ? { y: [0, -1, 1, 0] }
            : isListening
            ? { rotate: [0, -1, 1, 0] }
            : { y: [0, -2, 0] }
        }
        transition={{
          duration: isSpeaking ? 1.5 : isListening ? 4 : 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 200 200" fill="none" className="avatar-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Ambient Shadow Gradients */}
            <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--bg-primary)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="suitGrad" x1="100" y1="130" x2="100" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(230, 25%, 18%)" />
              <stop offset="100%" stopColor="hsl(230, 25%, 10%)" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="100" y1="60" x2="100" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(220, 25%, 90%)" />
              <stop offset="100%" stopColor="hsl(220, 20%, 75%)" />
            </linearGradient>
            <linearGradient id="hairGrad" x1="100" y1="35" x2="100" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-purple)" />
              <stop offset="100%" stopColor="hsl(230, 30%, 15%)" />
            </linearGradient>
            <linearGradient id="glowHolo" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="var(--accent-purple)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ambient Glow Backing */}
          <circle cx="100" cy="95" r="60" fill="url(#avatarGlow)" />

          {/* Hologram horizontal projection lines */}
          <g opacity="0.15">
            <line x1="40" y1="75" x2="160" y2="75" stroke="var(--text-main)" strokeWidth="0.5" />
            <line x1="30" y1="95" x2="170" y2="95" stroke="var(--text-main)" strokeWidth="0.5" />
            <line x1="40" y1="115" x2="160" y2="115" stroke="var(--text-main)" strokeWidth="0.5" />
            <line x1="50" y1="135" x2="150" y2="135" stroke="var(--text-main)" strokeWidth="0.5" />
          </g>

          {/* Torso & Suit */}
          <path d="M50 200 C50 160, 65 135, 100 135 C135 135, 150 160, 150 200 Z" fill="url(#suitGrad)" stroke="var(--border-glass)" strokeWidth="1" />
          <path d="M85 135 L100 165 L115 135 Z" fill="hsl(230, 20%, 30%)" /> {/* Inner Shirt V */}
          <path d="M100 165 L100 200" stroke="var(--accent-cyan)" strokeWidth="1.5" opacity="0.6" /> {/* Futuristic Tie */}

          {/* Neck */}
          <rect x="90" y="115" width="20" height="25" rx="5" fill="url(#skinGrad)" />

          {/* Head & Ears */}
          <circle cx="100" cy="85" r="32" fill="url(#skinGrad)" stroke="var(--border-glass)" strokeWidth="0.5" />
          <circle cx="66" cy="85" r="6" fill="url(#skinGrad)" /> {/* Left Ear */}
          <circle cx="134" cy="85" r="6" fill="url(#skinGrad)" /> {/* Right Ear */}

          {/* Hair (Sleek professional cut) */}
          <path d="M66 80 C66 45, 134 45, 134 80 C130 55, 70 55, 66 80 Z" fill="url(#hairGrad)" />
          <path d="M66 80 C68 70, 75 62, 85 62 C95 62, 92 70, 100 70 C108 70, 115 62, 125 62 C132 62, 133 70, 134 80 C130 65, 70 65, 66 80 Z" fill="url(#hairGrad)" />

          {/* Eyes (Blinking Path) */}
          {/* Left Eye */}
          <g transform="translate(86, 80)">
            <motion.ellipse
              cx="0"
              cy="0"
              rx="4"
              ry="4"
              fill="var(--bg-primary)"
              stroke="var(--accent-cyan)"
              strokeWidth="1.5"
              style={{ transformOrigin: 'center' }}
              animate={{ scaleY: [1, 0, 1] }}
              transition={eyeBlinkTransition}
            />
            {/* Eye Pupil Glow */}
            <circle cx="0" cy="0" r="1.5" fill="var(--accent-cyan)" opacity="0.8" />
          </g>

          {/* Right Eye */}
          <g transform="translate(114, 80)">
            <motion.ellipse
              cx="0"
              cy="0"
              rx="4"
              ry="4"
              fill="var(--bg-primary)"
              stroke="var(--accent-cyan)"
              strokeWidth="1.5"
              style={{ transformOrigin: 'center' }}
              animate={{ scaleY: [1, 0, 1] }}
              transition={eyeBlinkTransition}
            />
            {/* Eye Pupil Glow */}
            <circle cx="0" cy="0" r="1.5" fill="var(--accent-cyan)" opacity="0.8" />
          </g>

          {/* Eyebrows */}
          <path d="M78 73 Q86 70 92 74" stroke="var(--accent-purple)" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
          <path d="M122 73 Q114 70 108 74" stroke="var(--accent-purple)" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />

          {/* Nose */}
          <path d="M100 82 L98 92 L102 92 Z" fill="hsla(220, 20%, 50%, 0.25)" />

          {/* Mouth (Animates height when speaking) */}
          <g transform="translate(100, 99)">
            {isSpeaking ? (
              <motion.path
                d="M-8 0 Q0 -4 8 0 Q0 4 -8 0"
                fill="var(--bg-primary)"
                stroke="var(--accent-magenta)"
                strokeWidth="1.5"
                animate={{
                  d: [
                    "M-8 0 Q0 -2 8 0 Q0 2 -8 0",
                    "M-8 -1 Q0 -5 8 -1 Q0 5 -8 -1",
                    "M-8 0 Q0 -1 8 0 Q0 1 -8 0",
                    "M-8 -2 Q0 -7 8 -2 Q0 7 -8 -2",
                    "M-8 0 Q0 -2 8 0 Q0 2 -8 0"
                  ]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ) : (
              // Friendly slight smile
              <path
                d="M-7 0 Q0 3 7 0"
                stroke="var(--accent-purple)"
                strokeWidth="1.75"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>

          {/* Hologram Overlay Mesh (Gives it a sci-fi transparent shine) */}
          <rect x="0" y="0" width="200" height="200" fill="url(#glowHolo)" style={{ mixBlendMode: 'overlay' }} opacity={isProcessing ? 0.6 : 0.3} pointerEvents="none" />
        </svg>
      </motion.div>
    </div>
  );
};
