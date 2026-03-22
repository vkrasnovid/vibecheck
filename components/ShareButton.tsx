'use client';

import { useState, useCallback } from 'react';
import { useShareUrl } from '@/hooks/useShareUrl';

interface ShareButtonProps {
  className?: string;
}

export default function ShareButton({ className }: ShareButtonProps) {
  const { shareUrl } = useShareUrl();
  const [state, setState] = useState<'idle' | 'copied'>('idle');

  const handleShare = useCallback(async () => {
    const ok = await shareUrl();
    setState('copied');
    setTimeout(() => setState('idle'), 2000);
  }, [shareUrl]);

  return (
    <button
      onClick={handleShare}
      aria-label="Capture and share this vibe check result"
      className={className}
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
    >
      {state === 'copied' ? (
        '✓ Copied to clipboard!'
      ) : (
        <>
          <span style={{ fontSize: '1.1rem' }}>📸</span>
          <span>Screenshot &amp; Share</span>
        </>
      )}
    </button>
  );
}
