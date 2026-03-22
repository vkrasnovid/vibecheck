'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useVibeContext } from '@/hooks/useVibeState';
import { useWeatherTransition } from '@/hooks/useWeatherTransition';

export default function WeatherBackground() {
  const { state } = useVibeContext();
  const { cssClass } = useWeatherTransition(state.result?.weather_type);

  const activeClass = state.status === 'result' || state.status === 'loading'
    ? cssClass
    : 'weather-idle';

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <AnimatePresence>
        <motion.div
          key={activeClass}
          className={`absolute inset-0 ${activeClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </AnimatePresence>
    </div>
  );
}
