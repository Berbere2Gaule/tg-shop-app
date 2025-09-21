/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // ✅ Next 15 : remplace experimental.turbo
  turbopack: {
    enabled: true,
  },

  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/notifications",
    ],
  },
};

export default nextConfig;
