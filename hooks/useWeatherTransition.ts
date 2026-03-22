'use client';

import { useState, useEffect } from 'react';
import type { WeatherType } from '@/types/vibecheck';
import { WEATHER_CONFIG } from '@/lib/weatherConfig';

interface WeatherTransitionState {
  currentWeather: WeatherType | null;
  cssClass: string;
  label: string;
}

export function useWeatherTransition(weatherType: WeatherType | null | undefined): WeatherTransitionState {
  const [current, setCurrent] = useState<WeatherType | null>(null);

  useEffect(() => {
    if (weatherType) {
      setCurrent(weatherType);
    }
  }, [weatherType]);

  if (!current) {
    return {
      currentWeather: null,
      cssClass: 'weather-idle',
      label: '',
    };
  }

  const config = WEATHER_CONFIG[current];
  return {
    currentWeather: current,
    cssClass: config.cssClass,
    label: config.label,
  };
}
