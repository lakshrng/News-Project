/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Ensure serpapi and other Node.js modules are only bundled for server-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    } else {
      // For server-side, ensure CommonJS modules can be resolved
      config.resolve.extensionAlias = {
        '.js': ['.js', '.ts', '.tsx'],
      };
    }
    return config;
  },
}

module.exports = nextConfig

