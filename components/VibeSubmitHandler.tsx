'use client';

/**
 * Handles auto-submit when ?v= query param is present on page load.
 * Decodes the text, sets it in state, then fires the API call.
 */

import { useEffect, useRef } from 'react';
import { useVibeContext } from '@/hooks/useVibeState';
import { decodeText } from '@/lib/urlEncoding';

export default function VibeSubmitHandler() {
  const { dispatch } = useVibeContext();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const v = params.get('v');
    if (!v) return;

    let text: string;
    try {
      text = decodeText(v);
    } catch {
      return;
    }

    if (!text || text.trim().length < 10) return;

    // Set input text
    dispatch({ type: 'SET_INPUT', text });
    // Mark as loading
    dispatch({ type: 'SUBMIT' });

    // Fire API
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => Promise.reject(err));
        return res.json();
      })
      .then(data => dispatch({ type: 'SET_RESULT', result: data }))
      .catch(err => {
        dispatch({
          type: 'SET_ERROR',
          error: err?.error || 'The vibes are temporarily unavailable. Try again in a moment.',
        });
      });
  }, [dispatch]);

  return null;
}
