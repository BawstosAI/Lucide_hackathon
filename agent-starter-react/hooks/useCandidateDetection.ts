'use client';

import { useMemo } from 'react';
import type { ReceivedMessage } from '@livekit/components-react';
import { candidates } from '@/lib/candidates';

function getMessageText(m: ReceivedMessage): string {
  if ('message' in m && typeof m.message === 'string') {
    return m.message;
  }
  if ('message' in m) {
    return String(m.message ?? '');
  }
  return '';
}

/**
 * Scans the last N messages (user + agent) for candidate last names
 * and returns the matching candidate ID, or null if none found.
 *
 * With the incarnation system, the candidate name typically appears
 * in the user's question (e.g. "Rachida Dati, que proposes-tu ?")
 * while the agent responds in 1st person without repeating the name.
 */
export function useCandidateDetection(
  messages: ReceivedMessage[],
  lookback: number = 5
): string | null {
  return useMemo(() => {
    const recent = messages.slice(-lookback);
    const text = recent.map(getMessageText).join(' ').toLowerCase();

    if (!text) return null;

    // Search in reverse order so the last-mentioned candidate wins
    for (let i = candidates.length - 1; i >= 0; i--) {
      if (text.includes(candidates[i].lastName.toLowerCase())) {
        return candidates[i].id;
      }
    }

    return null;
  }, [messages, lookback]);
}
