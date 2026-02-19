/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
      },
    ],
  },
  // Allow large video uploads via API routes (up to 200 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
};

module.exports = nextConfig;
