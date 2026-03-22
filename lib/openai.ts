import OpenAI from 'openai';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// Lazy proxy — only instantiates the client on first use (not at build time)
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop: string | symbol) {
    return getOpenAI()[prop as keyof OpenAI];
  },
});
