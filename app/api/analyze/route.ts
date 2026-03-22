import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { buildPrompt } from '@/lib/prompt';
import { validateAnalyzeResponse } from '@/lib/validate';

export const runtime = 'nodejs'; // NOT edge - openai SDK needs Node

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    const text = body.text.trim();
    
    if (text.length < 10) {
      return NextResponse.json({ error: 'Text too short (minimum 10 characters)' }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text too long (maximum 5000 characters)' }, { status: 400 });
    }

    const { systemPrompt, userPrompt } = buildPrompt(text);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
    }

    const raw = JSON.parse(rawContent);
    const validated = validateAnalyzeResponse(raw);
    
    return NextResponse.json(validated);
    
  } catch (err: unknown) {
    console.error('Analysis error:', err);
    
    const message = err instanceof Error ? err.message : 'Unknown error';
    
    if (message.includes('API key') || message.includes('401')) {
      return NextResponse.json({ error: 'Analysis service configuration error.' }, { status: 503 });
    }
    if (message.includes('429')) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }
    
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
