/**
 * @type {import('next').NextConfig}
 * Root Next.js configuration enabling strict mode and experimental App Router options.
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  }
};

export default nextConfig;
