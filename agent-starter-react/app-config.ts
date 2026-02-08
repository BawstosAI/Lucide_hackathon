export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Paris 2026',
  pageTitle: 'Municipales Paris 2026 - Assistant Vocal',
  pageDescription: 'Assistant vocal IA pour les élections municipales de Paris 2026',

  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#002395',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#4d7fff',
  // agent dispatch configuration
  agentName: process.env.AGENT_NAME ?? undefined,

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
};
