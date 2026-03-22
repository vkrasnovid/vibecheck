'use client';

import { useCallback } from 'react';
import { encodeText } from '@/lib/urlEncoding';
import { useVibeContext } from './useVibeState';

export function useShareUrl() {
  const { state } = useVibeContext();

  const shareUrl = useCallback(async (): Promise<boolean> => {
    const text = state.inputText;
    if (!text.trim()) return false;

    const encoded = encodeText(text);
    const url = new URL(window.location.href);
    url.searchParams.set('v', encoded);
    const shareLink = url.toString();

    // Update browser URL
    window.history.replaceState(null, '', shareLink);

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareLink);
      return true;
    } catch {
      return false;
    }
  }, [state.inputText]);

  return { shareUrl };
}
