'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/ui/sonner';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import type { AppMode } from '@/hooks/useAppMode';
import { useDebugMode } from '@/hooks/useDebug';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const [mode, setMode] = useState<AppMode>('inform');
  const [pendingStart, setPendingStart] = useState(false);
  const modeRef = useRef<AppMode>(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const tokenSource = useMemo(() => {
    const useSandboxEndpoint = typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string';
    const endpoint = useSandboxEndpoint
      ? process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT!
      : '/api/connection-details';
    const sandboxId = appConfig.sandboxId ?? '';

    // Keep token-source fetch options stable and send mode in request body to avoid stale-token reuse.
    return TokenSource.custom(async () => {
      const roomConfig = appConfig.agentName
        ? {
            agents: [{ agent_name: appConfig.agentName }],
          }
        : undefined;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (useSandboxEndpoint && sandboxId) {
        headers['X-Sandbox-Id'] = sandboxId;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          room_config: roomConfig,
          participant_metadata: JSON.stringify({ mode: modeRef.current }),
        }),
      });

      if (!res.ok) {
        throw new Error(`Error fetching connection details: ${res.status} / ${await res.text()}`);
      }

      return await res.json();
    });
  }, [appConfig.agentName, appConfig.sandboxId]);

  const session = useSession(tokenSource, {
    ...(appConfig.agentName ? { agentName: appConfig.agentName } : {}),
    agentConnectTimeoutMilliseconds: 15_000,
  });

  const startingRef = useRef(false);

  // Start session AFTER useSession's internal effects have updated the metadata ref
  useEffect(() => {
    if (pendingStart) {
      setPendingStart(false);
      if (startingRef.current) return;
      startingRef.current = true;

      (async () => {
        try {
          // Force-end any lingering session before starting fresh
          if (session.connectionState !== 'disconnected') {
            await session.end();
          }
          await session.start();
        } catch (err) {
          console.error('[App] session.start() failed:', err);
        } finally {
          startingRef.current = false;
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingStart]);

  const handleStartSession = useCallback((selectedMode: AppMode) => {
    setMode(selectedMode);
    setPendingStart(true);
  }, []);

  return (
    <AgentSessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController appConfig={appConfig} mode={mode} onStartSession={handleStartSession} />
      </main>
      <StartAudioButton label="Start Audio" />
      <Toaster
        icons={{
          warning: <WarningIcon weight="bold" />,
        }}
        position="top-center"
        className="toaster group"
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
          } as React.CSSProperties
        }
      />
    </AgentSessionProvider>
  );
}
