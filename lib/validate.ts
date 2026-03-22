import type { AnalyzeResponse, DominantEmotion, WeatherType } from '@/types/vibecheck';

const VALID_EMOTIONS: DominantEmotion[] = ['anger', 'joy', 'sadness', 'fear', 'disgust', 'surprise', 'anxiety', 'neutral'];
const VALID_WEATHER: WeatherType[] = ['storm', 'golden_sunrise', 'cold_fog', 'electric_neon', 'calm_ocean', 'blood_moon'];

function isValidEmotion(v: unknown): v is DominantEmotion {
  return typeof v === 'string' && VALID_EMOTIONS.includes(v as DominantEmotion);
}

function isValidWeather(v: unknown): v is WeatherType {
  return typeof v === 'string' && VALID_WEATHER.includes(v as WeatherType);
}

export function validateAnalyzeResponse(raw: unknown): AnalyzeResponse {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid response: not an object');
  const r = raw as Record<string, unknown>;

  if (!isValidEmotion(r.dominant_emotion))
    throw new Error(`Invalid dominant_emotion: ${String(r.dominant_emotion)}`);
  if (typeof r.intensity !== 'number' || r.intensity < 0 || r.intensity > 1)
    throw new Error('Invalid intensity: must be 0.0–1.0');
  if (!isValidWeather(r.weather_type))
    throw new Error(`Invalid weather_type: ${String(r.weather_type)}`);
  if (!Array.isArray(r.color_palette) || r.color_palette.length < 3 || r.color_palette.length > 7)
    throw new Error('Invalid color_palette: must be 3–7 items');
  if (!Array.isArray(r.red_flag_phrases))
    throw new Error('Invalid red_flag_phrases: must be array');
  if (typeof r.subtext !== 'string' || r.subtext.length === 0)
    throw new Error('Invalid subtext: must be non-empty string');
  if (typeof r.rewrite_suggestion !== 'string' || r.rewrite_suggestion.length === 0)
    throw new Error('Invalid rewrite_suggestion: must be non-empty string');
  if (!Array.isArray(r.particles) || r.particles.length < 1 || r.particles.length > 20)
    throw new Error('Invalid particles: must be 1–20 items');

  return r as unknown as AnalyzeResponse;
}
