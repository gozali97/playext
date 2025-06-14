/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['playwright']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('playwright')
    }
    return config
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/test/:path*',
        destination: '/api/test/:path*',
      },
      {
        source: '/reports/:path*',
        destination: '/api/reports/serve/:path*'
      }
    ]
  }
}

module.exports = nextConfig 