/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Set basePath to empty so the server serves from root
  basePath: '',
  
  // Define redirects to send root to the docs/index.html
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
