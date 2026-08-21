import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Demo placeholder portraits for Team/Testimonials (client confirmed
    // 2026-08-21 stock images are fine for this not-live demo site).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
