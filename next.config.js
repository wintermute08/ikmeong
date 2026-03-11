/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['*'],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://cdn.jsdelivr.net;",
              "frame-src 'self' https://*.supabase.co https://*.supabase.in https://accounts.google.com https://github.com https://api.github.com;",
              "img-src 'self' data: blob: https:;",
              "style-src 'self' 'unsafe-inline' https:;",
              "font-src 'self' https: data:;",
              "default-src 'self';",
            ].join(" ")
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
