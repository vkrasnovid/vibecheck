'use client';

import { useRef } from 'react';
import { useVibeContext } from '@/hooks/useVibeState';
import { useParticleEngine } from '@/hooks/useParticleEngine';

export default function ParticleCanvas() {
  const { state } = useVibeContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isActive = state.status === 'result' && !!state.result?.particles?.length;

  useParticleEngine(canvasRef, state.result?.particles ?? [], isActive);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    />
  );
}
