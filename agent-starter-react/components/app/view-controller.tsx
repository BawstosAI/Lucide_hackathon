'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { SessionView } from '@/components/app/session-view';
import { WelcomeView } from '@/components/app/welcome-view';
import { type AppMode, AppModeProvider } from '@/hooks/useAppMode';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(SessionView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const { isConnected, start } = useSessionContext();
  const [mode, setMode] = useState<AppMode>('inform');

  const handleStartCall = (selectedMode: AppMode) => {
    setMode(selectedMode);
    start();
  };

  return (
    <AnimatePresence mode="wait">
      {/* Welcome view */}
      {!isConnected && (
        <MotionWelcomeView key="welcome" {...VIEW_MOTION_PROPS} onStartCall={handleStartCall} />
      )}
      {/* Session view */}
      {isConnected && (
        <AppModeProvider value={mode}>
          <MotionSessionView key="session-view" {...VIEW_MOTION_PROPS} appConfig={appConfig} />
        </AppModeProvider>
      )}
    </AnimatePresence>
  );
}
