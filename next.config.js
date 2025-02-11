/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      undici: false,
      debug: require.resolve('debug'),
      'supports-color': require.resolve('supports-color'),
      encoding: false
    };
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['undici']
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
}

module.exports = nextConfig 