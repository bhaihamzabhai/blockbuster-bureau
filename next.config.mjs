/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Admins paste cover-image URLs from anywhere, plus our integrations:
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  // NOTE: Security headers (CSP, X-Frame-Options, HSTS, …) live in
  // middleware.ts so there is exactly one source of truth.
};

export default nextConfig;