import { VibeProvider } from '@/hooks/useVibeState';
import WeatherBackground from '@/components/WeatherBackground';
import WeatherCanvas from '@/components/WeatherCanvas';
import ParticleCanvas from '@/components/ParticleCanvas';
import InputPanel from '@/components/InputPanel';
import LoadingOverlay from '@/components/LoadingOverlay';
import VibeSidebar from '@/components/VibeSidebar';
import WeatherVarsInjector from '@/components/WeatherVarsInjector';
import VibeSubmitHandler from '@/components/VibeSubmitHandler';

export default function Home() {
  return (
    <VibeProvider>
      <WeatherVarsInjector />
      <VibeSubmitHandler />
      <main className="relative min-h-screen overflow-hidden">
        <WeatherBackground />
        <WeatherCanvas />
        <ParticleCanvas />
        <InputPanel />
        <LoadingOverlay />
        <VibeSidebar />
      </main>
    </VibeProvider>
  );
}
