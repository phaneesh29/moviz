import type { NextConfig } from "next";

const FRAME_EMBED_ORIGINS = [
  "https://vidfast.pro",
  "https://player.videasy.net",
  "https://vidrock.net",
  "https://cinemaos.tech",
  "https://player.vidplus.to",
  "https://www.2embed.stream",
  "https://vidsrc.store",
  "https://www.youtube.com",
].join(" ");

const CONTENT_SECURITY_POLICY = [
  `frame-src 'self' ${FRAME_EMBED_ORIGINS}`,
  `child-src 'self' ${FRAME_EMBED_ORIGINS}`,
  "frame-ancestors 'self'",
].join('; ');

const nextConfig: NextConfig = {
  images: {
    // TMDB already serves pre-sized images (w300, w342, w500, etc.).
    // Disable Vercel image transformations to avoid quota overages.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: CONTENT_SECURITY_POLICY,
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

