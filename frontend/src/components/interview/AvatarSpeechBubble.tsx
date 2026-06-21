import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';

interface AvatarSpeechBubbleProps {
  text: string;
  roundName?: string;
  roundProgress?: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onSkipSpeech?: () => void;
  canSkip?: boolean;
}

export const AvatarSpeechBubble: React.FC<AvatarSpeechBubbleProps> = ({
  text,
  roundName,
  roundProgress,
  isMuted,
  onToggleMute,
  onSkipSpeech,
  canSkip = false
}) => {
  return (
    <div className="avatar-speech-bubble-wrapper">
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          className="avatar-speech-bubble glass-panel"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Decorative bubble pointer (triangle) */}
          <div className="bubble-pointer" />

          {/* Header Metadata */}
          {(roundName || roundProgress) && (
            <div className="bubble-metadata">
              <span className="round-progress-label">{roundProgress}</span>
              {roundName && <span className="round-name-divider">•</span>}
              {roundName && <span className="round-name-label">{roundName}</span>}
            </div>
          )}

          {/* Main Bubble Text */}
          <div className="bubble-text-content">
            <p>{text}</p>
          </div>

          {/* Interactive controls */}
          <div className="bubble-controls-footer">
            <button
              className={`bubble-action-btn ${isMuted ? 'muted' : ''}`}
              title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
            >
              {isMuted ? (
                <VolumeX size={14} className="control-icon" />
              ) : (
                <Volume2 size={14} className="control-icon" />
              )}
              <span className="btn-label-sm">{isMuted ? 'Muted' : 'Voice On'}</span>
            </button>

            {canSkip && onSkipSpeech && (
              <button
                className="bubble-action-btn skip-btn"
                title="Skip listening to TTS"
                onClick={(e) => {
                  e.stopPropagation();
                  onSkipSpeech();
                }}
              >
                <SkipForward size={14} className="control-icon" />
                <span className="btn-label-sm">Skip Intro</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
