import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com"], // Allow Google-hosted images
  },
  eslint: {
    ignoreDuringBuilds: true,
},
};

export default nextConfig;
