'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  useSessionContext,
  useSessionMessages,
  useVoiceAssistant,
} from '@livekit/components-react';
import type { AgentState } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { CandidateDashboard } from '@/components/app/candidate-dashboard';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { useCandidateDetection } from '@/hooks/useCandidateDetection';
import { cn } from '@/lib/shadcn/utils';
import { Shimmer } from '../ai-elements/shimmer';

const MotionBottom = motion.create('div');
const MotionMessage = motion.create(Shimmer);

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

const SHIMMER_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const AGENT_STATE_LABELS: Record<string, string> = {
  connecting: 'Connexion...',
  initializing: 'Initialisation...',
  listening: 'Écoute...',
  thinking: 'Réflexion...',
  speaking: 'Parle...',
};

function getAgentStateLabel(state: AgentState | undefined): string {
  if (!state) return '';
  return AGENT_STATE_LABELS[state] ?? '';
}

interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { state: agentState, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeCandidateId = useCandidateDetection(messages);

  const controls: AgentControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsScreenShare,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="bg-background relative z-10 h-svh w-svw overflow-hidden" {...props}>
      {/* Main content area */}
      <div className="flex h-full flex-col pt-14 pb-28 md:flex-row md:pt-16 md:pb-32">
        {/* Left/Top panel: Candidate Dashboard */}
        <div
          className={cn(
            'overflow-y-auto px-4 transition-all duration-300 md:px-6',
            chatOpen ? 'h-1/3 w-full md:h-full md:w-1/2 lg:w-2/5' : 'h-full w-full'
          )}
        >
          <div className="mx-auto max-w-3xl py-4">
            <h2 className="text-foreground mb-3 font-serif text-lg font-semibold">Les candidats</h2>
            <CandidateDashboard activeCandidateId={activeCandidateId} compact={chatOpen} />
          </div>
        </div>

        {/* Right panel: Chat Transcript */}
        {chatOpen && (
          <div className="border-border h-2/3 w-full border-t md:h-full md:w-1/2 md:border-t-0 md:border-l lg:w-3/5">
            <ChatTranscript
              messages={messages}
              className="space-y-3 transition-opacity duration-300 ease-out"
            />
          </div>
        )}
      </div>

      {/* Bottom control bar */}
      <MotionBottom {...BOTTOM_VIEW_MOTION_PROPS} className="fixed inset-x-0 bottom-0 z-50">
        {/* Pre-connect message */}
        {appConfig.isPreConnectBufferEnabled && (
          <AnimatePresence>
            {messages.length === 0 && (
              <MotionMessage
                key="pre-connect-message"
                duration={2}
                aria-hidden={messages.length > 0}
                {...SHIMMER_MOTION_PROPS}
                className="pointer-events-none mx-auto block w-full max-w-2xl pb-3 text-center text-sm font-semibold"
              >
                L&apos;assistant vous écoute, posez votre question
              </MotionMessage>
            )}
          </AnimatePresence>
        )}

        {/* Compact bottom bar */}
        <div className="bg-background/80 border-border border-t backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-2 md:px-6">
            {/* Audio visualizer */}
            <div className="flex shrink-0 items-center gap-2">
              <AgentAudioVisualizerBar
                barCount={5}
                size="sm"
                state={agentState}
                audioTrack={agentAudioTrack}
                className="flex h-8 items-center justify-center gap-0.5"
              >
                <span
                  className={cn([
                    'bg-muted min-h-1.5 w-1.5 rounded-full',
                    'origin-center transition-colors duration-250 ease-linear',
                    'data-[lk-highlighted=true]:bg-primary data-[lk-muted=true]:bg-muted',
                  ])}
                />
              </AgentAudioVisualizerBar>
              <span className="text-muted-foreground text-xs font-medium">
                {getAgentStateLabel(agentState)}
              </span>
            </div>

            {/* Control bar */}
            <div className="flex-1">
              <AgentControlBar
                variant="livekit"
                controls={controls}
                isChatOpen={chatOpen}
                isConnected={session.isConnected}
                onDisconnect={session.end}
                onIsChatOpenChange={setChatOpen}
              />
            </div>
          </div>
        </div>
      </MotionBottom>
    </section>
  );
};
