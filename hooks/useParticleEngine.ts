'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { ParticleWord } from '@/types/vibecheck';
import { EMOTION_COLORS } from '@/lib/weatherConfig';

interface Particle {
  id: string;
  word: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  fontSize: number;
  color: string;
  life: number;
  lifeSpeed: number;
  phase: 'fadein' | 'float' | 'fadeout';
}

const MAX_PARTICLES = 80;
const PARTICLE_LIFETIME_MIN = 4000;
const PARTICLE_LIFETIME_MAX = 9000;

function lifeCurve(life: number): number {
  // Bell curve: 0 → 1 → 0
  return Math.sin(Math.PI * Math.min(1, Math.max(0, life))) * 0.85;
}

function createParticle(
  word: ParticleWord,
  canvasWidth: number,
  canvasHeight: number,
  index: number
): Particle {
  const lifetimeMs = PARTICLE_LIFETIME_MIN + Math.random() * (PARTICLE_LIFETIME_MAX - PARTICLE_LIFETIME_MIN);
  const lifeSpeed = 1 / (lifetimeMs / 16.67); // per frame at ~60fps

  const fontSize = 11 + Math.round(word.weight * 17); // 11–28px
  const color = EMOTION_COLORS[word.emotion] || '#aaaaaa';

  // Spread across canvas
  const margin = 100;
  const x = margin + Math.random() * (canvasWidth - margin * 2);
  const y = margin + Math.random() * (canvasHeight - margin * 2);

  const speed = 0.2 + Math.random() * 0.5;
  const angle = Math.random() * Math.PI * 2;

  return {
    id: `${word.word}-${index}-${Date.now()}-${Math.random()}`,
    word: word.word,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed * 0.7,
    opacity: 0,
    fontSize,
    color,
    life: 0,
    lifeSpeed,
    phase: 'fadein',
  };
}

export function useParticleEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  particleWords: ParticleWord[],
  isActive: boolean
) {
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const particleWordsRef = useRef<ParticleWord[]>(particleWords);

  useEffect(() => {
    particleWordsRef.current = particleWords;
  }, [particleWords]);

  const spawnParticle = useCallback((canvas: HTMLCanvasElement) => {
    const words = particleWordsRef.current;
    if (!words.length) return;

    const word = words[Math.floor(Math.random() * words.length)];
    const index = particlesRef.current.length;
    particlesRef.current.push(createParticle(word, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio, index));
  }, []);

  useEffect(() => {
    if (!isActive || !canvasRef.current) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    const updateSize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    updateSize();

    const handleResize = () => {
      // updateSize already applies ctx.scale — don't call it again
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', handleResize);

    // Spawn initial batch staggered
    const spawnInitial = () => {
      const words = particleWordsRef.current;
      if (!words.length) return;
      const count = Math.min(words.length * 3, 20);
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (canvas) spawnParticle(canvas);
        }, i * 150);
      }
    };
    spawnInitial();

    let spawnAccumulator = 0;
    const SPAWN_INTERVAL = 800; // ms between new particle spawns

    let lastTime = performance.now();

    const tick = (timestamp: number) => {
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      // Spawn new particles
      spawnAccumulator += delta;
      if (spawnAccumulator >= SPAWN_INTERVAL && particlesRef.current.length < MAX_PARTICLES) {
        spawnAccumulator = 0;
        spawnParticle(canvas);
      }

      // Update and draw
      const dead: number[] = [];
      particlesRef.current.forEach((p, i) => {
        p.life += p.lifeSpeed;
        if (p.life >= 1) {
          dead.push(i);
          return;
        }

        // Physics
        p.x += p.vx;
        p.y += p.vy;

        // Soft edge bounce
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * 0.8; }
        if (p.x > logicalWidth) { p.x = logicalWidth; p.vx = -Math.abs(p.vx) * 0.8; }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) * 0.8; }
        if (p.y > logicalHeight) { p.y = logicalHeight; p.vy = -Math.abs(p.vy) * 0.8; }

        // Opacity lifecycle
        p.opacity = lifeCurve(p.life);
        if (p.opacity < 0) p.opacity = 0;

        // Clamp to 0.15–0.85
        const clampedOpacity = 0.15 + p.opacity * 0.7;

        // Draw
        ctx.save();
        ctx.globalAlpha = clampedOpacity;
        ctx.font = `${p.fontSize}px 'Space Grotesk', sans-serif`;
        ctx.fillStyle = p.color;
        ctx.textBaseline = 'middle';
        ctx.fillText(p.word, p.x, p.y);
        ctx.restore();
      });

      // Remove dead particles (reverse to preserve indices)
      for (let i = dead.length - 1; i >= 0; i--) {
        particlesRef.current.splice(dead[i], 1);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      particlesRef.current = [];
    };
  }, [isActive, canvasRef, spawnParticle]);
}
