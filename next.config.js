/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Redirect root to docs/index.html
  async redirects() {
    return [
      {
        source: '/',
        destination: '/docs/index.html',
        permanent: false,
      },
    ];
  },
}

module.exports = nextConfig
