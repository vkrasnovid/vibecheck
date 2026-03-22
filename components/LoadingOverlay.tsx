'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useVibeContext } from '@/hooks/useVibeState';

const LOADING_MESSAGES = [
  'Reading the room...',
  'Calibrating your chaos...',
  'Feeling the feelings...',
  'Decoding the subtext...',
  'The vibes are loading...',
];

export default function LoadingOverlay() {
  const { state } = useVibeContext();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (state.status !== 'loading') return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
    }, 600);
    return () => clearInterval(interval);
  }, [state.status]);

  const isVisible = state.status === 'loading';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading-overlay"
          className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 20 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          aria-live="polite"
          aria-label="Analyzing your text"
        >
          {/* Ripple rings */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute rounded-full border border-purple-500/20"
              style={{
                width: '200px',
                height: '200px',
                animation: `rippleOut 2.4s ease-out ${i * 0.8}s infinite`,
              }}
            />
          ))}

          {/* Morphing blob */}
          <div
            style={{
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, var(--accent-idle) 0%, transparent 70%)',
              animation: 'blobMorph 2s ease-in-out infinite',
              opacity: 0.6,
              filter: 'blur(8px)',
            }}
          />

          {/* Loading text */}
          <motion.div
            key={msgIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            {LOADING_MESSAGES[msgIndex]}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
