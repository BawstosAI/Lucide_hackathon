'use client';

import { createContext, useContext } from 'react';

export type AppMode = 'inform' | 'debate';

const AppModeContext = createContext<AppMode>('inform');

export const AppModeProvider = AppModeContext.Provider;

export function useAppMode(): AppMode {
  return useContext(AppModeContext);
}
