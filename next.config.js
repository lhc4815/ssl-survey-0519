/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use statically served files from /docs directory
  assetPrefix: '/docs',
  
  // Create a public folder that serves from root
  publicRuntimeConfig: {
    staticFolder: '/docs',
  },
  
  // Allow images from docs directory
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Redirect root to docs/index.html
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/docs/index.html',
      },
    ];
  },
}

module.exports = nextConfig
