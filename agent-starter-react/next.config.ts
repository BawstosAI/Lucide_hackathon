import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['livekit-server-sdk', '@livekit/protocol'],
};

export default nextConfig;
