import type { NextConfig } from 'next';

function r2RemotePattern() {
  const baseUrl = process.env.R2_PUBLIC_BASE_URL;
  if (!baseUrl) return null;

  try {
    const { protocol, hostname, pathname } = new URL(baseUrl);
    return {
      protocol: (protocol.replace(':', '') || 'https') as 'http' | 'https',
      hostname,
      pathname: pathname && pathname !== '/' ? `${pathname.replace(/\/$/, '')}/**` : '/**',
    };
  } catch {
    return null;
  }
}

const r2Pattern = r2RemotePattern();

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
