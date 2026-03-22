'use client';

import { useEffect } from 'react';
import { useVibeContext } from '@/hooks/useVibeState';
import type { WeatherType } from '@/types/vibecheck';

const WEATHER_VARS: Record<WeatherType, Record<string, string>> = {
  storm: {
    '--accent': '#ff2222',
    '--accent-2': '#ff6600',
    '--accent-glow': 'rgba(255, 34, 34, 0.6)',
    '--intensity-bar': 'linear-gradient(90deg, #ff2222, #ff6600)',
    '--sidebar-bg': 'rgba(20, 3, 3, 0.92)',
    '--border': 'rgba(255, 34, 34, 0.3)',
    '--text-primary': '#ffe0e0',
    '--text-secondary': '#ff8888',
  },
  golden_sunrise: {
    '--accent': '#ff9500',
    '--accent-2': '#ffe066',
    '--accent-glow': 'rgba(255, 200, 50, 0.7)',
    '--intensity-bar': 'linear-gradient(90deg, #ff8c00, #ffd166)',
    '--sidebar-bg': 'rgba(30, 12, 0, 0.90)',
    '--border': 'rgba(255, 200, 50, 0.35)',
    '--text-primary': '#fff8e1',
    '--text-secondary': '#ffcc66',
  },
  cold_fog: {
    '--accent': '#7a9bb5',
    '--accent-2': '#b0c8e0',
    '--accent-glow': 'rgba(122, 155, 181, 0.3)',
    '--intensity-bar': 'linear-gradient(90deg, #3a4a60, #7a9bb5)',
    '--sidebar-bg': 'rgba(18, 22, 34, 0.94)',
    '--border': 'rgba(122, 155, 181, 0.2)',
    '--text-primary': '#d8e8f5',
    '--text-secondary': '#7a9bb5',
  },
  electric_neon: {
    '--accent': '#ff00ff',
    '--accent-2': '#00ffff',
    '--accent-glow': 'rgba(255, 0, 255, 0.7)',
    '--intensity-bar': 'linear-gradient(90deg, #ff00ff, #00ffff)',
    '--sidebar-bg': 'rgba(6, 0, 16, 0.95)',
    '--border': 'rgba(255, 0, 255, 0.4)',
    '--text-primary': '#ffffff',
    '--text-secondary': '#cc88ff',
  },
  calm_ocean: {
    '--accent': '#00b4d8',
    '--accent-2': '#90e0ef',
    '--accent-glow': 'rgba(0, 180, 216, 0.5)',
    '--intensity-bar': 'linear-gradient(90deg, #004080, #00b4d8)',
    '--sidebar-bg': 'rgba(0, 10, 22, 0.92)',
    '--border': 'rgba(0, 180, 216, 0.3)',
    '--text-primary': '#e0f7ff',
    '--text-secondary': '#90e0ef',
  },
  blood_moon: {
    '--accent': '#cc0000',
    '--accent-2': '#800000',
    '--accent-glow': 'rgba(200, 0, 0, 0.6)',
    '--intensity-bar': 'linear-gradient(90deg, #440000, #cc0000)',
    '--sidebar-bg': 'rgba(5, 0, 0, 0.96)',
    '--border': 'rgba(200, 0, 0, 0.3)',
    '--text-primary': '#ffdddd',
    '--text-secondary': '#cc4444',
  },
};

const IDLE_VARS: Record<string, string> = {
  '--accent': '#7c4dff',
  '--accent-2': '#e040fb',
  '--accent-glow': 'rgba(124, 77, 255, 0.4)',
  '--intensity-bar': 'linear-gradient(90deg, #7c4dff, #e040fb)',
  '--sidebar-bg': 'rgba(13, 13, 26, 0.92)',
  '--border': '#2a2a3d',
  '--text-primary': '#f0f0ff',
  '--text-secondary': '#8888aa',
};

export default function WeatherVarsInjector() {
  const { state } = useVibeContext();

  useEffect(() => {
    const root = document.documentElement;
    const vars = state.result?.weather_type
      ? WEATHER_VARS[state.result.weather_type]
      : IDLE_VARS;

    Object.entries(vars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });
  }, [state.result?.weather_type]);

  return null;
}
