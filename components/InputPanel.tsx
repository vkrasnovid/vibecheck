'use client';

import { useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useVibeContext } from '@/hooks/useVibeState';

const EXAMPLE_CHIPS = [
  {
    emoji: '😤',
    label: 'Passive-aggressive email',
    text: "Hi, just following up again on my previous follow-up. No worries if you haven't had time, I know you're very busy. Please let me know when you get a chance, no rush at all :)",
  },
  {
    emoji: '💔',
    label: 'Breakup text',
    text: "I think we need to talk. I care about you but I've been feeling disconnected lately and I think it's best if we take some space. You deserve someone who can give you what you need and I'm just not sure I'm that person right now.",
  },
  {
    emoji: '😰',
    label: 'Non-apology apology',
    text: "I'm sorry you felt that way. I never meant for things to come across like that, and I think there might have been a misunderstanding on both sides. I hope we can move forward.",
  },
  {
    emoji: '🤡',
    label: 'Corporate word salad',
    text: "Per my last email, as per our discussion, please advise and circle back with your bandwidth to leverage this synergy going forward. Let's take this offline and action the deliverables.",
  },
  {
    emoji: '🥰',
    label: 'Love note',
    text: "I keep thinking about the way you laugh when something genuinely surprises you. I don't know how to say this without sounding like a lot, but you make everything feel more real.",
  },
];

export default function InputPanel() {
  const { state, dispatch } = useVibeContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isVisible = state.status === 'idle' || state.status === 'error';
  const charCount = state.inputText.length;
  const charCountColor = charCount > 4800 ? '#ff4444' : charCount > 4000 ? '#ffaa00' : 'var(--text-muted)';

  const handleSubmit = useCallback(async () => {
    const text = state.inputText.trim();
    if (!text) {
      dispatch({ type: 'SET_ERROR', error: "There's nothing here yet. Paste something and we'll read it." });
      return;
    }
    if (text.length < 10) {
      dispatch({ type: 'SET_ERROR', error: 'Give us something to work with. At least a sentence.' });
      return;
    }
    if (text.length > 5000) {
      dispatch({ type: 'SET_ERROR', error: "That's a lot of vibes. Keep it under 5,000 characters." });
      return;
    }

    dispatch({ type: 'SUBMIT' });

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.json();
        dispatch({ type: 'SET_ERROR', error: err.error || 'Analysis failed' });
        return;
      }

      const data = await res.json();
      dispatch({ type: 'SET_RESULT', result: data });
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'The vibes are temporarily unavailable. Try again in a moment.' });
    }
  }, [state.inputText, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isLoading = state.status === 'loading';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="input-panel"
          className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 py-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="text-white"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                fontWeight: 400,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight: 1,
                marginBottom: '8px',
              }}
            >
              VIBECHECK
            </h1>
            <motion.p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                letterSpacing: '0.01em',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              Paste any text. Get the brutal truth about its energy.
            </motion.p>
          </motion.div>

          {/* Input Card */}
          <motion.div
            className="w-full"
            style={{ maxWidth: '640px' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={state.inputText}
                onChange={e => dispatch({ type: 'SET_INPUT', text: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder={"Drop a text, email, DM, apology, resignation letter, love note, vague \"we need to talk\" — anything.\n\nWe'll tell you exactly what energy it's giving."}
                aria-label="Your text for vibe analysis"
                maxLength={5000}
                style={{
                  width: '100%',
                  minHeight: '160px',
                  maxHeight: '40vh',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '20px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  color: 'var(--text-primary)',
                  resize: 'none',
                  outline: 'none',
                  transition: 'border-color 200ms ease, box-shadow 200ms ease',
                  lineHeight: 1.6,
                  letterSpacing: '0.01em',
                  display: 'block',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(124, 77, 255, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 77, 255, 0.12), 0 0 20px rgba(124, 77, 255, 0.08)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {/* Character counter */}
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '0.7rem',
                  color: charCountColor,
                  paddingRight: '4px',
                  paddingTop: '4px',
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: 'color 200ms',
                }}
              >
                {charCount} / 5000
              </div>
            </div>

            {/* Error message */}
            {state.status === 'error' && state.error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(255, 50, 50, 0.1)',
                  border: '1px solid rgba(255, 50, 50, 0.25)',
                  color: '#ff8888',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {state.error}
              </motion.div>
            )}

            {/* Example chips */}
            <motion.div
              className="mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                className="flex-nowrap md:flex-wrap"
              >
                {EXAMPLE_CHIPS.map((chip, i) => (
                  <motion.button
                    key={chip.label}
                    onClick={() => dispatch({ type: 'SET_INPUT', text: chip.text })}
                    className="shrink-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '100px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 150ms ease',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      el.style.background = 'rgba(255, 255, 255, 0.1)';
                      el.style.borderColor = 'rgba(124, 77, 255, 0.4)';
                      el.style.color = 'var(--text-primary)';
                      el.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      el.style.background = 'rgba(255, 255, 255, 0.05)';
                      el.style.borderColor = 'var(--border-subtle)';
                      el.style.color = 'var(--text-secondary)';
                      el.style.transform = 'translateY(0)';
                    }}
                  >
                    <span>{chip.emoji}</span>
                    <span>{chip.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full mt-4 relative overflow-hidden"
              style={{
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7c4dff 0%, #e040fb 100%)',
                color: 'white',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 20px rgba(124, 77, 255, 0.35), 0 4px 16px rgba(0, 0, 0, 0.4)',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 200ms ease',
              }}
              whileHover={isLoading ? {} : {
                y: -1,
                boxShadow: '0 0 32px rgba(124, 77, 255, 0.55), 0 8px 24px rgba(0, 0, 0, 0.5)',
              }}
              whileTap={isLoading ? {} : { y: 1 }}
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: 1,
                scale: [1, 1.02, 1],
                transition: { delay: 1.0, duration: 0.4, times: [0, 0.5, 1] }
              }}
            >
              {isLoading ? 'Reading the room...' : 'Read My Vibe →'}
            </motion.button>

            <p
              className="text-center mt-3"
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Ctrl+Enter to submit
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
