/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Only redirect the root path to the docs/index.html
  // and let Next.js handle all other routes normally
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
