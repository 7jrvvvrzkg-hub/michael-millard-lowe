/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chairish-prod.freetls.fastly.net",
      },
      {
        protocol: "https",
        hostname: "chairish-prod-static-images.freetls.fastly.net",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
