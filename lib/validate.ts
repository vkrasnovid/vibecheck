import { AnalyzeResponse } from '@/types/vibecheck';

const VALID_EMOTIONS = ['anger', 'joy', 'sadness', 'fear', 'disgust', 'surprise', 'anxiety', 'neutral'] as const;
const VALID_WEATHER = ['storm', 'golden_sunrise', 'cold_fog', 'electric_neon', 'calm_ocean', 'blood_moon'] as const;

export function validateAnalyzeResponse(raw: unknown): AnalyzeResponse {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid response');
  const r = raw as Record<string, unknown>;

  if (!VALID_EMOTIONS.includes(r.dominant_emotion as any))
    throw new Error('Invalid dominant_emotion');
  if (typeof r.intensity !== 'number' || r.intensity < 0 || r.intensity > 1)
    throw new Error('Invalid intensity');
  if (!VALID_WEATHER.includes(r.weather_type as any))
    throw new Error('Invalid weather_type');
  if (!Array.isArray(r.color_palette) || r.color_palette.length < 3)
    throw new Error('Invalid color_palette');
  if (!Array.isArray(r.red_flag_phrases))
    throw new Error('Invalid red_flag_phrases');
  if (typeof r.subtext !== 'string')
    throw new Error('Invalid subtext');
  if (typeof r.rewrite_suggestion !== 'string')
    throw new Error('Invalid rewrite_suggestion');
  if (!Array.isArray(r.particles) || r.particles.length < 1)
    throw new Error('Invalid particles');

  return r as unknown as AnalyzeResponse;
}
