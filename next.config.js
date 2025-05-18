/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Skip building React client-side bundle
  experimental: {
    appDir: false,
  },
  // We're using the docs folder for our static files
  // This redirects the root to the docs/index.html
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/docs/index.html',
      },
      {
        source: '/:path*',
        destination: '/docs/:path*',
      },
    ];
  },
}

module.exports = nextConfig
