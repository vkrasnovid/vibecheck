export type DominantEmotion = 'anger' | 'joy' | 'sadness' | 'fear' | 'disgust' | 'surprise' | 'anxiety' | 'neutral';
export type WeatherType = 'storm' | 'golden_sunrise' | 'cold_fog' | 'electric_neon' | 'calm_ocean' | 'blood_moon';

export interface ParticleWord {
  word: string;
  emotion: DominantEmotion;
  weight: number; // 0.0-1.0
}

export interface AnalyzeRequest {
  text: string;
}

export interface AnalyzeResponse {
  dominant_emotion: DominantEmotion;
  intensity: number; // 0.0-1.0
  weather_type: WeatherType;
  color_palette: string[]; // 5 hex codes
  red_flag_phrases: string[]; // 0-5 verbatim phrases
  subtext: string; // max 120 chars
  rewrite_suggestion: string; // max 300 chars
  particles: ParticleWord[]; // 5-15 items
}

export interface VibeState {
  status: 'idle' | 'loading' | 'result' | 'error';
  inputText: string;
  result: AnalyzeResponse | null;
  error: string | null;
  sidebarOpen: boolean;
}

export type VibeAction =
  | { type: 'SET_INPUT'; text: string }
  | { type: 'SUBMIT' }
  | { type: 'SET_RESULT'; result: AnalyzeResponse }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'RESET' };
