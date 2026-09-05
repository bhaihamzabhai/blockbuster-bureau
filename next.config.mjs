/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.googletagservices.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://www.youtube.com https://*.youtube.com; frame-src 'self' https://www.youtube.com https://*.youtube.com; img-src 'self' data: https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;