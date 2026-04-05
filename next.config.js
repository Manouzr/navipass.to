/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'navipass.to', 'www.navipass.to'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.emploipublic.fr',
      },
      {
        protocol: 'https',
        hostname: 'play-lh.googleusercontent.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
