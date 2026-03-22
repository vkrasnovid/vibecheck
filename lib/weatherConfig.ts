import { WeatherType, DominantEmotion } from '@/types/vibecheck';

export interface WeatherConfig {
  cssClass: string;
  label: string;
  description: string;
  particleBaseColor: string;
  ambientType: 'rain' | 'sparks' | 'ripples' | 'ash' | 'rays' | 'mist';
}

export const WEATHER_CONFIG: Record<WeatherType, WeatherConfig> = {
  storm: {
    cssClass: 'weather-storm',
    label: '⛈️ Storm',
    description: 'Anger · Aggression · Rage',
    particleBaseColor: '#ff2222',
    ambientType: 'rain',
  },
  golden_sunrise: {
    cssClass: 'weather-golden-sunrise',
    label: '🌅 Golden Sunrise',
    description: 'Warmth · Optimism · Hope',
    particleBaseColor: '#ffd700',
    ambientType: 'rays',
  },
  cold_fog: {
    cssClass: 'weather-cold-fog',
    label: '🌫️ Cold Fog',
    description: 'Detachment · Numbness · Distance',
    particleBaseColor: '#a0b4cc',
    ambientType: 'mist',
  },
  electric_neon: {
    cssClass: 'weather-electric-neon',
    label: '⚡ Electric Neon',
    description: 'Anxiety · Chaos · Overwhelm',
    particleBaseColor: '#00ffff',
    ambientType: 'sparks',
  },
  calm_ocean: {
    cssClass: 'weather-calm-ocean',
    label: '🌊 Calm Ocean',
    description: 'Serenity · Clarity · Peace',
    particleBaseColor: '#00b4d8',
    ambientType: 'ripples',
  },
  blood_moon: {
    cssClass: 'weather-blood-moon',
    label: '🌑 Blood Moon',
    description: 'Threat · Manipulation · Dark Intent',
    particleBaseColor: '#cc0000',
    ambientType: 'ash',
  },
};

export const EMOTION_COLORS: Record<DominantEmotion, string> = {
  anger: '#ff3333',
  joy: '#ffd700',
  sadness: '#4488ff',
  fear: '#aa44ff',
  disgust: '#44aa44',
  surprise: '#ff8800',
  anxiety: '#ff44aa',
  neutral: '#aaaaaa',
};
