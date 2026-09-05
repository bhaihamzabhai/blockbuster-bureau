/** @type {import('next').NextConfig} */
const nextConfig = {
  // Baqi aapki purani settings agar koi hain toh wohi rahne dein, bas yeh headers() function add kar dein:
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://www.youtube.com; frame-src 'self' https://www.youtube.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;