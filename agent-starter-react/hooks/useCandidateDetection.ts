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
 * Scans the last N agent messages for candidate last names
 * and returns the matching candidate ID, or null if none found.
 */
export function useCandidateDetection(
  messages: ReceivedMessage[],
  lookback: number = 3
): string | null {
  return useMemo(() => {
    // Filter to agent transcript messages (not from local user)
    const agentMessages = messages
      .filter((m) => m.type === 'agentTranscript' || (m.from && !m.from.isLocal))
      .slice(-lookback);

    const text = agentMessages.map(getMessageText).join(' ').toLowerCase();

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
