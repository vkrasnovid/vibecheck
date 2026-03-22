'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useVibeContext } from '@/hooks/useVibeState';
import { useShareUrl } from '@/hooks/useShareUrl';
import { WEATHER_CONFIG } from '@/lib/weatherConfig';

const SPRING_EASE = 'easeOut';

const sidebarVariants: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: SPRING_EASE,
      delay: 0.5,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
};

const drawerVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.55,
      ease: SPRING_EASE,
      delay: 0.5,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.6,
    },
  },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        marginBottom: '10px',
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: '1px',
        background: 'var(--border)',
        margin: '20px 0',
      }}
    />
  );
}

interface IntensityBarProps {
  value: number; // 0–1
}

function IntensityBar({ value }: IntensityBarProps) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginBottom: '6px',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <span>Low</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            color: 'var(--accent)',
          }}
        >
          {pct}
        </span>
        <span>High</span>
      </div>
      <div
        style={{
          height: '6px',
          borderRadius: '3px',
          background: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            borderRadius: '3px',
            background: 'var(--intensity-bar)',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function VibeSidebar() {
  const { state, dispatch } = useVibeContext();
  const { shareUrl } = useShareUrl();
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [shareCopyState, setShareCopyState] = useState<'idle' | 'copied'>('idle');

  const isOpen = state.status === 'result' && !!state.result;
  const result = state.result;

  const weatherConfig = result ? WEATHER_CONFIG[result.weather_type] : null;

  const handleCopyRewrite = useCallback(async () => {
    if (!result?.rewrite_suggestion) return;
    try {
      await navigator.clipboard.writeText(result.rewrite_suggestion);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      // silent fail
    }
  }, [result?.rewrite_suggestion]);

  const handleShare = useCallback(async () => {
    const ok = await shareUrl();
    setShareCopyState('copied');
    setTimeout(() => setShareCopyState('idle'), 2000);
  }, [shareUrl]);

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    // Clear URL param
    const url = new URL(window.location.href);
    url.searchParams.delete('v');
    window.history.replaceState(null, '', url.toString());
  };

  if (!result) return null;

  const sidebarContent = (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full overflow-y-auto"
      style={{ padding: 0 }}
    >
      {/* Drawer handle (mobile only) */}
      <div className="md:hidden flex justify-center pt-3 pb-2 shrink-0">
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.2)',
          }}
        />
      </div>

      {/* Scrollable content */}
      <div style={{ padding: '0 0 8px 0', flex: 1, overflowY: 'auto' }}>
        {/* WEATHER REPORT header */}
        <motion.div variants={itemVariants}>
          <SectionLabel>Weather Report</SectionLabel>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: 800,
              color: 'var(--accent)',
              textShadow: '0 0 20px var(--accent-glow)',
              marginBottom: '8px',
              lineHeight: 1.1,
            }}
          >
            {weatherConfig?.label}
          </div>
        </motion.div>

        {/* THE VIBE IN ONE LINE */}
        <motion.div variants={itemVariants}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1rem',
              fontWeight: 400,
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              fontStyle: 'italic',
              marginBottom: '20px',
            }}
          >
            &ldquo;{result.subtext}&rdquo;
          </div>
        </motion.div>

        <Divider />

        {/* INTENSITY */}
        <motion.div variants={itemVariants}>
          <SectionLabel>Intensity</SectionLabel>
          <IntensityBar value={result.intensity} />
        </motion.div>

        <Divider />

        {/* BREAKDOWN */}
        <motion.div variants={itemVariants}>
          <SectionLabel>Breakdown</SectionLabel>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
            }}
          >
            <div style={{ marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent)' }}>●</span>
              <span>
                <strong>Dominant emotion:</strong>{' '}
                <span style={{ textTransform: 'capitalize' }}>{result.dominant_emotion}</span>
              </span>
            </div>
            <div style={{ marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent)' }}>●</span>
              <span>
                <strong>Weather type:</strong>{' '}
                {weatherConfig?.description}
              </span>
            </div>
            {result.color_palette?.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {result.color_palette.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    title={color}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: color,
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* RED FLAGS */}
        {result.red_flag_phrases?.length > 0 && (
          <>
            <Divider />
            <motion.div variants={itemVariants}>
              <SectionLabel>Red Flags</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.red_flag_phrases.map((flag, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 14px',
                      background: 'rgba(255, 30, 30, 0.08)',
                      border: '1px solid rgba(255, 30, 30, 0.25)',
                      borderLeft: '3px solid #ff2222',
                      borderRadius: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>🚩</span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.8rem',
                        color: '#ff8888',
                        lineHeight: 1.5,
                      }}
                    >
                      {flag}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* REWRITE SUGGESTION */}
        {result.rewrite_suggestion && (
          <>
            <Divider />
            <motion.div variants={itemVariants}>
              <SectionLabel>What You Could Say Instead</SectionLabel>
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  {result.rewrite_suggestion}
                </p>
                <button
                  onClick={handleCopyRewrite}
                  style={{
                    marginTop: '10px',
                    padding: '6px 14px',
                    background: 'transparent',
                    border: `1px solid ${copyState === 'copied' ? '#22cc88' : 'var(--border)'}`,
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: copyState === 'copied' ? '#22cc88' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                  onMouseEnter={e => {
                    if (copyState !== 'copied') {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (copyState !== 'copied') {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {copyState === 'copied' ? '✓ Copied!' : '📋 Copy rewrite'}
                </button>
              </div>
            </motion.div>
          </>
        )}

        <Divider />

        {/* SHARE + RESET */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleShare}
            aria-label="Capture and share this vibe check result"
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2, var(--accent)) 100%)',
              color: 'white',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9rem',
              letterSpacing: '0.06em',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 0 16px var(--accent-glow)',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 28px var(--accent-glow)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 16px var(--accent-glow)';
            }}
          >
            {shareCopyState === 'copied' ? (
              <>✓ Copied to clipboard!</>
            ) : (
              <><span style={{ fontSize: '1.1rem' }}>📤</span> Share your vibe</>
            )}
          </button>

          <button
            onClick={handleReset}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--text-secondary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            ← Check another text
          </button>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Desktop: right panel */}
          <motion.div
            key="sidebar-desktop"
            className="hidden md:flex fixed top-0 right-0 h-screen flex-col"
            style={{
              width: '380px',
              minWidth: '380px',
              zIndex: 30,
              backdropFilter: 'blur(24px) saturate(1.5)',
              background: 'var(--sidebar-bg)',
              borderLeft: '1px solid var(--border)',
              padding: '32px 28px',
              overflowY: 'auto',
            }}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {sidebarContent}
          </motion.div>

          {/* Mobile: bottom drawer */}
          <motion.div
            key="sidebar-mobile"
            className="flex md:hidden fixed bottom-0 left-0 right-0 flex-col"
            style={{
              height: '75dvh',
              zIndex: 30,
              backdropFilter: 'blur(24px) saturate(1.5)',
              background: 'var(--sidebar-bg)',
              borderRadius: '24px 24px 0 0',
              borderTop: '1px solid var(--border)',
              padding: '0 20px 32px',
              overflowY: 'auto',
            }}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {sidebarContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
