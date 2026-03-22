'use client';

import { useEffect, useRef } from 'react';
import { useVibeContext } from '@/hooks/useVibeState';
import type { WeatherType } from '@/types/vibecheck';

type AmbientType = 'rain' | 'sparks' | 'ripples' | 'ash' | 'rays' | 'mist' | null;

function getAmbientType(weatherType: WeatherType | undefined): AmbientType {
  if (!weatherType) return null;
  const map: Record<WeatherType, AmbientType> = {
    storm: 'rain',
    golden_sunrise: 'rays',
    cold_fog: 'mist',
    electric_neon: 'sparks',
    calm_ocean: 'ripples',
    blood_moon: 'ash',
  };
  return map[weatherType];
}

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  color: string;
  size: number;
  angle: number;
  life: number;
  maxLife: number;
  phase: number;
}

export default function WeatherCanvas() {
  const { state } = useVibeContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<AmbientParticle[]>([]);

  const ambientType = state.status === 'result' ? getAmbientType(state.result?.weather_type) : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const setSize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    setSize();
    window.addEventListener('resize', setSize);

    if (!ambientType) {
      particlesRef.current = [];
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => {
        window.removeEventListener('resize', setSize);
      };
    }

    const lw = () => canvas.width / dpr;
    const lh = () => canvas.height / dpr;

    // Init particles based on type
    const initParticles = () => {
      particlesRef.current = [];
      const count = ambientType === 'rain' ? 60
        : ambientType === 'sparks' ? 30
        : ambientType === 'ripples' ? 8
        : ambientType === 'ash' ? 40
        : ambientType === 'rays' ? 12
        : ambientType === 'mist' ? 20
        : 0;

      for (let i = 0; i < count; i++) {
        particlesRef.current.push(makeParticle(ambientType, lw(), lh()));
      }
    };
    initParticles();

    let fade = 0;
    const tick = () => {
      fade = Math.min(1, fade + 0.02);
      ctx.clearRect(0, 0, lw(), lh());

      particlesRef.current = particlesRef.current.map(p => {
        const updated = updateParticle(p, ambientType, lw(), lh());
        drawParticle(ctx, updated, ambientType, fade);
        return updated;
      });

      // Respawn dead particles
      particlesRef.current = particlesRef.current.map(p => {
        if (p.life >= p.maxLife) return makeParticle(ambientType, lw(), lh());
        return p;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', setSize);
    };
  }, [ambientType]);

  return (
    <canvas
      ref={canvasRef}
      className="weather-canvas fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}

function makeParticle(type: AmbientType, w: number, h: number): AmbientParticle {
  switch (type) {
    case 'rain':
      return {
        x: Math.random() * w * 1.3,
        y: -20 - Math.random() * h * 0.3,
        vx: -0.5 - Math.random() * 0.5,
        vy: 8 + Math.random() * 5,
        length: 15 + Math.random() * 25,
        opacity: 0.1 + Math.random() * 0.25,
        color: '#aaccff',
        size: 1,
        angle: 0,
        life: 0,
        maxLife: 120 + Math.random() * 60,
        phase: Math.random() * Math.PI * 2,
      };
    case 'sparks':
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        length: 20 + Math.random() * 60,
        opacity: 0.6 + Math.random() * 0.4,
        color: Math.random() > 0.5 ? '#ff00ff' : '#00ffff',
        size: 1,
        angle: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 20 + Math.random() * 30,
        phase: 0,
      };
    case 'ripples':
      return {
        x: Math.random() * w,
        y: h * 0.5 + Math.random() * h * 0.5,
        vx: 0,
        vy: 0,
        length: 0,
        opacity: 0.15 + Math.random() * 0.15,
        color: '#00b4d8',
        size: 5 + Math.random() * 80,
        angle: 0,
        life: Math.random() * 100,
        maxLife: 200 + Math.random() * 100,
        phase: Math.random() * Math.PI * 2,
      };
    case 'ash':
      return {
        x: Math.random() * w,
        y: -10 - Math.random() * h * 0.2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.5 + Math.random() * 1.5,
        length: 2,
        opacity: 0.2 + Math.random() * 0.4,
        color: Math.random() > 0.7 ? '#ff6622' : '#661100',
        size: 1 + Math.random() * 3,
        angle: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 150 + Math.random() * 200,
        phase: Math.random() * Math.PI * 2,
      };
    case 'rays':
      return {
        x: w * 0.5,
        y: h,
        vx: 0,
        vy: 0,
        length: h * (0.4 + Math.random() * 0.5),
        opacity: 0.03 + Math.random() * 0.06,
        color: '#ffcc44',
        size: 2 + Math.random() * 8,
        angle: -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8,
        life: Math.random() * 120,
        maxLife: 200 + Math.random() * 100,
        phase: Math.random() * Math.PI * 2,
      };
    case 'mist':
    default:
      return {
        x: -100 + Math.random() * (w + 200),
        y: h * 0.1 + Math.random() * h * 0.8,
        vx: 0.1 + Math.random() * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        length: 100 + Math.random() * 200,
        opacity: 0.03 + Math.random() * 0.05,
        color: '#b0c8e0',
        size: 1,
        angle: 0,
        life: Math.random() * 300,
        maxLife: 500 + Math.random() * 300,
        phase: Math.random() * Math.PI * 2,
      };
  }
}

function updateParticle(p: AmbientParticle, type: AmbientType, w: number, h: number): AmbientParticle {
  const n = { ...p, life: p.life + 1 };
  switch (type) {
    case 'rain':
      n.x += n.vx;
      n.y += n.vy;
      if (n.y > h + 30) n.life = n.maxLife;
      break;
    case 'sparks':
      n.x += n.vx;
      n.y += n.vy;
      n.vx *= 0.95;
      n.vy *= 0.95;
      break;
    case 'ripples':
      n.size += 0.8;
      n.opacity = Math.max(0, p.opacity * (1 - n.life / n.maxLife));
      break;
    case 'ash':
      n.x += n.vx + Math.sin(n.phase + n.life * 0.02) * 0.3;
      n.y += n.vy;
      if (n.y > h + 20) n.life = n.maxLife;
      break;
    case 'rays':
      n.opacity = p.opacity * (0.7 + 0.3 * Math.sin(n.phase + n.life * 0.02));
      break;
    case 'mist':
      n.x += n.vx;
      n.y += n.vy + Math.sin(n.phase + n.life * 0.005) * 0.1;
      if (n.x > w + 200) n.life = n.maxLife;
      break;
  }
  return n;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: AmbientParticle, type: AmbientType, fade: number) {
  ctx.save();
  ctx.globalAlpha = p.opacity * fade;
  ctx.strokeStyle = p.color;
  ctx.fillStyle = p.color;

  switch (type) {
    case 'rain': {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    }
    case 'sparks': {
      const progress = p.life / p.maxLife;
      ctx.globalAlpha = p.opacity * (1 - progress) * fade;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      const endX = p.x + Math.cos(p.angle) * p.length * (1 - progress);
      const endY = p.y + Math.sin(p.angle) * p.length * (1 - progress);
      ctx.lineTo(endX, endY);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    }
    case 'ripples': {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.3, 0, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    }
    case 'ash': {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rays': {
      const grd = ctx.createLinearGradient(
        p.x, p.y,
        p.x + Math.cos(p.angle) * p.length,
        p.y + Math.sin(p.angle) * p.length
      );
      grd.addColorStop(0, p.color);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(
        p.x + Math.cos(p.angle) * p.length,
        p.y + Math.sin(p.angle) * p.length
      );
      ctx.lineWidth = p.size;
      ctx.strokeStyle = grd;
      ctx.stroke();
      break;
    }
    case 'mist': {
      const grd = ctx.createLinearGradient(p.x - p.length / 2, p.y, p.x + p.length / 2, p.y);
      grd.addColorStop(0, 'transparent');
      grd.addColorStop(0.5, p.color);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(p.x - p.length / 2, p.y - 4, p.length, 8);
      break;
    }
  }
  ctx.restore();
}
